/**
 * Test Migration Script
 * 
 * This script automates the migration of test files from src/__tests__ to the new structure in /tests
 */

import fs from 'fs';
import path from 'path';
import _execSync from 'child_process';

// Source and target directories
const SOURCE_DIR = path.join(process.cwd(), 'src', '__tests__');
const TARGET_DIR = path.join(process.cwd(), 'tests');

// Mapping of source directories to target directories
const DIR_MAPPING = {
  'integration': 'integration',
  'settings/profile': 'settings/profile',
  'settings/team-management': 'settings/team-management',
  'settings/branding': 'settings/branding',
  'settings/shared': 'settings/shared',
};

// Ensure target directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Copy a file with its contents
function copyFile(sourcePath, targetPath) {
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`Copied: ${sourcePath} → ${targetPath}`);
}

// Process a directory
function processDirectory(sourceSubDir, targetSubDir) {
  const fullSourceDir = path.join(SOURCE_DIR, sourceSubDir);
  const fullTargetDir = path.join(TARGET_DIR, targetSubDir);
  
  // Ensure target directory exists
  ensureDirectoryExists(fullTargetDir);
  
  // Read all files from source directory
  const files = fs.readdirSync(fullSourceDir);
  
  // Process each file
  files.forEach(file => {
    const sourcePath = path.join(fullSourceDir, file);
    const targetPath = path.join(fullTargetDir, file);
    
    // Skip directories (process them separately)
    if (fs.statSync(sourcePath).isDirectory()) {
      console.log(`Skipping directory: ${sourcePath}`);
      return;
    }
    
    // Copy file
    copyFile(sourcePath, targetPath);
  });
}

// Main migration function
function migrateTests() {
  console.log('Starting test file migration...');
  
  // Process each mapped directory
  Object.entries(DIR_MAPPING).forEach(([sourceSubDir, targetSubDir]) => {
    console.log(`Processing directory: ${sourceSubDir} → ${targetSubDir}`);
    processDirectory(sourceSubDir, targetSubDir);
  });
  
  console.log('Test file migration completed.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update imports in the migrated test files');
  console.log('2. Update jest.config.js to include the new test directory');
  console.log('3. Verify tests run correctly with the new structure');
}

// Execute if called directly
if (require.main === module) {
  try {
    migrateTests();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

module.exports = { migrateTests }; 