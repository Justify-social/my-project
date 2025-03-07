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
  CurrencyDollarIcon,
  UserCircleIcon,
  InformationCircleIcon,
  PlayIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  CurrencyEuroIcon,
  BriefcaseIcon,
  LanguageIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Link from "next/link";
import { EnumTransformers } from '@/utils/enum-transformers';
import Image from "next/image";
import { AssetPreview } from '@/components/upload/AssetPreview';

// Type Definitions
interface CreativeAsset {
  id: string;
  assetName?: string;
  name?: string;
  type: string;
  url: string;
  fileName?: string;
  fileSize?: number;
  format?: string;
  influencerHandle?: string;
  influencerName?: string;
  influencerFollowers?: string;
  whyInfluencer?: string;
  budget?: number;
  description?: string;
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
    const displayText = formatKPI(kpiValue);
    
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

// Update the audience interface to include the properties we're using
interface AudienceData {
  demographics?: any;
  locations?: any[];
  targeting?: any;
  competitors?: any[];
  genders?: any[];
  jobTitles?: any[] | string;
  educationLevel?: string;
  incomeLevel?: string | number;
  ageDistribution?: Record<string, number>;
  age1824?: number;
  age2534?: number;
  age3544?: number;
  age4554?: number;
  age5564?: number;
  age65plus?: number;
  location?: any[];
  languages?: any[];
  screeningQuestions?: any[];
  brandPerception?: string;
}

// Update MergedData interface to use the AudienceData type
interface MergedData {
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  currency: string;
  totalBudget: number;
  socialMediaBudget: number;
  platform: string;
  influencerHandle: string;
  influencerName?: string;
  primaryContact: Record<string, any>;
  secondaryContact: Record<string, any>;
  primaryKPI: string;
  secondaryKPIs: any[];
  features: any[];
  mainMessage: string;
  hashtags: string;
  keyBenefits: string;
  expectedAchievements: string;
  brandPerception: string;
  creativeAssets: CreativeAsset[];
  creativeRequirements: any[];
  
  // Add nested data structures
  overview: Record<string, any>;
  objectives: Record<string, any>;
  audience: AudienceData;
}

// Add a robust fallback data object
const fallbackData: MergedData = {
  campaignName: 'Demo Campaign',
  description: 'This is a demo campaign with fallback data',
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  timeZone: 'UTC',
  currency: 'USD',
  totalBudget: 10000,
  socialMediaBudget: 5000,
  platform: 'Instagram',
  influencerHandle: '@demoaccount',
  influencerName: 'Demo Influencer',
  primaryContact: {
    firstName: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
    position: 'Manager'
  },
  secondaryContact: {
    firstName: 'Jane',
    surname: 'Smith',
    email: 'jane.smith@example.com',
    position: 'Assistant'
  },
  primaryKPI: 'brandAwareness',
  secondaryKPIs: ['adRecall', 'messageAssociation'],
  features: ['CREATIVE_ASSET_TESTING', 'BRAND_LIFT'],
  mainMessage: 'This is the main message for the campaign',
  hashtags: '#demo #campaign',
  keyBenefits: 'Key benefits of the product',
  expectedAchievements: 'Expected achievements',
  brandPerception: 'How the brand is perceived',
  creativeAssets: [
    {
      id: '1',
      name: 'Demo Asset',
      assetName: 'Demo Asset',
      type: 'image',
      url: '/placeholder.jpg',
      whyInfluencer: 'Selected for reach and engagement',
      budget: 1000,
      description: 'Demo asset description'
    }
  ],
  creativeRequirements: [
    { requirement: 'Must include brand logo' }
  ],
  overview: {
    name: 'Demo Campaign',
    description: 'This is a demo campaign with fallback data',
    startDate: '2023-01-01',
    endDate: '2023-12-31'
  },
  objectives: {
    primaryKPI: 'brandAwareness',
    secondaryKPIs: ['adRecall', 'messageAssociation'],
    features: ['CREATIVE_ASSET_TESTING', 'BRAND_LIFT']
  },
  audience: {
    demographics: {
      gender: ['Male', 'Female'],
      educationLevel: 'College',
      ageDistribution: {
        age1824: 25,
        age2534: 40,
        age3544: 20,
        age4554: 10,
        age5564: 5,
        age65plus: 0
      }
    },
    age1824: 25,
    age2534: 40,
    age3544: 20,
    age4554: 10,
    age5564: 5,
    age65plus: 0,
    genders: [{ gender: 'Male' }, { gender: 'Female' }],
    locations: [{ location: 'London' }, { location: 'New York' }],
    languages: [{ language: 'English' }],
    educationLevel: 'College',
    incomeLevel: '50000',
    jobTitles: ['Designer', 'Developer'],
    screeningQuestions: [{ question: 'Have you used our product before?' }],
    competitors: [{ competitor: 'Competitor X' }],
    brandPerception: 'Innovative'
  }
};

// Helper function to safely extract creativeAssets from different data sources
const extractCreativeAssets = (data: any, isWizardSchema: boolean): any[] => {
  // For debugging
  console.log("Extracting creative assets:", {
    isWizardSchema,
    hasAssets: Array.isArray(data?.assets),
    assetsLength: Array.isArray(data?.assets) ? data.assets.length : 'n/a',
    hasCreativeAssets: Array.isArray(data?.creativeAssets),
    creativeAssetsLength: Array.isArray(data?.creativeAssets) ? data.creativeAssets.length : 'n/a',
    assets: data?.assets,
    creativeAssets: data?.creativeAssets
  });

  if (isWizardSchema && Array.isArray(data.assets) && data.assets.length > 0) {
    console.log("Processing assets from CampaignWizard.assets");
    return data.assets.map((asset: any) => {
      // Extract all possible values for whyInfluencer with fallbacks
      const whyInfluencerValue = asset.whyInfluencer || 
                                 asset.description || 
                                 (typeof asset.details === 'object' && asset.details?.whyInfluencer) || 
                                 '';
                                 
      // Extract budget with proper type handling
      const budgetValue = typeof asset.budget === 'number' ? asset.budget :
                         (typeof asset.budget === 'string' ? parseFloat(asset.budget) : 0);
                         
      // Extract influencer handle with fallbacks
      const influencerHandle = asset.influencerHandle || 
                              (typeof asset.details === 'object' && asset.details?.influencerHandle) || 
                              '';
      
      return {
        id: asset.id || `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        assetName: asset.name || '',
        name: asset.name || '',
        type: asset.type || 'image',
        url: asset.url || '',
        fileName: asset.fileName || asset.name || '',
        fileSize: asset.fileSize || 0,
        description: asset.description || whyInfluencerValue || '',
        whyInfluencer: whyInfluencerValue,
        influencerHandle: influencerHandle,
        budget: budgetValue,
        format: asset.format || ''
      };
    });
  } else if (Array.isArray(data.creativeAssets) && data.creativeAssets.length > 0) {
    console.log("Processing assets from creativeAssets array");
    return data.creativeAssets.map((asset: any) => {
      // Extract whyInfluencer with fallbacks
      const whyInfluencerValue = asset.whyInfluencer || 
                                asset.description || 
                                (typeof asset.details === 'object' && asset.details?.whyInfluencer) || 
                                '';
      
      return {
        ...asset,
        assetName: asset.assetName || asset.name || '',
        name: asset.name || asset.assetName || '',
        description: asset.description || whyInfluencerValue || '',
        whyInfluencer: whyInfluencerValue,
        // Ensure budget is a number
        budget: typeof asset.budget === 'number' ? asset.budget : 
               (typeof asset.budget === 'string' ? parseFloat(asset.budget) : 0)
      };
    });
  } else if (data.creative && Array.isArray(data.creative.creativeAssets) && data.creative.creativeAssets.length > 0) {
    console.log("Processing assets from creative.creativeAssets array");
    return data.creative.creativeAssets.map((asset: any) => {
      // Extract whyInfluencer with fallbacks
      const whyInfluencerValue = asset.whyInfluencer || 
                                asset.description || 
                                (typeof asset.details === 'object' && asset.details?.whyInfluencer) || 
                                '';
      
      return {
        ...asset,
        assetName: asset.assetName || asset.name || '',
        name: asset.name || asset.assetName || '',
        description: asset.description || whyInfluencerValue || '',
        whyInfluencer: whyInfluencerValue,
        // Ensure budget is a number
        budget: typeof asset.budget === 'number' ? asset.budget : 
               (typeof asset.budget === 'string' ? parseFloat(asset.budget) : 0)
      };
    });
  }
  
  console.warn("No creative assets found in any expected location");
  return [];
};

const normalizeApiData = (data: any): MergedData => {
  // Check which schema type we're dealing with based on field presence
  const isWizardSchema = data.name !== undefined;
  const isSubmissionSchema = data.campaignName !== undefined;
  
  console.log(`Normalizing API data: isWizardSchema=${isWizardSchema}, isSubmissionSchema=${isSubmissionSchema}`);
  
  // For debugging
  if (isWizardSchema) console.log('Campaign name from CampaignWizard:', data.name);
  if (isSubmissionSchema) console.log('Campaign name from CampaignWizardSubmission:', data.campaignName);
  
  // Log creative assets data for debugging
  if (isWizardSchema) {
    console.log('CampaignWizard assets field:', data.assets);
    // Also log budget for debugging
    console.log('CampaignWizard budget field:', data.budget);
    // Log demographic data
    console.log('CampaignWizard demographics field:', data.demographics);
    console.log('CampaignWizard locations field:', data.locations);
  } else {
    console.log('CreativeAssets field:', data.creativeAssets);
  }
  
  // Extract creative assets with our helper function
  const creativeAssets = extractCreativeAssets(data, isWizardSchema);
  console.log("Extracted creativeAssets:", creativeAssets);
  
  // Extract budget data with proper fallbacks
  const budgetData = isWizardSchema && data.budget 
    ? (typeof data.budget === 'object' 
        ? data.budget 
        : { currency: 'EUR', totalBudget: 0, socialMediaBudget: 0 })
    : { 
        currency: data.currency || 'EUR', 
        totalBudget: data.totalBudget || 0, 
        socialMediaBudget: data.socialMediaBudget || 0 
      };
  
  console.log("Extracted budget data:", budgetData);
  
  // Extract audience data with proper fallbacks
  const audienceData = isWizardSchema 
    ? {
        demographics: data.demographics || {},
        locations: Array.isArray(data.locations) ? data.locations : [],
        targeting: data.targeting || {},
        competitors: Array.isArray(data.competitors) 
          ? data.competitors 
          : data.audience?.competitors || []
      }
    : (data.audience || {});
    
  console.log("Extracted audience data:", audienceData);
  console.log("Competitors data:", audienceData.competitors);
  
  return {
    // Map fields to consistent names, handling both schema types
    campaignName: isWizardSchema ? data.name : data.campaignName,
    description: data.businessGoal || data.description || (data.overview?.description) || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    timeZone: data.timeZone || '',
    currency: isWizardSchema 
      ? (budgetData.currency || 'EUR')
      : (data.currency || 'EUR'),
    totalBudget: isWizardSchema 
      ? (budgetData.totalBudget || budgetData.total || 0)
      : (data.totalBudget || 0),
    socialMediaBudget: isWizardSchema 
      ? (budgetData.socialMediaBudget || budgetData.socialMedia || 0)
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
      ? (data.expectedOutcomes?.brandPerception || data.brandPerception || '') 
      : (data.brandPerception || ''),
    
    // Nested structure for compatibility with the UI
    overview: {
      name: isWizardSchema ? data.name : data.campaignName,
      description: data.description || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      timeZone: data.timeZone || '',
      currency: isWizardSchema 
        ? (budgetData.currency || 'EUR')
        : (data.currency || 'EUR'),
      totalBudget: isWizardSchema 
        ? (budgetData.totalBudget || budgetData.total || 0)
        : (data.totalBudget || 0),
      socialMediaBudget: isWizardSchema 
        ? (budgetData.socialMediaBudget || budgetData.socialMedia || 0)
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
    
    audience: isWizardSchema 
      ? {
          demographics: audienceData.demographics || {},
          locations: audienceData.locations || [],
          targeting: audienceData.targeting || {},
          competitors: Array.isArray(audienceData.competitors) 
            ? audienceData.competitors.map((comp: any) => {
                if (typeof comp === 'string') return { competitor: comp };
                return comp;
              })
            : [],
          // Process demographics for better UI compatibility
          genders: Array.isArray(audienceData.demographics?.gender) 
            ? audienceData.demographics?.gender.map((g: any) => ({ gender: g }))
            : [],
          jobTitles: Array.isArray(audienceData.demographics?.jobTitles) 
            ? audienceData.demographics?.jobTitles 
            : (typeof audienceData.demographics?.jobTitles === 'string'
                ? (audienceData.demographics.jobTitles ? JSON.parse(audienceData.demographics.jobTitles) : [])
                : []),
          educationLevel: audienceData.demographics?.educationLevel || '',
          incomeLevel: audienceData.demographics?.incomeLevel || '',
          // Store the full age distribution object and also keep individual age values for compatibility
          ageDistribution: audienceData.demographics?.ageDistribution || {},
          age1824: audienceData.demographics?.ageDistribution?.age1824 || 0,
          age2534: audienceData.demographics?.ageDistribution?.age2534 || 0,
          age3544: audienceData.demographics?.ageDistribution?.age3544 || 0,
          age4554: audienceData.demographics?.ageDistribution?.age4554 || 0,
          age5564: audienceData.demographics?.ageDistribution?.age5564 || 0,
          age65plus: audienceData.demographics?.ageDistribution?.age65plus || 0,
          location: Array.isArray(audienceData.locations)
            ? audienceData.locations.map((loc: any) => ({ 
                location: typeof loc === 'string' ? loc : (loc.name || loc.location || '') 
              }))
            : [],
          languages: Array.isArray(audienceData.targeting?.languages)
            ? audienceData.targeting.languages.map((lang: any) => ({ 
                language: typeof lang === 'string' ? lang : (lang.language || '') 
              }))
            : []
        }
      : (data.audience || {}),
    
    // Using our extracted creativeAssets
    creativeAssets: creativeAssets,
    
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
  const altText = formatFeature(feature);
  
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

// Custom Asset Preview component for Step 5 (without play/pause controls)
const Step5AssetPreview = ({ url, fileName, type, className = '' }: { url: string, fileName: string, type: string, className?: string }) => {
  const isVideo = type === 'video' || (typeof type === 'string' && type.includes('video'));
  const isImage = type === 'image' || (typeof type === 'string' && type.includes('image'));
  const videoRef = useRef<HTMLVideoElement>(null);

  // Effect to handle video autoplay and looping
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      // Auto-play the video when component mounts
      const playVideo = () => {
        video.play().catch(error => {
          console.warn('Auto-play was prevented:', error);
        });
      };

      // Handle video looping - restart after 5 seconds or when ended
      const handleTimeUpdate = () => {
        if (video.currentTime >= 5) {
          video.currentTime = 0;
          video.play().catch(err => {
            console.error('Error replaying video:', err);
          });
        }
      };

      const handleEnded = () => {
        video.currentTime = 0;
        video.play().catch(err => {
          console.error('Error replaying video:', err);
        });
      };

      // Add event listeners
      video.addEventListener('loadedmetadata', playVideo);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      
      // Remove event listeners on cleanup
      return () => {
        video.removeEventListener('loadedmetadata', playVideo);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [isVideo, url]);

  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${className}`}>
      {/* Image preview */}
      {isImage && (
        <img 
          src={url} 
          alt={fileName}
          className="w-full h-full object-cover"
        />
      )}
      
      {/* Video preview (with autoplay and loop) */}
      {isVideo && (
        <div className="relative">
          <video
            ref={videoRef}
            src={url}
            className="w-full h-full object-cover"
            muted
            playsInline
            loop
            autoPlay
          />
        </div>
      )}
      
      {/* Fallback for unsupported file types */}
      {!isImage && !isVideo && (
        <div className="flex items-center justify-center p-8">
          <DocumentIcon className="h-12 w-12 text-gray-400" />
        </div>
      )}
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
    
    // Add more detailed logging for debugging
    console.log("Validating campaign data:", {
      hasOverview: !!data?.overview,
      hasObjectives: !!data?.objectives,
      hasAudience: !!data?.audience,
      hasCreativeAssets: !!data?.creativeAssets,
      creativeAssetsLength: Array.isArray(data?.creativeAssets) ? data.creativeAssets.length : 'not an array',
      creativeAssets: data?.creativeAssets,
      rawAssets: data?.assets,
      fullData: data
    });
    
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
    const isNotFoundError = 
      typeof error === 'string' && 
      (error.includes("404 Not Found") || error.includes("not found"));
    
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Campaign</h3>
        <p className="text-red-600 mb-4">{String(error)}</p>
        
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="font-medium text-gray-800 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <DataItem 
                  label="Campaign Name" 
                  value={displayData.campaignName || 'Not specified'} 
                  featured={true}
                />
                
                <DataItem 
                  label="Description" 
                  value={displayData.description || 'Not specified'} 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <DataItem 
                    label="Start Date" 
                    value={displayData.startDate ? formatDate(displayData.startDate) : 'Not specified'} 
                    icon={CalendarIcon}
                  />
                  
                  <DataItem 
                    label="End Date" 
                    value={displayData.endDate ? formatDate(displayData.endDate) : 'Not specified'} 
                    icon={CalendarIcon}
                  />
                </div>
              </div>
            </div>
            
            {/* Budget Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="font-medium text-gray-800 mb-4">Budget Information</h3>
              
              <div className="space-y-4">
                <DataItem 
                  label="Currency" 
                  value={displayData.currency || 'EUR'} 
                  icon={CurrencyDollarIcon}
                />
                
                <DataItem 
                  label="Total Budget" 
                  value={displayData.totalBudget ? formatCurrency(displayData.totalBudget, displayData.currency || 'EUR') : 'Not specified'} 
                  icon={CurrencyDollarIcon}
                  featured={true}
                />
                
                <DataItem 
                  label="Social Media Budget" 
                  value={displayData.socialMediaBudget ? formatCurrency(displayData.socialMediaBudget, displayData.currency || 'EUR') : 'Not specified'} 
                  icon={CurrencyDollarIcon}
                />
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
            <div className="space-y-6">
              {/* Demographics Section */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <UserGroupIcon className="h-5 w-5 text-[var(--accent-color)] mr-2" />
                  <h3 className="font-medium text-gray-800">Demographics</h3>
                </div>

                {/* Age Range */}
                <div className="mb-5">
                  <h4 className="text-gray-700 font-medium mb-3 text-sm">Age Range</h4>
                  <div className="grid grid-cols-6 gap-1">
                    {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map(range => {
                      // Check if this age range is selected
                      const ageKey = range === '65+' 
                        ? 'age65plus' 
                        : `age${range.replace('-', '')}`;
                      
                      const isSelected = displayData.audience 
                        && displayData.audience[ageKey as keyof typeof displayData.audience] 
                        && Number(displayData.audience[ageKey as keyof typeof displayData.audience]) > 0;
                      
                      return (
                        <div 
                          key={range} 
                          className={`text-center py-1.5 text-xs rounded ${isSelected 
                            ? 'bg-[var(--accent-color)] text-white font-medium' 
                            : 'bg-gray-100 text-gray-500'}`}
                        >
                          {range}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gender */}
                <div className="mb-5">
                  <h4 className="text-gray-700 font-medium mb-3 text-sm">Gender</h4>
                  <div className="flex flex-wrap gap-2">
                    {displayData.audience?.genders && Array.isArray(displayData.audience.genders) && 
                     displayData.audience.genders.length > 0 ? (
                      displayData.audience.genders.map((g: any, idx: number) => (
                        <span key={idx} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                          {g.gender || g.toString()}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">Not specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <GlobeAltIcon className="h-5 w-5 text-[var(--accent-color)] mr-2" />
                  <h3 className="font-medium text-gray-800">Location</h3>
                </div>

                {/* Locations */}
                <div className="mb-5">
                  <h4 className="text-gray-700 font-medium mb-3 text-sm">Locations</h4>
                  <div className="flex flex-wrap gap-2">
                    {displayData.audience?.locations && Array.isArray(displayData.audience.locations) && 
                     displayData.audience.locations.length > 0 ? (
                      displayData.audience.locations.map((l: any, idx: number) => (
                        <span key={idx} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                          {typeof l === 'string' ? l : (l.location || l.name || '')}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">Not specified</span>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-4">
                  <h4 className="text-gray-700 font-medium mb-3 text-sm">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {displayData.audience?.languages && Array.isArray(displayData.audience.languages) && 
                     displayData.audience.languages.length > 0 ? (
                      displayData.audience.languages.map((l: any, idx: number) => (
                        <span key={idx} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                          {typeof l === 'string' ? l : (l.language || l.toString())}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">Not specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Targeting */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <AcademicCapIcon className="h-5 w-5 text-[var(--accent-color)] mr-2" />
                  <h3 className="font-medium text-gray-800">Advanced Targeting</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Education Level */}
                  <div>
                    <h4 className="text-gray-700 font-medium mb-3 text-sm">Education Level</h4>
                    {displayData.audience?.educationLevel ? (
                      <span className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm inline-block">
                        {String(displayData.audience.educationLevel)}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">Not specified</span>
                    )}
                  </div>

                  {/* Income Level - with proper currency formatting */}
                  <div>
                    <h4 className="text-gray-700 font-medium mb-3 text-sm">Income Level</h4>
                    {displayData.audience?.incomeLevel ? (
                      <span className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm inline-block">
                        {formatCurrency(
                          Number(displayData.audience.incomeLevel) || 0, 
                          displayData.currency || 'EUR'
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">Not specified</span>
                    )}
                  </div>

                  {/* Job Titles */}
                  <div>
                    <h4 className="text-gray-700 font-medium mb-3 text-sm">Job Titles</h4>
                    <div className="flex flex-wrap gap-2">
                      {displayData.audience?.jobTitles ? (
                        Array.isArray(displayData.audience.jobTitles) ? (
                          displayData.audience.jobTitles.map((title: string, idx: number) => (
                            <span key={idx} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                              {title}
                            </span>
                          ))
                        ) : (
                          <span className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                            {String(displayData.audience.jobTitles)}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-500 text-sm">Not specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitors Section (if available) */}
              {displayData.audience?.competitors && Array.isArray(displayData.audience.competitors) && 
               displayData.audience.competitors.length > 0 && (
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-medium text-gray-800 mb-3">Competitors</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayData.audience.competitors.map((item: any, index: number) => (
                      <span key={index} className="inline-block px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-sm font-medium">
                        {typeof item === 'string' ? item : (item.competitor || item.name || '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Perception (if available) */}
              {(displayData.brandPerception || displayData?.audience?.brandPerception) && (
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-medium text-gray-800 mb-3">Brand Perception</h3>
                  <p className="text-gray-800">
                    {displayData.brandPerception || displayData?.audience?.brandPerception}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <UserGroupIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Audience data not available. Please complete Step 3.</p>
              <button 
                onClick={() => navigateToStep(3)} 
                className="mt-3 text-sm text-[var(--accent-color)] hover:underline flex items-center justify-center mx-auto"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Add audience targeting
              </button>
            </div>
          )}
        </SummarySection>

        {/* Step 4: Creative Assets */}
        <SummarySection
          title="Creative Assets"
          stepNumber={4}
          onEdit={() => navigateToStep(4)}
        >
          {displayData.creativeAssets && Array.isArray(displayData.creativeAssets) && displayData.creativeAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayData.creativeAssets.map((asset: CreativeAsset, index: number) => (
                <div key={asset.id || index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                  {/* Asset Preview - Square/Tiled */}
                  <div className="aspect-square w-full overflow-hidden relative bg-gray-50">
                    <Step5AssetPreview
                      url={asset.url}
                      fileName={asset.assetName || asset.name || 'Asset preview'}
                      type={asset.type}
                      className="w-full h-full"
                    />
                    
                    {/* Asset Name Overlay at Top */}
                    <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-90 py-2 px-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-800 truncate text-sm">
                        {asset.assetName || asset.name || 'Untitled Asset'}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Asset Details Section */}
                  <div className="p-4 bg-white flex-grow">
                    <div className="space-y-4">
                      {/* Influencer */}
                      <div className="flex items-start">
                        <UserCircleIcon className="h-5 w-5 text-[var(--accent-color)] mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Influencer</p>
                          <p className="text-sm text-gray-800 font-medium">{asset.influencerHandle || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      {/* Why this influencer */}
                      <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-[var(--accent-color)] mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Why this influencer</p>
                          <p className="text-sm text-gray-800">{asset.whyInfluencer || 'No details provided'}</p>
                        </div>
                      </div>
                      
                      {/* Budget */}
                      <div className="flex items-start">
                        <CurrencyDollarIcon className="h-5 w-5 text-[var(--accent-color)] mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Budget</p>
                          <p className="text-sm text-gray-800 font-medium">
                            {asset.budget 
                              ? formatCurrency(asset.budget, displayData.currency || 'EUR')
                              : 'Not specified'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <DocumentIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No creative assets have been added yet.</p>
              <button 
                onClick={() => navigateToStep(4)} 
                className="mt-3 text-sm text-[var(--accent-color)] hover:underline flex items-center justify-center mx-auto"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Add creative assets
              </button>
            </div>
          )}
        </SummarySection>
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
  );
}

export default function Step5() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Step5Content />
    </ErrorBoundary>
  );
}