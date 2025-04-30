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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Await the params object before accessing its properties
  const awaitedParams = await params;
  const id = awaitedParams.id;

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
    // --- Directly fetch from InsightIQ using the validated ID ---
    logger.info(
      `[API /influencers/:id] Attempting to fetch profile directly from InsightIQ for ID: ${id}`
    );
    let profile: InsightIQProfile | null = null;
    try {
      profile = await getInsightIQProfileById(id);
      logger.info(
        `[API /influencers/:id] Successfully fetched InsightIQ profile for ID ${id}. Profile name: ${profile?.full_name}`
      );
    } catch (profileError: any) {
      logger.error(
        `[API /influencers/:id] Error fetching InsightIQ profile for ID ${id}:`,
        profileError?.message || profileError
      );
      if (profileError?.status === 404 || profileError?.message?.includes('Not Found')) {
        logger.warn(`[API /influencers/:id] InsightIQ profile not found for ID: ${id}`);
        return NextResponse.json(
          { success: false, error: 'Influencer not found' },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to fetch influencer details from provider',
            details: profileError?.message,
          },
          { status: 500 }
        );
      }
    }

    if (!profile) {
      logger.error(
        `[API /influencers/:id] InsightIQ profile fetch succeeded but profile data is null/empty for ID: ${id}`
      );
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve valid influencer details from provider' },
        { status: 500 }
      );
    }

    // --- Fetch Audience Data (Deferred for MVP) ---
    let audience: InsightIQGetAudienceResponse | null = null;
    logger.warn(
      `[API /influencers/:id] Skipping Audience fetch for MVP as DB link lookup was removed.`
    );

    // --- Calculate Score (Deferred for MVP) ---
    const justifyScore = null; // Placeholder for MVP
    logger.warn(
      `[API /influencers/:id] Skipping Score calculation for MVP as DB data is not used.`
    );

    // --- Construct Response (using ONLY InsightIQ `profile` data) ---
    const audienceDemographics: AudienceDemographics | null = null; // Cannot fetch for MVP
    const engagementMetrics: EngagementMetrics | null = null; // Cannot fetch detailed audience for MVP

    // Corrected mapping based on InsightIQProfile type
    const isVerified = profile.is_verified ?? false;
    const primaryLocation = profile.country ?? null; // Use profile.country
    const primaryAgeRange = null; // Placeholder - Requires Audience data
    const primaryGender = null; // Placeholder - Requires Audience data
    const engagementRate = null; // Not directly available in profile type
    const audienceQualityIndicator = null; // Placeholder - Requires Audience data or specific profile fields

    const responsePayload: InfluencerProfileData = {
      id: id, // Use the requested ID
      name: profile.full_name ?? null,
      handle: profile.platform_username ?? null,
      avatarUrl: profile.image_url ?? null,
      platforms: profile.work_platform ? ([profile.work_platform.name] as PlatformEnum[]) : [], // Example mapping - needs refinement
      followersCount: profile.reputation?.follower_count ?? null,
      justifyScore: justifyScore,
      isVerified: isVerified, // Corrected property name
      primaryAudienceLocation: primaryLocation, // Corrected source
      primaryAudienceAgeRange: primaryAgeRange, // Placeholder
      primaryAudienceGender: primaryGender, // Placeholder
      engagementRate: engagementRate, // Corrected source (null for now)
      audienceQualityIndicator: audienceQualityIndicator, // Placeholder
      bio: profile.introduction ?? null,
      contactEmail: profile.emails?.find(e => e.type === 'WORK')?.email_id ?? null,
      audienceDemographics: audienceDemographics, // Null for MVP
      engagementMetrics: engagementMetrics, // Null for MVP
      website: profile.website ?? null,
      category: profile.category ?? null,
    };

    return NextResponse.json({ success: true, data: responsePayload });
  } catch (error: unknown) {
    // Catch unexpected errors outside the specific InsightIQ fetch block
    const message = error instanceof Error ? error.message : 'Unknown internal error';
    logger.error(
      `[API /influencers/:id] Unexpected error processing influencer ${id}:`,
      message,
      error
    );
    return NextResponse.json(
      { success: false, error: 'Failed to process influencer details', details: message },
      { status: 500 }
    );
  }
}
