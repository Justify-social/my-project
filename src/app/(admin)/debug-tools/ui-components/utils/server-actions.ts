'use server';

type EncodingType = 'utf8' | 'utf-8' | 'ascii' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex';

/**
 * Server action to read file contents
 */
export async function serverReadFile(path: string, encoding?: EncodingType): Promise<{ success: boolean; data?: string | Uint8Array; error?: string }> {
  try {
    // Using dynamic import to prevent node:fs from being bundled
    const fs = await import('fs/promises');
    
    // Handle encoding properly
    if (encoding) {
      const data = await fs.readFile(path, { encoding });
      return { success: true, data: data };
    } else {
      const data = await fs.readFile(path);
      return { success: true, data: data };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Server action to check if file exists
 */
export async function serverFileExists(path: string): Promise<{ exists: boolean }> {
  try {
    // Using dynamic import to prevent node:fs from being bundled
    const { access } = await import('fs/promises');
    await access(path);
    return { exists: true };
  } catch {
    return { exists: false };
  }
}

/**
 * Server action to get file stats
 */
export async function serverStatFile(path: string): Promise<{ 
  success: boolean; 
  stats?: { 
    isFile: boolean; 
    isDirectory: boolean; 
    size: number; 
    mtime: string;
  }; 
  error?: string 
}> {
  try {
    // Using dynamic import to prevent node:fs from being bundled
    const { stat } = await import('fs/promises');
    const stats = await stat(path);
    
    return { 
      success: true, 
      stats: {
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime.toISOString(),
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Server action to read directory contents
 */
export async function serverReadDir(path: string, withFileTypes?: boolean): Promise<{ 
  success: boolean; 
  files?: Array<string | { name: string; isFile: boolean; isDirectory: boolean }>; 
  error?: string 
}> {
  try {
    // Using dynamic import to prevent node:fs from being bundled
    const { readdir } = await import('fs/promises');
    
    if (withFileTypes) {
      const entries = await readdir(path, { withFileTypes: true });
      const files = entries.map(entry => ({
        name: entry.name,
        isFile: entry.isFile(),
        isDirectory: entry.isDirectory()
      }));
      return { success: true, files };
    } else {
      const files = await readdir(path);
      return { success: true, files };
    }
  } catch (error) {
    return {
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Server action to write file
 */
export async function serverWriteFile(path: string, data: string, encoding?: EncodingType): Promise<{ success: boolean; error?: string }> {
  try {
    // Using dynamic import to prevent node:fs from being bundled
    const { writeFile } = await import('fs/promises');
    
    // Handle encoding properly
    if (encoding) {
      await writeFile(path, data, { encoding });
    } else {
      await writeFile(path, data);
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 