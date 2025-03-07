/**
 * Utilities for extracting metadata from files
 */

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  aspectRatio?: number;
}

/**
 * Extract metadata from an image file
 * @param file The image file to extract metadata from
 * @returns Promise resolving to metadata object with dimensions
 */
export async function extractImageMetadata(file: File): Promise<FileMetadata> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }
    
    const img = new Image();
    
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = width / height;
      
      resolve({
        width,
        height,
        aspectRatio
      });
      
      // Clean up
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Extract metadata from a video file
 * @param file The video file to extract metadata from
 * @returns Promise resolving to metadata object with dimensions and duration
 */
export async function extractVideoMetadata(file: File): Promise<FileMetadata> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      reject(new Error('Not a video file'));
      return;
    }
    
    const video = document.createElement('video');
    
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const duration = video.duration;
      const aspectRatio = width / height;
      
      resolve({
        width,
        height,
        duration,
        aspectRatio
      });
      
      // Clean up
      URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Extract metadata from any supported file type
 * @param file The file to extract metadata from
 * @returns Promise resolving to metadata object
 */
export async function extractMetadata(file: File): Promise<FileMetadata> {
  if (file.type.startsWith('image/')) {
    return extractImageMetadata(file);
  } else if (file.type.startsWith('video/')) {
    return extractVideoMetadata(file);
  } else {
    // For other file types, return empty metadata
    return {};
  }
} 