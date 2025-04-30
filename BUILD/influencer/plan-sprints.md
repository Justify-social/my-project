**--- PIVOT NOTE (2023-06-20) ---**
**Current Focus:** We are temporarily pausing the sprint progression outlined below to prioritize the critical refactoring required for the InsightIQ integration.
**Guidance:** The detailed technical steps for this refactoring phase are outlined in `BUILD/influencer/refactor-insight-iq.md`.
**Resumption:** Sprint planning and execution based on this document (`plan-sprints.md`) and the main `plan.md` will resume once the refactoring tasks (especially those blocked by InsightIQ documentation) are sufficiently addressed.
**Action Item:** Obtain `INSIGHTIQ_WEBHOOK_SECRET` from InsightIQ support (Needed for Task 3.4: Webhook Handler Refactoring).
**----------------------------------**

**--- DECOUPLING NOTE (2023-06-21) ---**
**Scope Adjustment:** Following the decoupling decision, the Marketplace will be developed standalone for the MVP. Tickets related to Wizard-Marketplace integration (original Phase 3: Tickets 4.2-4.5) are deferred post-MVP. Sprint goals and projections below are adjusted accordingly.
**----------------------------------**

Okay, as Scrum Master, with the detailed `plan.md` (now updated for **InsightIQ**) finalized and agreed upon, here are the immediate next steps to systematically break this down and get the development team mobilized:

1.  **Confirm Critical Prerequisite: API Contracts (Task Zero - REVISED FOR InsightIQ):**
    *   **Action:** ~~Immediately assign and prioritize **Ticket 0.5.1 (`CHORE(API): Define API Contracts (MVP)`)**.~~ **Revised Action:** Review available InsightIQ OpenAPI documentation (`openapi.v1.yml`) and **schedule FE/BE meeting to finalize and sign-off on Justify API contracts** (`GET /influencers`, `GET /influencers/:id`) based on it.
    *   **Why:** This remains a lynchpin. We cannot proceed with **stable** backend implementation or accurate frontend integration without agreed contracts based on InsightIQ's actual capabilities.
    *   **Owner:** FE Lead, BE Lead for sign-off.
    *   **Timeline:** ASAP.
    *   **Status:** **OpenAPI spec available (`openapi.v1.yml`), review & sign-off pending.**

**Definition of Ready (DoR) for Tickets:**

Before a ticket from `plan.md` can be pulled into a Sprint Backlog, it should meet the following criteria:
*   **Clear Requirements:** The Goal and Action steps are understood by the team. Any `TODOs` affecting the ticket are resolved.
*   **Dependencies Resolved/Planned:** Any blocking UI component dependencies (from Dep Checks) or API contract dependencies are resolved or have clear CHORE tickets planned.
*   **Dependencies on *other teams/services*** (if any) identified and communication initiated.
*   **Verification Criteria Clear:** The team understands how to verify the ticket is complete.
*   **Estimation Feasible:** The team feels they have enough information to estimate the effort (if using estimation).

2.  **Sprint 1 Progress & Next Steps (Updated 2025-04-30):**
    *   **Action:** Review **Phase 0 & Foundational Phase 1 tickets** from `plan.md` and the **refactoring tasks** from `insightiq.md`. **Wizard integration tickets (Phase 4 in plan.md) remain deferred.**
        *   **Core Setup & Refactoring (Largely Done):**
            *   `0.1: CHORE: Create Core Directory Structure` ✅
            *   `0.2: TYPE: Define InfluencerSummary Type (MVP)` ✅
            *   `0.3: TYPE: Define InfluencerProfileData Type (MVP)` ✅
            *   `0.4: TYPE: Extend DraftCampaignData in WizardContext` ✅ (Note: Wizard Integration Deferred)
            *   `0.9: CHORE: Implement Service Abstraction Layer` ✅
            *   Tasks 1.x, 2.1, 2.2, 3.1, 3.3, 7.1, 7.2, 7.3 from `insightiq.md` (Config, Renaming, Basic Service/Verifier) ✅
        *   **Backend Foundation (Focus on Direct InsightIQ Sandbox Integration - In Progress):**
            *   **(Refactored) Task 1.0/1.1 (`plan.md` based on InsightIQ): BE-FEAT: Implement GET /influencers & GET /influencers/:id routes:** 🚧 **(In Progress - Primary Focus)** - *Implement logic to fetch live data directly from InsightIQ Sandbox API (using `openapi.v1.yml`), map response to Justify types (`InfluencerSummary`, `InfluencerProfileData`), handle errors.*
            *   **(Refactored) Task 1.9 (`plan.md` based on InsightIQ): BE-FEAT: Adapt Justify Score Calculation (Use Live Data):** 🅿️ **(Blocked by 1.0/1.1)** - *Calculate score based on live InsightIQ response data within the API handlers.*
            *   **(NEW/Refactored) Task 3.4 (`insightiq.md`): Implement Webhook Handler structure & logic:** ❌ **(Blocked by InsightIQ Webhook Docs)**
        *   **Frontend Foundation (Standalone Marketplace Focus - Partially Ready for Integration):**
            *   `1.2: FEAT(UI): Build InfluencerSummaryCard Component` ✅
            *   `1.3: FEAT(UI): Setup Marketplace Page (`page.tsx`) & Initial State` ✅
            *   `1.4: FEAT(FE): Implement Initial Data Fetching on Marketplace Page` ✅ **(NOTE: Ready to connect to live BE)**
            *   `1.5: FEAT(UI): Create MarketplaceList Component` ✅ **(NOTE: Ready to render live BE data)**
            *   `1.6: FEAT(UI): Implement Marketplace Filters UI` ✅
            *   `1.7: FEAT(FE): Connect Filters State & Actions` ✅ **(NOTE: Ready to connect to live BE)**
            *   `1.8: FEAT(FE): Connect Apply Filters to Data Fetching` 🅿️ **(Blocked by BE API update)**
            *   `2.1: FEAT: Setup Profile Page (`[id]/page.tsx`) & Data Fetching` ✅ **(NOTE: Ready to connect to live BE)**
            *   `2.2: FEAT(UI): Build Profile Header Component` ✅
            *   `2.3: FEAT: Integrate Profile Header into Profile Page` ✅
            *   `2.4: FEAT(UI): Build Profile Details Tabs/Sections (MVP)` ✅
            *   `2.5: FEAT: Direct Influencer Contact Info Display (Elevated Priority)` 🅿️ **(Blocked by BE API update)**

    *   **Action:** **Clarify `TODOs`:** Resolve remaining `TODOs` from `plan.md` (e.g., Ticket 0.3) with Product Owner, considering InsightIQ data structure from OpenAPI spec.
    *   **Action:** **UI Dependency Check:** Ensure UI library (Ticket 1.2 Dep Check) gaps are addressed.
    *   **Action:** **Confirm Backend Task Readiness (Immediate Focus):** Backend team focuses on **completing the implementation of `GET /influencers` & `GET /influencers/:id`** using live InsightIQ Sandbox data and OpenAPI spec.

3.  **Sprint 1 Planning / In-Progress Focus (Updated for InsightIQ Sandbox):**
    *   **Goal:** Complete implementation of core backend API routes (`GET /influencers`, `GET /influencers/:id`) fetching and mapping **live data directly from the InsightIQ Sandbox API**. Connect frontend components (Marketplace List, Profile Page) to these live endpoints. Finalize and sign off on API contracts.
    *   **Sprint 1 Goal (Revised):** *\"Implement core backend API routes (`GET /influencers`, `GET /influencers/:id`) fetching and mapping live data directly from the InsightIQ Sandbox API using the available OpenAPI specification. Connect the standalone Marketplace List and Profile pages to these live endpoints, ensuring basic data display and error handling. Finalize and sign off on Justify API contracts based on InsightIQ OpenAPI spec.\"*\n    *   **Process:**\n        *   Prioritize BE tasks: **Ticket 1.0/1.1 (`plan.md`)** - Implement API logic using `insightiqService` and `openapi.v1.yml`.\n        *   Prioritize FE tasks: **Ticket 1.4, 1.8, 2.1** - Update data fetching logic to use live backend via `influencerService`. Wire up filters.\n        *   Prioritize Sign-off: **Ticket 0.5.1 / Step 1** - Review and finalize Justify API contracts.\n        *   Continue tracking **Action Item: Obtain Detailed InsightIQ Documentation** (Webhooks, SDK, Errors).\n

**(Sprint 2 onwards needs replanning based on progress & InsightIQ Documentation)**

---

### Immediate JIRA-Style Action Items (Sprint 1 Focus)

**Goal:** Achieve a stable end-to-end flow displaying live InsightIQ Sandbox data in the Marketplace List and Profile pages.

**Ticket ID:** SPRINT1-BE-01
**Title:** Implement Core Backend APIs with Live InsightIQ Sandbox Data
**Assignee/Team:** BE Team
**Status:** To Do
**Description:** Implement the core logic for `GET /api/influencers` and `GET /api/influencers/:id`. Use `insightiqService` to call relevant InsightIQ Sandbox endpoints (referencing `openapi.v1.yml`). Correctly map InsightIQ API responses to Justify types (`InfluencerSummary`, `InfluencerProfileData`). Implement basic error handling for InsightIQ calls. Implement basic filtering pass-through for the list endpoint if supported by InsightIQ API. Deploy functional endpoints to dev/staging.
**Acceptance Criteria:**
    - API routes return `200 OK` with correctly mapped data for valid requests to InsightIQ Sandbox.
    - API routes return appropriate error codes (e.g., 404, 503) if InsightIQ fetch fails or ID not found.
    - Basic filtering (if applicable) works.
    - Deployed to dev/staging.
**Dependencies:** `openapi.v1.yml`

**Ticket ID:** SPRINT1-LEAD-01
**Title:** Finalize & Sign-off on Justify API Contracts
**Assignee/Team:** FE Lead, BE Lead
**Status:** To Do
**Description:** Review the `openapi.v1.yml` specification. Schedule and hold a meeting to formally agree on the exact request/response schemas for the Justify backend APIs (`GET /api/influencers`, `GET /api/influencers/:id`) that the frontend will consume. Document the signed-off contract (can reference `openapi.v1.yml` with notes on Justify-specific mapping).
**Acceptance Criteria:**
    - Meeting held.
    - Final Justify API request/response schemas for core endpoints are agreed upon and documented/referenced.
    - Sign-off obtained from both leads.
**Dependencies:** `openapi.v1.yml`

**Ticket ID:** SPRINT1-FE-01
**Title:** Integrate Marketplace List/Filters with Live Backend API
**Assignee/Team:** FE Team
**Status:** Blocked
**Description:** Update `MarketplacePage` (`page.tsx`) and related components (`MarketplaceList`, `MarketplaceFilters`) to fetch data from the live `GET /api/influencers` backend endpoint via `influencerService`. Ensure live data renders correctly. Implement filter parameter passing to the backend API call. Handle loading and error states gracefully based on backend responses.
**Acceptance Criteria:**
    - Marketplace list displays live data from the backend/InsightIQ Sandbox.
    - Filtering UI correctly passes parameters to the backend API call and updates the list.
    - Loading and error states are handled correctly.
**Dependencies:** SPRINT1-BE-01 (API Implementation), SPRINT1-LEAD-01 (API Contract Sign-off)

**Ticket ID:** SPRINT1-FE-02
**Title:** Integrate Profile Page with Live Backend API
**Assignee/Team:** FE Team
**Status:** Blocked
**Description:** Update `ProfilePage` (`[id]/page.tsx`) and related components (`ProfileHeader`, profile sections) to fetch data from the live `GET /api/influencers/:id` backend endpoint via `influencerService`. Ensure all profile details (including contact info - Ticket 2.5) render correctly based on the live data and agreed contract. Handle loading and error states (e.g., influencer not found).
**Acceptance Criteria:**
    - Profile page displays live data for a valid ID from the backend/InsightIQ Sandbox.
    - Loading and error states (including 404 Not Found) are handled correctly.
**Dependencies:** SPRINT1-BE-01 (API Implementation), SPRINT1-LEAD-01 (API Contract Sign-off)

---

**Current Debugging Focus (2025-04-30 - RESOLVED & UPDATED):**
*   **Issue 1:** Profile page (`/influencer-marketplace/[id]`) rendered with excessive whitespace due to nested `ConditionalLayout`. **[✔ RESOLVED - Removed inner wrapper]**
*   **Issue 2:** API route (`/api/influencers/[id]`) threw error due to incorrect async `params` handling. **[✔ RESOLVED - Code updated & committed]**
*   **Issue 3:** Profile page showed "Influencer not found" error. Frontend calls `GET /api/influencers/:id`.
    *   **Root Cause Analysis:** Was likely caused by Issue 2 (API error preventing data fetch) or potentially the backend logic not correctly fetching/mapping from InsightIQ yet.
    *   **Current Status:** With Issue 2 resolved, the API route *should* function correctly if the backend implementation (fetching/mapping from InsightIQ Sandbox) is complete and the ID exists in the Sandbox.
*   **Next Steps (Focus shifts to Implementation & Integration):** Now tracked via JIRA-Style tickets above.
*   **Goal:** Achieve a stable end-to-end flow where the frontend successfully displays influencer list and profile data fetched live from the InsightIQ Sandbox via the Justify backend API.

**Data Freshness Approach Note:**

*   **Initial Phase (MVP/Sprint 1+ - REVISED SSOT Approach):** Data will be fetched **directly from the InsightIQ Sandbox API** via the Justify backend **on every request**. InsightIQ is the SSOT. No intermediate DB storage or mock data. Data is as fresh as InsightIQ provides. Performance depends on InsightIQ.
*   **Future Phase (Post-Docs):** Introduce database caching/storage and implement webhook handler (`Task 3.4` in `refactor-insight-iq.md`) for asynchronous data updates, improved performance, and resilience.

## Projected Sprint 2: Frontend Integration & UI Buildout (Requires BE APIs)

*Goal Suggestion: (Remains relevant) **Connect the frontend Marketplace and Profile pages to the live backend APIs** hitting the InsightIQ Sandbox. Implement data display, filtering logic (client-side or via BE pass-through), and complete core standalone Marketplace UI (Filters, Profile sections).*\n

**Candidate Tickets (REQUIRES Backend APIs from Sprint 1 - examples based on `plan.md` - standalone focus):**
*   **Critical Strategy:**
    *   `TECH-DEBT: Define & Plan InsightIQ Account ID Mapping Strategy` ❗
*   **Frontend Focus (Standalone Marketplace):**
    *   Complete `1.4: FEAT(FE): Implement Data Fetching` (Test against live BE)
    *   Complete `1.5: FEAT(UI): Create MarketplaceList Component` (Test rendering live BE data)
    *   Complete `1.6 - 1.8: FEAT: Wire up Filters UI to BE` (Implement filter passing to BE API call)
    *   Complete `2.1 - 2.5: FEAT: Build/Test Profile Page with BE Data` (Test against live BE)
*   **Backend Focus:**
    *   Support FE integration, fix bugs in API handlers (Modified 1.0, 1.1).
    *   Refine data mapping based on FE needs/testing and signed-off contracts.
    *   Implement basic filtering pass-through to InsightIQ API if supported & agreed in contracts.
*   **Backend Deferred (Pending Webhook Docs):**
    *   `Task 3.4 (\\`insightiq.md\\`): Implement Webhook Handler Logic & Testing for InsightIQ Events` ❗ **(CRITICAL)**
*   **Testing Focus:**
    *   Unit tests for FE components rendering live data structures.
    *   E2E tests for list/profile rendering *with live data from InsightIQ Sandbox via BE*.\\n

4.  **Create Actionable Tickets in Project Management Tool:**
    *   **Action:** Ensure tickets reflect the current priorities (BE API implementation, FE integration). Update statuses based on recent progress.
    *   **Details:** Clearly state dependencies on **signed-off API Contracts** and detailed **InsightIQ Docs**.
    *   **Assignment:** Assign owners.

5.  **Kick Off Sprint / Continue Sprint 1 & Facilitate:**
    *   **Action:** Team focuses on completing the **BE API implementation and FE integration** tasks.
    *   **Scrum Master Role:**
        *   **Facilitate Daily Standups:** Track progress on BE implementation & FE integration. **Continuously check status on obtaining detailed InsightIQ Docs.**
        *   **Verify Environment Readiness:** Ensure BE APIs are deployed to dev/staging for FE consumption.
        *   **Protect Scope:** Focus the team on the defined MVP integration tasks.
        *   **Track Blocker:** Elevate the need for detailed InsightIQ documentation daily.

**(Sprint 2 onwards needs complete replanning based on InsightIQ Documentation)**

## Projected Sprint 3: MVP Stabilization & Post-MVP Prep (Wizard Integration Deferred)

*Goal Suggestion: Stabilize and polish the core **standalone Marketplace MVP** flow based on testing feedback, improve performance/robustness, and conduct initial backend investigation for high-priority Post-MVP features based on InsightIQ.*

**Candidate Tickets (Review during Sprint 3 Planning):**
*   **Frontend Focus:**
    *   UI Polish (Marketplace & Profile)
    *   Accessibility improvements
    *   Bug Fixes
*   **Backend Focus:**
    *   Performance Tuning (InsightIQ API call caching - investigate options).
    *   Robustness (Refined InsightIQ error handling based on testing).
    *   Implement `contactEmail` strategy (Ticket 2.5).
    *   Post-MVP Investigation (Sponsored Posts, Brand Safety, **Wizard Integration**, Add to Campaign - based on InsightIQ equivalents).
    *   Bug Fixes.
*   **Testing Focus:**
    *   Expand E2E coverage for Marketplace flow.
    *   Manual QA.
    *   Performance testing (API response times).

**--- DEFERRED POST-MVP (Wizard Integration) ---**
*   ~~`3.1: REFACTOR: Ensure WizardContext Stores Filter Criteria`~~\\
*   ~~`4.2: FEAT: Implement Navigation from Wizard -> Marketplace`~~\\
*   ~~`4.3: FEAT(FE): Pre-filter Marketplace Based on Wizard Context`~~\\
*   ~~`4.4: FEAT(UI): Implement \\"Add Selected to Campaign\\" Button Logic`~~\\
*   ~~`4.5: FEAT: Display Selected Influencers in Wizard Review Step`~~\\
*   ~~Implement `GET /api/influencers/summaries` endpoint.~~\\
*   ~~Ensure filtering logic in `GET /influencers` handles Wizard context.~~\\
*   ~~Implement core E2E test suite for Journey 1 (Wizard -> Marketplace).~~\\

--(Remaining Sprint Projections adjusted for standalone MVP focus)--

## Projected Sprint 4: Advanced Data & Vetting (High Priority - Kelly P.)

*Goal Suggestion: Integrate critical post-MVP InsightIQ data points. Implement permissions & analytics.*

**Candidate Tickets (Review during Sprint 4 Planning):**
*   **Frontend Focus:**
    *   UI Polish
    *   Accessibility improvements
    *   Bug Fixes
*   **Backend Focus:**
    *   Performance Tuning (DB queries, InsightIQ API call caching).
    *   Robustness (InsightIQ error handling).
    *   Determine `contactEmail` strategy (based on InsightIQ).
    *   Post-MVP Investigation (Sponsored Posts, Brand Safety, Add to Campaign - based on InsightIQ equivalents).
    *   Bug Fixes.
*   **Testing Focus:**
    *   Expand E2E coverage.
    *   Manual QA.
    *   Performance testing.

## Projected Sprint 5: Workflow Enhancements & Alternative Journeys (Post-MVP Focus)

*Goal Suggestion: Enable the \"Marketplace-First\" journey, add shortlisting (using InsightIQ data). Implement permissions & analytics.*

**Candidate Tickets (Review during Sprint 5 Planning):**
*   `5.4: FEAT: Add to Existing Campaign Flow`
*   `5.7: FEAT: Influencer Shortlisting/Saving`
*   `5.6: FEAT: Collaboration History / Saturation Indicator (using InsightIQ data)`
*   (FE) Complete Phase X: InsightIQ Connect SDK Integration (if applicable).
*   (BE/FE) Permissions & analytics.
*   Bug Fixes.
*   (Testing) E2E tests for Journey 2.

## Projected Sprint 6: Advanced Insights & Refinement

*Goal Suggestion: Focus on higher-level insights (using InsightIQ data), technical debt, test coverage.*

**Candidate Tickets (Review during Sprint 6 Planning):**
*   `5.1: REFACTOR: Refine Contact Info Display/Source (based on InsightIQ)`
*   `5.5: FEAT: Content Effectiveness Insights (based on InsightIQ)`
*   `5.9: TECH-DEBT: Refactor Wizard/Marketplace State Coupling`.
*   Performance tuning, testing, tech debt.
*   (BE/FE) Permissions & analytics.
*   Bug Fixes.

## Projected Sprint 7: Deployment Readiness & Documentation Kickoff

*Goal Suggestion: Ensure MVP (InsightIQ based) is ready for deployment, finalize testing, initiate docs.*

**Candidate Tickets (Review during Sprint 7 Planning):**
*   `CHORE: Finalize Monitoring & Logging Configuration`
*   `CHORE: Verify CI/CD Pipeline for Production Deployment`
*   `CHORE: Document Rollback Procedures`
*   `DOCS: Draft Initial Technical Documentation (InsightIQ Integration)`
*   `DOCS: Outline User Guide Structure`
*   Critical Bug Fixes.

## Future Sprints (Sprint 8+): Freemium Implementation & Full Documentation

*Goal Suggestion: Implement Freemium model, complete documentation.*

**Candidate Areas (Details TBD closer to phase):**
*   Feature Access Manager.
*   Plan Comparison UI.
*   Billing system integration.
*   Complete User Guides & Tech Docs.
*   Bug fixing & refinement.

---
