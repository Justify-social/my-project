// scripts/reindex-algolia.ts
import { prisma } from '../../src/lib/prisma'; // Corrected path
import { reindexAllCampaigns } from '../../src/lib/algolia'; // Changed import

// FrontendReadyCampaign interface and manual transformation block will be removed.

async function main() {
  console.log('Starting re-indexing process...');

  try {
    console.log('Fetching campaigns from database...');
    const campaignsFromDb = await prisma.campaignWizard.findMany({
      // include: { Influencer: true }, // If influencer data needs to be indexed, ensure CampaignWizard includes it and transformCampaignForAlgolia handles it.
    });
    console.log(`Fetched ${campaignsFromDb.length} campaigns.`);

    if (campaignsFromDb.length === 0) {
      console.log('No campaigns found in DB to index.');
      return;
    }

    // Manual transformation block removed.
    console.log('Data transformation will be handled by reindexAllCampaigns.');

    console.log(
      `Indexing ${campaignsFromDb.length} campaigns in Algolia using reindexAllCampaigns...`
    );
    await reindexAllCampaigns(campaignsFromDb); // Changed to use reindexAllCampaigns
    console.log('Re-indexing complete!');
  } catch (error) {
    console.error('Error during re-indexing:', error);
    (process as any).exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

main();
