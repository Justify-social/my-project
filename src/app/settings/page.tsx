"use client";

import React, { useState, useCallback, ChangeEvent, FormEvent, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { iconComponentFactory } from '@/components/ui/icons';

/* --------------------------------------------------
   Type Definitions
----------------------------------------------------- */
interface PersonalInfo {
  firstName: string;
  surname: string;
  companyName: string;
  email: string; // Read-only
}
interface NotificationPreferences {
  campaignUpdates: boolean;
  brandHealthAlerts: boolean;
  aiInsightNotifications: boolean;
}
interface PasswordState {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
interface TabConfig {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{
    className?: string;
  }>;
  requiresAdmin?: boolean;
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
const SectionHeader: React.FC<{
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description?: string;
}> = memo(({
  icon: Icon,
  title,
  description
}) => <div className="flex items-center mb-6">
    <div className="bg-blue-50 p-3 rounded-lg">
      <Icon className="w-6 h-6 text-[var(--accent-color)]" solid={false} />
    </div>
    <div className="ml-4">
      <h2 className="text-xl font-semibold text-[var(--primary-color)]">{title}</h2>
      {description && <p className="mt-1 text-sm text-[var(--secondary-color)]">{description}</p>}
    </div>
  </div>);
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
const NavigationTabs: React.FC<{
  activeTab: string;
  isSuperAdmin: boolean;
  onTabChange: (tab: string) => void;
}> = memo(({
  activeTab,
  isSuperAdmin,
  onTabChange
}) => {
  const tabs: TabConfig[] = [{
    id: 'profile',
    label: 'Profile Settings',
    href: '/settings',
    icon: props => <Icon name="faUserCircle" {...props} solid={false} className="text-[var(--secondary-color)]" />
  }, {
    id: 'team',
    label: 'Team Management',
    href: '/settings/team-management',
    icon: props => <Icon name="faUserCircle" {...props} solid={false} className="text-[var(--secondary-color)]" />
  }, {
    id: 'branding',
    label: 'Branding',
    href: '/settings/branding',
    icon: props => <Icon name="faPhoto" {...props} solid={false} className="text-[var(--secondary-color)]" />
  }, {
    id: 'admin',
    label: 'Super Admin Console',
    href: '/admin',
    requiresAdmin: true,
    icon: props => <Icon name="faKey" {...props} solid={false} className="text-[var(--secondary-color)]" />
  }];
  return <div className="mb-8 border-b border-gray-200">
      <nav className="flex space-x-1" aria-label="Settings navigation">
        {tabs.map(tab => {
        if (tab.requiresAdmin && !isSuperAdmin) return null;
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;
        return <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`
                relative py-4 px-6 flex items-center transition-all duration-200
                ${isActive ? 'text-[var(--accent-color)] bg-[var(--background-color)] bg-opacity-50' : 'text-[var(--secondary-color)] hover:text-[var(--primary-color)] hover:bg-[var(--background-color)]'}
                rounded-t-lg
              `} aria-current={isActive ? 'page' : undefined}>

              {IconComponent && <IconComponent className="w-5 h-5 mr-2" />}
              <span className="font-medium">{tab.label}</span>
              {isActive && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-color)]" />}
            </button>;
      })}
      </nav>
    </div>;
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



      <Icon name="faXCircle" className="w-5 h-5 mr-2" solid={false} />
      Cancel
    </motion.button>
    <motion.button whileHover={{
    scale: 1.02
  }} whileTap={{
    scale: 0.98
  }} onClick={onSave} disabled={!hasChanges || isSaving} className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium 
        flex items-center ${!hasChanges || isSaving ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-[var(--accent-color)] hover:bg-opacity-90 text-white'}`}>

      {isSaving ? <>
          <Icon name="faArrowRight" className="w-5 h-5 mr-2 animate-spin" solid={false} />
          Saving...
        </> : <>
          <Icon name="faCheckCircle" className="w-5 h-5 mr-2" solid={false} />
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
    <SectionHeader icon={props => <Icon name="faUserCircle" {...props} solid={false} className="text-[var(--secondary-color)]" />} title="Personal Information" description="Update your personal details and company information." />

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
    <SectionHeader icon={props => <Icon name="faPhoto" {...props} solid={false} className="text-[var(--secondary-color)]" />} title="Profile Picture" description="Upload or update your profile picture" />

    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div>
        {profilePicturePreview ? <div className="relative">
            <img src={profilePicturePreview} alt="Profile Preview" className="w-32 h-32 rounded-full object-cover" />

            <motion.button whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.95
        }} onClick={onRemove} className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md" aria-label="Remove profile picture">

              <Icon name="faXCircle" className="w-5 h-5" solid={false} />
            </motion.button>
          </div> : <div className="w-32 h-32 rounded-full bg-[var(--background-color)] flex items-center justify-center">
            <Icon name="faUserCircle" className="w-16 h-16 text-[var(--secondary-color)]" solid={false} />
          </div>}
      </div>
      <div className="flex-grow">
        <div className="space-y-2 flex flex-col sm:items-start items-center">
          <label htmlFor="profilePicture" className="bg-blue-50 hover:bg-blue-100 text-[var(--accent-color)]
                px-4 py-2 rounded-lg cursor-pointer flex items-center
                transition-colors duration-200 font-medium group">





            <Icon name="faPhoto" className="w-5 h-5 mr-2" solid={false} />
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

              <Icon name="faXCircle" className="w-5 h-5 mr-1" solid={false} />
              {error}
            </motion.p>}
        </div>
      </div>
    </div>
  </Card>);

// Password Management Section
const PasswordManagementSection: React.FC<{
  passwordState: PasswordState;
  onChange: (field: keyof PasswordState, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  error: string;
  success: string;
}> = memo(({
  passwordState,
  onChange,
  onSubmit,
  error,
  success
}) => <Card>
    <SectionHeader icon={props => <Icon name="faKey" {...props} solid={false} className="text-[var(--secondary-color)]" />} title="Security" description="Update your password and security settings." />

    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Current Password
          </label>
          <input type="password" value={passwordState.currentPassword} onChange={e => onChange('currentPassword', e.target.value)} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md 
              focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" placeholder="Enter current password" aria-label="Current password" />

        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
              New Password
            </label>
            <input type="password" value={passwordState.newPassword} onChange={e => onChange('newPassword', e.target.value)} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md 
                focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" placeholder="Enter new password" aria-label="New password" />

          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
              Confirm New Password
            </label>
            <input type="password" value={passwordState.confirmNewPassword} onChange={e => onChange('confirmNewPassword', e.target.value)} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md 
                focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" placeholder="Confirm new password" aria-label="Confirm new password" />

          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium text-[var(--primary-color)] mb-2">
          Password Requirements
        </h4>
        <ul className="space-y-1 text-sm text-[var(--secondary-color)]">
          <li className="flex items-center">
            <Icon name="faCheckCircle" className="w-4 h-4 mr-2 text-green-500" solid={false} />
            Minimum 8 characters
          </li>
          <li className="flex items-center">
            <Icon name="faCheckCircle" className="w-4 h-4 mr-2 text-green-500" solid={false} />
            At least one uppercase letter
          </li>
          <li className="flex items-center">
            <Icon name="faCheckCircle" className="w-4 h-4 mr-2 text-green-500" solid={false} />
            At least one number
          </li>
          <li className="flex items-center">
            <Icon name="faCheckCircle" className="w-4 h-4 mr-2 text-green-500" solid={false} />
            At least one special character
          </li>
        </ul>
      </div>

      {error && <motion.div initial={{
      opacity: 0,
      y: -10
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start">

          <Icon name="faXCircle" className="w-5 h-5 mr-2 flex-shrink-0" solid={false} />
          <p>{error}</p>
        </motion.div>}

      {success && <motion.div initial={{
      opacity: 0,
      y: -10
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start">

          <Icon name="faCheckCircle" className="w-5 h-5 mr-2 flex-shrink-0" solid={false} />
          <p>{success}</p>
        </motion.div>}

      <div className="flex justify-end">
        <button onClick={onSubmit} disabled={!passwordState.currentPassword || !passwordState.newPassword || !passwordState.confirmNewPassword || !validatePassword(passwordState.newPassword)} className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium
            flex items-center ${!passwordState.currentPassword || !passwordState.newPassword || !passwordState.confirmNewPassword || !validatePassword(passwordState.newPassword) ? 'bg-blue-300 cursor-not-allowed' : 'bg-[var(--accent-color)] hover:bg-opacity-90 text-white'}`}>

          <Icon name="faKey" className="w-5 h-5 mr-2" solid={false} />
          Update Password
        </button>
      </div>
    </form>
  </Card>);

// Notification Preferences Section
const NotificationPreferencesSection: React.FC<{
  preferences: NotificationPreferences;
  onToggle: (field: keyof NotificationPreferences, value: boolean) => void;
}> = memo(({
  preferences,
  onToggle
}) => <Card>
    <SectionHeader icon={props => <Icon name="faBell" {...props} solid={false} className="text-[var(--secondary-color)]" />} title="Notification Preferences" description="Manage how you receive updates and alerts." />

    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3">
            <div>
              <h3 className="text-base font-medium text-[var(--primary-color)]">Campaign Updates</h3>
              <p className="text-sm text-[var(--secondary-color)]">
                Get notified about campaign status changes and performance updates
              </p>
            </div>
            <button onClick={() => onToggle('campaignUpdates', !preferences.campaignUpdates)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none
                ${preferences.campaignUpdates ? 'bg-[var(--accent-color)]' : 'bg-gray-300'}`} role="switch" aria-checked={preferences.campaignUpdates}>

              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${preferences.campaignUpdates ? 'translate-x-6' : 'translate-x-1'}`} />

            </button>
          </div>
          <label className="flex items-center space-x-3 p-4 bg-[var(--background-color)] 
            rounded-lg hover:bg-[var(--background-color)] transition-colors duration-200 cursor-pointer">


            <input type="checkbox" checked={preferences.brandHealthAlerts} onChange={e => onToggle('brandHealthAlerts', e.target.checked)} className="form-checkbox h-5 w-5 text-[var(--accent-color)] rounded 
                focus:ring-[var(--accent-color)] border-[var(--divider-color)] transition duration-150" />



            <div>
              <p className="font-medium text-[var(--primary-color)]">Brand Health Alerts</p>
              <p className="text-sm text-[var(--secondary-color)]">
                Get notified about changes in brand health metrics
              </p>
            </div>
          </label>
        </div>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 p-4 bg-[var(--background-color)] 
            rounded-lg hover:bg-[var(--background-color)] transition-colors duration-200 cursor-pointer">


            <input type="checkbox" checked={preferences.aiInsightNotifications} onChange={e => onToggle('aiInsightNotifications', e.target.checked)} className="form-checkbox h-5 w-5 text-[var(--accent-color)] rounded 
                focus:ring-[var(--accent-color)] border-[var(--divider-color)] transition duration-150" />



            <div>
              <p className="font-medium text-[var(--primary-color)]">AI Insights</p>
              <p className="text-sm text-[var(--secondary-color)]">
                Receive AI-powered insights and recommendations
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  </Card>);

/* --------------------------------------------------
   Main Profile Settings Page Component
----------------------------------------------------- */
const ProfileSettingsPage: React.FC = () => {
  const router = useRouter();
  const {
    user,
    isLoading,
    error
  } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Personal Information state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: 'Ed',
    surname: 'Addams',
    companyName: 'The Write Company',
    email: 'edaddams@domain.com'
  });
  const [isEditing, setIsEditing] = useState(false);

  // Profile Picture state
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [profilePictureError, setProfilePictureError] = useState('');

  // Password Management state
  const [passwordState, setPasswordState] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Notification Preferences state
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    campaignUpdates: false,
    brandHealthAlerts: false,
    aiInsightNotifications: false
  });

  // Save and Cancel state
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Effect to check super admin status
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const response = await fetch('/api/auth/verify-role');
        if (!response.ok) throw new Error('Failed to verify role');
        const data = await response.json();
        setIsSuperAdmin(data?.user?.isSuperAdmin || false);
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      } finally {
        setIsPageLoading(false);
      }
    };
    if (user) {
      checkSuperAdmin();
    }
  }, [user]);

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
  const toggleEditing = useCallback(() => setIsEditing(prev => !prev), []);
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
  const handlePasswordChange = useCallback((field: keyof PasswordState, value: string) => {
    setPasswordState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  const handlePasswordSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordState.newPassword !== passwordState.confirmNewPassword) {
      setPasswordError('Error: Passwords do not match.');
      return;
    }
    if (!validatePassword(passwordState.newPassword)) {
      setPasswordError('Error: Password does not meet security requirements.');
      return;
    }
    setPasswordSuccess('Password updated successfully!');
    setPasswordState({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  }, [passwordState]);
  const handleTogglePreference = useCallback((field: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
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
      firstName: 'Ed',
      surname: 'Addams',
      companyName: 'The Write Company',
      email: 'edaddams@domain.com'
    });
    setIsEditing(false);
    setProfilePicture(null);
    setProfilePicturePreview('');
    setPreferences({
      campaignUpdates: false,
      brandHealthAlerts: false,
      aiInsightNotifications: false
    });
    setHasChanges(false);
  }, []);
  const handleSignOut = useCallback(() => {
    window.location.href = '/api/auth/logout';
  }, []);

  // Render loading state
  if (isLoading || isPageLoading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
          <p className="text-[var(--secondary-color)] animate-pulse">Loading settings...</p>
        </div>
      </div>;
  }

  // Render error state
  if (error || !user) {
    return <div className="flex items-center justify-center min-h-screen">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-red-50 text-red-800 rounded-xl p-6 max-w-md w-full 
            shadow-lg flex items-center">



          <Icon name="faXCircle" className="w-12 h-12 text-red-400 mr-4" solid={false} />
          <div>
            <h3 className="text-lg font-semibold mb-2">Access Error</h3>
            <p className="text-red-600">
              {error?.message || 'Please log in to access settings'}
            </p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg
                  mt-4 hover:bg-opacity-90 transition-all duration-200
                  flex items-center">





              <Icon name="faArrowRight" className="w-5 h-5 mr-2" solid={false} />
              Retry
            </button>
          </div>
        </motion.div>
      </div>;
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
        <NavigationTabs activeTab={activeTab} isSuperAdmin={isSuperAdmin} onTabChange={handleTabChange} />


        {/* Main Content */}
        <div className="space-y-8">
          <PersonalInfoSection personalInfo={personalInfo} isEditing={isEditing} onChange={handlePersonalInfoChangeWithMark} onToggleEdit={toggleEditing} />


          <ProfilePicture profilePicturePreview={profilePicturePreview} onFileChange={(e: ChangeEvent<HTMLInputElement>) => {
          handleProfilePictureChange(e);
        }} onRemove={removeProfilePicture} error={profilePictureError} />


          <PasswordManagementSection passwordState={passwordState} onChange={handlePasswordChange} onSubmit={handlePasswordSubmit} error={passwordError} success={passwordSuccess} />


          <NotificationPreferencesSection preferences={preferences} onToggle={handleTogglePreferenceWithMark} />


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