/**
 * @component VideoFileUploader
 * @description Component for uploading video files directly to Mux, integrated with RHF.
 */
'use client';

import React, { useState, useCallback, useRef, CSSProperties } from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { useDropzone, Accept, FileRejection } from 'react-dropzone';
import * as UpChunk from '@mux/upchunk';
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
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';

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
        showErrorToast(`File rejected: ${message}`, 'faTriangleExclamationLight');
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
          corsOrigin: window.location.origin, // Pass the current origin for CORS
          description: `Video upload: ${localFile.name}`,
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

      logger.info('Starting UpChunk upload:', {
        fileName: localFile.name,
        fileSize: localFile.size,
        muxUploadId,
        uploadUrl: uploadUrl.substring(0, 50) + '...', // Log partial URL for debugging
      });

      // Validate upload URL format
      if (!uploadUrl.startsWith('https://')) {
        throw new Error(`Invalid upload URL format: ${uploadUrl.substring(0, 50)}...`);
      }

      // 2. Upload the file to Mux using UpChunk
      const upload = UpChunk.createUpload({
        endpoint: uploadUrl,
        file: localFile,
        chunkSize: 5120, // 5MB chunks - good balance for most connections
        attempts: 3, // Retry failed chunks up to 3 times
        delayBeforeAttempt: 2, // Wait 2 seconds before retrying
      });

      upchunkRef.current = upload; // Store reference for potential abort

      // Track if upload actually starts
      let uploadStarted = false;
      const uploadTimeout = setTimeout(() => {
        if (!uploadStarted) {
          logger.error('UpChunk upload timeout: No events received after 10 seconds');
          setErrorState('Upload failed to start. Please check your connection and try again.');
          showErrorToast('Upload failed to start. Please try again.', 'faTriangleExclamationLight');
          setIsUploading(false);
        }
      }, 10000);

      upload.on('attempt', attempt => {
        uploadStarted = true;
        clearTimeout(uploadTimeout);
        logger.info('UpChunk chunk attempt:', attempt.detail);
      });

      upload.on('attemptFailure', failure => {
        uploadStarted = true;
        clearTimeout(uploadTimeout);
        logger.warn('UpChunk chunk attempt failed:', failure.detail);
      });

      upload.on('chunkSuccess', success => {
        uploadStarted = true;
        clearTimeout(uploadTimeout);
        logger.info('UpChunk chunk succeeded:', success.detail);
      });

      upload.on('progress', progress => {
        uploadStarted = true;
        clearTimeout(uploadTimeout);
        const progressPercent = Math.floor(progress.detail);
        setUploadProgress(progressPercent);
        logger.info(`UpChunk upload progress: ${progressPercent}%`);
      });

      upload.on('success', () => {
        clearTimeout(uploadTimeout);
        logger.info('UpChunk upload completed successfully');

        // Use branded success toast
        showSuccessToast(
          `"${localFile.name}" uploaded successfully! Mux is now processing it.`,
          'faCircleCheckLight',
          4000
        );

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

        // ✅ SIMPLE SOLUTION: Manual page refresh after upload
        // This ensures the user always sees the processed video without complex state management
        setTimeout(() => {
          showSuccessToast('Refreshing page to show your video...', 'faArrowsRotateLight', 2000);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }, 3000); // Wait 3 seconds to show success message first

        // Reset the local file state after successful upload
        setTimeout(() => {
          resetState();
        }, 1000);
      });

      upload.on('error', errorData => {
        clearTimeout(uploadTimeout);
        logger.error('UpChunk upload error:', errorData.detail);
        const errorMessage =
          errorData.detail?.message || errorData.detail || 'Unknown upload error';
        setErrorState(`Upload failed: ${errorMessage}`);

        // Use branded error toast
        showErrorToast(
          `Upload of "${localFile.name}" failed: ${errorMessage}`,
          'faTriangleExclamationLight'
        );

        setIsUploading(false);
        setUploadProgress(0);
        if (onUploadError) {
          onUploadError(new Error(`UpChunk upload failed: ${errorMessage}`));
        }
      });

      // Log that UpChunk object was created successfully
      logger.info('UpChunk upload object created successfully. Waiting for upload to begin...');
    } catch (error) {
      logger.error('Video upload initiation or process error:', error);
      const errorMessage = (error as Error).message || 'An unexpected error occurred.';
      setErrorState(errorMessage);

      // Use branded error toast
      showErrorToast(`Failed to start upload: ${errorMessage}`, 'faTriangleExclamationLight');

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
