import React, { useState } from 'react';
import HTMLInputElement from '../../ui/radio/types/index';
import { motion } from 'framer-motion';
import Card from './shared/Card';
import SectionHeader from './shared/SectionHeader';
import InputField from './shared/InputField';
import ActionButtons from './shared/ActionButtons';
import { Icon, ButtonIcon } from '@/components/ui/icons';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
}

interface PersonalInfoSectionProps {
  initialData: UserProfile;
  onSave: (data: UserProfile) => Promise<void>;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ 
  initialData,
  onSave
}) => {
  const [formData, setFormData] = useState<UserProfile>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value
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
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onSave(formData);
      setSuccess('Personal information updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update personal information. Please try again later.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
  const formIsValid = 
    formData.firstName.trim() !== '' && 
    formData.lastName.trim() !== '' && 
    formData.email.trim() !== '';

  return (
    <Card>
      <SectionHeader
        title="Personal Information"
        description="Update your basic personal information"
        iconName="user"
      />

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            disabled={!isEditing || isSaving}
            error={formData.firstName.trim() === '' ? 'First name is required' : undefined}
            required
          />
          <InputField
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange('lastName')}
            disabled={!isEditing || isSaving}
            error={formData.lastName.trim() === '' ? 'Last name is required' : undefined}
            required
          />
        </div>

        <InputField
          label="Email Address"
          value={formData.email}
          onChange={handleChange('email')}
          disabled={!isEditing || isSaving}
          error={formData.email.trim() === '' ? 'Email is required' : undefined}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Job Title"
            value={formData.jobTitle}
            onChange={handleChange('jobTitle')}
            disabled={!isEditing || isSaving}
          />
          <InputField
            label="Department"
            value={formData.department}
            onChange={handleChange('department')}
            disabled={!isEditing || isSaving}
          />
        </div>

        <InputField
          label="Location"
          value={formData.location}
          onChange={handleChange('location')}
          disabled={!isEditing || isSaving}
        />
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
          hasChanges={hasChanges && formIsValid}
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
            <ButtonIcon name="penToSquare" size="md" className="mr-2" />
            Edit Information
          </motion.button>
        </div>
      )}
    </Card>
  );
};

export default PersonalInfoSection; 