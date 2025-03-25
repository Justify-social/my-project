#!/usr/bin/env node

/**
 * Copy Documentation Files Script
 * 
 * This script copies documentation files from a source directory to a destination directory.
 * It's used to ensure all documentation files are available to the admin users through the debug tools.
 * 
 * Usage:
 *   node src/scripts/copy-doc-files.js --src=<source_dir> --dest=<destination_dir>
 * 
 * Options:
 *   --src    Source directory (defaults to /Users/edadams/my-project/docs/)
 *   --dest   Destination directory (defaults to docs/ in the current working directory)
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const srcArg = args.find(arg => arg.startsWith('--src='));
const destArg = args.find(arg => arg.startsWith('--dest='));

const srcDir = srcArg 
  ? srcArg.split('=')[1] 
  : '/Users/edadams/my-project/docs/';

const destDir = destArg 
  ? destArg.split('=')[1] 
  : path.join(process.cwd(), 'docs');

console.log(`
📋 Copy Documentation Files
==========================
Source: ${srcDir}
Destination: ${destDir}
`);

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  console.log(`Creating destination directory: ${destDir}`);
  fs.mkdirSync(destDir, { recursive: true });
}

// Get list of files in source directory
try {
  const files = fs.readdirSync(srcDir);
  console.log(`Found ${files.length} files in source directory`);
  
  // Copy each file
  files.forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    
    // Skip directories
    if (fs.statSync(srcFile).isDirectory()) {
      console.log(`Skipping directory: ${file}`);
      return;
    }
    
    // Only copy markdown files
    if (!file.endsWith('.md')) {
      console.log(`Skipping non-markdown file: ${file}`);
      return;
    }
    
    try {
      // Copy file
      fs.copyFileSync(srcFile, destFile);
      console.log(`Copied: ${file}`);
    } catch (error) {
      console.error(`Error copying ${file}:`, error.message);
    }
  });
  
  console.log('\n✅ File copy completed');
} catch (error) {
  console.error(`Error reading source directory: ${error.message}`);
  process.exit(1);
} 