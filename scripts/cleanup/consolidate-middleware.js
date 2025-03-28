/**
 * Middleware Consolidation Script
 *
 * This script consolidates and reorganizes middleware functionality in the codebase,
 * eliminating redundancy between the middleware.ts file and middlewares directory.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Utility functions
const log = (message) => console.log(`\x1b[36m[Middleware Consolidation]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

/**
 * Create api middleware directory with README explaining the purpose
 */
function createApiMiddlewareStructure() {
  const targetDir = 'src/middlewares/api';
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    log(`Created directory: ${targetDir}`);
  }

  // Create a README file
  const readmeContent = `# API Middlewares

This directory contains middleware functions specifically designed for API routes.

## Purpose

- **validate-request.ts**: Validates incoming API request data
- **api-response-middleware.ts**: Formats API responses consistently
- **check-permissions.ts**: Verifies user permissions for API operations
- **handle-db-errors.ts**: Handles database errors and returns appropriate responses

These middlewares are intended to be used in API route handlers and are separate from the Next.js middleware in \`src/middleware.ts\` which handles routing and authentication at the application level.
`;

  fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent);
  success(`Created README for API middlewares`);
}

/**
 * Move API middleware files to the api subdirectory
 */
function moveApiMiddlewares() {
  const middlewareFiles = [
    'validate-request.ts',
    'api-response-middleware.ts',
    'check-permissions.ts',
    'handle-db-errors.ts'
  ];

  const results = [];

  middlewareFiles.forEach(file => {
    const sourcePath = path.join('src/middlewares', file);
    const targetPath = path.join('src/middlewares/api', file);

    try {
      if (fs.existsSync(sourcePath)) {
        // Read file content
        const content = fs.readFileSync(sourcePath, 'utf8');
        
        // Write to new location
        fs.writeFileSync(targetPath, content);
        
        // Remove original file
        fs.unlinkSync(sourcePath);
        
        success(`Moved middleware: ${sourcePath} -> ${targetPath}`);
        
        results.push({
          source: sourcePath,
          target: targetPath,
          success: true
        });
      } else {
        warning(`File not found: ${sourcePath}`);
        results.push({
          source: sourcePath,
          target: targetPath,
          success: false,
          error: 'Source file not found'
        });
      }
    } catch (err) {
      error(`Failed to move middleware ${sourcePath}: ${err.message}`);
      results.push({
        source: sourcePath,
        target: targetPath,
        success: false,
        error: err.message
      });
    }
  });

  return results;
}

/**
 * Update imports across the codebase to reflect the new middleware structure
 * @returns {Array<Object>} - Results of the update operations
 */
function updateMiddlewareImports() {
  // Find all files that might import middlewares
  const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', {
    ignore: ['node_modules/**', '.git/**', '.next/**', 'dist/**', 'build/**']
  });
  
  const results = [];
  
  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let updated = false;
      
      // Update imports for middleware API files
      content = content.replace(
        /from\s+['"]@\/middlewares\/([a-zA-Z-]+)['"]/g,
        (match, middlewareName) => {
          // Check if this is one of the middlewares we moved
          if (['validate-request', 'api-response-middleware', 'check-permissions', 'handle-db-errors'].includes(middlewareName)) {
            updated = true;
            return `from '@/middlewares/api/${middlewareName}'`;
          }
          return match;
        }
      );
      
      if (updated) {
        fs.writeFileSync(file, content);
        success(`Updated imports in ${file}`);
        
        results.push({
          file,
          success: true
        });
      }
    } catch (err) {
      warning(`Error updating imports in ${file}: ${err.message}`);
      results.push({
        file,
        success: false,
        error: err.message
      });
    }
  });
  
  return results;
}

/**
 * Create an index file for API middlewares to simplify imports
 */
function createApiMiddlewareIndex() {
  const indexPath = 'src/middlewares/api/index.ts';
  const indexContent = `/**
 * API Middleware Exports
 * 
 * This file centralizes exports from all API middleware modules for easier imports.
 */

export * from './validate-request';
export * from './api-response-middleware';
export * from './check-permissions';
export * from './handle-db-errors';
`;

  fs.writeFileSync(indexPath, indexContent);
  success(`Created API middleware index file`);
}

/**
 * Create a README file for the root middleware directory
 */
function createMiddlewareReadme() {
  const readmePath = 'src/middlewares/README.md';
  const readmeContent = `# Middlewares

This directory contains middleware functions used throughout the application.

## Structure

- **api/**: Middlewares specifically for API routes
  - validate-request.ts - Validates incoming request data
  - api-response-middleware.ts - Formats API responses
  - check-permissions.ts - Verifies user permissions
  - handle-db-errors.ts - Handles database errors

## Usage

Import API middlewares from their centralized location:

\`\`\`typescript
import { validateRequest, checkPermissions } from '@/middlewares/api';
\`\`\`

## Note

The application-level routing and authentication middleware is located in \`src/middleware.ts\`, following Next.js conventions.
`;

  fs.writeFileSync(readmePath, readmeContent);
  success(`Created middleware README file`);
}

/**
 * Create a report of the middleware consolidation process
 * @param {Object} results - Results of the operations
 */
function createReport(results) {
  const reportContent = `# Middleware Consolidation Report

## Summary
- API middlewares moved to dedicated directory: ${results.moveResults.filter(r => r.success).length}/${results.moveResults.length}
- Files with updated imports: ${results.importResults.filter(r => r.success).length}

## Changes Made

### Structure Improvements
- Created dedicated \`src/middlewares/api\` directory for API-specific middlewares
- Added README documentation for middleware organization
- Created centralized exports in \`src/middlewares/api/index.ts\`

### Moved API Middlewares
${results.moveResults.filter(r => r.success).map(r => `- ✅ \`${r.source}\` -> \`${r.target}\``).join('\n')}

### Failed Moves
${results.moveResults.filter(r => !r.success).map(r => `- ❌ \`${r.source}\`: ${r.error}`).join('\n')}

### Files with Updated Imports
${results.importResults.filter(r => r.success).map(r => `- ✅ \`${r.file}\``).join('\n')}

## Separation of Concerns

The codebase now clearly separates:

1. **Application Routing Middleware** (\`src/middleware.ts\`)
   - Handles routing, authentication, and authorization at the Next.js application level
   - Manages public paths and protected routes

2. **API Request Handling Middleware** (\`src/middlewares/api/*\`)
   - Handles API-specific concerns like request validation
   - Provides consistent response formatting
   - Manages permissions for API operations
   - Handles database errors

This separation follows best practices for Next.js applications and makes the codebase more maintainable.
`;

  fs.writeFileSync('docs/project-history/middleware-consolidation-report.md', reportContent);
  success(`Report written to docs/project-history/middleware-consolidation-report.md`);
}

/**
 * Main function to run the script
 */
async function main() {
  // Create git backup before making changes
  try {
    execSync('git branch -D middleware-consolidation-backup 2>/dev/null || true', { stdio: 'pipe' });
    execSync('git checkout -b middleware-consolidation-backup', { stdio: 'pipe' });
    execSync('git checkout -', { stdio: 'pipe' });
    success(`Created backup branch: middleware-consolidation-backup`);
  } catch (err) {
    warning(`Could not create git backup branch: ${err.message}`);
  }
  
  // Create API middleware structure
  createApiMiddlewareStructure();
  
  // Move API middlewares to subdirectory
  const moveResults = moveApiMiddlewares();
  
  // Create API middleware index file
  createApiMiddlewareIndex();
  
  // Create README for middleware directory
  createMiddlewareReadme();
  
  // Update imports across the codebase
  const importResults = updateMiddlewareImports();
  
  // Create a report
  createReport({
    moveResults,
    importResults
  });
  
  // Final summary
  const successMoves = moveResults.filter(r => r.success).length;
  const failedMoves = moveResults.filter(r => !r.success).length;
  const updatedFiles = importResults.filter(r => r.success).length;
  
  log(`Middleware consolidation completed.`);
  success(`Successfully moved ${successMoves} middleware files.`);
  success(`Updated imports in ${updatedFiles} files.`);
  if (failedMoves > 0) {
    error(`Failed to move ${failedMoves} middleware files. See the report for details.`);
  }
}

// Run the script
main().catch(err => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 