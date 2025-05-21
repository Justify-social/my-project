'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import {
  Step4ValidationSchema,
  Step4FormData,
  DraftCampaignData,
  // Import sub-schemas if needed
  DraftAssetSchema,
  CreativeAssetTypeEnum,
  InfluencerSchema,
} from '@/components/features/campaigns/types';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { VideoFileUploader, VideoUploadResult } from '@/components/ui/video-file-uploader';
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import AssetCardStep4 from '@/components/ui/card-asset-step-4';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils'; // Ensure this points correctly
import { logger } from '@/lib/logger'; // Added logger import

// Infer the DraftAsset type
type DraftAsset = z.infer<typeof DraftAssetSchema>;

// --- Main Step 4 Component ---
function Step4Content() {
  const router = useRouter();
  const wizard = useWizard();

  const form = useForm<Step4FormData>({
    resolver: zodResolver(Step4ValidationSchema),
    mode: 'onChange',
    defaultValues: {
      assets:
        wizard.wizardState?.assets && Array.isArray(wizard.wizardState.assets)
          ? wizard.wizardState.assets
          : ([] as DraftAsset[]), // Explicitly type empty array if providing one
      step4Complete:
        wizard.wizardState && typeof wizard.wizardState.step4Complete === 'boolean'
          ? wizard.wizardState.step4Complete
          : false,
      guidelines:
        wizard.wizardState?.guidelines && typeof wizard.wizardState.guidelines === 'string'
          ? wizard.wizardState.guidelines
          : '',
      requirements:
        wizard.wizardState?.requirements && Array.isArray(wizard.wizardState.requirements)
          ? wizard.wizardState.requirements
          : [],
      notes:
        wizard.wizardState?.notes && typeof wizard.wizardState.notes === 'string'
          ? wizard.wizardState.notes
          : '',
    },
  });

  // Remove useFieldArray for requirements as it's deprecated
  /*
    const { fields: requirementFields, append: appendRequirement, remove: removeRequirement } = useFieldArray({
        control: form.control,
        name: "requirements",
    });
    */

  // Use type assertion to bypass the type error
  const {
    fields: assetFields,
    append: appendAsset,
    remove: removeAsset,
  } = useFieldArray({
    control: form.control,
    name: 'assets' as never,
    keyName: 'fieldId',
  });

  // Prepare influencer options for the select component
  const influencerOptions = React.useMemo(() => {
    // Ensure wizardState and wizardState.Influencer are not null and are arrays
    const influencers = wizard.wizardState?.Influencer;
    if (Array.isArray(influencers)) {
      return (
        influencers
          .filter(
            (inf: z.infer<typeof InfluencerSchema>) =>
              inf && typeof inf.id === 'string' && typeof inf.handle === 'string'
          ) // Ensure handle is also a string
          .map((inf: z.infer<typeof InfluencerSchema>) => ({
            // Explicitly type inf
            id: inf.id as string,
            handle: inf.handle as string, // Assert handle as string
          })) ?? []
      );
    }
    return [];
  }, [wizard.wizardState?.Influencer]);

  // New callback for the VideoFileUploader
  const handleVideoUploadComplete = useCallback(
    (result: VideoUploadResult) => {
      const newVideoAsset: DraftAsset = {
        id: `temp-mux-${result.internalAssetId}`,
        fieldId: `field-${Date.now()}`,
        internalAssetId: result.internalAssetId,
        name: result.fileName,
        fileName: result.fileName,
        type: 'video',
        muxAssetId: result.muxAssetId,
        muxProcessingStatus: 'MUX_PROCESSING',
        url: undefined,
        userId: result.userId,
      };
      appendAsset(newVideoAsset);
      console.log(
        '[Step4Content handleVideoUploadComplete] Appended optimistic asset:',
        JSON.parse(JSON.stringify(newVideoAsset))
      );
      console.info(
        '[Step4Content handleVideoUploadComplete] Form state after appending video asset (RHF getValues):',
        JSON.parse(JSON.stringify(form.getValues('assets')))
      );
      toast.success(`Video "${result.fileName}" is processing with Mux.`);
    },
    [appendAsset]
  );

  // Handle upload errors (optional, FileUploader shows toast)
  const handleUploadError = useCallback((error: Error) => {
    console.error('Upload failed in parent:', error);
    // Additional parent-level error handling if needed
  }, []);

  const handleDeleteAsset = useCallback(
    async (assetId: number | string | undefined, assetIndex: number, assetName?: string) => {
      if (
        assetId === undefined ||
        (typeof assetId === 'string' && assetId.startsWith('temp-mux-'))
      ) {
        // This is an asset that hasn't been fully saved to the backend (no DB ID yet)
        // or it's an optimistically added asset not yet confirmed by backend.
        // We can just remove it from the local form state.
        logger.info(`Removing unsaved/temporary asset at index ${assetIndex} locally.`);
        removeAsset(assetIndex);
        toast.success(`Asset "${assetName || 'Untitled'}" removed locally.`);
        return;
      }

      // Confirm with the user before deleting
      if (
        !confirm(
          `Are you sure you want to delete the asset "${assetName || 'Untitled'}"? This action cannot be undone.`
        )
      ) {
        return;
      }

      try {
        logger.info(`Attempting to delete asset with ID: ${assetId}`);
        const response = await fetch(`/api/creative-assets/${assetId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to delete asset from server.');
        }

        // If successful, remove from the RHF field array
        removeAsset(assetIndex);
        showSuccessToast(`Asset "${assetName || 'Untitled'}" deleted successfully.`);
      } catch (error: any) {
        logger.error(`Failed to delete asset ${assetId}:`, error);
        showErrorToast(error.message || 'Could not delete asset.');
      }
    },
    [removeAsset]
  );

  // Main sync effect from wizard context to RHF form state
  useEffect(() => {
    console.log(
      '[Step4Content MAIN SYNC useEffect] Running. wizard.isLoading:',
      wizard.isLoading,
      'wizard.campaignId:',
      wizard.campaignId,
      'wizard.wizardState?.id:',
      wizard.wizardState?.id
    );

    if (!wizard.wizardState || wizard.wizardState.id !== wizard.campaignId || wizard.isLoading) {
      console.log(
        '[Step4Content MAIN SYNC useEffect] Skipping sync: conditions not met (wizardState missing, ID mismatch, or loading).'
      );
      return;
    }
    // Ensure wizard.wizardState.assets is an array before proceeding
    const wizardAssets: Readonly<DraftAsset[]> = Array.isArray(wizard.wizardState.assets)
      ? wizard.wizardState.assets
      : [];
    const formAssets: DraftAsset[] = form.getValues('assets') || [];

    console.log(
      '[Step4Content MAIN SYNC useEffect] WizardAssets from context:',
      JSON.parse(JSON.stringify(wizardAssets))
    );
    console.log(
      '[Step4Content MAIN SYNC useEffect] FormAssets from RHF before sync:',
      JSON.parse(JSON.stringify(formAssets))
    );

    let formWasModifiedBySetValue = false;
    // Initialize requiresFullReset based on initial array length comparison or if wizardAssets has items and formAssets is empty
    let requiresFullReset =
      wizardAssets.length !== formAssets.length ||
      (wizardAssets.length > 0 && formAssets.length === 0);
    if (requiresFullReset) {
      console.log(
        `[Step4Content MAIN SYNC useEffect] Initial check: wizardAssets length ${wizardAssets.length}, formAssets length ${formAssets.length}. requiresFullReset set to ${requiresFullReset}`
      );
    }

    wizardAssets.forEach((wizardAsset, wizardAssetIndex) => {
      const wizardAssetDbId = wizardAsset.id ? String(wizardAsset.id) : null;
      const wizardAssetInternalId = wizardAsset.internalAssetId
        ? String(wizardAsset.internalAssetId)
        : null;

      let matchedFormAssetIndex = -1;
      const matchedFormAsset = formAssets.find((fa, index) => {
        const formAssetDbId = fa.id ? String(fa.id) : null;
        const formAssetInternalId = fa.internalAssetId ? String(fa.internalAssetId) : null;

        if (formAssetDbId && wizardAssetDbId && formAssetDbId === wizardAssetDbId) {
          matchedFormAssetIndex = index;
          return true;
        }
        if (
          formAssetInternalId &&
          wizardAssetInternalId &&
          formAssetInternalId === wizardAssetInternalId
        ) {
          matchedFormAssetIndex = index;
          return true;
        }
        // Also match by internal ID in case the temp ID format changed
        if (formAssetDbId && formAssetDbId.includes('temp-mux-') && wizardAssetInternalId) {
          const tempIdParts = formAssetDbId.split('temp-mux-');
          if (tempIdParts.length > 1 && tempIdParts[1] === wizardAssetInternalId) {
            matchedFormAssetIndex = index;
            return true;
          }
        }
        return false;
      });

      console.log(
        `[Step4Content MAIN SYNC useEffect] Processing wizardAsset (idx ${wizardAssetIndex}, id: ${wizardAssetDbId}, internalId: ${wizardAssetInternalId}, status: ${wizardAsset.muxProcessingStatus}):`,
        wizardAsset
      );

      if (matchedFormAsset && matchedFormAssetIndex !== -1) {
        // ... (rest of the update logic for matched asset using form.setValue)
        // Ensure this block correctly updates formWasModifiedBySetValue = true if changes are made
        let assetWasChanged = false;
        const updatedFormAsset = { ...matchedFormAsset };

        if (
          wizardAsset.muxProcessingStatus &&
          matchedFormAsset.muxProcessingStatus !== wizardAsset.muxProcessingStatus
        ) {
          console.log(
            `[Step4Content MAIN SYNC useEffect] ==> UPDATING muxProcessingStatus for form asset at index ${matchedFormAssetIndex} from ${matchedFormAsset.muxProcessingStatus} to ${wizardAsset.muxProcessingStatus}`
          );
          updatedFormAsset.muxProcessingStatus = wizardAsset.muxProcessingStatus;
          assetWasChanged = true;
        }
        // ... (other setValue calls for url, muxPlaybackId, etc., setting assetWasChanged = true)
        if (wizardAsset.muxProcessingStatus === 'READY') {
          if (wizardAsset.url && matchedFormAsset.url !== wizardAsset.url) {
            updatedFormAsset.url = wizardAsset.url;
            assetWasChanged = true;
          }
          if (
            wizardAsset.muxPlaybackId &&
            matchedFormAsset.muxPlaybackId !== wizardAsset.muxPlaybackId
          ) {
            updatedFormAsset.muxPlaybackId = wizardAsset.muxPlaybackId;
            assetWasChanged = true;
          }
          if (wizardAsset.duration && matchedFormAsset.duration !== wizardAsset.duration) {
            updatedFormAsset.duration = wizardAsset.duration;
            assetWasChanged = true;
          }
        }
        if (wizardAsset.muxAssetId && matchedFormAsset.muxAssetId !== wizardAsset.muxAssetId) {
          updatedFormAsset.muxAssetId = wizardAsset.muxAssetId;
          assetWasChanged = true;
        }
        if (wizardAsset.fileSize && matchedFormAsset.fileSize !== wizardAsset.fileSize) {
          updatedFormAsset.fileSize = wizardAsset.fileSize;
          assetWasChanged = true;
        }
        if (
          typeof matchedFormAsset.id === 'string' &&
          matchedFormAsset.id.startsWith('temp-mux-') &&
          wizardAssetDbId &&
          matchedFormAsset.id !== wizardAssetDbId
        ) {
          updatedFormAsset.id = wizardAssetDbId;
          assetWasChanged = true;
        } else if (!matchedFormAsset.id && wizardAssetDbId) {
          updatedFormAsset.id = wizardAssetDbId;
          assetWasChanged = true;
        }

        if (assetWasChanged) {
          // Force update the form state with new values and trigger validation/re-render
          form.setValue(`assets.${matchedFormAssetIndex}`, updatedFormAsset, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          formWasModifiedBySetValue = true;

          // Log what was updated to help debugging
          console.log(
            `[Step4Content MAIN SYNC useEffect] Updated form asset at index ${matchedFormAssetIndex}:`,
            JSON.parse(JSON.stringify(updatedFormAsset))
          );
        }
      } else {
        console.log(
          `[Step4Content MAIN SYNC useEffect] New wizardAsset (id: ${wizardAssetDbId}, internalId: ${wizardAssetInternalId}) not found in form. Will mark for full reset if form not dirty.`
        );
        if (!form.formState.isDirty) {
          requiresFullReset = true;
        }
      }
    });

    if (requiresFullReset && !form.formState.isDirty && !wizard.isLoading) {
      console.log('[Step4Content MAIN SYNC useEffect] Performing full assets reset...');

      // Make sure each asset in wizardAssets has a fieldId
      const assetsWithFieldIds = wizardAssets.map(asset => ({
        ...asset,
        fieldId:
          asset.fieldId ||
          `field-${asset.id || Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      }));

      // Create a new form state object without assets
      const currentValues = form.getValues();
      const { assets: _, ...valuesWithoutAssets } = currentValues;

      // Reset form with the new asset array containing fieldIds
      form.reset(
        {
          ...valuesWithoutAssets,
          assets: assetsWithFieldIds,
        },
        {
          keepDirty: false,
          keepValues: true,
          keepErrors: false,
        }
      );

      // Force a notification to child components that values have changed
      form.trigger();
    } else if (formWasModifiedBySetValue) {
      console.log(
        '[Step4Content MAIN SYNC useEffect] Form was modified by individual setValue calls. Full reset skipped. Form dirty: ',
        form.formState.isDirty
      );

      // Trigger validation/notification after setValue operations
      form.trigger('assets');
    } else if (!requiresFullReset) {
      console.log(
        '[Step4Content MAIN SYNC useEffect] No changes by setValue, no structural diff. Form dirty: ',
        form.formState.isDirty
      );
    } else if (requiresFullReset && form.formState.isDirty) {
      console.warn(
        '[Step4Content MAIN SYNC useEffect] Full asset reset deemed necessary but form is dirty. New assets from context may not appear, and existing form edits are preserved over context structural changes.'
      );
    }
  }, [wizard.wizardState, wizard.campaignId, wizard.isLoading, form]);

  // ++ ROBUST POLLING LOGIC FOR PROCESSING ASSETS ++
  const [processingAssetIdsInPoll, setProcessingAssetIdsInPoll] = React.useState<
    Array<string | number>
  >([]);
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const pollAttemptsRef = React.useRef<Record<string | number, number>>({});
  const isPollingActiveRef = React.useRef<boolean>(false);
  const lastPollTimeRef = React.useRef<number>(0);
  const MIN_POLL_INTERVAL_MS = 5000; // 5 seconds minimum between polls
  const MAX_POLL_ATTEMPTS_PER_ASSET = 24; // Approx 2 minutes (24 * 5s)
  const COOLING_PERIOD_AFTER_RELOAD_MS = 2000; // Don't poll for 2 seconds after any reload

  const formAssetsWatched = form.watch('assets'); // Watch all assets in the form

  // Effect 1: Identify assets in the form that need polling and add them to our polling list
  useEffect(() => {
    if (wizard.isLoading) return; // Don't scan for assets during wizard loading

    const assetsInFormCurrentlyProcessing = formAssetsWatched
      ?.filter(
        (asset: DraftAsset) =>
          asset.muxProcessingStatus === 'MUX_PROCESSING' ||
          asset.muxProcessingStatus === 'PENDING_UPLOAD'
      )
      .map((asset: DraftAsset) => asset.internalAssetId) // Use internalAssetId (DB ID)
      .filter(id => id !== undefined) as Array<string | number>;

    if (assetsInFormCurrentlyProcessing && assetsInFormCurrentlyProcessing.length > 0) {
      setProcessingAssetIdsInPoll(prevPollIds => {
        const newIdsToPoll = assetsInFormCurrentlyProcessing.filter(
          id => !prevPollIds.includes(id)
        );
        if (newIdsToPoll.length > 0) {
          console.log(
            '[Step4Content Polling Effect1] Adding new assets to poll list:',
            newIdsToPoll
          );
          newIdsToPoll.forEach(id => {
            pollAttemptsRef.current[id] = 0;
          }); // Reset attempts for new IDs
          return [...new Set([...prevPollIds, ...newIdsToPoll])]; // Ensure unique IDs
        }
        return prevPollIds;
      });
    }
    // If an asset that was processing is no longer in the form (e.g. deleted),
    // Effect 3 will handle removing it from processingAssetIdsInPoll.
  }, [formAssetsWatched, wizard.isLoading]);

  // Effect 2: Manage the actual polling interval if there are assets in processingAssetIdsInPoll
  useEffect(() => {
    // Clear any existing interval first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Don't start polling if no assets to poll or wizard is loading
    if (processingAssetIdsInPoll.length === 0 || wizard.isLoading) {
      return;
    }

    console.log(
      `[Step4Content Polling Effect2] ${processingAssetIdsInPoll.length} assets in poll list. Starting/Restarting poll for IDs:`,
      processingAssetIdsInPoll
    );

    // Function that actually performs the polling
    const executePoll = () => {
      // Skip this poll if the previous one hasn't completed yet
      if (isPollingActiveRef.current) {
        console.log('[Step4Content Polling] Skipping poll as previous request still in progress');
        return;
      }

      // Skip if we're in a cooling period
      const now = Date.now();
      if (now - lastPollTimeRef.current < MIN_POLL_INTERVAL_MS) {
        console.log('[Step4Content Polling] Skipping poll due to minimum interval enforcement');
        return;
      }

      // Skip if wizard is loading data
      if (wizard.isLoading) {
        console.log('[Step4Content Polling] Skipping poll as wizard is already loading');
        return;
      }

      // Check attempts for each ID before reloading
      let shouldReload = false;
      processingAssetIdsInPoll.forEach(id => {
        pollAttemptsRef.current[id] = (pollAttemptsRef.current[id] || 0) + 1;
        if (pollAttemptsRef.current[id] <= MAX_POLL_ATTEMPTS_PER_ASSET) {
          shouldReload = true;
        } else {
          console.warn(
            `[Step4Content Polling Effect2] Max poll attempts reached for asset ID ${id}. Will not trigger reload for this asset anymore.`
          );
        }
      });

      if (!shouldReload) {
        // All assets have reached their max poll attempts, so stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return;
      }

      // Update the last poll time
      lastPollTimeRef.current = now;

      // Mark polling as active before making the request
      isPollingActiveRef.current = true;

      // Log the polling attempts
      const activePollAttempts = processingAssetIdsInPoll.map(id => pollAttemptsRef.current[id]);
      console.log(
        `[Step4Content Polling Effect2] Polling. Attempts for IDs ${processingAssetIdsInPoll.join(', ')}: ${activePollAttempts.join(', ')}. Reloading campaign data.`
      );

      // Call the reload function - this is a non-blocking call to prevent react hook issues
      try {
        wizard.reloadCampaignData();
      } catch (error) {
        console.error('[Step4Content Polling] Error reloading campaign data:', error);
      }

      // Always set polling back to inactive after a delay
      setTimeout(() => {
        isPollingActiveRef.current = false;
      }, COOLING_PERIOD_AFTER_RELOAD_MS);
    };

    // Set up the polling interval
    pollingIntervalRef.current = setInterval(executePoll, MIN_POLL_INTERVAL_MS + 1000); // Add 1s buffer

    // Run the poll immediately for the first time
    if (!isPollingActiveRef.current && processingAssetIdsInPoll.length > 0) {
      executePoll();
    }

    // Cleanup: clear interval when component unmounts or deps change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [processingAssetIdsInPoll, wizard.isLoading, wizard.reloadCampaignData]);

  // Effect 3: Check RHF FORM state for assets that are done processing and remove from poll list
  useEffect(() => {
    if (processingAssetIdsInPoll.length === 0) return;

    // This effect runs when formAssetsWatched changes or after a campaign data reload
    console.log(
      '[Step4Content Polling Effect3] Form assets updated. Checking statuses for polled IDs:',
      processingAssetIdsInPoll
    );

    const stillNeedsPolling = processingAssetIdsInPoll.filter(idToPoll => {
      const formAsset = formAssetsWatched?.find(
        fa => String(fa.internalAssetId) === String(idToPoll)
      );

      if (formAsset) {
        const isTerminal =
          formAsset.muxProcessingStatus === 'READY' ||
          formAsset.muxProcessingStatus === 'ERROR' ||
          formAsset.muxProcessingStatus === 'ERROR_NO_PLAYBACK_ID';

        console.log(
          `[Step4Content Polling Effect3] Status for asset internalId ${idToPoll} in FORM: ${formAsset.muxProcessingStatus}. Needs polling: ${!isTerminal}. Attempts: ${pollAttemptsRef.current[idToPoll]}`
        );

        if (isTerminal) {
          console.log(
            `[Step4Content Polling Effect3] Asset ${idToPoll} has reached terminal state: ${formAsset.muxProcessingStatus}`
          );
          return false; // Don't poll for assets in terminal state
        }

        if (pollAttemptsRef.current[idToPoll] > MAX_POLL_ATTEMPTS_PER_ASSET) {
          console.warn(
            `[Step4Content Polling Effect3] Asset internalId ${idToPoll} reached max poll attempts. Removing from active polling.`
          );
          return false; // Stop polling this one due to max attempts
        }

        return true; // Keep polling
      } else {
        // Asset is no longer in the form (e.g., deleted by user), stop polling for it.
        console.log(
          `[Step4Content Polling Effect3] Asset internalId ${idToPoll} no longer in form. Removing from poll list.`
        );
        delete pollAttemptsRef.current[idToPoll]; // Clear attempts for this ID
        return false;
      }
    });

    if (stillNeedsPolling.length !== processingAssetIdsInPoll.length) {
      console.log(
        '[Step4Content Polling Effect3] Poll list updated based on form state. New list of IDs to poll:',
        stillNeedsPolling
      );
      setProcessingAssetIdsInPoll(stillNeedsPolling);

      // If all processing is done, clean up
      if (stillNeedsPolling.length === 0 && pollingIntervalRef.current) {
        console.log(
          '[Step4Content Polling Effect3] All assets processed. Stopping polling interval.'
        );
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [formAssetsWatched, processingAssetIdsInPoll, wizard.wizardState]);
  // -- END POLLING LOGIC --

  // Navigation Handlers
  const handleStepClick = (step: number) => {
    if (wizard.campaignId && step < 5) {
      // Allow nav to completed/current
      router.push(`/campaigns/wizard/step-${step}?id=${wizard.campaignId}`);
    } else if (step < 5) {
      // Allow navigation to previous steps even without campaignId if creating new
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
  // Combined Save & Next handler
  const onSubmitAndNavigate = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      // Use helper
      showErrorToast('Please fix the errors before proceeding.');
      return;
    }
    const data = form.getValues();
    const payload: Partial<DraftCampaignData> = {
      assets: data.assets,
      guidelines: data.guidelines,
      requirements: data.requirements,
      notes: data.notes,
      step4Complete: true,
      currentStep: 4,
    };
    // wizard.updateWizardState(payload); // Commented out immediate state update

    // Log the payload being sent when clicking Next
    console.log(
      '[Step 4] Payload prepared for onSubmitAndNavigate, sending to saveProgress:',
      payload
    );

    const saved = await wizard.saveProgress(payload); // Save Step 4 data first
    if (saved) {
      // Only navigate AFTER successful save
      form.reset(data, { keepValues: true, keepDirty: false });
      if (wizard.campaignId) {
        router.push(`/campaigns/wizard/step-5?id=${wizard.campaignId}`); // Navigate to Step 5
      } else {
        // Use helper
        showErrorToast('Could not navigate: campaign ID not found.');
      }
    } else {
      // Use helper
      showErrorToast('Failed to save progress before navigating.');
    }
  };

  // NEW: Handler for the manual Save button
  const handleSave = async (): Promise<boolean> => {
    console.log('[Step 4] Attempting Manual Save...');
    // Explicitly trigger validation for manual save
    const isValid = await form.trigger();
    if (!isValid) {
      console.warn('[Step 4] Validation failed for manual save.');
      // Use helper
      showErrorToast('Please fix the errors before saving.');
      return false;
    }
    const data = form.getValues();
    console.log('[Step 4] Form data is valid for manual save.');

    // Prepare payload, keeping currentStep as 4
    const payload: Partial<DraftCampaignData> = {
      assets: data.assets,
      guidelines: data.guidelines,
      requirements: data.requirements,
      notes: data.notes,
      step4Complete: form.formState.isValid, // Use current validation state
      currentStep: 4,
    };

    console.log('[Step 4] Payload prepared for manual save:', payload);

    try {
      // Only call saveProgress
      const saveSuccess = await wizard.saveProgress(payload);

      if (saveSuccess) {
        console.log('[Step 4] Manual save successful!');
        // Use helper (default icon)
        showSuccessToast('Progress saved!');
        // Optionally reset dirty state
        // form.reset(data, { keepValues: true, keepDirty: false, keepErrors: true });
        return true;
      } else {
        console.error('[Step 4] Manual save failed.');
        // saveProgress should show specific error
        return false;
      }
    } catch (error) {
      console.error('[Step 4] Error during manual save:', error);
      // Use helper
      showErrorToast('An unexpected error occurred during save.');
      return false;
    }
  };

  // Render Logic
  // Removed internal loading check
  /*
  if (wizard.isLoading && !wizard.wizardState && wizard.campaignId) {
    return <LoadingSkeleton />;
  }
  */

  // Add null check for wizardState
  if (!wizard.wizardState) {
    console.warn(
      '[Step4Content] Wizard state is null during render. Displaying minimal UI or loader.'
    );
    // Optionally return a loader or a message, but ensure ProgressBarWizard still gets some props
    return (
      <div className="space-y-8">
        <ProgressBarWizard
          currentStep={4}
          steps={wizard.stepsConfig} // Assuming stepsConfig is available on wizard even if wizardState is null
          onStepClick={handleStepClick}
          onBack={handleBack}
          onNext={onSubmitAndNavigate}
          isNextDisabled={true} // Disable if no state
          isNextLoading={wizard.isLoading}
          onSave={handleSave}
          // getCurrentFormData may not be available if form is not initialized
        />
        <p className="text-center text-muted-foreground">Loading campaign data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Use ProgressBarWizard */}
      <ProgressBarWizard
        currentStep={4}
        steps={wizard.stepsConfig}
        onStepClick={handleStepClick}
        onBack={handleBack}
        onNext={onSubmitAndNavigate}
        isNextDisabled={form.watch('assets')?.length === 0}
        isNextLoading={form.formState.isSubmitting || wizard.isLoading}
        getCurrentFormData={form.getValues}
        onSave={handleSave}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitAndNavigate)}
          className="space-y-8 pb-[var(--footer-height)]"
        >
          {' '}
          {/* Add padding-bottom */}
          {/* --- Assets Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>Creative Assets</CardTitle>
              <CardDescription>Upload your video assets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* VideoFileUploader is now the primary/only uploader here */}
              <div className="mt-0 pt-0">
                {wizard.wizardState &&
                typeof wizard.wizardState.id === 'string' &&
                wizard.wizardState.id ? (
                  <VideoFileUploader
                    name="assets"
                    control={form.control}
                    label={undefined}
                    campaignWizardId={wizard.wizardState.id}
                    onUploadComplete={handleVideoUploadComplete}
                    onUploadError={handleUploadError}
                    accept={{ 'video/*': ['.mp4', '.mov'] }}
                    maxSizeMB={1024}
                    sizeLimitText="up to 1GB for videos"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Video uploader requires an active campaign draft. Please ensure the campaign
                    wizard is initialized.
                  </p>
                )}
              </div>

              {/* Display uploaded assets using AssetCardStep4 */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assetFields.map((field, index) => {
                  // Cast the field to DraftAsset explicitly
                  const asset = field as unknown as DraftAsset;

                  console.log(
                    `[Step4Content render] Rendering AssetCardStep4 for index: ${index}, field data:`,
                    JSON.parse(JSON.stringify(asset))
                  );

                  return (
                    <div key={field.fieldId} className="relative group">
                      {/* Render the Step 4 card component with proper casting */}
                      <AssetCardStep4
                        assetIndex={index}
                        asset={asset}
                        control={form.control}
                        getValues={form.getValues}
                        saveProgress={wizard.saveProgress}
                        availableInfluencers={influencerOptions}
                        currency={wizard.wizardState?.budget?.currency || 'USD'}
                      />
                      {/* Keep remove button functionality */}
                      <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButtonAction
                          iconBaseName="faTrashCan"
                          hoverColorClass="text-destructive"
                          ariaLabel={`Remove asset ${index + 1}`}
                          onClick={() => {
                            handleDeleteAsset(asset.internalAssetId ?? asset.id, index, asset.name);
                          }}
                          className="bg-background/70 hover:bg-background/90 rounded-full p-1 h-6 w-6"
                        />
                      </div>
                    </div>
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
