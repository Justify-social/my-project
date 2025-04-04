#!/usr/bin/env node

/**
 * Component Export Validator
 * 
 * This script validates that all UI components are properly exported
 * in the centralized index.ts file. It checks for:
 * - Missing exports in the centralized file
 * - Components with multiple implementations
 * - Export naming consistency
 * 
 * Usage:
 *   node validate-component-exports.js [--fix] [--verbose]
 * 
 * Options:
 *   --fix        Attempt to fix issues (adds missing exports to index.ts)
 *   --verbose    Show detailed information during execution
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  componentsDir: '../src/components/ui',
  centralFile: '../src/components/ui/index.ts',
  atomicLevels: ['atoms', 'molecules', 'organisms'],
  fix: process.argv.includes('--fix'),
  verbose: process.argv.includes('--verbose')
};

// Helper: Convert kebab-case to PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

// Helper: Conditional logging
function log(message, onlyVerbose = false) {
  if (!onlyVerbose || config.verbose) {
    console.log(message);
  }
}

// Get all component files across atomic levels
function findComponentFiles() {
  const components = [];
  
  log('Scanning component directories...', true);
  
  config.atomicLevels.forEach(level => {
    const levelDir = path.resolve(__dirname, config.componentsDir, level);
    
    if (!fs.existsSync(levelDir)) {
      log(`Level directory not found: ${levelDir}`, true);
      return;
    }
    
    // Get all component directories at this level
    const componentDirs = fs.readdirSync(levelDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    log(`Found ${componentDirs.length} component directories in ${level}`, true);
    
    componentDirs.forEach(componentDir => {
      const fullComponentDir = path.join(levelDir, componentDir);
      const componentFiles = fs.readdirSync(fullComponentDir, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.tsx') && !dirent.name.startsWith('index'))
        .map(dirent => dirent.name);
      
      componentFiles.forEach(file => {
        const componentName = file.replace('.tsx', '');
        const componentPath = `@/components/ui/${level}/${componentDir}/${componentName}`;
        const pascalComponentName = toPascalCase(componentDir);
        
        // Check if this is a renamed component (file name doesn't match directory name)
        const isRenamed = componentName !== pascalComponentName;
        
        components.push({
          name: isRenamed ? componentName : pascalComponentName,
          path: componentPath,
          level,
          directory: componentDir,
          file,
          isRenamed
        });
      });
    });
  });
  
  log(`Found ${components.length} total component files across all levels`, true);
  return components;
}

// Parse the central index.ts file to extract exports
function parseExports() {
  const centralFilePath = path.resolve(__dirname, config.centralFile);
  
  if (!fs.existsSync(centralFilePath)) {
    log(`❌ Central export file not found: ${centralFilePath}`);
    return { exports: [], content: '' };
  }
  
  const content = fs.readFileSync(centralFilePath, 'utf8');
  const exports = [];
  
  // Regular expression to match export statements
  // Example: export { Button } from '@/components/ui/atoms/button/Button';
  // or: export { Component as RenamedComponent } from 'path';
  const exportRegex = /export\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]\s*;/g;
  let match;
  
  while ((match = exportRegex.exec(content)) !== null) {
    const exportStr = match[1].trim();
    const path = match[2].trim();
    
    // Handle both simple exports and renamed exports
    if (exportStr.includes(' as ')) {
      const [original, renamed] = exportStr.split(' as ').map(s => s.trim());
      exports.push({
        originalName: original,
        exportedName: renamed,
        path
      });
    } else {
      exports.push({
        originalName: exportStr,
        exportedName: exportStr,
        path
      });
    }
  }
  
  log(`Found ${exports.length} exports in central file`, true);
  return { exports, content };
}

// Group components by name to identify duplicates
function groupComponents(components) {
  const groups = {};
  
  components.forEach(component => {
    const { name } = component;
    if (!groups[name]) {
      groups[name] = [];
    }
    groups[name].push(component);
  });
  
  return groups;
}

// Check if a component is exported in the central file
function isExported(component, exports) {
  const directMatch = exports.some(exp => 
    exp.originalName === component.name && 
    exp.path === component.path
  );
  
  const renamedMatch = exports.some(exp => 
    exp.originalName === component.name && 
    exp.path === component.path
  );
  
  return directMatch || renamedMatch;
}

// Generate export statement for a component
function generateExportStatement(component) {
  return `export { ${component.name} } from '${component.path}';`;
}

// Fix missing exports by adding them to the central file
function fixMissingExports(missingComponents, currentContent) {
  let updatedContent = currentContent;
  const exportStatements = missingComponents.map(generateExportStatement);
  
  // Add exports to the end of the file, before any closing comments
  const insertPosition = updatedContent.lastIndexOf('*/') > 0 
    ? updatedContent.lastIndexOf('*/') + 2 
    : updatedContent.length;
  
  updatedContent = 
    updatedContent.slice(0, insertPosition) + 
    '\n' + 
    exportStatements.join('\n') + 
    '\n' + 
    updatedContent.slice(insertPosition);
  
  return updatedContent;
}

// Validate component exports
function validateExports() {
  const components = findComponentFiles();
  const { exports, content } = parseExports();
  const componentGroups = groupComponents(components);
  
  // Identify missing exports
  const missingExports = [];
  
  components.forEach(component => {
    if (!isExported(component, exports)) {
      missingExports.push(component);
    }
  });
  
  // Identify components with multiple implementations
  const multipleImplementations = Object.entries(componentGroups)
    .filter(([name, group]) => group.length > 1)
    .map(([name, group]) => ({
      name,
      implementations: group
    }));
  
  // Log validation results
  log('\n=== Validation Results ===');
  
  if (missingExports.length === 0) {
    log('✅ All components are exported in the central file');
  } else {
    log(`❌ Found ${missingExports.length} components not exported in the central file:`);
    missingExports.forEach(component => {
      log(`   - ${component.name} (${component.level}/${component.directory}/${component.file})`);
    });
  }
  
  if (multipleImplementations.length > 0) {
    log(`\n⚠️ Found ${multipleImplementations.length} components with multiple implementations:`);
    multipleImplementations.forEach(({ name, implementations }) => {
      log(`   - ${name} (${implementations.length} implementations):`);
      implementations.forEach(impl => {
        log(`     • ${impl.level}/${impl.directory}/${impl.file}`);
      });
    });
  }
  
  // Fix missing exports if requested
  if (config.fix && missingExports.length > 0) {
    log(`\n🔧 Fixing ${missingExports.length} missing exports...`);
    
    const updatedContent = fixMissingExports(missingExports, content);
    const centralFilePath = path.resolve(__dirname, config.centralFile);
    
    fs.writeFileSync(centralFilePath, updatedContent);
    log(`✅ Updated ${centralFilePath} with missing exports`);
  }
  
  // Return validation summary
  return {
    total: components.length,
    exported: components.length - missingExports.length,
    missing: missingExports.length,
    duplicates: multipleImplementations.length,
    fixed: config.fix ? missingExports.length : 0
  };
}

// Main execution
function main() {
  log(`Component Export Validator${config.fix ? ' (FIX mode)' : ''}`);
  
  const results = validateExports();
  
  log('\n=== Summary ===');
  log(`Total components: ${results.total}`);
  log(`Exported components: ${results.exported}`);
  log(`Missing exports: ${results.missing}`);
  log(`Components with multiple implementations: ${results.duplicates}`);
  
  if (config.fix) {
    log(`Fixed exports: ${results.fixed}`);
  }
  
  // Exit with error code if issues were found
  if (results.missing > 0 && !config.fix) {
    process.exit(1);
  }
}

main(); 