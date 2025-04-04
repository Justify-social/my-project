#!/usr/bin/env node

/**
 * Cleanup Obsolete Scripts
 * 
 * This script removes or migrates obsolete script files in the deleted-scripts directory
 * that have been moved to their canonical locations according to SSOT principles.
 * 
 * Usage:
 *   node config/ui/scripts/cleanup-obsolete-scripts.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DELETED_SCRIPTS_DIR = path.resolve(process.cwd(), 'deleted-scripts');
const DRY_RUN = process.argv.includes('--dry-run');

// Terminal colors for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// Helper log functions
const log = (msg) => console.log(msg);
const info = (msg) => console.log(`${colors.blue}ℹ ${colors.reset}${msg}`);
const success = (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`);
const warning = (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`);
const error = (msg) => console.error(`${colors.red}✗ ${colors.reset}${msg}`);

// List of files that have been migrated to their canonical locations
const MIGRATED_FILES = [
  {
    oldPath: 'deleted-scripts/fix-duplicate-exports.js',
    newPath: 'config/ui/scripts/fix-duplicate-exports.mjs',
    action: 'migrated'
  },
  {
    oldPath: 'deleted-scripts/fix-icon-maps.js',
    newPath: 'config/ui/scripts/fix-icon-maps.mjs',
    action: 'migrated'
  },
  {
    oldPath: 'deleted-scripts/validate-icon-maps.js',
    newPath: 'config/ui/scripts/validate-icon-maps.mjs',
    action: 'migrated'
  },
  {
    oldPath: 'deleted-scripts/add-default-exports.js',
    action: 'obsolete',
    reason: 'Functionality has been integrated into fix-duplicate-exports.mjs'
  },
  {
    oldPath: 'deleted-scripts/add-style-exports.js',
    action: 'obsolete',
    reason: 'Style exports are now handled by the component registry system'
  },
  {
    oldPath: 'deleted-scripts/check-server-errors.js',
    action: 'obsolete',
    reason: 'Server errors are now handled by the component validation system'
  },
  {
    oldPath: 'deleted-scripts/component-validation.js',
    action: 'obsolete',
    reason: 'Component validation is now handled by scripts/ui/validate-component-paths.mjs'
  },
  {
    oldPath: 'deleted-scripts/component-import-fixer.js',
    action: 'obsolete',
    reason: 'Component imports are now handled by the ESLint config and webpack'
  },
  {
    oldPath: 'deleted-scripts/fix-component-exports.js',
    action: 'obsolete',
    reason: 'Component exports are now standardized by the component registry system'
  },
  {
    oldPath: 'deleted-scripts/generate-ui-registry.js',
    action: 'obsolete',
    reason: 'UI Registry generation is now handled by component-registry-manager.mjs'
  },
  {
    oldPath: 'deleted-scripts/validate-component-exports.js',
    action: 'obsolete',
    reason: 'Component export validation is now handled by the TypeScript compiler'
  },
  {
    oldPath: 'deleted-scripts/validate-component-registry.js',
    action: 'obsolete',
    reason: 'Component registry validation is now handled by config/start-up/validate-component-registry.mjs'
  },
  {
    oldPath: 'deleted-scripts/validate-components.js',
    action: 'obsolete',
    reason: 'Component validation is now handled by scripts/ui/validate-component-paths.mjs'
  }
];

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Safely delete a file
 */
function deleteFile(filePath) {
  try {
    if (DRY_RUN) {
      info(`Would delete file: ${filePath}`);
      return true;
    }
    
    fs.unlinkSync(filePath);
    success(`Deleted file: ${filePath}`);
    return true;
  } catch (error) {
    warning(`Failed to delete file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Process the list of migrated and obsolete files
 */
function processFiles() {
  let deletedCount = 0;
  
  for (const file of MIGRATED_FILES) {
    const fullOldPath = path.join(process.cwd(), file.oldPath);
    
    if (!fileExists(fullOldPath)) {
      info(`File not found: ${file.oldPath}`);
      continue;
    }
    
    if (file.action === 'migrated') {
      const fullNewPath = path.join(process.cwd(), file.newPath);
      
      if (fileExists(fullNewPath)) {
        info(`File has been migrated: ${file.oldPath} -> ${file.newPath}`);
        if (deleteFile(fullOldPath)) {
          deletedCount++;
        }
      } else {
        warning(`Migration target does not exist: ${file.newPath}, keeping original file`);
      }
    } else if (file.action === 'obsolete') {
      info(`Removing obsolete file: ${file.oldPath} (${file.reason})`);
      if (deleteFile(fullOldPath)) {
        deletedCount++;
      }
    }
  }
  
  return deletedCount;
}

/**
 * Main function to clean up obsolete scripts
 */
async function main() {
  log(`
${colors.bold}Cleanup Obsolete Scripts${colors.reset}
${DRY_RUN ? colors.yellow + '[DRY RUN - No files will be deleted]' + colors.reset : ''}
  `);
  
  if (!fileExists(DELETED_SCRIPTS_DIR)) {
    error(`Deleted scripts directory not found: ${DELETED_SCRIPTS_DIR}`);
    process.exit(1);
  }
  
  info(`Processing files in ${DELETED_SCRIPTS_DIR}...`);
  
  const deletedCount = processFiles();
  
  if (DRY_RUN) {
    success(`Found ${deletedCount} files that would be deleted (dry run)`);
    log(`\nRun without --dry-run to actually delete files.`);
  } else {
    success(`Deleted ${deletedCount} obsolete files`);
    
    // Check if the deleted-scripts directory is now empty
    try {
      const remainingFiles = fs.readdirSync(DELETED_SCRIPTS_DIR);
      if (remainingFiles.length === 0) {
        info(`The deleted-scripts directory is now empty`);
        
        if (DRY_RUN) {
          info(`Would remove empty directory: ${DELETED_SCRIPTS_DIR}`);
        } else {
          fs.rmdirSync(DELETED_SCRIPTS_DIR);
          success(`Removed empty directory: ${DELETED_SCRIPTS_DIR}`);
        }
      } else {
        info(`${remainingFiles.length} files still remain in the deleted-scripts directory`);
      }
    } catch (err) {
      warning(`Failed to check/remove directory ${DELETED_SCRIPTS_DIR}: ${err.message}`);
    }
  }
}

main().catch(err => {
  error(`Error: ${err.message}`);
  process.exit(1);
}); 