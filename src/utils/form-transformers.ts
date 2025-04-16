/**
 * Form Data Transformation & Mapping Utilities
 *
 * This module provides interfaces and utilities for transforming form data
 * between UI Form Values and API Payloads.
 */

import { Platform, Position, KPI, Feature, Currency } from '@prisma/client';

// --- Modern Form Value & API Payload Types ---

// Types for form values
export interface ContactFormValues {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
}

export interface BudgetFormValues {
  total: number | string;
  currency: Currency;
  allocation?: Array<{
    category: string;
    percentage: number | string;
  }>;
}

export interface AudienceFormValues {
  age1824?: number | string;
  age2534?: number | string;
  age3544?: number | string;
  age4554?: number | string;
  age5564?: number | string;
  age65plus?: number | string;
  locations?: Array<{
    country: string;
    region?: string;
    city?: string;
  }>;
  languages?: string[];
  genders?: string[];
  screeningQuestions?: Array<{
    question: string;
    required: boolean;
  }>;
  competitors?: string[];
}

export interface InfluencerFormValues {
  name?: string;
  handle: string;
  platform: Platform;
  url?: string;
  posts?: number | string;
  videos?: number | string;
  reels?: number | string;
  stories?: number | string;
}

export interface CreativeAssetFormValues {
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  url?: string;
  description?: string;
}

export interface CreativeRequirementFormValues {
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CampaignFormValues {
  name: string;
  businessGoal?: string;
  startDate: string | Date;
  endDate: string | Date;
  timeZone?: string;
  primaryContact?: ContactFormValues;
  secondaryContact?: ContactFormValues;
  budget?: BudgetFormValues;
  primaryKPI?: KPI;
  secondaryKPIs?: KPI[];
  features?: Feature[];
  audience?: AudienceFormValues;
  influencers?: InfluencerFormValues[];
  creativeAssets?: CreativeAssetFormValues[];
  creativeRequirements?: CreativeRequirementFormValues[];
}

// Types for API payloads
export interface ContactApiPayload {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
}

export interface BudgetApiPayload {
  total: number;
  currency: Currency;
  allocation?: Array<{
    category: string;
    percentage: number;
  }>;
}

export interface AudienceApiPayload {
  age1824: number;
  age2534: number;
  age3544: number;
  age4554: number;
  age5564: number;
  age65plus: number;
  locations: Array<{
    country: string;
    region?: string;
    city?: string;
  }>;
  languages: string[];
  genders?: string[];
  screeningQuestions?: Array<{
    question: string;
    required: boolean;
  }>;
  competitors?: string[];
}

export interface InfluencerApiPayload {
  name?: string;
  handle: string;
  platform: Platform;
  url?: string;
  posts?: number;
  videos?: number;
  reels?: number;
  stories?: number;
}

export interface CreativeAssetApiPayload {
  type: string;
  url?: string;
  description?: string;
}

export interface CreativeRequirementApiPayload {
  description: string;
  priority: string;
}

export interface CampaignApiPayload {
  name: string;
  businessGoal?: string;
  startDate: string;
  endDate: string;
  timeZone?: string;
  primaryContact?: ContactApiPayload;
  secondaryContact?: ContactApiPayload;
  budget?: BudgetApiPayload;
  primaryKPI?: KPI;
  secondaryKPIs?: KPI[];
  features?: Feature[];
  audience?: AudienceApiPayload;
  influencers?: InfluencerApiPayload[];
  creativeAssets?: CreativeAssetApiPayload[];
  creativeRequirements?: CreativeRequirementApiPayload[];
}

// --- Modern Form Transformers ---

/**
 * Transform campaign form data to API payload format
 * @param formValues Form values from the campaign form
 * @returns API-compatible payload
 */
export function transformCampaignFormData(formValues: CampaignFormValues): CampaignApiPayload {
  return {
    name: formValues.name,
    businessGoal: formValues.businessGoal,
    startDate: new Date(formValues.startDate).toISOString(),
    endDate: new Date(formValues.endDate).toISOString(),
    timeZone: formValues.timeZone,
    primaryContact: transformContactData(formValues.primaryContact),
    secondaryContact: transformContactData(formValues.secondaryContact),
    budget: transformBudgetData(formValues.budget),
    primaryKPI: formValues.primaryKPI,
    secondaryKPIs: formValues.secondaryKPIs || [],
    features: formValues.features || [],
    audience: formValues.audience ? transformAudienceData(formValues.audience) : undefined,
    influencers: formValues.influencers
      ? formValues.influencers.map(transformInfluencerData)
      : undefined,
    creativeAssets: formValues.creativeAssets
      ? formValues.creativeAssets.map(transformCreativeAssetData)
      : undefined,
    creativeRequirements: formValues.creativeRequirements
      ? formValues.creativeRequirements.map(transformCreativeRequirementData)
      : undefined,
  };
}

/**
 * Transform contact form data to API payload format
 * @param contactData Contact form values
 * @returns API-compatible contact payload
 */
export function transformContactData(
  contactData?: ContactFormValues
): ContactApiPayload | undefined {
  if (!contactData) return undefined;

  return {
    name: contactData.name,
    email: contactData.email,
    phone: contactData.phone,
    position: contactData.position,
  };
}

/**
 * Transform budget form data to API payload format
 * @param budgetData Budget form values
 * @returns API-compatible budget payload
 */
export function transformBudgetData(budgetData?: BudgetFormValues): BudgetApiPayload | undefined {
  if (!budgetData) return undefined;

  return {
    total: Number(budgetData.total),
    currency: budgetData.currency,
    allocation: budgetData.allocation?.map(item => ({
      category: item.category,
      percentage: Number(item.percentage),
    })),
  };
}

/**
 * Transform audience form data to API payload format
 * @param audienceData Audience form values
 * @returns API-compatible audience payload
 */
export function transformAudienceData(audienceData: AudienceFormValues): AudienceApiPayload {
  return {
    age1824: Number(audienceData.age1824 || 0),
    age2534: Number(audienceData.age2534 || 0),
    age3544: Number(audienceData.age3544 || 0),
    age4554: Number(audienceData.age4554 || 0),
    age5564: Number(audienceData.age5564 || 0),
    age65plus: Number(audienceData.age65plus || 0),
    locations: audienceData.locations || [],
    languages: audienceData.languages || [],
    genders: audienceData.genders,
    screeningQuestions: audienceData.screeningQuestions,
    competitors: audienceData.competitors,
  };
}

/**
 * Transform influencer form data to API payload format
 * @param influencerData Influencer form values
 * @returns API-compatible influencer payload
 */
export function transformInfluencerData(
  influencerData: InfluencerFormValues
): InfluencerApiPayload {
  return {
    name: influencerData.name || '',
    handle: influencerData.handle,
    platform: influencerData.platform,
    url: influencerData.url || '',
    posts: Number(influencerData.posts || 0),
    videos: Number(influencerData.videos || 0),
    reels: Number(influencerData.reels || 0),
    stories: Number(influencerData.stories || 0),
  };
}

/**
 * Transform creative asset form data to API payload format
 * @param assetData Creative asset form values
 * @returns API-compatible creative asset payload
 */
export function transformCreativeAssetData(
  assetData: CreativeAssetFormValues
): CreativeAssetApiPayload {
  return {
    type: assetData.type,
    url: assetData.url || '',
    description: assetData.description || '',
  };
}

/**
 * Transform creative requirement form data to API payload format
 * @param requirementData Creative requirement form values
 * @returns API-compatible creative requirement payload
 */
export function transformCreativeRequirementData(
  requirementData: CreativeRequirementFormValues
): CreativeRequirementApiPayload {
  return {
    description: requirementData.description,
    priority: requirementData.priority,
  };
}

// --- Enum Utilities (SSOT) ---

/**
 * Enum handling utilities for consistent casing
 */
export const EnumUtils = {
  // Platform enum utilities
  Platform: {
    toString(platform: Platform): string {
      switch (platform) {
        case 'INSTAGRAM':
          return 'Instagram';
        case 'YOUTUBE':
          return 'YouTube';
        case 'TIKTOK':
          return 'TikTok';
        default:
          return 'Instagram';
      }
    },

    fromString(platform: string): Platform {
      switch (platform.toLowerCase()) {
        case 'instagram':
          return 'INSTAGRAM' as Platform;
        case 'youtube':
          return 'YOUTUBE' as Platform;
        case 'tiktok':
          return 'TIKTOK' as Platform;
        default:
          return 'INSTAGRAM' as Platform;
      }
    },

    options: () => [
      { value: 'INSTAGRAM' as Platform, label: 'Instagram' },
      { value: 'YOUTUBE' as Platform, label: 'YouTube' },
      { value: 'TIKTOK' as Platform, label: 'TikTok' },
    ],
  },

  // Position enum utilities
  Position: {
    toString(position: Position): string {
      switch (position) {
        case 'Manager':
          return 'Manager';
        case 'Director':
          return 'Director';
        case 'VP':
          return 'VP';
        default:
          return 'Manager';
      }
    },

    fromString(position: string): Position {
      switch (position.toLowerCase()) {
        case 'manager':
          return 'Manager' as Position;
        case 'director':
          return 'Director' as Position;
        case 'vp':
        case 'vice president':
          return 'VP' as Position;
        default:
          return 'Manager' as Position;
      }
    },

    options: () => [
      { value: 'Manager' as Position, label: 'Manager' },
      { value: 'Director' as Position, label: 'Director' },
      { value: 'VP' as Position, label: 'VP' },
    ],
  },

  // KPI enum utilities
  KPI: {
    toString(kpi: KPI): string {
      switch (kpi) {
        case 'AD_RECALL':
          return 'Ad Recall';
        case 'BRAND_AWARENESS':
          return 'Brand Awareness';
        case 'CONSIDERATION':
          return 'Consideration';
        case 'MESSAGE_ASSOCIATION':
          return 'Message Association';
        case 'BRAND_PREFERENCE':
          return 'Brand Preference';
        case 'PURCHASE_INTENT':
          return 'Purchase Intent';
        case 'ACTION_INTENT':
          return 'Action Intent';
        case 'RECOMMENDATION_INTENT':
          return 'Recommendation Intent';
        case 'ADVOCACY':
          return 'Advocacy';
        default:
          return 'Brand Awareness';
      }
    },

    fromString(kpi: string): KPI {
      switch (kpi.toLowerCase().replace(/[_\s-]/g, '')) {
        case 'adrecall':
        case 'recall':
          return 'AD_RECALL' as KPI;
        case 'brandawareness':
        case 'awareness':
          return 'BRAND_AWARENESS' as KPI;
        case 'consideration':
          return 'CONSIDERATION' as KPI;
        case 'messageassociation':
        case 'association':
          return 'MESSAGE_ASSOCIATION' as KPI;
        case 'brandpreference':
        case 'preference':
          return 'BRAND_PREFERENCE' as KPI;
        case 'purchaseintent':
        case 'purchase':
          return 'PURCHASE_INTENT' as KPI;
        case 'actionintent':
        case 'action':
          return 'ACTION_INTENT' as KPI;
        case 'recommendationintent':
        case 'recommendation':
          return 'RECOMMENDATION_INTENT' as KPI;
        case 'advocacy':
          return 'ADVOCACY' as KPI;
        default:
          return 'BRAND_AWARENESS' as KPI;
      }
    },

    options: () => [
      { value: 'AD_RECALL' as KPI, label: 'Ad Recall' },
      { value: 'BRAND_AWARENESS' as KPI, label: 'Brand Awareness' },
      { value: 'CONSIDERATION' as KPI, label: 'Consideration' },
      { value: 'MESSAGE_ASSOCIATION' as KPI, label: 'Message Association' },
      { value: 'BRAND_PREFERENCE' as KPI, label: 'Brand Preference' },
      { value: 'PURCHASE_INTENT' as KPI, label: 'Purchase Intent' },
      { value: 'ACTION_INTENT' as KPI, label: 'Action Intent' },
      { value: 'RECOMMENDATION_INTENT' as KPI, label: 'Recommendation Intent' },
      { value: 'ADVOCACY' as KPI, label: 'Advocacy' },
    ],
  },

  // Currency enum utilities
  Currency: {
    toString(currency: Currency): string {
      switch (currency) {
        case 'USD':
          return 'USD';
        case 'GBP':
          return 'GBP';
        case 'EUR':
          return 'EUR';
        default:
          return 'USD';
      }
    },

    fromString(currency: string): Currency {
      switch (currency.toUpperCase()) {
        case 'USD':
          return 'USD' as Currency;
        case 'GBP':
          return 'GBP' as Currency;
        case 'EUR':
          return 'EUR' as Currency;
        default:
          return 'USD' as Currency;
      }
    },

    options: () => [
      { value: 'USD' as Currency, label: 'USD' },
      { value: 'GBP' as Currency, label: 'GBP' },
      { value: 'EUR' as Currency, label: 'EUR' },
    ],
  },
  // TODO: Add Feature enum helpers here if needed by transformers
};
