import { InstantSearch } from 'react-instantsearch';

// Initialize the Algolia client configuration
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'SJ76D9C6X0';
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '19398b60d78da7cf2ecf128c35b4db09';
const indexName = 'campaigns';

// Interface for Campaign search results
export interface CampaignSearchResult {
  id: string;
  campaignName: string;
  description?: string;
  platform?: string;
  brand?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  objectID: string;
}

// Function to search campaigns using the Algolia REST API
export async function searchCampaigns(query: string): Promise<CampaignSearchResult[]> {
  if (!query || query.trim() === '') {
    return [];
  }
  
  try {
    // Use the Algolia REST API directly
    const url = `https://${appId}-dsn.algolia.net/1/indexes/${indexName}/query`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Algolia-API-Key': apiKey,
        'X-Algolia-Application-Id': appId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        params: `query=${encodeURIComponent(query)}`
      })
    });
    
    if (!response.ok) {
      throw new Error(`Algolia search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.hits as CampaignSearchResult[];
  } catch (error) {
    console.error('Error searching campaigns:', error);
    return [];
  }
}

// Function to index campaign data from database
export async function indexCampaigns(campaigns: any[]): Promise<void> {
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

// For use with react-instantsearch
export const algoliaConfig = {
  appId,
  apiKey,
  indexName
}; 