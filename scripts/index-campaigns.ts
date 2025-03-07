const { prisma } = require('../src/lib/prisma');
const { indexCampaigns } = require('../src/lib/algolia');

/**
 * Script to index all campaigns from the database to Algolia
 */
async function main() {
  try {
    // Fetch all campaigns from the database
    console.log('Fetching campaigns from database...');
    const campaigns = await prisma.campaignWizard.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      // Limit to prevent too many records for development
      // Remove this limit in production if needed
      take: 100
    });
    
    console.log(`Found ${campaigns.length} campaigns in the database.`);
    
    if (campaigns.length === 0) {
      console.log('No campaigns to index.');
      return;
    }
    
    // Transform campaigns to the format required by Algolia
    const algoliaRecords = campaigns.map(campaign => ({
      objectID: campaign.id,
      id: campaign.id,
      campaignName: campaign.name,
      description: campaign.businessGoal || '',
      platform: '', // Extract from campaign data if available
      brand: '', // Extract from campaign data if available
      status: campaign.status || 'DRAFT',
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString() : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString() : '',
    }));
    
    // Index to Algolia
    console.log('Indexing campaigns to Algolia...');
    await indexCampaigns(algoliaRecords);
    
    console.log('Indexing complete!');
  } catch (error) {
    console.error('Error indexing campaigns:', error);
    process.exit(1);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 