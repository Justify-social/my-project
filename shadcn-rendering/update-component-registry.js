#!/usr/bin/env node

/**
 * Component Registry Generator
 * 
 * This script generates a centralized component registry for the UI Component debug tools.
 * It scans the components directory for all components and generates a JSON file
 * with metadata about each component that can be used by the debug tools.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
/* eslint-enable @typescript-eslint/no-var-requires */

// Configuration
const config = {
  componentsDir: path.resolve(__dirname, '../src/components/ui'),
  outputFile: path.resolve(__dirname, '../public/static/component-registry.json'),
  atomicLevels: ['atoms', 'molecules', 'organisms'],
};

// Helper function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Find all components and create registry
function generateRegistry() {
  const components = [];
  
  config.atomicLevels.forEach(level => {
    const levelDir = path.join(config.componentsDir, level);
    if (!fileExists(levelDir)) return;
    
    fs.readdirSync(levelDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .forEach(dirent => {
        const componentDir = dirent.name;
        const componentPath = path.join(levelDir, componentDir);
        
        try {
          const componentFiles = fs.readdirSync(componentPath)
            .filter(file => file.endsWith('.tsx') && !file.startsWith('index'));
            
          componentFiles.forEach(file => {
            const filePath = `src/components/ui/${level}/${componentDir}/${file}`;
            const name = file.replace(/\.tsx$/, '');
            
            components.push({
              path: filePath,
              registryPath: `${level}/${componentDir}/${name}`,
              name: componentDir.toLowerCase(),
              originalName: name,
              category: level,
              lastUpdated: new Date().toISOString(),
              exports: [],
              props: [],
              description: `${name} ${level} component`,
              examples: [],
              dependencies: [],
              version: "1.0.0",
              changeHistory: [],
              library: "atomic"
            });
          });
        } catch (error) {
          console.error(`Error processing ${componentPath}: ${error.message}`);
        }
      });
  });
  
  // Add shadcn components with proper paths
  const shadcnComponents = components.map(c => ({
    name: `Shadcn${c.originalName}`,
    path: `@/components/ui/${c.name}`,
    exportName: c.originalName,
    category: c.category === 'atoms' ? 'atom' : c.category === 'molecules' ? 'molecule' : 'organism',
    isParent: true,
    library: "shadcn",
    originalName: c.originalName,
    isNamespaced: true
  }));
  
  const registry = {
    components: [...components, ...shadcnComponents],
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: "1.0.0"
  };
  
  return registry;
}

// Main function
function main() {
  try {
    const registry = generateRegistry();
    
    // Ensure directory exists
    const outputDir = path.dirname(config.outputFile);
    if (!fileExists(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(config.outputFile, JSON.stringify(registry, null, 2));
    console.log(`✅ Updated component registry with ${registry.components.length} components`);
    console.log(`Output file: ${config.outputFile}`);
  } catch (error) {
    console.error(`❌ Error generating registry: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main(); 