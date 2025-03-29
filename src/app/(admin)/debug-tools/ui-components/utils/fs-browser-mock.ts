/**
 * Browser-compatible mock for fs/promises
 * This provides stub implementations that return mock data in browser environments
 */

export type FileHandle = {
  close: () => Promise<void>;
};

export const readFile = async (path: string): Promise<string> => {
  console.warn(`Browser mock: readFile called for ${path}`);
  return JSON.stringify({ mock: 'This is browser mock data' });
};

export const writeFile = async (path: string, data: string): Promise<void> => {
  console.warn(`Browser mock: writeFile called for ${path} (data not saved)`);
  return;
};

export const readdir = async (path: string): Promise<string[]> => {
  console.warn(`Browser mock: readdir called for ${path}`);
  return ['mock-file-1.ts', 'mock-file-2.ts', 'mock-directory'];
};

export const stat = async (path: string): Promise<{ isDirectory: () => boolean }> => {
  console.warn(`Browser mock: stat called for ${path}`);
  return {
    isDirectory: () => path.includes('directory')
  };
};

export const mkdir = async (path: string, options?: { recursive?: boolean }): Promise<string | undefined> => {
  console.warn(`Browser mock: mkdir called for ${path}`);
  return path;
};

export const open = async (path: string, flags: string): Promise<FileHandle> => {
  console.warn(`Browser mock: open called for ${path} with flags ${flags}`);
  return {
    close: async () => {
      console.warn(`Browser mock: close called for ${path}`);
    }
  };
};

export default {
  readFile,
  writeFile,
  readdir,
  stat,
  mkdir,
  open
}; 