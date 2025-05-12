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
  // PositionEnum, // This Zod enum wrapper is not needed here for default value
} from '@/components/features/campaigns/types';
import {
  Position as PrismaPosition,
  Status as PrismaStatus,
  Currency as PrismaCurrency,
} from '@prisma/client'; // Import Prisma enums
// TODO: Replace WizardCampaignFormData with a proper type derived from schema.prisma CampaignWizard model in types.ts
// import { CampaignFormData as WizardCampaignFormData } from '@/types/influencer';
import { useSearchParams, useRouter } from 'next/navigation';
import { standardizeApiResponse } from '@/utils/api-response-formatter';
import { logger } from '@/utils/logger';
import { toast } from 'react-hot-toast'; // Import toast
import { Icon } from '@/components/ui/icon/icon'; // Import Icon for toast
import { useAuth } from '@clerk/nextjs'; // Import useAuth
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
  primaryContact: { firstName: '', surname: '', email: '', position: PrismaPosition.Director },
  secondaryContact: null, // Default to null
  additionalContacts: [],
  budget: { currency: PrismaCurrency.USD, total: 0, socialMedia: 0 },
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
  status: PrismaStatus.DRAFT,
  createdAt: null,
  updatedAt: null,
  userId: null,
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

// Define showErrorToast locally
const showErrorToast = (message: string, iconId?: string) => {
  const finalIconId = iconId || 'faTriangleExclamationLight';
  const errorIcon = <Icon iconId={finalIconId} className="h-5 w-5 text-destructive" />;
  toast.error(message, {
    duration: 5000,
    className: 'toast-error-custom',
    icon: errorIcon,
  });
};

/**
 * Provides the Campaign Wizard state and associated actions to child components.
 * Handles data loading, state updates, autosaving, and manual saving.
 */
export function WizardProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const campaignIdFromUrl = searchParams?.get('id'); // Renamed for clarity
  const router = useRouter();
  const { orgId: activeOrgId, isLoaded: isAuthLoaded } = useAuth(); // Get activeOrgId and its loading state

  const [wizardState, setWizardState] = useState<DraftCampaignData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // True initially until data is loaded or new state set
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(true);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState<boolean>(false); // To track if initial load effect has run

  // logger.debug('WizardProvider Init:', { campaignId, isLoading, hasLoaded, wizardState: !!wizardState });

  // --- Data Loading ---
  const loadCampaignData = useCallback(async (id: string) => {
    if (!id) {
      setWizardState(null);
      setIsLoading(false);
      setHasLoadedInitialData(true);
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
        const rawData = normalizedData.data as any; // Cast to any to check for status property

        // Check if the campaign is already submitted by looking at the raw status
        if (rawData && typeof rawData === 'object' && rawData.status === 'SUBMITTED') {
          logger.info(
            'WizardContext: Campaign is SUBMITTED. Storing raw data for context, bypassing strict draft schema parsing for this view.'
          );
          setWizardState(rawData as DraftCampaignData); // Cast, acknowledge potential partial mismatch
        } else {
          // Proceed with Zod parsing for DRAFT or other non-SUBMITTED statuses
          logger.debug(
            'WizardContext: Attempting to parse (DRAFT or other status) data against DraftCampaignDataSchema...'
          );
          const parseResult = await DraftCampaignDataSchema.safeParseAsync(rawData); // Parse rawData
          if (parseResult.success) {
            setWizardState(parseResult.data);
            logger.info(
              'WizardContext: Successfully parsed and set wizardState for non-submitted campaign.'
            );
          } else {
            logger.error(
              'WizardContext: Failed to parse loaded data against schema (non-submitted campaign):',
              parseResult.error.errors
            );
            showErrorToast('Loaded campaign data has an unexpected format.');
            setWizardState(null);
          }
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
      setHasLoadedInitialData(true);
    }
  }, []);

  // Effect to load data when campaignIdFromUrl changes or on initial mount
  useEffect(() => {
    if (campaignIdFromUrl) {
      if (!hasLoadedInitialData) {
        logger.info(`[WizardContext] Initial load for campaign ID: ${campaignIdFromUrl}`);
        loadCampaignData(campaignIdFromUrl);
        setHasLoadedInitialData(true);
      }
    } else if (!hasLoadedInitialData) {
      logger.info('[WizardContext] Initializing default state for new campaign (no ID in URL).');
      setWizardState(defaultWizardState);
      setIsLoading(false);
      setHasLoadedInitialData(true);
    }
  }, [campaignIdFromUrl, hasLoadedInitialData, loadCampaignData]); // loadCampaignData added as dependency

  // Function to trigger reload
  const reloadCampaignData = useCallback(() => {
    setHasLoadedInitialData(false);
    setIsLoading(!!campaignIdFromUrl);
    setWizardState(null);
  }, [campaignIdFromUrl]);

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
      setIsLoading(true); // Indicate saving is in progress
      let currentCampaignIdToUse = wizardState?.id || campaignIdFromUrl; // Use ID from state first, then URL
      const currentStep = dataToSave.currentStep; // Assume step is passed in dataToSave or is in wizardState

      if (!currentCampaignIdToUse) {
        // This means it's a NEW campaign draft
        logger.info('No campaign ID found, attempting to create new draft...');
        if (!isAuthLoaded) {
          // Wait for auth to be loaded
          logger.warn('Cannot create campaign: Auth not loaded yet.');
          showErrorToast(
            'User and organization status is still loading. Please try again shortly.'
          );
          setIsLoading(false);
          return null;
        }
        if (!activeOrgId) {
          logger.error('Cannot create campaign: No active organization ID found.');
          showErrorToast(
            'An active organization is required to create a campaign. Please select or create one in settings.'
          );
          setIsLoading(false);
          return null;
        }

        let newCampaignId: string | null = null;
        try {
          const creationPayload = {
            name: dataToSave.name || defaultWizardState.name || 'Untitled Campaign',
            businessGoal: dataToSave.businessGoal ?? defaultWizardState.businessGoal,
            brand: dataToSave.brand || defaultWizardState.brand || '',
            website: dataToSave.website ?? defaultWizardState.website,
            startDate: dataToSave.startDate || defaultWizardState.startDate,
            endDate: dataToSave.endDate || defaultWizardState.endDate,
            timeZone: dataToSave.timeZone ?? defaultWizardState.timeZone,
            primaryContact: dataToSave.primaryContact ?? defaultWizardState.primaryContact,
            secondaryContact: dataToSave.secondaryContact ?? defaultWizardState.secondaryContact,
            additionalContacts:
              dataToSave.additionalContacts ?? defaultWizardState.additionalContacts,
            budget: dataToSave.budget ?? defaultWizardState.budget,
            Influencer: dataToSave.Influencer ?? defaultWizardState.Influencer,
            step1Complete: true, // Assume step 1 is complete if creating
            currentStep: 1, // Created at step 1
            orgId: activeOrgId, // *** Add orgId to the payload ***
          };

          logger.debug(
            '[WizardContext saveProgress] Sending creation payload:',
            JSON.stringify(creationPayload, null, 2)
          );
          const response = await fetch('/api/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creationPayload),
          });
          const result = await response.json();
          if (!response.ok || !result.success || !result.data?.id) {
            if (result.errorCode === 'NAME_ALREADY_EXISTS') {
              const specificMessage =
                result.error || 'A campaign with this name already exists. Please update the name.';
              throw new Error(specificMessage);
            }
            throw new Error(
              `Failed to create campaign draft: ${result.error || response.statusText}`
            );
          }
          newCampaignId = result.data.id;
          logger.info(`New campaign draft created successfully with ID: ${newCampaignId}`);
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            router.replace(`${currentPath}?id=${newCampaignId}`); // Update URL
          }
          currentCampaignIdToUse = newCampaignId; // Use new ID for subsequent logic in this save call

          setWizardState(prevState => ({
            ...(prevState ?? defaultWizardState),
            ...(result.data as Partial<DraftCampaignData>),
            id: newCampaignId ?? undefined,
          }));
          setLastSaved(new Date());
          // Do not return here yet if we need to PATCH the current step's data to this new campaign ID
        } catch (error: unknown) {
          logger.error('Error creating new campaign draft:', error);
          const message = error instanceof Error ? error.message : 'Unknown error';
          showErrorToast(`Error creating campaign: ${message}`);
          setIsLoading(false);
          return null;
        }
      }

      if (!currentCampaignIdToUse || typeof currentStep !== 'number') {
        logger.warn('Save prerequisites not met (no campaignId or invalid step):', {
          campaignId: currentCampaignIdToUse,
          currentStep,
        });
        setIsLoading(false);
        return null;
      }

      const dataForApi = { ...dataToSave };
      // Remove id from dataForApi if it's for a PATCH to avoid Prisma issues if id is not a direct field for update
      if ('id' in dataForApi && dataForApi.id === currentCampaignIdToUse) {
        delete (dataForApi as any).id;
      }

      logger.info(
        `Attempting to save progress for campaign: ${currentCampaignIdToUse}, step: ${currentStep}`
      );
      try {
        const apiUrl = `/api/campaigns/${currentCampaignIdToUse}/wizard/${currentStep}`;
        logger.debug(`Calling API endpoint: PATCH ${apiUrl}`);
        const response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataForApi),
        });
        if (!response.ok) {
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
          if (result.data && typeof result.data === 'object') {
            const returnedData = result.data as Partial<DraftCampaignData>;
            setWizardState(prevState => ({
              ...(prevState ?? defaultWizardState),
              ...returnedData,
              id: currentCampaignIdToUse ?? undefined, // Ensure ID from context/URL is used
            }));
            logger.info('Updated wizard state with data from successful campaign update.');
          }
          return currentCampaignIdToUse; // Return the ID used for the PATCH
        } else {
          logger.error('Failed to save progress (API failure):', result);
          showErrorToast(`Failed to save progress: ${result.error || 'Unknown API error'}`);
          return null;
        }
      } catch (error: unknown) {
        logger.error('Error saving progress:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        showErrorToast(`Error saving progress: ${message}`);
        return null;
      } finally {
        setIsLoading(false); // Set loading false at the end of all save operations
      }
    },
    [campaignIdFromUrl, router, wizardState, activeOrgId, isAuthLoaded, loadCampaignData] // Added dependencies
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
  const isEditing = !!campaignIdFromUrl && wizardState !== null;

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
      campaignId: campaignIdFromUrl ?? null,
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
    campaignIdFromUrl,
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
