import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import { InfluencerSummary } from '@/types/influencer';
import { calculateJustifyScoreV1 } from '@/lib/scoringService';
import { PlatformEnum } from '@/types/enums';
import { Platform as PlatformBackend } from '@prisma/client';
// TODO: Add InsightIQ enrichment if needed for summaries

const prisma = new PrismaClient();

// Zod schema for validating comma-separated UUIDs in query param
const IdsSchema = z.preprocess(
  val => (typeof val === 'string' ? val.split(',').map(id => id.trim()) : []),
  z
    .array(z.string().uuid({ message: 'Invalid Influencer ID format (must be UUID)' }))
    .min(1, { message: 'At least one ID must be provided' })
);

// Helper to map Backend Platform array to Frontend PlatformEnum array
const mapPlatformsToFrontend = (backendPlatforms: PlatformBackend[]): PlatformEnum[] => {
  return backendPlatforms
    .map(bp => {
      switch (bp) {
        case PlatformBackend.INSTAGRAM:
          return PlatformEnum.Instagram;
        case PlatformBackend.YOUTUBE:
          return PlatformEnum.YouTube;
        case PlatformBackend.TIKTOK:
          return PlatformEnum.TikTok;
        default:
          return null; // Handle potential unknown backend platforms
      }
    })
    .filter((fe): fe is PlatformEnum => fe !== null); // Filter out nulls and assert type
};

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
    // --- Fetch Data from DB ---
    const dbInfluencers = await prisma.marketplaceInfluencer.findMany({
      where: {
        id: {
          in: idsToFetch,
        },
      },
      select: {
        id: true,
        name: true,
        handle: true,
        avatarUrl: true,
        platforms: true,
        followersCount: true,
        isInsightIQVerified: true,
        primaryAudienceLocation: true,
        primaryAudienceAgeRange: true,
        primaryAudienceGender: true,
        engagementRate: true,
        audienceQualityIndicator: true,
        insightiqUserId: true,
      },
      orderBy: { justifyScore: 'desc' },
    });

    logger.debug(`[API /influencers/summaries] Found ${dbInfluencers.length} influencers in DB.`);

    // --- Map to Summary Type & Calculate Score ---
    const summaries: InfluencerSummary[] = dbInfluencers.map(inf => {
      const justifyScore = calculateJustifyScoreV1(inf as any);

      // Validate enums
      const validGenders = ['Male', 'Female', 'Other', 'Mixed'];
      const gender = validGenders.includes(inf.primaryAudienceGender ?? '')
        ? (inf.primaryAudienceGender as 'Male' | 'Female' | 'Other' | 'Mixed')
        : undefined;
      const validIndicators = ['High', 'Medium', 'Low'];
      const qualityIndicator = validIndicators.includes(inf.audienceQualityIndicator ?? '')
        ? (inf.audienceQualityIndicator as 'High' | 'Medium' | 'Low')
        : undefined;

      return {
        id: inf.id,
        name: inf.name,
        handle: inf.handle,
        avatarUrl: inf.avatarUrl ?? '',
        platforms: mapPlatformsToFrontend(inf.platforms as PlatformBackend[]),
        followersCount: inf.followersCount ?? 0,
        justifyScore: justifyScore,
        isVerified: inf.isInsightIQVerified ?? false,
        primaryAudienceLocation: inf.primaryAudienceLocation ?? undefined,
        primaryAudienceAgeRange: inf.primaryAudienceAgeRange ?? undefined,
        primaryAudienceGender: gender,
        engagementRate: inf.engagementRate ?? undefined,
        audienceQualityIndicator: qualityIndicator,
        insightiqUserId: inf.insightiqUserId,
      };
    });

    // Reorder results to match input ID order if necessary (optional)
    const orderedInfluencers = idsToFetch
      .map(id => summaries.find(inf => inf.id === id))
      .filter((inf): inf is InfluencerSummary => inf !== undefined);

    // --- Format Response ---
    const responsePayload = {
      success: true,
      influencers: orderedInfluencers,
    };

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
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
