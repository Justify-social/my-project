/**
 * Test script for campaign creation API
 * 
 * This script tests the campaign creation API by sending a POST request
 * with valid campaign data and verifying the response.
 */

// Use dynamic import for node-fetch
import('node-fetch').then(({ default: fetch }) => {
  testCampaignCreation(fetch);
}).catch(err => {
  console.error('Failed to import node-fetch:', err);
});

async function testCampaignCreation(fetch) {
  console.log('Testing campaign creation API...');
  
  // Generate a unique campaign name to avoid conflicts
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const campaignName = `Test Campaign ${timestamp}`;
  
  // Create test data
  const testData = {
    campaignName,
    description: 'Test campaign description',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    budgetTotal: 10000,
    budgetSocialMedia: 5000,
    budgetInfluencers: 5000,
    currency: 'USD',
    timezone: 'UTC',
    step: 1,
    status: 'DRAFT',
    influencer: {
      handle: 'testinfluencer',
      platform: 'INSTAGRAM'
    },
    submission: {
      primaryContact: {
        firstName: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        position: 'Manager'
      },
      secondaryContact: {
        firstName: 'Jane',
        surname: 'Smith',
        email: 'jane.smith@example.com',
        position: 'Director'
      },
      platform: 'INSTAGRAM',
      mainMessage: 'Test main message',
      primaryKPI: 'BRAND_AWARENESS'
    }
  };
  
  try {
    // Send POST request to campaign creation API
    const response = await fetch('http://localhost:3000/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    // Parse response
    const result = await response.json();
    
    // Check if campaign was created successfully
    if (response.ok && result.success) {
      console.log('✅ Campaign created successfully!');
      console.log('Campaign ID:', result.data.id);
      console.log('Campaign Name:', result.data.name);
      console.log('Status:', result.data.status);
    } else {
      console.error('❌ Failed to create campaign:');
      console.error('Status:', response.status);
      console.error('Error:', result.error || 'Unknown error');
      console.error('Details:', result.details || '');
    }
  } catch (error) {
    console.error('❌ Error making API request:', error.message);
  }
} 