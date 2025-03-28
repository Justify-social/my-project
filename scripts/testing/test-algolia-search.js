// Simple script to test Algolia search functionality
import fetch from 'node-fetch';

async function testAlgoliaSearch() {
  try {
    console.log('Testing Algolia search functionality...');
    
    // Make a search request to the Algolia API
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'SJ76D9C6X0';
    const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '19398b60d78da7cf2ecf128c35b4db09';
    const indexName = 'campaigns';
    
    // Search query
    const query = 'campaign';
    
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
    console.log(`Found ${data.hits.length} results for query "${query}":`);
    console.log(JSON.stringify(data.hits, null, 2));
    
    console.log('Search test completed successfully!');
  } catch (error) {
    console.error('Error testing Algolia search:', error);
  }
}

// Run the test
testAlgoliaSearch(); 