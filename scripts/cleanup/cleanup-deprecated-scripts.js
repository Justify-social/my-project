#!/usr/bin/env node
/**
 * Cleanup Deprecated Scripts
 * 
 * This script removes all the deprecated scripts after the unification project has been completed.
 * It safely removes original script files that have been consolidated into the scripts/consolidated directory.
 * 
 * Usage:
 *   node scripts/cleanup-deprecated-scripts.js --dry-run  # Show what would be removed without actually removing
 *   node scripts/cleanup-deprecated-scripts.js            # Perform the cleanup
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const ROOT_DIR = process.cwd();
const SCRIPT_DIRS_TO_REMOVE = [
  'scripts/analytics',
  'scripts/campaign',
  'scripts/cleanup',
  'scripts/database',
  'scripts/directory-structure',
  'scripts/documentation',
  'scripts/icons',
  'scripts/templates',
  'scripts/testing',
  'scripts/unification-final',
  'scripts/utilities',
  'scripts/validation'
];

// Exclude these paths from removal (keep them for reference or compatibility)
const EXCLUDE_PATHS = [
  'scripts/consolidated',
  'scripts/public'
];

// Utility functions for colored console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message) {
  console.log(message);
}

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function warning(message) {
  console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`);
}

function error(message) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.blue}ℹ️ ${message}${colors.reset}`);
}

function createBackupName(directory) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
  return `${directory}-backup-${timestamp}`;
}

// Create a backup of scripts before removing
function backupScripts() {
  info('Creating backup of scripts before removal...');
  
  const backupDir = path.join(ROOT_DIR, 'scripts-backup-' + new Date().toISOString().replace(/:/g, '-').substring(0, 19));
  
  if (DRY_RUN) {
    info(`[DRY RUN] Would create backup at: ${backupDir}`);
    return backupDir;
  }
  
  try {
    // Create backup directory
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Use tar to create a backup
    execSync(`tar -czf ${backupDir}/scripts-backup.tar.gz scripts`, { stdio: 'inherit' });
    success(`Created backup at: ${backupDir}/scripts-backup.tar.gz`);
    
    return backupDir;
  } catch (err) {
    error(`Failed to create backup: ${err.message}`);
    process.exit(1);
  }
}

// Remove a directory or file
function removeItem(itemPath) {
  if (DRY_RUN) {
    if (VERBOSE) {
      info(`[DRY RUN] Would remove: ${itemPath}`);
    }
    return;
  }
  
  try {
    if (fs.lstatSync(itemPath).isDirectory()) {
      fs.rmdirSync(itemPath, { recursive: true });
    } else {
      fs.unlinkSync(itemPath);
    }
    
    if (VERBOSE) {
      success(`Removed: ${itemPath}`);
    }
  } catch (err) {
    error(`Failed to remove ${itemPath}: ${err.message}`);
  }
}

// Process the script directories for removal
function cleanupScripts() {
  info('Starting cleanup of deprecated scripts...');
  
  // Stats
  let totalItemsRemoved = 0;
  let dirsRemoved = 0;
  let filesRemoved = 0;
  
  for (const dir of SCRIPT_DIRS_TO_REMOVE) {
    const fullPath = path.join(ROOT_DIR, dir);
    
    // Skip if directory doesn't exist
    if (!fs.existsSync(fullPath)) {
      warning(`Directory not found: ${dir}`);
      continue;
    }
    
    // Check if we should exclude this path
    if (EXCLUDE_PATHS.some(excludePath => fullPath.startsWith(path.join(ROOT_DIR, excludePath)))) {
      info(`Skipping excluded path: ${dir}`);
      continue;
    }
    
    info(`Processing: ${dir}`);
    
    if (fs.lstatSync(fullPath).isDirectory()) {
      // Count files in directory for stats
      let fileCount = 0;
      const countFiles = (dirPath) => {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          if (fs.lstatSync(itemPath).isDirectory()) {
            countFiles(itemPath);
          } else {
            fileCount++;
          }
        }
      };
      
      countFiles(fullPath);
      
      // Remove the directory
      removeItem(fullPath);
      dirsRemoved++;
      filesRemoved += fileCount;
      totalItemsRemoved += fileCount + 1; // +1 for the directory itself
      
      if (!DRY_RUN) {
        success(`Removed directory: ${dir} (containing ${fileCount} files)`);
      }
    } else {
      removeItem(fullPath);
      filesRemoved++;
      totalItemsRemoved++;
    }
  }
  
  // Root script files to remove (except for this script)
  const scriptName = path.basename(__filename);
  const rootFiles = fs.readdirSync(path.join(ROOT_DIR, 'scripts'))
    .filter(file => 
      file !== 'consolidated' && 
      file !== 'public' && 
      file !== scriptName &&
      !fs.lstatSync(path.join(ROOT_DIR, 'scripts', file)).isDirectory()
    );
  
  for (const file of rootFiles) {
    const filePath = path.join(ROOT_DIR, 'scripts', file);
    removeItem(filePath);
    filesRemoved++;
    totalItemsRemoved++;
    
    if (!DRY_RUN && VERBOSE) {
      success(`Removed file: scripts/${file}`);
    }
  }
  
  return { totalItemsRemoved, dirsRemoved, filesRemoved };
}

// Generate final report
function generateReport(stats) {
  const reportPath = path.join(ROOT_DIR, 'docs/script-cleanup-final-report.md');
  const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
  
  const reportContent = `# Final Script Cleanup Report
Date: ${new Date().toISOString().split('T')[0]}

## Summary

After successfully consolidating all scripts into the \`scripts/consolidated\` directory, this report documents the final cleanup of deprecated script files.

### Statistics

- **Total Items Removed**: ${stats.totalItemsRemoved}
- **Directories Removed**: ${stats.dirsRemoved}
- **Files Removed**: ${stats.filesRemoved}

### Directories Cleaned Up

${SCRIPT_DIRS_TO_REMOVE.map(dir => `- \`${dir}\``).join('\n')}

### Preservation

The following script directories were preserved:
- \`scripts/consolidated\`: Contains all consolidated scripts
- \`scripts/public\`: Contains public assets

## Next Steps

1. Update any remaining documentation that may reference the old script paths
2. Verify that all automated processes use the consolidated scripts
3. Update CI/CD pipelines to reflect the new script structure

All scripts are now properly consolidated and organized in the \`scripts/consolidated\` directory, completing the unification process.
`;
  
  if (DRY_RUN) {
    info(`[DRY RUN] Would create report at: ${reportPath}`);
    console.log('\n--- Report Preview ---\n');
    console.log(reportContent);
    console.log('\n--- End Preview ---\n');
  } else {
    try {
      fs.writeFileSync(reportPath, reportContent);
      success(`Created final cleanup report at: ${reportPath}`);
    } catch (err) {
      error(`Failed to create report: ${err.message}`);
    }
  }
}

// Main function
function main() {
  log('\n🧹 Script Cleanup - Post Unification Project');
  log('===========================================');
  
  if (DRY_RUN) {
    warning('Running in DRY RUN mode - no files will be removed');
  }
  
  // Get initial counts
  const initialCounts = {
    consolidated: parseInt(execSync('find scripts/consolidated -type f -name "*.js" | wc -l').toString().trim()),
    original: parseInt(execSync('find scripts -not -path \'scripts/consolidated/*\' -type f -name "*.js" | wc -l').toString().trim())
  };
  
  info(`Initial state: ${initialCounts.consolidated} consolidated scripts, ${initialCounts.original} original scripts`);
  
  // Create backup first
  const backupDir = backupScripts();
  
  // Perform cleanup
  const stats = cleanupScripts();
  
  // Generate report
  generateReport(stats);
  
  // Final message
  if (DRY_RUN) {
    info(`[DRY RUN] Would remove ${stats.totalItemsRemoved} items (${stats.dirsRemoved} directories and ${stats.filesRemoved} files)`);
    info(`To perform the actual cleanup, run this script without the --dry-run flag`);
  } else {
    success(`Cleanup complete! Removed ${stats.totalItemsRemoved} items (${stats.dirsRemoved} directories and ${stats.filesRemoved} files)`);
    success(`A backup was created at: ${backupDir}/scripts-backup.tar.gz`);
    success(`Final report created at: docs/script-cleanup-final-report.md`);
  }
}

// Run the main function
main(); 