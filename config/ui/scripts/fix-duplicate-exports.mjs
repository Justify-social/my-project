#!/usr/bin/env node

/**
 * Fix Duplicate Exports Script
 * 
 * This script scans UI component files for duplicate default exports
 * and fixes them following a consistent pattern:
 * - For index.ts files: prefer `export { default } from './Component'`
 * - Remove any redundant `export default Component` statements
 * 
 * Usage:
 *   node config/ui/scripts/fix-duplicate-exports.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const UI_COMPONENTS_ROOT = path.resolve(process.cwd(), 'src/components/ui');
const COMPONENT_CATEGORIES = ['atoms', 'molecules', 'organisms'];
const DRY_RUN = process.argv.includes('--dry-run');

// Terminal colors for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// Helper log functions
const log = (msg) => console.log(msg);
const info = (msg) => console.log(`${colors.blue}ℹ ${colors.reset}${msg}`);
const success = (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`);
const warning = (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`);
const error = (msg) => console.error(`${colors.red}✗ ${colors.reset}${msg}`);

/**
 * Check for and fix duplicate default exports
 */
function fixDuplicateExports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for export { default } from './Component'
    const hasNamedDefaultExport = content.includes('export { default }');
    
    // Check for export default Component
    const hasDirectDefaultExport = /export\s+default\s+\w+;/.test(content);
    
    // Check for import Component from './Component'
    const componentImportMatch = content.match(/import\s+(\w+)\s+from\s+['"][^'"]+['"]/);
    
    // Only fix if both patterns exist
    if (hasNamedDefaultExport && hasDirectDefaultExport && componentImportMatch) {
      const componentName = componentImportMatch[1];
      
      // Remove the import statement and direct default export
      let newContent = content;
      
      // Replace direct default export (more specific pattern first)
      newContent = newContent.replace(
        new RegExp(`export\\s+default\\s+${componentName};`), 
        ''
      );
      
      // If content changed, file needs fixing
      if (newContent !== content) {
        if (DRY_RUN) {
          info(`Would fix duplicate exports in ${filePath}`);
        } else {
          fs.writeFileSync(filePath, newContent);
          success(`Fixed duplicate exports in ${filePath}`);
        }
        return true;
      }
    }
    
    return false;
  } catch (error) {
    warning(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Find component files recursively
 */
function findComponentFiles(dir) {
  const indexFiles = [];
  
  function scanDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.name === 'index.ts') {
        indexFiles.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return indexFiles;
}

/**
 * Main execution
 */
async function main() {
  log(`
${colors.bold}Duplicate Exports Fixer${colors.reset}
${DRY_RUN ? colors.yellow + '[DRY RUN - No changes will be made]' + colors.reset : ''}
  `);
  
  let totalFixed = 0;
  
  // Process each component category
  for (const category of COMPONENT_CATEGORIES) {
    const categoryPath = path.join(UI_COMPONENTS_ROOT, category);
    info(`Processing ${category} components...`);
    
    if (!fs.existsSync(categoryPath)) {
      warning(`Category directory not found: ${categoryPath}`);
      continue;
    }
    
    const componentFiles = findComponentFiles(categoryPath);
    info(`Found ${componentFiles.length} index.ts files in ${category}`);
    
    let fixedInCategory = 0;
    for (const file of componentFiles) {
      if (fixDuplicateExports(file)) {
        fixedInCategory++;
        totalFixed++;
      }
    }
    
    info(`Fixed ${fixedInCategory} files in ${category}`);
  }
  
  if (totalFixed > 0) {
    if (DRY_RUN) {
      success(`Found ${totalFixed} files with duplicate exports (dry run)`);
      log(`\nRun without --dry-run to apply fixes.`);
    } else {
      success(`Fixed ${totalFixed} files with duplicate exports`);
    }
  } else {
    success(`No duplicate exports found. All UI component files are following best practices.`);
  }
}

main().catch(err => {
  error(`Error: ${err.message}`);
  process.exit(1);
}); 