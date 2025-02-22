"use client";

import React, { useState, useEffect, ChangeEvent, KeyboardEvent, Component, ReactNode, Suspense, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useWizard } from "../../../../context/WizardContext";
import Header from "../../../../components/Wizard/Header";
import ProgressBar from "../../../../components/Wizard/ProgressBar";
import { toast } from "react-hot-toast";
import { Section } from '@/components/ui/section';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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

interface CreativeAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description?: string;
}

export interface CreativeValues {
  assets: CreativeAsset[];
}

// =============================================================================
// CONSTANTS & VALIDATION
// =============================================================================

const campaignBudget = 1000000; // Example total campaign budget
const mockInfluencers = [
  {
    id: 1,
    name: 'Influencer Name',
    avatar: '/placeholder.jpg',  // Update this path
    // ... other properties
  },
  // ... other influencers
];
const PLACEHOLDER_AVATAR = '/placeholder.jpg';

const assetDetailsSchema = Yup.object().shape({
  assetName: Yup.string().required("Asset name is required"),
  budget: Yup.number()
    .typeError("Budget must be a valid number.")
    .positive("Budget cannot be negative.")
    .max(campaignBudget, "Budget cannot exceed total campaign budget.")
    .required("Budget is required."),
});

const CreativeSchema = Yup.object().shape({
  assets: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      type: Yup.string().oneOf(['image', 'video']).required(),
      url: Yup.string().required('Asset URL is required'),
      title: Yup.string().required('Asset title is required'),
      description: Yup.string(),
    })
  )
});

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'video/mp4': ['.mp4'],
  'application/pdf': ['.pdf']
};

// =============================================================================
// ERROR BOUNDARY COMPONENT
// =============================================================================

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}

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
      className="relative w-full h-[180px] p-6 flex flex-col items-center justify-center transition-all duration-300"
      style={{
        border: dragOver ? "2px solid #007BFF" : "2px dashed #E0E0E0",
      }}
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
      <p className="text-gray-600">Drag and drop files here or click to upload</p>
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
// ASSET ROW (Display File Info + Inline Editing)
// =============================================================================

interface AssetRowProps {
  asset: Asset;
  onPreview: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onUpdate: (updatedAsset: Asset) => void;
  autoEdit?: boolean;
}
const AssetRow: React.FC<AssetRowProps> = ({
  asset,
  onPreview,
  onDelete,
  onUpdate,
  autoEdit = false,
}) => {
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [editAssetName, setEditAssetName] = useState(asset.details.assetName);
  const [influencerQuery, setInfluencerQuery] = useState("");
  const [selectedInfluencer, setSelectedInfluencer] = useState(asset.details.influencer || "");
  const [whyInfluencer, setWhyInfluencer] = useState(asset.details.whyInfluencer || "");
  const [budget, setBudget] = useState(asset.details.budget?.toString() || "");

  // Update the influencer options with more realistic data
  const influencerOptions = [
    { 
      name: "Olivia Bennett", 
      handle: "@oliviabennett", 
      followers: "7k",
      avatar: "/placeholder.jpg"
    },
    { 
      name: "James Wilson", 
      handle: "@jameswilson", 
      followers: "12k",
      avatar: "/placeholder.jpg"
    },
    // Add more as needed
  ];

  return (
    <div className="border rounded-lg p-6 mb-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📁</span>
          <span className="font-medium">{asset.file.name}</span>
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

      <div className="space-y-4">
        {/* Asset Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset Name
            <span className="text-blue-500 ml-1 cursor-help" title="Give your asset a descriptive name">ⓘ</span>
          </label>
          <input
            type="text"
            value={editAssetName}
            onChange={(e) => setEditAssetName(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter asset name"
          />
        </div>

        {/* Influencer Selection */}
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
                // When typing, update the selected influencer
                if (e.target.value.startsWith('@')) {
                  setSelectedInfluencer(e.target.value);
                  onUpdate({
                    ...asset,
                    details: {
                      ...asset.details,
                      influencer: e.target.value,
                    }
                  });
                }
              }}
              onKeyPress={(e) => {
                // Ensure handle starts with @
                if (e.key === '@' && influencerQuery === '') {
                  return;
                }
                if (!influencerQuery.startsWith('@') && influencerQuery === '') {
                  setInfluencerQuery('@' + e.key);
                  e.preventDefault();
                }
              }}
              className="w-full p-2 border rounded-md"
              placeholder="@username"
            />
            {selectedInfluencer && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">Selected: {selectedInfluencer}</p>
              </div>
            )}
          </div>
        </div>

        {/* Why this influencer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Why this influencer?
            <span className="text-blue-500 ml-1 cursor-help" title="Explain why you chose this influencer">ⓘ</span>
          </label>
          <textarea
            value={whyInfluencer}
            onChange={(e) => setWhyInfluencer(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Explain why you chose this influencer..."
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget for Influencer
            <span className="text-blue-500 ml-1 cursor-help" title="Set the budget for this influencer">ⓘ</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2">£</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full pl-8 p-2 border rounded-md"
              placeholder="Enter budget per post"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => onUpdate({
              ...asset,
              details: {
                assetName: editAssetName,
                influencer: selectedInfluencer,
                whyInfluencer: whyInfluencer,
                budget: parseFloat(budget) || 0,
                description: asset.details.description
              }
            })}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
          >
            Save
          </button>
          <button
            onClick={() => onDelete(asset)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MODAL COMPONENT (for Preview and Delete Confirmation)
// =============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white p-6 rounded max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded transition hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT: CREATIVE ASSETS (STEP 4)
// =============================================================================

function CampaignStep4Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const { data, updateData } = useWizard();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<Asset | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaignData, setCampaignData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const initialValues: CreativeValues = {
    assets: data.creativeAssets?.assets || [],
  };

  // Improved file upload handling
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

  // Improved upload simulation with progress tracking
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

  const handleSubmit = async (values: CreativeValues) => {
    try {
      setIsSaving(true);
      
      // Validate assets
      if (assets.length === 0) {
        throw new Error('Please upload at least one asset');
      }

      const incompleteAssets = assets.filter(a => a.progress < 100);
      if (incompleteAssets.length > 0) {
        throw new Error('Please wait for all uploads to complete');
      }

      // Updated validation to check all required fields
      const invalidAssets = assets.filter(a => {
        const details = a.details;
        return !details.assetName || 
               !details.influencer || 
               !details.whyInfluencer ||
               !details.budget ||
               details.budget <= 0;
      });

      if (invalidAssets.length > 0) {
        console.log('Invalid assets:', invalidAssets); // For debugging
        throw new Error('Please complete all required fields for each asset');
      }

      // Process assets
      const processedAssets = await Promise.all(
        assets.map(async (asset) => ({
          type: asset.file.type.includes('video') ? 'video' : 'image',
          url: URL.createObjectURL(asset.file),
          fileName: asset.file.name,
          fileSize: asset.file.size,
          assetName: asset.details.assetName,
          influencerHandle: asset.details.influencer,
          whyInfluencer: asset.details.whyInfluencer,
          budget: parseFloat(asset.details.budget?.toString() || '0'),
        }))
      );

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creativeAssets: processedAssets
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save assets');
      }

      toast.success('Assets saved successfully');
      router.push(`/campaigns/wizard/step-5?id=${campaignId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save assets');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- Delete Asset ----------
  const handleDeleteAsset = (asset: Asset) => {
    setConfirmDeleteAsset(asset);
  };

  const confirmDelete = () => {
    if (confirmDeleteAsset) {
      setAssets((prev) => prev.filter((a) => a.id !== confirmDeleteAsset.id));
      setConfirmDeleteAsset(null);
    }
  };

  // ---------- Next Button Validation ----------
  const areAssetsValid = () =>
    assets
      .filter((a) => a.progress === 100 && !a.error)
      .every((asset) => {
        try {
          assetDetailsSchema.validateSync(asset.details);
          return true;
        } catch (err) {
          return false;
        }
      });

  const isNextDisabled = assets.filter((a) => a.progress === 100 && !a.error).length === 0 || !areAssetsValid();

  // ---------- Save as Draft ----------
  const handleSaveDraft = async (values: CreativeValues) => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creativeAssets: {
            create: assets.map(asset => ({
              type: asset.file.type.includes('video') ? 'video' : 'image',
              url: URL.createObjectURL(asset.file),
              fileName: asset.file.name,
              fileSize: asset.file.size,
              assetName: asset.details.assetName || asset.file.name,
              influencerHandle: asset.details.influencer || '',
              whyInfluencer: asset.details.whyInfluencer || '',
              budget: asset.details.budget ? parseFloat(asset.details.budget.toString()) : 0,
            }))
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save draft');
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- Keyboard: Close preview on Escape ----------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && previewAsset) {
        setPreviewAsset(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewAsset]);

  // Load campaign data
  useEffect(() => {
    const loadCampaignData = async () => {
      if (campaignId) {
        try {
          setIsLoading(true);
          setError(null);
          const response = await fetch(`/api/campaigns/${campaignId}`);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to load campaign');
          }

          if (data.success) {
            setCampaignData(data.campaign);
            updateData(data.campaign);
            toast.success('Campaign data loaded');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load campaign';
          setError(message);
          toast.error(message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCampaignData();
  }, [campaignId]);

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
    <ErrorBoundary>
      <Formik
        initialValues={initialValues}
        validationSchema={CreativeSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isValid, submitForm }) => (
          <>
            <div className="max-w-4xl mx-auto p-4 pb-32">
              <Header currentStep={4} totalSteps={5} />
              
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Step 4: Creative Assets</h1>
                <button 
                  type="button"
                  onClick={() => handleSaveDraft(values)}
                  className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save as Draft'}
                </button>
              </div>

              <Form className="space-y-8">
                {/* Upload Area */}
                <div>
                  <h2 className="text-xl font-bold mb-2">Upload Assets</h2>
                  <UploadArea onFilesAdded={handleFilesAdded} />
                </div>

                {/* Asset List */}
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <AssetRow
                      key={asset.id}
                      asset={asset}
                      onPreview={() => setPreviewAsset(asset)}
                      onDelete={() => handleDeleteAsset(asset)}
                      onUpdate={(updatedAsset) => {
                        setAssets(assets.map(a => 
                          a.id === updatedAsset.id ? updatedAsset : a
                        ));
                      }}
                    />
                  ))}
                </div>
              </Form>
            </div>

            <ProgressBar
              currentStep={4}
              onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)}
              onBack={() => router.push(`/campaigns/wizard/step-3?id=${campaignId}`)}
              onNext={submitForm}
              disableNext={!isValid || isSubmitting || assets.some(asset => 
                !asset.details.assetName || 
                !asset.details.influencer || 
                !asset.details.whyInfluencer || 
                !asset.details.budget ||
                asset.details.budget <= 0
              )}
            />
          </>
        )}
      </Formik>

      {/* Modals */}
      {previewAsset && (
        <Modal
          isOpen={!!previewAsset}
          onClose={() => setPreviewAsset(null)}
        >
          {previewAsset && (
            <div>
              <h2 className="font-bold mb-4">Preview: {previewAsset.file.name}</h2>
              {previewAsset.file.type.includes("video") ? (
                <video controls className="w-full">
                  <source src={URL.createObjectURL(previewAsset.file)} type={previewAsset.file.type} />
                  Your browser does not support the video tag.
                </video>
              ) : previewAsset.file.type.includes("image") ? (
                <img src={URL.createObjectURL(previewAsset.file)} alt={previewAsset.file.name} className="w-full" />
              ) : previewAsset.file.type.includes("pdf") ? (
                <embed
                  src={URL.createObjectURL(previewAsset.file)}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                />
              ) : (
                <p>Preview not available for this file type.</p>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Modal for Delete Confirmation */}
      <Modal isOpen={!!confirmDeleteAsset} onClose={() => setConfirmDeleteAsset(null)}>
        <div>
          <h2 className="font-bold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete this asset? This action cannot be undone.</p>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => setConfirmDeleteAsset(null)}
              className="px-4 py-2 border rounded hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
    </ErrorBoundary>
  );
}

export default function CampaignStep4() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    }>
      <CampaignStep4Content />
    </Suspense>
  );
}
