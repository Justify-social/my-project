/**
 * Component Discovery Utilities
 * 
 * These utilities scan the codebase to automatically discover UI components
 * and register them in the component registry.
 */

// Split imports based on environment to avoid "glob is not defined" client errors
import React from 'react';

// Safely detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Pre-discovered components cache that can be used on both client and server
let componentsCache = null;
let lastDiscoveryTime = 0;
const CACHE_TTL = 60000; // 1 minute cache TTL

// Static component list for client-side use when the discovery can't run
// This will be populated from server-side discovery and can be updated via API
const STATIC_COMPONENT_LIST = [
  // Default components that are always available
  {
    name: 'Button',
    path: '@/components/ui/atoms/button/Button',
    category: 'atom',
    exports: ['Button'],
    isDefaultExport: true,
  },
  {
    name: 'Alert',
    path: '@/components/ui/atoms/alert/Alert',
    category: 'atom',
    exports: ['Alert'],
    isDefaultExport: true,
  },
  // Add more known components here as a fallback
];

// Only import Node.js modules on the server side
let fs, path, glob, parser, traverse;
let modulesLoaded = false;

// Dynamic import helper to load server-side modules
async function loadServerModules() {
  if (!isBrowser && !modulesLoaded) {
    try {
      // Use dynamic imports instead of require()
      fs = (await import('fs')).default || await import('fs');
      path = (await import('path')).default || await import('path');
      
      // Handle different import formats for glob (ESM vs CJS)
      const globModule = await import('glob');
      glob = globModule.default || globModule;
      
      // Handle babel parser modules
      const parserModule = await import('@babel/parser');
      parser = parserModule.default || parserModule;
      
      const traverseModule = await import('@babel/traverse');
      traverse = traverseModule.default || traverseModule;
      
      modulesLoaded = true;
      console.log('Server modules successfully loaded for component discovery');
    } catch (err) {
      console.error('Failed to load server modules:', err);
      throw new Error(`Module loading failed: ${err.message}`);
    }
  }
  
  return modulesLoaded;
}

// Initialize server modules - but don't block execution
if (!isBrowser) {
  loadServerModules().catch(err => {
    console.error('Failed to initialize server modules:', err);
  });
}

// Directory patterns for UI components - use consistent patterns
const COMPONENT_PATTERNS = [
  'src/components/ui/atoms/**/*.tsx',
  'src/components/ui/molecules/**/*.tsx',
  'src/components/ui/organisms/**/*.tsx',
];

// Files to ignore during discovery
const IGNORED_PATTERNS = [
  '**/*.test.tsx',
  '**/*.spec.tsx',
  '**/examples/**/*.tsx',
  '**/*.stories.tsx',
  '**/node_modules/**',
  '**/.next/**',
];

/**
 * Server-side only: Extracts component exports from a file
 * @param {string} filePath - Path to the file to analyze
 * @returns {Array<{name: string, isDefault: boolean}>} - Array of component exports
 */
async function extractComponentExports(filePath) {
  // Only run on server side
  if (isBrowser) {
    console.warn('extractComponentExports cannot run in browser environment');
    return [];
  }
  
  // Ensure modules are loaded
  if (!modulesLoaded) {
    try {
      await loadServerModules();
    } catch (error) {
      console.error(`Failed to load modules for parsing ${filePath}:`, error);
      return [];
    }
  }
  
  // Validate parser is available
  if (!parser || !traverse) {
    console.error(`Parser or traverse is undefined when processing ${filePath}`);
    return [];
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const exports = [];
    
    // Create AST with error handling
    let ast;
    try {
      ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });
    } catch (parseError) {
      console.error(`Error parsing ${filePath}:`, parseError.message);
      // Extract component from filename as fallback
      const fileName = path.basename(filePath, path.extname(filePath));
      const componentName = fileName.charAt(0).toUpperCase() + 
        fileName.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
      
      return [{
        name: componentName,
        isDefault: true,
        fromFallback: true
      }];
    }
    
    // Track named exports
    traverse(ast, {
      ExportNamedDeclaration(path) {
        if (path.node.declaration) {
          // Handle function and class declarations
          if (path.node.declaration.type === 'FunctionDeclaration' || 
              path.node.declaration.type === 'ClassDeclaration') {
            if (path.node.declaration.id && 
                path.node.declaration.id.name &&
                /^[A-Z]/.test(path.node.declaration.id.name)) {
              // Potential component (starts with capital letter)
              exports.push({
                name: path.node.declaration.id.name,
                isDefault: false,
              });
            }
          }
          // Handle variable declarations (like const Component = ...)
          else if (path.node.declaration.type === 'VariableDeclaration') {
            path.node.declaration.declarations.forEach(decl => {
              if (decl.id && 
                  decl.id.type === 'Identifier' && 
                  /^[A-Z]/.test(decl.id.name)) {
                // Variable starts with a capital letter - likely a component
                
                // Check if it's a React component by looking at the initializer
                let isComponent = false;
                
                if (decl.init) {
                  // Check for React.forwardRef
                  if (decl.init.type === 'CallExpression' && 
                      decl.init.callee && 
                      decl.init.callee.type === 'MemberExpression' &&
                      decl.init.callee.object &&
                      decl.init.callee.object.name === 'React' &&
                      decl.init.callee.property &&
                      decl.init.callee.property.name === 'forwardRef') {
                    isComponent = true;
                  }
                  // Check for arrow function
                  else if (decl.init.type === 'ArrowFunctionExpression') {
                    isComponent = true;
                  }
                  // Check for function expression
                  else if (decl.init.type === 'FunctionExpression') {
                    isComponent = true;
                  }
                  // Check for call expression (like styled, withX HOCs)
                  else if (decl.init.type === 'CallExpression') {
                    isComponent = true;
                  }
                  // Check for JSX element
                  else if (decl.init.type === 'JSXElement') {
                    isComponent = true;
                  }
                }
                
                if (isComponent) {
                  exports.push({
                    name: decl.id.name,
                    isDefault: false,
                  });
                }
              }
            });
          }
        }
        
        // Handle named export lists: export { ComponentA, ComponentB }
        if (path.node.specifiers && path.node.specifiers.length > 0) {
          path.node.specifiers.forEach(specifier => {
            if (specifier.exported && 
                specifier.exported.name && 
                /^[A-Z]/.test(specifier.exported.name)) {
              exports.push({
                name: specifier.exported.name,
                isDefault: false,
              });
            }
          });
        }
      },
      
      // Handle default exports
      ExportDefaultDeclaration(path) {
        // Direct function or class export
        if (path.node.declaration.type === 'FunctionDeclaration' || 
            path.node.declaration.type === 'ClassDeclaration') {
          if (path.node.declaration.id && 
              path.node.declaration.id.name) {
            exports.push({
              name: path.node.declaration.id.name,
              isDefault: true,
            });
          } else {
            // Anonymous default export, use filename as component name
            const fileName = path.basename(filePath, '.tsx');
            const componentName = fileName.charAt(0).toUpperCase() + 
              fileName.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
            
            exports.push({
              name: componentName,
              isDefault: true,
            });
          }
        }
        // Named default exports like "export default ComponentName"
        else if (path.node.declaration.type === 'Identifier' && 
            /^[A-Z]/.test(path.node.declaration.name)) {
          exports.push({
            name: path.node.declaration.name,
            isDefault: true,
          });
        }
        // Default export of an arrow function or other expression
        else {
          // Use filename as component name for anonymous exports
          const fileName = path.basename(filePath, '.tsx');
          const componentName = fileName.charAt(0).toUpperCase() + 
            fileName.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
          
          exports.push({
            name: componentName,
            isDefault: true,
          });
        }
      }
    });
    
    // If no exports found but filename starts with capital letter, use the filename
    if (exports.length === 0) {
      const fileName = path.basename(filePath, '.tsx');
      if (/^[A-Z]/.test(fileName)) {
        const componentName = fileName.charAt(0).toUpperCase() + 
          fileName.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
        
        exports.push({
          name: componentName,
          isDefault: true,
        });
      }
    }
    
    return exports;
  } catch (error) {
    console.warn(`Error extracting exports from ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Converts a file path to an import path
 * @param {string} filePath - The filesystem path
 * @returns {string} - The import path starting with @/components
 */
function filePathToImportPath(filePath) {
  // Remove .tsx extension and convert to import path
  let importPath = filePath.replace(/\.tsx$/, '');
  
  // Ensure path starts with @/components
  if (importPath.startsWith('src/')) {
    importPath = '@/' + importPath.substring(4); // Remove 'src/' prefix
  } else if (!importPath.startsWith('@/')) {
    importPath = '@/components/' + importPath;
  }
  
  return importPath;
}

/**
 * Determines the category (atom, molecule, organism) of a component based on its path
 * @param {string} filePath - The file path
 * @returns {string} - The category (atom, molecule, organism, or unknown)
 */
function determineComponentCategory(filePath) {
  if (filePath.includes('/atoms/')) return 'atom';
  if (filePath.includes('/molecules/')) return 'molecule';
  if (filePath.includes('/organisms/')) return 'organism';
  return 'unknown';
}

/**
 * Check if a file is likely to contain a UI component based on heuristics
 * @param {string} filePath - The file path to check
 * @returns {boolean} - True if the file likely contains a UI component
 */
function isLikelyUIComponent(filePath) {
  // Skip test and story files
  if (filePath.includes('.test.') || 
      filePath.includes('.spec.') || 
      filePath.includes('.stories.')) {
    return false;
  }
  
  // Skip utility files
  if (filePath.includes('/utils/') || 
      filePath.includes('/helpers/') || 
      filePath.includes('/constants/')) {
    return false;
  }
  
  // Skip hook files
  if (filePath.includes('hook') || filePath.match(/use[A-Z]/)) {
    return false;
  }
  
  // Skip context files
  if (filePath.includes('context') || filePath.includes('provider')) {
    return false;
  }
  
  // Skip type definition files
  if (filePath.endsWith('.d.ts')) {
    return false;
  }
  
  return true;
}

/**
 * Guess the component name from a file path if we can't extract it
 * @param {string} filePath - The file path
 * @returns {string} - The guessed component name
 */
function guessComponentName(filePath) {
  if (isBrowser) {
    // Simple client-side implementation that doesn't need path
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1].replace(/\.tsx$/, '');
    return fileName.charAt(0).toUpperCase() + 
      fileName.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
  } else {
    // Server-side implementation with full path module
    const fileName = path.basename(filePath, '.tsx');
    return fileName.charAt(0).toUpperCase() + 
      fileName.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
  }
}

/**
 * Main discovery function to find all UI components in the codebase
 * This can run on both client and server, with different behavior based on environment
 * @returns {Array<Object>} - Array of component metadata
 */
export async function discoverComponents() {
  // Use cache if available and not expired
  const now = Date.now();
  if (componentsCache && now - lastDiscoveryTime < CACHE_TTL) {
    return componentsCache;
  }
  
  // In browser, use the static list or fetch from API
  if (isBrowser) {
    try {
      // Try to fetch from API
      const response = await fetch('/api/components/discover');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.components)) {
          // Update cache
          componentsCache = data.components;
          lastDiscoveryTime = now;
          return data.components;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch components from API:', error);
    }
    
    // Fallback to static list
    return STATIC_COMPONENT_LIST;
  }
  
  // On server, perform actual discovery
  console.log('Discovering UI components in the codebase (server-side)...');
  
  try {
    // Ensure the modules are loaded
    await loadServerModules();
    
    // Safety check
    if (!glob || !fs || !path) {
      console.error('Required modules not loaded for component discovery');
      return STATIC_COMPONENT_LIST;
    }
    
    const allFiles = [];
    
    // Collect all files matching the patterns
    for (const pattern of COMPONENT_PATTERNS) {
      try {
        const files = await glob.glob(pattern, {
          ignore: IGNORED_PATTERNS,
          absolute: false,
        });
        console.log(`Processing pattern: ${pattern}`);
        console.log(`Found ${files.length} files for pattern ${pattern}`);
        allFiles.push(...files);
      } catch (error) {
        console.error(`Error finding files for pattern ${pattern}:`, error);
      }
    }
    
    console.log(`Total component paths found: ${allFiles.length}`);
    
    // Process each file
    const components = [];
    const errors = [];
    
    for (const filePath of allFiles) {
      try {
        const exports = await extractComponentExports(filePath);
        
        // Skip files with no exports
        if (!exports || exports.length === 0) continue;
        
        // Create component metadata
        for (const exportInfo of exports) {
          const componentPath = filePathToImportPath(filePath);
          
          components.push({
            name: exportInfo.name,
            path: componentPath,
            category: determineComponentCategory(filePath),
            exports: [exportInfo.name],
            isDefaultExport: exportInfo.isDefault,
            fromFallback: exportInfo.fromFallback || false
          });
        }
      } catch (error) {
        errors.push({ filePath, error: error.message });
        console.error(`Error processing component file ${filePath}:`, error);
      }
    }
    
    // Log summary
    console.log(`Discovered ${components.length} UI components (server-side)`);
    if (errors.length > 0) {
      console.warn(`Encountered ${errors.length} errors during component discovery`);
    }
    
    // Update cache
    componentsCache = components;
    lastDiscoveryTime = now;
    
    return components;
  } catch (error) {
    console.error('Failed to discover components:', error);
    return STATIC_COMPONENT_LIST;
  }
}

/**
 * Create a component map from discovered components
 * @param {Array<Object>} components - Array of component metadata from discovery
 * @param {Function} mapEntryCreator - Function to create a map entry
 * @param {Object} defaultProps - Map of default props for components
 * @returns {Object} - Component map
 */
export function createComponentMapFromDiscovery(
  components,
  mapEntryCreator,
  defaultProps = {}
) {
  const componentMap = {};
  
  if (!components || !Array.isArray(components)) {
    console.error('Invalid components data for createComponentMapFromDiscovery');
    return componentMap;
  }
  
  components.forEach(component => {
    try {
      const { name, path } = component;
      
      if (!name || !path) {
        console.warn('Component missing name or path:', component);
        return;
      }
      
      // Get component-specific default props
      const props = defaultProps[name] || {};
      
      // Create and store the component
      componentMap[name] = mapEntryCreator(path, name, props);
    } catch (error) {
      console.error(`Error creating component map entry for ${component.name}:`, error);
    }
  });
  
  return componentMap;
}

/**
 * Clears the component discovery cache
 */
export function clearComponentCache() {
  componentsCache = null;
  lastDiscoveryTime = 0;
  console.log('Component discovery cache cleared');
}

/**
 * Generates metadata for discovered components
 * @param {Array} components - List of discovered components
 * @returns {Array} - Component metadata array for registry
 */
export function generateComponentMetadata(components) {
  return components.map(component => ({
    name: component.name,
    category: component.category,
    path: component.path,
    exports: component.exports,
    props: [], // Props need to be extracted separately
  }));
}

/**
 * Gets a specific component by name from the discovered components
 * @param {string} name - The component name to find
 * @returns {Object|null} - The component info or null if not found
 */
export function getComponentByName(name) {
  const components = discoverComponents();
  return components.find(c => c.name === name) || null;
}

/**
 * Gets components by category
 * @param {string} category - The category to filter by (atom, molecule, organism)
 * @returns {Array} - Components in the specified category
 */
export function getComponentsByCategory(category) {
  const components = discoverComponents();
  return components.filter(c => c.category === category);
}

/**
 * API route handler for discovering components (server-side only)
 * Use this in a Next.js API route to expose component data to the client
 * @returns {Promise<Array>} - Promise resolving to the discovered components
 */
export async function apiDiscoverComponents() {
  if (isBrowser) {
    throw new Error('apiDiscoverComponents can only be called on the server');
  }
  
  return discoverComponents();
} 