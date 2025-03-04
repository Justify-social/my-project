"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
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

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface Asset {
  id: string;
  file: File;
  progress: number; // 0 to 100
  error?: string;
  details: {
    assetName: string;
    influencer?: string;
    description?: string;
    budget: number;
    whyInfluencer?: string;
  };
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
      file: Yup.mixed().required(),
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
  'video/mp4': ['.mp4'],
  'application/pdf': ['.pdf']
};

// =============================================================================
// UPLOAD AREA (Drag & Drop Zone)
// =============================================================================

interface UploadAreaProps {
  onFilesAdded: (files: FileList) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFilesAdded }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="relative w-full py-10 flex flex-col items-center justify-center transition-all duration-300 bg-white rounded-xl border border-gray-200 shadow-sm"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files) {
          onFilesAdded(e.dataTransfer.files);
        }
      }}
      role="button"
      tabIndex={0}
      onClick={() => fileInputRef.current?.click()}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          fileInputRef.current?.click();
        }
      }}
    >
      <div className="mb-4 p-3 rounded-full bg-gray-100">
        <ArrowUpTrayIcon className="h-7 w-7 text-gray-500" />
      </div>
      <p className="text-gray-600 mb-1">Drag and drop files here or click to upload.</p>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".mp4,.png,.jpeg,.jpg,.gif,.pdf"
        onChange={(e) => {
          if (e.target.files) onFilesAdded(e.target.files);
        }}
        className="hidden"
        aria-label="File upload"
      />
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
  currency?: string;
}

const UploadedFile: React.FC<UploadedFileProps> = ({
  asset,
  onDelete,
  onPreview,
  onUpdate,
  currency = "$"
}) => {
  const [editAssetName, setEditAssetName] = useState(asset.details.assetName);
  const [influencerQuery, setInfluencerQuery] = useState(asset.details.influencer || "");
  const [whyInfluencer, setWhyInfluencer] = useState(asset.details.whyInfluencer || "");
  const [budget, setBudget] = useState(asset.details.budget?.toString() || "");

  // Save changes to the asset
  const saveChanges = () => {
    onUpdate({
      ...asset,
      details: {
        assetName: editAssetName,
        influencer: influencerQuery,
        whyInfluencer: whyInfluencer,
        budget: parseFloat(budget) || 0,
        description: asset.details.description
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex p-4 items-center justify-between border-b border-gray-200">
        <div className="flex items-center">
          <DocumentIcon className="h-6 w-6 text-gray-400 mr-3" />
          <span className="font-medium text-gray-700">{asset.file.name}</span>
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

        {/* Influencer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start typing influencer's handle
          </label>
          <div className="relative">
            <input
              type="text"
              value={influencerQuery}
              onChange={(e) => {
                setInfluencerQuery(e.target.value);
                if (e.target.value.startsWith('@')) {
                  onUpdate({
                    ...asset,
                    details: {
                      ...asset.details,
                      influencer: e.target.value,
                    }
                  });
                }
              }}
              onBlur={saveChanges}
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-md"
              placeholder="@username"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => {
                if (influencerQuery.trim()) {
                  saveChanges();
                }
              }}
            >
              <div className="bg-blue-500 rounded-full p-1">
                <PlusIcon className="h-3 w-3 text-white" />
              </div>
            </button>
          </div>
          {asset.details.influencer && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-2">
                  <div className="h-7 w-7 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
                    <span className="text-xs text-white">{asset.details.influencer.substring(1, 3).toUpperCase()}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{asset.details.influencer}</p>
                <span className="ml-2 text-xs text-gray-500">7k</span>
              </div>
            </div>
          )}
        </div>

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
          <div className="relative flex items-center">
            <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
              <span className="text-gray-500">{currency}</span>
            </div>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onBlur={saveChanges}
              className="w-full pl-8 p-2.5 border border-gray-300 rounded-md"
              placeholder="500"
            />
          </div>
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
  const { data, updateData } = useWizard();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get currency from wizard data
  const currency = data?.overview?.currency || "$";

  const initialValues: CreativeValues = {
    assets: [],
  };

  // Load campaign data
  useEffect(() => {
    let isMounted = true;

    const loadCampaignData = async () => {
      if (!campaignId || isInitialized) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/campaigns/${campaignId}`);
        const result = await response.json();
        
        if (!isMounted) return;

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load campaign');
        }

        if (result.success) {
          updateData(result.campaign, result);
          
          // Transform any existing assets to our format
          if (result.campaign.creativeAssets && Array.isArray(result.campaign.creativeAssets.assets)) {
            // In a real implementation, you would convert the stored assets back to File objects
            // For now, we'll just initialize with empty assets
          }
          
          toast.success('Campaign data loaded');
        }
      } catch (error) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : 'Failed to load campaign';
        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    loadCampaignData();

    return () => {
      isMounted = false;
    };
  }, [campaignId, updateData, isInitialized]);

  // Handle file uploads
  const handleFilesAdded = useCallback((files: FileList) => {
    const newAssets: Asset[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type`);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds 500MB limit`);
        return;
      }

      // Check for duplicates
      if (assets.some(asset => asset.file.name === file.name)) {
        errors.push(`${file.name}: File already exists`);
        return;
      }

      newAssets.push({
        id: `${Date.now()}-${file.name}`,
        file,
        progress: 0,
        details: {
          assetName: file.name,
          budget: 0,
          description: '',
        }
      });
    });

    // Show errors if any
    if (errors.length > 0) {
      toast.error(
        <div>
          <p>Some files couldn't be uploaded:</p>
          <ul className="list-disc pl-4">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      );
    }

    // Add valid assets
    if (newAssets.length > 0) {
      setAssets(prev => [...prev, ...newAssets]);
      newAssets.forEach(asset => simulateUpload(asset.id));
      toast.success(`${newAssets.length} file(s) added successfully`);
    }
  }, [assets]);

  // Simulate upload progress
  const simulateUpload = useCallback((assetId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      
      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, progress: Math.min(Math.round(progress), 100) }
          : asset
      ));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Handle form submission
  const handleSubmit = async (values: CreativeValues) => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Enhanced validation
      if (assets.length === 0) {
        throw new Error('Please upload at least one asset');
      }

      const incompleteAssets = assets.filter(a => a.progress < 100);
      if (incompleteAssets.length > 0) {
        throw new Error('Please wait for all uploads to complete');
      }

      // More detailed validation with specific field errors
      const invalidAssets = assets.filter(a => {
        const details = a.details;
        return !details.assetName || 
               !details.influencer || 
               !details.whyInfluencer ||
               !details.budget ||
               details.budget <= 0;
      });

      if (invalidAssets.length > 0) {
        console.log('Invalid assets:', invalidAssets);
        
        // Create a more detailed error message
        const assetErrors = invalidAssets.map((asset, index) => {
          const missing = [];
          const details = asset.details;
          
          if (!details.assetName) missing.push('asset name');
          if (!details.influencer) missing.push('influencer handle');
          if (!details.whyInfluencer) missing.push('influencer rationale');
          if (!details.budget || details.budget <= 0) missing.push('valid budget');
          
          return `Asset ${index + 1} (${asset.file.name}): Missing ${missing.join(', ')}`;
        });
        
        throw new Error(`Please complete all required fields for each asset:\n${assetErrors.join('\n')}`);
      }

      // Process assets for API submission with additional error handling
      const processedAssets = await Promise.all(assets.map(async (asset) => {
        try {
          // Create more reliable URLs for files
          const fileURL = asset.file instanceof File 
            ? URL.createObjectURL(asset.file) 
            : String(asset.file);
            
          return {
            type: asset.file.type.includes('video') ? 'video' : 'image',
            url: fileURL,
            fileName: asset.file.name,
            fileSize: asset.file.size,
            assetName: asset.details.assetName,
            influencerHandle: asset.details.influencer,
            influencerName: '', // Added for future use
            influencerFollowers: '', // Added for future use
            whyInfluencer: asset.details.whyInfluencer,
            budget: parseFloat(asset.details.budget?.toString() || '0'),
          };
        } catch (err: any) {
          console.error('Error processing asset:', asset, err);
          throw new Error(`Error processing ${asset.file.name}: ${err.message || 'Unknown error'}`);
        }
      }));

      console.log('Saving creative assets to campaign:', campaignId);
      console.log('Processed assets:', processedAssets);

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creativeAssets: processedAssets,
          step: 4 // Added to track progress
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to save assets');
      }

      console.log('Save response:', responseData);
      toast.success('Assets saved successfully');
      
      // Proceed to next step
      router.push(`/campaigns/wizard/step-5?id=${campaignId}`);
    } catch (error) {
      console.error('Error saving assets:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle asset deletion
  const handleDeleteAsset = (asset: Asset) => {
    setConfirmDeleteAsset(asset);
  };

  const confirmDelete = () => {
    if (confirmDeleteAsset) {
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

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creativeAssets: assets.map(asset => ({
            type: asset.file.type.includes('video') ? 'video' : 'image',
            url: URL.createObjectURL(asset.file),
            fileName: asset.file.name,
            fileSize: asset.file.size,
            assetName: asset.details.assetName || asset.file.name,
            influencerHandle: asset.details.influencer || '',
            whyInfluencer: asset.details.whyInfluencer || '',
            budget: asset.details.budget ? parseFloat(asset.details.budget.toString()) : 0,
          })),
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

  if (isLoading) {
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
                  <UploadArea onFilesAdded={handleFilesAdded} />
                  
                  {/* Uploaded Files Area */}
                  {assets.length > 0 && (
                    <div className="mt-6 space-y-2">
                      {assets.map((asset) => (
                        <div key={asset.id} className="mb-2">
                          {asset.progress < 100 ? (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <DocumentIcon className="h-6 w-6 text-gray-400 mr-3" />
                                  <span className="font-medium text-gray-700">{asset.file.name}</span>
                                </div>
                                <span className="text-sm text-gray-500">{asset.progress}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-2 bg-blue-600 rounded-full" 
                                  style={{ width: `${asset.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <UploadedFile
                              asset={asset}
                              onPreview={() => setPreviewAsset(asset)}
                              onDelete={() => handleDeleteAsset(asset)}
                              onUpdate={(updatedAsset) => {
                                setAssets(assets.map(a => 
                                  a.id === updatedAsset.id ? updatedAsset : a
                                ));
                              }}
                              currency={currency}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Asset Details Section */}
                {assets.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Details</h2>
                    
                    {/* File Tabs */}
                    <div className="border-b border-gray-200">
                      <div className="flex space-x-8">
                        {assets.map((asset, index) => (
                          <div 
                            key={asset.id}
                            className={`pb-3 ${index === 0 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                          >
                            <span>{asset.details.assetName || asset.file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Preview Section */}
                    {assets.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                        <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
                          <DocumentIcon className="h-10 w-10 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
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
                  assets.some(a => a.progress < 100) ||
                  assets.some(a => !a.details.assetName || !a.details.influencer || !a.details.whyInfluencer || !a.details.budget || a.details.budget <= 0)
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
            <h2 className="text-xl font-bold mb-4">Preview: {previewAsset.file.name}</h2>
            {previewAsset.file.type.includes("video") ? (
              <video controls className="w-full mb-4">
                <source src={URL.createObjectURL(previewAsset.file)} type={previewAsset.file.type} />
                Your browser does not support the video tag.
              </video>
            ) : previewAsset.file.type.includes("image") ? (
              <img src={URL.createObjectURL(previewAsset.file)} alt={previewAsset.file.name} className="w-full mb-4" />
            ) : previewAsset.file.type.includes("pdf") ? (
              <embed
                src={URL.createObjectURL(previewAsset.file)}
                type="application/pdf"
                width="100%"
                height="600px"
                className="mb-4"
              />
            ) : (
              <p className="mb-4">Preview not available for this file type.</p>
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
