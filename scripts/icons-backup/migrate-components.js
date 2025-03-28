#!/usr/bin/env node
/**
 * Icon System Migration Script
 * 
 * This script helps migrate components from the old icon system to the new unified system.
 * It scans files for old icon imports and suggests replacements.
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const SRC_DIR = path.join(__dirname, '../../src');
const OLD_IMPORT_PATTERNS = [
  /@fortawesome\/fontawesome-svg-core/,
  /@fortawesome\/pro-solid-svg-icons/,
  /@fortawesome\/pro-light-svg-icons/,
  /@fortawesome\/pro-regular-svg-icons/,
  /@fortawesome\/free-brands-svg-icons/,
  /@fortawesome\/react-fontawesome/,
  /from ['"]@\/components\/ui\/icons['"]/,
  /import .* from ['"]react['"]/,  // Simple pattern that should match many files
];
const NEW_IMPORT = `import { Icon, ButtonIcon, StaticIcon, PlatformIcon } from '@/components/icons';`;
const IGNORE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build'];

// Command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verboseMode = args.includes('--verbose');
const targetDir = args.find(arg => !arg.startsWith('--')) || SRC_DIR;
const shouldFix = args.includes('--fix');

// Stats
const stats = {
  filesScanned: 0,
  filesWithOldImports: 0,
  oldImportCount: 0,
  filesFixed: 0,
};

/**
 * Scan a file for old icon imports
 */
function scanFile(filePath) {
  // Skip non-JS/TS files
  if (!/\.(js|jsx|ts|tsx)$/.test(filePath)) return;
  
  stats.filesScanned++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let hasOldImport = false;
    let oldImportCount = 0;
    
    // Check for old import patterns
    for (const pattern of OLD_IMPORT_PATTERNS) {
      if (pattern.test(content)) {
        hasOldImport = true;
        const matches = content.match(pattern) || [];
        oldImportCount += matches.length;
      }
    }
    
    if (hasOldImport) {
      stats.filesWithOldImports++;
      stats.oldImportCount += oldImportCount;
      
      if (verboseMode) {
        console.log(`\n📄 ${filePath.replace(process.cwd(), '')}`);
        console.log(`   Found ${oldImportCount} old icon import${oldImportCount > 1 ? 's' : ''}`);
      }
      
      if (shouldFix && !dryRun) {
        fixFile(filePath, content);
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning ${filePath}:`, error.message);
  }
}

/**
 * Fix a file by replacing old imports
 */
function fixFile(filePath, content) {
  // This is a simplified fix that just adds the new import
  // A more sophisticated version would analyze and replace the old imports
  
  // Check if the file already has the new import
  if (content.includes(NEW_IMPORT)) {
    if (verboseMode) {
      console.log(`   ⚠️ File already has new imports, skipping`);
    }
    return;
  }
  
  // Find a good place to add the import (after the last import)
  const importRegex = /^import .+;$/gm;
  const lastImportMatch = [...content.matchAll(importRegex)].pop();
  
  if (!lastImportMatch) {
    if (verboseMode) {
      console.log(`   ⚠️ Couldn't find a place to add imports, skipping`);
    }
    return;
  }
  
  const lastImportIndex = lastImportMatch.index + lastImportMatch[0].length;
  const newContent = 
    content.slice(0, lastImportIndex) + 
    '\n\n// TODO: Replace old icon imports with this unified import\n' + 
    NEW_IMPORT + 
    content.slice(lastImportIndex);
  
  try {
    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      stats.filesFixed++;
      
      if (verboseMode) {
        console.log(`   ✅ Added new import statement`);
      }
    } else if (verboseMode) {
      console.log(`   🔍 Would add new import statement (dry run)`);
    }
  } catch (error) {
    console.error(`   ❌ Error fixing ${filePath}:`, error.message);
  }
}

/**
 * Scan a directory recursively
 */
function scanDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (IGNORE_DIRS.includes(item)) continue;
      
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        scanDirectory(itemPath);
      } else if (stats.isFile()) {
        scanFile(itemPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
  }
}

/**
 * Find files with old icon imports using grep
 */
function findFilesWithOldImports() {
  try {
    // Use grep to find files with old imports (much faster than scanning all files)
    // Escape special characters in the patterns
    const grepPatterns = OLD_IMPORT_PATTERNS.map(p => 
      p.source
        .replace(/\\/g, '')
        .replace(/[']/g, '\\\'')
        .replace(/["]/g, '\\"')
    );
    
    const grepCommand = `grep -l -E "${grepPatterns.join('|')}" --include="*.{js,jsx,ts,tsx}" -r ${targetDir}`;
    
    if (verboseMode) {
      console.log(`🔍 Running grep command to find files with old imports`);
    }
    
    const result = execSync(grepCommand, { encoding: 'utf8' });
    const files = result.trim().split('\n').filter(Boolean);
    
    if (verboseMode) {
      console.log(`🔍 Found ${files.length} files with old icon imports`);
    }
    
    return files;
  } catch (error) {
    if (error.status === 1 && error.stdout === '') {
      // grep returns status 1 when no matches are found
      return [];
    }
    console.error('❌ Error running grep:', error.message);
    console.log('Falling back to manual directory scan...');
    
    // Fall back to manual scan if grep fails
    const files = [];
    scanDirectoryForFiles(targetDir, files);
    return files;
  }
}

/**
 * Manually scan a directory for files
 */
function scanDirectoryForFiles(dir, files) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (IGNORE_DIRS.includes(item)) continue;
      
      const itemPath = path.join(dir, item);
      const itemStats = fs.statSync(itemPath);
      
      if (itemStats.isDirectory()) {
        scanDirectoryForFiles(itemPath, files);
      } else if (itemStats.isFile() && /\.(js|jsx|ts|tsx)$/.test(itemPath)) {
        const content = fs.readFileSync(itemPath, 'utf8');
        
        // Check for old import patterns
        for (const pattern of OLD_IMPORT_PATTERNS) {
          if (pattern.test(content)) {
            files.push(itemPath);
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
  }
}

/**
 * Main function
 */
function main() {
  console.log(`🔍 Scanning for old icon imports${dryRun ? ' (dry run)' : ''} in ${targetDir}...`);
  
  const startTime = Date.now();
  
  // Find files with old imports using manual scan
  const files = [];
  if (verboseMode) {
    console.log('🔍 Using manual directory scan...');
  }
  scanDirectoryForFiles(targetDir, files);
  
  // Scan the matched files
  if (verboseMode) {
    console.log(`🔍 Found ${files.length} files with potential old imports`);
  }
  
  for (const file of files) {
    scanFile(file);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Print results
  console.log('\n📊 Results:');
  console.log(`   Files scanned: ${files.length}`);
  console.log(`   Files with old imports: ${stats.filesWithOldImports}`);
  console.log(`   Total old imports found: ${stats.oldImportCount}`);
  
  if (shouldFix) {
    console.log(`   Files fixed: ${stats.filesFixed}`);
  }
  
  console.log(`\n✅ Scan completed in ${duration}s`);
  
  if (stats.filesWithOldImports > 0) {
    console.log('\n🔄 Migration Instructions:');
    console.log('   1. Replace imports from @fortawesome/* with imports from @/components/icons');
    console.log('   2. Replace FontAwesomeIcon component with Icon, ButtonIcon, or StaticIcon');
    console.log('   3. Update icon names to follow the pattern: faUser → user');
    console.log('   4. Wrap ButtonIcon components with a parent that has the "group" class');
    console.log('   5. Use PlatformIcon for social media platform icons');
    
    if (!shouldFix) {
      console.log('\n💡 To automatically add new imports, run with --fix');
    }
  }
}

// Run the script
main(); 