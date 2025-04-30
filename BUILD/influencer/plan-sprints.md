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
    *   **Action:** ~~Immediately assign and prioritize **Ticket 0.5.1 (`CHORE(API): Define API Contracts (MVP)`)**.~~ **Revised Action:** Prioritize obtaining **InsightIQ API Documentation** and then define/confirm API contracts based on it.
    *   **Why:** This remains the lynchpin. We cannot proceed with backend implementation or accurate frontend integration without knowing InsightIQ's specific endpoints and data structures.
    *   **Owner:** Backend Lead/Architect (for drafting based on docs), FE/BE Leads for sign-off.
    *   **Timeline:** ASAP after InsightIQ docs are available.
    *   **Status:** **Pending InsightIQ Documentation.**

**Definition of Ready (DoR) for Tickets:**

Before a ticket from `plan.md` can be pulled into a Sprint Backlog, it should meet the following criteria:
*   **Clear Requirements:** The Goal and Action steps are understood by the team. Any `TODOs` affecting the ticket are resolved.
*   **Dependencies Resolved/Planned:** Any blocking UI component dependencies (from Dep Checks) or API contract dependencies are resolved or have clear CHORE tickets planned.
*   **Dependencies on *other teams/services*** (if any) identified and communication initiated.
*   **Verification Criteria Clear:** The team understands how to verify the ticket is complete.
*   **Estimation Feasible:** The team feels they have enough information to estimate the effort (if using estimation).

2.  **Prepare for Sprint 1 Planning: Backlog Refinement (Updated for InsightIQ & Decoupling):**
    *   **Action:** Review **Phase 0 & Foundational Phase 1 tickets** from `plan.md` as primary candidates, **adapting them for the InsightIQ refactoring tasks** outlined in `insightiq.md`. **Wizard integration tickets (Phase 4 in plan.md) are deferred.**
        *   **Core Setup (Largely Done, Configuration needs update):**
            *   `0.1: CHORE: Create Core Directory Structure` ✅
            *   `0.2: TYPE: Define InfluencerSummary Type (MVP)` ✅ **(NOTE: Map directly from InsightIQ response)**
            *   `0.3: TYPE: Define InfluencerProfileData Type (MVP)` ✅ **(NOTE: Map directly from InsightIQ response)**
            *   `0.4: TYPE: Extend DraftCampaignData in WizardContext` ✅
            *   `0.9: CHORE: Implement Service Abstraction Layer` ✅ **(MODIFIED - No Mock Logic)**
            *   **(NEW/Refactored) Task 1.3 (`insightiq.md`): Add InsightIQ Env Vars`** 🅿️
            *   **(NEW/Refactored) Task 1.4 (`insightiq.md`): Update server-config.ts for InsightIQ`** 🅿️
            *   **(Refactored) Task 1.1/1.2 (`insightiq.md`): Remove old Phyllo Env Vars/Config`** 🅿️
        *   **Backend Foundation (Focus on Direct InsightIQ Integration - Partially Blocked):**
            *   **(NEW/Refactored) Task 2.1 (`insightiq.md`): Rename phylloService.ts -> insightiqService.ts`** 🅿️
            *   **(NEW/Refactored) Task 2.2 (`insightiq.md`): Adapt service request wrapper for InsightIQ Auth/URL`** 🅿️
            *   **(Refactored) Task 0.12 (`plan.md`) -> BE-SETUP: Implement InsightIQ Service Initial Connection:** 🅿️ **(Blocked by Docs)** - *Cannot verify connection without knowing endpoints.*
            *   **(Refactored) Task 0.14 (`plan.md`) -> CHORE(API): Refactor Connection Endpoints for InsightIQ:** 🅿️ **(Blocked by Docs)** - *Need to know InsightIQ flow.*
            *   **(Refactored) Task 1.0/1.1 (`plan.md` based on InsightIQ): BE-FEAT: Implement GET /influencers & GET /influencers/:id routes (Fetch Directly from InsightIQ):** 🅿️ **(Blocked by Docs & Service Layer)** - *Fetch live from InsightIQ, map response.*
            *   **(Refactored) Task 1.9 (`plan.md` based on InsightIQ): BE-FEAT: Adapt Justify Score Calculation (Use Live Data):** 🅿️ **(Blocked by Docs)** - *Calculate based on live InsightIQ response.*
            *   **(NEW/Refactored) Task 3.3 (`insightiq.md`): Rename Webhook Handler file/path`** 🅿️
            *   **(NEW/Refactored) Task 3.4 (`insightiq.md`): Adapt Webhook Handler structure:** ⏳ **(Placeholder exists, logic Blocked by Docs)**
        *   **Frontend Foundation (Standalone Marketplace Focus):**
            *   `1.2: FEAT(UI): Build InfluencerSummaryCard Component` ✅ **(NOTE: Connects to live BE data via service)**
            *   `1.3: FEAT(UI): Setup Marketplace Page (`page.tsx`) & Initial State` ✅
            *   `1.4: FEAT(FE): Implement Initial Data Fetching on Marketplace Page` ✅ **(NOTE: Calls live BE data via service)**
            *   `1.5: FEAT(UI): Create MarketplaceList Component` ✅ **(NOTE: Renders live BE data)**
            *   `1.6: FEAT(UI): Implement Marketplace Filters UI` 🅿️
            *   `1.7: FEAT(FE): Connect Filters State & Actions` ��️
            *   `1.8: FEAT(FE): Connect Apply Filters to Data Fetching` 🅿️
            *   `2.1: FEAT: Setup Profile Page (`[id]/page.tsx`) & Data Fetching` 🅿️
            *   `2.2: FEAT(UI): Build Profile Header Component` 🅿️
            *   `2.3: FEAT: Integrate Profile Header into Profile Page` 🅿️
            *   `2.4: FEAT(UI): Build Profile Details Tabs/Sections (MVP)` 🅿️
            *   `2.5: FEAT: Direct Influencer Contact Info Display (Elevated Priority)` 🅿️

    *   **Action:** **Clarify `TODOs`:** Resolve `TODOs` from `plan.md` (e.g., Ticket 0.3) with Product Owner, considering potential InsightIQ data differences.
    *   **Action:** **Initiate UI Dependency Check:** Audit UI library (Ticket 1.2 Dep Check) and create `CHORE(UI)` tickets for gaps.
    *   **Action:** **Confirm Backend Task Details & Readiness (Pre-Planning - REVISED):** Backend team focuses on **preparatory refactoring tasks** (Config, Service rename/wrapper, Route renames) that *can* be done before docs arrive. **Primary blocker is InsightIQ documentation.**

3.  **Facilitate Sprint 1 Planning Meeting (Focus on Refactoring Prep & Unblocking):**
    *   **Goal:** Create the Sprint Backlog for the initial **InsightIQ refactoring phase & standalone Marketplace UI foundations.**
    *   **Sprint 1 Goal Suggestion (Revised for SSOT & Refactoring):** *\"Complete preparatory refactoring for InsightIQ migration: update configurations, rename/adapt service layer and API route structures, remove deprecated Phyllo code. **Implement core backend API routes (`GET /influencers`, `GET /influencers/:id`) to fetch and map live data directly from the InsightIQ Sandbox API**, pending documentation arrival for specific endpoints/filters. Begin building core standalone Marketplace UI elements (List, Card, Page Setup) ready for integration.\"*\n    *   **Process:**\n        *   Present the **updated `plan.md`**, the **`insightiq.md` refactoring roadmap**, and the **Decoupling decision**.\n        *   Discuss the candidate tickets for this preparatory refactoring (Tasks 1.x, 2.1, 2.2, 3.1, 3.3, 7.1 from `insightiq.md`) **AND the core backend API implementation tickets (Modified 1.0, 1.1)**. Ensure DoR is met for these *preparatory* and *initial implementation* tasks.\n        *   Explicitly track the **Action Item: Obtain InsightIQ Documentation**. (Crucial for Webhook Implementation & Endpoint Details)\n        *   Team selects preparatory refactoring work **and initial BE API implementation** for the Sprint Backlog.\n

**(Sprint 2 onwards needs complete replanning based on InsightIQ Documentation)**

**Current Debugging Focus (2025-04-30 - Updated for Profile Page Issue):**
*   **Issue:** Profile page (`/influencer-marketplace/[id]`) shows "Influencer not found" error. Frontend calls `GET /api/influencers/:id` and receives a 404 response.
*   **Root Cause:** Backend API handler (`src/app/api/influencers/[id]/route.ts`) is failing to retrieve or correctly process data for the requested ID **directly from the InsightIQ Sandbox API**.
*   **Suspected Reasons:**
    1.  The specific Influencer ID does not exist in the targeted InsightIQ Sandbox environment.
    2.  Error within `insightiqService` when calling the relevant InsightIQ Sandbox API endpoint (e.g., incorrect endpoint, auth failure, network issue).
    3.  Bug in the backend API handler's logic after successfully fetching from InsightIQ (e.g., incorrect data mapping leading to false 'not found' conclusion).
    4.  Secondary code issue: Incorrect synchronous access to `params.id` in the route handler.
*   **Next Steps (Backend Priority):**
    1.  **Investigate `src/app/api/influencers/[id]/route.ts`:**
        *   Verify the exact call to `insightiqService` (e.g., `getInsightIQProfileById`).
        *   Add detailed logging for the *raw response* received from `insightiqService` (or errors caught).
        *   Trace the logic after the `insightiqService` call to see how the 404 response is triggered.
    2.  **Verify InsightIQ Sandbox:** Confirm if the target ID (`40cdf17c-...`) is expected to exist in the Sandbox environment being used.
    3.  **Fix `params.id` Access:** Correct the function signature to `({ params }: { params: { id: string } })`.
*   **Goal:** Ensure the backend API route `GET /api/influencers/:id` successfully fetches data directly from the InsightIQ Sandbox for valid IDs and returns it correctly mapped, or returns an appropriate error if the ID is genuinely not found in InsightIQ.

**Data Freshness Approach Note:**

*   **Initial Phase (MVP/Sprint 1+ - REVISED SSOT Approach):** Data will be fetched **directly from the InsightIQ Sandbox API** via the Justify backend **on every request**. InsightIQ is the SSOT. No intermediate DB storage or mock data. Data is as fresh as InsightIQ provides. Performance depends on InsightIQ.
*   **Future Phase (Post-Docs):** Introduce database caching/storage and implement webhook handler (`Task 3.4` in `refactor-insight-iq.md`) for asynchronous data updates, improved performance, and resilience.

## Projected Sprint 2: Frontend Integration & UI Buildout (Requires BE APIs)

*Goal Suggestion: **Connect the frontend Marketplace and Profile pages to the live backend APIs** hitting the InsightIQ Sandbox. Implement data display, filtering logic (client-side or via BE pass-through), and complete core standalone Marketplace UI (Filters, Profile sections).*\n

**Candidate Tickets (REQUIRES Backend APIs from Sprint 1 - examples based on `plan.md` - standalone focus):**
*   **Critical Strategy:**
    *   `TECH-DEBT: Define & Plan InsightIQ Account ID Mapping Strategy` ❗
*   **Frontend Focus (Standalone Marketplace):**
    *   Complete `1.4: FEAT(FE): Implement Data Fetching` (Connect to live BE)
    *   Complete `1.5: FEAT(UI): Create MarketplaceList Component` (Render live BE data)
    *   Complete `1.6 - 1.8: FEAT: Wire up Filters UI to BE` (Pass filters to BE API call)
    *   Complete `2.1 - 2.5: FEAT: Build/Test Profile Page with BE Data` (Connect to live BE)
*   **Backend Focus:**
    *   Support FE integration, fix bugs in API handlers (Modified 1.0, 1.1).
    *   Refine data mapping based on FE needs/testing.
    *   Implement basic filtering pass-through to InsightIQ API if supported.
*   **Backend Deferred (Pending Webhook Docs):**
    *   `Task 3.4 (\`insightiq.md\`): Implement Webhook Handler Logic & Testing for InsightIQ Events` ❗ **(CRITICAL)**
*   **Testing Focus:**
    *   Unit tests for FE components rendering live data structures.
    *   E2E tests for list/profile rendering *with live data from InsightIQ Sandbox via BE*.\n

4.  **Create Actionable Tickets in Project Management Tool:**
    *   **Action:** Transfer the **preparatory refactoring tickets and core backend API tickets** committed to in Sprint Planning from `insightiq.md` and `plan.md` into your team's tool.
    *   **Details:** Copy relevant details. Clearly state dependencies on InsightIQ Docs for functional implementation tickets.
    *   **Assignment:** Assign owners.

5.  **Kick Off Sprint 1 & Facilitate (Refactoring Focus):**
    *   **Action:** The team begins working on the **preparatory refactoring** tickets.
    *   **Scrum Master Role:**
        *   **Facilitate Daily Standups:** Track progress on refactoring. **Continuously check status on obtaining InsightIQ Docs.**
        *   **Verify Environment Readiness:** Ensure config changes are applied correctly to dev/staging environments.
        *   **Protect Scope:** Focus the team on the defined refactoring tasks, avoid premature implementation based on assumptions.
        *   **Track Blocker:** Elevate the need for InsightIQ documentation daily.

**(Sprint 2 onwards needs complete replanning based on InsightIQ Documentation)**

## Projected Sprint 3: MVP Stabilization & Post-MVP Prep (Wizard Integration Deferred)

*Goal Suggestion: Stabilize and polish the core **standalone Marketplace MVP** flow based on testing feedback, improve performance/robustness, and conduct initial backend investigation for high-priority Post-MVP features based on InsightIQ.* 

**Candidate Tickets (Review during Sprint 3 Planning):**
*   **Frontend Focus:**
    *   UI Polish (Marketplace & Profile)
    *   Accessibility improvements
    *   Bug Fixes
*   **Backend Focus:**
    *   Performance Tuning (DB queries, InsightIQ API call caching).
    *   Robustness (InsightIQ error handling).
    *   Determine `contactEmail` strategy (based on InsightIQ).
    *   Post-MVP Investigation (Sponsored Posts, Brand Safety, **Wizard Integration**, Add to Campaign - based on InsightIQ equivalents).
    *   Bug Fixes.
*   **Testing Focus:**
    *   Expand E2E coverage for Marketplace flow.
    *   Manual QA.
    *   Performance testing.

**--- DEFERRED POST-MVP (Wizard Integration) ---**
*   ~~`3.1: REFACTOR: Ensure WizardContext Stores Filter Criteria`~~\
*   ~~`4.2: FEAT: Implement Navigation from Wizard -> Marketplace`~~\
*   ~~`4.3: FEAT(FE): Pre-filter Marketplace Based on Wizard Context`~~\
*   ~~`4.4: FEAT(UI): Implement \"Add Selected to Campaign\" Button Logic`~~\
*   ~~`4.5: FEAT: Display Selected Influencers in Wizard Review Step`~~\
*   ~~Implement `GET /api/influencers/summaries` endpoint.~~\
*   ~~Ensure filtering logic in `GET /influencers` handles Wizard context.~~\
*   ~~Implement core E2E test suite for Journey 1 (Wizard -> Marketplace).~~\

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

*Goal Suggestion: Enable the "Marketplace-First" journey, add shortlisting (using InsightIQ data). Implement permissions & analytics.*

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
