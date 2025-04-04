#!/usr/bin/env node

/**
 * Centralized Export Generator
 * 
 * This script generates a centralized index.ts file for UI components
 * based on the atomic design structure. It scans the components directory
 * for all components at different atomic levels and generates proper exports.
 * 
 * Usage:
 *   node centralized-export-generator.js [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run   Don't write any files, just show what would be done
 *   --verbose   Show detailed information during execution
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  componentsDir: '../src/components/ui',
  outputFile: '../src/components/ui/index.ts',
  atomicLevels: ['atoms', 'molecules', 'organisms'],
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose')
};

// Helper: Convert kebab-case to PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

// Helper: Check if file exists
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

// Helper: Conditional logging
function log(message, onlyVerbose = false) {
  if (!onlyVerbose || config.verbose) {
    console.log(message);
  }
}

/**
 * Checks if a file is likely a component file
 * @param {string} fileName - File name to check
 * @returns {boolean} True if file is likely a component
 */
function isComponentFile(fileName) {
  // Skip test files, stories, utils, etc.
  const skipPatterns = [
    '.test.', '.spec.', '.stories.', '.utils.', '.helpers.',
    'index.', 'types.', 'constants.', 'config.', 'styles.',
    'utils/', 'helpers/', 'constants/', 'config/', 'types/',
  ];
  
  if (!fileName.endsWith('.tsx') && !fileName.endsWith('.ts')) {
    return false;
  }
  
  for (const pattern of skipPatterns) {
    if (fileName.includes(pattern)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check for potential naming conflicts between components
 * @param {Array} components - Array of component objects
 * @returns {Object} Map of component names to their occurrences in different levels
 */
function findPotentialNamingConflicts(components) {
  const nameCounts = {};
  const nameToLevels = {};
  
  // Count occurrences of each component name
  components.forEach(component => {
    const { name } = component;
    if (!nameCounts[name]) {
      nameCounts[name] = 0;
      nameToLevels[name] = new Set();
    }
    nameCounts[name]++;
    nameToLevels[name].add(component.level);
  });
  
  // Filter to only those with conflicts (same name in multiple levels)
  const conflicts = {};
  Object.entries(nameCounts)
    .filter(([name, count]) => count > 1 && nameToLevels[name].size > 1)
    .forEach(([name, count]) => {
      conflicts[name] = Array.from(nameToLevels[name]);
    });
  
  if (Object.keys(conflicts).length > 0) {
    log(`⚠️ Found ${Object.keys(conflicts).length} potential naming conflicts:`);
    Object.entries(conflicts).forEach(([name, levels]) => {
      log(`  - ${name} appears in levels: ${levels.join(', ')}`);
    });
  }
  
  return conflicts;
}

/**
 * Scans component directories to find all component implementations
 * @returns {Array} Array of component objects with metadata
 */
function findAllComponents() {
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
      .map(dirent => ({
        name: dirent.name,
        path: path.join(levelDir, dirent.name)
      }));
    
    log(`Found ${componentDirs.length} component directories in ${level}`, true);
    
    // Process each component directory
    componentDirs.forEach(({ name: dirName, path: dirPath }) => {
      // Handle nested directories
      const processDirectory = (currentPath, subDir = '') => {
        const items = fs.readdirSync(currentPath, { withFileTypes: true });
        
        // Process files in this directory
        items.filter(item => item.isFile() && isComponentFile(item.name))
          .forEach(file => {
            const fileName = file.name;
            const componentName = fileName.replace(/\.(tsx|ts)$/, '');
            
            // Skip index files 
            if (componentName === 'index') return;
            
            const relativeDir = path.join(dirName, subDir).replace(/\\/g, '/');
            const importPath = `./${level}/${relativeDir}/${componentName}`;
            const componentPath = path.join(currentPath, fileName);
            
            // Identify export strategy based on file name and content
            const content = fs.readFileSync(componentPath, 'utf-8');
            
            // Check if file contains default export
            const hasDefaultExport = content.includes('export default');
            
            components.push({
              name: componentName,
              dirName: relativeDir,
              filePath: componentPath,
              importPath: importPath,
              level,
              hasDefaultExport,
              hasHyphen: componentName.includes('-')
            });
          });
        
        // Recursively process subdirectories
        items.filter(item => item.isDirectory() && !['utils', 'helpers', 'tests', 'examples', 'styles', 'types', '__tests__'].includes(item.name))
          .forEach(subDirectory => {
            const newSubDir = path.join(subDir, subDirectory.name);
            processDirectory(path.join(currentPath, subDirectory.name), newSubDir);
          });
      };
      
      processDirectory(dirPath);
    });
  });
  
  log(`Found ${components.length} total components across all levels`, false);
  return components;
}

/**
 * Generate a unique export name for a component to avoid conflicts
 * @param {Object} component - Component object
 * @param {Object} conflicts - Map of component names to conflicting levels
 * @returns {String} A unique export name
 */
function getUniqueExportName(component, conflicts) {
  const { name, level } = component;
  
  // If this component name has conflicts, prefix with level
  if (conflicts[name] && conflicts[name].length > 1) {
    const prefix = level.charAt(0).toUpperCase() + level.slice(1, -1); // atoms -> Atom, molecules -> Molecule, etc.
    return `${prefix}${name}`;
  }
  
  return name;
}

/**
 * Generates the centralized export file content
 * @param {Array} components - Array of component objects
 * @returns {string} The content for the index.ts file
 */
function generateCentralizedExports(components) {
  log(`Generating centralized export file: ${config.outputFile}`);
  
  // Find potential naming conflicts
  const conflicts = findPotentialNamingConflicts(components);
  
  // Start with header
  let exportContent = `/**
 * Centralized UI Component Exports
 * 
 * This file provides a centralized export point for all UI components.
 * It supports both Shadcn-style imports (from '@/components/ui')
 * and Atomic Design imports (from direct component paths).
 * 
 * Generated by centralized-export-generator.js
 */

`;

  // Group components by atomic level
  const atomComponents = components.filter(c => c.level === 'atoms');
  const moleculeComponents = components.filter(c => c.level === 'molecules');
  const organismComponents = components.filter(c => c.level === 'organisms');

  // Track exported names to avoid duplicates
  const exportedNames = new Set();

  // Process regular non-hyphenated components first by level
  exportContent += '// Atom-level components\n';
  atomComponents
    .filter(c => !c.hasHyphen)
    .forEach(component => {
      const componentName = component.name;
      
      // Handle naming conflicts
      if (conflicts[componentName]) {
        // Use named export with prefix for conflicts
        exportContent += `export * as ${getUniqueExportName(component, conflicts)} from "${component.importPath}";\n`;
      } else {
        // Use standard export
        exportContent += `export * from "${component.importPath}";\n`;
        exportedNames.add(componentName);
      }
    });
  
  exportContent += '\n// Molecule-level components\n';
  moleculeComponents
    .filter(c => !c.hasHyphen)
    .forEach(component => {
      const componentName = component.name;
      
      // Handle naming conflicts
      if (conflicts[componentName] || exportedNames.has(componentName)) {
        // Use named export with prefix for conflicts
        exportContent += `export * as ${getUniqueExportName(component, conflicts)} from "${component.importPath}";\n`;
      } else {
        // Use standard export
        exportContent += `export * from "${component.importPath}";\n`;
        exportedNames.add(componentName);
      }
    });
  
  exportContent += '\n// Organism-level components\n';
  organismComponents
    .filter(c => !c.hasHyphen)
    .forEach(component => {
      const componentName = component.name;
      
      // Handle naming conflicts
      if (conflicts[componentName] || exportedNames.has(componentName)) {
        // Use named export with prefix for conflicts
        exportContent += `export * as ${getUniqueExportName(component, conflicts)} from "${component.importPath}";\n`;
      } else {
        // Use standard export
        exportContent += `export * from "${component.importPath}";\n`;
        exportedNames.add(componentName);
      }
    });
  
  // Handle hyphenated components with special handling
  exportContent += '\n// Special handling for components with hyphenated names\n';
  
  // Group by directory to handle related subcomponents
  const hyphenatedByDir = {};
  components
    .filter(c => c.hasHyphen)
    .forEach(component => {
      const key = `${component.level}/${component.dirName}`;
      if (!hyphenatedByDir[key]) {
        hyphenatedByDir[key] = [];
      }
      hyphenatedByDir[key].push(component);
    });
  
  // Add exports for hyphenated components
  Object.entries(hyphenatedByDir).forEach(([dirKey, dirComponents]) => {
    // Find the main component (typically same name as directory or has default export)
    const mainComponent = dirComponents.find(c => 
      c.hasDefaultExport || 
      c.name.toLowerCase() === path.basename(dirComponents[0].dirName).toLowerCase() ||
      c.name.toLowerCase() === toPascalCase(path.basename(dirComponents[0].dirName)).toLowerCase()
    ) || dirComponents[0]; // Fallback to first component
    
    // Build the export statement for the main component and its subcomponents
    const pascalName = toPascalCase(mainComponent.name);
    
    // Check for naming conflicts
    const exportName = conflicts[pascalName] ? 
      `${mainComponent.level.charAt(0).toUpperCase() + mainComponent.level.slice(1, -1)}${pascalName}` :
      pascalName;
    
    let exportStatement = `export { default as ${exportName}`;
    
    // Add named exports for this directory's components
    const subComponents = dirComponents
      .filter(c => c !== mainComponent && !c.name.startsWith('use'))
      .map(c => c.name)
      .filter(Boolean);
    
    if (subComponents.length > 0) {
      exportStatement += `, ${subComponents.join(', ')}`;
    }
    
    exportStatement += ` } from "${mainComponent.importPath}";\n`;
    exportContent += exportStatement;
  });
  
  // Add exports for hook files
  exportContent += '\n// Hook exports\n';
  components
    .filter(c => c.name.startsWith('use'))
    .forEach(component => {
      exportContent += `export * from "${component.importPath}";\n`;
    });
  
  return exportContent;
}

/**
 * Main execution function for the script
 */
function main() {
  log(`Centralized Export Generator${config.dryRun ? ' (DRY RUN)' : ''}`);
  const components = findAllComponents();
  const exportContent = generateCentralizedExports(components);
  
  // Write the export file
  if (!config.dryRun) {
    const outputPath = path.resolve(__dirname, config.outputFile);
    fs.writeFileSync(outputPath, exportContent);
    log(`✅ Generated centralized export file at ${outputPath} with ${components.length} components`);
  } else {
    log('Dry run: Would generate the following centralized export file:');
    log('--------------------------------------------------');
    log(exportContent);
    log('--------------------------------------------------');
  }
  
  return {
    componentsCount: components.length,
    atomsCount: components.filter(c => c.level === 'atoms').length,
    moleculesCount: components.filter(c => c.level === 'molecules').length, 
    organismsCount: components.filter(c => c.level === 'organisms').length
  };
}

main(); 