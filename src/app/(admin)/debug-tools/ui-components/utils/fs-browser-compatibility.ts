/**
 * Browser-compatible file system utilities
 * 
 * This module provides a filesystem-like API that works in the browser by proxying
 * calls to server-side actions. This maintains the Single Source of Truth principle
 * by ensuring all filesystem operations occur on the server while providing a compatible
 * API for client components.
 */

'use client';

import { 
  serverReadFile, 
  serverFileExists, 
  serverStatFile, 
  serverReadDir, 
  serverWriteFile 
} from './server-actions';

// Define encoding type to match Node.js without requiring imports
type EncodingType = 'utf8' | 'utf-8' | 'ascii' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex';

// Type definitions to match Node's fs module API
export interface FSStats {
  isFile: () => boolean;
  isDirectory: () => boolean;
  size: number;
  mtime: Date;
}

export interface DirectoryEntry {
  name: string;
  isFile: () => boolean;
  isDirectory: () => boolean;
}

export interface FSInterface {
  readFileSync: (path: string, options?: { encoding?: string }) => string | Buffer;
  
  // Properly define overloads for readFile
  readFile: {
    (path: string, options: { encoding: string }, callback: (err: Error | null, data: string) => void): void;
    (path: string, callback: (err: Error | null, data: Buffer) => void): void;
  };
  
  writeFileSync: (path: string, data: string | Buffer, options?: { encoding?: string }) => void;
  
  // Properly define overloads for writeFile
  writeFile: {
    (path: string, data: string | Buffer, options: { encoding?: string }, callback: (err: Error | null) => void): void;
    (path: string, data: string | Buffer, callback: (err: Error | null) => void): void;
  };
  
  existsSync: (path: string) => boolean;
  exists: (path: string, callback: (exists: boolean) => void) => void;
  
  statSync: (path: string) => FSStats;
  stat: (path: string, callback: (err: Error | null, stats: FSStats) => void) => void;
  
  readdirSync: (path: string, options?: { withFileTypes?: boolean }) => string[] | DirectoryEntry[];
  
  // Properly define overloads for readdir
  readdir: {
    (path: string, callback: (err: Error | null, files: string[]) => void): void;
    (path: string, options: { withFileTypes: boolean }, callback: (err: Error | null, files: DirectoryEntry[]) => void): void;
  };
}

// Implementation of the readFile function with proper overload handling
function fsReadFile(path: string, optionsOrCallback: any, callback?: any): void {
  const isOptionsObject = typeof optionsOrCallback === 'object';
  const encoding = isOptionsObject ? optionsOrCallback.encoding as EncodingType : undefined;
  const actualCallback = callback || optionsOrCallback;
  
  if (typeof actualCallback !== 'function') {
    throw new Error('Callback must be a function');
  }
  
  serverReadFile(path, encoding)
    .then(result => {
      if (result.success) {
        actualCallback(null, result.data);
      } else {
        actualCallback(new Error(result.error), null);
      }
    })
    .catch(err => {
      actualCallback(err, null);
    });
}

// Implementation of the writeFile function with proper overload handling
function fsWriteFile(path: string, data: string | Buffer, optionsOrCallback: any, callback?: any): void {
  const isOptionsObject = typeof optionsOrCallback === 'object';
  const encoding = isOptionsObject ? optionsOrCallback.encoding as EncodingType : undefined;
  const actualCallback = callback || optionsOrCallback;
  
  if (typeof actualCallback !== 'function') {
    throw new Error('Callback must be a function');
  }
  
  const dataStr = typeof data === 'string' ? data : data.toString();
  
  serverWriteFile(path, dataStr, encoding)
    .then(result => {
      if (result.success) {
        actualCallback(null);
      } else {
        actualCallback(new Error(result.error));
      }
    })
    .catch(err => {
      actualCallback(err);
    });
}

// Implementation of the readdir function with proper overload handling
function fsReaddir(path: string, optionsOrCallback: any, callback?: any): void {
  const withFileTypes = typeof optionsOrCallback === 'object' ? optionsOrCallback.withFileTypes : false;
  const actualCallback = callback || optionsOrCallback;
  
  if (typeof actualCallback !== 'function') {
    throw new Error('Callback must be a function');
  }
  
  serverReadDir(path, withFileTypes)
    .then(result => {
      if (result.success && result.files) {
        actualCallback(null, result.files);
      } else {
        actualCallback(new Error(result.error || 'Failed to read directory'), null);
      }
    })
    .catch(err => {
      actualCallback(err, null);
    });
}

// Implementation of the stat function
function fsStat(path: string, callback: (err: Error | null, stats: FSStats) => void): void {
  serverStatFile(path)
    .then(result => {
      if (result.success && result.stats) {
        const stats: FSStats = {
          isFile: () => result.stats!.isFile,
          isDirectory: () => result.stats!.isDirectory,
          size: result.stats!.size,
          mtime: new Date(result.stats!.mtime),
        };
        callback(null, stats);
      } else {
        callback(new Error(result.error || 'Failed to stat file'), null as any);
      }
    })
    .catch(err => {
      callback(err, null as any);
    });
}

// Implementation of the exists function
function fsExists(path: string, callback: (exists: boolean) => void): void {
  serverFileExists(path)
    .then(result => {
      callback(result.exists);
    })
    .catch(() => {
      callback(false);
    });
}

/**
 * Creates a browser-compatible fs interface that delegates to server actions
 * when running on the server, and shows warnings in the browser.
 */
export function createFSInterface(): FSInterface {
  // Create synchronous methods that throw errors in browser or delegate to server
  const readFileSync = (path: string, options?: { encoding?: string }): string | Buffer => {
    throw new Error('Synchronous file operations are not supported in the browser');
  };
  
  const writeFileSync = (path: string, data: string | Buffer, options?: { encoding?: string }): void => {
    throw new Error('Synchronous file operations are not supported in the browser');
  };
  
  const existsSync = (path: string): boolean => {
    throw new Error('Synchronous file operations are not supported in the browser');
  };
  
  const statSync = (path: string): FSStats => {
    throw new Error('Synchronous file operations are not supported in the browser');
  };
  
  const readdirSync = (path: string, options?: { withFileTypes?: boolean }): string[] | DirectoryEntry[] => {
    throw new Error('Synchronous file operations are not supported in the browser');
  };
  
  // Return the fs interface
  return {
    readFileSync,
    readFile: fsReadFile as any,
    writeFileSync,
    writeFile: fsWriteFile as any,
    existsSync,
    exists: fsExists,
    statSync,
    stat: fsStat,
    readdirSync,
    readdir: fsReaddir as any,
  };
}

// Create a "fake" fs object for universal use
export const fs = createFSInterface(); 