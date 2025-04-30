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
            *   `0.2: TYPE: Define InfluencerSummary Type (MVP)` ✅ **(NOTE: May need revision based on InsightIQ data fields)**
            *   `0.3: TYPE: Define InfluencerProfileData Type (MVP)` ✅ **(NOTE: May need revision based on InsightIQ data fields)**
            *   `0.4: TYPE: Extend DraftCampaignData in WizardContext` ✅
            *   `0.5: DATA: Create Mock Influencer Data File` ✅ **(NOTE: Mock data structure may need update based on InsightIQ)**
            *   `0.9: CHORE: Implement Service Abstraction Layer` ✅
            *   `0.10: CHORE(DB): Define Initial Database Indexes` ✅
            *   **(NEW/Refactored) Task 1.3 (`insightiq.md`): Add InsightIQ Env Vars`** 🅿️
            *   **(NEW/Refactored) Task 1.4 (`insightiq.md`): Update server-config.ts for InsightIQ`** 🅿️
            *   **(Refactored) Task 1.1/1.2 (`insightiq.md`): Remove old Phyllo Env Vars/Config`** 🅿️
        *   **Backend Foundation (Focus on Refactoring Setup - Partially Blocked):**
            *   `0.11: BE-SETUP: Initialize Influencer DB Models & Basic API Routes` ✅ **(Existing structure usable)**
            *   **(NEW/Refactored) Task 2.1 (`insightiq.md`): Rename phylloService.ts -> insightiqService.ts`** 🅿️
            *   **(NEW/Refactored) Task 2.2 (`insightiq.md`): Adapt service request wrapper for InsightIQ Auth/URL`** 🅿️
            *   **(Refactored) Task 0.12 (`plan.md`) -> BE-SETUP: Implement InsightIQ Service Initial Connection:** 🅿️ **(Blocked by Docs)** - *Cannot verify connection without knowing endpoints.*
            *   **(Refactored) Task 0.14 (`plan.md`) -> CHORE(API): Refactor Connection Endpoints for InsightIQ:** 🅿️ **(Blocked by Docs)** - *Need to know InsightIQ flow.* 
            *   **(Refactored) Task 1.0/1.1 (`plan.md` based on InsightIQ): BE-FEAT: Stub/Update GET /influencers & GET /influencers/:id routes:** 🅿️ **(Blocked by Docs & Service Layer)** - *Cannot implement real logic.* Update to import `insightiqService`.
            *   **(Refactored) Task 1.9 (`plan.md` based on InsightIQ): BE-FEAT: Adapt Justify Score Calculation:** 🅿️ **(Blocked by Docs)** - *Need InsightIQ field mapping.*
            *   **(NEW/Refactored) Task 3.3 (`insightiq.md`): Rename Webhook Handler file/path`** 🅿️
            *   **(NEW/Refactored) Task 3.4 (`insightiq.md`): Adapt Webhook Handler structure:** ⏳ **(Placeholder exists, logic Blocked by Docs)**
        *   **Frontend Foundation (Standalone Marketplace Focus):**
            *   `1.2: FEAT(UI): Build InfluencerSummaryCard Component` ✅ **(NOTE: Data mapping needs update for InsightIQ)**
            *   `1.3: FEAT(UI): Setup Marketplace Page (`page.tsx`) & Initial State` ✅
            *   `1.4: FEAT(FE): Implement Initial Data Fetching on Marketplace Page` ✅ **(NOTE: Will fetch empty/error until BE is ready)**
            *   `1.5: FEAT(UI): Create MarketplaceList Component` ✅ **(NOTE: Shows empty state)**
            *   `1.6: FEAT(UI): Implement Marketplace Filters UI` 🅿️
            *   `1.7: FEAT(FE): Connect Filters State & Actions` 🅿️
            *   `1.8: FEAT(FE): Connect Apply Filters to Data Fetching` 🅿️
            *   `2.1: FEAT: Setup Profile Page (`[id]/page.tsx`) & Data Fetching` 🅿️
            *   `2.2: FEAT(UI): Build Profile Header Component` 🅿️
            *   `2.3: FEAT: Integrate Profile Header into Profile Page` 🅿️
            *   `2.4: FEAT(UI): Build Profile Details Tabs/Sections (MVP)` ��️
            *   `2.5: FEAT: Direct Influencer Contact Info Display (Elevated Priority)` 🅿️

    *   **Action:** **Clarify `TODOs`:** Resolve `TODOs` from `plan.md` (e.g., Ticket 0.3) with Product Owner, considering potential InsightIQ data differences.
    *   **Action:** **Initiate UI Dependency Check:** Audit UI library (Ticket 1.2 Dep Check) and create `CHORE(UI)` tickets for gaps.
    *   **Action:** **Confirm Backend Task Details & Readiness (Pre-Planning - REVISED):** Backend team focuses on **preparatory refactoring tasks** (Config, Service rename/wrapper, Route renames) that *can* be done before docs arrive. **Primary blocker is InsightIQ documentation.**

3.  **Facilitate Sprint 1 Planning Meeting (Focus on Refactoring Prep & Unblocking):**
    *   **Goal:** Create the Sprint Backlog for the initial **InsightIQ refactoring phase & standalone Marketplace UI foundations.**
    *   **Sprint 1 Goal Suggestion (Revised for Refactoring & Decoupling):** *\"Complete preparatory refactoring for InsightIQ migration: update configurations, rename/adapt service layer and API route structures, remove deprecated Phyllo code, and establish placeholder structures for InsightIQ integration, pending documentation arrival. Begin building core standalone Marketplace UI elements (List, Card, Filters).\"*\n    *   **Process:**\n        *   Present the **updated `plan.md`**, the **`insightiq.md` refactoring roadmap**, and the **Decoupling decision**.\n        *   Discuss the candidate tickets for this preparatory refactoring (Tasks 1.x, 2.1, 2.2, 3.1, 3.3, 7.1 from `insightiq.md`). Ensure DoR is met for these *preparatory* tasks.\n        *   Explicitly track the **Action Item: Obtain InsightIQ Documentation**. (Crucial for Webhook Implementation)\n        *   Team selects preparatory refactoring work for the Sprint Backlog.\n\n**(Sprint 2 onwards needs complete replanning based on InsightIQ Documentation)**\n\n**Data Freshness Approach Note:**\n\n*   **Initial Phase (MVP/Sprint 2+):** Data will be fetched directly via InsightIQ APIs when needed (Marketplace load, Profile view). This means data **may become stale** between user visits as **webhook processing is deferred** due to missing detailed documentation (event types, payloads, signature verification) from InsightIQ.\n*   **Future Phase (Post-Docs):** Once detailed webhook documentation is available, implement the webhook handler (`Task 3.4` in `refactor-insight-iq.md`) to enable asynchronous data updates for improved freshness and efficiency.\n\n## Projected Sprint 2: InsightIQ Integration Begins (Requires Docs)\n\n*Goal Suggestion: Implement core InsightIQ API calls within the service layer, populate initial data via **direct API calls**, connect backend APIs to frontend, and begin displaying basic data **in the standalone Marketplace & Profile pages.** Complete core Marketplace UI (Filters, Profile sections).*\n\n**Candidate Tickets (REQUIRES INSIGHTIQ DOCS - examples based on `insightiq.md` & `plan.md` - standalone focus):**\n*   **Critical Strategy:**\n    *   `TECH-DEBT: Define & Plan InsightIQ Account ID Mapping Strategy` ❗\n*   **Frontend Focus (Standalone Marketplace):**\n    *   Complete `1.6 - 1.8: FEAT: Wire up Filters UI to BE`\n    *   Complete `2.1 - 2.5: FEAT: Build/Test Profile Page with BE Data`\n*   **Backend Focus:**\n    *   `Task 2.3 (\`insightiq.md\`): Implement functional InsightIQ service calls (getIdentity, getAnalytics, etc.)` ❗ **(CRITICAL)**\n    *   `Task 3.5 (\`insightiq.md\`): Implement data mapping in GET /influencers & GET /influencers/:id` ❗ **(CRITICAL)**\n    *   Enhance endpoints for filtering/contactEmail (using InsightIQ data).\n*   **Backend Deferred (Pending Webhook Docs):**\n    *   `Task 3.4 (\`insightiq.md\`): Implement Webhook Handler Logic & Testing for InsightIQ Events` ❗ **(CRITICAL)**\n*   **Testing Focus:**\n    *   Unit tests for InsightIQ service calls & **API endpoint logic**.\n    *   E2E tests for list/profile rendering *with data*.\n

4.  **Create Actionable Tickets in Project Management Tool:**
    *   **Action:** Transfer the **preparatory refactoring tickets** committed to in Sprint Planning from `insightiq.md` (and potentially `plan.md` chores) into your team's tool.
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

**Current Debugging Focus (2025-04-30 - Updated):**
*   **Issue:** Frontend (`/influencer-marketplace`) successfully fetches from the backend (`/api/influencers`) but receives an empty list (`Found 0 influencers`).
*   **Hypothesis:** The backend route handler for `/api/influencers` is either not implemented correctly, not calling the appropriate InsightIQ endpoint, not using the sandbox environment, or failing to map the response.
*   **Next Steps (Backend Priority):**
    1.  **Verify `/api/influencers` Handler:** Ensure it targets the **InsightIQ Sandbox URL**.
    2.  **Target Correct Endpoint:** Modify the handler to call `GET /v1/profiles` on the InsightIQ sandbox API.
    3.  **Log Raw Response:** Add detailed logging within the backend handler to output the *exact* JSON response received from the InsightIQ `GET /v1/profiles` call.
    4.  **Implement Mapping:** Ensure the handler correctly maps the fields from the InsightIQ `Profile` objects in the response array to the Justify `InfluencerSummary` type required by the frontend.
    5.  **Return Data:** Send the mapped `influencers` array back to the frontend.
*   **Goal:** Display *any* influencer profiles returned by the InsightIQ sandbox `GET /v1/profiles` endpoint in the Marketplace UI list.

**Data Freshness Approach Note:**

*   **Initial Phase (MVP/Sprint 2+):** Data will be fetched directly via InsightIQ APIs when needed (Marketplace load, Profile view). This means data **may become stale** between user visits as **webhook processing is deferred** due to missing detailed documentation (event types, payloads, signature verification) from InsightIQ.
*   **Future Phase (Post-Docs):** Once detailed webhook documentation is available, implement the webhook handler (`Task 3.4` in `refactor-insight-iq.md`) to enable asynchronous data updates for improved freshness and efficiency.

## Projected Sprint 2: InsightIQ Integration Begins (Requires Docs)

*Goal Suggestion: Implement core InsightIQ API calls within the service layer, populate initial data via **direct API calls**, connect backend APIs to frontend, and begin displaying basic data **in the standalone Marketplace & Profile pages.** Complete core Marketplace UI (Filters, Profile sections).* 

**Candidate Tickets (REQUIRES INSIGHTIQ DOCS - examples based on `insightiq.md` & `plan.md` - standalone focus):**
*   **Critical Strategy:**
    *   `TECH-DEBT: Define & Plan InsightIQ Account ID Mapping Strategy` ❗
*   **Frontend Focus (Standalone Marketplace):**
    *   Complete `1.6 - 1.8: FEAT: Wire up Filters UI to BE`
    *   Complete `2.1 - 2.5: FEAT: Build/Test Profile Page with BE Data`
*   **Backend Focus:**
    *   `Task 2.3 (\`insightiq.md\`): Implement functional InsightIQ service calls (getIdentity, getAnalytics, etc.)` ❗ **(CRITICAL)**
    *   `Task 3.5 (\`insightiq.md\`): Implement data mapping in GET /influencers & GET /influencers/:id` ❗ **(CRITICAL)**
    *   Enhance endpoints for filtering/contactEmail (using InsightIQ data).
*   **Backend Deferred (Pending Webhook Docs):**
    *   `Task 3.4 (\`insightiq.md\`): Implement Webhook Handler Logic & Testing for InsightIQ Events` ❗ **(CRITICAL)**
*   **Testing Focus:**
    *   Unit tests for InsightIQ service calls & **API endpoint logic**.
    *   E2E tests for list/profile rendering *with data*.

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
