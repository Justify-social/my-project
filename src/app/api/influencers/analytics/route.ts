import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/utils/logger';
// Assuming getSingleInsightIQProfileAnalytics directly calls the InsightIQ POST endpoint correctly
import { getSingleInsightIQProfileAnalytics } from '@/lib/insightiqService';

// Schema to validate query parameters received from the frontend profile page
const AnalyticsQuerySchema = z.object({
  identifier: z.string().min(1, { message: 'Identifier cannot be empty' }),
  platformId: z.string().uuid({ message: 'Invalid Platform ID format' }),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const identifier = searchParams.get('identifier');
  const platformId = searchParams.get('platformId');

  logger.info(
    `[API /influencers/analytics] GET request received for identifier: ${identifier}, platformId: ${platformId}`
  );

  // --- Validation ---
  if (!identifier || !platformId) {
    logger.warn('[API /influencers/analytics] Missing required query parameters', {
      identifier,
      platformId,
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required parameters',
        details: 'Both identifier and platformId query parameters are required.',
      },
      { status: 400 }
    );
  }

  const queryValidation = AnalyticsQuerySchema.safeParse({ identifier, platformId });
  if (!queryValidation.success) {
    logger.warn('[API /influencers/analytics] Invalid query parameters', {
      identifier,
      platformId,
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
    // This service function MUST make the POST request to InsightIQ's analytics endpoint
    // with identifier and platformId in the BODY.
    const analyticsData = await getSingleInsightIQProfileAnalytics(
      identifier, // Pass the public identifier (handle/url)
      platformId // Pass the platform UUID
    );

    if (analyticsData) {
      // ** SSOT Validation Step **
      // Compare requested identifier with the username returned by InsightIQ
      // Use case-insensitive comparison for robustness
      const returnedUsername = analyticsData.platform_username;
      if (!returnedUsername || identifier.toLowerCase() !== returnedUsername.toLowerCase()) {
        logger.error(
          `[API /influencers/analytics] Mismatch Error: Requested '${identifier}' but InsightIQ returned '${returnedUsername}'`,
          { requested: identifier, returned: returnedUsername, platformId }
        );
        // Return 404 Not Found, as the requested identifier wasn't found
        return NextResponse.json(
          {
            success: false,
            error: 'Influencer profile mismatch.',
            details: `Data returned for ${returnedUsername} instead of ${identifier}.`,
          },
          { status: 404 }
        );
      }
      logger.info(
        `[API /influencers/analytics] Successfully fetched analytics for identifier: ${identifier}`
      );
      // Return the data received from the service (which should be from InsightIQ)
      return NextResponse.json({ success: true, data: analyticsData });
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
    // Pass through specific errors if insightiqService throws them, otherwise generic
    const statusCode = error.statusCode || 500; // Example: Check if error has a status code
    return NextResponse.json(
      { success: false, error: 'Failed to fetch influencer analytics', details: message },
      { status: statusCode }
    );
  }
}
