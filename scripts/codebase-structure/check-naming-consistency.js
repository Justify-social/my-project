#!/usr/bin/env node

/**
 * File Naming Consistency Checker
 * 
 * This script analyzes the codebase to find inconsistent naming patterns
 * and suggests fixes to maintain standard naming conventions.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const DIRECTORIES_TO_CHECK = [
  'src/components',
  'src/hooks',
  'src/contexts',
  'src/middlewares',
  'src/app',
  'src/lib',
  'src/utils',
  'src/services'
];

// Naming conventions
const CONVENTIONS = {
  directories: {
    pattern: /^[a-z0-9-]+$/,  // kebab-case
    description: 'kebab-case (lowercase with hyphens)'
  },
  components: {
    pattern: /^[A-Z][a-zA-Z0-9]*\.(tsx|jsx)$/,  // PascalCase
    description: 'PascalCase with .tsx/.jsx extension'
  },
  hooks: {
    pattern: /^use[A-Z][a-zA-Z0-9]*\.(ts|tsx)$/,  // camelCase starting with use
    description: 'camelCase starting with "use" and .ts/.tsx extension'
  },
  utils: {
    pattern: /^[a-z][a-zA-Z0-9-]*\.(ts|js)$/,  // camelCase or kebab-case
    description: 'camelCase or kebab-case with .ts/.js extension'
  },
  tests: {
    pattern: /^[a-zA-Z0-9-]+\.(test|spec)\.(ts|tsx|js|jsx)$/,  // anything ending with .test.* or .spec.*
    description: 'Filename followed by .test or .spec with appropriate extension'
  }
};

// Results tracking
const issues = {
  directories: [],
  files: [],
  recommendations: []
};

/**
 * Gets the correct convention pattern for a file based on its path and name
 */
function getConventionForFile(filePath, fileName) {
  if (fileName.includes('.test.') || fileName.includes('.spec.')) {
    return CONVENTIONS.tests;
  }
  
  if (filePath.includes('/components/')) {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
      return CONVENTIONS.components;
    }
  }
  
  if (filePath.includes('/hooks/')) {
    return CONVENTIONS.hooks;
  }
  
  return CONVENTIONS.utils;
}

/**
 * Checks if a directory name follows the convention
 */
function checkDirectoryNaming(dirPath) {
  const dirName = path.basename(dirPath);
  
  // Skip node_modules and certain dot directories
  if (dirName === 'node_modules' || dirName.startsWith('.')) {
    return;
  }
  
  if (!CONVENTIONS.directories.pattern.test(dirName)) {
    issues.directories.push({
      path: dirPath,
      name: dirName,
      expected: CONVENTIONS.directories.description
    });
  }
  
  // Recursively check subdirectories
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      checkDirectoryNaming(fullPath);
    } else if (entry.isFile()) {
      checkFileNaming(fullPath);
    }
  });
}

/**
 * Checks if a file name follows the appropriate convention
 */
function checkFileNaming(filePath) {
  const fileName = path.basename(filePath);
  const convention = getConventionForFile(filePath, fileName);
  
  // Skip certain files
  if (fileName.startsWith('.') || fileName === 'index.ts' || fileName === 'index.tsx' || 
      fileName === 'types.ts' || fileName === 'constants.ts') {
    return;
  }
  
  if (!convention.pattern.test(fileName)) {
    issues.files.push({
      path: filePath,
      name: fileName,
      expected: convention.description
    });
    
    // Generate recommendation
    generateRecommendation(filePath, fileName, convention);
  }
}

/**
 * Generates a recommendation for fixing a file name
 */
function generateRecommendation(filePath, fileName, convention) {
  let recommendedName = fileName;
  
  if (convention === CONVENTIONS.components && 
      !(fileName.charAt(0) === fileName.charAt(0).toUpperCase())) {
    // Convert to PascalCase
    recommendedName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
  } else if (convention === CONVENTIONS.hooks && !fileName.startsWith('use')) {
    // Add use prefix if it's a hook
    recommendedName = 'use' + fileName.charAt(0).toUpperCase() + fileName.slice(1);
  } else if (convention === CONVENTIONS.utils && 
             fileName.includes(' ') || fileName.includes('_')) {
    // Convert to kebab-case
    recommendedName = fileName
      .replace(/\s+/g, '-')
      .replace(/_+/g, '-')
      .toLowerCase();
  }
  
  if (recommendedName !== fileName) {
    const dir = path.dirname(filePath);
    const newPath = path.join(dir, recommendedName);
    
    issues.recommendations.push({
      oldPath: filePath,
      newPath: newPath,
      command: `mv "${filePath}" "${newPath}"`
    });
  }
}

/**
 * Main execution function
 */
function main() {
  console.log(chalk.blue('🔍 Checking file naming consistency...'));
  
  DIRECTORIES_TO_CHECK.forEach(dir => {
    if (fs.existsSync(dir)) {
      checkDirectoryNaming(dir);
    } else {
      console.warn(chalk.yellow(`⚠️  Directory ${dir} does not exist`));
    }
  });
  
  // Print summary
  console.log('\n' + chalk.blue('=== Summary ==='));
  console.log(chalk.yellow(`Directory naming issues: ${issues.directories.length}`));
  console.log(chalk.yellow(`File naming issues: ${issues.files.length}`));
  
  // Print directory issues
  if (issues.directories.length > 0) {
    console.log('\n' + chalk.blue('=== Directory Naming Issues ==='));
    issues.directories.forEach(issue => {
      console.log(`${chalk.red('✘')} ${issue.path}`);
      console.log(`  Expected format: ${issue.expected}`);
    });
  }
  
  // Print file issues
  if (issues.files.length > 0) {
    console.log('\n' + chalk.blue('=== File Naming Issues ==='));
    issues.files.forEach(issue => {
      console.log(`${chalk.red('✘')} ${issue.path}`);
      console.log(`  Expected format: ${issue.expected}`);
    });
  }
  
  // Print recommendations
  if (issues.recommendations.length > 0) {
    console.log('\n' + chalk.blue('=== Recommendations ==='));
    console.log('Run the following commands to fix naming issues:');
    console.log('\n```bash');
    issues.recommendations.forEach(rec => {
      console.log(rec.command);
    });
    console.log('```\n');
  }
  
  // Final summary
  if (issues.directories.length === 0 && issues.files.length === 0) {
    console.log('\n' + chalk.green('✅ No naming consistency issues found!'));
  } else {
    console.log('\n' + chalk.yellow(`⚠️  Found ${issues.directories.length + issues.files.length} naming consistency issues`));
    console.log(chalk.yellow('Please fix these issues to maintain a consistent codebase'));
  }
}

// Execute
main(); 