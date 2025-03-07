'use client';

import { useState, useEffect } from 'react';
import { UploadDropzone } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { toast } from 'react-hot-toast';
import { 
  ArrowUpTrayIcon, 
  DocumentIcon 
} from "@heroicons/react/24/outline";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export interface UploadedAsset {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  type: string;
  format: string;
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
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  return (
    <div className="w-full">
      {/* @ts-ignore - We're customizing the component with content prop which TypeScript doesn't fully recognize */}
      <UploadDropzone
        endpoint="campaignAssetUploader"
        onBeforeUploadBegin={(files: File[]) => {
          setIsUploading(true);
          setSelectedFiles([]);
          return files;
        }}
        onFileSelect={(files: FileList) => {
          // Track selected files before upload starts
          setSelectedFiles(Array.from(files));
        }}
        onUploadProgress={(progress: any) => {
          // @ts-ignore - We know the shape matches our state
          setUploadProgress(prev => ({ ...prev, ...progress }));
        }}
        onClientUploadComplete={(res: any) => {
          setIsUploading(false);
          setSelectedFiles([]);
          if (!res || res.length === 0) {
            toast.error("No files were uploaded successfully");
            return;
          }
          
          const assets = res.map((file: any) => ({
            id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url: file.ufsUrl || file.url,
            fileName: file.name || 'unnamed-file',
            fileSize: file.size || 0,
            type: file.type?.startsWith('image/') ? 'image' : 'video',
            format: file.type || '',
          }));
          
          onUploadComplete(assets);
          toast.success(`${assets.length} file(s) uploaded successfully`);
        }}
        onUploadError={(error: Error) => {
          setIsUploading(false);
          setUploadProgress({});
          setSelectedFiles([]);
          onUploadError(error);
          toast.error(`Upload error: ${error.message}`);
        }}
        className="w-full py-10 flex flex-col items-center justify-center transition-all duration-300 bg-white rounded-xl border border-gray-200 shadow-sm"
        // @ts-ignore - Using the content prop to customize UI
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
        // @ts-ignore - Add custom headers
        config={{
          mode: "auto",
          appendCustomHeaders: () => ({
            "x-campaign-id": campaignId
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