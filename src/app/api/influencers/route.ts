import { type NextRequest, NextResponse } from 'next/server';
import { prisma as prismaClient } from '@/lib/db'; // Prisma Client
// import { Platform, Prisma, MarketplaceInfluencer } from '@prisma/client'; // Commented out Platform, Prisma, MarketplaceInfluencer
import {
  Platform,
  Prisma as PrismaNamespace,
  MarketplaceInfluencer as PrismaMarketplaceInfluencer,
} from '@prisma/client'; // Assuming these are actual exports if needed by commented code but aliasing to avoid conflict if main ones commented.
import { z } from 'zod';
// import { InfluencerSummary } from '@/types/influencer'; // Commented out InfluencerSummary
// import { calculatePagination } from '@/lib/utils'; // Commented out calculatePagination
import { PlatformEnum } from '@/types/enums'; // Added PlatformEnum import

// const prisma = prismaClient; // Commented out prisma const

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
  // Add searchTerm
  searchTerm: z.string().optional(),
  // Add audienceQuality
  audienceQuality: z.enum(['High', 'Medium', 'Low']).optional(),
  // TODO: Add other filters as needed (e.g., audienceLocation, audienceAge)
  // Uncomment Score filters
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxScore: z.coerce.number().min(0).max(100).optional(),
});

// Remove helper function, now handled in mapping service
// function mapPlatformNameToEnum(...) { ... }

// Temporarily commented out the GET handler
/*
export async function GET(req: NextRequest) {
  logger.info('[API /influencers] GET request received');
  const { searchParams } = new URL(req.url);
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

  const { page, limit, ...filters } = validationResult.data; // Separate filters from pagination

  // filters object now contains searchTerm if provided
  logger.info(`[API /influencers] Requesting page ${page}, limit ${limit} with filters:`, filters);

  try {
    // Call the centralized service function, passing the whole filters object
    const result = await influencerService.getProcessedInfluencerList({
      filters, // Pass validated filters (including searchTerm)
      pagination: { page, limit }, // Pass pagination
    });

    // Format the response (matches original structure)
    const responsePayload = {
      success: true,
      influencers: result.influencers,
      pagination: {
        currentPage: result.page,
        limit: result.limit,
        totalInfluencers: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };

    logger.debug('[API /influencers] Returning payload:', responsePayload);
    // Add specific logging for the generated workPlatformId for the first few influencers
    if (result.influencers && result.influencers.length > 0) {
      logger.debug('[API /influencers] Sample of generated influencer summaries for list:', {
        // Wrap the array in an object property
        influencerSamples: result.influencers.slice(0, 3).map(inf => ({
          id: inf.id,
          handle: inf.handle,
          platform: inf.platforms ? inf.platforms[0] : 'N/A', // Show the PlatformEnum used
          workPlatformId: inf.workPlatformId, // Log the generated ID
        })),
      });
    }
    return NextResponse.json(responsePayload);

    // OLD LOGIC REMOVED:
    // const offset = (page - 1) * limit;
    //
    // // Construct filters object for the service layer
    // const filtersForService = {
    //   ...(platforms && { platforms }),
    //   ...(minFollowers !== undefined && { follower_count: { min: minFollowers } }),
    //   ...(maxFollowers !== undefined && { follower_count: { max: maxFollowers } }),
    //   ...(isVerified !== undefined && { is_verified: isVerified }),
    // };
    // 
    // const insightiqResponse = await getInsightIQProfiles({
    //   limit,
    //   offset,
    //   filters: filtersForService, // Pass the constructed filters object
    // });
    // 
    // // ... (log response) ...
    // 
    // if (!insightiqResponse?.data || !Array.isArray(insightiqResponse.data)) {
    //    // ... (handle missing data)
    // }
    //
    // // --- Map InsightIQ Profiles to InfluencerSummary ---
    // const mappedInfluencers: InfluencerSummary[] = insightiqResponse.data
    //   // Use the new centralized mapping function
    //   .map((profile: InsightIQProfile) =>
    //     mapInsightIQProfileToInfluencerSummary(profile, filtersForService.platforms?.[0])
    //   )
    //   // Filter out any nulls returned by the mapper (e.g., if profile was incomplete)
    //   .filter((summary): summary is InfluencerSummary => summary !== null);
    //
    // // --- Determine Pagination ---
    // // ... (pagination logic) ...
    //
    // logger.info(`[API /influencers] Successfully mapped ${mappedInfluencers.length} influencers.`);
    //
    // const responsePayload = {
    //   // ... (construct payload) ...
    // };
  } catch (error: unknown) {
  // Keep the general error handling for unexpected service errors
  logger.error('[API /influencers] Error processing request:', {
    error: error instanceof Error ? error.message : String(error),
    query: queryParams,
  });

  return NextResponse.json(
    {
      success: false,
      error: 'Internal Server Error',
      details: 'An unexpected error occurred while fetching influencers.',
    },
    { status: 500 } // General internal error
  );
}
*/

export {}; // Keep if this file is intended to be a module
