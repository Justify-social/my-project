#!/usr/bin/env node

/**
 * verify-no-backups.js
 * 
 * This script performs a thorough examination of the codebase to verify
 * that all backup, temporary, and cached files have been properly removed
 * during the unification process.
 * 
 * It searches for:
 * 1. Common backup file extensions (.bak, .backup, .old, .tmp, etc.)
 * 2. Directories with backup/temp in their names
 * 3. Temporary built files that should be gitignored
 * 4. Any other remnants that could indicate incomplete cleanup
 * 
 * Usage:
 *   node verify-no-backups.js [--fix] [--verbose]
 * 
 * Options:
 *   --fix       Attempt to automatically remove detected backup files (use with caution)
 *   --verbose   Show detailed output during scan
 *   --dry-run   Show what would be done without actually doing it
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  // Add legitimate/intentional directories with 'backup'/'temp' in name that should be preserved
  // For example APIs or components where the name legitimately has 'temp' in it
  'src/app/(campaigns)/campaigns/[id]/backup',  // Legitimate backup feature directory
  'src/app/template.tsx',                        // Template file, not a backup
  'docs/templates',                             // Templates directory, not backup files
  'backup-content',                            // Legitimate content backup directory
  'BUILD/settings/backup',                     // Legitimate build settings
];

// File patterns to identify as backups
const BACKUP_FILE_PATTERNS = [
  /\.bak$/i,
  /\.backup$/i,
  /\.old$/i,
  /\.tmp$/i,
  /\.temp$/i,
  /~$/,
  /-backup$/i,
  /backup_/i,
  /\.swp$/i,
  /\.orig$/i
];

// Directories suspected to be backups
const BACKUP_DIR_PATTERNS = [
  /backup/i,
  /\.backup/i,
  /\.bak/i,
  /\.old/i,
  /temp/i,
  /tmp/i,
  /\.tmp/i,
  /\.temp/i,
  /saved/i
];

// Legitimate exception patterns - when a file or directory contains backup/temp but is actually needed
const LEGITIMATE_EXCEPTIONS = [
  // Files with 'backup' or 'temp' that are legitimate parts of the app
  /src\/app\/\(dashboard\)\/dashboard\/DashboardContent\.tsx$/,  // Contains temp- prefix for IDs
  /src\/app\/api\/uploadthing\/core\.ts$/,                     // Contains temp-id for valid reason
  /scripts\/consolidated\/utils\/backup-icon-files\.js$/,       // Legitimate backup utility script
  /scripts\/consolidated\/utils\/find-backups\.js$/,            // Legitimate backup finder utility
  /scripts\/consolidated\/utils\/cleanup-backups\.js$/,         // Legitimate backup cleanup utility
  /scripts\/consolidated\/utils\/remove-backups\.js$/,          // Legitimate backup removal utility
  /scripts\/consolidated\/utils\/verify-no-backups\.js$/,       // This script
  
  // Documentation files about backups that are legitimate
  /docs\/project-history\/unification-project\/reports\/backup-cleanup\.md$/,
  /docs\/project-history\/unification-project\/reports\/backup-files-manifest\.md$/,
  
  // Legitimate application directories that contain backup in name
  /src\/app\/\(campaigns\)\/campaigns\/\[id\]\/backup$/,       // Legitimate backup feature directory
  /backup-content$/,                                          // Legitimate content backup directory
  /BUILD\/settings\/backup/,                                 // Legitimate build settings
  
  // Script reports that mention backups
  /scripts\/consolidated\/scripts-consolidation-report\.md$/
];

// Initialize CLI arguments
const DRY_RUN = process.argv.includes('--dry-run');
const FIX_MODE = process.argv.includes('--fix');
const VERBOSE = process.argv.includes('--verbose');

// Counters for reporting
const stats = {
  scannedFiles: 0,
  scannedDirs: 0,
  suspiciousFiles: 0,
  suspiciousDirs: 0,
  legitimateExceptions: 0,
  removedFiles: 0,
  removedDirs: 0,
  removeFailedFiles: 0,
  removeFailedDirs: 0
};

// Log styling
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

// Output management
const log = (message) => console.log(message);
const success = (message) => console.log(`${colors.green}${message}${colors.reset}`);
const info = (message) => console.log(`${colors.blue}${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}${message}${colors.reset}`);
const verbose = (message) => if (VERBOSE) console.log(`${colors.cyan}${message}${colors.reset}`);

// Data collection for report
const suspiciousFilesFound = [];
const suspiciousDirectoriesFound = [];
const legitimateExceptionsFound = [];
const filesRemoved = [];
const directoriesRemoved = [];
const removalFailures = [];

/**
 * Helper: Check if a path should be ignored
 */
function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * Helper: Check if a file is a legitimate exception
 */
function isLegitimateException(filePath) {
  return LEGITIMATE_EXCEPTIONS.some(pattern => pattern.test(filePath));
}

/**
 * Helper: Check if a file matches backup patterns
 */
function isBackupFile(fileName) {
  return BACKUP_FILE_PATTERNS.some(pattern => pattern.test(fileName));
}

/**
 * Helper: Check if a directory matches backup patterns
 */
function isBackupDirectory(dirName) {
  return BACKUP_DIR_PATTERNS.some(pattern => pattern.test(dirName));
}

/**
 * Helper: Safely remove a file
 */
function safelyRemoveFile(filePath) {
  if (DRY_RUN) {
    info(`Would remove file: ${filePath}`);
    return true;
  }
  
  try {
    fs.unlinkSync(filePath);
    filesRemoved.push(filePath);
    stats.removedFiles++;
    return true;
  } catch (err) {
    removalFailures.push({ path: filePath, error: err.message });
    stats.removeFailedFiles++;
    return false;
  }
}

/**
 * Helper: Safely remove a directory
 */
function safelyRemoveDirectory(dirPath) {
  if (DRY_RUN) {
    info(`Would remove directory: ${dirPath}`);
    return true;
  }
  
  try {
    fs.rmdirSync(dirPath, { recursive: true });
    directoriesRemoved.push(dirPath);
    stats.removedDirs++;
    return true;
  } catch (err) {
    removalFailures.push({ path: dirPath, error: err.message });
    stats.removeFailedDirs++;
    return false;
  }
}

/**
 * Main function to scan the entire codebase
 */
function scanCodebase(baseDir) {
  info(`Starting deep scan of the codebase for backup files and directories...`);
  info(`Scan configuration: ${DRY_RUN ? '(Dry run) ' : ''}${FIX_MODE ? '(Fix mode) ' : ''}${VERBOSE ? '(Verbose) ' : ''}`);
  
  verbose(`Base directory: ${baseDir}`);
  
  // Use a more focused approach with find command for performance
  findBackupFilesWithCommand();
  
  // Traditional recursive method for more detailed control
  scanDirectory(baseDir);
  
  // Custom check for scripts backup from our cleanup process
  checkScriptsBackup();
  
  // Generate the report
  generateReport();
}

/**
 * Use system find command for faster scanning
 */
function findBackupFilesWithCommand() {
  try {
    // Find backup files
    verbose(`Running system find command to locate backup files...`);
    const ignorePatterns = IGNORE_PATTERNS.map(p => `-not -path "*/${p}/*"`).join(' ');
    
    // Find backup files
    const backupFilesCommand = `find . -type f \\( -name "*.bak" -o -name "*.backup" -o -name "*.old" -o -name "*.tmp" -o -name "*~" \\) ${ignorePatterns}`;
    const backupFiles = execSync(backupFilesCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    
    // Find backup directories
    const backupDirsCommand = `find . -type d \\( -name "*backup*" -o -name "*temp*" -o -name "*tmp*" \\) ${ignorePatterns}`;
    const backupDirs = execSync(backupDirsCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    
    // Process files
    for (const file of backupFiles) {
      if (isLegitimateException(file)) {
        legitimateExceptionsFound.push({ path: file, type: 'file' });
        stats.legitimateExceptions++;
        verbose(`Legitimate exception (file): ${file}`);
      } else {
        suspiciousFilesFound.push(file);
        stats.suspiciousFiles++;
        warning(`Found suspicious backup file: ${file}`);
        
        if (FIX_MODE) {
          if (safelyRemoveFile(file)) {
            success(`Removed backup file: ${file}`);
          } else {
            error(`Failed to remove backup file: ${file}`);
          }
        }
      }
    }
    
    // Process directories 
    for (const dir of backupDirs) {
      if (shouldIgnore(dir) || isLegitimateException(dir)) {
        legitimateExceptionsFound.push({ path: dir, type: 'directory' });
        stats.legitimateExceptions++;
        verbose(`Legitimate exception (directory): ${dir}`);
      } else {
        suspiciousDirectoriesFound.push(dir);
        stats.suspiciousDirs++;
        warning(`Found suspicious backup directory: ${dir}`);
        
        if (FIX_MODE) {
          if (safelyRemoveDirectory(dir)) {
            success(`Removed backup directory: ${dir}`);
          } else {
            error(`Failed to remove backup directory: ${dir}`);
          }
        }
      }
    }
    
  } catch (err) {
    error(`Error executing find command: ${err.message}`);
    verbose(`Falling back to manual scan...`);
  }
}

/**
 * Recursively scan a directory
 */
function scanDirectory(dirPath) {
  if (shouldIgnore(dirPath)) {
    verbose(`Skipping ignored directory: ${dirPath}`);
    return;
  }
  
  stats.scannedDirs++;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Check if the directory itself appears to be a backup
        const dirName = path.basename(fullPath);
        if (isBackupDirectory(dirName) && !isLegitimateException(fullPath)) {
          suspiciousDirectoriesFound.push(fullPath);
          stats.suspiciousDirs++;
          warning(`Found suspicious backup directory: ${fullPath}`);
          
          if (FIX_MODE) {
            if (safelyRemoveDirectory(fullPath)) {
              success(`Removed backup directory: ${fullPath}`);
            } else {
              error(`Failed to remove backup directory: ${fullPath}`);
            }
          }
        } else {
          // Continue scanning recursively
          scanDirectory(fullPath);
        }
      } else if (stats.isFile()) {
        stats.scannedFiles++;
        
        // Check if the file appears to be a backup
        const fileName = path.basename(fullPath);
        if (isBackupFile(fileName) && !isLegitimateException(fullPath)) {
          suspiciousFilesFound.push(fullPath);
          stats.suspiciousFiles++;
          warning(`Found suspicious backup file: ${fullPath}`);
          
          if (FIX_MODE) {
            if (safelyRemoveFile(fullPath)) {
              success(`Removed backup file: ${fullPath}`);
            } else {
              error(`Failed to remove backup file: ${fullPath}`);
            }
          }
        }
      }
    }
  } catch (err) {
    error(`Error scanning directory ${dirPath}: ${err.message}`);
  }
}

/**
 * Specific check for the scripts backup from our cleanup process
 */
function checkScriptsBackup() {
  const scriptBackups = [
    'scripts-backup-2025-03-27T11-59-22'
  ];
  
  for (const backupDir of scriptBackups) {
    const fullPath = path.join(process.cwd(), backupDir);
    if (fs.existsSync(fullPath)) {
      warning(`Found scripts backup directory: ${fullPath}`);
      
      if (FIX_MODE) {
        if (safelyRemoveDirectory(fullPath)) {
          success(`Removed scripts backup directory: ${fullPath}`);
        } else {
          error(`Failed to remove scripts backup directory: ${fullPath}`);
        }
      }
      
      suspiciousDirectoriesFound.push(fullPath);
      stats.suspiciousDirs++;
    }
  }
}

/**
 * Generate a comprehensive report
 */
function generateReport() {
  const now = new Date();
  const reportFilePath = path.join(process.cwd(), 'docs', 'project-history', 'unification-project', 'reports', 'final-backup-verification.md');
  
  let reportContent = `# Final Backup Verification Report

**Date**: ${now.toISOString().split('T')[0]}  
**Status**: ${stats.suspiciousFiles + stats.suspiciousDirs === 0 ? '✅ Clean' : '❌ Issues Found'}  

## Summary

- **Files Scanned**: ${stats.scannedFiles}
- **Directories Scanned**: ${stats.scannedDirs}
- **Suspicious Files Found**: ${stats.suspiciousFiles}
- **Suspicious Directories Found**: ${stats.suspiciousDirs}
- **Legitimate Exceptions**: ${stats.legitimateExceptions}

${FIX_MODE ? `
## Cleanup Results

- **Files Removed**: ${stats.removedFiles}
- **Directories Removed**: ${stats.removedDirs}
- **Failed Removals**: ${stats.removeFailedFiles + stats.removeFailedDirs}
` : ''}

## Detailed Findings

`;

  if (suspiciousFilesFound.length > 0) {
    reportContent += `### Suspicious Files\n\n`;
    for (const file of suspiciousFilesFound) {
      reportContent += `- \`${file}\`\n`;
    }
    reportContent += '\n';
  } else {
    reportContent += `### Suspicious Files\n\nNo suspicious backup files found.\n\n`;
  }

  if (suspiciousDirectoriesFound.length > 0) {
    reportContent += `### Suspicious Directories\n\n`;
    for (const dir of suspiciousDirectoriesFound) {
      reportContent += `- \`${dir}\`\n`;
    }
    reportContent += '\n';
  } else {
    reportContent += `### Suspicious Directories\n\nNo suspicious backup directories found.\n\n`;
  }

  if (VERBOSE && legitimateExceptionsFound.length > 0) {
    reportContent += `### Legitimate Exceptions\n\n`;
    for (const exception of legitimateExceptionsFound) {
      reportContent += `- \`${exception.path}\` (${exception.type})\n`;
    }
    reportContent += '\n';
  }

  if (FIX_MODE && filesRemoved.length > 0) {
    reportContent += `### Files Removed\n\n`;
    for (const file of filesRemoved) {
      reportContent += `- \`${file}\`\n`;
    }
    reportContent += '\n';
  }

  if (FIX_MODE && directoriesRemoved.length > 0) {
    reportContent += `### Directories Removed\n\n`;
    for (const dir of directoriesRemoved) {
      reportContent += `- \`${dir}\`\n`;
    }
    reportContent += '\n';
  }

  if (removalFailures.length > 0) {
    reportContent += `### Removal Failures\n\n`;
    for (const failure of removalFailures) {
      reportContent += `- \`${failure.path}\`: ${failure.error}\n`;
    }
    reportContent += '\n';
  }

  reportContent += `## Conclusion

${stats.suspiciousFiles + stats.suspiciousDirs === 0 
    ? 'The codebase is clean and free of any backup or temporary files.' 
    : 'Issues were found in the codebase that should be addressed to ensure a clean project structure.'}

${FIX_MODE 
    ? 'Automatic fixes have been applied where possible.' 
    : 'Run with the --fix flag to automatically remove detected backup files.'}

## Next Steps

${stats.suspiciousFiles + stats.suspiciousDirs === 0 
    ? '- Continue with the next phase of the unification project\n- Update the unification documentation to reflect the completion of the backup verification'
    : '- Review the detected backup files and directories\n- Run this script with the --fix flag to remove them\n- Manually handle any failed removals'}
`;

  if (DRY_RUN) {
    info(`Would write report to: ${reportFilePath}`);
    info(`Report content:\n${reportContent}`);
  } else {
    try {
      // Ensure the directory exists
      const reportDir = path.dirname(reportFilePath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      fs.writeFileSync(reportFilePath, reportContent);
      success(`Generated report at: ${reportFilePath}`);
    } catch (err) {
      error(`Failed to write report: ${err.message}`);
    }
  }

  // Also log a summary to the console
  console.log('\n' + '-'.repeat(80));
  info('📋 BACKUP VERIFICATION SUMMARY');
  console.log('-'.repeat(80));
  log(`Files scanned: ${stats.scannedFiles}`);
  log(`Directories scanned: ${stats.scannedDirs}`);
  
  if (stats.suspiciousFiles + stats.suspiciousDirs === 0) {
    success('✅ No suspicious backup files or directories found!');
  } else {
    warning(`⚠️  Found ${stats.suspiciousFiles} suspicious files and ${stats.suspiciousDirs} suspicious directories`);
    
    if (FIX_MODE) {
      log(`Files removed: ${stats.removedFiles}`);
      log(`Directories removed: ${stats.removedDirs}`);
      log(`Failed removals: ${stats.removeFailedFiles + stats.removeFailedDirs}`);
    } else {
      info(`Run with --fix flag to automatically remove detected backup files`);
    }
  }
  console.log('-'.repeat(80) + '\n');
}

// Start the verification process
scanCodebase(process.cwd()); 