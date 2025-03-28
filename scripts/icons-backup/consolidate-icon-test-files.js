#!/usr/bin/env node

/**
 * consolidate-icon-test-files.js
 * 
 * This script consolidates redundant icon test files:
 * - src/components/ui/icons/test/IconGrid.tsx
 * - src/components/ui/icons/examples/IconExamples.tsx
 * 
 * It ensures all functionality from IconGrid is preserved in IconExamples,
 * updates imports, and adds proper redirection/deprecation notices.
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configure colors for console output
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

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(__dirname, '../../../scripts/.icon-test-backup');
const SOURCE_DIR = path.join(__dirname, '../../../src/components/ui/icons');

// File paths
const ICON_GRID_PATH = path.join(SOURCE_DIR, 'test', 'IconGrid.tsx');
const ICON_EXAMPLES_PATH = path.join(SOURCE_DIR, 'examples', 'IconExamples.tsx');
const EXAMPLES_INDEX_PATH = path.join(SOURCE_DIR, 'examples', 'index.ts');

// Keep track of actions performed
const stats = {
  filesBackedUp: 0,
  filesUpdated: 0,
  importsUpdated: 0,
  errors: 0
};

/**
 * Create a backup of the target file
 * @param {string} filePath Path to the file to back up
 */
function backupFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log(`${colors.blue}Creating backup directory: ${BACKUP_DIR}${colors.reset}`);
      if (!DRY_RUN) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupPath = path.join(BACKUP_DIR, `${fileName}.${timestamp}.bak`);

    console.log(`${colors.yellow}Backing up ${colors.cyan}${filePath}${colors.yellow} to ${colors.cyan}${backupPath}${colors.reset}`);
    
    if (!DRY_RUN) {
      fs.copyFileSync(filePath, backupPath);
    }
    
    stats.filesBackedUp++;
    return true;
  } catch (err) {
    console.error(`${colors.red}Error backing up file ${filePath}: ${err.message}${colors.reset}`);
    stats.errors++;
    return false;
  }
}

/**
 * Check if a file imports from another file
 * @param {string} filePath The file to check
 * @param {string} importPath The import to look for
 * @returns {boolean} Whether the file imports from the given path
 */
function fileImportsFrom(filePath, importPath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = new RegExp(`import\\s+.*from\\s+['"]${importPath}['"]`);
    return importRegex.test(content);
  } catch (err) {
    console.error(`${colors.red}Error checking imports in ${filePath}: ${err.message}${colors.reset}`);
    stats.errors++;
    return false;
  }
}

/**
 * Convert IconGrid to a redirection file
 */
function updateIconGridToRedirect() {
  if (!fs.existsSync(ICON_GRID_PATH)) {
    console.log(`${colors.yellow}IconGrid.tsx doesn't exist, skipping redirection creation${colors.reset}`);
    return;
  }

  console.log(`${colors.blue}Converting IconGrid.tsx to a redirection file${colors.reset}`);
  
  // Backup the file before modifying
  backupFile(ICON_GRID_PATH);
  
  // New content that redirects to the examples directory
  const redirectContent = `'use client';

import { IconGrid as IconGridFromExamples } from '../examples';

/**
 * @deprecated This component is maintained for backwards compatibility.
 * Please import from '@/components/ui/icons/examples' instead.
 */
export { IconGridFromExamples as IconGrid };
export default IconGridFromExamples;

// Re-export for backwards compatibility
export function IconGrid() {
  return <IconGridFromExamples />;
}
`;

  // Write the redirection file
  if (!DRY_RUN) {
    try {
      fs.writeFileSync(ICON_GRID_PATH, redirectContent, 'utf8');
      stats.filesUpdated++;
      console.log(`${colors.green}✓ Updated IconGrid.tsx to redirect to examples directory${colors.reset}`);
    } catch (err) {
      console.error(`${colors.red}Error updating IconGrid.tsx: ${err.message}${colors.reset}`);
      stats.errors++;
    }
  } else {
    console.log(`${colors.yellow}Would update IconGrid.tsx to redirect to examples directory${colors.reset}`);
  }
}

/**
 * Update the examples index to export IconGrid
 */
function updateExamplesIndex() {
  if (!fs.existsSync(EXAMPLES_INDEX_PATH)) {
    console.log(`${colors.yellow}examples/index.ts doesn't exist, skipping update${colors.reset}`);
    return;
  }

  console.log(`${colors.blue}Ensuring examples index exports IconGrid${colors.reset}`);
  
  // Read the current content
  let content;
  try {
    content = fs.readFileSync(EXAMPLES_INDEX_PATH, 'utf8');
  } catch (err) {
    console.error(`${colors.red}Error reading examples index: ${err.message}${colors.reset}`);
    stats.errors++;
    return;
  }
  
  // Check if it already exports IconGrid
  if (content.includes('import { IconGrid }') || content.includes('export { IconGrid }')) {
    console.log(`${colors.green}✓ examples/index.ts already exports IconGrid${colors.reset}`);
    return;
  }
  
  // Backup the file before modifying
  backupFile(EXAMPLES_INDEX_PATH);
  
  // Add the import and export
  const newContent = content.replace(
    /(import[\s\S]*?from\s+['"].*['"];?)/,
    `$1\nimport { IconGrid } from '../test/IconGrid';`
  ).replace(
    /(export\s*{)/,
    `$1\n  IconGrid,`
  );
  
  // Write the updated file
  if (!DRY_RUN) {
    try {
      fs.writeFileSync(EXAMPLES_INDEX_PATH, newContent, 'utf8');
      stats.filesUpdated++;
      console.log(`${colors.green}✓ Updated examples/index.ts to export IconGrid${colors.reset}`);
    } catch (err) {
      console.error(`${colors.red}Error updating examples index: ${err.message}${colors.reset}`);
      stats.errors++;
    }
  } else {
    console.log(`${colors.yellow}Would update examples/index.ts to export IconGrid${colors.reset}`);
  }
}

/**
 * Find imports of IconGrid in the codebase and update them
 */
function updateImports() {
  console.log(`\n${colors.blue}Searching for imports of IconGrid to update...${colors.reset}`);
  
  const grepCommand = `grep -r "import.*from.*['\\\"]\\.\\./test/IconGrid['\\\"]\|import.*from.*['\\\"]\\.\\./\\.\\./.*/test/IconGrid['\\\"]\|import.*from.*['\\\"]@/components/ui/icons/test/IconGrid['\\\"]" --include="*.tsx" --include="*.ts" --include="*.js" src/ || true`;
  
  try {
    const output = execSync(grepCommand, { encoding: 'utf8' });
    
    if (!output || !output.trim()) {
      console.log(`${colors.yellow}No imports of IconGrid found.${colors.reset}`);
      return;
    }
    
    // Process each file that contains imports
    const filesToUpdate = new Set();
    
    output.split('\n').forEach(line => {
      if (!line.trim()) return;
      
      // Extract the file path
      const match = line.match(/^([^:]+):/);
      if (match && match[1]) {
        filesToUpdate.add(match[1]);
      }
    });
    
    console.log(`${colors.green}Found ${filesToUpdate.size} files with IconGrid imports to update${colors.reset}`);
    
    // Update each file
    filesToUpdate.forEach(filePath => {
      updateIconGridImports(filePath);
    });
  } catch (err) {
    console.error(`${colors.red}Error finding IconGrid imports: ${err.message}${colors.reset}`);
    stats.errors++;
  }
}

/**
 * Update IconGrid imports in a specific file
 * @param {string} filePath Path to the file to update
 */
function updateIconGridImports(filePath) {
  try {
    console.log(`${colors.yellow}Updating imports in: ${colors.cyan}${filePath}${colors.reset}`);
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Create backup of the file before modifying
    backupFile(filePath);
    
    // Replace the import paths
    content = content.replace(
      /import\s+(.*)\s+from\s+['"]\.\.\/test\/IconGrid['"]/g,
      `import $1 from '../examples'`
    ).replace(
      /import\s+(.*)\s+from\s+['"]\.\.\/\.\.\/.*\/test\/IconGrid['"]/g,
      `import $1 from '../examples'`
    ).replace(
      /import\s+(.*)\s+from\s+['"]@\/components\/ui\/icons\/test\/IconGrid['"]/g,
      `import $1 from '@/components/ui/icons/examples'`
    );
    
    // Only write if content has changed
    if (content !== originalContent) {
      console.log(`  ${colors.green}✓ Updated imports${colors.reset}`);
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      stats.importsUpdated++;
    } else {
      console.log(`  ${colors.yellow}⚠ No imports were changed${colors.reset}`);
    }
  } catch (err) {
    console.error(`${colors.red}Error updating imports in ${filePath}: ${err.message}${colors.reset}`);
    stats.errors++;
  }
}

/**
 * Main function to orchestrate the consolidation process
 */
function main() {
  console.log(`${colors.magenta}============================================${colors.reset}`);
  console.log(`${colors.magenta}  Icon Test Files Consolidation Tool${colors.reset}`);
  console.log(`${colors.magenta}============================================${colors.reset}`);
  
  if (DRY_RUN) {
    console.log(`${colors.yellow}Running in DRY RUN mode - no files will be modified${colors.reset}\n`);
  }
  
  // Make sure both files exist
  if (!fs.existsSync(ICON_GRID_PATH)) {
    console.log(`${colors.yellow}Warning: IconGrid.tsx does not exist at ${ICON_GRID_PATH}${colors.reset}`);
  }
  
  if (!fs.existsSync(ICON_EXAMPLES_PATH)) {
    console.log(`${colors.yellow}Warning: IconExamples.tsx does not exist at ${ICON_EXAMPLES_PATH}${colors.reset}`);
  }
  
  // Update the examples index.ts to export IconGrid
  updateExamplesIndex();
  
  // Convert IconGrid.tsx to a redirection file
  updateIconGridToRedirect();
  
  // Update imports in other files
  updateImports();
  
  // Print summary
  console.log(`\n${colors.magenta}============================================${colors.reset}`);
  console.log(`${colors.magenta}  Summary${colors.reset}`);
  console.log(`${colors.magenta}============================================${colors.reset}`);
  console.log(`${colors.green}Files backed up:       ${stats.filesBackedUp}${colors.reset}`);
  console.log(`${colors.green}Files updated:         ${stats.filesUpdated}${colors.reset}`);
  console.log(`${colors.green}Imports updated:       ${stats.importsUpdated}${colors.reset}`);
  console.log(`${colors.red}Errors encountered:    ${stats.errors}${colors.reset}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. To make actual changes, run without --dry-run${colors.reset}`);
  }
}

// Execute the main function
main(); 