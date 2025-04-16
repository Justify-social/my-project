/**
 * @component FileUploader
 * @category organism
 * @description Comprehensive, reusable file uploader component integrated with RHF and UploadThing.
 * Uses Shadcn UI components and provides progress/status feedback.
 * @status 10th April
 */

'use client';

import React, { useState, useCallback, useRef, CSSProperties } from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { useDropzone, Accept, FileRejection } from 'react-dropzone';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core'; // Adjust path as needed
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

// Type definition for the result from UploadThing's onClientUploadComplete
// CRITICAL: Ensure this matches the actual structure returned by your `onUploadComplete` in `core.ts`
export interface UploadThingResult {
  key: string;
  name: string;
  size: number;
  url: string;
  type: string;
  // Add any custom metadata you might return
  // customId?: string;
}

// Generate type-safe UT helpers
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

// Define props for the FileUploader component
interface FileUploaderProps<TFieldValues extends FieldValues = FieldValues> {
  /** React Hook Form name prop (validation is typically managed by the parent form schema based on the data added by onUploadComplete) */
  name: FieldPath<TFieldValues>;
  /** React Hook Form control prop */
  control: Control<TFieldValues>;
  /** UploadThing endpoint from your OurFileRouter */
  endpoint: keyof OurFileRouter;
  /** Optional label for the form item */
  label?: string;
  /** Optional description text */
  description?: string;
  /** Callback triggered after successful upload(s) */
  onUploadComplete?: (results: UploadThingResult[]) => void;
  /** Callback triggered on upload error */
  onUploadError?: (error: Error) => void;
  /** Maximum number of files allowed (default: 1) */
  maxFiles?: number;
  /** Maximum file size in MB (default: 4MB from UploadThing typical default) */
  maxSizeMB?: number;
  /** Custom accepted file types (passed to react-dropzone). Example: `{ 'image/*': [], 'video/mp4': ['.mp4'] }` */
  accept?: Accept;
  /** Text to display regarding file size limits */
  sizeLimitText?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Style for the dropzone container */
  style?: CSSProperties;
}

export function FileUploader<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  endpoint,
  label,
  description,
  onUploadComplete,
  onUploadError,
  maxFiles = 1,
  maxSizeMB = 4,
  accept,
  sizeLimitText = `up to ${maxSizeMB}MB each`,
  className,
  style,
}: FileUploaderProps<TFieldValues>) {
  const [localFiles, setLocalFiles] = useState<File[]>([]); // Files selected but not yet uploaded
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorState, setErrorState] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configure UploadThing hook - use its isUploading state
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: res => {
      setUploadProgress(100);
      setLocalFiles([]); // Clear local preview files
      console.log('Upload Complete:', res);
      toast.success(`${res?.length ?? 0} file(s) uploaded successfully!`);
      if (onUploadComplete && res) {
        // Ensure the result matches the expected interface
        onUploadComplete(res as UploadThingResult[]);
      }
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    },
    onUploadError: (error: Error) => {
      setUploadProgress(0);
      setErrorState(error.message || 'Upload failed.');
      toast.error(`Upload failed: ${error.message}`);
      console.error('UploadThing Error:', error);
      if (onUploadError) {
        onUploadError(error);
      }
    },
    onUploadProgress: progress => {
      setUploadProgress(progress);
    },
  });

  // Determine accepted file types for react-dropzone
  const acceptedFileTypes = accept; // Rely on explicitly passed prop

  // Configure react-dropzone
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (isUploading) return; // Don't allow changes during upload
      setErrorState(null);

      // Handle rejected files
      if (fileRejections.length > 0) {
        console.warn('Rejected files:', fileRejections);
        const firstError = fileRejections[0].errors[0];
        let message = firstError.message;
        if (firstError.code === 'file-too-large') message = `File is larger than ${maxSizeMB}MB`;
        else if (firstError.code === 'file-invalid-type') message = 'Invalid file type';
        else if (firstError.code === 'too-many-files')
          message = `Cannot select more than ${maxFiles} file(s)`;

        setErrorState(message);
        toast.error(`File rejected: ${message}`);
        setLocalFiles([]); // Clear selection on rejection
        return;
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        // Prevent duplicates if dropping/selecting multiple times
        const uniqueNewFiles = acceptedFiles.filter(
          newFile =>
            !localFiles.some(
              existingFile =>
                existingFile.name === newFile.name &&
                existingFile.size === newFile.size &&
                existingFile.lastModified === newFile.lastModified
            )
        );
        // Combine, enforce maxFiles limit, and update local state
        const combined = [...localFiles, ...uniqueNewFiles].slice(0, maxFiles);
        setLocalFiles(combined);
      }
    },
    [localFiles, isUploading, maxFiles, maxSizeMB]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: _open,
  } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: maxSizeMB * 1024 * 1024,
    maxFiles: maxFiles,
    multiple: maxFiles > 1,
    disabled: isUploading,
  });

  // Function to trigger UploadThing upload
  const handleUpload = useCallback(async () => {
    if (!localFiles.length || isUploading) return;
    setErrorState(null);
    await startUpload(localFiles); // UploadThing manages isUploading state
  }, [localFiles, isUploading, startUpload]);

  // Function to remove a locally selected file before upload
  const removeFile = (index: number) => {
    setLocalFiles(prev => prev.filter((_, i) => i !== index));
    setErrorState(null);
  };

  return (
    <Controller
      name={name} // Used by RHF to track validation state via parent schema
      control={control}
      render={({ fieldState }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div
              {...getRootProps()}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/20',
                isUploading ? 'cursor-default opacity-70' : '',
                errorState ? 'border-destructive bg-destructive/5' : '',
                fieldState.error ? 'border-destructive' : '' // Highlight based on RHF validation error
              )}
              style={style}
              aria-invalid={!!fieldState.error || !!errorState}
              aria-describedby={errorState ? `${name}-dropzone-error` : undefined}
            >
              <input {...getInputProps()} ref={fileInputRef} style={{ display: 'none' }} />

              {/* Content based on state */}
              {isUploading ? (
                <div className="text-center">
                  <Icon
                    iconId="faCircleNotchLight"
                    className="h-8 w-8 text-primary animate-spin mb-3"
                  />
                  <p className="text-sm font-medium text-primary">Uploading...</p>
                  <Progress
                    value={uploadProgress}
                    className="w-full h-1.5 mt-2"
                    aria-label={`Upload progress ${uploadProgress}%`}
                  />
                </div>
              ) : isDragActive ? (
                <div className="text-center">
                  <Icon iconId="faDownloadLight" className="h-8 w-8 text-primary mb-3" />
                  <p className="text-sm font-medium">Drop files here...</p>
                </div>
              ) : localFiles.length > 0 ? (
                <div className="text-center">
                  <Icon iconId="faCircleCheckSolid" className="h-8 w-8 text-green-600 mb-3" />
                  <p className="text-sm font-medium">{localFiles.length} file(s) selected</p>
                  <p className="text-xs text-muted-foreground mt-1">Ready to upload</p>
                </div>
              ) : errorState ? (
                <div className="text-center">
                  <Icon
                    iconId="faCircleExclamationLight"
                    className="h-8 w-8 text-destructive mb-3"
                  />
                  <p id={`${name}-dropzone-error`} className="text-sm font-medium text-destructive">
                    {errorState}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Please select valid file(s).</p>
                </div>
              ) : (
                <div className="text-center">
                  <Icon iconId="faUploadLight" className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    Click to select files or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {maxFiles > 1 ? `Max ${maxFiles} files, ` : ''}
                    {sizeLimitText}
                  </p>
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {/* Display RHF validation error from the parent form schema */}
          {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}

          {/* Preview selected files and allow removal/upload trigger */}
          {localFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Selected files:</p>
              {localFiles.map((file, index) => (
                <div
                  key={`${file.name}-${file.lastModified}`}
                  className="flex items-center justify-between p-2 border rounded-md text-sm bg-muted/30"
                >
                  <span className="truncate flex-1 mr-2" title={file.name}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  {!isUploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={e => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      aria-label={`Remove ${file.name}`}
                    >
                      <Icon iconId="faXmarkLight" className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              {/* Upload Button - appears only when files are selected and not uploading */}
              {!isUploading && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUpload}
                  disabled={isUploading || !localFiles.length}
                  className="mt-2 w-full sm:w-auto"
                >
                  <Icon iconId="faUploadLight" className="h-4 w-4 mr-2" /> Upload{' '}
                  {localFiles.length} File(s)
                </Button>
              )}
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
