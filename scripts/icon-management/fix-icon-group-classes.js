#!/usr/bin/env node

/**
 * fix-icon-group-classes.js
 * 
 * This script automatically identifies and fixes button icons with missing parent group classes
 * across the codebase. It uses regex to find all instances of <Icon iconType="button"> and
 * ensures their parent elements have the "group" class.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Use glob pattern to find all React files in the src directory
let files = [];
try {
  const globCmd = 'find src -type f -name "*.tsx" -o -name "*.jsx"';
  const output = execSync(globCmd).toString();
  files = output.trim().split('\n').filter(Boolean);
  console.log(`Found ${files.length} React files to scan...`);
} catch (error) {
  console.error('Error finding files:', error);
  process.exit(1);
}

// Pattern to find button icons without group class
const ICON_REGEX = /<Icon.*?\siconType=["']button["'].*?\/>/g;
const PARENT_REGEX = /<(\w+).*?class.*?=.*?["']([^"']*?)["'].*?>.*?<Icon.*?\siconType=["']button["'].*?\/>/gs;

// Counter for stats
let totalFilesFixed = 0;
let totalInstancesFixed = 0;

// Function to add group class to element
function addGroupClass(match, tag, classes) {
  if (classes.includes('group')) return match;
  
  // Add 'group' class to className attribute
  const newClasses = `${classes} group`;
  const newMatch = match.replace(`class="${classes}"`, `class="${newClasses}"`);
  
  return newMatch;
}

// Process each file
files.forEach(file => {
  const filepath = path.join(process.cwd(), file);
  
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;
    let instancesFixed = 0;
    
    // Check for button icons and their parent elements
    const newContent = content.replace(PARENT_REGEX, (match, tag, classes) => {
      if (!classes.includes('group')) {
        instancesFixed++;
        modified = true;
        return addGroupClass(match, tag, classes);
      }
      return match;
    });
    
    // Save changes if the file was modified
    if (modified) {
      fs.writeFileSync(filepath, newContent);
      totalFilesFixed++;
      totalInstancesFixed += instancesFixed;
      console.log(`✅ Fixed ${instancesFixed} instance(s) in ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n====== Fix Summary ======');
console.log(`Total files scanned: ${files.length}`);
console.log(`Files fixed: ${totalFilesFixed}`);
console.log(`Total instances fixed: ${totalInstancesFixed}`);
console.log('========================\n');

if (totalInstancesFixed > 0) {
  console.log('🎉 Fixed all missing group classes for button icons!');
  console.log('Run "npm run dev" to see the changes in action.');
} else {
  console.log('No issues found. All button icons have proper parent group classes.');
} 