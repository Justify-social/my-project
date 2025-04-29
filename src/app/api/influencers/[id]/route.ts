import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient, Prisma, Platform } from '@prisma/client'; // Import Platform enum
import { logger } from '@/utils/logger';
import { InfluencerProfileData, AudienceDemographics, EngagementMetrics } from '@/types/influencer'; // Import necessary types
// Import Phyllo service functions and types (ensure interfaces match service implementation)
import {
  getPhylloAccountIdentity,
  getPhylloProfileAnalytics,
  PhylloAccount, // Import directly now
  PhylloProfileAnalytics, // Import directly now
} from '@/lib/phylloService';
import { calculateJustifyScoreV1 } from '@/lib/scoringService';
// Assume PlatformEnum has compatible string values with Prisma's Platform
import { PlatformEnum } from '@/types/enums';

const prisma = new PrismaClient();

// Zod schema for ID validation (ensure it's a UUID)
const IdSchema = z.string().uuid({ message: 'Invalid Influencer ID format (must be UUID)' });

// Define Params interface explicitly
interface InfluencerRouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: InfluencerRouteParams) {
  const { id } = params;
  logger.info(`[API /influencers/:id] GET request received for ID: ${id}`);

  // --- Input Validation ---
  const validationResult = IdSchema.safeParse(id);
  if (!validationResult.success) {
    logger.warn('[API /influencers/:id] Invalid ID format:', validationResult.error.flatten());
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid Influencer ID format',
        details: validationResult.error.flatten().formErrors,
      },
      { status: 400 }
    );
  }

  try {
    // --- 1. Fetch Base Data from DB ---
    const dbInfluencer = await prisma.marketplaceInfluencer.findUnique({ where: { id } });
    if (!dbInfluencer) {
      logger.warn(`[API /influencers/:id] Influencer not found in DB for ID: ${id}`);
      return NextResponse.json({ success: false, error: 'Influencer not found' }, { status: 404 });
    }

    // --- 2. Find Linked & Prioritized Phyllo Account ---
    let phylloAccountIdToUse: string | null = null;
    try {
      const linkedAccounts = await prisma.phylloAccountLink.findMany({
        where: {
          marketplaceInfluencerId: id,
          status: 'CONNECTED', // Only consider active links
        },
      });

      if (linkedAccounts.length > 0) {
        // Prioritization: Instagram > TikTok > YouTube (MVP)
        const instagramAccount = linkedAccounts.find(acc => acc.platform === Platform.INSTAGRAM);
        const tiktokAccount = linkedAccounts.find(acc => acc.platform === Platform.TIKTOK);
        const youtubeAccount = linkedAccounts.find(acc => acc.platform === Platform.YOUTUBE);

        if (instagramAccount) phylloAccountIdToUse = instagramAccount.phylloAccountId;
        else if (tiktokAccount) phylloAccountIdToUse = tiktokAccount.phylloAccountId;
        else if (youtubeAccount) phylloAccountIdToUse = youtubeAccount.phylloAccountId;
        else phylloAccountIdToUse = linkedAccounts[0].phylloAccountId; // Fallback to first connected if priority platforms not found

        logger.info(
          `[API /influencers/:id] Found ${linkedAccounts.length} connected Phyllo accounts for ${id}. Using account ID: ${phylloAccountIdToUse} based on priority.`
        );
      } else {
        logger.info(`[API /influencers/:id] No active Phyllo account links found for ${id}.`);
      }
    } catch (linkError) {
      logger.error(
        `[API /influencers/:id] Error fetching Phyllo account links for ${id}:`,
        linkError
      );
      // Proceed without enrichment if link fetching fails
    }

    // --- 3. Fetch Phyllo Data (if account found) ---
    let identity: PhylloAccount | null = null;
    let analytics: PhylloProfileAnalytics | null = null;
    if (phylloAccountIdToUse) {
      try {
        // Fetch in parallel
        [identity, analytics] = await Promise.all([
          getPhylloAccountIdentity(phylloAccountIdToUse),
          getPhylloProfileAnalytics(phylloAccountIdToUse),
        ]);
        logger.info(
          `[API /influencers/:id] Successfully fetched data from Phyllo for account ${phylloAccountIdToUse}.`
        );
      } catch (phylloError) {
        logger.error(
          `[API /influencers/:id] Error fetching data from Phyllo for account ${phylloAccountIdToUse}:`,
          phylloError
        );
        // Proceed with only DB data if Phyllo fetch fails
        identity = null;
        analytics = null;
      }
    }

    // --- 4. Calculate Score (using base DB data for now) ---
    const justifyScore = calculateJustifyScoreV1(dbInfluencer);

    // --- 5. Construct Response (Merge DB & Phyllo Data) ---
    // Helper to safely parse JSON potentially stored in DB
    const safeParseJson = (jsonString: Prisma.JsonValue | null | undefined): any | null => {
      if (typeof jsonString === 'string') {
        try {
          return JSON.parse(jsonString);
        } catch {
          return null;
        }
      }
      return jsonString ?? null; // Return if already object or null/undefined
    };

    // Map Phyllo analytics to our types (adjust mapping based on actual Phyllo response structure)
    const audienceDemographics: AudienceDemographics | null = analytics?.audience
      ? {
          // Example mapping - VERIFY AGAINST ACTUAL PHYLLO RESPONSE
          ageDistribution:
            analytics.audience.audience_age_distribution?.reduce(
              (acc: Record<string, number>, item: { age_range: string; percentage: number }) => {
                acc[item.age_range] = item.percentage;
                return acc;
              },
              {}
            ) || safeParseJson(dbInfluencer.audienceDemographics)?.ageDistribution,
          genderDistribution:
            analytics.audience.audience_gender_distribution?.reduce(
              (acc: Record<string, number>, item: { gender: string; percentage: number }) => {
                acc[item.gender] = item.percentage;
                return acc;
              },
              {}
            ) || safeParseJson(dbInfluencer.audienceDemographics)?.genderDistribution,
          locationDistribution:
            analytics.audience.audience_live_location_distribution?.reduce(
              (acc: Record<string, number>, item: { country: string; percentage: number }) => {
                acc[item.country] = item.percentage;
                return acc;
              },
              {}
            ) || safeParseJson(dbInfluencer.audienceDemographics)?.locationDistribution,
        }
      : safeParseJson(dbInfluencer.audienceDemographics);

    const engagementMetrics: EngagementMetrics | null = analytics?.engagement
      ? {
          // Example mapping - VERIFY AGAINST ACTUAL PHYLLO RESPONSE
          averageLikes:
            analytics.engagement.average_likes ??
            safeParseJson(dbInfluencer.engagementMetrics)?.averageLikes,
          averageComments:
            analytics.engagement.average_comments ??
            safeParseJson(dbInfluencer.engagementMetrics)?.averageComments,
          // sharesPerPost? : analytics.engagement.average_shares ?? safeParseJson(dbInfluencer.engagementMetrics)?.sharesPerPost,
        }
      : safeParseJson(dbInfluencer.engagementMetrics);

    // Determine verification status from Phyllo identity if available
    const isPhylloVerified = identity
      ? identity.status === 'CONNECTED'
      : (dbInfluencer.isPhylloVerified ?? false);

    // Validate enums from DB (as before)
    const validGenders = ['Male', 'Female', 'Other', 'Mixed'];
    const gender = validGenders.includes(dbInfluencer.primaryAudienceGender ?? '')
      ? (dbInfluencer.primaryAudienceGender as 'Male' | 'Female' | 'Other' | 'Mixed')
      : undefined;
    const validIndicators = ['High', 'Medium', 'Low'];
    const qualityIndicator = validIndicators.includes(dbInfluencer.audienceQualityIndicator ?? '')
      ? (dbInfluencer.audienceQualityIndicator as 'High' | 'Medium' | 'Low')
      : undefined;

    // Construct the final payload, prioritizing Phyllo data where available
    const responsePayload: InfluencerProfileData = {
      id: dbInfluencer.id,
      name: analytics?.profile?.full_name ?? dbInfluencer.name,
      handle: analytics?.profile?.username ?? dbInfluencer.handle,
      avatarUrl: analytics?.profile?.image_url ?? dbInfluencer.avatarUrl ?? '',
      platforms: dbInfluencer.platforms as PlatformEnum[],
      followersCount: analytics?.reputation?.follower_count ?? dbInfluencer.followersCount ?? 0,
      justifyScore: justifyScore,
      isPhylloVerified: isPhylloVerified, // Use status from fetched identity if available
      primaryAudienceLocation: dbInfluencer.primaryAudienceLocation ?? undefined, // Keep DB summary fields for now
      primaryAudienceAgeRange: dbInfluencer.primaryAudienceAgeRange ?? undefined,
      primaryAudienceGender: gender,
      engagementRate:
        analytics?.engagement?.engagement_rate ?? dbInfluencer.engagementRate ?? undefined,
      audienceQualityIndicator: qualityIndicator, // Keep validated DB field for now
      bio: analytics?.profile?.bio ?? dbInfluencer.bio ?? undefined,
      contactEmail: dbInfluencer.contactEmail ?? undefined,
      audienceDemographics: audienceDemographics,
      engagementMetrics: engagementMetrics,
    };

    return NextResponse.json({ success: true, data: responsePayload });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown internal error';
    logger.error(`[API /influencers/:id] Error fetching influencer ${id}:`, message);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch influencer details', details: message },
      { status: 500 }
    );
  }
}
