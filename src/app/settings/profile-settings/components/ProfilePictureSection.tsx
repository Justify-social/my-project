"use client";

import React, { useState } from 'react';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import FileUpload from '../../components/FileUpload';

interface ProfilePictureSectionProps {
  /**
   * Current profile picture URL
   */
  currentImageUrl?: string;
  
  /**
   * Function to call when a new image is selected
   */
  onFileSelect: (file: File) => void;
  
  /**
   * Function to call when the image is removed
   */
  onRemove: () => void;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Whether the component is in a loading state
   */
  loading?: boolean;
}

/**
 * ProfilePictureSection component for the Profile Settings page
 * Handles profile picture upload, preview, and removal
 */
const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  currentImageUrl,
  onFileSelect,
  onRemove,
  error,
  loading = false
}) => {
  // State for file errors
  const [fileError, setFileError] = useState<string>(error || '');
  
  // Handle file selection with validation
  const handleFileSelect = (file: File) => {
    setFileError('');
    
    // Call the parent handler
    onFileSelect(file);
  };
  
  return (
    <Card>
      <SectionHeader 
        title="Profile Picture" 
        description="Upload or update your profile picture."
        iconName="fa-light fa-image"
      />
      
      <div className="space-y-4">
        {/* Display error if there is one */}
        {fileError && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
            {fileError}
          </div>
        )}
        
        {/* File upload component */}
        <FileUpload
          currentImageUrl={currentImageUrl}
          onFileSelect={handleFileSelect}
          onRemove={onRemove}
          error={fileError}
          acceptedTypes="image/jpeg,image/png,image/gif"
          maxSize={2 * 1024 * 1024} // 2MB
          uploadLabel="Upload Profile Picture"
          removeLabel="Remove Profile Picture"
          placeholderIcon="fa-light fa-user-circle"
        />
        
        {/* Guidelines */}
        <div className="text-sm text-[#4A5568] bg-gray-50 p-3 rounded-md">
          <h4 className="font-medium mb-1">Image Guidelines:</h4>
          <ul className="list-disc list-inside">
            <li>Maximum file size: 2MB</li>
            <li>Accepted formats: JPEG, PNG, GIF</li>
            <li>Square format recommended (will be cropped to circle)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default ProfilePictureSection; 