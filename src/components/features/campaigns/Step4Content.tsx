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

// Define a custom interface that extends Step4FormData for better type support with useFieldArray
interface CustomStep4FormData extends Omit<Step4FormData, 'assets'> {
  assets: DraftAsset[];
}

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
          ? wizard.wizardState.assets.map(asset => ({
              ...asset,
              fieldId:
                asset.fieldId ||
                `field-${asset.id || Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            }))
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

  // Use type assertion to bypass the TypeScript error
  // This approach has been used in the codebase before and works
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
      const fieldId = `field-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newVideoAsset: DraftAsset = {
        id: `temp-mux-${result.internalAssetId}`,
        fieldId, // Add explicit fieldId for useFieldArray
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

  // Main sync effect from wizard context to RHF form state - fix dependency array
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

    // IMPORTANT: Prevent infinite loop by checking if assets have meaningfully changed
    if (wizardAssets.length === formAssets.length && formAssets.length > 0) {
      // Check if any asset is missing fieldId, only then update
      const needsFieldIdUpdate = formAssets.some(asset => !asset.fieldId);
      const processingStatusChanged = formAssets.some((asset, index) => {
        const wizardAsset = wizardAssets[index];
        return wizardAsset && asset.muxProcessingStatus !== wizardAsset.muxProcessingStatus;
      });

      if (!needsFieldIdUpdate && !processingStatusChanged && !wizard.isLoading) {
        console.log('[Step4Content MAIN SYNC useEffect] Assets already synced, skipping update');
        return;
      }
    }

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

        // Ensure we have a fieldId
        if (!updatedFormAsset.fieldId) {
          updatedFormAsset.fieldId = `field-${updatedFormAsset.id || Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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

      // Fix: Create a new form state object with all the needed fields
      const formValues = {
        step4Complete: form.getValues('step4Complete') || false,
        guidelines: form.getValues('guidelines') || '',
        requirements: form.getValues('requirements') || [],
        notes: form.getValues('notes') || '',
        assets: assetsWithFieldIds,
      };

      // Reset form with the new asset array containing fieldIds
      form.reset(formValues, {
        keepDirty: false,
        keepValues: false,
        keepErrors: false,
      });

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
  }, [wizard.wizardState, wizard.campaignId, wizard.isLoading]);

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

  // Fix: Optimize dependency array to prevent unnecessary polling
  useEffect(() => {
    if (wizard.isLoading) return; // Don't scan for assets during wizard loading

    // Only check asset statuses, not the entire objects
    const processingAssetIds = formAssetsWatched
      ?.filter(
        (asset: DraftAsset) =>
          asset.muxProcessingStatus === 'MUX_PROCESSING' ||
          asset.muxProcessingStatus === 'PENDING_UPLOAD' ||
          asset.muxProcessingStatus === 'AWAITING_UPLOAD'
      )
      .map((asset: DraftAsset) => asset.internalAssetId) // Use internalAssetId (DB ID)
      .filter(id => id !== undefined) as Array<string | number>;

    if (processingAssetIds && processingAssetIds.length > 0) {
      setProcessingAssetIdsInPoll(prevPollIds => {
        const newIdsToPoll = processingAssetIds.filter(id => !prevPollIds.includes(id));
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
      if (isPollingActiveRef.current) {
        console.log('[Step4Content Polling] Skipping poll as previous request still in progress');
        return;
      }
      const now = Date.now();
      if (now - lastPollTimeRef.current < MIN_POLL_INTERVAL_MS) {
        console.log('[Step4Content Polling] Skipping poll due to minimum interval enforcement');
        return;
      }
      if (wizard.isLoading) {
        console.log('[Step4Content Polling] Skipping poll as wizard is already loading');
        return;
      }

      let shouldReloadDueToAttempts = false;
      processingAssetIdsInPoll.forEach(id => {
        pollAttemptsRef.current[id] = (pollAttemptsRef.current[id] || 0) + 1;
        if (pollAttemptsRef.current[id] <= MAX_POLL_ATTEMPTS_PER_ASSET) {
          shouldReloadDueToAttempts = true;
        } else {
          console.warn(
            `[Step4Content Polling Effect2] Max poll attempts reached for asset ID ${id}. Will not trigger reload for this asset anymore.`
          );
        }
      });

      if (!shouldReloadDueToAttempts) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        isPollingActiveRef.current = false;
        return;
      }

      const currentFormAssets = form.getValues('assets');
      const anyStillProcessingInPollList = processingAssetIdsInPoll.some(idToPoll => {
        const formAsset = currentFormAssets?.find(
          fa => String(fa.internalAssetId) === String(idToPoll)
        );
        if (!formAsset) return false;
        const isTerminal =
          formAsset.muxProcessingStatus === 'READY' ||
          formAsset.muxProcessingStatus === 'ERROR' ||
          formAsset.muxProcessingStatus === 'ERROR_NO_PLAYBACK_ID';
        return !isTerminal;
      });

      if (!anyStillProcessingInPollList) {
        console.log(
          '[Step4Content Polling executePoll] All assets in current poll list are now in terminal state (or gone from form). Skipping reload.'
        );
        isPollingActiveRef.current = false;
        // Effect 3 will handle clearing processingAssetIdsInPoll and stopping the interval if list becomes empty.
        return;
      }

      isPollingActiveRef.current = true;
      lastPollTimeRef.current = now;
      const activePollAttempts = processingAssetIdsInPoll.map(id => pollAttemptsRef.current[id]);
      console.log(
        `[Step4Content Polling Effect2] Polling. Attempts for IDs ${processingAssetIdsInPoll.join(', ')} : ${activePollAttempts.join(', ')}. Reloading campaign data.`
      );
      try {
        wizard.reloadCampaignData();
      } catch (error) {
        console.error('[Step4Content Polling] Error reloading campaign data:', error);
      }
      setTimeout(() => {
        isPollingActiveRef.current = false;
      }, COOLING_PERIOD_AFTER_RELOAD_MS);
    };

    pollingIntervalRef.current = setInterval(executePoll, MIN_POLL_INTERVAL_MS + 1000);

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
  }, [processingAssetIdsInPoll.length, wizard.isLoading, wizard.reloadCampaignData]);

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
  }, [formAssetsWatched, processingAssetIdsInPoll]);
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
      // Check if it's failing due to missing assets
      if (form.getValues().assets.length === 0) {
        showErrorToast('Please upload at least one asset before proceeding.');
      } else {
        // Check if the asset rationale or budget are missing
        const assets = form.getValues().assets;
        const anyMissingRationale = assets.some(asset => !asset.rationale);
        const anyMissingBudget = assets.some(asset => !asset.budget);
        const anyMissingFieldId = assets.some(asset => !asset.fieldId);

        if (anyMissingRationale) {
          showErrorToast('Please provide a rationale for all assets.');
        } else if (anyMissingBudget) {
          showErrorToast('Please provide a budget for all assets.');
        } else if (anyMissingFieldId) {
          // This shouldn't happen with our fixes, but handle it just in case
          console.error('Missing fieldId detected');
          showErrorToast('There was an error with asset data. Please try saving again.');
        } else {
          showErrorToast('Please fix all form errors before proceeding.');
        }
      }
      return;
    }
    const data = form.getValues();

    // Ensure all assets have fieldId and required fields are properly formatted
    const assetsWithFieldIds = data.assets.map(asset => ({
      ...asset,
      fieldId:
        asset.fieldId ||
        `field-${asset.id || Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      // Ensure these fields are explicitly included for saving
      rationale: asset.rationale || '',
      budget: typeof asset.budget === 'number' ? asset.budget : 0,
      associatedInfluencerIds: Array.isArray(asset.associatedInfluencerIds)
        ? asset.associatedInfluencerIds
        : [],
    }));

    // Log the prepared assets data for debugging
    console.log('[Step 4] Prepared assets for onSubmitAndNavigate:', assetsWithFieldIds);

    const payload: Partial<DraftCampaignData> = {
      assets: assetsWithFieldIds,
      guidelines: data.guidelines || null,
      requirements: data.requirements || [],
      notes: data.notes || null,
      step4Complete: true,
      currentStep: 4,
    };

    // Log the payload being sent when clicking Next
    console.log(
      '[Step 4] Payload prepared for onSubmitAndNavigate, sending to saveProgress:',
      payload
    );

    const saved = await wizard.saveProgress(payload); // Save Step 4 data first
    if (saved) {
      // Only navigate AFTER successful save
      form.reset(
        {
          ...data,
          assets: assetsWithFieldIds,
        },
        {
          keepValues: false,
          keepDirty: false,
          keepErrors: false,
        }
      );

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

    const data = form.getValues();

    // Only validate if there are assets
    if (data.assets.length === 0) {
      showErrorToast('Please upload at least one asset before saving.');
      return false;
    }

    // Check if required fields for each asset are filled in
    const assets = data.assets;
    const anyMissingRationale = assets.some(asset => !asset.rationale);
    const anyMissingBudget = assets.some(asset => !asset.budget);
    const anyMissingFieldId = assets.some(asset => !asset.fieldId);

    if (anyMissingRationale) {
      showErrorToast('Please provide a rationale for all assets.');
      return false;
    }

    if (anyMissingBudget) {
      showErrorToast('Please provide a budget for all assets.');
      return false;
    }

    if (anyMissingFieldId) {
      console.warn('[Step 4] Some assets missing fieldId, will add them during save');
    }

    // Now run full validation
    const isValid = await form.trigger();
    if (!isValid) {
      console.warn('[Step 4] Validation failed for manual save.');
      showErrorToast('Please fix all form errors before saving.');
      return false;
    }

    console.log('[Step 4] Form data is valid for manual save.');

    // Ensure all assets have fieldId
    const assetsWithFieldIds = data.assets.map(asset => ({
      ...asset,
      fieldId:
        asset.fieldId ||
        `field-${asset.id || Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      // Ensure these fields are explicitly included for saving
      rationale: asset.rationale || '',
      budget: typeof asset.budget === 'number' ? asset.budget : 0,
      associatedInfluencerIds: Array.isArray(asset.associatedInfluencerIds)
        ? asset.associatedInfluencerIds
        : [],
    }));

    // Log the prepared assets data for debugging
    console.log('[Step 4] Prepared assets for save:', assetsWithFieldIds);

    // Prepare payload, keeping currentStep as 4
    const payload: Partial<DraftCampaignData> = {
      assets: assetsWithFieldIds,
      guidelines: data.guidelines || null,
      requirements: data.requirements || [],
      notes: data.notes || null,
      step4Complete: form.formState.isValid,
      currentStep: 4,
    };

    console.log('[Step 4] Payload prepared for manual save:', payload);

    try {
      // Only call saveProgress
      const saveSuccess = await wizard.saveProgress(payload);

      if (saveSuccess) {
        console.log('[Step 4] Manual save successful!');
        // Reset form to clear dirty state but maintain values
        form.reset(
          {
            ...data,
            assets: assetsWithFieldIds,
          },
          {
            keepValues: false,
            keepDirty: false,
            keepErrors: false,
          }
        );
        // Use helper (default icon)
        showSuccessToast('Progress saved!');
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
    // Display only the ProgressBarWizard without the loading text
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
                        key={field.fieldId}
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
