// src/context/WizardContext.tsx
"use client"; // Make sure this file is a client component if you're using Next.js 13 with the App Router.

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

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

  // Add debug log
  console.log('WizardProvider:', { campaignId, loading, campaignData });

  useEffect(() => {
    async function loadCampaignData() {
      if (!campaignId) {
        localStorage.removeItem('campaignData');
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
        
        localStorage.setItem('campaignData', JSON.stringify(data));
        
      } catch (error) {
        console.error('Error loading campaign:', error);
        toast.error('Failed to load campaign data');
      } finally {
        setLoading(false);
      }
    }

    if (campaignId) {
      loadCampaignData();
    }
  }, [campaignId]);

  const updateData = (
    section: keyof WizardData,
    newData: Partial<WizardData[keyof WizardData]>
  ) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...newData,
      },
    }));
  };

  // Include your existing context values along with new ones
  const value = {
    data,
    updateData,
    isEditing: !!campaignId,
    campaignData,
    loading,
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
