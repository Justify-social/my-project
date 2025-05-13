import {
  PrismaClient,
  Status,
  Platform as PrismaPlatform,
  Influencer,
  Prisma,
} from '@prisma/client';
import type { CalendarEvent } from '@/components/ui/calendar-upcoming';
import type { CampaignData } from '@/components/ui/card-upcoming-campaign';
import { startOfDay, endOfDay, addMonths, isSameDay } from 'date-fns';
// Import the SSOT PlatformEnum
import { PlatformEnum } from '@/types/enums';
// Import logger
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

// Helper to map Prisma Platform enum to SSOT PlatformEnum
// Returns null if mapping is not found
const mapPrismaPlatformToEnum = (
  prismaPlatform: PrismaPlatform | null | undefined
): PlatformEnum | null => {
  if (!prismaPlatform) return null;
  switch (prismaPlatform) {
    case PrismaPlatform.INSTAGRAM:
      return PlatformEnum.Instagram;
    case PrismaPlatform.YOUTUBE:
      return PlatformEnum.YouTube;
    case PrismaPlatform.TIKTOK:
      return PlatformEnum.TikTok;
    // Add other Prisma Platform values if they exist and map to PlatformEnum
    default:
      logger.warn(
        `[mapPrismaPlatformToEnum] Unknown Prisma platform type encountered: ${prismaPlatform}`
      );
      return null;
  }
};

// Helper to convert Status enum to string
function mapStatusEnumToString(statusEnum: Status): string {
  // Simple mapping, potentially refine casing/wording if needed by UI
  // e.g., could return 'In Review' instead of 'IN_REVIEW'
  return statusEnum.toString();
}

// Define a type for CampaignWizard with included Influencers
type CampaignWithInfluencers = Prisma.CampaignWizardGetPayload<{ include: { Influencer: true } }>;

// Fetch upcoming/ongoing events (campaigns) for the calendar
export async function getUpcomingEvents(
  clerkUserId: string,
  orgId: string
): Promise<CalendarEvent[]> {
  logger.info(`[getUpcomingEvents] Fetching for clerkUserId: ${clerkUserId}, orgId: ${orgId}`);
  try {
    // Fetch the internal User record using the clerkUserId
    const userRecord = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!userRecord) {
      logger.error('[getUpcomingEvents] No User record found for clerkUserId', { clerkUserId });
      return []; // Or throw an error
    }
    // const internalUserId = userRecord.id; // This might not be needed if primary filter is orgId
    logger.info('[getUpcomingEvents] Found internal User ID', {
      internalUserId: userRecord.id,
      clerkUserId,
    });

    const now = new Date();
    const startOfNow = startOfDay(now);
    const nextFewMonths = addMonths(now, 3);
    const endOfNextFewMonths = endOfDay(nextFewMonths);

    // Query based on required endDate: Must end >= now AND start <= future window end
    const campaignsWithInfluencers = await prisma.campaignWizard.findMany({
      where: {
        orgId: orgId, // Filter by organization ID
        // userId: internalUserId, // Optionally, keep filtering by user ID
        endDate: { gte: startOfNow }, // Campaign must end today or later
        startDate: { lte: endOfNextFewMonths }, // Campaign must start by end of window
      },
      include: { Influencer: true },
      orderBy: { startDate: 'asc' },
      take: 50,
    });

    // Use the explicit type here
    return (campaignsWithInfluencers as CampaignWithInfluencers[]).map(
      (campaign): CalendarEvent => {
        const influencers: Influencer[] = campaign.Influencer || [];
        // Map Prisma Platform to PlatformEnum, then get unique string values
        const platforms = [
          ...new Set(
            influencers
              .map((inf: Influencer) => mapPrismaPlatformToEnum(inf.platform as PrismaPlatform)) // Map to SSOT enum
              .filter((p): p is PlatformEnum => p !== null) // Filter out nulls
              .map(p => p.toString()) // Convert enum back to string if needed by UI
          ),
        ];
        const platformString = platforms.join(', ');
        const influencerHandles = influencers.map((inf: Influencer) => inf.handle); // Type inf

        let budgetAmount: number | undefined = undefined;
        try {
          // Attempt to parse budget assuming JSON like { "total": number } or just a number
          if (
            typeof campaign.budget === 'object' &&
            campaign.budget !== null &&
            'total' in campaign.budget &&
            typeof campaign.budget.total === 'number'
          ) {
            budgetAmount = campaign.budget.total;
          } else if (typeof campaign.budget === 'number') {
            budgetAmount = campaign.budget;
          } else if (typeof campaign.budget === 'string') {
            const parsed = JSON.parse(campaign.budget);
            if (typeof parsed === 'number') {
              budgetAmount = parsed;
            } else if (
              typeof parsed === 'object' &&
              parsed !== null &&
              'total' in parsed &&
              typeof parsed.total === 'number'
            ) {
              budgetAmount = parsed.total;
            }
          }
        } catch (e) {
          console.error('Error parsing budget JSON:', e);
        }

        const isAllDay =
          !campaign.endDate ||
          isSameDay(campaign.startDate, campaign.endDate || campaign.startDate);

        return {
          id: campaign.id,
          title: campaign.name,
          start: campaign.startDate,
          end: campaign.endDate ?? undefined,
          status: campaign.status ?? undefined,
          platform: platformString || undefined,
          budget: budgetAmount,
          influencerHandles: influencerHandles,
          allDay: isAllDay,
        };
      }
    );
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
}

// Define type for the result of the specific campaign query
type CampaignWithPrimaryInfluencer = Prisma.CampaignWizardGetPayload<{
  include: {
    Influencer: {
      select: { handle: true; platform: true };
      take: 1;
    };
  };
}>;

// Fetch upcoming campaigns for the table
export async function getUpcomingCampaigns(
  clerkUserId: string,
  orgId: string
): Promise<CampaignData[]> {
  logger.info(`[getUpcomingCampaigns] Fetching for clerkUserId: ${clerkUserId}, orgId: ${orgId}`);
  try {
    // Fetch the internal User record using the clerkUserId
    const userRecord = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!userRecord) {
      logger.error('[getUpcomingCampaigns] No User record found for clerkUserId', { clerkUserId });
      return []; // Or throw an error
    }
    const internalUserId = userRecord.id; // This is the UUID
    logger.info('[getUpcomingCampaigns] Found internal User ID', { internalUserId, clerkUserId });

    const now = new Date();
    const nextFewMonths = addMonths(now, 3);
    const endOfNextFewMonths = endOfDay(nextFewMonths);
    logger.info(
      `[getUpcomingCampaigns] Current time (server): ${now.toISOString()}, Querying campaigns starting before or on: ${endOfNextFewMonths.toISOString()}`
    );

    const whereClause: Prisma.CampaignWizardWhereInput = {
      orgId: orgId, // Filter by organization ID
      // userId: internalUserId, // Optionally, keep filtering by user ID if campaigns are user-specific within an org
      status: { in: [Status.DRAFT, Status.APPROVED, Status.ACTIVE] },
      startDate: { lte: endOfNextFewMonths }, // Starting within window
    };
    logger.info('[getUpcomingCampaigns] Prisma whereClause:', whereClause);

    const campaignsWithInfluencers = await prisma.campaignWizard.findMany({
      where: whereClause,
      include: {
        Influencer: {
          select: { handle: true, platform: true },
          take: 1,
        },
      },
      orderBy: { startDate: 'asc' },
      take: 10,
    });
    logger.info(
      `[getUpcomingCampaigns] Found ${campaignsWithInfluencers.length} campaigns from DB query.`
    );

    // Use the specific type here
    const mappedCampaigns = (campaignsWithInfluencers as CampaignWithPrimaryInfluencer[]).map(
      (campaign): CampaignData => {
        const primaryInfluencer: { handle: string; platform: PrismaPlatform } | undefined =
          campaign.Influencer?.[0];

        // Map Prisma Platform to SSOT PlatformEnum, then to string if needed
        const mappedPlatformEnum = primaryInfluencer
          ? mapPrismaPlatformToEnum(primaryInfluencer.platform)
          : null;
        const platformString = mappedPlatformEnum ? mappedPlatformEnum.toString() : 'N/A';

        let budgetAmount: number | undefined = undefined;
        try {
          if (
            typeof campaign.budget === 'object' &&
            campaign.budget !== null &&
            'total' in campaign.budget &&
            typeof campaign.budget.total === 'number'
          ) {
            budgetAmount = campaign.budget.total;
          } else if (typeof campaign.budget === 'number') {
            budgetAmount = campaign.budget;
          } else if (typeof campaign.budget === 'string') {
            const parsed = JSON.parse(campaign.budget);
            if (typeof parsed === 'number') {
              budgetAmount = parsed;
            } else if (
              typeof parsed === 'object' &&
              parsed !== null &&
              'total' in parsed &&
              typeof parsed.total === 'number'
            ) {
              budgetAmount = parsed.total;
            }
          }
        } catch (e) {
          console.error('Error parsing budget JSON:', e);
        }

        return {
          id: campaign.id,
          title: campaign.name,
          platform: platformString,
          startDate: campaign.startDate,
          endDate: campaign.endDate ?? undefined,
          status: mapStatusEnumToString(campaign.status ?? Status.DRAFT),
          budget: budgetAmount,
          influencer: primaryInfluencer
            ? {
                name: primaryInfluencer.handle,
              }
            : undefined,
        };
      }
    );
    logger.info(
      `[getUpcomingCampaigns] Mapped ${mappedCampaigns.length} campaigns. IDs: ${mappedCampaigns.map(c => c.id).join(', ')}`
    );
    return mappedCampaigns;
  } catch (error) {
    logger.error('[getUpcomingCampaigns] Error fetching upcoming campaigns:', {
      clerkUserId,
      error,
    });
    return [];
  }
}
