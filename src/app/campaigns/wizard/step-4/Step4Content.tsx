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
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  PencilSquareIcon,
  TrashIcon,
  InformationCircleIcon,
  DocumentIcon
} from "@heroicons/react/24/outline";
import { CampaignAssetUploader, UploadedAsset } from "@/components/upload/CampaignAssetUploader";
import { AssetPreview } from '@/components/upload/AssetPreview';

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

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const AssetDetailsSchema = Yup.object().shape({
  assetName: Yup.string().required("Asset name is required"),
  influencer: Yup.string().required("Influencer handle is required"),
  whyInfluencer: Yup.string().required("Please explain why you chose this influencer"),
  budget: Yup.number()
    .typeError("Budget must be a valid number.")
    .positive("Budget cannot be negative.")
    .required("Budget is required.")
});

const CreativeSchema = Yup.object().shape({
  assets: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      progress: Yup.number().min(100, "Upload must be complete"),
      details: AssetDetailsSchema
    })
  )
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

// Currency symbol mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  // Add more as needed
};

// =============================================================================
// UPLOAD AREA (Drag & Drop Zone)
// =============================================================================

interface UploadAreaProps {
  campaignId: string;
  onAssetsAdded: (assets: Asset[]) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ campaignId, onAssetsAdded }) => {
  const handleUploadComplete = useCallback((uploadedAssets: UploadedAsset[]) => {
    // Convert UploadedAsset to Asset format
    const newAssets: Asset[] = uploadedAssets.map(upload => ({
      id: upload.id,
      url: upload.url,
      fileName: upload.fileName,
      fileSize: upload.fileSize,
      type: upload.type, // Ensure type is included
      progress: 100, // Already completed upload
      details: {
        assetName: upload.fileName,
        budget: 0,
        description: '',
      }
    }));
    
    // Add to asset list
    onAssetsAdded(newAssets);
  }, [onAssetsAdded]);
  
  const handleUploadError = useCallback((error: Error) => {
    console.error("Upload error:", error);
    toast.error(`Upload failed: ${error.message}`);
  }, []);

  return (
    <div className="relative w-full transition-all duration-300">
      <CampaignAssetUploader
        campaignId={campaignId}
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
      />
    </div>
  );
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
}) => (
  <div className="relative flex items-center max-w-[150px]">
    <div className="absolute left-2 inset-y-0 flex items-center pointer-events-none">
      <span className="text-gray-500 text-sm">{currencySymbol}</span>
    </div>
    <input
      type="number"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className="w-full pl-6 py-1.5 px-2 border border-gray-300 rounded-md text-sm"
      placeholder="500"
      min="0"
      step="10"
    />
  </div>
);

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
    return influencers.filter(inf => 
      inf.handle.toLowerCase().includes(query.toLowerCase())
    );
  }, [influencers, query]);
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Start typing influencer's handle
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            // Delay hiding to allow clicking
            setTimeout(() => setShowDropdown(false), 200);
            
            // Update if matches an influencer
            const match = influencers.find(inf => 
              inf.handle.toLowerCase() === query.toLowerCase()
            );
            if (match) {
              onChange(match.handle);
            }
          }}
          className="w-full p-2.5 pl-10 border border-gray-300 rounded-md"
          placeholder="@username"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Show filtered influencers */}
        {showDropdown && filteredInfluencers.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredInfluencers.map(inf => (
              <div 
                key={inf.id} 
                className="p-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setQuery(inf.handle);
                  onChange(inf.handle);
                  setShowDropdown(false);
                }}
              >
                <div className="flex items-center">
                  <div className="h-7 w-7 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
                    <span className="text-xs text-white">
                      {inf.handle.substring(1, 3).toUpperCase()}
                    </span>
                  </div>
                  <p className="ml-2 text-sm text-gray-700">{inf.handle}</p>
                  <span className="ml-2 text-xs text-gray-500">{inf.followers || '7k'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Display selected influencer */}
      {value && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md">
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
        </div>
      )}
    </div>
  );
};

// =============================================================================
// UPLOADED FILE COMPONENT
// =============================================================================

interface UploadedFileProps {
  asset: Asset;
  onDelete: (asset: Asset) => void;
  onPreview: (asset: Asset) => void;
  onUpdate: (updatedAsset: Asset) => void;
  currencySymbol: string;
  influencers: Influencer[];
}

const UploadedFile: React.FC<UploadedFileProps> = ({
  asset,
  onDelete,
  onPreview,
  onUpdate,
  currencySymbol,
  influencers
}) => {
  const [editAssetName, setEditAssetName] = useState(asset.details.assetName);
  const [whyInfluencer, setWhyInfluencer] = useState(asset.details.whyInfluencer || "");
  const [budget, setBudget] = useState(asset.details.budget?.toString() || "");

  // Save changes to the asset
  const saveChanges = () => {
    onUpdate({
      ...asset,
      details: {
        assetName: editAssetName,
        influencerHandle: asset.details.influencerHandle,
        whyInfluencer: whyInfluencer,
        budget: parseFloat(budget) || 0,
        description: asset.details.description
      }
    });
  };

  const handleInfluencerChange = (influencerHandle: string) => {
    onUpdate({
      ...asset,
      details: {
        ...asset.details,
        influencerHandle: influencerHandle,
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex p-4 items-center justify-between border-b border-gray-200">
        <div className="flex items-center">
          <DocumentIcon className="h-6 w-6 text-gray-400 mr-3" />
          <span className="font-medium text-gray-700">{asset.fileName || asset.details.assetName}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(asset)}
            className="text-blue-600 hover:text-blue-800"
          >
            Preview
          </button>
          <button
            onClick={() => onDelete(asset)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Asset Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            Asset Name
            <InformationCircleIcon className="h-4 w-4 text-blue-500 ml-1 cursor-help" title="Give your asset a descriptive name" />
          </label>
          <input
            type="text"
            value={editAssetName}
            onChange={(e) => setEditAssetName(e.target.value)}
            onBlur={saveChanges}
            className="w-full p-2.5 border border-gray-300 rounded-md"
            placeholder="File.MP4"
          />
        </div>

        {/* Influencer Selector */}
        <InfluencerSelector
          assetId={asset.id}
          influencers={influencers}
          value={asset.details.influencerHandle || ''}
          onChange={handleInfluencerChange}
        />

        {/* Why this influencer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            Why this influencer?
            <InformationCircleIcon className="h-4 w-4 text-blue-500 ml-1 cursor-help" title="Explain why you chose this influencer" />
          </label>
          <textarea
            value={whyInfluencer}
            onChange={(e) => setWhyInfluencer(e.target.value)}
            onBlur={saveChanges}
            className="w-full p-2.5 border border-gray-300 rounded-md"
            rows={3}
            placeholder="High engagement rate with our target audience and strong presence on Instagram."
          />
          {whyInfluencer && (
            <div className="text-right text-xs text-gray-500 mt-1">
              {whyInfluencer.length}/3000
            </div>
          )}
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            Budget for Influencer
            <InformationCircleIcon className="h-4 w-4 text-blue-500 ml-1 cursor-help" title="Set the budget for this influencer" />
          </label>
          <BudgetInput
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            onBlur={saveChanges}
            currencySymbol={currencySymbol}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={() => onDelete(asset)}
            className="flex-1 p-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </button>
          <button
            type="button"
            onClick={() => saveChanges()}
            className="flex-1 p-2.5 bg-gray-800 text-white rounded-md hover:bg-gray-900 flex items-center justify-center"
          >
            <PencilSquareIcon className="h-5 w-5 mr-2" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PREVIEW MODAL
// =============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
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
  
  // Extract campaign influencers from step 1
  const campaignInfluencers = useMemo((): Influencer[] => {
    // Default influencer from the campaign data
    const defaultInfluencer = wizardData?.overview?.influencerHandle 
      ? [{
          id: 'default-influencer',
          handle: wizardData.overview.influencerHandle,
          platform: wizardData.overview.platform || 'INSTAGRAM',
          followers: '10k'
        }]
      : [];
    
    // Try to get influencers array if it exists in the context
    // Use optional chaining and type assertion to safely access without errors
    const contextInfluencers = (wizardData as any)?.influencers || [];
    
    // Combine both sources
    return [...defaultInfluencer, ...contextInfluencers];
  }, [wizardData?.overview]);
  
  // Extract currency from Step 1
  const currencyCode = useMemo(() => {
    return wizardData?.overview?.currency || 'USD';
  }, [wizardData?.overview]);
  
  // Get currency symbol for display
  const currencySymbol = useMemo(() => {
    return CURRENCY_SYMBOLS[currencyCode] || '$';
  }, [currencyCode]);
  
  const initialValues: CreativeValues = {
    assets: [],
  };

  // Update context with new assets
  const handleAssetsAdded = useCallback((newAssets: Asset[]) => {
    // Combine existing and new assets
    const updatedAssets = [...assets, ...newAssets];
    setAssets(updatedAssets);
    
    // Update wizard context with the correct section name and data structure
    updateData('assets', { 
      files: updatedAssets.map(asset => ({
        url: asset.url,
        tags: []
      }))
    });
    
    // Show success message with options parameter
    toast.success(`${newAssets.length} file(s) added successfully`, {
      duration: 3000,
      position: 'top-center'
    });
  }, [assets, updateData]);

  // Type-safe asset handling
  const processAssetsForSubmission = () => {
    return assets.map(asset => ({
      id: asset.id,
      url: asset.url,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      type: asset.type || 'image', // Ensure type has default value
      details: {
        assetName: asset.details.assetName,
        budget: asset.details.budget,
        description: asset.details.description || '',
        influencerHandle: asset.details.influencerHandle || '',
        platform: asset.details.platform || ''
      }
    }));
  };

  // When handling form submission
  const handleSubmit = async (values: any) => {
    try {
      setIsSaving(true);
      setError(null);

      // Format data for API
      const formattedData = {
        assets: processAssetsForSubmission()
      };

      // Add currentStep & step4Complete flags
      const apiData = {
        ...formattedData,
        currentStep: 4,
        step4Complete: true
      };

      // Call API
      const response = await fetch(`/api/campaigns/${campaignId}/steps`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save campaign data');
      }

      // Update context
      if (updateCampaignData) {
        updateCampaignData({
          creative: formattedData,
          currentStep: 4,
          step4Complete: true
        });
      }

      // Show success message
      toast.success('Campaign assets saved successfully');

      // Navigate to next step if there is one, or to submission page
      router.push(`/campaigns/wizard/submission?id=${campaignId}`);
    } catch (err: any) {
      const message = err.message || 'An error occurred while saving campaign data';
      console.error('Save error:', message);
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Update any initial data loading code
  useEffect(() => {
    if (wizardData?.assets?.files && Array.isArray(wizardData.assets.files)) {
      const existingAssets = wizardData.assets.files.map((file: any) => {
        // Handle legacy data format
        let assetDetails: AssetDetails = {
          assetName: file.details?.assetName || file.fileName || '',
          budget: Number(file.details?.budget) || 0,
          description: file.details?.description || '',
          // Map legacy 'influencer' to 'influencerHandle'
          influencerHandle: file.details?.influencerHandle || 
                          (file.details as any)?.influencer || '',
          platform: file.details?.platform || '',
          whyInfluencer: file.details?.whyInfluencer || ''
        };
        
        return {
          id: file.id,
          url: file.url,
          fileName: file.fileName,
          fileSize: file.fileSize || 0,
          type: file.url?.includes('.mp4') ? 'video' : 'image',
          progress: 100,
          details: assetDetails
        };
      });
      
      setAssets(existingAssets);
    }
  }, [wizardData]);

  // Handle asset deletion
  const handleDeleteAsset = (asset: Asset) => {
    setConfirmDeleteAsset(asset);
  };

  const confirmDelete = () => {
    if (confirmDeleteAsset) {
      // Here we would ideally also delete the asset from uploadthing
      // by making a call to the uploadthing delete API
      setAssets((prev) => prev.filter((a) => a.id !== confirmDeleteAsset.id));
      setConfirmDeleteAsset(null);
    }
  };

  // Save as draft
  const handleSaveDraft = async (values: CreativeValues) => {
    try {
      setIsSaving(true);
      setError(null);

      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }

      const processedAssets = assets.map(asset => {
        // Find the full influencer data if available
        const influencerData = campaignInfluencers.find(inf => 
          inf.handle === asset.details.influencerHandle
        );
        
        return {
          type: asset.url?.includes('/image/') ? 'image' : 'video',
          url: asset.url,
          fileName: asset.fileName || asset.details.assetName,
          fileSize: asset.fileSize || 0,
          name: asset.details.assetName,
          description: asset.details.description || '',
          format: asset.url?.split('.').pop() || 'unknown',
          influencerHandle: asset.details.influencerHandle || '',
          influencerId: influencerData?.id,
          influencerPlatform: influencerData?.platform,
          whyInfluencer: asset.details.whyInfluencer || '',
          budget: asset.details.budget ? parseFloat(asset.details.budget.toString()) : 0,
          currency: currencyCode,
        };
      });

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creativeAssets: processedAssets,
          submissionStatus: 'draft'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save draft');
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save draft';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (wizardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading campaign data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push('/campaigns')}
          className="mt-4 btn btn-secondary"
        >
          Return to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Campaign Creation</h1>
        <p className="text-gray-500">Complete all required fields to create your campaign</p>
      </div>
      
      <Formik
        initialValues={initialValues}
        validationSchema={CreativeSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, setFieldValue, submitForm, isValid, dirty }) => {
          return (
            <>
              <Form className="space-y-6">
                {/* Asset Upload Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Upload</h2>
                  {campaignId ? (
                    <UploadArea 
                      campaignId={campaignId} 
                      onAssetsAdded={handleAssetsAdded} 
                    />
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800">
                        Campaign ID is required to upload assets. Please save the campaign first.
                      </p>
                    </div>
                  )}
                  
                  {/* Uploaded Files Area */}
                  {assets.length > 0 && (
                    <div className="mt-6 space-y-2">
                      {assets.map((asset) => (
                        <div key={asset.id} className="mb-2">
                          <UploadedFile
                            asset={asset}
                            onPreview={() => setPreviewAsset(asset)}
                            onDelete={() => handleDeleteAsset(asset)}
                            onUpdate={(updatedAsset) => {
                              setAssets(assets.map(a => 
                                a.id === updatedAsset.id ? updatedAsset : a
                              ));
                            }}
                            currencySymbol={currencySymbol}
                            influencers={campaignInfluencers}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Asset Details Section - removed as per Figma design */}
                
                {/* Add bottom padding to prevent progress bar overlap */}
                <div className="pb-24"></div>
              </Form>
              
              <ProgressBar
                currentStep={4}
                onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)}
                onBack={() => router.push(`/campaigns/wizard/step-3?id=${campaignId}`)}
                onNext={submitForm}
                onSaveDraft={() => handleSaveDraft(values)}
                disableNext={
                  assets.length === 0 || 
                  assets.some(a => !a.details.assetName || !a.details.influencerHandle || !a.details.whyInfluencer || !a.details.budget || a.details.budget <= 0)
                }
                isFormValid={isValid}
                isDirty={dirty}
                isSaving={isSaving}
              />
            </>
          );
        }}
      </Formik>
      
      {/* Preview Modal */}
      <Modal
        isOpen={!!previewAsset}
        onClose={() => setPreviewAsset(null)}
      >
        {previewAsset && (
          <div>
            <h2 className="text-xl font-bold mb-4">Preview: {previewAsset.fileName || previewAsset.details.assetName}</h2>
            {previewAsset.url ? (
              <div className="w-full max-h-[70vh] overflow-hidden rounded-lg">
                <AssetPreview 
                  url={previewAsset.url}
                  fileName={previewAsset.fileName || previewAsset.details.assetName}
                  type={previewAsset.type}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <p className="mb-4">No preview available.</p>
            )}
          </div>
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!confirmDeleteAsset} 
        onClose={() => setConfirmDeleteAsset(null)}
      >
        <div>
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p className="mb-4">Are you sure you want to delete this asset? This action cannot be undone.</p>
          <div className="flex space-x-4">
            <button
              onClick={() => setConfirmDeleteAsset(null)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function Step4Content() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<LoadingSpinner />}>
        <FormContent />
      </Suspense>
    </div>
  );
}
