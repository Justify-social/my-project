"use client";

import React, { useState, useCallback, ChangeEvent, FormEvent, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion, AnimatePresence } from 'framer-motion';
import { SvgIcon } from '@/components/ui/icons';
import type { SvgIconProps } from '@/components/ui/icons';
import { iconComponentFactory } from '@/components/ui/icons';

/* --------------------------------------------------
   Type Definitions
----------------------------------------------------- */
interface PersonalInfo {
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  companyName: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

interface PasswordState {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
}

interface TabConfig {
  id: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

interface IconProps {
  name: string;
  className?: string;
  solid?: boolean;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSuperAdmin: boolean;
}

interface SectionHeaderProps {
  title: string;
  description: string;
  iconName: string;
}

interface PasswordManagementSectionProps {
  passwordState: PasswordState;
  onChange: (field: keyof PasswordState, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  error?: string;
  success?: string;
}

/* --------------------------------------------------
   Helper Functions
----------------------------------------------------- */
// A simple password validator that checks for at least 8 characters,
// 1 uppercase letter, 1 number and 1 special character.
const validatePassword = (password: string): boolean => {
  const minLength = 8;
  const uppercaseRegex = /[A-Z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[@#$%^&*(),.?":{}|<>]/;
  return password.length >= minLength && uppercaseRegex.test(password) && numberRegex.test(password) && specialCharRegex.test(password);
};

/* --------------------------------------------------
   Enhanced UI Components
----------------------------------------------------- */
const SectionHeader = memo(({ title, description, iconName }: SectionHeaderProps) => (
  <div className="flex items-start mb-6">
    <div className="mr-4">
      <SvgIcon name={iconName} className="w-6 h-6 text-[var(--accent-color)]" iconType="static" solid={false} />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  </div>
));
const Card = memo(({
  children
}: {
  children: React.ReactNode;
}) => <motion.div initial={{
  opacity: 0,
  y: 20
}} animate={{
  opacity: 1,
  y: 0
}} transition={{
  duration: 0.3
}} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">

    {children}
  </motion.div>);

/* --------------------------------------------------
   Navigation Components
----------------------------------------------------- */
const TabNavigation = memo(({ activeTab, onTabChange, isSuperAdmin }: TabNavigationProps) => {
  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: 'faUser',
      requiresAdmin: false
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'faBell',
      requiresAdmin: false
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'faLock',
      requiresAdmin: false
    },
    {
      id: 'admin',
      label: 'Admin Settings',
      icon: 'faUserCircle',
      requiresAdmin: true
    }
  ];

  return (
    <div className="flex border-b border-gray-200 mb-8">
      {tabs.map((tab) => (
        tab.requiresAdmin && !isSuperAdmin ? null : (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center px-6 py-3 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SvgIcon name={tab.icon} className="w-5 h-5 mr-2" iconType="static" solid={false} />
            {tab.label}
          </button>
        )
      ))}
    </div>
  );
});

/* --------------------------------------------------
   Action Buttons Component
----------------------------------------------------- */
const ActionButtons: React.FC<{
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onSignOut: () => void;
}> = memo(({
  hasChanges,
  isSaving,
  onSave,
  onCancel,
  onSignOut
}) => <div className="flex items-center space-x-3">
    <motion.button whileHover={{
    scale: 1.02
  }} whileTap={{
    scale: 0.98
  }} onClick={onCancel} disabled={isSaving} className="px-4 py-2 text-[var(--primary-color)] bg-[var(--background-color)] rounded-lg hover:bg-gray-200 
        transition-colors duration-200 font-medium flex items-center">



      <SvgIcon name="faXCircle" className="w-5 h-5 mr-2" solid={false} />
      Cancel
    </motion.button>
    <motion.button whileHover={{
    scale: 1.02
  }} whileTap={{
    scale: 0.98
  }} onClick={onSave} disabled={!hasChanges || isSaving} className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium 
        flex items-center ${!hasChanges || isSaving ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-[var(--accent-color)] hover:bg-opacity-90 text-white'}`}>

      {isSaving ? <>
          <SvgIcon name="faArrowRight" className="w-5 h-5 mr-2 animate-spin" solid={false} />
          Saving...
        </> : <>
          <SvgIcon name="faCheckCircle" className="w-5 h-5 mr-2" solid={false} />
          Save
        </>}
    </motion.button>
    <motion.button whileHover={{
    scale: 1.02
  }} whileTap={{
    scale: 0.98
  }} onClick={onSignOut} className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 
        transition-colors duration-200 font-medium flex items-center">



      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">

        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />

      </svg>
      Logout
    </motion.button>
  </div>);

/* --------------------------------------------------
   Sub-Components
----------------------------------------------------- */

// Personal Information Section
const PersonalInfoSection: React.FC<{
  personalInfo: PersonalInfo;
  isEditing: boolean;
  onChange: (field: keyof Omit<PersonalInfo, 'email'>, value: string) => void;
  onToggleEdit: () => void;
}> = memo(({
  personalInfo,
  isEditing,
  onChange,
  onToggleEdit
}) => <Card>
    <SectionHeader 
      iconName="faUserCircle" 
      title="Personal Information" 
      description="Update your personal details and company information." 
    />

    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
              First Name
            </label>
            <input type="text" value={personalInfo.firstName} onChange={e => onChange('firstName', e.target.value)} disabled={!isEditing} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md 
                focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" aria-label="First name" />

          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
              Surname
            </label>
            <input type="text" value={personalInfo.surname} onChange={e => onChange('surname', e.target.value)} disabled={!isEditing} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md 
                focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" aria-label="Surname" />

          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
              Email
            </label>
            <input type="email" value={personalInfo.email} readOnly className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md 
                focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" title="Email cannot be changed. Contact support for updates." aria-label="Email address (read-only)" />

          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
              Company Name
            </label>
            <input type="text" value={personalInfo.companyName} onChange={e => onChange('companyName', e.target.value)} disabled={!isEditing} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md 
                focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" aria-label="Company name" />

          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={onToggleEdit} className="ml-auto px-3 py-1.5 text-[var(--accent-color)] border border-[var(--accent-color)] 
            rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium">



          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>
    </div>
  </Card>);

// Profile Picture Section
const ProfilePicture: React.FC<{
  profilePicturePreview: string | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  error: string;
}> = memo(({
  profilePicturePreview,
  onFileChange,
  onRemove,
  error
}) => <Card>
    <SectionHeader 
      iconName="faPhoto" 
      title="Profile Picture" 
      description="Upload or update your profile picture" 
    />

    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="mb-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profilePicturePreview ? (
                <img src={profilePicturePreview} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <SvgIcon name="faUserCircle" className="w-16 h-16 text-[var(--secondary-color)]" iconType="static" solid={false} />
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]"
          >
            <SvgIcon name="faXCircle" className="w-5 h-5 mr-2 inline-block" iconType="static" solid={false} />
            Remove Profile Picture
          </button>
        </div>
      </div>
      <div className="flex-grow">
        <div className="space-y-2 flex flex-col sm:items-start items-center">
          <label htmlFor="profilePicture" className="bg-blue-50 hover:bg-blue-100 text-[var(--accent-color)]
                px-4 py-2 rounded-lg cursor-pointer flex items-center
                transition-colors duration-200 font-medium group">





            <SvgIcon name="faPhoto" className="w-5 h-5 mr-2" solid={false} />
            <span>Upload New Picture</span>
            <input type="file" id="profilePicture" accept="image/*" className="hidden" onChange={onFileChange} />

          </label>
          <div className="text-sm text-[var(--secondary-color)]">
            Recommended: Square image, at least 500x500 pixels
          </div>
          {error && <motion.p initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-red-500 text-sm flex items-center">

              <SvgIcon name="faXCircle" className="w-5 h-5 mr-1" solid={false} />
              {error}
            </motion.p>}
        </div>
      </div>
    </div>
  </Card>);

// Password Management Section
const PasswordManagementSection = memo(({ 
  passwordState, 
  onChange, 
  onSubmit, 
  error, 
  success 
}: PasswordManagementSectionProps) => (
  <div className="space-y-6">
    <div>
      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
        Current Password
      </label>
      <div className="mt-1 relative">
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={passwordState.currentPassword}
          onChange={(e) => onChange('currentPassword', e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
        />
      </div>
    </div>

    <div>
      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
        New Password
      </label>
      <div className="mt-1 relative">
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={passwordState.newPassword}
          onChange={(e) => onChange('newPassword', e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
        />
      </div>
    </div>

    <div>
      <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
        Confirm New Password
      </label>
      <div className="mt-1 relative">
        <input
          type="password"
          id="confirmNewPassword"
          name="confirmNewPassword"
          value={passwordState.confirmNewPassword}
          onChange={(e) => onChange('confirmNewPassword', e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
        />
      </div>
    </div>

    {/* Password Requirements */}
    <div className="mt-4 space-y-2 text-sm text-gray-600">
      <div className={`flex items-center ${passwordState.hasMinLength ? 'text-green-500' : ''}`}>
        <SvgIcon name="faCheckCircle" className="w-4 h-4 mr-2" iconType="static" solid={false} />
        At least 8 characters
      </div>
      <div className={`flex items-center ${passwordState.hasUpperCase ? 'text-green-500' : ''}`}>
        <SvgIcon name="faCheckCircle" className="w-4 h-4 mr-2" iconType="static" solid={false} />
        At least one uppercase letter
      </div>
      <div className={`flex items-center ${passwordState.hasLowerCase ? 'text-green-500' : ''}`}>
        <SvgIcon name="faCheckCircle" className="w-4 h-4 mr-2" iconType="static" solid={false} />
        At least one lowercase letter
      </div>
      <div className={`flex items-center ${passwordState.hasNumber ? 'text-green-500' : ''}`}>
        <SvgIcon name="faCheckCircle" className="w-4 h-4 mr-2" iconType="static" solid={false} />
        At least one number
      </div>
    </div>

    {/* Error Messages */}
    {error && (
      <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start">
        <SvgIcon name="faXCircle" className="w-5 h-5 mr-2 flex-shrink-0 text-red-500" iconType="static" solid={false} />
        <p className="text-red-700">{error}</p>
      </div>
    )}

    {/* Success Messages */}
    {success && (
      <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-start">
        <SvgIcon name="faCheckCircle" className="w-5 h-5 mr-2 flex-shrink-0 text-green-500" iconType="static" solid={false} />
        <p className="text-green-700">{success}</p>
      </div>
    )}

    {/* Submit Button */}
    <button
      type="submit"
      onClick={onSubmit}
      disabled={!passwordState.currentPassword || !passwordState.newPassword || !passwordState.confirmNewPassword}
      className="mt-6 px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <SvgIcon name="faKey" className="w-5 h-5 mr-2" iconType="static" solid={false} />
      Change Password
    </button>
  </div>
));

// Notification Preferences Section
const NotificationPreferencesSection: React.FC<{
  preferences: NotificationPreferences;
  onToggle: (field: keyof NotificationPreferences, value: boolean) => void;
}> = memo(({
  preferences,
  onToggle
}) => <Card>
    <SectionHeader 
      iconName="faBell" 
      title="Notification Preferences" 
      description="Manage how you receive updates and alerts." 
    />

    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3">
            <div>
              <h3 className="text-base font-medium text-[var(--primary-color)]">Email Notifications</h3>
              <p className="text-sm text-[var(--secondary-color)]">
                Get notified via email about campaign status changes and performance updates
              </p>
            </div>
            <button onClick={() => onToggle('emailNotifications', !preferences.emailNotifications)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none
                ${preferences.emailNotifications ? 'bg-[var(--accent-color)]' : 'bg-gray-300'}`} role="switch" aria-checked={preferences.emailNotifications}>

              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />

            </button>
          </div>
          <label className="flex items-center space-x-3 p-4 bg-[var(--background-color)] 
            rounded-lg hover:bg-[var(--background-color)] transition-colors duration-200 cursor-pointer">


            <input type="checkbox" checked={preferences.marketingEmails} onChange={e => onToggle('marketingEmails', e.target.checked)} className="form-checkbox h-5 w-5 text-[var(--accent-color)] rounded 
                focus:ring-[var(--accent-color)] border-[var(--divider-color)] transition duration-150" />



            <div>
              <p className="font-medium text-[var(--primary-color)]">Marketing Emails</p>
              <p className="text-sm text-[var(--secondary-color)]">
                Receive marketing emails and promotions
              </p>
            </div>
          </label>
        </div>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 p-4 bg-[var(--background-color)] 
            rounded-lg hover:bg-[var(--background-color)] transition-colors duration-200 cursor-pointer">


            <input type="checkbox" checked={preferences.pushNotifications} onChange={e => onToggle('pushNotifications', e.target.checked)} className="form-checkbox h-5 w-5 text-[var(--accent-color)] rounded 
                focus:ring-[var(--accent-color)] border-[var(--divider-color)] transition duration-150" />



            <div>
              <p className="font-medium text-[var(--primary-color)]">Push Notifications</p>
              <p className="text-sm text-[var(--secondary-color)]">
                Receive push notifications for campaign updates and alerts
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  </Card>);

const PasswordInput = memo(({ 
  id, 
  value, 
  onChange, 
  label, 
  showPassword, 
  onToggleVisibility 
}: {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-1 relative">
      <input
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--accent-color)] focus:border-[var--accent-color)]"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <SvgIcon 
          name={showPassword ? 'faEyeSlash' : 'faEye'} 
          className="w-5 h-5 text-gray-400" 
          iconType="static" 
        />
      </button>
    </div>
  </div>
));

/* --------------------------------------------------
   Main Profile Settings Page Component
----------------------------------------------------- */
const ProfileSettingsPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading, error: userError } = useUser();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [roleCheckAttempts, setRoleCheckAttempts] = useState(0);
  const MAX_ROLE_CHECK_ATTEMPTS = 3;
  const LOADING_TIMEOUT_MS = 10000; // 10 seconds
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    companyName: ''
  });

  const [passwordState, setPasswordState] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  });

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false
  });

  // Profile Picture state
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [profilePictureError, setProfilePictureError] = useState('');

  // Save and Cancel state
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Effect to initialize user data
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ');
      setPersonalInfo({
        firstName: nameParts[0] || '',
        surname: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        address: (user as any).address || '',
        companyName: (user as any)['https://justify.social/company'] || ''
      });
    }
  }, [user]);

  // Effect to check super admin status with retry logic and timeout
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const response = await fetch('/api/auth/verify-role');
        if (!response.ok) {
          throw new Error(`Failed to verify role: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Role verification failed');
        }
        
        setIsSuperAdmin(data?.user?.isSuperAdmin || false);
        setIsPageLoading(false);
        setError('');
        
        // Clear timeout since we succeeded
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          setLoadingTimeout(null);
        }
      } catch (error) {
        console.error('Error checking super admin status:', error);
        
        // Retry logic
        if (roleCheckAttempts < MAX_ROLE_CHECK_ATTEMPTS) {
          setRoleCheckAttempts(prev => prev + 1);
          setTimeout(checkSuperAdmin, 1000 * (roleCheckAttempts + 1)); // Exponential backoff
        } else {
          setError('Failed to verify your role. Please try refreshing the page.');
          setIsPageLoading(false);
        }
      }
    };

    if (user && !isUserLoading) {
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setIsPageLoading(false);
        setError('Loading took too long. Please try refreshing the page.');
      }, LOADING_TIMEOUT_MS);
      
      setLoadingTimeout(timeout);
      
      // Start role check
      checkSuperAdmin();
      
      // Cleanup
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    } else if (!isUserLoading) {
      setIsPageLoading(false);
    }
  }, [user, isUserLoading, roleCheckAttempts]);

  // Callback handlers
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'team':
        router.push('/settings/team-management');
        break;
      case 'branding':
        router.push('/settings/branding');
        break;
      case 'admin':
        router.push('/admin');
        break;
      default:
        router.push('/settings');
    }
  }, [router]);
  const handlePersonalInfoChange = useCallback((field: keyof Omit<PersonalInfo, 'email'>, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  const handleProfilePictureChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setProfilePictureError('');
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setProfilePictureError('Error: Unsupported file type. Please upload a JPG or PNG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setProfilePictureError('Error: File size too large. Maximum allowed size is 5MB.');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  const removeProfilePicture = useCallback(() => {
    setProfilePicture(null);
    setProfilePicturePreview('');
  }, []);
  const handlePasswordFieldChange = useCallback((field: keyof PasswordState, value: string) => {
    setPasswordState(prev => {
      const newState = { ...prev, [field]: value };
      
      // Update validation flags if the field is newPassword
      if (field === 'newPassword') {
        newState.hasMinLength = value.length >= 8;
        newState.hasUpperCase = /[A-Z]/.test(value);
        newState.hasLowerCase = /[a-z]/.test(value);
        newState.hasNumber = /[0-9]/.test(value);
      }
      
      return newState;
    });
  }, []);
  const handlePasswordSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!passwordState.currentPassword || !passwordState.newPassword || !passwordState.confirmNewPassword) {
      setError('Please fill in all password fields');
      return;
    }
    
    if (passwordState.newPassword !== passwordState.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (!passwordState.hasMinLength || !passwordState.hasUpperCase || 
        !passwordState.hasLowerCase || !passwordState.hasNumber) {
      setError('New password does not meet all requirements');
      return;
    }
    
    // Here you would typically make an API call to update the password
    setSuccess('Password updated successfully!');
    setPasswordState({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      hasMinLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false
    });
  }, [passwordState]);
  const handleTogglePreference = useCallback((field: keyof NotificationPreferences, value: boolean) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  const markChanges = useCallback(() => setHasChanges(true), []);
  const handlePersonalInfoChangeWithMark = useCallback((field: keyof Omit<PersonalInfo, 'email'>, value: string) => {
    handlePersonalInfoChange(field, value);
    markChanges();
  }, [handlePersonalInfoChange, markChanges]);
  const handleTogglePreferenceWithMark = useCallback((field: keyof NotificationPreferences, value: boolean) => {
    handleTogglePreference(field, value);
    markChanges();
  }, [handleTogglePreference, markChanges]);
  const handleSaveChanges = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
      alert('Profile updated successfully!');
    }, 2000);
  }, []);
  const handleCancel = useCallback(() => {
    setPersonalInfo({
      firstName: '',
      surname: '',
      email: '',
      phone: '',
      address: '',
      companyName: ''
    });
    setIsEditing(false);
    setProfilePicture(null);
    setProfilePicturePreview('');
    setNotificationPreferences({
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false
    });
    setHasChanges(false);
  }, []);
  const handleSignOut = useCallback(() => {
    window.location.href = '/api/auth/logout';
  }, []);

  // Render loading state with progress indicator
  if (isUserLoading || isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <SvgIcon name="faCircle" className="w-12 h-12 text-[var(--accent-color)] animate-spin" iconType="static" solid={false} />
          <p className="mt-4 text-gray-600">
            {isUserLoading ? 'Loading your profile...' : 'Verifying your access...'}
          </p>
          {roleCheckAttempts > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Attempt {roleCheckAttempts} of {MAX_ROLE_CHECK_ATTEMPTS}...
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // Render error state with retry button
  if (userError || error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-800 rounded-xl p-6 max-w-md w-full shadow-lg"
        >
          <div className="flex items-start">
            <SvgIcon name="faXCircle" className="w-12 h-12 text-red-400 mr-4 flex-shrink-0" iconType="static" solid={false} />
            <div>
              <h3 className="text-lg font-semibold mb-2">Access Error</h3>
              <p className="text-red-600 mb-4">
                {userError?.message || error || 'An unexpected error occurred'}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center"
                >
                  <SvgIcon name="faRotate" className="w-5 h-5 mr-2" iconType="static" solid={false} />
                  Retry
                </button>
                <button
                  onClick={() => window.location.href = '/api/auth/login'}
                  className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center"
                >
                  <SvgIcon name="faArrowRight" className="w-5 h-5 mr-2" iconType="static" solid={false} />
                  Log In Again
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render unauthorized state with clear call-to-action
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 text-yellow-800 rounded-xl p-6 max-w-md w-full shadow-lg"
        >
          <div className="flex items-start">
            <SvgIcon name="faLock" className="w-12 h-12 text-yellow-400 mr-4 flex-shrink-0" iconType="static" solid={false} />
            <div>
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-yellow-600 mb-4">
                Please log in to access your settings
              </p>
              <button
                onClick={() => window.location.href = '/api/auth/login'}
                className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center"
              >
                <SvgIcon name="faArrowRight" className="w-5 h-5 mr-2" iconType="static" solid={false} />
                Log In
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} className="min-h-screen bg-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <motion.h1 initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="text-3xl font-bold text-[var(--primary-color)]">

              Settings
            </motion.h1>
            <motion.p initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.1
          }} className="mt-2 text-[var(--secondary-color)]">

              Manage your account settings and preferences
            </motion.p>
          </div>
          <ActionButtons hasChanges={hasChanges} isSaving={isSaving} onSave={handleSaveChanges} onCancel={handleCancel} onSignOut={handleSignOut} />

        </div>

        {/* Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} isSuperAdmin={isSuperAdmin} />


        {/* Main Content */}
        <div className="space-y-8">
          <PersonalInfoSection personalInfo={personalInfo} isEditing={isEditing} onChange={handlePersonalInfoChangeWithMark} onToggleEdit={() => setIsEditing(!isEditing)} />


          <ProfilePicture profilePicturePreview={profilePicturePreview} onFileChange={(e: ChangeEvent<HTMLInputElement>) => {
          handleProfilePictureChange(e);
        }} onRemove={removeProfilePicture} error={profilePictureError} />


          <PasswordManagementSection 
            passwordState={passwordState}
            onChange={handlePasswordFieldChange}
            onSubmit={handlePasswordSubmit}
            error={error || ''}
            success={success || ''}
          />


          <NotificationPreferencesSection preferences={notificationPreferences} onToggle={handleTogglePreferenceWithMark} />


          {/* Debug Information (only visible in development) */}
          {process.env.NODE_ENV === 'development' && <motion.details initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="mt-8">

              <summary className="cursor-pointer text-sm text-[var(--secondary-color)] 
                hover:text-[var(--primary-color)] transition-colors duration-200">


                Debug Information
              </summary>
              <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-auto">
                <pre className="text-xs text-gray-300">
                  {JSON.stringify({
                user: {
                  email: user.email,
                  name: user.name,
                  isSuperAdmin
                },
                auth: {
                  isAuthenticated: !!user,
                  lastChecked: new Date().toISOString()
                },
                state: {
                  activeTab,
                  hasChanges,
                  isSaving
                }
              }, null, 2)}
                </pre>
              </div>
            </motion.details>}
        </div>
      </div>
    </motion.div>;
};
export default ProfileSettingsPage;