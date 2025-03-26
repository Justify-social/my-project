"use client";

import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import InputField from '../../components/InputField';

interface PersonalInfo {
  firstName: string;
  surname: string;
  email: string;
  companyName: string;
}

interface PersonalInfoSectionProps {
  initialData?: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  loading?: boolean;
  error?: string;
}

/**
 * PersonalInfoSection component for the Profile Settings page
 * Contains form inputs for personal information with validation
 */
const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  initialData,
  onChange,
  loading = false,
  error
}) => {
  // Default empty form state
  const defaultFormState: PersonalInfo = {
    firstName: '',
    surname: '',
    email: '',
    companyName: ''
  };
  
  // Form state
  const [formData, setFormData] = useState<PersonalInfo>(initialData || defaultFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PersonalInfo, string>>>({});
  
  // Update form state when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  // Handle form input changes
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    // Update form data
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Validate email format if the email field is being changed
    if (field === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFormErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      }
    }
    
    // Notify parent component of data change
    onChange(updatedData);
  };
  
  return (
    <Card>
      <SectionHeader 
        title="Personal Information" 
        description="Update your personal details and company information."
        iconName="fa-light fa-user-circle"
      />
      
      <div className="space-y-4">
        {/* Show general error if provided */}
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <InputField
            id="firstName"
            label="First Name"
            icon="fa-light fa-user"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            disabled={loading}
            error={formErrors.firstName}
            required
          />
          
          {/* Surname */}
          <InputField
            id="surname"
            label="Surname"
            icon="fa-light fa-user"
            value={formData.surname}
            onChange={(e) => handleChange('surname', e.target.value)}
            disabled={loading}
            error={formErrors.surname}
            required
          />
        </div>
        
        {/* Email */}
        <InputField
          id="email"
          label="Email Address"
          icon="fa-light fa-envelope"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={loading || true} // Email is usually read-only, synced with Auth0
          error={formErrors.email}
          description="Your email address is managed by your account settings."
          required
        />
        
        {/* Company Name */}
        <InputField
          id="companyName"
          label="Company Name"
          icon="fa-light fa-building"
          value={formData.companyName}
          onChange={(e) => handleChange('companyName', e.target.value)}
          disabled={loading}
          error={formErrors.companyName}
        />
      </div>
    </Card>
  );
};

export default PersonalInfoSection; 