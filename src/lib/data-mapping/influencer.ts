// src/lib/data-mapping/influencer.ts

import { InsightIQProfile, InsightIQSearchProfile } from '@/types/insightiq';
import { InfluencerProfileData, InfluencerSummary } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { logger } from '@/utils/logger';
import { calculateJustifyScoreV1 } from '@/lib/scoringService'; // Assuming score is calculated here
import { getInsightIQWorkPlatformId } from '@/lib/insightiqUtils';
import { Platform as PlatformBackend } from '@prisma/client';
import { getProfileUniqueId } from '@/lib/insightiqService';

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
 * @param profile - The full profile data received from InsightIQ (e.g., via GET /v1/profiles/{id}).
 * @param uniqueId - The identifier used for the request (external_id or composite key), used as fallback and ID.
 * @returns InfluencerProfileData object.
 */
export const mapInsightIQProfileToInfluencerProfileData = (
  profile: InsightIQProfile,
  uniqueId: string
): InfluencerProfileData => {
  const handle =
    profile.platform_username ?? (profile.url ? profile.url.split('/').pop() : null) ?? null;
  const name = profile.full_name ?? handle ?? uniqueId ?? 'Unknown Name';
  const platformEnum = mapInsightIQPlatformToEnum(profile.work_platform?.name);

  const profileData: InfluencerProfileData = {
    id: uniqueId,
    name: name,
    handle: handle,
    avatarUrl: profile.image_url ?? null,
    platforms: platformEnum ? [platformEnum] : [],
    followersCount: profile.follower_count ?? profile.reputation?.follower_count ?? null,
    justifyScore: calculateJustifyScore(profile),
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
      null,
    audienceDemographics: null,
    engagementMetrics: null,
    website: profile.website ?? null,
    category: profile.category ?? null,
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

  return profileData;
};

/**
 * Maps an InsightIQProfile object (potentially from a search result) to the frontend InfluencerSummary structure.
 * Handles potential missing fields in search results.
 * @param profile - The profile data received from InsightIQ search.
 * @param filteredPlatform - The platform enum value used to filter the search, if any.
 * @returns InfluencerSummary object or null if essential data (like handle) is missing.
 */
export const mapInsightIQProfileToInfluencerSummary = (
  profile: InsightIQSearchProfile
): Omit<InfluencerSummary, 'id'> => {
  // Helper accepts InsightIQSearchProfile
  // const uniqueId = getProfileUniqueId(profile);
  // Platform enum mapping helper
  const platformEnum = mapInsightIQPlatformToEnum(profile.work_platform?.name);
  // Derive handle
  const handle =
    profile.platform_username ?? (profile.url ? profile.url.split('/').pop() : null) ?? null;

  if (!platformEnum) {
    // Handle case where platform couldn't be mapped (should be rare)
    logger.warn(`[mapInsightIQProfileToInfluencerSummary] Could not map platform for profile`, {
      profile,
    });
    // Return a minimal object or throw error? For now, return minimal with warning.
    return {
      name: profile.full_name ?? handle ?? 'Unknown',
      handle: handle,
      avatarUrl: profile.image_url ?? null,
      platforms: [], // Empty platform
      followersCount: profile.follower_count ?? null,
      justifyScore: 50, // Default score if platform unknown
      isVerified: profile.is_verified ?? false,
      platformProfileName: profile.full_name ?? handle,
      profileId: profile.external_id ?? null, // Use external_id if present
      platformSpecificId: null, // Cannot get this from search
      workPlatformId: profile.work_platform?.id ?? null,
      isBusinessAccount: profile.platform_account_type === 'BUSINESS', // Map account type
      primaryAudienceLocation: profile.creator_location?.country ?? null,
      engagementRate: profile.engagement_rate ?? null,
    };
  }

  // Map fields based on available data from /search response
  const summary: Omit<InfluencerSummary, 'id'> = {
    name: profile.full_name ?? handle ?? 'Unknown Name',
    handle: handle,
    avatarUrl: profile.image_url ?? null,
    platforms: [platformEnum],
    followersCount: profile.follower_count ?? null,
    justifyScore: calculateJustifyScore(profile),
    isVerified: profile.is_verified ?? false,
    isBusinessAccount: profile.platform_account_type === 'BUSINESS',
    primaryAudienceLocation: profile.creator_location?.country ?? null,
    primaryAudienceAgeRange: null,
    primaryAudienceGender: null,
    engagementRate: profile.engagement_rate ?? null,
    audienceQualityIndicator: null,
    insightiqUserId: null,
    insightiqAccountId: null,
    workPlatformId: profile.work_platform?.id ?? null,
    platformProfileName: profile.full_name ?? handle,
    profileId: profile.external_id ?? null,
    platformSpecificId: null,
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

// Helper to calculate score based on available data (Search or Full Profile)
// Might need refinement if full profile offers better metrics for scoring.
const calculateJustifyScore = (profile: InsightIQSearchProfile | InsightIQProfile): number => {
  const followerScore = Math.min(profile.follower_count ?? 0, 1000000000) / 10000000;
  const engagementScore = (profile.engagement_rate ?? 0) * 1000;
  const verifiedBonus = profile.is_verified ? 10 : 0;
  // Simple score based on available data, refine later
  return Math.min(Math.round(followerScore + engagementScore + verifiedBonus), 100) || 50;
};
