/**
 * Configuration Centralization Script
 * 
 * This script centralizes configuration files into a config/ directory
 * and updates references in package.json.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import execSync from 'child_process';

// Utility functions
const log = (message) => console.log(`\x1b[36m[Config Centralization]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

// Configuration files to centralize
const CONFIG_FILES = [
  { source: '.eslintrc.js', target: 'config/eslint/eslintrc.js' },
  { source: '.eslintrc.json', target: 'config/eslint/eslintrc.json' },
  { source: '.prettierrc.json', target: 'config/prettier/prettierrc.json' },
  { source: 'jest.config.js', target: 'config/jest/jest.config.js' },
  { source: 'jest.setup.js', target: 'config/jest/jest.setup.js' },
  { source: 'next.config.js', target: 'config/next/next.config.js' },
  { source: 'tailwind.config.js', target: 'config/tailwind/tailwind.config.js' },
  { source: 'tailwind.config.ts', target: 'config/tailwind/tailwind.config.ts' },
  { source: 'postcss.config.mjs', target: 'config/postcss/postcss.config.mjs' },
  { source: 'cypress.config.js', target: 'config/cypress/cypress.config.js' },
  { source: 'tsconfig.json', target: 'config/typescript/tsconfig.json' }
];

// Create config directory structure
const createConfigDirs = () => {
  const configDirs = [
    'config',
    'config/eslint',
    'config/prettier',
    'config/jest',
    'config/next',
    'config/tailwind',
    'config/postcss',
    'config/typescript',
    'config/cypress'
  ];
  
  for (const dir of configDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      success(`Created directory: ${dir}`);
    }
  }
};

// Move configuration files
const migrateConfigFiles = () => {
  const results = {
    migrated: [],
    skipped: [],
    failed: []
  };
  
  for (const config of CONFIG_FILES) {
    if (fs.existsSync(config.source)) {
      try {
        // Create target directory if it doesn't exist
        const targetDir = path.dirname(config.target);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Copy the file
        fs.copyFileSync(config.source, config.target);
        
        // Create a redirect file in the original location
        const redirectContent = `// This file is now located at ${config.target}
// This is a redirect file for backward compatibility
module.exports = require('./${config.target}');`;
        
        fs.writeFileSync(config.source, redirectContent);
        
        success(`Migrated: ${config.source} -> ${config.target}`);
        results.migrated.push(config);
      } catch (err) {
        error(`Failed to migrate ${config.source}: ${err.message}`);
        results.failed.push({ ...config, error: err.message });
      }
    } else {
      results.skipped.push(config);
    }
  }
  
  return results;
};

// Update package.json references
const updatePackageJson = () => {
  if (!fs.existsSync('package.json')) {
    error('package.json not found');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Backup package.json
    fs.writeFileSync('package.json.config-bak', JSON.stringify(packageJson, null, 2));
    
    // Update script references
    if (packageJson.scripts) {
      Object.keys(packageJson.scripts).forEach(script => {
        let updatedCommand = packageJson.scripts[script];
        
        // Jest config
        updatedCommand = updatedCommand.replace(
          '--config=jest.config.js',
          '--config=config/jest/jest.config.js'
        );
        
        // ESLint config
        updatedCommand = updatedCommand.replace(
          'eslint',
          'eslint --config config/eslint/eslintrc.js'
        );
        
        // Prettier config
        updatedCommand = updatedCommand.replace(
          'prettier',
          'prettier --config config/prettier/prettierrc.json'
        );
        
        // Update the script
        packageJson.scripts[script] = updatedCommand;
      });
    }
    
    // Update other references
    if (packageJson.jest) {
      packageJson.jest.setupFilesAfterEnv = ['<rootDir>/config/jest/jest.setup.js'];
    }
    
    // Write updated package.json
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    success('Updated references in package.json');
    return true;
  } catch (err) {
    error(`Failed to update package.json: ${err.message}`);
    return false;
  }
};

// Create centralization manifest
const createManifest = (results) => {
  const manifestContent = `# Configuration Centralization Manifest

## Overview

This document lists all configuration files that have been centralized into the \`config/\` directory.

## Migrated Files

${results.migrated.map(config => `- \`${config.source}\` -> \`${config.target}\``).join('\n')}

## Skipped Files (Not Found)

${results.skipped.map(config => `- \`${config.source}\``).join('\n')}

## Failed Migrations

${results.failed.map(config => `- \`${config.source}\` -> \`${config.target}\` (Error: ${config.error})`).join('\n')}

## Package.json Updates

The script has updated references in package.json to point to the new configuration locations.

## Usage Instructions

### ESLint
\`\`\`
npx eslint --config config/eslint/eslintrc.js
\`\`\`

### Prettier
\`\`\`
npx prettier --config config/prettier/prettierrc.json
\`\`\`

### Jest
\`\`\`
npx jest --config=config/jest/jest.config.js
\`\`\`

### TypeScript
\`\`\`
tsc --project config/typescript/tsconfig.json
\`\`\`
`;

  fs.writeFileSync('docs/config-centralization-manifest.md', manifestContent);
  success('Created centralization manifest at docs/config-centralization-manifest.md');
};

// Create a README file for the config directory
const createConfigReadme = () => {
  const readmeContent = `# Configuration Files

This directory contains all configuration files for the project.

## Directory Structure

- \`eslint/\`: ESLint configuration files
- \`prettier/\`: Prettier configuration files
- \`jest/\`: Jest configuration files
- \`next/\`: Next.js configuration files
- \`tailwind/\`: Tailwind CSS configuration files
- \`typescript/\`: TypeScript configuration files
- \`cypress/\`: Cypress configuration files
- \`postcss/\`: PostCSS configuration files

## Usage

The root project files (e.g., \`.eslintrc.js\`, \`jest.config.js\`) now redirect to these centralized files.
`;

  fs.writeFileSync('config/README.md', readmeContent);
  success('Created README.md in config directory');
};

// Main function
const main = async () => {
  log('Starting configuration centralization...');
  
  // Track timing
  const startTime = Date.now();
  
  try {
    // Create config directory structure
    createConfigDirs();
    
    // Migrate config files
    const results = migrateConfigFiles();
    
    // Update package.json references
    updatePackageJson();
    
    // Create centralization manifest
    createManifest(results);
    
    // Create config README
    createConfigReadme();
    
    // Update progress
    try {
      execSync('node scripts/unification-final/update-progress.js "Configuration Centralization" 80', { stdio: 'inherit' });
    } catch (err) {
      warning(`Could not update progress: ${err.message}`);
    }
    
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    success(`Configuration centralization completed in ${executionTime}s`);
  } catch (err) {
    error(`Configuration centralization failed: ${err.message}`);
    process.exit(1);
  }
};

// Run main function
main(); 