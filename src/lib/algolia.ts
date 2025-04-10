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

  const fetchTimerLabel = `Algolia Fetch: ${query}`;
  console.time(fetchTimerLabel); // Start fetch timer
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
  } finally {
    console.timeEnd(fetchTimerLabel); // End fetch timer
  }
}

// Function to index campaign data from database by replacing existing content
export async function indexCampaigns(campaigns: any[]): Promise<void> {
  if (!process.env.ALGOLIA_ADMIN_API_KEY) {
    console.error('Error: ALGOLIA_ADMIN_API_KEY is not set in environment variables. Cannot clear index.');
    throw new Error('Missing Algolia Admin API Key for indexing.');
  }

  const indexClearUrl = `https://${appId}.algolia.net/1/indexes/${indexName}/clear`;
  const indexBatchUrl = `https://${appId}.algolia.net/1/indexes/${indexName}/batch`;
  const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;

  console.log(`Attempting to clear Algolia index: ${indexName}`);

  try {
    // Step 1: Clear the index using Admin API Key
    const clearResponse = await fetch(indexClearUrl, {
      method: 'POST',
      headers: {
        'X-Algolia-API-Key': adminApiKey,
        'X-Algolia-Application-Id': appId,
        'Content-Type': 'application/json'
      }
    });

    if (!clearResponse.ok) {
      const errorData = await clearResponse.json();
      console.error('Algolia clear index failed:', errorData);
      throw new Error(`Algolia clear index failed: ${JSON.stringify(errorData)}`);
    }

    const clearResult = await clearResponse.json();
    console.log(`Algolia index clear initiated. Task ID: ${clearResult.taskID}`);

    // Optional: Add a small delay or implement task waiting if needed, 
    // but often clear is fast enough for subsequent batch add in scripts.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    // Step 2: Add new records if there are any
    if (!campaigns || campaigns.length === 0) {
      console.log('No campaigns provided to index after clearing. Index is now empty.');
      return; // Exit successfully after clearing
    }

    console.log(`Indexing ${campaigns.length} campaigns after clear...`);
    // Transform campaigns to ensure they have objectID
    const records = campaigns.map(campaign => ({
      ...campaign,
      objectID: campaign.id || campaign.objectID || `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    }));

    const batchResponse = await fetch(indexBatchUrl, {
      method: 'POST',
      headers: {
        'X-Algolia-API-Key': adminApiKey, // Use Admin key for writing
        'X-Algolia-Application-Id': appId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: records.map(record => ({
          action: 'addObject',
          body: record
        }))
      })
    });

    if (!batchResponse.ok) {
      const errorData = await batchResponse.json();
      console.error('Algolia batch add failed:', errorData);
      throw new Error(`Algolia batch add failed: ${JSON.stringify(errorData)}`);
    }

    const batchResult = await batchResponse.json();
    console.log(`Successfully indexed ${records.length} campaigns! Task IDs:`, batchResult.taskID);

  } catch (error) {
    console.error('Error during Algolia re-indexing process:', error);
    throw error; // Re-throw the error to be caught by the script runner
  }
}

// For use with react-instantsearch
export const algoliaConfig = {
  appId,
  apiKey,
  indexName
}; 