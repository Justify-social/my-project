"use client";

import React, { useState, useEffect } from 'react';
import BrandingSettings from '../../../lib/db';
import File from '../../../app/api/uploadthing/core';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion } from 'framer-motion';
import Card from '@/components/settings/shared/Card';
import SectionHeader from '@/components/settings/shared/SectionHeader';
import ActionButtons from '@/components/settings/shared/ActionButtons';
import ColorPickerField from '@/src/components/features/settings/branding/ColorPickerField';
import FontSelector from '@/src/components/features/settings/branding/FontSelector';
import FileUpload from '@/src/components/features/settings/branding/FileUpload';
import BrandingSkeleton from '@/src/components/features/settings/branding/BrandingSkeleton';

// Available font options
const fontOptions = [
  { name: 'Work Sans', value: 'Work Sans' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Poppins', value: 'Poppins' }
];

// Available font size options
const fontSizeOptions = [
  { name: '12px', value: '12px' },
  { name: '14px', value: '14px' },
  { name: '16px', value: '16px' },
  { name: '18px', value: '18px' },
  { name: '20px', value: '20px' },
  { name: '22px', value: '22px' },
  { name: '24px', value: '24px' }
];

// Branding settings interface
interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  headerFont: string;
  headerFontSize: string;
  bodyFont: string;
  bodyFontSize: string;
  logoUrl: string | null;
}

export default function BrandingPage() {
  // User authentication state
  const { user, isLoading: isUserLoading } = useUser();
  
  // Default branding settings
  const defaultSettings: BrandingSettings = {
    primaryColor: '#00BFFF',
    secondaryColor: '#4A5568',
    headerFont: 'Work Sans',
    headerFontSize: '18px',
    bodyFont: 'Work Sans',
    bodyFontSize: '14px',
    logoUrl: null
  };
  
  // UI state
  const [settings, setSettings] = useState<BrandingSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<BrandingSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  
  // Fetch branding settings on component mount
  useEffect(() => {
    fetchBrandingSettings();
  }, []);
  
  // Show success message temporarily
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // Check for changes
  useEffect(() => {
    if (!originalSettings) return;
    
    const hasColorChanges = settings.primaryColor !== originalSettings.primaryColor || 
                           settings.secondaryColor !== originalSettings.secondaryColor;
    
    const hasFontChanges = settings.headerFont !== originalSettings.headerFont ||
                          settings.headerFontSize !== originalSettings.headerFontSize ||
                          settings.bodyFont !== originalSettings.bodyFont ||
                          settings.bodyFontSize !== originalSettings.bodyFontSize;
    
    const hasLogoChanges = logoFile !== null || logoRemoved;
    
    setHasChanges(hasColorChanges || hasFontChanges || hasLogoChanges);
  }, [settings, originalSettings, logoFile, logoRemoved]);
  
  // Fetch branding settings from the API
  const fetchBrandingSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, we're using mock data
      const response = await fetch('/api/settings/branding');
      
      if (!response.ok) {
        throw new Error('Failed to fetch branding settings');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const fetchedSettings: BrandingSettings = {
          primaryColor: data.data.primaryColor || defaultSettings.primaryColor,
          secondaryColor: data.data.secondaryColor || defaultSettings.secondaryColor,
          headerFont: data.data.headerFont || defaultSettings.headerFont,
          headerFontSize: data.data.headerFontSize || defaultSettings.headerFontSize,
          bodyFont: data.data.bodyFont || defaultSettings.bodyFont,
          bodyFontSize: data.data.bodyFontSize || defaultSettings.bodyFontSize,
          logoUrl: data.data.logoUrl || null
        };
        
        setSettings(fetchedSettings);
        setOriginalSettings(JSON.parse(JSON.stringify(fetchedSettings)));
      } else {
        // For development, use default settings
        setSettings(defaultSettings);
        setOriginalSettings(JSON.parse(JSON.stringify(defaultSettings)));
      }
    } catch (err) {
      console.error('Error fetching branding settings:', err);
      setError('Failed to load branding settings. Using defaults.');
      
      // For development, use default settings
      setSettings(defaultSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(defaultSettings)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle color changes
  const handleColorChange = (colorName: 'primaryColor' | 'secondaryColor', value: string) => {
    setSettings(prev => ({
      ...prev,
      [colorName]: value
    }));
  };
  
  // Handle font changes
  const handleFontChange = (fontName: 'headerFont' | 'bodyFont', value: string) => {
    setSettings(prev => ({
      ...prev,
      [fontName]: value
    }));
  };
  
  // Handle font size changes
  const handleFontSizeChange = (sizeName: 'headerFontSize' | 'bodyFontSize', value: string) => {
    setSettings(prev => ({
      ...prev,
      [sizeName]: value
    }));
  };
  
  // Handle logo file selection
  const handleLogoSelect = (file: File) => {
    setLogoFile(file);
    setLogoRemoved(false);
    setLogoError(null);
  };
  
  // Handle logo removal
  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoRemoved(true);
    setLogoError(null);
  };
  
  // Save all changes
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      // Create form data for the API call
      const formData = new FormData();
      
      // Add all settings to form data
      formData.append('primaryColor', settings.primaryColor);
      formData.append('secondaryColor', settings.secondaryColor);
      formData.append('headerFont', settings.headerFont);
      formData.append('headerFontSize', settings.headerFontSize);
      formData.append('bodyFont', settings.bodyFont);
      formData.append('bodyFontSize', settings.bodyFontSize);
      
      // Add logo file if changed
      if (logoFile) {
        formData.append('logoFile', logoFile);
      }
      
      // Flag if logo was removed
      if (logoRemoved) {
        formData.append('removeExistingLogo', 'true');
      }
      
      // In a real app, this would be an API call
      // For now, we're simulating it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the original settings to reflect the new state
      setOriginalSettings({
        ...settings,
        logoUrl: logoFile ? URL.createObjectURL(logoFile) : (logoRemoved ? null : settings.logoUrl)
      });
      
      // Clear file state
      setLogoFile(null);
      setLogoRemoved(false);
      
      // Reset changes flag
      setHasChanges(false);
      setSuccessMessage('Branding settings updated successfully');
    } catch (err) {
      console.error('Error saving branding settings:', err);
      setError('Failed to save branding settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancel changes
  const handleCancel = () => {
    // Revert to original settings
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
    setLogoFile(null);
    setLogoRemoved(false);
    setHasChanges(false);
    setError(null);
    setLogoError(null);
  };
  
  // Show loading state
  if (isLoading) {
    return <BrandingSkeleton />;
  }
  
  // Before returning the actual component, let's return a test component to verify rendering
  console.log("RENDER DEBUG - Branding Page:", { 
    // Include key state variables for debugging
  });

  // Test component for debugging - temporary
  return (
    <div className="p-8 bg-green-500 border-4 border-black" style={{ minHeight: "200px", zIndex: 9999, position: "relative" }}>
      <h1 className="text-3xl font-bold text-white">TEST RENDER - BRANDING PAGE</h1>
      <p className="text-white">This is a test component to verify rendering is working properly.</p>
      <button 
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => console.log("Branding Debug button clicked")}
      >
        Debug Log
      </button>
    </div>
  );
} 