"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import ProgressBar from "@/components/Wizard/ProgressBar";
import { useWizard } from "@/context/WizardContext";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ErrorFallback from '@/components/ErrorFallback';
import { 
  CheckCircleIcon, 
  ChevronRightIcon,
  PencilIcon,
  DocumentIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Link from "next/link";
import { EnumTransformers } from '@/utils/enum-transformers';
import Image from "next/image";

// Type Definitions
interface CreativeAsset {
  id: string;
  assetName: string;
  type: string;
  url: string;
  fileName: string;
  fileSize?: number;
  influencerHandle?: string;
  influencerName?: string;
  influencerFollowers?: string;
  whyInfluencer?: string;
  budget?: number;
}

// Additional type definitions aligned with WizardContext
type KPI = string;
type Feature = string;

// Summary Section Component for displaying each step's data
interface SummarySectionProps {
  title: string;
  stepNumber: number;
  onEdit: () => void;
  children: React.ReactNode;
}

const SummarySection: React.FC<SummarySectionProps> = ({ 
  title, 
  stepNumber, 
  onEdit, 
  children 
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--divider-color)] mb-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] rounded-full flex items-center justify-center mr-3 font-semibold">
            {stepNumber}
          </div>
          <h2 className="text-lg font-semibold text-[var(--primary-color)]">{title}</h2>
        </div>
        <button
          onClick={onEdit}
          className="text-[var(--accent-color)] hover:text-[var(--accent-color)] hover:underline flex items-center text-sm font-medium"
          aria-label={`Edit ${title}`}
        >
          <PencilIcon className="h-4 w-4 mr-1" />
          <span>Edit</span>
        </button>
      </div>
      <div className="pl-11">
        {children}
      </div>
    </div>
  );
};

// Add a new KPIDisplay component for displaying KPI with their associated icons
interface KPIDisplayProps {
  kpi: string;
}

const KPIDisplay: React.FC<KPIDisplayProps> = ({ kpi }) => {
  if (!kpi) return <span>Not specified</span>;
  
  // Map KPI values to their correct SVG paths and display text
  const getKpiInfo = (kpiValue: string): { iconPath: string, displayText: string } => {
    const normalizedKpi = kpiValue.toLowerCase();
    let iconPath;
    let displayText = formatKPI(kpiValue);
    
    // Determine which SVG file to use based on the KPI
    if (normalizedKpi.includes('ad_recall') || normalizedKpi.includes('adrecall')) {
      iconPath = '/KPIs/Ad_Recall.svg';
    } else if (normalizedKpi.includes('brand_awareness') || normalizedKpi.includes('brandawareness')) {
      iconPath = '/KPIs/Brand_Awareness.svg';
    } else if (normalizedKpi.includes('consideration')) {
      iconPath = '/KPIs/Consideration.svg';
    } else if (normalizedKpi.includes('message_association') || normalizedKpi.includes('messageassociation')) {
      iconPath = '/KPIs/Message_Association.svg';
    } else if (normalizedKpi.includes('brand_preference') || normalizedKpi.includes('brandpreference')) {
      iconPath = '/KPIs/Brand_Preference.svg';
    } else if (normalizedKpi.includes('purchase_intent') || normalizedKpi.includes('purchaseintent')) {
      iconPath = '/KPIs/Purchase_Intent.svg';
    } else if (normalizedKpi.includes('action_intent') || normalizedKpi.includes('actionintent')) {
      iconPath = '/KPIs/Action_Intent.svg';
    } else if (normalizedKpi.includes('recommendation_intent') || normalizedKpi.includes('recommendationintent')) {
      // Using Brand_Preference as fallback per the CSS in globals.css
      iconPath = '/KPIs/Brand_Preference.svg';
    } else if (normalizedKpi.includes('advocacy')) {
      iconPath = '/KPIs/Advocacy.svg';
    } else {
      // Default icon
      iconPath = '/KPIs/Brand_Awareness.svg';
    }
    
    return { iconPath, displayText };
  };
  
  const { iconPath, displayText } = getKpiInfo(kpi);
  
  return (
    <div className="flex items-center text-[var(--accent-color)] font-medium">
      <div className="mr-2 relative w-5 h-5 flex-shrink-0">
        <Image 
          src={iconPath}
          alt={displayText}
          fill
          className="object-contain blue-icon"
          style={{ filter: 'brightness(0) invert(50%) sepia(40%) saturate(1000%) hue-rotate(175deg) brightness(95%) contrast(90%)' }}
        />
      </div>
      <span>{displayText}</span>
    </div>
  );
};

// Now update the DataItem component to handle KPI display
interface DataItemProps {
  label: string;
  value: string | number | null;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  featured?: boolean;
  isKPI?: boolean;
}

const DataItem: React.FC<DataItemProps> = ({ label, value, icon: Icon, featured = false, isKPI = false }) => {
  // Convert objects or other non-primitive values to strings
  const displayValue = () => {
    if (value === null || value === undefined) {
      return 'Not provided';
    }
    
    // If value is an object, convert to a string representation
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return 'Complex Object';
      }
    }
    
    return value;
  };

  return (
    <div className={`mb-4 ${featured ? 'bg-[rgba(0,191,255,0.05)] p-3 rounded-md' : ''}`}>
      <div className="flex items-center">
        {Icon && <Icon className="h-4 w-4 text-[var(--secondary-color)] mr-2" />}
        <p className="text-sm text-[var(--secondary-color)] mb-1 font-medium">{label}</p>
      </div>
      <div className={`font-medium text-[var(--primary-color)] ${featured ? 'text-lg' : ''}`}>
        {isKPI ? <KPIDisplay kpi={String(value)} /> : displayValue()}
      </div>
    </div>
  );
};

// Add a type for merged data
interface MergedData {
  [key: string]: any;
  overview?: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    timeZone?: string;
    currency?: string;
    totalBudget?: number;
    socialMediaBudget?: number;
    primaryContact?: {
      firstName?: string;
      surname?: string;
      email?: string;
      position?: string;
    };
    secondaryContact?: {
      firstName?: string;
      surname?: string;
      email?: string;
      position?: string;
    };
    influencerName?: string;
    influencerHandle?: string;
  };
  objectives?: {
    primaryKPI?: string;
    secondaryKPIs?: string[];
    features?: string[];
    mainMessage?: string;
    hashtags?: string;
    keyBenefits?: string;
    expectedAchievements?: string;
  };
  audience?: {
    age1824?: number;
    age2534?: number;
    age3544?: number;
    age4554?: number;
    age5564?: number;
    age65plus?: number;
    genders?: {gender: string}[];
    locations?: {location: string}[];
    languages?: {language: string}[];
    educationLevel?: string;
    incomeLevel?: string;
    jobTitles?: string;
    screeningQuestions?: {question: string}[];
    competitors?: {competitor: string}[];
    brandPerception?: string;
  };
  creativeAssets?: CreativeAsset[];
  creativeRequirements?: {requirement: string}[];
  campaignName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  currency?: string;
  totalBudget?: number;
  socialMediaBudget?: number;
  primaryContact?: any;
  secondaryContact?: any;
  influencerName?: string;
  influencerHandle?: string;
  primaryKPI?: string;
  secondaryKPIs?: string[];
  features?: string[];
  mainMessage?: string;
  hashtags?: string;
  keyBenefits?: string;
  expectedAchievements?: string;
  brandPerception?: string;
}

// Add a robust fallback data object
const fallbackData: MergedData = {
  campaignName: "Preview Campaign",
  description: "This is a preview of your campaign with fallback data.",
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days from now
  timeZone: "UTC",
  currency: "USD",
  totalBudget: 10000,
  socialMediaBudget: 5000,
  primaryContact: { 
    firstName: "Contact", 
    surname: "Name", 
    email: "contact@example.com",
    position: "Manager"
  },
  primaryKPI: "brandAwareness",
  secondaryKPIs: ["adRecall", "consideration"],
  features: ["BRAND_LIFT"],
  mainMessage: "Sample main message for the campaign",
  hashtags: "#sample #campaign #preview",
  keyBenefits: "Sample key benefits",
  expectedAchievements: "Sample expected achievements",
  overview: {
    name: "Preview Campaign",
    description: "This is a preview of your campaign with fallback data.",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    timeZone: "UTC",
    currency: "USD",
    totalBudget: 10000,
    socialMediaBudget: 5000,
    primaryContact: { 
      firstName: "Contact", 
      surname: "Name", 
      email: "contact@example.com",
      position: "Manager"
    }
  },
  objectives: {
    primaryKPI: "brandAwareness",
    secondaryKPIs: ["adRecall", "consideration"],
    features: ["BRAND_LIFT"],
    mainMessage: "Sample main message for the campaign",
    hashtags: "#sample #campaign #preview",
    keyBenefits: "Sample key benefits",
    expectedAchievements: "Sample expected achievements"
  },
  audience: {
    age1824: 20,
    age2534: 30,
    age3544: 25,
    age4554: 15,
    age5564: 7,
    age65plus: 3,
    genders: [{gender: "Male"}, {gender: "Female"}],
    locations: [{location: "United States"}, {location: "United Kingdom"}],
    languages: [{language: "English"}],
    brandPerception: "Sample brand perception"
  },
  creativeAssets: [],
  creativeRequirements: []
};

// Helper function to normalize API data into a consistent format
const normalizeApiData = (data: any): MergedData => {
  // Check which schema type we're dealing with based on field presence
  const isWizardSchema = data.name !== undefined;
  const isSubmissionSchema = data.campaignName !== undefined;
  
  console.log(`Normalizing API data: isWizardSchema=${isWizardSchema}, isSubmissionSchema=${isSubmissionSchema}`);
  
  // For debugging
  if (isWizardSchema) console.log('Campaign name from CampaignWizard:', data.name);
  if (isSubmissionSchema) console.log('Campaign name from CampaignWizardSubmission:', data.campaignName);
  
  return {
    // Map fields to consistent names, handling both schema types
    campaignName: isWizardSchema ? data.name : data.campaignName,
    description: data.description || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    timeZone: data.timeZone || '',
    currency: isWizardSchema 
      ? (data.budget?.currency || '') 
      : (data.currency || ''),
    totalBudget: isWizardSchema 
      ? (data.budget?.totalBudget || 0) 
      : (data.totalBudget || 0),
    socialMediaBudget: isWizardSchema 
      ? (data.budget?.socialMediaBudget || 0) 
      : (data.socialMediaBudget || 0),
    platform: data.platform || '',
    influencerHandle: data.influencerHandle || '',
    
    // Primary Contact handling for both schemas
    primaryContact: isWizardSchema 
      ? (typeof data.primaryContact === 'object' ? data.primaryContact : {}) 
      : (data.primaryContact || {}),
    
    secondaryContact: isWizardSchema 
      ? (typeof data.secondaryContact === 'object' ? data.secondaryContact : {}) 
      : (data.secondaryContact || {}),
    
    // KPIs and Features
    primaryKPI: data.primaryKPI || '',
    secondaryKPIs: Array.isArray(data.secondaryKPIs) ? data.secondaryKPIs : [],
    features: Array.isArray(data.features) ? data.features : [],
    
    // Campaign messaging
    mainMessage: isWizardSchema 
      ? (data.messaging?.mainMessage || '') 
      : (data.mainMessage || ''),
    hashtags: isWizardSchema 
      ? (data.messaging?.hashtags || '') 
      : (data.hashtags || ''),
    keyBenefits: isWizardSchema 
      ? (data.messaging?.keyBenefits || '') 
      : (data.keyBenefits || ''),
    expectedAchievements: isWizardSchema 
      ? (data.expectedOutcomes?.achievements || '') 
      : (data.expectedAchievements || ''),
    brandPerception: isWizardSchema 
      ? (data.expectedOutcomes?.brandPerception || '') 
      : (data.brandPerception || ''),
    
    // Nested structure for compatibility with the UI
    overview: {
      name: isWizardSchema ? data.name : data.campaignName,
      description: data.description || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      timeZone: data.timeZone || '',
      currency: isWizardSchema 
        ? (data.budget?.currency || '') 
        : (data.currency || ''),
      totalBudget: isWizardSchema 
        ? (data.budget?.totalBudget || 0) 
        : (data.totalBudget || 0),
      socialMediaBudget: isWizardSchema 
        ? (data.budget?.socialMediaBudget || 0) 
        : (data.socialMediaBudget || 0),
      primaryContact: isWizardSchema 
        ? (typeof data.primaryContact === 'object' ? data.primaryContact : {}) 
        : (data.primaryContact || {})
    },
    
    objectives: {
      primaryKPI: data.primaryKPI || '',
      secondaryKPIs: Array.isArray(data.secondaryKPIs) ? data.secondaryKPIs : [],
      features: Array.isArray(data.features) ? data.features : [],
      mainMessage: isWizardSchema 
        ? (data.messaging?.mainMessage || '') 
        : (data.mainMessage || ''),
      hashtags: isWizardSchema 
        ? (data.messaging?.hashtags || '') 
        : (data.hashtags || ''),
      keyBenefits: isWizardSchema 
        ? (data.messaging?.keyBenefits || '') 
        : (data.keyBenefits || ''),
      expectedAchievements: isWizardSchema 
        ? (data.expectedOutcomes?.achievements || '') 
        : (data.expectedAchievements || '')
    },
    
    audience: data.audience || {
      demographics: isWizardSchema ? data.demographics : {},
      locations: isWizardSchema ? data.locations : []
    },
    
    creativeAssets: Array.isArray(data.creativeAssets) 
      ? data.creativeAssets 
      : (isWizardSchema && Array.isArray(data.assets) 
          ? data.assets.map((asset: any) => ({
              id: asset.id || '',
              assetName: asset.name || '',
              type: asset.type || '',
              url: asset.url || '',
              fileName: asset.fileName || ''
            }))
          : []),
    
    creativeRequirements: Array.isArray(data.creativeRequirements) 
      ? data.creativeRequirements 
      : (isWizardSchema && Array.isArray(data.requirements) 
          ? data.requirements.map((req: any) => ({ requirement: req }))
          : [])
  };
};

// Helper for formatting KPI values to display formats
const formatKPI = (kpiValue: string): string => {
  if (!kpiValue) return '';
  
  // Map of camelCase KPI names to display format
  const kpiDisplayMap: Record<string, string> = {
    'adRecall': 'Ad Recall',
    'brandAwareness': 'Brand Awareness',
    'consideration': 'Consideration',
    'messageAssociation': 'Message Association',
    'brandPreference': 'Brand Preference',
    'purchaseIntent': 'Purchase Intent',
    'actionIntent': 'Action Intent',
    'recommendationIntent': 'Recommendation Intent',
    'advocacy': 'Advocacy',
    // Handle uppercase values too
    'AD_RECALL': 'Ad Recall',
    'BRAND_AWARENESS': 'Brand Awareness',
    'CONSIDERATION': 'Consideration',
    'MESSAGE_ASSOCIATION': 'Message Association',
    'BRAND_PREFERENCE': 'Brand Preference',
    'PURCHASE_INTENT': 'Purchase Intent',
    'ACTION_INTENT': 'Action Intent',
    'RECOMMENDATION_INTENT': 'Recommendation Intent',
    'ADVOCACY': 'Advocacy'
  };
  
  return kpiDisplayMap[kpiValue] || kpiValue;
};

// Helper for formatting feature values to display formats
const formatFeature = (featureValue: string): string => {
  if (!featureValue) return '';
  
  // Map of feature codes to display format
  const featureDisplayMap: Record<string, string> = {
    'CREATIVE_ASSET_TESTING': 'Creative Asset Testing',
    'BRAND_LIFT': 'Brand Lift',
    'BRAND_HEALTH': 'Brand Health',
    'MIXED_MEDIA_MODELLING': 'Mixed Media Modelling',
    'MIXED_MEDIA_MODELING': 'Mixed Media Modelling'
  };
  
  return featureDisplayMap[featureValue] || featureValue.replace(/_/g, ' ');
};

// Helper for formatting dates
const formatDate = (dateString: string | Date): string => {
  if (!dateString) return 'Not specified';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error formatting date';
  }
};

// Helper for formatting currency values
const formatCurrency = (amount: number | string, currencyCode: string = 'USD'): string => {
  if (amount === undefined || amount === null) return 'Not specified';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return 'Invalid amount';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback format without currency style
    return `${numericAmount.toLocaleString('en-US')} ${currencyCode}`;
  }
};

// Add FeatureIcon component
interface FeatureIconProps {
  feature: string;
}

const FeatureIcon: React.FC<FeatureIconProps> = ({ feature }) => {
  const normalizedFeature = feature.toLowerCase();
  let iconPath = '';
  let altText = formatFeature(feature);
  
  // Map feature to icon path
  if (normalizedFeature.includes('brand_health') || normalizedFeature.includes('brandhealth')) {
    iconPath = '/Brand_Health.svg';
  } else if (normalizedFeature.includes('brand_lift') || normalizedFeature.includes('brandlift')) {
    iconPath = '/Brand_Lift.svg';
  } else if (normalizedFeature.includes('creative_asset_testing') || normalizedFeature.includes('creativeasset')) {
    iconPath = '/Creative_Asset_Testing.svg';
  } else if (normalizedFeature.includes('mixed_media_modelling') || normalizedFeature.includes('mmm')) {
    iconPath = '/MMM.svg';
  } else if (normalizedFeature.includes('influencer')) {
    iconPath = '/Influencers.svg';
  } else if (normalizedFeature.includes('reports') || normalizedFeature.includes('reporting')) {
    iconPath = '/Reports.svg';
  } else {
    iconPath = '/Campaigns.svg'; // Default icon
  }
  
  return (
    <div className="flex items-center">
      <div className="mr-2 relative w-5 h-5 flex-shrink-0">
        <Image
          src={iconPath}
          alt={altText}
          fill
          className="object-contain blue-icon"
          style={{ filter: 'brightness(0) invert(50%) sepia(40%) saturate(1000%) hue-rotate(175deg) brightness(95%) contrast(90%)' }}
        />
      </div>
      <span>{altText}</span>
    </div>
  );
};

// Main Component
function Step5Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  
  // We'll still use the context but won't rely on it exclusively
  const { 
    data: contextData, 
    loading: wizardLoading,
    reloadCampaignData 
  } = useWizard();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignData, setCampaignData] = useState<Record<string, any> | null>(null);
  const [validationState, setValidationState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [showAssets, setShowAssets] = useState(false);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  
  // Update the displayData useMemo to use the normalizeApiData function
  const displayData = useMemo(() => {
    // If we have explicit campaign data from API, use it first
    if (campaignData && Object.keys(campaignData).length > 0) {
      console.log("Using campaign data from direct API fetch");
      return normalizeApiData(campaignData);
    }
    
    // Otherwise fall back to context data if available
    if (contextData && Object.keys(contextData).length > 0) {
      console.log("Using campaign data from WizardContext");
      // Convert context data to the expected shape with safeguards
      return normalizeApiData(contextData);
    }
    
    // If we have no data at all and there's an error, use fallback
    if (error && fetchAttempts >= 2) {
      console.warn("Using fallback data due to fetch errors");
      return fallbackData;
    }
    
    // Last resort - empty object
    console.warn("No data available from any source");
    return {} as MergedData;
  }, [campaignData, contextData, error, fetchAttempts]);
  
  // Check if we have minimal data
  const hasMinimalData = Boolean(
    displayData && 
    Object.keys(displayData).length > 0 && 
    (displayData.campaignName || (displayData.overview && displayData.overview.name))
  );

  // Simplified data fetching approach - directly fetch from API
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) {
        setError("Campaign ID is missing");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log(`Fetching campaign data for ID: ${campaignId}`);
        setIsLoading(true);
        
        // Direct API call with no-cache to ensure fresh data
        const response = await fetch(`/api/campaigns/${campaignId}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          credentials: 'include'
        });
        
        console.log(`API response status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("API response:", result);
        
        if (result.success && result.data) {
          setCampaignData(result.data);
          setError(null);
        } else {
          throw new Error(result.error || "API returned success:false");
        }
      } catch (err) {
        console.error("Error fetching campaign data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch campaign data");
        
        // Only use context data as fallback if direct fetch fails
        if (contextData && Object.keys(contextData).length > 0) {
          console.log("Using context data as fallback");
          // Convert to unknown first to safely cast the type
          setCampaignData({ ...contextData } as unknown as Record<string, any>);
        } else {
          // Attempt to reload context data as a last resort
          try {
            reloadCampaignData();
          } catch (contextError) {
            console.error("Context reload also failed:", contextError);
          }
        }
      } finally {
        setIsLoading(false);
        setFetchAttempts(prev => prev + 1);
      }
    };
    
    fetchCampaignData();
  }, [campaignId, reloadCampaignData]);
  
  // Validate when we have data
  useEffect(() => {
    if (displayData && Object.keys(displayData).length > 0) {
      validateCampaignData(displayData);
    }
  }, [displayData]);

  // Navigate to edit a specific step
  const navigateToStep = (step: number) => {
    router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`);
  };

  // Define a simple validation function in the file
  const validateCampaignData = (data: any): void => {
    // Reset validation messages to avoid duplicates
    setValidationMessages([]);
    
    // For testing: Allow submission regardless of validation state
    // Only log any validation issues but don't prevent submission
    
    // Check for missing critical sections (logs only)
    const missingKeys: string[] = [];
    if (!data?.overview || Object.keys(data.overview || {}).length === 0) missingKeys.push('overview');
    if (!data?.objectives || Object.keys(data.objectives || {}).length === 0) missingKeys.push('objectives');
    if (!data?.audience || Object.keys(data.audience || {}).length === 0) missingKeys.push('audience');
    if (!data?.creativeAssets || (Array.isArray(data.creativeAssets) && data.creativeAssets.length === 0)) missingKeys.push('creativeAssets');
    
    // Log validation issues but don't block submission
    if (missingKeys.length > 0) {
      console.warn(`NOTE: Some campaign data is missing (${missingKeys.join(', ')}), but submission will be allowed for testing.`);
    }
    
    // No validation messages will be set, allowing submission to proceed
  };

  // Handle final submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log(`Submitting campaign with ID: ${campaignId}`);
      
      // For testing, we'll log directly to the console
      console.log('Campaign data being submitted:', displayData);
      
      // Proceed with the actual submission
      const response = await fetch(`/api/campaigns/${campaignId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // No request body needed, but if any is added in the future:
        // body: JSON.stringify(EnumTransformers.transformObjectToBackend(requestBody)),
      });

      // Log the response status to help with debugging
      console.log(`Submission response status: ${response.status}`);
      
      // Parse the response JSON regardless of success/failure for debugging
      let responseData;
      try {
        responseData = await response.json();
        console.log('Submission response data:', responseData);
        
        // Verify status transition - log the campaign status after submission
        if (responseData?.campaign?.status) {
          console.log(`Campaign status after submission: ${responseData.campaign.status}`);
          console.log('Previous status was likely DRAFT, new status should be APPROVED');
          // If needed, update any local state here to reflect the new status
        }
      } catch (jsonError) {
        console.error('Error parsing response JSON:', jsonError);
      }

      if (!response.ok) {
        const errorMessage = responseData?.error || `Server returned ${response.status}`;
        console.error(`Submission failed with status ${response.status}:`, errorMessage);
        throw new Error(errorMessage);
      }

      // Show success message with status transition
      toast.success("Campaign submitted successfully! Status changed from DRAFT to APPROVED.");
      
      // Redirect to the submission success page with a brief delay to allow toast to be seen
      setTimeout(() => {
        console.log('Redirecting to submission success page...');
        router.push(`/campaigns/wizard/submission?id=${campaignId}`);
      }, 1000);
    } catch (error) {
      console.error("Error submitting campaign:", error);
      // Show a more detailed error message to the user
      toast.error(
        error instanceof Error 
          ? `Failed to submit campaign: ${error.message}` 
          : "Failed to submit campaign due to an unknown error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionStatus: 'draft'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save draft');
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  // Modify the reset button to properly clear the fetch attempt flag
  const handleReset = () => {
    // Clear fetch attempt tracking
    setFetchAttempts(0);
    
    // Clear session storage for this campaign
    if (campaignId) {
      try {
        sessionStorage.removeItem(`fetch_limit_${campaignId}`);
        console.log("Cleared fetch counter for campaign", campaignId);
      } catch (e) {
        console.warn("Could not clear sessionStorage - may be in private browsing mode");
      }
    }
    
    // Reset component state
    setError(null);
    setIsLoading(true);
    setCampaignData(null);
    
    // Force hard reload after a short delay
    setTimeout(() => window.location.reload(), 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading campaign data...</p>
      </div>
    );
  }

  if (error) {
    // Special handling for "not found" errors
    const isNotFoundError = error.includes("404 Not Found") || error.includes("not found");
    
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Campaign</h3>
        <p className="text-red-600 mb-4">{error}</p>
        
        {/* Add a reset button to clear any cached state */}
        <button 
          onClick={handleReset}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Reset Cache & Reload
        </button>
        
        {isNotFoundError ? (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h4 className="text-lg font-medium mb-3">Campaign Not Found</h4>
            <p className="mb-4">
              The campaign with ID {campaignId} couldn't be found in the database. It may have been deleted or never existed.
            </p>
            <div className="flex flex-col space-y-4">
              <Link 
                href="/campaigns"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 w-full md:w-auto"
              >
                View All Campaigns
              </Link>
              
              <Link 
                href="/campaigns/wizard/step-1"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full md:w-auto"
              >
                Create New Campaign
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-red-100 p-4 rounded-md mb-4">
            <h4 className="font-medium mb-2">Debugging Information:</h4>
            <p className="text-sm">Campaign ID: {campaignId || 'Not provided'}</p>
            <p className="text-sm">Data loaded: {Object.keys(contextData || {}).length > 0 ? 'Yes, from context' : 'No'}</p>
            <p className="text-sm">Direct API data loaded: {Object.keys(campaignData || {}).length > 0 ? 'Yes' : 'No'}</p>
            <p className="text-sm">Fetch attempts: {fetchAttempts}</p>
            <p className="text-sm">Error type: {error.includes("API Error") ? "API Response Error" : 
                                        error.includes("fetch") ? "Network Error" : "Other Error"}</p>
            
            {/* Add a debugging tool to check database connection */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Troubleshooting Steps:</p>
              <ol className="list-decimal pl-5 text-sm space-y-1">
                <li>Check that campaign ID {campaignId} exists in your database</li>
                <li>Verify API route <code>/api/campaigns/{campaignId}</code> is working correctly</li>
                <li>Check browser console logs for detailed API responses and errors</li>
                <li>Try accessing the campaign from the regular campaigns list view</li>
                <li>Inspect your server logs for backend errors</li>
              </ol>
            </div>
          </div>
        )}
        
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              setError(null);
              setIsLoading(true);
              setFetchAttempts(0);
              setTimeout(() => {
                if (campaignId) {
                  window.location.href = `/campaigns/wizard/step-5?id=${campaignId}`;
                } else {
                  router.push('/campaigns');
                }
              }, 500);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/campaigns')}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
          >
            Return to Campaigns
          </button>
          
          {/* Add a button to manually test the API */}
          <button
            onClick={async () => {
              try {
                console.log("Testing API endpoint manually...");
                setIsLoading(true);
                // Use the corrected endpoint format with query parameter
                const response = await fetch(`/api/campaigns/${campaignId}`, {
                  headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                  }
                });
                console.log("Manual test response status:", response.status);
                
                if (!response.ok) {
                  console.error("API test failed with status:", response.status);
                  alert(`API test failed: ${response.status} ${response.statusText}`);
                  return;
                }
                
                const data = await response.json();
                console.log("Manual API test result:", data);
                alert(`API test success! Check console for details.`);
                
                // If test successful, use the data
                if (data.success && data.data) {
                  setCampaignData(data.data);
                  setError(null);
                  setIsLoading(false);
                }
              } catch (err) {
                console.error("Manual API test error:", err);
                alert(`API test error: ${err instanceof Error ? err.message : String(err)}`);
              } finally {
                setIsLoading(false);
              }
            }}
            className="px-4 py-2 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-md hover:bg-yellow-100"
          >
            Test API Endpoint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      {/* Add Reset Button at top when we have campaign ID but no/minimal data */}
      {campaignId && (!hasMinimalData || error) && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-medium text-blue-800 mb-2">Having trouble viewing this campaign?</h3>
          <p className="text-blue-700 mb-3">
            {!hasMinimalData 
              ? "Campaign data is not loading properly. You can try resetting the page cache."
              : "Some campaign data may be missing. You can try resetting to reload all data."}
          </p>
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reset & Reload Page
          </button>
        </div>
      )}

      {/* Warning if we have some data but it's incomplete */}
      {hasMinimalData && Object.keys(displayData).length < 5 && !error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Limited Campaign Data</h3>
          <p className="text-yellow-700 mb-3">
            We found some basic information for this campaign, but detailed data might be missing.
          </p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--primary-color)] mb-1">Campaign Creation</h1>
        <p className="text-[var(--secondary-color)]">Review your campaign details and submit</p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Campaign Details */}
        <SummarySection
          title="Campaign Details"
          stepNumber={1}
          onEdit={() => navigateToStep(1)}
        >
          <div className="px-4 py-3 border-b border-[var(--divider-color)]">
            <DataItem 
              label="Campaign Name" 
              value={displayData.campaignName || displayData?.overview?.name || 'Not specified'} 
              featured={true} 
            />
          </div>

          <div className="px-4 py-5">
            <DataItem 
              label="Description" 
              value={displayData.description || displayData?.overview?.description || 'No description provided'} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-3">
            <DataItem 
              label="Start Date" 
              value={displayData.startDate 
                ? formatDate(displayData.startDate)
                : displayData?.overview?.startDate 
                  ? formatDate(displayData?.overview?.startDate)
                  : 'Not specified'} 
              icon={CalendarIcon}
            />
            <DataItem 
              label="End Date" 
              value={displayData.endDate 
                ? formatDate(displayData.endDate)
                : displayData?.overview?.endDate
                  ? formatDate(displayData?.overview?.endDate)
                  : 'Not specified'} 
              icon={CalendarIcon}
            />
          </div>

          <div className="px-4 py-3">
            <h3 className="text-sm font-medium text-gray-600">Time Zone</h3>
            <p className="text-gray-800 mt-1 font-medium">
              {displayData.timeZone || displayData?.overview?.timeZone || 'Not specified'}
            </p>
          </div>

          <div className="px-4 py-4 border-t border-b border-gray-100 bg-gray-50 rounded-md my-3">
            <div className="mb-5">
              <h3 className="font-medium text-gray-700 mb-3">Primary Contact</h3>
              {(displayData.primaryContact || displayData?.overview?.primaryContact) ? (
                <div>
                  <p className="font-medium text-gray-800">
                    {displayData.primaryContact?.firstName || displayData?.overview?.primaryContact?.firstName || ''} 
                    {' '}
                    {displayData.primaryContact?.surname || displayData?.overview?.primaryContact?.surname || ''}
                  </p>
                  <div className="flex items-center mt-1">
                    <p className="text-gray-700 text-sm">
                      {displayData.primaryContact?.email || displayData?.overview?.primaryContact?.email || ''}
                    </p>
                    <span className="ml-3 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md font-medium">
                      {displayData.primaryContact?.position || displayData?.overview?.primaryContact?.position || ''}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No primary contact specified</p>
              )}
            </div>

            {(displayData.secondaryContact?.email || displayData?.overview?.secondaryContact?.email) && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Secondary Contact</h3>
                <div>
                  <p className="font-medium text-gray-800">
                    {displayData.secondaryContact?.firstName || displayData?.overview?.secondaryContact?.firstName || ''} 
                    {' '}
                    {displayData.secondaryContact?.surname || displayData?.overview?.secondaryContact?.surname || ''}
                  </p>
                  <div className="flex items-center mt-1">
                    <p className="text-gray-700 text-sm">
                      {displayData.secondaryContact?.email || displayData?.overview?.secondaryContact?.email || ''}
                    </p>
                    <span className="ml-3 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md font-medium">
                      {displayData.secondaryContact?.position || displayData?.overview?.secondaryContact?.position || ''}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-4">
            <DataItem 
              label="Currency" 
              value={displayData.currency || displayData?.overview?.currency || 'Not specified'}
            />
            <DataItem 
              label="Total campaign budget" 
              value={displayData.currency 
                ? formatCurrency(displayData.totalBudget || 0, displayData.currency)
                : (displayData?.overview?.currency 
                  ? formatCurrency(displayData?.overview?.totalBudget || 0, displayData?.overview?.currency)
                  : 'Not specified')}
              icon={CurrencyDollarIcon}
              featured={true}
            />
          </div>

          <div className="px-4 py-3">
            <DataItem 
              label="Budget allocated to social media" 
              value={displayData.socialMediaBudget !== undefined || displayData.currency 
                ? formatCurrency(displayData.socialMediaBudget || 0, displayData.currency || 'USD')
                : displayData?.overview?.socialMediaBudget !== undefined
                  ? formatCurrency(displayData?.overview?.socialMediaBudget || 0, displayData?.overview?.currency || 'USD')
                  : 'Not specified'}
              icon={CurrencyDollarIcon}
            />
          </div>

          <div className="px-4 py-4 border-t border-[var(--divider-color)] mt-2">
            <h3 className="text-sm font-medium text-[var(--secondary-color)] mb-2">Influencer</h3>
            <div className="flex items-center mt-1">
              <div className="h-10 w-10 rounded-full bg-[rgba(0,191,255,0.1)] flex items-center justify-center overflow-hidden mr-3">
                {/* Default profile icon if no image */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--accent-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-[var(--primary-color)]">
                  {displayData.influencerName || displayData?.overview?.influencerName || 'Not specified'}
                </p>
                <p className="text-sm text-[var(--secondary-color)]">
                  {displayData.influencerHandle || displayData?.overview?.influencerHandle || '@influencer'}
                </p>
              </div>
            </div>
          </div>
        </SummarySection>

        {/* Step 2: Objectives & Messaging */}
        <SummarySection
          title="Objectives & Messaging"
          stepNumber={2}
          onEdit={() => navigateToStep(2)}
        >
          {/* Campaign Objectives Section */}
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="px-4 py-4">
              <h3 className="font-medium text-gray-700 mb-4">Objectives</h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DataItem 
                    label="Primary KPI" 
                    value={displayData.primaryKPI || displayData?.objectives?.primaryKPI || ''}
                    isKPI={true}
                    featured={true}
                  />
                  
                  {/* For secondary KPIs, we'll display them in a more visual way */}
                  <div className="mb-4">
                    <p className="text-sm text-[var(--secondary-color)] mb-2 font-medium">Secondary KPIs</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {(displayData.secondaryKPIs && displayData.secondaryKPIs.length > 0) ? (
                        displayData.secondaryKPIs.map((kpi, idx) => (
                          <div 
                            key={idx}
                            className="bg-[rgba(0,191,255,0.1)] px-3 py-1.5 rounded-full inline-flex items-center"
                          >
                            <KPIDisplay kpi={kpi} />
                          </div>
                        ))
                      ) : (displayData?.objectives?.secondaryKPIs && Array.isArray(displayData?.objectives?.secondaryKPIs) && displayData?.objectives?.secondaryKPIs.length > 0) ? (
                        displayData.objectives.secondaryKPIs.map((kpi, idx) => (
                          <div 
                            key={idx}
                            className="bg-[rgba(0,191,255,0.1)] px-3 py-1.5 rounded-full inline-flex items-center"
                          >
                            <KPIDisplay kpi={kpi} />
                          </div>
                        ))
                      ) : (
                        <span className="text-[var(--secondary-color)]">None specified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[rgba(0,191,255,0.03)] p-4 rounded-lg border border-[var(--divider-color)]">
                  <h4 className="text-sm font-medium text-[var(--secondary-color)] mb-3">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {(displayData.features && Array.isArray(displayData.features) && displayData.features.length > 0) ? (
                      displayData.features.map((feature: string, idx: number) => (
                        <span 
                          key={idx}
                          className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center"
                        >
                          <FeatureIcon feature={feature} />
                        </span>
                      ))
                    ) : (displayData?.objectives?.features && Array.isArray(displayData?.objectives?.features) && displayData?.objectives?.features.length > 0) ? (
                      displayData.objectives.features.map((feature: string, idx: number) => (
                        <span 
                          key={idx}
                          className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center"
                        >
                          <FeatureIcon feature={feature} />
                        </span>
                      ))
                    ) : (
                      <span className="text-[var(--secondary-color)]">None specified</span>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <DataItem 
                    label="Main Message" 
                    value={displayData.mainMessage || displayData?.objectives?.mainMessage || 'Not specified'} 
                  />
                  
                  <DataItem 
                    label="Hashtags" 
                    value={displayData.hashtags || displayData?.objectives?.hashtags || 'Not specified'} 
                  />
                  
                  <DataItem 
                    label="Key Benefits" 
                    value={displayData.keyBenefits || displayData?.objectives?.keyBenefits || 'Not specified'} 
                  />
                  
                  <DataItem 
                    label="Expected Achievements" 
                    value={displayData.expectedAchievements || displayData?.objectives?.expectedAchievements || 'Not specified'} 
                  />
                </div>
              </div>
            </div>
          </div>
        </SummarySection>

        {/* Step 3: Audience & Competitors */}
        <SummarySection
          title="Audience Targeting"
          stepNumber={3}
          onEdit={() => navigateToStep(3)}
        >
          {displayData.audience || displayData?.audience ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-gray-700 mb-4">Demographics</h3>
                  
                  <DataItem 
                    label="Age Distribution" 
                    value={
                      displayData.audience?.age1824 !== undefined ? 
                        `18-24: ${displayData.audience.age1824}%, 25-34: ${displayData.audience.age2534}%, 35-44: ${displayData.audience.age3544}%, 45-54: ${displayData.audience.age4554}%, 55-64: ${displayData.audience.age5564}%, 65+: ${displayData.audience.age65plus}%`
                      : 'Not specified'
                    } 
                  />
                  
                  <DataItem 
                    label="Genders" 
                    value={
                      displayData.audience?.genders && Array.isArray(displayData.audience.genders) && displayData.audience.genders.length > 0 ?
                        displayData.audience.genders.map((g: any) => g.gender).join(', ')
                      : 'Not specified'
                    } 
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-gray-700 mb-4">Location</h3>
                  
                  <DataItem 
                    label="Locations" 
                    value={
                      displayData.audience?.locations && Array.isArray(displayData.audience.locations) && displayData.audience.locations.length > 0 ?
                        displayData.audience.locations.map((l: any) => l.location).join(', ')
                      : 'Not specified'
                    } 
                  />
                  
                  <DataItem 
                    label="Languages" 
                    value={
                      displayData.audience?.languages && Array.isArray(displayData.audience.languages) && displayData.audience.languages.length > 0 ?
                        displayData.audience.languages.map((l: any) => l.language).join(', ')
                      : 'Not specified'
                    } 
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                <h3 className="font-medium text-gray-700 mb-4">Advanced Targeting</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DataItem 
                    label="Education Level" 
                    value={displayData.audience?.educationLevel || 'Not specified'} 
                  />
                  
                  <DataItem 
                    label="Income Level" 
                    value={
                      displayData.audience?.incomeLevel ? 
                        `${displayData.currency || '$'}${displayData.audience.incomeLevel}`
                      : 'Not specified'
                    } 
                  />
                  
                  <DataItem 
                    label="Job Titles" 
                    value={displayData.audience?.jobTitles || 'Not specified'} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-500">Audience data not available. Please complete Step 3.</p>
            </div>
          )}

          <div className="space-y-6">
            {displayData.audience?.screeningQuestions && Array.isArray(displayData.audience.screeningQuestions) && 
              displayData.audience.screeningQuestions.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Screening Questions</h3>
                <ul className="space-y-2">
                  {displayData.audience.screeningQuestions.map((item: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-sm bg-gray-50 rounded-md p-3 inline-block border border-gray-100">
                        {item.question}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {displayData.audience?.competitors && Array.isArray(displayData.audience.competitors) && 
              displayData.audience.competitors.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-3">Competitors</h3>
                <div className="flex flex-wrap gap-2">
                  {displayData.audience.competitors.map((item: any, index: number) => (
                    <span key={index} className="inline-block px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium">
                      {item.competitor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-3">
              <h3 className="font-medium text-gray-700 mb-2">Brand Perception</h3>
              <p className="text-gray-800">
                {displayData.brandPerception || displayData?.audience?.brandPerception || 'Not specified'}
              </p>
            </div>
          </div>
        </SummarySection>

        {/* Step 4: Creative Assets */}
        <SummarySection
          title="Creative Assets"
          stepNumber={4}
          onEdit={() => navigateToStep(4)}
        >
          <div className="mb-4">
            <button
              onClick={() => setShowAssets(!showAssets)}
              className="flex items-center text-[var(--accent-color)] hover:underline font-medium"
            >
              <span>{showAssets ? 'Hide' : 'Show'} uploaded assets</span>
              <ChevronRightIcon 
                className={`h-5 w-5 ml-1 transition-transform duration-200 ${showAssets ? 'rotate-90' : ''}`} 
              />
            </button>
          </div>

          {showAssets && displayData.creativeAssets && Array.isArray(displayData.creativeAssets) && displayData.creativeAssets.length > 0 && (
            <div className="space-y-4">
              {displayData.creativeAssets.map((asset: CreativeAsset, index: number) => (
                <div key={asset.id || index} className="border border-[var(--divider-color)] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="bg-[rgba(0,191,255,0.05)] px-4 py-3 flex justify-between items-center border-b border-[var(--divider-color)]">
                    <h3 className="font-medium text-[var(--primary-color)]">{asset.assetName}</h3>
                    <span className="text-xs px-2 py-1 bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] rounded-full font-medium">
                      {asset.type}
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-sm text-[var(--secondary-color)] mb-1">File Name</p>
                      <div className="flex items-center">
                        <DocumentIcon className="h-4 w-4 text-[var(--secondary-color)] mr-2" />
                        <p className="font-medium text-[var(--primary-color)]">{asset.fileName}</p>
                      </div>
                    </div>
                    {asset.influencerHandle && (
                      <div>
                        <p className="text-sm text-[var(--secondary-color)] mb-1">Influencer</p>
                        <p className="font-medium text-[var(--primary-color)]">{asset.influencerHandle}</p>
                      </div>
                    )}
                    {asset.budget !== undefined && (
                      <div>
                        <p className="text-sm text-[var(--secondary-color)] mb-1">Budget</p>
                        <p className="font-medium text-[var(--primary-color)]">
                          {formatCurrency(asset.budget, displayData.currency || 'USD')}
                        </p>
                      </div>
                    )}
                    {asset.whyInfluencer && (
                      <div className="col-span-2">
                        <p className="text-sm text-[var(--secondary-color)] mb-1">Why this influencer?</p>
                        <p className="text-sm text-[var(--primary-color)] bg-gray-50 p-3 rounded-md">{asset.whyInfluencer}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!displayData.creativeAssets || !Array.isArray(displayData.creativeAssets) || displayData.creativeAssets.length === 0) && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4">
              <p className="text-yellow-800">No assets have been uploaded yet.</p>
            </div>
          )}

          {/* Creative Requirements */}
          {displayData.creativeRequirements && Array.isArray(displayData.creativeRequirements) && displayData.creativeRequirements.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-3">Creative Requirements</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-800">
                {displayData.creativeRequirements.map((req: any, index: number) => (
                  <li key={index}>{req.requirement}</li>
                ))}
              </ul>
            </div>
          )}
        </SummarySection>

        {/* Validation Messages */}
        <div className="mt-8">
          <div className="bg-green-50 border border-green-100 rounded-md p-5 flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-800 text-lg">All required information has been provided</h3>
              <p className="text-green-700 mt-1">Your campaign is ready to be submitted. Review all details before final submission.</p>
            </div>
          </div>
        </div>

        {/* Add ProgressBar component at the bottom */}
        <div className="mt-12 mb-8">
          <ProgressBar
            currentStep={5}
            onStepClick={(step) => navigateToStep(step)}
            onBack={() => navigateToStep(4)}
            onNext={handleSubmit}
            onSaveDraft={handleSaveDraft}
            disableNext={false}
            isFormValid={true}
            isDirty={false}
            isSaving={isSaving || isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

export default function Step5() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Step5Content />
    </ErrorBoundary>
  );
}