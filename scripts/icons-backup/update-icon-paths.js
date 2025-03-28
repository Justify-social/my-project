/**
 * Icon Path Reference Updater
 * 
 * This script updates references to icon paths throughout the codebase,
 * ensuring consistency with the new directory structure.
 * 
 * Usage:
 *   node scripts/icons/update-icon-paths.js         # Normal mode
 *   node scripts/icons/update-icon-paths.js --verbose   # Verbose mode with detailed logging
 *   node scripts/icons/update-icon-paths.js --dry-run   # Simulate changes without writing files
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';

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

// Mapping of old paths to new paths
const PATH_MAPPINGS = [
  // SVG paths
  { 
    old: '/ui-icons/solid/', 
    new: '/icons/solid/' 
  },
  { 
    old: '/ui-icons/light/', 
    new: '/icons/light/' 
  },
  { 
    old: '/ui-icons/brands/', 
    new: '/icons/brands/' 
  },
  { 
    old: '/ui-icons/regular/', 
    new: '/icons/regular/' 
  },
  
  // Import paths
  { 
    old: '@/components/ui/icons/icon-data', 
    new: '@/assets/icons/data/icon-data' 
  },
  { 
    old: '@/components/ui/icons/icon-mappings', 
    new: '@/assets/icons/mappings/icon-mappings' 
  }
];

// File patterns to search
const FILE_PATTERNS = [
  'src/**/*.{ts,tsx,js,jsx}',
  'public/**/*.{html,css,js}'
];

// Files to exclude
const EXCLUDED_FILES = [
  'src/components/ui/icons/SvgIcon.tsx', // Will be handled separately
  'src/components/icons/Icon.tsx',      // Already using the correct paths
  'src/assets/icons/data/icon-data.ts',  // Transition file
  'src/assets/icons/mappings/icon-mappings.ts', // Transition file
];

// Function to update paths in a file
function updatePathsInFile(filePath) {
  if (EXCLUDED_FILES.includes(filePath)) {
    log(`Skipping excluded file: ${filePath}`, true);
    return false;
  }
  
  log(`Checking file: ${filePath}`, true);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let modified = false;
  
  // Apply each mapping
  for (const mapping of PATH_MAPPINGS) {
    if (content.includes(mapping.old)) {
      content = content.replace(new RegExp(escapeRegExp(mapping.old), 'g'), mapping.new);
      modified = true;
      log(`  Found and replaced: ${mapping.old} → ${mapping.new}`, true);
    }
  }
  
  // Write changes if needed
  if (modified) {
    log(`Updating paths in: ${filePath}`);
    if (!isDryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    return true;
  }
  
  return false;
}

// Helper to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Main function
async function updateIconPaths() {
  log('Updating icon path references across the codebase...');
  
  if (isDryRun) {
    log('DRY RUN MODE: No files will be modified');
  }
  
  let updatedCount = 0;
  let checkedCount = 0;
  
  // Process all matching files
  for (const pattern of FILE_PATTERNS) {
    const files = glob.sync(pattern);
    
    for (const file of files) {
      checkedCount++;
      if (updatePathsInFile(file)) {
        updatedCount++;
      }
    }
  }
  
  log(`\nSummary:`);
  log(`- Files checked: ${checkedCount}`);
  log(`- Files updated: ${updatedCount}`);
  
  if (isDryRun) {
    log(`\nThis was a dry run. No actual changes were made.`);
    log(`Run without --dry-run to apply changes.`);
  } else {
    log(`\nIcon path references updated successfully!`);
  }
}

// Execute the update
try {
  updateIconPaths();
} catch (error) {
  console.error('Error updating icon paths:', error);
  process.exit(1);
} 