import { PrismaClient, Status, Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

// Define the expected return type, selecting fields needed by ClientCampaignList
// Using Prisma.validator for type safety
const campaignWizardSelectForList = Prisma.validator<Prisma.CampaignWizardSelect>()({
  id: true,
  name: true,
  status: true,
  startDate: true,
  endDate: true,
  budget: true, // Keep as JSON, parse on client
  primaryKPI: true,
  primaryContact: true, // Keep as JSON, parse on client
  createdAt: true,
  Influencer: {
    // For deriving platform
    select: { platform: true },
    take: 1,
  },
  locations: true, // Keep as JSON, parse on client
});

export type CampaignForList = Prisma.CampaignWizardGetPayload<{
  select: typeof campaignWizardSelectForList;
}>;

/**
 * Fetches all campaigns for a specific user.
 * TODO: Add filtering parameters (status, search, objective, dates) and pagination.
 */
export async function getAllCampaignsForUser(clerkUserId: string): Promise<CampaignForList[]> {
  logger.info(`[getAllCampaignsForUser] Fetching for clerkUserId: ${clerkUserId}`);
  try {
    // Fetch the internal User record using the clerkUserId
    const userRecord = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }, // We only need the internal UUID (id)
    });

    if (!userRecord) {
      logger.error('[getAllCampaignsForUser] No User record found for clerkUserId', {
        clerkUserId,
      });
      return []; // Return empty if user not found in DB
    }
    const internalUserId = userRecord.id; // This is the UUID
    logger.info('[getAllCampaignsForUser] Found internal User ID', { internalUserId, clerkUserId });

    const campaigns = await prisma.campaignWizard.findMany({
      where: {
        userId: internalUserId, // Use the internal UUID for the query
      },
      select: campaignWizardSelectForList,
      orderBy: {
        createdAt: 'desc',
      },
    });
    logger.info(
      `[getAllCampaignsForUser] Found ${campaigns.length} campaigns from DB query for internalUserId ${internalUserId}`
    );
    return campaigns;
  } catch (error) {
    logger.error(
      `[getAllCampaignsForUser] Error fetching campaigns for clerkUserId ${clerkUserId}:`,
      { error }
    );
    throw error;
  }
}
