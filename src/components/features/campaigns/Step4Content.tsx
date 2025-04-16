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
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { FileUploader, UploadThingResult } from '@/components/ui/file-uploader';
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import AssetCardStep4 from '@/components/ui/card-asset-step-4';

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
    const data = form.getValues();
    const payload: Partial<DraftCampaignData> = {
      assets: data.assets,
      // Remove deprecated fields
      // guidelines: data.guidelines,
      // requirements: data.requirements,
      // notes: data.notes,
      step4Complete: true, // Mark step 4 as complete
      currentStep: 5,
    };
    // Update the centralized wizard state (SSOT)
    wizard.updateWizardState(payload);
    try {
      // Attempt to save progress, but don't block navigation if it fails
      const saved = await wizard.saveProgress(payload);
      if (saved) {
        form.reset(data, { keepValues: true, keepDirty: false });
        console.log('Progress saved successfully, navigating to Step 5.');
      } else {
        console.error(
          'Failed to save progress, but proceeding with navigation to maintain user flow.'
        );
        toast('Progress not saved, but proceeding to next step. Changes may not persist.', {
          icon: '⚠️',
        });
      }
      // Navigate to Step 5 regardless of save success, as state is updated locally in WizardContext
      if (wizard.campaignId) {
        router.push(`/campaigns/wizard/step-5?id=${wizard.campaignId}`);
      } else {
        console.error('Navigation failed: Campaign ID not found.');
        toast.error('Could not navigate: campaign ID not found.');
      }
    } catch (error) {
      console.error('Error during save and navigation:', error);
      toast.error('An error occurred while saving progress.');
      // Fallback navigation in case of error, ensuring user can proceed
      if (wizard.campaignId) {
        router.push(`/campaigns/wizard/step-5?id=${wizard.campaignId}`);
      } else {
        toast.error('Could not navigate: campaign ID not found.');
      }
    }
  };

  // Render Logic
  if (wizard.isLoading && !wizard.wizardState && wizard.campaignId) {
    // Revert to using LoadingSkeleton
    return <LoadingSkeleton />;
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
