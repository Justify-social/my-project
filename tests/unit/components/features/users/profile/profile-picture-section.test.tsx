import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePictureSection from '@/src/components/features/users/profile/ProfilePictureSection';

// Mock the framer-motion animation library
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('ProfilePictureSection', () => {
  const mockCurrentImageUrl = 'https://example.com/profile.jpg';
  const mockOnSave = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnSave.mockClear();
    
    // Mock file URL creation
    URL.createObjectURL = jest.fn(() => 'mock-url');
    URL.revokeObjectURL = jest.fn();
  });

  test('renders with current image correctly', () => {
    render(
      <ProfilePictureSection
        currentImageUrl={mockCurrentImageUrl}
        onSave={mockOnSave}
      />
    );

    // Check if the section is rendered with the correct title
    expect(screen.getByText('Profile Picture')).toBeInTheDocument();

    // Check if the current image is displayed
    const image = screen.getByAltText('Profile Picture');
    expect(image).toBeInTheDocument();
    expect(image.getAttribute('src')).toBe(mockCurrentImageUrl);

    // Check if buttons are present
    expect(screen.getByText('Change Picture')).toBeInTheDocument();
    expect(screen.getByText('Remove Picture')).toBeInTheDocument();
  });

  test('renders without image correctly', () => {
    render(
      <ProfilePictureSection
        currentImageUrl={null}
        onSave={mockOnSave}
      />
    );

    // Check if the default avatar is shown when no image is provided
    expect(screen.queryByAltText('Profile Picture')).not.toBeInTheDocument();
    expect(screen.getByTestId('default-avatar')).toBeInTheDocument();

    // Check if only upload button is available
    expect(screen.getByText('Upload Picture')).toBeInTheDocument();
    expect(screen.queryByText('Remove Picture')).not.toBeInTheDocument();
  });

  test('handles file selection correctly', async () => {
    render(
      <ProfilePictureSection
        currentImageUrl={mockCurrentImageUrl}
        onSave={mockOnSave}
      />
    );

    // Create a mock file
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    
    // Get the hidden file input
    const input = screen.getByTestId('file-input');
    
    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });
    
    // Check if preview is updated
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    
    // Check if save button appears
    await waitFor(() => {
      expect(screen.getByText('Save Picture')).toBeInTheDocument();
    });
    
    // Click save button
    fireEvent.click(screen.getByText('Save Picture'));
    
    // Check if onSave was called with the file
    expect(mockOnSave).toHaveBeenCalledWith(file, false);
  });

  test('handles image removal correctly', async () => {
    render(
      <ProfilePictureSection
        currentImageUrl={mockCurrentImageUrl}
        onSave={mockOnSave}
      />
    );

    // Click remove button
    fireEvent.click(screen.getByText('Remove Picture'));
    
    // Check if confirmation dialog appears
    expect(screen.getByText('Remove Profile Picture?')).toBeInTheDocument();
    
    // Confirm removal
    fireEvent.click(screen.getByText('Yes, Remove'));
    
    // Check if onSave was called with null and removal flag
    expect(mockOnSave).toHaveBeenCalledWith(null, true);
  });

  test('cancels image removal when cancel is clicked', () => {
    render(
      <ProfilePictureSection
        currentImageUrl={mockCurrentImageUrl}
        onSave={mockOnSave}
      />
    );

    // Click remove button
    fireEvent.click(screen.getByText('Remove Picture'));
    
    // Check if confirmation dialog appears
    expect(screen.getByText('Remove Profile Picture?')).toBeInTheDocument();
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check if dialog is closed and onSave was not called
    expect(screen.queryByText('Remove Profile Picture?')).not.toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('displays error message when save fails', async () => {
    const mockFailedSave = jest.fn().mockRejectedValue(new Error('Failed to save'));
    
    render(
      <ProfilePictureSection
        currentImageUrl={mockCurrentImageUrl}
        onSave={mockFailedSave}
      />
    );

    // Create a mock file
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    
    // Get the hidden file input
    const input = screen.getByTestId('file-input');
    
    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });
    
    // Click save button
    await waitFor(() => {
      fireEvent.click(screen.getByText('Save Picture'));
    });
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to update profile picture. Please try again.')).toBeInTheDocument();
    });
  });

  test('validates file type', async () => {
    render(
      <ProfilePictureSection
        currentImageUrl={mockCurrentImageUrl}
        onSave={mockOnSave}
      />
    );

    // Create a mock file with invalid type
    const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });
    
    // Get the hidden file input
    const input = screen.getByTestId('file-input');
    
    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Invalid file type. Please upload an image (JPEG, PNG, or GIF).')).toBeInTheDocument();
    });
    
    // Check if onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('validates file size', async () => {
    render(
      <ProfilePictureSection
        currentImageUrl={mockCurrentImageUrl}
        onSave={mockOnSave}
      />
    );

    // Create a mock file that exceeds the size limit
    // Since we can't easily create a large file, we'll mock the size property
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB
    
    // Get the hidden file input
    const input = screen.getByTestId('file-input');
    
    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('File size exceeds 5MB limit.')).toBeInTheDocument();
    });
    
    // Check if onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });
}); 