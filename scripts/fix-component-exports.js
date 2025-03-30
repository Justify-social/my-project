#!/usr/bin/env node

/**
 * Component Export Standardization Script
 * 
 * This script scans all component files in the UI library and ensures they
 * follow the standard export pattern:
 * - Every component file should have a default export
 * - If a file has multiple named exports but no default export, it creates a composite component
 * 
 * Usage: node scripts/fix-component-exports.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Configuration
const UI_COMPONENTS_ROOT = path.join(process.cwd(), 'src/components/ui');
const COMPONENT_CATEGORIES = ['atoms', 'molecules', 'organisms'];
const FILE_EXTENSIONS = ['.tsx', '.jsx'];
const DRY_RUN = process.argv.includes('--dry-run');

// Stats
const stats = {
  totalFiles: 0,
  filesWithDefaultExport: 0,
  filesWithNamedExportsOnly: 0,
  filesFixed: 0,
  errors: []
};

console.log(`
=================================================
Component Export Standardization Script
=================================================
${DRY_RUN ? '[DRY RUN MODE] No files will be modified' : '[LIVE MODE] Files will be modified'}
Scanning for components in: ${UI_COMPONENTS_ROOT}
`);

/**
 * Check if a file has a default export
 */
function hasDefaultExport(ast) {
  let hasDefault = false;
  
  traverse(ast, {
    ExportDefaultDeclaration() {
      hasDefault = true;
    }
  });
  
  return hasDefault;
}

/**
 * Get all named exports from a file
 */
function getNamedExports(ast) {
  const namedExports = [];
  
  traverse(ast, {
    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        // export const X = ...
        if (t.isVariableDeclaration(path.node.declaration)) {
          path.node.declaration.declarations.forEach(declaration => {
            if (t.isIdentifier(declaration.id)) {
              namedExports.push(declaration.id.name);
            }
          });
        }
        // export function X() {...}
        else if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
          namedExports.push(path.node.declaration.id.name);
        }
        // export class X {...}
        else if (t.isClassDeclaration(path.node.declaration) && path.node.declaration.id) {
          namedExports.push(path.node.declaration.id.name);
        }
      }
      // export { X, Y }
      else if (path.node.specifiers) {
        path.node.specifiers.forEach(specifier => {
          if (t.isExportSpecifier(specifier) && t.isIdentifier(specifier.exported)) {
            namedExports.push(specifier.exported.name);
          }
        });
      }
    }
  });
  
  return namedExports;
}

/**
 * Create default export code for a component with multiple named exports
 */
function createDefaultExport(componentName, namedExports) {
  // If there's a single named export matching the component name, use that
  if (namedExports.includes(componentName)) {
    return `
/**
 * Default export for ${componentName}
 */
export default ${componentName};
`;
  }
  
  // If there are multiple named exports, create a composite component
  return `
/**
 * ${componentName} - Combined component exporting all subcomponents
 * 
 * This component is the default export to ensure compatibility with dynamic imports.
 */
const ${componentName} = {
  ${namedExports.join(',\n  ')}
};

export default ${componentName};
`;
}

/**
 * Process a component file
 */
function processComponentFile(filePath) {
  try {
    stats.totalFiles++;
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const ast = parse(fileContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties']
    });
    
    // Check if it already has a default export
    if (hasDefaultExport(ast)) {
      stats.filesWithDefaultExport++;
      return;
    }
    
    // Get named exports
    const namedExports = getNamedExports(ast);
    if (namedExports.length === 0) {
      console.log(`  Warning: No exports found in ${filePath}`);
      return;
    }
    
    stats.filesWithNamedExportsOnly++;
    
    // Determine the component name from the file path
    const fileName = path.basename(filePath).replace(/\.[^.]+$/, '');
    const componentName = fileName;
    
    // Create the default export code
    const defaultExportCode = createDefaultExport(componentName, namedExports);
    
    // Add the default export to the file
    const updatedContent = fileContent + defaultExportCode;
    
    // Write back to the file or just log in dry run mode
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, updatedContent);
      stats.filesFixed++;
      console.log(`  Fixed: ${filePath} (Added default export for ${componentName})`);
    } else {
      console.log(`  Would fix: ${filePath} (${namedExports.length} exports, missing default export)`);
      console.log(`    Exports: ${namedExports.join(', ')}`);
    }
  } catch (error) {
    stats.errors.push({ filePath, error: error.message });
    console.error(`  Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Find all component files recursively
 */
function findComponentFiles(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (FILE_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
        // Skip files with "test", "spec", or ".d.ts"
        if (!entry.name.includes('test') && !entry.name.includes('spec') && !entry.name.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

// Main execution
try {
  // Process each category
  for (const category of COMPONENT_CATEGORIES) {
    const categoryDir = path.join(UI_COMPONENTS_ROOT, category);
    console.log(`Scanning ${category}...`);
    
    const componentFiles = findComponentFiles(categoryDir);
    for (const file of componentFiles) {
      processComponentFile(file);
    }
  }
  
  // Print stats
  console.log(`
=================================================
Results:
=================================================
Total component files: ${stats.totalFiles}
Files with default export: ${stats.filesWithDefaultExport}
Files with named exports only: ${stats.filesWithNamedExportsOnly}
Files fixed: ${DRY_RUN ? '0 (dry run)' : stats.filesFixed}
Errors: ${stats.errors.length}
=================================================
${DRY_RUN ? 'No files were modified (dry run)' : `Modified ${stats.filesFixed} files`}
${stats.errors.length > 0 ? 'There were errors during processing. Check the logs above.' : 'Completed successfully!'}
`);
  
  if (stats.errors.length > 0) {
    process.exit(1);
  }
} catch (error) {
  console.error('Fatal error:', error);
  process.exit(1);
}
