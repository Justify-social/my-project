/**
 * Utils Directory Reorganization Script
 * 
 * This script properly categorizes scripts that were initially placed in the utils directory
 * by the implementation script, moving them to their appropriate category directories.
 */

import fs from 'fs';
import path from 'path';

// Define script categories and patterns for identification
const categoryPatterns = {
  'icons': [
    'icon', 'svg', 'font-awesome', 'fontawesome', 'fa-', 
    'glyph', 'download-icons', 'verify-icons', 'audit-icons'
  ],
  'testing': [
    'test', 'jest', 'cypress', 'spec', 'validation', 'verify', 'measure-bundle',
    'find-any-types', 'find-img-tags', 'find-hook-issues'
  ],
  'linting': [
    'lint', 'eslint', 'stylelint', 'prettier', 'format', 'fix-',
    'check-', 'validate-'
  ],
  'documentation': [
    'doc', 'docs', 'document', 'readme', 'api', 'jsdoc', 'generate-docs'
  ],
  'build': [
    'build', 'webpack', 'rollup', 'compile', 'minify', 'bundle', 'deploy',
    'publish', 'release', 'centralize-config'
  ],
  'cleanup': [
    'cleanup', 'clean', 'prune', 'remove', 'delete', 'consolidate', 
    'backup', 'rename-files'
  ],
  'db': [
    'db', 'database', 'migrate', 'seed', 'sql', 'schema', 'set-admin'
  ],
  'utils': ['util', 'helper', 'tools']
};

// Source and destination directories
const UTILS_DIR = 'scripts/consolidated/utils';
const BASE_DIR = 'scripts/consolidated';

// Function to determine the category of a script based on its name and content
function determineCategory(filePath) {
  const fileName = path.basename(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
  
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    // Check if any pattern matches the filename
    if (patterns.some(pattern => fileName.includes(pattern))) {
      return category;
    }
    
    // Check if any pattern matches in the file content (first 1000 characters)
    const contentSample = content.substring(0, 1000);
    if (patterns.some(pattern => contentSample.includes(pattern))) {
      return category;
    }
  }
  
  // Default to utils if no specific category is identified
  return 'utils';
}

// Function to move a file to its appropriate category directory
function moveToCategory(filePath, category) {
  const fileName = path.basename(filePath);
  const targetDir = path.join(BASE_DIR, category);
  const targetPath = path.join(targetDir, fileName);
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Skip if target file already exists
  if (fs.existsSync(targetPath)) {
    console.log(`Target file already exists: ${targetPath}`);
    return false;
  }
  
  try {
    // Copy file to target directory
    fs.copyFileSync(filePath, targetPath);
    // Remove from utils directory
    fs.unlinkSync(filePath);
    console.log(`Moved ${fileName} from utils to ${category}`);
    return true;
  } catch (error) {
    console.error(`Error moving ${fileName}: ${error.message}`);
    return false;
  }
}

// Main function to reorganize utils directory
function reorganizeUtils() {
  console.log('Starting utils directory reorganization...');
  
  // Get all files in utils directory
  const files = fs.readdirSync(UTILS_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(UTILS_DIR, file));
  
  console.log(`Found ${files.length} scripts in utils directory`);
  
  // Track movements by category
  const movements = {};
  Object.keys(categoryPatterns).forEach(category => {
    movements[category] = 0;
  });
  
  // Process each file
  for (const file of files) {
    const category = determineCategory(file);
    
    // Skip if file should stay in utils
    if (category === 'utils') {
      continue;
    }
    
    if (moveToCategory(file, category)) {
      movements[category]++;
    }
  }
  
  // Report movements
  console.log('\nReorganization summary:');
  for (const [category, count] of Object.entries(movements)) {
    if (count > 0) {
      console.log(`- Moved ${count} scripts to ${category}`);
    }
  }
  
  console.log(`\nRemaining scripts in utils: ${fs.readdirSync(UTILS_DIR).filter(file => file.endsWith('.js')).length}`);
  console.log('Utils directory reorganization completed.');
}

// Run the reorganization
reorganizeUtils(); 