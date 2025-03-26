'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/settings/shared/Card';
import SectionHeader from '@/components/settings/shared/SectionHeader';
import ActionButtons from '@/components/settings/shared/ActionButtons';
import { Icon, ButtonIcon, DeleteIcon, SuccessIcon, WarningIcon } from '@/components/ui/icons';

interface ProfilePictureSectionProps {
  currentImageUrl: string | null;
  onSave: (file: File | null, shouldRemove: boolean) => Promise<void>;
}

const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  currentImageUrl,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemovePhoto(false);
      setError(null);
    }
  };

  const handleRemoveClick = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemovePhoto(true);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl);
    setRemovePhoto(false);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      await onSave(selectedFile, removePhoto);
      
      setIsEditing(false);
      setSuccess('Profile picture updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile picture:', err);
      setError('Failed to update profile picture. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    return selectedFile !== null || removePhoto;
  };

  return (
    <Card>
      <SectionHeader 
        title="Profile Picture" 
        description="Upload or update your profile picture. Recommended size: 400x400px."
        iconName="circleUser"
      />
      
      <div className="mt-4">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
            <WarningIcon name="circleExclamation" size="md" className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
            <SuccessIcon name="circleCheck" size="md" className="mr-2" />
            <span>{success}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Profile picture preview */}
          <div className="relative">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-2 border-[#D1D5DB]"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-[#D1D5DB]">
                <Icon name="user" size="3xl" className="text-[#4A5568]" />
              </div>
            )}
            
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <button
                  type="button"
                  onClick={handleRemoveClick}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  disabled={isSaving}
                >
                  <DeleteIcon name="trashCan" size="sm" />
                </button>
              </div>
            )}
          </div>
          
          {/* Upload options */}
          <div className="flex flex-col gap-3">
            {isEditing ? (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                  disabled={isSaving}
                />
                <label className="px-3 py-2 bg-white text-[#00BFFF] border border-[#00BFFF] rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center cursor-pointer">
                  <ButtonIcon name="upload" size="sm" />
                  Upload Photo
                </label>
                <div className="text-sm text-[#4A5568]">
                  <p>Maximum file size: 5MB</p>
                  <p>Supported formats: JPEG, PNG, GIF</p>
                </div>
              </>
            ) : (
              <div className="text-sm text-[#4A5568]">
                {currentImageUrl ? 
                  <p>Your profile picture is visible to other team members.</p> : 
                  <p>Upload a profile picture to personalize your account.</p>
                }
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-6">
          <ActionButtons
            isEditing={isEditing}
            isSaving={isSaving}
            hasChanges={hasChanges()}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </div>
      </div>
    </Card>
  );
};

export default ProfilePictureSection; 