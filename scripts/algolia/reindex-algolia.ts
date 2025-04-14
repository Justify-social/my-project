// scripts/reindex-algolia.ts
import { PrismaClient, CampaignWizard } from '@prisma/client'; // Import type
import { prisma } from '../../src/lib/prisma'; // Corrected path
import { indexCampaigns } from '../../src/lib/algolia'; // Corrected path
import { EnumTransformers } from '../../src/utils/enum-transformers'; // Corrected path

async function main() {
  console.log('Starting re-indexing process...');

  try {
    console.log('Fetching campaigns from database...');
    // Fetch all campaigns. Include relations if needed for indexing.
    const campaignsFromDb = await prisma.campaignWizard.findMany({
      // include: { Influencer: true }, // Uncomment if you need influencer data
    });
    console.log(`Fetched ${campaignsFromDb.length} campaigns.`);

    if (campaignsFromDb.length === 0) {
      console.log('No campaigns found in DB to index.');
      return;
    }

    // --- Data Transformation ---
    console.log('Transforming data for Algolia...');
    const transformedCampaigns = campaignsFromDb.map((campaign: CampaignWizard) => {
      // Use the existing frontend transformer first
      // Assert type to help TypeScript, though it might be loosely typed
      const frontendReady = EnumTransformers.transformObjectFromBackend(campaign) as any;

      // Further flatten or select specific fields if needed for Algolia
      // Example: Flatten budget, primaryContact, etc.
      return {
        objectID: frontendReady.id, // Use campaign ID as objectID
        // Use safe access with fallbacks
        campaignName: frontendReady.name || frontendReady.campaignName || 'Unknown Campaign',
        description: frontendReady.businessGoal || frontendReady.description || '',
        status: frontendReady.status || null,
        startDate: frontendReady.startDate || null, // Keep as ISO string or format if needed
        endDate: frontendReady.endDate || null,
        timeZone: frontendReady.timeZone || null,
        // Flatten budget safely
        currency: frontendReady.budget?.currency || null,
        totalBudget: frontendReady.budget?.total || null,
        socialMediaBudget: frontendReady.budget?.socialMedia || null,
        // Add other fields you want searchable
        primaryKPI: frontendReady.primaryKPI || null,
        // Add influencer handles if needed (assuming Influencer relation was included)
        // influencerHandles: frontendReady.Influencer?.map((inf: any) => inf.handle).join(', ') || null,
        // ... add more fields as required for your search use case ...
      };
    });
    console.log('Data transformation complete.');
    // ------------------------

    console.log(`Indexing ${transformedCampaigns.length} transformed campaigns in Algolia...`);
    await indexCampaigns(transformedCampaigns); // This function is in src/lib/algolia.ts
    console.log('Re-indexing complete!');
  } catch (error) {
    console.error('Error during re-indexing:', error);
    process.exit(1); // Exit with error code
  } finally {
    await prisma.$disconnect(); // Ensure Prisma client disconnects
    console.log('Prisma client disconnected.');
  }
}

main();
