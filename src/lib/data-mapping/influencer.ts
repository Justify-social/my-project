// src/lib/data-mapping/influencer.ts

import { InsightIQProfile, InsightIQSearchProfile } from '@/types/insightiq';
import { InfluencerProfileData, InfluencerSummary } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { logger } from '@/utils/logger';
import { calculateDiscoveryScore, calculateFullJustifyScore } from '@/lib/scoringService';
import { getInsightIQWorkPlatformId as _getInsightIQWorkPlatformId } from '@/lib/insightiqUtils';
import { Platform as PlatformBackend } from '@prisma/client';
import { getProfileUniqueId as _getProfileUniqueId } from '@/lib/insightiqService';

// Type for contact details from InsightIQ API
interface ContactDetail {
  type: string;
  value: string;
}

// Extended interface for InsightIQ profile with all analytics fields
type ExtendedInsightIQProfile = InsightIQProfile & {
  // Audience analytics fields
  audience?: {
    countries?: Array<{ code: string; value: number }>;
    cities?: Array<{ name: string; value: number }>;
    gender_age_distribution?: Array<{ gender: string; age_range: string; value: number }>;
    ethnicities?: Array<{ name: string; value: number }>;
    languages?: Array<{ name: string; value: number }>;
    brand_affinity?: Array<{ name: string; percentage: number; logo_url?: string }>;
    interests?: Array<{ name: string; value: number }>;
    follower_types?: Array<{ name: string; value: number }>;
    credibility_score?: number;
    credibility_score_band?: Array<{ min: number; max: number; total_profile_count: number }>;
    significant_followers_percentage?: number;
    significant_followers?: {
      platform_username: string;
      image_url?: string;
      is_verified?: boolean;
      follower_count?: number;
    };
    lookalikes?: Array<unknown>;
  };

  // Engagement metrics fields
  average_likes?: number;
  average_comments?: number;
  average_views?: number;
  average_reels_views?: number;

  // Contact details
  contact_details?: Array<{ type: string; value: string }>;

  // Reputation history
  reputation_history?: Array<{
    month: string;
    follower_count?: number;
    following_count?: number;
    average_likes?: number;
    subscriber_count?: number;
  }>;

  // Creator brand affinity
  brand_affinity?: Array<{
    name: string;
    value: number;
    category?: string;
    logo_url?: string;
  }>;

  // Content data
  top_contents?: Array<unknown>;
  recent_contents?: Array<unknown>;
  sponsored_contents?: Array<unknown>;
  content_count?: number;
  sponsored_posts_performance?: number;

  // Hashtags and mentions
  top_hashtags?: Array<{ name: string }>;
  top_mentions?: Array<{ name: string }>;
  top_interests?: Array<{ name: string }>;

  // Location data
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };

  // Audience likers data
  audience_likers?: {
    significant_likers_percentage?: number;
    significant_likers?: Array<{
      platform_username: string;
      image_url?: string;
      is_verified?: boolean;
      follower_count?: number;
    }>;
    countries?: Array<{ code: string; value: number }>;
    credibility_score?: number;
  };

  // Engagement rate histogram
  engagement_rate_histogram?: Array<{
    engagement_rate_band?: { min: number; max: number };
    count?: number;
  }>;

  // Lookalikes
  lookalikes?: Array<{
    platform_username: string;
    image_url?: string;
    is_verified?: boolean;
    follower_count?: number;
    category?: string;
    similarity_score?: number;
    engagement_rate?: number;
    average_likes?: number;
    country?: string;
  }>;

  // Pricing information
  pricing?: {
    currency?: string;
    post_type?: Record<string, { min?: number; max?: number }>;
  };

  // Pricing explanations
  pricing_explanations?: Record<string, { level: string; description: string }>;

  // Creator demographics (using gender from base InsightIQProfile)
  age_group?: string;
  language?: string;
};

/**
 * Maps an InsightIQ platform name string to our PlatformEnum.
 * Logs a warning for unmapped platforms.
 * @param platformName - The platform name string from InsightIQ.
 * @returns The corresponding PlatformEnum or null if unmapped.
 */
const mapInsightIQPlatformToEnum = (
  platformName: string | null | undefined
): PlatformEnum | null => {
  if (!platformName) return null;

  const lowerPlatformName = platformName.toLowerCase();
  switch (lowerPlatformName) {
    case 'instagram':
      return PlatformEnum.Instagram;
    case 'youtube':
      return PlatformEnum.YouTube;
    case 'tiktok':
      return PlatformEnum.TikTok;
    case 'x': // Handle 'X'
    case 'twitter': // Handle potential 'twitter'
      return PlatformEnum.Twitter;
    case 'facebook': // Handle 'Facebook'
      return PlatformEnum.Facebook;
    case 'twitch': // Handle 'Twitch'
      return PlatformEnum.Twitch;
    // Add other mappings as needed based on InsightIQ possible values
    default:
      logger.warn(
        `[mapInsightIQPlatformToEnum] Unmapped InsightIQ platform name encountered: ${platformName}`
      );
      return null;
  }
};

/**
 * Helper to map Backend Platform array (from Prisma) to Frontend PlatformEnum array.
 * Logs warnings for unknown values.
 */
const mapPlatformsToFrontend = (backendPlatforms: PlatformBackend[]): PlatformEnum[] => {
  const mapped = backendPlatforms.map(bp => {
    switch (bp) {
      case PlatformBackend.INSTAGRAM:
        return PlatformEnum.Instagram;
      case PlatformBackend.YOUTUBE:
        return PlatformEnum.YouTube;
      case PlatformBackend.TIKTOK:
        return PlatformEnum.TikTok;
      // Add cases for other PlatformBackend values if they exist
      default:
        logger.warn(
          `[mapPlatformsToFrontend] Unknown PlatformBackend enum value encountered: ${bp}`
        );
        return null;
    }
  });
  // Filter out nulls and assert type
  return mapped.filter(platform => platform !== null) as PlatformEnum[];
};

/**
 * Maps an InsightIQProfile object (full profile data) to the frontend InfluencerProfileData structure.
 * Handles mapping fields available in the full profile.
 * @param profile - The full profile data received from InsightIQ (should include reputation).
 * @param uniqueId - The identifier used for the request (external_id or composite key), used as fallback and ID.
 * @returns InfluencerProfileData object.
 */
export const mapInsightIQProfileToInfluencerProfileData = (
  profile: ExtendedInsightIQProfile,
  uniqueId: string
): InfluencerProfileData => {
  const handle =
    profile.platform_username ?? (profile.url ? profile.url.split('/').pop() : null) ?? null;
  const name = profile.full_name ?? handle ?? uniqueId ?? 'Unknown Name';
  const platformEnum = mapInsightIQPlatformToEnum(profile.work_platform?.name);

  logger.debug('[mapInsightIQProfileToInfluencerProfileData] Raw InsightIQ Profile:', profile);
  const calculatedScore = calculateFullJustifyScore(
    profile as Parameters<typeof calculateFullJustifyScore>[0]
  );
  logger.debug(
    `[mapInsightIQProfileToInfluencerProfileData] Calculated Score for ${uniqueId}: ${calculatedScore}`
  );

  // Extract audience demographics from InsightIQ profile with analytics
  // Note: Using 'as any' type assertion due to structural differences between
  // InsightIQ API response format and internal AudienceDemographics type.
  // The external API uses different enum values that don't match our internal types.
  const audienceDemographics = profile.audience
    ? {
        countries: profile.audience.countries || [],
        cities: profile.audience.cities || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gender_age_distribution: (profile.audience.gender_age_distribution || null) as any,
        // Add other audience fields from InsightIQ API
        ethnicities: profile.audience.ethnicities || [],
        languages: profile.audience.languages || [],
        brand_affinity: profile.audience.brand_affinity || [],
        interests: profile.audience.interests || [],
        follower_types: profile.audience.follower_types || [],
        credibility_score: profile.audience.credibility_score,
        credibility_score_band: profile.audience.credibility_score_band || [],
        significant_followers_percentage: profile.audience.significant_followers_percentage,
        significant_followers: profile.audience.significant_followers,
        lookalikes: profile.audience.lookalikes || [],
      }
    : null;

  // Extract engagement metrics from InsightIQ profile with analytics
  const engagementMetrics = {
    averageLikes: profile.average_likes || null,
    averageComments: profile.average_comments || null,
    averageViews: profile.average_views || null,
    averageReelsViews: profile.average_reels_views || null,
    averageShares: null, // Not directly available in InsightIQ
  };

  // Extract contact details from InsightIQ API response
  const contactDetails = profile.contact_details || [];
  const extractedContacts = {
    email:
      contactDetails.find((c: ContactDetail) => c.type?.toLowerCase().includes('email'))?.value ||
      null,
    phone:
      contactDetails.find((c: ContactDetail) => c.type?.toLowerCase().includes('phone'))?.value ||
      null,
    twitter:
      contactDetails.find((c: ContactDetail) => c.type?.toLowerCase().includes('twitter'))?.value ||
      null,
    website:
      contactDetails.find((c: ContactDetail) => c.type?.toLowerCase().includes('website'))?.value ||
      null,
    other:
      contactDetails.filter(
        (c: ContactDetail) =>
          !['email', 'phone', 'twitter', 'website'].some(type =>
            c.type?.toLowerCase().includes(type)
          )
      ) || [],
  };

  // Extract reputation history
  const reputationHistory = profile.reputation_history || [];

  // Extract brand affinity for the creator (not audience)
  const creatorBrandAffinity = profile.brand_affinity || [];

  // Extract content data
  const contentData = {
    topContents: profile.top_contents || [],
    recentContents: profile.recent_contents || [],
    sponsoredContents: profile.sponsored_contents || [],
    contentCount: profile.content_count || null,
    sponsoredPostsPerformance: profile.sponsored_posts_performance || null,
  };

  // Extract hashtags and mentions
  const hashtagsAndMentions = {
    topHashtags: profile.top_hashtags || [],
    topMentions: profile.top_mentions || [],
    topInterests: profile.top_interests || [],
  };

  // Extract location data
  const locationData = profile.location
    ? {
        city: profile.location.city || null,
        state: profile.location.state || null,
        country: profile.location.country || null,
      }
    : null;

  // Extract audience likers data (separate from followers)
  const audienceLikers = profile.audience_likers || null;

  // Extract engagement rate histogram
  const engagementRateHistogram = profile.engagement_rate_histogram || [];

  // Extract lookalikes
  const lookalikes = profile.lookalikes || [];

  // Extract pricing information
  const pricingData = profile.pricing || null;
  const pricingExplanations = profile.pricing_explanations || null;

  // Extract creator demographics
  const creatorDemographics = {
    gender: profile.gender || null,
    ageGroup: profile.age_group || null,
    language: profile.language || null,
  };

  const profileData: InfluencerProfileData = {
    id: uniqueId,
    name: name,
    handle: handle,
    avatarUrl: profile.image_url ?? null,
    platforms: platformEnum ? [platformEnum] : [],
    followersCount: profile.reputation?.follower_count ?? null,
    justifyScore: calculatedScore,
    isVerified: profile.is_verified ?? false,
    isBusinessAccount: profile.is_business ?? profile.platform_account_type === 'BUSINESS',
    primaryAudienceLocation: profile.country ?? profile.creator_location?.country ?? null,
    primaryAudienceAgeRange: null,
    primaryAudienceGender: null,
    engagementRate: profile.engagement_rate ?? null,
    audienceQualityIndicator: null,
    insightiqUserId: profile.user?.id ?? null,
    insightiqAccountId: profile.account?.id ?? null,
    workPlatformId: profile.work_platform?.id ?? null,
    platformProfileName: profile.platform_profile_name ?? name,
    profileId: profile.external_id ?? uniqueId,
    platformSpecificId: profile.platform_profile_id ?? profile.external_id ?? null,
    bio: profile.introduction ?? null,
    contactEmail:
      profile.emails?.find(e => e.type === 'WORK')?.email_id ??
      profile.emails?.[0]?.email_id ??
      extractedContacts.email,
    audienceDemographics: audienceDemographics,
    engagementMetrics: engagementMetrics,
    website: profile.website ?? extractedContacts.website,
    category: profile.category ?? null,
  };

  // Store the comprehensive InsightIQ data with all extracted analytics
  (profileData as Record<string, unknown> & InfluencerProfileData).insightiq = {
    profile: profile,
    audience: {
      ...audienceDemographics,
      audienceLikers: audienceLikers,
    },
    content: {
      ...contentData,
      ...hashtagsAndMentions,
    },
    engagement: {
      ...engagementMetrics,
      engagementRateHistogram: engagementRateHistogram,
    },
    contacts: extractedContacts,
    demographics: {
      creator: creatorDemographics,
      location: locationData,
    },
    analytics: {
      reputationHistory: reputationHistory,
      creatorBrandAffinity: creatorBrandAffinity,
      lookalikes: lookalikes,
    },
    pricing: {
      pricing: pricingData,
      explanations: pricingExplanations,
    },
    top_contents: profile.top_contents,
    recent_contents: profile.recent_contents,
    sponsored_contents: profile.sponsored_contents,
    top_hashtags: profile.top_hashtags,
    top_mentions: profile.top_mentions,
  };

  if (!profileData.profileId) {
    logger.warn(
      `[mapInsightIQProfileToInfluencerProfileData] Mapped profile is missing profileId (external_id). Identifier: ${uniqueId}`
    );
  }
  if (!profileData.platformSpecificId) {
    logger.warn(
      `[mapInsightIQProfileToInfluencerProfileData] Mapped profile is missing platformSpecificId (platform_profile_id). Identifier: ${uniqueId}`
    );
  }

  // Log successful extraction of audience data
  if (audienceDemographics) {
    logger.info(
      `[mapInsightIQProfileToInfluencerProfileData] Successfully extracted audience analytics for ${uniqueId}: ${Object.keys(audienceDemographics).length} fields`
    );
  }

  return profileData;
};

/**
 * Maps raw InsightIQ search profile data to our InfluencerSummary type.
 * Handles potential null values and extracts key information.
 */
export const mapInsightIQProfileToInfluencerSummary = (
  profile: InsightIQSearchProfile
): Omit<InfluencerSummary, 'id' | 'platformEnum'> & { platformEnum: PlatformEnum | null } => {
  const platformEnum = mapInsightIQPlatformToEnum(profile.work_platform?.name);
  const handle =
    profile.platform_username ?? (profile.url ? profile.url.split('/').pop() : null) ?? null;

  if (!platformEnum) {
    // Handle case where platform couldn't be mapped
    logger.warn(`[mapInsightIQProfileToInfluencerSummary] Could not map platform for profile`, {
      profile,
    });
    // Return minimal object matching the adjusted return type
    return {
      name: profile.full_name ?? handle ?? 'Unknown',
      handle: handle,
      avatarUrl: profile.image_url ?? null,
      platforms: [], // Empty platform list
      followersCount: profile.follower_count ?? null,
      justifyScore: 50, // Default score
      isVerified: profile.is_verified ?? false,
      platformProfileName: profile.full_name ?? handle,
      profileId: profile.external_id ?? null,
      platformSpecificId: null,
      workPlatformId: profile.work_platform?.id ?? null,
      isBusinessAccount: profile.platform_account_type === 'BUSINESS',
      primaryAudienceLocation: profile.creator_location?.country ?? null,
      engagementRate: profile.engagement_rate ?? null,
      platformEnum: null, // Explicitly return null for platformEnum
    };
  }

  logger.debug('[mapInsightIQProfileToInfluencerSummary] Raw InsightIQ Search Profile:', profile);
  const calculatedSummaryScore = calculateDiscoveryScore(profile);
  logger.debug(
    `[mapInsightIQProfileToInfluencerSummary] Calculated Score for ${profile.platform_username}: ${calculatedSummaryScore}`
  );

  const summary: Omit<InfluencerSummary, 'id' | 'platformEnum'> & { platformEnum: PlatformEnum } = {
    name: profile.full_name ?? handle ?? 'Unknown Name',
    handle: handle,
    avatarUrl: profile.image_url ?? null,
    platforms: [platformEnum], // Keep original platform array for display
    followersCount: profile.follower_count ?? null,
    justifyScore: calculatedSummaryScore,
    isVerified: profile.is_verified ?? false,
    isBusinessAccount: profile.platform_account_type === 'BUSINESS',
    primaryAudienceLocation: profile.creator_location?.country ?? null,
    primaryAudienceAgeRange: null, // Needs Audience API data
    primaryAudienceGender: null, // Needs Audience API data
    engagementRate: profile.engagement_rate ?? null,
    audienceQualityIndicator: null, // Needs Audience API data or calculation
    insightiqUserId: null, // Not available in search results
    insightiqAccountId: null, // Not available in search results
    workPlatformId: profile.work_platform?.id ?? null,
    platformProfileName: profile.full_name ?? handle, // Use full_name or handle
    profileId: profile.external_id ?? null,
    platformSpecificId: null, // May need enrichment later
    platformEnum: platformEnum, // Add the mapped enum
  };

  return summary;
};

/**
 * Type representing the data selected from Prisma in the summaries route.
 * Includes necessary fields for mapping to InfluencerSummary.
 */
type PrismaInfluencerSummaryData = {
  id: string;
  name: string | null;
  handle: string | null;
  avatarUrl: string | null;
  platforms: PlatformBackend[]; // Use Prisma enum type
  followersCount: number | null;
  isInsightIQVerified: boolean | null;
  primaryAudienceLocation: string | null;
  primaryAudienceAgeRange: string | null;
  primaryAudienceGender: string | null;
  engagementRate: number | null;
  audienceQualityIndicator: string | null;
  insightiqUserId: string | null;
  // Add justifyScore if it's actually stored or calculated based on DB fields
  // For now, assume score is calculated elsewhere or not included in summary directly from DB
};

/**
 * Maps data fetched from Prisma (MarketplaceInfluencer selection) to the frontend InfluencerSummary structure.
 * @param dbInfluencer - The influencer data selected from Prisma.
 * @returns InfluencerSummary object.
 */
export const mapPrismaInfluencerToSummary = (
  dbInfluencer: PrismaInfluencerSummaryData
): InfluencerSummary => {
  // Map platforms using the helper defined in this file
  const mappedPlatforms = mapPlatformsToFrontend(dbInfluencer.platforms);

  // Validate enums before assigning
  const validGenders = ['Male', 'Female', 'Other', 'Mixed'];
  const gender = validGenders.includes(dbInfluencer.primaryAudienceGender ?? '')
    ? (dbInfluencer.primaryAudienceGender as 'Male' | 'Female' | 'Other' | 'Mixed')
    : undefined;

  const validIndicators = ['High', 'Medium', 'Low'];
  const qualityIndicator = validIndicators.includes(dbInfluencer.audienceQualityIndicator ?? '')
    ? (dbInfluencer.audienceQualityIndicator as 'High' | 'Medium' | 'Low')
    : undefined;

  // Calculate score - Assuming calculateJustifyScoreV1 can work with this Prisma subset
  // Or, if score needs InsightIQ data, it shouldn't be calculated here for summaries from DB.
  // Let's omit score calculation here, assuming it's done elsewhere or not part of pure DB summary.
  // const justifyScore = calculateJustifyScoreV1(dbInfluencer as any);

  const summary: InfluencerSummary = {
    id: dbInfluencer.id,
    name: dbInfluencer.name,
    handle: dbInfluencer.handle,
    avatarUrl: dbInfluencer.avatarUrl ?? '',
    platforms: mappedPlatforms,
    followersCount: dbInfluencer.followersCount ?? 0,
    justifyScore: 0, // Placeholder - Score likely needs more data than DB summary provides
    isVerified: dbInfluencer.isInsightIQVerified ?? false,
    primaryAudienceLocation: dbInfluencer.primaryAudienceLocation ?? undefined,
    primaryAudienceAgeRange: dbInfluencer.primaryAudienceAgeRange ?? undefined,
    primaryAudienceGender: gender,
    engagementRate: dbInfluencer.engagementRate ?? undefined,
    audienceQualityIndicator: qualityIndicator,
    insightiqUserId: dbInfluencer.insightiqUserId,
    // These fields might not be directly available in MarketplaceInfluencer model
    // workPlatformId: undefined, // Cannot reliably get this without joining/mapping
    // platformProfileName: undefined,
    // isBusinessAccount: undefined, // Not in select
  };

  return summary;
};
