#!/usr/bin/env node

/**
 * DatePicker Component Migration Script
 * 
 * This script searches for imports of the old DatePicker component structure
 * and updates them to use the new modular structure.
 * 
 * Run in dry mode: node scripts/directory-structure/component-migration/migrate-datepicker.js
 * Run with applying changes: node scripts/directory-structure/component-migration/migrate-datepicker.js --apply
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration variables
const rootDir = process.cwd();
const dryRun = !process.argv.includes('--apply');
const verbose = process.argv.includes('--verbose');

// Component specific config
const componentName = 'DatePicker';
const oldImportPatterns = [
  /import\s+{.*?DatePicker.*?}\s+from\s+['"](.+?)['"];?/,
  /import\s+DatePicker\s+from\s+['"](.+?)['"];?/
];
const newImportPath = '@/components/ui/date-picker';

/**
 * Helper functions
 */

function findFilesWithExtensions(directory, extensions, excludeDirs = []) {
  const results = [];
  
  function traverse(dir) {
    // Add error handling for non-existent directories
    if (!fs.existsSync(dir)) {
      if (verbose) {
        console.log(`Directory does not exist: ${dir}`);
      }
      return;
    }
    
    let files;
    try {
      files = fs.readdirSync(dir);
    } catch (err) {
      console.error(`Error reading directory ${dir}:`, err.message);
      return;
    }
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      
      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch (err) {
        console.error(`Error getting stats for ${filePath}:`, err.message);
        continue;
      }
      
      if (stat.isDirectory()) {
        // Skip excluded directories
        if (!excludeDirs.includes(file) && !excludeDirs.includes(filePath)) {
          traverse(filePath);
        }
      } else if (extensions.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  }
  
  traverse(directory);
  return results;
}

function processFile(filePath) {
  if (verbose) {
    console.log(`Checking file: ${filePath}`);
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check for old import patterns
  for (const pattern of oldImportPatterns) {
    const match = content.match(pattern);
    if (match) {
      const fullImport = match[0];
      const importPath = match[1];
      
      // Skip if it's already the new path
      if (importPath.includes(newImportPath)) {
        continue;
      }
      
      // Only update if the import is actually for DatePicker
      const componentsMatch = fullImport.match(/import\s+{([^}]+)}\s+from/) || 
                             fullImport.match(/import\s+(\w+)\s+from/);
      
      if (componentsMatch) {
        const components = componentsMatch[1].split(',').map(c => c.trim());
        
        if (components.some(c => 
            c === 'DatePicker' || 
            c.endsWith(' as DatePicker') || 
            c.includes('DatePicker')
        )) {
          console.log(`Found DatePicker import in: ${filePath}`);
          console.log(`  Old import: ${fullImport.trim()}`);
          
          // Create new import
          let newImport;
          if (fullImport.includes('{')) {
            // Named import
            newImport = `import { DatePicker } from "${newImportPath}";`;
          } else {
            // Default import
            newImport = `import { DatePicker } from "${newImportPath}";`;
          }
          
          console.log(`  New import: ${newImport}`);
          
          if (!dryRun) {
            content = content.replace(fullImport, newImport);
            modified = true;
          }
        }
      }
    }
  }
  
  // Save changes if any were made
  if (modified) {
    console.log(`  Updating file: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return modified;
}

/**
 * Main execution
 */

function main() {
  console.log(`Running DatePicker migration script in ${dryRun ? 'DRY RUN' : 'APPLY'} mode`);
  
  // Find TypeScript and JavaScript files
  const filesToProcess = findFilesWithExtensions(
    path.join(rootDir, 'src'),
    ['.ts', '.tsx', '.js', '.jsx'],
    ['node_modules', 'dist', 'build', '.git']
  );
  
  console.log(`Found ${filesToProcess.length} files to check`);
  
  let modifiedCount = 0;
  for (const filePath of filesToProcess) {
    const wasModified = processFile(filePath);
    if (wasModified) {
      modifiedCount++;
    }
  }
  
  console.log(`Finished processing ${filesToProcess.length} files`);
  console.log(`Found ${modifiedCount} files with DatePicker imports to update`);
  
  if (dryRun && modifiedCount > 0) {
    console.log(`\nRun with --apply to apply the changes`);
  }
}

main(); 