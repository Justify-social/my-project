/**
 * Development Registry Generator
 * 
 * This module provides functionality to scan for UI components during development
 * and generate a component registry that can be used by the UI Component Debug Tools.
 * It uses the same approach as the ComponentRegistryPlugin but operates at runtime.
 */

// Use dynamic imports for Node.js modules to ensure browser compatibility
import { ComponentMetadata, PropDefinition, ComponentCategory } from '../db/registry';

// Environment detection
const isServer = typeof window === 'undefined';
const isBrowser = !isServer;

// We'll dynamically import these modules only in server context
let fs: any;
let path: any;
let glob: any;
let parse: any;
let traverse: any;
let t: any;

// Only load Node.js modules in server environment
if (isServer) {
  // Dynamic imports for server-only modules - use awaited import for synchronous behavior
  Promise.all([
    import('fs').then(module => { fs = module }),
    import('path').then(module => { path = module }),
    import('glob').then(module => { glob = module }),
    // Fix for safer dynamic import of babel packages
    import('@babel/parser').then(module => { 
      // Handle both ESM and CJS module formats
      parse = typeof module.parse === 'function' ? module.parse : module.default?.parse;
      if (!parse) console.error('Failed to get parse function from @babel/parser');
    }),
    import('@babel/traverse').then(module => { 
      traverse = module.default || module;
      if (!traverse) console.error('Failed to get traverse function from @babel/traverse');
    }),
    import('@babel/types').then(module => { 
      t = module.default || module;
      if (!t) console.error('Failed to get types from @babel/types');
    })
  ]).then(() => {
    console.log('All Node.js modules loaded successfully for component scanning');
  }).catch(error => {
    console.error('Error loading Node.js modules for component scanning:', error);
  });
}

// Component search paths - UPDATED to target specific UI directories
const COMPONENT_PATHS = [
  './src/components/ui/atoms',
  './src/components/ui/molecules',
  './src/components/ui/organisms',
  './src/components/ui/deprecated',
  // Keep original paths as fallbacks
  './src/components',
  './src/app/(admin)/components',
  './src/app/components',
];

// Alternative absolute paths to check if relative paths fail
const ABSOLUTE_COMPONENT_PATHS = [
  '/Users/edadams/my-project/src/components/ui/atoms',
  '/Users/edadams/my-project/src/components/ui/molecules',
  '/Users/edadams/my-project/src/components/ui/organisms',
  '/Users/edadams/my-project/src/components/ui/deprecated'
];

// File patterns to include
const INCLUDE_PATTERNS = [
  '**/*.tsx',
  '**/*.jsx',
  '**/*.ts',
];

// Patterns to exclude
const EXCLUDE_PATTERNS = [
  '**/*.test.*',
  '**/*.spec.*',
  '**/node_modules/**',
];

/**
 * Find component files in the application
 * @returns Array of file paths
 */
export async function findComponentFiles(): Promise<string[]> {
  if (isBrowser) {
    console.log('Skipping file scanning in browser environment');
    return Promise.resolve([]);
  }
  
  if (!fs || !path || !glob) {
    console.error('Node.js modules not loaded yet. Cannot scan for components.');
    return [];
  }
  
  const allFiles: string[] = [];
  console.log(`Starting component file search in ${COMPONENT_PATHS.length} paths...`);
  
  // Try relative paths first
  let foundAnyValidPath = false;
  
  for (const basePath of COMPONENT_PATHS) {
    // Make sure the directory exists
    if (!fs.existsSync(basePath)) {
      console.warn(`Path does not exist: ${basePath}`);
      continue;
    }
    
    foundAnyValidPath = true;
    console.log(`Scanning directory: ${basePath}`);
    
    // Find files with include patterns
    for (const pattern of INCLUDE_PATTERNS) {
      try {
        const files = glob.sync(pattern, { 
          cwd: basePath,
          absolute: true,
          ignore: EXCLUDE_PATTERNS
        }) || [];
        
        console.log(`Found ${files.length} files matching pattern '${pattern}' in ${basePath}`);
        allFiles.push(...files);
      } catch (error) {
        console.error(`Error globbing pattern '${pattern}' in ${basePath}:`, error);
      }
    }
  }
  
  // If no valid paths found with relative paths, try absolute paths
  if (!foundAnyValidPath) {
    console.warn('No valid relative paths found. Trying absolute paths...');
    
    for (const basePath of ABSOLUTE_COMPONENT_PATHS) {
      // Make sure the directory exists
      if (!fs.existsSync(basePath)) {
        console.warn(`Absolute path does not exist: ${basePath}`);
        continue;
      }
      
      console.log(`Scanning absolute directory: ${basePath}`);
      
      // Find files with include patterns
      for (const pattern of INCLUDE_PATTERNS) {
        try {
          const files = glob.sync(pattern, { 
            cwd: basePath,
            absolute: true,
            ignore: EXCLUDE_PATTERNS
          }) || [];
          
          console.log(`Found ${files.length} files matching pattern '${pattern}' in ${basePath}`);
          allFiles.push(...files);
        } catch (error) {
          console.error(`Error globbing pattern '${pattern}' in ${basePath}:`, error);
        }
      }
    }
  }
  
  // Try to resolve paths from process.cwd()
  if (allFiles.length === 0) {
    console.warn('No files found with relative or absolute paths. Trying process.cwd()...');
    try {
      const currentDir = process.cwd();
      console.log(`Current working directory: ${currentDir}`);
      
      for (const componentDir of ['src/components/ui/atoms', 'src/components/ui/molecules', 
                                 'src/components/ui/organisms', 'src/components/ui/deprecated']) {
        const fullPath = path.join(currentDir, componentDir);
        
        if (fs.existsSync(fullPath)) {
          console.log(`Found directory: ${fullPath}`);
          
          for (const pattern of INCLUDE_PATTERNS) {
            const files = glob.sync(pattern, { 
              cwd: fullPath,
              absolute: true,
              ignore: EXCLUDE_PATTERNS
            }) || [];
            
            console.log(`Found ${files.length} files matching pattern '${pattern}' in ${fullPath}`);
            allFiles.push(...files);
          }
        } else {
          console.warn(`Path does not exist: ${fullPath}`);
        }
      }
    } catch (error) {
      console.error('Error resolving paths from process.cwd():', error);
    }
  }
  
  // Deduplicate file paths
  const uniqueFiles = Array.from(new Set(allFiles));
  console.log(`Total unique component files found: ${uniqueFiles.length}`);
  
  // Log a sample of files found
  if (uniqueFiles.length > 0) {
    console.log('Sample of files found:');
    uniqueFiles.slice(0, 5).forEach(file => console.log(`- ${file}`));
  }
  
  return uniqueFiles;
}

/**
 * Extract component metadata from a file
 * @param filePath Path to the component file
 * @returns Component metadata or null if not found
 */
export async function extractComponentMetadata(filePath: string): Promise<ComponentMetadata[]> {
  if (isBrowser) {
    return Promise.resolve([]);
  }
  
  if (!fs || !parse || !traverse || !t) {
    console.error('Node.js modules not loaded yet. Cannot extract component metadata.');
    return [];
  }
  
  const components: ComponentMetadata[] = [];
  
  try {
    console.log(`Extracting metadata from: ${filePath}`);
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Parse file with babylon
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy']
    });
    
    // Find exported components
    const exportedComponents: {
      name: string,
      description?: string,
      props?: any[]
    }[] = [];
    
    // Extract component name and details
    traverse(ast, {
      ExportNamedDeclaration(path: any) {
        // Handle named exports (export const Button = ...)
        const declaration = path.node.declaration;
        
        if (t.isVariableDeclaration(declaration)) {
          declaration.declarations.forEach((decl: any) => {
            if (t.isIdentifier(decl.id)) {
              exportedComponents.push({
                name: decl.id.name,
                description: extractDocComment(path)
              });
            }
          });
        } else if (t.isFunctionDeclaration(declaration) && declaration.id) {
          exportedComponents.push({
            name: declaration.id.name,
            description: extractDocComment(path)
          });
        } else if (t.isClassDeclaration(declaration) && declaration.id) {
          exportedComponents.push({
            name: declaration.id.name,
            description: extractDocComment(path)
          });
        }
      },
      
      ExportDefaultDeclaration(path: any) {
        // Handle default exports
        const declaration = path.node.declaration;
        
        if (t.isIdentifier(declaration)) {
          exportedComponents.push({
            name: declaration.name,
            description: extractDocComment(path)
          });
        } else if (t.isFunctionDeclaration(declaration) && declaration.id) {
          exportedComponents.push({
            name: declaration.id.name || 'DefaultComponent',
            description: extractDocComment(path)
          });
        } else if (t.isClassDeclaration(declaration) && declaration.id) {
          exportedComponents.push({
            name: declaration.id.name || 'DefaultComponent',
            description: extractDocComment(path)
          });
        } else {
          // Anonymous default export - fallback to filename
          const fileName = path.node.loc?.filename || '';
          const baseName = fileName.split('/').pop()?.split('.')[0] || 'DefaultComponent';
          
          exportedComponents.push({
            name: baseName,
            description: extractDocComment(path)
          });
        }
      }
    });
    
    console.log(`Found ${exportedComponents.length} exported components in ${filePath}`);
    
    // Create component metadata
    for (const comp of exportedComponents) {
      // Determine component category based on directory path
      let category: ComponentCategory = 'atom';
      
      if (filePath.includes('/molecules/') || filePath.includes('/forms/') || filePath.includes('/data/')) {
        category = 'molecule';
      } else if (filePath.includes('/organisms/') || filePath.includes('/layout/') || filePath.includes('/navigation/')) {
        category = 'organism';
      }
      
      // Get relative path for display - ensure correct subfolder structure
      let relativePath = filePath;
      try {
        if (process && process.cwd) {
          // Standard path normalization
          relativePath = filePath.replace(process.cwd(), '').replace(/^[\/\\]/, '');
          
          // Ensure proper subfolder structure in path
          // Extract components/ui/{atoms|molecules|organisms}/{component-name} structure
          const pathMatch = relativePath.match(/src\/components\/ui\/(atoms|molecules|organisms|deprecated)\/([^\/]+)/i);
          if (pathMatch) {
            const [fullMatch, folderType, componentFolder] = pathMatch;
            
            // If the path doesn't already include the component subfolder, fix it
            if (!relativePath.includes(folderType)) {
              // Make sure path includes correct subfolder structure
              const baseDir = relativePath.substring(0, relativePath.lastIndexOf('/'));
              const fileName = relativePath.substring(relativePath.lastIndexOf('/') + 1);
              relativePath = `${baseDir}/${folderType}/${componentFolder}/${fileName}`;
            }
          }
        }
      } catch (e) {
        console.warn('Error calculating relative path:', e);
      }
      
      // Extract exports
      const exports = [comp.name]; // At minimum, include the component name as an export
      
      // Extract props
      const props: PropDefinition[] = [];
      
      try {
        // For React components, try to find prop types in content
        const propTypeRegex = /interface\s+(\w+Props)\s+\{([^}]+)\}/g;
        const propMatches = [...content.matchAll(propTypeRegex)];
        
        if (propMatches.length > 0) {
          for (const match of propMatches) {
            const propContent = match[2];
            const propLines = propContent.split('\n');
            
            for (const line of propLines) {
              // Parse each prop line (e.g., "variant?: string;" or "disabled: boolean;")
              const propMatch = line.match(/\s*(\w+)(\??):\s*([^;]+);(?:\s*\/\/\s*(.+))?/);
              if (propMatch) {
                const [_, name, optional, type, comment] = propMatch;
                
                props.push({
                  name,
                  type: type.trim(),
                  required: optional !== '?',
                  description: comment ? comment.trim() : undefined,
                  defaultValue: undefined // We'd need to parse the component body to find defaults
                });
              }
            }
          }
        }
      } catch (propError) {
        console.warn(`Error extracting props from ${filePath}:`, propError);
      }
      
      components.push({
        name: comp.name,
        path: relativePath,
        category,
        description: comp.description || `${comp.name} component`,
        lastUpdated: new Date(),
        exports,
        props,
        examples: [],
        dependencies: [],
        version: '1.0.0',
        changeHistory: []
      });
    }
    
  } catch (error) {
    console.error(`Error extracting component metadata from ${filePath}:`, error);
  }
  
  return components;
}

/**
 * Extract JSDoc comment from an AST node
 * @param path AST path
 * @returns Extracted comment or undefined
 */
function extractDocComment(path: any): string | undefined {
  const comments = path.node.leadingComments || [];
  
  for (const comment of comments) {
    if (comment.type === 'CommentBlock' && comment.value.startsWith('*')) {
      // Clean up JSDoc comment
      return comment.value
        .replace(/^\*/, '')
        .replace(/\n \*/g, '\n')
        .trim();
    }
  }
  
  return undefined;
}

/**
 * Scan for components in memory
 * @returns Array of components found
 */
export async function scanComponentsInMemory(): Promise<ComponentMetadata[]> {
  if (isBrowser) {
    // Proper error handling instead of mock data
    console.warn('Browser environment detected, cannot scan for components');
    return Promise.resolve([]);
  }
  
  try {
    // Find component files
    const files = await findComponentFiles();
    console.log(`Found ${files.length} component files to scan`);
    
    if (files.length === 0) {
      console.warn('No component files found!');
      return [];
    }
    
    // Extract components from files
    const allComponents: ComponentMetadata[] = [];
    
    for (const file of files) {
      const components = await extractComponentMetadata(file);
      allComponents.push(...components);
    }
    
    console.log(`Extracted ${allComponents.length} components`);
    
    // If we couldn't find any components, return empty array
    if (allComponents.length === 0) {
      console.warn('No components extracted!');
      return [];
    }
    
    return allComponents;
  } catch (error) {
    console.error('Error scanning components:', error);
    throw error; // Propagate error for proper handling upstream
  }
}

/**
 * Generate component registry for development environment
 * @returns Component registry data
 */
export async function generateDevRegistry(): Promise<{ components: ComponentMetadata[] }> {
  // Prevent client-side generation attempts
  if (typeof window !== 'undefined') {
    console.warn('Registry generation not supported in browser environment');
    return { components: [] };
  }
  
  try {
    console.log('Generating development component registry...');
    const components = await scanComponentsInMemory();
    
    console.log(`Generated registry with ${components.length} components`);
    
    return {
      components
    };
  } catch (error) {
    console.error('Error generating development registry:', error);
    return { components: [] };
  }
}

/**
 * Mock browser components registry - for development use only
 * This fallback has been intentionally removed to ensure we only use actual components
 */
export const mockBrowserComponents: ComponentMetadata[] = [];

/**
 * Get a development registry with proper error handling
 */
export async function getDevelopmentRegistry(): Promise<{ components: ComponentMetadata[] }> {
  try {
    // Try to generate the actual registry first
    const registry = await generateDevRegistry();
    if (registry && registry.components && registry.components.length > 0) {
      return registry;
    }
    
    // If we couldn't generate a registry or it's empty, return an empty array
    // No more fallbacks to mock data
    console.warn('Could not generate development registry, returning empty registry');
    return { components: [] };
  } catch (error) {
    console.error('Error getting development registry:', error);
    return { components: [] };
  }
} 