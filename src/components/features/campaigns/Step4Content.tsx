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
  } as any); // Type assertion to avoid complex generic inference

  // Add polling state
  const [isPollingStatus, setIsPollingStatus] = React.useState(false);

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
    const formAssets = creativeAssets.map((asset: any) => ({
      id: String(asset.id),
      fieldId: `asset-${asset.id}`,
      internalAssetId: asset.id,
      name: asset.name,
      type: asset.type,
      url: asset.url,
      rationale: asset.rationale || '',
      budget: asset.budget || null,
      assignedInfluencers: asset.assignedInfluencers || [],
      muxProcessingStatus: asset.muxProcessingStatus || 'PREPARING',
      muxPlaybackId: asset.muxPlaybackId || null,
      muxUploadId: asset.muxUploadId || null,
    }));

    // ✅ FIX: Use replaceAssets instead of setValue for proper reactivity
    const hasChanged =
      formAssets.length !== fields.length ||
      formAssets.some((newAsset, index) => {
        const currentAsset = fields[index];
        return (
          !currentAsset ||
          newAsset.id !== currentAsset.id ||
          newAsset.muxProcessingStatus !== (currentAsset as any).muxProcessingStatus ||
          newAsset.muxPlaybackId !== (currentAsset as any).muxPlaybackId
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
        }))
      );

      replaceAssets(formAssets);
      forceUpdate(); // Force a re-render

      // Check if any videos just became ready - Use branded toast
      const readyVideos = formAssets.filter(a => a.muxProcessingStatus === 'READY');
      const wasProcessing = fields.some(
        (f: any) => f.muxProcessingStatus && !['READY', 'ERROR'].includes(f.muxProcessingStatus)
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
    // Track changes more comprehensively with proper array checks
    Array.isArray(wizard.wizardState?.creativeAssets)
      ? wizard.wizardState.creativeAssets.length
      : 0,
    Array.isArray(wizard.wizardState?.creativeAssets)
      ? wizard.wizardState.creativeAssets
          .map((a: any) => `${a.id}-${a.muxProcessingStatus}-${a.muxPlaybackId}-${a.url}`)
          .join('|')
      : '',
    wizard.isLoading,
    fields.length,
    replaceAssets,
    forceUpdate,
  ]);

  // ✅ ENHANCED: Robust polling for Mux processing status updates
  useEffect(() => {
    if (!wizard.wizardState?.creativeAssets || wizard.isLoading) return;

    const creativeAssets = wizard.wizardState.creativeAssets;
    if (!Array.isArray(creativeAssets) || creativeAssets.length === 0) {
      console.log('[Step4] No creative assets found, skipping polling');
      return;
    }

    const assetsProcessing = creativeAssets.filter(
      (asset: any) =>
        asset.muxProcessingStatus &&
        !['READY', 'ERROR', 'ERROR_NO_PLAYBACK_ID'].includes(asset.muxProcessingStatus)
    );

    // ✅ FIX: Use ref to prevent duplicate polling
    if (assetsProcessing.length > 0 && !isPollingRef.current) {
      console.log(`[Step4] 🚀 STARTING POLLING for ${assetsProcessing.length} processing assets`);
      isPollingRef.current = true;
      setIsPollingStatus(true);

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
                (asset: any) =>
                  asset.muxProcessingStatus &&
                  !['READY', 'ERROR', 'ERROR_NO_PLAYBACK_ID'].includes(asset.muxProcessingStatus)
              )
            : [];

          if (stillProcessing.length === 0) {
            console.log('[Step4] ✅ ALL ASSETS READY - Stopping polling');
            isPollingRef.current = false;
            setIsPollingStatus(false);
            clearInterval(pollInterval);

            // Final force update
            setTimeout(() => {
              forceUpdate();
            }, 200);
          }
        } catch (error) {
          console.error('[Step4] ❌ Polling error:', error);
          isPollingRef.current = false;
          setIsPollingStatus(false);
          clearInterval(pollInterval);
        }
      }, 2000);

      // Cleanup function
      return () => {
        console.log('[Step4] 🧹 Cleaning up polling interval');
        isPollingRef.current = false;
        setIsPollingStatus(false);
        clearInterval(pollInterval);
      };
    }

    // If no assets are processing and we were polling, stop
    if (assetsProcessing.length === 0 && isPollingRef.current) {
      console.log('[Step4] ✅ No more assets processing, stopping poll');
      isPollingRef.current = false;
      setIsPollingStatus(false);
    }
  }, [
    Array.isArray(wizard.wizardState?.creativeAssets)
      ? wizard.wizardState.creativeAssets.length
      : 0,
    Array.isArray(wizard.wizardState?.creativeAssets)
      ? wizard.wizardState.creativeAssets
          .map((a: any) => `${a.id}-${a.muxProcessingStatus}`)
          .join(',')
      : '',
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
        setIsPollingStatus(true);
      }

      forceUpdate();
    },
    [appendAsset, forceUpdate]
  );

  const handleUploadError = useCallback((error: Error) => {
    console.error('Upload failed:', error);
  }, []);

  const handleDeleteAsset = useCallback(
    async (assetId: number | string | undefined, assetIndex: number, assetName?: string) => {
      if (!assetId) {
        // Remove locally only (temporary/unsaved asset)
        removeAsset(assetIndex);
        showSuccessToast('Asset removed from form.', 'faTrashCanLight');
        forceUpdate();
        return;
      }

      if (!confirm(`Delete "${assetName || 'Untitled'}"? This cannot be undone.`)) return;

      try {
        // Convert string IDs to numbers for API call
        const numericAssetId = typeof assetId === 'string' ? parseInt(assetId) : assetId;

        if (isNaN(numericAssetId)) {
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
        removeAsset(assetIndex);
        showSuccessToast(
          `Asset "${assetName || 'Untitled'}" deleted successfully.`,
          'faCircleCheckLight'
        );

        // Reload wizard state to reflect changes
        await wizard.reloadCampaignData();
        forceUpdate();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error(`Failed to delete asset ${assetId}:`, {
          errorMessage,
          errorStack: error instanceof Error ? error.stack : undefined,
          assetId,
          assetName,
          errorType: error?.constructor?.name,
        });
        showErrorToast(`Failed to delete asset: ${errorMessage}`, 'faTriangleExclamationLight');
      }
    },
    [removeAsset, wizard, forceUpdate]
  );

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
    const isValid = await form.trigger();
    if (!isValid) {
      showErrorToast('Please fix all form errors before proceeding.', 'faTriangleExclamationLight');
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

      // Mark step complete
      const payload: Partial<DraftCampaignData> = {
        step4Complete: true,
        currentStep: 4,
      };

      const saved = await wizard.saveProgress(payload);
      if (saved && wizard.campaignId) {
        router.push(`/campaigns/wizard/step-5?id=${wizard.campaignId}`);
      }
    } catch (error) {
      showErrorToast('Failed to save assets.', 'faTriangleExclamationLight');
    }
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
    } catch (error) {
      showErrorToast('Failed to save assets.', 'faTriangleExclamationLight');
      return false;
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
          onNext={onSubmitAndNavigate}
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
        onNext={onSubmitAndNavigate}
        isNextDisabled={fields.length === 0}
        isNextLoading={form.formState.isSubmitting || wizard.isLoading}
        getCurrentFormData={form.getValues}
        onSave={handleSave}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitAndNavigate)} className="space-y-8">
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
                      key={`${(field as any).fieldId || field.id}-${asset.muxProcessingStatus || 'no-status'}-${forceUpdateCounter}`}
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
    </div>
  );
}

export default Step4Content;
