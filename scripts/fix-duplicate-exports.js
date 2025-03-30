#!/usr/bin/env node

/**
 * Fix Duplicate Default Exports Script
 * 
 * This script scans component files for duplicate default exports
 * and removes any auto-generated exports if a proper export already exists.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const UI_COMPONENTS_ROOT = path.resolve(__dirname, '../src/components/ui');
const COMPONENT_CATEGORIES = ['atoms', 'molecules', 'organisms'];

// Function to check for and fix duplicate default exports
function fixDuplicateExports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has multiple default exports
    const defaultExportCount = (content.match(/export\s+default|export\s+\{\s*[^{}]+\s+as\s+default\s*\}/g) || []).length;
    
    if (defaultExportCount > 1) {
      console.log(`⚠️ Found ${defaultExportCount} default exports in ${filePath}`);
      
      // Check if there's a proper named export as default
      const hasNamedDefault = /export\s+\{\s*[^{}]+\s+as\s+default\s*\}/.test(content);
      
      if (hasNamedDefault) {
        // If we have a proper named default, remove the auto-generated one
        const fixedContent = content.replace(/\/\/\s*Default export added by auto-fix script\s*\nexport default \{[^}]*\};?/s, '');
        
        if (fixedContent !== content) {
          fs.writeFileSync(filePath, fixedContent);
          console.log(`✅ Fixed duplicate export in ${filePath}`);
          return 1; // Count as fixed
        }
      }
    }
    
    return 0; // No fix needed
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Function to recursively process a directory
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedFiles = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Process subdirectories
      fixedFiles += processDirectory(filePath);
    } else if ((file === 'index.ts' || file === 'index.tsx') && !filePath.includes('node_modules')) {
      // Process index files
      fixedFiles += fixDuplicateExports(filePath);
    }
  }
  
  return fixedFiles;
}

// Main execution
console.log('==================================================');
console.log('Fixing Duplicate Default Exports');
console.log('==================================================');

let totalFixed = 0;

for (const category of COMPONENT_CATEGORIES) {
  const categoryPath = path.join(UI_COMPONENTS_ROOT, category);
  console.log(`\nProcessing ${category}...`);
  
  if (fs.existsSync(categoryPath)) {
    const fixed = processDirectory(categoryPath);
    totalFixed += fixed;
    console.log(`Fixed ${fixed} files in ${category}`);
  } else {
    console.log(`Directory not found: ${categoryPath}`);
  }
}

console.log('\n==================================================');
console.log(`Total files fixed: ${totalFixed}`);
console.log('=================================================='); 