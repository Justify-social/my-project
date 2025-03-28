#!/usr/bin/env node

/**
 * Pagination Component Migration Script
 * 
 * This script searches for imports of the old Pagination component structure
 * and updates them to use the new modular structure.
 * 
 * Run in dry mode: node scripts/directory-structure/component-migration/migrate-pagination.js
 * Run with applying changes: node scripts/directory-structure/component-migration/migrate-pagination.js --apply
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration variables
const rootDir = process.cwd();
const dryRun = !process.argv.includes('--apply');
const verbose = process.argv.includes('--verbose');

// Component specific config
const componentName = 'Pagination';
const oldImportPatterns = [
  /import\s+{.*?TablePagination.*?}\s+from\s+['"](.+?)['"];?/,
  /import\s+{.*?Pagination.*?}\s+from\s+['"](.+?)['"];?/
];
const newImportPath = '@/components/ui/pagination';

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
  
  // Check for all old import patterns
  for (const pattern of oldImportPatterns) {
    const match = content.match(pattern);
    if (match) {
      const fullImport = match[0];
      const importPath = match[1];
      
      // Avoid modifying imports that are already pointing to our new component
      if (importPath.includes(newImportPath)) {
        continue;
      }
      
      // Extract the components being imported
      const componentsMatch = fullImport.match(/import\s+{(.*?)}\s+from/);
      if (componentsMatch) {
        const components = componentsMatch[1].split(',').map(c => c.trim());
        
        // Check if Pagination or TablePagination is being imported
        if (components.some(c => c === 'Pagination' || c === 'TablePagination')) {
          console.log(`Found Pagination import in: ${filePath}`);
          
          // Replace TablePagination with Pagination if needed
          const newImport = fullImport.replace('TablePagination', 'Pagination')
                                      .replace(importPath, newImportPath);
          
          console.log(`  Old import: ${fullImport.trim()}`);
          console.log(`  New import: ${newImport.trim()}`);
          
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
  console.log(`Running Pagination migration script in ${dryRun ? 'DRY RUN' : 'APPLY'} mode`);
  
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
  console.log(`Found ${modifiedCount} files with Pagination imports to update`);
  
  if (dryRun && modifiedCount > 0) {
    console.log(`\nRun with --apply to apply the changes`);
  }
}

main(); 