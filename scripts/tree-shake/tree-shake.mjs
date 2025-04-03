#!/usr/bin/env node

/**
 * Tree Shake - Aggressively identifies and removes deprecated files
 * 
 * This script performs an aggressive tree shake of the project:
 * 1. Identifies files that might be deprecated
 * 2. Runs various checks to confirm deprecation status
 * 3. Creates backups of files before removal
 * 4. Removes confirmed deprecated files
 * 
 * Usage:
 *   node scripts/cleanup/tree-shake.mjs [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run     Show what would be removed without making changes
 *   --verbose     Show detailed information during processing
 *   --force       Skip confirmation prompts (use with caution)
 *   --no-backup   Skip creating backups (not recommended)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createInterface } from 'readline';

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  force: process.argv.includes('--force'),
  noBackup: process.argv.includes('--no-backup'),
  backupDir: path.resolve(process.cwd(), 'archives', `tree-shake-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`),
};

// Patterns for identifying potentially deprecated files
const deprecatedPatterns = [
  // Duplicate scripts with different extensions
  { type: 'duplicate', pattern: /\.(js|cjs)$/, preferredExt: '.mjs', locations: ['scripts'] },
  
  // Legacy files known to be deprecated
  { type: 'legacy', pattern: /setup-components\.js$/, locations: ['.'] },
  
  // Files replaced by new structure
  { type: 'structure', pattern: /validate-component-registry\.js$/, locations: ['scripts'] },
  
  // Old script backups
  { type: 'backup', pattern: /\.(old|bak|backup)$/, locations: ['scripts'] },
  
  // Temporary files
  { type: 'temp', pattern: /\.(tmp|temp)$/, locations: ['scripts', 'src'] },
];

// Files to check for references before removal
const checkForReferences = [
  'package.json',
  'scripts/README.md',
  '.github/workflows',
];

// Setup readline interface for user confirmation
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Stats tracking
const stats = {
  identified: 0,
  confirmed: 0,
  backed_up: 0,
  removed: 0,
  skipped: 0,
};

/**
 * Log a message if verbose mode is enabled
 */
function verboseLog(message) {
  if (config.verbose) {
    console.log(`[VERBOSE] ${message}`);
  }
}

/**
 * Create a backup of a file before removal
 */
async function backupFile(filePath) {
  if (config.noBackup) {
    verboseLog(`Skipping backup for ${filePath} (--no-backup)`);
    return true;
  }
  
  try {
    const relativePath = path.relative(process.cwd(), filePath);
    const backupPath = path.join(config.backupDir, relativePath);
    const backupDir = path.dirname(backupPath);
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Copy file to backup
    fs.copyFileSync(filePath, backupPath);
    verboseLog(`Backed up ${filePath} to ${backupPath}`);
    stats.backed_up++;
    return true;
  } catch (error) {
    console.error(`Error backing up ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Check if a file is referenced in important project files
 */
async function checkReferences(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const fileBasename = path.basename(filePath);
  
  for (const checkPath of checkForReferences) {
    try {
      // For directories, grep recursively
      if (fs.statSync(checkPath).isDirectory()) {
        try {
          const result = execSync(`grep -r "${fileBasename}" ${checkPath}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
          if (result) {
            verboseLog(`Found reference to ${fileBasename} in ${checkPath}`);
            return true;
          }
        } catch (e) {
          // grep returns non-zero exit code if no matches found
          verboseLog(`No references to ${fileBasename} found in ${checkPath}`);
        }
      } else {
        // For files, read and check
        const content = fs.readFileSync(checkPath, 'utf8');
        if (content.includes(fileBasename)) {
          verboseLog(`Found reference to ${fileBasename} in ${checkPath}`);
          return true;
        }
      }
    } catch (error) {
      verboseLog(`Error checking references in ${checkPath}: ${error.message}`);
    }
  }
  
  verboseLog(`No references found for ${filePath}`);
  return false;
}

/**
 * Scan for potentially deprecated files matching patterns
 */
async function scanForDeprecatedFiles() {
  const deprecatedFiles = [];
  
  for (const { type, pattern, preferredExt, locations } of deprecatedPatterns) {
    for (const location of locations) {
      try {
        // Get files matching the pattern
        const files = findFilesMatchingPattern(location, pattern);
        
        for (const file of files) {
          if (type === 'duplicate' && preferredExt) {
            // Check if there's a preferred extension version
            const preferredFile = file.replace(pattern, preferredExt);
            if (fs.existsSync(preferredFile)) {
              deprecatedFiles.push({ path: file, type, reason: `Duplicate of ${preferredFile}` });
              stats.identified++;
            }
          } else {
            // Other types of deprecated files
            deprecatedFiles.push({ path: file, type, reason: `Matches ${type} pattern` });
            stats.identified++;
          }
        }
      } catch (error) {
        console.error(`Error scanning ${location} for ${pattern}: ${error.message}`);
      }
    }
  }
  
  return deprecatedFiles;
}

/**
 * Find files matching a pattern in a directory
 */
function findFilesMatchingPattern(dir, pattern) {
  const results = [];
  
  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules
        if (entry.name === 'node_modules') continue;
        traverse(entryPath);
      } else if (entry.name.match(pattern)) {
        results.push(entryPath);
      }
    }
  }
  
  traverse(dir);
  return results;
}

/**
 * Confirm with the user before removing files
 */
function confirmRemoval(files) {
  return new Promise((resolve) => {
    if (config.force) {
      resolve(true);
      return;
    }
    
    console.log('\nThe following files will be removed:');
    for (const { path, reason } of files) {
      console.log(`  - ${path} (${reason})`);
    }
    
    rl.question('\nProceed with removal? (y/N) ', (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Remove a file from the filesystem
 */
async function removeFile(filePath) {
  if (config.dryRun) {
    console.log(`[DRY RUN] Would remove: ${filePath}`);
    stats.confirmed++;
    return true;
  }
  
  try {
    // Backup file first
    if (!config.noBackup) {
      const backupSuccess = await backupFile(filePath);
      if (!backupSuccess) {
        console.warn(`Skipping removal of ${filePath} due to backup failure`);
        stats.skipped++;
        return false;
      }
    }
    
    // Remove the file
    fs.unlinkSync(filePath);
    console.log(`Removed: ${filePath}`);
    stats.removed++;
    return true;
  } catch (error) {
    console.error(`Error removing ${filePath}: ${error.message}`);
    stats.skipped++;
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('Tree Shake - Aggressively identifying and removing deprecated files');
  console.log('--------------------------------------------------------------');
  
  if (config.dryRun) {
    console.log('DRY RUN MODE: No files will be removed');
  }
  
  console.log('Scanning for deprecated files...');
  const deprecatedFiles = await scanForDeprecatedFiles();
  
  if (deprecatedFiles.length === 0) {
    console.log('No deprecated files found!');
    rl.close();
    return;
  }
  
  console.log(`\nFound ${deprecatedFiles.length} potentially deprecated files`);
  
  // Check for references
  console.log('Checking for references to these files...');
  const confirmedDeprecated = [];
  
  for (const file of deprecatedFiles) {
    const hasReferences = await checkReferences(file.path);
    if (!hasReferences) {
      confirmedDeprecated.push(file);
    } else {
      verboseLog(`Skipping ${file.path} because it has references`);
      stats.skipped++;
    }
  }
  
  if (confirmedDeprecated.length === 0) {
    console.log('No confirmed deprecated files found!');
    rl.close();
    return;
  }
  
  // Get user confirmation
  const confirmed = await confirmRemoval(confirmedDeprecated);
  
  if (!confirmed) {
    console.log('Operation cancelled by user');
    rl.close();
    return;
  }
  
  // Remove files
  console.log('\nRemoving deprecated files...');
  
  if (!config.noBackup && !config.dryRun) {
    console.log(`Creating backups in ${config.backupDir}`);
    fs.mkdirSync(config.backupDir, { recursive: true });
  }
  
  for (const file of confirmedDeprecated) {
    await removeFile(file.path);
  }
  
  // Print summary
  console.log('\nTree Shake Summary:');
  console.log('------------------');
  console.log(`Identified: ${stats.identified} potentially deprecated files`);
  console.log(`Confirmed: ${stats.confirmed} files as deprecated`);
  console.log(`Backed up: ${stats.backed_up} files`);
  console.log(`Removed: ${stats.removed} files`);
  console.log(`Skipped: ${stats.skipped} files`);
  
  rl.close();
}

// Execute main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 