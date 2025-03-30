#!/usr/bin/env node

/**
 * Component Export Validation Script
 * 
 * This script validates that:
 * 1. All component files have a default export
 * 2. No invalid variable names (with hyphens or JavaScript keywords) are used
 * 
 * Usage: node scripts/validate-component-exports.js
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Configuration
const UI_COMPONENTS_ROOT = path.join(process.cwd(), 'src/components/ui');
const COMPONENT_CATEGORIES = ['atoms', 'molecules', 'organisms'];
const FILE_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js'];

// JavaScript reserved keywords that cannot be used as variable names
const RESERVED_KEYWORDS = [
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'export', 'extends', 'false', 'finally', 'for', 'function',
  'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch',
  'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'
];

// Stats
const stats = {
  totalFiles: 0,
  filesWithDefaultExport: 0,
  filesWithMissingDefaultExport: 0,
  filesWithInvalidVariableNames: 0,
  errors: []
};

console.log(`
=================================================
Component Export Validation Script
=================================================
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
 * Find invalid variable names in a file (contains hyphens or reserved keywords)
 */
function findInvalidVariableNames(ast) {
  const invalidVariables = [];
  
  traverse(ast, {
    VariableDeclarator(path) {
      if (path.node.id && path.node.id.name) {
        const varName = path.node.id.name;
        
        // Check for hyphens
        if (varName.includes('-')) {
          invalidVariables.push({
            name: varName,
            reason: 'contains hyphen'
          });
        }
        
        // Check for reserved keywords
        if (RESERVED_KEYWORDS.includes(varName)) {
          invalidVariables.push({
            name: varName,
            reason: 'is a reserved JavaScript keyword'
          });
        }
      }
    }
  });
  
  return invalidVariables;
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
    
    // Check if it has a default export
    const hasDefault = hasDefaultExport(ast);
    if (hasDefault) {
      stats.filesWithDefaultExport++;
      console.log(`✅ ${filePath} - Has default export`);
    } else {
      stats.filesWithMissingDefaultExport++;
      console.error(`❌ ${filePath} - Missing default export`);
    }
    
    // Find invalid variable names
    const invalidVariables = findInvalidVariableNames(ast);
    if (invalidVariables.length > 0) {
      stats.filesWithInvalidVariableNames++;
      
      for (const variable of invalidVariables) {
        console.error(`❌ ${filePath} - Invalid variable name "${variable.name}" (${variable.reason})`);
      }
    }
  } catch (error) {
    stats.errors.push({ filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
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
    console.log(`\nScanning ${category}...`);
    
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
Files missing default export: ${stats.filesWithMissingDefaultExport}
Files with invalid variable names: ${stats.filesWithInvalidVariableNames}
Errors: ${stats.errors.length}
=================================================
${stats.filesWithMissingDefaultExport === 0 && stats.filesWithInvalidVariableNames === 0 ? 
  'All components are valid! ✅' : 
  'Issues found. Please fix the above problems. ❌'}
`);
  
  if (stats.filesWithMissingDefaultExport > 0 || stats.filesWithInvalidVariableNames > 0 || stats.errors.length > 0) {
    process.exit(1);
  }
} catch (error) {
  console.error('Fatal error:', error);
  process.exit(1);
} 