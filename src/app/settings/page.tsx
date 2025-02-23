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
   Sub-Components
----------------------------------------------------- */

// Personal Information Section
const PersonalInfoSection: React.FC<{
  personalInfo: PersonalInfo;
  isEditing: boolean;
  onChange: (field: keyof Omit<PersonalInfo, 'email'>, value: string) => void;
  onToggleEdit: () => void;
}> = memo(({ personalInfo, isEditing, onChange, onToggleEdit }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <label className="w-32">Firstname:</label>
          <input
            type="text"
            value={personalInfo.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            disabled={!isEditing}
            className="border p-2 w-64"
            aria-label="Firstname"
          />
        </div>
        <div className="flex items-center">
          <label className="w-32">Surname:</label>
          <input
            type="text"
            value={personalInfo.surname}
            onChange={(e) => onChange('surname', e.target.value)}
            disabled={!isEditing}
            className="border p-2 w-64"
            aria-label="Surname"
          />
        </div>
        <div className="flex items-center">
          <label className="w-32">Email:</label>
          <input
            type="email"
            value={personalInfo.email}
            readOnly
            className="border p-2 w-64 bg-gray-100"
            title="Email cannot be changed. Contact support for updates."
            aria-label="Email address (read-only)"
          />
        </div>
        <div className="flex items-center">
          <label className="w-32">Company Name:</label>
          <input
            type="text"
            value={personalInfo.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            disabled={!isEditing}
            className="border p-2 w-64"
            aria-label="Company Name"
          />
        </div>
        <button
          onClick={onToggleEdit}
          className="text-blue-500 underline"
          aria-label="Edit profile settings"
        >
          {isEditing ? 'Stop Editing' : 'Edit'}
        </button>
      </div>
    </section>
  );
});

// Profile Picture Section
const ProfilePictureSection: React.FC<{
  profilePicturePreview: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  error: string;
}> = memo(({ profilePicturePreview, onFileChange, onRemove, error }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
      <div className="space-y-4">
        {profilePicturePreview && (
          <div>
            <img
              src={profilePicturePreview}
              alt="Profile preview"
              className="w-20 h-20 object-cover rounded-full"
            />
          </div>
        )}
        <div>
          <label
            htmlFor="profilePicture"
            className="cursor-pointer inline-block bg-blue-500 text-white py-2 px-4 rounded"
          >
            Upload or Change
          </label>
          <input
            id="profilePicture"
            type="file"
            accept="image/jpeg, image/png"
            onChange={onFileChange}
            className="hidden"
            aria-label="Upload or change profile picture"
          />
        </div>
        {profilePicturePreview && (
          <button
            onClick={onRemove}
            className="text-red-500 underline"
            aria-label="Remove Profile Picture"
          >
            Remove Profile Picture
          </button>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </section>
  );
});

// Password Management Section
const PasswordManagementSection: React.FC<{
  passwordState: PasswordState;
  onChange: (field: keyof PasswordState, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  error: string;
  success: string;
}> = memo(({ passwordState, onChange, onSubmit, error, success }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Password Management</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center">
          <label className="w-40">Current Password:</label>
          <input
            type="password"
            value={passwordState.currentPassword}
            onChange={(e) => onChange('currentPassword', e.target.value)}
            placeholder="*****************"
            className="border p-2 w-64"
            aria-label="Current Password"
          />
        </div>
        <div className="flex items-center">
          <label className="w-40">New Password:</label>
          <input
            type="password"
            value={passwordState.newPassword}
            onChange={(e) => onChange('newPassword', e.target.value)}
            placeholder="Enter new password"
            className="border p-2 w-64"
            aria-label="New Password"
          />
        </div>
        <div className="flex items-center">
          <label className="w-40">Confirm New Password:</label>
          <input
            type="password"
            value={passwordState.confirmNewPassword}
            onChange={(e) => onChange('confirmNewPassword', e.target.value)}
            placeholder="Re-enter new password"
            className="border p-2 w-64"
            aria-label="Confirm New Password"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <button
          type="submit"
          disabled={
            !passwordState.currentPassword ||
            !passwordState.newPassword ||
            !passwordState.confirmNewPassword ||
            !validatePassword(passwordState.newPassword)
          }
          className={`w-40 h-10 rounded text-white ${
            !passwordState.currentPassword ||
            !passwordState.newPassword ||
            !passwordState.confirmNewPassword ||
            !validatePassword(passwordState.newPassword)
              ? 'bg-blue-300'
              : 'bg-blue-500'
          }`}
          aria-label="Change password"
        >
          Change Password
        </button>
      </form>
    </section>
  );
});

// Notification Preferences Section
const NotificationPreferencesSection: React.FC<{
  preferences: NotificationPreferences;
  onToggle: (field: keyof NotificationPreferences, value: boolean) => void;
}> = memo(({ preferences, onToggle }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
      <div className="space-y-2">
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={preferences.campaignUpdates}
              onChange={(e) => onToggle('campaignUpdates', e.target.checked)}
              className="form-checkbox"
              aria-label="Toggle campaign update notifications"
            />
            <span className="ml-2">Campaign Updates</span>
          </label>
        </div>
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={preferences.brandHealthAlerts}
              onChange={(e) => onToggle('brandHealthAlerts', e.target.checked)}
              className="form-checkbox"
              aria-label="Toggle brand health alerts"
            />
            <span className="ml-2">Brand Health Alerts</span>
          </label>
        </div>
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={preferences.aiInsightNotifications}
              onChange={(e) => onToggle('aiInsightNotifications', e.target.checked)}
              className="form-checkbox"
              aria-label="Toggle AI insight notifications"
            />
            <span className="ml-2">AI Insight Notifications</span>
          </label>
        </div>
      </div>
    </section>
  );
});

/* --------------------------------------------------
   Main Profile Settings Page Component
----------------------------------------------------- */
const ProfileSettingsPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const response = await fetch('/api/auth/verify-role');
        if (!response.ok) {
          throw new Error('Failed to verify role');
        }
        const data = await response.json();
        setIsSuperAdmin(data?.user?.isSuperAdmin || false);
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      }
    };

    if (user) {
      checkSuperAdmin();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-50 text-yellow-800 rounded-lg p-4">
          Please log in to access settings
        </div>
      </div>
    );
  }

  // Personal Information state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: 'Ed',
    surname: 'Addams',
    companyName: 'The Write Company',
    email: 'edaddams@domain.com',
  });
  const [isEditing, setIsEditing] = useState(false);

  const handlePersonalInfoChange = useCallback(
    (field: keyof Omit<PersonalInfo, 'email'>, value: string) => {
      setPersonalInfo((prev) => ({ ...prev, [field]: value }));
    },
    []
  );
  const toggleEditing = useCallback(() => setIsEditing((prev) => !prev), []);

  // Profile Picture state
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [profilePictureError, setProfilePictureError] = useState('');

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

  // Password Management state
  const [passwordState, setPasswordState] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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

  // Notification Preferences state
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    campaignUpdates: false,
    brandHealthAlerts: false,
    aiInsightNotifications: false,
  });

  const handleTogglePreference = useCallback(
    (field: keyof NotificationPreferences, value: boolean) => {
      setPreferences((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Save and Cancel state
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

  // Add handleSignOut function
  const handleSignOut = useCallback(() => {
    window.location.href = '/api/auth/logout';
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-gray-900">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{user.email}</p>
          </div>
          {isSuperAdmin && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">Super Admin Access</h3>
              <p className="mt-1 text-blue-600">
                You have super administrator privileges
              </p>
              <a 
                href="/admin"
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Admin Dashboard
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Status</label>
            <p className="mt-1 text-green-600">Active</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Login</label>
            <p className="mt-1 text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      <details className="mt-8 bg-white rounded-lg shadow-sm">
        <summary className="cursor-pointer bg-gray-50 px-6 py-3 text-lg font-medium text-gray-700 hover:bg-gray-100">
          Debug Information
        </summary>
        <div className="p-6">
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify({
              user: {
                email: user.email,
                name: user.name,
                isSuperAdmin
              },
              auth: {
                isAuthenticated: !!user,
                lastChecked: new Date().toISOString()
              }
            }, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
};

export default ProfileSettingsPage;
