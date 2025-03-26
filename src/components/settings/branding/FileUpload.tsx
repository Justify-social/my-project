"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Icon, ButtonIcon, DeleteIcon } from '@/components/ui/icons';

interface FileUploadProps {
  /**
   * The current image URL to display (if any)
   */
  currentImageUrl?: string;
  
  /**
   * Function to call when a file is selected
   */
  onFileSelect: (file: File) => void;
  
  /**
   * Function to call when the current image is removed
   */
  onRemove?: () => void;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Accepted file types
   * @default "image/jpeg,image/png"
   */
  acceptedTypes?: string;
  
  /**
   * Maximum file size in bytes
   * @default 5242880 (5MB)
   */
  maxSize?: number;
  
  /**
   * Upload button label
   * @default "Upload Image"
   */
  uploadLabel?: string;
  
  /**
   * Remove button label
   * @default "Remove Image"
   */
  removeLabel?: string;
  
  /**
   * Placeholder icon when no image is selected
   * @default "image"
   */
  placeholderIcon?: string;
  
  /**
   * Maximum file size in MB
   * @default 5
   */
  maxSizeMB?: number;
  
  /**
   * Label for the file upload component
   */
  label?: string;
  
  /**
   * Description for the file upload component
   */
  description?: string;
  
  /**
   * Value for the file upload component
   */
  value?: string;
  
  /**
   * Name for the file upload component
   */
  name?: string;
  
  /**
   * Class name for the file upload component
   */
  className?: string;
}

/**
 * FileUpload component for settings forms
 * Handles file selection with preview, validation, and error display
 */
const FileUpload: React.FC<FileUploadProps> = ({
  currentImageUrl,
  onFileSelect,
  onRemove,
  error,
  acceptedTypes = "image/jpeg,image/png",
  maxSize = 5 * 1024 * 1024, // 5MB
  uploadLabel = "Upload Image",
  removeLabel = "Remove Image",
  placeholderIcon = "image",
  maxSizeMB = 5,
  label,
  description,
  value,
  name,
  className = ''
}) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [fileError, setFileError] = useState<string>(error || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    
    if (!file) return;
    
    // Validate file type
    if (acceptedTypes && !acceptedTypes.split(',').includes(file.type)) {
      setFileError(`File type not supported. Please upload ${acceptedTypes.replace('image/', '')}`);
      return;
    }
    
    // Validate file size
    if (maxSize && file.size > maxSize) {
      setFileError(`File too large. Maximum size is ${Math.floor(maxSize / 1024 / 1024)}MB`);
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Call the callback
    onFileSelect(file);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Handle remove
  const handleRemove = () => {
    setPreview(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-[#4A5568]">
          {label}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-[#4A5568]">{description}</p>
      )}
      
      <div className="flex items-center space-x-6 mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {preview ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon name={placeholderIcon} size="3xl" className="text-gray-400" />
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={acceptedTypes}
            className="hidden"
          />
          
          {/* Button group */}
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={triggerFileInput}
              className="px-4 py-2 bg-[#00BFFF] text-white rounded hover:bg-opacity-90 flex items-center"
            >
              <ButtonIcon name="upload" size="sm" className="mr-2" />
              {preview ? 'Replace File' : 'Choose File'}
            </motion.button>
            
            {preview && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center"
              >
                <DeleteIcon name="xmark" size="sm" className="mr-2" />
                Remove
              </motion.button>
            )}
          </div>
          
          {/* Error message */}
          {fileError && (
            <p className="text-red-500 text-sm mt-1">{fileError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload; 