/**
 * Browser-compatibility layer for Node.js 'path' module
 * This provides browser-compatible implementations of path operations for cross-environment support
 */

const sep = '/';
const delimiter = ':';

/**
 * Normalize a string path, reducing '..' and '.' parts
 */
export const normalize = (path: string): string => {
  // Simple normalization - replace multiple slashes with single slash
  return path.replace(/\/+/g, '/');
};

/**
 * Join all arguments together and normalize the resulting path
 */
export const join = (...paths: string[]): string => {
  const joined = paths.filter(Boolean).join('/');
  return normalize(joined);
};

/**
 * Resolve a path to its absolute path
 */
export const resolve = (...paths: string[]): string => {
  // In browser context, we just join and normalize
  return normalize('/' + join(...paths));
};

/**
 * Return the directory name of a path
 */
export const dirname = (path: string): string => {
  if (!path) return '.';
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || '/';
};

/**
 * Return the last portion of a path
 */
export const basename = (path: string, ext?: string): string => {
  if (!path) return '';
  
  // Get the part after the last slash
  const base = path.split('/').pop() || '';
  
  // If an extension is provided and the basename ends with it, remove it
  if (ext && base.endsWith(ext)) {
    return base.slice(0, -ext.length);
  }
  
  return base;
};

/**
 * Return the extension of the path
 */
export const extname = (path: string): string => {
  if (!path) return '';
  
  const filename = basename(path);
  const lastDotIndex = filename.lastIndexOf('.');
  
  if (lastDotIndex <= 0) return '';
  return filename.slice(lastDotIndex);
};

/**
 * Check if path is absolute
 */
export const isAbsolute = (path: string): boolean => {
  return path.startsWith('/');
};

/**
 * Returns an object from a path string
 */
export const parse = (path: string): {
  root: string;
  dir: string;
  base: string;
  ext: string;
  name: string;
} => {
  const dir = dirname(path);
  const base = basename(path);
  const ext = extname(path);
  const name = basename(path, ext);
  
  return {
    root: '/',
    dir,
    base,
    ext,
    name
  };
};

/**
 * Returns a path string from an object
 */
export const format = (pathObject: {
  root?: string;
  dir?: string;
  base?: string;
  ext?: string;
  name?: string;
}): string => {
  if (pathObject.dir && pathObject.base) {
    return join(pathObject.dir, pathObject.base);
  }
  
  if (pathObject.name && pathObject.ext) {
    const base = pathObject.name + pathObject.ext;
    if (pathObject.dir) {
      return join(pathObject.dir, base);
    }
    return base;
  }
  
  return '';
};

/**
 * Get the relative path from from to to
 */
export const relative = (from: string, to: string): string => {
  // Simple relative path implementation
  // In browser context, this is a simplified version
  return to;
};

// Export default object
export default {
  sep,
  delimiter,
  normalize,
  join,
  resolve,
  dirname,
  basename,
  extname,
  isAbsolute,
  parse,
  format,
  relative
}; 