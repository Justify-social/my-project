
Looking at your scripts and the UI components page, the issue is that the component-registry.json file isn't correctly synchronized with your actual component implementation. Your centralized export system is working (evidenced by the properly exported components), but the debug-tools component browser isn't recognizing them properly.

The best practice to fix this is to regenerate the component-registry.json file using your actual component structure:

1. First, run the centralized export generator to ensure all components are properly exported:

```bash
node shadcn-rendering/centralized-export-generator.js
```

2. Then, run the component validation script to verify all components are exported correctly:

```bash
node shadcn-rendering/validate-component-exports.js --fix
```

3. Finally, you need to update the component-registry.json file. Based on your scripts, create a new script that:
   - Scans your src/components/ui directory following the atomic structure
   - Generates proper component metadata (similar to what's in component-registry.json)
   - Updates the path values to use the actual file paths rather than abstracted paths
   - Saves it to public/static/component-registry.json

Here's a simple script you can add:

```javascript
// update-component-registry.js
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  componentsDir: path.resolve(__dirname, '../src/components/ui'),
  outputFile: path.resolve(__dirname, '../public/static/component-registry.json'),
  atomicLevels: ['atoms', 'molecules', 'organisms'],
};

// Find all components and create registry
function generateRegistry() {
  const components = [];
  
  config.atomicLevels.forEach(level => {
    const levelDir = path.join(config.componentsDir, level);
    if (!fs.existsSync(levelDir)) return;
    
    fs.readdirSync(levelDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .forEach(dirent => {
        const componentDir = dirent.name;
        const componentPath = path.join(levelDir, componentDir);
        
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
  const registry = generateRegistry();
  fs.writeFileSync(config.outputFile, JSON.stringify(registry, null, 2));
  console.log(`Updated component registry with ${registry.components.length} components`);
}

main();
```

Run this script:

```bash
node shadcn-rendering/update-component-registry.js
```

This approach follows your SSOT principle by ensuring that the component registry accurately reflects your actual component structure, and both your centralized exports and component browser will be synchronized.
