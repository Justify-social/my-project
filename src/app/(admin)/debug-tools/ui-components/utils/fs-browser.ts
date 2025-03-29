/**
 * Browser-compatible mock for 'fs' module
 * This provides stub implementations for the fs module in browser environments
 */

// Synchronous file operations
export const readFileSync = (path: string, options?: string | { encoding?: string; flag?: string }): string => {
  console.warn(`Browser mock: readFileSync called for ${path}`);
  return JSON.stringify({ mock: 'This is browser mock data for synchronous reading' });
};

export const writeFileSync = (path: string, data: string | Buffer, options?: string | { encoding?: string; mode?: number; flag?: string }): void => {
  console.warn(`Browser mock: writeFileSync called for ${path} (data not saved)`);
  return;
};

export const existsSync = (path: string): boolean => {
  console.warn(`Browser mock: existsSync called for ${path}`);
  return true; // Always return true in browser environment
};

export const readdirSync = (path: string, options?: { encoding?: string; withFileTypes?: boolean }): string[] => {
  console.warn(`Browser mock: readdirSync called for ${path}`);
  return ['mock-file-1.ts', 'mock-file-2.ts', 'mock-directory'];
};

export const statSync = (path: string): { 
  isDirectory: () => boolean,
  isFile: () => boolean,
  mtime: Date
} => {
  console.warn(`Browser mock: statSync called for ${path}`);
  return {
    isDirectory: () => path.includes('directory'),
    isFile: () => !path.includes('directory'),
    mtime: new Date()
  };
};

export const mkdirSync = (path: string, options?: { recursive?: boolean; mode?: number }): string | undefined => {
  console.warn(`Browser mock: mkdirSync called for ${path}`);
  return path;
};

// Asynchronous file operations (callbacks)
export const readFile = (path: string, options: any, callback?: (err: Error | null, data: string | Buffer) => void): void => {
  if (typeof options === 'function') {
    callback = options;
    options = { encoding: 'utf8' };
  }
  
  console.warn(`Browser mock: readFile called for ${path}`);
  if (callback) {
    callback(null, JSON.stringify({ mock: 'This is browser mock data for async reading' }));
  }
};

export const writeFile = (path: string, data: string | Buffer, options: any, callback?: (err: Error | null) => void): void => {
  if (typeof options === 'function') {
    callback = options;
    options = { encoding: 'utf8' };
  }
  
  console.warn(`Browser mock: writeFile called for ${path} (data not saved)`);
  if (callback) {
    callback(null);
  }
};

export const exists = (path: string, callback: (exists: boolean) => void): void => {
  console.warn(`Browser mock: exists called for ${path}`);
  callback(true);
};

export const readdir = (path: string, options: any, callback?: (err: Error | null, files: string[]) => void): void => {
  if (typeof options === 'function') {
    callback = options;
    options = { encoding: 'utf8' };
  }
  
  console.warn(`Browser mock: readdir called for ${path}`);
  if (callback) {
    callback(null, ['mock-file-1.ts', 'mock-file-2.ts', 'mock-directory']);
  }
};

export const stat = (path: string, callback: (err: Error | null, stats: any) => void): void => {
  console.warn(`Browser mock: stat called for ${path}`);
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
  
  console.warn(`Browser mock: mkdir called for ${path}`);
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