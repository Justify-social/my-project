#!/usr/bin/env node

/**
 * Script to update imports from the deprecated icons/core module to use the main icons module instead.
 * 
 * This script is part of the aggressive tree-shaking project to clean up the codebase.
 * It will update all files that import from '@/components/ui/icons/core' to import from '@/components/ui/icons'.
 */

import execSync from 'child_process';
import fs from 'fs';
import path from 'path';

// Color console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Track statistics
const stats = {
  filesFound: 0,
  filesUpdated: 0,
  importsUpdated: 0,
  errors: 0
};

/**
 * Finds files that import from the core module
 * @returns {string[]} - Array of file paths
 */
function findCoreImportFiles() {
  try {
    const result = execSync(
      `grep -l -r "from '@/components/ui/icons/core'" --include="*.tsx" --include="*.ts" src/`,
      { encoding: 'utf8' }
    );
    return result.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    // If grep doesn't find anything, it returns a non-zero exit code
    if (error.status === 1 && error.stdout === '') {
      return [];
    }
    console.error(`${colors.red}Error executing grep:${colors.reset}`, error);
    return [];
  }
}

/**
 * Updates imports in a file
 * @param {string} filePath - Path to the file to update
 * @returns {boolean} - Whether the file was updated
 */
function updateFileImports(filePath) {
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace all imports from icons/core with imports from icons
    const pattern = /from\s+['"]@\/components\/ui\/icons\/core['"]/g;
    const replacement = `from '@/components/ui/icons'`;
    
    // Count matches
    const matches = content.match(pattern);
    const matchCount = matches ? matches.length : 0;
    
    if (matchCount > 0) {
      // Replace the imports
      content = content.replace(pattern, replacement);
      
      // Write the file
      fs.writeFileSync(filePath, content, 'utf8');
      
      stats.filesUpdated++;
      stats.importsUpdated += matchCount;
      
      console.log(`${colors.green}✓ Updated ${filePath}${colors.reset}`);
      console.log(`  - ${matchCount} import(s) updated`);
      return true;
    }
    
    return false;
  } catch (err) {
    stats.errors++;
    console.error(`${colors.red}Error updating file: ${filePath}${colors.reset}`, err);
    return false;
  }
}

/**
 * Main function to update core imports
 */
function updateCoreImports() {
  console.log(`${colors.magenta}=====================================${colors.reset}`);
  console.log(`${colors.magenta}Updating Icons Core Imports${colors.reset}`);
  console.log(`${colors.magenta}=====================================${colors.reset}`);
  
  // Find files that import from the core module
  const files = findCoreImportFiles();
  stats.filesFound = files.length;
  
  if (files.length === 0) {
    console.log(`${colors.green}✓ No files found that import from the icons/core module${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}Found ${files.length} file(s) to update:${colors.reset}`);
  
  // Update each file
  files.forEach(file => {
    updateFileImports(file);
  });
  
  // Print summary
  console.log(`\n${colors.cyan}=====================================${colors.reset}`);
  console.log(`${colors.cyan}Summary${colors.reset}`);
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  console.log(`Files found: ${stats.filesFound}`);
  console.log(`Files updated: ${stats.filesUpdated}`);
  console.log(`Imports updated: ${stats.importsUpdated}`);
  console.log(`Errors: ${stats.errors}`);
  
  if (stats.errors > 0) {
    console.log(`\n${colors.red}There were errors during the update process. Check the logs above.${colors.reset}`);
  } else if (stats.filesUpdated > 0) {
    console.log(`\n${colors.green}Successfully updated all imports from the icons/core module!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}No files were updated. Check the logs above.${colors.reset}`);
  }
}

// Run the update
updateCoreImports(); 