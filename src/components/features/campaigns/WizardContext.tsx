'use client'; // Make sure this file is a client component if you're using Next.js 13 with the App Router.

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
// Import the ACTUAL DraftCampaignData type from types.ts
import { DraftCampaignData, DraftCampaignDataSchema } from '@/components/features/campaigns/types';
// TODO: Replace WizardCampaignFormData with a proper type derived from schema.prisma CampaignWizard model in types.ts
// import { CampaignFormData as WizardCampaignFormData } from '@/types/influencer';
import { DateService } from '@/utils/date-service';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';
import { standardizeApiResponse } from '@/utils/api-response-formatter';
// TODO: Remove this import if useCampaignWizard hook becomes obsolete after RHF migration
// import useCampaignWizard, {
//   WizardStep,
//   OverviewFormData,
//   ObjectivesFormData,
//   AudienceFormData,
//   AssetFormData,
// } from '@/hooks/use-campaign-wizard';

// Define types for KPI and Feature
// interface KPI {
//   id?: string;
//   name?: string;
//   value?: number;
//   target?: number;
// }

// interface Feature {
//   id?: string;
//   name?: string;
//   description?: string;
// }

// Define the shape of form data
// interface FormData {
//   name: string;
//   businessGoal: string;
//   startDate: string;
//   endDate: string;
//   timeZone: string;
//   currency: string;
//   totalBudget: string;
//   socialMediaBudget: string;
//   platform: string;
//   influencerHandle: string;
//   [key: string]: any;
// }

// Define the shape of your wizard data.
// interface WizardData {
//   overview: {
//     name: string;
//     businessGoal: string;
//     startDate: string;
//     endDate: string;
//     timeZone: string;
//     contacts: string;
//     primaryContact: {
//       firstName: string;
//       surname: string;
//       email: string;
//       position: string;
//     };
//     secondaryContact: {
//       firstName: string;
//       surname: string;
//       email: string;
//       position: string;
//     };
//     currency: string;
//     totalBudget: number;
//     socialMediaBudget: number;
//     platform: string;
//     influencerHandle: string;
//   };
//   objectives: {
//     mainMessage: string;
//     hashtags: string;
//     memorability: string;
//     keyBenefits: string;
//     expectedAchievements: string;
//     purchaseIntent: string;
//     primaryKPI: KPI;
//     secondaryKPIs: KPI[];
//     features: Feature[];
//   };
//   audience: {
//     segments: string[];
//     competitors: string[];
//   };
//   assets: {
//     files: { url: string; tags: string[] }[];
//   };
// }

// Define a more specific type for campaign data
// type CampaignData = Record<string, unknown>;

// --- Remove Placeholder Types --- 
/*
interface DraftCampaignData {
  // ... placeholder fields ...
}
*/

// Define Step Configuration centrally
export const WIZARD_STEPS = [
  { number: 1, label: 'Details' },
  { number: 2, label: 'Objectives' },
  { number: 3, label: 'Audience' },
  { number: 4, label: 'Assets' },
  { number: 5, label: 'Review' },
];
export type WizardStepConfigType = typeof WIZARD_STEPS[number];

// --- Type Definitions ---

/**
 * Defines the shape of the data and functions provided by the WizardContext.
 */
interface WizardContextType {
  /** The current state of the campaign wizard draft data. Null if no data loaded. */
  wizardState: DraftCampaignData | null;
  /** Function to update parts of the wizard state. */
  updateWizardState: (updates: Partial<DraftCampaignData>) => void;
  /** Boolean indicating if campaign data is currently being loaded or saved. */
  isLoading: boolean;
  /** Boolean indicating if editing an existing campaign (an ID is present). */
  isEditing: boolean;
  /** Function to manually trigger saving the current draft progress. Returns true on success, false on failure. */
  saveProgress: () => Promise<boolean>;
  /** Timestamp of the last successful save operation. Null if never saved. */
  lastSaved: Date | null;
  /** Boolean indicating if autosave is currently enabled. */
  autosaveEnabled: boolean;
  /** Function to enable or disable the autosave feature. */
  setAutosaveEnabled: (enabled: boolean) => void;
  /** Function to manually trigger a reload of the campaign data from the server. */
  reloadCampaignData: () => void;
  /** The ID of the current campaign being edited, or null if creating a new one. */
  campaignId: string | null;
  /** Configuration for the wizard steps */
  stepsConfig: WizardStepConfigType[];
}
// --- End Type Definitions ---

// Default initial state remains null
const defaultWizardState: DraftCampaignData | null = null;

const WizardContext = createContext<WizardContextType | undefined>(undefined);

/**
 * Provides the Campaign Wizard state and associated actions to child components.
 * Handles data loading, state updates, autosaving, and manual saving.
 */
export function WizardProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const campaignId = searchParams?.get('id');

  // State uses the imported DraftCampaignData type
  const [wizardState, setWizardState] = useState<DraftCampaignData | null>(defaultWizardState);
  const [isLoading, setIsLoading] = useState<boolean>(!!campaignId);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userEdited, setUserEdited] = useState(false);

  console.log('WizardProvider:', { campaignId, isLoading, hasLoaded, wizardState: !!wizardState });

  // --- Data Loading ---
  const loadCampaignData = useCallback(async (id: string) => {
    if (!id) {
      setWizardState(null);
      setIsLoading(false);
      setHasLoaded(true);
      return;
    }
    console.log(`Fetching campaign data for ID: ${id}`);
    setIsLoading(true);
    setWizardState(null);
    try {
      const response = await fetch(`/api/campaigns/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch campaign data: ${response.status} ${response.statusText}`);
      }
      const apiData = await response.json();
      const normalizedData = standardizeApiResponse(apiData);

      if (normalizedData?.success && normalizedData?.data) {
        // --- DEBUG LOGGING START ---
        console.log('WizardContext: Raw data received from API before parsing:');
        console.log(JSON.stringify(normalizedData.data, null, 2));
        // --- DEBUG LOGGING END ---
        console.log('WizardContext: Attempting to parse raw data against DraftCampaignDataSchema...');
        const parseResult = DraftCampaignDataSchema.safeParse(normalizedData.data);
        if (parseResult.success) {
          setWizardState(parseResult.data);
          console.log('WizardContext: Successfully parsed and set wizardState.');
        } else {
          console.error("WizardContext: Failed to parse loaded data against schema:", parseResult.error.errors);
          toast.error("Loaded campaign data has an unexpected format. Please contact support.");
          setWizardState(null); // Set to null if parsing fails
        }
      } else {
        console.error('WizardContext: Failed to load or normalize initial data', normalizedData?.error);
        toast.error(`Failed to load campaign data: ${normalizedData?.error || 'Unknown error'}`);
        setWizardState(null);
      }
    } catch (error: any) {
      console.error('WizardContext: Error fetching initial campaign data:', error);
      toast.error(`Error fetching campaign data: ${error.message}`);
      setWizardState(null);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, []);

  // Effect to load data when campaignId changes or on initial mount with ID
  useEffect(() => {
    if (campaignId && !hasLoaded) {
      loadCampaignData(campaignId);
    } else if (!campaignId) {
      setWizardState(defaultWizardState);
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [campaignId, hasLoaded, loadCampaignData]);

  // Function to trigger reload
  const reloadCampaignData = useCallback(() => {
    setHasLoaded(false);
    setIsLoading(!!campaignId);
    setWizardState(null);
  }, [campaignId]);

  // --- State Update ---
  const updateWizardState = useCallback((updates: Partial<DraftCampaignData>) => {
    setWizardState(prevState => {
      // Ensure types are handled correctly during merge
      const merged = prevState ? { ...prevState, ...updates } : (updates as DraftCampaignData);
      // Optionally, validate the merged state here if needed
      console.log('Updating wizard state:', { updates, newState: merged });
      setUserEdited(true); // Flag that this update is from user edit
      return merged;
    });
  }, []);

  // --- Saving Progress ---
  const saveProgress = useCallback(async (): Promise<boolean> => {
    if (!campaignId || !wizardState) {
      console.warn('Save prerequisites not met:', { campaignId: !!campaignId, wizardState: !!wizardState });
      return false;
    }
    // Optional: Validate full state before saving
    const validation = DraftCampaignDataSchema.safeParse(wizardState);
    if (!validation.success) {
      console.error("Save aborted: Current wizard state is invalid", validation.error.errors);
      toast.error("Cannot save, data is invalid. Please check fields.");
      return false;
    }
    console.log('Attempting to save progress for campaign:', campaignId);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Send the validated data
        body: JSON.stringify({ data: validation.data }),
      });
      if (!response.ok) {
        let errorBody = '';
        try {
          const errorData = await response.json();
          errorBody = errorData?.error || errorData?.message || JSON.stringify(errorData);
        } catch { }
        throw new Error(`Failed to save progress: ${response.status} ${response.statusText}. ${errorBody}`.trim());
      }
      const result = await response.json();
      if (result.success) {
        setLastSaved(new Date());
        toast.success('Progress saved');
        // Update state with potentially updated fields from backend (e.g., updatedAt)
        if (result.data) {
          const parsedUpdate = DraftCampaignDataSchema.safeParse(result.data);
          if (parsedUpdate.success) {
            setWizardState(prevState => (prevState ? { ...prevState, ...parsedUpdate.data } : parsedUpdate.data));
          } else {
            console.warn("Backend save response data failed validation", parsedUpdate.error.errors);
            // Still return true as API reported success, but log the issue
          }
        }
        return true;
      } else {
        console.error('Failed to save progress (API failure):', result);
        toast.error(`Failed to save progress: ${result.error || 'Unknown API error'}`);
        return false;
      }
    } catch (error: any) {
      console.error('Error saving progress:', error);
      toast.error(`Error saving progress: ${error.message}`);
      return false;
    }
  }, [campaignId, wizardState]);

  // Debounced save function for autosave
  const debouncedSaveProgress = useCallback(
    debounce(() => {
      if (autosaveEnabled && campaignId && wizardState && !isSaving) {
        console.log('Autosave triggered...', { userEdited });
        setIsSaving(true);
        saveProgress().finally(() => setIsSaving(false));
      } else {
        console.log('Autosave skipped', { autosaveEnabled, campaignId: !!campaignId, wizardState: !!wizardState, isSaving });
      }
    }, 2000),
    [saveProgress, autosaveEnabled, campaignId, wizardState, isSaving]
  );

  // Effect to trigger debounced save when wizardState changes
  useEffect(() => {
    console.log('Checking autosave conditions', { isLoading, campaignId: !!campaignId, wizardState: !!wizardState, autosaveEnabled, isSaving, userEdited });
    if (!isLoading && campaignId && wizardState && autosaveEnabled && !isSaving && userEdited) {
      console.log('Triggering autosave due to user edit');
      debouncedSaveProgress();
      setUserEdited(false); // Reset after triggering save
    }
    return () => {
      debouncedSaveProgress.cancel();
    };
  }, [wizardState, isLoading, campaignId, autosaveEnabled, debouncedSaveProgress, isSaving, userEdited]);

  // Determine if we are editing an existing campaign
  const isEditing = !!campaignId && wizardState !== null;

  // --- Context Value ---
  const contextValue = useMemo(() => {
    console.log('Updating context value', { wizardState: !!wizardState, isLoading, isEditing });
    return {
      wizardState,
      updateWizardState,
      isLoading,
      isEditing,
      saveProgress,
      lastSaved,
      autosaveEnabled,
      setAutosaveEnabled,
      reloadCampaignData,
      campaignId: campaignId ?? null,
      stepsConfig: WIZARD_STEPS,
    };
  }, [
    wizardState,
    updateWizardState,
    isLoading,
    isEditing,
    saveProgress,
    lastSaved,
    autosaveEnabled,
    setAutosaveEnabled,
    reloadCampaignData,
    campaignId,
  ]);

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
}

/**
 * Custom hook to consume the WizardContext.
 * Provides access to the campaign wizard state and actions.
 * Must be used within a WizardProvider.
 * @throws {Error} If used outside of a WizardProvider.
 * @returns {WizardContextType} The wizard context value.
 */
export const useWizard = (): WizardContextType => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

// Export context for potential direct use (though hook is preferred)
export default WizardContext;
