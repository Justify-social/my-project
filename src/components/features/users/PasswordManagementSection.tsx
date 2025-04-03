// Updated import paths via tree-shake script - 2025-04-01T17:13:32.212Z
import React, { useState } from 'react';
import HTMLInputElement from '../../ui/radio/types/index';
import { motion } from 'framer-motion';
import Card from './shared/Card';
import SectionHeader from './shared/SectionHeader';
import InputField from './shared/InputField';
import ActionButtons from './shared/ActionButtons';
import { Icon } from '@/components/ui/atoms/icon'

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordManagementSectionProps {
  onSave: (data: PasswordChangeData) => Promise<void>;
}

const PasswordManagementSection: React.FC<PasswordManagementSectionProps> = ({ onSave }) => {
  const initialData: PasswordChangeData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  const [formData, setFormData] = useState<PasswordChangeData>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (field: keyof PasswordChangeData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccess(null);
    setError(null);
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
    setError(null);
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
  };

  const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters long
    // and contain at least one uppercase letter, one lowercase letter, one number, and one special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong', message: string } => {
    if (password.length === 0) {
      return { strength: 'weak', message: '' };
    }
    
    if (password.length < 8) {
      return { strength: 'weak', message: 'Weak - Password should be at least 8 characters' };
    }
    
    let score = 0;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score < 3) {
      return { strength: 'weak', message: 'Weak - Add more character types' };
    } else if (score < 5) {
      return { strength: 'medium', message: 'Medium - Add more character types or length' };
    } else {
      return { strength: 'strong', message: 'Strong password' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  
  const getStrengthColor = (strength: 'weak' | 'medium' | 'strong'): string => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const handleSave = async () => {
    // Validate passwords
    if (formData.currentPassword.trim() === '') {
      setError('Current password is required');
      return;
    }
    
    if (!validatePassword(formData.newPassword)) {
      setError('New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      await onSave(formData);
      setSuccess('Password updated successfully');
      setIsEditing(false);
      setFormData(initialData);
    } catch (err) {
      setError('Failed to update password. Please check your current password and try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = formData.currentPassword.trim() !== '' &&
    formData.newPassword.trim() !== '' &&
    formData.confirmPassword.trim() !== '';

  const formIsValid = hasChanges && validatePassword(formData.newPassword) &&
    formData.newPassword === formData.confirmPassword;

  return (
    <Card>
      <SectionHeader
        title="Password Management"
        description="Update your password to keep your account secure"
        iconName="lock"
      />

      <div className="mt-6 space-y-4">
        <div className="relative">
          <InputField
            type={showPasswords.current ? 'text' : 'password'}
            label="Current Password"
            value={formData.currentPassword}
            onChange={handleChange('currentPassword')}
            disabled={!isEditing || isSaving}
            error={formData.currentPassword.trim() === '' && isEditing ? 'Current password is required' : undefined}
            required
          />
          {isEditing && (
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
            >
              <Icon name={showPasswords.current ? "eyeSlash" : "eye"} size="md" />
            </button>
          )}
        </div>

        <div className="relative">
          <InputField
            type={showPasswords.new ? 'text' : 'password'}
            label="New Password"
            value={formData.newPassword}
            onChange={handleChange('newPassword')}
            disabled={!isEditing || isSaving}
            error={formData.newPassword.trim() !== '' && !validatePassword(formData.newPassword) && isEditing ? 
              'Password must be at least 8 characters with uppercase, lowercase, number, and special character' : undefined}
            required
          />
          {isEditing && (
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
            >
              <Icon name={showPasswords.new ? "eyeSlash" : "eye"} size="md" />
            </button>
          )}
        </div>

        {isEditing && formData.newPassword && (
          <div className="mt-2">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${getStrengthColor(passwordStrength.strength)}`} 
                  style={{ width: passwordStrength.strength === 'weak' ? '33%' : passwordStrength.strength === 'medium' ? '66%' : '100%' }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-600">{passwordStrength.message}</span>
            </div>
          </div>
        )}

        <div className="relative">
          <InputField
            type={showPasswords.confirm ? 'text' : 'password'}
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            disabled={!isEditing || isSaving}
            error={formData.confirmPassword.trim() !== '' && formData.newPassword !== formData.confirmPassword && isEditing ? 
              'Passwords do not match' : undefined}
            required
          />
          {isEditing && (
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
            >
              <Icon name={showPasswords.confirm ? "eyeSlash" : "eye"} size="md" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-red-500 text-sm"
        >
          {error}
        </motion.div>
      )}

      {success && !isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-green-500 text-sm"
        >
          {success}
        </motion.div>
      )}

      {isEditing ? (
        <ActionButtons
          hasChanges={formIsValid}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div className="flex justify-end mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEdit}
            className="px-4 py-2 bg-white text-[#00BFFF] border border-[#00BFFF] rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center"
          >
            <ButtonIcon name="key" size="md" className="mr-2" />
            Change Password
          </motion.button>
        </div>
      )}
    </Card>
  );
};

export default PasswordManagementSection; 