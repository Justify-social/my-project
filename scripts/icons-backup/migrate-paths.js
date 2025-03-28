#!/usr/bin/env node

/**
 * Icon Path Migration Script
 * 
 * This script handles the migration from /public/ui-icons/ to /public/icons/
 * It performs the following tasks:
 * 1. Maps files between the old and new icon directories
 * 2. Identifies files containing references to the old paths
 * 3. Updates those references to use the new paths
 * 4. Validates that all needed icons exist in the new location
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const OLD_ICON_DIR = 'public/ui-icons';
const NEW_ICON_DIR = 'public/icons';
const STYLE_DIRS = ['light', 'solid', 'brands'];
const SRC_DIR = 'src';
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Flags
const VERBOSE = process.argv.includes('--verbose');
const DRY_RUN = process.argv.includes('--dry-run');
const FIX = process.argv.includes('--fix');

// Path mapping data
const iconPathMap = {};
const fileUpdates = [];
const missingIcons = [];

// Utility functions
function log(...args) {
  console.log(...args);
}

function verbose(...args) {
  if (VERBOSE) {
    console.log('[VERBOSE]', ...args);
  }
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

// Step 1: Map files between the old and new icon directories
function buildIconPathMap() {
  log('🔍 Building icon path mapping...');
  
  // Check if directories exist
  if (!fs.existsSync(OLD_ICON_DIR)) {
    error(`Old icon directory '${OLD_ICON_DIR}' not found!`);
    process.exit(1);
  }
  
  if (!fs.existsSync(NEW_ICON_DIR)) {
    error(`New icon directory '${NEW_ICON_DIR}' not found!`);
    process.exit(1);
  }
  
  // Build the mapping
  STYLE_DIRS.forEach(style => {
    const oldStyleDir = path.join(OLD_ICON_DIR, style);
    const newStyleDir = path.join(NEW_ICON_DIR, style);
    
    if (!fs.existsSync(oldStyleDir)) {
      warning(`Old style directory '${oldStyleDir}' not found!`);
      return;
    }
    
    if (!fs.existsSync(newStyleDir)) {
      warning(`New style directory '${newStyleDir}' not found!`);
      return;
    }
    
    // Map files in this style directory
    const files = fs.readdirSync(oldStyleDir);
    files.forEach(file => {
      if (path.extname(file) === '.svg') {
        const oldPath = `/${OLD_ICON_DIR}/${style}/${file}`;
        const newPath = `/${NEW_ICON_DIR}/${style}/${file}`;
        
        // Check if the file exists in the new location
        if (fs.existsSync(path.join(process.cwd(), NEW_ICON_DIR, style, file))) {
          iconPathMap[oldPath] = newPath;
        } else {
          missingIcons.push({
            oldPath,
            file,
            style
          });
        }
      }
    });
  });
  
  log(`✅ Mapped ${Object.keys(iconPathMap).length} icon paths`);
  if (missingIcons.length > 0) {
    warning(`Found ${missingIcons.length} icons missing in the new directory`);
  }
  
  if (VERBOSE) {
    verbose(`Icon path map sample (first 5):`);
    Object.entries(iconPathMap).slice(0, 5).forEach(([oldPath, newPath]) => {
      verbose(`  ${oldPath} -> ${newPath}`);
    });
    
    if (missingIcons.length > 0) {
      verbose(`Missing icons sample (first 5):`);
      missingIcons.slice(0, 5).forEach(icon => {
        verbose(`  ${icon.oldPath} (${icon.style}/${icon.file})`);
      });
    }
  }
}

// Step 2: Identify files containing references to the old paths
function findFilesWithOldPaths() {
  log('🔍 Finding files with old icon paths...');
  
  // Hard-coded list of files known to contain references to ui-icons
  const hardcodedFiles = [
    'src/app/debug-tools/api/icons/route.ts',
    'src/app/api/assets/icon/route.ts',
    'src/app/campaigns/wizard/step-1/Step1Content.tsx',
    'src/app/campaigns/wizard/step-5/Step5Content.tsx',
    'src/app/campaigns/[id]/page.tsx',
    'src/components/ui/calendar/calendar-dashboard.tsx',
    'src/components/ui/asset-card/asset-card.tsx',
    'src/components/ui/icons/fix-icon-mappings.ts',
    'src/components/ui/icons/test/IconTester.backup.tsx',
    'src/components/ui/icons/test/IconTester.tsx',
    'src/components/ui/icons/icon-mappings.ts',
    'src/components/ui/icons/README.md',
    'src/components/ui/icons/icon-data.ts',
    'src/components/ui/icons/safe-icon.tsx',
    'src/lib/icon-diagnostic.ts',
    'src/lib/icon-loader.ts',
    'src/components/ui/icons/mapping/icon-registry.json',
    'src/components/ui/icons/mapping/icon-url-map.json'
  ];
  
  // Validate that these files exist
  const existingFiles = hardcodedFiles.filter(file => {
    const exists = fs.existsSync(file);
    if (!exists && VERBOSE) {
      verbose(`File not found: ${file}`);
    }
    return exists;
  });
  
  log(`✅ Found ${existingFiles.length} files containing old icon paths`);
  
  if (VERBOSE) {
    verbose('Files with old icon paths:');
    existingFiles.forEach(file => {
      verbose(`  ${file}`);
    });
  }
  
  return existingFiles;
}

// Step 3: Update references to use the new paths
function updateFilePaths(files) {
  log('🔍 Analyzing files for path updates...');
  
  files.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fileUpdated = false;
      
      // Replace direct path references
      Object.entries(iconPathMap).forEach(([oldPath, newPath]) => {
        if (content.includes(oldPath)) {
          // Replace all occurrences
          const regex = new RegExp(oldPath.replace(/\//g, '\\/').replace(/\./g, '\\.'), 'g');
          content = content.replace(regex, newPath);
          fileUpdated = true;
          
          if (VERBOSE) {
            verbose(`Replacing in ${filePath}:`, oldPath, '->', newPath);
          }
        }
      });
      
      // Also handle more general replacements for patterns like:
      // 1. path.join(process.cwd(), 'public', 'ui-icons') → path.join(process.cwd(), 'public', 'icons')
      // 2. '/public/ui-icons/' → '/public/icons/'
      // 3. 'public/ui-icons/' → 'public/icons/'
      
      // Handle Node.js path construction
      content = content.replace(/(['"])public\/ui-icons\1/g, "$1public/icons$1");
      content = content.replace(/(['"])\/public\/ui-icons\1/g, "$1/public/icons$1");
      content = content.replace(/path\.join\([^)]*?['"]public['"],\s*['"]ui-icons['"]/g, match => {
        fileUpdated = true;
        return match.replace('ui-icons', 'icons');
      });
      
      // Handle URL paths
      content = content.replace(/(['"])\/ui-icons\//g, "$1/icons/");
      content = content.replace(/(['"])ui-icons\//g, "$1icons/");
      
      if (fileUpdated || content !== originalContent) {
        fileUpdates.push({
          filePath,
          changes: true
        });
        
        if (FIX && !DRY_RUN) {
          fs.writeFileSync(filePath, content, 'utf8');
          success(`Updated ${filePath}`);
        }
      }
    } catch (error) {
      warning(`Error processing file ${filePath}: ${error.message}`);
    }
  });
  
  log(`✅ Analyzed ${files.length} files, found ${fileUpdates.length} files to update`);
  
  if (DRY_RUN && fileUpdates.length > 0) {
    log(`ℹ️ Dry run mode: No files were actually updated`);
  }
}

// Step 4: Validate that all needed icons exist
function validateIcons() {
  log('🔍 Validating icon availability...');
  
  if (missingIcons.length > 0) {
    warning(`Found ${missingIcons.length} missing icons that need to be copied from the old directory:`);
    
    missingIcons.forEach(icon => {
      warning(`  ${icon.oldPath}`);
      
      // Create the destination directory if it doesn't exist
      const destDir = path.join(process.cwd(), NEW_ICON_DIR, icon.style);
      if (!fs.existsSync(destDir)) {
        if (FIX && !DRY_RUN) {
          fs.mkdirSync(destDir, { recursive: true });
          verbose(`Created directory: ${destDir}`);
        } else {
          verbose(`Would create directory: ${destDir}`);
        }
      }
      
      // Copy the file
      const sourcePath = path.join(process.cwd(), OLD_ICON_DIR, icon.style, icon.file);
      const destPath = path.join(destDir, icon.file);
      
      if (FIX && !DRY_RUN) {
        fs.copyFileSync(sourcePath, destPath);
        success(`Copied: ${sourcePath} -> ${destPath}`);
      } else {
        verbose(`Would copy: ${sourcePath} -> ${destPath}`);
      }
    });
    
    if (DRY_RUN) {
      log(`ℹ️ Dry run mode: No files were actually copied`);
    } else if (!FIX) {
      log(`ℹ️ Use --fix to automatically copy missing icons`);
    }
  } else {
    success('All referenced icons are available in the new directory');
  }
}

// Main function
function main() {
  log('🚀 Starting icon path migration...');
  
  // Step 1: Build the icon path map
  buildIconPathMap();
  
  // Step 2: Find files with old paths
  const files = findFilesWithOldPaths();
  
  // Step 3: Update references to the new paths
  if (files.length > 0) {
    updateFilePaths(files);
  }
  
  // Step 4: Validate icon availability
  validateIcons();
  
  // Summary
  log('📊 Icon path migration summary:');
  log(`  - Mapped icon paths: ${Object.keys(iconPathMap).length}`);
  log(`  - Files with old paths: ${files.length}`);
  log(`  - Files updated: ${fileUpdates.length}`);
  log(`  - Missing icons: ${missingIcons.length}`);
  
  if (DRY_RUN) {
    log(`ℹ️ This was a dry run. Use the script without --dry-run to apply changes.`);
  }
  
  if (!FIX) {
    log(`ℹ️ Use --fix to automatically update files and copy missing icons.`);
  }
}

// Run the script
main(); 