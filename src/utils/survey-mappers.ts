import { SurveyPreviewData } from '@/types/brand-lift';
import { Platform, KPI, CreativeAssetType, CampaignWizardSubmission } from '@prisma/client';

// String constants for creative asset types
export const imageType = 'image' as CreativeAssetType;
export const videoType = 'video' as CreativeAssetType;

// Define extended campaign type that includes custom fields
type ExtendedCampaign = CampaignWizardSubmission & {
  creativeAssets?: unknown[];
  audience?: Record<string, unknown>;
  // Optional fields that might not exist on the base type
  logoUrl?: string;
  brandName?: string;
  musicTrack?: string;
  // Make startDate more specific to avoid 'never' type issues
  startDate?: Date | string | { toString(): string } | Record<string, unknown>;
};

/**
 * Maps campaign data from the database to the survey preview format
 * @param campaign Campaign data from the database
 * @param fallbackData Optional fallback data for missing fields
 * @returns Formatted survey preview data
 */
export function mapCampaignToSurveyData(
  campaign: ExtendedCampaign,
  fallbackData?: SurveyPreviewData
): SurveyPreviewData {
  // Extract brand name from campaign name or use first word
  const brandName = extractBrandName(campaign);
  
  // Map creative assets
  const creativeAsset = mapCreativeAsset(campaign, fallbackData);
  
  // Generate questions based on KPIs
  const primaryKPI = campaign.primaryKPI;
  const secondaryKPIs = Array.isArray(campaign.secondaryKPIs) 
    ? campaign.secondaryKPIs 
    : [];
  
  const questions = generateQuestionsFromKPIs(primaryKPI, secondaryKPIs, brandName);
  
  // Map platforms, defaulting to the campaign platform if available
  const platforms = mapPlatforms(campaign);
  
  // Format date properly, handling both Date objects and string dates
  let formattedDate: string;
  try {
    if (campaign.startDate) {
      console.log('startDate type:', typeof campaign.startDate, campaign.startDate);
      
      // Handle string dates
      if (typeof campaign.startDate === 'string') {
        // If it's already a string, keep only the date part
        formattedDate = campaign.startDate.includes('T') 
          ? campaign.startDate.split('T')[0] 
          : campaign.startDate;
      }
      // Handle Date objects
      else if (campaign.startDate instanceof Date) {
        // If it's a Date object, convert to ISO string and keep only the date part
        formattedDate = campaign.startDate.toISOString().split('T')[0];
      }
      // Handle other object types
      else if (typeof campaign.startDate === 'object' && campaign.startDate !== null) {
        // If it's an object but not a Date, try to convert it to a Date
        try {
          // Use a function to safely get string representation
          const getStringRepresentation = (obj: unknown): string => {
            if (obj && typeof obj === 'object' && 'toString' in obj && typeof obj.toString === 'function') {
              return obj.toString();
            }
            return String(obj);
          };
          
          const dateString = getStringRepresentation(campaign.startDate);
          const dateObj = new Date(dateString);
          formattedDate = dateObj.toISOString().split('T')[0];
        } catch (dateError) {
          console.log('Failed to convert object to Date:', dateError);
          formattedDate = new Date().toISOString().split('T')[0];
        }
      } else {
        // If it's something else, use current date
        console.log('Unknown startDate format, using current date');
        formattedDate = new Date().toISOString().split('T')[0];
      }
    } else {
      // Default to current date if startDate is not available
      console.log('No startDate available, using current date');
      formattedDate = new Date().toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    formattedDate = new Date().toISOString().split('T')[0];
  }
  
  // Create the survey preview data
  return {
    id: campaign.id.toString(),
    campaignName: campaign.campaignName,
    date: formattedDate,
    brandName: brandName,
    brandLogo: campaign.logoUrl || "/images/brand-logo.png", // Placeholder logo if not available
    platforms: platforms,
    activePlatform: campaign.platform || platforms[0],
    adCreative: creativeAsset,
    adCaption: campaign.mainMessage || fallbackData?.adCaption || "Experience our products",
    adHashtags: campaign.hashtags || fallbackData?.adHashtags || "#brand #campaign",
    adMusic: campaign.musicTrack || fallbackData?.adMusic || "Brand Music Track",
    questions: questions,
    submissionStatus: 'draft'
  };
}

/**
 * Extracts brand name from campaign data
 */
function extractBrandName(campaign: ExtendedCampaign): string {
  if (campaign.brandName) {
    return campaign.brandName;
  }
  
  // Extract first word from campaign name as fallback
  return campaign.campaignName?.split(' ')[0] || 'Brand';
}

/**
 * Maps creative assets from campaign data
 */
function mapCreativeAsset(
  campaign: ExtendedCampaign,
  fallbackData?: SurveyPreviewData
): SurveyPreviewData['adCreative'] {
  // Find the primary creative asset
  let primaryCreative: Record<string, unknown> | null = null;
  
  if (campaign.creativeAssets && campaign.creativeAssets.length > 0) {
    primaryCreative = campaign.creativeAssets[0] as Record<string, unknown>;
  }
  
  // Use fallback data if available
  const defaultCreative = fallbackData?.adCreative || {
    id: 'asset1',
    type: imageType,
    url: "https://placehold.co/1080x1920/0f172a/f8fafc?text=Brand+Image",
    aspectRatio: "16:9",
    thumbnailUrl: "https://placehold.co/400x400/0f172a/f8fafc?text=Thumbnail",
    duration: 0
  };
  
  if (!primaryCreative) {
    return defaultCreative;
  }
  
  // Map the creative asset
  return {
    id: primaryCreative.id as string || defaultCreative.id,
    type: primaryCreative.type === 'video' ? videoType : imageType,
    url: primaryCreative.url as string || defaultCreative.url,
    aspectRatio: primaryCreative.aspectRatio as string || "16:9", // Default aspect ratio
    thumbnailUrl: (primaryCreative.thumbnailUrl as string) || (primaryCreative.url as string) || defaultCreative.thumbnailUrl,
    duration: primaryCreative.type === 'video' ? (primaryCreative.duration as number || 15) : 0
  };
}

/**
 * Maps platform data from campaign
 */
function mapPlatforms(campaign: ExtendedCampaign): Platform[] {
  // Start with the campaign platform
  const platforms: Platform[] = [];
  
  if (campaign.platform) {
    platforms.push(campaign.platform);
  }
  
  // Add other common platforms if not already included
  const commonPlatforms = [Platform.INSTAGRAM, Platform.TIKTOK, Platform.YOUTUBE];
  
  commonPlatforms.forEach(platform => {
    if (!platforms.includes(platform)) {
      platforms.push(platform);
    }
  });
  
  // Ensure we have at least one platform
  if (platforms.length === 0) {
    platforms.push(Platform.INSTAGRAM);
  }
  
  return platforms;
}

/**
 * Generates survey questions based on campaign KPIs
 */
export function generateQuestionsFromKPIs(
  primaryKPI: KPI, 
  secondaryKPIs: KPI[] = [], 
  brandName: string
): SurveyPreviewData['questions'] {
  const questions: SurveyPreviewData['questions'] = [];
  const allKPIs = [primaryKPI, ...secondaryKPIs];
  const processedKPIs = new Set<KPI>();
  
  // Process each KPI only once
  allKPIs.forEach(kpi => {
    if (!kpi || processedKPIs.has(kpi)) return;
    processedKPIs.add(kpi);
    
    // Generate question based on KPI type
    switch(kpi) {
      case KPI.BRAND_AWARENESS:
        questions.push({
          id: `q-${kpi}`,
          title: `Have you heard of ${brandName} before seeing this ad?`,
          type: "Single Choice",
          kpi: kpi,
          options: [
            { id: `q-${kpi}-o1`, text: "Yes, I know the brand well", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Know+Well" },
            { id: `q-${kpi}-o2`, text: "Yes, I've heard of it", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Heard+Of+It" },
            { id: `q-${kpi}-o3`, text: "No, I've never heard of it", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Never+Heard" }
          ],
          required: true
        });
        break;
      case KPI.AD_RECALL:
        questions.push({
          id: `q-${kpi}`,
          title: "Do you recall seeing this specific ad recently?",
          type: "Single Choice",
          kpi: kpi,
          options: [
            { id: `q-${kpi}-o1`, text: "Yes, definitely", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Definitely" },
            { id: `q-${kpi}-o2`, text: "Yes, I think so", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Think+So" },
            { id: `q-${kpi}-o3`, text: "No, I don't think so", image: "https://placehold.co/400x300/FFC107/FFFFFF?text=Don't+Think+So" },
            { id: `q-${kpi}-o4`, text: "No, definitely not", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Definitely+Not" }
          ],
          required: true
        });
        break;
      case KPI.CONSIDERATION:
        questions.push({
          id: `q-${kpi}`,
          title: `After seeing this ad, how likely are you to consider ${brandName} products?`,
          type: "Single Choice",
          kpi: kpi,
          options: [
            { id: `q-${kpi}-o1`, text: "Very likely", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Very+Likely" },
            { id: `q-${kpi}-o2`, text: "Somewhat likely", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Somewhat+Likely" },
            { id: `q-${kpi}-o3`, text: "Neither likely nor unlikely", image: "https://placehold.co/400x300/9E9E9E/FFFFFF?text=Neutral" },
            { id: `q-${kpi}-o4`, text: "Somewhat unlikely", image: "https://placehold.co/400x300/FF9800/FFFFFF?text=Somewhat+Unlikely" },
            { id: `q-${kpi}-o5`, text: "Very unlikely", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Very+Unlikely" }
          ],
          required: true
        });
        break;
      case KPI.MESSAGE_ASSOCIATION:
        questions.push({
          id: `q-${kpi}`,
          title: `What message do you associate with ${brandName} after seeing this ad?`,
          type: "Single Choice",
          kpi: kpi,
          options: [
            { id: `q-${kpi}-o1`, text: "Quality", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Quality" },
            { id: `q-${kpi}-o2`, text: "Innovation", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Innovation" },
            { id: `q-${kpi}-o3`, text: "Value", image: "https://placehold.co/400x300/9E9E9E/FFFFFF?text=Value" },
            { id: `q-${kpi}-o4`, text: "Sustainability", image: "https://placehold.co/400x300/FF9800/FFFFFF?text=Sustainability" },
            { id: `q-${kpi}-o5`, text: "Reliability", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Reliability" }
          ],
          required: true
        });
        break;
      case KPI.PURCHASE_INTENT:
        questions.push({
          id: `q-${kpi}`,
          title: `How likely are you to purchase from ${brandName} in the next month?`,
          type: "Single Choice",
          kpi: kpi,
          options: [
            { id: `q-${kpi}-o1`, text: "Definitely will purchase", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Definitely" },
            { id: `q-${kpi}-o2`, text: "Probably will purchase", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Probably" },
            { id: `q-${kpi}-o3`, text: "Might or might not purchase", image: "https://placehold.co/400x300/9E9E9E/FFFFFF?text=Maybe" },
            { id: `q-${kpi}-o4`, text: "Probably will not purchase", image: "https://placehold.co/400x300/FF9800/FFFFFF?text=Probably+Not" },
            { id: `q-${kpi}-o5`, text: "Definitely will not purchase", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Definitely+Not" }
          ],
          required: true
        });
        break;
      // Add other KPI types as needed
      default:
        // Default question for other KPIs
        questions.push({
          id: `q-${kpi}`,
          title: `How would you rate ${brandName} based on this ad?`,
          type: "Single Choice",
          kpi: kpi,
          options: [
            { id: `q-${kpi}-o1`, text: "Excellent", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Excellent" },
            { id: `q-${kpi}-o2`, text: "Good", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Good" },
            { id: `q-${kpi}-o3`, text: "Average", image: "https://placehold.co/400x300/9E9E9E/FFFFFF?text=Average" },
            { id: `q-${kpi}-o4`, text: "Poor", image: "https://placehold.co/400x300/FF9800/FFFFFF?text=Poor" },
            { id: `q-${kpi}-o5`, text: "Very Poor", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Very+Poor" }
          ],
          required: true
        });
    }
  });
  
  // Ensure we have at least one question
  if (questions.length === 0) {
    questions.push({
      id: 'q-default',
      title: `What do you think of this ${brandName} ad?`,
      type: "Single Choice",
      kpi: KPI.AD_RECALL,
      options: [
        { id: 'q-default-o1', text: "I like it a lot", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Like+A+Lot" },
        { id: 'q-default-o2', text: "I like it", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Like+It" },
        { id: 'q-default-o3', text: "Neutral", image: "https://placehold.co/400x300/9E9E9E/FFFFFF?text=Neutral" },
        { id: 'q-default-o4', text: "I don't like it", image: "https://placehold.co/400x300/FF9800/FFFFFF?text=Don't+Like" },
        { id: 'q-default-o5', text: "I don't like it at all", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Don't+Like+At+All" }
      ],
      required: true
    });
  }
  
  return questions;
} 