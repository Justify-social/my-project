#!/usr/bin/env node

/**
 * Backup and Remove Deprecated Icon Files
 * 
 * This script:
 * 1. Creates a dated backup of the old icon system files
 * 2. Moves deprecated files to the backup directory
 * 3. Optionally removes the files from the original location
 * 
 * Usage:
 *   node backup-icon-files.js --dry-run  # Only show what would be done
 *   node backup-icon-files.js --backup   # Only backup files, don't remove
 *   node backup-icon-files.js --remove   # Backup and remove files
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const SOURCE_DIR = path.join(process.cwd(), 'src', 'components', 'ui', 'icons');
const BACKUP_DIR = path.join(process.cwd(), 'scripts', 'icons', 'old-system-backup', `backup-${new Date().toISOString().replace(/:/g, '-').substring(0, 19)}`);

// Flags
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_ONLY = process.argv.includes('--backup');
const REMOVE = process.argv.includes('--remove');

// List of files to backup and potentially remove
const DEPRECATED_FILES = [
  'icon-data.ts',
  'fix-icon-mappings.ts',
  'icon-wrapper.tsx',
  'icon.tsx',
  'IconMapping.ts',
  'IconConfig.ts',
  'safe-icon.tsx',
  'custom-icon-display.tsx',
  'SvgIcon.tsx',
  'IconVariants.tsx',
  'LocalIcon.tsx',
  'validation.ts',
  'icon-mappings.ts',
  // Keep index.ts as it's the compatibility layer
  // 'index.ts',
  // Keep README.md for documentation purposes
  // 'README.md'
];

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

// Create backup directory
function createBackupDir() {
  if (DRY_RUN) {
    log(`Would create backup directory: ${BACKUP_DIR}`);
    return;
  }
  
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  success(`Created backup directory: ${BACKUP_DIR}`);
}

// Backup files
function backupFiles() {
  log('Backing up deprecated files...');
  
  let filesBackedUp = 0;
  
  for (const file of DEPRECATED_FILES) {
    const sourcePath = path.join(SOURCE_DIR, file);
    const targetPath = path.join(BACKUP_DIR, file);
    
    if (!fs.existsSync(sourcePath)) {
      warning(`File does not exist: ${sourcePath}`);
      continue;
    }
    
    if (DRY_RUN) {
      log(`Would copy: ${sourcePath} -> ${targetPath}`);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
      success(`Backed up: ${file}`);
      filesBackedUp++;
    }
  }
  
  log(`${DRY_RUN ? 'Would back up' : 'Backed up'} ${filesBackedUp} files`);
}

// Remove files
function removeFiles() {
  if (BACKUP_ONLY || DRY_RUN) {
    if (BACKUP_ONLY) {
      log('Backup-only mode, not removing any files');
    } else {
      log('Dry run mode, would remove these files:');
      DEPRECATED_FILES.forEach(file => {
        const sourcePath = path.join(SOURCE_DIR, file);
        if (fs.existsSync(sourcePath)) {
          log(`  - ${file}`);
        }
      });
    }
    return;
  }
  
  log('Removing deprecated files...');
  
  let filesRemoved = 0;
  
  for (const file of DEPRECATED_FILES) {
    const sourcePath = path.join(SOURCE_DIR, file);
    
    if (!fs.existsSync(sourcePath)) {
      warning(`File does not exist: ${sourcePath}`);
      continue;
    }
    
    fs.unlinkSync(sourcePath);
    success(`Removed: ${file}`);
    filesRemoved++;
  }
  
  log(`Removed ${filesRemoved} files`);
}

// Main function
function main() {
  if (!DRY_RUN && !BACKUP_ONLY && !REMOVE) {
    error('Please specify one of: --dry-run, --backup, or --remove');
    log('Usage:');
    log('  node backup-icon-files.js --dry-run  # Only show what would be done');
    log('  node backup-icon-files.js --backup   # Only backup files, don\'t remove');
    log('  node backup-icon-files.js --remove   # Backup and remove files');
    process.exit(1);
  }
  
  // Create backup directory
  createBackupDir();
  
  // Backup files
  backupFiles();
  
  // Remove files if requested
  if (REMOVE) {
    removeFiles();
  }
  
  log('Done!');
}

// Run the script
main();
