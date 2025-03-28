#!/usr/bin/env node

/**
 * Icon System Migration to UI Directory
 * 
 * This script:
 * 1. Moves icon system files from /src/components/icons to /src/components/ui/icons
 * 2. Creates a backup of any existing files
 * 3. Manages directory structure preservation
 * 
 * Usage:
 *   node migrate-to-ui.js --dry-run  # Only show what would be done
 *   node migrate-to-ui.js --execute  # Execute the migration
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const SOURCE_DIR = path.join(process.cwd(), 'src', 'components', 'icons');
const TARGET_DIR = path.join(process.cwd(), 'src', 'components', 'ui', 'icons');
const BACKUP_DIR = path.join(process.cwd(), 'scripts', 'icons', 'ui-migration-backup', `backup-${new Date().toISOString().replace(/:/g, '-').substring(0, 19)}`);

// Command line arguments
const DRY_RUN = process.argv.includes('--dry-run');
const EXECUTE = process.argv.includes('--execute');

// Utility functions
function log(...args) {
  console.log(...args);
}

function error(...args) {
  console.error('[ERROR]', ...args);
}

function success(...args) {
  console.log('[SUCCESS]', ...args);
}

function warning(...args) {
  console.warn('[WARNING]', ...args);
}

// Ensure directory exists
function ensureDirectoryExists(dir) {
  if (DRY_RUN) {
    log(`Would create directory: ${dir}`);
    return;
  }
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    success(`Created directory: ${dir}`);
  }
}

// Copy directory recursively
function copyDirectoryRecursively(source, target) {
  // Create target directory if it doesn't exist
  ensureDirectoryExists(target);
  
  // Read source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    if (entry.isDirectory()) {
      if (DRY_RUN) {
        log(`Would copy directory: ${sourcePath} -> ${targetPath}`);
      } else {
        copyDirectoryRecursively(sourcePath, targetPath);
      }
    } else {
      if (DRY_RUN) {
        log(`Would copy file: ${sourcePath} -> ${targetPath}`);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
        success(`Copied: ${entry.name}`);
      }
    }
  }
}

// Backup existing target directory
function backupTargetDirectory() {
  if (!fs.existsSync(TARGET_DIR)) {
    log(`Target directory doesn't exist, no backup needed.`);
    return;
  }
  
  log(`Backing up existing target directory...`);
  ensureDirectoryExists(BACKUP_DIR);
  
  if (DRY_RUN) {
    log(`Would backup: ${TARGET_DIR} -> ${BACKUP_DIR}`);
  } else {
    copyDirectoryRecursively(TARGET_DIR, BACKUP_DIR);
    success(`Backed up target directory to: ${BACKUP_DIR}`);
  }
}

// Migrate files from source to target
function migrateFiles() {
  log(`Migrating icon system to UI directory...`);
  
  if (!fs.existsSync(SOURCE_DIR)) {
    error(`Source directory doesn't exist: ${SOURCE_DIR}`);
    process.exit(1);
  }
  
  // Copy files and directories
  if (DRY_RUN) {
    log(`Would migrate: ${SOURCE_DIR} -> ${TARGET_DIR}`);
  } else {
    copyDirectoryRecursively(SOURCE_DIR, TARGET_DIR);
    success(`Migrated icon system to UI directory`);
  }
}

// Update imports in codebase
function updateImports() {
  log(`Updating imports in codebase...`);
  
  const searchPattern = "@/components/icons";
  const replacePattern = "@/components/ui/icons";
  
  if (DRY_RUN) {
    log(`Would update imports from: ${searchPattern} to: ${replacePattern}`);
  } else {
    try {
      // Find all TypeScript and React files
      const files = execSync(`find src -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules"`, { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);
      
      let updatedFiles = 0;
      
      // Process each file
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Replace imports
        const updatedContent = content.replace(
          new RegExp(`from ['"]${searchPattern}`, 'g'),
          `from '${replacePattern}`
        ).replace(
          new RegExp(`from ['"]${searchPattern}/`, 'g'),
          `from '${replacePattern}/`
        );
        
        // Update file if changes were made
        if (content !== updatedContent) {
          fs.writeFileSync(file, updatedContent, 'utf8');
          success(`Updated imports in: ${file}`);
          updatedFiles++;
        }
      }
      
      log(`Updated imports in ${updatedFiles} files`);
    } catch (err) {
      error(`Failed to update imports: ${err.message}`);
    }
  }
}

// Main function
function main() {
  if (!DRY_RUN && !EXECUTE) {
    error('Please specify one of: --dry-run or --execute');
    log('Usage:');
    log('  node migrate-to-ui.js --dry-run  # Only show what would be done');
    log('  node migrate-to-ui.js --execute  # Execute the migration');
    process.exit(1);
  }
  
  log(`🚀 Starting icon system migration to UI directory${DRY_RUN ? ' (dry run)' : ''}...`);
  
  // 1. Backup existing target directory
  backupTargetDirectory();
  
  // 2. Migrate files from source to target
  migrateFiles();
  
  // 3. Update imports in codebase
  updateImports();
  
  log('Done!');
}

// Run the script
main(); 