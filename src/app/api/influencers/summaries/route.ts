import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// Keep logger import
import { logger } from '@/lib/logger';
import { InfluencerSummary } from '@/types/influencer'; // Use our frontend type
// Remove unused score/enum imports
// import { calculateJustifyScoreV1 } from '@/lib/scoringService';
// import { PlatformEnum } from '@/types/enums';
import { Platform as PlatformBackend } from '@prisma/client';
// Import the service
import { influencerService } from '@/services/influencer';

// Remove Prisma client import, as it's handled by the service now
// const prisma = new PrismaClient();

// Zod schema for validating comma-separated UUIDs in query param
const IdsSchema = z.preprocess(
  val => (typeof val === 'string' ? val.split(',').map(id => id.trim()) : []),
  z
    .array(z.string().uuid({ message: 'Invalid Influencer ID format (must be UUID)' }))
    .min(1, { message: 'At least one ID must be provided' })
);

// Remove mapping helper (centralized)
// const mapPlatformsToFrontend = ...

export async function GET(request: NextRequest): Promise<NextResponse> {
  logger.info('[API /influencers/summaries] GET request received');
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids');

  // --- Input Validation ---
  const validationResult = IdsSchema.safeParse(idsParam);
  if (!validationResult.success) {
    logger.warn(
      '[API /influencers/summaries] Invalid IDs parameter:',
      validationResult.error.flatten()
    );
    return NextResponse.json(
      {
        success: false,
        error: "Invalid or missing 'ids' query parameter",
        details: validationResult.error.flatten().formErrors,
      },
      { status: 400 }
    );
  }

  const idsToFetch = validationResult.data;
  logger.info(`[API /influencers/summaries] Fetching summaries for IDs: ${idsToFetch.join(', ')}`);

  try {
    // --- Call Service Layer ---
    const orderedSummaries =
      await influencerService.getProcessedInfluencerSummariesByIds(idsToFetch);

    // --- Format Response ---
    const responsePayload = {
      success: true,
      influencers: orderedSummaries,
    };

    return NextResponse.json(responsePayload);

    /* OLD LOGIC REMOVED:
    // --- Fetch Data from DB ---
    const dbInfluencers = await prisma.marketplaceInfluencer.findMany({ ... });
    logger.debug(...);
    // --- Map to Summary Type & Calculate Score ---
    const summaries: InfluencerSummary[] = dbInfluencers.map(inf => { ... });
    // Reorder results ...
    const orderedInfluencers = ...;
    // --- Format Response ---
    const responsePayload = { ... };
    */
  } catch (error: unknown) {
    // Keep general error handling for unexpected service errors
    const message = error instanceof Error ? error.message : 'Unknown internal error';
    logger.error(`[API /influencers/summaries] Error fetching summaries:`, {
      error: message,
      originalError: error,
      requestedIds: idsToFetch,
    });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch influencer summaries', details: message },
      { status: 500 }
    );
  }
}
