# Influencer Discovery & Marketplace Architecture

**Last Reviewed**: 2025-05-09
**Status:** Draft - Requires Review by Feature Lead

## 1. Overview

The Influencer Discovery feature provides a marketplace interface (`/influencer-marketplace`) for users (Brand Marketers, Agency Professionals) to search, filter, and view profiles of potential influencers for marketing campaigns. It relies heavily on an external data provider (InsightIQ) and includes custom scoring and data persistence mechanisms.

## 2. Core Data Models (Prisma)

- **`MarketplaceInfluencer`**: Defined in `config/prisma/schema.prisma`. This model acts as a persistent cache and enrichment layer for influencer data primarily sourced from InsightIQ.
  - Stores summarized profile info, key metrics (`followersCount`, `engagementRate`), audience indicators, verification status (`isInsightIQVerified`), and the calculated `justifyScore`.
  - Includes unique identifiers (`insightiqUserId`, `searchIdentifier`, `platformSpecificId`) to link back to the external source and search results.
  - Tracks the last refresh time (`insightiqDataLastRefreshedAt`).
- **`InsightIQAccountLink`**: Links a `MarketplaceInfluencer` record to one or more specific connected platform accounts within InsightIQ.

## 3. Key Services & External Dependencies

- **Influencer Service (`src/services/influencer/index.ts`)**: The central orchestrator for this feature.
  - `getProcessedInfluencerList`: Handles requests from the marketplace frontend. It queries the external `InsightIQ` service (likely via `searchInsightIQProfilesByParams`), potentially across multiple platforms, maps the raw data using `mapInsightIQProfileToInfluencerSummary`, calculates a `justifyScore` (using `scoringService`), applies backend filters (like score or audience quality), potentially enriches data from the persisted `MarketplaceInfluencer` records, and returns the final list and total count for pagination.
  - `getInfluencerProfileData`: Fetches detailed profile data for a specific influencer (likely via `fetchDetailedProfile` from `insightiqService`), maps it using `mapInsightIQProfileToInfluencerProfileData`, calculates the full score, and potentially saves/updates the `MarketplaceInfluencer` record.
  - `getStoredDataFromDatabase`: Retrieves specific fields from the persisted `MarketplaceInfluencer` records for enrichment.
- **InsightIQ Service (`src/lib/insightiqService.ts`)**: Contains functions to interact with the external InsightIQ API.
  - `searchInsightIQProfilesByParams`: Searches for influencers based on filters.
  - `fetchDetailedProfile`: Retrieves comprehensive profile data, including analytics, for a specific influencer.
  - Handles authentication and interaction with the InsightIQ API.
- **Scoring Service (`src/lib/scoringService.ts`)**: Calculates the custom `justifyScore`.
  - `calculateDiscoveryScore`: Calculates a score based on limited data available in search results.
  - `calculateFullJustifyScore`: Calculates a more comprehensive score using detailed profile analytics.
- **Data Mapping (`src/lib/data-mapping/influencer.ts`)**: Provides functions to transform data structures between the InsightIQ API format, Prisma models (`MarketplaceInfluencer`), and frontend TypeScript types (`InfluencerSummary`, `InfluencerProfileData`).

## 4. API Routes

- **`/api/influencers/search` (or similar - _Assumed_)**: Endpoint likely called by the frontend marketplace page (`page.tsx`) to fetch the list of influencers. It receives filter and pagination parameters and internally calls `influencerService.getProcessedInfluencerList`.
- **`/api/influencers/[id]` (or similar - _Assumed_)**: Endpoint likely called by the influencer profile detail page to fetch comprehensive data for a single influencer. It internally calls `influencerService.getInfluencerProfileData`.

## 5. Frontend Components & Pages

- **Marketplace Page (`src/app/influencer-marketplace/page.tsx`)**: The main UI.
  - Manages state for filters, search term, pagination, and selections.
  - Fetches data using client-side requests to the backend API (likely wrapped in `useQuery` hooks).
  - Renders `MarketplaceFilters` and `MarketplaceList`.
- **Filters (`src/components/features/influencers/MarketplaceFilters.tsx`)**: UI for applying search filters (platform, followers, verification, etc.).
- **List & Card (`MarketplaceList.tsx`, `InfluencerSummaryCard.tsx`)**: Display the search results.
- **Profile Detail Page (`src/app/influencer-marketplace/[username]/page.tsx`)**: Displays the full profile information for a selected influencer.

## 6. Data Flow & Logic (Marketplace Search - High Level)

1.  User loads `/influencer-marketplace`.
2.  `page.tsx` component mounts and triggers a data fetch (e.g., via `useQuery`) to `/api/influencers/search` with default filters/pagination.
3.  API route handler receives the request.
4.  Handler calls `influencerService.getProcessedInfluencerList`.
5.  `influencerService` calls `insightiqService.searchInsightIQProfilesByParams` to query the external InsightIQ API.
6.  `insightiqService` returns raw profile data.
7.  `influencerService` maps raw data to `InfluencerSummary` using `mapInsightIQProfileToInfluencerSummary`.
8.  `influencerService` calculates `justifyScore` for each summary using `calculateDiscoveryScore`.
9.  `influencerService` applies backend-only filters (e.g., min/max score, audience quality if implemented).
10. (Optional) `influencerService` might enrich summaries with persisted data from `MarketplaceInfluencer` DB table (e.g., platformSpecificId) using `getStoredDataFromDatabase`.
11. `influencerService` returns the filtered, scored, and paginated list of `InfluencerSummary` objects along with the total count.
12. API route returns the data as JSON.
13. Frontend (`page.tsx`) receives the data, updates state, and renders the `MarketplaceList`.

## 7. Key Considerations

- **InsightIQ Dependency**: The feature heavily relies on the availability, performance, and data structure of the InsightIQ API.
- **Data Freshness & Caching**: Balancing the need for fresh data from InsightIQ with performance. The `MarketplaceInfluencer` model acts as a cache, but requires a strategy for refreshing (`insightiqDataLastRefreshedAt`). API responses should also be cached appropriately (client-side via TanStack Query, potentially server-side).
- **Scoring Logic**: The `justifyScore` calculation needs to be well-defined and potentially versioned.
- **Filtering**: Distinguishing between filters applied directly to the InsightIQ API query versus filters applied on the backend after fetching.
- **Scalability**: Handling potentially large numbers of influencers returned from InsightIQ and ensuring efficient database operations (upserts to `MarketplaceInfluencer`).
- **Error Handling**: Robust handling of errors from the InsightIQ API and database operations.

This architecture provides a foundation for searching and displaying influencer data but requires careful management of the external dependency and data synchronization/scoring logic.
