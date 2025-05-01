import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import {
  getSingleInsightIQProfileAnalytics, // Updated service function
} from '@/lib/insightiqService';
import { InsightIQProfile } from '@/types/insightiq'; // Corrected import path for the type
import {
  mapInsightIQProfileToInfluencerProfileData, // Mapping function
} from '@/lib/data-mapping/influencer';

// Schema to validate the SINGLE identifier query parameter
const AnalyticsQuerySchema = z.object({
  identifier: z.string().min(1, { message: 'Identifier query parameter cannot be empty' }),
  // platformId is no longer expected as a separate required parameter here
  // It might be part of the composite identifier or implied by external_id
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // We now expect a single 'identifier' which could be external_id or handle:::platformId
  const identifier = searchParams.get('identifier');
  // const platformId = searchParams.get('platformId'); // REMOVED - No longer using separate platformId param here

  logger.info(`[API /influencers/analytics] GET request received for identifier: ${identifier}`);

  // --- Validation ---
  if (!identifier) {
    logger.warn('[API /influencers/analytics] Missing required query parameter: identifier');
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required parameters',
        details: 'The identifier query parameter is required.',
      },
      { status: 400 }
    );
  }

  // Validate the single identifier parameter
  const queryValidation = AnalyticsQuerySchema.safeParse({ identifier });
  if (!queryValidation.success) {
    logger.warn('[API /influencers/analytics] Invalid query parameter: identifier', {
      identifier,
      errors: queryValidation.error.flatten().fieldErrors,
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid query parameters',
        details: queryValidation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // --- InsightIQ API Call (via service) ---
  try {
    // Call the updated service function with the single identifier
    const insightIQProfile: InsightIQProfile | null = await getSingleInsightIQProfileAnalytics(
      identifier // Pass the identifier (external_id or composite)
      // platformId // REMOVED
    );

    if (insightIQProfile) {
      // ** SSOT Validation Step (Adjusted) **
      // If the identifier was composite (handle:::platformId), we need to validate
      // the handle part against the returned profile's username.
      let requestedHandle: string | null = null;
      if (identifier.includes(':::')) {
        requestedHandle = identifier.split(':::')[0];
      }

      // Only perform mismatch check if we derived a handle from the identifier
      if (requestedHandle) {
        const returnedUsername = insightIQProfile.platform_username;
        if (!returnedUsername || requestedHandle.toLowerCase() !== returnedUsername.toLowerCase()) {
          logger.error(
            `[API /influencers/analytics] Mismatch Error (Composite ID): Requested handle '${requestedHandle}' but InsightIQ returned '${returnedUsername}'`,
            { requestedIdentifier: identifier, returnedUsername: returnedUsername }
          );
          // Return 404 Not Found, as the requested handle wasn't found for that platform
          return NextResponse.json(
            {
              success: false,
              error: 'Influencer profile mismatch.',
              details: `Data returned for ${returnedUsername} instead of handle ${requestedHandle} on the specified platform.`,
            },
            { status: 404 }
          );
        }
      }
      // If using external_id, getSingleInsightIQProfileAnalytics already fetched the correct profile,
      // so mismatch check based on handle is less critical here, but could be added if needed.

      logger.info(
        `[API /influencers/analytics] Successfully fetched profile data for identifier: ${identifier}`
      );

      // ** Map the full InsightIQProfile to frontend InfluencerProfileData **
      // Use the existing mapping function
      // Ensure mapInsightIQProfileToInfluencerProfileData handles the full InsightIQProfile type correctly
      const profileData = mapInsightIQProfileToInfluencerProfileData(insightIQProfile, identifier); // Pass identifier as uniqueId?

      if (!profileData) {
        logger.error(
          `[API /influencers/analytics] Failed to map InsightIQProfile to InfluencerProfileData for identifier: ${identifier}`
        );
        return NextResponse.json(
          { success: false, error: 'Failed to process influencer profile data.' },
          { status: 500 } // Internal server error
        );
      }

      // Return the mapped data suitable for the frontend
      return NextResponse.json({ success: true, data: profileData });
    } else {
      logger.warn(
        `[API /influencers/analytics] InsightIQ service returned null for identifier: ${identifier}. Treating as Not Found.`
      );
      return NextResponse.json(
        { success: false, error: 'Influencer analytics not found.' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'Unknown internal error';
    logger.error(
      `[API /influencers/analytics] Error fetching analytics for ${identifier}:`,
      message,
      error
    );
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { success: false, error: 'Failed to fetch influencer analytics', details: message },
      { status: statusCode }
    );
  }
}
