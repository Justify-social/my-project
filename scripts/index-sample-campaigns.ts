const { indexCampaigns } = require('./algolia-client');

// Sample campaign data for testing Algolia search
const sampleCampaigns = [
  {
    id: '1',
    campaignName: 'Summer Brand Awareness',
    description: 'Increase brand awareness during summer season with influencer partnerships',
    platform: 'Instagram',
    brand: 'Beach Lifestyle',
    status: 'active',
    startDate: '2023-06-01',
    endDate: '2023-08-31',
  },
  {
    id: '2',
    campaignName: 'Product Launch Campaign',
    description: 'Launch new eco-friendly product line with targeted influencer marketing',
    platform: 'TikTok',
    brand: 'Green Living',
    status: 'draft',
    startDate: '2023-09-15',
    endDate: '2023-10-15',
  },
  {
    id: '3',
    campaignName: 'Holiday Season Promotion',
    description: 'Boost sales during holiday season with special promotions',
    platform: 'Instagram',
    brand: 'Gift Express',
    status: 'planned',
    startDate: '2023-11-15',
    endDate: '2023-12-31',
  },
  {
    id: '4',
    campaignName: 'Spring Collection Showcase',
    description: 'Highlight the new spring collection through creative content',
    platform: 'YouTube',
    brand: 'Fashion Forward',
    status: 'active',
    startDate: '2023-03-01',
    endDate: '2023-04-30',
  },
  {
    id: '5',
    campaignName: 'Back to School Campaign',
    description: 'Target students and parents for back to school shopping season',
    platform: 'Instagram',
    brand: 'Study Smart',
    status: 'draft',
    startDate: '2023-07-15',
    endDate: '2023-09-05',
  },
  {
    id: '6',
    campaignName: 'Fitness Challenge',
    description: '30-day fitness challenge with influencer participation',
    platform: 'TikTok',
    brand: 'FitLife',
    status: 'active',
    startDate: '2023-05-01',
    endDate: '2023-06-01',
  },
  {
    id: '7',
    campaignName: 'Tech Product Review',
    description: 'Coordinated reviews of new tech products by tech influencers',
    platform: 'YouTube',
    brand: 'TechWorld',
    status: 'planned',
    startDate: '2023-10-01',
    endDate: '2023-11-15',
  },
  {
    id: '8',
    campaignName: 'Travel Destination Highlight',
    description: 'Showcase travel destinations through influencer experiences',
    platform: 'Instagram',
    brand: 'Wanderlust Travel',
    status: 'active',
    startDate: '2023-04-15',
    endDate: '2023-07-31',
  },
];

// Function to run the indexing
const indexSampleCampaigns = async () => {
  try {
    console.log('Indexing sample campaigns to Algolia...');
    await indexCampaigns(sampleCampaigns);
    console.log('Successfully indexed sample campaigns!');
  } catch (error) {
    console.error('Error indexing sample campaigns:', error);
  }
};

// Run the indexing process
indexSampleCampaigns(); 