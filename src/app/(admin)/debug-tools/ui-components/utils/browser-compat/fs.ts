/**
 * Browser-compatible implementation for fs/promises
 * This provides minimal implementations of file system functions for browser environments
 * where the Node.js 'fs' module is not available.
 */

export type FileHandle = {
  close: () => Promise<void>;
};

export const readFile = async (path: string): Promise<string> => {
  console.warn(`Browser environment: readFile called for ${path}`);
  throw new Error('File system operations are not available in browser environments');
};

export const writeFile = async (path: string, data: string): Promise<void> => {
  console.warn(`Browser environment: writeFile called for ${path} (data not saved)`);
  throw new Error('File system operations are not available in browser environments');
};

export const readdir = async (path: string): Promise<string[]> => {
  console.warn(`Browser environment: readdir called for ${path}`);
  throw new Error('File system operations are not available in browser environments');
};

export const stat = async (path: string): Promise<{ isDirectory: () => boolean }> => {
  console.warn(`Browser environment: stat called for ${path}`);
  throw new Error('File system operations are not available in browser environments');
};

export const mkdir = async (path: string, options?: { recursive?: boolean }): Promise<string | undefined> => {
  console.warn(`Browser environment: mkdir called for ${path}`);
  throw new Error('File system operations are not available in browser environments');
};

export const open = async (path: string, flags: string): Promise<FileHandle> => {
  console.warn(`Browser environment: open called for ${path} with flags ${flags}`);
  throw new Error('File system operations are not available in browser environments');
};

export default {
  readFile,
  writeFile,
  readdir,
  stat,
  mkdir,
  open
}; 