"use client";

import React, {
  useState,
  useCallback,
  ChangeEvent,
  FormEvent,
  memo,
  useEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  BellIcon,
  KeyIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

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
  icon?: React.ComponentType<{ className?: string }>;
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
  return (
    password.length >= minLength &&
    uppercaseRegex.test(password) &&
    numberRegex.test(password) &&
    specialCharRegex.test(password)
  );
};

/* --------------------------------------------------
   Enhanced UI Components
----------------------------------------------------- */
const SectionHeader: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}> = memo(({ icon: Icon, title, description }) => (
  <div className="flex items-center mb-6">
    <div className="bg-blue-50 p-3 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div className="ml-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  </div>
));

const Card = memo(({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6"
  >
    {children}
  </motion.div>
));

/* --------------------------------------------------
   Navigation Components
----------------------------------------------------- */
const NavigationTabs: React.FC<{
  activeTab: string;
  isSuperAdmin: boolean;
  onTabChange: (tab: string) => void;
}> = memo(({ activeTab, isSuperAdmin, onTabChange }) => {
  const tabs: TabConfig[] = [
    { 
      id: 'profile', 
      label: 'Profile Settings', 
      href: '/settings',
      icon: UserCircleIcon
    },
    { 
      id: 'team', 
      label: 'Team Management', 
      href: '/settings/team-management',
      icon: UserCircleIcon
    },
    { 
      id: 'branding', 
      label: 'Branding', 
      href: '/settings/branding',
      icon: PhotoIcon
    },
    {
      id: 'admin',
      label: 'Super Admin Console',
      href: '/admin',
      requiresAdmin: true,
      icon: KeyIcon
    },
  ];

  return (
    <div className="mb-8 border-b border-gray-200">
      <nav className="flex space-x-1" aria-label="Settings navigation">
        {tabs.map((tab) => {
          if (tab.requiresAdmin && !isSuperAdmin) return null;
          
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative py-4 px-6 flex items-center transition-all duration-200
                ${isActive 
                  ? 'text-blue-600 bg-blue-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                rounded-t-lg
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {IconComponent && <IconComponent className="w-5 h-5 mr-2" />}
              <span className="font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          );
        })}
      </nav>
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
}> = memo(({ hasChanges, isSaving, onSave, onCancel, onSignOut }) => (
  <div className="flex items-center space-x-3">
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onCancel}
      disabled={isSaving}
      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 
        transition-colors duration-200 font-medium flex items-center"
    >
      <XCircleIcon className="w-5 h-5 mr-2" />
      Cancel
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSave}
      disabled={!hasChanges || isSaving}
      className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium 
        flex items-center ${
          !hasChanges || isSaving
            ? 'bg-blue-300 cursor-not-allowed text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
    >
      {isSaving ? (
        <>
          <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          Save Changes
        </>
      )}
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSignOut}
      className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 
        transition-colors duration-200 font-medium flex items-center"
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      Sign Out
    </motion.button>
  </div>
));

/* --------------------------------------------------
   Sub-Components
----------------------------------------------------- */

// Personal Information Section
const PersonalInfoSection: React.FC<{
  personalInfo: PersonalInfo;
  isEditing: boolean;
  onChange: (field: keyof Omit<PersonalInfo, 'email'>, value: string) => void;
  onToggleEdit: () => void;
}> = memo(({ personalInfo, isEditing, onChange, onToggleEdit }) => (
  <Card>
    <SectionHeader
      icon={UserCircleIcon}
      title="Personal Information"
      description="Manage your personal details and contact information"
    />
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={personalInfo.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-lg border ${
                isEditing
                  ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  : 'border-gray-200 bg-gray-50'
              } transition-colors duration-200`}
              aria-label="First name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surname
            </label>
            <input
              type="text"
              value={personalInfo.surname}
              onChange={(e) => onChange('surname', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-lg border ${
                isEditing
                  ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  : 'border-gray-200 bg-gray-50'
              } transition-colors duration-200`}
              aria-label="Surname"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={personalInfo.email}
              readOnly
              className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50"
              title="Email cannot be changed. Contact support for updates."
              aria-label="Email address (read-only)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={personalInfo.companyName}
              onChange={(e) => onChange('companyName', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-lg border ${
                isEditing
                  ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  : 'border-gray-200 bg-gray-50'
              } transition-colors duration-200`}
              aria-label="Company name"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleEdit}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 
            flex items-center font-medium ${
              isEditing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
        >
          {isEditing ? (
            <>
              <XCircleIcon className="w-5 h-5 mr-2" />
              Cancel Editing
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit Profile
            </>
          )}
        </motion.button>
      </div>
    </div>
  </Card>
));

// Profile Picture Section
const ProfilePictureSection: React.FC<{
  profilePicturePreview: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  error: string;
}> = memo(({ profilePicturePreview, onFileChange, onRemove, error }) => (
  <Card>
    <SectionHeader
      icon={PhotoIcon}
      title="Profile Picture"
      description="Upload or update your profile picture"
    />
    <div className="flex items-center space-x-8">
      <div className="flex-shrink-0">
        {profilePicturePreview ? (
          <div className="relative">
            <img
              src={profilePicturePreview}
              alt="Profile preview"
              className="w-32 h-32 object-cover rounded-full ring-4 ring-blue-50"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1
                hover:bg-red-600 transition-colors duration-200"
              aria-label="Remove profile picture"
            >
              <XCircleIcon className="w-5 h-5" />
            </motion.button>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
            <UserCircleIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-grow">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="profilePicture"
              className="relative cursor-pointer inline-flex items-center px-4 py-2 
                bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                transition-colors duration-200 font-medium group"
            >
              <PhotoIcon className="w-5 h-5 mr-2" />
              <span>Upload New Picture</span>
              <input
                id="profilePicture"
                type="file"
                accept="image/jpeg, image/png"
                onChange={onFileChange}
                className="hidden"
                aria-label="Upload or change profile picture"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">
            Supported formats: JPG, PNG. Maximum file size: 5MB
          </p>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm flex items-center"
            >
              <XCircleIcon className="w-5 h-5 mr-1" />
              {error}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  </Card>
));

// Password Management Section
const PasswordManagementSection: React.FC<{
  passwordState: PasswordState;
  onChange: (field: keyof PasswordState, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  error: string;
  success: string;
}> = memo(({ passwordState, onChange, onSubmit, error, success }) => (
  <Card>
    <SectionHeader
      icon={KeyIcon}
      title="Password Management"
      description="Update your password and security settings"
    />
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            value={passwordState.currentPassword}
            onChange={(e) => onChange('currentPassword', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter current password"
            aria-label="Current password"
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordState.newPassword}
              onChange={(e) => onChange('newPassword', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password"
              aria-label="New password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordState.confirmNewPassword}
              onChange={(e) => onChange('confirmNewPassword', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm new password"
              aria-label="Confirm new password"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Password Requirements
        </h4>
        <ul className="space-y-1 text-sm text-gray-500">
          <li className="flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
            Minimum 8 characters
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
            At least one uppercase letter
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
            At least one number
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
            At least one special character
          </li>
        </ul>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start"
        >
          <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start"
        >
          <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{success}</p>
        </motion.div>
      )}

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={
            !passwordState.currentPassword ||
            !passwordState.newPassword ||
            !passwordState.confirmNewPassword ||
            !validatePassword(passwordState.newPassword)
          }
          className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium
            flex items-center ${
              !passwordState.currentPassword ||
              !passwordState.newPassword ||
              !passwordState.confirmNewPassword ||
              !validatePassword(passwordState.newPassword)
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          <KeyIcon className="w-5 h-5 mr-2" />
          Update Password
        </motion.button>
      </div>
    </form>
  </Card>
));

// Notification Preferences Section
const NotificationPreferencesSection: React.FC<{
  preferences: NotificationPreferences;
  onToggle: (field: keyof NotificationPreferences, value: boolean) => void;
}> = memo(({ preferences, onToggle }) => (
  <Card>
    <SectionHeader
      icon={BellIcon}
      title="Notification Preferences"
      description="Manage your notification and alert settings"
    />
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="flex items-center space-x-3 p-4 bg-gray-50 
            rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.campaignUpdates}
              onChange={(e) => onToggle('campaignUpdates', e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded 
                focus:ring-blue-500 border-gray-300 transition duration-150"
            />
            <div>
              <p className="font-medium text-gray-900">Campaign Updates</p>
              <p className="text-sm text-gray-500">
                Receive updates about your campaign performance
              </p>
            </div>
          </label>
          <label className="flex items-center space-x-3 p-4 bg-gray-50 
            rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.brandHealthAlerts}
              onChange={(e) => onToggle('brandHealthAlerts', e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded 
                focus:ring-blue-500 border-gray-300 transition duration-150"
            />
            <div>
              <p className="font-medium text-gray-900">Brand Health Alerts</p>
              <p className="text-sm text-gray-500">
                Get notified about changes in brand health metrics
              </p>
            </div>
          </label>
        </div>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 p-4 bg-gray-50 
            rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.aiInsightNotifications}
              onChange={(e) => onToggle('aiInsightNotifications', e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded 
                focus:ring-blue-500 border-gray-300 transition duration-150"
            />
            <div>
              <p className="font-medium text-gray-900">AI Insights</p>
              <p className="text-sm text-gray-500">
                Receive AI-powered insights and recommendations
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  </Card>
));

/* --------------------------------------------------
   Main Profile Settings Page Component
----------------------------------------------------- */
const ProfileSettingsPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading, error } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Personal Information state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: 'Ed',
    surname: 'Addams',
    companyName: 'The Write Company',
    email: 'edaddams@domain.com',
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
    confirmNewPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Notification Preferences state
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    campaignUpdates: false,
    brandHealthAlerts: false,
    aiInsightNotifications: false,
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

  const handlePersonalInfoChange = useCallback(
    (field: keyof Omit<PersonalInfo, 'email'>, value: string) => {
      setPersonalInfo((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleEditing = useCallback(() => setIsEditing((prev) => !prev), []);

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

  const handlePasswordChange = useCallback(
    (field: keyof PasswordState, value: string) => {
      setPasswordState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handlePasswordSubmit = useCallback(
    (e: FormEvent) => {
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
        confirmNewPassword: '',
      });
    },
    [passwordState]
  );

  const handleTogglePreference = useCallback(
    (field: keyof NotificationPreferences, value: boolean) => {
      setPreferences((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const markChanges = useCallback(() => setHasChanges(true), []);

  const handlePersonalInfoChangeWithMark = useCallback(
    (field: keyof Omit<PersonalInfo, 'email'>, value: string) => {
      handlePersonalInfoChange(field, value);
      markChanges();
    },
    [handlePersonalInfoChange, markChanges]
  );

  const handleTogglePreferenceWithMark = useCallback(
    (field: keyof NotificationPreferences, value: boolean) => {
      handleTogglePreference(field, value);
      markChanges();
    },
    [handleTogglePreference, markChanges]
  );

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
      email: 'edaddams@domain.com',
    });
    setIsEditing(false);
    setProfilePicture(null);
    setProfilePicturePreview('');
    setPreferences({
      campaignUpdates: false,
      brandHealthAlerts: false,
      aiInsightNotifications: false,
    });
    setHasChanges(false);
  }, []);

  const handleSignOut = useCallback(() => {
    window.location.href = '/api/auth/logout';
  }, []);

  // Render loading state
  if (isLoading || isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 animate-pulse">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-800 rounded-xl p-6 max-w-md w-full 
            shadow-lg flex items-center"
        >
          <XCircleIcon className="w-12 h-12 text-red-400 mr-4" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Access Error</h3>
            <p className="text-red-600">
              {error?.message || 'Please log in to access settings'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-red-700 hover:text-red-800 font-medium 
                flex items-center"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Retry
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900"
            >
              Settings
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-gray-500"
            >
              Manage your account settings and preferences
            </motion.p>
          </div>
          <ActionButtons
            hasChanges={hasChanges}
            isSaving={isSaving}
            onSave={handleSaveChanges}
            onCancel={handleCancel}
            onSignOut={handleSignOut}
          />
        </div>

        {/* Navigation */}
        <NavigationTabs
          activeTab={activeTab}
          isSuperAdmin={isSuperAdmin}
          onTabChange={handleTabChange}
        />

        {/* Main Content */}
        <div className="space-y-8">
          <PersonalInfoSection
            personalInfo={personalInfo}
            isEditing={isEditing}
            onChange={handlePersonalInfoChangeWithMark}
            onToggleEdit={toggleEditing}
          />

          <ProfilePictureSection
            profilePicturePreview={profilePicturePreview}
            onFileChange={(e) => {
              handleProfilePictureChange(e);
              markChanges();
            }}
            onRemove={() => {
              removeProfilePicture();
              markChanges();
            }}
            error={profilePictureError}
          />

          <PasswordManagementSection
            passwordState={passwordState}
            onChange={handlePasswordChange}
            onSubmit={handlePasswordSubmit}
            error={passwordError}
            success={passwordSuccess}
          />

          <NotificationPreferencesSection
            preferences={preferences}
            onToggle={handleTogglePreferenceWithMark}
          />

          {/* Debug Information (only visible in development) */}
          {process.env.NODE_ENV === 'development' && (
            <motion.details
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8"
            >
              <summary className="cursor-pointer text-sm text-gray-500 
                hover:text-gray-700 transition-colors duration-200">
                Debug Information
              </summary>
              <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-auto">
                <pre className="text-xs text-gray-300">
                  {JSON.stringify(
                    {
                      user: {
                        email: user.email,
                        name: user.name,
                        isSuperAdmin,
                      },
                      auth: {
                        isAuthenticated: !!user,
                        lastChecked: new Date().toISOString(),
                      },
                      state: {
                        activeTab,
                        hasChanges,
                        isSaving,
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </motion.details>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettingsPage;
