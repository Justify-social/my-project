#!/usr/bin/env node

/**
 * Script to update imports of deprecated components to use the new, consolidated components.
 * 
 * This script is part of the aggressive tree-shaking project to clean up the codebase.
 * It will scan for files importing deprecated components and update them to use
 * the consolidated components instead.
 */

import execSync from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration for replacements
const REPLACEMENTS = [
  {
    // LoadingSpinner from spinner/loading-spinner
    searchPattern: "from '@/components/ui/spinner/loading-spinner'",
    pattern: /import\s+{\s*LoadingSpinner\s*}\s+from\s+['"]@\/components\/ui\/spinner\/loading-spinner['"];?/g,
    replacement: "import { Spinner } from '@/components/ui/spinner';",
    componentReplacement: {
      from: /<LoadingSpinner\s*\/?>/g,
      to: '<Spinner size="lg" variant="current" />'
    }
  },
  {
    // IconGrid from icons/test
    searchPattern: "from '@/components/ui/icons/test'",
    pattern: /import\s+{\s*IconGrid\s*}\s+from\s+['"]@\/components\/ui\/icons\/test['"];?/g,
    replacement: "import { IconGrid } from '@/components/ui/icons/examples';",
  },
  {
    // Imports from icons/core
    searchPattern: "from '@/components/ui/icons/core'",
    pattern: /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/icons\/core['"];?/g,
    replacement: "import {$1} from '@/components/ui/icons';",
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
  filesChecked: 0,
  filesUpdated: 0,
  importsUpdated: 0,
  componentsUpdated: 0
};

/**
 * Finds files with imports of deprecated components
 * @param {string} pattern - Grep pattern to search for
 * @returns {string[]} - Array of file paths
 */
function findFiles(pattern) {
  try {
    const result = execSync(
      `grep -l -r "${pattern}" --include="*.tsx" --include="*.ts" src/`,
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
 * Updates imports in a file
 * @param {string} filePath - Path to the file to update
 * @returns {boolean} - Whether the file was updated
 */
function updateFile(filePath) {
  try {
    stats.filesChecked++;
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let importChanges = 0;
    let componentChanges = 0;
    
    // Apply each replacement
    REPLACEMENTS.forEach(({ pattern, replacement, componentReplacement }) => {
      // Update imports
      const importMatches = content.match(pattern);
      if (importMatches) {
        content = content.replace(pattern, replacement);
        importChanges += importMatches.length;
      }
      
      // Update component usage if specified
      if (componentReplacement && importMatches) {
        const { from, to } = componentReplacement;
        const componentMatches = content.match(from);
        if (componentMatches) {
          content = content.replace(from, to);
          componentChanges += componentMatches.length;
        }
      }
    });
    
    // If changes were made, write the file
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesUpdated++;
      stats.importsUpdated += importChanges;
      stats.componentsUpdated += componentChanges;
      
      console.log(`${colors.green}✓ Updated ${filePath}${colors.reset}`);
      console.log(`  - ${importChanges} import(s) updated`);
      if (componentChanges > 0) {
        console.log(`  - ${componentChanges} component usage(s) updated`);
      }
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`${colors.red}Error updating file: ${filePath}${colors.reset}`, err);
    return false;
  }
}

/**
 * Updates imports for a specific pattern
 * @param {Object} replacement - Replacement configuration
 */
function updateImportsForPattern(replacement) {
  const { searchPattern } = replacement;
  
  console.log(`\n${colors.cyan}Searching for imports matching: ${searchPattern}${colors.reset}`);
  
  const files = findFiles(searchPattern);
  if (files.length === 0) {
    console.log(`${colors.yellow}No files found with this import pattern${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}Found ${files.length} file(s) to update:${colors.reset}`);
  
  files.forEach(file => {
    updateFile(file);
  });
}

/**
 * Main function to update imports
 */
function updateImports() {
  console.log(`${colors.magenta}=====================================${colors.reset}`);
  console.log(`${colors.magenta}Updating Deprecated Component Imports${colors.reset}`);
  console.log(`${colors.magenta}=====================================${colors.reset}`);
  
  REPLACEMENTS.forEach(replacement => {
    updateImportsForPattern(replacement);
  });
  
  // Print summary
  console.log(`\n${colors.cyan}=====================================${colors.reset}`);
  console.log(`${colors.cyan}Summary${colors.reset}`);
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  console.log(`Files checked: ${stats.filesChecked}`);
  console.log(`Files updated: ${stats.filesUpdated}`);
  console.log(`Imports updated: ${stats.importsUpdated}`);
  console.log(`Component usages updated: ${stats.componentsUpdated}`);
  
  if (stats.filesUpdated > 0) {
    console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
    console.log(`1. Run tests to ensure functionality is preserved`);
    console.log(`2. Run the check-deprecated-files.js script again to verify remaining imports`);
    console.log(`3. Remove deprecated files after all imports are updated`);
  } else {
    console.log(`\n${colors.green}No files needed updates!${colors.reset}`);
  }
}

// Run the update
updateImports(); 