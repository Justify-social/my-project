'use client';

import { useState } from 'react';
import { UploadDropzone } from "@uploadthing/react";
import toast from 'react-hot-toast';
import { 
  ArrowUpTrayIcon, 
  DocumentIcon 
} from "@heroicons/react/24/outline";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  generateCorrelationId, 
  sanitizeFileName, 
  logAndShowError 
} from "@/utils/fileUtils";

export interface UploadedAsset {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  type: string;
  format: string;
  details?: {
    assetName: string;
    budget?: number;
    description?: string;
    influencerHandle?: string;
    platform?: string;
  };
}

interface CampaignAssetUploaderProps {
  campaignId: string;
  onUploadComplete: (assets: UploadedAsset[]) => void;
  onUploadError: (error: Error) => void;
}

export function CampaignAssetUploader({ 
  campaignId, 
  onUploadComplete, 
  onUploadError 
}: CampaignAssetUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Validate files before upload
  const validateFiles = (files: File[]): File[] => {
    const correlationId = generateCorrelationId('validate');
    console.log(`[${correlationId}] Validating ${files.length} files`);
    
    return files.filter(file => {
      // Check for null or undefined file
      if (!file) {
        logAndShowError(new Error("Invalid file object"), correlationId, "Invalid file detected");
        return false;
      }
      
      // Check for file name
      if (!file.name) {
        logAndShowError(new Error("File missing name"), correlationId, "File missing name");
        return false;
      }
      
      // Check for file type
      if (!file.type) {
        console.warn(`[${correlationId}] File missing type, using fallback detection: ${file.name}`);
        // Continue with the file, we'll use fallback type detection
      }
      
      return true;
    });
  };
  
  // Process uploaded file results safely
  const processUploadResults = (res: unknown[]): UploadedAsset[] => {
    if (!res || !Array.isArray(res) || res.length === 0) {
      return [];
    }
    
    const correlationId = generateCorrelationId('process');
    console.log(`[${correlationId}] Processing ${res.length} upload results`);
    
    return res.map(file => {
      try {
        // Type assertion for file object
        const fileObj = file as Record<string, unknown>;
        
        // Safely access properties with fallbacks
        const fileName = sanitizeFileName(fileObj.name as string || 'unnamed-file');
        const url = (fileObj.ufsUrl as string) || (fileObj.url as string) || '';
        const fileSize = typeof fileObj.size === 'number' ? fileObj.size : 0;
        
        // Safely determine file type
        let type: string;
        if (fileObj.type && typeof fileObj.type === 'string') {
          const typeParts = fileObj.type.split('/');
          type = typeParts.length > 0 && typeParts[0] ? 
            (typeParts[0] === 'image' ? 'image' : 'video') : 
            'image'; // Default to image if we can't determine
        } else {
          // Fallback to extension-based detection
          type = fileName.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i) ? 'video' : 'image';
        }
        
        return {
          id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url,
          fileName,
          fileSize,
          type,
          format: fileObj.type as string || '',
          details: {
            assetName: fileName,
            budget: 0,
            description: '',
            influencerHandle: '',
            platform: '',
          }
        };
      } catch (error) {
        const fileObj = file as Record<string, unknown>;
        logAndShowError(error, correlationId, `Failed to process file: ${fileObj?.name || 'unknown'}`);
        // Return a minimal valid asset to avoid breaking the UI
        return {
          id: `asset-error-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: (fileObj?.ufsUrl as string) || (fileObj?.url as string) || '',
          fileName: 'error-processing-file',
          fileSize: 0,
          type: 'image', // Safe default
          format: '',
        };
      }
    }).filter(asset => asset.url); // Only include assets with a URL
  };
  
  return (
    <div className="w-full">
      <UploadDropzone
        endpoint="campaignAssetUploader"
        onBeforeUploadBegin={(files: File[]) => {
          const correlationId = generateCorrelationId('upload');
          console.log(`[${correlationId}] Starting upload for ${files.length} files`);
          
          setIsUploading(true);
          const validFiles = validateFiles(files);
          
          if (validFiles.length === 0) {
            toast.error("No valid files to upload");
            setIsUploading(false);
            throw new Error("No valid files to upload");
          }
          
          // Process files - sanitize file names
          return validFiles.map(file => {
            try {
              const sanitizedName = sanitizeFileName(file.name);
              if (sanitizedName !== file.name) {
                console.log(`[${correlationId}] Sanitized file name: ${file.name} -> ${sanitizedName}`);
                return new File([file], sanitizedName, { type: file.type });
              }
              return file;
            } catch (error) {
              logAndShowError(error, correlationId, `Failed to sanitize file: ${file.name}`);
              return file; // Use original file as fallback
            }
          });
        }}
        onFileSelect={(files: FileList) => {
          // Track selected files before upload starts
          const fileArray = Array.from(files);
          const validFiles = validateFiles(fileArray);
          setSelectedFiles(validFiles);
        }}
        onUploadProgress={(progress: Record<string, number>) => {
          // Progress is tracked but not displayed in this component
          // Could be used for detailed progress if needed
        }}
        onClientUploadComplete={(res: unknown) => {
          const correlationId = generateCorrelationId('complete');
          console.log(`[${correlationId}] Upload completed`, res);
          
          setIsUploading(false);
          setSelectedFiles([]);
          
          try {
            if (!res || !Array.isArray(res) || res.length === 0) {
              toast.error("No files were uploaded successfully");
              return;
            }
            
            const assets = processUploadResults(res);
            if (assets.length === 0) {
              toast.error("Failed to process uploaded files");
              return;
            }
            
            onUploadComplete(assets);
            toast.success(`${assets.length} file(s) uploaded successfully`);
          } catch (error) {
            logAndShowError(error, correlationId, "Error processing upload results");
          }
        }}
        onUploadError={(error: Error) => {
          const correlationId = generateCorrelationId('error');
          console.error(`[${correlationId}] Upload error:`, error);
          
          setIsUploading(false);
          setSelectedFiles([]);
          
          // Handle specific UploadThing errors
          if (error.message && error.message.includes("Cannot read properties of undefined")) {
            const betterMessage = "Invalid file format or data. Please check your files and try again.";
            toast.error(betterMessage);
            onUploadError(new Error(betterMessage));
          } else {
            // Pass the original error
            onUploadError(error);
            toast.error(`Upload error: ${error.message}`);
          }
        }}
        className="w-full py-10 flex flex-col items-center justify-center transition-all duration-300 bg-white rounded-xl border border-gray-200 shadow-sm"
        content={{
          allowedContent: "Images and videos only",
          label: "Choose a file or drag and drop",
          uploadIcon: () => (
            <div className="mb-4 p-3 rounded-full bg-blue-50">
              <ArrowUpTrayIcon className="h-8 w-8 text-blue-500" />
            </div>
          ),
          button: ({ ready }: { ready: boolean }) => (
            // Only show the button when files are selected and it's ready
            selectedFiles.length > 0 && (
              <button
                className="mt-4 px-6 py-2 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                style={{
                  backgroundColor: 'var(--accent-color)', // Using the accent color from globals.css
                  fontFamily: "'Work Sans', sans-serif", // Using the app's font
                }}
                disabled={!ready}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#00A8E6'; // Slightly darker on hover
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 191, 255, 0.25)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-color)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              >
                Upload Files
              </button>
            )
          )
        }}
        config={{
          mode: "auto",
          appendCustomHeaders: () => ({
            "x-campaign-id": campaignId,
            "x-correlation-id": generateCorrelationId('upload')
          })
        }}
      />
      
      {/* Selected files display */}
      {!isUploading && selectedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-500 font-medium">{selectedFiles.length} file(s) selected</p>
          {selectedFiles.map((file, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <DocumentIcon className="h-6 w-6 text-gray-400 mr-3" />
                <span className="font-medium text-gray-700">{file.name}</span>
                <span className="ml-auto text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload indicator with app's loading spinner */}
      {isUploading && (
        <div className="mt-6 flex flex-col items-center">
          <LoadingSpinner className="w-10 h-10 text-blue-500" />
          <p className="mt-2 text-sm text-gray-600 font-medium">Uploading files...</p>
        </div>
      )}
    </div>
  );
}