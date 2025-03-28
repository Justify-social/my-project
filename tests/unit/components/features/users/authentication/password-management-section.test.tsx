import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordManagementSection from '@/src/components/features/users/authentication/PasswordManagementSection';

// Mock the framer-motion animation library
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('PasswordManagementSection', () => {
  const mockOnSave = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  test('renders section correctly', () => {
    render(<PasswordManagementSection onSave={mockOnSave} />);

    // Check if the section is rendered with the correct title
    expect(screen.getByText('Password Management')).toBeInTheDocument();

    // Check if form fields are rendered
    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();

    // Check if the form is not in edit mode initially
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  test('enters edit mode when Edit button is clicked', () => {
    render(<PasswordManagementSection onSave={mockOnSave} />);

    // Click the Edit button
    fireEvent.click(screen.getByText('Edit'));

    // Check if the form is now in edit mode
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    
    // Check if form fields are enabled
    expect(screen.getByLabelText(/Current Password/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/New Password/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/Confirm New Password/i)).not.toBeDisabled();
  });

  test('toggles password visibility', () => {
    render(<PasswordManagementSection onSave={mockOnSave} />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Find password fields and toggle buttons
    const currentPasswordField = screen.getByLabelText(/Current Password/i);
    const newPasswordField = screen.getByLabelText(/New Password/i);
    const confirmPasswordField = screen.getByLabelText(/Confirm New Password/i);
    
    // Initially all fields should be of type 'password'
    expect(currentPasswordField.getAttribute('type')).toBe('password');
    expect(newPasswordField.getAttribute('type')).toBe('password');
    expect(confirmPasswordField.getAttribute('type')).toBe('password');
    
    // Toggle password visibility for current password
    const toggleButtons = screen.getAllByTitle('Toggle password visibility');
    fireEvent.click(toggleButtons[0]);
    
    // Current password field should now be of type 'text'
    expect(currentPasswordField.getAttribute('type')).toBe('text');
    
    // New password and confirm fields should still be of type 'password'
    expect(newPasswordField.getAttribute('type')).toBe('password');
    expect(confirmPasswordField.getAttribute('type')).toBe('password');
  });

  test('exits edit mode when Cancel button is clicked', () => {
    render(<PasswordManagementSection onSave={mockOnSave} />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Fill in the fields
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpassword' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'newpassword' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newpassword' } });
    
    // Click the Cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Check if the form is back to view mode
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    
    // Check if form fields are cleared
    expect(screen.getByLabelText(/Current Password/i).getAttribute('value')).toBe('');
    expect(screen.getByLabelText(/New Password/i).getAttribute('value')).toBe('');
    expect(screen.getByLabelText(/Confirm New Password/i).getAttribute('value')).toBe('');
  });

  test('calls onSave with password data when Save button is clicked', async () => {
    render(<PasswordManagementSection onSave={mockOnSave} />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Fill in the fields
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpassword' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'StrongP@ssw0rd' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'StrongP@ssw0rd' } });
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if onSave was called with the correct data
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        currentPassword: 'oldpassword',
        newPassword: 'StrongP@ssw0rd',
        confirmPassword: 'StrongP@ssw0rd'
      });
    });

    // Check if the form is back to view mode and fields are cleared
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByLabelText(/Current Password/i).getAttribute('value')).toBe('');
    });
  });

  test('validates required fields', async () => {
    render(<PasswordManagementSection onSave={mockOnSave} />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Click the Save button without filling in any fields
    fireEvent.click(screen.getByText('Save'));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText('Current password is required')).toBeInTheDocument();
      expect(screen.getByText('New password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your new password')).toBeInTheDocument();
    });
    
    // Check if onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('validates password matching', async () => {
    render(<PasswordManagementSection onSave={mockOnSave} />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Fill in fields with non-matching passwords
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpassword' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'newpassword1' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newpassword2' } });
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    
    // Check if onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('validates password strength', async () => {
    render(<PasswordManagementSection onSave={mockOnSave} />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Fill in fields with a weak password
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpassword' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'weak' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'weak' } });
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
    
    // Check if onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('displays password strength indicator', () => {
    render(<PasswordManagementSection onSave={mockOnSave} />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Enter a weak password
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'weak' } });
    
    // Check if the weak indicator is shown
    expect(screen.getByText('Weak')).toBeInTheDocument();
    
    // Enter a stronger password
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'StrongP@ssw0rd' } });
    
    // Check if the strong indicator is shown
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  test('displays error message when save fails', async () => {
    const mockFailedSave = jest.fn().mockRejectedValue(new Error('Failed to save'));
    
    render(<PasswordManagementSection onSave={mockFailedSave} />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Fill in the fields with valid data
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpassword' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'StrongP@ssw0rd' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'StrongP@ssw0rd' } });
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to change password. Please try again.')).toBeInTheDocument();
    });
  });
}); 