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

/**
 * Enhanced file type detection that uses both MIME type and URL extension
 * for more accurate and reliable file type detection
 */
export function enhancedFileTypeDetection(url: string, mimeType?: string): { type: string; format: string } {
  // URL-based detection (most reliable for browser preview)
  const fileExtension = url.split('.').pop()?.toLowerCase() || '';
  
  // Comprehensive extension mappings
  const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']);
  const videoExtensions = new Set(['mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv', 'm4v']);
  
  // MIME type parsing with validation
  let detectedType = 'unknown';
  let format = fileExtension;
  
  // Parse MIME type if available
  if (mimeType && typeof mimeType === 'string') {
    const [baseType, subType] = mimeType.split('/');
    if (baseType === 'image' || baseType === 'video') {
      detectedType = baseType;
      format = subType || format;
    }
  }
  
  // Fallback to extension-based detection
  if (detectedType === 'unknown') {
    if (imageExtensions.has(fileExtension)) detectedType = 'image';
    else if (videoExtensions.has(fileExtension)) detectedType = 'video';
  }
  
  // Add validation logging
  console.log(`Type detection for ${url}: type=${detectedType}, format=${format}`);
  
  return { type: detectedType, format };
}

/**
 * Extract a valid asset URL from an UploadThing response object
 * Handles different field names and validates URL format
 */
export function extractAssetUrl(fileObj: Record<string, unknown>): string | null {
  // Accept multiple URL field names (future-proof)
  const urlFields = ['ufsUrl', 'url', 'fileUrl', 'downloadUrl'];
  
  for (const field of urlFields) {
    const value = fileObj[field];
    if (typeof value === 'string' && value.startsWith('http')) {
      return value;
    }
  }
  
  // Log unexpected response structure for debugging
  console.error('Unable to extract URL from response:', fileObj);
  return null;
}

/**
 * Get a safe URL for an asset that works in the browser
 * This handles various UploadThing URL formats and CORS issues
 */
export function getSafeAssetUrl(originalUrl: string): string {
  if (!originalUrl) return '';
  
  // Skip if already using our proxy
  if (originalUrl.startsWith('/api/asset-proxy')) {
    return originalUrl;
  }
  
  // Handle UploadThing URLs specially
  const isUploadThingUrl = originalUrl.includes('ufs.sh') || 
                          originalUrl.includes('uploadthing') || 
                          originalUrl.includes('utfs.io');
  
  if (isUploadThingUrl) {
    // Extract the file ID to include it as a separate parameter
    let fileId = '';
    if (originalUrl.includes('/f/')) {
      fileId = originalUrl.split('/f/')[1].split('?')[0];
    } else if (originalUrl.includes('/files/')) {
      fileId = originalUrl.split('/files/')[1].split('?')[0];
    }
    
    // If we have a file ID, include it in the proxy URL
    if (fileId) {
      return `/api/asset-proxy?url=${encodeURIComponent(originalUrl)}&fileId=${fileId}`;
    }
  }
  
  // For all other URLs, use the proxy without a file ID
  return `/api/asset-proxy?url=${encodeURIComponent(originalUrl)}`;
}

/**
 * Utility to check if a URL is for a media file that doesn't exist anymore
 * This helps identify broken assets that need updating
 */
export async function checkIfMediaExists(url: string): Promise<boolean> {
  if (!url) return false;
  
  // Extract the file ID from UploadThing URLs
  let fileId = '';
  if (url.includes('/f/')) {
    fileId = url.split('/f/')[1].split('?')[0];
  } else if (url.includes('/files/')) {
    fileId = url.split('/files/')[1].split('?')[0];
  }
  
  if (!fileId) return true; // Not an UploadThing URL or can't extract file ID
  
  try {
    // First try using the HEAD request via our proxy
    const proxyUrl = `/api/asset-proxy?url=${encodeURIComponent(url)}&fileId=${fileId}`;
    const response = await fetch(proxyUrl, { method: 'HEAD' });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking if media exists:', error);
    return false;
  }
}

/**
 * Get alternative file ID for a potentially missing asset
 * This queries the asset proxy's special endpoint to find alternatives
 */
export async function getAlternativeFileId(originalFileId: string): Promise<string | null> {
  if (!originalFileId) return null;
  
  try {
    // Create a dummy URL to check
    const dummyUrl = `https://utfs.io/f/${originalFileId}`;
    const proxyUrl = `/api/asset-proxy?url=${encodeURIComponent(dummyUrl)}&fileId=${originalFileId}`;
    
    // Make the request to check alternatives
    const response = await fetch(proxyUrl, { method: 'GET' });
    
    if (response.ok) {
      // If ok, the file exists as-is
      return originalFileId;
    }
    
    // If not ok, check if there's a possible replacement
    const data = await response.json();
    
    if (data.possibleReplacement) {
      console.log(`Found alternative file ID: ${data.possibleReplacement}`);
      return data.possibleReplacement;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting alternative file ID:', error);
    return null;
  }
}

/**
 * Helper to replace old file IDs with new ones in asset URLs
 */
export function replaceFileIdInUrl(url: string, oldId: string, newId: string): string {
  if (!url || !oldId || !newId) return url;
  
  // Replace in various URL formats
  return url
    .replace(`/f/${oldId}`, `/f/${newId}`)
    .replace(`/files/${oldId}`, `/files/${newId}`);
}