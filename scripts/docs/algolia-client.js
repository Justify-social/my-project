// A simple CommonJS Algolia client for the indexing script

// Initialize the Algolia client configuration
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'SJ76D9C6X0';
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '19398b60d78da7cf2ecf128c35b4db09';
const indexName = 'campaigns';

// Function to index campaign data
function indexCampaigns(campaigns) {
  if (!campaigns || campaigns.length === 0) {
    console.warn('No campaigns to index');
    return Promise.resolve();
  }

  try {
    // Transform campaigns to ensure they have objectID (required by Algolia)
    const records = campaigns.map(campaign => ({
      ...campaign,
      objectID: campaign.id || campaign.objectID || `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    }));

    // Use the Algolia REST API directly for indexing
    const url = `https://${appId}.algolia.net/1/indexes/${indexName}/batch`;
    
    // Using node-fetch for Node.js environment
import fetch from 'node-fetch';
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'X-Algolia-API-Key': process.env.ALGOLIA_ADMIN_API_KEY || apiKey,
        'X-Algolia-Application-Id': appId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: records.map(record => ({
          action: 'addObject',
          body: record
        }))
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(`Algolia indexing failed: ${JSON.stringify(errorData)}`);
        });
      }
      console.log(`Successfully indexed ${records.length} campaigns!`);
    })
    .catch(error => {
      console.error('Error indexing campaigns:', error);
      throw error;
    });
  } catch (error) {
    console.error('Error indexing campaigns:', error);
    return Promise.reject(error);
  }
}

module.exports = {
  indexCampaigns,
  appId,
  apiKey,
  indexName
}; 