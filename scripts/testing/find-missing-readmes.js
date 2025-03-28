#!/usr/bin/env node

/**
 * Script to identify UI component directories that are missing README.md files
 * 
 * This helps with the README standardization effort by identifying
 * which component directories need documentation.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Configuration
const UI_COMPONENTS_DIR = path.join(process.cwd(), 'src', 'components', 'ui');
const IGNORE_DIRS = ['.git', 'node_modules', '__tests__', 'test', 'tests'];

// Stats
let totalDirs = 0;
let missingReadmes = 0;
let emptyReadmes = 0;
let completeReadmes = 0;

/**
 * Checks if a README.md exists in the given directory
 * @param {string} dirPath - Path to check
 * @returns {Object} - Status of README (exists, isEmpty, content)
 */
function checkReadmeStatus(dirPath) {
  const readmePath = path.join(dirPath, 'README.md');
  
  if (!fs.existsSync(readmePath)) {
    return { exists: false };
  }
  
  const content = fs.readFileSync(readmePath, 'utf8');
  const isEmpty = content.trim().length < 100; // Consider READMEs with less than 100 chars as empty/stub
  
  return {
    exists: true,
    isEmpty,
    content
  };
}

/**
 * Recursively scan directories for missing README.md files
 * @param {string} dir - Directory to scan
 * @param {Array} results - Array to collect results
 */
function scanDirectories(dir, results = []) {
  if (!fs.existsSync(dir)) {
    console.error(chalk.red(`Directory not found: ${dir}`));
    return results;
  }
  
  const items = fs.readdirSync(dir);
  
  // Check if this is a component directory (has .tsx files)
  const hasTsxFiles = items.some(item => item.endsWith('.tsx'));
  
  if (hasTsxFiles) {
    totalDirs++;
    const readmeStatus = checkReadmeStatus(dir);
    
    if (!readmeStatus.exists) {
      results.push({ dir, status: 'missing' });
      missingReadmes++;
    } else if (readmeStatus.isEmpty) {
      results.push({ dir, status: 'empty' });
      emptyReadmes++;
    } else {
      completeReadmes++;
    }
  }
  
  // Recursively check subdirectories
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    if (
      fs.statSync(itemPath).isDirectory() && 
      !IGNORE_DIRS.includes(item)
    ) {
      scanDirectories(itemPath, results);
    }
  });
  
  return results;
}

// Main execution
console.log(chalk.cyan.bold('Scanning UI components for missing README.md files...'));
const missing = scanDirectories(UI_COMPONENTS_DIR);

console.log(chalk.yellow.bold('\nMissing READMEs:'));
missing.filter(item => item.status === 'missing').forEach(item => {
  console.log(chalk.red(`  - ${path.relative(process.cwd(), item.dir)}`));
});

console.log(chalk.yellow.bold('\nEmpty/Stub READMEs:'));
missing.filter(item => item.status === 'empty').forEach(item => {
  console.log(chalk.yellow(`  - ${path.relative(process.cwd(), item.dir)}`));
});

console.log(chalk.green.bold('\nSummary:'));
console.log(`Total component directories: ${chalk.white.bold(totalDirs)}`);
console.log(`Complete READMEs: ${chalk.green.bold(completeReadmes)}`);
console.log(`Empty READMEs: ${chalk.yellow.bold(emptyReadmes)}`);
console.log(`Missing READMEs: ${chalk.red.bold(missingReadmes)}`);
console.log(`Documentation coverage: ${chalk.cyan.bold(Math.round((completeReadmes / totalDirs) * 100) + '%')}`);

// Provide next steps
console.log(chalk.cyan.bold('\nNext Steps:'));
console.log('1. Create READMEs for missing directories first');
console.log('2. Improve stub READMEs with complete documentation');
console.log('3. Run this script again to track progress');
console.log(`\nUse the README template at: ${chalk.green('scripts/templates/README-template.md')}`); 