import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/utils/logger';
import { InfluencerProfileData } from '@/types/influencer';
import { getPhylloAccountIdentity, getPhylloProfileAnalytics } from '@/lib/phylloService'; // Import Phyllo service functions
import { calculateJustifyScoreV1 } from '@/lib/scoringService'; // Import scoring function

const prisma = new PrismaClient();

// Define params type for clarity
interface RouteParams {
  params: { id: string };
}

// Zod schema for ID validation (ensure it's a UUID)
const IdSchema = z.string().uuid({ message: 'Invalid Influencer ID format (must be UUID)' });

export async function GET(request: NextRequest, { params }: RouteParams) {
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
    // --- Fetch Data from DB ---
    const dbInfluencer = await prisma.MarketplaceInfluencer.findUnique({
      where: { id },
    });

    if (!dbInfluencer) {
      logger.warn(`[API /influencers/:id] Influencer not found in DB for ID: ${id}`);
      return NextResponse.json({ success: false, error: 'Influencer not found' }, { status: 404 });
    }

    // --- Data Enrichment (Phyllo - Placeholder/Example) ---
    // In a real scenario, we'd need to know the Phyllo Account ID linked to this MarketplaceInfluencer ID.
    // This mapping needs to be established (e.g., stored when an account connects via SDK).
    // For MVP / testing with sandbox, we might use a placeholder or skip enrichment.
    let phylloVerifiedStatus: boolean | undefined = dbInfluencer.isPhylloVerified ?? undefined;
    let phylloAnalytics: any = {
      audienceDemographics: dbInfluencer.audienceDemographics,
      engagementMetrics: dbInfluencer.engagementMetrics,
    }; // Default to DB data

    // Example enrichment (requires mapping ID -> Phyllo Account ID)
    /*
        const phylloAccountId = await getPhylloAccountIdForInfluencer(id); // Needs implementation
        if (phylloAccountId) {
            const [identity, analytics] = await Promise.all([
                getPhylloAccountIdentity(phylloAccountId),
                getPhylloProfileAnalytics(phylloAccountId)
            ]);
            phylloVerifiedStatus = identity?.status === 'CONNECTED';
            // TODO: Map analytics data more precisely
            phylloAnalytics = {
                 audienceDemographics: analytics?.audience, // Map fields correctly
                 engagementMetrics: analytics?.engagement, // Map fields correctly
                 // Potentially update followersCount, bio etc. from analytics
            };
        }
        */

    // --- Calculate Score ---
    const justifyScore = calculateJustifyScoreV1(dbInfluencer); // Calculate score using DB data for now

    // --- Format Response ---
    const responsePayload: InfluencerProfileData = {
      id: dbInfluencer.id,
      name: dbInfluencer.name,
      handle: dbInfluencer.handle,
      avatarUrl: dbInfluencer.avatarUrl ?? '',
      platforms: dbInfluencer.platforms,
      followersCount: dbInfluencer.followersCount ?? 0,
      justifyScore: justifyScore, // Use calculated score
      isPhylloVerified: phylloVerifiedStatus ?? false, // Use enriched or DB value
      primaryAudienceLocation: dbInfluencer.primaryAudienceLocation ?? undefined,
      primaryAudienceAgeRange: dbInfluencer.primaryAudienceAgeRange ?? undefined,
      primaryAudienceGender: (dbInfluencer.primaryAudienceGender as any) ?? undefined,
      engagementRate: dbInfluencer.engagementRate ?? undefined,
      audienceQualityIndicator: (dbInfluencer.audienceQualityIndicator as any) ?? undefined,
      bio: dbInfluencer.bio ?? undefined,
      contactEmail: dbInfluencer.contactEmail ?? undefined,
      // Use enriched or DB value for complex types
      audienceDemographics: phylloAnalytics.audienceDemographics
        ? JSON.parse(JSON.stringify(phylloAnalytics.audienceDemographics))
        : null, // Basic JSON parsing if needed
      engagementMetrics: phylloAnalytics.engagementMetrics
        ? JSON.parse(JSON.stringify(phylloAnalytics.engagementMetrics))
        : null, // Basic JSON parsing if needed
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
