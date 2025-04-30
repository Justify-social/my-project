import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient, Platform, Prisma, MarketplaceInfluencer } from '@prisma/client'; // Import Prisma namespace
import { logger } from '@/lib/logger';
import { InfluencerSummary } from '@/types/influencer'; // Use our frontend type for response shaping
import { calculatePagination } from '@/lib/paginationUtils'; // Corrected path
import { calculateJustifyScoreV1 } from '@/lib/scoringService'; // Import scoring function - Correct name
import { PlatformEnum } from '@/types/enums';
// TODO: Import insightiqService functions when enrichment is added
// import { getInsightIQProfileById } from '@/lib/insightiqService'; // Example

const prisma = new PrismaClient();

// Updated Zod schema to use insightiq field names
const InfluencerQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(12),
    platforms: z.preprocess(
      val =>
        typeof val === 'string' ? val.split(',').map(p => p.trim().toUpperCase()) : undefined,
      z.array(z.nativeEnum(Platform)).optional()
    ),
    minScore: z.coerce.number().min(0).max(100).optional(),
    maxScore: z.coerce.number().min(0).max(100).optional(),
    minFollowers: z.coerce.number().int().nonnegative().optional(),
    maxFollowers: z.coerce.number().int().positive().optional(),
    audienceAge: z.string().optional(), // Keep as string for now, refine filtering later
    audienceLocation: z.string().optional(), // Keep as string for now, refine filtering later
    isInsightIQVerified: z.preprocess(
      // Renamed from isPhylloVerified
      val => (val === 'true' ? true : val === 'false' ? false : undefined),
      z.boolean().optional()
    ),
    // sortBy: z.string().optional(), // Post-MVP
    // searchTerm: z.string().optional(), // Post-MVP
  })
  .refine(data => !data.maxScore || !data.minScore || data.maxScore >= data.minScore, {
    message: 'maxScore must be greater than or equal to minScore',
    path: ['maxScore'],
  })
  .refine(
    data => !data.maxFollowers || !data.minFollowers || data.maxFollowers >= data.minFollowers,
    {
      message: 'maxFollowers must be greater than or equal to minFollowers',
      path: ['maxFollowers'],
    }
  );

export async function GET(request: NextRequest) {
  logger.info('[API /influencers] GET request received');
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  // --- Input Validation ---
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

  const { page, limit, ...filters } = validationResult.data;
  const { skip, take } = calculatePagination(page, limit);

  // --- Database Query Construction ---
  const whereClause: Prisma.MarketplaceInfluencerWhereInput = {};

  if (filters.platforms && filters.platforms.length > 0) {
    // Cast frontend enum to Prisma enum if necessary, or ensure they are compatible
    // Assuming they are compatible string enums for now
    whereClause.platforms = { hasSome: filters.platforms as Platform[] };
  }
  if (filters.minScore !== undefined || filters.maxScore !== undefined) {
    whereClause.justifyScore = {};
    if (filters.minScore !== undefined) whereClause.justifyScore.gte = filters.minScore;
    if (filters.maxScore !== undefined) whereClause.justifyScore.lte = filters.maxScore;
  }
  if (filters.minFollowers !== undefined || filters.maxFollowers !== undefined) {
    whereClause.followersCount = {};
    if (filters.minFollowers !== undefined) whereClause.followersCount.gte = filters.minFollowers;
    if (filters.maxFollowers !== undefined) whereClause.followersCount.lte = filters.maxFollowers;
  }
  if (filters.audienceLocation) {
    // Basic location filtering for now (exact match)
    whereClause.primaryAudienceLocation = filters.audienceLocation;
  }
  if (filters.audienceAge) {
    // Basic age filtering for now (exact match)
    whereClause.primaryAudienceAgeRange = filters.audienceAge;
  }
  // Use renamed isInsightIQVerified filter
  if (filters.isInsightIQVerified !== undefined) {
    whereClause.isInsightIQVerified = filters.isInsightIQVerified;
  }

  // TODO: Add sorting logic based on sortBy (Post-MVP)

  try {
    // --- Fetch Data & Count ---
    logger.debug('[API /influencers] Querying database with clause:', whereClause);
    const [totalInfluencers, dbInfluencers] = await prisma.$transaction([
      prisma.marketplaceInfluencer.count({ where: whereClause }),
      prisma.marketplaceInfluencer.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { justifyScore: 'desc' },
      }),
    ]);

    // --- Data Enrichment & Score Calculation ---
    const enrichedInfluencers = dbInfluencers.map(
      (inf: MarketplaceInfluencer): InfluencerSummary => {
        const justifyScore = calculateJustifyScoreV1(inf);

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
          // Cast Prisma Platform[] to frontend PlatformEnum[]
          platforms: inf.platforms as PlatformEnum[],
          followersCount: inf.followersCount ?? 0,
          justifyScore: justifyScore,
          isInsightIQVerified: inf.isInsightIQVerified ?? false,
          primaryAudienceLocation: inf.primaryAudienceLocation ?? undefined,
          primaryAudienceAgeRange: inf.primaryAudienceAgeRange ?? undefined,
          primaryAudienceGender: gender,
          engagementRate: inf.engagementRate ?? undefined,
          audienceQualityIndicator: qualityIndicator,
          insightiqUserId: inf.insightiqUserId,
        };
      }
    );

    // --- Format Response ---
    const totalPages = Math.ceil(totalInfluencers / limit);
    const responsePayload = {
      success: true,
      influencers: enrichedInfluencers,
      pagination: {
        currentPage: page,
        limit: limit,
        totalInfluencers: totalInfluencers,
        totalPages: totalPages,
      },
    };

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown internal error';
    logger.error('[API /influencers] Error fetching influencers:', {
      error: message,
      originalError: error,
      query: queryParams,
    });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch influencers', details: message },
      { status: 500 }
    );
  }
}
