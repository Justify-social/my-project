# Plan: Implement Audience Quality Indicator based on Credibility Score

**Goal:** Display an 'Audience Quality' indicator ('High', 'Medium', 'Low') on influencer summary cards in the marketplace. This indicator should reflect the authenticity of the influencer's audience, derived from InsightIQ's `audience.credibility_score`.

**Constraint:** The API endpoint used for the marketplace list view (`POST /v1/social/creators/profiles/search`) does not provide the `audience.credibility_score`. This score is only available in the response from the detailed profile analytics endpoint (`POST /v1/social/creators/profiles/analytics`).

**Approach:** Implement an asynchronous update pattern. The indicator will not be available on initial load for undiscovered profiles but will populate after a profile's details (and its credibility score) have been fetched and stored at least once.

1.  **Fetch Detailed Analytics:** When a user views an influencer's **detailed profile page**, the backend fetches the full analytics data from InsightIQ's `/analytics` endpoint, which includes the `audience.credibility_score`.
2.  **Calculate Indicator:** Translate the numerical `credibility_score` (e.g., 0.0-1.0) into a qualitative indicator ('High', 'Medium', 'Low').
3.  **Store Indicator:** Save the calculated indicator string ('High', 'Medium', 'Low') to our `MarketplaceInfluencer` database table, specifically in the `audienceQualityIndicator` field, alongside other profile details.
4.  **Display Indicator:** When the **marketplace list view** loads:
    - Fetch basic profile summaries via `/search`.
    - For each summary, query our database using the unique identifier (`searchIdentifier`).
    - If a corresponding database record exists _and_ has a value for `audienceQualityIndicator`, display that indicator on the summary card. Otherwise, display 'N/A'.

**Detailed Implementation Steps:**

1.  **Refactor Profile Analytics Fetching (`src/lib/insightiqService.ts`)**

    - **Modify `getSingleInsightIQProfileAnalytics`:**
      - Change its primary logic to call `POST /v1/social/creators/profiles/analytics`.
      - **Input:** It currently receives a single `identifier` (`external_id` or `handle:::platformId`). It needs to parse this to extract the `identifier` (handle/URL) and `work_platform_id` required for the `/analytics` POST request body.
      - **API Call:** Use `makeInsightIQRequest` (or `axios`) to make a `POST` request to `/v1/social/creators/profiles/analytics` with the correct body structure (`{ identifier: string, work_platform_id: string }`).
      - **Response Handling:** Update the function to handle the `CreatorProfileAnalyticsResponse` schema (defined in OpenAPI spec and to be updated in our types). This response nests the main profile data under a `profile` key (e.g., `response.profile`). The function should return the `profile` object (or null).
      - **Fallback/Alternative:** (Optional but consider) Check if `GET /v1/profiles/{id}` (if called with `external_id`) _also_ returns the necessary `audience` object. If it does, prioritize using that endpoint when `external_id` is available, as it might be simpler. If not, the `/analytics` endpoint is necessary. Assume `/analytics` is needed for now.
    - **Update Return Type:** Ensure the function consistently returns `Promise<InsightIQProfile | null>` (where `InsightIQProfile` represents the _profile_ data structure within the `/analytics` response, potentially needing type adjustment).

2.  **Update Type Definitions (`src/types/insightiq.ts`)**

    - Define or verify the `CreatorProfileAnalyticsResponse` interface based accurately on the `openapi.v1.yml` schema.
    - Ensure the nested `audience` object within the profile data includes `credibility_score: number | null` and potentially `follower_types: array | null`.

3.  **Update API Route Logic (`src/app/api/influencers/analytics/route.ts`)**

    - **Call Refactored Service:** Ensure it calls the updated `getSingleInsightIQProfileAnalytics(identifier)`.
    - **Handle Response:** Receive the `InsightIQProfile` object returned by the service.
    - **Extract Score:** Access the score via `insightIQProfile?.audience?.credibility_score`. Handle cases where `audience` or `credibility_score` might be null/undefined in the response.
    - **Calculate Indicator:**
      - Implement logic to convert the numerical score to 'High', 'Medium', or 'Low'. Define clear thresholds (e.g., High >= 0.8, Medium >= 0.5, Low < 0.5). Store the result in a variable `calculatedIndicator`. Handle null/undefined scores appropriately (resulting indicator should likely be null).
    - **Save to Database:**
      - Call the `influencerService.saveProfileIdToDatabase` function (which will be updated in Step 5).
      - Pass the necessary profile data _and_ the `calculatedIndicator` to this save function.
    - **Map Response for Frontend:** Map the _profile data_ part (`insightIQProfile`) to the `InfluencerProfileData` type using `mapInsightIQProfileToInfluencerProfileData` before sending the JSON response to the frontend profile page.

4.  **Update Data Mapping (`src/lib/data-mapping/influencer.ts`)**

    - **Verify/Update `mapInsightIQProfileToInfluencerProfileData`:**
      - Confirm its input parameter `profile: InsightIQProfile` matches the structure returned by the refactored `getSingleInsightIQProfileAnalytics` (i.e., the profile object extracted from the `/analytics` response). Adjust mappings if necessary.
      - This function _doesn't_ need to handle the credibility score directly; that logic is in the API route (Step 3). It just maps the profile fields.

5.  **Update Database Saving (`src/services/influencer/index.ts`)**

    - **Modify `IInfluencerService` Interface:** Update the signature for `saveProfileIdToDatabase` to accept an optional `audienceQualityIndicator?: string | null` parameter within its input object.
    - **Modify `saveProfileIdToDatabase` Implementation:**
      - Add the optional `audienceQualityIndicator` parameter to the function signature.
      - In the `prisma.marketplaceInfluencer.upsert` call:
        - Add `audienceQualityIndicator: audienceQualityIndicator` to the `update` block.
        - Add `audienceQualityIndicator: audienceQualityIndicator` to the `create` block.

6.  **Verify List View Loading (`src/services/influencer/index.ts`)**

    - **Confirm `getProcessedInfluencerList`:** Double-check that it correctly calls `getStoredDataFromDatabase` and includes the logic to assign the fetched `storedData.audienceQualityIndicator` to `summary.audienceQualityIndicator`. (This should be correct from previous steps).

7.  **Verify UI Display (`src/components/features/influencers/InfluencerSummaryCard.tsx`)**

    - **Confirm Card Logic:** Ensure the card component correctly reads `influencer.audienceQualityIndicator` and applies the appropriate badge styling ('High', 'Medium', 'Low', or 'N/A'). (This should be correct from previous steps).

8.  **Testing**
    - Clear relevant database entries (`MarketplaceInfluencer`) if needed for a clean test.
    - Load the marketplace page (indicators should be 'N/A').
    - Click 'View Profile' for an influencer.
    - Verify the detail page loads correctly. Check terminal logs for errors during the `/analytics` fetch and score processing in the API route.
    - Navigate back to the marketplace page.
    - Verify that the 'Audience Quality' indicator ('High'/'Medium'/'Low') now appears on the card for the influencer whose profile was just viewed.
    - Check the database to confirm the `audienceQualityIndicator` field was populated.

**Potential Challenges:**

- Ensuring the `/analytics` endpoint consistently returns the `audience.credibility_score` field in the target environment (sandbox/staging/production).
- Correctly parsing the identifier and making the `POST` request to `/analytics`.
- Handling potential differences in profile object structure between `/profiles/{id}` and `/analytics` responses if both are used.
- Defining appropriate score thresholds for 'High'/'Medium'/'Low'.
