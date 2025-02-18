"use client";

import React, { useState, useEffect, ChangeEvent, KeyboardEvent, Component, ReactNode } from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useWizard } from "../../../../context/WizardContext";
import Header from "../../../../components/Wizard/Header";
import ProgressBar from "../../../../components/Wizard/ProgressBar";

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
  };
}

export interface CreativeAssetsValues {
  // This step does not use Formik for assets; assets are managed in component state.
}

// =============================================================================
// CONSTANTS & VALIDATION
// =============================================================================

const campaignBudget = 1000000; // Example total campaign budget

const assetDetailsSchema = Yup.object().shape({
  assetName: Yup.string().required("Asset name is required"),
  budget: Yup.number()
    .typeError("Budget must be a valid number.")
    .positive("Budget cannot be negative.")
    .max(campaignBudget, "Budget cannot exceed total campaign budget.")
    .required("Budget is required."),
});

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      className="relative w-full h-[180px] p-6 flex flex-col items-center justify-center transition-all duration-300"
      style={{
        border: dragOver ? "2px solid #007BFF" : "2px dashed #E0E0E0",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label="Drag and drop files here"
    >
      <p className="text-gray-600">Drag and drop files here or click to upload</p>
      <input
        type="file"
        multiple
        accept=".mp4,.png,.jpeg,.jpg,.gif,.pdf"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (e.target.files) onFilesAdded(e.target.files);
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Click to upload a file"
        aria-hidden="true"
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
  onRetry: (asset: Asset) => void;
  onUpdate: (updatedAsset: Asset) => void;
  autoEdit?: boolean;
}
const AssetRow: React.FC<AssetRowProps> = ({
  asset,
  onPreview,
  onDelete,
  onRetry,
  onUpdate,
  autoEdit = false,
}) => {
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [editAssetName, setEditAssetName] = useState(asset.details.assetName);
  const [editInfluencer, setEditInfluencer] = useState(asset.details.influencer || "");
  const [editDescription, setEditDescription] = useState(asset.details.description || "");
  const [editBudget, setEditBudget] = useState(asset.details.budget.toString());
  const [errors, setErrors] = useState<{ budget?: string }>({});
  const [influencerQuery, setInfluencerQuery] = useState("");

  useEffect(() => {
    if (autoEdit) {
      setIsEditing(true);
    }
  }, [autoEdit]);

  const influencerOptions = [
    { name: "Olivia Bennett", handle: "oliviabennett", followers: "7k" },
    { name: "Liam Johnson", handle: "liamjohnson", followers: "12k" },
    { name: "Emma Wilson", handle: "emmawilson", followers: "5k" },
  ];
  const filteredInfluencers = influencerOptions.filter((inf) =>
    inf.handle.toLowerCase().includes(influencerQuery.toLowerCase())
  );

  const validateBudget = (value: string): string | null => {
    const num = parseFloat(value);
    if (isNaN(num)) return "Budget must be a valid number.";
    if (num <= 0) return "Budget cannot be negative.";
    if (num > campaignBudget) return "Budget cannot exceed total campaign budget.";
    return null;
  };

  const handleSave = () => {
    const budgetError = validateBudget(editBudget);
    if (budgetError) {
      setErrors({ budget: budgetError });
      return;
    }
    const updatedAsset: Asset = {
      ...asset,
      details: {
        assetName: editAssetName,
        influencer: editInfluencer,
        description: editDescription,
        budget: parseFloat(editBudget),
      },
    };
    onUpdate(updatedAsset);
    setIsEditing(false);
  };

  return (
    <div className="border p-4 rounded mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-2xl" aria-hidden="true">
            {asset.file.type.includes("video")
              ? "🎥"
              : asset.file.type.includes("image")
              ? "🖼️"
              : asset.file.type.includes("pdf")
              ? "📄"
              : "📁"}
          </span>
          <span className="font-medium">{asset.file.name}</span>
        </div>
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <button
            type="button"
            onClick={() => onPreview(asset)}
            className="px-2 py-1 border rounded text-sm hover:bg-gray-100 transition"
            aria-label={`Preview ${asset.file.name}`}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => onDelete(asset)}
            className="px-2 py-1 border rounded text-sm hover:bg-gray-100 transition"
            aria-label={`Delete ${asset.file.name}`}
          >
            Delete
          </button>
          {asset.error && (
            <button
              type="button"
              onClick={() => onRetry(asset)}
              className="px-2 py-1 border rounded text-sm text-red-600 hover:bg-red-50 transition"
              aria-label={`Retry upload for ${asset.file.name}`}
            >
              Retry
            </button>
          )}
        </div>
      </div>
      <div className="mt-2">
        {asset.progress < 100 ? (
          <>
            <div className="text-xs text-gray-600">
              {asset.file.name} [Uploading... {asset.progress}%]
            </div>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div
                className="bg-blue-600 h-2 rounded transition-all duration-300 ease-in-out"
                style={{ width: `${asset.progress}%` }}
              ></div>
            </div>
          </>
        ) : (
          !asset.error && <div className="text-xs text-green-600">Upload complete</div>
        )}
        {asset.error && <p className="text-red-600 text-xs mt-1">{asset.error}</p>}
      </div>
      {asset.progress === 100 && !asset.error && (
        <div className="mt-4 border-t pt-4">
          {isEditing ? (
            <>
              <div className="mb-4">
                <label className="block font-semibold mb-1" htmlFor={`assetName-${asset.id}`}>
                  Asset Name
                </label>
                <input
                  id={`assetName-${asset.id}`}
                  type="text"
                  value={editAssetName}
                  onChange={(e) => setEditAssetName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4 relative">
                <label className="block font-semibold mb-1" htmlFor={`influencer-${asset.id}`}>
                  Start typing influencer's handle
                </label>
                <input
                  id={`influencer-${asset.id}`}
                  type="text"
                  placeholder="Start typing influencer's handle"
                  value={influencerQuery}
                  onChange={(e) => setInfluencerQuery(e.target.value)}
                  className="w-full p-2 border rounded"
                  aria-label="Edit influencer selection"
                />
                {influencerQuery && filteredInfluencers.length > 0 && (
                  <ul className="absolute z-10 bg-white border w-full mt-1 list-none">
                    {filteredInfluencers.map((inf) => (
                      <li
                        key={inf.handle}
                        onClick={() => {
                          setEditInfluencer(`${inf.name} | ${inf.handle} (${inf.followers} followers)`);
                          setInfluencerQuery("");
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {inf.name} | {inf.handle} ({inf.followers} followers)
                      </li>
                    ))}
                  </ul>
                )}
                {editInfluencer && (
                  <div className="mt-2 flex items-center">
                    <span className="bg-gray-200 px-3 py-1 rounded-full">{editInfluencer}</span>
                    <button
                      type="button"
                      onClick={() => setEditInfluencer("")}
                      className="ml-2 text-red-500"
                      aria-label="Clear influencer selection"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1" htmlFor={`description-${asset.id}`}>
                  Description (Optional)
                </label>
                <textarea
                  id={`description-${asset.id}`}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe how this asset will be used"
                  className="w-full p-2 border rounded"
                  maxLength={3000}
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1" htmlFor={`budget-${asset.id}`}>
                  Budget for Influencer
                </label>
                <div className="flex items-center">
                  <span className="mr-2 font-bold">£</span>
                  <input
                    id={`budget-${asset.id}`}
                    type="number"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    placeholder="Enter budget"
                    className="w-full p-2 border rounded"
                  />
                </div>
                {errors.budget && (
                  <p className="text-red-600 text-sm mt-1">{errors.budget}</p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded transition hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded transition hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-600">
              Asset details are required. Please fill in the above fields.
            </div>
          )}
        </div>
      )}
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
// MAIN PAGE COMPONENT: CREATIVE ASSETS (STEP 4)
// =============================================================================

export default function CreativeAssetsStep() {
  const router = useRouter();
  const { data, updateData } = useWizard();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<Asset | null>(null);

  // ---------- File Upload Handling ----------
  const handleFilesAdded = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (assets.some((asset) => asset.file.name === file.name)) {
        alert("Duplicate file upload is not allowed.");
        return;
      }
      const validTypes = ["video/mp4", "image/png", "image/jpeg", "image/gif", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        alert("This file type is not supported.");
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        alert("Max file size exceeded (500MB).");
        return;
      }
      const newAsset: Asset = {
        id: `${Date.now()}-${file.name}`,
        file,
        progress: 0,
        details: { assetName: file.name, budget: 0 },
      };
      setAssets((prev) => [...prev, newAsset]);
      simulateUpload(newAsset.id);
    });
  };

  // ---------- Simulate File Upload ----------
  const simulateUpload = (assetId: string) => {
    const interval = setInterval(() => {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          if (asset.id === assetId) {
            let newProgress = asset.progress + 20;
            if (newProgress >= 100) {
              newProgress = 100;
              clearInterval(interval);
            }
            return { ...asset, progress: newProgress };
          }
          return asset;
        })
      );
    }, 500);
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
  const handleSaveAsDraft = () => {
    updateData("creativeAssets", assets);
    alert("Draft saved!");
  };

  // ---------- Next Button Handling ----------
  const handleSubmit = () => {
    if (isNextDisabled) return;
    updateData("creativeAssets", assets);
    router.push("/campaigns/wizard/step-5");
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

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto p-5 space-y-8" style={{ paddingBottom: "100px" }}>
        <Header currentStep={4} totalSteps={5} />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Step 4: Creative Assets</h1>
          <button
            onClick={handleSaveAsDraft}
            className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 transition"
          >
            Save as Draft
          </button>
        </div>

        {/* Asset Upload Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Asset Upload</h2>
          <UploadArea onFilesAdded={handleFilesAdded} />
        </section>

        {/* Uploaded Assets List */}
        {assets.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Uploaded Assets</h2>
            {assets.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                onPreview={(asset) => setPreviewAsset(asset)}
                onDelete={handleDeleteAsset}
                onRetry={() => {}}
                onUpdate={(updatedAsset) =>
                  setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)))
                }
                autoEdit={asset.progress === 100 && !asset.error}
              />
            ))}
          </section>
        )}

        {/* Full-width Next Button with validation feedback */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isNextDisabled}
            className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            Next
          </button>
          {isNextDisabled && (
            <p className="mt-2 text-center text-red-600 text-sm">
              Please ensure all fully uploaded assets have a valid asset name and budget.
            </p>
          )}
        </div>

        {/* Modal for File Preview */}
        <Modal isOpen={!!previewAsset} onClose={() => setPreviewAsset(null)}>
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
      </div>

      {/* Fixed Bottom Navigation Bar using the imported ProgressBar component */}
      <ProgressBar
        currentStep={4}
        onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}`)}
        onBack={() => router.push("/campaigns/wizard/step-3")}
        onNext={() => handleSubmit()}
        disableNext={isNextDisabled}
      />
    </ErrorBoundary>
  );
}
