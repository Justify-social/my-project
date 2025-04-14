import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import campaignService from '@/lib/data-mapping/campaign-service';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';

// Autosave interval in milliseconds (5 seconds)
const AUTOSAVE_INTERVAL = 5000;

// Types for the wizard steps
export type WizardStep = 1 | 2 | 3 | 4;

// Types for the form data by step
export interface OverviewFormData {
  name: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  description?: string;
  brandId?: number;
}

export interface ObjectivesFormData {
  objectives: string[];
}

export interface AudienceFormData {
  locations?: Array<{
    country: string;
    region?: string;
    city?: string;
  }>;
  genders?: Array<{
    gender: string;
  }>;
  ageRanges?: Array<{
    minAge: number;
    maxAge: number;
  }>;
  screeningQuestions?: Array<{
    question: string;
    required: boolean;
    options?: string[];
  }>;
  languages?: Array<{
    language: string;
  }>;
  competitors?: Array<{
    name: string;
  }>;
}

export interface AssetFormData {
  assets: Array<{
    id?: number;
    type: string;
    name?: string;
    description?: string;
    status?: string;
    url?: string;
  }>;
}

// Combined type for all form data
export type CampaignFormData = OverviewFormData &
  ObjectivesFormData &
  AudienceFormData &
  AssetFormData;

// Hook options
interface UseCampaignWizardOptions {
  campaignId: number;
  initialStep?: WizardStep;
  enableAutosave?: boolean;
}

/**
 * Hook for managing campaign wizard state and operations
 */
export function useCampaignWizard({
  campaignId,
  initialStep = 1,
  enableAutosave = true,
}: UseCampaignWizardOptions) {
  const router = useRouter();

  // Current step
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);

  // Form data for each step
  const [overviewData, setOverviewData] = useState<OverviewFormData>({
    name: '',
  });

  const [objectivesData, setObjectivesData] = useState<ObjectivesFormData>({
    objectives: [],
  });

  const [audienceData, setAudienceData] = useState<AudienceFormData>({});

  const [assetsData, setAssetsData] = useState<AssetFormData>({
    assets: [],
  });

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Track if form has been modified since last save
  const [isDirty, setIsDirty] = useState(false);

  // Last autosave timestamp
  const [lastAutosave, setLastAutosave] = useState<Date | null>(null);

  /**
   * Load data for the current step
   */
  const loadStepData = useCallback(
    async (step: WizardStep) => {
      if (!campaignId) return;

      setIsLoading(true);
      setError(null);

      try {
        dbLogger.info(DbOperation.FETCH, `Loading data for campaign ${campaignId} step ${step}`, {
          campaignId,
          step,
        });

        const response = await fetch(`/api/campaigns/${campaignId}/wizard/${step}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load step data');
        }

        const { data } = await response.json();

        // Update the appropriate state based on step
        switch (step) {
          case 1:
            setOverviewData(data);
            break;
          case 2:
            setObjectivesData(data);
            break;
          case 3:
            setAudienceData(data);
            break;
          case 4:
            setAssetsData(data);
            break;
        }

        setIsDirty(false);

        dbLogger.debug(
          DbOperation.FETCH,
          `Successfully loaded data for campaign ${campaignId} step ${step}`,
          { campaignId, step }
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred loading step data';
        setError(errorMessage);

        dbLogger.error(
          DbOperation.FETCH,
          `Error loading data for campaign ${campaignId} step ${step}`,
          { campaignId, step },
          err
        );

        toast.error(`Failed to load data: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
    [campaignId]
  );

  /**
   * Save data for the current step
   */
  const saveStepData = useCallback(
    async (step: WizardStep, isAutoSave = false) => {
      if (!campaignId) return;

      // Don't autosave if the form hasn't been modified
      if (isAutoSave && !isDirty) return;

      if (isAutoSave) {
        setIsAutosaving(true);
      } else {
        setIsSaving(true);
      }

      setError(null);

      try {
        let stepData: any = {};

        // Get the appropriate data based on step
        switch (step) {
          case 1:
            stepData = overviewData;
            break;
          case 2:
            stepData = objectivesData;
            break;
          case 3:
            stepData = audienceData;
            break;
          case 4:
            stepData = assetsData;
            break;
        }

        dbLogger.info(
          DbOperation.UPDATE,
          `${isAutoSave ? 'Auto-saving' : 'Saving'} data for campaign ${campaignId} step ${step}`,
          { campaignId, step, isAutoSave }
        );

        const result = await campaignService.autoSaveWizardStep(campaignId, step, stepData);

        if (!result.success) {
          throw new Error(result.message || 'Failed to save step data');
        }

        setIsDirty(false);

        if (isAutoSave) {
          setLastAutosave(new Date());
          // Don't show toast for autosave to avoid spamming the user
        } else {
          toast.success('Changes saved successfully');
        }

        dbLogger.debug(
          DbOperation.UPDATE,
          `Successfully ${isAutoSave ? 'auto-saved' : 'saved'} data for campaign ${campaignId} step ${step}`,
          { campaignId, step, isAutoSave }
        );

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred saving step data';
        setError(errorMessage);

        dbLogger.error(
          DbOperation.UPDATE,
          `Error ${isAutoSave ? 'auto-saving' : 'saving'} data for campaign ${campaignId} step ${step}`,
          { campaignId, step, isAutoSave },
          err
        );

        if (!isAutoSave) {
          // Only show error toast for manual saves
          toast.error(`Failed to save: ${errorMessage}`);
        }

        return false;
      } finally {
        if (isAutoSave) {
          setIsAutosaving(false);
        } else {
          setIsSaving(false);
        }
      }
    },
    [campaignId, overviewData, objectivesData, audienceData, assetsData, isDirty]
  );

  /**
   * Navigate to the next step
   */
  const goToNextStep = useCallback(async () => {
    // Save current step before proceeding
    const saved = await saveStepData(currentStep);

    if (saved) {
      if (currentStep < 4) {
        const nextStep = (currentStep + 1) as WizardStep;
        setCurrentStep(nextStep);

        // Load data for the next step
        await loadStepData(nextStep);

        // Update URL to reflect the new step
        router.push(`/campaigns/wizard/step-${nextStep}?id=${campaignId}`);
      } else {
        // If we're on the last step, navigate to the campaign summary
        router.push(`/campaigns/${campaignId}`);
      }
    }
  }, [campaignId, currentStep, loadStepData, router, saveStepData]);

  /**
   * Navigate to the previous step
   */
  const goToPreviousStep = useCallback(async () => {
    // Optionally save current step before going back
    await saveStepData(currentStep, true);

    if (currentStep > 1) {
      const prevStep = (currentStep - 1) as WizardStep;
      setCurrentStep(prevStep);

      // Load data for the previous step
      await loadStepData(prevStep);

      // Update URL to reflect the new step
      router.push(`/campaigns/wizard/step-${prevStep}?id=${campaignId}`);
    }
  }, [campaignId, currentStep, loadStepData, router, saveStepData]);

  /**
   * Update form data for the current step
   */
  const updateFormData = useCallback(
    (data: Partial<CampaignFormData>) => {
      switch (currentStep) {
        case 1:
          setOverviewData(prev => ({ ...prev, ...data }));
          break;
        case 2:
          setObjectivesData(prev => ({ ...prev, ...data }));
          break;
        case 3:
          setAudienceData(prev => ({ ...prev, ...data }));
          break;
        case 4:
          setAssetsData(prev => ({ ...prev, ...data }));
          break;
      }

      setIsDirty(true);
    },
    [currentStep]
  );

  /**
   * Save the campaign as a draft
   */
  const saveAsDraft = useCallback(async () => {
    const saved = await saveStepData(currentStep);

    if (saved) {
      // Update campaign status to draft
      await campaignService.updateOverview(campaignId, {
        ...overviewData,
        status: 'draft',
      });

      toast.success('Campaign saved as draft');

      // Navigate to campaigns list
      router.push('/campaigns');
    }
  }, [campaignId, currentStep, overviewData, router, saveStepData]);

  /**
   * Submit the entire campaign
   */
  const submitCampaign = useCallback(async () => {
    // Save the current step first
    const saved = await saveStepData(currentStep);

    if (saved) {
      setIsSaving(true);

      try {
        // Update campaign status to submitted
        const result = await campaignService.updateFullCampaign(campaignId, {
          campaign: {
            ...overviewData,
            status: 'active',
            objectives: objectivesData.objectives,
            id: campaignId,
            name: overviewData.name,
          },
          audience: audienceData,
          assets: assetsData.assets,
        });

        if (!result.success) {
          throw new Error(result.message || 'Failed to submit campaign');
        }

        toast.success('Campaign submitted successfully');

        // Navigate to campaign details
        router.push(`/campaigns/${campaignId}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred submitting the campaign';
        setError(errorMessage);
        toast.error(`Failed to submit: ${errorMessage}`);
      } finally {
        setIsSaving(false);
      }
    }
  }, [
    campaignId,
    currentStep,
    overviewData,
    objectivesData,
    audienceData,
    assetsData,
    router,
    saveStepData,
  ]);

  // Load initial data when the component mounts or step changes
  useEffect(() => {
    if (campaignId) {
      loadStepData(currentStep);
    }
  }, [campaignId, currentStep, loadStepData]);

  // Set up autosave
  useEffect(() => {
    if (!enableAutosave || !isDirty) return;

    const autosaveTimer = setTimeout(() => {
      saveStepData(currentStep, true);
    }, AUTOSAVE_INTERVAL);

    return () => clearTimeout(autosaveTimer);
  }, [campaignId, currentStep, enableAutosave, isDirty, saveStepData]);

  // Return the hook API
  return {
    // Current state
    currentStep,
    isLoading,
    isSaving,
    isAutosaving,
    error,
    isDirty,
    lastAutosave,

    // Form data
    overviewData,
    objectivesData,
    audienceData,
    assetsData,

    // Actions
    setCurrentStep,
    updateFormData,
    saveStepData,
    goToNextStep,
    goToPreviousStep,
    saveAsDraft,
    submitCampaign,

    // Helper computed properties
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === 4,

    // Progress calculation (25% per step)
    progress: (currentStep / 4) * 100,
  };
}

export default useCampaignWizard;
