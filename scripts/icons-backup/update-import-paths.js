#!/usr/bin/env node

/**
 * Icon Import Path Update Script
 * 
 * This script helps migrate import paths from the old location to the new unified location:
 * - FROM: @/components/ui/icons
 * - TO:   @/components/icons
 * 
 * It can operate in different modes:
 * - Analysis: Just find and report files that need changes (default)
 * - Dry run: Show what changes would be made
 * - Fix: Actually update the import paths
 * 
 * Usage:
 *   node scripts/icons/update-import-paths.js [--dry-run] [--fix] [--verbose] [--path=src/app]
 * 
 * Options:
 *   --dry-run   Show what would be done without making changes
 *   --fix       Automatically update import paths
 *   --verbose   Show detailed information about actions
 *   --path      Specify a subdirectory to process (default: entire src)
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fix = args.includes('--fix');
const verbose = args.includes('--verbose');
const pathArg = args.find(arg => arg.startsWith('--path='));
const targetPath = pathArg ? pathArg.split('=')[1] : 'src';

// Configuration
const rootDir = process.cwd();
const fullTargetPath = path.join(rootDir, targetPath);

// Import path patterns
const OLD_IMPORT_PATTERN = /@\/components\/ui\/icons/g;
const NEW_IMPORT_PATH = '@/components/icons';

// Ignored directories and files
const IGNORED_DIRS = ['node_modules', '.next', '.git', 'backup', '.font-consistency-backups'];
const IGNORED_FILE_PATTERNS = ['.backup.', '.bak', '.original.'];

// Track stats
let totalFiles = 0;
let filesNeedingChanges = 0;
let filesUpdated = 0;

/**
 * Checks if a file should be processed
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if the file should be processed
 */
function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath);
  
  // Skip files that match ignored patterns
  if (IGNORED_FILE_PATTERNS.some(pattern => fileName.includes(pattern))) {
    return false;
  }
  
  // Only process TypeScript/JavaScript/TSX/JSX files and markdown files
  const extension = path.extname(filePath).toLowerCase();
  return ['.ts', '.tsx', '.js', '.jsx', '.md'].includes(extension);
}

/**
 * Checks if a directory should be processed
 * @param {string} dirPath - Path to the directory
 * @returns {boolean} - True if the directory should be processed
 */
function shouldProcessDir(dirPath) {
  const dirName = path.basename(dirPath);
  return !IGNORED_DIRS.includes(dirName);
}

/**
 * Updates import paths in a file
 * @param {string} filePath - Path to the file
 */
function updateImportPaths(filePath) {
  try {
    const relativePath = path.relative(rootDir, filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Check if the file contains the old import pattern
    if (!OLD_IMPORT_PATTERN.test(content)) {
      return;
    }
    
    totalFiles++;
    
    // Replace old import paths with new ones
    content = content.replace(OLD_IMPORT_PATTERN, NEW_IMPORT_PATH);
    
    // If content was changed, update the file
    if (content !== originalContent) {
      filesNeedingChanges++;
      
      if (verbose) {
        console.log(`📄 ${relativePath} - Import paths need updating`);
      }
      
      if (fix && !dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesUpdated++;
        console.log(`✅ ${relativePath} - Updated import paths`);
      } else if (dryRun) {
        console.log(`🔍 ${relativePath} - Would update import paths`);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Processes a directory recursively
 * @param {string} dirPath - Path to the directory
 */
function processDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && shouldProcessDir(entryPath)) {
        processDirectory(entryPath);
      } else if (entry.isFile() && shouldProcessFile(entryPath)) {
        updateImportPaths(entryPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔧 Icon Import Path Update Tool');
  console.log('==============================');
  console.log(`Mode: ${dryRun ? 'Dry Run' : (fix ? 'Fix' : 'Analysis')}`);
  console.log(`Target path: ${targetPath}\n`);
  
  if (!fs.existsSync(fullTargetPath)) {
    console.error(`❌ Target path does not exist: ${targetPath}`);
    process.exit(1);
  }
  
  console.log('🔍 Scanning for files with old import paths...\n');
  
  // Process the target directory
  processDirectory(fullTargetPath);
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`Total files scanned: ${totalFiles}`);
  console.log(`Files needing changes: ${filesNeedingChanges}`);
  
  if (fix && !dryRun) {
    console.log(`Files updated: ${filesUpdated}`);
  } else if (dryRun) {
    console.log(`Files that would be updated: ${filesNeedingChanges}`);
  }
  
  // Provide next steps
  if (filesNeedingChanges > 0 && !fix) {
    console.log('\n🔍 Next steps:');
    console.log('  1. Run with --dry-run to see what changes would be made');
    console.log('  2. Run with --fix to update import paths');
    console.log('  3. Run tests to verify the changes');
  } else if (filesUpdated > 0) {
    console.log('\n🔍 Next steps:');
    console.log('  1. Run tests to verify the changes');
    console.log('  2. Commit the changes');
  }
}

// Run the script
main(); 