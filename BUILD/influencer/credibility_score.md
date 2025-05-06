# Plan: Implement Audience Quality Indicator & Justify Score (V2)

**Goal:** Display an 'Audience Quality' indicator ('High', 'Medium', 'Low') and a comprehensive 'Justify Score' on influencer cards/profiles. This indicator reflects audience authenticity based on InsightIQ's `audience.credibility_score`, and the score incorporates multiple factors including credibility, engagement, verification, and followers.

**Constraint:** InsightIQ's `/search` endpoint (used for list view) lacks detailed analytics like `audience.credibility_score`. This score is only available from `/analytics` (profile detail view). The `/analytics` endpoint is currently unreliable (403 errors for some profiles).

**Approach (Hybrid V1.5/V2 with Persistence):**
1.  **Calculate Discovery Score (V1.5):** In the backend list API (`/api/influencers`), calculate an initial score based on readily available data from `/search` (verification, followers, engagement rate). Function: `calculateDiscoveryScore`.
2.  **Fetch Detailed Analytics:** When a user views a profile (`/influencer-marketplace/[id]`), the backend attempts to fetch full data from InsightIQ `/analytics` (`fetchDetailedProfile`).
3.  **Calculate & Persist Full Score/Indicator (V2):** If the `/analytics` fetch succeeds:
    *   Calculate the **Full Justify Score (V2)** using richer data including `audience.credibility_score` (Function: `calculateFullJustifyScore`).
    *   Calculate the **Audience Quality Indicator** ('High'/'Medium'/'Low') based on `audience.credibility_score`.
    *   **Save** these calculated values (`justifyScore`, `audienceQualityIndicator`) to the local `MarketplaceInfluencer` database table using the influencer's unique composite ID (`searchIdentifier`). (Function: `saveAnalysedProfileData`).
4.  **Enrich List View:** When the marketplace list (`/api/influencers`) loads:
    *   Calculate the initial Discovery Score (V1.5).
    *   Query the local `MarketplaceInfluencer` table for the influencers being listed.
    *   If a persisted V2 score and indicator exist for an influencer, **overwrite** the V1.5 score with the V2 score and include the indicator in the data sent to the frontend.
5.  **Display Score & Tooltip:**
    *   **Marketplace List:** Display the score received from the API. Use a **dynamic tooltip** (with `appJustify` icon) explaining whether it's the basic Discovery Score (V1.5) or the full V2 Score (if enriched from DB).
    *   **Profile Page:** Display the score calculated from the detailed data (which will be V2 if `/analytics` succeeded, or potentially null/V1.5-like if using mock fallback). Use a tooltip explaining the V2 factors.

**Detailed Implementation Status:**

1.  **Update Scoring Service (`src/lib/scoringService.ts`)**
    *   Renamed `calculateJustifyScoreV1` -> `calculateDiscoveryScore` & added `engagement_rate`. **[✔ Implemented]**
    *   Created `calculateFullJustifyScore` (awaits V2 logic refinement & reliable `audience.credibility_score`). **[✔ Implemented (Placeholder V2 Logic)]**

2.  **Update Type Definitions (`src/types/insightiq.ts`)**
    *   Ensured `InsightIQProfileWithAnalytics` includes `audience.credibility_score`. **[✔ Verified]**

3.  **Update Profile Analytics Fetching & API (`src/lib/insightiqService.ts`, `/api/influencers/fetch-profile`)**
    *   Profile fetch (`getAndMapProfileByHandleAndPlatform`) attempts to call `/analytics`. **[✔ Implemented]**
    *   Profile fetch calls `saveAnalysedProfileData` in background on success. **[✔ Implemented]**
    *   **BLOCKER:** `/analytics` endpoint returning 403 error for some profiles. **[❌ NOT RESOLVED - External Dependency]**

4.  **Update Data Mapping (`src/lib/data-mapping/influencer.ts`)**
    *   `mapInsightIQProfileToInfluencerSummary` calls `calculateDiscoveryScore`. **[✔ Implemented]**
    *   `mapInsightIQProfileToInfluencerProfileData` calls `calculateFullJustifyScore`. **[✔ Implemented]**

5.  **Update Database Schema & Saving (`schema.prisma`, `src/services/influencer/index.ts`)**
    *   Added `justifyScore` and `audienceQualityIndicator` to `MarketplaceInfluencer`. **[✔ Implemented & Migrated]**
    *   Updated `saveAnalysedProfileData` interface and implementation to calculate & save V2 score/indicator. **[✔ Implemented]**
    *   Updated `getStoredDataFromDatabase` interface and implementation to retrieve score/indicator. **[✔ Implemented]**

6.  **Update List View Loading (`src/services/influencer/index.ts`)**
    *   Implemented enrichment step in `getProcessedInfluencerList` to fetch/merge persisted V2 data. **[✔ Implemented]**

7.  **Update UI Display (`src/components/features/influencers/InfluencerSummaryCard.tsx`)**
    *   Added dynamic tooltip explaining V1.5/V2 score. **[✔ Implemented]**
    *   Display logic for `audienceQualityIndicator` badge exists. **[✔ Verified]**

**Current State:** The hybrid score mechanism is implemented. The marketplace shows a V1.5 score initially, which gets upgraded to V2 once a profile is successfully analyzed and the score is persisted. The main blocker is the 403 error on the `/analytics` endpoint preventing V2 calculation/persistence for some profiles. The tooltip clarifies the score source.
