#!/usr/bin/env node

/**
 * Backup Cleanup Utility
 * 
 * This script removes backup directories and archives that are no longer needed.
 * 
 * Usage:
 *   node scripts/cleanup-backups.mjs --dry-run  # Preview what will be removed
 *   node scripts/cleanup-backups.mjs            # Actually remove the directories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Process arguments
const DRY_RUN = process.argv.includes('--dry-run');
const ARCHIVE = process.argv.includes('--archive');

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

// Directories to clean up
const BACKUP_DIRS = [
  // Temporary files
  'temp',
  
  // Backup archives 
  'deleted-files-archive-2025-04-01T17-35-55-113Z',
  
  // Component backups
  'backup-components',
  'backup-components/ui-pre-shadcn-2025-04-01T16-00-46-214Z',
  
  // Content backups
  'backup-content',
];

// Keep track of what was removed
let dirsRemoved = 0;
let filesRemoved = 0;
let filesSaved = 0;
let errors = 0;

// Function to count files in a directory recursively
function countFiles(directory) {
  let count = 0;
  
  function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        traverse(fullPath);
      } else if (stats.isFile()) {
        count++;
      }
    }
  }
  
  traverse(path.join(ROOT_DIR, directory));
  return count;
}

// Create the archive directory if needed
function createArchiveDir() {
  const archiveDir = path.join(ROOT_DIR, 'archives');
  
  if (!fs.existsSync(archiveDir)) {
    if (!DRY_RUN) {
      try {
        fs.mkdirSync(archiveDir, { recursive: true });
        success(`Created archive directory: archives/`);
      } catch (err) {
        error(`Failed to create archive directory: ${err.message}`);
        return null;
      }
    } else {
      warning(`[DRY RUN] Would create archive directory: archives/`);
    }
  }
  
  return archiveDir;
}

// Archive a directory instead of deleting it
function archiveDirectory(directory) {
  const archiveDir = createArchiveDir();
  if (!archiveDir) return false;
  
  const dirName = path.basename(directory);
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const archiveName = `${dirName}-${timestamp}.tar.gz`;
  const fullArchivePath = path.join(archiveDir, archiveName);
  
  if (DRY_RUN) {
    warning(`[DRY RUN] Would archive ${directory} to archives/${archiveName}`);
    return true;
  }
  
  try {
    // Create tar archive
    const result = spawnSync('tar', [
      '-czf', 
      fullArchivePath, 
      '-C', 
      ROOT_DIR, 
      directory
    ]);
    
    if (result.status !== 0) {
      error(`Failed to archive ${directory}: ${result.stderr.toString()}`);
      return false;
    }
    
    success(`Archived ${directory} to archives/${archiveName}`);
    return true;
  } catch (err) {
    error(`Failed to archive ${directory}: ${err.message}`);
    return false;
  }
}

// Remove a directory
function removeDirectory(directory) {
  const fullPath = path.join(ROOT_DIR, directory);
  
  if (!fs.existsSync(fullPath)) {
    warning(`Directory not found: ${directory}`);
    return true;
  }
  
  // Count files before removal
  const fileCount = countFiles(directory);
  
  if (ARCHIVE) {
    if (archiveDirectory(directory)) {
      filesSaved += fileCount;
    } else {
      error(`Failed to archive ${directory}`);
      return false;
    }
  }
  
  if (DRY_RUN) {
    warning(`[DRY RUN] Would remove directory: ${directory} (${fileCount} files)`);
    filesRemoved += fileCount;
    dirsRemoved++;
    return true;
  }
  
  try {
    fs.rmSync(fullPath, { recursive: true, force: true });
    success(`Removed directory: ${directory} (${fileCount} files)`);
    filesRemoved += fileCount;
    dirsRemoved++;
    return true;
  } catch (err) {
    error(`Failed to remove ${directory}: ${err.message}`);
    errors++;
    return false;
  }
}

// Keep the unit test directory
function isTestDirectory(directory) {
  return directory === 'tests';
}

// Main function
async function main() {
  console.log(`\n${colors.bold}${colors.cyan}Backup Cleanup Utility${colors.reset}`);
  console.log(`${colors.cyan}======================${colors.reset}\n`);
  
  if (DRY_RUN) {
    warning('Running in DRY RUN mode - no files will be removed');
  }
  
  if (ARCHIVE) {
    info('Archive mode enabled - directories will be archived before removal');
  }
  
  // Check each backup directory
  for (const dir of BACKUP_DIRS) {
    if (isTestDirectory(dir)) {
      info(`Skipping test directory: ${dir}`);
      continue;
    }
    
    const fullPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullPath)) {
      const fileCount = countFiles(dir);
      info(`Found backup directory: ${dir} (${fileCount} files)`);
    } else {
      warning(`Directory not found: ${dir}`);
    }
  }
  
  // Confirm removal if not in dry run mode
  if (!DRY_RUN) {
    console.log(`\n${colors.bold}${colors.red}WARNING:${colors.reset} This will permanently remove backup directories`);
    if (ARCHIVE) {
      console.log(`Directories will be archived to 'archives/' before removal`);
    } else {
      console.log(`To create archives before removal, run with --archive flag`);
    }
    console.log('Press CTRL+C to abort or ENTER to continue...');
    
    // Add a simple wait for user confirmation
    await new Promise(resolve => {
      process.stdin.resume();
      process.stdin.on('data', data => {
        process.stdin.pause();
        resolve();
      });
    });
  }
  
  console.log(`\n${colors.bold}Removing backup directories...${colors.reset}`);
  
  // Remove each backup directory
  for (const dir of BACKUP_DIRS) {
    if (isTestDirectory(dir)) continue;
    
    const fullPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullPath)) {
      removeDirectory(dir);
    }
  }
  
  // Results
  console.log(`\n${colors.bold}${colors.green}Cleanup Results:${colors.reset}`);
  if (DRY_RUN) {
    console.log(`- Would remove: ${dirsRemoved} directories containing ${filesRemoved} files`);
  } else {
    console.log(`- Removed: ${dirsRemoved} directories containing ${filesRemoved} files`);
  }
  
  if (ARCHIVE) {
    console.log(`- Archived: ${filesSaved} files`);
  }
  
  if (errors > 0) {
    console.log(`- Errors: ${errors}`);
  }
  
  if (DRY_RUN) {
    console.log(`\n${colors.bold}To actually remove these directories, run the script without --dry-run${colors.reset}`);
    if (!ARCHIVE) {
      console.log(`To archive before removing, add --archive flag`);
    }
  }
}

// Run the main function
main().catch(err => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 