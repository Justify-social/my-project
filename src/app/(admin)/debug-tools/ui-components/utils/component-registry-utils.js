/**
 * Component Registry Utilities
 * 
 * Provides utilities for consistent component registration, path handling,
 * and default props management to ensure a single source of truth
 * for all UI components.
 */

import dynamic from 'next/dynamic';
import React from 'react';

// Cache for previously loaded components to improve performance
const componentCache = new Map();

/**
 * Creates a fallback error component
 * @param {string} name - The name of the component that failed to load
 * @returns {React.FC} A component that displays an error message
 */
export function createErrorComponent(name) {
  return function ErrorComponent(props) {
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50 text-red-600">
        <h3 className="font-medium mb-2">Failed to load {name}</h3>
        <div className="text-sm">
          This component could not be loaded dynamically. Check console for details.
        </div>
      </div>
    );
  };
}

/**
 * Helper to safely handle dynamic imports with fallback for both default and named exports
 * Supports various component export patterns including:
 * - Named exports
 * - Default exports
 * - Mixed exports (both named and default)
 * - Nested exports (components exported from index files)
 * 
 * @param {Promise} importPromise - The dynamic import promise
 * @param {string} componentName - The name of the component to extract
 * @param {React.ComponentType} fallback - Fallback component to use if import fails
 * @returns {Promise<React.ComponentType>} - Promise resolving to the component or fallback
 */
export function safeDynamicImport(importPromise, componentName, fallback) {
  // Check cache first - improve performance with caching
  const cacheKey = `${importPromise}:${componentName}`;
  if (componentCache.has(cacheKey)) {
    console.log(`Using cached component: ${componentName}`);
    return Promise.resolve(componentCache.get(cacheKey));
  }

  // Enhanced component resolution with better logging and more robust checks
  return importPromise
    .then(mod => {
      // Log the module structure in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Module structure for ${componentName}:`, 
          Object.keys(mod).join(', ')
        );
      }

      // Improved component resolution strategy:
      let resolvedComponent = null;

      // 1. Direct match on named export
      if (mod[componentName] && typeof mod[componentName] === 'function') {
        console.debug(`Found exact named match for ${componentName}`);
        resolvedComponent = mod[componentName];
      }
      // 2. Check default export
      else if (mod.default) {
        // 2a. If default export is the component itself
        if (typeof mod.default === 'function' && 
            (mod.default.displayName === componentName || 
             mod.default.name === componentName)) {
          console.debug(`Found default export match for ${componentName}`);
          resolvedComponent = mod.default;
        }
        // 2b. If default is an object with component as property
        else if (typeof mod.default === 'object' && mod.default[componentName]) {
          console.debug(`Found nested export in default for ${componentName}`);
          resolvedComponent = mod.default[componentName];
        }
        // 2c. Use default if explicitly requested
        else if (componentName === 'default' || !componentName) {
          console.debug(`Using default export for ${componentName || 'unnamed component'}`);
          resolvedComponent = mod.default;
        }
        // 2d. If default has a named export that matches
        else if (typeof mod.default === 'object') {
          // Find case-insensitive match
          const caseInsensitiveMatch = Object.keys(mod.default).find(
            key => key.toLowerCase() === componentName.toLowerCase()
          );
          if (caseInsensitiveMatch) {
            console.debug(`Found case-insensitive match in default: ${caseInsensitiveMatch}`);
            resolvedComponent = mod.default[caseInsensitiveMatch];
          }
        }
      }

      // 3. Look for case-insensitive matches in the export
      if (!resolvedComponent) {
        const caseInsensitiveMatch = Object.keys(mod).find(
          key => key.toLowerCase() === componentName.toLowerCase() && 
                typeof mod[key] === 'function'
        );
        if (caseInsensitiveMatch) {
          console.debug(`Found case-insensitive export match: ${caseInsensitiveMatch}`);
          resolvedComponent = mod[caseInsensitiveMatch];
        }
      }

      // 4. Forward reference check - for components that re-export
      if (!resolvedComponent) {
        // Look for an export that itself exports the component
        for (const [key, value] of Object.entries(mod)) {
          if (value && typeof value === 'object' && value[componentName]) {
            console.debug(`Found forward reference via ${key}`);
            resolvedComponent = value[componentName];
            break;
          }
        }
      }

      // 5. First function fallback
      if (!resolvedComponent) {
        // Find the first export that's a function & not a utility
        const firstFunctionExport = Object.entries(mod).find(
          ([key, value]) => typeof value === 'function' && 
                          !['__esModule', 'providers', 'getServerSideProps', 'getStaticProps'].includes(key) &&
                          value.displayName !== 'MDXContent' // Filter out MDX exports
        );
        
        if (firstFunctionExport) {
          console.warn(
            `Could not find exact match for ${componentName}, using ${firstFunctionExport[0]} instead`
          );
          resolvedComponent = firstFunctionExport[1];
        }
      }
      
      // If we found a component, cache it for future use
      if (resolvedComponent) {
        componentCache.set(cacheKey, resolvedComponent);
        return resolvedComponent;
      }
      
      // Nothing worked, log error and use fallback
      console.warn(`Could not find component ${componentName} in module. Available exports:`, 
        Object.keys(mod).join(', ')
      );
      
      // Cache the fallback to avoid repeated failures
      componentCache.set(cacheKey, fallback);
      return fallback;
    })
    .catch(err => {
      console.error(`Failed to load ${componentName} component:`, err);
      return fallback;
    });
}

/**
 * Normalizes a component path to follow the single source of truth pattern
 * Handles both @/components/... and @/src/components/... formats
 * @param {string} path - The component import path
 * @returns {string} - The normalized path
 */
export function normalizeComponentPath(path) {
  if (!path) return '';
  
  // If path starts with @/src/components, remove the /src part
  if (path.startsWith('@/src/components/')) {
    return path.replace('@/src/components/', '@/components/');
  }
  
  // Handle @/src/ prefix (more general case)
  if (path.startsWith('@/src/')) {
    return '@/' + path.substring(6); // Remove '@/src/' prefix
  }
  
  // If the path doesn't start with @/components, add it
  if (!path.startsWith('@/components/') && !path.startsWith('@/')) {
    // Check if it's a relative path
    if (path.startsWith('./') || path.startsWith('../')) {
      // Leave relative paths as-is
      return path;
    }
    
    // Check if it's an absolute path starting with 'src/'
    if (path.startsWith('src/components/')) {
      return '@/' + path.substring(4); // Remove 'src/' prefix
    } else if (path.startsWith('src/')) {
      return '@/' + path.substring(4); // Remove 'src/' prefix
    }
    
    return `@/components/${path}`;
  }
  
  return path;
}

/**
 * Standardizes directory casing in a component path
 * Ensures directories use lowercase and component names use PascalCase
 * @param {string} path - The component import path
 * @returns {string} - The path with standardized casing
 */
export function standardizePathCasing(path) {
  if (!path) return '';
  
  // Split the path into parts
  const parts = path.split('/');
  
  // Check if path has at least 4 parts (@/components/category/directory)
  if (parts.length >= 4) {
    // The component name (if any) is the last part
    const lastPartIndex = parts.length - 1;
    
    // For all intermediate directory parts (between @/components/ and file name)
    for (let i = 3; i < lastPartIndex; i++) {
      // Convert directory names to lowercase
      parts[i] = parts[i].toLowerCase();
    }
    
    // If the last part is a component file (contains .tsx, .jsx, etc.)
    if (parts[lastPartIndex].includes('.')) {
      // Extract base name without extension
      const lastPartWithoutExt = parts[lastPartIndex].split('.')[0];
      const fileExt = parts[lastPartIndex].split('.')[1];
      
      // Convert component file name to PascalCase
      const pascalCase = lastPartWithoutExt.charAt(0).toUpperCase() + 
        lastPartWithoutExt.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
      
      parts[lastPartIndex] = `${pascalCase}.${fileExt}`;
    }
  }
  
  return parts.join('/');
}

/**
 * Apply default props to a component
 * @param {React.ComponentType} Component - The component to apply props to
 * @param {object} props - Default props to apply
 * @returns {React.ComponentType} - Component with default props applied
 */
export function applyDefaultProps(Component, props = {}) {
  if (!Component) return null;
  
  // Create a wrapper component that applies the default props
  const ComponentWithDefaultProps = React.forwardRef((componentProps, ref) => {
    // Merge the default props with the props passed to the component
    const mergedProps = { ...props, ...componentProps, ref };
    return <Component {...mergedProps} />;
  });
  
  // Copy over display name and other properties
  ComponentWithDefaultProps.displayName = `WithDefaults(${Component.displayName || Component.name || 'Component'})`;
  
  return ComponentWithDefaultProps;
}

/**
 * Higher-order function to create a component with default props
 * @param {React.ComponentType} Component - Component to wrap
 * @param {object} defaultProps - Default props to apply
 * @returns {React.ComponentType} - Wrapped component
 */
export function withDefaultProps(Component, defaultProps = {}) {
  return applyDefaultProps(Component, defaultProps);
}

/**
 * Create a component map entry with standardized import
 * @param {string} path - Component path
 * @param {string} name - Component name
 * @param {object} defaultProps - Default props for the component
 * @returns {React.ComponentType} - Dynamically loaded component
 */
export function createComponentMapEntry(path, name, defaultProps = {}) {
  // Standardize the import path
  const normalizedPath = normalizeComponentPath(path);
  const standardizedPath = standardizePathCasing(normalizedPath);
  
  // Create the component with dynamic import
  const DynamicComponent = dynamic(
    () => {
      // Add debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Dynamically importing ${name} from ${standardizedPath}`);
      }
      
      // Create a promise that will resolve to the component
      return safeDynamicImportPath(
        import(/* @vite-ignore */ standardizedPath), 
        name,
        createErrorComponent(name)
      );
    },
    { ssr: false } // Disable SSR for all dynamic components
  );
  
  // If we have default props, apply them
  if (defaultProps && Object.keys(defaultProps).length > 0) {
    return applyDefaultProps(DynamicComponent, defaultProps);
  }
  
  return DynamicComponent;
}

/**
 * Attempt to recover a component if the standard import path fails
 * Tries several alternative paths that might work based on common patterns
 * @param {string} originalPath - The original import path that failed
 * @param {string} componentName - The name of the component to extract
 * @returns {Promise<React.ComponentType>} - Promise resolving to the component or undefined
 */
export function attemptComponentRecovery(originalPath, componentName) {
  // List of path transformations to try
  const pathTransformations = [
    // Try index file
    path => path.replace(/\/[A-Z][a-zA-Z0-9]*$/, ''),
    // Try lowercase directory
    path => {
      const parts = path.split('/');
      if (parts.length >= 4) {
        const dirIndex = parts.length - 2;
        parts[dirIndex] = parts[dirIndex].toLowerCase();
      }
      return parts.join('/');
    },
    // Try PascalCase directory
    path => {
      const parts = path.split('/');
      if (parts.length >= 4) {
        const dirIndex = parts.length - 2;
        parts[dirIndex] = parts[dirIndex].charAt(0).toUpperCase() + 
          parts[dirIndex].slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
      }
      return parts.join('/');
    },
    // Try src/components instead of components
    path => path.replace('@/components/', '@/src/components/'),
    // Try components instead of src/components
    path => path.replace('@/src/components/', '@/components/')
  ];
  
  // Try each transformation
  const recoveryPromises = pathTransformations.map(transform => {
    const transformedPath = transform(originalPath);
    if (transformedPath === originalPath) return Promise.resolve(null);
    
    return import(transformedPath)
      .then(mod => {
        if (mod[componentName]) return mod[componentName];
        if (mod.default) return mod.default;
        return null;
      })
      .catch(() => null);
  });
  
  // Return the first successful recovery
  return Promise.all(recoveryPromises).then(results => {
    const validComponent = results.find(result => result !== null);
    if (validComponent) {
      console.log(`Recovered component ${componentName} with alternative path`);
    }
    return validComponent;
  });
}

/**
 * Helper to safely import a component with proper error handling
 * @param {string} path Path to the component
 * @returns {Promise<any>} Component module
 */
export const safeDynamicImportPath = async (path) => {
  try {
    const standardizedPath = standardizePath(path);
    // Add webpack magic comment to resolve dynamic import warning
    return import(/* webpackMode: "eager" */ standardizedPath)
      .then(module => {
        if (module && module.default) {
          return module.default;
        }
        return module;
      })
      .catch(error => {
        console.error(`Error importing component from ${path}:`, error);
        return null;
      });
  } catch (error) {
    console.error(`Error in safeDynamicImport for ${path}:`, error);
    return null;
  }
}; 