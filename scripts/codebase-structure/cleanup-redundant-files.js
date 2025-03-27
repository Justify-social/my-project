#!/usr/bin/env node

/**
 * Codebase Redundancy Cleaner
 * 
 * This script identifies and optionally cleans up redundant or outdated files
 * such as backup files, temporary files, and deprecated components.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Get command-line args
const args = process.argv.slice(2);
const dryRun = !args.includes('--clean');

// Configuration
const PATTERNS_TO_FIND = [
  // Backup files
  '**/*.bak',
  '**/*.backup',
  '**/*.old',
  '**/*.orig',
  '**/*.previous',
  '**/*-bak.*',
  
  // Temporary files
  '**/temp/*',
  '**/tmp/*',
  '**/*.tmp',
  
  // Test files in non-standard locations
  'src/**/__tests__/**/*.js',
  'src/**/__tests__/**/*.ts',
  
  // Deprecated or duplicate components
  '**/OLD_*.tsx',
  '**/OLD_*.ts',
  '**/*.deprecated.*',
  
  // Debug files
  '**/*.debug.*',
  '**/debug-*.ts',
  '**/debug-*.tsx',
  
  // Source maps that shouldn't be in source control
  '**/*.js.map',
  '**/*.css.map',
  
  // Compiler output that shouldn't be in source control
  '**/dist/**',
  '**/build/**',
  
  // Log files
  '**/*.log',
  '**/logs/*.txt'
];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'public'
];

// Files to keep regardless of pattern match
const KEEP_FILES = [
  'jest.setup.js',
  'next.config.js',
  'postcss.config.js',
  'tailwind.config.js'
];

// Files to check for deprecation comments
const DEPRECATION_PATTERNS = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx'
];

// Storage for identified files
const redundantFiles = {
  backups: [],
  tempFiles: [],
  nonStandardTests: [],
  deprecated: [],
  debugFiles: [],
  sourceMaps: [],
  compilerOutput: [],
  logFiles: [],
  filesWithDeprecationComments: []
};

/**
 * Categorizes a file based on its path
 */
function categorizeFile(filePath) {
  const fileName = path.basename(filePath);
  
  // Skip files we explicitly want to keep
  if (KEEP_FILES.includes(fileName)) {
    return;
  }
  
  // Skip files in excluded directories
  for (const dir of EXCLUDE_DIRS) {
    if (filePath.includes(`/${dir}/`)) {
      return;
    }
  }
  
  // Categorize by file patterns
  if (/\.(bak|backup|old|orig|previous)$/.test(filePath) || /-bak\.[^.]+$/.test(filePath)) {
    redundantFiles.backups.push(filePath);
  } else if (/\/(temp|tmp)\//.test(filePath) || /\.tmp$/.test(filePath)) {
    redundantFiles.tempFiles.push(filePath);
  } else if (/\/__tests__\/.*\.(js|ts)$/.test(filePath)) {
    redundantFiles.nonStandardTests.push(filePath);
  } else if (/\/OLD_.*\.(tsx|ts)$/.test(filePath) || /\.deprecated\.[^.]+$/.test(filePath)) {
    redundantFiles.deprecated.push(filePath);
  } else if (/\.debug\.[^.]+$/.test(filePath) || /\/debug-.*\.(ts|tsx)$/.test(filePath)) {
    redundantFiles.debugFiles.push(filePath);
  } else if (/\.(js|css)\.map$/.test(filePath)) {
    redundantFiles.sourceMaps.push(filePath);
  } else if (/\/(dist|build)\//.test(filePath)) {
    redundantFiles.compilerOutput.push(filePath);
  } else if (/\.log$/.test(filePath) || /\/logs\/.*\.txt$/.test(filePath)) {
    redundantFiles.logFiles.push(filePath);
  }
}

/**
 * Finds files with deprecation comments
 */
function findFilesWithDeprecationComments() {
  const files = [];
  
  for (const pattern of DEPRECATION_PATTERNS) {
    const matches = glob.sync(pattern, { ignore: EXCLUDE_DIRS.map(dir => `${dir}/**`) });
    
    for (const filePath of matches) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('@deprecated') || 
            content.includes('* DEPRECATED') || 
            content.includes('// DEPRECATED')) {
          files.push(filePath);
        }
      } catch (err) {
        console.error(`Error reading file ${filePath}:`, err.message);
      }
    }
  }
  
  return files;
}

/**
 * Finds all redundant files
 */
function findRedundantFiles() {
  for (const pattern of PATTERNS_TO_FIND) {
    const matches = glob.sync(pattern, { ignore: EXCLUDE_DIRS.map(dir => `${dir}/**`) });
    for (const filePath of matches) {
      categorizeFile(filePath);
    }
  }
  
  // Find deprecated files by comment content
  redundantFiles.filesWithDeprecationComments = findFilesWithDeprecationComments();
}

/**
 * Deletes a file from the filesystem
 */
function deleteFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch (err) {
    console.error(`Error deleting ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Generates a cleanup script
 */
function generateCleanupScript() {
  const commands = [];
  
  // Add commands for each category
  Object.values(redundantFiles).forEach(files => {
    files.forEach(file => {
      commands.push(`rm "${file}"`);
    });
  });
  
  return commands.join('\n');
}

/**
 * Executes the cleanup
 */
function executeCleanup() {
  let deletedCount = 0;
  let errorCount = 0;
  
  // Process each category
  Object.values(redundantFiles).forEach(files => {
    files.forEach(file => {
      if (deleteFile(file)) {
        deletedCount++;
        console.log(chalk.green(`✓ Deleted: ${file}`));
      } else {
        errorCount++;
      }
    });
  });
  
  console.log('\n' + chalk.blue('=== Cleanup Summary ==='));
  console.log(chalk.green(`✓ Successfully deleted ${deletedCount} files`));
  
  if (errorCount > 0) {
    console.log(chalk.red(`✗ Failed to delete ${errorCount} files`));
  }
}

/**
 * Prints a summary of the redundant files
 */
function printSummary() {
  const totalCount = Object.values(redundantFiles)
    .reduce((sum, files) => sum + files.length, 0);
  
  console.log('\n' + chalk.blue('=== Redundant Files Summary ==='));
  console.log(chalk.yellow(`Total redundant files found: ${totalCount}`));
  
  if (redundantFiles.backups.length > 0) {
    console.log('\n' + chalk.yellow('Backup Files:'));
    redundantFiles.backups.forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  if (redundantFiles.tempFiles.length > 0) {
    console.log('\n' + chalk.yellow('Temporary Files:'));
    redundantFiles.tempFiles.forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  if (redundantFiles.nonStandardTests.length > 0) {
    console.log('\n' + chalk.yellow('Non-Standard Test Files:'));
    redundantFiles.nonStandardTests.forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  if (redundantFiles.deprecated.length > 0) {
    console.log('\n' + chalk.yellow('Deprecated Files:'));
    redundantFiles.deprecated.forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  if (redundantFiles.debugFiles.length > 0) {
    console.log('\n' + chalk.yellow('Debug Files:'));
    redundantFiles.debugFiles.forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  if (redundantFiles.filesWithDeprecationComments.length > 0) {
    console.log('\n' + chalk.yellow('Files with Deprecation Comments:'));
    redundantFiles.filesWithDeprecationComments.forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  if (redundantFiles.sourceMaps.length > 0) {
    console.log('\n' + chalk.yellow('Source Maps:'));
    redundantFiles.sourceMaps.forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  if (redundantFiles.compilerOutput.length > 0) {
    console.log('\n' + chalk.yellow('Compiler Output:'));
    redundantFiles.compilerOutput.forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  if (redundantFiles.logFiles.length > 0) {
    console.log('\n' + chalk.yellow('Log Files:'));
    redundantFiles.logFiles.forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  if (dryRun && totalCount > 0) {
    console.log('\n' + chalk.blue('=== Cleanup Script ==='));
    console.log('To remove these files, you can run:');
    console.log('\n```bash');
    console.log(generateCleanupScript());
    console.log('```\n');
    console.log('Or run this script with the --clean flag:');
    console.log('node scripts/codebase-structure/cleanup-redundant-files.js --clean');
  }
}

/**
 * Main execution function
 */
function main() {
  console.log(chalk.blue('🔍 Searching for redundant files...'));
  
  // Find all redundant files
  findRedundantFiles();
  
  // Print summary
  printSummary();
  
  // Execute cleanup if not in dry run mode
  if (!dryRun) {
    console.log('\n' + chalk.blue('🧹 Cleaning up redundant files...'));
    executeCleanup();
  }
}

// Execute
main(); 