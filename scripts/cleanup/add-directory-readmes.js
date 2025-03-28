/**
 * Directory README Generator Script
 * 
 * This script adds README.md files to all major directories in the codebase
 * to provide consistent documentation across the project structure.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Utility functions
const log = (message) => console.log(`\x1b[36m[README Generator]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

// Configuration
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'public',
  'assets'
];

const MAJOR_DIRECTORIES = [
  'src',
  'src/components',
  'src/components/ui',
  'src/components/layouts',
  'src/components/features',
  'src/hooks',
  'src/contexts',
  'src/utils',
  'src/types',
  'src/services',
  'src/providers',
  'src/app',
  'src/lib',
  'src/middleware',
  'src/config',
  'src/handlers',
  'src/assets',
  'scripts',
  'scripts/cleanup',
  'scripts/testing',
  'scripts/components',
  'scripts/icons',
  'scripts/linting',
  'tests',
  'tests/unit',
  'tests/integration',
  'tests/e2e',
  'docs'
];

/**
 * Find all major directories in the codebase
 * @returns {Array<string>} - Array of directory paths
 */
function findMajorDirectories() {
  // Start with predefined directories
  const directories = [...MAJOR_DIRECTORIES].filter(dir => fs.existsSync(dir));
  
  // Add any feature directories
  if (fs.existsSync('src/components/features')) {
    const featureDirs = glob.sync('src/components/features/*/', { 
      ignore: EXCLUDED_DIRS.map(dir => `**/${dir}/**`)
    });
    
    directories.push(...featureDirs.map(dir => dir.endsWith('/') ? dir.slice(0, -1) : dir));
  }
  
  // Remove duplicates
  return [...new Set(directories)];
}

/**
 * Get files in a directory (excluding README.md if it exists)
 * @param {string} directory - Directory path 
 * @returns {Array<string>} - Array of file paths
 */
function getDirectoryContents(directory) {
  // Get all files and directories, excluding the README.md if it exists
  return glob.sync(`${directory}/*`, {
    ignore: [
      `${directory}/README.md`,
      ...EXCLUDED_DIRS.map(dir => `**/${dir}/**`)
    ]
  });
}

/**
 * Create a README for a specific directory type
 * @param {string} directory - Directory path
 * @returns {string} - Generated README content
 */
function createReadmeForDirectory(directory) {
  const dirName = path.basename(directory);
  const dirContents = getDirectoryContents(directory);
  
  // Count files by type
  const filesByType = {};
  dirContents.forEach(file => {
    if (fs.statSync(file).isDirectory()) {
      filesByType['directories'] = (filesByType['directories'] || 0) + 1;
    } else {
      const ext = path.extname(file).toLowerCase();
      filesByType[ext] = (filesByType[ext] || 0) + 1;
    }
  });
  
  // Get subdirectories
  const subdirectories = dirContents.filter(item => fs.statSync(item).isDirectory())
    .map(dir => path.basename(dir));
  
  // Determine directory type based on path
  let directoryType = 'General';
  let description = '';
  let usage = '';
  
  if (directory === 'src') {
    directoryType = 'Source Code';
    description = 'Main source code directory containing all application code.';
    usage = 'This directory contains all the source code for the application including components, utilities, services, and more.';
  } else if (directory.includes('/components')) {
    directoryType = 'Components';
    description = 'React components used throughout the application.';
    
    if (directory.includes('/components/ui')) {
      directoryType = 'UI Components';
      description = 'Reusable UI components that form the building blocks of the application interface.';
      usage = 'Import these components to build consistent user interfaces throughout the application.';
    } else if (directory.includes('/components/layouts')) {
      directoryType = 'Layout Components';
      description = 'Components that define the structure and layout of pages.';
      usage = 'Use these components to maintain consistent page layouts across the application.';
    } else if (directory.includes('/components/features')) {
      directoryType = 'Feature Components';
      description = 'Domain-specific components tied to particular application features.';
      usage = 'These components implement specific business logic and features of the application.';
    }
  } else if (directory.includes('/hooks')) {
    directoryType = 'React Hooks';
    description = 'Custom React hooks for reusable logic across components.';
    usage = 'Import these hooks to add functionality to your components without duplicating code.';
  } else if (directory.includes('/contexts')) {
    directoryType = 'React Contexts';
    description = 'Context providers for state management across the component tree.';
    usage = 'Use these contexts to share state between components without prop drilling.';
  } else if (directory.includes('/utils')) {
    directoryType = 'Utility Functions';
    description = 'Helper functions and utilities used throughout the application.';
    usage = 'Import these functions to perform common operations without duplicating code.';
  } else if (directory.includes('/types')) {
    directoryType = 'TypeScript Types';
    description = 'TypeScript type definitions and interfaces.';
    usage = 'Import these types to ensure type safety throughout the application.';
  } else if (directory.includes('/services')) {
    directoryType = 'Services';
    description = 'Service modules for API interactions and business logic.';
    usage = 'Use these services to interact with external systems and APIs.';
  } else if (directory.includes('/providers')) {
    directoryType = 'Providers';
    description = 'Provider components for dependency injection and state management.';
    usage = 'Wrap your components with these providers to provide them with necessary context and dependencies.';
  } else if (directory.includes('/app')) {
    directoryType = 'App Directory';
    description = 'Next.js app directory containing route components and layouts.';
    usage = 'Define your application routes and page components in this directory.';
  } else if (directory.includes('/middleware')) {
    directoryType = 'Middleware';
    description = 'Middleware functions for request/response processing.';
    usage = 'Use these middleware functions to intercept and modify requests and responses.';
  } else if (directory.includes('/config')) {
    directoryType = 'Configuration';
    description = 'Configuration files and environment settings.';
    usage = 'Modify these files to configure application behavior in different environments.';
  } else if (directory.includes('/handlers')) {
    directoryType = 'Handlers';
    description = 'Request handlers and controllers for API endpoints.';
    usage = 'Implement the application\'s API logic in these handler functions.';
  } else if (directory === 'scripts') {
    directoryType = 'Scripts';
    description = 'Utility scripts for development, build, and deployment tasks.';
    usage = 'Run these scripts to automate common development and maintenance tasks.';
  } else if (directory.includes('scripts/cleanup')) {
    directoryType = 'Cleanup Scripts';
    description = 'Scripts for cleaning up and standardizing the codebase.';
    usage = 'Run these scripts to maintain code quality and consistency.';
  } else if (directory.includes('scripts/testing')) {
    directoryType = 'Testing Scripts';
    description = 'Scripts for test automation and management.';
    usage = 'Use these scripts to run tests and manage test data.';
  } else if (directory.includes('scripts/components')) {
    directoryType = 'Component Scripts';
    description = 'Scripts for generating and managing components.';
    usage = 'Run these scripts to create new components or analyze existing ones.';
  } else if (directory === 'tests') {
    directoryType = 'Tests';
    description = 'Test files for verifying application functionality.';
    usage = 'Write and run tests to ensure the application works as expected.';
  } else if (directory.includes('tests/unit')) {
    directoryType = 'Unit Tests';
    description = 'Unit tests for individual functions and components.';
    usage = 'Write unit tests to verify the behavior of individual units of code.';
  } else if (directory.includes('tests/integration')) {
    directoryType = 'Integration Tests';
    description = 'Integration tests for testing component interactions.';
    usage = 'Write integration tests to verify that components work together correctly.';
  } else if (directory.includes('tests/e2e')) {
    directoryType = 'End-to-End Tests';
    description = 'End-to-end tests for testing the entire application.';
    usage = 'Write E2E tests to verify the behavior of the application from a user\'s perspective.';
  } else if (directory === 'docs') {
    directoryType = 'Documentation';
    description = 'Project documentation and guides.';
    usage = 'Read and contribute to these docs to understand and improve the application.';
  }
  
  // Generate README content
  return `# ${directoryType}

## Overview

${description}

## Contents

${
  subdirectories.length > 0 
    ? `### Subdirectories\n\n${subdirectories.map(dir => `- \`${dir}/\``).join('\n')}\n`
    : ''
}

${
  Object.keys(filesByType).filter(type => type !== 'directories').length > 0
    ? `### Files\n\n${Object.entries(filesByType)
        .filter(([type]) => type !== 'directories')
        .map(([type, count]) => `- ${count} ${type || 'unknown'} file${count > 1 ? 's' : ''}`)
        .join('\n')}\n`
    : ''
}

## Usage

${usage}

## Best Practices

- Keep this directory organized and focused on its specific responsibility
- Follow the established patterns for naming and organization
- Add unit tests for any non-trivial functionality
- Keep components small and focused on a single responsibility
${
  directory.includes('/components') 
    ? '- Use TypeScript Props interfaces for component props\n- Consider component composition over complex props' 
    : ''
}
${
  directory.includes('/hooks') 
    ? '- Keep hooks focused on a single concern\n- Name hooks with the "use" prefix\n- Document hook parameters and return values' 
    : ''
}

## Related

- [ARCHITECTURE.md](/ARCHITECTURE.md) - Overall architecture documentation
- [coding-standards.md](/docs/guides/coding-standards.md) - Coding standards and best practices
`;
}

/**
 * Add a README to a directory if it doesn't exist already
 * @param {string} directory - Directory path
 * @returns {Object} - Result of the operation
 */
async function addReadmeToDirectory(directory) {
  const readmePath = path.join(directory, 'README.md');
  
  // Check if README already exists
  if (fs.existsSync(readmePath)) {
    warning(`README.md already exists in ${directory}`);
    return {
      directory,
      success: false,
      skipped: true,
      message: 'README already exists'
    };
  }
  
  try {
    // Create README content
    const readmeContent = createReadmeForDirectory(directory);
    
    // Write README file
    fs.writeFileSync(readmePath, readmeContent);
    
    success(`Added README.md to ${directory}`);
    
    return {
      directory,
      success: true,
      readmePath
    };
  } catch (err) {
    error(`Failed to add README.md to ${directory}: ${err.message}`);
    
    return {
      directory,
      success: false,
      error: err.message
    };
  }
}

/**
 * Create a report of the README generation process
 * @param {Array<Object>} results - Results of the README generation operations
 */
function createReport(results) {
  const reportContent = `# Directory README Generation Report

## Summary
- Total directories processed: ${results.length}
- READMEs added: ${results.filter(r => r.success).length}
- Skipped: ${results.filter(r => r.skipped).length}
- Failed: ${results.filter(r => !r.success && !r.skipped).length}

## Successfully Added READMEs
${results.filter(r => r.success).map(r => `- ✅ \`${r.directory}/README.md\``).join('\n')}

## Skipped Directories
${results.filter(r => r.skipped).map(r => `- ⏩ \`${r.directory}\`: ${r.message}`).join('\n')}

## Failed Directories
${results.filter(r => !r.success && !r.skipped).map(r => `- ❌ \`${r.directory}\`: ${r.error}`).join('\n')}
`;

  fs.writeFileSync('docs/project-history/readme-generation-report.md', reportContent);
  success(`Report written to docs/project-history/readme-generation-report.md`);
}

/**
 * Main function to run the script
 */
async function main() {
  // Create git backup before making changes
  try {
    execSync('git branch -D readme-generation-backup 2>/dev/null || true', { stdio: 'pipe' });
    execSync('git checkout -b readme-generation-backup', { stdio: 'pipe' });
    execSync('git checkout -', { stdio: 'pipe' });
    success(`Created backup branch: readme-generation-backup`);
  } catch (err) {
    warning(`Could not create git backup branch: ${err.message}`);
  }
  
  // Find major directories
  const directories = findMajorDirectories();
  log(`Found ${directories.length} major directories to process`);
  
  // Add READMEs to each directory
  const results = [];
  for (const directory of directories) {
    const result = await addReadmeToDirectory(directory);
    results.push(result);
  }
  
  // Create a report
  createReport(results);
  
  // Final summary
  const addedCount = results.filter(r => r.success).length;
  const skippedCount = results.filter(r => r.skipped).length;
  const failCount = results.filter(r => !r.success && !r.skipped).length;
  
  log(`README generation completed.`);
  success(`Added ${addedCount} READMEs.`);
  warning(`Skipped ${skippedCount} directories (README already exists).`);
  if (failCount > 0) {
    error(`Failed to process ${failCount} directories. See the report for details.`);
  }
}

// Run the script
main().catch(err => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 