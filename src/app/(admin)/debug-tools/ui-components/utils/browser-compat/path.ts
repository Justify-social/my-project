/**
 * Browser-compatible mock for 'path' module
 * This provides basic path manipulation functions that work in browser environments
 */

export const join = (...paths: string[]): string => {
  // Remove empty segments and normalize slashes
  const segments = paths.filter(Boolean).map(p => p.replace(/^\/+|\/+$/g, ''));
  return segments.join('/');
};

export const resolve = (...paths: string[]): string => {
  // Simple implementation that just joins the paths
  return join(...paths);
};

export const dirname = (path: string): string => {
  const lastSlashIndex = path.lastIndexOf('/');
  return lastSlashIndex === -1 ? '' : path.slice(0, lastSlashIndex);
};

export const basename = (path: string, ext?: string): string => {
  const name = path.slice(path.lastIndexOf('/') + 1);
  if (ext && name.endsWith(ext)) {
    return name.slice(0, -ext.length);
  }
  return name;
};

export const extname = (path: string): string => {
  const lastDotIndex = path.lastIndexOf('.');
  const lastSlashIndex = path.lastIndexOf('/');
  
  // If there's no dot, or the last dot is before the last slash (i.e., in the directory part), return empty string
  if (lastDotIndex === -1 || (lastSlashIndex > -1 && lastDotIndex < lastSlashIndex)) {
    return '';
  }
  
  return path.slice(lastDotIndex);
};

export const parse = (path: string) => {
  const root = '';
  const dir = dirname(path);
  const base = basename(path);
  const ext = extname(path);
  const name = base.slice(0, base.length - ext.length);
  
  return { root, dir, base, ext, name };
};

export default {
  join,
  resolve,
  dirname,
  basename,
  extname,
  parse
}; 