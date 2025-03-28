/**
 * Image compression utilities for optimizing uploads
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compresses an image file to reduce upload size
 * 
 * @param file The image file to compress
 * @param options Compression options (width, height, quality)
 * @returns A new File object with the compressed image
 */
export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  // Set default options
  const maxWidth = options.maxWidth || 1920;
  const maxHeight = options.maxHeight || 1080;
  const quality = options.quality || 0.8;
  
  // Skip non-image files
  if (!file.type.startsWith('image/')) {
    return file;
  }
  
  // Skip small images (less than 500KB)
  if (file.size < 500 * 1024) {
    return file;
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions while preserving aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Unable to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          
          // Create new file with original name but compressed content
          const compressedFile = new File(
            [blob], 
            file.name, 
            { 
              type: file.type,
              lastModified: file.lastModified 
            }
          );
          
          console.log(
            `Compressed ${file.name}: ${(file.size / 1024).toFixed(1)}KB -> ${(compressedFile.size / 1024).toFixed(1)}KB (${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% reduction)`
          );
          
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
} 