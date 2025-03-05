/**
 * Campaign Wizard Form Adapters
 * 
 * This module provides bidirectional adapters between the existing Campaign Wizard
 * form structure and the new API schema format. It ensures backward compatibility
 * while allowing for enhanced validation and type safety in the API layer.
 */

import { Platform, Position, KPI, Feature, Currency } from '@prisma/client';
import { 
  CampaignFormValues, 
  CampaignApiPayload,
  transformCampaignFormData,
  transformContactData,
  transformBudgetData
} from './form-transformers';

/**
 * Type representing the legacy Campaign Wizard form structure
 * This matches the structure used in the existing forms
 */
export interface LegacyCampaignForm {
  // Step 1: Campaign Details
  name?: string;
  campaignName?: string;  // Alternative field name
  businessGoal?: string;
  description?: string;   // Alternative field name
  startDate?: string | Date;
  endDate?: string | Date;
  timeZone?: string;
  currency?: Currency | string;
  totalBudget?: number | string;
  socialMediaBudget?: number | string;
  primaryContact?: {
    firstName?: string;
    surname?: string;
    email?: string;
    position?: string | Position;
  };
  secondaryContact?: {
    firstName?: string;
    surname?: string;
    email?: string;
    position?: string | Position;
  };
  
  // Step 2: Objectives & Messaging
  mainMessage?: string;
  hashtags?: string | string[];
  primaryKPI?: KPI | string;
  primaryKPITarget?: number | string;
  secondaryKPIs?: Array<KPI | string>;
  features?: Array<Feature | string>;
  
  // Step 3: Target Audience
  targetAudience?: {
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
    genders?: string[];
  };
  competitors?: string[];
  
  // Step 4: Creative Assets
  assets?: Array<{
    type?: string;
    url?: string;
    description?: string;
  }>;
  guidelines?: string;
  
  // Additional fields used by the form
  step?: number;
  status?: string;
  platform?: Platform | string;
  influencerHandle?: string;
  influencers?: Array<{
    platform?: Platform | string;
    handle?: string; 
  }>;
  exchangeRateData?: any;

  // Allow for additional properties
  [key: string]: any;
}

/**
 * Adapt a legacy campaign form to the new API payload format
 * 
 * @param formValues Legacy form values from the Campaign Wizard
 * @returns API-compatible payload
 */
export function adaptLegacyFormToApi(formValues: LegacyCampaignForm): CampaignApiPayload {
  // Handle both name field variations
  const name = formValues.name || formValues.campaignName || '';
  
  // Handle both description field variations
  const businessGoal = formValues.businessGoal || formValues.description || '';
  
  // Process dates with fallbacks
  const startDate = formValues.startDate 
    ? new Date(formValues.startDate).toISOString() 
    : new Date().toISOString();
    
  const endDate = formValues.endDate 
    ? new Date(formValues.endDate).toISOString() 
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default to 30 days from now
  
  // Transform primary contact
  const primaryContact = formValues.primaryContact 
    ? {
        name: `${formValues.primaryContact.firstName || ''} ${formValues.primaryContact.surname || ''}`.trim(),
        email: formValues.primaryContact.email,
        position: formValues.primaryContact.position
      } 
    : undefined;
  
  // Transform secondary contact
  const secondaryContact = formValues.secondaryContact 
    ? {
        name: `${formValues.secondaryContact.firstName || ''} ${formValues.secondaryContact.surname || ''}`.trim(),
        email: formValues.secondaryContact.email,
        position: formValues.secondaryContact.position
      } 
    : undefined;
  
  // Transform budget
  const budget = {
    total: Number(formValues.totalBudget || 0),
    currency: (formValues.currency as Currency) || Currency.USD,
    // Add allocation if available
    allocation: formValues.budgetAllocation 
      ? formValues.budgetAllocation.map((item: any) => ({
          category: item.category,
          percentage: Number(item.percentage || 0)
        }))
      : []
  };
  
  // Transform audience
  const audience = formValues.targetAudience 
    ? {
        age1824: Number(formValues.targetAudience.age1824 || 0),
        age2534: Number(formValues.targetAudience.age2534 || 0),
        age3544: Number(formValues.targetAudience.age3544 || 0),
        age4554: Number(formValues.targetAudience.age4554 || 0),
        age5564: Number(formValues.targetAudience.age5564 || 0),
        age65plus: Number(formValues.targetAudience.age65plus || 0),
        locations: formValues.targetAudience.locations || [],
        languages: formValues.targetAudience.languages || [],
        genders: formValues.targetAudience.genders
      }
    : undefined;
  
  // Transform influencers
  const influencers = formValues.influencers 
    ? formValues.influencers.map(inf => ({
        handle: inf.handle || '',
        platform: inf.platform || Platform.INSTAGRAM,
        url: inf.url || '',
      }))
    : formValues.influencerHandle 
      ? [{
          handle: formValues.influencerHandle,
          platform: formValues.platform || Platform.INSTAGRAM,
          url: '',
        }]
      : [];
  
  // Transform creative assets
  const creativeAssets = formValues.assets 
    ? formValues.assets.map(asset => ({
        type: asset.type || 'IMAGE',
        url: asset.url || '',
        description: asset.description || ''
      }))
    : [];
  
  // Transform creative requirements
  const creativeRequirements = formValues.guidelines
    ? [{
        description: formValues.guidelines,
        priority: 'MEDIUM'
      }]
    : [];
  
  return {
    name,
    businessGoal,
    startDate,
    endDate,
    timeZone: formValues.timeZone || 'UTC',
    primaryContact,
    secondaryContact,
    budget,
    primaryKPI: formValues.primaryKPI as KPI,
    secondaryKPIs: (formValues.secondaryKPIs || []) as KPI[],
    features: (formValues.features || []) as Feature[],
    audience,
    influencers,
    creativeAssets,
    creativeRequirements,
    // Pass through any additional fields that might be needed
    ...formValues.additionalData
  };
}

/**
 * Adapt an API response to the legacy form format
 * 
 * @param apiData API response data
 * @returns Legacy form compatible data
 */
export function adaptApiToLegacyForm(apiData: any): LegacyCampaignForm {
  // Handle both name field variations
  const campaignName = apiData.name || '';
  
  // Handle both description field variations
  const description = apiData.businessGoal || '';
  
  // Process dates
  const startDate = apiData.startDate 
    ? new Date(apiData.startDate).toISOString().split('T')[0]
    : '';
    
  const endDate = apiData.endDate 
    ? new Date(apiData.endDate).toISOString().split('T')[0]
    : '';
  
  // Transform primary contact
  const primaryContact = apiData.primaryContact 
    ? {
        firstName: apiData.primaryContact.name?.split(' ')[0] || '',
        surname: apiData.primaryContact.name?.split(' ').slice(1).join(' ') || '',
        email: apiData.primaryContact.email || '',
        position: apiData.primaryContact.position || ''
      } 
    : undefined;
  
  // Transform secondary contact
  const secondaryContact = apiData.secondaryContact 
    ? {
        firstName: apiData.secondaryContact.name?.split(' ')[0] || '',
        surname: apiData.secondaryContact.name?.split(' ').slice(1).join(' ') || '',
        email: apiData.secondaryContact.email || '',
        position: apiData.secondaryContact.position || ''
      } 
    : undefined;
  
  // Extract budget information
  const currency = apiData.budget?.currency || Currency.USD;
  const totalBudget = apiData.budget?.total || 0;
  const socialMediaBudget = apiData.budget?.allocation?.find((a: any) => a.category === 'Social Media')?.value || 0;
  
  // Transform audience
  const targetAudience = apiData.audience 
    ? {
        age1824: apiData.audience.age1824 || 0,
        age2534: apiData.audience.age2534 || 0,
        age3544: apiData.audience.age3544 || 0,
        age4554: apiData.audience.age4554 || 0,
        age5564: apiData.audience.age5564 || 0,
        age65plus: apiData.audience.age65plus || 0,
        locations: apiData.audience.locations || [],
        genders: apiData.audience.genders || []
      }
    : undefined;
  
  // Extract influencer information
  const influencerHandle = apiData.influencers?.[0]?.handle || '';
  const platform = apiData.influencers?.[0]?.platform || '';
  
  // Extract creative guidelines
  const guidelines = apiData.creativeRequirements?.[0]?.description || '';
  
  return {
    campaignName,
    description,
    startDate,
    endDate,
    timeZone: apiData.timeZone || 'UTC',
    currency,
    totalBudget,
    socialMediaBudget,
    primaryContact,
    secondaryContact,
    primaryKPI: apiData.primaryKPI,
    secondaryKPIs: apiData.secondaryKPIs || [],
    features: apiData.features || [],
    targetAudience,
    competitors: apiData.audience?.competitors || [],
    assets: apiData.creativeAssets || [],
    guidelines,
    influencerHandle,
    platform,
    influencers: apiData.influencers,
    status: apiData.status || 'draft',
    // Include the original data for reference if needed
    _originalData: apiData
  };
}

/**
 * Apply a compatibility wrapper to fetch calls to ensure proper data transformation
 * between the legacy form structure and the new API format
 * 
 * @param url API endpoint URL
 * @param options Fetch options including method and body
 * @returns Fetch response with transformed data
 */
export async function compatibleFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Only transform POST and PATCH requests with a body
  if ((options.method === 'POST' || options.method === 'PATCH') && options.body) {
    try {
      // Parse the request body
      const body = JSON.parse(options.body as string);
      
      // Transform to API format
      const transformedBody = adaptLegacyFormToApi(body);
      
      // Replace the body with the transformed one
      options.body = JSON.stringify(transformedBody);
    } catch (error) {
      console.error('Error transforming request body:', error);
      // Continue with original body if transformation fails
    }
  }
  
  // Make the API call
  const response = await fetch(url, options);
  
  // Handle the response
  if (response.ok) {
    try {
      // Clone the response to avoid consuming it
      const clonedResponse = response.clone();
      
      // Parse the response
      const data = await clonedResponse.json();
      
      // Transform API response to legacy format if needed
      const transformedData = adaptApiToLegacyForm(data.data || data);
      
      // Create a new response with the transformed data
      return new Response(JSON.stringify(
        data.data 
          ? { ...data, data: transformedData } 
          : transformedData
      ), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    } catch (error) {
      console.error('Error transforming response:', error);
      // Return original response if transformation fails
      return response;
    }
  }
  
  // Return error responses as is
  return response;
}

/**
 * Enum conversion utilities to handle case differences between UI and API
 */
export const enumConverters = {
  /**
   * Convert UI-friendly platform name to API enum value
   */
  platformToEnum(platform: string): Platform {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return Platform.INSTAGRAM;
      case 'youtube':
        return Platform.YOUTUBE;
      case 'tiktok':
        return Platform.TIKTOK;
      default:
        return Platform.INSTAGRAM;
    }
  },
  
  /**
   * Convert API enum value to UI-friendly platform name
   */
  enumToPlatform(platform: Platform): string {
    switch (platform) {
      case Platform.INSTAGRAM:
        return 'Instagram';
      case Platform.YOUTUBE:
        return 'YouTube';
      case Platform.TIKTOK:
        return 'TikTok';
      default:
        return 'Instagram';
    }
  },
  
  /**
   * Convert UI-friendly position name to API enum value
   */
  positionToEnum(position: string): Position {
    switch (position.toLowerCase()) {
      case 'manager':
        return Position.MANAGER;
      case 'director':
        return Position.DIRECTOR;
      case 'vp':
      case 'vice president':
        return Position.VP;
      default:
        return Position.MANAGER;
    }
  },
  
  /**
   * Convert API enum value to UI-friendly position name
   */
  enumToPosition(position: Position): string {
    switch (position) {
      case Position.MANAGER:
        return 'Manager';
      case Position.DIRECTOR:
        return 'Director';
      case Position.VP:
        return 'VP';
      default:
        return 'Manager';
    }
  },
  
  /**
   * Convert UI-friendly KPI name to API enum value
   */
  kpiToEnum(kpi: string): KPI {
    switch (kpi.toLowerCase().replace(/[_\s-]/g, '')) {
      case 'adrecall':
      case 'recall':
        return KPI.AD_RECALL;
      case 'brandawareness':
      case 'awareness':
        return KPI.BRAND_AWARENESS;
      case 'consideration':
        return KPI.CONSIDERATION;
      case 'messageassociation':
      case 'association':
        return KPI.MESSAGE_ASSOCIATION;
      case 'brandpreference':
      case 'preference':
        return KPI.BRAND_PREFERENCE;
      case 'purchaseintent':
      case 'purchase':
        return KPI.PURCHASE_INTENT;
      case 'actionintent':
      case 'action':
        return KPI.ACTION_INTENT;
      case 'recommendationintent':
      case 'recommendation':
        return KPI.RECOMMENDATION_INTENT;
      case 'advocacy':
        return KPI.ADVOCACY;
      default:
        return KPI.BRAND_AWARENESS;
    }
  },
  
  /**
   * Convert API enum value to UI-friendly KPI name
   */
  enumToKpi(kpi: KPI): string {
    switch (kpi) {
      case KPI.AD_RECALL:
        return 'Ad Recall';
      case KPI.BRAND_AWARENESS:
        return 'Brand Awareness';
      case KPI.CONSIDERATION:
        return 'Consideration';
      case KPI.MESSAGE_ASSOCIATION:
        return 'Message Association';
      case KPI.BRAND_PREFERENCE:
        return 'Brand Preference';
      case KPI.PURCHASE_INTENT:
        return 'Purchase Intent';
      case KPI.ACTION_INTENT:
        return 'Action Intent';
      case KPI.RECOMMENDATION_INTENT:
        return 'Recommendation Intent';
      case KPI.ADVOCACY:
        return 'Advocacy';
      default:
        return 'Brand Awareness';
    }
  }
}; 