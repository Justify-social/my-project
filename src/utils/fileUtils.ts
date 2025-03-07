// src/utils/fileUtils.ts
import toast from 'react-hot-toast';

/**
 * Enum defining asset types for the campaign
 */
export enum AssetType {
  IMAGE = 'image',
  VIDEO = 'video',
}

/**
 * Generates a unique correlation ID for tracking operations
 * @param prefix Optional prefix for the ID
 * @returns A unique string ID
 */
export function generateCorrelationId(prefix: string = 'op'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sanitizes a file name by removing invalid characters and ensuring maximum length
 * @param fileName The original file name
 * @returns Sanitized file name
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return 'unnamed-file';
  
  return fileName
    .replace(/[\/\\:*?"<>|]/g, '')  // Remove invalid characters
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .trim()                         // Remove leading/trailing whitespace
    .slice(0, 255);                 // Enforce maximum length
}

/**
 * Checks if a file name is valid
 * @param fileName The file name to validate
 * @returns boolean indicating if the file name is valid
 */
export function isValidFileName(fileName: string): boolean {
  if (!fileName) return false;
  
  return fileName.length > 0 && 
         fileName.length <= 255 &&
         !/^\./.test(fileName);     // Shouldn't start with a dot
}

/**
 * Safely determines the file type from a File object or string
 * @param file The file object or string
 * @param mimeType Optional mime type
 * @returns AssetType (IMAGE or VIDEO)
 */
export function detectFileType(file: File | string, mimeType?: string): AssetType {
  if (!file) return AssetType.IMAGE; // Safe fallback
  
  const type = typeof file === 'string' 
    ? mimeType 
    : (file as File).type;
    
  return type?.toLowerCase().includes('video') 
    ? AssetType.VIDEO 
    : AssetType.IMAGE;
}

/**
 * Logs an error with correlation ID and shows a toast to the user
 * @param error The error object
 * @param correlationId Optional correlation ID
 * @param message Optional custom message
 */
export function logAndShowError(error: unknown, correlationId?: string, message?: string): void {
  const errorId = correlationId || generateCorrelationId('error');
  const errorMessage = message || (error instanceof Error ? error.message : 'An unknown error occurred');
  
  console.error(`[${errorId}] ${errorMessage}`, error);
  toast.error(`Error: ${errorMessage}. Reference: ${errorId}`);
}