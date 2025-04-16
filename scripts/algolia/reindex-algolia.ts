// scripts/reindex-algolia.ts
import { CampaignWizard } from '@prisma/client'; // Import type
import { prisma } from '../../src/lib/prisma'; // Corrected path
import { indexCampaigns, CampaignSearchResult } from '../../src/lib/algolia'; // Corrected path, added CampaignSearchResult
import { EnumTransformers } from '../../src/utils/enum-transformers'; // Corrected path

// Define an interface for the expected shape after backend transformation
interface FrontendReadyCampaign {
  id: string;
  name?: string;
  campaignName?: string;
  businessGoal?: string;
  description?: string;
  status?: string | null;
  startDate?: Date | string | null; // Allow Date or string
  endDate?: Date | string | null; // Allow Date or string
  timeZone?: string | null;
  budget?: Record<string, unknown> | null; // More flexible budget type
  primaryKPI?: string | null;
  // Add other potential fields
  [key: string]: unknown;
}

async function main() {
  console.log('Starting re-indexing process...');

  try {
    console.log('Fetching campaigns from database...');
    const campaignsFromDb = await prisma.campaignWizard.findMany({
      // include: { Influencer: true },
    });
    console.log(`Fetched ${campaignsFromDb.length} campaigns.`);

    if (campaignsFromDb.length === 0) {
      console.log('No campaigns found in DB to index.');
      return;
    }

    console.log('Transforming data for Algolia...');
    const transformedCampaigns: Partial<CampaignSearchResult>[] = campaignsFromDb.map(
      (campaign: CampaignWizard) => {
        const frontendReady = EnumTransformers.transformObjectFromBackend(
          campaign
        ) as FrontendReadyCampaign;

        // Explicitly handle potentially null values before assigning
        const tz = frontendReady.timeZone;
        const pKpi = frontendReady.primaryKPI;
        const curr = frontendReady.budget?.currency;
        const tBudget = frontendReady.budget?.total;
        const smBudget = frontendReady.budget?.socialMedia;

        // Construct the object for Algolia, ensuring type compatibility
        const algoliaRecord: Partial<CampaignSearchResult> = {
          objectID: frontendReady.id,
          campaignName: frontendReady.name || frontendReady.campaignName || 'Unknown Campaign',
          description: frontendReady.businessGoal || frontendReady.description || '',
          status: frontendReady.status ?? undefined, // Map null to undefined
          // Convert Date to ISO string or keep null
          startDate:
            frontendReady.startDate instanceof Date
              ? frontendReady.startDate.toISOString()
              : undefined,
          endDate:
            frontendReady.endDate instanceof Date ? frontendReady.endDate.toISOString() : undefined,
          // Use explicit ternary with intermediate variables
          timeZone: tz ? tz : undefined,
          currency: curr ? (curr as string) : undefined,
          totalBudget: tBudget ? (tBudget as number) : undefined,
          socialMediaBudget: smBudget ? (smBudget as number) : undefined,
          primaryKPI: pKpi ? pKpi : undefined,
          // influencerHandles: frontendReady.Influencer?.map((inf: any) => inf.handle).join(', ') || null,
        };
        return algoliaRecord;
      }
    );
    console.log('Data transformation complete.');

    console.log(`Indexing ${transformedCampaigns.length} transformed campaigns in Algolia...`);
    await indexCampaigns(transformedCampaigns); // Now expects Partial<CampaignSearchResult>[]
    console.log('Re-indexing complete!');
  } catch (error) {
    console.error('Error during re-indexing:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

main();
