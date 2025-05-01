# **Plan: Influencer Marketplace Implementation (MVP)**

**Scrum Leader Overview:** This document provides a highly granular, step-by-step plan for building the Minimum Viable Product (MVP) of the Influencer Marketplace. Our goal is speed, robustness, and seamless integration with the existing Campaign Wizard, leveraging our current codebase and UI library effectively. **NOTE:** The primary data provider, formerly **InsightIQ** (previously branded as Phyllo), has been rebranded to **InsightIQ**. This plan reflects the integration with InsightIQ, assuming its API capabilities largely mirror the previous provider's, pending detailed documentation review. **This plan incorporates direct feedback from potential users like Kelly Parkerson (Marketing Director, Paleo Valley) to ensure we build features that solve real-world problems.**

**--- PIVOT NOTE (2023-06-20) ---**
**Current Focus:** We are temporarily pivoting from the ticket execution below to prioritize the critical refactoring required for the InsightIQ integration.
**Guidance:** The detailed steps for this refactoring phase are outlined in `BUILD/influencer/refactor-insight-iq.md`.
**Resumption:** Once the refactoring tasks in `refactor-insight-iq.md` are complete (especially those unblocked by obtaining full InsightIQ documentation), we will resume the MVP implementation following the phases and tickets detailed in this document (`plan.md`) and `plan-sprints.md`.
**--- DECOUPLING NOTE (2023-06-21) ---**
**Scope Adjustment:** For the initial MVP, the Influencer Marketplace will be developed as a standalone feature, decoupled from the Campaign Wizard. The integration flow described in "Journey 1: Wizard-First" and the related context passing (`WizardContext`) will be deferred post-MVP. The Marketplace will focus solely on discovery and vetting.
**----------------------------------**

**Core User Value Proposition (Brand Marketer Persona - "Marketing Director Maya" / Reflecting Kelly P. Needs):**

*   **Efficient Discovery:** Dramatically reduce the time spent manually searching for influencers by providing a curated list pre-filtered based on specific campaign goals and **verified audience criteria** (addressing Kelly's need for research efficiency).
*   **Relevant Matching (Beyond Vanity Metrics):** Move beyond unreliable metrics like EMV (which Kelly called "a load of pants") to find influencers whose **verified audience demographics**, **engagement quality** (represented by Justify Score using **InsightIQ** inputs), and platform focus genuinely align with campaign objectives and drive *action*, not just impressions.
*   **Increased Trust & Reduced Risk:** Quickly identify influencers who have connected verification sources (via **InsightIQ**, indicated by `isVerified` - **TBC based on InsightIQ data**) and assess **audience authenticity** (using **InsightIQ** Profile Analytics data via backend), providing confidence before outreach (addressing Kelly's need for background checks/bot detection).
*   **Seamless Workflow:** Integrate influencer selection directly into the existing campaign creation process, eliminating the need to manage separate lists or spreadsheets during the crucial planning phase.
*   **Informed Decisions:** Provide key data points (audience breakdown, verification, score) directly within the discovery and profile views, enabling marketers like Kelly to make faster, more confident decisions on influencer suitability.

**Success Metrics (MVP):**

*   **Adoption Rate:** ~~% of new campaigns created via the Wizard that utilize the "Find Influencers in Marketplace" flow.~~ **Revised:** Usage rate of the standalone Influencer Marketplace page by target users.
*   **Task Completion:** ~~Successful completion rate of the Wizard -> Marketplace -> Select -> Wizard flow.~~ **Revised:** Successful navigation and interaction within the Marketplace (search, filter, view profile).
*   **User Satisfaction (Qualitative):** Direct feedback from initial internal users/beta testers (especially those mirroring Kelly's role) via demos and surveys focusing on perceived **efficiency gain**, **data trustworthiness (verification)**, **relevance of results**, and overall ease of use **within the standalone Marketplace**.
*   **(Post-MVP Metric):** Reduction in average time spent from starting a campaign brief to having a finalized list of selected influencers **(will require integration)**.

**MVP Scope Note:** While the overall platform vision includes a Freemium model (`idea.md`), the initial MVP implementation detailed below focuses on delivering the core marketplace functionality. Feature gating and specific plan limitations will be addressed Post-MVP.

**Architectural Integration Diagram:**

*(Diagram remains structurally the same, **but the MVP will not implement the CW -> MP or MP -> CW_Review navigation/context passing paths.**)*

```mermaid
graph TD
    subgraph "User Flow & Routing"
        U[User] --> CW[Campaign Wizard (/campaigns/wizard/...)]
        U --> MP[Marketplace Page (/influencer-marketplace)]
        // CW -- Navigates w/ Context --> MP // DEFERRED POST-MVP
        MP -- Navigates --> PP[Profile Page (/influencer-marketplace/:id)]
        // MP -- Navigates Back w/ Context --> CW_Review[Campaign Wizard Review Step] // DEFERRED POST-MVP
    end

    subgraph "Existing Campaign Wizard"
        CW_Steps[Wizard Step Components] -- Updates/Reads --> WCTX[WizardContext (src/contexts/...)]
        CW_Review -- Reads --> WCTX
        CW_Steps -- Uses --> UICOMP[UI Component Library (src/components/ui)]
    end

    subgraph "New Influencer Marketplace UI"
        MP -- Renders --> MP_FilterBtn[Filter Button]
        MP -- Renders --> MP_AddBtn[Add to Campaign Button]
        MP -- Renders --> MP_List[MarketplaceList Component]
        MP -- Renders --> MP_Pagination[Pagination Component]
        MP_FilterBtn -- Opens --> MP_Filters[MarketplaceFilters (Drawer)]
        MP_List -- Renders Many --> MP_Card[InfluencerSummaryCard]
        MP_Card -- Navigates --> PP
        MP_Filters -- Uses --> UICOMP
        MP_List -- Uses --> UICOMP
        MP_Card -- Uses --> UICOMP
        MP_Pagination -- Uses --> UICOMP
        MP_AddBtn -- Uses --> UICOMP

        PP -- Renders --> PP_Header[ProfileHeader Component]
        PP -- Renders --> PP_Tabs[Profile Details Tabs/Sections]
        PP_Header -- Uses --> UICOMP
        PP_Tabs -- Uses --> UICOMP
    end

    subgraph "Shared Context & State"
        WCTX -- Provides Filter Criteria --> MP
        MP -- Reads --> WCTX
        MP -- Updates Selected IDs --> WCTX
        MP_Filters -- Updates Local State --> MP -- Reads Filter State
        MP -- Manages Local State --> MP_List[List Data, Loading, Error, Selection, Pagination]
        PP -- Manages Local State --> PP_Header[Selection State]
    end

    subgraph "Services & Data Layer (Abstraction)"
        ISVC[Influencer Service (src/services/influencer/index.ts)]
        MP -- Calls --> ISVC
        PP -- Calls --> ISVC
        CW_Review -- Calls --> ISVC

        ISVC -- Selects Based on Env --> MockSvc[Mock Service (src/services/mock/mockInfluencerService.ts)]
        ISVC -- Selects Based on Env --> ApiSvc[API Service (placeholder)]

        MockSvc -- Reads --> MockData[Mock Data (src/data/mock/influencers.ts)]
        ApiSvc -- Will Call --> API[Backend API (future)]
    end

    subgraph "Core Assets & Types"
        UICOMP -- Consumed By --> CW_Steps
        UICOMP -- Consumed By --> MP_Filters
        UICOMP -- Consumed By --> MP_List
        UICOMP -- Consumed By --> MP_Card
        UICOMP -- Consumed By --> PP_Header
        UICOMP -- Consumed By --> PP_Tabs
        TYPES[Types (src/types/)] -- Used By --> WCTX
        TYPES -- Used By --> MockData
        TYPES -- Used By --> MockSvc
        TYPES -- Used By --> MP
        TYPES -- Used By --> PP
    end

    %% Styling and Layout
    style CW fill:#f9f,stroke:#333,stroke-width:2px
    style MP fill:#ccf,stroke:#333,stroke-width:2px
    style PP fill:#ccf,stroke:#333,stroke-width:2px
    style WCTX fill:#ff9,stroke:#333,stroke-width:2px
    style ISVC fill:#9cf,stroke:#333,stroke-width:2px
    style UICOMP fill:#eee,stroke:#666,stroke-width:1px,stroke-dasharray: 5 5
```

**Diagram Explanation:**
*(Explanation remains structurally the same, **noting that the connection between Wizard and Marketplace via context/navigation is deferred post-MVP.**)*

1.  **User Flow:** Users start either in the existing `Campaign Wizard` or directly on the new `Marketplace Page`. The Wizard navigates *to* the Marketplace, passing filter criteria via the shared `WizardContext`. The Marketplace navigates back *to* the Wizard review step after selection, updating the context.
2.  **UI Components:** Both existing (`Campaign Wizard`) and new (`Marketplace`, `Profile`) UI heavily rely on the central `UI Component Library`. New feature-specific components (`MarketplaceList`, `InfluencerSummaryCard`, etc.) are built using these primitives.
3.  **State Management:** `WizardContext` is key for passing data *between* the Wizard and Marketplace. Local state within Marketplace components handles UI concerns like filter values, loading states, and pagination.
4.  **Services:** All data fetching goes through the `Influencer Service` abstraction layer, allowing easy switching between the initial `Mock Service` (using `Mock Data`) and the future real `API Service`.
5.  **Types:** Shared `Types` ensure data consistency across the application.

To achieve a faster path to a production-ready, valuable MVP using real **InsightIQ** data, the following adjustments are required:

1.  **API Contracts First (CRITICAL):** Before significant coding in FE or BE, finalize the request/response contracts for core MVP endpoints (`GET /influencers`, `GET /influencers/:id`) **based on InsightIQ documentation**. This is **Task Zero (Renewed)**.
2.  **Parallel Development Streams:** Frontend UI development (components, page layouts) and Backend API development (endpoints, DB, **InsightIQ** integration) **MUST** occur concurrently from the start, **once InsightIQ docs are available**.
3.  **Prioritized Backend Implementation:** Backend focuses first on delivering `GET /influencers` and `GET /influencers/:id` populated with priority **InsightIQ** data (**TBD based on InsightIQ Docs** - e.g., equivalent of Identity API for verification, Profile Analytics for demographics/metrics).
4.  **Incremental Frontend Integration:** Frontend integrates with *live* backend endpoints deployed to `dev`/`staging` environment *as soon as possible*, reducing reliance on prolonged mock data usage. The `influencerService` abstraction facilitates this switch.
5.  **Strict MVP Scope:** Adhere rigorously to the defined MVP features. Enhancements like advanced filters, detailed safety reports, etc., are deferred to Post-MVP (Phase 5).

**Communication Protocol:** Frequent (min. weekly) FE/BE sync meetings are required to review **InsightIQ** API contract adherence, discuss integration progress, and resolve blocking issues quickly.

**Refined User Journeys & Integration Flow:**

This feature needs to support two primary entry points:

1.  **Journey 1: Wizard-First (New Campaign) - DEFERRED POST-MVP**
    *   ~~**Entry:** User starts the Campaign Wizard (`/campaigns/wizard/...`).~~
    *   ~~**Action:** User defines campaign goals, target audience, platforms etc. in early steps.~~
    *   ~~**Transition:** User reaches the "Select Influencers" step (or similar) and clicks "Find Influencers in Marketplace".~~
    *   ~~**Context Passing:** Relevant filter criteria (platforms, audience demographics) **MUST** be saved to `WizardContext` *before* navigation. The `isFindingInfluencers` flag in `WizardContext` is set to `true`.~~
    *   ~~**Marketplace Load:** The Marketplace (`/influencer-marketplace`) loads, reads `WizardContext`, sees the `isFindingInfluencers` flag, extracts criteria, sets initial filters, and fetches the pre-filtered list (See Ticket 4.3).~~
    *   ~~**Marketplace Action:** User browses, filters further, selects influencers.~~
    *   ~~**Context Update:** User clicks "Add X Influencers to Campaign". The selected `influencerIds` **MUST** be saved to `WizardContext` (See Ticket 4.4).~~
    *   ~~**Return:** User is navigated back to the Wizard Review step.~~
    *   ~~**Wizard Display:** The Review step reads the `selectedInfluencerIds` from context and displays the influencer summaries (See Ticket 4.5).~~

2.  **Journey 2: Marketplace-First (Discovery / MVP Focus)**
    *   **Entry:** User navigates directly to the Influencer Marketplace (`/influencer-marketplace`).
    *   **Context:** `WizardContext` is **not used** by the Marketplace in the MVP.
    *   **Marketplace Load:** Marketplace loads with default filters (or potentially user preferences - Post-MVP) and fetches the initial list.
    *   **Marketplace Action:** User browses, filters, views profiles, potentially saves/shortlists influencers (**Shortlisting is Post-MVP - Ticket 5.7**).
    *   **Integration (MVP):** No direct integration for adding selected influencers to a campaign. Users will need to manually note desired influencers and add them separately in the Campaign Wizard or via other means.
    *   **Integration (Post-MVP):** An "Add to Campaign" flow would be introduced, likely involving selecting an existing campaign or initiating a new one.

**Key Integration Logic (MVP):**

*   The Marketplace page component **does not** check or interact with `WizardContext` on load.
*   The selection mechanism within the Marketplace (if implemented for shortlisting) **does not** update `WizardContext`.

**New File Directory Structure:**

```plaintext
src/
├── app/
│   ├── campaigns/
│   │   └── wizard/           # Existing Campaign Wizard Steps
│   │       └── ... (step components)
│   │   └── influencer-marketplace/ # <--- NEW
│   │       ├── page.tsx          # <--- NEW (Marketplace List Page)
│   │       └── [id]/             # <--- NEW
│   │           └── page.tsx      # <--- NEW (Influencer Profile Page)
│   └── ... (other app routes)
├── components/
│   ├── features/
│   │   ├── campaigns/        # Existing campaign-specific components
│   │   │   └── ...
│   │   └── influencers/      # <--- NEW
│   │       ├── InfluencerSummaryCard.tsx    # <--- NEW
│   │       ├── MarketplaceList.tsx          # <--- NEW
│   │       ├── MarketplaceFilters.tsx       # <--- NEW
│   │       ├── ProfileHeader.tsx            # <--- NEW
│   │       ├── ProfileAboutSection.tsx      # <--- NEW
│   │       ├── ProfileAudienceSection.tsx   # <--- NEW
│   │       └── ProfilePerformanceSection.tsx# <--- NEW
│   └── ui/                   # Existing shared UI components (Button, Card, etc.)
│       └── ...
├── contexts/
│   └── WizardContext.tsx     # Existing (to be modified)
│   └── ...
├── data/
│   └── mock/                 # <--- NEW (or existing?)
│       └── influencers.ts    # <--- NEW
├── services/
│   ├── influencer/           # <--- Existing
│   │   └── index.ts          # <--- Existing (Abstraction Layer)
│   └── mock/                 # <--- Existing
│   │   └── mockInfluencerService.ts # <--- Existing
│   └── lib/                    # <--- Existing lib folder likely
│       └── insightiqService.ts # <--- NEW (Renamed from phylloService)
├── types/
│   ├── influencer.ts         # <--- NEW (or existing, to be modified)
│   ├── enums.ts              # Existing (potentially modified)
│   └── ... (other types)
└── ... (other top-level dirs like lib, styles, etc.)
```

**Backend Design & API Considerations (MVP Focus - Updated for InsightIQ):**

*   **API Contract Definition (SSOT):** (Requires InsightIQ docs)
    *   **Requirement:** Before significant backend implementation begins, the exact request/response schemas for the core MVP API endpoints **MUST** be formally defined and agreed upon by Frontend and Backend leads **based on InsightIQ API documentation.**
    *   **Endpoints (MVP):** `GET /influencers`, `GET /influencers/:id`, `GET /influencers/summaries` (for wizard review step - might be combined with GET /influencers), `POST /campaigns/:id/influencers` (Post-MVP for adding to existing campaigns, but contract useful).
    *   **Recommendation:** Use OpenAPI (Swagger) specification format stored in a shared location (e.g., `/docs/api/influencer-marketplace.yaml`). Reference this spec file within relevant backend tickets.
    *   **Action:** Assign task to Backend Lead/Architect to create initial **InsightIQ-based** API spec draft **once InsightIQ docs are available.**
*   **InsightIQ Integration Strategy (Backend Responsibility):** (Correctly outlines strategy, notes dependency on docs)
    *   **Data Flow:** The backend database is the SSOT for influencer data displayed in the UI. The backend service is responsible for enriching this database with **InsightIQ** data.
    *   **Verification Status (`isVerified` - TBC):** Primarily updated via **InsightIQ** webhooks processed by the backend.
    *   **Data Refresh Strategy (Backend Task):** Define and implement strategy. **Preference:** Use **InsightIQ** webhooks where available (e.g., for profile updates, identity changes) for near real-time updates. Supplement with periodic background jobs polling **InsightIQ APIs** (e.g., Profile Analytics equivalent) or as a fallback if webhooks fail. Document expected data latency.
    *   **Error/Staleness Handling (Backend Task & API Contract):** Backend MUST gracefully handle **InsightIQ** API errors (timeouts, 429, 5xx) or webhook processing failures. Define API contract behavior: Does the Justify API return `null` for **InsightIQ**-sourced fields on error? Does it return potentially stale data with a timestamp/flag? Does it return a specific error code? Frontend needs to handle this response (Ticket 1.4, 2.1).
    *   **Rate Limit & Cost Management (Backend Task):** Implement caching (e.g., Redis or memory cache with TTL) for frequently accessed **InsightIQ** data (Profile Analytics equivalent) to minimize API calls. Monitor **InsightIQ** API usage against subscribed limits/costs (**note: staging has 10 credits**). Implement backoff/retry logic for **InsightIQ** API calls respecting rate limits (especially **429 Retry-After** header).
    *   **Frontend Interaction:** The frontend interacts *only* with the Justify backend API (`/api/influencers/...`), not directly with **InsightIQ** for marketplace data.
    *   **Connection Flow:** Triggering the **InsightIQ** connection process itself is likely Post-MVP (e.g., in an Influencer Portal or Profile Settings), **requires InsightIQ SDK/Flow documentation**.
    *   **Action:** Assign task to Backend Lead to detail the specific **InsightIQ** webhook/sync strategy **once docs are available**.
*   **Backend Data Aggregation:** (Correctly notes InsightIQ as source, pending docs for details)
    *   The Justify backend API (`/api/influencers`, `/api/influencers/:id`) serves as an aggregation layer. It will fetch necessary data from its own database, which should be kept up-to-date with relevant information sourced *by the backend* from **InsightIQ** APIs, primarily (**pending verification against InsightIQ docs**):
        *   Equivalent of `Profile Analytics API`: For audience demographics, follower counts, engagement metrics, follower quality insights, platform presence.
        *   Equivalent of `Identity API` (via Connection SDK?): To determine verification status.
        *   Equivalent of `Engagement Metrics API`: For specific metrics if needed.
        *   Equivalent of `Brand Safety / Social Screening API` (Post-MVP).
        *   The backend **MUST** handle caching, rate limiting (**InsightIQ: 2 req/sec**), and error handling when interacting with **InsightIQ** APIs (using **Basic Auth**).
*   **API Error Handling:** (Correctly notes InsightIQ error codes)
    *   **Backend:** Implement consistent JSON error response formats. This includes errors originating from **InsightIQ** API calls.
    *   **Error Categories:** Define and handle distinct error categories: Input Validation (400), Authentication (**401 for InsightIQ**), Authorization (403), Resource Not Found (404), External Service Errors (e.g., **InsightIQ 429/5xx** -> return 503), Internal Server Errors (500). Log server errors appropriately.
    *   **Frontend:** Service layer (`influencerService`) and page components (`MarketplacePage`, `ProfilePage`) **MUST** gracefully handle potential API errors. Update UI state (`error`) accordingly.
    *   **UI:** Display user-friendly error messages.
*   **Security Considerations:** (Remains valid)
    *   **Authentication:** All new API endpoints **MUST** be protected by the existing authentication middleware.
    *   **Authorization:** Implement checks to ensure users can only perform actions within their allowed scope (e.g., can a user fetch *any* influencer profile? Can they only add influencers to campaigns they own/manage? Define rules with Product Owner).
    *   **Action:** Add specific authorization checks to backend tickets post-MVP or as required by defined rules.
*   **Configuration Management:** (Correctly notes InsightIQ secrets)
    *   Values like pagination limits, default filter options, or external service URLs/keys **MUST NOT** be hardcoded.
    *   Use environment variables (`.env`) for secrets (API keys) and potentially a dedicated configuration file (`src/config/marketplace.ts`?) for non-sensitive, feature-specific settings.

*   **API Contract Schemas (MVP - Requires Verification Against Official InsightIQ Docs):**
    *   **Introduction:** (Correctly updated)
        *   This section defines the **target** interface between the Justify Frontend and Backend for the Influencer Marketplace MVP. Backend implementation MUST adhere to this structure **once mapped to InsightIQ capabilities**. Field names and types marked with `// Verify...` require confirmation against the official **InsightIQ** API documentation to ensure alignment.
    *   **`GET /api/influencers`**
        *   **Request Query Params:** (Params likely remain similar, but verify exact filter support in InsightIQ)
            *   `page?: number` (default: 1)
            *   `limit?: number` (default: 12)
            *   `platforms?: PlatformEnum[]` // Implemented (BE handles multi-platform aggregation)
            *   `minScore?: number` // Implemented (Backend filtering)
            *   `maxScore?: number` // Implemented (Backend filtering)
            *   `minFollowers?: number` // Implemented (Passed to InsightIQ)
            *   `maxFollowers?: number` // Implemented (Passed to InsightIQ)
            *   `audienceAge?: string` // UI Only - BE Filter Not Implemented
            *   `audienceLocation?: string` // UI Only - BE Filter Not Implemented
            *   `isVerified?: boolean` // Implemented (Passed to InsightIQ)
            *   `audienceQuality?: 'High' | 'Medium' | 'Low'` // Implemented (Backend filtering)
            *   `searchTerm?: string` // Implemented (Passed to InsightIQ as description_keywords)
            *   `sortBy?: string` (Post-MVP?)
        *   **Response Body (200 OK) - Target Schema (Verify fields against InsightIQ):**
            *   `platforms?: PlatformEnum[]` // Verify filter support in InsightIQ Docs
            *   `minScore?: number` // Verify handling in backend logic
            *   `maxScore?: number` // Verify handling in backend logic
            *   `minFollowers?: number` // Verify exact InsightIQ filter param name & type
            *   `maxFollowers?: number` // Verify exact InsightIQ filter param name & type
            *   `audienceAge?: string` // Verify exact InsightIQ filter param name & value format
            *   `audienceLocation?: string` // Verify exact InsightIQ filter param name & value format
            *   `searchTerm?: string` (Post-MVP?)
            *   `sortBy?: string` (Post-MVP?)
        *   **Response Body (200 OK) - Target Schema (Verify fields against InsightIQ):**
            ```json
            {
              "influencers": [
                // Matches InfluencerSummary type defined in Ticket 0.2 (subject to InsightIQ data)
                {
                  "id": string, // Justify DB ID
                  "name": string, // [InsightIQ API] Verify exact field name & type
                  "handle": string, // [InsightIQ API] Verify exact field name & type
                  "avatarUrl": string, // [InsightIQ API] Verify exact field name & type
                  "platforms": PlatformEnum[], // [InsightIQ API] Verify exact field name & type
                  "followersCount": number, // [InsightIQ API] Verify exact field name & type
                  "justifyScore": number | null, // Calculated by Justify backend (Ticket 1.9)
                  "isVerified": boolean, // [InsightIQ API] Verify source & field name (Replaces is**InsightIQ**Verified)
                  "primaryAudienceLocation": string, // [InsightIQ API] Verify exact field name & type
                  "primaryAudienceAgeRange": string, // [InsightIQ API] Verify exact field name & type
                  "primaryAudienceGender": "Male" | "Female" | "Other" | "Mixed" | null, // [InsightIQ API] Verify exact field name & type/enum values
                  "engagementRate": number | null, // [InsightIQ API] Verify exact field name & type
                  "audienceQualityIndicator": "High" | "Medium" | "Low" | null // [InsightIQ API] Verify exact field name & type/enum values (or logic)
                  // Add flag/timestamp here if BE needs to signal InsightIQ data staleness/error?
                }
                // ... more influencers
              ],
              "pagination": { ... }
            }
            ```
    *   **`GET /api/influencers/:id`**
        *   **Request Path Params:** `id: string`
        *   **Response Body (200 OK) - Target Schema (Verify fields against InsightIQ):**
            ```json
            {
              // Inherited fields from InfluencerSummary - Verify all as above against InsightIQ
              "id": string,
              "name": string, // [InsightIQ API] Verify...
              "handle": string, // [InsightIQ API] Verify...
              "avatarUrl": string, // [InsightIQ API] Verify...
              "platforms": PlatformEnum[], // [InsightIQ API] Verify...
              "followersCount": number, // [InsightIQ API] Verify...
              "justifyScore": number | null,
              "isVerified": boolean, // [InsightIQ API] Verify...
              "primaryAudienceLocation": string, // [InsightIQ API] Verify...
              "primaryAudienceAgeRange": string, // [InsightIQ API] Verify...
              "primaryAudienceGender": "Male" | "Female" | "Other" | "Mixed" | null, // [InsightIQ API] Verify...
              "engagementRate": number | null, // [InsightIQ API] Verify...
              "audienceQualityIndicator": "High" | "Medium" | "Low" | null, // [InsightIQ API] Verify...
              // Specific InfluencerProfileData fields:
              "bio": string | null, // [InsightIQ API] Verify exact field name & type
              "contactEmail": string | null, // [InsightIQ API? Other Source?] Verify source, exact field name & type
              "audienceDemographics": { // [InsightIQ API] Verify...
                "ageDistribution": Record<string, number> | null, 
                "genderDistribution": Record<string, number> | null, 
                "locationDistribution": Record<string, number> | null 
              } | null,
              "engagementMetrics": { // [InsightIQ API] Verify...
                "averageLikes": number | null, 
                "averageComments": number | null 
              } | null
              // Add other verified fields here
              // Add flag/timestamp here if BE needs to signal InsightIQ data staleness/error?
            }
            ```
    *   **`GET /api/influencers/summaries?ids=id1,id2,...`** (Alternative to POST for Wizard Review)
        *   **Request Query Params:** `ids: string[]` (comma-separated)
        *   **Response Body (200 OK):**
            ```json
            {
              "influencers": InfluencerSummary[] // Matches structure defined above (based on InsightIQ data)
            }
            ```
        *   **Error Responses (Examples for all endpoints - Update for InsightIQ):**
            *   **Note:** Verify specific error codes/messages returned by **InsightIQ API**.
            *   `400 Bad Request`: (Likely same)
            *   `401 Unauthorized`: (InsightIQ uses this for failed Basic Auth)
            *   `403 Forbidden`: (Likely same)
            *   `404 Not Found`: (Likely same)
            *   `429 Too Many Requests`: (**InsightIQ Specific** - Check for `Retry-After` header)
            *   `500 Internal Server Error`: (Likely same)
            *   `503 Service Unavailable`: (Used if InsightIQ is down/unreachable)

**Assumptions about Existing Codebase (Review & Confirm):**

*   **UI Library (`src/components/ui`):** Assumed presence of `Button`, `Card`, `Avatar`, `Badge`, `Icon`, `Input`, `Select`, `Checkbox`, `Slider`, `Table`, `Tabs`, `Pagination`, `LoadingSkeleton`, `Drawer`, basic Chart components. **Action:** Team Lead/FE Devs to quickly verify these exist and meet basic styling needs. Note any gaps.
*   **Layouts:** `ConditionalLayout` assumed for standard page structure.
*   **Context:** `WizardContext` exists and manages state for campaign creation.
*   **Types:** Core types exist (`src/types/`), Campaign types (`src/components/features/campaigns/types.ts` or `src/types/campaigns.ts`).
*   **Services:** Existing pattern for API service calls.
*   **Routing:** Next.js App Router assumed.

**Ecosystem Integration Considerations:**

*   **Permissions/Roles:** How does this feature align with existing user roles in Justify? Does viewing profiles or adding to campaigns require specific permissions? Ensure Clerk auth checks incorporate necessary role validation (Backend task).
*   **Usage Analytics:** Identify key user actions within the marketplace flow (e.g., filter applied, profile viewed, added to campaign) and implement tracking events using the existing analytics system (e.g., Mixpanel) (Frontend task).
*   **Billing/Usage Limits (Post-MVP):** Consider how **InsightIQ** API call volume might impact tiers or limits (**Staging limit: 10 credits**).
*   **Future Feedback Loops (Post-MVP):** Plan for how insights (e.g., high-performing influencers for certain campaign types) might eventually feedback into other parts of Justify (e.g., Campaign Wizard recommendations).

**Design System & Single Source of Truth (SSOT):**

*   **UI Component Library:** All new UI elements **MUST** reuse existing components from `src/components/ui` wherever possible (e.g., `Button`, `Card`, `Input`, `Select`, `Icon`, etc.). Any genuinely new UI patterns required specifically for the marketplace should be discussed with the team lead and potentially added to the shared library if reusable.
*   **Styling:** Adhere strictly to the established design tokens.
    *   **Colors:** Use CSS variables defined in `src/app/globals.css` corresponding to the Brand Colours (Primary: Jet #333333, Secondary: Payne's Grey #4A5568, Accent: Deep Sky Blue #00BFFF, etc.). Do not hardcode hex values.
    *   **Typography:** Use existing font styles and classes defined globally.
    *   **Spacing:** Follow existing spacing conventions/scales.
*   **Icons:** Utilize the existing `Icon` component and the FontAwesome Pro set as defined in `docs/icons/font-awesome.md` and mapped in `src/components/ui/icons/mapping/`. Ensure correct usage of `fa-light` (default) and `fa-solid` (hover/active states). Any new icons required must be added via the established registry process.
*   **State Management:** Leverage `WizardContext` for cross-feature state where appropriate (Wizard <-> Marketplace flow). Avoid introducing new global state management solutions for the MVP unless absolutely necessary and agreed upon by the team. Local component state should be preferred for UI-specific concerns within the marketplace.
*   **Types:** Reuse and extend existing types from `src/types/` whenever possible. New specific types (like `InfluencerSummary`) should reside in designated type files.

---

**Phase 0: Foundation & Backend Kickoff (Updated for InsightIQ Context)**

*Goal: Set up FE files/types/mocks, define **InsightIQ** API contracts, **initiate Backend API & InsightIQ integration development**.*

*   **Ticket 0.1: `CHORE: Create Core Directory Structure`** - ✅ Done
*   **Ticket 0.2: `TYPE: Define InfluencerSummary Type (MVP)`** - ✅ Done
*   **Ticket 0.3: `TYPE: Define InfluencerProfileData Type (MVP)`** - ✅ Done
*   **Ticket 0.4: `TYPE: Extend DraftCampaignData in WizardContext`** - ✅ Done (But integration deferred)
*   **Ticket 0.5.1: `CHORE(API): Define API Contracts (MVP)`** - ✅ Done
*   **Ticket 0.6: `FEAT: Implement Mock Influencer Service - getInfluencers Function`** - ✅ Done (Superseded by real service)
*   **Ticket 0.7: `FEAT: Implement Mock Influencer Service - getInfluencerById Function`** - ✅ Done (Superseded by real service)
*   **Ticket 0.8: `FEAT: Implement Mock Influencer Service - getInfluencerSummariesByIds Function`** - ✅ Done (Superseded by real service)
*   **Ticket 0.9: `CHORE: Implement Service Abstraction Layer`** - ✅ Done
*   **Ticket 0.10: `CHORE(DB): Define Initial Database Indexes`** - ✅ Done
*   **Ticket 0.11: `BE-SETUP: Initialize Influencer DB Models & Basic API Routes`** - ✅ Done
*   **Ticket 0.12: `BE-SETUP: Implement InsightIQ Service Initial Connection` (Revised)** - ✅ Done
*   **Ticket 0.13: `CHORE(Config): Setup InsightIQ API Key Management` (Revised)** - ✅ Done
*   **Ticket 0.14: `CHORE(API): Verify/Refactor Existing Connection Endpoints for InsightIQ` (Revised)** - ❌ Deferred (Blocked by InsightIQ Docs)

---

**Phase 1: Marketplace UI & Initial Integration (Updated for InsightIQ Context)**

*Goal: Build the core Marketplace page UI, connect to mock or **early live InsightIQ dev APIs**, implement basic selection state.*

*   **Ticket 1.0: `BE-FEAT: Implement GET /influencers v1 (Core Data + InsightIQ Verification)` (Revised)**
    *   **Status:** ✅ Done (Implementation Verified, includes multi-platform aggregation, backend filters for Score/Quality, passes other filters to InsightIQ. Pending final testing)
*   **Ticket 1.1: `BE-FEAT: Implement GET /influencers/:id v1 (Core Profile Data)` (Revised)**
    *   **Status:** 🚧 Blocked (Implementation complete, but blocked by InsightIQ API mismatch issue)
*   **Ticket 1.2: `FEAT(UI): Build InfluencerSummaryCard Component`**
    *   **Status:** ✅ Done (Verified badge hover fixed)
*   **Ticket 1.3: `FEAT(UI): Setup Marketplace Page (`page.tsx`) & Initial State`**
    *   **Status:** ✅ Done (Includes search state management)
*   **Ticket 1.4: `FEAT(FE): Implement Initial Data Fetching on Marketplace Page`**
    *   **Status:** ✅ Done (Handles `appliedFilters` and `appliedSearchTerm`)
*   **Ticket 1.5: `FEAT(UI): Create MarketplaceList Component`**
    *   **Status:** ✅ Done
*   **Ticket 1.6: `FEAT(UI): Implement Marketplace Filters UI`**
    *   **Status:** ✅ Done (Includes Search, Multi-platform Checkboxes, Audience Quality. Fixed footer layout)
*   **Ticket 1.7: `FEAT(FE): Connect Filters State & Actions`**
    *   **Status:** ✅ Done (Handles local state and apply/reset logic)
*   **Ticket 1.8: `FEAT(FE): Connect Apply Filters to Data Fetching`**
    *   **Status:** ✅ Done (Confirmed applies only on click, passes filters & search term)
*   **Ticket 1.9: `BE-FEAT: Implement MVP Justify Score v1 Calculation` (Revised)**
    *   **Status:** ✅ Done (Implemented, filtering logic added in service layer)

---

**Phase 2: Profile Page UI & Contact Info (Updated for InsightIQ Context)**
*(**Action:** Added annotation to explicitly state Data Source notes need update based on InsightIQ docs)*

*   **Ticket 2.1: `FEAT: Setup Profile Page (`[id]/page.tsx`) & Data Fetching`**
    *   **Status:** ✅ Done (Implementation complete, but blocked by BE/API issue)
*   **Ticket 2.2: `FEAT(UI): Build Profile Header Component`**
    *   **Status:** ✅ Done
*   **Ticket 2.3: `FEAT: Integrate Profile Header into Profile Page`**
    *   **Status:** ✅ Done
*   **Ticket 2.4: `FEAT(UI): Build Profile Details Tabs/Sections (MVP)`**
    *   **Status:** ✅ Done
*   **Ticket 2.5: `FEAT: Direct Influencer Contact Info Display (Elevated Priority)`**
    *   **Status:** 🅿️ Blocked (Requires reliable profile data fetch)

---

**Phase 3: Campaign Wizard Integration**
*(No changes needed here, depends on previous phases)*

---

**Phase 4: Post-MVP Features (Addressing Specific User Needs)**
*(**Action:** Updated references in Action steps from Phyllo -> InsightIQ or generic external provider)*

*   **Ticket 4.1: `FEAT: Implement Post-MVP Features`**
    *   **Goal:** Implement additional features and refine existing ones.
    *   **Action:** Implement the following features:
        *   **Feature 1:** Add a new feature.
        *   **Feature 2:** Refine an existing feature.
    *   **Files Modified:** `src/app/influencer-marketplace/[id]/page.tsx`.
    *   **Verification:** New feature is implemented and existing feature is refined.

*   **Ticket 5.1: `FEAT: Direct Influencer Contact Info Display`**
    *   **Goal:** Display verified email addresses for influencers (if available/permissioned).
    *   **Context:** Addresses Kelly P.'s strong preference for direct email outreach over DMs.
    *   **Action:** Requires backend API update to potentially fetch/store this (maybe via InsightIQ Profile Analytics or separate source). Update `InfluencerProfileData` type. Display contact info securely on the profile page.
*   **Ticket 5.2: `FEAT: Sponsored Post Performance Metrics (High Priority Post-MVP)`**
    *   **Goal:** Show metrics specifically for sponsored content (e.g., CTR, potentially conversion hints).
    *   **Context:** **Critical Value:** Addresses Kelly P.'s need to validate influencer pricing and ROI based on *paid* campaign effectiveness, moving beyond unreliable EMV.
    *   **Action:** Requires significant backend work to identify sponsored posts (via InsightIQ Profile/Content APIs?) and potentially track associated links/codes. Update `InfluencerProfileData`. Display metrics on profile page.
*   **Ticket 5.3: `FEAT: Basic Brand Safety Flags/Content Check Integration (High Priority Post-MVP)`**
    *   **Goal:** Integrate initial brand safety checks.
    *   **Context:** Addresses Kelly P.'s need for automated background checks/controversial post detection, reducing manual vetting time and risk.
    *   **Action:** Backend integrates with InsightIQ Brand Safety API (Basic report initially?). Update `InfluencerProfileData` with a risk score or flags. Display indicators on profile/summary card.
*   **Ticket 5.4: `FEAT: Add to Existing Campaign Flow`**
    *   **Goal:** Allow users entering the marketplace directly to add selected influencers to an existing campaign.
    *   **Context:** Enables the high-value "Marketplace-First" user journey for ongoing discovery and campaign staffing.
    *   **Action:** Implement UI (modal?) to select an existing campaign. Implement backend endpoint (`POST /api/campaigns/:id/influencers`). Update marketplace "Add" button logic.
*   **Ticket 5.5: `FEAT: Content Effectiveness Insights (Placeholder)`**
    *   **Goal:** Lay groundwork for future content/messaging analysis.
    *   **Context:** Addresses Kelly P.'s identified gap in knowing which messages work best.
    *   **Action:** This is complex. Initial step might involve displaying top-performing *content types* (e.g., Reels vs. Stories) based on InsightIQ data. True A/B testing is likely a larger epic.
*   **Ticket 5.6: `FEAT: Collaboration History / Saturation Indicator (Post-MVP)`**
    *   **Goal:** Show recent brand collaborations to assess potential saturation.
    *   **Context:** Addresses Kelly P.'s concern about influencers working with too many brands.
*   **Ticket 5.7: `FEAT: Influencer Shortlisting/Saving (Post-MVP)`**
    *   **Goal:** Allow users to save/shortlist influencers for later review across sessions.
    *   **Context:** Provides a way to collect potential candidates without immediately adding to a campaign.
    *   **Action:** Requires **significant backend support**: DB schema changes (e.g., `UserInfluencerShortlist` table), API endpoints (POST/DELETE to save/unsave), and frontend UI integration (Save button state synced with backend).
*   **Ticket 5.8: `FEAT: Podcast Influencer Support (High Priority Post-MVP)`**
    *   **Goal:** Specifically filter for and display data relevant to podcasters.
    *   **Context:** Addresses Kelly P.'s heavy use of podcasting and need for relevant metrics.
    *   **Action:** Update filters. Backend needs to identify podcasters (via InsightIQ?). Display relevant podcast metrics (e.g., listenership estimates if available via InsightIQ Profile Analytics).
*   **Ticket 5.9: `TECH-DEBT: Refactor Wizard/Marketplace State Coupling`**
    *   **Goal:** Decouple state management between Campaign Wizard and Marketplace.
    *   **Context:** Current MVP uses `WizardContext` directly, creating tight coupling.
    *   **Action:** Investigate and implement alternative patterns like event bus, callbacks, or dedicated workflow state APIs to improve modularity and testability.

---

**Phase X: Frontend InsightIQ Connect SDK Integration (Revised)**
*(Section accurately reflects InsightIQ context and dependency on docs)*

*Goal: Implement the user-facing workflow for connecting social accounts via **InsightIQ (if applicable)**.*
*Note: Assumes InsightIQ provides a similar SDK flow. **Requires InsightIQ Docs.***

*   **Ticket X.1: `FEAT(FE): Setup InsightIQ Connect Web SDK Script & Hook (If Available)`**
    *   **Goal:** Integrate the **InsightIQ** Connect JavaScript SDK script (if it exists) and create an abstraction.
    *   **Action:** Add **InsightIQ** SDK `<script>` tag. Create `useInsightIQConnect` hook or `insightiqConnectWebService.ts`.
    *   **Verification:** SDK script loads. Hook/service structure exists.
*   **Ticket X.2: `FEAT(FE): Implement InsightIQ Connect Initialization & Launch (If Available)`**
    *   **Goal:** Trigger the connection flow using backend endpoints (adapted for InsightIQ).
    *   **Action:** Call backend (e.g., `/api/insightiq/create-user`, `/api/insightiq/sdk-token` or equivalents) to get config needed by **InsightIQ SDK**. Initialize and open SDK.
    *   **Dependencies:** Backend endpoints adapted for InsightIQ (Ticket 0.14-Revised), **InsightIQ SDK Docs**.
    *   **Verification:** InsightIQ connection UI launches successfully.
*   **Ticket X.3: `FEAT(FE): Implement InsightIQ Connect Callbacks & Backend Notification (If Available)`**
    *   **Goal:** Handle connection results and notify backend.
    *   **Action:** Implement handlers for **InsightIQ SDK** callbacks. Update UI. Notify backend (e.g., `POST /api/insightiq/connections`).
    *   **Dependencies:** Ticket X.1, **InsightIQ SDK & Webhook Docs**.
    *   **Verification:** Callbacks handled. Backend notified.

**Definition of Done (DoD) for MVP Tickets:**

*   **Ticket 0.1:** Directory structure matches plan.
*   **Ticket 0.2:** Type definition matches required fields for `list-view.png` mock. `PlatformEnum` is referenced correctly or defined if new.
*   **Ticket 0.3:** Type definition includes necessary fields for `individual-influencer-profile.png`. `TODO`s added for Product Owner clarification on MVP scope.
*   **Ticket 0.4:** Context type is updated with the new fields. Default values handled correctly in context provider.
*   **Ticket 0.5:** File exports the array correctly. Data includes diverse examples reflecting user needs.
*   **Ticket 0.6:** Function handles filtering and pagination correctly. Returns data in the specified shape, mapping to `InfluencerSummary`.
*   **Ticket 0.7:** Function correctly finds and returns profile data or null.
*   **Ticket 0.8:** Function returns correct summaries for the given IDs.
*   **Ticket 0.9:** File exports `influencerService`. `useMock` logic is correct. Placeholder `apiService` exists. TypeScript checks pass for interface conformity.
*   **Ticket 1.0:** Endpoint returns data matching contract. Includes `isInsightIQVerified`, followers, platforms sourced from InsightIQ (or indicates if fetch failed). Basic filtering works.
*   **Ticket 1.1:** Endpoint returns detailed data matching contract, including demographics and engagement metrics sourced from InsightIQ.
*   **Ticket 1.2:** Page renders with title. State variables are initialized. Handler functions exist.
*   **Ticket 1.3:** Data is fetched on load. Loading state works. `influencers` state is populated. `totalInfluencers` is set.
*   **Ticket 1.4:** API or network errors during fetch update the `error` state and are handled by the `MarketplaceList` component. **Audience Quality badge is displayed.**
*   **Ticket 1.5:** Filter controls display current filter state. Changing controls updates the state. Reset button clears state.
*   **Ticket 1.6:** Data is fetched correctly with filters applied.
*   **Ticket 1.7:** Drawer opens/closes. Controls are present.
*   **Ticket 1.8:** Filter controls display and update state correctly.
*   **Ticket 1.9:** Applying filters refetches data using API filter params. List updates.
*   **Ticket 2.1:** Page renders with influencer data. Loading state works. `influencer` state is populated.
*   **Ticket 3.1:** Page renders with error handling logic.
*   **Ticket 4.1:** New feature is implemented and existing feature is refined.
*   **Ticket 5.1:** Verified email addresses are displayed on the profile page.
*   **Ticket 5.2:** Sponsored post performance metrics are displayed on the profile page.
*   **Ticket 5.3:** Basic brand safety flags are displayed on the profile page.
*   **Ticket 5.4:** Existing campaign flow is updated to allow adding influencers directly from the marketplace.
*   **Ticket 5.5:** Content effectiveness insights are displayed on the profile page.
*   **Ticket 5.6:** Podcast influencer support is implemented on the marketplace page.
*   **Ticket 5.7:** Collaboration history is implemented on the profile page.
*   **Ticket 5.8:** Influencer shortlisting/saving feature implemented.
*   **Ticket 5.9:** Wizard/Marketplace state coupling refactored.
*   **Ticket 0.10:** File exists with basic structure.
*   **Ticket 0.11:** Database tables exist. API routes return basic success/error responses.
*   **Ticket 0.12:** Backend service can successfully authenticate with InsightIQ API.
*   **Ticket 0.13:** Keys are configured and usable by the `insightiqService`.
*   **Ticket 0.14:** Endpoints are confirmed or updated to correctly create InsightIQ users, generate SDK tokens with required products, and handle errors.
*   **Ticket X.1:** SDK script loads. Hook/service structure exists.
*   **Ticket X.2:** InsightIQ Connect modal/popup launches successfully upon trigger.
*   **Ticket X.3:** Callbacks are correctly handled. UI provides appropriate feedback. Backend is notified upon successful connection.

**Risks and Mitigations:**

| Risk Description | Risk Level | Mitigation Strategy |
|------------------|-----------|--------------------|
| Mock Data Doesn't Match Real API Response | Medium     | High   | Define API contracts early (See Backend section); Backend devs provide sample responses; Frontend uses tools like Zod post-MVP. |
| Performance Issues with Large Lists       | Low (MVP)  | Medium | Implement pagination correctly; Optimize `InfluencerSummaryCard` rendering; Consider virtualization post-MVP.        |
| **Parallel Development Dependencies**     | High       | High   | **Critical:** Strict adherence to API Contracts; Frequent FE/BE syncs; Early deployment of backend APIs to dev/staging; Robust FE error handling for API unavailability. |
| Inconsistent Filtering Logic              | Medium     | Medium | Clear filter state definition (`FiltersState`); Shared utility functions for parsing/cleaning filter values.         |
| Difficult E2E Test Setup for Context Flow | Medium     | Medium | Design tests carefully; Potentially mock `WizardContext` values.                                                    |
| **Type Consistency Issues**               | Medium     | Medium | Strict TypeScript usage; Use `IInfluencerService` interface; **Mandate API input validation (Zod)** in MVP.         |
| **Profile/Marketplace State Sync**        | Low (MVP)  | Low    | **Decision:** No sync for MVP (Ticket 3.3 clarification). Revisit if user feedback requires it Post-MVP.              |
| **Navigation Edge Cases (Back Button)**   | Medium     | Medium | Robust flag handling in `MarketplacePage` `useEffect` (Ticket 4.3); Cover back/forward nav in E2E tests.            |
| **InsightIQ Data Freshness/Latency**         | Medium     | Medium | BE defines refresh strategy (webhooks+polling); Document latency expectations; Consider UI indicators for stale data if needed. |
| **InsightIQ API Errors/Downtime**            | Medium     | High   | BE robust error handling (retries, logging); Define API contract for missing/stale data; FE graceful handling (Ticket 1.4, 2.1). |
| **InsightIQ API Costs/Rate Limits**          | Medium     | High   | BE implements caching; Monitor usage dashboards; Alerting on high usage/cost.                                |
| **API Error Handling Gaps (FE/BE)**       | Medium     | High   | Define error categories; Consistent BE formats; Robust FE handling/display (Tickets 1.4, 2.1); Add checks to DoD. |

**Phased Data Freshness Strategy (MVP & Post-MVP):**

*   **MVP Approach (Current - REVISED for SSOT):**
    *   **Data Fetch:** Data for the Marketplace list (`GET /api/influencers`) and Profile pages (`GET /api/influencers/:id`) is fetched **directly from the InsightIQ Sandbox API** via the Justify backend **on every page load/request**.
    *   **SSOT:** InsightIQ Sandbox is the single source of truth for data displayed. There is no intermediate database caching or storage of this data in the Justify system for the MVP.
    *   **Freshness:** Data displayed is as fresh as the InsightIQ Sandbox API provides at the moment of the request.
    *   **Limitation:** Performance depends entirely on InsightIQ API responsiveness. Rate limits must be handled carefully by the backend. No offline/cached data is available if InsightIQ is down.
    *   **Reason:** Aligns with the "InsightIQ as SSOT" and "Simplicity" principles for the MVP, avoiding mock data and premature database complexity.
*   **Post-MVP / Post-Docs Approach (Planned):**
    *   **Webhook Implementation:** (As before - implement webhooks for asynchronous updates).
    *   **Database Caching/Storage:** Introduce database storage (`MarketplaceInfluencer` table) to cache fetched InsightIQ data, reducing direct API calls on every load and providing resilience if InsightIQ is temporarily unavailable. Webhooks update this stored data.
    *   **Benefit:** Improves performance, adds resilience, enables more complex backend filtering/aggregation not possible directly via InsightIQ API filters.
