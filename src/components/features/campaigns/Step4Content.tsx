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
} from '@/components/features/campaigns/types';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { FileUploader, UploadThingResult } from '@/components/ui/file-uploader';
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import AssetCardStep4 from '@/components/ui/card-asset-step-4';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils'; // Ensure this points correctly

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
      assets: wizard.wizardState?.assets ?? [],
      // Remove deprecated fields
      // guidelines: wizard.wizardState?.guidelines ?? '',
      // requirements: wizard.wizardState?.requirements ?? [],
      // notes: wizard.wizardState?.notes ?? '',
    },
  });

  // Remove useFieldArray for requirements as it's deprecated
  /*
    const { fields: requirementFields, append: appendRequirement, remove: removeRequirement } = useFieldArray({
        control: form.control,
        name: "requirements",
    });
    */

  const {
    fields: assetFields,
    append: appendAsset,
    remove: removeAsset,
  } = useFieldArray({
    control: form.control,
    name: 'assets',
  });

  // Prepare influencer options for the select component
  const influencerOptions = React.useMemo(() => {
    return (
      wizard.wizardState?.Influencer?.filter(inf => inf && typeof inf.id === 'string') // Filter out null/undefined IDs
        .map(inf => ({
          id: inf.id as string, // Assert as string after filtering
          handle: inf.handle,
        })) ?? []
    );
  }, [wizard.wizardState?.Influencer]);

  // Updated callback for the new FileUploader
  const handleAssetUploadComplete = useCallback(
    (results: UploadThingResult[]) => {
      // Map UploadThingResult to DraftAssetSchema format
      const assetsToAdd: z.infer<typeof DraftAssetSchema>[] = results.map(res => {
        let assetType: z.infer<typeof CreativeAssetTypeEnum> | undefined = undefined;
        if (res.type?.startsWith('image/')) {
          assetType = 'image';
        } else if (res.type?.startsWith('video/')) {
          assetType = 'video';
        }
        // TODO: Consider handling other types or logging a warning for unmapped types

        return {
          // Generate a temporary client-side ID or use res.key if unique enough
          id: `temp-${res.key || Date.now()}`,
          // url: res.ufsUrl, // TODO: Update UploadThingResult type and use ufsUrl
          url: res.url, // Reverting to url due to type issue, acknowledge deprecation
          name: res.name,
          fileName: res.name,
          fileSize: res.size,
          type: assetType,
          temp: true, // Mark as temporary until full form save
        };
      });
      appendAsset(assetsToAdd);
      // Log form state after append
      console.log('Form state after appending assets:', form.getValues('assets'));
    },
    [appendAsset, form]
  );

  // Handle upload errors (optional, FileUploader shows toast)
  const handleUploadError = useCallback((error: Error) => {
    console.error('Upload failed in parent:', error);
    // Additional parent-level error handling if needed
  }, []);

  useEffect(() => {
    if (wizard.wizardState && !form.formState.isDirty && !wizard.isLoading) {
      form.reset({
        assets: wizard.wizardState.assets ?? [],
        // Remove deprecated fields
        // guidelines: wizard.wizardState.guidelines ?? '',
        // requirements: wizard.wizardState.requirements ?? [],
        // notes: wizard.wizardState.notes ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizard.wizardState, wizard.isLoading, form.reset, form.formState.isDirty]);

  // Navigation Handlers
  const handleStepClick = (step: number) => {
    if (wizard.campaignId && step < 5) {
      // Allow nav to completed/current
      router.push(`/campaigns/wizard/step-${step}?id=${wizard.campaignId}`);
    }
  };
  const handleBack = () => {
    if (wizard.campaignId) router.push(`/campaigns/wizard/step-3?id=${wizard.campaignId}`);
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
      // Ensure deprecated fields are not included
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
    console.warn('[Step4Content] Wizard state is null during render.');
    return null; // Or a basic placeholder
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
              <CardDescription>Upload your videos or images.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader
                name="assets" // RHF field name (for validation trigger)
                control={form.control}
                endpoint="campaignAssetUploader" // Your UploadThing endpoint name
                label="Upload Campaign Assets"
                onUploadComplete={handleAssetUploadComplete}
                onUploadError={handleUploadError}
                accept={{ 'image/*': [], 'video/*': [] }} // Example accept prop
                sizeLimitText="up to 100MB each"
              />
              {/* Display uploaded assets using AssetCardStep4 */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assetFields.map((field, index) => {
                  // Use field and index from useFieldArray
                  // Log field data during map
                  console.log(`Rendering AssetCardStep4 for index: ${index}, field data:`, field);
                  return (
                    <div key={field.id} className="relative group">
                      {/* Render the new Step 4 card component, passing asset data directly */}
                      <AssetCardStep4
                        assetIndex={index}
                        asset={field as DraftAsset} // Pass the field data as the asset prop
                        control={form.control}
                        getValues={form.getValues} // Pass getValues from form
                        saveProgress={wizard.saveProgress} // Pass saveProgress from context
                        availableInfluencers={influencerOptions}
                        currency={wizard.wizardState?.budget?.currency ?? 'USD'} // Pass currency
                      />
                      {/* Keep remove button functionality */}
                      <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButtonAction
                          iconBaseName="faTrashCan"
                          hoverColorClass="text-destructive"
                          ariaLabel={`Remove asset ${index + 1}`}
                          onClick={() => removeAsset(index)}
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
