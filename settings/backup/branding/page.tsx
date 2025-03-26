"use client";

import React, { useState, ChangeEvent, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/icons';
import { iconComponentFactory } from '@/components/ui/icons';
import NavigationTabs from '../components/NavigationTabs';
import toast from 'react-hot-toast';

// Enhanced UI Components
const Card = memo(({
  children


}: {children: React.ReactNode;}) => <motion.div initial={{
  opacity: 0,
  y: 20
}} animate={{
  opacity: 1,
  y: 0
}} transition={{
  duration: 0.3
}} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">

    {children}
  </motion.div>);

interface SectionHeaderProps {
  icon: React.ComponentType<{
    className?: string;
    solid?: boolean;
  }>;
  title: string;
  description?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = memo(({
  icon: IconComponent,
  title,
  description
}) => <div className="flex items-center mb-6 font-work-sans">
    <div className="bg-[var(--background-color)] bg-opacity-50 p-3 rounded-lg font-work-sans">
      <IconComponent className="w-6 h-6 text-[var(--accent-color)] font-work-sans" solid={false} />
    </div>
    <div className="ml-4 font-work-sans">
      <h2 className="text-xl font-semibold text-[var(--primary-color)] font-sora">{title}</h2>
      {description && <p className="mt-1 text-sm text-[var(--secondary-color)] font-work-sans">{description}</p>}
    </div>
  </div>);

const BrandingSettingsPage: React.FC = () => {
  const router = useRouter();

  // Default values
  const defaultPrimaryColor = "#00BFFF";
  const defaultSecondaryColor = "#40404F";
  const defaultHeaderFont = "Work Sans";
  const defaultHeaderFontSize = "18px";
  const defaultBodyFont = "Work Sans";
  const defaultBodyFontSize = "14px";

  // Form states
  const [primaryColor, setPrimaryColor] = useState(defaultPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(defaultSecondaryColor);
  const [headerFont, setHeaderFont] = useState(defaultHeaderFont);
  const [headerFontSize, setHeaderFontSize] = useState(defaultHeaderFontSize);
  const [bodyFont, setBodyFont] = useState(defaultBodyFont);
  const [bodyFontSize, setBodyFontSize] = useState(defaultBodyFontSize);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);

  // Error messages
  const [primaryColorError, setPrimaryColorError] = useState("");
  const [secondaryColorError, setSecondaryColorError] = useState("");
  const [headerFontSizeError, setHeaderFontSizeError] = useState("");
  const [bodyFontSizeError, setBodyFontSizeError] = useState("");
  const [logoError, setLogoError] = useState("");

  // Form status
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch existing branding settings
  useEffect(() => {
    async function fetchBrandingSettings() {
      try {
        setIsFetching(true);
        const response = await fetch('/api/settings/branding');
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching branding settings:', errorData);
          toast.error('Failed to load branding settings');
          return;
        }
        const {
          data
        } = await response.json();
        if (data) {
          setPrimaryColor(data.primaryColor || defaultPrimaryColor);
          setSecondaryColor(data.secondaryColor || defaultSecondaryColor);
          setHeaderFont(data.headerFont || defaultHeaderFont);
          setHeaderFontSize(data.headerFontSize || defaultHeaderFontSize);
          setBodyFont(data.bodyFont || defaultBodyFont);
          setBodyFontSize(data.bodyFontSize || defaultBodyFontSize);

          // If there's an existing logo, set it
          if (data.logoUrl) {
            setExistingLogoUrl(data.logoUrl);
            setLogoPreview(data.logoUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching branding settings:', error);
        toast.error('Failed to load branding settings');
      } finally {
        setIsFetching(false);
      }
    }
    fetchBrandingSettings();
  }, []);

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
  const handlePrimaryColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrimaryColor(value);
    setIsDirty(true);
    if (!value) {
      setPrimaryColorError("Error: Colour selection is required.");
    } else if (!isValidHex(value)) {
      setPrimaryColorError("Error: Please enter a valid hex colour code.");
    } else {
      setPrimaryColorError("");
    }
  };

  // Handle secondary colour input changes
  const handleSecondaryColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSecondaryColor(value);
    setIsDirty(true);
    if (!value) {
      setSecondaryColorError("Error: Colour selection is required.");
    } else if (!isValidHex(value)) {
      setSecondaryColorError("Error: Please enter a valid hex colour code.");
    } else {
      setSecondaryColorError("");
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
    setExistingLogoUrl(null);
    setIsDirty(true);
  };

  // Revert all changes when Cancel is clicked
  const handleCancel = () => {
    setPrimaryColor(defaultPrimaryColor);
    setSecondaryColor(defaultSecondaryColor);
    setHeaderFont(defaultHeaderFont);
    setHeaderFontSize(defaultHeaderFontSize);
    setBodyFont(defaultBodyFont);
    setBodyFontSize(defaultBodyFontSize);
    setLogoFile(null);
    setLogoPreview(existingLogoUrl);
    setPrimaryColorError("");
    setSecondaryColorError("");
    setHeaderFontSizeError("");
    setBodyFontSizeError("");
    setLogoError("");
    setIsDirty(false);
  };

  // Handle Save Changes with actual API call
  const handleSaveChanges = async () => {
    // Do not proceed if there are errors
    if (primaryColorError || secondaryColorError || headerFontSizeError || bodyFontSizeError || logoError) {
      return;
    }
    try {
      setIsLoading(true);

      // Create FormData for the request
      const formData = new FormData();
      formData.append('primaryColor', primaryColor);
      formData.append('secondaryColor', secondaryColor);
      formData.append('headerFont', headerFont);
      formData.append('headerFontSize', headerFontSize);
      formData.append('bodyFont', bodyFont);
      formData.append('bodyFontSize', bodyFontSize);
      const hasLogoFile = !!logoFile;
      let isLogoRemoved = false;

      // If we have a new logo file, append it
      if (logoFile) {
        formData.append('logoFile', logoFile);
      }
      // If logoPreview is null and existingLogoUrl was set, this means logo was removed
      else if (existingLogoUrl && !logoPreview) {
        formData.append('removeExistingLogo', 'true');
        isLogoRemoved = true;
      }
      console.log('Submitting branding form with data:', {
        primaryColor,
        secondaryColor,
        headerFont,
        headerFontSize,
        bodyFont,
        bodyFontSize,
        logoFile: logoFile ? 'File present' : 'No file',
        existingLogoUrl,
        logoPreview: logoPreview ? 'Present' : 'Not present',
        removeExistingLogo: isLogoRemoved
      });

      // Make the API call
      const response = await fetch('/api/settings/branding', {
        method: 'POST',
        body: formData
      });
      const responseText = await response.text();
      console.log('Raw API response:', responseText);
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse API response as JSON:', parseError);
        throw new Error('Received invalid response from server');
      }
      if (!response.ok) {
        console.error('Error response from API:', result);

        // Special handling for the Prisma version conflict error with logo uploads
        if (hasLogoFile && result.details && (result.details.includes('Cannot execute an Effect') || result.error === 'Failed to upload logo file')) {
          // Ask user if they want to continue without uploading the logo
          if (window.confirm('There was an issue uploading the logo file due to a server configuration. Would you like to save the other branding changes without uploading a new logo?')) {
            // Try again without the logo
            const formDataWithoutLogo = new FormData();
            formDataWithoutLogo.append('primaryColor', primaryColor);
            formDataWithoutLogo.append('secondaryColor', secondaryColor);
            formDataWithoutLogo.append('headerFont', headerFont);
            formDataWithoutLogo.append('headerFontSize', headerFontSize);
            formDataWithoutLogo.append('bodyFont', bodyFont);
            formDataWithoutLogo.append('bodyFontSize', bodyFontSize);

            // If removing logo, still include that instruction
            if (isLogoRemoved) {
              formDataWithoutLogo.append('removeExistingLogo', 'true');
            }
            console.log('Retrying without logo file');
            const retryResponse = await fetch('/api/settings/branding', {
              method: 'POST',
              body: formDataWithoutLogo
            });
            const retryResponseText = await retryResponse.text();
            console.log('Retry response:', retryResponseText);
            try {
              const retryResult = JSON.parse(retryResponseText);
              if (!retryResponse.ok) {
                throw new Error(retryResult.error || retryResult.details || 'Failed to update branding settings');
              }

              // If we're not removing the logo, restore the existing logo URL
              if (!isLogoRemoved && existingLogoUrl) {
                console.log('Restoring existing logo URL:', existingLogoUrl);
                setLogoPreview(existingLogoUrl);
              } else if (isLogoRemoved) {
                // If we're removing the logo, clear the preview
                setLogoPreview(null);
                setExistingLogoUrl(null);
              }
              setIsDirty(false);
              toast.success('Branding updated successfully (without logo update)!');
              setIsLoading(false);
              return;
            } catch (retryError) {
              console.error('Error in retry:', retryError);
              throw new Error('Failed to update branding settings even without logo');
            }
          }
        }
        throw new Error(result.error || result.details || 'Failed to update branding settings');
      }

      // Update the existing logo URL if a new one was uploaded
      if (result.data.logoUrl) {
        console.log('New logo URL received:', result.data.logoUrl);
        setExistingLogoUrl(result.data.logoUrl);
        setLogoPreview(result.data.logoUrl);
        setLogoFile(null); // Clear the file input since the upload is complete
      } else if (isLogoRemoved) {
        // If we successfully removed the logo, make sure UI reflects that
        console.log('Logo removed successfully');
        setExistingLogoUrl(null);
        setLogoPreview(null);
      } else {
        // No change to logo
        console.log('No change to logo URL');
      }
      setIsDirty(false);
      toast.success('Branding updated successfully!');
    } catch (error) {
      console.error('Error saving branding settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update branding settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isFetching) {
    return <div className="min-h-screen bg-white flex items-center justify-center font-work-sans">
        <Icon name="faArrowRight" className="w-8 h-8 text-[var(--accent-color)] animate-spin font-work-sans" solid={false} />
        <span className="ml-2 text-[var(--primary-color)] font-work-sans">Loading branding settings...</span>
      </div>;
  }
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} className="min-h-screen bg-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-work-sans">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8 font-work-sans">
          <div className="font-work-sans">
            <motion.h1 initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="text-3xl font-bold text-[var(--primary-color)] font-work-sans">

              Branding Settings
            </motion.h1>
            <motion.p initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.1
          }} className="mt-2 text-[var(--secondary-color)] font-work-sans">

              Customize your brand appearance and identity
            </motion.p>
          </div>
          <div className="flex items-center space-x-3 font-work-sans">
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={handleCancel} disabled={isLoading} className="px-4 py-2 text-[var(--primary-color)] bg-[var(--background-color)] rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium flex items-center font-work-sans">




              <Icon name="faXCircle" className="w-5 h-5 mr-2" solid={false} />
              Cancel
            </motion.button>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={handleSaveChanges} disabled={!isDirty || isLoading} className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium 
                flex items-center ${!isDirty || isLoading ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-[var(--accent-color)] hover:bg-opacity-90 text-white'}`}>

              {isLoading ? <>
                  <Icon name="faArrowRight" className="w-5 h-5 mr-2 animate-spin" solid={false} />
                  Saving...
                </> : <>
                  <Icon name="faCheckCircle" className="w-5 h-5 mr-2" solid={false} />
                  Save
                </>}
            </motion.button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <NavigationTabs activeTab="branding" isSuperAdmin={true} onTabChange={(tab) => {
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
      }} />


        {/* Main Content */}
        <div className="space-y-8 font-work-sans">
          {/* Logo Section */}
          <Card>
            <SectionHeader icon={(props) => <Icon name="faPhoto" {...props} solid={false} className="text-[var(--secondary-color)] font-work-sans" />} title="Logo" description="Upload and manage your brand logo" />

            <div className="flex items-start space-x-8 font-work-sans">
              <div className="flex-shrink-0 font-work-sans">
                {logoPreview ? <div className="relative font-work-sans">
                    <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-contain bg-gray-50 rounded-lg" />

                    <motion.button whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.9
                }} onClick={handleRemoveLogo} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 font-work-sans"
                aria-label="Remove logo">

                      <Icon name="faXCircle" className="w-5 h-5" solid={false} />
                    </motion.button>
                  </div> : <div className="w-32 h-32 bg-[var(--background-color)] rounded-lg flex items-center justify-center font-work-sans">
                    <Icon name="faPhoto" className="w-12 h-12 text-[var(--secondary-color)] font-work-sans" solid={false} />
                  </div>}
              </div>
              <div className="flex-grow font-work-sans">
                <div className="space-y-4 font-work-sans">
                  <div className="font-work-sans">
                    <label htmlFor="logo" className="relative cursor-pointer inline-flex items-center px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition-colors duration-200 font-medium group font-work-sans">







                      <Icon name="faPhoto" className="w-5 h-5 mr-2" solid={false} />
                      <span className="font-work-sans">Upload New Logo</span>
                      <input id="logo" type="file" accept="image/jpeg, image/png" onChange={handleLogoUpload} className="hidden font-work-sans" />

                    </label>
                  </div>
                  <p className="text-sm text-[var(--secondary-color)] font-work-sans">
                    Supported formats: JPG, PNG. Maximum file size: 5MB
                  </p>
                  {logoError && <motion.p initial={{
                  opacity: 0,
                  y: -10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} className="text-red-500 text-sm flex items-center font-work-sans">

                      <Icon name="faXCircle" className="w-5 h-5 mr-1" solid={false} />
                      {logoError}
                    </motion.p>}
                </div>
              </div>
            </div>
          </Card>

          {/* Colors Section */}
          <Card>
            <SectionHeader icon={(props) => <Icon name="faSwatch" {...props} solid={false} className="text-[var(--secondary-color)] font-work-sans" />} title="Brand Colors" description="Define your brand's color palette" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
              <div className="font-work-sans">
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-1 font-work-sans">
                  Primary Color
                </label>
                <div className="flex items-center space-x-4 font-work-sans">
                  <input type="color" value={primaryColor} onChange={handlePrimaryColorChange} className="h-10 w-20 rounded cursor-pointer font-work-sans" />

                  <input type="text" value={primaryColor} onChange={handlePrimaryColorChange} className="flex-grow px-3 py-2 border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans"
                placeholder="#000000" />

                </div>
                {primaryColorError && <p className="mt-1 text-sm text-red-600 font-work-sans">{primaryColorError}</p>}
              </div>
              <div className="font-work-sans">
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-1 font-work-sans">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-4 font-work-sans">
                  <input type="color" value={secondaryColor} onChange={handleSecondaryColorChange} className="h-10 w-20 rounded cursor-pointer font-work-sans" />

                  <input type="text" value={secondaryColor} onChange={handleSecondaryColorChange} className="flex-grow px-3 py-2 border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans"
                placeholder="#000000" />

                </div>
                {secondaryColorError && <p className="mt-1 text-sm text-red-600 font-work-sans">{secondaryColorError}</p>}
              </div>
            </div>
          </Card>

          {/* Typography Section */}
          <Card>
            <SectionHeader icon={(props) => <Icon name="faDocumentText" {...props} solid={false} className="text-[var(--secondary-color)] font-work-sans" />} title="Typography" description="Configure your brand's typography settings" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
              <div className="space-y-4 font-work-sans">
                <div className="font-work-sans">
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1 font-work-sans">
                    Header Font
                  </label>
                  <select value={headerFont} onChange={handleHeaderFontChange} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans">




                    <option value="Work Sans">Work Sans</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
                <div className="font-work-sans">
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1 font-work-sans">
                    Header Font Size
                  </label>
                  <input type="text" value={headerFontSize} onChange={handleHeaderFontSizeChange} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans"
                placeholder="18px" />

                  {headerFontSizeError && <p className="mt-1 text-sm text-red-600 font-work-sans">{headerFontSizeError}</p>}
                </div>
              </div>
              <div className="space-y-4 font-work-sans">
                <div className="font-work-sans">
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1 font-work-sans">
                    Body Font
                  </label>
                  <select value={bodyFont} onChange={handleBodyFontChange} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans">




                    <option value="Work Sans">Work Sans</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
                <div className="font-work-sans">
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1 font-work-sans">
                    Body Font Size
                  </label>
                  <input type="text" value={bodyFontSize} onChange={handleBodyFontSizeChange} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans"
                placeholder="14px" />

                  {bodyFontSizeError && <p className="mt-1 text-sm text-red-600 font-work-sans">{bodyFontSizeError}</p>}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>;
};
export default BrandingSettingsPage;