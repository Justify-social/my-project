/**
 * Browser-compatible path utilities
 * 
 * This module provides a browser-compatible implementation of Node.js path module.
 * It maintains the Single Source of Truth principle by providing a consistent
 * path API across client and server components.
 */

'use client';

// Path utilities that work in browser environment
const path = {
  /**
   * Join path segments together
   */
  join(...paths: string[]): string {
    // Filter out empty segments
    const segments = paths.filter(segment => segment.length > 0);
    
    if (segments.length === 0) {
      return '.';
    }
    
    // Join with forward slashes and normalize
    let joined = segments.join('/');
    
    // Normalize path by removing redundant slashes and resolving .. and .
    joined = joined.replace(/\/+/g, '/'); // Replace multiple slashes with single slash
    
    // Handle relative path segments
    const parts = joined.split('/');
    const result: string[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === '.' || part === '') {
        // Skip . and empty segments
        continue;
      } else if (part === '..') {
        // Go up one level, but don't go above the root
        if (result.length > 0 && result[result.length - 1] !== '..') {
          result.pop();
        } else {
          result.push('..');
        }
      } else {
        result.push(part);
      }
    }
    
    joined = result.join('/') || '.';
    
    // Ensure leading slash is preserved if input had it
    if (paths[0].startsWith('/') && !joined.startsWith('/')) {
      joined = '/' + joined;
    }
    
    return joined;
  },
  
  /**
   * Normalize a path, resolving .. and .
   */
  normalize(p: string): string {
    return path.join(p);
  },
  
  /**
   * Resolve path to an absolute path
   */
  resolve(...paths: string[]): string {
    // In browser we can't truly resolve to absolute paths, 
    // so we'll mimic it with similar behavior
    if (paths.length === 0) {
      return '/';
    }
    
    // Start with a root-like path
    let resolvedPath = '';
    
    for (let i = paths.length - 1; i >= 0; i--) {
      const segment = paths[i];
      
      if (segment) {
        // If segment is absolute, use it as the base
        if (segment.startsWith('/')) {
          resolvedPath = segment;
          break;
        } else {
          // Otherwise prepend to the resolved path
          resolvedPath = segment + (resolvedPath ? '/' + resolvedPath : '');
        }
      }
    }
    
    // If nothing was resolved, use root
    if (!resolvedPath) {
      return '/';
    }
    
    // Normalize the result
    return path.normalize(resolvedPath);
  },
  
  /**
   * Return the directory name of a path
   */
  dirname(p: string): string {
    if (!p) {
      return '.';
    }
    
    // Handle root directory
    if (p === '/' || p === '\\') {
      return '/';
    }
    
    // Normalize to forward slashes
    const normalized = p.replace(/\\/g, '/');
    
    // Remove trailing slashes
    const withoutTrailing = normalized.endsWith('/')
      ? normalized.slice(0, -1)
      : normalized;
    
    // Find last slash
    const lastSlashIndex = withoutTrailing.lastIndexOf('/');
    
    if (lastSlashIndex === -1) {
      // No slashes found
      return '.';
    }
    
    if (lastSlashIndex === 0) {
      // Path is in the root directory
      return '/';
    }
    
    // Return everything before the last slash
    return withoutTrailing.slice(0, lastSlashIndex);
  },
  
  /**
   * Return the last portion of a path
   */
  basename(p: string, ext?: string): string {
    if (!p) {
      return '';
    }
    
    // Normalize to forward slashes
    const normalized = p.replace(/\\/g, '/');
    
    // Remove trailing slashes
    const withoutTrailing = normalized.endsWith('/')
      ? normalized.slice(0, -1)
      : normalized;
    
    // Find last slash
    const lastSlashIndex = withoutTrailing.lastIndexOf('/');
    
    // Get the part after the last slash
    const basename = lastSlashIndex === -1
      ? withoutTrailing
      : withoutTrailing.slice(lastSlashIndex + 1);
    
    // If extension is provided, remove it if it matches the end of the basename
    if (ext && basename.endsWith(ext)) {
      return basename.slice(0, basename.length - ext.length);
    }
    
    return basename;
  },
  
  /**
   * Return the extension of a path
   */
  extname(p: string): string {
    if (!p) {
      return '';
    }
    
    // Normalize to forward slashes and get basename
    const basename = path.basename(p.replace(/\\/g, '/'));
    
    // Find the last dot
    const lastDotIndex = basename.lastIndexOf('.');
    
    // If there's no dot, or the dot is at the beginning (hidden file), return empty string
    if (lastDotIndex <= 0) {
      return '';
    }
    
    // Return everything from the last dot
    return basename.slice(lastDotIndex);
  },
  
  /**
   * Return true if path is absolute
   */
  isAbsolute(p: string): boolean {
    return p.startsWith('/');
  },
  
  /**
   * Return relative path from from to to
   */
  relative(from: string, to: string): string {
    // Normalize inputs
    const normalizedFrom = path.normalize(from);
    const normalizedTo = path.normalize(to);
    
    // If paths are identical, return empty string
    if (normalizedFrom === normalizedTo) {
      return '';
    }
    
    // Split paths into segments
    const fromSegments = normalizedFrom.split('/').filter(Boolean);
    const toSegments = normalizedTo.split('/').filter(Boolean);
    
    // Find common prefix
    let commonPrefixLength = 0;
    const minLength = Math.min(fromSegments.length, toSegments.length);
    
    for (let i = 0; i < minLength; i++) {
      if (fromSegments[i] === toSegments[i]) {
        commonPrefixLength++;
      } else {
        break;
      }
    }
    
    // Create relative path
    const upSegments = fromSegments.length - commonPrefixLength;
    const downSegments = toSegments.slice(commonPrefixLength);
    
    const result = [
      ...Array(upSegments).fill('..'),
      ...downSegments
    ].join('/');
    
    return result || '.';
  },
  
  /**
   * Path segment separator
   */
  sep: '/'
};

export default path; 