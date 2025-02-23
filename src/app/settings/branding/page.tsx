"use client";

import React, { useState, ChangeEvent, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircleIcon, CheckCircleIcon, PhotoIcon, SwatchIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import NavigationTabs from '../components/NavigationTabs';

// Enhanced UI Components
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

const BrandingSettingsPage: React.FC = () => {
  const router = useRouter();

  // Default values
  const defaultPrimaryColour = "#00BFFF";
  const defaultSecondaryColour = "#40404F";
  const defaultHeaderFont = "Work Sans";
  const defaultHeaderFontSize = "18px";
  const defaultBodyFont = "Work Sans";
  const defaultBodyFontSize = "14px";

  // Form states
  const [primaryColour, setPrimaryColour] = useState(defaultPrimaryColour);
  const [secondaryColour, setSecondaryColour] = useState(defaultSecondaryColour);
  const [headerFont, setHeaderFont] = useState(defaultHeaderFont);
  const [headerFontSize, setHeaderFontSize] = useState(defaultHeaderFontSize);
  const [bodyFont, setBodyFont] = useState(defaultBodyFont);
  const [bodyFontSize, setBodyFontSize] = useState(defaultBodyFontSize);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Error messages
  const [primaryColourError, setPrimaryColourError] = useState("");
  const [secondaryColourError, setSecondaryColourError] = useState("");
  const [headerFontSizeError, setHeaderFontSizeError] = useState("");
  const [bodyFontSizeError, setBodyFontSizeError] = useState("");
  const [logoError, setLogoError] = useState("");

  // Form status
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Helper function to check if a hex code is valid
  const isValidHex = (value: string) => {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
  };

  // Helper to validate font size (must end with 'px' and be between 10px and 36px)
  const isValidFontSize = (value: string) => {
    if (!value.endsWith("px")) return false;
    const num = parseInt(value);
    return num >= 10 && num <= 36;
  };

  // Handle primary colour input changes
  const handlePrimaryColourChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrimaryColour(value);
    setIsDirty(true);
    if (!value) {
      setPrimaryColourError("Error: Colour selection is required.");
    } else if (!isValidHex(value)) {
      setPrimaryColourError("Error: Please enter a valid hex colour code.");
    } else {
      setPrimaryColourError("");
    }
  };

  // Handle secondary colour input changes
  const handleSecondaryColourChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSecondaryColour(value);
    setIsDirty(true);
    if (!value) {
      setSecondaryColourError("Error: Colour selection is required.");
    } else if (!isValidHex(value)) {
      setSecondaryColourError("Error: Please enter a valid hex colour code.");
    } else {
      setSecondaryColourError("");
    }
  };

  // Handle header font changes
  const handleHeaderFontChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setHeaderFont(e.target.value);
    setIsDirty(true);
  };

  // Handle header font size changes
  const handleHeaderFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHeaderFontSize(value);
    setIsDirty(true);
    if (!isValidFontSize(value)) {
      setHeaderFontSizeError("Error: Font size must be between 10px and 36px.");
    } else {
      setHeaderFontSizeError("");
    }
  };

  // Handle body font changes
  const handleBodyFontChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setBodyFont(e.target.value);
    setIsDirty(true);
  };

  // Handle body font size changes
  const handleBodyFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBodyFontSize(value);
    setIsDirty(true);
    if (!isValidFontSize(value)) {
      setBodyFontSizeError("Error: Font size must be between 10px and 36px.");
    } else {
      setBodyFontSizeError("");
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        setLogoError("Error: Unsupported file type. Please upload a JPG or PNG.");
        setLogoFile(null);
        setLogoPreview(null);
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setLogoError("Error: File size too large. Maximum allowed size is 5MB.");
        setLogoFile(null);
        setLogoPreview(null);
        return;
      }
      setLogoError("");
      setLogoFile(file);
      setIsDirty(true);
      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove the uploaded logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setIsDirty(true);
  };

  // Revert all changes when Cancel is clicked
  const handleCancel = () => {
    setPrimaryColour(defaultPrimaryColour);
    setSecondaryColour(defaultSecondaryColour);
    setHeaderFont(defaultHeaderFont);
    setHeaderFontSize(defaultHeaderFontSize);
    setBodyFont(defaultBodyFont);
    setBodyFontSize(defaultBodyFontSize);
    setLogoFile(null);
    setLogoPreview(null);
    setPrimaryColourError("");
    setSecondaryColourError("");
    setHeaderFontSizeError("");
    setBodyFontSizeError("");
    setLogoError("");
    setIsDirty(false);
  };

  // Handle Save Changes (simulate an async save)
  const handleSaveChanges = () => {
    // Do not proceed if there are errors
    if (
      primaryColourError ||
      secondaryColourError ||
      headerFontSizeError ||
      bodyFontSizeError ||
      logoError
    ) {
      return;
    }
    setIsLoading(true);
    // Simulate a network request
    setTimeout(() => {
      setIsLoading(false);
      setToastMessage("Branding updated successfully!");
      setIsDirty(false);
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }, 2000);
  };

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
              Branding Settings
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-gray-500"
            >
              Customize your brand appearance and identity
            </motion.p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 
                transition-colors duration-200 font-medium flex items-center"
            >
              <XCircleIcon className="w-5 h-5 mr-2" />
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveChanges}
              disabled={!isDirty || isLoading}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium 
                flex items-center ${
                  !isDirty || isLoading
                    ? 'bg-blue-300 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {isLoading ? (
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
          </div>
        </div>

        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab="branding"
          isSuperAdmin={true}
          onTabChange={(tab) => {
            switch (tab) {
              case 'profile':
                router.push('/settings');
                break;
              case 'team':
                router.push('/settings/team-management');
                break;
              case 'admin':
                router.push('/admin');
                break;
            }
          }}
        />

        {/* Main Content */}
        <div className="space-y-8">
          {/* Logo Section */}
          <Card>
            <SectionHeader
              icon={PhotoIcon}
              title="Logo"
              description="Upload and manage your brand logo"
            />
            <div className="flex items-start space-x-8">
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-32 h-32 object-contain bg-gray-50 rounded-lg"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1
                        hover:bg-red-600 transition-colors duration-200"
                      aria-label="Remove logo"
                    >
                      <XCircleIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="logo"
                      className="relative cursor-pointer inline-flex items-center px-4 py-2 
                        bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                        transition-colors duration-200 font-medium group"
                    >
                      <PhotoIcon className="w-5 h-5 mr-2" />
                      <span>Upload New Logo</span>
                      <input
                        id="logo"
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supported formats: JPG, PNG. Maximum file size: 5MB
                  </p>
                  {logoError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm flex items-center"
                    >
                      <XCircleIcon className="w-5 h-5 mr-1" />
                      {logoError}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Colors Section */}
          <Card>
            <SectionHeader
              icon={SwatchIcon}
              title="Brand Colors"
              description="Define your brand's color palette"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={primaryColour}
                    onChange={handlePrimaryColourChange}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColour}
                    onChange={handlePrimaryColourChange}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md 
                      focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#000000"
                  />
                </div>
                {primaryColourError && (
                  <p className="mt-1 text-sm text-red-600">{primaryColourError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={secondaryColour}
                    onChange={handleSecondaryColourChange}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColour}
                    onChange={handleSecondaryColourChange}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md 
                      focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#000000"
                  />
                </div>
                {secondaryColourError && (
                  <p className="mt-1 text-sm text-red-600">{secondaryColourError}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Typography Section */}
          <Card>
            <SectionHeader
              icon={DocumentTextIcon}
              title="Typography"
              description="Configure your brand's typography settings"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Header Font
                  </label>
                  <select
                    value={headerFont}
                    onChange={handleHeaderFontChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                      focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Work Sans">Work Sans</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Header Font Size
                  </label>
                  <input
                    type="text"
                    value={headerFontSize}
                    onChange={handleHeaderFontSizeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                      focus:ring-blue-500 focus:border-blue-500"
                    placeholder="18px"
                  />
                  {headerFontSizeError && (
                    <p className="mt-1 text-sm text-red-600">{headerFontSizeError}</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Body Font
                  </label>
                  <select
                    value={bodyFont}
                    onChange={handleBodyFontChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                      focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Work Sans">Work Sans</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Body Font Size
                  </label>
                  <input
                    type="text"
                    value={bodyFontSize}
                    onChange={handleBodyFontSizeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                      focus:ring-blue-500 focus:border-blue-500"
                    placeholder="14px"
                  />
                  {bodyFontSizeError && (
                    <p className="mt-1 text-sm text-red-600">{bodyFontSizeError}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Toast Message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg 
                shadow-lg flex items-center"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BrandingSettingsPage;
