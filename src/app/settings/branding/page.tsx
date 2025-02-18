"use client";

import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="p-6">
      {/* Page Title & Primary Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#333333]">Branding Settings</h1>
        <div className="space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="w-36 h-10 bg-gray-500 text-white rounded"
            aria-label="Cancel branding edits"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={!isDirty || isLoading}
            className={`w-36 h-10 rounded text-white ${
              !isDirty || isLoading ? 'bg-blue-300' : 'bg-blue-500'
            }`}
            aria-label="Save branding updates"
          >
            {isLoading ? "Loading..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-300">
        <nav className="flex space-x-4">
          <button
            onClick={() => router.push('/settings')}
            className="py-2 px-4 text-blue-500 hover:underline"
          >
            Profile Settings
          </button>
          <button
            onClick={() => router.push('/settings/team-management')}
            className="py-2 px-4 text-blue-500 hover:underline"
          >
            Team Management
          </button>
          <button
            className="py-2 px-4 font-bold border-b-2 border-blue-500"
            aria-current="page"
          >
            Branding
          </button>
        </nav>
      </div>

      {/* Colour Palette Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Colour Palette</h2>
        <div className="mb-4">
          <label htmlFor="primaryColour" className="block mb-1">
            Primary Colour
          </label>
          <div className="flex items-center">
            <input
              id="primaryColour"
              type="text"
              value={primaryColour}
              onChange={handlePrimaryColourChange}
              aria-label="Select primary colour for your brand."
              className="w-[400px] p-2 border border-gray-300 rounded"
            />
            <div
              className="ml-4"
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: primaryColour,
                border: '1px solid #ccc',
              }}
            />
          </div>
          {primaryColourError && (
            <p className="text-red-500 mt-1">{primaryColourError}</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="secondaryColour" className="block mb-1">
            Secondary Colour
          </label>
          <div className="flex items-center">
            <input
              id="secondaryColour"
              type="text"
              value={secondaryColour}
              onChange={handleSecondaryColourChange}
              aria-label="Select secondary colour for your brand."
              className="w-[400px] p-2 border border-gray-300 rounded"
            />
            <div
              className="ml-4"
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: secondaryColour,
                border: '1px solid #ccc',
              }}
            />
          </div>
          {secondaryColourError && (
            <p className="text-red-500 mt-1">{secondaryColourError}</p>
          )}
        </div>
      </div>

      {/* Typography Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Typography</h2>
        <div className="mb-4">
          <label htmlFor="headerFont" className="block mb-1">
            Header Typography
          </label>
          <select
            id="headerFont"
            value={headerFont}
            onChange={handleHeaderFontChange}
            aria-label="Choose a font for headers."
            className="w-[400px] p-2 border border-gray-300 rounded"
          >
            <option value="Arial">Arial</option>
            <option value="Roboto">Roboto</option>
            <option value="Work Sans">Work Sans</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Montserrat">Montserrat</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="headerFontSize" className="block mb-1">
            Header Font Size
          </label>
          <input
            id="headerFontSize"
            type="text"
            value={headerFontSize}
            onChange={handleHeaderFontSizeChange}
            aria-label="Font size input for header typography."
            className="w-[400px] p-2 border border-gray-300 rounded"
          />
          {headerFontSizeError && (
            <p className="text-red-500 mt-1">{headerFontSizeError}</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="bodyFont" className="block mb-1">
            Body Typography
          </label>
          <select
            id="bodyFont"
            value={bodyFont}
            onChange={handleBodyFontChange}
            aria-label="Choose a font for body text."
            className="w-[400px] p-2 border border-gray-300 rounded"
          >
            <option value="Arial">Arial</option>
            <option value="Roboto">Roboto</option>
            <option value="Work Sans">Work Sans</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Montserrat">Montserrat</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="bodyFontSize" className="block mb-1">
            Body Font Size
          </label>
          <input
            id="bodyFontSize"
            type="text"
            value={bodyFontSize}
            onChange={handleBodyFontSizeChange}
            aria-label="Font size input for body typography."
            className="w-[400px] p-2 border border-gray-300 rounded"
          />
          {bodyFontSizeError && (
            <p className="text-red-500 mt-1">{bodyFontSizeError}</p>
          )}
        </div>
      </div>

      {/* Brand Logo Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Brand Logo</h2>
        <div className="mb-4">
          <label className="block mb-1">Upload Logo</label>
          <input
            type="file"
            accept=".jpg, .jpeg, .png"
            onChange={handleLogoUpload}
            aria-label="Upload or change brand logo."
          />
          {logoError && <p className="text-red-500 mt-1">{logoError}</p>}
        </div>
        {logoPreview && (
          <div className="mb-4">
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="w-24 h-24 object-contain"
            />
            <div>
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="mt-2 w-36 h-10 bg-gray-500 text-white rounded"
                aria-label="Remove logo"
              >
                Remove Logo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview (Optional) */}
      <div className="p-4 border rounded mb-4" style={{ fontFamily: headerFont, fontSize: headerFontSize }}>
        <p>Header Typography Preview</p>
      </div>
      <div className="p-4 border rounded" style={{ fontFamily: bodyFont, fontSize: bodyFontSize }}>
        <p>Body Typography Preview</p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default BrandingSettingsPage;
