import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrandingPage from '@/app/settings/branding/page';

// Mock the API modules
jest.mock('@/lib/api', () => ({
  getBrandingSettings: jest.fn().mockResolvedValue({
    primaryColor: '#333333',
    secondaryColor: '#4A5568',
    accentColor: '#00BFFF',
    headerFont: 'Inter',
    bodyFont: 'Roboto',
    logoUrl: 'https://example.com/logo.png',
  }),
  updateBrandingSettings: jest.fn().mockResolvedValue({ 
    success: true,
    data: {
      primaryColor: '#222222',
      secondaryColor: '#4A5568',
      accentColor: '#0099FF',
      headerFont: 'Montserrat',
      bodyFont: 'Roboto',
      logoUrl: 'https://example.com/logo.png',
    }
  }),
  uploadBrandLogo: jest.fn().mockResolvedValue({
    success: true,
    data: {
      logoUrl: 'https://example.com/new-logo.png'
    }
  }),
  removeBrandLogo: jest.fn().mockResolvedValue({
    success: true,
    data: {
      logoUrl: null
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
  usePathname: () => '/settings/branding',
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

describe('BrandingPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders branding page with settings when data is loaded', async () => {
    render(<BrandingPage />);
    
    // Initially should show loading state
    expect(screen.getByTestId('branding-loading')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('branding-loading')).not.toBeInTheDocument();
    });
    
    // Should render color settings
    expect(screen.getByText('Brand Colors')).toBeInTheDocument();
    expect(screen.getByLabelText('Primary Color')).toHaveValue('#333333');
    expect(screen.getByLabelText('Accent Color')).toHaveValue('#00BFFF');
    
    // Should render typography settings
    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByLabelText('Header Font')).toHaveValue('Inter');
    expect(screen.getByLabelText('Body Font')).toHaveValue('Roboto');
    
    // Should render logo section
    expect(screen.getByText('Brand Logo')).toBeInTheDocument();
    expect(screen.getByAltText('Current brand logo')).toHaveAttribute('src', 'https://example.com/logo.png');
  });
  
  test('can update branding colors and typography', async () => {
    const { updateBrandingSettings } = require('@/lib/api');
    render(<BrandingPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('branding-loading')).not.toBeInTheDocument();
    });
    
    // Find and click edit button
    const editButton = screen.getByText('Edit Branding');
    fireEvent.click(editButton);
    
    // Update color fields
    const primaryColorInput = screen.getByLabelText('Primary Color');
    const accentColorInput = screen.getByLabelText('Accent Color');
    fireEvent.change(primaryColorInput, { target: { value: '#222222' } });
    fireEvent.change(accentColorInput, { target: { value: '#0099FF' } });
    
    // Update typography fields
    const headerFontInput = screen.getByLabelText('Header Font');
    fireEvent.change(headerFontInput, { target: { value: 'Montserrat' } });
    
    // Click save
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Verify API was called with updated data
    await waitFor(() => {
      expect(updateBrandingSettings).toHaveBeenCalledWith({
        primaryColor: '#222222',
        secondaryColor: '#4A5568',
        accentColor: '#0099FF',
        headerFont: 'Montserrat',
        bodyFont: 'Roboto',
        logoUrl: 'https://example.com/logo.png',
      });
    });
    
    // Should show success message
    expect(screen.getByText('Branding settings updated successfully')).toBeInTheDocument();
  });
  
  test('can upload a new brand logo', async () => {
    const { uploadBrandLogo } = require('@/lib/api');
    render(<BrandingPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('branding-loading')).not.toBeInTheDocument();
    });
    
    // Find and click edit button
    const editButton = screen.getByText('Edit Branding');
    fireEvent.click(editButton);
    
    // Mock file upload
    const file = new File(['dummy content'], 'logo.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('logo-upload-input');
    
    // Trigger file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Click upload button
    const uploadButton = screen.getByText('Upload Logo');
    fireEvent.click(uploadButton);
    
    // Verify API was called with the file
    await waitFor(() => {
      expect(uploadBrandLogo).toHaveBeenCalled();
    });
    
    // Should show success message
    expect(screen.getByText('Logo uploaded successfully')).toBeInTheDocument();
  });
  
  test('can remove the brand logo', async () => {
    const { removeBrandLogo } = require('@/lib/api');
    render(<BrandingPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('branding-loading')).not.toBeInTheDocument();
    });
    
    // Find and click edit button
    const editButton = screen.getByText('Edit Branding');
    fireEvent.click(editButton);
    
    // Click remove logo button
    const removeButton = screen.getByText('Remove Logo');
    fireEvent.click(removeButton);
    
    // Confirm removal in the dialog
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    // Verify API was called
    await waitFor(() => {
      expect(removeBrandLogo).toHaveBeenCalled();
    });
    
    // Should show success message
    expect(screen.getByText('Logo removed successfully')).toBeInTheDocument();
  });
}); 