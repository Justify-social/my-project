import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileSettingsPage from '@/app/settings/profile-settings/page';

// Mock the API modules
jest.mock('@/lib/api', () => ({
  getUserProfile: jest.fn().mockResolvedValue({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    location: 'New York, NY'
  }),
  updateUserProfile: jest.fn().mockResolvedValue({
    success: true,
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      jobTitle: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA'
    }
  }),
  changePassword: jest.fn().mockResolvedValue({ success: true }),
  getNotificationPreferences: jest.fn().mockResolvedValue({
    campaignUpdates: true,
    brandHealthAlerts: false,
    aiInsightNotifications: true
  }),
  updateNotificationPreferences: jest.fn().mockResolvedValue({
    success: true,
    data: {
      campaignUpdates: false,
      brandHealthAlerts: true,
      aiInsightNotifications: true
    }
  }),
  uploadProfilePicture: jest.fn().mockResolvedValue({
    success: true,
    data: {
      profilePictureUrl: 'https://example.com/updated-profile.jpg'
    }
  }),
  removeProfilePicture: jest.fn().mockResolvedValue({
    success: true,
    data: {
      profilePictureUrl: null
    }
  })
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/settings/profile-settings',
}));

// Mock the framer-motion animation library
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('ProfileSettingsPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders profile settings sections when data is loaded', async () => {
    render(<ProfileSettingsPage />);
    
    // Initially should show loading state
    expect(screen.getByTestId('profile-settings-loading')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('profile-settings-loading')).not.toBeInTheDocument();
    });
    
    // Should render all sections
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Password Management')).toBeInTheDocument();
    expect(screen.getByText('Profile Picture')).toBeInTheDocument();
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
  });
  
  test('personal info update flows through to the API', async () => {
    const { getUserProfile, updateUserProfile } = require('@/lib/api');
    render(<ProfileSettingsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('profile-settings-loading')).not.toBeInTheDocument();
    });
    
    // Find and click edit button in personal info section
    const personalInfoSection = screen.getByText('Personal Information').closest('div').parentElement;
    const editButton = within(personalInfoSection).getByText('Edit');
    fireEvent.click(editButton);
    
    // Update fields
    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    
    // Click save
    const saveButton = within(personalInfoSection).getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Verify API was called with updated data
    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        location: 'New York, NY'
      });
    });
    
    // Should show success message
    expect(screen.getByText('Personal information updated successfully')).toBeInTheDocument();
  });
  
  test('password change flows through to the API', async () => {
    const { changePassword } = require('@/lib/api');
    render(<ProfileSettingsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('profile-settings-loading')).not.toBeInTheDocument();
    });
    
    // Find and click edit button in password section
    const passwordSection = screen.getByText('Password Management').closest('div').parentElement;
    const editButton = within(passwordSection).getByText('Edit');
    fireEvent.click(editButton);
    
    // Fill in password fields
    const currentPasswordField = screen.getByLabelText(/Current Password/i);
    const newPasswordField = screen.getByLabelText(/New Password/i);
    const confirmPasswordField = screen.getByLabelText(/Confirm New Password/i);
    
    fireEvent.change(currentPasswordField, { target: { value: 'oldpassword' } });
    fireEvent.change(newPasswordField, { target: { value: 'StrongP@ssw0rd' } });
    fireEvent.change(confirmPasswordField, { target: { value: 'StrongP@ssw0rd' } });
    
    // Click save
    const saveButton = within(passwordSection).getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Verify API was called with correct data
    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        currentPassword: 'oldpassword',
        newPassword: 'StrongP@ssw0rd',
        confirmPassword: 'StrongP@ssw0rd'
      });
    });
  });
  
  test('notification preferences update flows through to the API', async () => {
    const { updateNotificationPreferences } = require('@/lib/api');
    render(<ProfileSettingsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('profile-settings-loading')).not.toBeInTheDocument();
    });
    
    // Find and click edit button in notifications section
    const notificationsSection = screen.getByText('Notification Preferences').closest('div').parentElement;
    const editButton = within(notificationsSection).getByText('Edit');
    fireEvent.click(editButton);
    
    // Toggle some preferences
    const toggles = screen.getAllByRole('switch');
    fireEvent.click(toggles[0]); // Toggle campaignUpdates from true to false
    fireEvent.click(toggles[1]); // Toggle brandHealthAlerts from false to true
    
    // Click save
    const saveButton = within(notificationsSection).getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Verify API was called with updated preferences
    await waitFor(() => {
      expect(updateNotificationPreferences).toHaveBeenCalledWith({
        campaignUpdates: false,
        brandHealthAlerts: true,
        aiInsightNotifications: true
      });
    });
  });
  
  test('profile picture update flows through to the API', async () => {
    const { uploadProfilePicture } = require('@/lib/api');
    render(<ProfileSettingsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('profile-settings-loading')).not.toBeInTheDocument();
    });
    
    // Find and click edit button in profile picture section
    const pictureSection = screen.getByText('Profile Picture').closest('div').parentElement;
    const editButton = within(pictureSection).getByText('Edit');
    fireEvent.click(editButton);
    
    // Mock file upload
    const file = new File(['dummy content'], 'profile.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('profile-picture-input');
    
    // Trigger file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Click upload button
    const uploadButton = within(pictureSection).getByText('Upload Picture');
    fireEvent.click(uploadButton);
    
    // Verify API was called with the file
    await waitFor(() => {
      expect(uploadProfilePicture).toHaveBeenCalled();
    });
    
    // Should show success message
    expect(screen.getByText('Profile picture updated successfully')).toBeInTheDocument();
  });
  
  test('removing profile picture flows through to the API', async () => {
    const { removeProfilePicture } = require('@/lib/api');
    render(<ProfileSettingsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('profile-settings-loading')).not.toBeInTheDocument();
    });
    
    // Find and click edit button in profile picture section
    const pictureSection = screen.getByText('Profile Picture').closest('div').parentElement;
    const editButton = within(pictureSection).getByText('Edit');
    fireEvent.click(editButton);
    
    // Click remove button
    const removeButton = within(pictureSection).getByText('Remove Picture');
    fireEvent.click(removeButton);
    
    // Confirm removal in the dialog
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    // Verify API was called
    await waitFor(() => {
      expect(removeProfilePicture).toHaveBeenCalled();
    });
    
    // Should show success message
    expect(screen.getByText('Profile picture removed successfully')).toBeInTheDocument();
  });
}); 