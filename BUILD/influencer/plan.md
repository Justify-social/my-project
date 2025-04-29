# **Plan: Influencer Marketplace Implementation (MVP)**

**Scrum Leader Overview:** This document provides a highly granular, step-by-step plan for building the Minimum Viable Product (MVP) of the Influencer Marketplace. Our goal is speed, robustness, and seamless integration with the existing Campaign Wizard, leveraging our current codebase and UI library effectively. We will use a frontend-first approach with mock data initially. **This plan incorporates direct feedback from potential users like Kelly Parkerson (Marketing Director, Paleo Valley) to ensure we build features that solve real-world problems.**

**Core User Value Proposition (Brand Marketer Persona - "Marketing Director Maya" / Reflecting Kelly P. Needs):**

*   **Efficient Discovery:** Dramatically reduce the time spent manually searching for influencers by providing a curated list pre-filtered based on specific campaign goals and **verified audience criteria** (addressing Kelly's need for research efficiency).
*   **Relevant Matching (Beyond Vanity Metrics):** Move beyond unreliable metrics like EMV (which Kelly called "a load of pants") to find influencers whose **verified audience demographics**, **engagement quality** (represented by Justify Score using Phyllo inputs), and platform focus genuinely align with campaign objectives and drive *action*, not just impressions.
*   **Increased Trust & Reduced Risk:** Quickly identify influencers who have connected verification sources (via Phyllo, indicated by `isPhylloVerified`) and assess **audience authenticity** (using Phyllo Profile Analytics data via backend), providing confidence before outreach (addressing Kelly's need for background checks/bot detection).
*   **Seamless Workflow:** Integrate influencer selection directly into the existing campaign creation process, eliminating the need to manage separate lists or spreadsheets during the crucial planning phase.
*   **Informed Decisions:** Provide key data points (audience breakdown, verification, score) directly within the discovery and profile views, enabling marketers like Kelly to make faster, more confident decisions on influencer suitability.

**Success Metrics (MVP):**

*   **Adoption Rate:** % of new campaigns created via the Wizard that utilize the "Find Influencers in Marketplace" flow.
*   **Task Completion:** Successful completion rate of the Wizard -> Marketplace -> Select -> Wizard flow.
*   **User Satisfaction (Qualitative):** Direct feedback from initial internal users/beta testers (especially those mirroring Kelly's role) via demos and surveys focusing on perceived **efficiency gain**, **data trustworthiness (verification)**, **relevance of results**, and overall ease of use.
*   **(Post-MVP Metric):** Reduction in average time spent from starting a campaign brief to having a finalized list of selected influencers.

**MVP Scope Note:** While the overall platform vision includes a Freemium model (`idea.md`), the initial MVP implementation detailed below focuses on delivering the core marketplace functionality. Feature gating and specific plan limitations will be addressed Post-MVP.

**Architectural Integration Diagram:**

```mermaid
graph TD
    subgraph "User Flow & Routing"
        U[User] --> CW[Campaign Wizard (/campaigns/wizard/...)]
        U --> MP[Marketplace Page (/influencer-marketplace)]
        CW -- Navigates w/ Context --> MP
        MP -- Navigates --> PP[Profile Page (/influencer-marketplace/:id)]
        MP -- Navigates Back w/ Context --> CW_Review[Campaign Wizard Review Step]
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

1.  **User Flow:** Users start either in the existing `Campaign Wizard` or directly on the new `Marketplace Page`. The Wizard navigates *to* the Marketplace, passing filter criteria via the shared `WizardContext`. The Marketplace navigates back *to* the Wizard review step after selection, updating the context.
2.  **UI Components:** Both existing (`Campaign Wizard`) and new (`Marketplace`, `Profile`) UI heavily rely on the central `UI Component Library`. New feature-specific components (`MarketplaceList`, `InfluencerSummaryCard`, etc.) are built using these primitives.
3.  **State Management:** `WizardContext` is key for passing data *between* the Wizard and Marketplace. Local state within Marketplace components handles UI concerns like filter values, loading states, and pagination.
4.  **Services:** All data fetching goes through the `Influencer Service` abstraction layer, allowing easy switching between the initial `Mock Service` (using `Mock Data`) and the future real `API Service`.
5.  **Types:** Shared `Types` ensure data consistency across the application.

**Accelerated Production Strategy:**

To achieve a faster path to a production-ready, valuable MVP using real Phyllo data, the following adjustments to a strict frontend-first approach are required:

1.  **API Contracts First (CRITICAL):** Before significant coding in FE or BE, finalize the request/response contracts for core MVP endpoints (`GET /influencers`, `GET /influencers/:id`). This is **Task Zero**.
2.  **Parallel Development Streams:** Frontend UI development (components, page layouts) and Backend API development (endpoints, DB, Phyllo integration) **MUST** occur concurrently from the start.
3.  **Prioritized Backend Implementation:** Backend focuses first on delivering `GET /influencers` and `GET /influencers/:id` populated with priority Phyllo data (`Identity API` for verification, `Profile Analytics` for core demographics/metrics).
4.  **Incremental Frontend Integration:** Frontend integrates with *live* backend endpoints deployed to `dev`/`staging` environment *as soon as possible*, reducing reliance on prolonged mock data usage. The `influencerService` abstraction facilitates this switch.
5.  **Strict MVP Scope:** Adhere rigorously to the defined MVP features. Enhancements like advanced filters, detailed safety reports, etc., are deferred to Post-MVP (Phase 5).

**Communication Protocol:** Frequent (min. weekly) FE/BE sync meetings are required to review API contract adherence, discuss integration progress, and resolve blocking issues quickly.

**Refined User Journeys & Integration Flow:**

This feature needs to support two primary entry points:

1.  **Journey 1: Wizard-First (New Campaign)**
    *   **Entry:** User starts the Campaign Wizard (`/campaigns/wizard/...`).
    *   **Action:** User defines campaign goals, target audience, platforms etc. in early steps.
    *   **Transition:** User reaches the "Select Influencers" step (or similar) and clicks "Find Influencers in Marketplace".
    *   **Context Passing:** Relevant filter criteria (platforms, audience demographics) **MUST** be saved to `WizardContext` *before* navigation.
The `isFindingInfluencers` flag in `WizardContext` is set to `true`.
    *   **Marketplace Load:** The Marketplace (`/influencer-marketplace`) loads, reads `WizardContext`, sees the `isFindingInfluencers` flag, extracts criteria, sets initial filters, and fetches the pre-filtered list (See Ticket 4.3).
    *   **Marketplace Action:** User browses, filters further, selects influencers.
    *   **Context Update:** User clicks "Add X Influencers to Campaign". The selected `influencerIds` **MUST** be saved to `WizardContext` (See Ticket 4.4).
    *   **Return:** User is navigated back to the Wizard Review step.
    *   **Wizard Display:** The Review step reads the `selectedInfluencerIds` from context and displays the influencer summaries (See Ticket 4.5).

2.  **Journey 2: Marketplace-First (Discovery / Existing Campaign - Post-MVP)**
    *   **Entry:** User navigates directly to the Influencer Marketplace (`/influencer-marketplace`).
    *   **Context:** `WizardContext` likely won't have relevant filter criteria or the `isFindingInfluencers` flag set.
    *   **Marketplace Load:** Marketplace loads with default filters (or previously saved user preferences - Post-MVP) and fetches the initial unfiltered/default list.
    *   **Marketplace Action:** User browses, filters, selects influencers.
    *   **Integration (MVP Scope Limited):** For the MVP, the "Add X Influencers to Campaign" button might be disabled or simply store selected IDs locally if not originating from the Wizard. The primary MVP focus is the Wizard-First journey.
    *   **Integration (Post-MVP):** This button would trigger a modal or flow to select which *existing* campaign to add these influencers to, likely involving a call to a backend endpoint (`POST /api/campaigns/:id/influencers`) rather than updating `WizardContext`.

**Key Integration Logic:**

*   The Marketplace page component **MUST** check `WizardContext` on load to determine the entry journey and apply initial filters accordingly.
*   The selection mechanism **MUST** update `WizardContext` *only* if the journey originated from the Wizard.

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
│   ├── influencer/           # <--- NEW
│   │   └── index.ts          # <--- NEW (Abstraction Layer)
│   └── mock/                 # <--- NEW (or existing?)
│       └── mockInfluencerService.ts # <--- NEW
│   └── ... (other services)
├── types/
│   ├── influencer.ts         # <--- NEW (or existing, to be modified)
│   ├── enums.ts              # Existing (potentially modified)
│   └── ... (other types)
└── ... (other top-level dirs like lib, styles, etc.)
```

**Backend Design & API Considerations (MVP Focus):**

*   **API Contract Definition (SSOT):**
    *   **Requirement:** Before significant backend implementation begins, the exact request/response schemas for the core MVP API endpoints **MUST** be formally defined and agreed upon by Frontend and Backend leads.
    *   **Endpoints (MVP):** `GET /influencers`, `GET /influencers/:id`, `GET /influencers/summaries` (for wizard review step - might be combined with GET /influencers), `POST /campaigns/:id/influencers` (Post-MVP for adding to existing campaigns, but contract useful).
    *   **Recommendation:** Use OpenAPI (Swagger) specification format stored in a shared location (e.g., `/docs/api/influencer-marketplace.yaml`). Reference this spec file within relevant backend tickets.
    *   **Action:** Assign task to Backend Lead/Architect to create initial API spec draft.
*   **Phyllo Integration Strategy (Backend Responsibility):**
    *   **Data Flow:** The backend database is the SSOT for influencer data displayed in the UI. The backend service is responsible for enriching this database with Phyllo data.
    *   **Verification Status (`isPhylloVerified`):** Primarily updated via Phyllo webhooks processed by the backend.
    *   **Data Refresh Strategy (Backend Task):** Define and implement strategy. **Preference:** Use Phyllo webhooks where available (e.g., for profile updates, identity changes) for near real-time updates. Supplement with periodic background jobs (e.g., daily/hourly) polling `Profile Analytics API` for potentially less frequent updates (e.g., follower counts, detailed metrics) or as a fallback if webhooks fail. Document expected data latency.
    *   **Error/Staleness Handling (Backend Task & API Contract):** Backend MUST gracefully handle Phyllo API errors (timeouts, 5xx) or webhook processing failures. Define API contract behavior: Does the Justify API return `null` for Phyllo-sourced fields on error? Does it return potentially stale data with a timestamp/flag? Does it return a specific error code? Frontend needs to handle this response (Ticket 1.4, 2.1).
    *   **Rate Limit & Cost Management (Backend Task):** Implement caching (e.g., Redis or memory cache with TTL) for frequently accessed Phyllo data (Profile Analytics) to minimize API calls. Monitor Phyllo API usage against subscribed limits/costs. Implement backoff/retry logic for Phyllo API calls respecting rate limits.
    *   **Frontend Interaction:** The frontend interacts *only* with the Justify backend API (`/api/influencers/...`), not directly with Phyllo for marketplace data.
    *   **Connection Flow:** Triggering the Phyllo connection process itself is likely Post-MVP (e.g., in an Influencer Portal or Profile Settings).
    *   **Action:** Assign task to Backend Lead to detail the specific Phyllo webhook/sync strategy.
*   **Backend Data Aggregation:** The Justify backend API (`/api/influencers`, `/api/influencers/:id`) serves as an aggregation layer. It will fetch necessary data from its own database, which should be kept up-to-date with relevant information sourced *by the backend* from Phyllo APIs, primarily:
    *   `Profile Analytics API`: For audience demographics, follower counts, engagement metrics, follower quality insights, platform presence.
    *   `Identity API` (via Linkage SDK): To determine `isPhylloVerified` status.
    *   `Engagement Metrics API`: For specific like/comment/view counts if not included in Profile Analytics.
    *   `Brand Safety / Social Screening API` (Post-MVP): For risk scores/flags.
    *   The backend **MUST** handle caching, rate limiting, and error handling when interacting with Phyllo APIs.
*   **API Error Handling:**
    *   **Backend:** Implement consistent JSON error response formats across all API endpoints (e.g., `{ "status": 404, "error": "NotFound", "message": "Influencer not found" }`). This includes errors originating from Phyllo API calls.
    *   **Error Categories:** Define and handle distinct error categories: Input Validation (400), Authentication (401), Authorization (403), Resource Not Found (404), External Service Errors (e.g., Phyllo 5xx -> return 503), Internal Server Errors (500). Log server errors appropriately.
    *   **Frontend:** Service layer (`influencerService`) and page components (`MarketplacePage`, `ProfilePage`) **MUST** gracefully handle potential API errors (4xx, 5xx, network errors) returned by `fetchData` calls. Update UI state (`error`) accordingly.
    *   **UI:** Display user-friendly error messages (using existing Alert/Banner components) instead of technical details (See Tickets 1.4, 3.1). Differentiate messages where possible (e.g., "No matching influencers found" vs. "Failed to load data").
*   **Security Considerations:**
    *   **Authentication:** All new API endpoints **MUST** be protected by the existing authentication middleware.
    *   **Authorization:** Implement checks to ensure users can only perform actions within their allowed scope (e.g., can a user fetch *any* influencer profile? Can they only add influencers to campaigns they own/manage? Define rules with Product Owner).
    *   **Action:** Add specific authorization checks to backend tickets post-MVP or as required by defined rules.
*   **Configuration Management:**
    *   Values like pagination limits, default filter options, or external service URLs/keys **MUST NOT** be hardcoded.
    *   Use environment variables (`.env`) for secrets (API keys) and potentially a dedicated configuration file (`src/config/marketplace.ts`?) for non-sensitive, feature-specific settings.

*   **API Contract Schemas (MVP - Requires Human Verification Against Official Phyllo Docs):**
    *   **Introduction:** This section defines the agreed-upon interface between the Justify Frontend and Backend for the Influencer Marketplace MVP. Backend implementation MUST adhere to this structure. Field names and types marked with `// Verify...` require confirmation against the official Phyllo API documentation ([https://docs.getphyllo.com/](https://docs.getphyllo.com/)) to ensure alignment with the data source.
    *   **`GET /api/influencers`**
        *   **Request Query Params:**
            *   `page?: number` (default: 1)
            *   `limit?: number` (default: 12)
            *   `platforms?: PlatformEnum[]` // Verify exact enum values & query format in Phyllo Docs
            *   `minScore?: number` // Verify handling in backend logic
            *   `maxScore?: number` // Verify handling in backend logic
            *   `minFollowers?: number` // Verify exact Phyllo filter param name & type in Phyllo Docs
            *   `maxFollowers?: number` // Verify exact Phyllo filter param name & type in Phyllo Docs
            *   `audienceAge?: string` // Verify exact Phyllo filter param name & value format in Phyllo Docs
            *   `audienceLocation?: string` // Verify exact Phyllo filter param name & value format in Phyllo Docs
            *   `searchTerm?: string` (for name/handle search - Post-MVP?)
            *   `sortBy?: string` (e.g., 'score_desc', 'followers_asc' - Post-MVP?)
        *   **Response Body (200 OK):**
            ```json
            {
              "influencers": [
                // Matches InfluencerSummary type defined in Ticket 0.2
                {
                  "id": string, // Justify DB ID
                  "name": string, // [Profile Analytics API] Verify exact field name & type in Phyllo Docs
                  "handle": string, // [Profile Analytics API] Verify exact field name & type in Phyllo Docs
                  "avatarUrl": string, // [Profile Analytics API] Verify exact field name & type in Phyllo Docs
                  "platforms": PlatformEnum[], // [Profile Analytics API] Verify exact field name & type in Phyllo Docs
                  "followersCount": number, // [Profile Analytics API] Verify exact field name & type in Phyllo Docs
                  "justifyScore": number | null, // Calculated by Justify backend (Ticket 1.9)
                  "isPhylloVerified": boolean, // [Identity API] Verify exact field name & type in Phyllo Docs
                  "primaryAudienceLocation": string, // [Profile Analytics API] Verify exact field name & type in Phyllo Docs
                  "primaryAudienceAgeRange": string, // [Profile Analytics API] Verify exact field name & type in Phyllo Docs
                  "primaryAudienceGender": "Male" | "Female" | "Other" | "Mixed" | null, // [Profile Analytics API] Verify exact field name & type/enum values in Phyllo Docs
                  "engagementRate": number | null, // [Profile Analytics API or Engagement Metrics API] Verify exact field name & type in Phyllo Docs
                  "audienceQualityIndicator": "High" | "Medium" | "Low" | null // [Profile Analytics API] Verify exact field name & type/enum values (or logic) in Phyllo Docs
                  // Add flag/timestamp here if BE needs to signal Phyllo data staleness/error for specific fields?
                }
                // ... more influencers
              ],
              "pagination": {
                "currentPage": number,
                "limit": number,
                "totalInfluencers": number,
                "totalPages": number
              }
            }
            ```
    *   **`GET /api/influencers/:id`**
        *   **Request Path Params:** `id: string`
        *   **Response Body (200 OK):** // Matches InfluencerProfileData type defined in Ticket 0.3
            ```json
            {
              // Inherited fields from InfluencerSummary - Verify all as above
              "id": string,
              "name": string, // [Profile Analytics API] Verify...
              "handle": string, // [Profile Analytics API] Verify...
              "avatarUrl": string, // [Profile Analytics API] Verify...
              "platforms": PlatformEnum[], // [Profile Analytics API] Verify...
              "followersCount": number, // [Profile Analytics API] Verify...
              "justifyScore": number | null,
              "isPhylloVerified": boolean, // [Identity API] Verify...
              "primaryAudienceLocation": string, // [Profile Analytics API] Verify...
              "primaryAudienceAgeRange": string, // [Profile Analytics API] Verify...
              "primaryAudienceGender": "Male" | "Female" | "Other" | "Mixed" | null, // [Profile Analytics API] Verify...
              "engagementRate": number | null, // [Profile Analytics API or Engagement Metrics API] Verify...
              "audienceQualityIndicator": "High" | "Medium" | "Low" | null, // [Profile Analytics API] Verify...
              // Specific InfluencerProfileData fields:
              "bio": string | null, // [Profile Analytics API] Verify exact field name & type in Phyllo Docs
              "contactEmail": string | null, // [Profile Analytics API? Other Source?] Verify source, exact field name & type in Phyllo Docs
              "audienceDemographics": {
                "ageDistribution": Record<string, number> | null, // [Profile Analytics API] Verify...
                "genderDistribution": Record<string, number> | null, // [Profile Analytics API] Verify...
                "locationDistribution": Record<string, number> | null // [Profile Analytics API] Verify...
                // Add other verified demographics here
              } | null,
              "engagementMetrics": {
                "averageLikes": number | null, // [Profile Analytics API or Engagement Metrics API] Verify...
                "averageComments": number | null // [Profile Analytics API or Engagement Metrics API] Verify...
                // Add other verified metrics here
              } | null
              // Add other verified fields here
              // Add flag/timestamp here if BE needs to signal Phyllo data staleness/error?
            }
            ```
    *   **`GET /api/influencers/summaries?ids=id1,id2,...`** (Alternative to POST for Wizard Review)
        *   **Request Query Params:** `ids: string[]` (comma-separated)
        *   **Response Body (200 OK):**
            ```json
            {
              "influencers": InfluencerSummary[] // Matches structure defined above for GET /api/influencers
            }
            ```
        *   **Error Responses (Examples for all endpoints):**
            *   **Note:** Verify specific error codes/messages returned directly by Phyllo API in their documentation to ensure comprehensive backend handling.
            *   `400 Bad Request`: `{ "status": 400, "error": "BadRequest", "message": "Invalid filter parameter: minScore must be a number." }` (Validation Error)
            *   `401 Unauthorized`: `{ "status": 401, "error": "Unauthorized", "message": "Authentication required." }`
            *   `403 Forbidden`: `{ "status": 403, "error": "Forbidden", "message": "User does not have permission to access this resource." }`
            *   `404 Not Found`: `{ "status": 404, "error": "NotFound", "message": "Influencer with id X not found." }`
            *   `500 Internal Server Error`: `{ "status": 500, "error": "InternalServerError", "message": "An unexpected error occurred." }`
            *   `503 Service Unavailable`: `{ "status": 503, "error": "ServiceUnavailable", "message": "External service (Phyllo/DB) unavailable." }`

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
*   **Billing/Usage Limits (Post-MVP):** Consider how Phyllo API call volume (Profile Analytics, etc.) might impact different subscription tiers or usage limits in the future.
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

**Phase 0: Foundation & Backend Kickoff**

*Goal: Set up FE files/types/mocks, define API contracts, **initiate Backend API & Phyllo integration development**.*

*   **Ticket 0.1: `CHORE: Create Core Directory Structure`**
    *   **Goal:** Establish the folder hierarchy for the new feature.
    *   **Action:** Create the following directories if they don't exist:
        *   `src/app/influencer-marketplace/`
        *   `src/app/influencer-marketplace/[id]/`
        *   `src/components/features/influencers/`
        *   `src/services/influencer/`
        *   `src/data/mock/`
    *   **Files Created:** New folders.
    *   **Verification:** Directory structure matches plan.
*   **Ticket 0.2: `TYPE: Define InfluencerSummary Type (MVP)`**
    *   **Goal:** Specify the exact data fields needed for displaying influencers in lists/cards.
    *   **Action:** In `src/types/influencer.ts` (or create if needed), define the `InfluencerSummary` interface:
        ```typescript
        import { PlatformEnum } from './enums'; // Assuming PlatformEnum exists

        export interface InfluencerSummary {
          id: string;
          name: string;
          handle: string;
          avatarUrl: string;
          platforms: PlatformEnum[];
          followersCount: number; // Use consistent naming (e.g., followerCount or followers)
          justifyScore: number; // Assumed 0-100 // Likely calculated by Justify backend, using Phyllo inputs (Addresses Kelly's need for effectiveness metric over EMV)
          isPhylloVerified: boolean; // Direct flag from Phyllo via Identity API (Addresses Kelly's need for verification/credibility)
          primaryAudienceLocation: string; // e.g., "United States", "UK" // From Phyllo Profile Analytics (Addresses Kelly's need for audience alignment)
          primaryAudienceAgeRange: string; // e.g., "25-34" // From Phyllo Profile Analytics (Addresses Kelly's need for audience alignment, e.g., 45+ targeting)
          primaryAudienceGender?: 'Male' | 'Female' | 'Other' | 'Mixed'; // Optional for summary
          engagementRate?: number; // Optional for summary, e.g., 3.5 (%)
          audienceQualityIndicator?: 'High' | 'Medium' | 'Low'; // Simple flag based on Phyllo follower quality analysis (Addresses Kelly's concern about fake followers)
        }
        ```
    *   **Files Modified:** `src/types/influencer.ts`, potentially `src/types/enums.ts`.
    *   **Verification:** Type definition matches required fields for `list-view.png` mock. `PlatformEnum` is referenced correctly or defined if new.
*   **Ticket 0.3: `TYPE: Define InfluencerProfileData Type (MVP)`**
    *   **Goal:** Specify the data fields for the detailed influencer profile page.
    *   **Action:** In `src/types/influencer.ts`, define `InfluencerProfileData` interface, extending `InfluencerSummary`:
        ```typescript
        export interface AudienceDemographics {
          ageDistribution: Record<string, number>; // e.g., { '18-24': 25, '25-34': 45, ... } // From Phyllo Profile Analytics (Essential for Kelly's audience targeting)
          genderDistribution: Record<string, number>; // e.g., { 'Female': 65, 'Male': 30, ... } // From Phyllo Profile Analytics (Essential for Kelly's audience targeting)
          locationDistribution: Record<string, number>; // e.g., { 'USA': 40, 'UK': 20, ... } // From Phyllo Profile Analytics (Essential for Kelly's audience targeting)
          // TODO: Add other relevant MVP demographics if needed (e.g., top interests array?) - Consult Product Owner // Phyllo Profile Analytics likely source
        }

        export interface EngagementMetrics {
           averageLikes?: number; // From Phyllo Profile Analytics or Engagement Metrics API
           averageComments?: number; // From Phyllo Profile Analytics or Engagement Metrics API
           // TODO: Add other relevant MVP metrics if needed - Consult Product Owner // Phyllo likely source
        }

        export interface InfluencerProfileData extends InfluencerSummary {
          bio?: string;
          audienceDemographics?: AudienceDemographics;
          engagementMetrics?: EngagementMetrics;
          // TODO: Add other MVP fields: e.g., pastCampaignHighlights?: { campaignName: string; brandName: string }[]; - Consult Product Owner
          // Add safety flags later if part of MVP profile view
        }
        ```
    *   **Files Modified:** `src/types/influencer.ts`.
    *   **Verification:** Type definition includes necessary fields for `individual-influencer-profile.png`. `TODO`s added for Product Owner clarification on MVP scope.
*   **Ticket 0.4: `TYPE: Extend DraftCampaignData in WizardContext`**
    *   **Goal:** Enable the wizard state to store selected influencer IDs and navigation flag.
    *   **Action:** Locate the `DraftCampaignData` type (or equivalent managing wizard state). Add:
        *   `selectedInfluencerIds?: string[];`
        *   `isFindingInfluencers?: boolean;`
    *   **Files Modified:** `src/contexts/WizardContext.tsx` or related type file (e.g., `src/components/features/campaigns/types.ts`).
    *   **Verification:** Context type is updated with the new fields. Default values handled correctly in context provider.
*   **Ticket 0.5.1: `CHORE(API): Define API Contracts (MVP)`**
    *   **Goal:** Finalize request/response schemas for `GET /influencers`, `GET /influencers/:id`.
    *   **Action:** Create/update OpenAPI spec file (e.g., `/docs/api/influencer-marketplace.yaml`). Gain sign-off from FE/BE leads. **CRITICAL FIRST STEP** before parallel development to avoid integration issues.
    *   **Verification:** Contracts are documented and agreed upon.
*   **Ticket 0.5: `DATA: Create Mock Influencer Data File`**
    *   **Goal:** Generate realistic mock data covering different scenarios.
    *   **Action:** Create `src/data/mock/influencers.ts`. Export a constant array (`mockInfluencerDatabase: InfluencerProfileData[]`) containing at least 15-20 diverse mock influencers conforming to `InfluencerProfileData` (using fields defined in Ticket 0.3). Include variations in scores, verification status, platforms, audience data, followersCount, etc. Ensure `id` is unique.
    *   **Customer Focus:** Ensure mock data includes examples reflecting Kelly P.'s concerns: some verified (`isPhylloVerified: true`), some not; varying `justifyScore` values; diverse audience demographics (including 45+ ranges); influencers on different platforms (IG, YT, TK).
    *   **Files Created:** `src/data/mock/influencers.ts`.
    *   **Verification:** File exports the array correctly. Data includes diverse examples reflecting user needs.
*   **Ticket 0.6: `FEAT: Implement Mock Influencer Service - getInfluencers Function`**
    *   **Goal:** Simulate fetching a paginated and filtered list of influencer summaries **based on agreed API contract**.
    *   **Action:** Create `src/services/mock/mockInfluencerService.ts`.
        *   Import `mockInfluencerDatabase`, `InfluencerSummary`, `InfluencerProfileData`.
        *   Implement `async getInfluencers(params: { filters?: { platform?: PlatformEnum[]; minScore?: number; maxScore?: number; minFollowers?: number; maxFollowers?: number /* Add other simple MVP filters */ }; pagination?: { page: number; limit: number } }): Promise<{ influencers: InfluencerSummary[]; total: number; page: number; limit: number }>`
        *   Inside, implement filtering logic on `mockInfluencerDatabase` based on `params.filters`. Handle potential missing filter values.
        *   Implement pagination logic based on `params.pagination`. Calculate `total` based on filtered results *before* pagination.
        *   **Crucially:** Map the full `InfluencerProfileData` objects from the filtered/paginated results to `InfluencerSummary` objects, only including the fields defined in the `InfluencerSummary` type.
        *   Simulate network delay (`await new Promise(resolve => setTimeout(resolve, 300));`).
        *   Return the structured response: `{ influencers, total, page: params.pagination?.page ?? 1, limit: params.pagination?.limit ?? 12 }`.
    *   **Files Created/Modified:** `src/services/mock/mockInfluencerService.ts`.
    *   **Verification:** Function handles filtering and pagination correctly. Returns data in the specified shape, mapping to `InfluencerSummary`.
*   **Ticket 0.7: `FEAT: Implement Mock Influencer Service - getInfluencerById Function`**
    *   **Goal:** Simulate fetching the full profile data for a single influencer.
    *   **Action:** In `src/services/mock/mockInfluencerService.ts`.
        *   Import `InfluencerProfileData`.
        *   Implement `async getInfluencerById(id: string): Promise<InfluencerProfileData | null>`
        *   Find the influencer in `mockInfluencerDatabase` by `id`.
        *   Simulate network delay.
        *   Return the found object (full `InfluencerProfileData`) or `null`.
    *   **Files Modified:** `src/services/mock/mockInfluencerService.ts`.
    *   **Verification:** Function correctly finds and returns profile data or null.
*   **Ticket 0.8: `FEAT: Implement Mock Influencer Service - getInfluencerSummariesByIds Function`**
    *   **Goal:** Simulate fetching summary data for multiple specific influencers (needed for Wizard review) **based on agreed API contract**.
    *   **Action:** In `src/services/mock/mockInfluencerService.ts`.
        *   Import `InfluencerSummary`.
        *   Implement `async getInfluencerSummariesByIds(ids: string[]): Promise<InfluencerSummary[]>`
        *   Filter `mockInfluencerDatabase` to find influencers whose `id` is in the input `ids` array.
        *   Map the found `InfluencerProfileData` objects to `InfluencerSummary` objects.
        *   Simulate network delay.
        *   Return the array of summaries.
    *   **Files Modified:** `src/services/mock/mockInfluencerService.ts`.
    *   **Verification:** Function returns correct summaries for the given IDs.
*   **Ticket 0.9: `CHORE: Implement Service Abstraction Layer`**
    *   **Goal:** Create the index file to easily switch between mock and **early real API endpoints**.
    *   **Action:** Create `src/services/influencer/index.ts`.
        ```typescript
        import * as mockService from '../mock/mockInfluencerService';
        import { InfluencerSummary, InfluencerProfileData, AudienceDemographics, EngagementMetrics } from '@/types/influencer'; // Adjust path as needed
        import { PlatformEnum } from '@/types/enums'; // Adjust path as needed

        // Define the interface for the service based on mock service functions
        interface IInfluencerService {
          getInfluencers(params: { filters?: { platform?: PlatformEnum[]; minScore?: number; maxScore?: number; minFollowers?: number; maxFollowers?: number }; pagination?: { page: number; limit: number } }): Promise<{ influencers: InfluencerSummary[]; total: number; page: number; limit: number }>;
          getInfluencerById(id: string): Promise<InfluencerProfileData | null>;
          getInfluencerSummariesByIds(ids: string[]): Promise<InfluencerSummary[]>;
        }

        // Placeholder for the real API service implementing the interface
        const apiService: IInfluencerService = {
          getInfluencers: async (params) => { console.error('Real getInfluencers API not implemented'); return { influencers: [], total: 0, page: 1, limit: 12 }; },
          getInfluencerById: async (id) => { console.error('Real getInfluencerById API not implemented'); return null; },
          getInfluencerSummariesByIds: async (ids) => { console.error('Real getInfluencerSummariesByIds API not implemented'); return []; },
        };

        // Ensure mockService conforms to the interface (TypeScript will help here)
        const typedMockService: IInfluencerService = mockService;

        const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.NODE_ENV === 'development'; // Default to mock in dev

        export const influencerService: IInfluencerService = useMock ? typedMockService : apiService;
        ```
    *   **Files Created:** `src/services/influencer/index.ts`.
    *   **Verification:** File exports `influencerService`. `useMock` logic is correct. Placeholder `apiService` exists. TypeScript checks pass for interface conformity.
*   **Ticket 0.10: `CHORE(DB): Define Initial Database Indexes`**
    *   **Goal:** Ensure efficient querying of the `influencers` table/collection based on MVP filters.
    *   **Action:** Analyze MVP filter parameters (`platforms`, `justifyScore`, `followersCount`, `audienceLocation`, `audienceAge`). Define appropriate single-column and potentially composite indexes in the Prisma schema or database directly. Document the initial indexing strategy.
    *   **Files Modified:** `prisma/schema.prisma` (potentially, using `@@index` or `@db.index`)
    *   **Verification:** Index definitions are added and match filter requirements.
*   **Ticket 0.11: `BE-SETUP: Initialize Influencer DB Models & Basic API Routes`**
    *   **Goal:** Set up the basic database structure and API routing for influencers.
    *   **Action:** Ensure Prisma schema changes (Ticket 0.2, 0.3) are applied. Create basic repository patterns or DB service functions. Set up basic Next.js API route handlers (`route.ts`) for `/api/influencers` and `/api/influencers/[id]`. Implement basic health check response.
    *   **Dependencies:** Tickets 0.3.
    *   **Verification:** Database tables exist. API routes return basic success/error responses.
*   **Ticket 0.12: `BE-SETUP: Implement Phyllo Service Initial Connection`**
    *   **Goal:** Establish authenticated connection capability to Phyllo API.
    *   **Action:** Implement authentication logic within `src/lib/phylloService.ts` (create if needed) using environment variables for API keys (Ticket 0.13). Implement basic health check or simple Phyllo API call (e.g., get account status) to verify connection.
    *   **Dependencies:** Phyllo API credentials (via Ticket 0.13).
    *   **Verification:** Backend service can successfully authenticate with Phyllo API.
*   **Ticket 0.13: `CHORE(Config): Setup Phyllo API Key Management`**
    *   **Goal:** Securely configure Phyllo API keys.
    *   **Action:** Add `PHYLLO_API_KEY`, `PHYLLO_SECRET` (or similar) to `.env.template` / `.env.example`. Ensure these are loaded correctly via environment variables and accessible to the `phylloService`. Use platform secret management for production.
    *   **Verification:** Keys are configured and usable by the `phylloService`.
*   **Ticket 0.14: `CHORE(API): Verify Existing Phyllo User/Token Endpoints`**
    *   **Goal:** Ensure existing endpoints (`/api/phyllo/create-user`, `/api/phyllo/sdk-token`) meet requirements for Marketplace/future connection flows.
    *   **Action:**
        *   Review `/api/phyllo/create-user/route.ts`: Verify it correctly maps Justify internal user ID to Phyllo `external_id` and stores the returned Phyllo `user_id`.
        *   Review `/api/phyllo/sdk-token/route.ts`: Verify it accepts the Phyllo `user_id`, specifies the correct `products` array needed for Marketplace data (`IDENTITY`, `IDENTITY.AUDIENCE`, `ENGAGEMENT`, etc.), and returns the `sdk_token`.
        *   Check error handling in both endpoints.
        *   Refactor/update if necessary to meet requirements.
    *   **Dependencies:** Access to review existing code.
    *   **Verification:** Endpoints are confirmed or updated to correctly create Phyllo users, generate SDK tokens with required products, and handle errors.

---

**Phase 1: Marketplace UI & Initial Integration**

*Goal: Build the core Marketplace page UI, connect to mock or **early live dev APIs**, implement basic selection state.*

*   **Ticket 1.0: `BE-FEAT: Implement GET /influencers v1 (Core Data + Phyllo Verification)`**
    *   **Goal:** Create the primary backend endpoint delivering essential data for the list view, integrating initial Phyllo data.
    *   **Action:** Implement `GET /api/influencers` route handler based on **finalized API Contract (Ticket 0.5.1)**. **Apply Input Validation (Zod).** Fetch data from local DB (Ticket 0.11). Implement basic filtering/pagination logic (using indexes from Ticket 0.10). **Integrate calls via `phylloService` (Ticket 0.12) to fetch `isPhylloVerified` status** (using Phyllo Identity API) and basic `Profile Analytics` data (followers, platforms). Handle caching/errors for Phyllo calls. Deploy to dev/staging ASAP.
    *   **Dependencies:** Tickets 0.5.1, 0.10, 0.11, 0.12, 0.13.
    *   **Verification:** Endpoint returns data matching contract. Input validation works. Includes `isPhylloVerified`, followers, platforms sourced from Phyllo (or indicates if fetch failed). Basic filtering works.
*   **Ticket 1.1: `BE-FEAT: Implement GET /influencers/:id v1 (Core Profile Data)`**
    *   **Goal:** Create the endpoint for fetching detailed profile data, including core Phyllo analytics.
    *   **Action:** Implement `GET /api/influencers/:id` route handler based on **finalized API Contract**. **Apply Input Validation (Zod for ID format).** Fetch data from local DB. **Integrate calls via `phylloService` to fetch detailed `Profile Analytics` data** (Audience Demographics, Engagement Metrics, Follower Quality). Integrate `Identity API` call for `isPhylloVerified`. Handle caching/errors. Deploy to dev/staging ASAP.
    *   **Dependencies:** Tickets 0.5.1, 0.11, 0.12, 0.13.
    *   **Verification:** Endpoint returns detailed data matching contract, including demographics and engagement metrics sourced from Phyllo.
*   **Ticket 1.2: `FEAT(UI): Build InfluencerSummaryCard Component`**
    *   **Goal:** Create the core reusable UI card for displaying influencer summary info in a **Grid Layout**.
    *   **Action:** Create `src/components/features/influencers/InfluencerSummaryCard.tsx`.
        *   **Props:** `influencer: InfluencerSummary`, `isSelected: boolean`, `onSelectToggle: (id: string) => void`, `onViewProfile: (id: string) => void`.
        *   **Implementation:**
            *   Use `Card` as the base container. Apply appropriate padding/styling.
            *   Top section: Use `Checkbox` aligned left. Checkbox state controlled by `isSelected` prop. `onChange` calls `onSelectToggle(influencer.id)`.
            *   Middle section (main content): Use layout (Flexbox/Grid) to arrange:
                *   `Avatar` component (src=`influencer.avatarUrl`, alt=`influencer.name`).
                *   Name (`<p>` or `<h4>`, bold).
                *   Handle (`<p>`, smaller text, secondary color).
                *   Platform Icons: Map `influencer.platforms`. Use existing `Icon` component for each platform. Ensure icons exist (See Dependency Check).
                *   Verification: If `influencer.isPhylloVerified`, display a verification `Badge` ("Verified") or `Icon`. (**Data Source Note:** `isPhylloVerified` comes via backend from Phyllo Identity API).
                *   Audience Tags: Display `primaryAudienceAgeRange`, `primaryAudienceGender` (if available), `primaryAudienceLocation` using `Badge` components for quick scanning.
            *   Bottom section (metrics): Display Followers (`followersCount`), **Justify Score** (`justifyScore` - include `Tooltip` or `InfoIcon` explaining key factors), Audience Quality (`audienceQualityIndicator` - use `Badge`), Engagement Rate (`engagementRate`), using Text/Labels. Format numbers. (**Data Source Note:** Score calculated by backend; Quality from Phyllo Profile Analytics; Engagement from Phyllo).
            *   Action section: "View Profile" `Button` (`variant="outline"` or similar). `onClick` calls `onViewProfile(influencer.id)`.
        *   **Visual Reference:** Aim for layout in `list-view.png`.
        *   **Accessibility:** Ensure checkbox has label association. Ensure interactive elements are focusable.
        *   **Customer Focus:** This card directly addresses Kelly P.'s need to see verification status (`isPhylloVerified`) and effectiveness indicators (`justifyScore`, audience highlights) upfront, de-emphasizing raw follower counts.
        *   **Integration Mandate:** **Develop against the agreed API Contract structure.** Test initially with mock service if needed, but **switch to live dev/staging endpoint (Ticket 1.0) via `influencerService` IMMEDIATELY upon availability.**
    *   **Files Created:** `src/components/features/influencers/InfluencerSummaryCard.tsx`.
    *   **Dependency Check:** Verify existence of `Card`, `Checkbox`, `Avatar`, `Icon`, `Badge`, `Button` in `src/components/ui`. Specifically check if `Icon` supports platform logos (IG, YT, TK etc.) and a verification icon (e.g., check-circle). **If icons missing, create `TICKET: CHORE(UI): Add missing platform/verification icons`**.
    *   **Verification:** Component renders correctly against **API Contract structure** (mock or early live data). Interactions trigger callbacks. Layout matches mockup grid view. Audience tags are displayed.
*   **Ticket 1.3: `FEAT(UI): Setup Marketplace Page (`page.tsx`) & Initial State`**
    *   **Goal:** Create the page file, manage core state for list display and selection.
    *   **Action:** Create `src/app/influencer-marketplace/page.tsx`.
        *   Add `'use client'`. Import `React`, `useState`, `useEffect`, `useRouter`, `influencerService`, `InfluencerSummary`.
        *   Define state variables using `useState`:
            *   `influencers: InfluencerSummary[] = []`
            *   `isLoading: boolean = true`
            *   `error: string | null = null`
            *   `selectedIds: string[] = []`
            *   `currentPage: number = 1`
            *   `totalInfluencers: number = 0`
            *   `limit: number = 12` // Or fetch from config/constants
        *   Implement `handleSelectToggle(id: string)`: Toggles `id` in `selectedIds` array.
        *   Implement `handleViewProfile(id: string)`: Uses `router.push(`/influencer-marketplace/${id}`)`.
        *   Render basic page structure: Use `ConditionalLayout`, add page title (e.g., "Influencer Marketplace"), add placeholders for Filters button, "Add to Campaign" button, the list, and pagination.
        *   Pass props: `key={inf.id}`, `influencer={inf}`, `isSelected={selectedIds.includes(inf.id)}`, `onSelectToggle`, `onViewProfile`.
        *   **Layout Note:** This implementation focuses on a **Grid layout** for the MVP. A List/Table view toggle is a Post-MVP enhancement.
        *   **Integration Mandate:** Like Ticket 1.2, **develop against API Contract and connect to live dev/staging endpoint (Ticket 1.0) via `influencerService` ASAP.**
    *   **Files Created:** `src/app/influencer-marketplace/page.tsx`.
    *   **Verification:** Page renders with title. State variables are initialized. Handler functions exist.
*   **Ticket 1.4: `FEAT(FE): Implement Initial Data Fetching on Marketplace Page`**
    *   **Goal:** Load the first page of influencers when the page mounts.
    *   **Action:** In `MarketplacePage` (`page.tsx`):
        *   Create `fetchData = async (page = 1) => { ... }` function.
        *   Inside `fetchData`:
            *   Set `isLoading(true)`, `setError(null)`.
            *   `try { ... } catch (err) { setError(...); } finally { setIsLoading(false); }`.
            *   Call `influencerService.getInfluencers({ pagination: { page, limit } /* Add filters later */ })`.
            *   On success: update `setInfluencers`, `setCurrentPage(page)`, `setTotalInfluencers(response.total)`.
        *   Call `fetchData(1)` inside a `useEffect(() => { ... }, []);` hook (empty dependency array for initial load).
    *   **Files Modified:** `src/app/influencer-marketplace/page.tsx`.
    *   **Verification:** Data is fetched on load. Loading state works. `influencers` state is populated. `totalInfluencers` is set.
    *   **Error Handling:** Verify that API or network errors during fetch update the `error` state and are handled by the `MarketplaceList` component (Ticket 1.4).
    *   **Integration Mandate:** Fetch logic **must** call the backend via `influencerService`. Test against live dev/staging endpoint (Ticket 1.0).
*   **Ticket 1.5: `FEAT(UI): Create MarketplaceList Component`**
    *   **Goal:** Render the list of influencer cards and handle loading/error states **from live dev API or mock fallback**.
    *   **Action:** Create `src/components/features/influencers/MarketplaceList.tsx`.
        *   **Props:** `influencers: InfluencerSummary[]`, `isLoading: boolean`, `error: string | null`, `selectedIds: string[]`, `onSelectToggle: (id: string) => void`, `onViewProfile: (id: string) => void`, `itemsPerPage: number`.
        *   **Implementation:**
            *   If `isLoading`, render a grid of `itemsPerPage` `LoadingSkeleton` components shaped like `InfluencerSummaryCard`.
            *   If `error`, display a user-friendly error message component (e.g., AlertBanner from UI library) showing the `error`
    *   **Files Created:** `src/components/features/influencers/MarketplaceList.tsx`.
    *   **Dependency Check:** `LoadingSkeleton` component exists. AlertBanner/ErrorMessage component exists.
*   **Ticket 1.6: `FEAT(UI): Implement Marketplace Filters UI`**
    *   **Goal:** Build the filter drawer UI.
    *   **Action:** Create `src/components/features/influencers/MarketplaceFilters.tsx`. Implement UI with controls for Platform, Score, Followers, Audience Age, Location.
    *   **Dependencies:** `Drawer`, `Select`, `Slider`, `Input`, `Button`.
    *   **Verification:** Drawer opens/closes. Controls are present.
*   **Ticket 1.7: `FEAT(FE): Connect Filters State & Actions`**
    *   **Goal:** Manage filter state and connect UI controls.
    *   **Action:** In `MarketplacePage` (`page.tsx`), add `filters` state (`FiltersState`) and `handleFilterChange`, `handleResetFilters`. Pass down to `MarketplaceFilters`. Wire up controls in `MarketplaceFilters` to display/update state.
    *   **Files Modified:** `src/app/influencer-marketplace/page.tsx`, `src/components/features/influencers/MarketplaceFilters.tsx`.
    *   **Verification:** Filter controls display and update state correctly.
*   **Ticket 1.8: `FEAT(FE): Connect Apply Filters to Data Fetching`**
    *   **Goal:** Refetch data with applied filters.
    *   **Action:** In `MarketplacePage`, implement `handleApplyFilters` to call `fetchData(1)` with current `filters` state. Connect Apply button. Modify `fetchData` to pass `filters` to `influencerService.getInfluencers`.
    *   **Files Modified:** `src/app/influencer-marketplace/page.tsx`, `src/components/features/influencers/MarketplaceFilters.tsx`.
    *   **Verification:** Applying filters refetches data using API filter params. List updates.
*   **Ticket 1.9: `BE-FEAT: Implement MVP Justify Score v1 Calculation`**
    *   **Goal:** Provide an initial, simple Justify Score based on available Phyllo data.
    *   **Action:** In the backend logic (likely within the service layer providing data for `GET /influencers` and `GET /influencers/:id`):
        *   Define a simple V1 algorithm (e.g., weighted combination of `isPhylloVerified` status, `audienceQualityIndicator`, basic engagement rate).
        *   Calculate and return the `justifyScore` field. Document the V1 algorithm.
        *   Handle missing input data gracefully (e.g., return `null` score or calculate based on available data).
    *   **Dependencies:** Ticket 1.0, Ticket 1.1 (needs Phyllo data available).
    *   **Verification:** API responses include a calculated `justifyScore`. Calculation logic is documented and handles missing inputs.

---

**Phase 2: Profile Page UI & Contact Info**

*Goal: Build the detailed influencer profile page UI, connect to mock or **early live dev APIs**, **display contact info**.*

*   **Ticket 2.1: `FEAT: Setup Profile Page (`[id]/page.tsx`) & Data Fetching`**
    *   **Goal:** Create the dynamic page, extract ID, fetch profile data, handle loading/errors.
    *   **Action:** Create `src/app/influencer-marketplace/[id]/page.tsx`.
        *   Add `'use client'`. Import `React`, `useState`, `useEffect`, `useRouter`, `influencerService`, `InfluencerSummary`.
        *   Define state variables using `useState`:
            *   `influencer: InfluencerSummary | null = null`
            *   `isLoading: boolean = true`
            *   `error: string | null = null`
        *   Implement `fetchData = async () => { ... }` function.
        *   Inside `fetchData`:
            *   Set `isLoading(true)`, `setError(null)`.
            *   `try { ... } catch (err) { setError(...); } finally { setIsLoading(false); }`.
            *   Call `influencerService.getInfluencerById(id)`.
            *   On success: update `setInfluencer`.
        *   Call `fetchData()` inside a `useEffect(() => { ... }, []);` hook (empty dependency array for initial load).
        *   Render: Use `ConditionalLayout`. Add a "Back" `Button` (`onClick={() => router.back()}`). Handle `isLoading` (render `LoadingSkeleton` for profile shape) and `error` (render error message) states. Render placeholder for profile content.
        *   **Dependency Check:** `LoadingSkeleton` (needs a profile shape variant?), Error message component.
        *   **Verification:** Page fetches data based on URL ID. Loading state works. Back button works. Error state (`isLoading=false, error!=null`) displays a user-friendly error message (e.g., "Influencer not found" or "Failed to load profile").
*   **Ticket 2.2: `FEAT(UI): Build Profile Header Component`**
    *   **Goal:** Display the top summary section visually matching `individual-influencer-profile.png`.
    *   **Action:** Create `src/components/features/influencers/ProfileHeader.tsx`.
        *   **Props:** `influencer: InfluencerSummary`, `isSelected: boolean`, `onSelectToggle: (id: string) => void`.
        *   **Implementation:**
            *   Use layout (Flexbox/Grid) for structure.
            *   Left side: `Avatar`.
            *   Middle section: Name, Handle, Bio (`influencer.bio`).
            *   Right section: **Justify Score** display (with `Tooltip`/`InfoIcon`), Verification `Badge`/`Icon`, Audience Quality `Badge`, Platform `Icon`s. (**Data Source Note:** Score from backend; Verification from Phyllo Identity; Quality from Phyllo Profile Analytics; Bio likely from Phyllo Profile Analytics).
            *   Action button: "Select Influencer" / "Deselect Influencer" `Button` or `Checkbox` based on `isSelected`. `onClick={() => onSelectToggle(influencer.id)}`.
        *   **Visual Reference:** Match top section of `individual-influencer-profile.png`.
        *   **Dependency Check:** Reuses UI components. Potentially a small dedicated Score display component.
        *   **Verification:** Component renders correctly with profile data. Select button works.
*   **Ticket 2.3: `FEAT: Integrate Profile Header into Profile Page`**
    *   **Goal:** Show the header with fetched data and manage selection state for this profile.
    *   **Action:** In `ProfilePage` (`[id]/page.tsx`):
        *   Modify the existing `influencer` state to include `isSelectedOnProfile` field.
        *   Implement `handleSelectToggle(id: string)` function to toggle `isSelectedOnProfile` and update `selectedIds` state.
        *   **Files Modified:** `src/app/influencer-marketplace/[id]/page.tsx`.
        *   **Verification:** Header renders below the Back button when data is loaded. Selection state on the profile page is managed locally.
        *   **Sync Clarification:** Verify that clicking the select button on the profile *only* affects the local `isSelectedOnProfile` state and does not modify the `selectedIds` state on the main marketplace page or `WizardContext`.
*   **Ticket 2.4: `FEAT(UI): Build Profile Details Tabs/Sections (MVP)`**
    *   **Goal:** Display core profile details (Bio, Audience, Performance) using Tabs.
    *   **Action:**
        *   Create `src/components/features/influencers/ProfileAboutSection.tsx`, `ProfileAudienceSection.tsx`, and `ProfilePerformanceSection.tsx`.
        *   Implement `ProfileAboutSection` to display `influencer.bio`.
        *   Implement `ProfileAudienceSection` to display `influencer.audienceDemographics`.
        *   Implement `ProfilePerformanceSection` to display `influencer.engagementMetrics`.
    *   **Dependency Check:** `Tabs`, Chart component (Bar chart), `Table`, `Card`. Ensure charts can handle the `Record<string, number>` data format.
    *   **Verification:** Tabs render below the header. Each tab displays the correct section component with data (or empty/loading state). Charts/tables visualize data correctly.
*   **Ticket 2.5: `FEAT: Direct Influencer Contact Info Display (Elevated Priority)`**
    *   **Goal:** Display verified email addresses for influencers if available/permissioned.
    *   **Context:** Directly addresses Kelly P.'s strong preference for email outreach.
    *   **Action:** Requires backend API update to `GET /influencers/:id` to include `contactEmail?: string` (sourced securely, requires careful thought on data source/permissions - **Backend Task**). Update `InfluencerProfileData` type. Display the email clearly (e.g., under name/handle or in an 'About'/'Contact' section) within the profile page. Add a 'Copy Email' button.
    *   **Files Modified:** `src/types/influencer.ts`, `src/app/influencer-marketplace/[id]/page.tsx` (or relevant section component).
    *   **Dependency Check:** Copy `Icon`, `Button`.
    *   **Verification:** Email displays correctly when present in data. Copy button works.

---

**Phase 3: Campaign Wizard Integration**

*Goal: Connect the functional marketplace (**ideally using early live data**) back to the campaign creation process.*

*   **Ticket 3.1: `REFACTOR: Ensure WizardContext Stores Filter Criteria`**
    *   **Goal:** Ensure the wizard state stores filter criteria.
    *   **Action:** Modify `WizardContext` to include `filters` and `isFindingInfluencers` fields.
    *   **Files Modified:** `src/contexts/WizardContext.tsx`.
    *   **Verification:** Context type is updated with the new fields. Default values handled correctly in context provider.
    *   **Integration Testing Note:** E2E tests (See Testing Strategy) must specifically cover scenarios involving browser back/forward navigation between Wizard and Marketplace to ensure `isFindingInfluencers` flag and `selectedInfluencerIds` state in `WizardContext` remain consistent and are handled correctly.

---

**Phase 4: Post-MVP Features (Addressing Specific User Needs)**

*Goal: Enhance the marketplace based on deeper user requirements identified (e.g., from Kelly P. discussion).*

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
    *   **Action:** Requires backend API update to potentially fetch/store this (maybe via Phyllo Profile Analytics or separate source). Update `InfluencerProfileData` type. Display contact info securely on the profile page.
*   **Ticket 5.2: `FEAT: Sponsored Post Performance Metrics (High Priority Post-MVP)`**
    *   **Goal:** Show metrics specifically for sponsored content (e.g., CTR, potentially conversion hints).
    *   **Context:** **Critical Value:** Addresses Kelly P.'s need to validate influencer pricing and ROI based on *paid* campaign effectiveness, moving beyond unreliable EMV.
    *   **Action:** Requires significant backend work to identify sponsored posts (via Phyllo Profile/Content APIs?) and potentially track associated links/codes. Update `InfluencerProfileData`. Display metrics on profile page.
*   **Ticket 5.3: `FEAT: Basic Brand Safety Flags/Content Check Integration (High Priority Post-MVP)`**
    *   **Goal:** Integrate initial brand safety checks.
    *   **Context:** Addresses Kelly P.'s need for automated background checks/controversial post detection, reducing manual vetting time and risk.
    *   **Action:** Backend integrates with Phyllo Brand Safety API (Basic report initially?). Update `InfluencerProfileData` with a risk score or flags. Display indicators on profile/summary card.
*   **Ticket 5.4: `FEAT: Add to Existing Campaign Flow`**
    *   **Goal:** Allow users entering the marketplace directly to add selected influencers to an existing campaign.
    *   **Context:** Enables the high-value "Marketplace-First" user journey for ongoing discovery and campaign staffing.
    *   **Action:** Implement UI (modal?) to select an existing campaign. Implement backend endpoint (`POST /api/campaigns/:id/influencers`). Update marketplace "Add" button logic.
*   **Ticket 5.5: `FEAT: Content Effectiveness Insights (Placeholder)`**
    *   **Goal:** Lay groundwork for future content/messaging analysis.
    *   **Context:** Addresses Kelly P.'s identified gap in knowing which messages work best.
    *   **Action:** This is complex. Initial step might involve displaying top-performing *content types* (e.g., Reels vs. Stories) based on Phyllo data. True A/B testing is likely a larger epic.
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
    *   **Action:** Update filters. Backend needs to identify podcasters (via Phyllo?). Display relevant podcast metrics (e.g., listenership estimates if available via Phyllo Profile Analytics).
*   **Ticket 5.9: `TECH-DEBT: Refactor Wizard/Marketplace State Coupling`**
    *   **Goal:** Decouple state management between Campaign Wizard and Marketplace.
    *   **Context:** Current MVP uses `WizardContext` directly, creating tight coupling.
    *   **Action:** Investigate and implement alternative patterns like event bus, callbacks, or dedicated workflow state APIs to improve modularity and testability.

---

**Phase X: Frontend Phyllo Connect SDK Integration (Run Concurrently / As Needed)**

*Goal: Implement the user-facing workflow for connecting social accounts via Phyllo.*
*Note: The specific UI trigger (e.g., button in Settings, Onboarding step) for initiating this flow needs to be defined separately based on overall application design.*

*   **Ticket X.1: `FEAT(FE): Setup Phyllo Connect Web SDK Script & Hook`**
    *   **Goal:** Integrate the Phyllo Connect JavaScript SDK script and create an abstraction.
    *   **Action:**
        *   Add Phyllo Connect `<script>` tag to the main layout or relevant page.
        *   Create a reusable React hook (`usePhylloConnect`) or service (`phylloConnectWebService.ts`) to encapsulate SDK initialization (`PhylloConnect.initialize`) and event handling.
    *   **Verification:** SDK script loads. Hook/service structure exists.
*   **Ticket X.2: `FEAT(FE): Implement Phyllo Connect Initialization & Launch`**
    *   **Goal:** Trigger the connection flow using existing backend endpoints.
    *   **Action:**
        *   In the component responsible for triggering the connection:
            *   Ensure the Justify user's Phyllo `user_id` is available (may require fetching user profile data that includes this ID, potentially retrieved after calling `/api/phyllo/create-user`).
            *   Call the **existing** Justify backend endpoint `POST /api/phyllo/sdk-token` to fetch the `sdk_token`.
            *   Use the fetched `sdk_token` and Phyllo `user_id` to initialize the SDK via the hook/service from Ticket X.1.
            *   Call the SDK's `open()` method to launch the Phyllo Connect UI.
    *   **Dependencies:** Existing `/api/phyllo/sdk-token` endpoint (verified in Ticket 0.14), Phyllo `user_id` available on FE, Ticket X.1.
    *   **Verification:** Phyllo Connect modal/popup launches successfully upon trigger.
*   **Ticket X.3: `FEAT(FE): Implement Phyllo Connect Callbacks & Backend Notification`**
    *   **Goal:** Handle the results of the connection attempt and notify the backend.
    *   **Action:**
        *   Implement handlers within the `usePhylloConnect` hook/service for SDK callbacks: `onAccountConnected`, `onAccountDisconnected`, `onTokenExpired`, `onExit`, `onConnectionFailure`.
        *   Update UI state based on callbacks (e.g., show success/error messages, close modal).
        *   **Crucially:** The `onAccountConnected` handler **MUST** notify the Justify backend that a new connection occurred (e.g., by calling a new dedicated backend API endpoint like `POST /api/phyllo/connections` or similar) so the backend can potentially trigger Phyllo webhooks or initial data syncs for that connection.
    *   **Dependencies:** Ticket X.1, potentially a new backend endpoint for connection notification.
    *   **Verification:** Callbacks are correctly handled. UI provides appropriate feedback. Backend is notified upon successful connection.

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
*   **Ticket 1.0:** Endpoint returns data matching contract. Includes `isPhylloVerified`, followers, platforms sourced from Phyllo (or indicates if fetch failed). Basic filtering works.
*   **Ticket 1.1:** Endpoint returns detailed data matching contract, including demographics and engagement metrics sourced from Phyllo.
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
*   **Ticket 0.12:** Backend service can successfully authenticate with Phyllo API.
*   **Ticket 0.13:** Keys are configured and usable by the `phylloService`.
*   **Ticket 0.14:** Endpoints are confirmed or updated to correctly create Phyllo users, generate SDK tokens with required products, and handle errors.
*   **Ticket X.1:** SDK script loads. Hook/service structure exists.
*   **Ticket X.2:** Phyllo Connect modal/popup launches successfully upon trigger.
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
| **Phyllo Data Freshness/Latency**         | Medium     | Medium | BE defines refresh strategy (webhooks+polling); Document latency expectations; Consider UI indicators for stale data if needed. |
| **Phyllo API Errors/Downtime**            | Medium     | High   | BE robust error handling (retries, logging); Define API contract for missing/stale data; FE graceful handling (Ticket 1.4, 2.1). |
| **Phyllo API Costs/Rate Limits**          | Medium     | High   | BE implements caching; Monitor usage dashboards; Alerting on high usage/cost.                                |
| **API Error Handling Gaps (FE/BE)**       | Medium     | High   | Define error categories; Consistent BE formats; Robust FE handling/display (Tickets 1.4, 2.1); Add checks to DoD. |