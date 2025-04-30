import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// Removed Prisma imports as we're fetching directly from InsightIQ for now
// import { PrismaClient, Platform, Prisma, MarketplaceInfluencer } from '@prisma/client';
import { logger } from '@/lib/logger';
import { InfluencerSummary } from '@/types/influencer'; // Use our frontend type
import { calculatePagination } from '@/lib/paginationUtils';
// Removed Justify Score import for now, will add back when mapping is stable
// import { calculateJustifyScoreV1 } from '@/lib/scoringService';
import { PlatformEnum } from '@/types/enums';
// Use named export for the new function
// Import the Profile type directly from its definition file
import { getInsightIQProfiles } from '@/lib/insightiqService';
import { InsightIQProfile } from '@/types/insightiq'; // Corrected import path for the type

// const prisma = new PrismaClient(); // No prisma needed for direct fetch

// Simplified Zod schema for direct InsightIQ call (MVP focuses on pagination)
const InfluencerQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(12),
});

// Helper function to map InsightIQ Platform name to our enum
function mapPlatformNameToEnum(platformName?: string | null): PlatformEnum | null {
  if (!platformName) return null;
  // Using direct comparison with potential PlatformEnum values (assuming title-case)
  if (platformName === PlatformEnum.Instagram) return PlatformEnum.Instagram;
  if (platformName === PlatformEnum.YouTube) return PlatformEnum.YouTube;
  if (platformName === PlatformEnum.TikTok) return PlatformEnum.TikTok;
  // Add other mappings if needed
  // Fallback check for uppercase, though primary check is title-case
  const upperCaseName = platformName.toUpperCase();
  if (upperCaseName === 'INSTAGRAM') return PlatformEnum.Instagram;
  if (upperCaseName === 'YOUTUBE') return PlatformEnum.YouTube;
  if (upperCaseName === 'TIKTOK') return PlatformEnum.TikTok;

  logger.warn(`[mapPlatformNameToEnum] Unknown platform name: ${platformName}`);
  return null;
}

export async function GET(request: NextRequest) {
  logger.info('[API /influencers] GET request received');
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  // --- Input Validation (Simplified for pagination) ---
  const validationResult = InfluencerQuerySchema.safeParse(queryParams);
  if (!validationResult.success) {
    logger.warn('[API /influencers] Invalid query parameters:', validationResult.error.flatten());
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid query parameters',
        details: validationResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { page, limit } = validationResult.data;
  const offset = (page - 1) * limit;

  logger.info(
    `[API /influencers] Requesting page ${page}, limit ${limit}, offset ${offset} from InsightIQ`
  );

  try {
    // Call the new function
    const insightiqResponse = await getInsightIQProfiles({ limit, offset });

    // Log response, handle null case explicitly
    if (insightiqResponse) {
      logger.debug({
        message: '[API /influencers] Raw response from getInsightIQProfiles',
        response: insightiqResponse, // Pass the actual response object here
      });
    } else {
      // Log only a message if the response is null
      logger.warn({ message: '[API /influencers] getInsightIQProfiles returned null.' });
    }

    if (!insightiqResponse?.data || !Array.isArray(insightiqResponse.data)) {
      // Corrected: Only log the message string when the structure is wrong
      logger.warn('[API /influencers] Unexpected response structure from InsightIQ.');
      return NextResponse.json({
        success: true,
        influencers: [],
        pagination: { currentPage: page, limit, totalInfluencers: 0, totalPages: 0 },
      });
    }

    // --- Map InsightIQ Profiles to InfluencerSummary ---
    const mappedInfluencers: InfluencerSummary[] = insightiqResponse.data
      // Use the correctly imported InsightIQProfile type
      .map((profile: InsightIQProfile): InfluencerSummary | null => {
        if (!profile || !profile.id || !profile.work_platform) {
          // Simplified logger warning call
          logger.warn({
            message: '[API /influencers] Skipping profile due to missing essential data',
            profileId: profile?.id || 'unknown',
          });
          return null;
        }

        const platformEnum = mapPlatformNameToEnum(profile.work_platform.name);
        const platforms = platformEnum ? [platformEnum] : [];

        // isVerified field is now present in InfluencerSummary type
        return {
          id: profile.id,
          name: profile.full_name || profile.platform_username || 'Unknown Name',
          handle: profile.platform_username || 'unknown_handle',
          avatarUrl: profile.image_url || '',
          platforms: platforms,
          followersCount: profile.reputation?.follower_count ?? 0,
          justifyScore: 50, // Placeholder
          isVerified: profile.is_verified ?? false, // Map directly
          primaryAudienceLocation: profile.country || null,
          primaryAudienceAgeRange: null,
          primaryAudienceGender: null,
          engagementRate: null,
          audienceQualityIndicator: null,
        };
      })
      // Explicitly type summary parameter here
      .filter(
        (summary: InfluencerSummary | null): summary is InfluencerSummary => summary !== null
      );

    // --- Determine Pagination ---
    const totalInfluencersFromMeta = insightiqResponse.metadata?.total; // Assuming 'total' might be the field
    const totalInfluencers =
      typeof totalInfluencersFromMeta === 'number'
        ? totalInfluencersFromMeta
        : offset + mappedInfluencers.length + (mappedInfluencers.length === limit ? 1 : 0); // Fallback estimation

    const totalPages = Math.ceil(totalInfluencers / limit);

    logger.info(`[API /influencers] Successfully mapped ${mappedInfluencers.length} influencers.`);

    const responsePayload = {
      success: true,
      influencers: mappedInfluencers,
      pagination: {
        currentPage: page,
        limit: limit,
        totalInfluencers: totalInfluencers,
        totalPages: totalPages,
      },
    };
    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown internal error during InsightIQ call';
    logger.error('[API /influencers] Error fetching or processing profiles from InsightIQ:', {
      error: message,
      originalError: error,
      query: queryParams,
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch influencers from external provider',
        details: message,
      },
      { status: 503 }
    );
  }
}
