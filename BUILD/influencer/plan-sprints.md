Okay, as Scrum Master, with the detailed `plan.md` finalized and agreed upon, here are the immediate next steps to systematically break this down and get the development team mobilized:

1.  **Confirm Critical Prerequisite: API Contracts (Task Zero):**
    *   **Action:** ~~Immediately assign and prioritize **Ticket 0.5.1 (`CHORE(API): Define API Contracts (MVP)`)**.~~
    *   **Why:** ~~This is the absolute lynchpin for the parallel development strategy. Frontend and Backend teams *cannot* work effectively in parallel without a locked-in agreement on how they will communicate (the API request/response structure for `GET /influencers` and `GET /influencers/:id`).~~
    *   **Owner:** ~~Typically Backend Lead/Architect, with input and sign-off from Frontend Lead.~~
    *   **Timeline:** ~~Needs to be completed ASAP, ideally before the first Sprint officially starts or as the very first task within it.~~
    *   **Status:** **DONE**. Finalized contract documented in `/docs/api/influencer-marketplace.yaml` (or linked section in `plan.md`). **FE & BE Leads have formally accepted this contract.**

**Definition of Ready (DoR) for Tickets:**

Before a ticket from `plan.md` can be pulled into a Sprint Backlog, it should meet the following criteria:
*   **Clear Requirements:** The Goal and Action steps are understood by the team. Any `TODOs` affecting the ticket are resolved.
*   **Dependencies Resolved/Planned:** Any blocking UI component dependencies (from Dep Checks) or API contract dependencies are resolved or have clear CHORE tickets planned.
*   **Dependencies on *other teams/services*** (if any) identified and communication initiated.
*   **Verification Criteria Clear:** The team understands how to verify the ticket is complete.
*   **Estimation Feasible:** The team feels they have enough information to estimate the effort (if using estimation).

2.  **Prepare for Sprint 1 Planning: Backlog Refinement:**
    *   **Action:** Review **Phase 0 & Foundational Phase 1 tickets** from `plan.md` as primary candidates for the Sprint 1 Backlog. These enable the parallel streams:
        *   **Core Setup:**
            *   `0.1: CHORE: Create Core Directory Structure` ✅ **(Done)**
            *   `0.2: TYPE: Define InfluencerSummary Type (MVP)` ✅ **(Done)**
            *   `0.3: TYPE: Define InfluencerProfileData Type (MVP)` ✅ **(Done)**
            *   `0.4: TYPE: Extend DraftCampaignData in WizardContext` ✅ **(Done)**
            *   `0.5: DATA: Create Mock Influencer Data File` ✅ **(Done)**
            *   `0.9: CHORE: Implement Service Abstraction Layer` ✅ **(Done)**
            *   `0.10: CHORE(DB): Define Initial Database Indexes` ✅ **(Done)**
            *   `0.13: CHORE(Config): Setup Phyllo API Key Management` (Using Sandbox keys)
            *   *Note: Mock service implementation (0.6-0.8) serves primarily as a fallback during BE deployment delays or for isolated FE testing (e.g., Storybook), **not** as the primary development target. Frontend development (Ticket 1.4 onwards) MUST integrate with live dev/staging backend APIs ASAP.*
        *   **Backend Foundation (Sprint 1 Focus):**
            *   `0.11: BE-SETUP: Initialize Influencer DB Models & Basic API Routes` ✅ **(Done)**
            *   `0.12: BE-SETUP: Implement Phyllo Service Initial Connection` ✅ **(Done)**
            *   `0.13: CHORE(Config): Setup Phyllo API Key Management (Sandbox)` ✅ **(Done)**
            *   `0.14: CHORE(API): Verify Existing Phyllo User/Token Endpoints` ✅ **(Done)**
            *   `1.0: BE-FEAT: Implement GET /influencers v1 (Core Data + Phyllo Verification)` ✅ **(Done - Linter Issues Pending)**
            *   `1.1: BE-FEAT: Implement GET /influencers/:id v1 (Core Profile Data)` ✅ **(Done - Linter Issues Pending)**
            *   `1.9: BE-FEAT: Implement MVP Justify Score v1 Calculation` ✅ **(Done - Linter Issues Pending)**
        *   **Frontend Foundation (Sprint 1 Focus):**
            *   `0.1: CHORE: Create Core Directory Structure` ✅ **(Done)**
            *   `0.2: TYPE: Define InfluencerSummary Type (MVP)` ✅ **(Done)**
            *   `0.3: TYPE: Define InfluencerProfileData Type (MVP)` ✅ **(Done)**
            *   `0.4: TYPE: Extend DraftCampaignData in WizardContext` ✅ **(Done)**
            *   `0.5: DATA: Create Mock Influencer Data File` ✅ **(Done)**
            *   `0.9: CHORE: Implement Service Abstraction Layer` ✅ **(Done)**
            *   `1.2: FEAT(UI): Build InfluencerSummaryCard Component` ✅ **(Done)**
            *   `1.3: FEAT(UI): Setup Marketplace Page (`page.tsx`) & Initial State` ✅ **(Done)**
            *   `1.4: FEAT(FE): Implement Initial Data Fetching on Marketplace Page` (**Blocked by BE Ticket 1.0 Deployment**)
            *   `1.5: FEAT(UI): Create MarketplaceList Component` ✅ **(Done)**
    *   **Action:** **Clarify `TODOs` (Pre-Planning):** Resolve `TODOs` from Ticket 0.3 (incl. clarifying MVP fields) with Product Owner.
    *   **Action:** **Initiate UI Dependency Check (Pre-Planning):** Audit UI library (Ticket 1.2 Dep Check) and create `CHORE(UI)` tickets for gaps.
    *   **Action:** **Confirm Backend Task Details & Readiness (Pre-Planning):** Simultaneously, the Backend team confirms the details and their readiness to start on their prioritized Sprint 1 tickets (0.11, 0.12, 0.14, 1.0, 1.1, 1.9) based on finalized API contracts and sandbox credentials. **This includes verifying the required Phyllo `products` list in the existing `/api/phyllo/sdk-token` endpoint (part of Ticket 0.14).**

3.  **Facilitate Sprint 1 Planning Meeting:**
    *   **Goal:** Create the Sprint Backlog - the list of specific **FE and BE tickets** the team commits to completing in the first sprint to enable the initial integrated flow against the sandbox.
    *   **Sprint 1 Goal Suggestion:** *"Establish foundational FE/BE code structures, implement core Backend APIs connected to Phyllo Sandbox, and build initial Marketplace UI components ready for integration testing against live dev/staging endpoints."*
    *   **Process:**
        *   Present the updated `plan.md`, emphasizing the MVP goal, user value, **confirmed API contracts**, and the **parallel strategy using the sandbox**. Highlight the shift away from heavy mock data reliance.
        *   Discuss the refined list of candidate tickets (from Step 2 above) ensuring all meet the Definition of Ready (DoR).
        *   Explicitly discuss dependencies (e.g., FE data fetching depending on BE API deployment to dev/staging).
        *   Explicitly discuss and confirm understanding of the *integration points* and dependencies *between* selected FE and BE tickets within the Sprint.
        *   The **Development Team (FE & BE)** selects the amount of work they forecast they can complete, pulling tickets into their Sprint Backlog. Sub-tasking is encouraged.

4.  **Create Actionable Tickets in Project Management Tool:**
    *   **Action:** Transfer the tickets committed to in Sprint Planning from `plan.md` into your team's tool (Jira, Asana, etc.).
    *   **Details:** Ensure **all** relevant details are copied: Goal, Action Steps, Verification Criteria, Dependencies, and specific Notes (Integration Mandate, Data Source, Customer Focus, etc.). Link tickets back to `plan.md`.
    *   **Assignment:** Assign owners (FE/BE) to each ticket based on team discussion during planning.

5.  **Kick Off Sprint 1 & Facilitate:**
    *   **Action:** The team begins working on the tickets in the Sprint Backlog.
    *   **Scrum Master Role:**
        *   **Monitor API Contract Adherence:** Ensure both teams are strictly following the agreed contracts.
        *   **Facilitate Daily Standups:** Track progress on *both* FE and BE streams, proactively identify impediments or integration mismatches.
        *   **Verify Environment Readiness:** Confirm `dev` and/or `staging` environments are ready early for BE deployments and FE integration testing.
        *   **Protect MVP Scope:** Gently prevent scope creep beyond the defined MVP tickets.
        *   **Ensure Communication Flow:** Actively facilitate communication between FE and BE developers, especially around the deployment and consumption of the initial API endpoints (Tickets 1.0, 1.1).
        *   **Track Critical Path Dependencies:** Pay close attention to dependencies between FE and BE tickets, particularly the deployment of BE APIs needed for FE integration.

By following these steps, we move from the comprehensive `plan.md` to a concrete set of prioritized tasks for the development team's first sprint, ensuring alignment and addressing critical dependencies early for the accelerated strategy.

## Projected Sprint 2: Filtering, Profile UI & Continued Integration

*Goal Suggestion: Implement frontend filtering connected to the live dev API, build out the core Influencer Profile page UI consuming live dev data, and refine initial backend endpoints based on integration feedback.*

**Candidate Tickets (Review during Sprint 2 Planning):**
*   **Frontend Focus:**
    *   `1.6: FEAT(UI): Implement Marketplace Filters UI`
    *   `1.7: FEAT(FE): Connect Filters State & Actions`
    *   `1.8: FEAT(FE): Connect Apply Filters to Data Fetching` (Requires BE Ticket 1.0 to support filters)
    *   `2.1: FEAT: Setup Profile Page (`[id]/page.tsx`) & Data Fetching` (Connecting to BE Ticket 1.1)
    *   `2.2: FEAT(UI): Build Profile Header Component`
    *   `2.3: FEAT: Integrate Profile Header into Profile Page`
    *   `2.4: FEAT(UI): Build Profile Details Tabs/Sections (MVP)`
    *   `2.5: FEAT: Direct Influencer Contact Info Display (Elevated Priority)` (Requires BE support for `contactEmail` field)
    *   Any remaining/new `CHORE(UI)` tickets.
*   **Backend Focus:**
    *   Enhance `BE-TICKET 1.0 (GET /influencers)` to fully support filtering parameters defined in API Contract.
    *   Enhance `BE-TICKET 1.1 (GET /influencers/:id)` to source and include `contactEmail` (for FE Ticket 2.5).
    *   Refine Phyllo data fetching logic (error handling, caching) based on initial integration feedback.
    *   Bug fixes arising from Sprint 1 integration.
    *   Begin investigation/design for Phyllo Webhook handling strategy.
*   **Testing Focus:**
    *   Unit tests for new FE/BE logic.
    *   Initial E2E tests for basic Marketplace list rendering and navigation to profile (using live dev API).

## Projected Sprint 3: Wizard Integration & Core Testing

*Goal Suggestion: Fully integrate the Marketplace selection flow with the Campaign Wizard, implement the Wizard Review step display, and establish core E2E test coverage for the primary user journey.*

**Candidate Tickets (Review during Sprint 3 Planning):**
*   **Frontend Focus / Refactor:**
    *   `3.1: REFACTOR: Ensure WizardContext Stores Filter Criteria`
    *   `4.2: FEAT: Implement Navigation from Wizard to Marketplace` (Specific UI component in Wizard)
    *   `4.3: FEAT(FE): Pre-filter Marketplace Based on Wizard Context`
    *   `4.4: FEAT(UI): Implement "Add Selected to Campaign" Button Logic`
    *   `4.5: FEAT: Display Selected Influencers in Wizard Review Step` (Requires BE Ticket 0.8/Summaries API)
*   **Backend Focus:**
    *   Implement `GET /api/influencers/summaries` endpoint (or ensure `GET /influencers` can handle multiple IDs) if needed for Ticket 4.5.
    *   Ensure filtering logic in `GET /influencers` robustly handles criteria passed from Wizard context (Ticket 4.3).
    *   Continue refining Phyllo data refresh/webhook strategy.
    *   Address bugs identified during Sprint 2 testing.
*   **Testing Focus:**
    *   Implement core E2E test suite for the **Journey 1: Wizard-First** flow (Wizard -> Marketplace -> Select -> Review).
    *   Expand unit/integration test coverage for context interactions and API filtering logic.

## Projected Sprint 4: MVP Stabilization, Polish & Post-MVP Prep

*Goal Suggestion: Stabilize and polish the core Wizard-Marketplace MVP flow based on testing feedback, improve performance/robustness, and conduct initial backend investigation for high-priority Post-MVP features.*

**Candidate Tickets (Review during Sprint 4 Planning):**
*   **Frontend Focus:**
    *   UI Polish: Address minor layout/styling issues, improve loading states, enhance tooltips (e.g., Justify Score explanation).
    *   Accessibility improvements based on initial testing.
    *   Bug Fixes identified in Sprint 3 testing.
*   **Backend Focus:**
    *   Performance Tuning: Analyze and optimize database queries (indexes) and Phyllo API call caching based on observed performance.
    *   Robustness: Enhance error handling, particularly around Phyllo API interactions (staleness flags, more specific errors).
    *   Post-MVP Investigation: Begin technical design/investigation for high-priority items like Sponsored Post data sourcing (Ticket 5.2), Brand Safety API integration (Ticket 5.3), and potentially the Add to Existing Campaign API (backend part of Ticket 5.4).
    *   Bug Fixes identified in Sprint 3 testing.
*   **Testing Focus:**
    *   Expand E2E test coverage (edge cases, different filter combinations, error conditions).
    *   Perform more thorough manual QA across browsers/devices.
    *   Initiate basic performance testing.

---
