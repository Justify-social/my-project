/**
 * Static Registry Generator (JavaScript version)
 * 
 * Simple JavaScript version that can be imported directly without TypeScript compilation.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const { join } = path;
const { existsSync, readFileSync, readdirSync, writeFileSync } = fs;

// Get current filename and directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target directories to scan
const COMPONENT_DIRS = [
  { path: 'src/components/ui/atoms', category: 'atoms' },
  { path: 'src/components/ui/molecules', category: 'molecules' },
  { path: 'src/components/ui/organisms', category: 'organisms' }
];

// Output file path - Single Source of Truth
const OUTPUT_PATH = join(process.cwd(), 'public/static');
const COMPONENT_REGISTRY_FILE = join(OUTPUT_PATH, 'component-registry.json');

// Keywords that might indicate mock data
const MOCK_KEYWORDS = ['mock', 'fake', 'dummy', 'placeholder', 'sample'];

// Legitimate uses of testing-related words that should not trigger the mock filter
const LEGITIMATE_CONTEXTS = [
  'test-id', 
  'data-testid', 
  'testing-library',
  'component testing',
  'unit testing',
  'integration testing',
  'e2e testing',
  'compatibility testing',
  'accessibility testing',
  'asset testing',
  'creative asset testing',
  'PropTypes',
  'unit-test',
  'test-utils',
  'a11y-test',
  'visual-test',
  'component-test'
];

// Function to convert PascalCase to kebab-case
function pascalToKebab(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Detects and extracts compound components (Component.SubComponent pattern)
 * @param {Array} components - Array of component metadata
 * @returns {Array} Array of extracted compound components
 */
function extractCompoundComponents(components) {
  const compoundComponents = [];
  
  components.forEach(component => {
    const filePath = path.resolve(process.cwd(), component.path);
    if (!existsSync(filePath)) return;
    
    try {
      const content = readFileSync(filePath, 'utf8');
      
      // Check for compound component patterns
      const subComponentMatches = content.match(/export\s+const\s+(\w+)(?:Content|Trigger|Item|Header|Root|Title|Description|Footer|Close|Action)\s*=/g) || [];
      
      if (subComponentMatches.length > 0) {
        // Extract sub-component names and add to registry
        subComponentMatches.forEach(match => {
          const subName = match.match(/export\s+const\s+(\w+)/)[1];
          
          compoundComponents.push({
            id: `${component.category}-${component.name.toLowerCase()}-${subName.toLowerCase()}`,
            name: subName,
            category: component.category,
            path: component.path,
            importPath: component.importPath,
            shadcnPath: component.shadcnPath,
            description: `${subName} sub-component of ${component.name}`,
            lastUpdated: new Date().toISOString(),
            parentComponent: component.name,
            isSubComponent: true
          });
        });
      }
    } catch (error) {
      console.error(`Error processing ${filePath}: ${error.message}`);
    }
  });
  
  return compoundComponents;
}

/**
 * Recursively scans directories for component files
 * @param {string} dirPath - Directory path to scan
 * @param {string} category - Component category (atoms, molecules, organisms)
 * @returns {Array} Array of component metadata
 */
function scanDirectoryRecursively(dirPath, category) {
  let components = [];
  
  if (!existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return components;
  }
  
  const entries = readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Scan subdirectories recursively
      const subComponents = scanDirectoryRecursively(fullPath, category);
      components = components.concat(subComponents);
    } else if (
      entry.isFile() && 
      entry.name.endsWith('.tsx') && 
      !entry.name.startsWith('index') &&
      !entry.name.includes('.test.') && 
      !entry.name.includes('.spec.')
    ) {
      // Process component file
      const baseName = path.basename(entry.name, '.tsx');
      
      // Create component metadata
      const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
      const dirParts = path.dirname(relativePath).split('/');
      const componentDir = dirParts[dirParts.length - 1];
      
      components.push({
        id: `${category}-${componentDir}-${baseName}`.toLowerCase(),
        name: baseName,
        category,
        path: relativePath,
        importPath: `@/components/ui/${category}/${componentDir}/${baseName}`,
        shadcnPath: `@/components/ui/${componentDir}`,
        description: `${baseName} ${category} component`,
        lastUpdated: new Date().toISOString()
      });
    }
  }
  
  return components;
}

/**
 * Extract component imports from the registry utils file
 * @returns {Object} Map of component keys to import paths
 */
function extractComponentImports() {
  try {
    const utilsPath = path.resolve(process.cwd(), 'src/app/(admin)/debug-tools/ui-components/utils/component-registry-utils.js');
    if (!existsSync(utilsPath)) {
      console.warn('Component registry utils file not found');
      return {};
    }
    
    const content = readFileSync(utilsPath, 'utf8');
    
    // Find the COMPONENT_IMPORTS object
    const importsMatch = content.match(/export\s+const\s+COMPONENT_IMPORTS\s*=\s*\{([\s\S]*?)\};/);
    if (!importsMatch || !importsMatch[1]) {
      console.warn('COMPONENT_IMPORTS not found in registry utils');
      return {};
    }
    
    // Parse the imports into a map
    const importMap = {};
    const lines = importsMatch[1].split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//') && line.includes(':'));
    
    lines.forEach(line => {
      try {
        // Extract key and import path
        const keyMatch = line.match(/'([^']+)'/);
        const pathMatch = line.match(/import\('([^']+)'\)/);
        
        if (keyMatch && pathMatch) {
          const key = keyMatch[1];
          const importPath = pathMatch[1];
          importMap[key] = importPath;
        }
      } catch (err) {
        // Skip lines that can't be parsed
      }
    });
    
    return importMap;
  } catch (err) {
    console.error('Error extracting component imports:', err);
    return {};
  }
}

/**
 * Scans the UI component directories and extracts metadata
 * @returns {Array} Component metadata
 */
function generateComponentRegistry() {
  let allComponents = [];
  
  try {
    // Scan all atomic levels
    COMPONENT_DIRS.forEach(({ path: dirPath, category }) => {
      const fullPath = path.resolve(process.cwd(), dirPath);
      const components = scanDirectoryRecursively(fullPath, category);
      allComponents = allComponents.concat(components);
    });
    
    // Extract compound components
    const compoundComponents = extractCompoundComponents(allComponents);
    allComponents = allComponents.concat(compoundComponents);
    
    // Extract component imports
    const componentImports = extractComponentImports();
    console.log(`Found ${Object.keys(componentImports).length} components in COMPONENT_IMPORTS`);
    
    // Add components from COMPONENT_IMPORTS that might be missing
    Object.entries(componentImports).forEach(([key, importPath]) => {
      // Check if component already exists
      const exists = allComponents.some(comp => 
        comp.importPath === importPath || 
        comp.path === importPath.replace('@/', '') ||
        comp.name.toLowerCase() === key
      );
      
      if (!exists) {
        // Extract category from import path
        let category = 'atoms';
        if (importPath.includes('/molecules/')) category = 'molecules';
        if (importPath.includes('/organisms/')) category = 'organisms';
        
        // Extract component name from path
        const pathParts = importPath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const componentName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
        
        // Add the component
        allComponents.push({
          id: `${category}-${key}`,
          name: componentName,
          category,
          path: importPath.replace('@/', ''),
          importPath,
          description: `${componentName} ${category} component`,
          lastUpdated: new Date().toISOString(),
          library: 'shadcn' // Mark all components as Shadcn
        });
      }
    });
    
    // Mark all components as Shadcn library components
    allComponents = allComponents.map(component => ({
      ...component,
      library: 'shadcn'
    }));
    
    console.log(`Generated registry with ${allComponents.length} total components (all marked as shadcn)`);
    
    // Return ALL components
    return allComponents;
  } catch (error) {
    console.error("Error generating component registry:", error);
    return [];
  }
}

// Writes to the static file for use by other parts of the app
function writeRegistryToFile() {
  const allComponents = generateComponentRegistry();
  
  // Create registry object
  const registry = {
    components: allComponents,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
    metadata: {
      generatedAt: new Date().toISOString(),
      count: allComponents.length,
      atomsCount: allComponents.filter(c => c.category === 'atoms').length,
      moleculesCount: allComponents.filter(c => c.category === 'molecules').length,
      organismsCount: allComponents.filter(c => c.category === 'organisms').length,
      compoundCount: allComponents.filter(c => c.isSubComponent).length
    }
  };
  
  // Ensure output directory exists
  if (!existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }
  
  // Write to the SSOT location only
  writeFileSync(COMPONENT_REGISTRY_FILE, JSON.stringify(registry, null, 2));
  console.log(`✅ Updated component registry with ${allComponents.length} components (${allComponents.filter(c => c.isSubComponent).length} compound components)`);
  console.log(`✅ Saved to ${COMPONENT_REGISTRY_FILE} (SSOT)`);
}

// Run the registry generator
writeRegistryToFile();

// Components for direct import
const components = generateComponentRegistry();

// Export for ES modules
export { components, generateComponentRegistry };
export default { components, generateComponentRegistry }; 