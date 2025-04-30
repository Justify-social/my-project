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

const IdSchema = z.string().uuid({ message: 'Invalid Influencer ID format (must be UUID)' });

// Re-add the explicit type for the expected result of the Prisma query
type MarketplaceInfluencerWithLinks = MarketplaceInfluencer & {
  insightiqAccountLinks: InsightIQAccountLink[];
};

export async function GET(request: NextRequest, { params }: any) {
  const { id } = params;
  if (typeof id !== 'string') {
    logger.error('[API /influencers/:id] Invalid params structure: id is missing or not a string');
    return NextResponse.json({ success: false, error: 'Invalid request params' }, { status: 400 });
  }
  logger.info(`[API /influencers/:id] GET request received for ID: ${id}`);

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
    // Use the explicitly defined type for the query result
    const dbInfluencer: MarketplaceInfluencerWithLinks | null =
      await prisma.marketplaceInfluencer.findUnique({
        where: { id },
        include: { insightiqAccountLinks: { where: { status: 'CONNECTED' } } },
      });

    if (!dbInfluencer) {
      logger.warn(`[API /influencers/:id] Influencer not found in DB for ID: ${id}`);
      return NextResponse.json({ success: false, error: 'Influencer not found' }, { status: 404 });
    }

    // --- 2. Find Linked & Prioritized InsightIQ Account --- (Uses renamed relation)
    let insightiqAccountIdToUse: string | null = null;
    if (dbInfluencer.insightiqAccountLinks && dbInfluencer.insightiqAccountLinks.length > 0) {
      const linkedAccounts = dbInfluencer.insightiqAccountLinks;
      // Prioritization: Instagram > TikTok > YouTube (MVP)
      const instagramAccount = linkedAccounts.find(acc => acc.platform === Platform.INSTAGRAM);
      const tiktokAccount = linkedAccounts.find(acc => acc.platform === Platform.TIKTOK);
      const youtubeAccount = linkedAccounts.find(acc => acc.platform === Platform.YOUTUBE);

      if (instagramAccount) insightiqAccountIdToUse = instagramAccount.insightiqAccountId;
      else if (tiktokAccount) insightiqAccountIdToUse = tiktokAccount.insightiqAccountId;
      else if (youtubeAccount) insightiqAccountIdToUse = youtubeAccount.insightiqAccountId;
      else insightiqAccountIdToUse = linkedAccounts[0].insightiqAccountId; // Fallback

      logger.info(
        `[API /influencers/:id] Found ${linkedAccounts.length} connected InsightIQ accounts for ${id}. Using account ID: ${insightiqAccountIdToUse}`
      );
    } else {
      logger.info(`[API /influencers/:id] No active InsightIQ account links found for ${id}.`);
    }

    // --- 3. Fetch InsightIQ Data (if account found) ---
    let profile: InsightIQProfile | null = null;
    let audience: InsightIQGetAudienceResponse | null = null;

    // Determine the InsightIQ *Profile* ID to fetch profile details.
    // TODO: Confirm how to get the correct InsightIQ *Profile* ID. Using DB ID as placeholder.
    const profileIdToFetch = dbInfluencer.id;

    if (profileIdToFetch) {
      try {
        profile = await getInsightIQProfileById(profileIdToFetch);
      } catch (profileError) {
        logger.error(
          `[API /influencers/:id] Error fetching InsightIQ profile for ID ${profileIdToFetch}:`,
          profileError
        );
      }
    }

    if (insightiqAccountIdToUse) {
      try {
        audience = await getInsightIQAudience(insightiqAccountIdToUse);
        logger.info(
          `[API /influencers/:id] Successfully fetched data from InsightIQ for account ${insightiqAccountIdToUse}.`
        );
      } catch (iqError) {
        logger.error(
          `[API /influencers/:id] Error fetching data from InsightIQ for account ${insightiqAccountIdToUse}:`,
          iqError
        );
        audience = null;
      }
    }

    // --- 4. Calculate Score ---
    // TODO: Update scoring logic to incorporate fetched InsightIQ data (profile, audience)
    const justifyScore = calculateJustifyScoreV1(dbInfluencer);

    // --- 5. Construct Response (Merge DB & InsightIQ Data) ---
    const safeParseJson = (jsonString: Prisma.JsonValue | null | undefined): any | null => {
      if (typeof jsonString === 'string') {
        try {
          return JSON.parse(jsonString);
        } catch {
          return null;
        }
      }
      return jsonString ?? null;
    };

    const audienceDemographics: AudienceDemographics | null = audience
      ? {
          countries: audience.countries,
          cities: audience.cities,
          gender_age_distribution: audience.gender_age_distribution,
        }
      : safeParseJson(dbInfluencer.audienceDemographics);

    // Map InsightIQ engagement metrics - PLACEHOLDER MAPPING - NEEDS VERIFICATION
    const engagementMetrics: EngagementMetrics | null =
      profile?.reputation || safeParseJson(dbInfluencer.engagementMetrics)
        ? {
            averageLikes:
              profile?.reputation?.follower_count ??
              safeParseJson(dbInfluencer.engagementMetrics)?.averageLikes ??
              null, // EXAMPLE: Incorrect mapping - Needs actual field from profile/engagement endpoint
            averageComments:
              profile?.reputation?.content_count ??
              safeParseJson(dbInfluencer.engagementMetrics)?.averageComments ??
              null, // EXAMPLE: Incorrect mapping
            averageViews:
              profile?.reputation?.subscriber_count ??
              safeParseJson(dbInfluencer.engagementMetrics)?.averageViews ??
              null, // EXAMPLE: Incorrect mapping
            averageShares: null, // EXAMPLE: Need source
          }
        : null;

    const isInsightIQVerified = profile?.is_verified ?? dbInfluencer.isInsightIQVerified ?? false;

    const getPrimaryAudienceDetail = <T extends { value: number }, K extends keyof T>(
      arr: T[] | null | undefined,
      key: K
    ): T[K] | null => {
      if (!arr || arr.length === 0) return null;
      // Explicitly type accumulator and item in reduce
      const primary = arr.reduce(
        (max: T, item: T) => ((item.value ?? 0) > (max.value ?? 0) ? item : max),
        arr[0]
      );
      return primary && key in primary ? primary[key] : null;
    };

    // Use helper, ensuring type compatibility. Cast explicitly if needed after check.
    let primaryLocation: string | null = null;
    const locationCode = getPrimaryAudienceDetail(audience?.countries, 'code');
    if (typeof locationCode === 'string') {
      primaryLocation = locationCode;
    }
    primaryLocation = primaryLocation ?? dbInfluencer.primaryAudienceLocation ?? null;

    // TODO: Add logic to derive primaryAgeRange and primaryAudienceGender from audience.gender_age_distribution
    const primaryAgeRange = dbInfluencer.primaryAudienceAgeRange ?? null;
    const primaryGender =
      (dbInfluencer.primaryAudienceGender as 'Male' | 'Female' | 'Other' | 'Mixed' | null) ?? null;

    const responsePayload: InfluencerProfileData = {
      id: dbInfluencer.id,
      name: profile?.full_name ?? dbInfluencer.name,
      handle: profile?.platform_username ?? dbInfluencer.handle,
      avatarUrl: profile?.image_url ?? dbInfluencer.avatarUrl ?? '',
      platforms: dbInfluencer.platforms as PlatformEnum[],
      followersCount: profile?.reputation?.follower_count ?? dbInfluencer.followersCount ?? 0,
      justifyScore: justifyScore,
      isInsightIQVerified: isInsightIQVerified, // Uses renamed field
      primaryAudienceLocation: primaryLocation,
      primaryAudienceAgeRange: primaryAgeRange, // Placeholder
      primaryAudienceGender: primaryGender, // Placeholder
      engagementRate: null, // Placeholder - needs actual InsightIQ field/calculation
      audienceQualityIndicator:
        (dbInfluencer.audienceQualityIndicator as 'High' | 'Medium' | 'Low' | null) ?? null,
      insightiqUserId: dbInfluencer.insightiqUserId, // Uses renamed field
      bio: profile?.introduction ?? dbInfluencer.bio ?? undefined,
      contactEmail:
        profile?.emails?.find(e => e.type === 'WORK')?.email_id ??
        dbInfluencer.contactEmail ??
        undefined,
      audienceDemographics: audienceDemographics,
      engagementMetrics: engagementMetrics, // Placeholder mapping
      website: profile?.website ?? undefined,
      category: profile?.category ?? undefined,
    };

    // --- TODO: DATA STALENESS NOTE ---
    // The data returned here is based on the last known state in the DB.
    // It might be stale compared to InsightIQ until webhook processing is implemented
    // to handle asynchronous updates (profile changes, new content, etc.).
    // Consider adding a direct InsightIQ fetch here for freshness if needed immediately,
    // but be mindful of rate limits and performance.

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
