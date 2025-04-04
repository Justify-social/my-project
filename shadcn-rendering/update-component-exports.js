/**
 * UI Component Export Manager
 * 
 * This script analyzes the component directory structure and updates the centralized
 * index.ts file with all components that exist in the Atomic Design structure.
 * 
 * This helps maintain our Single Source of Truth (SSOT) architecture by ensuring
 * that all components can be imported using either the Shadcn style:
 * import { Button } from "@/components/ui";
 * 
 * or the explicit Atomic Design style:
 * import { Button } from "@/components/ui/atoms/button/Button";
 * 
 * Usage:
 * node shadcn-rendering/update-component-exports.js [--dry-run] [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  componentsDir: path.resolve(__dirname, '../src/components/ui'),
  indexFile: path.resolve(__dirname, '../src/components/ui/index.ts'),
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose')
};

// Helper function to convert kebab-case to PascalCase
function getPascalCaseName(kebabCase) {
  return kebabCase
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// Check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Log with verbosity check
function log(message, forceLog = false) {
  if (CONFIG.verbose || forceLog) {
    console.log(message);
  }
}

/**
 * Find all components in the atomic design structure
 * @returns {Array} Array of component objects with level, name, path, etc.
 */
function findAllComponents() {
  log('Scanning component directories...', true);
  const atomicLevels = ['atoms', 'molecules', 'organisms'];
  const components = [];
  
  // Check each atomic level
  atomicLevels.forEach(level => {
    const levelPath = path.join(CONFIG.componentsDir, level);
    
    if (!fileExists(levelPath)) {
      log(`Skipping non-existent directory: ${levelPath}`);
      return;
    }
    
    // Get component directories in this level
    const componentDirs = fs.readdirSync(levelPath)
      .filter(dir => {
        const dirPath = path.join(levelPath, dir);
        return fs.statSync(dirPath).isDirectory() && !dir.startsWith('.');
      });
    
    // Check each component directory
    componentDirs.forEach(componentDir => {
      const kebabName = componentDir.toLowerCase();
      const pascalName = getPascalCaseName(componentDir);
      const componentPath = path.join(levelPath, componentDir);
      
      // Try different common file patterns
      const possibleFiles = [
        path.join(componentPath, `${pascalName}.tsx`),
        path.join(componentPath, `${pascalName}.jsx`),
        path.join(componentPath, `${kebabName}.tsx`),
        path.join(componentPath, `${componentDir}.tsx`)
      ];
      
      let implementationFile = null;
      for (const file of possibleFiles) {
        if (fileExists(file)) {
          implementationFile = file;
          break;
        }
      }
      
      if (implementationFile) {
        const fileContent = fs.readFileSync(implementationFile, 'utf-8');
        
        // Check exports to determine component parts
        const exportedComponents = [];
        const defaultExport = fileContent.match(/export\s+default\s+(\w+)/);
        const namedExports = [...fileContent.matchAll(/export\s+(?:const|function|class|interface|type)\s+(\w+)/g)];
        const reExports = [...fileContent.matchAll(/export\s+\{\s*([\w\s,]+)\s*\}/g)];
        
        // Add default export if exists
        if (defaultExport && defaultExport[1]) {
          exportedComponents.push(defaultExport[1]);
        }
        
        // Add named exports
        namedExports.forEach(match => {
          if (match[1]) exportedComponents.push(match[1]);
        });
        
        // Add re-exports
        reExports.forEach(match => {
          if (match[1]) {
            const names = match[1].split(',').map(name => name.trim());
            exportedComponents.push(...names);
          }
        });
        
        components.push({
          name: pascalName,
          kebabName: kebabName,
          level: level,
          path: implementationFile,
          relativePath: path.relative(CONFIG.componentsDir, implementationFile),
          exportedComponents: exportedComponents
        });
      }
    });
  });
  
  return components;
}

/**
 * Generate content for the index.ts file
 * @param {Array} components Array of component objects
 * @returns {String} Content for the index.ts file
 */
function generateIndexContent(components) {
  // Group components by level
  const groupedByLevel = {
    atoms: components.filter(c => c.level === 'atoms'),
    molecules: components.filter(c => c.level === 'molecules'),
    organisms: components.filter(c => c.level === 'organisms')
  };
  
  // Start with the header
  let content = `/**
 * UI Components - SINGLE SOURCE OF TRUTH
 * 
 * This file provides both atomic design and Shadcn-style imports.
 * All components are exported from their atomic locations without 
 * the need for individual barrel files.
 * 
 * USAGE:
 * 
 * 1. Atomic Design Pattern imports (preferred for new code):
 *    import { Button } from '@/components/ui/atoms/button/Button';
 * 
 * 2. Direct imports (compatible with Shadcn UI style):
 *    import { Button } from '@/components/ui';
 */

`;

  // Process each level
  ['atoms', 'molecules', 'organisms'].forEach(level => {
    content += `// ------------------------------------\n`;
    content += `// ${level.toUpperCase()}\n`;
    content += `// ------------------------------------\n\n`;
    
    // Sort components alphabetically by kebab name
    const sortedComponents = groupedByLevel[level].sort((a, b) => 
      a.kebabName.localeCompare(b.kebabName));
    
    // Add exports for each component in this level
    sortedComponents.forEach(component => {
      // Skip if no exports found
      if (!component.exportedComponents || component.exportedComponents.length === 0) {
        return;
      }
      
      // Generate a comment with the component name
      const displayName = component.kebabName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      content += `// ${displayName}\n`;
      
      // Generate the export statement
      const importPath = `./${component.level}/${component.kebabName}/${component.name}`;
      const exportNames = component.exportedComponents.join(', ');
      
      content += `export { ${exportNames} } from '${importPath}';\n\n`;
    });
  });
  
  return content;
}

/**
 * Update the index.ts file with all component exports
 */
function updateIndexFile(components) {
  const content = generateIndexContent(components);
  
  if (CONFIG.dryRun) {
    log(`Would update index file: ${CONFIG.indexFile}`, true);
    log(`With content:\n${content}`);
  } else {
    try {
      fs.writeFileSync(CONFIG.indexFile, content);
      log(`✅ Updated index file: ${CONFIG.indexFile}`, true);
    } catch (error) {
      console.error(`❌ Failed to update index file ${CONFIG.indexFile}: ${error.message}`);
    }
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Scanning for components in the Atomic Design structure...');
  
  // Find all components
  const components = findAllComponents();
  
  if (components.length === 0) {
    console.log('❌ No components found in the Atomic Design structure!');
    return;
  }
  
  console.log(`Found ${components.length} components:\n`);
  
  // Display table of components
  console.log('| Component | Atomic Level | Implementation Path |');
  console.log('|-----------|--------------|---------------------|');
  components.forEach(component => {
    console.log(`| ${component.name} | ${component.level} | ${component.relativePath} |`);
  });
  
  console.log(`\n${CONFIG.dryRun ? '🔍 Dry run mode - no changes will be made.' : '🔧 Updating index.ts file...'}\n`);
  
  // Update the index.ts file
  updateIndexFile(components);
  
  // Output summary
  console.log(`\n📊 Summary:`);
  console.log(`- Total components found: ${components.length}`);
  console.log(`  - Atoms: ${components.filter(c => c.level === 'atoms').length}`);
  console.log(`  - Molecules: ${components.filter(c => c.level === 'molecules').length}`);
  console.log(`  - Organisms: ${components.filter(c => c.level === 'organisms').length}`);
  
  if (CONFIG.dryRun) {
    console.log('\nRun again without --dry-run to apply changes.');
  }
}

// Run the script
main(); 