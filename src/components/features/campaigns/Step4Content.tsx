"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWizard } from "@/components/features/campaigns/WizardContext";
import Header from "@/components/features/campaigns/Header";
import ProgressBar from "@/components/features/campaigns/ProgressBar";
import { toast } from 'react-hot-toast';
import { WizardSkeleton } from "@/components/ui/loading-skeleton";
import { CampaignAssetUploader, type UploadedAsset } from "./CampaignAssetUploader";

function FormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams?.get('id');
  const { data, updateFormData, campaignData, isEditing, loading } = useWizard();
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync assets from context
  useEffect(() => {
    // Use optional chaining to safely access assets
    if (campaignData?.assets && Array.isArray(campaignData.assets)) {
      setAssets(campaignData.assets);
    }
  }, [campaignData]);

  const handleUploadComplete = (uploadedFiles: UploadedAsset[]) => {
    console.log('Upload complete:', uploadedFiles);
    const newAssets = [...assets, ...uploadedFiles];
    setAssets(newAssets);
    // Use updateFormData
    updateFormData({ assets: newAssets });
  };

  const handleRemoveAsset = (index: number) => {
    const newAssets = assets.filter((_, i) => i !== index);
    setAssets(newAssets);
    // Use updateFormData
    updateFormData({ assets: newAssets });
  };

  const handleAssetUpdate = (index: number, updatedAsset: Partial<UploadedAsset>) => {
    const newAssets = assets.map((asset, i) => i === index ? { ...asset, ...updatedAsset } : asset);
    setAssets(newAssets);
    // Use updateFormData
    updateFormData({ assets: newAssets });
  };

  // Handle asset upload error
  const handleUploadError = (error: Error) => {
    console.error("Asset upload error:", error);
    toast.error(`Upload failed: ${error.message}`);
    setError(error.message);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }

      // Save assets to the campaign
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets: { files: assets }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update campaign');
      }

      toast.success('Campaign assets updated successfully');
      router.push(`/campaigns/wizard/step-5?id=${campaignId}`);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const message = error instanceof Error ? error.message : 'Failed to update campaign';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    try {
      if (!campaignId) {
        toast.error('Cannot save draft: No campaign ID found');
        return;
      }

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets: { files: assets },
          submissionStatus: 'draft'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to save draft');
        return;
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      toast.error('Failed to save draft: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  if (loading) {
    return <WizardSkeleton step={4} />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 bg-white font-work-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 font-sora">Campaign Creation</h1>
        <p className="text-gray-500">Upload your creative assets for this campaign</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upload Creative Assets
        </h2>
        <p className="text-gray-600 mb-6">
          Upload images, videos, or PDFs that will be used in your campaign.
        </p>

        <CampaignAssetUploader
          campaignId={campaignId || ''}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />

        {assets.length > 0 && (
          <div className="mt-8">
            <h3 className="text-md font-medium mb-3">Uploaded Assets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="border rounded-md p-3 flex flex-col">
                  <div className="font-medium truncate">{asset.fileName}</div>
                  <div className="text-sm text-gray-500">{asset.type}</div>
                  <div className="text-xs text-gray-400">
                    {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProgressBar
        currentStep={4}
        onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)}
        onBack={() => router.push(`/campaigns/wizard/step-3?id=${campaignId}`)}
        onNext={handleSubmit}
        onSaveDraft={handleSaveDraft}
        disableNext={isSaving}
        isFormValid={true}
        isDirty={true}
        isSaving={isSaving}
      />
    </div>
  );
}

export default function Step4Content() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <WizardSkeleton step={4} />;
  }

  return (
    <Suspense fallback={<WizardSkeleton step={4} />}>
      <FormContent />
    </Suspense>
  );
} 