/**
 * Icon File Migration Script
 * 
 * This script copies icon files from the old directory structure to the new one.
 * It maintains all existing SVG files and updates paths as needed.
 * 
 * Usage:
 *   node scripts/icons/move-icons.js         # Normal mode
 *   node scripts/icons/move-icons.js --verbose   # Verbose mode with detailed logging
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Process command line arguments
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose');
const isDryRun = args.includes('--dry-run');

// Helper logging function
function log(message, isVerboseOnly = false) {
  if (!isVerboseOnly || isVerbose) {
    console.log(message);
  }
}

// Source and destination paths
const SOURCE_PATHS = {
  'solid': path.join(__dirname, '..', '..', 'public', 'ui-icons', 'solid'),
  'light': path.join(__dirname, '..', '..', 'public', 'ui-icons', 'light'),
  'brands': path.join(__dirname, '..', '..', 'public', 'ui-icons', 'brands'),
  'regular': path.join(__dirname, '..', '..', 'public', 'ui-icons', 'regular')
};

const DEST_PATHS = {
  'solid': path.join(__dirname, '..', '..', 'public', 'icons', 'solid'),
  'light': path.join(__dirname, '..', '..', 'public', 'icons', 'light'),
  'brands': path.join(__dirname, '..', '..', 'public', 'icons', 'brands'),
  'regular': path.join(__dirname, '..', '..', 'public', 'icons', 'regular')
};

// Ensure destination directories exist
Object.values(DEST_PATHS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    log(`Creating directory: ${dir}`);
    if (!isDryRun) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
});

// Function to copy an individual file
function copyFile(source, dest) {
  log(`Copying: ${source} -> ${dest}`, true);
  if (!isDryRun) {
    fs.copyFileSync(source, dest);
  }
  return true;
}

// Function to copy all files from source to destination
function copyIconFiles(sourceDir, destDir) {
  if (!fs.existsSync(sourceDir)) {
    log(`Source directory doesn't exist: ${sourceDir}`);
    return 0;
  }
  
  const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.svg'));
  log(`Found ${files.length} SVG files in ${sourceDir}`);
  
  let copied = 0;
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    
    // Skip if destination already exists and is identical
    if (fs.existsSync(destPath)) {
      const sourceStats = fs.statSync(sourcePath);
      const destStats = fs.statSync(destPath);
      
      if (sourceStats.size === destStats.size) {
        const sourceContent = fs.readFileSync(sourcePath, 'utf8');
        const destContent = fs.readFileSync(destPath, 'utf8');
        
        if (sourceContent === destContent) {
          log(`Skipping identical file: ${file}`, true);
          continue;
        }
      }
    }
    
    if (copyFile(sourcePath, destPath)) {
      copied++;
    }
  }
  
  return copied;
}

// Main function to copy all icon files
function migrateIconFiles() {
  log('Starting icon file migration...');
  let totalCopied = 0;
  
  for (const [style, sourceDir] of Object.entries(SOURCE_PATHS)) {
    const destDir = DEST_PATHS[style];
    log(`\nProcessing ${style} icons:`);
    
    const copied = copyIconFiles(sourceDir, destDir);
    totalCopied += copied;
    
    log(`Copied ${copied} ${style} icons`);
  }
  
  log(`\nMigration complete. Copied ${totalCopied} icon files in total.`);
  
  // Update scripts to use new paths
  log('\nUpdating references in scripts and data files...');
  if (!isDryRun) {
    // This will need to be implemented when ready to fully migrate
    log('This step will be implemented in a future update.');
  }
}

// Execute the migration
try {
  if (isDryRun) {
    log('DRY RUN MODE: No files will be copied or modified');
  }
  
  migrateIconFiles();
  
  log('\nIcon migration completed successfully!');
} catch (error) {
  console.error('Error during icon migration:', error);
  process.exit(1);
}

// Helper function to update icon path references in a file
function updateIconPaths(filePath, oldPathPattern, newPathPattern) {
  if (!fs.existsSync(filePath)) {
    log(`File doesn't exist: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  content = content.replace(new RegExp(oldPathPattern, 'g'), newPathPattern);
  
  if (content !== originalContent) {
    log(`Updating icon paths in: ${filePath}`);
    if (!isDryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    return true;
  }
  
  return false;
} 