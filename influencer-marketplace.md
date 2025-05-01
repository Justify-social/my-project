## Influencer Feature Directory Structure

This outlines the primary files involved in the influencer marketplace and profile features.

```
src/
├── app/
│   ├── api/
│   │   └── influencers/
│   │       ├── [identifier]/            # API route for individual influencer profiles
│   │       │   └── route.ts             # Handles GET for specific influencer by ID/handle + platform
│   │       ├── summaries/               # API route for fetching multiple influencer summaries
│   │       │   └── route.ts             # Handles GET for summaries by a list of IDs
│   │       └── route.ts                 # API route for listing/searching influencers
│   └── influencer-marketplace/          # UI pages for the marketplace
│       ├── [username]/                # Dynamic page for individual influencer profile view
│       │   └── page.tsx
│       └── page.tsx                     # Main marketplace listing page
├── components/
│   └── features/
│       └── influencers/                 # Reusable UI components for influencer features
│           ├── MarketplaceList.tsx      # Component to display the list/grid of influencers
│           ├── MarketplaceFilters.tsx   # Component for filtering/sorting the marketplace
│           ├── InfluencerSummaryCard.tsx # Card displaying summary info in the marketplace list
│           ├── ProfileHeader.tsx        # Header section for the individual profile page
│           ├── RiskScoreSection.tsx     # Component for the Justify Score/Risk section
│           ├── ... (Other profile page sections like Performance, Campaigns etc.)
├── lib/
│   ├── insightiqService.ts            # Service for interacting with the InsightIQ API (fetching profiles, audience)
│   ├── insightiqUtils.ts              # Utility functions related to InsightIQ data
│   └── scoringService.ts              # Service for calculating the Justify Score
├── services/
│   └── influencer/
│       └── index.ts                   # Potential service layer specifically for influencer logic (currently seems light?)
└── types/
    ├── influencer.ts                  # Frontend type definitions for influencer data (Profile, Summary, etc.)
    ├── insightiq.ts                   # Type definitions mapping to InsightIQ API responses
    └── enums.ts                       # Shared enumerations (like PlatformEnum)
```

## SSOT Analysis & Observations

1.  **API Routes:** You have three distinct API routes for influencers:

    - `/api/influencers`: Handles listing/searching.
    - `/api/influencers/summaries`: Fetches multiple summaries by ID list.
    - `/api/influencers/[identifier]`: Fetches a single detailed profile by identifier + platform.
    - **Observation:** This separation seems reasonable. Ensure there isn't significant overlap in the _data fetching logic_ within these routes. Consider centralizing common fetching/mapping logic if duplication exists.

2.  **Type Definitions:**

    - `types/influencer.ts`: Defines the structure for frontend components (`InfluencerProfileData`, `InfluencerSummary`).
    - `types/insightiq.ts`: Defines the structure matching the external InsightIQ API.
    - `types/enums.ts`: Defines shared enums like `PlatformEnum`.
    - **Observation:** This separation is good practice. The mapping between `InsightIQProfile` (from `insightiq.ts`) and `InfluencerProfileData` (in `influencer.ts`) happens within the API routes (like `/api/influencers/[identifier]/route.ts`). This is a key area to maintain SSOT – ensure the mapping logic is consistent and ideally centralized if used in multiple places. The `mapPlatformsToFrontend` function in `/api/influencers/summaries/route.ts` is a good example of mapping logic; ensure similar mappings are handled consistently.

3.  **Service Layer:**

    - `lib/insightiqService.ts`: Clearly handles interaction with the external InsightIQ API. This is good SSOT for external API interaction.
    - `lib/scoringService.ts`: Centralizes the scoring logic. Good SSOT.
    - `services/influencer/index.ts`: The purpose of this file isn't immediately clear from the structure alone. It _could_ be a place to consolidate business logic related to influencers (e.g., combining data from Prisma and InsightIQ before sending to the API response), but it seems potentially underutilized or its responsibility might overlap with the API routes themselves.
    - **Recommendation:** Review `services/influencer/index.ts`. If it contains significant business logic, ensure the API routes are using it consistently. If it's minimal, consider whether its logic could be moved directly into the API routes or into more specific service files in `lib/` if it's reusable.

4.  **Build Errors & Types:** The recent build errors highlighted type mismatches, particularly around `null` values not being handled correctly when mapping between different data layers (e.g., query params to validated strings, backend enums to frontend enums).

    - **Recommendation:** Continue using Zod for robust input validation at API boundaries (as fixed in `/api/influencers/[identifier]/route.ts`). Be diligent about handling potential `null` or `undefined` values when mapping data, using techniques like `.filter(Boolean)` or explicit checks where necessary (as fixed in `/api/influencers/summaries/route.ts`). Ensure function return types accurately reflect whether `null` or `undefined` is possible.

5.  **UI Components:** The separation under `components/features/influencers` looks well-organized for UI-specific components.

**Overall:** The structure appears reasonably organized. The main areas to focus on for SSOT are:

- Consistent data mapping between InsightIQ types and frontend types.
- Clear definition and usage of the `services/influencer` layer (if applicable).
- Strict type checking and handling of potentially null/undefined values, especially at data transformation boundaries.

## Deeper SSOT Analysis & Potential Improvements (v2)

_Further analysis considering potential conflicts and the InsightIQ OpenAPI spec._

1.  **API Route Logic:** _(No change from previous analysis - consolidation recommended via JIRA-1)_

2.  **Type Mapping (`InsightIQ` -> `Influencer`):** _(No change from previous analysis - centralization recommended via JIRA-3)_

3.  **Service Layer (`services/influencer`):** _(No change from previous analysis - clarification/refactoring recommended via JIRA-2)_

4.  **Prisma Interaction & Types:** _(Refined)_

    - **Concern:** The `/api/influencers/route.ts` doesn't use Prisma directly, relying on InsightIQ search. However, `/api/influencers/summaries/route.ts` _does_ use Prisma (`prisma.marketplaceInfluencer.findMany`) and correctly maps the Prisma `PlatformBackend` enum to the frontend `PlatformEnum`. `/lib/data/dashboard.ts` _also_ interacts with Prisma's `Influencer` and `Platform` types, using its own mapping.
    - **SSOT Improvement (JIRA-4):** Ensure _all_ Prisma interactions involving the `Platform` enum consistently map to the central `PlatformEnum` defined in `src/types/enums.ts`. Consolidate the `mapPlatformEnumToString` helper from `lib/data/dashboard.ts` or refactor the dashboard logic to use standard types/mappers.

5.  **Conflicting Types/Logic:**
    - **`PlatformEnumBackend`:** A separate Zod-based enum (`PlatformEnumBackend`) exists in `src/components/features/campaigns/types.ts` and is used within the campaign feature and `card-influencer.tsx`. This directly conflicts with the primary `PlatformEnum` in `src/types/enums.ts`. **This is a significant SSOT violation.** _(Status: Resolved)_
    - **Campaign Influencer Types:** Utilities in `src/utils/` (`api-response-formatter.ts`, `form-transformers.ts`) define and handle `Influencer` types specific to forms/API payloads, likely for the Campaign Wizard feature. Need to clarify if this represents the same core entity as the Marketplace Influencer defined in `src/types/influencer.ts`. If so, types should be unified or share a base. If distinct, consider renaming for clarity (e.g., `CampaignInfluencerFormValues`). _(Status: Types renamed in form-transformers.ts via JIRA-6)_
    - **Platform Mapping Duplication:** Logic to map platform representations exists in multiple places (summaries API route, data-mapping file, dashboard data file). _(Status: Partially resolved by centralizing Prisma mapping in data-mapping file. Still need to address dashboard.)_

## Suggested JIRA Tickets (Revised)

---

**JIRA-1: Refactor Influencer API Data Fetching & Mapping** _(Status: Partially Done)_

- **Description:** Consolidate logic for fetching influencer data (from Prisma, InsightIQ) and mapping it to frontend types (`InfluencerProfileData`, `InfluencerSummary`) into a central service (`services/influencer`) or shared helper functions (`lib/`). This aims to reduce code duplication across the `/api/influencers/*` routes and ensure consistent data handling. _(Progress: Logic moved for `/[identifier]` and `/` routes into `influencerService`)_
- **Acceptance Criteria:**
  - Core data fetching logic is removed from individual API routes.
  - Data mapping logic (InsightIQ -> Frontend, Prisma -> Frontend) is centralized.
  - API routes primarily handle request validation, calling the central service/helpers, and response formatting.
  - Existing functionality of all three influencer API endpoints is preserved.

---

**JIRA-2: Define and Refactor `services/influencer` Layer** _(Status: Partially Done)_

- **Description:** Clearly define the responsibilities of the `services/influencer/index.ts` file. Refactor relevant business logic and data orchestration (e.g., combining Prisma and InsightIQ data, calculating scores) from API routes into this service layer. If the service layer is deemed unnecessary, remove it and relocate any minor logic appropriately. _(Progress: Added `getProcessed...` functions for list and identifier routes)_
- **Acceptance Criteria:**
  - The role of `services/influencer/index.ts` is documented or made clear through its implementation.
  - Business logic related to influencers is demonstrably centralized within this service (or confirmed to be minimal and handled elsewhere).
  - API routes interact with this service layer for complex operations.

---

**JIRA-3: Standardize InsightIQ/Prisma to Frontend Type Mapping** _(Status: Partially Done)_

- **Description:** Extract and centralize functions responsible for mapping data structures between external sources/DB (InsightIQ types, Prisma models) and internal frontend types (`InfluencerProfileData`, `InfluencerSummary`). Ensure functions like `mapPlatformsToFrontend` and `mapInsightIQPlatformToEnum` are defined centrally (likely in `lib/data-mapping/influencer.ts`) and reused consistently across all API routes and services. Remove or refactor duplicated mapping logic (e.g., from `lib/data/dashboard.ts`). _(Progress: Centralized InsightIQ->Profile, InsightIQ->Summary, Prisma->Summary mappings. Need to address dashboard mapping.)_
- **Acceptance Criteria:**
  - Reusable mapping functions exist centrally for common transformations (e.g., platforms, locations, gender).
  - API routes and services import and use these shared mapping functions.
  - Type safety related to mapping is improved.
  - Duplicated mapping logic is removed.

---

**JIRA-4: Enhance Prisma Query Type Safety & Unify Platform Enums** _(Status: Partially Done)_

- **Description:** Review Prisma queries used across _all_ features (Influencer Marketplace, Campaigns, Dashboard). Ensure explicit type handling for enums/nullables. **Crucially, deprecate and remove `PlatformEnumBackend` from `src/components/features/campaigns/types.ts` and refactor all dependent code (Campaigns feature, `card-influencer.tsx`, etc.) to use the single source of truth: `PlatformEnum` from `src/types/enums.ts`.** Ensure Prisma `Platform` enum results are consistently mapped to `PlatformEnum`. _(Progress: Removed PlatformEnumBackend and refactored dependent components. Still need to check dashboard Prisma usage)_
- **Acceptance Criteria:**
  - `PlatformEnumBackend` is removed.
  - All code uses `PlatformEnum` from `src/types/enums.ts` for platform representation.
  - Prisma query results involving `Platform` are safely mapped to `PlatformEnum`.
  - The build error related to `PlatformEnum` mapping is confirmed resolved and similar issues are prevented application-wide.

---

**JIRA-5: Fix Incorrect Influencer Profile Loading**

- **Description:** When navigating from the influencer marketplace list to an individual influencer's profile page (e.g., `/influencer-marketplace/leomessi?platformId=...`), the page often loads and displays data for a different influencer than the one selected/present in the URL.
- **Acceptance Criteria:**
  - Clicking on an influencer link in the marketplace consistently loads the profile page displaying the correct data for _that specific influencer_.
  - The `username` in the URL path segment (`/[username]`) corresponds to the influencer displayed.
  - The `platformId` query parameter is correctly used (if necessary) to fetch the data for the specific platform profile.
  - Data flow from link generation (marketplace) to parameter extraction (profile page) to API call (profile page fetching data) is verified and corrected.
  - If the external API (InsightIQ) returns a profile that does not match the requested identifier, an appropriate error is returned to the frontend, preventing the display of incorrect data.
- **Status & Findings (2025-05-01 v6 - Final Internal Check & Root Cause Isolation):**
  - Exhaustive internal code review (UI Page -> Service Layer -> API Route -> InsightIQ Service Wrapper -> Data Mapping) confirms the application correctly extracts and passes the dynamic `identifier` (e.g., 'leomessi') and `platformId` parameters from the URL through all internal layers to the final external API call.
  - Debug logs confirm the InsightIQ Service Wrapper (`fetchProfileByIdentifier`) constructs the correct JSON request body (`{ "identifier": "...", "work_platform_id": "..." }`) for the external API endpoint (`POST /v1/social/creators/profiles/analytics`).
  - Review of `openapi.v1.yml` confirms the request structure strictly adheres to the API specification provided by InsightIQ.
  - Logs consistently show the external InsightIQ API responding successfully (HTTP 200) but returning profile data where `platform_username` **does not match** the requested `identifier`. The specific incorrect profile returned varies (e.g., 'cristiano', 'selenagomez', 'kyliejenner', 'instagram').
  - The internal defensive check implemented in the service layer correctly identifies this data mismatch from the external API and causes the application's API route (`/api/influencers/[identifier]`) to return a 404 error, preventing the incorrect profile from being displayed to the user.
  - Internal factors like caching, state management conflicts, utility function interference, Prisma data conflicts, and build issues have been investigated and ruled out as the cause of the external API returning mismatched data.
  - **Explicit Conclusion:** The root cause of the failure to load the correct influencer profile is definitively isolated to the **behavior of the external InsightIQ API endpoint `/v1/social/creators/profiles/analytics`**. This endpoint is not correctly using the provided `work_platform_id` in conjunction with the `identifier` to return the specifically requested profile, instead returning data associated with other profiles.
- **Status & Findings (2025-05-01 v9 - Root Cause Confirmed: Faulty Search API Data):**
  - UI screenshot confirmed all influencer cards displayed the same `workPlatformId` (Instagram's UUID: `9bb...`).
  - Verified internal code (`MarketplaceList`, `InfluencerSummaryCard`) correctly uses the `workPlatformId` provided in the `InfluencerSummary` data to construct links/callbacks.
  - Verified the mapping function (`mapInsightIQProfileToInfluencerSummary`) correctly extracts `workPlatformId` using data available in the `InsightIQProfile` object received.
  - Verified the service function (`getProcessedInfluencerList`) correctly calls the mapping function for each result from the InsightIQ Search API (`getInsightIQProfiles`).
  - Verified the UUID map (`getInsightIQWorkPlatformId`) is correct based on OpenAPI spec examples.
  - **Explicit Conclusion:** The root cause is **incorrect data returned by the external InsightIQ Search API (`POST /v1/social/creators/profiles/search`)**. When no platform filter is applied, this API appears to incorrectly return profiles with the _same_ `work_platform` details (including the `id` '9bb...') for multiple different influencers. The internal application code then correctly, but erroneously, uses this faulty `work_platform.id` (`9bb...`) when generating links for _all_ influencers (e.g., Messi, Ronaldo, etc.) displayed on the marketplace list. Clicking these links leads to the subsequent profile fetch API (`/analytics`) receiving the correct handle but the wrong platform ID, causing InsightIQ to return a mismatched profile, which our internal defensive check now correctly identifies, resulting in a 404 error.
  - **Current Status:** The application correctly identifies the mismatch caused by the faulty external data and prevents displaying the wrong profile (shows 404). The internal mapping logic relies on the `work_platform.name` from the search results (which might also be incorrect) to determine the `PlatformEnum`, and then looks up the correct UUID internally via `getInsightIQWorkPlatformId` to populate `workPlatformId` for the link generation. This is the best internal workaround given the faulty search results.
  - **Next Steps (External Dependency Resolution Required):**
    1.  **(Confirm via Direct API Call):** Optionally, perform a direct API call to `POST /v1/social/creators/profiles/search` (using Postman/curl) without platform filters and verify if the `work_platform` object in the response is indeed inconsistent across different profiles (e.g., always showing Instagram details).
    2.  **(External Action - CRITICAL):** Contact InsightIQ support regarding the **`/v1/social/creators/profiles/search`** endpoint. Report that the search results contain incorrect `work_platform` data (specifically inconsistent or incorrect `work_platform.id` and potentially `work_platform.name`) for various profiles when no platform filter is applied, providing examples. Explain this prevents correct link generation and subsequent profile fetching.
    3.  **(Post-External Fix):** Once InsightIQ confirms their search API is fixed, re-test the marketplace list and profile navigation thoroughly.
    4.  **(Internal Workaround Status):** The defensive check in `getProcessedInfluencerProfileByIdentifier` (returning 404 on mismatch) should **remain** in place even after the external fix, as a safety measure against future API inconsistencies.

---

**JIRA-X: Persistently Store InsightIQ `work_platform_id`** _(New Recommendation)_

- **Description:** Modify Prisma schema (`MarketplaceInfluencer` or `InsightIQAccountLink`) to add a field for explicitly storing the InsightIQ `work_platform_id` (UUID). Update data ingestion/update logic to populate this field. Refactor link generation and API calls to use this persistent ID where appropriate instead of relying solely on dynamic mapping from enums or search results.
- **Rationale:** Provides a more reliable internal SSOT for the crucial platform identifier required by certain InsightIQ APIs, reducing dependency on potentially inconsistent external data presentation.

---

**JIRA-6: Clarify/Unify Campaign Influencer Types** _(Status: Partially Done)_

- **Description:** Investigate the `Influencer` types and related transformation logic used in the Campaign Wizard feature (`src/utils/api-response-formatter.ts`, `src/utils/form-transformers.ts`). Determine if this represents the same core entity as the Marketplace Influencer (`src/types/influencer.ts`). If so, unify the types or create shared base types. If distinct, rename Campaign-specific types (e.g., `CampaignInfluencerFormValues`) for clarity. _(Progress: Renamed types in `form-transformers.ts`. Need to check `api-response-formatter.ts`)_
- **Acceptance Criteria:**
  - The relationship between Campaign Influencer types and Marketplace Influencer types is clarified.
  - Types are unified or renamed appropriately to avoid confusion and potential conflicts.
  - Data transformation logic in utils is reviewed for consistency with any unified types.

---

**JIRA-7: Implement Robust Influencer Profile Linking Using `platform_profile_id`**

- **Description**: The current influencer marketplace feature incorrectly loads random profiles when users click "View Profile" due to faulty data from the external InsightIQ Search API (`POST /v1/social/creators/profiles/search`). The API returns the same `work_platform.id` (e.g., `9bb8913b-ddd9-430b-a66a-d74d846e6c66` for Instagram) for multiple influencers, causing mismatches when fetching detailed profiles via `POST /v1/social/creators/profiles/analytics`. A robust, long-term solution is to use `platform_profile_id`—a unique identifier per influencer profile as identified in the InsightIQ OpenAPI spec (`openapi.v1.yml`)—instead of `workPlatformId` for linking and fetching profiles. This ticket aims to refactor the codebase to use `platform_profile_id`, potentially persist it, and confirm API compatibility.
- **Issue Details**:
  - Root Cause: InsightIQ Search API returns inconsistent `work_platform.id` values, leading to incorrect link generation and profile fetching.
  - Additional Root Cause (2025-05-01): Investigation revealed the listing API (`/api/influencers`) was using an incorrect InsightIQ endpoint (`GET /v1/profiles`) instead of the correct search endpoint (`POST /v1/social/creators/profiles/search`). This resulted in missing `platform_username` data, causing the mapping function to skip all profiles and display "No matching influencers found."
  - Additional Root Cause (2025-05-01): The profile page (`/influencer-marketplace/[username]/page.tsx`) was incorrectly attempting to call server-side service code (`influencerService`) directly from the client-side component, leading to errors (`InsightIQ Client ID or Secret is missing`) because sensitive environment variables are not available in the browser.
  - Impact: Users experience 404 errors or see data for the wrong influencer when navigating to profile pages. Currently, no influencers are displayed on the marketplace list.
  - Solution: Replace `workPlatformId` with `platform_profile_id` as the unique identifier for profiles, leveraging fields and endpoints like `/v1/profiles/{id}` from the InsightIQ API spec for reliable linking. Correct the listing API to use the appropriate search endpoint. Fix client-side data fetching on the profile page to call the internal API route.
- **Acceptance Criteria**:
  - The application extracts and uses `platform_profile_id` from InsightIQ API responses (potentially requiring separate fetches if not available in search results) as the primary identifier for linking to influencer profiles.
  - Profile fetching logic is updated to prioritize `platform_profile_id` with an appropriate InsightIQ endpoint.
  - UI components generate "View Profile" links/actions using `platform_profile_id` (e.g., as `profileId` query parameter).
  - (Optional but Recommended) The database schema (Prisma) is extended to store `platform_profile_id` persistently.
  - Defensive checks remain in place to prevent displaying mismatched profile data.
  - All existing functionality for listing and viewing influencer profiles is restored and works correctly.
  - API compatibility for using `platform_profile_id` is confirmed with InsightIQ support.
  - Data fetching on the profile page correctly calls the internal API route.
  - Comprehensive testing verifies correct listing, linking, and profile loading.
  - Internal documentation is updated.
- **Files to Update and Implementation Plan** (Revised):
  1. **API Service (`src/lib/insightiqService.ts`)**:
     - _Verify_ `getInsightIQProfiles` uses `POST /v1/social/creators/profiles/search`. _(Done)_
     - _Confirm_ if `platform_profile_id` is available in the search response (likely not based on spec). If not, plan to fetch it separately when needed (e.g., in `getProcessedInfluencerProfileByIdentifier`).
     - _Modify_ `fetchProfileByIdentifier` to prioritize using `platform_profile_id` with `/v1/profiles/{id}` (requires API confirmation) or pass it as a parameter to `/analytics` endpoint.
     - _Fix_ configuration loading issue related to `getInsightIQBasicAuthHeader` if it persists after client-side fetch correction.
     - Priority: High
  2. **Data Mapping (`src/lib/data-mapping/influencer.ts`)**:
     - _Ensure_ mapping correctly handles `platform_profile_id` if/when it becomes available in source data.
     - Priority: Medium (dependent on API service changes)
  3. **Influencer Service Layer (`src/services/influencer/index.ts`)**:
     - _Adjust_ service functions (`getProcessed...`) to handle fetching/passing `profileId` and potentially orchestrate separate fetches if needed.
     - Priority: Medium
  4. **UI Link Generation (`src/components/features/influencers/InfluencerSummaryCard.tsx`)**:
     - _Ensure_ `onViewProfile` receives and passes `profileId` (currently `null` from API, needs fix upstream).
     - _Restore_ debug display for `workPlatformId` and `profileId`. _(Done)_
     - Priority: Medium (dependent on API/Service providing `profileId`)
  5. **Profile Page (`src/app/influencer-marketplace/[username]/page.tsx`)**:
     - _Fix_ client-side data fetching to call `/api/influencers/[identifier]` API route. _(Done)_
     - _Ensure_ `profileId` is extracted from query params and passed correctly in the API call.
     - Priority: High (partially done)
  6. **API Route (`src/app/api/influencers/[identifier]/route.ts`)**:
     - _Ensure_ route correctly parses `profileId` from query and passes it to the service layer.
     - Priority: Medium
  7. **Type Definitions (`src/types/influencer.ts`)**:
     - _Ensure_ `profileId` field exists and is correctly typed. _(Done)_
     - Priority: Low
  8. **Database Schema (Prisma)**:
     - _Consider_ adding `insightiq_profile_id` field for persistence.
     - Priority: Medium/Low (long-term improvement)
  9. **Documentation and Testing**:
     - _Update_ this JIRA ticket with findings. _(Done)_
     - _Test_ marketplace listing and profile page loading after fixes.
     - _Conduct_ thorough end-to-end testing.
     - Priority: High (post-fix)
- **Dependencies and Risks**:
  - Dependency: Confirmation from InsightIQ on API endpoint capabilities for using `platform_profile_id` and availability in search results. Mitigation: Fallback to fetching IDs separately or using handle/platformId with robust validation.
  - Risk: `POST /v1/social/creators/profiles/search` might _still_ not return `platform_profile_id`, requiring extra steps to fetch it for linking.
- **Status**: In Progress. Refactoring `insightiqService.ts`.

---

**JIRA-8: Resolve Missing Unique Profile ID from Marketplace List**

- **Status**: **Closed (Superseded by JIRA-11)**. The root cause (Search API limitation) is acknowledged. The resolution is handled by JIRA-11's strategy of using the composite key for linking and JIRA-9 for future persistence.

---

**JIRA-9: Establish `platform_profile_id` as SSOT via Database Persistence**

- **Description**: To overcome the InsightIQ Search API limitation (JIRA-8) and ensure reliable profile linking, establish `platform_profile_id` as the SSOT by persisting it in the local database (`MarketplaceInfluencer` table) once obtained from detailed profile fetches.
- **Status**: Definition refined. **HOLD**: This strategy is secondary to making the primary list fetch and detail link work reliably first using the chosen identifier (see JIRA-11).

---

**JIRA-10: Refactor Marketplace List to Use `/v1/profiles` API for SSOT**

- **Status**: **Rejected**. While `/v1/profiles` provides the necessary IDs (`profile.id`, `platform_profile_id`), it appears limited to SDK-connected accounts and does not provide access to InsightIQ's full discovery database, contradicting the goal of broad marketplace visibility. The limited results (12 profiles in sandbox, some incomplete) make it unsuitable for the primary list view.

---

**JIRA-11: Implement Robust Linking via Composite Key & POST /search API**

- **Description**: Resolve profile mismatch/404 errors by simplifying routing and ensuring the detail page fetch uses the correct identifiers.
- **Strategy**:
  1. Use `POST /v1/social/creators/profiles/search` for both list and detail fetches.
  2. Generate a unique composite key (`handle_platformId`) for list items lacking `external_id`.
  3. Simplify routing: Pass the **full composite key** directly in the URL path (e.g., `/influencer-marketplace/{composite_key}`).
  4. Refactor detail fetch (`getSingleInsightIQProfileBySearch`) to parse the composite key from the path parameter and query InsightIQ using **both** `platform_username` and `work_platform_id`.
  5. Add validation to confirm the returned profile matches the request.
  6. Fix UI data mapping issues.
- **Status**: **In Progress**. Implementing the routing and API call changes.

---
