# Algolia Search Integration

**Last Updated:** 2025-03-07  
**Status:** Active  
**Owner:** Search Team

## Overview

This document covers the integration of Algolia search into the application. Algolia provides powerful search capabilities with features like typo tolerance, faceted search, and instant results.

## Configuration

The Algolia integration is configured with the following environment variables:

```
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_API_KEY=your_search_api_key
ALGOLIA_ADMIN_API_KEY=your_admin_api_key
```

- `NEXT_PUBLIC_ALGOLIA_APP_ID`: Your Algolia application ID
- `NEXT_PUBLIC_ALGOLIA_API_KEY`: The search-only API key (can be exposed to the client)
- `ALGOLIA_ADMIN_API_KEY`: The admin API key for indexing operations (server-side only)

## Implementation

### Search Client

The search client is implemented in `/src/lib/algolia.ts`. It provides:

1. A `searchCampaigns` function that uses the Algolia REST API to search for campaigns
2. An `indexCampaigns` function for indexing campaigns to Algolia
3. Configuration for use with the `react-instantsearch` library

### Indexing Campaigns

Campaigns are indexed to Algolia through the `/api/search/index-campaigns` API endpoint. This endpoint:

- Accepts POST requests with campaign data to index
- Provides a GET endpoint to reindex all campaigns from the database

To manually trigger reindexing of all campaigns, use:

```bash
curl -X GET http://localhost:3000/api/search/index-campaigns
```

Or use the npm script:

```bash
npm run algolia:reindex
```

### Search Interface

The search interface is implemented using the `react-instantsearch` library. The main components are:

1. `SearchBox`: For user input
2. `Hits`: To display search results
3. `RefinementList`: For faceted filtering

## Data Structure

Campaigns are indexed with the following structure:

```typescript
interface CampaignSearchResult {
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
```

## Maintenance

### Reindexing

Campaigns should be reindexed when:

1. New campaigns are created
2. Existing campaigns are updated
3. Campaigns are deleted

This can be automated through webhooks or scheduled tasks.

### Monitoring

Monitor the Algolia dashboard for:

1. Search performance
2. Popular search terms
3. Failed searches

## Troubleshooting

### Common Issues

1. **Search returns no results**: Check that campaigns have been indexed properly
2. **Indexing fails**: Verify the ALGOLIA_ADMIN_API_KEY is correct
3. **Search is slow**: Consider optimizing the index settings

### Debugging

Use the test script to verify search functionality:

```bash
npm run test-algolia-search
```

## Future Improvements

1. Implement automatic reindexing through webhooks
2. Add faceted search for filtering by platform, status, etc.
3. Implement analytics to track popular searches
