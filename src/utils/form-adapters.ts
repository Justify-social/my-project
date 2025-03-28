/**
 * Campaign Wizard Form Adapters
 * 
 * This module provides bidirectional adapters between the existing Campaign Wizard
 * form structure and the new API schema format. It ensures backward compatibility
 * while allowing for enhanced validation and type safety in the API layer.
 */

import { Platform, Position, KPI, Feature, Currency } from '@prisma/client';
import { 
  CampaignFormValues as _CampaignFormValues, 
  CampaignApiPayload,
  transformCampaignFormData as _transformCampaignFormData,
  transformContactData as _transformContactData,
  transformBudgetData as _transformBudgetData
} from './form-transformers';

/**
 * Type representing the legacy Campaign Wizard form structure
 * This matches the structure used in the existing forms
 */
type ExtendedTargetAudience = {
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
  languages?: string[];
};

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
  targetAudience?: ExtendedTargetAudience;
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
  exchangeRateData?: unknown;

  // Allow for additional properties
  [key: string]: unknown;
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
    allocation: Array.isArray(formValues.budgetAllocation) 
      ? formValues.budgetAllocation.map((item: unknown) => {
          const typedItem = item as Record<string, unknown>;
          return {
            category: typedItem.category as string,
            percentage: Number(typedItem.percentage || 0)
          };
        })
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
        url: (inf as Record<string, unknown>).url as string || '',
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
    ...(formValues.additionalData as Record<string, unknown> || {})
  };
}

/**
 * Adapt an API response to the legacy form format
 * 
 * @param apiData API response data
 * @returns Legacy form compatible data
 */
export function adaptApiToLegacyForm(apiData: unknown): LegacyCampaignForm {
  // Cast the API data to a Record with explicit type checking
  const typedApiData = apiData as Record<string, unknown>;
  
  // Handle both name field variations
  const campaignName = typeof typedApiData.name === 'string' ? typedApiData.name : '';
  
  // Handle both description field variations
  const description = typeof typedApiData.businessGoal === 'string' ? typedApiData.businessGoal : '';
  
  // Process dates
  const startDate = typedApiData.startDate 
    ? new Date(String(typedApiData.startDate)).toISOString().split('T')[0]
    : '';
    
  const endDate = typedApiData.endDate 
    ? new Date(String(typedApiData.endDate)).toISOString().split('T')[0]
    : '';
  
  // Transform primary contact
  const primaryContact = typedApiData.primaryContact 
    ? {
        firstName: getStringProperty((typedApiData.primaryContact as Record<string, unknown>), 'name')?.split(' ')[0] || '',
        surname: getStringProperty((typedApiData.primaryContact as Record<string, unknown>), 'name')?.split(' ').slice(1).join(' ') || '',
        email: getStringProperty((typedApiData.primaryContact as Record<string, unknown>), 'email') || '',
        position: getStringProperty((typedApiData.primaryContact as Record<string, unknown>), 'position') || ''
      } 
    : undefined;
  
  // Transform secondary contact
  const secondaryContact = typedApiData.secondaryContact 
    ? {
        firstName: getStringProperty((typedApiData.secondaryContact as Record<string, unknown>), 'name')?.split(' ')[0] || '',
        surname: getStringProperty((typedApiData.secondaryContact as Record<string, unknown>), 'name')?.split(' ').slice(1).join(' ') || '',
        email: getStringProperty((typedApiData.secondaryContact as Record<string, unknown>), 'email') || '',
        position: getStringProperty((typedApiData.secondaryContact as Record<string, unknown>), 'position') || ''
      } 
    : undefined;
  
  // Extract budget information
  const budgetData = typedApiData.budget as Record<string, unknown> || {};
  const currency = getStringProperty(budgetData, 'currency') as Currency || Currency.USD;
  const totalBudget = getNumberProperty(budgetData, 'total') || 0;
  
  // Calculate social media budget from budget allocation
  let socialMediaBudget = 0;
  if (Array.isArray(budgetData.allocation)) {
    const socialMediaAllocation = budgetData.allocation.find(
      (a: unknown) => (a as Record<string, unknown>).category === 'Social Media'
    ) as Record<string, unknown> || {};
    socialMediaBudget = getNumberProperty(socialMediaAllocation, 'value') || 0;
  }
  
  // Transform audience
  const audienceData = typedApiData.audience as Record<string, unknown> || {};
  const targetAudience: ExtendedTargetAudience | undefined = audienceData && Object.keys(audienceData).length > 0
    ? {
        age1824: getNumberProperty(audienceData, 'age1824'),
        age2534: getNumberProperty(audienceData, 'age2534'),
        age3544: getNumberProperty(audienceData, 'age3544'),
        age4554: getNumberProperty(audienceData, 'age4554'),
        age5564: getNumberProperty(audienceData, 'age5564'),
        age65plus: getNumberProperty(audienceData, 'age65plus'),
        locations: Array.isArray(audienceData.locations) 
          ? audienceData.locations.map((loc: unknown) => convertToLocation(loc))
          : [],
        genders: Array.isArray(audienceData.genders) 
          ? audienceData.genders.map((g: unknown) => String(g))
          : [],
        languages: Array.isArray(audienceData.languages) 
          ? audienceData.languages.map((l: unknown) => String(l))
          : []
      }
    : undefined;
  
  // Extract influencer information
  const influencers = Array.isArray(typedApiData.influencers) 
    ? typedApiData.influencers.map((inf: unknown) => {
        const influencer = inf as Record<string, unknown>;
        return {
          handle: getStringProperty(influencer, 'handle') || '',
          platform: getStringProperty(influencer, 'platform') as Platform || Platform.Instagram,
          url: getStringProperty(influencer, 'url') || ''
        };
      })
    : [];
  
  // Get first influencer for legacy handling
  const influencerHandleInfo = influencers.length > 0 ? influencers[0] : { handle: '', platform: '' };
  const influencerHandle = influencerHandleInfo.handle;
  const platform = influencerHandleInfo.platform;
  
  // Extract creative guidelines
  const creativeRequirements = Array.isArray(typedApiData.creativeRequirements) && typedApiData.creativeRequirements.length > 0
    ? typedApiData.creativeRequirements[0] as Record<string, unknown>
    : { description: '' };
  
  const guidelines = getStringProperty(creativeRequirements, 'description') || '';
  
  // Get assets
  const assets = Array.isArray(typedApiData.creativeAssets) 
    ? typedApiData.creativeAssets.map((asset: unknown) => {
        const assetData = asset as Record<string, unknown>;
        return {
          type: getStringProperty(assetData, 'type') || '',
          url: getStringProperty(assetData, 'url') || '',
          description: getStringProperty(assetData, 'description') || ''
        };
      })
    : [];
  
  // Construct the competitors array
  const competitors = Array.isArray(audienceData.competitors) 
    ? audienceData.competitors.map((comp: unknown) => String(comp))
    : [];
  
  // Build the final legacy form structure
  return {
    campaignName,
    description,
    startDate,
    endDate,
    timeZone: getStringProperty(typedApiData, 'timeZone') || 'UTC',
    currency,
    totalBudget,
    socialMediaBudget,
    primaryContact,
    secondaryContact,
    primaryKPI: getStringProperty(typedApiData, 'primaryKPI'),
    secondaryKPIs: Array.isArray(typedApiData.secondaryKPIs) 
      ? typedApiData.secondaryKPIs.map((kpi: unknown) => String(kpi))
      : [],
    features: Array.isArray(typedApiData.features) 
      ? typedApiData.features.map((feat: unknown) => String(feat))
      : [],
    targetAudience,
    competitors,
    assets,
    guidelines,
    influencerHandle,
    platform,
    influencers,
    status: getStringProperty(typedApiData, 'status') || 'draft',
    // Include the original data for reference if needed
    _originalData: typedApiData
  };
}

/**
 * Helper function to safely get string properties
 */
function getStringProperty(obj: Record<string, unknown> | undefined, key: string): string | undefined {
  if (!obj) return undefined;
  const value = obj[key];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Helper function to safely get number properties
 */
function getNumberProperty(obj: Record<string, unknown> | undefined, key: string): number | undefined {
  if (!obj) return undefined;
  const value = obj[key];
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return undefined;
}

/**
 * Helper to convert location data to expected format
 */
function convertToLocation(loc: unknown): { country: string; region?: string; city?: string } {
  if (typeof loc === 'string') {
    return { country: loc };
  }
  
  if (loc && typeof loc === 'object') {
    const locObj = loc as Record<string, unknown>;
    return {
      country: getStringProperty(locObj, 'country') || '',
      region: getStringProperty(locObj, 'region'),
      city: getStringProperty(locObj, 'city')
    };
  }
  
  return { country: '' };
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
        return Position.Manager;
      case 'director':
        return Position.Director;
      case 'vp':
      case 'vice president':
        return Position.VP;
      default:
        return Position.Manager;
    }
  },
  
  /**
   * Convert API enum value to UI-friendly position name
   */
  enumToPosition(position: Position): string {
    switch (position) {
      case Position.Manager:
        return 'Manager';
      case Position.Director:
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