#!/usr/bin/env node

/**
 * Migration Script: Find HeroIcon Imports
 * 
 * This script scans the codebase for direct imports from @heroicons/react
 * to help with the Font Awesome migration process.
 * 
 * Usage:
 * node scripts/find-heroicon-imports.js
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.next',
  'public',
  'temp-icon-analysis'
];

const HEROICON_IMPORT_REGEX = /from\s+['"]@heroicons\/react/;

async function main() {
  try {
    console.log('🔍 Scanning codebase for direct HeroIcon imports...\n');
    
    // Use ripgrep for fast searching if available
    try {
      const { stdout } = await exec(
        `rg -l "from\\s+['\\\"]@heroicons/react" ${SRC_DIR} --type ts --type tsx --type jsx`
      );
      
      const files = stdout.trim().split('\n').filter(file => file);
      
      if (files.length === 0) {
        console.log('✅ No files with direct HeroIcon imports found!');
        return;
      }
      
      console.log(`🚨 Found ${files.length} files with direct HeroIcon imports:\n`);
      
      // Group by directory for better organization
      const filesByDirectory = {};
      
      for (const file of files) {
        const relativeFile = path.relative(ROOT_DIR, file);
        const directory = path.dirname(relativeFile);
        
        if (!filesByDirectory[directory]) {
          filesByDirectory[directory] = [];
        }
        
        filesByDirectory[directory].push(path.basename(file));
      }
      
      // Print grouped results
      for (const directory in filesByDirectory) {
        console.log(`📁 ${directory}`);
        for (const file of filesByDirectory[directory]) {
          console.log(`  - ${file}`);
        }
        console.log('');
      }
      
      console.log('Migration Action Plan:');
      console.log('1. Replace direct imports with the migrateHeroIcon helper');
      console.log('2. Update <HeroIcon> components to {migrateHeroIcon("HeroIconName", props)}');
      console.log('3. After all files are migrated, remove React-Icons dependencies');
      
    } catch (error) {
      // Fallback to manual traversal if ripgrep is not available
      console.log('⚠️ Ripgrep not available, falling back to manual file traversal (slower)');
      const files = await scanDirectoryRecursive(SRC_DIR);
      
      if (files.length === 0) {
        console.log('✅ No files with direct HeroIcon imports found!');
        return;
      }
      
      console.log(`🚨 Found ${files.length} files with direct HeroIcon imports:\n`);
      
      for (const file of files) {
        console.log(`- ${path.relative(ROOT_DIR, file)}`);
      }
    }
    
  } catch (error) {
    console.error('Error scanning codebase:', error);
    process.exit(1);
  }
}

// Recursive function to scan directories and find files with HeroIcon imports
async function scanDirectoryRecursive(directory) {
  const result = [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    // Skip ignored directories
    if (entry.isDirectory() && !IGNORE_PATTERNS.includes(entry.name)) {
      const subDirectoryFiles = await scanDirectoryRecursive(fullPath);
      result.push(...subDirectoryFiles);
      continue;
    }
    
    // Only process TypeScript/JavaScript files
    if (
      entry.isFile() && 
      /\.(tsx?|jsx?)$/.test(entry.name) &&
      !IGNORE_PATTERNS.some(pattern => fullPath.includes(pattern))
    ) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (HEROICON_IMPORT_REGEX.test(content)) {
        result.push(fullPath);
      }
    }
  }
  
  return result;
}

main().catch(console.error); 