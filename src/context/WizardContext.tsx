// src/context/WizardContext.tsx
"use client"; // Make sure this file is a client component if you're using Next.js 13 with the App Router.

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';

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

interface WizardContextType {
  data: WizardData;
  updateData: (
    section: keyof WizardData,
    newData: Partial<WizardData[keyof WizardData]>
  ) => void;
  isEditing: boolean;
  campaignData: any | null;
  loading: boolean;
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  resetForm: () => void;
  saveProgress: (data: any) => Promise<boolean>;
  lastSaved: Date | null;
  autosaveEnabled: boolean;
  setAutosaveEnabled: (enabled: boolean) => void;
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

  // Add debug log
  console.log('WizardProvider:', { campaignId, loading, campaignData });

  // Load campaign data from API or localStorage
  useEffect(() => {
    async function loadCampaignData() {
      if (!campaignId) {
        // Try to load from localStorage if no ID in URL
        const savedData = localStorage.getItem('campaignData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setCampaignData(parsedData);
            setLastSaved(new Date(parsedData.lastSaved || Date.now()));
            console.log('Loaded campaign data from localStorage:', parsedData);
          } catch (error) {
            console.error('Error parsing saved campaign data:', error);
          }
        }
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching campaign data for ID:', campaignId);
        const response = await fetch(`/api/campaigns/${campaignId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch campaign');
        }
        
        const data = await response.json();
        console.log('Fetched campaign data:', data);
        
        // If data is wrapped in a response object, extract it
        const campaignData = data.campaign || data;
        setCampaignData(campaignData);
        
        // Save to localStorage for offline access
        localStorage.setItem('campaignData', JSON.stringify({
          ...campaignData,
          lastSaved: new Date().toISOString()
        }));
        setLastSaved(new Date());
        
      } catch (error) {
        console.error('Error loading campaign:', error);
        toast.error('Failed to load campaign data');
        
        // Try loading from localStorage as a fallback
        const savedData = localStorage.getItem('campaignData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            if (parsedData.id === campaignId) {
              setCampaignData(parsedData);
              setLastSaved(new Date(parsedData.lastSaved || Date.now()));
              toast.success('Loaded cached campaign data');
            }
          } catch (e) {
            console.error('Error parsing saved campaign data:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    if (campaignId) {
      loadCampaignData();
    }
  }, [campaignId]);

  // Save progress function
  const saveProgress = async (formData: any): Promise<boolean> => {
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
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
      
      // Update last saved timestamp
      setLastSaved(new Date());
      
      // Update localStorage
      localStorage.setItem('campaignData', JSON.stringify({
        ...campaignData,
        ...formData,
        lastSaved: new Date().toISOString()
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  };

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
    [campaignId, autosaveEnabled]
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
    formData,
    updateFormData,
    resetForm,
    saveProgress,
    lastSaved,
    autosaveEnabled,
    setAutosaveEnabled,
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
