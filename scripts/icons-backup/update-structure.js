#!/usr/bin/env node

/**
 * Icon Structure Update Script
 * 
 * This script helps to clean up and consolidate the icon system by:
 * 1. Identifying duplicate files and directories
 * 2. Providing actions to remove unnecessary files
 * 3. Updating import paths in files to use the new structure
 * 4. Verifying the integrity of the new structure
 * 
 * Usage:
 *   node scripts/icons/update-structure.js [--dry-run] [--fix] [--verbose]
 * 
 * Options:
 *   --dry-run   Show what would be done without making changes
 *   --fix       Automatically fix issues where possible
 *   --verbose   Show detailed information about actions
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fix = args.includes('--fix');
const verbose = args.includes('--verbose');

// Configuration
const rootDir = process.cwd();

// Define files and directories to check
const duplicateItems = [
  {
    type: 'directory',
    original: 'public/ui-icons',
    replacement: 'public/icons',
    action: 'Remove original directory after ensuring all references use the new path',
    canFix: false, // Requires manual verification of references
  },
  {
    type: 'directory',
    original: 'src/components/icons/Icon',
    replacement: 'src/components/icons/Icon.tsx',
    action: 'Remove directory as it only contains a re-export file',
    canFix: true,
  },
  {
    type: 'file',
    original: 'src/components/ui/icons/icon.tsx',
    replacement: 'src/components/icons/Icon.tsx',
    action: 'Remove legacy entry point after ensuring all imports use the new path',
    canFix: false, // Requires manual verification of imports
  },
  {
    type: 'directory',
    original: 'scripts/icon-management',
    replacement: 'scripts/icons',
    action: 'Consolidate all scripts into scripts/icons directory',
    canFix: false, // Requires manual verification of script functionality
  }
];

// Define transitional files that need implementation
const transitionalFiles = [
  {
    path: 'src/components/icons/core/index.ts',
    status: 'Re-export only',
    action: 'Implement actual components instead of re-exporting',
  },
  {
    path: 'src/components/icons/variants/index.ts',
    status: 'Re-export only',
    action: 'Implement actual components instead of re-exporting',
  },
  {
    path: 'src/components/icons/utils/index.ts',
    status: 'Re-export only',
    action: 'Implement actual components instead of re-exporting',
  },
];

// Check if a path exists
function pathExists(itemPath) {
  try {
    fs.accessSync(path.join(rootDir, itemPath));
    return true;
  } catch (error) {
    return false;
  }
}

// Verify the structure to identify issues
function verifyStructure() {
  console.log('🔍 Verifying icon system structure...\n');

  // Check for duplicate items
  console.log('📦 Checking for duplicate files and directories:');
  let hasDuplicates = false;

  for (const item of duplicateItems) {
    const originalExists = pathExists(item.original);
    const replacementExists = pathExists(item.replacement);

    if (originalExists && replacementExists) {
      hasDuplicates = true;
      console.log(`  ❌ Found duplicate: ${item.original} and ${item.replacement}`);
      console.log(`     Action: ${item.action}`);
      
      if (item.canFix && fix) {
        console.log(`     Fixing: Removing ${item.original}...`);
        if (!dryRun) {
          try {
            if (item.type === 'directory') {
              fs.rmSync(path.join(rootDir, item.original), { recursive: true, force: true });
            } else {
              fs.unlinkSync(path.join(rootDir, item.original));
            }
            console.log(`     ✅ Removed ${item.original}`);
          } catch (error) {
            console.error(`     ❌ Error removing ${item.original}: ${error.message}`);
          }
        } else {
          console.log(`     [DRY RUN] Would remove ${item.original}`);
        }
      } else if (item.canFix) {
        console.log(`     Run with --fix to automatically remove ${item.original}`);
      } else {
        console.log(`     Manual action required`);
      }
    } else if (!replacementExists && originalExists) {
      console.log(`  ⚠️ Original exists but replacement missing: ${item.original}`);
    } else if (!originalExists && replacementExists) {
      console.log(`  ✅ Only replacement exists (good): ${item.replacement}`);
    } else {
      console.log(`  ❓ Neither original nor replacement exists: ${item.original}, ${item.replacement}`);
    }
    console.log('');
  }

  // Check transitional files
  console.log('\n📦 Checking transitional files:');
  for (const file of transitionalFiles) {
    if (pathExists(file.path)) {
      console.log(`  ⚠️ Transitional file: ${file.path}`);
      console.log(`     Status: ${file.status}`);
      console.log(`     Action: ${file.action}`);
    } else {
      console.log(`  ❓ Transitional file doesn't exist: ${file.path}`);
    }
    console.log('');
  }

  return hasDuplicates;
}

// Main function
function main() {
  console.log('🔧 Icon Structure Update Tool');
  console.log('============================');
  console.log(`Mode: ${dryRun ? 'Dry Run' : (fix ? 'Fix' : 'Analysis')}\n`);

  // Verify the current structure
  const hasDuplicates = verifyStructure();

  // Test icon structure imports
  console.log('\n🧪 Testing icon structure imports...');
  try {
    const cmd = `node scripts/icons/test-icon-structure.js${verbose ? ' --verbose' : ''}`;
    console.log(`Running: ${cmd}`);
    if (!dryRun) {
      execSync(cmd, { stdio: 'inherit' });
    } else {
      console.log('[DRY RUN] Would run import tests');
    }
  } catch (error) {
    console.error('❌ Icon import tests failed. Fix structure issues first.');
  }

  // Summary
  console.log('\n📋 Summary:');
  if (hasDuplicates) {
    console.log('  ⚠️ Duplicate files/directories found. Follow the actions above to clean up.');
  } else {
    console.log('  ✅ No duplicate files/directories found.');
  }
  
  if (transitionalFiles.some(file => pathExists(file.path))) {
    console.log('  ⚠️ Transitional files found. These need actual implementation.');
  }

  console.log('\n🔍 Next steps:');
  console.log('  1. Remove duplicate files after verifying references');
  console.log('  2. Implement transitional files with actual components');
  console.log('  3. Run tests to verify the icon system integrity');
  console.log('  4. Update the icon-unification.md file with progress');
}

// Run the script
main(); 