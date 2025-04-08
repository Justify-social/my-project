#!/usr/bin/env node

/**
 * Fix Legacy UI Path Imports
 * 
 * This script automatically fixes imports using deprecated UI component paths:
 * - @/components/ui/atoms/ -> @/components/ui/
 * - @/components/ui/molecules/ -> @/components/ui/
 * - @/components/ui/organisms/ -> @/components/ui/
 * 
 * It transforms the imports to use the new recommended paths following
 * the atomic design structure.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SCAN_DIRS = ['src', 'docs', 'BUILD'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', '.git', '.backup'];
const LEGACY_PATTERNS = [
  '@/components/ui/atoms/',
  '@/components/ui/molecules/',
  '@/components/ui/organisms/'
];

// Output formatting
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Results tracking
const results = {
  totalFiles: 0,
  fixedFiles: 0,
  totalImports: 0,
  fixedByType: {
    atoms: 0,
    molecules: 0,
    organisms: 0
  }
};

// Track dry run vs actual fixes
let dryRun = true;

/**
 * Check if a file should be excluded based on its path
 */
function shouldExcludeFile(filePath) {
  // Exclude directories in the exclude list
  if (EXCLUDE_DIRS.some(dir => filePath.includes(`/${dir}/`))) {
    return true;
  }
  
  // Only process specific file types
  const ext = path.extname(filePath).toLowerCase();
  return !['.js', '.jsx', '.ts', '.tsx'].includes(ext);
}

/**
 * Fix legacy imports in a file
 */
function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let hasLegacyImports = false;
    let updatedContent = content;
    
    const imports = {
      atoms: 0,
      molecules: 0,
      organisms: 0
    };
    
    // Process imports
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[^;]*|[^;{}]*)\s+from\s+['"]([^'"]*)['"]/g;
    let match;
    const changes = [];
    
    while ((match = importRegex.exec(content)) !== null) {
      const importStatement = match[0];
      const importPath = match[1];
      
      for (const pattern of LEGACY_PATTERNS) {
        if (importPath.includes(pattern)) {
          const type = pattern.includes('atoms') ? 'atoms' : 
                      pattern.includes('molecules') ? 'molecules' : 'organisms';
          
          // Create the fixed import path - remove the atomic layer
          const fixedPath = importPath.replace(pattern, '@/components/ui/');
          const fixedImport = importStatement.replace(importPath, fixedPath);
          
          changes.push({
            original: importStatement,
            fixed: fixedImport,
            type
          });
          
          imports[type]++;
          results.totalImports++;
          hasLegacyImports = true;
        }
      }
    }
    
    // Apply the changes (in reverse to maintain indices)
    for (let i = changes.length - 1; i >= 0; i--) {
      const change = changes[i];
      updatedContent = updatedContent.replace(change.original, change.fixed);
      
      // Update results
      results.fixedByType[change.type]++;
    }
    
    if (hasLegacyImports) {
      // Output what we're changing
      console.log(`\n${CYAN}${filePath}${RESET}`);
      
      changes.forEach(change => {
        const typeColor = 
          change.type === 'atoms' ? GREEN :
          change.type === 'molecules' ? YELLOW : RED;
        
        console.log(`  ${typeColor}[${change.type}]${RESET}`);
        console.log(`    ${RED}- ${change.original}${RESET}`);
        console.log(`    ${GREEN}+ ${change.fixed}${RESET}`);
      });
      
      // Update the file if not in dry run mode
      if (!dryRun) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        results.fixedFiles++;
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Walk through directory recursively to find files
 */
function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip excluded directories
      if (EXCLUDE_DIRS.includes(file)) {
        return;
      }
      // Recurse into subdirectories
      results = results.concat(walkDir(filePath));
    } else {
      // Add file to results if it's not excluded
      if (!shouldExcludeFile(filePath)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`${BOLD}UI Legacy Path Fixer${RESET}`);
  console.log(`This script fixes deprecated UI component import paths.\n`);
  console.log(`Usage:`);
  console.log(`  node scripts/fix-legacy-ui-paths.js [options]\n`);
  console.log(`Options:`);
  console.log(`  --help, -h       Show this help message`);
  console.log(`  --dry-run        Show what would be changed without making changes (default)`);
  console.log(`  --fix            Actually fix the files\n`);
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  if (args.includes('--fix')) {
    dryRun = false;
  }
  
  return { dryRun };
}

/**
 * Main function
 */
function main() {
  // Parse arguments
  const options = parseArgs();
  
  console.log(`${BOLD}UI Legacy Path Fixer${RESET}`);
  
  if (options.dryRun) {
    console.log(`${YELLOW}DRY RUN MODE: No files will be changed${RESET}`);
    console.log(`Use --fix to apply changes.\n`);
  } else {
    console.log(`${RED}FIX MODE: Files will be updated!${RESET}\n`);
  }
  
  const startTime = Date.now();
  let allFiles = [];
  
  // Collect all files from scan directories
  for (const dir of SCAN_DIRS) {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(walkDir(dir));
    }
  }
  
  results.totalFiles = allFiles.length;
  console.log(`Found ${allFiles.length} files to scan.`);
  
  // Process each file
  allFiles.forEach(filePath => {
    fixFile(filePath);
  });
  
  // Display summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n${BOLD}Fix Summary${RESET}`);
  console.log(`Total files scanned: ${results.totalFiles}`);
  console.log(`Files with legacy imports: ${results.fixedFiles || 'Would fix'} ${dryRun ? '(dry run)' : ''}`);
  console.log(`Total imports fixed: ${results.totalImports} ${dryRun ? '(dry run)' : ''}`);
  console.log(`\nBreakdown by pattern:`);
  console.log(`${GREEN}- atoms: ${results.fixedByType.atoms} imports${RESET}`);
  console.log(`${YELLOW}- molecules: ${results.fixedByType.molecules} imports${RESET}`);
  console.log(`${RED}- organisms: ${results.fixedByType.organisms} imports${RESET}`);
  
  console.log(`\nOperation completed in ${duration} seconds.`);
  
  if (dryRun && results.totalImports > 0) {
    console.log(`\n${MAGENTA}${BOLD}Run with --fix to apply these changes.${RESET}`);
  }
}

// Run the main function
main(); 