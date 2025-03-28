#!/usr/bin/env node

/**
 * Icon Path Update Script
 * 
 * This script helps update references to KPI and app icon paths after moving them to the unified location:
 * - FROM: /KPIs/Icon_Name.svg
 * - TO:   /icons/kpis/Icon_Name.svg
 * 
 * - FROM: /app/Icon_Name.svg
 * - TO:   /icons/app/Icon_Name.svg
 * 
 * Usage:
 *   node scripts/icons/update-paths.js [--dry-run] [--fix] [--verbose] [--path=src/app]
 * 
 * Options:
 *   --dry-run   Show what would be done without making changes
 *   --fix       Automatically update icon paths
 *   --verbose   Show detailed information about changes
 *   --path      Specify a subdirectory to process (default: entire src)
 */

import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fix = args.includes('--fix');
const verbose = args.includes('--verbose') || true; // Force verbose for debugging
const pathArg = args.find(arg => arg.startsWith('--path='));
const targetPath = pathArg ? pathArg.split('=')[1] : 'src';

// Configuration
const rootDir = process.cwd();
const fullTargetPath = path.join(rootDir, targetPath);

console.log('Starting script with configuration:');
console.log(`- Dry run: ${dryRun}`);
console.log(`- Fix: ${fix}`);
console.log(`- Verbose: ${verbose}`);
console.log(`- Target path: ${targetPath}`);
console.log(`- Full target path: ${fullTargetPath}`);

// Path patterns to update
const PATH_UPDATES = [
  {
    from: /["']\/KPIs\/([^"']+)["']/g,
    to: match => {
      const iconName = match.match(/\/KPIs\/([^"']+)/)[1];
      console.log(`Found KPI path match: ${match} -> ${match.replace(`/KPIs/${iconName}`, `/icons/kpis/${iconName}`)}`);
      return match.replace(`/KPIs/${iconName}`, `/icons/kpis/${iconName}`);
    }
  },
  {
    from: /["']\/app\/([^"']+)["']/g,
    to: match => {
      const iconName = match.match(/\/app\/([^"']+)/)[1];
      console.log(`Found app path match: ${match} -> ${match.replace(`/app/${iconName}`, `/icons/app/${iconName}`)}`);
      return match.replace(`/app/${iconName}`, `/icons/app/${iconName}`);
    }
  }
];

// CSS-specific updates for background images
const CSS_PATH_UPDATES = [
  {
    from: /url\(['"]?\/KPIs\/([^'")]+)['"]?\)/g,
    to: match => {
      const iconName = match.match(/\/KPIs\/([^'")]+)/)[1];
      console.log(`Found KPI CSS path match: ${match} -> ${match.replace(`/KPIs/${iconName}`, `/icons/kpis/${iconName}`)}`);
      return match.replace(`/KPIs/${iconName}`, `/icons/kpis/${iconName}`);
    }
  },
  {
    from: /url\(['"]?\/app\/([^'")]+)['"]?\)/g,
    to: match => {
      const iconName = match.match(/\/app\/([^'")]+)/)[1];
      console.log(`Found app CSS path match: ${match} -> ${match.replace(`/app/${iconName}`, `/icons/app/${iconName}`)}`);
      return match.replace(`/app/${iconName}`, `/icons/app/${iconName}`);
    }
  }
];

// Ignored directories and files
const IGNORED_DIRS = ['node_modules', '.next', '.git', 'backup', '.font-consistency-backups'];
const IGNORED_FILE_PATTERNS = ['.backup.', '.bak', '.original.'];

// Track stats
let totalFiles = 0;
let filesNeedingChanges = 0;
let filesUpdated = 0;
let totalPathsChanged = 0;

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
  
  // Only process TypeScript/JavaScript/TSX/JSX files, CSS and markdown files
  const extension = path.extname(filePath).toLowerCase();
  return ['.ts', '.tsx', '.js', '.jsx', '.css', '.md'].includes(extension);
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
 * Updates icon paths in a file
 * @param {string} filePath - Path to the file
 */
function updateIconPaths(filePath) {
  try {
    const relativePath = path.relative(rootDir, filePath);
    console.log(`Processing file: ${relativePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let pathsChanged = 0;
    
    // Quick check if file might contain any icon paths to update (optimization)
    if (content.includes('/KPIs/') || content.includes('/app/')) {
      console.log(`File ${relativePath} contains potential icon paths`);
      
      // Apply standard path updates
      for (const update of PATH_UPDATES) {
        content = content.replace(update.from, (match) => {
          pathsChanged++;
          return update.to(match);
        });
      }
      
      // Apply CSS-specific updates if it's a CSS file
      if (path.extname(filePath).toLowerCase() === '.css') {
        for (const update of CSS_PATH_UPDATES) {
          content = content.replace(update.from, (match) => {
            pathsChanged++;
            return update.to(match);
          });
        }
      }
      
      // If content was changed, update the file
      if (content !== originalContent) {
        totalFiles++;
        filesNeedingChanges++;
        totalPathsChanged += pathsChanged;
        
        console.log(`📄 ${relativePath} - Found ${pathsChanged} icon paths to update`);
        
        if (fix && !dryRun) {
          fs.writeFileSync(filePath, content, 'utf8');
          filesUpdated++;
          console.log(`✅ ${relativePath} - Updated ${pathsChanged} icon paths`);
        } else if (dryRun) {
          console.log(`🔍 ${relativePath} - Would update ${pathsChanged} icon paths`);
        }
      } else {
        console.log(`No changes needed for ${relativePath}`);
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
    console.log(`Processing directory: ${dirPath}`);
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && shouldProcessDir(entryPath)) {
        processDirectory(entryPath);
      } else if (entry.isFile() && shouldProcessFile(entryPath)) {
        updateIconPaths(entryPath);
      } else {
        console.log(`Skipping ${entryPath}`);
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
  console.log('🔧 Icon Path Update Tool');
  console.log('=======================');
  console.log(`Mode: ${dryRun ? 'Dry Run' : (fix ? 'Fix' : 'Analysis')}`);
  console.log(`Target path: ${targetPath}\n`);
  
  if (!fs.existsSync(fullTargetPath)) {
    console.error(`❌ Target path does not exist: ${targetPath}`);
    process.exit(1);
  }
  
  console.log('🔍 Scanning for files with old icon paths...\n');
  
  // Process the target directory
  processDirectory(fullTargetPath);
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`Files with icon paths to update: ${filesNeedingChanges}`);
  console.log(`Total icon paths to update: ${totalPathsChanged}`);
  
  if (fix && !dryRun) {
    console.log(`Files updated: ${filesUpdated}`);
  } else if (dryRun) {
    console.log(`Files that would be updated: ${filesNeedingChanges}`);
  }
  
  // Provide next steps
  if (filesNeedingChanges > 0 && !fix) {
    console.log('\n🔍 Next steps:');
    console.log('  1. Run with --dry-run to see what changes would be made');
    console.log('  2. Run with --fix to update icon paths');
    console.log('  3. Test the application to verify the changes');
  } else if (filesUpdated > 0) {
    console.log('\n🔍 Next steps:');
    console.log('  1. Test the application to verify the changes');
    console.log('  2. Commit the changes');
  } else {
    console.log('\n✅ No icon paths need to be updated in this directory.');
  }
}

// Run the script
main(); 