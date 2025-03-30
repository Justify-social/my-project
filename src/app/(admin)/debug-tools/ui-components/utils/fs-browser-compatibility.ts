/**
 * Browser-compatibility layer for Node.js 'fs' module
 * This provides browser-compatible implementations for filesystem operations
 * Follows the Single Source of Truth principle by using registry data when available
 */

// Import registry data if needed in browser context
let iconRegistry: any = null;
let iconUrlMap: any = null;

// Try to load the registry data if we're in a browser
if (typeof window !== 'undefined') {
  try {
    // In production, these files should be available in the public directory
    fetch('/static/icon-registry.json')
      .then(response => response.json())
      .then(data => {
        iconRegistry = data;
      })
      .catch(err => {
        console.warn('Unable to load icon registry:', err);
      });

    fetch('/static/component-registry.json')
      .then(response => response.json())
      .then(data => {
        // Store component data for filesystem simulation
      })
      .catch(err => {
        console.warn('Unable to load component registry:', err);
      });
  } catch (e) {
    console.warn('Error initializing registry data in browser:', e);
  }
}

// Synchronous file operations
export const readFileSync = (path: string, options?: string | { encoding?: string; flag?: string }): string => {
  console.warn(`Browser compatibility: readFileSync called for ${path}`);
  
  // If this is an icon path and we have registry data, try to return real data
  if (path.includes('/icons/') && iconRegistry) {
    // Extract icon name from path
    const parts = path.split('/');
    const iconName = parts[parts.length - 1].replace('.svg', '');
    
    // Find in registry
    for (const key in iconRegistry) {
      if (iconRegistry[key].fileName === `${iconName}.svg`) {
        return JSON.stringify(iconRegistry[key]);
      }
    }
  }
  
  return JSON.stringify({ data: 'Browser environment - filesystem access not available' });
};

export const writeFileSync = (path: string, data: string | Buffer, options?: string | { encoding?: string; mode?: number; flag?: string }): void => {
  console.warn(`Browser compatibility: writeFileSync called for ${path} (not supported in browser)`);
  return;
};

export const existsSync = (path: string): boolean => {
  console.warn(`Browser compatibility: existsSync called for ${path}`);
  
  // If this is checking an icon and we have registry data, return real answer
  if (path.includes('/icons/') && iconRegistry) {
    // Extract icon name from path
    const parts = path.split('/');
    const iconName = parts[parts.length - 1].replace('.svg', '');
    
    // Check if exists in registry
    for (const key in iconRegistry) {
      if (iconRegistry[key].fileName === `${iconName}.svg`) {
        return true;
      }
    }
    return false;
  }
  
  return true; // Default assumption in browser environment
};

export const readdirSync = (path: string, options?: { encoding?: string; withFileTypes?: boolean }): string[] => {
  console.warn(`Browser compatibility: readdirSync called for ${path}`);
  
  // If looking for icons and we have registry data, return real icon names
  if (path.includes('/icons/') && iconRegistry) {
    const iconType = path.includes('/light/') ? 'light' : 
                    path.includes('/solid/') ? 'solid' : 
                    path.includes('/brand/') ? 'brand' : 
                    path.includes('/app/') ? 'app' : null;
                    
    if (iconType) {
      const icons = [];
      for (const key in iconRegistry) {
        if (iconRegistry[key].path.includes(`/${iconType}/`)) {
          icons.push(iconRegistry[key].fileName);
        }
      }
      return icons;
    }
  }
  
  return ['example-file-1.ts', 'example-file-2.ts', 'example-directory'];
};

export const statSync = (path: string): { 
  isDirectory: () => boolean,
  isFile: () => boolean,
  mtime: Date
} => {
  console.warn(`Browser compatibility: statSync called for ${path}`);
  return {
    isDirectory: () => path.includes('directory'),
    isFile: () => !path.includes('directory'),
    mtime: new Date()
  };
};

export const mkdirSync = (path: string, options?: { recursive?: boolean; mode?: number }): string | undefined => {
  console.warn(`Browser compatibility: mkdirSync called for ${path}`);
  return path;
};

// Asynchronous file operations (callbacks)
export const readFile = (path: string, options: any, callback?: (err: Error | null, data: string | Buffer) => void): void => {
  if (typeof options === 'function') {
    callback = options;
    options = { encoding: 'utf8' };
  }
  
  console.warn(`Browser compatibility: readFile called for ${path}`);
  
  // If this is an icon path and we have registry data, try to return real data
  if (path.includes('/icons/') && iconRegistry && callback) {
    // Extract icon name from path
    const parts = path.split('/');
    const iconName = parts[parts.length - 1].replace('.svg', '');
    
    // Find in registry
    for (const key in iconRegistry) {
      if (iconRegistry[key].fileName === `${iconName}.svg`) {
        callback(null, JSON.stringify(iconRegistry[key]));
        return;
      }
    }
  }
  
  if (callback) {
    callback(null, JSON.stringify({ data: 'Browser environment - filesystem access not available' }));
  }
};

export const writeFile = (path: string, data: string | Buffer, options: any, callback?: (err: Error | null) => void): void => {
  if (typeof options === 'function') {
    callback = options;
    options = { encoding: 'utf8' };
  }
  
  console.warn(`Browser compatibility: writeFile called for ${path} (not supported in browser)`);
  if (callback) {
    callback(null);
  }
};

export const exists = (path: string, callback: (exists: boolean) => void): void => {
  console.warn(`Browser compatibility: exists called for ${path}`);
  
  // If this is checking an icon and we have registry data, return real answer
  if (path.includes('/icons/') && iconRegistry) {
    // Extract icon name from path
    const parts = path.split('/');
    const iconName = parts[parts.length - 1].replace('.svg', '');
    
    // Check if exists in registry
    for (const key in iconRegistry) {
      if (iconRegistry[key].fileName === `${iconName}.svg`) {
        callback(true);
        return;
      }
    }
    callback(false);
    return;
  }
  
  callback(true);
};

export const readdir = (path: string, options: any, callback?: (err: Error | null, files: string[]) => void): void => {
  if (typeof options === 'function') {
    callback = options;
    options = { encoding: 'utf8' };
  }
  
  console.warn(`Browser compatibility: readdir called for ${path}`);
  
  // If looking for icons and we have registry data, return real icon names
  if (path.includes('/icons/') && iconRegistry && callback) {
    const iconType = path.includes('/light/') ? 'light' : 
                    path.includes('/solid/') ? 'solid' : 
                    path.includes('/brand/') ? 'brand' : 
                    path.includes('/app/') ? 'app' : null;
                    
    if (iconType) {
      const icons = [];
      for (const key in iconRegistry) {
        if (iconRegistry[key].path.includes(`/${iconType}/`)) {
          icons.push(iconRegistry[key].fileName);
        }
      }
      callback(null, icons);
      return;
    }
  }
  
  if (callback) {
    callback(null, ['example-file-1.ts', 'example-file-2.ts', 'example-directory']);
  }
};

export const stat = (path: string, callback: (err: Error | null, stats: any) => void): void => {
  console.warn(`Browser compatibility: stat called for ${path}`);
  callback(null, {
    isDirectory: () => path.includes('directory'),
    isFile: () => !path.includes('directory'),
    mtime: new Date()
  });
};

export const mkdir = (path: string, options: any, callback?: (err: Error | null, path?: string) => void): void => {
  if (typeof options === 'function') {
    callback = options;
    options = { recursive: false };
  }
  
  console.warn(`Browser compatibility: mkdir called for ${path}`);
  if (callback) {
    callback(null, path);
  }
};

// Export default object
export default {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  mkdirSync,
  readFile,
  writeFile,
  exists,
  readdir,
  stat,
  mkdir
}; 