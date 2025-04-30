import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  PrismaClient,
  Prisma,
  Platform,
  MarketplaceInfluencer,
  InsightIQAccountLink,
} from '@prisma/client';
import { logger } from '@/utils/logger';
import { InfluencerProfileData, AudienceDemographics, EngagementMetrics } from '@/types/influencer';
// Import InsightIQ service functions and types
import {
  getInsightIQProfileById,
  getInsightIQAudience, // Add function to get audience data
  fetchProfileByIdentifier,
} from '@/lib/insightiqService';
import {
  InsightIQProfile,
  InsightIQGetAudienceResponse,
  InsightIQDemographicsCountry,
  InsightIQDemographicsGenderAge,
} from '@/types/insightiq';
import { calculateJustifyScoreV1 } from '@/lib/scoringService';
import { PlatformEnum } from '@/types/enums';

const prisma = new PrismaClient();

// Schema to validate identifier (username/handle) and platformId
const ProfileIdentifierSchema = z.object({
  identifier: z.string().min(1, { message: 'Identifier cannot be empty' }),
  platformId: z.string().uuid({ message: 'Invalid Platform ID format' }), // platformId should be UUID
});

// Re-add the explicit type for the expected result of the Prisma query
type MarketplaceInfluencerWithLinks = MarketplaceInfluencer & {
  insightiqAccountLinks: InsightIQAccountLink[];
};

export async function GET(request: NextRequest, { params }: { params: { identifier: string } }) {
  // Await is no longer needed here as params is not a Promise in API routes by default
  const identifier = params.identifier;
  // Get platformId from query params
  const platformId = request.nextUrl.searchParams.get('platformId');

  logger.info(
    `[API /influencers/:identifier] GET request received for identifier: ${identifier}, platformId: ${platformId}`
  );

  // Validate identifier and platformId
  const validationResult = ProfileIdentifierSchema.safeParse({ identifier, platformId });
  if (!validationResult.success) {
    logger.warn(
      '[API /influencers/:identifier] Invalid identifier or platformId:',
      validationResult.error.flatten()
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Validation Error',
        details: validationResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const {
    /* validated identifier and platformId if needed, but already have them */
  } = validationResult.data;

  try {
    logger.info(
      `[API /influencers/:identifier] Attempting to fetch profile from InsightIQ for identifier: ${identifier}, platform: ${platformId}`
    );
    let profile: InsightIQProfile | null = null;
    try {
      // Call the new service function
      profile = await fetchProfileByIdentifier(identifier, platformId);
      logger.info(
        `[API /influencers/:identifier] Successfully fetched InsightIQ profile for identifier ${identifier}. Profile name: ${profile?.full_name}`
      );
    } catch (profileError: any) {
      // Log the raw error for debugging
      logger.error(
        `[API /influencers/:identifier] Error fetching InsightIQ profile for identifier ${identifier}:`,
        profileError // Log the whole error object if available
      );

      // Default error details
      let statusCode = 503; // Service Unavailable by default for external service errors
      let errorType = 'Service Error';
      let errorMessage = 'Failed to communicate with the data provider.';

      // Check for specific HTTP status codes from the service error
      if (profileError?.status) {
        switch (profileError.status) {
          case 404:
            statusCode = 404;
            errorType = 'Not Found';
            errorMessage = 'Influencer profile not found in the external provider.';
            logger.warn(
              `[API /influencers/:identifier] InsightIQ profile not found (404) for identifier: ${identifier}`
            );
            break;
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
          // Add cases for other relevant InsightIQ errors (e.g., 400 Bad Request)
          default:
            // Keep default 503 for other client/server errors from InsightIQ
            errorType = 'Provider Error';
            errorMessage = 'An unexpected error occurred with the data provider.';
            break;
        }
      } else if (profileError instanceof Error) {
        // Handle generic errors if status is not available
        errorMessage = profileError.message;
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

    if (!profile) {
      logger.error(
        `[API /influencers/:identifier] InsightIQ profile fetch succeeded but profile data is null/empty for identifier: ${identifier}`
      );
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve valid influencer details from provider' },
        { status: 500 }
      );
    }

    // --- Fetch Audience Data (Deferred for MVP) ---
    let audience: InsightIQGetAudienceResponse | null = null;
    logger.warn(
      `[API /influencers/:identifier] Skipping Audience fetch for MVP as DB link lookup was removed.`
    );

    // --- Calculate Score (Deferred for MVP) ---
    const justifyScore = calculateJustifyScoreV1(profile);
    logger.warn(
      `[API /influencers/:identifier] Skipping Score calculation for MVP as DB data is not used.`
    );

    // --- Construct Response (using ONLY InsightIQ `profile` data) ---
    // Fetching audience/engagement metrics requires separate calls/logic - deferred for MVP
    const audienceDemographics: AudienceDemographics | null = null;
    const engagementMetrics: EngagementMetrics | null = null;

    // Map directly available fields from InsightIQProfile
    const name = profile.full_name ?? profile.platform_username ?? null;
    const handle = profile.platform_username ?? null;
    const avatarUrl = profile.image_url ?? null;
    const followersCount = profile.reputation?.follower_count ?? null;
    const isVerified = profile.is_verified ?? false;
    const bio = profile.introduction ?? null;
    const website = profile.website ?? null;
    const category = profile.category ?? null;
    const primaryLocation = profile.country ?? null; // Use country as primary location indicator

    // Extract work email
    const contactEmail = profile.emails?.find(e => e.type === 'WORK')?.email_id ?? null;

    // Map platform - Requires a mapping function (assuming one exists or will be created)
    // Placeholder: Use the platform name directly, refine later if needed.
    const platformName = profile.work_platform?.name ?? null;
    const platforms: PlatformEnum[] = platformName ? [platformName as PlatformEnum] : []; // TODO: Implement robust mapping

    // Fields requiring separate audience/engagement data fetches (null for MVP)
    const primaryAgeRange = null;
    const primaryGender = null;
    const engagementRate = null;
    const audienceQualityIndicator = null;

    const responsePayload: InfluencerProfileData = {
      id: identifier, // Use the requested Justify ID
      name: name,
      handle: handle,
      avatarUrl: avatarUrl,
      platforms: platforms, // Mapped platform
      followersCount: followersCount,
      justifyScore: justifyScore,
      isVerified: isVerified,
      primaryAudienceLocation: primaryLocation, // Using country for now
      primaryAudienceAgeRange: primaryAgeRange, // Null for MVP
      primaryAudienceGender: primaryGender, // Null for MVP
      engagementRate: engagementRate, // Null for MVP
      audienceQualityIndicator: audienceQualityIndicator, // Null for MVP
      bio: bio,
      contactEmail: contactEmail,
      audienceDemographics: audienceDemographics, // Null for MVP
      engagementMetrics: engagementMetrics, // Null for MVP
      website: website,
      category: category,
    };

    return NextResponse.json({ success: true, data: responsePayload });
  } catch (error: unknown) {
    // Catch unexpected errors outside the specific InsightIQ fetch block
    const message = error instanceof Error ? error.message : 'Unknown internal error';
    logger.error(
      `[API /influencers/:identifier] Unexpected error processing influencer ${identifier}:`,
      message,
      error
    );
    return NextResponse.json(
      { success: false, error: 'Failed to process influencer details', details: message },
      { status: 500 }
    );
  }
}
