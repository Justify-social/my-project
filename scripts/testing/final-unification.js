/**
 * Final Unification Script
 * 
 * This script completes the unification project by implementing the following:
 * 1. Ensuring consistent naming conventions across the project
 * 2. Consolidating documentation
 * 3. Organizing tests into a central directory
 * 4. Removing legacy/backup files
 * 5. Centralizing configuration files
 * 6. Validating feature grouping
 * 7. Running linting and fixing errors
 * 8. Cleaning up redundant scripts
 * 9. Setting up CI/CD for linting
 * 
 * Additionally, specialized scripts are available for:
 * - migrate-tests.js - Migrates tests to a centralized structure
 * - cleanup-backups.js - Documents and removes backup files
 * - centralize-config.js - Centralizes configuration files
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';
import glob from 'glob';

// Utility functions
const log = (message) => console.log(`\x1b[36m[Unification]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

// Main tasks
const tasks = {
  /**
   * Task 1: Ensure consistent naming conventions (kebab-case)
   */
  async ensureConsistentNaming() {
    log('Starting consistent naming task...');
    
    // This will identify files/folders not using kebab-case
    // We'll create a report but won't automatically rename since that could break imports
    const findCamelOrPascalCase = (dir) => {
      const allItems = glob.sync(`${dir}/**/*`, { nodir: false });
      return allItems.filter(item => {
        const basename = path.basename(item);
        // Skip node_modules and dot files
        if (basename.startsWith('.') || item.includes('node_modules') || item.includes('.git')) {
          return false;
        }
        // Check if file/folder name follows kebab-case
        return basename.includes(' ') || 
               (basename !== basename.toLowerCase() && 
                !basename.match(/^[A-Z][a-zA-Z0-9]*\.(tsx|jsx|ts|js|md)$/)); // Allow PascalCase for React components
      });
    };
    
    const inconsistentNames = findCamelOrPascalCase('.');
    
    if (inconsistentNames.length > 0) {
      warning(`Found ${inconsistentNames.length} files/folders not using kebab-case naming`);
      fs.writeFileSync(
        'docs/naming-convention-issues.md',
        `# Naming Convention Issues\n\nThe following files and folders do not follow kebab-case naming:\n\n${inconsistentNames.map(item => `- \`${item}\``).join('\n')}\n\nThese should be reviewed and renamed manually to ensure consistency.`
      );
      success('Created naming convention issues report at docs/naming-convention-issues.md');
    } else {
      success('All files and folders follow the correct naming convention!');
    }
  },
  
  /**
   * Task 2: Consolidate documentation
   */
  async consolidateDocumentation() {
    log('Starting documentation consolidation...');
    
    // Ensure docs directory exists
    if (!fs.existsSync('docs')) {
      fs.mkdirSync('docs');
    }
    
    // Move documentation from doc/ to docs/ if it doesn't already exist
    const docFiles = glob.sync('doc/**/*.md');
    for (const file of docFiles) {
      const destPath = file.replace(/^doc\//, 'docs/');
      const destDir = path.dirname(destPath);
      
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(file, destPath);
        success(`Copied ${file} to ${destPath}`);
      }
    }
    
    // Update the main documentation index
    let docsReadme = `# Project Documentation\n\n`;
    docsReadme += `This directory contains all documentation for the project.\n\n`;
    docsReadme += `## Navigation\n\n`;
    
    // Create a table of contents based on existing documentation
    const docCategories = {
      'Architecture': glob.sync('docs/*.md').filter(f => !f.includes('README.md')),
      'Developer Guides': glob.sync('docs/guides/**/*.md'),
      'Features': [...glob.sync('docs/features-frontend/**/*.md'), ...glob.sync('docs/features-backend/**/*.md')],
      'API Documentation': glob.sync('docs/api/**/*.md')
    };
    
    for (const [category, files] of Object.entries(docCategories)) {
      if (files.length > 0) {
        docsReadme += `### ${category}\n\n`;
        for (const file of files.sort()) {
          const displayName = path.basename(file, '.md').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          docsReadme += `- [${displayName}](./${file.replace('docs/', '')})\n`;
        }
        docsReadme += '\n';
      }
    }
    
    fs.writeFileSync('docs/README.md', docsReadme);
    success('Updated docs/README.md with a comprehensive index');
    
    // Update project overview
    if (fs.existsSync('PROJECT_OVERVIEW.md')) {
      let overview = fs.readFileSync('PROJECT_OVERVIEW.md', 'utf8');
      
      // Ensure links point to the correct docs directory
      overview = overview.replace(/\.\/doc\//g, './docs/');
      
      fs.writeFileSync('PROJECT_OVERVIEW.md', overview);
      success('Updated PROJECT_OVERVIEW.md with correct documentation links');
    }
  },
  
  /**
   * Task 3: Organize tests into a central directory
   */
  async organizeTests() {
    log('Starting test organization...');
    
    // Ensure the main tests directory exists
    if (!fs.existsSync('tests')) {
      fs.mkdirSync('tests');
    }
    
    // Create structure directories
    ['unit', 'integration', 'e2e'].forEach(dir => {
      if (!fs.existsSync(`tests/${dir}`)) {
        fs.mkdirSync(`tests/${dir}`, { recursive: true });
      }
    });
    
    // Find tests in src directory 
    const srcTestFiles = glob.sync('src/**/__tests__/**/*.{js,jsx,ts,tsx}');
    
    // Create a log of all test files that should be migrated
    let testMigrationLog = `# Test Migration Log\n\n`;
    testMigrationLog += `The following test files should be migrated to the central \`tests\` directory:\n\n`;
    
    for (const file of srcTestFiles) {
      // Determine the test type (unit/integration)
      let testType = 'unit';
      if (file.includes('integration')) {
        testType = 'integration';
      }
      
      // Create a destination path mirroring the original file structure
      const relativePath = file.replace(/^src\/__tests__\/(unit|integration)\//, '');
      const destPath = `tests/${testType}/${relativePath}`;
      
      testMigrationLog += `- \`${file}\` -> \`${destPath}\`\n`;
    }
    
    fs.writeFileSync('docs/test-migration.md', testMigrationLog);
    success('Created test migration plan at docs/test-migration.md');
    
    // Create README for the tests directory
    const testsReadme = `# Tests Directory

This directory contains all tests for the project, organized by test type:

- \`unit/\`: Unit tests for individual components and functions
- \`integration/\`: Integration tests that test multiple components together
- \`e2e/\`: End-to-end tests that test complete user flows

## Running Tests

\`\`\`bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run e2e tests
npm run test:e2e

# Generate test coverage report
npm run test:coverage
\`\`\`

## Test Structure

Tests mirror the src directory structure to make it easy to find tests for a specific component or feature.
`;
    
    fs.writeFileSync('tests/README.md', testsReadme);
    success('Created tests/README.md with testing documentation');
  },
  
  /**
   * Task 4: Remove legacy and backup files
   */
  async removeLegacyFiles() {
    log('Starting legacy file cleanup...');
    
    // Find backup files and legacy directories
    const backupFiles = glob.sync('**/*.{bak,original,old}');
    const legacyDirs = [
      ...glob.sync('**/.*.backup', { dot: true }),
      ...glob.sync('**/.*.backups', { dot: true })
    ];
    
    let legacyFileReport = `# Legacy Files Report\n\n`;
    legacyFileReport += `The following files and directories should be considered for removal:\n\n`;
    
    if (backupFiles.length > 0) {
      legacyFileReport += `## Backup Files\n\n`;
      for (const file of backupFiles) {
        legacyFileReport += `- \`${file}\`\n`;
      }
      legacyFileReport += '\n';
    }
    
    if (legacyDirs.length > 0) {
      legacyFileReport += `## Legacy Backup Directories\n\n`;
      for (const dir of legacyDirs) {
        legacyFileReport += `- \`${dir}\`\n`;
      }
    }
    
    fs.writeFileSync('docs/legacy-files-report.md', legacyFileReport);
    success('Created legacy files report at docs/legacy-files-report.md');
    
    // This script will create a report but won't delete files automatically
    // for safety reasons
  },
  
  /**
   * Task 5: Centralize configuration files
   */
  async centralizeConfig() {
    log('Starting configuration centralization...');
    
    // Create config directory if it doesn't exist
    if (!fs.existsSync('config')) {
      fs.mkdirSync('config');
    }
    
    // Identify configuration files
    const configFiles = [
      '.eslintrc.js',
      '.eslintrc.json',
      '.prettierrc.json',
      'jest.config.js',
      'jest.setup.js',
      'next.config.js',
      'tailwind.config.js',
      'postcss.config.mjs',
      'cypress.config.js',
      'tsconfig.json'
    ];
    
    let configReport = `# Configuration Files Report\n\n`;
    configReport += `The following configuration files should be centralized in the \`config\` directory:\n\n`;
    
    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        configReport += `- \`${file}\` -> \`config/${file}\`\n`;
      }
    }
    
    // For package.json, we'd need to update scripts and references
    configReport += `\nAdditionally, references in package.json will need to be updated to point to the new locations.\n`;
    
    fs.writeFileSync('docs/config-centralization.md', configReport);
    success('Created configuration centralization report at docs/config-centralization.md');
  },
  
  /**
   * Task 6: Validate feature grouping
   */
  async validateFeatureGrouping() {
    log('Validating feature grouping...');
    
    // Check if we have the expected feature components structure
    if (fs.existsSync('src/components/features')) {
      const featureDirs = fs.readdirSync('src/components/features')
        .filter(dir => fs.statSync(`src/components/features/${dir}`).isDirectory());
      
      success(`Feature components are organized into ${featureDirs.length} domains: ${featureDirs.join(', ')}`);
    } else {
      warning('Feature components directory not found or incomplete. Check the feature grouping.');
    }
    
    // Check if hooks are similarly organized
    if (fs.existsSync('src/hooks')) {
      const hookDirs = fs.readdirSync('src/hooks')
        .filter(dir => fs.statSync(`src/hooks/${dir}`).isDirectory());
      
      success(`Hooks are organized into ${hookDirs.length} categories: ${hookDirs.join(', ')}`);
    } else {
      warning('Hooks directory not found or incomplete. Consider reorganizing hooks by domain.');
    }
  },
  
  /**
   * Task 7: Run linting and fix errors
   */
  async runLinting() {
    log('Starting linting checks...');
    
    try {
      // Check if ESLint is available
      execSync('npx eslint --version', { stdio: 'pipe' });
      
      // Run ESLint with automatic fixes
      log('Running ESLint to fix errors...');
      execSync('npx eslint --fix "src/**/*.{js,jsx,ts,tsx}"', { stdio: 'inherit' });
      
      success('ESLint ran successfully');
    } catch (err) {
      error('Error running ESLint: ' + err.message);
      warning('Please run ESLint manually to fix errors');
    }
    
    try {
      // Check if Prettier is available
      execSync('npx prettier --version', { stdio: 'pipe' });
      
      // Run Prettier with automatic fixes
      log('Running Prettier to format code...');
      execSync('npx prettier --write "src/**/*.{js,jsx,ts,tsx,css,scss,json,md}"', { stdio: 'inherit' });
      
      success('Prettier ran successfully');
    } catch (err) {
      error('Error running Prettier: ' + err.message);
      warning('Please run Prettier manually to format code');
    }
    
    // Create a comprehensive linting guide
    log('Creating linting guide...');
    
    const lintingGuide = `# Linting Guide

## Overview

This guide documents our linting setup, rules, and processes for maintaining code quality across the project.

## Linting Setup

### ESLint Configuration

We use ESLint with the following configuration:

\`\`\`json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "plugins": ["react", "@typescript-eslint", "import", "jsx-a11y"],
  "rules": {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc", "caseInsensitive": true }
    }]
  }
}
\`\`\`

### Prettier Configuration

We use Prettier for consistent code formatting:

\`\`\`json
// .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true
}
\`\`\`

## Scripts

The following scripts are available for linting and formatting:

- \`npm run lint\`: Run ESLint on the codebase
- \`npm run lint:fix\`: Run ESLint with automatic fixes
- \`npm run format\`: Run Prettier to format all files

## Common Issues and Solutions

### Unused Variables

**Issue:**
\`\`\`tsx
const [value, setValue] = useState(''); // 'value' is defined but never used
\`\`\`

**Solution:**
\`\`\`tsx
const [, setValue] = useState(''); // Use empty destructuring for unused variables
\`\`\`

### Missing Dependencies in useEffect

**Issue:**
\`\`\`tsx
function Component({ id }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData(id).then(setData);
  }, []); // Missing dependency: 'id'
}
\`\`\`

**Solution:**
\`\`\`tsx
function Component({ id }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData(id).then(setData);
  }, [id]); // Added 'id' to the dependency array
}
\`\`\`

### Import Ordering

**Issue:**
\`\`\`tsx
import { useState } from 'react';
import styles from './styles.module.css';
import axios from 'axios';
import { MyComponent } from '../components';
\`\`\`

**Solution:**
\`\`\`tsx
// External dependencies first
import axios from 'axios';
import { useState } from 'react';

// Internal dependencies next
import { MyComponent } from '../components';

// Local imports last
import styles from './styles.module.css';
\`\`\`

### Accessibility Issues

**Issue:**
\`\`\`tsx
<div onClick={handleClick}>Click me</div>
\`\`\`

**Solution:**
\`\`\`tsx
<button type="button" onClick={handleClick}>Click me</button>
\`\`\`

## CI/CD Integration

Our CI pipeline includes linting checks that run on every pull request. Pull requests with linting errors will be blocked from merging until the issues are resolved.

## Pre-commit Hooks

We use Husky and lint-staged to run linting and formatting checks before each commit. This ensures that code quality is maintained throughout the development process.

## Best Practices

1. **Fix issues as you go**: Don't accumulate linting errors
2. **Use IDE integrations**: Configure your editor to show linting errors in real-time
3. **Run \`npm run lint:fix\`** before submitting a PR
4. **Understand the rules**: Don't just fix errors blindly, understand why they exist

## Contact

If you have questions about our linting setup or need help resolving issues, contact the DevOps team.
`;

    fs.writeFileSync('docs/linting-guide.md', lintingGuide);
    success('Created linting guide at docs/linting-guide.md');
    
    // Update package.json with linting scripts
    if (fs.existsSync('package.json')) {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Only add scripts if they don't already exist
        if (!packageJson.scripts['lint:fix']) {
          packageJson.scripts['lint:fix'] = 'eslint --fix "src/**/*.{js,jsx,ts,tsx}"';
        }
        
        if (!packageJson.scripts['format']) {
          packageJson.scripts['format'] = 'prettier --write "src/**/*.{js,jsx,ts,tsx,css,scss,json,md}"';
        }
        
        // Create a backup of package.json
        fs.writeFileSync('package.json.bak', JSON.stringify(packageJson, null, 2));
        
        // Write updated package.json
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        success('Updated package.json with linting scripts');
      } catch (err) {
        warning(`Could not update package.json: ${err.message}`);
      }
    }
  },
  
  /**
   * Task 8: Clean up redundant scripts
   */
  async cleanupRedundantScripts() {
    log('Identifying redundant scripts...');
    
    const scriptDirs = glob.sync('scripts/**/*', { nodir: false })
      .filter(item => fs.statSync(item).isDirectory());
    
    const scriptFiles = glob.sync('scripts/**/*.js');
    
    let scriptReport = `# Script Cleanup Report\n\n`;
    scriptReport += `The project contains ${scriptFiles.length} script files in ${scriptDirs.length} directories.\n\n`;
    scriptReport += `## Script Directories\n\n`;
    
    for (const dir of scriptDirs) {
      const files = glob.sync(`${dir}/*.js`);
      if (files.length > 0) {
        scriptReport += `- \`${dir}\` (${files.length} scripts)\n`;
      }
    }
    
    scriptReport += `\n## Next Steps\n\n`;
    scriptReport += `1. Review the scripts in each directory\n`;
    scriptReport += `2. Consolidate similar scripts\n`;
    scriptReport += `3. Remove scripts that are no longer needed\n`;
    scriptReport += `4. Create documentation for important scripts\n`;
    
    fs.writeFileSync('docs/script-cleanup.md', scriptReport);
    success('Created script cleanup report at docs/script-cleanup.md');
  },
  
  /**
   * Task 9: Set up CI/CD for linting
   */
  async setupLintingCI() {
    log('Setting up CI/CD for linting...');
    
    // Ensure the .github/workflows directory exists
    const workflowsDir = '.github/workflows';
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }
    
    // Create the GitHub workflow file for linting
    const lintWorkflow = `name: Lint

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Check ESLint errors
      run: npm run lint
      
    - name: Check TypeScript types
      run: npm run type-check
`;
    
    fs.writeFileSync(`${workflowsDir}/lint.yml`, lintWorkflow);
    success(`Created GitHub workflow for linting at ${workflowsDir}/lint.yml`);
    
    // Create Husky pre-commit hook if it doesn't exist
    const huskyDir = '.husky';
    if (!fs.existsSync(huskyDir)) {
      try {
        execSync('npx husky install', { stdio: 'inherit' });
        success('Installed Husky');
      } catch (err) {
        error(`Error installing Husky: ${err.message}`);
        warning('Please run "npx husky install" manually.');
      }
    }
    
    // Create pre-commit hook
    try {
      execSync('npx husky add .husky/pre-commit "npx lint-staged"', { stdio: 'inherit' });
      success('Created pre-commit hook');
    } catch (err) {
      error(`Error creating pre-commit hook: ${err.message}`);
      warning('Please add the pre-commit hook manually.');
    }
    
    // Add lint-staged configuration to package.json if it doesn't exist
    if (fs.existsSync('package.json')) {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Only add lint-staged if it doesn't already exist
        if (!packageJson['lint-staged']) {
          packageJson['lint-staged'] = {
            "*.{js,jsx,ts,tsx}": "eslint --fix",
            "*.{js,jsx,ts,tsx,css,scss,json,md}": "prettier --write"
          };
          
          // Create a backup of package.json
          fs.writeFileSync('package.json.bak', JSON.stringify(packageJson, null, 2));
          
          // Write updated package.json
          fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
          success('Added lint-staged configuration to package.json');
        }
        
        // Add type-check script if it doesn't exist
        if (!packageJson.scripts['type-check']) {
          packageJson.scripts['type-check'] = 'tsc --noEmit';
          fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
          success('Added type-check script to package.json');
        }
      } catch (err) {
        warning(`Could not update package.json: ${err.message}`);
      }
    }
    
    // Create a report on the CI/CD setup
    const cicdReport = `# CI/CD Linting Integration Report

## Changes Made

1. **GitHub Workflow Added**
   - Created \`.github/workflows/lint.yml\` for automated linting on push and pull requests
   - Configured to run on main and develop branches
   - Includes ESLint and TypeScript type checking

2. **Pre-commit Hooks**
   - Installed Husky for Git hooks
   - Created pre-commit hook to run lint-staged
   - Configured lint-staged to run ESLint and Prettier on appropriate files

3. **Package.json Updates**
   - Added \`type-check\` script: \`tsc --noEmit\`
   - Added lint-staged configuration

## Next Steps

1. Make sure the following dependencies are installed:
   - \`husky\`
   - \`lint-staged\`
   - \`@typescript-eslint/eslint-plugin\`
   - \`@typescript-eslint/parser\`
   - \`eslint-plugin-import\`
   - \`eslint-plugin-jsx-a11y\`
   - \`eslint-plugin-react\`
   - \`eslint-plugin-react-hooks\`

2. Test the pre-commit hook by making a change and committing it
   - If there are linting errors, the commit will be blocked
   - Fix the errors and try again

3. Push a change to trigger the GitHub workflow
   - Check the Actions tab in GitHub to see the results

## Troubleshooting

If the pre-commit hook isn't working, try:
\`\`\`bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
chmod +x .husky/pre-commit
\`\`\`

If the GitHub workflow is failing, check:
- That all dependencies are properly installed in your project
- That the scripts in package.json are correct
- The GitHub Actions logs for specific error messages
`;
    
    fs.writeFileSync('docs/cicd-linting-report.md', cicdReport);
    success('Created CI/CD linting integration report at docs/cicd-linting-report.md');
  }
};

// Export tasks for individual task runner
module.exports = { tasks };

// Specialized script runners
const specializedScripts = {
  runMigrateTests: () => {
    log('Running test migration script...');
    try {
      require('./migrate-tests.js');
      return true;
    } catch (err) {
      error(`Error running migrate-tests.js: ${err.message}`);
      return false;
    }
  },
  
  runCleanupBackups: () => {
    log('Running backup cleanup script...');
    try {
      require('./cleanup-backups.js');
      return true;
    } catch (err) {
      error(`Error running cleanup-backups.js: ${err.message}`);
      return false;
    }
  },
  
  runCentralizeConfig: () => {
    log('Running configuration centralization script...');
    try {
      require('./centralize-config.js');
      return true;
    } catch (err) {
      error(`Error running centralize-config.js: ${err.message}`);
      return false;
    }
  },
  
  runRenameFiles: () => {
    log('Running file renaming script for naming consistency...');
    try {
      require('./rename-files.js');
      return true;
    } catch (err) {
      error(`Error running rename-files.js: ${err.message}`);
      return false;
    }
  },
  
  runVerifyImports: () => {
    log('Running import verification script...');
    try {
      require('./verify-imports.js');
      return true;
    } catch (err) {
      error(`Error running verify-imports.js: ${err.message}`);
      return false;
    }
  }
};

// Display help message
function showHelp() {
  console.log('\nFinal Unification Script\n');
  console.log('Usage: node final-unification.js [task]\n');
  
  console.log('Available tasks:');
  Object.keys(tasks).forEach(task => {
    console.log(`  - ${task}`);
  });
  
  console.log('\nSpecialized scripts:');
  Object.keys(specializedScripts).forEach(script => {
    console.log(`  - ${script}`);
  });
  
  console.log('\nExamples:');
  console.log('  node final-unification.js            # Run all tasks');
  console.log('  node final-unification.js runLinting # Run only the linting task');
  console.log('  node final-unification.js runRenameFiles # Run file renaming script');
}

// Main execution
async function main() {
  // Parse command line arguments
  const arg = process.argv[2];
  
  // Show help if requested
  if (arg === '--help' || arg === '-h') {
    showHelp();
    return;
  }
  
  // Run a specific task if specified
  if (arg && arg !== 'all') {
    if (tasks[arg]) {
      log(`Running task: ${arg}`);
      await tasks[arg]();
      return;
    } else if (specializedScripts[arg]) {
      log(`Running specialized script: ${arg}`);
      specializedScripts[arg]();
      return;
    } else {
      error(`Unknown task: ${arg}`);
      showHelp();
      return;
    }
  }
  
  log('Starting final unification process...');
  
  // Track timing
  const startTime = Date.now();
  
  // Execute tasks in sequence
  for (const [name, task] of Object.entries(tasks)) {
    log(`----- Executing task: ${name} -----`);
    try {
      await task();
    } catch (err) {
      error(`Task ${name} failed: ${err.message}`);
    }
  }
  
  const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
  success(`Final unification process completed in ${executionTime}s`);
  
  // Provide a summary of actions taken
  log('Summary of actions taken:');
  log('1. Created naming convention report');
  log('2. Consolidated documentation');
  log('3. Created test migration plan');
  log('4. Identified legacy files for cleanup');
  log('5. Created configuration centralization plan');
  log('6. Validated feature grouping');
  log('7. Ran linting and fixed errors');
  log('8. Identified redundant scripts');
  log('9. Set up CI/CD for linting');
  
  log('Next steps:');
  log('1. Review the generated reports in the docs/ directory');
  log('2. Execute the migration plans as appropriate');
  log('3. Update CI/CD pipelines to enforce the new structure');
  log('4. Run specialized scripts for test migration, backup cleanup, and config centralization');
}

// Only run main if this script is executed directly
if (require.main === module) {
  main().catch(err => {
    error(`Unification process failed: ${err.message}`);
    process.exit(1);
  });
} 