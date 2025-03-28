import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PersonalInfoSection from '@/src/components/features/users/profile/PersonalInfoSection';

// Mock the framer-motion animation library
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('PersonalInfoSection', () => {
  const mockUserProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    location: 'New York, NY'
  };

  const mockOnSave = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  test('renders with initial data correctly', () => {
    render(
      <PersonalInfoSection
        initialData={mockUserProfile}
        onSave={mockOnSave}
      />
    );

    // Check if the section is rendered with the correct title
    expect(screen.getByText('Personal Information')).toBeInTheDocument();

    // Check if form fields have the correct initial values
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Engineering')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New York, NY')).toBeInTheDocument();

    // Check if the form is not in edit mode initially
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  test('enters edit mode when Edit button is clicked', () => {
    render(
      <PersonalInfoSection
        initialData={mockUserProfile}
        onSave={mockOnSave}
      />
    );

    // Click the Edit button
    fireEvent.click(screen.getByText('Edit'));

    // Check if the form is now in edit mode
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    
    // Check if form fields are enabled
    expect(screen.getByLabelText(/First Name/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/Last Name/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/Email/i)).not.toBeDisabled();
  });

  test('exits edit mode when Cancel button is clicked', () => {
    render(
      <PersonalInfoSection
        initialData={mockUserProfile}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Modify a field
    const firstNameInput = screen.getByLabelText(/First Name/i);
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    
    // Click the Cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Check if the form is back to view mode
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    
    // Check if form values are reset to initial values
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Jane')).not.toBeInTheDocument();
  });

  test('calls onSave with updated data when Save button is clicked', async () => {
    render(
      <PersonalInfoSection
        initialData={mockUserProfile}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Modify fields
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Smith' } });
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if onSave was called with the updated data
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        location: 'New York, NY'
      });
    });

    // Check if the form is back to view mode after saving
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  test('displays validation errors when fields are empty', async () => {
    render(
      <PersonalInfoSection
        initialData={mockUserProfile}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Clear required fields
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: '' } });
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    
    // Check if onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('validates email format', async () => {
    render(
      <PersonalInfoSection
        initialData={mockUserProfile}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Enter invalid email
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } });
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
    
    // Check if onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('displays error message when save fails', async () => {
    const mockFailedSave = jest.fn().mockRejectedValue(new Error('Failed to save'));
    
    render(
      <PersonalInfoSection
        initialData={mockUserProfile}
        onSave={mockFailedSave}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to save profile. Please try again.')).toBeInTheDocument();
    });
  });
}); 