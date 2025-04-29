import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient, Platform, Prisma, MarketplaceInfluencer } from '@prisma/client'; // Import Prisma namespace
import { logger } from '@/utils/logger';
import { InfluencerSummary } from '@/types/influencer'; // Use our frontend type for response shaping
import { calculatePagination } from '@/lib/paginationUtils'; // Corrected path
import { calculateJustifyScoreV1 } from '@/lib/scoringService'; // Import scoring function
// TODO: Import phylloService functions when enrichment is added
// import { getPhylloAccountIdentity } from '@/lib/phylloService';

const prisma = new PrismaClient();

// Define Zod schema for query parameter validation based on API contract
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
    isPhylloVerified: z.preprocess(
      // Handle string 'true'/'false' from query params
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
  const whereClause: Prisma.MarketplaceInfluencerWhereInput = {}; // Use Prisma type

  if (filters.platforms && filters.platforms.length > 0) {
    // Prisma needs `hasSome` for array fields
    whereClause.platforms = { hasSome: filters.platforms };
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
  // Add isPhylloVerified filter
  if (filters.isPhylloVerified !== undefined) {
    whereClause.isPhylloVerified = filters.isPhylloVerified;
  }

  // TODO: Add sorting logic based on sortBy (Post-MVP)

  try {
    // --- Fetch Data & Count ---
    logger.debug('[API /influencers] Querying database with clause:', whereClause);
    const [totalInfluencers, dbInfluencers] = await prisma.$transaction([
      prisma.marketplaceInfluencer.count({ where: whereClause }), // Use camelCase
      prisma.marketplaceInfluencer.findMany({
        // Use camelCase
        where: whereClause,
        skip,
        take,
        orderBy: { justifyScore: 'desc' }, // Default sort for MVP
        // TODO: Select only necessary fields for summary?
      }),
    ]);

    // --- Data Enrichment & Score Calculation ---
    const enrichedInfluencers = dbInfluencers.map(
      (inf: MarketplaceInfluencer): InfluencerSummary => {
        const justifyScore = calculateJustifyScoreV1(inf);

        // Validate primaryAudienceGender
        const validGenders = ['Male', 'Female', 'Other', 'Mixed'];
        const gender = validGenders.includes(inf.primaryAudienceGender ?? '')
          ? (inf.primaryAudienceGender as 'Male' | 'Female' | 'Other' | 'Mixed')
          : undefined;

        // Validate audienceQualityIndicator
        const validIndicators = ['High', 'Medium', 'Low'];
        const qualityIndicator = validIndicators.includes(inf.audienceQualityIndicator ?? '')
          ? (inf.audienceQualityIndicator as 'High' | 'Medium' | 'Low')
          : undefined;

        return {
          id: inf.id,
          name: inf.name,
          handle: inf.handle,
          avatarUrl: inf.avatarUrl ?? '',
          platforms: inf.platforms,
          followersCount: inf.followersCount ?? 0,
          justifyScore: justifyScore,
          isPhylloVerified: inf.isPhylloVerified ?? false,
          primaryAudienceLocation: inf.primaryAudienceLocation ?? undefined,
          primaryAudienceAgeRange: inf.primaryAudienceAgeRange ?? undefined,
          // Assign validated gender
          primaryAudienceGender: gender,
          engagementRate: inf.engagementRate ?? undefined,
          // Assign validated quality indicator
          audienceQualityIndicator: qualityIndicator,
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
    logger.error('[API /influencers] Error fetching influencers:', message);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch influencers', details: message },
      { status: 500 }
    );
  }
}
