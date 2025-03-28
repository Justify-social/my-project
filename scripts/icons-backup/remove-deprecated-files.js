#!/usr/bin/env node

/**
 * Script to remove deprecated files that are now safe to delete.
 * 
 * This script is part of the aggressive tree-shaking project to clean up the codebase.
 * It will remove files that have been marked as deprecated and have no imports.
 */

import execSync from 'child_process';
import fs from 'fs';
import path from 'path';

// List of deprecated files to remove
const DEPRECATED_FILES = [
  {
    path: 'src/components/ui/spinner/loading-spinner.tsx',
    reason: 'Deprecated in favor of Spinner component',
    replacementImport: "import { Spinner } from '@/components/ui/spinner';",
  },
  {
    path: 'src/components/ui/spinner/svg-spinner.tsx',
    reason: 'Deprecated in favor of Spinner component with type="svg"',
    replacementImport: "import { Spinner } from '@/components/ui/spinner';",
  },
  {
    path: 'src/components/ui/icons/test/IconGrid.tsx',
    reason: 'Deprecated in favor of importing from examples directory',
    replacementImport: "import { IconGrid } from '@/components/ui/icons/examples';",
  },
  {
    path: 'src/components/ui/icons/core/index.ts',
    reason: 'Transitional module that re-exports core Icon components',
    replacementImport: "import { Icon, PlatformIcon } from '@/components/ui/icons';",
  }
];

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
  filesProcessed: 0,
  filesRemoved: 0,
  filesBackedUp: 0,
  errors: 0,
};

/**
 * Checks if a file exists
 * @param {string} filePath - Path to check
 * @returns {boolean} - Whether the file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error(`Error checking if file exists: ${filePath}`, err);
    return false;
  }
}

/**
 * Creates a backup of a file in the .backups directory
 * @param {string} filePath - Path to the file to backup
 * @returns {boolean} - Whether the backup was successful
 */
function backupFile(filePath) {
  try {
    // Create backup directory
    const backupDir = 'scripts/icon-cleanup/backups';
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = `${backupDir}/${timestamp}`;
    
    // Ensure the backup directory exists
    fs.mkdirSync(backupPath, { recursive: true });
    
    // Copy the file to the backup directory
    const fileName = path.basename(filePath);
    const backupFilePath = `${backupPath}/${fileName}`;
    fs.copyFileSync(filePath, backupFilePath);
    
    stats.filesBackedUp++;
    console.log(`${colors.blue}✓ Backed up ${filePath} to ${backupFilePath}${colors.reset}`);
    return true;
  } catch (err) {
    stats.errors++;
    console.error(`${colors.red}Error backing up file: ${filePath}${colors.reset}`, err);
    return false;
  }
}

/**
 * Removes a file
 * @param {string} filePath - Path to the file to remove
 * @returns {boolean} - Whether the removal was successful
 */
function removeFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    stats.filesRemoved++;
    console.log(`${colors.green}✓ Removed ${filePath}${colors.reset}`);
    return true;
  } catch (err) {
    stats.errors++;
    console.error(`${colors.red}Error removing file: ${filePath}${colors.reset}`, err);
    return false;
  }
}

/**
 * Searches for imports of a pattern in the codebase
 * @param {string} pattern - Grep pattern to search for
 * @returns {string[]} - Array of files with matches
 */
function findImports(filePath) {
  try {
    // First, create a basename pattern for more accurate matching
    const fileBasename = path.basename(filePath, path.extname(filePath));
    const pattern = `from.*${fileBasename}`;
    
    const result = execSync(
      `grep -r "${pattern}" --include="*.tsx" --include="*.ts" src/ | sort`,
      { encoding: 'utf8' }
    );
    return result.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    // If grep doesn't find anything, it returns a non-zero exit code
    if (error.status === 1 && error.stdout === '') {
      return [];
    }
    console.error('Error executing grep:', error);
    return [];
  }
}

/**
 * Processes a deprecated file
 * @param {Object} fileInfo - Information about the file
 */
function processDeprecatedFile(fileInfo) {
  const { path: filePath, reason } = fileInfo;
  stats.filesProcessed++;
  
  console.log(`\n${colors.cyan}Processing: ${filePath}${colors.reset}`);
  console.log(`  Reason: ${reason}`);
  
  if (fileExists(filePath)) {
    // Check for imports of this file
    const imports = findImports(filePath);
    if (imports.length > 0) {
      console.log(`${colors.yellow}⚠ Found ${imports.length} imports of this file:${colors.reset}`);
      imports.forEach(imp => {
        console.log(`  - ${imp.split(':')[0]}`);
      });
      console.log(`${colors.yellow}⚠ Not removing file as it's still being used${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ No imports found - safe to remove${colors.reset}`);
      
      // Create a backup before removing
      if (backupFile(filePath)) {
        // Remove the file
        removeFile(filePath);
      } else {
        console.log(`${colors.red}✗ Skipping removal due to backup failure${colors.reset}`);
      }
    }
  } else {
    console.log(`${colors.blue}✓ File already removed${colors.reset}`);
  }
}

/**
 * Main function to remove deprecated files
 */
function removeDeprecatedFiles() {
  console.log(`${colors.magenta}=====================================${colors.reset}`);
  console.log(`${colors.magenta}Removing Deprecated Files${colors.reset}`);
  console.log(`${colors.magenta}=====================================${colors.reset}`);
  
  DEPRECATED_FILES.forEach(fileInfo => {
    processDeprecatedFile(fileInfo);
  });
  
  // Print summary
  console.log(`\n${colors.cyan}=====================================${colors.reset}`);
  console.log(`${colors.cyan}Summary${colors.reset}`);
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files backed up: ${stats.filesBackedUp}`);
  console.log(`Files removed: ${stats.filesRemoved}`);
  console.log(`Errors: ${stats.errors}`);
  
  if (stats.errors > 0) {
    console.log(`\n${colors.red}There were errors during the removal process. Check the logs above.${colors.reset}`);
  } else if (stats.filesRemoved > 0) {
    console.log(`\n${colors.green}Successfully removed all deprecated files!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}No files were removed. Check the logs above.${colors.reset}`);
  }
}

// Run the removal
removeDeprecatedFiles(); 