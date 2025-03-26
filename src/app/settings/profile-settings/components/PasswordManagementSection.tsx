"use client";

import React, { useState } from 'react';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import InputField from '../../components/InputField';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordRequirements {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface PasswordManagementSectionProps {
  onSubmit: (data: PasswordData) => Promise<void>;
  loading?: boolean;
  error?: string;
  success?: string;
}

/**
 * PasswordManagementSection component for Profile Settings
 * Handles password change form with validation
 */
const PasswordManagementSection: React.FC<PasswordManagementSectionProps> = ({
  onSubmit,
  loading = false,
  error,
  success
}) => {
  // Form state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Validation state
  const [requirements, setRequirements] = useState<PasswordRequirements>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PasswordData, string>>>({});
  
  // Handle input change
  const handleChange = (field: keyof PasswordData, value: string) => {
    // Update form data
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Check password requirements for new password
    if (field === 'newPassword') {
      setRequirements({
        hasMinLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });
    }
    
    // Validate password confirmation
    if (field === 'confirmPassword' || (field === 'newPassword' && passwordData.confirmPassword)) {
      const newPasswordValue = field === 'newPassword' ? value : passwordData.newPassword;
      const confirmPasswordValue = field === 'confirmPassword' ? value : passwordData.confirmPassword;
      
      if (confirmPasswordValue && newPasswordValue !== confirmPasswordValue) {
        setFormErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (confirmPasswordValue) {
        setFormErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Partial<Record<keyof PasswordData, string>> = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      // Check password requirements
      if (!requirements.hasMinLength || !requirements.hasUpperCase || 
          !requirements.hasLowerCase || !requirements.hasNumber) {
        errors.newPassword = 'Password doesn\'t meet all requirements';
      }
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Update errors and submit if valid
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
    } else {
      try {
        await onSubmit(passwordData);
        // Reset form on success
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setRequirements({
          hasMinLength: false,
          hasUpperCase: false,
          hasLowerCase: false,
          hasNumber: false,
          hasSpecialChar: false
        });
      } catch (err) {
        // Error handling is done through the error prop
      }
    }
  };
  
  return (
    <Card>
      <SectionHeader 
        title="Password Management" 
        description="Update your password and security settings."
        iconName="fa-light fa-lock"
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Show error message if provided */}
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        {/* Show success message if provided */}
        {success && (
          <div className="text-green-500 text-sm p-3 bg-green-50 rounded-md">
            {success}
          </div>
        )}
        
        {/* Current Password */}
        <InputField
          id="current-password"
          label="Current Password"
          icon="fa-light fa-lock"
          type="password"
          value={passwordData.currentPassword}
          onChange={(e) => handleChange('currentPassword', e.target.value)}
          disabled={loading}
          error={formErrors.currentPassword}
          required
        />
        
        {/* New Password */}
        <InputField
          id="new-password"
          label="New Password"
          icon="fa-light fa-lock"
          type="password"
          value={passwordData.newPassword}
          onChange={(e) => handleChange('newPassword', e.target.value)}
          disabled={loading}
          error={formErrors.newPassword}
          required
        />
        
        {/* Password Requirements */}
        <div className="text-sm px-4 py-3 bg-gray-50 rounded-md">
          <div className="font-medium mb-2">Password must include:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className={`flex items-center ${requirements.hasMinLength ? 'text-green-500' : 'text-gray-500'}`}>
              <i className={`${requirements.hasMinLength ? 'fa-solid fa-check-circle' : 'fa-light fa-circle'} mr-2`}></i>
              At least 8 characters
            </div>
            <div className={`flex items-center ${requirements.hasUpperCase ? 'text-green-500' : 'text-gray-500'}`}>
              <i className={`${requirements.hasUpperCase ? 'fa-solid fa-check-circle' : 'fa-light fa-circle'} mr-2`}></i>
              Uppercase letter (A-Z)
            </div>
            <div className={`flex items-center ${requirements.hasLowerCase ? 'text-green-500' : 'text-gray-500'}`}>
              <i className={`${requirements.hasLowerCase ? 'fa-solid fa-check-circle' : 'fa-light fa-circle'} mr-2`}></i>
              Lowercase letter (a-z)
            </div>
            <div className={`flex items-center ${requirements.hasNumber ? 'text-green-500' : 'text-gray-500'}`}>
              <i className={`${requirements.hasNumber ? 'fa-solid fa-check-circle' : 'fa-light fa-circle'} mr-2`}></i>
              Number (0-9)
            </div>
            <div className={`flex items-center ${requirements.hasSpecialChar ? 'text-green-500' : 'text-gray-500'}`}>
              <i className={`${requirements.hasSpecialChar ? 'fa-solid fa-check-circle' : 'fa-light fa-circle'} mr-2`}></i>
              Special character (!@#$%^&*)
            </div>
          </div>
        </div>
        
        {/* Confirm Password */}
        <InputField
          id="confirm-password"
          label="Confirm New Password"
          icon="fa-light fa-lock"
          type="password"
          value={passwordData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          disabled={loading}
          error={formErrors.confirmPassword}
          required
        />
        
        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium flex items-center ${
              loading 
                ? 'bg-blue-300 cursor-not-allowed text-white' 
                : 'bg-[#00BFFF] hover:bg-opacity-90 text-white'
            }`}
          >
            {loading ? (
              <>
                <i className="fa-light fa-spinner-third w-5 h-5 mr-2 animate-spin"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="fa-light fa-key w-5 h-5 mr-2"></i>
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </Card>
  );
};

export default PasswordManagementSection; 