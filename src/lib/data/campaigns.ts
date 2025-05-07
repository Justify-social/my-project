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
export async function getAllCampaignsForUser(userId: string): Promise<CampaignForList[]> {
  logger.info(`Fetching all campaigns for user ${userId} from CampaignWizard`);
  try {
    const campaigns = await prisma.campaignWizard.findMany({
      where: {
        userId: userId,
      },
      select: campaignWizardSelectForList,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return campaigns;
  } catch (error) {
    logger.error(`Error fetching campaigns for user ${userId}:`, { error });
    // It's often better to throw the error here to be handled by the API route
    // rather than returning an empty array, so the caller knows something went wrong.
    throw error;
  }
}
