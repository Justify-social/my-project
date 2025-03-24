"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import ProgressBar from "@/components/Wizard/ProgressBar";
import { useWizard } from "@/context/WizardContext";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { WizardSkeleton } from "@/components/ui/loading-skeleton";
import ErrorFallback from '@/components/ErrorFallback';
import { Icon } from "@/components/ui/icons";
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
  platform?: string;
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
  return <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--divider-color)] mb-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] rounded-full flex items-center justify-center mr-3 font-semibold">
            {stepNumber}
          </div>
          <h2 className="text-lg font-semibold text-[var(--primary-color)]">{title}</h2>
        </div>
        <button onClick={onEdit} className="group text-[var(--accent-color)] text-sm flex items-center hover:text-[var(--accent-color)] transition-colors" aria-label={`Edit ${title}`}>
          <Icon name="faPenToSquare" className="h-4 w-4 mr-1" iconType="button" solid={false} />
          <span>Edit</span>
        </button>
      </div>
      <div className="pl-11">
        {children}
      </div>
    </div>;
};

// Add a new KPIDisplay component for displaying KPI with their associated icons
interface KPIDisplayProps {
  kpi: string;
}
const KPIDisplay: React.FC<KPIDisplayProps> = ({
  kpi
}) => {
  if (!kpi) return <span>Not specified</span>;

  // Map KPI values to their correct SVG paths and display text
  const getKpiInfo = (kpiValue: string): {
    iconPath: string;
    displayText: string;
  } => {
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
    return {
      iconPath,
      displayText
    };
  };
  const {
    iconPath,
    displayText
  } = getKpiInfo(kpi);
  return <div className="flex items-center text-[var(--accent-color)] font-medium">
      <div className="mr-2 relative w-5 h-5 flex-shrink-0">
        <Image src={iconPath} alt={displayText} fill className="object-contain blue-icon" style={{
        filter: 'brightness(0) invert(50%) sepia(40%) saturate(1000%) hue-rotate(175deg) brightness(95%) contrast(90%)'
      }} />

      </div>
      <span>{displayText}</span>
    </div>;
};

// Now update the DataItem component to handle KPI display
interface DataItemProps {
  label: string;
  value: string | number | null;
  icon?: JSX.Element;
  featured?: boolean;
  isKPI?: boolean;
  className?: string;
}
const DataItem: React.FC<DataItemProps> = ({
  label,
  value,
  icon,
  featured = false,
  isKPI = false,
  className = ''
}) => {
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
  
  return <div className={`mb-4 ${featured ? 'bg-[rgba(0,191,255,0.05)] p-3 rounded-md' : ''} ${className}`}>
      <div className="flex items-start">
        {icon && <div className="mr-2 mt-0.5 flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          <p className={`text-sm text-[var(--secondary-color)] mb-1 font-medium ${className.includes('text-lg') ? 'text-base' : ''}`}>{label}</p>
          <div className={`font-medium text-[var(--primary-color)] ${featured ? className.includes('text-lg') ? 'text-xl' : 'text-lg' : ''}`}>
        {isKPI ? <KPIDisplay kpi={String(value)} /> : displayValue()}
          </div>
        </div>
      </div>
    </div>;
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
  memorability: string;
  purchaseIntent: string;
  brandPerception: string;
  creativeAssets: CreativeAsset[];
  creativeRequirements: any[];
  // Add missing properties to fix linter errors
  contacts?: Array<Record<string, any>>;
  influencers?: Array<{
    id?: string;
    handle: string;
    name?: string;
    platform?: string;
    followers?: number | string;
    engagement?: string;
    avatarUrl?: string;
    description?: string;
    verified?: boolean; // Add the verified property
    phylloData?: any;   // Add the phylloData property
  }>;

  // Add nested data structures
  overview: Record<string, any>;
  objectives: Record<string, any>;
  audience: AudienceData;
  
  // Add property to store step-specific data for handling different data schemas
  step1?: {
    influencers?: Array<{
      id?: string;
      handle?: string;
      name?: string;
      platform?: string;
      followers?: number | string;
      engagement?: string;
      avatarUrl?: string;
      description?: string;
      verified?: boolean;
      // Support properties from Step1 schema
      influencerHandle?: string;
      username?: string;
      influencerName?: string;
      avatar?: string;
      bio?: string;
    }>;
    [key: string]: any;
  };
  
  // Allow for any other properties that might exist
  [key: string]: any;
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
  memorability: '8/10',
  purchaseIntent: 'Increase purchase intent by 15%',
  brandPerception: 'How the brand is perceived',
  creativeAssets: [{
    id: '1',
    name: 'Demo Asset',
    assetName: 'Demo Asset',
    type: 'image',
    url: '/placeholder.jpg',
    whyInfluencer: 'Selected for reach and engagement',
    budget: 1000,
    description: 'Demo asset description'
  }],
  creativeRequirements: [{
    requirement: 'Must include brand logo'
  }],
  overview: {
    name: 'Demo Campaign',
    description: 'This is a demo campaign with fallback data',
    startDate: '2023-01-01',
    endDate: '2023-12-31'
  },
  objectives: {
    primaryKPI: 'brandAwareness',
    secondaryKPIs: ['adRecall', 'messageAssociation'],
    features: ['CREATIVE_ASSET_TESTING', 'BRAND_LIFT'],
    memorability: '8/10',
    purchaseIntent: 'Increase purchase intent by 15%'
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
    genders: [{
      gender: 'Male'
    }, {
      gender: 'Female'
    }],
    locations: [{
      location: 'London'
    }, {
      location: 'New York'
    }],
    languages: [{
      language: 'English'
    }],
    educationLevel: 'College',
    incomeLevel: '50000',
    jobTitles: ['Designer', 'Developer'],
    screeningQuestions: [{
      question: 'Have you used our product before?'
    }],
    competitors: [{
      competitor: 'Competitor X'
    }],
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
      const whyInfluencerValue = asset.whyInfluencer || asset.description || typeof asset.details === 'object' && asset.details?.whyInfluencer || '';

      // Extract budget with proper type handling
      const budgetValue = typeof asset.budget === 'number' ? asset.budget : typeof asset.budget === 'string' ? parseFloat(asset.budget) : 0;

      // Extract influencer handle with fallbacks
      const influencerHandle = asset.influencerHandle || typeof asset.details === 'object' && asset.details?.influencerHandle || '';
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
      const whyInfluencerValue = asset.whyInfluencer || asset.description || typeof asset.details === 'object' && asset.details?.whyInfluencer || '';
      return {
        ...asset,
        assetName: asset.assetName || asset.name || '',
        name: asset.name || asset.assetName || '',
        description: asset.description || whyInfluencerValue || '',
        whyInfluencer: whyInfluencerValue,
        // Ensure budget is a number
        budget: typeof asset.budget === 'number' ? asset.budget : typeof asset.budget === 'string' ? parseFloat(asset.budget) : 0
      };
    });
  } else if (data.creative && Array.isArray(data.creative.creativeAssets) && data.creative.creativeAssets.length > 0) {
    console.log("Processing assets from creative.creativeAssets array");
    return data.creative.creativeAssets.map((asset: any) => {
      // Extract whyInfluencer with fallbacks
      const whyInfluencerValue = asset.whyInfluencer || asset.description || typeof asset.details === 'object' && asset.details?.whyInfluencer || '';
      return {
        ...asset,
        assetName: asset.assetName || asset.name || '',
        name: asset.name || asset.assetName || '',
        description: asset.description || whyInfluencerValue || '',
        whyInfluencer: whyInfluencerValue,
        // Ensure budget is a number
        budget: typeof asset.budget === 'number' ? asset.budget : typeof asset.budget === 'string' ? parseFloat(asset.budget) : 0
      };
    });
  }
  console.warn("No creative assets found in any expected location");
  return [];
};

// Add a direct fetch function specifically for influencer data
const fetchInfluencerDetails = async (campaignId: string, handle: string, platform: string): Promise<any> => {
  try {
    console.log(`Fetching additional influencer details for ${handle} on ${platform}`);
    // We'll use the same API that Step 1 uses to validate influencers
    const response = await fetch(`/api/influencers/validate?platform=${encodeURIComponent(platform)}&handle=${encodeURIComponent(handle)}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch additional influencer details: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log('Received influencer details:', data);
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching influencer details:', error);
    return null;
  }
};

// Enhance the normalizeApiData function
const normalizeApiData = (data: any): MergedData => {
  // Check which schema type we're dealing with based on field presence
  const isWizardSchema = data.name !== undefined;
  const isSubmissionSchema = data.campaignName !== undefined;
  console.log(`Normalizing API data: isWizardSchema=${isWizardSchema}, isSubmissionSchema=${isSubmissionSchema}`);

  // For debugging
  if (isWizardSchema) console.log('Campaign name from CampaignWizard:', data.name);
  if (isSubmissionSchema) console.log('Campaign name from CampaignWizardSubmission:', data.campaignName);

  // Log influencer data for debugging
  console.log('Raw influencer data:', {
    influencers: data.influencers,
    Influencer: data.Influencer, // Check the prisma relation name
    influencer: data.influencer
  });

  // Enhanced influencer extraction logic
  let influencers = [];
  
  // Check all possible locations for influencer data - log attempts for debugging
  console.log("Checking for influencers in data.influencers:", Array.isArray(data.influencers) ? data.influencers.length : "not an array");
  console.log("Checking for influencers in data.Influencer:", Array.isArray(data.Influencer) ? data.Influencer.length : "not an array");
  console.log("Checking for influencers in data.overview?.influencers:", Array.isArray(data.overview?.influencers) ? data.overview.influencers.length : "not an array");
  console.log("Checking for influencers in data.step1?.influencers:", Array.isArray(data.step1?.influencers) ? data.step1.influencers.length : "not an array");
  
  // Prisma might return the relation as "Influencer" instead of "influencers"
  if (Array.isArray(data.Influencer) && data.Influencer.length > 0) {
    console.log("Found influencers in Prisma relation:", data.Influencer);
    influencers = data.Influencer;
  } else if (Array.isArray(data.influencers) && data.influencers.length > 0) {
    console.log("Found influencers at root level:", data.influencers);
    influencers = data.influencers;
  } else if (data.overview && Array.isArray(data.overview.influencers) && data.overview.influencers.length > 0) {
    console.log("Found influencers in overview:", data.overview.influencers);
    influencers = data.overview.influencers;
  } else if (data.step1 && Array.isArray(data.step1.influencers) && data.step1.influencers.length > 0) {
    console.log("Found influencers in step1:", data.step1.influencers);
    influencers = data.step1.influencers;
  } else if (data.influencer) {
    // Handle single influencer case
    console.log("Found single influencer:", data.influencer);
    influencers = [data.influencer];
  } else {
    console.log("No influencers found in any expected location");
  }
  
  // Normalize the influencer data to the expected format
  const normalizedInfluencers = influencers.map((inf: any) => {
    console.log("Normalizing influencer:", inf);
    
    // Extract the Phyllo API data properties that might be nested
    const phylloData = inf.phylloData || inf.validationData || inf;
    
    return {
      id: inf.id || phylloData.id || `inf-${Math.random().toString(36).substring(2, 9)}`,
      handle: inf.handle || inf.influencerHandle || inf.username || 'unknown',
      name: phylloData.displayName || inf.name || inf.influencerName || inf.handle || 'Unknown Influencer',
      platform: inf.platform || 'Not specified',
      followers: phylloData.followerCount || inf.followers || inf.influencerFollowers || '0',
      engagement: (phylloData.engagementRate ? `${(phylloData.engagementRate * 100).toFixed(2)}%` : inf.engagement) || '0.01%',
      avatarUrl: phylloData.avatarUrl || inf.avatarUrl || inf.avatar || '',
      description: phylloData.description || inf.description || inf.bio || 'No description available.',
      verified: phylloData.verified || false,
      // Preserve the original data
      phylloData: phylloData
    };
  });
  
  console.log("Normalized influencers:", normalizedInfluencers);

  // Continue with extracting other data...
  // ... existing code ...

  // Extract creative assets with our helper function
  const creativeAssets = extractCreativeAssets(data, isWizardSchema);

  // Extract budget data with proper fallbacks
  const budgetData = isWizardSchema && data.budget ? typeof data.budget === 'object' ? data.budget : {
    currency: 'EUR',
    totalBudget: 0,
    socialMediaBudget: 0
  } : {
    currency: data.currency || 'EUR',
    totalBudget: data.totalBudget || 0,
    socialMediaBudget: data.socialMediaBudget || 0
  };

  // Extract audience data with proper fallbacks
  const audienceData = isWizardSchema ? {
    demographics: data.demographics || {},
    locations: Array.isArray(data.locations) ? data.locations : [],
    targeting: data.targeting || {},
    competitors: Array.isArray(data.competitors) ? data.competitors : data.audience?.competitors || []
  } : data.audience || {};
  
  // In the returned object, ensure we include the normalized influencers
  return {
    // Map fields to consistent names, handling both schema types
    campaignName: isWizardSchema ? data.name : data.campaignName,
    description: data.businessGoal || data.description || data.overview?.description || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    timeZone: data.timeZone || '',
    currency: isWizardSchema ? budgetData.currency || 'EUR' : data.currency || 'EUR',
    totalBudget: isWizardSchema ? budgetData.totalBudget || budgetData.total || 0 : data.totalBudget || 0,
    socialMediaBudget: isWizardSchema ? budgetData.socialMediaBudget || budgetData.socialMedia || 0 : data.socialMediaBudget || 0,
    platform: data.platform || '',
    influencerHandle: data.influencerHandle || '',
    // Primary Contact handling for both schemas
    primaryContact: isWizardSchema ? typeof data.primaryContact === 'object' ? data.primaryContact : {} : data.primaryContact || {},
    secondaryContact: isWizardSchema ? typeof data.secondaryContact === 'object' ? data.secondaryContact : {} : data.secondaryContact || {},
    // KPIs and Features
    primaryKPI: data.primaryKPI || '',
    secondaryKPIs: Array.isArray(data.secondaryKPIs) ? data.secondaryKPIs : [],
    features: Array.isArray(data.features) ? data.features : [],
    // Campaign messaging
    mainMessage: isWizardSchema ? data.messaging?.mainMessage || '' : data.mainMessage || '',
    hashtags: isWizardSchema ? data.messaging?.hashtags || '' : data.hashtags || '',
    keyBenefits: isWizardSchema ? data.messaging?.keyBenefits || '' : data.keyBenefits || '',
    expectedAchievements: isWizardSchema ? data.expectedOutcomes?.achievements || '' : data.expectedAchievements || '',
    memorability: isWizardSchema ? data.messaging?.memorability || '' : data.memorability || '',
    purchaseIntent: isWizardSchema ? data.messaging?.purchaseIntent || '' : data.purchaseIntent || '',
    brandPerception: isWizardSchema ? data.expectedOutcomes?.brandPerception || data.brandPerception || '' : data.brandPerception || '',
    // Nested structure for compatibility with the UI
    overview: {
      name: isWizardSchema ? data.name : data.campaignName,
      description: data.description || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      timeZone: data.timeZone || '',
      currency: isWizardSchema ? budgetData.currency || 'EUR' : data.currency || 'EUR',
      totalBudget: isWizardSchema ? budgetData.totalBudget || budgetData.total || 0 : data.totalBudget || 0,
      socialMediaBudget: isWizardSchema ? budgetData.socialMediaBudget || budgetData.socialMedia || 0 : data.socialMediaBudget || 0,
      primaryContact: isWizardSchema ? typeof data.primaryContact === 'object' ? data.primaryContact : {} : data.primaryContact || {}
    },
    objectives: {
      primaryKPI: data.primaryKPI || '',
      secondaryKPIs: Array.isArray(data.secondaryKPIs) ? data.secondaryKPIs : [],
      features: Array.isArray(data.features) ? data.features : [],
      mainMessage: isWizardSchema ? data.messaging?.mainMessage || '' : data.mainMessage || '',
      hashtags: isWizardSchema ? data.messaging?.hashtags || '' : data.hashtags || '',
      keyBenefits: isWizardSchema ? data.messaging?.keyBenefits || '' : data.keyBenefits || '',
      expectedAchievements: isWizardSchema ? data.expectedOutcomes?.achievements || '' : data.expectedAchievements || '',
      memorability: isWizardSchema ? data.messaging?.memorability || '' : data.memorability || '',
      purchaseIntent: isWizardSchema ? data.messaging?.purchaseIntent || '' : data.purchaseIntent || ''
    },
    audience: isWizardSchema ? {
      demographics: audienceData.demographics || {},
      locations: audienceData.locations || [],
      targeting: audienceData.targeting || {},
      competitors: Array.isArray(audienceData.competitors) ? audienceData.competitors.map((comp: any) => {
        if (typeof comp === 'string') return {
          competitor: comp
        };
        return comp;
      }) : [],
      // Process demographics for better UI compatibility
      genders: Array.isArray(audienceData.demographics?.gender) ? audienceData.demographics?.gender.map((g: any) => ({
        gender: g
      })) : [],
      jobTitles: Array.isArray(audienceData.demographics?.jobTitles) ? audienceData.demographics?.jobTitles : typeof audienceData.demographics?.jobTitles === 'string' ? audienceData.demographics.jobTitles ? JSON.parse(audienceData.demographics.jobTitles) : [] : [],
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
      location: Array.isArray(audienceData.locations) ? audienceData.locations.map((loc: any) => ({
        location: typeof loc === 'string' ? loc : loc.name || loc.location || ''
      })) : [],
      languages: Array.isArray(audienceData.targeting?.languages) ? audienceData.targeting.languages.map((lang: any) => ({
        language: typeof lang === 'string' ? lang : lang.language || ''
      })) : []
    } : data.audience || {},
    // Using our extracted creativeAssets
    creativeAssets: creativeAssets,
    creativeRequirements: Array.isArray(data.creativeRequirements) ? data.creativeRequirements : isWizardSchema && Array.isArray(data.requirements) ? data.requirements.map((req: any) => ({
      requirement: req
    })) : [],
    contacts: data.contacts || [],
    // Use our normalized influencers
    influencers: normalizedInfluencers,
    // Preserve step1 data if it exists for later reference
    ...(data.step1 ? { step1: data.step1 } : {})
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
      maximumFractionDigits: 0
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
  className?: string;
}

// Fix the FeatureIcon component to properly display the app icons
const FeatureIcon: React.FC<FeatureIconProps> = ({
  feature,
  className = ""
}) => {
  const normalizedFeature = feature.toLowerCase();
  let iconPath = '';
  const altText = formatFeature(feature);

  // Map feature to icon path - ensure we include the /app/ prefix
  if (normalizedFeature.includes('brand_health') || normalizedFeature.includes('brandhealth')) {
    iconPath = '/app/Brand_Health.svg';
  } else if (normalizedFeature.includes('brand_lift') || normalizedFeature.includes('brandlift')) {
    iconPath = '/app/Brand_Lift.svg';
  } else if (normalizedFeature.includes('creative_asset_testing') || normalizedFeature.includes('creativeasset')) {
    iconPath = '/app/Creative_Asset_Testing.svg';
  } else if (normalizedFeature.includes('mixed_media_modelling') || normalizedFeature.includes('mmm')) {
    iconPath = '/app/MMM.svg';
  } else if (normalizedFeature.includes('influencer')) {
    iconPath = '/app/Influencers.svg';
  } else if (normalizedFeature.includes('reports') || normalizedFeature.includes('reporting')) {
    iconPath = '/app/Reports.svg';
  } else {
    iconPath = '/app/Campaigns.svg'; // Default icon
  }
  
  return <div className="flex items-center">
    <div className="w-5 h-5 mr-2 flex-shrink-0">
      <Image 
        src={iconPath} 
        alt={altText} 
        width={20}
        height={20}
        className="object-contain"
      />
      </div>
      <span>{altText}</span>
    </div>;
};

// Custom Asset Preview component for Step 5 (with play/pause controls)
const Step5AssetPreview = ({
  url,
  fileName,
  type,
  className = ''
}: {
  url: string;
  fileName: string;
  type: string;
  className?: string;
}) => {
  const isVideo = type === 'video' || typeof type === 'string' && type.includes('video');
  const isImage = type === 'image' || typeof type === 'string' && type.includes('image');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Toggle play/pause when the button is clicked or video area is clicked
  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .catch(error => {
          console.warn('Play was prevented:', error);
        });
      setIsPlaying(true);
    }
  };

  // Update play state based on video events
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const video = videoRef.current;
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      
      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [isVideo]);

  // Effect to handle video autoplay and looping
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      // Auto-play the video when component mounts
      const playVideo = () => {
        video.play().catch(error => {
          console.warn('Auto-play was prevented:', error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      };

      // Handle video looping - restart after 5 seconds or when ended
      const handleTimeUpdate = () => {
        if (video.currentTime >= 5) {
          video.currentTime = 0;
          if (isPlaying) {
          video.play().catch(err => {
            console.error('Error replaying video:', err);
              setIsPlaying(false);
          });
          }
        }
      };
      
      const handleEnded = () => {
        video.currentTime = 0;
        if (isPlaying) {
        video.play().catch(err => {
          console.error('Error replaying video:', err);
            setIsPlaying(false);
        });
        }
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
  }, [isVideo, url, isPlaying]);
  
  return (
    <div 
      className={`relative rounded-lg overflow-hidden bg-gray-100 ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image preview */}
      {isImage && <img src={url} alt={fileName} className="w-full h-full object-cover" />}
      
      {/* Video preview with play/pause button */}
      {isVideo && (
        <div className="relative w-full h-full" onClick={togglePlayPause}>
          <video 
            ref={videoRef} 
            src={url} 
            className="w-full h-full object-cover" 
            muted 
            playsInline 
            loop 
          />
          
          {/* Play/Pause button that appears on hover */}
          {isVideo && isHovering && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity duration-200">
              <button
                onClick={togglePlayPause}
                className="w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all duration-200 z-10 absolute"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                <Icon 
                  name={isPlaying ? "faPause" : "faPlay"} 
                  className="h-6 w-6 text-white" 
                  iconType="button" 
                  solid={true} 
                />
              </button>
            </div>
          )}
          
          {/* Video label in bottom corner if we want to add it */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            <Icon name="faVideo" className="h-3 w-3 mr-1 inline-block" iconType="static" solid={true} />
            Video
          </div>
        </div>
      )}
      
      {/* Fallback for unsupported file types */}
      {!isImage && !isVideo && (
        <div className="flex items-center justify-center p-8">
          <Icon name="faInfo" className="h-12 w-12 text-gray-400" iconType="static" solid={false} />
        </div>
      )}
    </div>
  );
};

// Helper function to calculate duration between dates
const calculateDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    return `${weeks} week${weeks > 1 ? 's' : ''}${days ? ` and ${days} day${days > 1 ? 's' : ''}` : ''}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return `${months} month${months > 1 ? 's' : ''}${days ? ` and ${days} day${days > 1 ? 's' : ''}` : ''}`;
  }
  const years = Math.floor(diffDays / 365);
  const days = diffDays % 365;
  return `${years} year${years > 1 ? 's' : ''}${days ? ` and ${days} day${days > 1 ? 's' : ''}` : ''}`;
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
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

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
    if (!data?.creativeAssets || Array.isArray(data.creativeAssets) && data.creativeAssets.length === 0) missingKeys.push('creativeAssets');

    // Log validation issues but don't block submission
    if (missingKeys.length > 0) {
      console.warn(`NOTE: Some campaign data is missing (${missingKeys.join(', ')}), but submission will be allowed for testing.`);
    }

    // No validation messages will be set, allowing submission to proceed
  };

  // Add a type-safe check for properties
  const enhanceNormalizeApiData = (data: any): MergedData => {
    const baseData = normalizeApiData(data);
    
    // Check if we should add the step1 property for later use - only if it exists in source data
    if (data?.step1) {
      baseData.step1 = data.step1;
    }
    
    return baseData;
  };

  // Update the displayData useMemo to use the normalizeApiData function
  const displayData = useMemo(() => {
    // If we have explicit campaign data from API, use it first
    if (campaignData && Object.keys(campaignData).length > 0) {
      console.log("Using campaign data from direct API fetch");
      return enhanceNormalizeApiData(campaignData);
    }

    // Otherwise fall back to context data if available
    if (contextData && Object.keys(contextData).length > 0) {
      console.log("Using campaign data from WizardContext");
      // Convert context data to the expected shape with safeguards
      return enhanceNormalizeApiData(contextData);
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
  const hasMinimalData = useMemo(() => {
    return Boolean(displayData && Object.keys(displayData).length > 0 && (displayData.campaignName || displayData.overview && displayData.overview.name));
  }, [displayData]);
  
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
          setCampaignData({
            ...contextData
          } as unknown as Record<string, any>);
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
  }, [campaignId, reloadCampaignData, contextData]);
  
  // Validate when we have data
  useEffect(() => {
    if (displayData && Object.keys(displayData).length > 0) {
      validateCampaignData(displayData);
    }
  }, [displayData]);

  // In the Step5Content function, update the useEffect that handles influencer data
  useEffect(() => {
    if (displayData) {
      // Log all possible influencer data locations for debugging
      console.log('Root influencers:', displayData.influencers);
      console.log('Step1 influencers:', displayData?.step1?.influencers);
      console.log('Overview influencers:', displayData?.overview?.influencers);
      
      // If no influencers found but campaign ID exists, try to fetch them directly
      if ((!displayData.influencers || !Array.isArray(displayData.influencers) || displayData.influencers.length === 0) && campaignId) {
        console.log('No influencers found in display data, attempting to fetch directly');
        
        // Make an API call specifically for Step 1 data which contains the influencers
        const fetchStep1Data = async () => {
          try {
            const response = await fetch(`/api/campaigns/${campaignId}/wizard/1`, {
              headers: {
                'Cache-Control': 'no-cache'
              }
            });
            
            if (!response.ok) {
              console.warn('Failed to fetch Step 1 data');
              return;
            }
            
            const result = await response.json();
            if (result.success && result.data && Array.isArray(result.data.influencers)) {
              console.log('Successfully fetched Step 1 influencers:', result.data.influencers);
              
              // Transform the influencers
              const enhancedInfluencers = await Promise.all(result.data.influencers.map(async (inf: any) => {
                // Try to fetch additional details for each influencer
                let additionalData = null;
                if (inf.platform && inf.handle) {
                  additionalData = await fetchInfluencerDetails(campaignId, inf.handle, inf.platform);
                }
                
                return {
                  id: inf.id || `inf-${Math.random().toString(36).substring(2, 9)}`,
                  handle: inf.handle,
                  name: additionalData?.displayName || inf.name || inf.handle || 'Unknown Influencer',
                  platform: inf.platform || 'Not specified',
                  followers: additionalData?.followerCount || inf.followers || '0',
                  engagement: (additionalData?.engagementRate ? `${(additionalData.engagementRate * 100).toFixed(2)}%` : inf.engagement) || '0.01%',
                  avatarUrl: additionalData?.avatarUrl || inf.avatarUrl || '',
                  description: additionalData?.description || inf.description || 'No description available.',
                  verified: additionalData?.verified || false
                };
              }));
              
              // Update the campaign data
              setCampaignData(prev => ({
                ...prev,
                influencers: enhancedInfluencers
              }));
            }
          } catch (error) {
            console.error('Error fetching Step 1 data:', error);
          }
        };
        
        fetchStep1Data();
      }
      // If influencer data exists but is minimal, enhance it
      else if (displayData.influencers && Array.isArray(displayData.influencers) && displayData.influencers.length > 0) {
        // Check if we need to transform the data (missing expected fields)
        const enhancedInfluencers = displayData.influencers.map((inf: any) => {
          // Only enhance if the data is minimal
          if (inf.platform && inf.handle && (!inf.name || !inf.followers || !inf.avatarUrl)) {
            return {
              id: inf.id || `inf-${Math.random().toString(36).substring(2, 9)}`,
              handle: inf.handle,
              name: inf.name || inf.handle || 'Unknown Influencer',
              platform: inf.platform || 'Not specified',
              followers: inf.followers || '0',
              engagement: inf.engagement || '0.01%',
              avatarUrl: inf.avatarUrl || '',
              description: inf.description || 'No description available.'
            };
          }
          return inf; // Return unchanged if already enriched
        });
        
        // Update campaign data with enhanced influencers if they were modified
        const needsUpdate = enhancedInfluencers.some((inf, idx) => {
          const original = displayData.influencers?.[idx];
          return original && (inf.name !== original.name || inf.followers !== original.followers || inf.avatarUrl !== original.avatarUrl);
        });
        
        if (needsUpdate) {
          console.log('Updating influencer data with enhanced values:', enhancedInfluencers);
          setCampaignData(prev => ({
            ...prev,
            influencers: enhancedInfluencers
          }));
        }
      }
    }
  }, [displayData, campaignId]);

  if (!isClientSide) {
    return <WizardSkeleton step={5} />;
  }

  // Navigate to edit a specific step
  const navigateToStep = (step: number) => {
    router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`);
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
          'Content-Type': 'application/json'
        }
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
      toast.error(error instanceof Error ? `Failed to submit campaign: ${error.message}` : "Failed to submit campaign due to an unknown error");
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionStatus: 'draft'
        })
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
    return <div className="flex items-center justify-center min-h-screen">
        <WizardSkeleton step={5} />
      </div>;
  }
  if (error) {
    // Special handling for "not found" errors
    const isNotFoundError = typeof error === 'string' && (error.includes("404 Not Found") || error.includes("not found"));
    return <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Campaign</h3>
        <p className="text-red-600 mb-4">{String(error)}</p>
        
        {/* Add a reset button to clear any cached state */}
        <button onClick={handleReset} className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">

          Reset Cache & Reload
        </button>
        
        {isNotFoundError ? <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h4 className="text-lg font-medium mb-3">Campaign Not Found</h4>
            <p className="mb-4">
              The campaign with ID {campaignId} couldn't be found in the database. It may have been deleted or never existed.
            </p>
            <div className="flex flex-col space-y-4">
              <Link href="/campaigns" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 w-full md:w-auto">

                View All Campaigns
              </Link>
              
              <Link href="/campaigns/wizard/step-1" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full md:w-auto">

                Create New Campaign
              </Link>
            </div>
          </div> : <div className="bg-red-100 p-4 rounded-md mb-4">
            <h4 className="font-medium mb-2">Debugging Information:</h4>
            <p className="text-sm">Campaign ID: {campaignId || 'Not provided'}</p>
            <p className="text-sm">Data loaded: {Object.keys(contextData || {}).length > 0 ? 'Yes, from context' : 'No'}</p>
            <p className="text-sm">Direct API data loaded: {Object.keys(campaignData || {}).length > 0 ? 'Yes' : 'No'}</p>
            <p className="text-sm">Fetch attempts: {fetchAttempts}</p>
            <p className="text-sm">Error type: {error.includes("API Error") ? "API Response Error" : error.includes("fetch") ? "Network Error" : "Other Error"}</p>
            
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
          </div>}
        
        <div className="flex space-x-3">
          <button onClick={() => {
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
        }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">

            Try Again
          </button>
          <button onClick={() => router.push('/campaigns')} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50">

            Return to Campaigns
          </button>
          
          {/* Add a button to manually test the API */}
          <button onClick={async () => {
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
        }} className="px-4 py-2 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-md hover:bg-yellow-100">

            Test API Endpoint
          </button>
        </div>
      </div>;
  }
  return <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      {/* Add Reset Button at top when we have campaign ID but no/minimal data */}
      {campaignId && (!hasMinimalData || error) && <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-medium text-blue-800 mb-2">Having trouble viewing this campaign?</h3>
          <p className="text-blue-700 mb-3">
            {!hasMinimalData ? "Campaign data is not loading properly. You can try resetting the page cache." : "Some campaign data may be missing. You can try resetting to reload all data."}
          </p>
          <button onClick={handleReset} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">

            Reset & Reload Page
          </button>
        </div>}

      {/* Warning if we have some data but it's incomplete */}
      {hasMinimalData && Object.keys(displayData).length < 5 && !error && <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Limited Campaign Data</h3>
          <p className="text-yellow-700 mb-3">
            We found some basic information for this campaign, but detailed data might be missing.
          </p>
        </div>}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--primary-color)] mb-1">Campaign Creation</h1>
        <p className="text-[var(--secondary-color)]">Review your campaign details and submit</p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Campaign Details */}
        <SummarySection title="Campaign Details" stepNumber={1} onEdit={() => navigateToStep(1)}>
          {/* Basic Information Section */}
              <h3 className="font-medium text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="space-y-4">
                <DataItem 
                  label="Campaign Name" 
                  value={displayData.campaignName || 'Not specified'} 
                  icon={
                    <div className="relative mr-3">
                      <Image 
                        src="/app/Campaigns.svg" 
                        alt="Campaigns" 
                        width={22} 
                        height={22} 
                        className="filter brightness-0"
                        style={{ filter: 'invert(32%) sepia(9%) saturate(1265%) hue-rotate(182deg) brightness(91%) contrast(88%)' }}
                      />
                    </div>
                  }
                  featured={true} 
                  className="text-lg p-4 border-l-4 border-[var(--accent-color)] bg-[rgba(0,191,255,0.08)]"
                />
                
                <DataItem 
                  label="Business Goal for this Campaign" 
                  value={displayData.description || 'Not specified'} 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <DataItem label="Start Date" value={displayData.startDate ? formatDate(displayData.startDate) : 'Not specified'} icon={<Icon name="faCalendar" className="h-4 w-4 text-[var(--secondary-color)] mr-2" iconType="static" solid={false} />} />
                  
                  <DataItem label="End Date" value={displayData.endDate ? formatDate(displayData.endDate) : 'Not specified'} icon={<Icon name="faCalendar" className="h-4 w-4 text-[var(--secondary-color)] mr-2" iconType="static" solid={false} />} />
                </div>

                {displayData.startDate && displayData.endDate && (
                  <div className="mt-3 text-sm text-[var(--primary-color)] bg-blue-50 p-2 rounded">
                    <div className="flex items-start">
                      <Icon name="faCircleInfo" className="w-4 h-4 mr-3 mt-0.5 text-[var(--accent-color)]" iconType="static" solid={false} />
                      <span className="flex-1">Campaign Duration: {calculateDuration(displayData.startDate, displayData.endDate)}</span>
                </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Budget Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="font-medium text-gray-800 mb-4">Budget Information</h3>
              
              <div className="space-y-4">
                <DataItem label="Currency" value={displayData.currency || 'USD'} icon={<Icon name="faMoneyBill" className="h-4 w-4 text-[var(--secondary-color)] mr-2" iconType="static" solid={false} />} />
                
                <DataItem label="Total Budget" value={formatCurrency(displayData.totalBudget, displayData.currency)} icon={<Icon name="faMoneyBill" className="h-4 w-4 text-[var(--secondary-color)] mr-2" iconType="static" solid={false} />} featured={true} />
                
                <DataItem label="Social Media Budget" value={formatCurrency(displayData.socialMediaBudget, displayData.currency)} icon={<Icon name="faMoneyBill" className="h-4 w-4 text-[var(--secondary-color)] mr-2" iconType="static" solid={false} />} />
              </div>
            </div>
          </div>
          
          {/* Contact Information Section */}
          <h3 className="font-medium text-gray-800 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Primary Contact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="font-medium text-gray-800 mb-4">Primary Contact</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Icon name="faUser" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 mb-1 block">Name</span>
                    <span className="text-base text-gray-800 block font-medium">
                      {`${displayData.primaryContact?.firstName || ''} ${displayData.primaryContact?.surname || displayData.primaryContact?.lastName || ''}`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Icon name="faEnvelope" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 mb-1 block">Email</span>
                    <span className="text-base text-gray-800 block font-medium">
                      {displayData.primaryContact?.email || 'Not specified'}
                    </span>
              </div>
            </div>
                
                <div className="flex items-start">
                  <Icon name="faBuilding" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 mb-1 block">Position</span>
                    <span className="text-base text-gray-800 block font-medium">
                      {displayData.primaryContact?.position || 'Not specified'}
                    </span>
          </div>
                </div>
              </div>
            </div>
            
            {/* Secondary Contact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="font-medium text-gray-800 mb-4">Secondary Contact <span className="text-sm font-normal text-[var(--secondary-color)] ml-2 font-work-sans">(Optional)</span></h3>
              
              {displayData.secondaryContact?.firstName || displayData.secondaryContact?.email ? (
              <div className="space-y-4">
                  <div className="flex items-start">
                    <Icon name="faUser" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                    <div className="flex-1">
                      <span className="text-sm text-gray-500 mb-1 block">Name</span>
                      <span className="text-base text-gray-800 block font-medium">
                        {`${displayData.secondaryContact?.firstName || ''} ${displayData.secondaryContact?.surname || displayData.secondaryContact?.lastName || ''}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Icon name="faEnvelope" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                    <div className="flex-1">
                      <span className="text-sm text-gray-500 mb-1 block">Email</span>
                      <span className="text-base text-gray-800 block font-medium">
                        {displayData.secondaryContact?.email || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Icon name="faBuilding" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                    <div className="flex-1">
                      <span className="text-sm text-gray-500 mb-1 block">Position</span>
                      <span className="text-base text-gray-800 block font-medium">
                        {displayData.secondaryContact?.position || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic">No secondary contact added</div>
              )}
            </div>
          </div>
          
          {/* Influencer Details Section */}
          <h3 className="font-medium text-gray-800 mb-4">Influencer Details</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="font-medium text-gray-800 mb-4">Influencers</h3>
            
            {displayData.influencers && Array.isArray(displayData.influencers) && displayData.influencers.length > 0 ? (
              <div className="space-y-6">
                {displayData.influencers.map((influencer, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-4 bg-gradient-to-r from-[rgba(0,191,255,0.1)] to-white border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800 flex items-center">
                          <span className="bg-[var(--accent-color)] text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">{index + 1}</span>
                          Influencer #{index + 1}
                        </h4>
                        {influencer.verified && (
                          <span className="inline-flex items-center text-blue-500 bg-blue-50 px-2 py-1 rounded-full text-sm">
                            <Icon name="faCheck" className="h-3 w-3 mr-1" iconType="static" solid={true} />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden mr-5 flex-shrink-0 border-2 border-[var(--accent-color)]">
                          {influencer.avatarUrl ? (
                            <img src={influencer.avatarUrl} alt={influencer.handle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)]">
                              <Icon name="faUser" className="h-10 w-10" iconType="static" solid={false} />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-semibold text-gray-800 text-lg mb-1">{influencer.name || influencer.handle}</p>
                          <p className="text-[var(--accent-color)] mb-2 font-medium">@{influencer.handle}</p>
                          <div className="flex flex-col space-y-1">
                            {influencer.followers && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <Icon name="faUsers" className="h-3.5 w-3.5 mr-1.5 text-[var(--secondary-color)]" iconType="static" solid={false} />
                                {typeof influencer.followers === 'number' 
                                  ? `${new Intl.NumberFormat().format(influencer.followers)} followers` 
                                  : influencer.followers}
                              </p>
                            )}
                            {influencer.engagement && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <Icon name="faChartLine" className="h-3.5 w-3.5 mr-1.5 text-[var(--secondary-color)]" iconType="static" solid={false} />
                                {influencer.engagement} engagement
                              </p>
                            )}
                    </div>
                  </div>
                </div>

                      <div className="space-y-4 flex flex-col justify-center">
                        <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                          {/* Platform icon based on platform name */}
                          <div className="h-10 w-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center mr-3 flex-shrink-0">
                            <img 
                              src={
                                (influencer.platform || '').toLowerCase().includes('instagram') ? '/ui-icons/brands/instagram.svg' :
                                (influencer.platform || '').toLowerCase().includes('facebook') ? '/ui-icons/brands/facebook.svg' :
                                (influencer.platform || '').toLowerCase().includes('twitter') || (influencer.platform || '').toLowerCase().includes('x') ? '/ui-icons/brands/x-twitter.svg' :
                                (influencer.platform || '').toLowerCase().includes('tiktok') ? '/ui-icons/brands/tiktok.svg' :
                                (influencer.platform || '').toLowerCase().includes('youtube') ? '/ui-icons/brands/youtube.svg' :
                                (influencer.platform || '').toLowerCase().includes('linkedin') ? '/ui-icons/brands/linkedin.svg' :
                                (influencer.platform || '').toLowerCase().includes('pinterest') ? '/ui-icons/brands/pinterest.svg' :
                                (influencer.platform || '').toLowerCase().includes('reddit') ? '/ui-icons/brands/reddit.svg' :
                                (influencer.platform || '').toLowerCase().includes('github') ? '/ui-icons/brands/github.svg' :
                                '/ui-icons/brands/instagram.svg' // Default to Instagram if unknown
                              } 
                              alt={`${influencer.platform || 'Social'} platform`}
                              className="h-5 w-5 brightness-0 invert" // Apply filter to make icon white
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm text-gray-500 block">Platform</span>
                            <span className="text-base text-gray-800 font-medium block">
                              {influencer.platform || 'Not specified'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Only show description if it exists and isn't the default "No description available" */}
                        {influencer.description && !influencer.description.includes('No description available') && (
                          <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                            <div className="h-10 w-10 rounded-full bg-[var(--accent-color)] bg-opacity-10 flex items-center justify-center mr-3 flex-shrink-0">
                              <Icon name="faInfoCircle" className="h-5 w-5 text-[var(--accent-color)]" iconType="static" solid={false} />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm text-gray-500 block">Description</span>
                              <span className="text-base text-gray-800 block line-clamp-2">{influencer.description}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                      </div>
                    ))}
                  </div>
            ) : (
              // Show loading state if influencers might be loading
              isLoading ? (
                <div className="bg-gray-50 p-6 rounded-md text-center">
                  <div className="mb-3 animate-spin">
                    <Icon name="faCircleNotch" className="h-10 w-10 text-gray-400 mx-auto" iconType="static" solid={false} />
                </div>
                  <p className="text-gray-600 mb-2">Loading influencer data...</p>
                </div>
              ) : (
                // Show message when no influencers found
                <div className="bg-gray-50 p-8 rounded-md text-center">
                  <div className="mb-4 bg-gray-100 p-4 rounded-full inline-flex items-center justify-center">
                    <Icon name="faUserGroup" className="h-12 w-12 text-[var(--accent-color)] opacity-70" iconType="static" solid={false} />
                  </div>
                  <p className="text-gray-700 font-medium mb-3">No influencers added to this campaign yet.</p>
                  <p className="text-gray-500 mb-4">Add influencers to better track and manage your campaign's reach.</p>
                  <button 
                    onClick={() => navigateToStep(1)} 
                    className="px-5 py-2.5 bg-[var(--accent-color)] text-white rounded-md hover:bg-[var(--accent-color)]/90 transition-colors inline-flex items-center font-medium"
                  >
                    <Icon name="faPlus" className="h-4 w-4 mr-2" iconType="static" solid={false} />
                    Add Influencers in Step 1
                  </button>
                </div>
              )
            )}
          </div>
        </SummarySection>

        {/* Step 2: Objectives & Messaging */}
        <SummarySection title="Objectives & Messaging" stepNumber={2} onEdit={() => navigateToStep(2)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Objectives */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="font-medium text-gray-800 mb-4">Objectives</h3>
              
              {/* Primary KPI */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Primary KPI</label>
                {displayData.primaryKPI ? (
                  <div className="bg-[var(--accent-color)] text-white px-3 py-1.5 rounded-md inline-flex items-center">
                    <div className="w-5 h-5 mr-2 filter brightness-0 invert">
                      <Image 
                        src={`/KPIs/${displayData.primaryKPI === 'adRecall' ? 'Ad_Recall' : 
                                displayData.primaryKPI === 'brandAwareness' ? 'Brand_Awareness' : 
                                displayData.primaryKPI === 'consideration' ? 'Consideration' : 
                                displayData.primaryKPI === 'messageAssociation' ? 'Message_Association' : 
                                displayData.primaryKPI === 'brandPreference' ? 'Brand_Preference' : 
                                displayData.primaryKPI === 'purchaseIntent' ? 'Purchase_Intent' : 
                                displayData.primaryKPI === 'actionIntent' ? 'Action_Intent' : 
                                displayData.primaryKPI === 'recommendationIntent' ? 'Recommendation_Intent' : 
                                displayData.primaryKPI === 'advocacy' ? 'Advocacy' : 'Brand_Awareness'}.svg`} 
                        alt={formatKPI(displayData.primaryKPI)}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                    <span>{displayData.primaryKPI === 'adRecall' ? 'Ad Recall' : 
                          displayData.primaryKPI === 'brandAwareness' ? 'Brand Awareness' : 
                          displayData.primaryKPI === 'consideration' ? 'Consideration' : 
                          displayData.primaryKPI === 'messageAssociation' ? 'Message Association' : 
                          displayData.primaryKPI === 'brandPreference' ? 'Brand Preference' : 
                          displayData.primaryKPI === 'purchaseIntent' ? 'Purchase Intent' : 
                          displayData.primaryKPI === 'actionIntent' ? 'Action Intent' : 
                          displayData.primaryKPI === 'recommendationIntent' ? 'Recommendation Intent' : 
                          displayData.primaryKPI === 'advocacy' ? 'Advocacy' : 
                          formatKPI(displayData.primaryKPI)}</span>
                  </div>
                ) : (
                  <div className="text-gray-500">None selected</div>
                )}
                </div>

              {/* Secondary KPIs */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Secondary KPIs</label>
                <div className="flex flex-wrap gap-2">
                  {displayData.secondaryKPIs && displayData.secondaryKPIs.length > 0 ? (
                    displayData.secondaryKPIs.map((kpi, index) => (
                      <div key={index} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md inline-flex items-center">
                        <div className="w-5 h-5 mr-2">
                          <Image 
                            src={`/KPIs/${kpi === 'adRecall' ? 'Ad_Recall' : 
                                  kpi === 'brandAwareness' ? 'Brand_Awareness' : 
                                  kpi === 'consideration' ? 'Consideration' : 
                                  kpi === 'messageAssociation' ? 'Message_Association' : 
                                  kpi === 'brandPreference' ? 'Brand_Preference' : 
                                  kpi === 'purchaseIntent' ? 'Purchase_Intent' : 
                                  kpi === 'actionIntent' ? 'Action_Intent' : 
                                  kpi === 'recommendationIntent' ? 'Recommendation_Intent' : 
                                  kpi === 'advocacy' ? 'Advocacy' : 'Brand_Awareness'}.svg`} 
                            alt={formatKPI(kpi)}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                      </div>
                        <span>{kpi === 'adRecall' ? 'Ad Recall' : 
                              kpi === 'brandAwareness' ? 'Brand Awareness' : 
                              kpi === 'consideration' ? 'Consideration' : 
                              kpi === 'messageAssociation' ? 'Message Association' : 
                              kpi === 'brandPreference' ? 'Brand Preference' : 
                              kpi === 'purchaseIntent' ? 'Purchase Intent' : 
                              kpi === 'actionIntent' ? 'Action Intent' : 
                              kpi === 'recommendationIntent' ? 'Recommendation Intent' : 
                              kpi === 'advocacy' ? 'Advocacy' : 
                              formatKPI(kpi)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">None selected</div>
                  )}
                  </div>
                </div>

              {/* Features */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Features</label>
                <div className="flex flex-wrap gap-2">
                  {displayData.features && displayData.features.length > 0 ? (
                    displayData.features.map((feature: string, index: number) => (
                      <div key={index} className="inline-flex items-center p-2 bg-gray-50 rounded-md">
                        <FeatureIcon feature={feature} className="flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No features selected</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Messaging */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="space-y-6">
                <h3 className="font-medium text-gray-800 mb-4">Messaging</h3>
                
                {/* Main Message */}
                <div className="flex items-start">
                  <Icon name="faCommentDots" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 mb-1 block">Main Message</span>
                    <span className="text-base text-gray-800 block">
                      {displayData.mainMessage || displayData?.objectives?.mainMessage || 'Not specified'}
                    </span>
                  </div>
                </div>
                
                {/* Hashtags */}
                <div className="flex items-start">
                  <Icon name="faTag" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 mb-1 block">Hashtags</span>
                    <span className="text-base text-gray-800 block">
                      {displayData.hashtags || displayData?.objectives?.hashtags || 'Not specified'}
                    </span>
                  </div>
                </div>
                
                {/* Memorability Score */}
                <div className="flex items-start">
                  <Icon name="faStar" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 mb-1 block">Memorability Score</span>
                    <span className="text-base text-gray-800 block">
                      {displayData.memorability || displayData?.objectives?.memorability || 'Not specified'}
                    </span>
                  </div>
                </div>
                
                {/* Key Benefits */}
                <div className="flex items-start">
                  <Icon name="faCircleCheck" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 mb-1 block">Key Benefits</span>
                    <span className="text-base text-gray-800 block">
                      {displayData.keyBenefits || displayData?.objectives?.keyBenefits || 'Not specified'}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-800 mb-4 mt-8">Expected Outcomes</h3>
                
                {/* Expected Achievements */}
                <div className="flex items-start">
                  <Icon name="faArrowTrendUp" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 mb-1 block">Expected Achievements</span>
                    <span className="text-base text-gray-800 block">
                      {displayData.expectedAchievements || displayData?.objectives?.expectedAchievements || 'Not specified'}
                    </span>
                  </div>
                </div>
                
                {/* Impact on Purchase Intent */}
                <div className="flex items-start">
                  <Icon name="faDollarSign" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 mb-1 block">Impact on Purchase Intent</span>
                    <span className="text-base text-gray-800 block">
                      {displayData.purchaseIntent || displayData?.objectives?.purchaseIntent || 'Not specified'}
                    </span>
                  </div>
                </div>
                
                {/* Brand Perception Change */}
                <div className="flex items-start">
                  <Icon name="faChartBar" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" iconType="static" solid={false} />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 mb-1 block">Brand Perception Change</span>
                    <span className="text-base text-gray-800 block">
                      {displayData.brandPerception || displayData?.objectives?.brandPerception || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SummarySection>

        {/* Step 3: Audience & Competitors */}
        <SummarySection title="Audience Targeting" stepNumber={3} onEdit={() => navigateToStep(3)}>
          {displayData.audience || displayData?.audience ? (
            <div className="space-y-6">
              {/* Demographics Section */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start mb-4">
                  <Icon name="faUser" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5" iconType="static" solid={false} />
                  <h3 className="font-medium text-gray-800">Demographics</h3>
                </div>

                {/* Age Range */}
                <div className="mb-5">
                  <h4 className="text-gray-700 font-medium mb-3 text-sm">Age Range</h4>
                  <div className="grid grid-cols-6 gap-1">
                    {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((range, index) => {
                  // Check if this age range is selected
                  const ageKey = range === '65+' ? 'age65plus' : `age${range.replace('-', '')}`;
                      const percentage = displayData.audience && displayData.audience[ageKey as keyof typeof displayData.audience] 
                                       ? Number(displayData.audience[ageKey as keyof typeof displayData.audience]) 
                                       : 0;
                      return (
                        <div key={range} className={`text-center py-1.5 text-xs rounded ${percentage > 0 ? 'bg-[var(--accent-color)] text-white font-medium' : 'bg-gray-100 text-gray-500'}`}>
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
                    {displayData.audience?.genders && Array.isArray(displayData.audience.genders) && displayData.audience.genders.length > 0 ? (
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
                <div className="flex items-start mb-4">
                  <Icon name="faMap" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5" iconType="static" solid={false} />
                  <h3 className="font-medium text-gray-800">Location</h3>
                </div>

                {/* Locations */}
                <div className="mb-5">
                  <h4 className="text-gray-700 font-medium mb-3 text-sm">Locations</h4>
                  <div className="flex flex-wrap gap-2">
                    {displayData.audience?.locations && Array.isArray(displayData.audience.locations) && displayData.audience.locations.length > 0 ? (
                      displayData.audience.locations.map((l: any, idx: number) => (
                        <span key={idx} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                          {typeof l === 'string' ? l : l.location || l.name || ''}
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
                    {displayData.audience?.languages && Array.isArray(displayData.audience.languages) && displayData.audience.languages.length > 0 ? (
                      displayData.audience.languages.map((l: any, idx: number) => (
                        <span key={idx} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                          {typeof l === 'string' ? l : l.language || l.toString()}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">Not specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Screening Questions */}
              {displayData.audience?.screeningQuestions && Array.isArray(displayData.audience.screeningQuestions) && displayData.audience.screeningQuestions.length > 0 && (
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-start mb-4">
                    <Icon name="faQuestionCircle" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5" iconType="static" solid={false} />
                    <h3 className="font-medium text-gray-800">Screening Questions</h3>
                  </div>
                  <div className="space-y-2">
                    {displayData.audience.screeningQuestions.map((q: any, idx: number) => (
                      <div key={idx} className="pl-2 border-l-2 border-[rgba(0,191,255,0.3)]">
                        <p className="text-gray-700">
                          {typeof q === 'string' ? q : q.question || q.toString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Targeting */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start mb-4">
                  <Icon name="faFilter" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5" iconType="static" solid={false} />
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

                  {/* Income Level */}
                  <div>
                    <h4 className="text-gray-700 font-medium mb-3 text-sm">Income Level</h4>
                    {displayData.audience?.incomeLevel ? (
                      <span className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm inline-block">
                        {formatCurrency(Number(displayData.audience.incomeLevel) || 0, displayData.currency || 'USD')}
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
              {displayData.audience?.competitors && Array.isArray(displayData.audience.competitors) && displayData.audience.competitors.length > 0 && (
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-start mb-4">
                    <Icon name="faBuilding" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5" iconType="static" solid={false} />
                    <h3 className="font-medium text-gray-800">Competitors to Monitor</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayData.audience.competitors.map((item: any, index: number) => (
                      <span key={index} className="inline-block px-3 py-1 bg-[rgba(255,0,0,0.05)] text-red-600 border border-red-100 rounded-full text-sm font-medium">
                        {typeof item === 'string' ? item : item.competitor || item.name || ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Icon name="faUser" className="h-10 w-10 text-gray-400 mx-auto mb-2" iconType="static" solid={false} />
              <p className="text-gray-500">Audience data not available. Please complete Step 3.</p>
              <button onClick={() => navigateToStep(3)} className="mt-3 text-sm text-[var(--accent-color)] hover:underline flex items-center justify-center mx-auto">
                <Icon name="faEdit" className="h-4 w-4 mr-1" iconType="button" solid={false} />
                Edit audience targeting
              </button>
            </div>
          )}
        </SummarySection>

        {/* Step 4: Creative Assets */}
        <SummarySection title="Creative Assets" stepNumber={4} onEdit={() => navigateToStep(4)}>

          {displayData.creativeAssets && Array.isArray(displayData.creativeAssets) && displayData.creativeAssets.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayData.creativeAssets.map((asset: CreativeAsset, index: number) => <div key={asset.id || index} className="border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col transform hover:-translate-y-1 hover:border-[var(--accent-color)]">
                  {/* Asset Preview - Square/Tiled */}
                  <div className="aspect-square w-full overflow-hidden relative bg-gray-50">
                    <Step5AssetPreview url={asset.url} fileName={asset.assetName || asset.name || 'Asset preview'} type={asset.type} className="w-full h-full" />

                    {/* Asset Type Badge */}
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs font-medium">
                      {asset.type === 'video' || (typeof asset.type === 'string' && asset.type.includes('video')) 
                        ? <div className="flex items-center"><Icon name="faVideo" className="h-3 w-3 mr-1" iconType="static" solid={false} /> Video</div> 
                        : <div className="flex items-center"><Icon name="faImage" className="h-3 w-3 mr-1" iconType="static" solid={false} /> Image</div>}
                    </div>
                  </div>
                  
                  {/* Asset Name - Made more prominent */}
                  <div className="px-4 pt-4 pb-2 bg-gradient-to-r from-[rgba(0,191,255,0.05)] to-white border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 text-lg leading-tight truncate pr-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                        {asset.assetName || asset.name || 'Untitled Asset'}
                      </h3>
                      {/* Platform Icon */}
                      {(asset.platform || displayData.platform) && (
                        <div className="flex-shrink-0 bg-[rgba(0,191,255,0.1)] rounded-full p-1.5 ml-1">
                          <Icon 
                            name={
                              (asset.platform || displayData.platform || '').toLowerCase().includes('instagram') ? 'faInstagram' :
                              (asset.platform || displayData.platform || '').toLowerCase().includes('facebook') ? 'faFacebook' :
                              (asset.platform || displayData.platform || '').toLowerCase().includes('twitter') || (asset.platform || displayData.platform || '').toLowerCase().includes('x') ? 'faTwitter' :
                              (asset.platform || displayData.platform || '').toLowerCase().includes('tiktok') ? 'faTiktok' :
                              (asset.platform || displayData.platform || '').toLowerCase().includes('youtube') ? 'faYoutube' :
                              (asset.platform || displayData.platform || '').toLowerCase().includes('linkedin') ? 'faLinkedin' :
                              'faGlobe'
                            } 
                            className="h-4 w-4 text-[var(--accent-color)]" 
                            iconType="static" 
                            solid={true} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Asset Details Section */}
                  <div className="p-4 bg-white flex-grow">
                    <div className="space-y-4">
                      {/* Influencer */}
                      <div className="flex items-start">
                        <Icon name="faUser" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-1 flex-shrink-0" iconType="static" solid={false} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Influencer</p>
                          <p className="text-sm text-gray-800 font-medium">{asset.influencerHandle || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      {/* Platform (if not shown next to title) */}
                      {!(asset.platform || displayData.platform) && (
                        <div className="flex items-start">
                          <Icon name="faGlobe" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-1 flex-shrink-0" iconType="static" solid={false} />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Platform</p>
                            <p className="text-sm text-gray-800 font-medium">Not specified</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Why this influencer */}
                      <div className="flex items-start">
                        <Icon name="faCircleInfo" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-1 flex-shrink-0" iconType="static" solid={false} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Why this influencer</p>
                          <p className="text-sm text-gray-800">{asset.whyInfluencer || 'No details provided'}</p>
                        </div>
                      </div>
                      
                      {/* Budget */}
                      <div className="flex items-start">
                        <Icon name="faDollarSign" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-1 flex-shrink-0" iconType="static" solid={false} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Budget</p>
                          <p className="text-sm text-gray-800 font-medium">
                            {asset.budget ? formatCurrency(asset.budget, displayData.currency || 'USD') : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>)}
            </div> : <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Icon name="faImage" className="h-10 w-10 text-gray-400 mx-auto mb-2" iconType="static" solid={false} />
              <p className="text-gray-500">No creative assets have been added yet.</p>
              <button onClick={() => navigateToStep(4)} className="mt-3 text-sm text-[var(--accent-color)] hover:underline flex items-center justify-center mx-auto group">
                <Icon name="faPenToSquare" className="h-4 w-4 mr-1" iconType="button" solid={false} />
                Add creative assets
              </button>
            </div>}
        </SummarySection>
      </div>

      {/* Add ProgressBar component at the bottom */}
      <div className="mt-12 mb-8">
        <ProgressBar currentStep={5} onStepClick={step => navigateToStep(step)} onBack={() => navigateToStep(4)} onNext={handleSubmit} onSaveDraft={handleSaveDraft} disableNext={false} isFormValid={true} isDirty={false} isSaving={isSaving || isSubmitting} />

      </div>
    </div>;
}
export default function Step5() {
  return <ErrorBoundary fallback={<ErrorFallback />}>
      <Step5Content />
    </ErrorBoundary>;
}