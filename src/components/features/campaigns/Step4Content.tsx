'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import {
  Step4ValidationSchema,
  Step4FormData,
  DraftCampaignData,
  DraftAssetSchema,
  InfluencerSchema,
} from '@/components/features/campaigns/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { VideoFileUploader, VideoUploadResult } from '@/components/ui/video-file-uploader';
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import AssetCardStep4 from '@/components/ui/card-asset-step-4';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';
import { ConfirmDeleteDialog } from '@/components/ui/dialog-confirm-delete';
import { logger } from '@/lib/logger';

// Infer the DraftAsset type
type DraftAsset = z.infer<typeof DraftAssetSchema>;

// --- Main Step 4 Component ---
function Step4Content() {
  const router = useRouter();
  const wizard = useWizard();

  // Refs for managing state
  const isPollingRef = useRef(false);
  const forceUpdateCounterRef = useRef(0);
  const [forceUpdateCounter, setForceUpdateCounter] = React.useState(0);

  const form = useForm<Step4FormData>({
    resolver: zodResolver(Step4ValidationSchema),
    mode: 'onChange',
    defaultValues: {
      assets: [],
      step4Complete: false,
      guidelines: '',
      requirements: [],
      notes: '',
    },
  });

  // ✅ FIX: Use useFieldArray properly for reactive updates
  const {
    fields,
    append: appendAsset,
    remove: removeAsset,
    replace: replaceAssets,
  } = useFieldArray({
    control: form.control,
    name: 'assets',
    keyName: 'fieldId',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any); // Complex type inference requires any here

  // Add state to track if user explicitly clicked Next
  const [isExplicitNext, setIsExplicitNext] = React.useState(false);

  // Delete modal state management (SSOT pattern like campaigns page)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [assetToDelete, setAssetToDelete] = React.useState<{
    id: number | string | undefined;
    index: number;
    name: string;
  } | null>(null);

  // Prepare influencer options for the select component
  const influencerOptions = React.useMemo(() => {
    const influencers = wizard.wizardState?.Influencer;
    if (Array.isArray(influencers)) {
      return (
        influencers
          .filter(
            (inf: z.infer<typeof InfluencerSchema>) =>
              inf && typeof inf.id === 'string' && typeof inf.handle === 'string'
          )
          .map((inf: z.infer<typeof InfluencerSchema>) => ({
            id: inf.id as string,
            handle: inf.handle as string,
          })) ?? []
      );
    }
    return [];
  }, [wizard.wizardState?.Influencer]);

  // ✅ FIX: Force re-render helper
  const forceUpdate = useCallback(() => {
    forceUpdateCounterRef.current += 1;
    setForceUpdateCounter(forceUpdateCounterRef.current);
    console.log('[Step4] FORCE UPDATE triggered:', forceUpdateCounterRef.current);
  }, []);

  // ✅ SSOT: Load CreativeAssets directly from wizard state with proper reactivity
  useEffect(() => {
    if (!wizard.wizardState || wizard.isLoading) return;

    const creativeAssets = Array.isArray(wizard.wizardState.creativeAssets)
      ? wizard.wizardState.creativeAssets
      : [];

    // Convert CreativeAssets to form format
    const formAssets = creativeAssets.map(
      (asset: {
        id: number;
        name: string;
        type: string;
        url?: string;
        rationale?: string;
        budget?: number;
        associatedInfluencerIds?: string[];
        muxProcessingStatus?: string;
        muxPlaybackId?: string;
        muxUploadId?: string;
      }) => ({
        id: String(asset.id),
        fieldId: `asset-${asset.id}`,
        internalAssetId: asset.id,
        name: asset.name,
        type: asset.type,
        url: asset.url,
        rationale: asset.rationale || '',
        budget: asset.budget || null,
        associatedInfluencerIds: asset.associatedInfluencerIds || [],
        muxProcessingStatus: asset.muxProcessingStatus || 'PREPARING',
        muxPlaybackId: asset.muxPlaybackId || null,
        muxUploadId: asset.muxUploadId || null,
      })
    );

    // ✅ FIX: Use replaceAssets instead of setValue for proper reactivity
    const hasChanged =
      formAssets.length !== fields.length ||
      formAssets.some((newAsset, index) => {
        const currentAsset = fields[index];
        return (
          !currentAsset ||
          newAsset.id !== currentAsset.id ||
          newAsset.muxProcessingStatus !== (currentAsset as DraftAsset).muxProcessingStatus ||
          newAsset.muxPlaybackId !== (currentAsset as DraftAsset).muxPlaybackId ||
          JSON.stringify(newAsset.associatedInfluencerIds) !==
            JSON.stringify((currentAsset as DraftAsset).associatedInfluencerIds)
        );
      });

    if (hasChanged) {
      console.log('[Step4] ✅ WIZARD STATE CHANGED - Replacing form assets with useFieldArray');
      console.log(
        '[Step4] New formAssets:',
        formAssets.map(a => ({
          id: a.id,
          status: a.muxProcessingStatus,
          playbackId: a.muxPlaybackId,
          associatedInfluencerIds: a.associatedInfluencerIds,
        }))
      );

      replaceAssets(formAssets);
      forceUpdate(); // Force a re-render

      // Check if any videos just became ready - Use branded toast
      const readyVideos = formAssets.filter(a => a.muxProcessingStatus === 'READY');
      const wasProcessing = fields.some(
        (f: DraftAsset) =>
          f.muxProcessingStatus && !['READY', 'ERROR'].includes(f.muxProcessingStatus)
      );

      if (readyVideos.length > 0 && wasProcessing) {
        // Use branded success toast without emoji
        showSuccessToast(
          `${readyVideos.length} video(s) ready for viewing!`,
          'faCircleCheckLight',
          5000
        );
      }
    }
  }, [
    wizard.wizardState?.creativeAssets,
    wizard.wizardState,
    wizard.isLoading,
    fields,
    replaceAssets,
    forceUpdate,
  ]);

  // Extract complex dependency values for useEffect with proper memoization
  const creativeAssetsLength = Array.isArray(wizard.wizardState?.creativeAssets)
    ? wizard.wizardState.creativeAssets.length
    : 0;

  // Memoize the signature to prevent infinite re-renders
  const creativeAssetsSignature = React.useMemo(() => {
    return Array.isArray(wizard.wizardState?.creativeAssets)
      ? wizard.wizardState.creativeAssets
          .map(
            (a: { id: number; muxProcessingStatus?: string }) => `${a.id}-${a.muxProcessingStatus}`
          )
          .join(',')
      : '';
  }, [wizard.wizardState?.creativeAssets]);

  // ✅ ENHANCED: Robust polling for Mux processing status updates
  useEffect(() => {
    if (!wizard.wizardState?.creativeAssets || wizard.isLoading) return;

    const creativeAssets = wizard.wizardState.creativeAssets;
    if (!Array.isArray(creativeAssets) || creativeAssets.length === 0) {
      console.log('[Step4] No creative assets found, skipping polling');
      return;
    }

    const assetsProcessing = creativeAssets.filter(
      (asset: { muxProcessingStatus?: string }) =>
        asset.muxProcessingStatus &&
        !['READY', 'ERROR', 'ERROR_NO_PLAYBACK_ID'].includes(asset.muxProcessingStatus)
    );

    // ✅ FIX: Use ref to prevent duplicate polling
    if (assetsProcessing.length > 0 && !isPollingRef.current) {
      console.log(`[Step4] 🚀 STARTING POLLING for ${assetsProcessing.length} processing assets`);
      isPollingRef.current = true;

      const pollInterval = setInterval(async () => {
        try {
          console.log('[Step4] 🔍 Polling for asset status updates...');

          // Reload wizard data
          await wizard.reloadCampaignData();

          // Force a re-render after data reload
          setTimeout(() => {
            forceUpdate();
          }, 100);

          // Check if all assets are done processing
          const currentAssets = wizard.wizardState?.creativeAssets || [];
          const stillProcessing = Array.isArray(currentAssets)
            ? currentAssets.filter(
                (asset: { muxProcessingStatus?: string }) =>
                  asset.muxProcessingStatus &&
                  !['READY', 'ERROR', 'ERROR_NO_PLAYBACK_ID'].includes(asset.muxProcessingStatus)
              )
            : [];

          if (stillProcessing.length === 0) {
            console.log('[Step4] ✅ ALL ASSETS READY - Stopping polling');
            isPollingRef.current = false;
            clearInterval(pollInterval);

            // Final force update
            setTimeout(() => {
              forceUpdate();
            }, 200);
          }
        } catch (error) {
          console.error('[Step4] ❌ Polling error:', error);
          isPollingRef.current = false;
          clearInterval(pollInterval);
        }
      }, 2000);

      // Cleanup function
      return () => {
        console.log('[Step4] 🧹 Cleaning up polling interval');
        isPollingRef.current = false;
        clearInterval(pollInterval);
      };
    }

    // If no assets are processing and we were polling, stop
    if (assetsProcessing.length === 0 && isPollingRef.current) {
      console.log('[Step4] ✅ No more assets processing, stopping poll');
      isPollingRef.current = false;
    }
  }, [
    creativeAssetsLength,
    creativeAssetsSignature,
    wizard.wizardState?.creativeAssets,
    wizard.wizardState,
    wizard.isLoading,
    wizard,
    forceUpdate,
  ]);

  // Handle video upload completion
  const handleVideoUploadComplete = useCallback(
    (result: VideoUploadResult) => {
      const newVideoAsset: DraftAsset = {
        id: `temp-${result.internalAssetId}`,
        fieldId: `asset-${result.internalAssetId}`,
        internalAssetId: result.internalAssetId,
        name: result.fileName,
        type: 'video',
        muxProcessingStatus: 'MUX_PROCESSING',
        userId: result.userId,
        rationale: '',
        budget: null,
        associatedInfluencerIds: [],
      };

      appendAsset(newVideoAsset);

      // Use branded success toast without hardcoded styling
      showSuccessToast(
        `Video "${result.fileName}" is processing with Mux.`,
        'faCircleNotchLight',
        4000
      );

      // Start polling immediately for this new upload
      if (!isPollingRef.current) {
        isPollingRef.current = true;
      }

      forceUpdate();
    },
    [appendAsset, forceUpdate]
  );

  const handleUploadError = useCallback((_error: Error) => {
    console.error('Upload failed:', _error);
  }, []);

  // Delete asset handlers using SSOT modal pattern (like campaigns page)
  const handleDeleteClick = useCallback(
    (assetId: number | string | undefined, assetIndex: number, assetName?: string) => {
      // Prevent any accidental form submission during asset deletion
      setIsExplicitNext(false);

      if (!assetId) {
        // Remove locally only (temporary/unsaved asset)
        removeAsset(assetIndex);
        showSuccessToast('Asset removed from form.', 'faTrashCanLight');
        forceUpdate();
        return;
      }

      // Set up modal for persistent assets
      setAssetToDelete({
        id: assetId,
        index: assetIndex,
        name: assetName || 'Untitled',
      });
      setShowDeleteModal(true);
    },
    [removeAsset, forceUpdate, setIsExplicitNext]
  );

  const executeDeleteAsset = async () => {
    if (!assetToDelete) {
      showErrorToast('No asset selected for deletion.');
      return;
    }

    try {
      // Convert string IDs to numbers for API call
      const numericAssetId =
        typeof assetToDelete.id === 'string' ? parseInt(assetToDelete.id) : assetToDelete.id;

      if (isNaN(numericAssetId!)) {
        throw new Error('Invalid asset ID');
      }

      const response = await fetch(`/api/creative-assets/${numericAssetId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}`);
      }

      const result = await response.json();
      logger.info(`Successfully deleted asset ${numericAssetId}:`, result);

      // Remove from form state
      removeAsset(assetToDelete.index);
      showSuccessToast(`Asset "${assetToDelete.name}" deleted successfully.`, 'faCircleCheckLight');

      // Reload wizard state to reflect changes
      await wizard.reloadCampaignData();
      forceUpdate();
    } catch (_error) {
      const errorMessage = _error instanceof Error ? _error.message : 'Unknown error occurred';
      logger.error(`Failed to delete asset ${assetToDelete.id}:`, {
        errorMessage,
        errorStack: _error instanceof Error ? _error.stack : undefined,
        assetId: assetToDelete.id,
        assetName: assetToDelete.name,
        errorType: _error?.constructor?.name,
      });
      showErrorToast(`Failed to delete asset: ${errorMessage}`, 'faTriangleExclamationLight');
    }
  };

  // Legacy handleDeleteAsset - replaced with modal pattern above
  const handleDeleteAsset = handleDeleteClick;

  // Navigation handlers
  const handleStepClick = (step: number) => {
    if (wizard.campaignId && step < 5) {
      router.push(`/campaigns/wizard/step-${step}?id=${wizard.campaignId}`);
    } else if (step < 5) {
      router.push(`/campaigns/wizard/step-${step}`);
    }
  };

  const handleBack = () => {
    if (wizard.campaignId) {
      router.push(`/campaigns/wizard/step-3?id=${wizard.campaignId}`);
    } else {
      router.push(`/campaigns/wizard/step-3`);
    }
  };

  // Save & Next handler
  const onSubmitAndNavigate = async () => {
    // Only navigate if this was an explicit "Next" action
    if (!isExplicitNext) {
      console.log('[Step4] Form submission prevented - not an explicit Next action');
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      showErrorToast('Please fix all form errors before proceeding.', 'faTriangleExclamationLight');
      setIsExplicitNext(false); // Reset flag
      return;
    }

    const data = form.getValues();

    // Save assets directly to CreativeAsset table
    const savePromises = data.assets.map(async asset => {
      if (!asset.internalAssetId) return;

      return fetch(`/api/creative-assets/${asset.internalAssetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: asset.name,
          rationale: asset.rationale,
          budget: asset.budget,
          associatedInfluencerIds: asset.associatedInfluencerIds,
        }),
      });
    });

    try {
      await Promise.all(savePromises);

      // Show success toast to confirm everything has been saved
      showSuccessToast('All asset details saved successfully!', 'faCircleCheckLight', 3000);

      // Mark step complete
      const payload: Partial<DraftCampaignData> = {
        step4Complete: true,
        currentStep: 4,
      };

      const saved = await wizard.saveProgress(payload);
      if (saved && wizard.campaignId) {
        router.push(`/campaigns/wizard/step-5?id=${wizard.campaignId}`);
      }
    } catch (_error) {
      const errorMessage = _error instanceof Error ? _error.message : 'Unknown error occurred';
      logger.error('Failed to save assets during navigation.', {
        errorMessage,
        errorStack: _error instanceof Error ? _error.stack : undefined,
        errorType: _error?.constructor?.name,
      });
      showErrorToast('Failed to save assets.', 'faTriangleExclamationLight');
    } finally {
      setIsExplicitNext(false); // Reset flag
    }
  };

  // Explicit Next handler for the progress bar
  const handleExplicitNext = () => {
    setIsExplicitNext(true);
    // Use setTimeout to ensure the flag is set before form submission
    setTimeout(() => {
      onSubmitAndNavigate();
    }, 0);
  };

  // Manual Save handler
  const handleSave = async (): Promise<boolean> => {
    const data = form.getValues();

    if (data.assets.length === 0) {
      showErrorToast(
        'Please upload at least one asset before saving.',
        'faTriangleExclamationLight'
      );
      return false;
    }

    try {
      // Save all assets
      const savePromises = data.assets.map(async asset => {
        if (!asset.internalAssetId) return;

        return fetch(`/api/creative-assets/${asset.internalAssetId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: asset.name,
            rationale: asset.rationale,
            budget: asset.budget,
            associatedInfluencerIds: asset.associatedInfluencerIds,
          }),
        });
      });

      await Promise.all(savePromises);
      showSuccessToast('Assets saved successfully!', 'faFloppyDiskLight');

      // Reload to get fresh data
      wizard.reloadCampaignData();
      return true;
    } catch (_error) {
      const errorMessage = _error instanceof Error ? _error.message : 'Unknown error occurred';
      logger.error('Failed to save assets.', {
        errorMessage,
        errorStack: _error instanceof Error ? _error.stack : undefined,
        errorType: _error?.constructor?.name,
      });
      showErrorToast('Failed to save assets.', 'faTriangleExclamationLight');
      return false;
    } finally {
      setIsExplicitNext(false); // Reset flag
    }
  };

  if (!wizard.wizardState) {
    return (
      <div className="space-y-8">
        <ProgressBarWizard
          currentStep={4}
          steps={wizard.stepsConfig}
          onStepClick={handleStepClick}
          onBack={handleBack}
          onNext={handleExplicitNext}
          isNextDisabled={true}
          isNextLoading={wizard.isLoading}
          onSave={handleSave}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8" key={`step4-${forceUpdateCounter}`}>
      <ProgressBarWizard
        currentStep={4}
        steps={wizard.stepsConfig}
        onStepClick={handleStepClick}
        onBack={handleBack}
        onNext={handleExplicitNext}
        isNextDisabled={fields.length === 0}
        isNextLoading={form.formState.isSubmitting || wizard.isLoading}
        getCurrentFormData={form.getValues}
        onSave={handleSave}
      />

      <Form {...form}>
        <form
          onSubmit={e => {
            e.preventDefault(); // Prevent default form submission
            console.log('[Step4] Form submission prevented - use Next button instead');
          }}
          className="space-y-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Creative Assets</CardTitle>
              <CardDescription>Upload your video assets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wizard.wizardState?.id && (
                <VideoFileUploader
                  name="assets"
                  control={form.control}
                  campaignWizardId={wizard.wizardState.id}
                  onUploadComplete={handleVideoUploadComplete}
                  onUploadError={handleUploadError}
                  accept={{ 'video/*': ['.mp4', '.mov'] }}
                  maxSizeMB={1024}
                  sizeLimitText="up to 1GB for videos"
                />
              )}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {fields.map((field, index) => {
                  const asset = field as unknown as DraftAsset;

                  console.log(`[AssetCard ${index}] Data flow:`, asset);
                  console.log(
                    `[AssetCard ${index}] Final display values - Name: "${asset.name}", Budget: ${asset.budget} ${wizard.wizardState?.budget?.currency || 'USD'}, Rationale: "${asset.rationale}"`
                  );

                  return (
                    <AssetCardStep4
                      key={`${
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (field as any).fieldId || field.id
                      }-${asset.muxProcessingStatus || 'no-status'}-${forceUpdateCounter}`}
                      assetIndex={index}
                      asset={asset}
                      control={form.control}
                      getValues={form.getValues}
                      saveProgress={() => Promise.resolve(null)}
                      availableInfluencers={influencerOptions}
                      currency={wizard.wizardState?.budget?.currency || 'USD'}
                      onDelete={handleDeleteAsset}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* SSOT Delete Confirmation Modal (same as campaigns page) */}
      {assetToDelete && (
        <ConfirmDeleteDialog
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setAssetToDelete(null);
          }}
          onConfirm={executeDeleteAsset}
          itemName={assetToDelete.name}
          dialogTitle="Delete Asset"
          confirmButtonText="Delete Asset"
        />
      )}
    </div>
  );
}

export default Step4Content;
