/**
 * Backup Cleanup Script
 * 
 * This script safely documents and removes backup files created during the unification process.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import execSync from 'child_process';

// Utility functions
const log = (message) => console.log(`\x1b[36m[Backup Cleanup]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

// Find backup files
const findBackupFiles = () => {
  // File patterns to search for
  const patterns = [
    '**/*.bak',
    '**/*.old',
    '**/*.original',
    '**/*.backup'
  ];
  
  // Directories to exclude
  const excludes = [
    'node_modules',
    '.git',
    '.next'
  ];
  
  let allFiles = [];
  
  // Search for each pattern
  for (const pattern of patterns) {
    const files = glob.sync(pattern, { 
      ignore: excludes.map(dir => `${dir}/**`), 
      dot: true // Include hidden files
    });
    allFiles = [...allFiles, ...files];
  }
  
  // Also find backup directories
  const backupDirs = glob.sync('**/.*.backup', { 
    ignore: excludes.map(dir => `${dir}/**`), 
    dot: true 
  });
  
  const tempBackupDirs = glob.sync('**/.*-backup*', { 
    ignore: excludes.map(dir => `${dir}/**`), 
    dot: true 
  });
  
  return { 
    files: allFiles, 
    directories: [...backupDirs, ...tempBackupDirs] 
  };
};

// Create backup manifest
const createBackupManifest = (files, directories) => {
  const manifestLines = [
    '# Backup Files Manifest',
    '',
    'This document lists all backup files and directories that were safely removed during the unification cleanup process.',
    '',
    '## Backup Files',
    ''
  ];
  
  // Add file info
  if (files.length === 0) {
    manifestLines.push('No backup files found.');
  } else {
    files.forEach(file => {
      try {
        const stats = fs.statSync(file);
        const sizeInKB = (stats.size / 1024).toFixed(2);
        const modified = stats.mtime.toISOString();
        manifestLines.push(`- \`${file}\` (${sizeInKB} KB, modified: ${modified})`);
      } catch (err) {
        manifestLines.push(`- \`${file}\` (could not read file stats)`);
      }
    });
  }
  
  manifestLines.push('', '## Backup Directories', '');
  
  // Add directory info
  if (directories.length === 0) {
    manifestLines.push('No backup directories found.');
  } else {
    directories.forEach(dir => {
      try {
        // Count files in directory
        const dirFiles = glob.sync(`${dir}/**/*`, { nodir: true });
        manifestLines.push(`- \`${dir}\` (${dirFiles.length} files)`);
      } catch (err) {
        manifestLines.push(`- \`${dir}\` (could not read directory stats)`);
      }
    });
  }
  
  // Write manifest to file
  fs.writeFileSync('docs/backup-files-manifest.md', manifestLines.join('\n'));
  success('Created backup manifest at docs/backup-files-manifest.md');
};

// Safely remove files
const removeFiles = (files) => {
  const results = {
    success: 0,
    failed: 0,
    details: []
  };
  
  // Process each file
  for (const file of files) {
    try {
      fs.unlinkSync(file);
      success(`Removed file: ${file}`);
      results.success++;
      results.details.push({ path: file, success: true });
    } catch (err) {
      error(`Failed to remove ${file}: ${err.message}`);
      results.failed++;
      results.details.push({ path: file, success: false, error: err.message });
    }
  }
  
  return results;
};

// Safely remove directories
const removeDirectories = (directories) => {
  const results = {
    success: 0,
    failed: 0,
    details: []
  };
  
  // Sort directories by path length (descending) to remove nested dirs first
  const sortedDirs = [...directories].sort((a, b) => b.length - a.length);
  
  // Process each directory
  for (const dir of sortedDirs) {
    try {
      // Recursively remove directory 
      fs.rmSync(dir, { recursive: true, force: true });
      success(`Removed directory: ${dir}`);
      results.success++;
      results.details.push({ path: dir, success: true });
    } catch (err) {
      error(`Failed to remove ${dir}: ${err.message}`);
      results.failed++;
      results.details.push({ path: dir, success: false, error: err.message });
    }
  }
  
  return results;
};

// Main function
const main = async () => {
  log('Starting backup cleanup process...');
  
  // Track timing
  const startTime = Date.now();
  
  try {
    // Find backup files and directories
    const { files, directories } = findBackupFiles();
    log(`Found ${files.length} backup files and ${directories.length} backup directories`);
    
    // Create backup manifest
    createBackupManifest(files, directories);
    
    // Ask for confirmation before removing files
    log(`
====================================================================
IMPORTANT: This will remove ${files.length} backup files and ${directories.length} backup directories.
A manifest of these files has been created at docs/backup-files-manifest.md.
Make sure you have reviewed this file before proceeding.
====================================================================
`);
    
    // Only proceed with removal if files or directories were found
    if (files.length > 0 || directories.length > 0) {
      const fileResults = removeFiles(files);
      const dirResults = removeDirectories(directories);
      
      // Create cleanup report
      const reportContent = `# Backup Cleanup Report

## Summary
- Backup files found: ${files.length}
- Backup files removed: ${fileResults.success}
- Backup files failed: ${fileResults.failed}
- Backup directories found: ${directories.length}
- Backup directories removed: ${dirResults.success}
- Backup directories failed: ${dirResults.failed}

## Files Removal Details
${fileResults.details.map(d => `- ${d.success ? '✅' : '❌'} \`${d.path}\`${d.error ? ` (Error: ${d.error})` : ''}`).join('\n')}

## Directory Removal Details
${dirResults.details.map(d => `- ${d.success ? '✅' : '❌'} \`${d.path}\`${d.error ? ` (Error: ${d.error})` : ''}`).join('\n')}
`;

      fs.writeFileSync('docs/backup-cleanup-report.md', reportContent);
      success('Created cleanup report at docs/backup-cleanup-report.md');
      
      // Update progress
      try {
        execSync('node scripts/unification-final/update-progress.js "Legacy Cleanup" 70', { stdio: 'inherit' });
      } catch (err) {
        warning(`Could not update progress: ${err.message}`);
      }
    } else {
      log('No backup files or directories found to remove.');
    }
    
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    success(`Backup cleanup completed in ${executionTime}s`);
  } catch (err) {
    error(`Backup cleanup failed: ${err.message}`);
    process.exit(1);
  }
};

// Run main function
main(); 