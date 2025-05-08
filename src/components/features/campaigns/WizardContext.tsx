'use client'; // Make sure this file is a client component if you're using Next.js 13 with the App Router.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
// Import the ACTUAL DraftCampaignData type from types.ts
import {
  DraftCampaignData,
  DraftCampaignDataSchema,
  PositionEnum,
} from '@/components/features/campaigns/types';
// TODO: Replace WizardCampaignFormData with a proper type derived from schema.prisma CampaignWizard model in types.ts
// import { CampaignFormData as WizardCampaignFormData } from '@/types/influencer';
import { useSearchParams, useRouter } from 'next/navigation';
import { standardizeApiResponse } from '@/utils/api-response-formatter';
import { logger } from '@/utils/logger';
import { showErrorToast } from '@/utils/toastUtils'; // Keep showErrorToast, remove unused showSuccessToast
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
export type WizardStepConfigType = (typeof WIZARD_STEPS)[number];

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
  /** Function to manually trigger saving the current draft progress. Accepts data to save. Returns campaign ID on success, null on failure. */
  saveProgress: (dataToSave: Partial<DraftCampaignData>) => Promise<string | null>;
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

// Default initial state - PROVIDE MINIMAL STRUCTURE
const defaultWizardState: DraftCampaignData = {
  // Ensure all potentially accessed top-level fields have defaults
  id: undefined, // Use undefined for optional string instead of null
  name: '',
  businessGoal: null,
  brand: '',
  website: null,
  startDate: null,
  endDate: null,
  timeZone: 'UTC', // Default timezone
  primaryContact: { firstName: '', surname: '', email: '', position: PositionEnum.Values.Director },
  secondaryContact: null, // Default to null
  additionalContacts: [],
  budget: { currency: 'USD', total: 0, socialMedia: 0 },
  Influencer: [],
  primaryKPI: null,
  secondaryKPIs: [],
  messaging: { mainMessage: '', hashtags: [], keyBenefits: [] },
  expectedOutcomes: { memorability: '', purchaseIntent: '', brandPerception: '' },
  features: [],
  demographics: {
    age18_24: 0,
    age25_34: 0,
    age35_44: 0,
    age45_54: 0,
    age55_64: 0,
    age65plus: 0,
    genders: [],
    languages: [],
  },
  locations: [],
  targeting: { interests: [], keywords: [] },
  competitors: [],
  assets: [],
  guidelines: null,
  requirements: [],
  notes: null,
  step1Complete: false,
  step2Complete: false,
  step3Complete: false,
  step4Complete: false,
  currentStep: 1,
  isComplete: false,
  isDraft: true,
  status: 'DRAFT',
  createdAt: null,
  updatedAt: null,
  userId: null,
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

/**
 * Provides the Campaign Wizard state and associated actions to child components.
 * Handles data loading, state updates, autosaving, and manual saving.
 */
export function WizardProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const campaignId = searchParams?.get('id');
  const router = useRouter();

  const [wizardState, setWizardState] = useState<DraftCampaignData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // logger.debug('WizardProvider Init:', { campaignId, isLoading, hasLoaded, wizardState: !!wizardState });

  // --- Data Loading ---
  const loadCampaignData = useCallback(async (id: string) => {
    if (!id) {
      setWizardState(null);
      setIsLoading(false);
      setHasLoaded(true);
      return;
    }
    logger.info(`Fetching campaign data for ID: ${id}`);
    setIsLoading(true);
    setWizardState(null);
    try {
      const response = await fetch(`/api/campaigns/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch campaign data: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      const normalizedData = standardizeApiResponse(result);

      if (normalizedData?.success && normalizedData?.data) {
        logger.debug('WizardContext: Raw data received:', normalizedData.data);
        logger.debug(
          'WizardContext: Attempting to parse raw data against DraftCampaignDataSchema...'
        );
        const parseResult = DraftCampaignDataSchema.safeParse(normalizedData.data);
        if (parseResult.success) {
          setWizardState(parseResult.data);
          logger.info('WizardContext: Successfully parsed and set wizardState.');
        } else {
          logger.error(
            'WizardContext: Failed to parse loaded data against schema:',
            parseResult.error.errors
          );
          showErrorToast('Loaded campaign data has an unexpected format.');
          setWizardState(null);
        }
      } else {
        logger.error(
          'WizardContext: Failed to load or normalize initial data',
          normalizedData?.error
        );
        showErrorToast(`Failed to load campaign data: ${normalizedData?.error || 'Unknown error'}`);
        setWizardState(null);
      }
    } catch (error: unknown) {
      logger.error('WizardContext: Error fetching initial campaign data:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      showErrorToast(`Error fetching campaign data: ${message}`);
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
    } else if (!campaignId && !hasLoaded) {
      // Condition for NEW campaign
      logger.info('[WizardContext] Initializing default state for new campaign.');
      setWizardState(defaultWizardState); // Set the default object state
      setIsLoading(false); // Set loading false AFTER setting default state
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
      const merged = prevState ? { ...prevState, ...updates } : (updates as DraftCampaignData);
      logger.debug('Updating wizard state (non-save):', { updates, newState: merged });
      // Note: userEdited flag logic removed previously
      return merged;
    });
  }, []);

  // --- Saving Progress ---
  const saveProgress = useCallback(
    async (dataToSave: Partial<DraftCampaignData>): Promise<string | null> => {
      const currentCampaignId = campaignId; // Use state campaignId initially
      const currentStep = dataToSave.currentStep;

      // --- Handle Campaign Creation if ID is missing ---
      if (!currentCampaignId) {
        logger.info('No campaign ID found, attempting to create new draft...');
        let newCampaignId: string | null = null; // Declare newCampaignId
        try {
          // Ensure essential fields for creation are present (adjust as needed for API)
          const creationPayload = {
            name: dataToSave.name || 'Untitled Campaign',
            businessGoal: dataToSave.businessGoal || '',
            brand: dataToSave.brand || '',
            website: dataToSave.website,
            startDate: dataToSave.startDate || new Date(),
            endDate: dataToSave.endDate || new Date(),
            timeZone: dataToSave.timeZone,
            primaryContact: dataToSave.primaryContact,
            secondaryContact: dataToSave.secondaryContact,
            additionalContacts: dataToSave.additionalContacts,
            budget: dataToSave.budget,
            Influencer: dataToSave.Influencer, // Pass influencers too
            // Set initial step states
            step1Complete: true,
            currentStep: 1, // Created at step 1
          };

          logger.debug(
            '[WizardContext saveProgress] Sending creation payload:',
            JSON.stringify(creationPayload, null, 2)
          );

          logger.debug('Calling POST /api/campaigns with payload:', creationPayload);
          const response = await fetch('/api/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creationPayload),
          });

          const result = await response.json();

          if (!response.ok || !result.success || !result.data?.id) {
            throw new Error(
              `Failed to create campaign draft: ${result.error || response.statusText}`
            );
          }

          newCampaignId = result.data.id; // Assign to declared variable
          logger.info(`New campaign draft created successfully with ID: ${newCampaignId}`);

          // Update URL without full navigation
          const currentPath = window.location.pathname;
          router.replace(`${currentPath}?id=${newCampaignId}`);

          // Update state with the full data returned from creation
          const parsedData = DraftCampaignDataSchema.safeParse(result.data);
          if (parsedData.success) {
            setWizardState(parsedData.data);
          } else {
            // Log the detailed Zod parsing errors
            logger.error(
              'Failed to parse response from campaign creation (Zod Errors):',
              JSON.stringify(parsedData.error.errors, null, 2) // Log the detailed errors array
            );
            // Fallback: update state minimally only if necessary (ensure ID is set)
            setWizardState(prevState =>
              prevState?.id === newCampaignId
                ? prevState
                : ({ ...creationPayload, id: newCampaignId } as DraftCampaignData)
            );
          }

          setLastSaved(new Date());
          return newCampaignId; // Return new ID on successful creation
        } catch (error: unknown) {
          logger.error('Error creating new campaign draft:', error);
          const message = error instanceof Error ? error.message : 'Unknown error';
          showErrorToast(`Error creating campaign: ${message}`);
          return null; // ADD EXPLICIT RETURN NULL HERE
        }
      }
      // --- End Campaign Creation Handling ---

      // Proceed with PATCH if campaignId existed or was just created
      if (!currentCampaignId || typeof currentStep !== 'number') {
        // Re-check needed if creation failed? (Shouldn't happen)
        logger.warn('Save prerequisites still not met after potential creation:', {
          campaignId: !!currentCampaignId,
          currentStep,
        });
        return null; // Return null on prerequisite failure
      }

      // Use the dataToSave argument directly for PATCH
      const dataForApi = dataToSave;

      logger.info(
        `Attempting to save progress for campaign: ${currentCampaignId}, step: ${currentStep}`
      );
      try {
        const apiUrl = `/api/campaigns/${currentCampaignId}/wizard/${currentStep}`;
        logger.debug(`Calling API endpoint: PATCH ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          // Send the data received as argument
          body: JSON.stringify(dataForApi), // Use dataForApi
        });

        if (!response.ok) {
          // ... error handling ...
          let errorBody = '';
          try {
            const errorData = await response.json();
            errorBody = errorData?.error || errorData?.message || JSON.stringify(errorData);
          } catch {}
          throw new Error(
            `Failed to save progress: ${response.status} ${response.statusText}. ${errorBody}`.trim()
          );
        }
        const result = await response.json();
        if (result.success) {
          setLastSaved(new Date());
          logger.info('Progress saved successfully');
          if (result.data) {
            logger.debug('Data received from PATCH API:', JSON.stringify(result.data, null, 2));
            const parsedUpdate = DraftCampaignDataSchema.safeParse(result.data);
            if (parsedUpdate.success) {
              // Update context state with the final data from backend
              setWizardState(prevState =>
                prevState ? { ...prevState, ...parsedUpdate.data } : parsedUpdate.data
              );
            } else {
              logger.warn(
                'Backend save response data failed validation',
                parsedUpdate.error.errors
              );
            }
          }
          return currentCampaignId; // Return the currentCampaignId on successful PATCH
        } else {
          // ... error handling ...
          logger.error('Failed to save progress (API failure):', result);
          showErrorToast(`Failed to save progress: ${result.error || 'Unknown API error'}`);
          return null; // Return null on PATCH API failure
        }
      } catch (error: unknown) {
        // ... error handling ...
        logger.error('Error saving progress:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        showErrorToast(`Error saving progress: ${message}`);
        return null; // Return null on fetch/other error
      }
      // Remove wizardState dependency, add campaignId
    },
    [campaignId, router]
  );

  // Debounced save function is no longer needed for autosave
  /*
  const debouncedSaveProgress = useCallback(
    debounce(() => { ... }, 2000),
    [saveProgress, autosaveEnabled, campaignId, wizardState, isSaving] 
  );
  */

  // Autosave trigger effect is commented out / removed
  /*
  useEffect(() => { ... }, [ ... ]);
  */

  // Determine if we are editing an existing campaign
  const isEditing = !!campaignId && wizardState !== null;

  // --- Context Value ---
  const contextValue = useMemo(() => {
    logger.debug('Updating context value', { wizardState: !!wizardState, isLoading, isEditing });
    return {
      wizardState,
      updateWizardState,
      isLoading,
      isEditing,
      saveProgress, // Pass the modified saveProgress
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
    saveProgress, // Add modified saveProgress here
    lastSaved,
    autosaveEnabled,
    setAutosaveEnabled,
    reloadCampaignData,
    campaignId,
  ]);

  return <WizardContext.Provider value={contextValue}>{children}</WizardContext.Provider>;
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
