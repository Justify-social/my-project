"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useWizard } from "@/context/WizardContext";
import Header from "@/components/Wizard/Header";
import ProgressBar from "@/components/Wizard/ProgressBar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "react-hot-toast";
import { Icon } from "@/components/ui/icon";
import { CampaignAssetUploader, UploadedAsset } from "@/components/upload/CampaignAssetUploader";
import { AssetPreview } from '@/components/upload/AssetPreview';
import { KPI, Feature, Platform } from '@prisma/client';
import { generateReactHelpers } from "@uploadthing/react";
import { v4 as uuidv4 } from "uuid";
import { ourFileRouter } from '@/app/api/uploadthing/core';
import { deleteAssetFromStorage, logOrphanedAsset } from '@/services/assetService';
import { compressImage } from '@/utils/imageCompression';
import { WizardSkeleton } from "@/components/ui/loading-skeleton";

// Create the uploadthing helper
const {
  useUploadThing
} = generateReactHelpers<typeof ourFileRouter>();

// We'll implement the validation function directly, no need for external import
// import { fetchInfluencerData } from '@/lib/influencer-service';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface Influencer {
  id: string;
  handle: string;
  platform: string;
  followers?: number;
}
interface AssetDetails {
  assetName: string;
  budget: number;
  description: string;
  influencerHandle?: string;
  platform?: string;
  whyInfluencer?: string;
}
interface Asset {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  type: string;
  progress: number;
  details: AssetDetails;
}
export interface CreativeValues {
  assets: Asset[];
}

// Update the WizardData interface to include the creative property
interface WizardData {
  overview: {
    name: string;
    businessGoal: string;
    startDate: string;
    endDate: string;
    timeZone: string;
    contacts: string;
    primaryContact: {
      firstName: string;
      surname: string;
      email: string;
      position: string;
    };
    secondaryContact: {
      firstName: string;
      surname: string;
      email: string;
      position: string;
    };
    currency: string;
    totalBudget: number;
    socialMediaBudget: number;
    platform: string;
    influencerHandle: string;
  };
  objectives: {
    mainMessage: string;
    hashtags: string;
    memorability: string;
    keyBenefits: string;
    expectedAchievements: string;
    purchaseIntent: string;
    primaryKPI: string;
    secondaryKPIs: string[];
    features: string[];
  };
  audience: {
    segments: string[];
    competitors: string[];
  };
  assets: {
    files: {
      id?: string;
      url: string;
      fileName?: string;
      fileSize?: number;
      type?: string;
      details?: AssetDetails;
      tags: string[];
    }[];
  };
  creative?: {
    creativeAssets: Array<{
      id?: string;
      name: string;
      description: string;
      url: string;
      type: string;
      fileSize: number;
      format: string;
      influencerHandle?: string;
      budget?: number;
      whyInfluencer?: string;
      platform?: string;
    }>;
  };
  influencers?: Influencer[];
}

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const AssetDetailsSchema = Yup.object().shape({
  assetName: Yup.string().required("Asset name is required"),
  influencer: Yup.string().required("Influencer handle is required"),
  whyInfluencer: Yup.string().required("Please explain why you chose this influencer"),
  budget: Yup.number().typeError("Budget must be a valid number.").positive("Budget cannot be negative.").required("Budget is required.")
});
const CreativeSchema = Yup.object().shape({
  assets: Yup.array().of(Yup.object().shape({
    id: Yup.string().required(),
    progress: Yup.number().min(100, "Upload must be complete"),
    details: AssetDetailsSchema
  }))
});

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'video/mp4': ['.mp4']
};

// Enhance the currency symbols mapping to support more currencies
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CNY: '¥',
  INR: '₹'
  // Add more currencies as needed
};

// Add a utility function to detect file types more accurately
function detectFileType(url: string, mimeType?: string): string {
  // Enhanced file type detection with explicit rejection of PDFs
  const fileExtension = url.split('.').pop()?.toLowerCase() || '';

  // Explicitly list allowed formats
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv', 'm4v'];

  // Check if mime type contains video or image
  if (mimeType) {
    if (mimeType.includes('pdf')) {
      console.warn('PDF files are not supported');
      return 'unsupported';
    }
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('image')) return 'image';
  }

  // Check by extension if mime type check didn't yield results
  if (imageExtensions.includes(fileExtension)) return 'image';
  if (videoExtensions.includes(fileExtension)) return 'video';

  // PDF rejection
  if (fileExtension === 'pdf') {
    console.warn('PDF files are not supported');
    return 'unsupported';
  }

  // Default to unknown if we can't determine
  return 'unknown';
}

// Add utility functions for file name handling at the top of the file
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[\/\\:*?"<>|]/g, '') // Remove invalid characters
  .replace(/\s+/g, ' ') // Normalize whitespace
  .trim() // Remove leading/trailing whitespace
  .slice(0, 255); // Enforce maximum length
}
function isValidFileName(fileName: string): boolean {
  return fileName.length > 0 && fileName.length <= 255 && !/^\./.test(fileName); // Shouldn't start with a dot
}

// Generate a correlation ID for request tracing
function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// =============================================================================
// UPLOAD AREA (Drag & Drop Zone)
// =============================================================================

interface UploadAreaProps {
  campaignId: string;
  onAssetsAdded: (assets: Asset[]) => void;
}
const UploadArea: React.FC<UploadAreaProps> = ({
  campaignId,
  onAssetsAdded
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Use UploadThing hook with standard options to avoid type issues
  const {
    startUpload
  } = useUploadThing("campaignAssetUploader", {
    onClientUploadComplete: res => {
      if (res) {
        handleUploadComplete(res);
      }
    },
    onUploadError: error => {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    },
    headers: () => ({
      "x-campaign-id": campaignId
    })
  });

  // Helper for compressing image files before upload
  const compressImageIfNeeded = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) return file;
    try {
      return await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85
      });
    } catch (error) {
      console.error('Compression failed, using original file:', error);
      return file;
    }
  };

  // Enhanced upload handler with compression
  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setIsUploading(true);
    setIsCompressing(true);
    try {
      // Process files with compression for images
      const compressedFiles = await Promise.all(selectedFiles.map(async file => {
        return await compressImageIfNeeded(file);
      }));
      setIsCompressing(false);

      // Start upload without metadata (the endpoint already has the campaign ID from headers)
      const uploadResult = await startUpload(compressedFiles);
      if (!uploadResult) {
        throw new Error("Upload failed");
      }

      // Clear selected files on successful upload
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Cache failed upload for potential recovery
      try {
        localStorage.setItem(`pendingUpload_${campaignId}`, JSON.stringify({
          files: selectedFiles.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type
          })),
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Failed to cache upload state:', e);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Enhanced completion handler with resilience
  const handleUploadComplete = (results: any[]) => {
    const correlationId = `complete-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    console.log(`[${correlationId}] Processing upload results:`, results);

    // Ensure results is an array and filter invalid entries
    const validResults = Array.isArray(results) ? results.filter(Boolean) : [];
    if (validResults.length === 0) {
      console.warn(`[${correlationId}] No valid upload results`);
      toast.error("Upload completed but no valid files were processed");
      setIsUploading(false);
      return;
    }
    const newAssets = validResults.map((result, index) => {
      // Use explicit checks for properties that might be undefined
      const resultObj = result as Record<string, any>;
      // The UploadThing type definition doesn't include 'name', so let's use a safer approach
      const fileKey = 'name' in resultObj ? 'name' : 'key';
      const safeName = typeof resultObj[fileKey] === 'string' ? resultObj[fileKey] : `asset-${index}-${Date.now()}`;
      const extension = safeName.includes('.') ? safeName.split('.').pop() : 'unknown';
      return {
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        url: String(resultObj.url || ''),
        // Ensure URL is a string
        fileName: safeName,
        fileSize: Number(resultObj.size || 0),
        // Coerce to number with fallback
        type: typeof resultObj.type === 'string' ? resultObj.type : detectFileType(safeName),
        // Use utility fallback
        format: extension || 'unknown',
        progress: 100,
        details: {
          assetName: safeName,
          budget: 0,
          description: '',
          influencerHandle: '',
          platform: ''
        }
      };
    });

    // Clear state
    setSelectedFiles([]);
    localStorage.removeItem(`pendingUpload_${campaignId}`);

    // Add to parent component
    onAssetsAdded(newAssets);
    toast.success(`Successfully uploaded ${newAssets.length} asset(s)`);
  };

  // Check for recoverable uploads
  useEffect(() => {
    try {
      const pendingUploadData = localStorage.getItem(`pendingUpload_${campaignId}`);
      if (pendingUploadData) {
        const {
          timestamp
        } = JSON.parse(pendingUploadData);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

        // Only offer recovery for recent uploads (last 5 minutes)
        if (timestamp > fiveMinutesAgo) {
          toast(t => <div>
              <p>You have a pending upload. Would you like to retry?</p>
              <div className="mt-2">
                <button className="px-2 py-1 bg-blue-500 text-white rounded mr-2" onClick={() => {
                toast.dismiss(t.id);
                // User needs to reselect files - can't recover File objects from storage
                if (inputRef.current) {
                  inputRef.current.click();
                }
              }}>

                  Retry Upload
                </button>
                <button className="px-2 py-1 bg-gray-300 rounded" onClick={() => {
                localStorage.removeItem(`pendingUpload_${campaignId}`);
                toast.dismiss(t.id);
              }}>

                  Discard
                </button>
      </div>
            </div>, {
            duration: 10000
          });
        } else {
          // Clean up old entries
          localStorage.removeItem(`pendingUpload_${campaignId}`);
        }
      }
    } catch (e) {
      console.error('Error checking recoverable uploads:', e);
    }
  }, [campaignId]);
  return <div className="relative w-full transition-all duration-300">
      <CampaignAssetUploader campaignId={campaignId} onUploadComplete={handleUploadComplete} onUploadError={(error: Error) => {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
    }} />

    </div>;
};

// =============================================================================
// BUDGET INPUT COMPONENT (make smaller)
// =============================================================================

interface BudgetInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  currencySymbol: string;
}
const BudgetInput: React.FC<BudgetInputProps> = ({
  value,
  onChange,
  onBlur,
  currencySymbol
}) => <div className="relative flex items-center max-w-[150px]">
    <div className="absolute left-2 inset-y-0 flex items-center pointer-events-none">
      <span className="text-gray-500 text-sm">{currencySymbol}</span>
      </div>
      <input type="number" value={value} onChange={onChange} onBlur={onBlur} className="w-full pl-6 py-1.5 px-2 border border-gray-300 rounded-md text-sm" placeholder="500" min="0" step="10" />

  </div>;

// =============================================================================
// INFLUENCER SELECTOR COMPONENT
// =============================================================================

interface InfluencerSelectorProps {
  assetId: string;
  influencers: Influencer[];
  value: string;
  onChange: (handle: string) => void;
}
const InfluencerSelector: React.FC<InfluencerSelectorProps> = ({
  assetId,
  influencers,
  value,
  onChange
}) => {
  const [query, setQuery] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter influencers based on query
  const filteredInfluencers = useMemo(() => {
    if (!query) return influencers;
    return influencers.filter(inf => inf.handle.toLowerCase().includes(query.toLowerCase()));
  }, [influencers, query]);
  return <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Start typing influencer's handle
      </label>
      <div className="relative">
        <input type="text" value={query} onChange={e => {
        setQuery(e.target.value);
        setShowDropdown(true);
      }} onFocus={() => setShowDropdown(true)} onBlur={() => {
        // Delay hiding to allow clicking
        setTimeout(() => setShowDropdown(false), 200);

        // Update if matches an influencer
        const match = influencers.find(inf => inf.handle.toLowerCase() === query.toLowerCase());
        if (match) {
          onChange(match.handle);
        }
      }} className="w-full p-2.5 pl-10 border border-gray-300 rounded-md" placeholder="@username" />

        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="faSearch" className="h-5 w-5 text-gray-400" solid={false} />
        </div>
        
        {/* Show filtered influencers */}
        {showDropdown && filteredInfluencers.length > 0 && <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredInfluencers.map(inf => <div key={inf.id} className="p-2 hover:bg-gray-50 cursor-pointer" onClick={() => {
          setQuery(inf.handle);
          onChange(inf.handle);
          setShowDropdown(false);
        }}>

                <div className="flex items-center">
                  <div className="h-7 w-7 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
                    <span className="text-xs text-white">
                      {inf.handle.substring(1, 3).toUpperCase()}
                    </span>
                  </div>
                  <p className="ml-2 text-sm text-gray-700">{inf.handle}</p>
                  <span className="ml-2 text-xs text-gray-500">{inf.followers || '7k'}</span>
                </div>
              </div>)}
          </div>}
      </div>
      
      {/* Display selected influencer */}
      {value && <div className="mt-2 p-2 bg-gray-50 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-2">
              <div className="h-7 w-7 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
                <span className="text-xs text-white">{value.substring(1, 3).toUpperCase()}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700">{value}</p>
            <span className="ml-2 text-xs text-gray-500">
              {influencers.find(inf => inf.handle === value)?.followers || '7k'}
            </span>
          </div>
        </div>}
    </div>;
};

// =============================================================================
// UPLOADED FILE COMPONENT
// =============================================================================

interface UploadedFileProps {
  asset: Asset;
  onDelete: (asset: Asset) => void;
  onUpdate: (updatedAsset: Asset) => void;
  currencySymbol: string;
  influencers: Influencer[];
}
const UploadedFile: React.FC<UploadedFileProps> = ({
  asset,
  onDelete,
  onUpdate,
  currencySymbol,
  influencers
}) => {
  // Single unified name state that updates both fileName and assetName
  const [assetName, setAssetName] = useState(asset.details.assetName || asset.fileName);
  const [whyInfluencer, setWhyInfluencer] = useState(asset.details.whyInfluencer || "");
  const [budget, setBudget] = useState(asset.details.budget?.toString() || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Enhanced saveChanges function with robust error handling
  const saveChanges = async () => {
    try {
      // Generate correlation ID for tracing
      const correlationId = generateCorrelationId();
      console.log(`[${correlationId}] Starting asset name update:`, {
        assetId: asset.id,
        currentName: asset.fileName || asset.details?.assetName,
        newName: assetName
      });

      // 1. Sanitize and validate the file name
      const sanitizedFileName = sanitizeFileName(assetName);
      if (!isValidFileName(sanitizedFileName)) {
        toast.error('Invalid file name. Please use only letters, numbers, spaces, and common punctuation.');
        return;
      }

      // 2. Create updated asset with the unified name
      const updatedAsset = {
        ...asset,
        fileName: sanitizedFileName,
        // For UI consistency
        details: {
          ...asset.details,
          assetName: sanitizedFileName,
          // For database consistency
          whyInfluencer: whyInfluencer,
          budget: parseFloat(budget) || 0
        }
      };

      // 3. Implement retry logic with exponential backoff
      const maxRetries = 3;
      let attempt = 0;
      let success = false;
      while (attempt < maxRetries && !success) {
        try {
          console.log(`[${correlationId}] Updating asset (attempt ${attempt + 1}/${maxRetries})`);

          // Call the parent update function
          await onUpdate(updatedAsset);
          success = true;

          // Exit edit mode on success
          setIsEditingName(false);
          toast.success('Asset name updated successfully');
          console.log(`[${correlationId}] Asset name update completed successfully`);
        } catch (error) {
          attempt++;
          console.error(`[${correlationId}] Update failed (attempt ${attempt}/${maxRetries}):`, error);
          if (attempt >= maxRetries) {
            // All retries failed
            toast.error('Failed to update asset name');
            console.error(`[${correlationId}] All update attempts failed`);
          } else {
            // Exponential backoff with jitter
            const delay = Math.floor(Math.random() * 100) + Math.pow(2, attempt) * 300;
            console.log(`[${correlationId}] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error in saveChanges:', error);
      toast.error('An unexpected error occurred while updating the asset name');
    }
  };
  const handleInfluencerChange = (influencerHandle: string) => {
    // Find the selected influencer to get its platform
    const selectedInfluencer = influencers.find(inf => inf.handle === influencerHandle);
    onUpdate({
      ...asset,
      details: {
        ...asset.details,
        influencerHandle: influencerHandle,
        platform: selectedInfluencer?.platform || asset.details.platform
      }
    });
  };

  // Enhanced toggleNameEdit function with validation and error handling
  const toggleNameEdit = () => {
    try {
      if (isEditingName) {
        // Validate the name before saving
        if (!assetName || assetName.trim() === '') {
          // Don't allow empty names
          toast.error('Asset name cannot be empty');
          return;
        }

        // If we're currently editing, save changes
        saveChanges();
      }

      // Toggle editing state
      setIsEditingName(!isEditingName);

      // If starting edit, log for debugging
      if (!isEditingName) {
        console.log('Started editing asset name:', {
          id: asset.id,
          currentName: assetName
        });
      }
    } catch (error) {
      console.error('Error in toggleNameEdit:', error);
      toast.error('Error toggling name edit mode');
      // Ensure we exit edit mode on error
      setIsEditingName(false);
    }
  };

  // Handle Enter key press to save name
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      toggleNameEdit();
    }
  };

  // Enhanced delete asset handler with proper cleanup
  const handleDeleteAsset = async () => {
    setIsDeleting(true);
    const correlationId = `delete-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    try {
      console.log(`[${correlationId}] Deleting asset: ${asset.id}`);

      // 1. First attempt to remove from cloud storage
      let deletedFromStorage = false;
      if (asset.url) {
        deletedFromStorage = await deleteAssetFromStorage(asset.url);
        if (!deletedFromStorage) {
          console.warn(`[${correlationId}] Storage deletion failed, continuing with state update`);
        }
      }

      // 2. Update local state regardless of storage deletion success
      onDelete(asset);
      toast.success('Asset deleted successfully');

      // 3. Log orphaned assets for background cleanup
      if (asset.url && !deletedFromStorage) {
        try {
          await logOrphanedAsset(asset.url, asset.id);
          console.log(`[${correlationId}] Logged orphaned asset for cleanup: ${asset.id}`);
        } catch (e) {
          console.error(`[${correlationId}] Failed to log orphaned asset:`, e);
        }
      }
    } catch (error) {
      console.error(`[${correlationId}] Error deleting asset:`, error);
      toast.error('Failed to delete asset. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  return <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex p-4 items-start gap-4">
        {/* Preview directly in the asset card with enhanced format detection */}
        <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
          {asset.type.startsWith('video') ? <div className="relative">
              <video src={asset.url} className="w-full h-full object-cover rounded-md" />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                <Icon name="faChevronRight" className="h-8 w-8 text-white" solid={false} />
              </div>
            </div> : asset.type.startsWith('application') ? <div className="w-full h-full flex items-center justify-center">
              <Icon name="faInfo" className="h-10 w-10 text-gray-400" solid={false} />
            </div> : asset.type.startsWith('image') ? <img src={asset.url} alt={asset.details?.assetName || 'Asset preview'} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center">
              <Icon name="faInfo" className="h-10 w-10 text-gray-400" solid={false} />
              <p className="text-sm text-gray-500 mt-2">Preview not available</p>
            </div>}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="w-full">
              {/* Single unified asset name field that updates both properties */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Name
                </label>
                <div className="flex items-center">
                  {isEditingName ? <div className="flex w-full">
                      <input type="text" value={assetName} onChange={e => setAssetName(e.target.value)} onBlur={toggleNameEdit} onKeyDown={handleKeyDown} className="w-full p-2 border border-blue-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 bg-blue-50" autoFocus />

                      <button className="px-2 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600" onClick={toggleNameEdit} title="Save asset name">

                        <Icon name="faCheck" className="h-5 w-5" solid={false} />
                      </button>
                    </div> : <div className="flex items-center w-full border border-gray-200 rounded-md p-2 bg-gray-50">
                      <span className="text-gray-700 font-medium truncate max-w-xs">{assetName}</span>
                      <button onClick={toggleNameEdit} className="text-gray-400 hover:text-indigo-600 transition-colors ml-3" title="Edit asset name">

                        <Icon name="faEdit" className="h-4 w-4" solid={false} />
                      </button>
                    </div>}
                </div>
              </div>
            </div>

            <button onClick={handleDeleteAsset} className="ml-2 text-gray-400 hover:text-red-600 transition-colors group" aria-label="Delete asset">

              <Icon name="faDelete" action="delete" className="h-5 w-5" solid={false} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`influencer-${asset.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Influencer
              </label>
              {influencers.length > 0 ? <select id={`influencer-${asset.id}`} value={asset.details.influencerHandle || ''} onChange={e => handleInfluencerChange(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">

                  <option value="">Select an influencer</option>
                  {influencers.map(inf => <option key={inf.id} value={inf.handle}>
                      {inf.handle} ({inf.platform})
                    </option>)}
                </select> : <div className="p-2 bg-yellow-50 text-yellow-700 text-sm rounded-md">
                  No influencers found. Add influencers in Step 1.
                </div>}
            </div>

            <div>
              <label htmlFor={`budget-${asset.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Budget
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
                </div>
                <input id={`budget-${asset.id}`} type="number" value={budget} onChange={e => setBudget(e.target.value)} onBlur={saveChanges} className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="0.00" min="0" step="0.01" />

              </div>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor={`why-influencer-${asset.id}`} className="block text-sm font-medium text-gray-700 mb-1">
              Why this influencer?
            </label>
            <textarea id={`why-influencer-${asset.id}`} value={whyInfluencer} onChange={e => setWhyInfluencer(e.target.value)} onBlur={saveChanges} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Why is this influencer a good fit?" rows={2} />

          </div>
        </div>
      </div>
    </div>;
};

// =============================================================================
// PREVIEW MODAL
// =============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children
}) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>

      <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full" onClick={e => e.stopPropagation()}>

        {children}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">

          Close
        </button>
      </div>
    </div>;
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function FormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const {
    data: wizardData,
    updateData,
    campaignData,
    loading: wizardLoading,
    updateCampaignData
  } = useWizard();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<Asset | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingInfluencers, setIsLoadingInfluencers] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [redirect, setRedirect] = useState<string | null>(null);

  // Extract campaign influencers from step 1 - fixing the data extraction from API/DB
  const campaignInfluencers = useMemo((): Influencer[] => {
    setIsLoadingInfluencers(true);

    // Get influencers directly from API data if available
    if (campaignData?.influencers && Array.isArray(campaignData.influencers)) {
      setIsLoadingInfluencers(false);
      return campaignData.influencers.map(inf => ({
        id: inf.id || `inf-${inf.handle}`,
        handle: inf.handle,
        platform: inf.platform,
        followers: inf.followers || undefined
      }));
    }

    // Alternative: Get from wizard data overview with default platform
    const defaultInfluencer = wizardData?.overview?.influencerHandle ? [{
      id: 'default-influencer',
      handle: wizardData.overview.influencerHandle,
      platform: wizardData.overview.platform || 'INSTAGRAM',
      followers: undefined
    }] : [];

    // Get from Step 1 custom influencers array
    const wizardDataAny = wizardData as any;
    let step1Influencers: Influencer[] = [];

    // Explicitly check all possible paths where influencers might be stored
    if (wizardDataAny?.influencers && Array.isArray(wizardDataAny.influencers)) {
      step1Influencers = wizardDataAny.influencers;
    } else if (wizardDataAny?.overview?.influencers && Array.isArray(wizardDataAny.overview.influencers)) {
      step1Influencers = wizardDataAny.overview.influencers;
    }

    // Debugging aid for troubleshooting
    console.log('Found influencers:', [...defaultInfluencer, ...step1Influencers]);
    setIsLoadingInfluencers(false);
    return [...defaultInfluencer, ...step1Influencers];
  }, [wizardData, campaignData]);

  // Extract currency from Step 1 - fix to ensure correct currency symbol
  const currencyCode = useMemo(() => {
    // Try to get from campaign data first (API)
    if (campaignData?.currency) {
      return campaignData.currency;
    }

    // Then try wizard data
    return wizardData?.overview?.currency || 'USD';
  }, [wizardData?.overview, campaignData]);

  // Get currency symbol for display
  const currencySymbol = useMemo(() => {
    // Add logging to help debug currency issues
    console.log('Currency code:', currencyCode);
    return CURRENCY_SYMBOLS[currencyCode as keyof typeof CURRENCY_SYMBOLS] || '$';
  }, [currencyCode]);
  const initialValues: CreativeValues = {
    assets: []
  };

  // Update context with new assets
  const handleAssetsAdded = useCallback((newAssets: Asset[]) => {
    // Create unique IDs for each asset
    const assetsWithIds = newAssets.map(asset => ({
      ...asset,
      id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    }));

    // Auto-assign influencers if we have them from step 1
    const assetsWithInfluencers = assetsWithIds.map(asset => {
      // If we have influencers and this asset doesn't have one yet
      if (campaignInfluencers.length > 0 && (!asset.details || !asset.details.influencerHandle)) {
        const defaultInfluencer = campaignInfluencers[0];
        return {
          ...asset,
          details: {
            ...asset.details,
            assetName: asset.fileName || `Asset ${assets.length + 1}`,
            influencerHandle: defaultInfluencer.handle,
            platform: defaultInfluencer.platform,
            budget: 0,
            description: ''
          }
        };
      }
      return asset;
    });

    // Combine existing and new assets
    const updatedAssets = [...assets, ...assetsWithInfluencers];
    setAssets(updatedAssets);

    // Update wizard context with the correct section name and data structure
    // Following database schema best practices
    updateData('assets', {
      files: updatedAssets.map(asset => ({
        id: asset.id,
        url: asset.url,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
        type: asset.type,
        details: asset.details,
        tags: []
      }))
    });

    // Also update the creative section for better DB compatibility
    (updateData as any)('creative', {
      creativeAssets: updatedAssets.map(asset => ({
        id: asset.id,
        name: asset.details.assetName,
        description: asset.details.description || '',
        url: asset.url,
        type: asset.type,
        fileSize: asset.fileSize,
        format: asset.type,
        influencerHandle: asset.details.influencerHandle || '',
        budget: asset.details.budget || 0,
        whyInfluencer: asset.details.whyInfluencer || ''
      }))
    });

    // Show success message with options parameter
    toast.success(`${newAssets.length} file(s) added successfully`, {
      duration: 3000,
      position: 'top-center'
    });
  }, [assets, updateData, campaignInfluencers]);

  // Enhanced processAssetsForSubmission with validation and robust fallbacks
  const processAssetsForSubmission = () => {
    try {
      // Add validation to make sure we only process valid assets
      if (!assets || !Array.isArray(assets) || assets.length === 0) {
        console.warn('No assets found to process');
        return [];
      }

      // First filter out any invalid assets
      const validAssets = assets.filter(asset => asset && typeof asset === 'object' && asset.url);

      // Then map the valid assets
      return validAssets.map(asset => {
        // Get a clean type value with fallbacks
        const detectedType = detectFileType(asset.url, asset.type) || 'image';

        // Safely extract format - avoid split() errors
        let format = 'unknown';
        if (asset.type) {
          if (typeof asset.type === 'string' && asset.type.includes('/')) {
            format = asset.type.split('/')[1] || 'unknown';
          } else {
            // Fallback for non-MIME format types
            format = detectedType;
          }
        }

        // Ensure all required fields are present with proper fallbacks
        return {
          id: asset.id || `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          url: asset.url || '',
          fileName: asset.fileName || asset.details?.assetName || 'Unnamed Asset',
          fileSize: typeof asset.fileSize === 'number' ? asset.fileSize : 0,
          type: detectedType === 'video' ? 'video' : 'image',
          // For database schema compatibility
          format: format,
          details: {
            assetName: asset.details?.assetName || asset.fileName || 'Unnamed Asset',
            budget: typeof asset.details?.budget === 'number' ? asset.details.budget : 0,
            description: asset.details?.description || '',
            influencerHandle: asset.details?.influencerHandle || '',
            platform: asset.details?.platform || '',
            whyInfluencer: asset.details?.whyInfluencer || ''
          }
        };
      });
    } catch (error) {
      console.error('Error in processAssetsForSubmission:', error);
      // Return empty array as fallback
      return [];
    }
  };

  // Enhanced handleSubmit with correct formatting for API
  const handleSubmit = async (values: any) => {
    // Generate correlation ID for request tracing
    const correlationId = generateCorrelationId();
    console.log(`[${correlationId}] Starting form submission`);
    try {
      setIsSaving(true);
      setError(null);

      // Set the redirect destination to step-5 (Review) instead of submission
      setRedirect(`/campaigns/wizard/step-5?id=${campaignId}`);

      // 1. Process and validate assets
      const processedAssets = processAssetsForSubmission();
      if (processedAssets.length === 0) {
        toast.error("Please add at least one asset before submitting.");
        return;
      }

      // 2. Format data for the CampaignWizard model (not CampaignWizardSubmission)
      const formattedData = {
        step: 4,
        // Assets are stored directly in the CampaignWizard model's assets JSON field
        creativeAssets: processedAssets.map(asset => ({
          id: asset.id,
          type: asset.type.includes('video') ? 'video' : 'image',
          url: asset.url,
          name: asset.fileName || asset.details?.assetName || 'Untitled Asset',
          description: asset.details?.description || asset.details?.whyInfluencer || "",
          influencerHandle: asset.details?.influencerHandle || "",
          budget: Number(asset.details?.budget) || 0,
          format: asset.type && asset.type.includes('/') ? asset.type.split('/')[1] : "unknown",
          fileSize: asset.fileSize || 0
        }))
      };

      // 3. Log the formatted data being sent to the API for debugging
      console.log(`[${correlationId}] Submitting data to API:`, JSON.stringify(formattedData, null, 2));

      // 4. Implement retry logic with exponential backoff
      const maxRetries = 3;
      let attempt = 0;
      let success = false;
      while (attempt < maxRetries && !success) {
        try {
          console.log(`[${correlationId}] Submitting to API (attempt ${attempt + 1}/${maxRetries})`);
          const response = await fetch(`/api/campaigns/${campaignId}/steps`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-Correlation-ID': correlationId
            },
            body: JSON.stringify(formattedData)
          });
          console.log(`[${correlationId}] API Response status:`, response.status);
          if (!response.ok) {
            const errorData = await response.json();
            console.error(`[${correlationId}] API error response:`, errorData);
            if (errorData.validationErrors) {
              const errorMessages = Object.entries(errorData.validationErrors).map(([field, message]) => `${field}: ${message}`).join(', ');
              throw new Error(`Validation errors: ${errorMessages}`);
            } else if (errorData.error) {
              throw new Error(errorData.error);
            } else {
              throw new Error(`API error (${response.status})`);
            }
          }

          // Process successful response
          const data = await response.json();
          console.log(`[${correlationId}] API success response:`, data);

          // Update wizard context with the correct data
          updateCampaignData({
            step4Complete: true,
            creative: {
              creativeAssets: formattedData.creativeAssets
            }
          });
          toast.success('Campaign assets saved successfully!');
          success = true;
          if (redirect) {
            router.push(redirect);
          }
        } catch (error: unknown) {
          attempt++;
          console.error(`[${correlationId}] API call failed (attempt ${attempt}/${maxRetries}):`, error);
          if (attempt >= maxRetries) {
            // All retries failed
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`Failed to save campaign: ${errorMessage}`);
            setError(errorMessage || 'Error updating campaign step');
          } else {
            // Exponential backoff with jitter
            const delay = Math.pow(2, attempt) * 500 + Math.floor(Math.random() * 100);
            console.log(`[${correlationId}] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    } catch (error: unknown) {
      console.error('Unexpected error during submission:', error);
      toast.error('An unexpected error occurred. Please try again later.');
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Enhanced data loading to handle multiple data structures
  useEffect(() => {
    // First check if we have data in the creative section (new format)
    const wizardDataAny = wizardData as any;

    // Check for assets in the CampaignWizard model (stored directly in assets field)
    if (campaignData?.assets && Array.isArray(campaignData.assets)) {
      console.log('Loading assets from CampaignWizard.assets:', campaignData.assets);
      const existingAssets = campaignData.assets.map((asset: any, index: number) => {
        // Extract the asset name, prioritizing what was previously saved
        const savedName = asset.name || '';

        // Map from database format to UI format
        const assetDetails: AssetDetails = {
          assetName: savedName,
          // Use the saved name as the displayed name
          budget: typeof asset.budget === 'number' ? asset.budget : 0,
          description: asset.description || '',
          influencerHandle: asset.influencerHandle || '',
          platform: asset.platform || '',
          whyInfluencer: asset.description || '' // Use description as fallback
        };

        // Ensure each asset has a unique ID
        const uniqueId = asset.id || `generated-asset-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`;
        return {
          id: uniqueId,
          url: asset.url,
          fileName: savedName,
          // Use the saved name as the file name for consistency
          fileSize: asset.fileSize || 0,
          type: asset.type || 'image',
          // Default to image if type is missing
          progress: 100,
          // Complete progress for loaded assets
          details: assetDetails
        } as Asset;
      });
      console.log('Loaded existing assets from CampaignWizard.assets:', existingAssets);
      setAssets(existingAssets);
    }
    // Then check if we have data in the creative section (new format)
    else if (wizardDataAny?.creative?.creativeAssets && Array.isArray(wizardDataAny.creative.creativeAssets)) {
      const existingAssets = wizardDataAny.creative.creativeAssets.map((asset: any, index: number) => {
        // Map from database format to UI format
        const assetDetails: AssetDetails = {
          // Handle different field names between DB and UI
          assetName: asset.name || asset.title || '',
          budget: typeof asset.budget === 'number' ? asset.budget : typeof asset.influencerBudget === 'number' ? asset.influencerBudget : 0,
          description: asset.description || '',
          influencerHandle: asset.influencerHandle || '',
          platform: asset.platform || '',
          whyInfluencer: asset.description || '' // Use description as fallback
        };

        // Ensure each asset has a unique ID
        const uniqueId = asset.id || `generated-asset-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`;
        return {
          id: uniqueId,
          url: asset.url,
          fileName: asset.name || asset.title || `Asset ${index + 1}`,
          fileSize: asset.fileSize || 0,
          type: asset.type || 'image',
          // Default to image if type is missing
          progress: 100,
          // Complete progress for loaded assets
          details: assetDetails
        } as Asset;
      });
      console.log('Loaded existing assets from creative.creativeAssets:', existingAssets);
      setAssets(existingAssets);
    }
    // Also check legacy asset.files structure
    else if (wizardData?.assets?.files && wizardData.assets.files.length > 0) {
      // Convert from the old format
      const existingAssets = wizardData.assets.files.filter((file: any) => file.url) // Only include files with a URL
      .map((file: any, index: number) => {
        // Create a standardized asset object
        return {
          id: file.id || `legacy-asset-${Date.now()}-${index}`,
          url: file.url,
          fileName: file.fileName || `Asset ${index + 1}`,
          fileSize: file.fileSize || 0,
          type: file.type || detectFileType(file.url) || 'image',
          progress: 100,
          details: {
            assetName: file.details?.assetName || file.fileName || `Asset ${index + 1}`,
            budget: file.details?.budget || 0,
            description: file.details?.description || '',
            influencerHandle: file.details?.influencerHandle || '',
            platform: file.details?.platform || '',
            whyInfluencer: file.details?.whyInfluencer || ''
          }
        } as Asset;
      });
      console.log('Loaded existing assets from assets.files:', existingAssets);
      setAssets(existingAssets);
    } else {
      console.log('No existing assets found in any data structure');
    }
  }, [wizardData, campaignData]);

  // Add a useEffect to track dirty state when assets change
  useEffect(() => {
    if (assets.length > 0) {
      setDirty(true);
    }
  }, [assets]);

  // Handle asset deletion
  const handleDeleteAsset = (asset: Asset) => {
    setConfirmDeleteAsset(asset);
  };
  const confirmDelete = async () => {
    if (confirmDeleteAsset) {
      try {
        // Delete the asset from uploadthing to prevent orphaned files
        if (confirmDeleteAsset.url) {
          const response = await fetch('/api/uploadthing/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url: confirmDeleteAsset.url
            })
          });
          if (!response.ok) {
            console.error('Failed to delete asset from UploadThing:', await response.json());
            // Continue with UI update even if cloud delete fails
          }
        }

        // Remove from local state
        setAssets(prev => prev.filter(a => a.id !== confirmDeleteAsset.id));
        setConfirmDeleteAsset(null);

        // Show success message
        toast.success('Asset deleted successfully');
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast.error('Failed to delete asset. Please try again.');
      }
    }
  };

  // Enhanced handleSaveDraft function with correct API formatting
  const handleSaveDraft = async (values: CreativeValues) => {
    try {
      setIsSaving(true);
      setError(null);
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }

      // Process assets for submission
      const processedAssets = processAssetsForSubmission();
      if (processedAssets.length === 0) {
        toast.error("No assets to save. Please add at least one asset.");
        return;
      }

      // Format data to match EXACTLY what the API expects
      const formattedData = {
        // Required: step number for the API to know which case to handle
        step: 4,
        // These fields are expected in case 4 of the API
        creativeGuidelines: "",
        // Add empty values even if not used
        creativeNotes: "",
        // The essential creativeAssets data
        creativeAssets: processedAssets.map(asset => ({
          id: asset.id,
          // Include ID for tracking
          type: asset.type.includes('video') ? 'video' : 'image',
          url: asset.url,
          name: asset.details.assetName,
          // Use 'name' to match backend field
          description: asset.details.description || asset.details.whyInfluencer || '',
          influencerHandle: asset.details.influencerHandle || '',
          budget: Number(asset.details.budget) || 0,
          fileSize: asset.fileSize || 0,
          format: asset.type.includes('/') ? asset.type.split('/')[1] : 'unknown'
        }))
      };

      // Debug logging
      console.log('Saving draft with data:', JSON.stringify(formattedData, null, 2));

      // Save to API with correct structure
      const response = await fetch(`/api/campaigns/${campaignId}/steps`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formattedData
          // Do not set step4Complete for drafts
        })
      });

      // Handle errors with more detailed information
      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("Error response from API:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response', parseError);
        }
        throw new Error(errorMessage);
      }

      // Handle successful save
      const result = await response.json();

      // Update wizard context with the correct data structure
      if (updateData) {
        // Update assets section for wizard context (standard interface)
        updateData('assets', {
          files: processedAssets.map(asset => ({
            id: asset.id,
            url: asset.url,
            fileName: asset.fileName,
            fileSize: asset.fileSize,
            type: asset.type,
            details: asset.details,
            tags: [] // Required by WizardData interface
          }))
        });

        // Also update the creative section for database compatibility
        (updateData as any)('creative', {
          creativeAssets: formattedData.creativeAssets
        });

        // Reset dirty state after saving
        setDirty(false);
      }

      // Show success message
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error("Failed to save draft:", error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
      toast.error(`Failed to save draft: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };
  if (wizardLoading) {
    return <div className="flex items-center justify-center min-h-screen">
        <WizardSkeleton step={4} />
      </div>;
  }
  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600">{error}</p>
        <button onClick={() => router.push('/campaigns')} className="mt-4 btn btn-secondary">

          Return to Campaigns
        </button>
      </div>;
  }
  return <div className="w-full max-w-6xl mx-auto px-6 py-8 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Campaign Creation</h1>
        <p className="text-gray-500">Complete all required fields to create your campaign</p>
      </div>
      
      <Formik initialValues={initialValues} validationSchema={CreativeSchema} onSubmit={handleSubmit} enableReinitialize={true}>

        {({
        values,
        setFieldValue,
        submitForm,
        isValid,
        dirty
      }) => {
        return <>
              <Form className="space-y-6">
                {/* Asset Upload Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Upload</h2>
                  {campaignId ? <UploadArea campaignId={campaignId} onAssetsAdded={handleAssetsAdded} /> : <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800">
                        Campaign ID is required to upload assets. Please save the campaign first.
                      </p>
                    </div>}
                  
                  {/* Uploaded Files Area */}
                  {assets.length > 0 && <div className="mt-6 space-y-2">
                      {assets.map(asset => <div key={asset.id} className="mb-2">
                            <UploadedFile asset={asset} onDelete={() => handleDeleteAsset(asset)} onUpdate={updatedAsset => {
                    setAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
                  }} currencySymbol={currencySymbol} influencers={campaignInfluencers} />

                        </div>)}
                    </div>}
                </div>
                
                {/* Asset Details Section - removed as per Figma design */}
                
                {/* Add bottom padding to prevent progress bar overlap */}
                <div className="pb-24"></div>
              </Form>
              
              <ProgressBar currentStep={4} onStepClick={step => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)} onBack={() => router.push(`/campaigns/wizard/step-3?id=${campaignId}`)} onNext={() => {
            // First save the form data
            handleSaveDraft(values);
            // Then navigate directly to step 5
            router.push(`/campaigns/wizard/step-5?id=${campaignId}`);
          }} onSaveDraft={() => handleSaveDraft(values)} disableNext={assets.length === 0 || assets.some(a => !a.details.assetName || !a.details.influencerHandle || !a.details.budget || a.details.budget <= 0)} isFormValid={isValid} isDirty={dirty} isSaving={isSaving} />

            </>;
      }}
      </Formik>
      
      {/* Preview Modal */}
      <Modal isOpen={!!previewAsset} onClose={() => setPreviewAsset(null)}>

        {previewAsset && <div>
            <h2 className="text-xl font-bold mb-4">Preview: {previewAsset.fileName || previewAsset.details.assetName}</h2>
            {previewAsset.url ? <div className="w-full max-h-[70vh] overflow-hidden rounded-lg">
                <AssetPreview url={previewAsset.url} fileName={previewAsset.fileName || previewAsset.details.assetName} type={previewAsset.type} className="w-full h-full object-contain" />

              </div> : <p className="mb-4">No preview available.</p>}
          </div>}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!confirmDeleteAsset} onClose={() => setConfirmDeleteAsset(null)}>

        <div>
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p className="mb-4">Are you sure you want to delete this asset? This action cannot be undone.</p>
          <div className="flex space-x-4">
            <button onClick={() => setConfirmDeleteAsset(null)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">

              Cancel
            </button>
            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">

              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>;
}
export default function Step4Content() {
  const [isClientSide, setIsClientSide] = useState(false);
  
  useEffect(() => {
    setIsClientSide(true);
  }, []);
  
  if (!isClientSide) {
    return <WizardSkeleton step={4} />;
  }
  
  return <div className="min-h-screen bg-white">
      <Suspense fallback={<WizardSkeleton step={4} />}>
        <FormContent />
      </Suspense>
    </div>;
}

// Add functions for Phyllo API integration
async function validateInfluencerHandle(platform: string, handle: string): Promise<any> {
  try {
    const response = await fetch(`/api/influencers/validate?platform=${encodeURIComponent(platform)}&handle=${encodeURIComponent(handle)}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate influencer');
    }
    const data = await response.json();
    return data.influencer || null;
  } catch (error) {
    console.error('Error validating influencer:', error);
    return null;
  }
}