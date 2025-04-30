import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient, Platform, Prisma, MarketplaceInfluencer } from '@prisma/client';
import { logger } from '@/lib/logger';
import { InfluencerSummary } from '@/types/influencer'; // Use our frontend type
import { calculatePagination } from '@/lib/paginationUtils';
// Re-import scoring service
import { calculateJustifyScoreV1 } from '@/lib/scoringService';
import { PlatformEnum } from '@/types/enums';
// Use named export for the new function
// Import the Profile type directly from its definition file
import { getInsightIQProfiles } from '@/lib/insightiqService';
import { InsightIQProfile } from '@/types/insightiq'; // Corrected import path for the type
import { getInsightIQWorkPlatformId } from '@/lib/insightiqUtils'; // Import the utility function

const prisma = new PrismaClient(); // No prisma needed for direct fetch

// Zod schema for query parameters, including filters
const InfluencerQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(12),
  // Filters (optional)
  platforms: z
    .string()
    .transform(val => val.split(',').map(p => p.trim().toUpperCase() as PlatformEnum))
    .optional(), // Expect comma-separated string, transform to PlatformEnum array
  minFollowers: z.coerce.number().int().positive().optional(),
  maxFollowers: z.coerce.number().int().positive().optional(),
  isVerified: z
    .string()
    .transform(val => val.toLowerCase() === 'true')
    .optional(), // Expect 'true' or 'false' string
  // TODO: Add other filters as needed (e.g., audienceLocation, audienceAge)
  // minScore: z.coerce.number().min(0).max(100).optional(), // Justify Score filtering is BE logic
});

// Helper function to map InsightIQ Platform name to our enum
function mapPlatformNameToEnum(platformName?: string | null): PlatformEnum | null {
  if (!platformName) return null;

  const nameLower = platformName.toLowerCase();

  switch (nameLower) {
    case 'instagram':
      return PlatformEnum.Instagram;
    case 'youtube':
      return PlatformEnum.YouTube;
    case 'tiktok':
      return PlatformEnum.TikTok;
    case 'twitter':
    case 'x': // Handle 'X' as Twitter
      return PlatformEnum.Twitter;
    case 'facebook':
      return PlatformEnum.Facebook;
    case 'twitch':
      return PlatformEnum.Twitch;
    case 'pinterest':
      return PlatformEnum.Pinterest;
    case 'linkedin':
      return PlatformEnum.LinkedIn;
    // Add other explicit mappings as needed based on InsightIQ platform names
    // case 'substack': return PlatformEnum.Substack; // Example if needed
    // case 'discord': return PlatformEnum.Discord; // Example if needed
    default:
      logger.warn(`[mapPlatformNameToEnum] Unknown or unmapped platform name: ${platformName}`);
      // Consider returning a default like PlatformEnum.Other if you have one,
      // otherwise return null for unmapped platforms.
      return null;
  }
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

  const { page, limit, platforms, minFollowers, maxFollowers, isVerified } = validationResult.data;
  const offset = (page - 1) * limit;

  // Construct filters object for the service layer
  const filtersForService = {
    ...(platforms && { platforms }),
    ...(minFollowers !== undefined && { follower_count: { min: minFollowers } }), // Map to potential InsightIQ filter structure
    ...(maxFollowers !== undefined && { follower_count: { max: maxFollowers } }), // Map to potential InsightIQ filter structure
    ...(isVerified !== undefined && { is_verified: isVerified }), // Map to potential InsightIQ filter structure
    // TODO: Map other filters like audienceLocation, audienceAge when added and InsightIQ capability confirmed
  };

  logger.info(
    `[API /influencers] Requesting page ${page}, limit ${limit}, offset ${offset} from InsightIQ with filters:`,
    filtersForService
  );

  try {
    // Call the service function, passing pagination and filters
    const insightiqResponse = await getInsightIQProfiles({
      limit,
      offset,
      filters: filtersForService, // Pass the constructed filters object
    });

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
      .map((profile: InsightIQProfile): InfluencerSummary | null => {
        // NOTE: Mapping from search result structure which differs from full Profile schema

        // Determine the platform searched for (passed in the filters)
        // Use the filters that were actually passed to the service call
        const platformEnum = filtersForService.platforms?.[0] ?? PlatformEnum.Instagram; // Default if somehow missing
        const platforms = [platformEnum];

        // Basic check: Use platform_username as it's required in the base search result schema
        if (!profile?.platform_username) {
          logger.warn({
            message:
              '[API /influencers] Skipping profile due to missing platform_username in search result',
          });
          return null;
        }

        // Map fields based on available data in InsightIQProfile and target InfluencerSummary
        const summary: InfluencerSummary = {
          id: profile.platform_username, // Use username as list key
          name: profile.full_name ?? profile.platform_username,
          handle: profile.platform_username,
          avatarUrl: profile.image_url ?? null,
          platforms: platforms,
          followersCount: profile.reputation?.follower_count ?? null, // followers is nested under reputation
          justifyScore: calculateJustifyScoreV1(profile), // Pass the profile data
          isVerified: profile.is_verified ?? false,
          isBusinessAccount: profile.is_business ?? null,
          primaryAudienceLocation: profile.country ?? null,
          primaryAudienceAgeRange: null, // Not in basic profile/search result
          primaryAudienceGender: null, // Not in basic profile/search result
          engagementRate: null, // Not directly in basic profile/search result
          audienceQualityIndicator: null, // Not in basic profile/search result
          insightiqUserId: profile.user?.id ?? null,
          insightiqAccountId: profile.account?.id ?? null,
          workPlatformId: getInsightIQWorkPlatformId(platformEnum),
          platformProfileName:
            profile.platform_profile_name ?? profile.full_name ?? profile.platform_username,
        };
        return summary;
      })
      .filter((summary): summary is InfluencerSummary => summary !== null);

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

    // Log the final payload being returned
    logger.debug('[API /influencers] Returning payload:', responsePayload);

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    // Log the raw error for debugging
    logger.error('[API /influencers] Error fetching or processing profiles from InsightIQ:', {
      // error: message, // Replaced below
      originalError: error,
      query: queryParams,
    });

    // Default error details
    let statusCode = 503; // Service Unavailable by default for external service errors
    let errorType = 'Service Error';
    let errorMessage = 'Failed to communicate with the data provider.';

    // Check for specific HTTP status codes from the service error
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const serviceError = error as { status?: number; message?: string };
      if (serviceError.status) {
        switch (serviceError.status) {
          case 401: // Unauthorized (e.g., invalid API key)
            statusCode = 500; // Return 500 Internal Server Error as it's a config issue
            errorType = 'Configuration Error';
            errorMessage = 'Authentication failed with the data provider.';
            break;
          case 429: // Rate Limit Exceeded
            statusCode = 429;
            errorType = 'Rate Limit Exceeded';
            errorMessage = 'Rate limit exceeded with the data provider. Please try again later.';
            break;
          // Add cases for other relevant InsightIQ list/search errors (e.g., 400 Bad Request)
          // Note: 404 is less likely for a list endpoint unless filters are invalid
          default:
            // Keep default 503 for other client/server errors from InsightIQ
            errorType = 'Provider Error';
            errorMessage =
              serviceError.message || 'An unexpected error occurred with the data provider.';
            statusCode = serviceError.status >= 500 ? 503 : 400; // Adjust based on error type
            break;
        }
      }
    } else if (error instanceof Error) {
      // Handle generic errors if status is not available
      errorMessage = error.message;
      statusCode = 500; // Treat as internal error if status unknown
      errorType = 'Internal Error';
    }

    return NextResponse.json(
      {
        success: false,
        error: errorType,
        details: errorMessage,
      },
      { status: statusCode }
    );
  }
}
