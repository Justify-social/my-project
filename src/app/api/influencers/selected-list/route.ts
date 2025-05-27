import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/utils/logger';
import { influencerService } from '@/services/influencer';
import { Platform } from '@prisma/client';
import { PlatformEnum } from '@/types/enums';

// Helper to map Prisma Platform to PlatformEnum
const mapPrismaPlatformToEnum = (prismaPlatform: Platform): PlatformEnum => {
  switch (prismaPlatform) {
    case Platform.INSTAGRAM:
      return PlatformEnum.Instagram;
    case Platform.YOUTUBE:
      return PlatformEnum.YouTube;
    case Platform.TIKTOK:
      return PlatformEnum.TikTok;
    default:
      // Default to Instagram if unmapped
      logger.warn(
        `[mapPrismaPlatformToEnum] Unknown platform: ${prismaPlatform}, defaulting to Instagram`
      );
      return PlatformEnum.Instagram;
  }
};

export async function GET(_request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: 'Organization context required' },
        { status: 400 }
      );
    }

    logger.info(`[GET /api/influencers/selected-list] Fetching influencers for orgId: ${orgId}`);

    // Get all influencers that have been selected in campaigns for this organization
    const influencers = await prisma.influencer.findMany({
      where: {
        CampaignWizard: {
          orgId: orgId,
        },
      },
      include: {
        CampaignWizard: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (influencers.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message:
          'No influencers have been selected yet. Start by creating campaigns and adding influencers.',
      });
    }

    // Enrich influencer data with profile information
    const enrichedInfluencers = await Promise.all(
      influencers.map(async influencer => {
        try {
          // Create a consistent search identifier
          const searchIdentifier = `${influencer.platform}_${influencer.handle.toLowerCase()}`;

          // First, check if we have cached data in MarketplaceInfluencer
          const cachedData = await prisma.marketplaceInfluencer.findFirst({
            where: {
              OR: [
                { searchIdentifier: searchIdentifier },
                {
                  AND: [
                    { handle: { equals: influencer.handle, mode: 'insensitive' } },
                    { platforms: { has: influencer.platform } },
                  ],
                },
              ],
            },
            orderBy: {
              insightiqDataLastRefreshedAt: 'desc',
            },
          });

          let profileData = null;

          if (cachedData) {
            // Use cached data
            profileData = {
              id: influencer.id,
              name: cachedData.name,
              handle: cachedData.handle,
              platform: influencer.platform,
              createdAt: influencer.createdAt,
              CampaignWizard: influencer.CampaignWizard,
              // Rich profile data from cache
              avatarUrl: cachedData.avatarUrl,
              followersCount: cachedData.followersCount,
              isVerified: cachedData.isInsightIQVerified || false,
              engagementRate: cachedData.engagementRate,
              justifyScore: cachedData.justifyScore,
            };

            logger.info(
              `[GET /api/influencers/selected-list] Using cached data for ${influencer.handle}`
            );
          } else {
            // Fetch fresh data from InsightIQ
            try {
              logger.info(
                `[GET /api/influencers/selected-list] Fetching fresh data for ${influencer.handle} from InsightIQ`
              );

              const searchResponse = await influencerService.getInfluencers({
                pagination: { page: 1, limit: 1 },
                filters: {
                  searchTerm: influencer.handle,
                  platforms: [mapPrismaPlatformToEnum(influencer.platform)],
                },
              });

              if (searchResponse.influencers.length > 0) {
                const insightiqData = searchResponse.influencers[0];

                // Cache the data in MarketplaceInfluencer for future use
                const cachedInfluencer = await prisma.marketplaceInfluencer.upsert({
                  where: {
                    searchIdentifier: searchIdentifier,
                  },
                  update: {
                    name: insightiqData.name || influencer.handle,
                    handle: influencer.handle.toLowerCase(), // Normalize handle
                    avatarUrl: insightiqData.avatarUrl,
                    followersCount: insightiqData.followersCount,
                    isInsightIQVerified: insightiqData.isVerified,
                    engagementRate: insightiqData.engagementRate,
                    justifyScore: insightiqData.justifyScore,
                    insightiqDataLastRefreshedAt: new Date(),
                  },
                  create: {
                    name: insightiqData.name || influencer.handle,
                    handle: influencer.handle.toLowerCase(), // Normalize handle
                    avatarUrl: insightiqData.avatarUrl,
                    platforms: [influencer.platform],
                    followersCount: insightiqData.followersCount,
                    isInsightIQVerified: insightiqData.isVerified,
                    engagementRate: insightiqData.engagementRate,
                    justifyScore: insightiqData.justifyScore,
                    searchIdentifier: searchIdentifier,
                    insightiqDataLastRefreshedAt: new Date(),
                  },
                });

                profileData = {
                  id: influencer.id,
                  name: cachedInfluencer.name,
                  handle: cachedInfluencer.handle,
                  platform: influencer.platform,
                  createdAt: influencer.createdAt,
                  CampaignWizard: influencer.CampaignWizard,
                  // Rich profile data from InsightIQ
                  avatarUrl: cachedInfluencer.avatarUrl,
                  followersCount: cachedInfluencer.followersCount,
                  isVerified: cachedInfluencer.isInsightIQVerified || false,
                  engagementRate: cachedInfluencer.engagementRate,
                  justifyScore: cachedInfluencer.justifyScore,
                };

                logger.info(
                  `[GET /api/influencers/selected-list] Successfully cached fresh data for ${influencer.handle}`
                );
              } else {
                // Fallback if not found in InsightIQ - still create a basic cache entry
                await prisma.marketplaceInfluencer.upsert({
                  where: {
                    searchIdentifier: searchIdentifier,
                  },
                  update: {
                    insightiqDataLastRefreshedAt: new Date(),
                  },
                  create: {
                    name: influencer.handle,
                    handle: influencer.handle.toLowerCase(),
                    avatarUrl: null,
                    platforms: [influencer.platform],
                    followersCount: null,
                    isInsightIQVerified: false,
                    engagementRate: null,
                    justifyScore: null,
                    searchIdentifier: searchIdentifier,
                    insightiqDataLastRefreshedAt: new Date(),
                  },
                });

                profileData = {
                  id: influencer.id,
                  name: influencer.handle,
                  handle: influencer.handle,
                  platform: influencer.platform,
                  createdAt: influencer.createdAt,
                  CampaignWizard: influencer.CampaignWizard,
                  // Default values
                  avatarUrl: null,
                  followersCount: null,
                  isVerified: false,
                  engagementRate: null,
                  justifyScore: null,
                };

                logger.warn(
                  `[GET /api/influencers/selected-list] No data found in InsightIQ for ${influencer.handle}, created basic cache entry`
                );
              }
            } catch (error) {
              logger.error(
                `[GET /api/influencers/selected-list] Error fetching profile for ${influencer.handle}:`,
                error
              );

              // Fallback to basic data on error
              profileData = {
                id: influencer.id,
                name: influencer.handle,
                handle: influencer.handle,
                platform: influencer.platform,
                createdAt: influencer.createdAt,
                CampaignWizard: influencer.CampaignWizard,
                // Default values
                avatarUrl: null,
                followersCount: null,
                isVerified: false,
                engagementRate: null,
                justifyScore: null,
              };
            }
          }

          return profileData;
        } catch (error) {
          logger.error(
            `[GET /api/influencers/selected-list] Error processing influencer ${influencer.handle}:`,
            error
          );

          // Return basic data on error
          return {
            id: influencer.id,
            name: influencer.handle,
            handle: influencer.handle,
            platform: influencer.platform,
            createdAt: influencer.createdAt,
            CampaignWizard: influencer.CampaignWizard,
            avatarUrl: null,
            followersCount: null,
            isVerified: false,
            engagementRate: null,
            justifyScore: null,
          };
        }
      })
    );

    logger.info(
      `[GET /api/influencers/selected-list] Successfully enriched ${enrichedInfluencers.length} influencers`
    );

    return NextResponse.json({
      success: true,
      data: enrichedInfluencers,
      total: enrichedInfluencers.length,
    });
  } catch (error) {
    logger.error('[GET /api/influencers/selected-list] Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch influencers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
