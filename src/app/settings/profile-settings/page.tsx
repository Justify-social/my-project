'use client';

import React, { useState, useEffect } from 'react';
import PersonalInfoSection from '@/components/settings/profile/PersonalInfoSection';
import PasswordManagementSection from '@/components/settings/profile/PasswordManagementSection';
import NotificationPreferencesSection from '@/components/settings/profile/NotificationPreferencesSection';
import ProfilePictureSection from '@/components/settings/profile/ProfilePictureSection';
import ProfileSettingsSkeleton from '@/components/settings/profile/ProfileSettingsSkeleton';
import { motion } from 'framer-motion';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationPreferences {
  campaignUpdates: boolean;
  brandHealthAlerts: boolean;
  aiInsightNotifications: boolean;
}

export default function ProfileSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    campaignUpdates: false,
    brandHealthAlerts: false,
    aiInsightNotifications: false
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching user profile data
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        // In a real application, this would be an API call
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockProfile: UserProfile = {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          jobTitle: 'Product Manager',
          department: 'Product',
          location: 'New York, NY'
        };

        const mockNotificationPrefs: NotificationPreferences = {
          campaignUpdates: true,
          brandHealthAlerts: false,
          aiInsightNotifications: true
        };
        
        // Mock profile picture URL (set to null for users without a profile picture)
        const mockProfilePictureUrl = 'https://i.pravatar.cc/300';
        
        setUserProfile(mockProfile);
        setNotificationPrefs(mockNotificationPrefs);
        setProfilePictureUrl(mockProfilePictureUrl);
        setDataLoaded(true);
        console.log('Profile data loaded:', { mockProfile, mockNotificationPrefs, mockProfilePictureUrl });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Show success message temporarily
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleUpdateProfile = async (data: UserProfile) => {
    try {
      // In a real application, this would be an API call
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setUserProfile(data);
      setSuccessMessage('Profile updated successfully');
      
      return { success: true };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const handleUpdatePassword = async (data: PasswordChangeData) => {
    try {
      // In a real application, this would be an API call
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll just resolve the promise
      // In a real application, you would validate the current password
      // and update to the new password if valid
      setSuccessMessage('Password updated successfully');
      
      return { success: true };
    } catch (err) {
      console.error('Error updating password:', err);
      return { success: false, error: 'Failed to update password' };
    }
  };

  const handleUpdateNotifications = async (data: NotificationPreferences) => {
    try {
      // In a real application, this would be an API call
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      setNotificationPrefs(data);
      setSuccessMessage('Notification preferences updated successfully');
      
      return { success: true };
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      return { success: false, error: 'Failed to update notification preferences' };
    }
  };

  const handleUpdateProfilePicture = async (file: File | null, shouldRemove: boolean) => {
    try {
      // In a real application, this would be an API call with FormData
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (shouldRemove) {
        // If removing the profile picture
        setProfilePictureUrl(null);
        setSuccessMessage('Profile picture removed successfully');
      } else if (file) {
        // If uploading a new picture, create a temporary URL
        const tempUrl = URL.createObjectURL(file);
        setProfilePictureUrl(tempUrl);
        setSuccessMessage('Profile picture updated successfully');
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating profile picture:', err);
      return { success: false, error: 'Failed to update profile picture' };
    }
  };

  // Show loading state
  if (isLoading) {
    return <ProfileSettingsSkeleton />;
  }

  // Show error state
  if (error || !userProfile) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <div className="text-red-500 mb-4">
          <i className="fa-light fa-circle-exclamation text-4xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {error || 'Unable to load profile'}
        </h2>
        <p className="text-gray-600 mb-4">
          Please try refreshing the page or contact support if the problem persists.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#00BFFF] text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Refresh Page
        </button>
      </motion.div>
    );
  }

  // Before returning the actual component, let's return a test component to verify rendering
  console.log("RENDER DEBUG - Profile Settings Page:", { 
    // Include key state variables for debugging
  });

  // Test component for debugging - temporary
  return (
    <div className="p-8 bg-blue-500 border-4 border-black" style={{ minHeight: "200px", zIndex: 9999, position: "relative" }}>
      <h1 className="text-3xl font-bold text-white">TEST RENDER - PROFILE SETTINGS PAGE</h1>
      <p className="text-white">This is a test component to verify rendering is working properly.</p>
      <button 
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => console.log("Profile Settings Debug button clicked")}
      >
        Debug Log
      </button>
    </div>
  );
} 