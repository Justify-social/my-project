#!/usr/bin/env node

/**
 * Script to identify deprecated icon and spinner files for removal,
 * and check for imports of these files in the codebase.
 * 
 * This is part of the aggressive tree-shaking project to clean up the codebase.
 */

import execSync from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const DEPRECATED_FILES = [
  {
    path: 'src/components/ui/spinner/loading-spinner.tsx',
    reason: 'Deprecated in favor of Spinner component',
    replacementImport: "import { Spinner } from '@/components/ui/spinner';",
    usagePattern: "import.*LoadingSpinner.*from.*spinner/loading-spinner"
  },
  {
    path: 'src/components/ui/spinner/svg-spinner.tsx',
    reason: 'Deprecated in favor of Spinner component with type="svg"',
    replacementImport: "import { Spinner } from '@/components/ui/spinner';",
    usagePattern: "import.*LoadingSpinner.*from.*spinner/svg-spinner"
  },
  {
    path: 'src/components/ui/icons/test/IconGrid.tsx',
    reason: 'Deprecated in favor of importing from examples directory',
    replacementImport: "import { IconGrid } from '@/components/ui/icons/examples';",
    usagePattern: "import.*IconGrid.*from.*icons/test"
  },
  {
    path: 'src/components/ui/icons/core/index.ts',
    reason: 'Transitional module that re-exports core Icon components',
    replacementImport: "import { Icon, PlatformIcon } from '@/components/ui/icons';",
    usagePattern: "import.*from.*icons/core"
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
  deprecatedFilesChecked: 0,
  deprecatedFilesFound: 0,
  importsFound: 0,
  filesNeedingUpdate: 0
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
 * Searches for imports of a pattern in the codebase
 * @param {string} pattern - Grep pattern to search for
 * @returns {string[]} - Array of files with matches
 */
function findImports(pattern) {
  try {
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
 * Print a report of the status for a deprecated file
 * @param {Object} fileInfo - Information about the file
 */
function reportFileStatus(fileInfo) {
  stats.deprecatedFilesChecked++;

  console.log(`\n${colors.cyan}Checking: ${fileInfo.path}${colors.reset}`);
  
  if (fileExists(fileInfo.path)) {
    stats.deprecatedFilesFound++;
    console.log(`${colors.yellow}✓ File exists and is marked for deprecation${colors.reset}`);
    console.log(`  Reason: ${fileInfo.reason}`);
    
    const imports = findImports(fileInfo.usagePattern);
    if (imports.length > 0) {
      stats.importsFound += imports.length;
      stats.filesNeedingUpdate += imports.length;
      
      console.log(`${colors.red}⚠ Found ${imports.length} imports of this deprecated file:${colors.reset}`);
      imports.forEach(imp => {
        console.log(`  - ${imp.split(':')[0]}`);
      });
      
      console.log(`${colors.green}✓ Suggested replacement:${colors.reset}`);
      console.log(`  ${fileInfo.replacementImport}`);
    } else {
      console.log(`${colors.green}✓ No imports found - safe to remove${colors.reset}`);
    }
  } else {
    console.log(`${colors.green}✓ File already removed${colors.reset}`);
  }
}

/**
 * Main function to check status of deprecated files
 */
function checkDeprecatedFiles() {
  console.log(`${colors.magenta}=====================================${colors.reset}`);
  console.log(`${colors.magenta}Deprecated Files Status Check${colors.reset}`);
  console.log(`${colors.magenta}=====================================${colors.reset}`);
  
  DEPRECATED_FILES.forEach(fileInfo => {
    reportFileStatus(fileInfo);
  });
  
  // Print summary
  console.log(`\n${colors.cyan}=====================================${colors.reset}`);
  console.log(`${colors.cyan}Summary${colors.reset}`);
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  console.log(`Files checked: ${stats.deprecatedFilesChecked}`);
  console.log(`Deprecated files still present: ${stats.deprecatedFilesFound}`);
  console.log(`Total imports found: ${stats.importsFound}`);
  console.log(`Files needing update: ${stats.filesNeedingUpdate}`);
  
  if (stats.filesNeedingUpdate > 0) {
    console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
    console.log(`1. Update imports in the files listed above`);
    console.log(`2. Run tests to ensure functionality is preserved`);
    console.log(`3. Remove deprecated files after all imports are updated`);
  } else if (stats.deprecatedFilesFound > 0) {
    console.log(`\n${colors.green}Next steps:${colors.reset}`);
    console.log(`All deprecated files can be safely removed!`);
  } else {
    console.log(`\n${colors.green}All deprecated files have been successfully removed!${colors.reset}`);
  }
}

// Run the check
checkDeprecatedFiles(); 