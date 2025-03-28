#!/usr/bin/env node

/**
 * remove-legacy-redirections.js
 * 
 * This script removes legacy redirection files that are no longer needed
 * after the icon system unification process is complete.
 * 
 * It:
 * 1. Makes backups of the files before removing them
 * 2. Removes the legacy files
 * 3. Finds any imports that might still be using these files and updates them
 * 4. Logs actions taken with a summary at the end
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
const BACKUP_DIR = path.join(__dirname, '../../../scripts/.legacy-redirections-backup');
const SOURCE_DIR = path.join(__dirname, '../../../src/components/ui');

// Files to remove
const LEGACY_FILES = [
  'custom-icon-display.tsx',
  'icon-wrapper.tsx',
  'icon.tsx',
  'safe-icon.tsx',
  'loading-spinner.tsx'
];

// Import replacements mapping
const IMPORT_REPLACEMENTS = {
  '@/components/ui/custom-icon-display': '@/components/ui/icons/examples',
  '@/components/ui/icon-wrapper': '@/components/ui/icons',
  '@/components/ui/icon': '@/components/ui/icons',
  '@/components/ui/safe-icon': '@/components/ui/icons/core/safe-icon',
  '@/components/ui/loading-spinner': '@/components/ui/spinner'
};

// Keep track of actions performed
const stats = {
  filesBackedUp: 0,
  filesRemoved: 0,
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
 * Remove a file from the filesystem
 * @param {string} filePath Path to the file to remove
 */
function removeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.yellow}File does not exist, cannot remove: ${colors.cyan}${filePath}${colors.reset}`);
    return false;
  }

  try {
    console.log(`${colors.green}Removing file: ${colors.cyan}${filePath}${colors.reset}`);
    
    if (!DRY_RUN) {
      fs.unlinkSync(filePath);
    }
    
    stats.filesRemoved++;
    return true;
  } catch (err) {
    console.error(`${colors.red}Error removing file ${filePath}: ${err.message}${colors.reset}`);
    stats.errors++;
    return false;
  }
}

/**
 * Find imports of legacy files in the codebase and update them
 */
function updateImports() {
  console.log(`\n${colors.blue}Searching for imports of legacy redirection files...${colors.reset}`);

  // Create search patterns for grep in a more reliable way
  const importPatterns = Object.keys(IMPORT_REPLACEMENTS);
  
  try {
    // Search one pattern at a time to avoid shell escaping issues
    const filesToUpdate = new Set();
    
    for (const pattern of importPatterns) {
      const safePattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
      const grepCommand = `grep -r "import.*from.*['\\\"]${safePattern}['\\\"]" --include="*.tsx" --include="*.ts" --include="*.js" src/ || true`;
      
      console.log(`${colors.cyan}Searching for imports of: ${pattern}${colors.reset}`);
      
      try {
        const output = execSync(grepCommand, { encoding: 'utf8' });
        
        if (output && output.trim()) {
          output.split('\n').forEach(line => {
            if (!line.trim()) return;
            
            // Extract the file path
            const match = line.match(/^([^:]+):/);
            if (match && match[1]) {
              filesToUpdate.add(match[1]);
            }
          });
        }
      } catch (error) {
        // Ignore grep errors, we're using || true to handle no matches
        if (error.status !== 1) {
          console.error(`${colors.red}Error in grep command: ${error.message}${colors.reset}`);
        }
      }
    }

    if (filesToUpdate.size === 0) {
      console.log(`${colors.yellow}No imports of legacy files found.${colors.reset}`);
      return;
    }

    console.log(`${colors.green}Found ${filesToUpdate.size} files with legacy imports to update${colors.reset}`);
    
    // Update each file
    filesToUpdate.forEach(filePath => {
      updateFileImports(filePath);
    });
  } catch (err) {
    console.error(`${colors.red}Error updating imports: ${err.message}${colors.reset}`);
    stats.errors++;
  }
}

/**
 * Update imports in a specific file
 * @param {string} filePath Path to the file to update
 */
function updateFileImports(filePath) {
  try {
    console.log(`${colors.yellow}Updating imports in: ${colors.cyan}${filePath}${colors.reset}`);
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Create backup of the file before modifying
    backupFile(filePath);
    
    // Replace all imports with their updated versions
    Object.entries(IMPORT_REPLACEMENTS).forEach(([oldImport, newImport]) => {
      const regex = new RegExp(`import\\s+(.*)\\s+from\\s+['"]${oldImport}['"]`, 'g');
      content = content.replace(regex, `import $1 from '${newImport}'`);
    });
    
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
 * Main function to orchestrate the removal process
 */
function main() {
  console.log(`${colors.magenta}============================================${colors.reset}`);
  console.log(`${colors.magenta}  Legacy Redirections Removal Tool${colors.reset}`);
  console.log(`${colors.magenta}============================================${colors.reset}`);
  
  if (DRY_RUN) {
    console.log(`${colors.yellow}Running in DRY RUN mode - no files will be modified${colors.reset}\n`);
  }
  
  // Process each legacy file
  for (const file of LEGACY_FILES) {
    const filePath = path.join(SOURCE_DIR, file);
    
    if (fs.existsSync(filePath)) {
      console.log(`\n${colors.blue}Processing: ${colors.cyan}${file}${colors.reset}`);
      
      // Backup and remove the file
      if (backupFile(filePath)) {
        removeFile(filePath);
      }
    } else {
      console.log(`\n${colors.yellow}File doesn't exist, skipping: ${colors.cyan}${file}${colors.reset}`);
    }
  }
  
  // Update imports to these files
  updateImports();
  
  // Print summary
  console.log(`\n${colors.magenta}============================================${colors.reset}`);
  console.log(`${colors.magenta}  Summary${colors.reset}`);
  console.log(`${colors.magenta}============================================${colors.reset}`);
  console.log(`${colors.green}Files backed up:       ${stats.filesBackedUp}${colors.reset}`);
  console.log(`${colors.green}Files removed:         ${stats.filesRemoved}${colors.reset}`);
  console.log(`${colors.green}Imports updated:       ${stats.importsUpdated}${colors.reset}`);
  console.log(`${colors.red}Errors encountered:    ${stats.errors}${colors.reset}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. To make actual changes, run without --dry-run${colors.reset}`);
  }
}

// Execute the main function
main(); 