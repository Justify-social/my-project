import { PrismaClient, Status, Platform, Influencer, Prisma } from '@prisma/client';
import type { CalendarEvent } from '@/components/ui/calendar-upcoming';
import type { CampaignData } from '@/components/ui/card-upcoming-campaign';
import { startOfDay, endOfDay, addMonths, isSameDay } from 'date-fns';

const prisma = new PrismaClient();

// Helper to convert Platform enum to string
function mapPlatformEnumToString(platformEnum: Platform): string {
  // Simple mapping, adjust casing if needed by UI
  return platformEnum.toString();
}

// Helper to convert Status enum to string
function mapStatusEnumToString(statusEnum: Status): string {
  // Simple mapping, potentially refine casing/wording if needed by UI
  // e.g., could return 'In Review' instead of 'IN_REVIEW'
  return statusEnum.toString();
}

// Define a type for CampaignWizard with included Influencers
type CampaignWithInfluencers = Prisma.CampaignWizardGetPayload<{ include: { Influencer: true } }>;

// Fetch upcoming/ongoing events (campaigns) for the calendar
export async function getUpcomingEvents(userId: string): Promise<CalendarEvent[]> {
  console.log(`Fetching upcoming events for user ${userId} from DB (endDate required)...`);
  try {
    const now = new Date();
    const startOfNow = startOfDay(now);
    const nextFewMonths = addMonths(now, 3);
    const endOfNextFewMonths = endOfDay(nextFewMonths);

    // Query based on required endDate: Must end >= now AND start <= future window end
    const campaignsWithInfluencers = await prisma.campaignWizard.findMany({
      where: {
        endDate: { gte: startOfNow }, // Campaign must end today or later
        startDate: { lte: endOfNextFewMonths }, // Campaign must start by end of window
        // TODO: Add user filtering
      },
      include: { Influencer: true },
      orderBy: { startDate: 'asc' },
      take: 50,
    });

    // Use the explicit type here
    return (campaignsWithInfluencers as CampaignWithInfluencers[]).map(
      (campaign): CalendarEvent => {
        const influencers: Influencer[] = campaign.Influencer || [];
        const platforms = [
          ...new Set(
            influencers
              .map((inf: Influencer) => mapPlatformEnumToString(inf.platform))
              .filter((p: string): p is string => !!p)
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
export async function getUpcomingCampaigns(userId: string): Promise<CampaignData[]> {
  console.log(`Fetching upcoming campaigns for user ${userId} from DB (endDate required)...`);
  try {
    const nextFewMonths = addMonths(new Date(), 3);
    const endOfNextFewMonths = endOfDay(nextFewMonths);

    const campaignsWithInfluencers = await prisma.campaignWizard.findMany({
      where: {
        status: { in: [Status.DRAFT, Status.APPROVED, Status.ACTIVE] }, // Include DRAFT status
        startDate: { lte: endOfNextFewMonths }, // Starting within window
        // TODO: Add user filtering
      },
      include: {
        Influencer: {
          select: { handle: true, platform: true },
          take: 1,
        },
      },
      orderBy: { startDate: 'asc' },
      take: 10,
    });

    // Use the specific type here
    return (campaignsWithInfluencers as CampaignWithPrimaryInfluencer[]).map(
      (campaign): CampaignData => {
        // Type assertion might be needed if TS can't infer from include+select+take
        const primaryInfluencer: { handle: string; platform: Platform } | undefined =
          campaign.Influencer?.[0];

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
          platform: primaryInfluencer ? mapPlatformEnumToString(primaryInfluencer.platform) : 'N/A',
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
  } catch (error) {
    console.error('Error fetching upcoming campaigns:', error);
    return [];
  }
}
