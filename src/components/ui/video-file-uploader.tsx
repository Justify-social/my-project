/**
 * @component VideoFileUploader
 * @description Component for uploading video files directly to Mux, integrated with RHF.
 */
'use client';

import React, { useState, useCallback, useRef, CSSProperties } from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { useDropzone, Accept, FileRejection } from 'react-dropzone';
import * as UpChunk from '@mux/upchunk';
import { toast } from 'react-hot-toast';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import {
  FormLabel,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger'; // Assuming you have a client-side logger utility

// Type for the data returned on successful Mux upload initiation and CreativeAsset creation
export interface MuxUploadInitData {
  uploadUrl: string;
  muxUploadId: string;
  muxAssetId?: string;
  internalAssetId: number;
  userId?: string; // Add userId returned from API
}

// Type for what this component's onUploadComplete will return
export interface VideoUploadResult {
  internalAssetId: number;
  muxAssetId?: string;
  fileName: string;
  fileType: string;
  userId?: string; // Pass userId along
}

interface VideoFileUploaderProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  onUploadComplete?: (result: VideoUploadResult) => void;
  onUploadError?: (error: Error) => void;
  maxSizeMB?: number;
  accept?: Accept; // e.g., { 'video/*': ['.mp4', '.mov'] }
  sizeLimitText?: string;
  className?: string;
  style?: CSSProperties;
  // Required context for API call
  campaignWizardId: string; // Changed from submissionId. This is the CampaignWizard UUID.
}

export function VideoFileUploader<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  onUploadComplete,
  onUploadError,
  maxSizeMB = 1024, // Default to a larger size for videos, e.g., 1GB
  accept = { 'video/*': [] },
  sizeLimitText,
  className,
  style,
  campaignWizardId, // Changed from submissionId
}: VideoFileUploaderProps<TFieldValues>) {
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upchunkRef = useRef<UpChunk.UpChunk | null>(null);

  const effectiveSizeLimitText = sizeLimitText || `up to ${maxSizeMB}MB`;

  const resetState = () => {
    setLocalFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setErrorState(null);
    if (upchunkRef.current) {
      // upchunkRef.current.abort(); // If abort is needed
      upchunkRef.current = null;
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (isUploading) return;
      resetState();

      if (fileRejections.length > 0) {
        const firstError = fileRejections[0].errors[0];
        let message = firstError.message;
        if (firstError.code === 'file-too-large') message = `File is larger than ${maxSizeMB}MB`;
        else if (firstError.code === 'file-invalid-type')
          message = 'Invalid file type. Please select a video.';
        else if (firstError.code === 'too-many-files')
          message = 'Please select only one video file.';

        setErrorState(message);
        toast.error(`File rejected: ${message}`);
        return;
      }

      if (acceptedFiles.length > 0) {
        setLocalFile(acceptedFiles[0]);
      }
    },
    [isUploading, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMB * 1024 * 1024,
    maxFiles: 1, // Mux direct uploads are typically one file at a time
    multiple: false,
    disabled: isUploading,
  });

  const handleUpload = async () => {
    if (!localFile || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrorState(null);

    try {
      // 1. Get the Mux direct upload URL from our backend
      const apiResponse = await fetch('/api/mux/create-video-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: localFile.name,
          fileType: localFile.type,
          campaignWizardId: campaignWizardId, // Pass campaignWizardId
          // submissionId: submissionId.toString(), // OLD
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(
          errorData.error || `Failed to prepare upload (status: ${apiResponse.status})`
        );
      }

      const { uploadUrl, internalAssetId, muxAssetId, muxUploadId, userId }: MuxUploadInitData =
        await apiResponse.json();

      if (!uploadUrl) {
        throw new Error('Failed to retrieve Mux upload URL.');
      }

      // 2. Upload the file to Mux using UpChunk
      const upload = UpChunk.createUpload({
        endpoint: uploadUrl,
        file: localFile,
        // chunkSize: 5120, // Optional: in KBs, default 5120 (5MB)
      });

      upchunkRef.current = upload; // Store reference for potential abort

      upload.on('progress', progress => {
        setUploadProgress(Math.floor(progress.detail));
      });

      upload.on('success', () => {
        toast.success(`"${localFile.name}" uploaded successfully! Mux is now processing it.`);
        setIsUploading(false);
        setUploadProgress(100); // Visually complete

        if (onUploadComplete) {
          onUploadComplete({
            internalAssetId,
            muxAssetId,
            fileName: localFile.name,
            fileType: localFile.type,
            userId, // Pass it through
          });
        }
        // Don't reset localFile here, so user sees what was uploaded until they change it.
        // Or reset after a delay: setTimeout(resetState, 2000);
      });

      upload.on('error', errorData => {
        logger.error('UpChunk upload error:', errorData.detail);
        setErrorState(`Upload failed: ${errorData.detail.message || 'Connection issue.'}`);
        toast.error(`Upload of "${localFile.name}" failed.`);
        setIsUploading(false);
        setUploadProgress(0);
        if (onUploadError) {
          onUploadError(new Error(errorData.detail.message || 'UpChunk upload failed'));
        }
      });
    } catch (error) {
      logger.error('Video upload initiation or process error:', error);
      setErrorState((error as Error).message || 'An unexpected error occurred.');
      toast.error((error as Error).message || 'Failed to start upload.');
      setIsUploading(false);
      if (onUploadError) {
        onUploadError(error as Error);
      }
    }
  };

  // UI Structure (simplified for brevity, can be enhanced like FileUploader)
  // This is a very basic RHF integration, actual field value update would be via onUploadComplete
  return (
    <Controller
      name={name}
      control={control}
      render={({ fieldState }) => (
        <FormItem className={cn('space-y-3', className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div
              {...getRootProps()}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                isDragActive
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50 hover:bg-muted/20',
                isUploading ? 'cursor-default opacity-70' : '',
                errorState ? 'border-destructive bg-destructive/5' : '',
                fieldState.error ? 'border-destructive' : ''
              )}
              style={style}
            >
              <input {...getInputProps()} ref={fileInputRef} style={{ display: 'none' }} />
              {isUploading ? (
                <>
                  <Icon
                    iconId="faCircleNotchLight"
                    className="h-8 w-8 text-accent animate-spin mb-3"
                  />
                  <p>Uploading: {uploadProgress}%</p>
                  <Progress value={uploadProgress} className="w-full h-1.5 mt-2" />
                </>
              ) : errorState ? (
                <>
                  <Icon
                    iconId="faCircleExclamationLight"
                    className="h-8 w-8 text-destructive mb-3"
                  />
                  <p className="text-sm text-destructive">{errorState}</p>
                </>
              ) : localFile ? (
                <>
                  <Icon iconId="faFileVideoLight" className="h-8 w-8 text-accent mb-3" />
                  <p>Selected: {localFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ({(localFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                </>
              ) : (
                <>
                  <Icon iconId="faUploadLight" className="h-8 w-8 text-secondary mb-3" />
                  <p>Click or drag video file</p>
                  <p className="text-xs text-muted-foreground">{effectiveSizeLimitText}</p>
                </>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}

          {localFile && !isUploading && (
            <div className="flex items-center space-x-2 mt-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-accent hover:bg-accent/90 text-primary-foreground"
              >
                <Icon iconId="faUploadLight" className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
              <Button type="button" variant="outline" onClick={resetState} disabled={isUploading}>
                <Icon iconId="faXmarkLight" className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
