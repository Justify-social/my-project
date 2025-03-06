// src/context/WizardContext.tsx
"use client"; // Make sure this file is a client component if you're using Next.js 13 with the App Router.

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';
import { standardizeApiResponse } from "@/utils/api-response-formatter";

// Define the shape of your wizard data.
interface WizardData {
  overview: {
    name: string;
    businessGoal: string;
    startDate: string;
    endDate: string;
    timeZone: string;
    contacts: string;
    primaryContact: {
      firstName: string;
      surname: string;
      email: string;
      position: string;
    };
    secondaryContact: {
      firstName: string;
      surname: string;
      email: string;
      position: string;
    };
    currency: string;
    totalBudget: number;
    socialMediaBudget: number;
    platform: string;
    influencerHandle: string;
  };
  objectives: {
    mainMessage: string;
    hashtags: string;
    memorability: string;
    keyBenefits: string;
    expectedAchievements: string;
    purchaseIntent: string;
    primaryKPI: KPI;
    secondaryKPIs: KPI[];
    features: Feature[];
  };
  audience: {
    segments: string[];
    competitors: string[];
  };
  assets: {
    files: { url: string; tags: string[] }[];
  };
}

// Define a more specific type for campaign data
type CampaignData = Record<string, unknown>;

interface WizardContextType {
  data: WizardData;
  updateData: (
    section: keyof WizardData,
    newData: Partial<WizardData[keyof WizardData]>
  ) => void;
  isEditing: boolean;
  campaignData: CampaignData | null;
  loading: boolean;
  hasLoadedData: boolean;
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  resetForm: () => void;
  saveProgress: (data: Record<string, unknown>) => Promise<boolean>;
  lastSaved: Date | null;
  autosaveEnabled: boolean;
  setAutosaveEnabled: (enabled: boolean) => void;
  reloadCampaignData: () => void;
  updateCampaignData: (updates: Record<string, unknown>) => void;
  campaignId: string | null;
}

// Default values for the wizard data.
const defaultWizardData: WizardData = {
  overview: {
    name: "",
    businessGoal: "",
    startDate: "",
    endDate: "",
    timeZone: "UTC",
    contacts: "",
    primaryContact: {
      firstName: "",
      surname: "",
      email: "",
      position: "",
    },
    secondaryContact: {
      firstName: "",
      surname: "",
      email: "",
      position: "",
    },
    currency: "£",
    totalBudget: 5000,
    socialMediaBudget: 1000,
    platform: "",
    influencerHandle: "",
  },
  objectives: {
    mainMessage: "",
    hashtags: "",
    memorability: "",
    keyBenefits: "",
    expectedAchievements: "",
    purchaseIntent: "",
    primaryKPI: {
      // Assuming KPI is an object with properties
    },
    secondaryKPIs: [],
    features: [],
  },
  audience: { segments: [], competitors: [] },
  assets: { files: [] },
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const [loading, setLoading] = useState(!!campaignId);
  const [campaignData, setCampaignData] = useState<any | null>(null);
  const [data, setData] = useState<WizardData>(defaultWizardData);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    businessGoal: '',
    startDate: '',
    endDate: '',
    timeZone: '',
    currency: '',
    totalBudget: '',
    socialMediaBudget: '',
    platform: '',
    influencerHandle: '',
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(true);
  // Add hasLoadedData state to prevent redundant loading
  const [hasLoadedData, setHasLoadedData] = useState<boolean>(false);

  // Add debug log
  console.log('WizardProvider:', { campaignId, loading, campaignData, hasLoadedData });

  // Memoized function to reload campaign data when needed
  const reloadCampaignData = useCallback(() => {
    setHasLoadedData(false);
  }, []);

  // Memoized function to update campaign data directly
  const updateCampaignData = useCallback((updates: Record<string, unknown>) => {
    setCampaignData(current => ({
      ...current,
      ...updates
    }));
    // Update lastSaved
    setLastSaved(new Date());
  }, []);

  // Load campaign data from API or localStorage
  useEffect(() => {
    async function loadCampaignData(campaignId: string) {
      if (!campaignId) {
        console.warn("Cannot load campaign data without campaign ID");
        return null;
      }
      
      setLoading(true);
      
      try {
        console.log(`Fetching campaign data for ID: ${campaignId}`);
        const response = await fetch(`/api/campaigns/${campaignId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch campaign data: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Fetched campaign data:", result);
        
        if (result.success && result.data) {
          // Extract the campaign data from the response
          const extractedData = result.data;
          console.log("Extracted campaign data:", extractedData);
          
          // Transform and normalize the data using our standardizeApiResponse utility
          const normalizedData = standardizeApiResponse(extractedData);
          
          console.log("Standardized campaign data:", normalizedData);
          
          // Debugging: Log key fields to verify they're being properly processed
          console.log("Dates after normalization:", {
            startDate: normalizedData.startDate,
            endDate: normalizedData.endDate
          });
          
          console.log("Influencers after normalization:", normalizedData.influencers);
          
          // Update state with normalized data
          setCampaignData(normalizedData);
          setHasLoadedData(true);
          
          // Show success toast when data is loaded
          toast.success("Campaign data loaded");
          
          // Save to localStorage for offline access
          try {
            localStorage.setItem('campaignData', JSON.stringify(normalizedData));
            localStorage.setItem('lastLoadedCampaignId', campaignId);
            setLastSaved(new Date());
          } catch (e) {
            console.warn('Failed to save campaign data to localStorage:', e);
          }
          
          return normalizedData;
        } else {
          console.error("Failed to fetch campaign data:", result);
          toast.error("Failed to load campaign data");
          return null;
        }
      } catch (error) {
        console.error("Error fetching campaign data:", error);
        toast.error("Error loading campaign data");
        return null;
      } finally {
        setLoading(false);
      }
    }

    // Only load data if we have a campaignId and haven't loaded data yet
    if (campaignId && !hasLoadedData) {
      loadCampaignData(campaignId);
    } else if (!campaignId) {
      // Reset loading state if there's no campaign ID
      setLoading(false);
    }
  }, [campaignId, hasLoadedData]);

  // Save progress function
  const saveProgress = useCallback(async (data: Record<string, unknown>) => {
    if (!campaignId) {
      console.warn('Cannot save progress: No campaign ID available');
      return false;
    }
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
      
      // Update last saved timestamp
      setLastSaved(new Date());
      
      // Update localStorage
      localStorage.setItem('campaignData', JSON.stringify({
        ...campaignData,
        ...data,
        lastSaved: new Date().toISOString()
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  }, [campaignId, campaignData]);

  // Debounced version of saveProgress for autosave
  const debouncedSaveProgress = useCallback(
    debounce((formData: any) => {
      if (autosaveEnabled) {
        saveProgress(formData)
          .then(success => {
            if (success) {
              console.log('Autosaved campaign data:', formData);
            }
          })
          .catch(error => {
            console.error('Autosave error:', error);
          });
      }
    }, 2000), // 2 second debounce
    [campaignId, autosaveEnabled, saveProgress]
  );

  const updateData = (
    section: keyof WizardData,
    newData: Partial<WizardData[keyof WizardData]>
  ) => {
    setData((prev) => {
      const updatedData = {
        ...prev,
        [section]: {
          ...prev[section],
          ...newData,
        },
      };
      
      // Trigger autosave
      if (autosaveEnabled && campaignId) {
        debouncedSaveProgress({
          [section]: updatedData[section]
        });
      }
      
      return updatedData;
    });
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => {
      const updatedFormData = { ...prev, ...updates };
      
      // Trigger autosave
      if (autosaveEnabled && campaignId && Object.keys(updates).length > 0) {
        debouncedSaveProgress(updatedFormData);
      }
      
      return updatedFormData;
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      businessGoal: '',
      startDate: '',
      endDate: '',
      timeZone: '',
      currency: '',
      totalBudget: '',
      socialMediaBudget: '',
      platform: '',
      influencerHandle: '',
    });
  };

  // Include your existing context values along with new ones
  const value = {
    data,
    updateData,
    isEditing: !!campaignId,
    campaignData,
    loading,
    hasLoadedData,
    formData,
    updateFormData,
    resetForm,
    saveProgress,
    lastSaved,
    autosaveEnabled,
    setAutosaveEnabled,
    reloadCampaignData,
    updateCampaignData,
    campaignId,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};
