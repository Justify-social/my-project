#!/usr/bin/env node

/**
 * UI Component Import Fixer
 * 
 * This script automatically fixes problematic imports of UI components:
 * - Finds imports that don't specify the full file path
 * - Determines the correct file path based on component name and directory structure
 * - Updates the import statements to use explicit file paths
 * 
 * Usage:
 *   node component-import-fixer.js           # Dry run - shows changes without applying them
 *   node component-import-fixer.js --apply   # Apply changes to files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const UI_COMPONENTS_ROOT = path.resolve(__dirname, '../src/components/ui');
const DRY_RUN = !process.argv.includes('--apply');

// Component registry to map import paths to file paths
const componentRegistry = {};

/**
 * Build a registry of all UI components and their file paths
 */
function buildComponentRegistry() {
  console.log('Building component registry...');
  
  // Track all export patterns from index files
  const indexExports = {};
  
  // Process each component category (atoms, molecules, organisms)
  ['atoms', 'molecules', 'organisms'].forEach(category => {
    const categoryPath = path.join(UI_COMPONENTS_ROOT, category);
    if (!fs.existsSync(categoryPath)) return;
    
    // Process each component directory within the category
    fs.readdirSync(categoryPath).forEach(dirName => {
      const dirPath = path.join(categoryPath, dirName);
      if (!fs.statSync(dirPath).isDirectory()) return;
      
      // Check for index.ts barrel file to see what's exported
      const indexPath = path.join(dirPath, 'index.ts');
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        const exports = parseExports(indexContent);
        
        // Store what this index file exports
        indexExports[`@/components/ui/${category}/${dirName}`] = exports;
      }
      
      // Find all component files in this directory
      findComponentFiles(dirPath, `@/components/ui/${category}/${dirName}`);
    });
  });
  
  // Add index export information to registry
  Object.entries(indexExports).forEach(([importPath, exports]) => {
    exports.forEach(exportName => {
      if (!componentRegistry[exportName]) {
        componentRegistry[exportName] = {
          possibleImports: [],
          barrelExport: importPath
        };
      } else {
        componentRegistry[exportName].barrelExport = importPath;
      }
    });
  });
  
  console.log(`Built registry with ${Object.keys(componentRegistry).length} components`);
}

/**
 * Parse exports from an index.ts file
 */
function parseExports(fileContent) {
  const exports = [];
  
  // Match "export { X, Y, Z } from './file'"
  const namedExportRegex = /export\s+{([^}]+)}/g;
  let match;
  while ((match = namedExportRegex.exec(fileContent)) !== null) {
    const exportList = match[1].split(',').map(e => e.trim());
    exports.push(...exportList.filter(e => e && !e.includes(' as ')));
    
    // Handle renamed exports
    const renamedExports = exportList
      .filter(e => e && e.includes(' as '))
      .map(e => e.split(' as ')[1].trim());
    exports.push(...renamedExports);
  }
  
  // Match "export type { X, Y, Z } from './file'" (skip types)
  
  // Match "export * from './file'" - we can't know what's exported
  // For now, just note that this index has wildcard exports
  if (fileContent.includes('export * from')) {
    exports.push('*'); // Marker for wildcard export
  }
  
  return exports;
}

/**
 * Find all component files in a directory and add them to the registry
 */
function findComponentFiles(dirPath, importPath, isSubdir = false) {
  fs.readdirSync(dirPath).forEach(fileName => {
    const filePath = path.join(dirPath, fileName);
    
    if (fs.statSync(filePath).isDirectory()) {
      // Process subdirectories (styles, utils, etc.)
      findComponentFiles(
        filePath, 
        `${importPath}/${fileName}`,
        true
      );
    } else if (fileName.endsWith('.tsx') && fileName !== 'index.tsx') {
      // Extract component name (remove .tsx extension)
      const componentName = path.basename(fileName, '.tsx');
      
      // Add to registry
      if (!componentRegistry[componentName]) {
        componentRegistry[componentName] = {
          possibleImports: []
        };
      }
      
      // Add import path for this component implementation
      const implementationPath = `${importPath}/${fileName.replace('.tsx', '')}`;
      componentRegistry[componentName].possibleImports.push(implementationPath);
      
      // If this is the main component file (matches directory name)
      const dirName = path.basename(dirPath);
      if (componentName.toLowerCase() === dirName.toLowerCase() || 
          componentName.toLowerCase() === dirName.charAt(0).toUpperCase() + dirName.slice(1).toLowerCase()) {
        componentRegistry[componentName].mainImplementation = implementationPath;
      }
    }
  });
}

/**
 * Find all UI component imports that need fixing
 */
function findComponentImports() {
  console.log('Finding UI component imports to fix...');
  
  // Use grep to find all imports from UI components
  const grepCmd = "grep -r \"import.*from.*@/components/ui\" --include=\"*.tsx\" --include=\"*.ts\" src/";
  const output = execSync(grepCmd, { encoding: 'utf8' });
  
  const importsByFile = {};
  
  output.split('\n').filter(Boolean).forEach(line => {
    // Parse the line (file:import statement)
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    const file = line.slice(0, colonIndex);
    const importStatement = line.slice(colonIndex + 1).trim();
    
    // Skip index files and type definitions
    if (file.endsWith('index.ts') || file.endsWith('.d.ts')) {
      return;
    }
    
    // Extract the import path
    const importMatch = importStatement.match(/import\s+.*from\s+['"](@\/components\/ui\/[^'"]*)['"]/);
    if (!importMatch) return;
    
    const importPath = importMatch[1];
    
    // Skip imports that already include specific file paths
    if (importPath.includes('.tsx') || importPath.includes('.ts')) {
      return;
    }
    
    // Extract the imported component names
    let importedComponents = [];
    
    // Named imports: import { Button, Card } from '@/components/ui/atoms/button'
    const namedImportMatch = importStatement.match(/import\s+{([^}]+)}\s+from/);
    if (namedImportMatch) {
      importedComponents = namedImportMatch[1]
        .split(',')
        .map(name => name.trim().split(' as ')[0].trim())
        .filter(Boolean);
    }
    
    // Default import: import Button from '@/components/ui/atoms/button'
    const defaultImportMatch = importStatement.match(/import\s+([^{}\s,]+)\s+from/);
    if (defaultImportMatch && !namedImportMatch) {
      importedComponents = [defaultImportMatch[1]];
    }
    
    // Skip imports that don't specify component names
    if (importedComponents.length === 0) {
      return;
    }
    
    // Add to the map of files that need updates
    if (!importsByFile[file]) {
      importsByFile[file] = [];
    }
    
    importsByFile[file].push({
      originalStatement: importStatement,
      importPath,
      importedComponents
    });
  });
  
  return importsByFile;
}

/**
 * Generate a corrected import statement
 */
function fixImportStatement(importInfo) {
  const { originalStatement, importPath, importedComponents } = importInfo;
  
  // Check if we know how to fix these components
  const fixableComponents = importedComponents.filter(
    component => componentRegistry[component]
  );
  
  if (fixableComponents.length === 0) {
    return null; // Can't fix this import
  }
  
  // For each component, determine the correct import path
  const componentPaths = {};
  
  fixableComponents.forEach(component => {
    const info = componentRegistry[component];
    
    // If this component has a main implementation path, use that
    if (info.mainImplementation) {
      componentPaths[component] = info.mainImplementation;
    } 
    // If imported from a barrel file that exports this component, keep as is
    else if (info.barrelExport && info.barrelExport === importPath) {
      componentPaths[component] = importPath;
    }
    // If we know possible implementations, use the first one
    else if (info.possibleImports.length > 0) {
      componentPaths[component] = info.possibleImports[0];
    }
    // Otherwise, we can't determine the path
    else {
      componentPaths[component] = null;
    }
  });
  
  // Group components by their corrected path
  const pathToComponents = {};
  
  fixableComponents.forEach(component => {
    const path = componentPaths[component];
    if (!path) return;
    
    if (!pathToComponents[path]) {
      pathToComponents[path] = [];
    }
    pathToComponents[path].push(component);
  });
  
  // Generate the new import statements
  const newImports = [];
  
  Object.entries(pathToComponents).forEach(([path, components]) => {
    if (components.length === 0) return;
    
    // Handle named imports
    if (components.length > 0) {
      const componentsList = components.join(', ');
      newImports.push(`import { ${componentsList} } from '${path}'`);
    }
  });
  
  // If we couldn't fix anything, return the original
  if (newImports.length === 0) {
    return null;
  }
  
  return newImports.join('\n');
}

/**
 * Fix imports in a file
 */
function fixImportsInFile(file, importsToFix) {
  console.log(`Fixing imports in ${file}...`);
  
  // Read the file content
  const content = fs.readFileSync(file, 'utf8');
  let updatedContent = content;
  
  // Fix each import statement
  importsToFix.forEach(importInfo => {
    const fixedImport = fixImportStatement(importInfo);
    if (!fixedImport) {
      console.log(`  Skipping: ${importInfo.originalStatement}`);
      return;
    }
    
    // Replace the original import with the fixed version
    updatedContent = updatedContent.replace(
      importInfo.originalStatement, 
      fixedImport
    );
    
    console.log(`  Fixed: ${importInfo.originalStatement}`);
    console.log(`  To: ${fixedImport}`);
  });
  
  // Check if anything changed
  if (updatedContent === content) {
    console.log(`  No changes needed`);
    return false;
  }
  
  // In dry run mode, don't actually write the file
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would update file`);
    return true;
  }
  
  // Write the updated content
  fs.writeFileSync(file, updatedContent);
  console.log(`  Updated file`);
  return true;
}

/**
 * Main function to fix all component imports
 */
async function fixComponentImports() {
  console.log(`UI Component Import Fixer (${DRY_RUN ? 'DRY RUN' : 'APPLY'} mode)`);
  
  // Build the component registry
  buildComponentRegistry();
  
  // Find all imports that need fixing
  const importsByFile = findComponentImports();
  const filesToFix = Object.keys(importsByFile);
  
  if (filesToFix.length === 0) {
    console.log('No imports need fixing. Everything looks good!');
    return;
  }
  
  console.log(`\nFound ${filesToFix.length} files with imports to fix`);
  
  // Fix imports in each file
  let fixedCount = 0;
  for (const file of filesToFix) {
    const wasFixed = fixImportsInFile(file, importsByFile[file]);
    if (wasFixed) fixedCount++;
  }
  
  console.log(`\nSummary:`);
  console.log(`- Examined ${filesToFix.length} files`);
  console.log(`- Fixed imports in ${fixedCount} files`);
  
  if (DRY_RUN) {
    console.log(`\nThis was a dry run. Run with --apply to apply changes.`);
  } else {
    console.log(`\nAll imports have been updated.`);
  }
}

// Run the fixer
fixComponentImports().catch(console.error); 