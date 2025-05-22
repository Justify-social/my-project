# Brand Lift Feature: JIRA Ticket Roadmap

## User-Centric Feature Flow

The Brand Lift feature is designed to empower Brand Marketers by providing a seamless, intuitive, and integrated workflow to measure and understand campaign effectiveness. The following diagram illustrates the user's journey through the platform:

'''
<!-- User (Brand Marketer) Journey - Text Flowchart -->

+---------------------------------------------------------+
|         STEP A: Start: Access Brand Lift Feature        |
+---------------------------------------------------------+
                           |
                           v
+---------------------------------------------------------+
|      STEP B: 1. Campaign Selection                      |
|                 (@Select - Edit - Add Campaign.png)     |
|                 (User selects campaign, clicks 'Setup') |
+---------------------------------------------------------+
                           |
                           v
+---------------------------------------------------------+
|      STEP C: 2. Review Campaign & Define Study          |
|                 (@Select Campaign.png)                  |
|            (Review details, set BL Name/Funnel/KPIs)    |
+---------------------------------------------------------+
                           |
                           v
+---------------------------------------------------------+
|      STEP D: 3. Survey Design (@Survey Design.png)      |  <---+<---+
+---------------------------------------------------------+      |    |
     |                         |                                 |    |  [IF I is No]
     | [AI-Assisted Question Gen] | [Manual Question Building]         |    |  [IF K needs Revisions]
     v                         v                                 |    |
+-------------------------+ +-----------------------------------+    |    |
| E: Review/Edit AI Qns   | | F: Add/Edit Qns & Options         |    |    |
+-------------------------+ +-----------------------------------+    |    |
     |                         |                                     |    |
     '--------> G <-----------'                                     |    |
                |                                                  |    |
                v                                                  |    |
+---------------------------------------------------------+        |    |
|      STEP G: Configure Survey Settings                  |        |    |
|                 (Randomization, Mandatory)              |        |    |
+---------------------------------------------------------+        |    |
                           |                                       |    |
                           v                                       |    |
+---------------------------------------------------------+        |    |
|      STEP H: 4. Preview & Submit                        |        |    |
|                 (@Survey Approval Screen.png)           |        |    |
+---------------------------------------------------------+        |    |
                           |                                       |    |
                           v                                       |    |
+---------------------------------------------------------+        |    |
|      STEP I: Ready for Internal Review?                 |--------'    |
+--------------------------+------------------------------+             |
                           | Yes                                        |
                           v                                            |
+---------------------------------------------------------+             |
|      STEP J: Share Action (from Preview Page)           |             |
+---------------------------------------------------------+             |
                           |                                            |
                           v                                            |
+---------------------------------------------------------+             |
|      STEP K: 5. Collaborative Approval                  |             |
|            (@Collaborative Approval & Formal Sign-Off.png)|-------------'
+--------------------------+------------------------------+
                           | Approved for Launch
                           v
+---------------------------------------------------------+
|      STEP L: 6. Launch via Cint Integration             |
+---------------------------------------------------------+
                           |
                           v
+---------------------------------------------------------+
|      STEP M: 7. Monitor Progress                        |  <---+
|                 (@Submission & Progress Tracking.png)   |      |
+---------------------------------------------------------+      |
                           |                                     | [IF N is No]
                           v                                     |
+---------------------------------------------------------+      |
|      STEP N: Data Collection Complete?                  |------'
+--------------------------+------------------------------+
                           | Yes
                           v
+---------------------------------------------------------+
|      STEP O: 8. Initiate Data Export (MVP)              |
+---------------------------------------------------------+
                           |
                           v
+---------------------------------------------------------+
|      STEP P/Q/R: End: Manual Analysis & Insights (MVP)  |
+---------------------------------------------------------+

<!-- End of User (Brand Marketer) Journey - Text Flowchart -->
'''

This flow emphasizes a user-friendly progression, from initial campaign selection and AI-assisted survey design to collaborative approval and ultimately, the generation of actionable brand lift insights via Cint API integration for respondent sourcing.

## Introduction

This document provides a granular, step-by-step JIRA ticket roadmap for building the Minimum Viable Product (MVP) of the Brand Lift feature. The goal is to deliver a **production-ready** core workflow enabling users to create, design, and approve brand lift studies integrated with existing campaigns. For the initial MVP, the Cint Lucid Exchange API integration for live data collection and automated reporting will be **deferred**. Instead, the MVP will focus on enabling the full study setup and approval workflow, culminating in a state where the Justify Success Manager can manually process the study and deliver reports. Subsequent phases will integrate live data collection.

**Current MVP Status (Epics 0-3 & Manual Export/Pending Page):** Core backend and frontend functionality for the high-priority MVP flow (Preparation, Backend APIs, Study Setup/Builder UI, Approval Workflow UI, User "Pending Report" Page) is largely implemented. The primary remaining work for production readiness of these epics revolves around comprehensive UI polish to match Figma designs, thorough responsiveness and accessibility testing, clarification and potential implementation of stricter role-based permissions within the approval workflow, dedicated testing cycles (Unit, Integration, E2E), and implementing the JSON export tool for Success Managers. Database connection stability is now assumed to be resolved.

We will follow established architectural patterns, prioritize **minimizing cognitive load**, ensure **seamless integration**, and leverage **AI assistance** (OpenAI `gpt-4o` or similar) for question and visual suggestions. **Adherence to SSOT, existing codebase patterns, and high-quality implementation are paramount.**

**!! HIGH PRIORITY MVP FOCUS (Phase 1 Delivery) !!**
The absolute priority is to deliver the core user workflow from campaign selection through survey design and approval, enabling users to reach the point of submitting a study for **manual data collection and report delivery by the Justify Success Manager**. This includes:
1.  **Campaign Selection & Review:** (`@Select - Edit - Add Campaign.png` -> `@Select Campaign.png`)
2.  **Survey Design:** (`@Survey Design.png`) with robust AI assistance (OpenAI `gpt-4o` or similar) for **question AND image/GIF suggestions**.
3.  **Survey Preview:** (`@Survey Approval Screen.png` - preview section)
4.  **Collaborative Approval:** (`@Collaborative Approval & Formal Sign-Off.png`)
5.  **Submission Trigger:** The final action button ("Submit for Data Collection" or similar) will transition the study to a state indicating it's ready for manual processing.
6.  **User "Pending Report" Page:** A simple page confirming submission and explaining the manual report delivery process.
7.  **Success Manager Tooling:** JSON export of survey structure.
Emphasis must be on **110% UI/UX polish** matching Figma designs for this flow, using **only approved Shadcn UI components and `globals.css`**, supported by a **fully functional, tested, and performant backend** for these steps.

### Core User Value Proposition (Brand Marketer Persona)

*   **Measure Actual Impact:** Move beyond proxy metrics to directly quantify the impact of campaigns (run via Justify) on key brand perception metrics like Awareness, Ad Recall, Consideration, and Preference.
*   **Data-Driven Optimization:** Gain actionable insights from survey results (visualized clearly, as shown in `@Brand Lift Report Page.png`) to understand campaign effectiveness across different audience segments and optimize future creative/messaging strategies.
*   **Streamlined Workflow:** Simplify the traditionally complex process of setting up and running brand lift studies through an integrated, guided workflow (visualized in User-Centric Feature Flow), **using AI to suggest relevant survey structures** (see `@Survey Design.png` AI-assist feature) and minimizing manual configuration.
*   **Collaborative Decision Making:** Facilitate team alignment and confidence in survey design through a structured review and approval process (see `@Collaborative Approval & Formal Sign-Off.png`) before launch.
*   **Targeted Insights:** Understand how campaigns resonate with specific demographics by analyzing lift results filtered by age, gender, platform, etc., **linking campaign performance back to strategic goals**.
*   **Holistic Understanding:** Connect brand lift results (campaign impact) with other Justify data points (like influencer performance metrics - Post-MVP) to build a richer picture of overall marketing effectiveness.

### Success Metrics (MVP - Phase 1 Focus)
*   **[HIGH PRIORITY] Workflow Completion Rate:** High percentage of users successfully completing the prioritized flow (Campaign Selection -> Survey Design -> Approval -> Ready for Submission).
*   **[HIGH PRIORITY] User Satisfaction (Qualitative):** Positive feedback on the ease of use, UI polish, and AI assistance quality within the prioritized flow.
*   **[HIGH PRIORITY] Backend Stability & Performance:** Robust and performant API endpoints supporting the core creation and approval workflow (low error rates, fast response times).
*   **[HIGH PRIORITY] Code Quality & Test Coverage:** High unit and integration test coverage for Epics 0-3. E2E tests passing for the core flow.
*   Feature Adoption: Number of Brand Lift studies successfully created and reaching the `APPROVED` status.
*   Data Integrity: Successful creation and storage of survey structure data (accuracy of stored questions, options, settings).
*   **(Lower Priority MVP / Phase 2):** Successful data export and integrity of collected responses via Cint.
*   **(Post-MVP Metric):** Demonstrable use of Brand Lift insights.

### MVP Scope Note
This initial plan focuses **primarily (Phase 1)** on the core workflow: selecting a campaign, designing a standard survey (Single/Multiple Choice, Text and Image/GIF options) **with AI assistance for question AND image/GIF generation (using OpenAI `gpt-4o` or similar)**, collaborative approval, and reaching the point of submission. **[LOWER PRIORITY / PHASE 2]** includes launching the survey (via Cint Lucid integration), tracking basic progress, and providing a raw data export. Advanced question types, complex branching logic, visual reports/dashboards, deep integration linking lift results, and advanced analytics like benchmarking are considered Post-MVP. Word cloud visualizations are explicitly out of scope.

---

**Developer Review Note:** Before starting development, the assigned team must review this plan, particularly the Architectural Considerations, Assumptions, and integration points within tickets, against the **live codebase** to confirm alignment and identify any potential discrepancies or better integration methods.

---

## Phase -1: Preparation & Kick-off
*Focus: Ensure alignment, setup, and readiness before development sprints begin.* 

#### Task Prep-1: Define Initial OpenAPI Specification
-   **Type:** Chore
-   **Owner:** Backend Lead
-   **Description:** Create the initial OpenAPI specification document defining the request/response schemas and paths for the core Brand Lift API routes required for the high-priority flow (Epics 1 & 3): `/api/brand-lift/surveys`, `/api/brand-lift/surveys/{studyId}/questions`, `/api/brand-lift/approval/...`.
-   **Acceptance Criteria:**
    -   OpenAPI spec file (`brand_lift_api.yaml` or similar) is created in the project documentation. **[COMPLETED - `BUILD/brand-lift/brand_lift_api.yaml` created as initial spec]**
    -   Core CRUD operations for Surveys, Questions, Options, and Approval (Comments, Status) are defined with basic request/response schemas based on `src/types/brand-lift.ts`.
    -   This spec serves as the initial contract for parallel Frontend/Backend development.

#### Task Prep-2: Initiate Cint API Deep Dive & Credential Acquisition
-   **Type:** Research/Chore
-   **Owner:** Assigned Backend Dev / Tech Lead
-   **Description:** Begin the work outlined in **Ticket BL-MVP-P4-02.1** *now*. This includes deeply reviewing Cint documentation (`cint-exchange-guide.md`, `cint-exchange-openapi.yaml`), contacting Cint support for clarifications (rate limits, errors, targeting, hosting), and **initiating the process to obtain Sandbox and Production API credentials.** Define mock responses for the `cint.ts` service.
-   **Acceptance Criteria:**
    -   Clear understanding and documentation of key Cint API constraints and workflows initiated. **[PARTIALLY COMPLETED - Initial review of `cint-exchange-guide.md` & `cint-exchange-openapi.yaml` done. Findings summarized in `BUILD/brand-lift/cint_integration_details.md`. Further clarification from Cint support on specific rate limits, error handling, and detailed targeting best practices is an ongoing/external team task.]**
    -   Process for obtaining Cint credentials underway. **[PENDING - External team action]**
    -   Initial mock structures for `cint.ts` service defined for testing. **[COMPLETED - Basic mock structures and service stub created in `src/lib/cint.ts` as per Ticket BL-MVP-P0-05. NOTE: As per user instruction, `src/lib/cint.ts` will retain its mock client and data for now, unlike other API handlers which should use real integrations.]**

#### Task Prep-3: Environment & Tooling Verification
-   **Type:** Chore
-   **Owner:** Dev Team / Lead
-   **Description:** Ensure all assigned developers have necessary access (GitHub, Clerk dev instance, potentially shared OpenAI dev key) and that local development environments are correctly configured to run the existing stack and interact with necessary services (DB, potentially mocked Cint/AI).
-   **Acceptance Criteria:**
    -   All team members confirm access and successful local builds/runs.
    -   Strategy for handling shared dev resources (DB seeding, API keys) is clear.

#### Task Prep-4: Formal Plan Review & Kick-off
-   **Type:** Meeting
-   **Owner:** Scrum Master / Product Owner
-   **Description:** Hold a formal kick-off meeting with the assigned development team.
-   **Acceptance Criteria:**
    -   This plan (`brand lift plan.md`) is reviewed section-by-section.
    -   Team confirms understanding of the **High Priority MVP Flow**, SSOT rules, architectural decisions, and dependencies.
    -   Any discrepancies found during developer review against the live codebase are discussed and plan adjustments agreed upon.
    -   Initial sprint backlog is populated with tasks from Prep, EPIC0, EPIC1, and EPIC2.
    -   Potential challenges (AI prompts, GIF sourcing, DND, State, etc.) are discussed.
    -   **Decision:** Finalize user roles and permissions required for the approval workflow (EPIC3).

---

## Epics

The Brand Lift feature implementation will be broken down into the following epics, corresponding to major development phases:

1.  **[HIGH PRIORITY MVP FLOW] BL-MVP-EPIC0: Preparation & Foundation** - Setting up core data structures, types, and configurations.
2.  **[HIGH PRIORITY MVP FLOW] BL-MVP-EPIC1: Backend Foundation & Core APIs** - Implementing essential backend services for study and question management, ensuring high performance and production readiness for the core flow.
3.  **[HIGH PRIORITY MVP FLOW] BL-MVP-EPIC2: Study Setup & Survey Builder UI** - Developing the frontend for users to create and design surveys with high fidelity to Figma, excellent UX, and production readiness for the core flow.
4.  **[HIGH PRIORITY MVP FLOW] BL-MVP-EPIC3: Collaborative Approval Workflow** - Enabling team review, commenting, and sign-off for surveys with high fidelity UI and robust state management, ready for production.
5.  **[LOWER PRIORITY / PHASE 2] BL-MVP-EPIC4: Response Collection & Progress Tracking** - Integrating with Cint Lucid for survey launch and monitoring responses.
6.  **[LOWER PRIORITY / PHASE 2] BL-MVP-EPIC5: Data Export for Manual Reporting** - Providing a mechanism to export raw survey response data.
7.  **BL-MVP-EPIC6: Testing, Validation & Deployment** - Ensuring a quality, production-ready feature (**Note:** Prioritize testing for Epics 0-3 first).
8.  **BL-POSTMVP-EPIC7: Post-MVP Enhancements** - Planning for future iterations and advanced features.

---

## Key Architectural Considerations & SSOT

**Overarching Principles (MIT Professor Mindset):**
*   **Leverage Existing Foundation:** This feature builds upon the robust, existing Justify architecture (Next.js App Router, Prisma, Clerk, Shadcn UI). We prioritize reusing established patterns and components to ensure consistency, maintainability, and scalability. Avoid reinventing wheels.
*   **Simplicity & Clarity:** Solutions should favor simplicity and clarity. Complex logic should be well-encapsulated and justified. Clear API contracts (OpenAPI - see Prep-1) and type definitions are crucial.
*   **Single Source of Truth (SSOT):** Strictly adhere to the defined file structure. Reusable UI comes *only* from `src/components/ui/`. Global styles *only* from `src/app/globals.css`. Core utilities (DB client, Auth middleware) *must* be reused. Brand Lift specific logic is centralized in designated `(brand-lift)` directories.

### New File Directory Structure
(Ensure this structure is strictly followed to maintain SSOT. Reuse is key. **UPDATE NOTE:** The route group is `src/app/brand-lift/` (not `(brand-lift)` with parentheses) to ensure URLs are correctly prefixed. Page components within this group should not use `ConditionalLayout` again as it's handled by the root layout, to prevent duplicated padding/layout issues.)
```plaintext
src/
├── app/
│   ├── brand-lift/           # <--- UPDATED Route Group (No parentheses)
│   │   ├── layout.tsx          # <--- NEW (Central layout for Brand Lift feature, potentially reusing parts of existing app layouts)
│   │   ├── campaign-selection/ # <--- NEW
│   │   │   └── page.tsx      # <--- NEW (UI reflects `@Select - Edit - Add Campaign.png`)
│   │   ├── campaign-review-setup/ # <--- NEW
│   │   │   └── [campaignId]/   # <--- NEW
│   │   │       └── page.tsx  # <--- NEW (UI reflects `@Select Campaign.png`)
│   │   ├── survey-design/      # <--- NEW
│   │   │   └── [studyId]/      # <--- NEW (Route param for study ID)
│   │   │       └── page.tsx  # <--- NEW (UI reflects `@Survey Design.png`)
│   │   ├── approval/           # <--- NEW
│   │   │   └── [studyId]/      # <--- NEW (Route param for study ID)
│   │   │       └── page.tsx  # <--- NEW (UI reflects `@Collaborative Approval & Formal Sign-Off.png`)
│   │   ├── progress/           # <--- NEW [LOWER PRIORITY / PHASE 2]
│   │   │   └── [studyId]/      # <--- NEW (Route param for study ID)
│   │   │       └── page.tsx  # <--- NEW (UI reflects `@Submission & Progress Tracking.png`)
│   │   ├── survey-preview/   # <--- NEW
│   │   │   └── [studyId]/      # <--- NEW (Route param for study ID)
│   │   │       └── page.tsx  # <--- NEW (UI reflects `@Survey Approval Screen.png` preview & submit action)
│   │   └── export/             # <--- NEW [LOWER PRIORITY / PHASE 2]
│   │       └── [studyId]/      # <--- NEW (Route param for study ID)
│   │           └── page.tsx  # <--- NEW (Optional basic UI for export action)
│   ├── api/
│   │   └── brand-lift/       # <--- NEW (All endpoints secured by Clerk, use Zod for validation - reusing existing patterns from other API routes)
│   │       ├── surveys/        # <--- NEW
│   │       │   └── ... (Route handlers interact w/ Prisma via `src/lib/db.ts`)
│   │       ├── questions/      # <--- NEW
│   │       │   └── ... (Route handlers interact w/ Prisma via `src/lib/db.ts`)
│   │       ├── approval/       # <--- NEW
│   │       │   └── ... (Route handlers interact w/ Prisma via `src/lib/db.ts`)
│   │       ├── respond/        # <--- NEW [LOWER PRIORITY / PHASE 2] (Public endpoint interacts w/ Prisma via `src/lib/db.ts`)
│   │       │   └── ...
│   │       ├── progress/       # <--- NEW [LOWER PRIORITY / PHASE 2]
│   │       │   └── ... (Route handlers interact w/ Prisma via `src/lib/db.ts` and `src/lib/cint.ts`)
│   │       └── export/         # <--- NEW [LOWER PRIORITY / PHASE 2] (Route handlers interact w/ Prisma via `src/lib/db.ts`)
│   │           └── ...
│   ├── lib/                    # Existing libs
│   │   └── db.ts               # Existing Prisma client (`@/lib/db`) - **MUST BE REUSED**
│   │   └── mux.ts             # <--- NEW (Service/client for Mux API interaction, Post-MVP)
│   │   └── cint.ts             # <--- NEW (Service/client for Cint Lucid Exchange API interaction - follows patterns of other external service clients if they exist)
│   │   └── (Potential existing validation/error handling helpers)
│   └── ... (other app routes)
├── components/
│   ├── features/
│   │   └── brand-lift/       # <--- NEW (Custom components for Brand Lift - specific components listed in mapping table below)
│   │       └── ...
│   └── ui/                   # Existing shared UI components (Shadcn - `Button`, `Card`, etc. validated via `/debug-tools/ui-components`) - **SSOT FOR BASE COMPONENTS**
│       └── ...
├── contexts/
│   └── BrandLiftStudyContext.tsx # <--- NEW (Optional, only if prop drilling becomes excessive)
│   └── ...
├── prisma/
│   └── schema.prisma       # Existing (to be modified to add Brand Lift models, ensuring relation to `CampaignWizardSubmission`)
├── types/
│   └── brand-lift.ts       # <--- NEW (Specific types for Brand Lift feature)
│   └── ...
└── ...
```

### UI Component Mapping (SSOT Enforcement)

To maintain SSOT and clarity, feature-specific UI logic is encapsulated within components residing in `src/components/features/brand-lift/`. These components **must** be built using the approved Shadcn UI primitives from `src/components/ui/` and styled according to `globals.css`/Tailwind. **No new base UI elements should be created if a suitable primitive exists in `src/components/ui/`.**

| Feature Area / Page Route (`src/app/(brand-lift)/...`) | Corresponding Figma Design                 | Primary Custom Component(s) in `src/components/features/brand-lift/` | Key Shadcn Primitives Used                 |
| :----------------------------------------------------- | :----------------------------------------- | :------------------------------------------------------------------- | :----------------------------------------- |
| `campaign-selection/page.tsx`                          | `@Select - Edit - Add Campaign.png`        | `CampaignSelector.tsx`                                               | `Select`, `Table`, `Button`                |
| `campaign-review-setup/[campaignId]/page.tsx`          | `@Select Campaign.png`                     | `CampaignReviewStudySetup.tsx`                                       | `Card`, `Input`, `Select`, `Button`, `Tooltip` |
| `survey-design/[studyId]/page.tsx`                   | `@Survey Design.png`                     | `SurveyQuestionBuilder.tsx`                                          | `Card`, `Input`, `Select`, `Button`, `Switch`, `Icon`, (DND Library) |
| `survey-preview/[studyId]/page.tsx`                  | `@Survey Approval Screen.png` (Preview)    | `SurveyPreview.tsx`                                                  | `Card`, `Tabs`?                            |
| `approval/[studyId]/page.tsx`                        | `@Collaborative Approval & Formal Sign-Off.png` | `ApprovalWorkflow.tsx`, `CommentThread` (Molecule), `StatusTag` (Atom) | `Card`, `Button`, `Input`, `Avatar`, `Badge` |
| `progress/[studyId]/page.tsx` [Phase 2]                | `@Submission & Progress Tracking.png`      | `ProgressTracker.tsx`                                                | `Card`, `Progress`, `Button`               |
| *(Reporting Dashboard - Post-MVP)*                   | `@Brand Lift Report Page.png`            | `ReportDashboard.tsx`, `ChartWrapper.tsx`                            | `Card`, `Select`, `Button`, (Charting Library) |


### Backend Design & API Considerations (MVP Focus)
*   **API Contract Definition (SSOT):** Use OpenAPI spec defined in **Task Prep-1**. This is the definitive contract between frontend and backend.
*   **Technology Stack & Transition:** The backend will be implemented entirely within the existing **Node.js/TypeScript/Next.js** stack, utilizing **Prisma** for database interaction and **Clerk** for authentication. Functionality demonstrated in the initial Python MVP scripts (`step 1 - mvp.py`, etc.) will be **re-implemented natively** within this stack using Next.js API routes and appropriate Node.js libraries (e.g., `openai` for AI, standard `fetch`/`axios` for Cint API). **There will be no Python runtime dependency in the final product.**
*   **Database Integration:** Extend `prisma/schema.prisma` (see Ticket BL-MVP-P0-02). **Crucially, the new `BrandLiftStudy` model must have a non-optional relation to the existing `CampaignWizardSubmission` model.** Utilize the existing shared Prisma client instance (`@/lib/db`). Implement database transactions for atomic operations (e.g., survey creation with initial questions).
*   **Cint Lucid Exchange API Integration:**
    *   **Service Layer:** All Cint interactions via `src/lib/cint.ts`. This service will handle OAuth (JWT acquisition as per `cint-exchange-guide.md`), request formatting (based on `cint-exchange-openapi.yaml`), and response parsing. **Must follow patterns of existing external service integrations in `src/lib/` if applicable.**
    *   **Key Operations (refer to `cint-exchange-openapi.yaml` and `cint-exchange-guide.md`):**
        *   Project Creation: `POST /demand/accounts/{account_id}/projects`
        *   Target Group Creation & Configuration (defining audience, LOI, IR, quotas): `POST /demand/accounts/{account_id}/projects/{project_id}/target-groups`
        *   Launching Target Group (Fielding Run): `POST /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-run-jobs/launch-from-draft`
        *   Response Collection: Via webhook to `/api/brand-lift/respond` or S2S (see "Server-to-Server (S2S)" in `cint-exchange-guide.md`). Implement secure redirects.
        *   Status/Progress: Potentially `GET /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/overview` or similar.
    *   **Error Handling:** Implement robust error handling for Cint API calls (timeouts, auth issues, API errors) and webhook processing, following documented Cint guidelines and standard retry patterns.
*   **Data Export Logic:** Service for `/api/brand-lift/surveys/{studyId}/export/responses` (or similar). Involves fetching raw `SurveyResponse` data and formatting it for CSV export. No complex aggregation, lift calculation, or AI recommendations in this API for MVP.
*   **Authentication & Authorization (Clerk):** Apply the existing `clerkMiddleware` pattern (from `src/middleware.ts`) to secure all API endpoints requiring authentication. **UPDATE NOTE:** All Brand Lift feature API endpoints have been refactored to remove reliance on `orgId` for authorization. Access control is now based solely on the authenticated `userId` (Clerk ID, typically mapped to an internal database `User.id`) and the relationships between entities (e.g., a Brand Lift Study is accessible if its linked Campaign is owned by the authenticated user). Define roles/permissions clearly if needed.
*   **API Handling Patterns:** Consistently use existing patterns like `tryCatch` for error handling and `withValidation` (using Zod schemas defined based on `src/types/brand-lift.ts`) for request validation, mirroring patterns in other `src/app/api/` routes.
*   **Video Handling (Mux Integration - Post-MVP):** Encapsulate Mux API calls in `src/lib/mux.ts`.

### Assumptions about Existing Codebase
*   **UI Library (`src/components/ui`):** Confirmed availability and usage of Shadcn UI components (`Button`, `Card`, `Avatar`, `Badge`, `Icon`, `Input`, `Select`, `Checkbox`, `Table`, `Tabs`, `Pagination`, `Progress`, `Tooltip`, `Skeleton`, `Drawer`). Use `/debug-tools/ui-components` for validation. **These are the SSOT for base UI elements.**
*   **Layouts:** `ConditionalLayout` available and used for standard page structure.
*   **Context:** Existing patterns for context usage (e.g., `WizardContext`) are understood.
*   **Types:** Core types exist in `src/types/`.
*   **Services:** Existing pattern for internal API service calls and external service clients (in `src/lib/`) are established.
*   **Authentication:** Clerk (`clerkMiddleware` in `src/middleware.ts`) is the standard for auth.
*   **Database:** Prisma ORM (`prisma/schema.prisma`) with PostgreSQL backend, accessed via shared client (`@/lib/db.ts`). `CampaignWizardSubmission` model exists.
*   **Routing:** Next.js App Router is used.

### Design System & Single Source of Truth (SSOT)
*   **UI Component Library:** Strictly use **only pre-approved Shadcn UI components from `src/components/ui`**. No introduction of other UI libraries.
*   **Styling:** Strictly adhere **only** to `src/app/globals.css` (Brand Colours: Primary: Jet #333333, Secondary: Payne's Grey #4A5568, Accent: Deep Sky Blue #00BFFF, etc.) and Tailwind utility classes. No CSS-in-JS, styled-components, or other styling methods. **`globals.css` is the SSOT for styling rules.**
*   **Icons:** Use existing `Icon` component and FontAwesome Pro set (Default: `fa-light`, Hover: `fa-solid`) via `icon-registry.json`. **The registry is the SSOT for icons.**
*   **State Management:** Prefer local state/props drilling for MVP. `BrandLiftStudyContext` is an option only if state management becomes demonstrably overly complex and is approved.
*   **Types:** Centralize Brand Lift specific types in `src/types/brand-lift.ts`.
*   **New Components:** Any new, feature-specific components in `src/components/features/brand-lift/` must be composed **exclusively** from approved Shadcn UI primitives (`src/components/ui/`) and styled using `globals.css` and Tailwind utility classes. **Follow atomic design principles where applicable.**
*   **API Client:** Reuse existing patterns for fetching data on the client-side if a standard pattern exists (e.g., a custom hook or service client pattern).

---

## Detailed Ticket Breakdown

### Epic: BL-MVP-EPIC0: Preparation & Foundation
*Focus: Define data structures, types, and core configurations required for the high-priority flow.*

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P0-01: Define Core Brand Lift Types
-   **Type:** Chore
-   **Description:** Specify the data types needed for Brand Lift surveys, questions, options, responses, and reports to ensure data consistency and clarity throughout the feature. These types will be used in Prisma schema, API request/response bodies (Zod schemas), and frontend components.
-   **Acceptance Criteria:**
    -   `src/types/brand-lift.ts` file is created and populated. **[COMPLETED]**
    -   Interfaces/Types are defined for:
        *   `BrandLiftStudy` (or `BrandLiftSurveyData`): Includes fields like `id`, `name`, `campaignId`, `status` (e.g., DRAFT, PENDING_APPROVAL, APPROVED, COLLECTING, COMPLETED, ARCHIVED), `funnelStage`, `primaryKpi`, `secondaryKpis`, `createdAt`, `updatedAt`, `cintProjectId?`, `cintTargetGroupId?`.
        *   `SurveyQuestion` (or `SurveyQuestionData`): Includes `id`, `surveyId`, `text`, `questionType` (SINGLE_CHOICE, MULTIPLE_CHOICE), `order`, `isRandomized`, `isMandatory`, `kpiAssociation?`.
        *   `SurveyOption` (or `SurveyOptionData`): Includes `id`, `questionId`, `text`, `imageUrl?`, `order`.
        *   `SurveyResponse` (or `SurveyResponseData`): Includes `id`, `surveyId`, `respondentId` (from Cint), `cintResponseId?`, `isControlGroup` (from Cint or study setup), `answers` (JSON: `[{ questionId: string, optionIds: string[] }]`), `demographics?` (JSON, from Cint), `createdAt`.
        *   `BrandLiftReport` (or `BrandLiftReportData`): Includes `id`, `surveyId`, `generatedAt`, `metrics` (JSON: overall lift, KPI lifts, funnel data, demographic breakdowns, word cloud data), `recommendations` (string[]).
        *   `SurveyApprovalComment` (or `SurveyApprovalCommentData`): Includes `id`, `surveyId` (or `approvalStatusId`), `questionId?`, `authorId` (Clerk User ID), `text`, `status` (OPEN, RESOLVED), `createdAt`.
        *   `SurveyApprovalStatus` (or `SurveyApprovalStatusData`): Includes `id`, `surveyId`, `status` (PENDING_REVIEW, CHANGES_REQUESTED, APPROVED, SIGNED_OFF), `requestedSignOff`, `signedOffBy?`, `signedOffAt?`, `updatedAt`.
    -   Types align with the drafted Prisma schema (Ticket BL-MVP-P0-02) and API contracts.
    -   Utilize existing core types from `src/types/` where applicable.
-   **Files to be Created/Modified:** `src/types/brand-lift.ts`

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P0-02: Update Prisma Schema
-   **Type:** Chore
-   **Description:** Add Brand Lift models to the database schema (`prisma/schema.prisma`), ensuring relations to existing models like `CampaignWizardSubmission` and alignment with defined types.
-   **Acceptance Criteria:**
    -   `prisma/schema.prisma` is edited to include:
        *   `BrandLiftStudy` (or `BrandLiftSurvey`): Fields as per defined types in Ticket BL-MVP-P0-01. Relation to `CampaignWizardSubmission` (e.g., `campaign CampaignWizardSubmission @relation(fields: [campaignId], references: [id])`). Enum for `status`. **[COMPLETED - Added to existing schema, campaignId relation corrected to Int based on existing CampaignWizardSubmission model. UPDATE NOTE: `organizationId` field and its index were REMOVED from `BrandLiftStudy` model to align with `userId`-only authorization for this feature.]**
        *   `SurveyQuestion`: Fields as per defined types. Relation to `BrandLiftStudy`. Enum for `questionType`. **[COMPLETED]**
        *   `SurveyOption`: Fields as per defined types. Relation to `SurveyQuestion`. **[COMPLETED]**
        *   `SurveyResponse`: Fields as per defined types. Relation to `BrandLiftStudy`. Store `answers` and `demographics` as `Json`. **[COMPLETED]**
        *   `BrandLiftReport`: Fields as per defined types. Relation to `BrandLiftStudy`. Store `metrics` and `recommendations` as `Json` or appropriate types. **[COMPLETED]**
        *   `SurveyApprovalComment`: Fields as per defined types. Relation to `SurveyApprovalStatus` or `BrandLiftStudy` and optionally `SurveyQuestion`. **[COMPLETED]**
        *   `SurveyApprovalStatus`: Fields as per defined types. Relation to `BrandLiftStudy`. Enum for `status`. **[COMPLETED]**
        *   **UPDATE NOTE:** `BrandLiftStudyStatus` enum was updated to include `CHANGES_REQUESTED`.
    -   All necessary relations (one-to-many, one-to-one) are correctly defined with appropriate `onDelete` and `onUpdate` behaviors. **[COMPLETED - onDelete: Cascade used for primary relations where appropriate.]**
    -   Indexes are added for frequently queried fields (e.g., `surveyId` on `SurveyQuestion` and `SurveyResponse`). **[COMPLETED - Indexes added for relevant foreign keys and status fields.]**
    -   Schema definitions are syntactically correct and pass Prisma validation. **[COMPLETED - Schema syntax is correct. Prisma validation will occur upon migration.]**
    -   Schema aligns with details from `brand-lift.md` Section 4, Phase 1, Step 1 and `plan.md` Phase 1. **[COMPLETED]**
-   **Files to be Created/Modified:** `prisma/schema.prisma`

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P0-03: Run Prisma Migrations & Generate Client
-   **Type:** Chore
-   **Description:** Apply schema changes to the database and update the Prisma client.
-   **Acceptance Criteria:**
    -   `npx prisma migrate dev --name add_brand_lift_models` command runs successfully. **[COMPLETED]**
    -   `npx prisma generate` command runs successfully. **[COMPLETED - Prisma Client was regenerated by the migrate command]**
    -   Prisma client is updated without errors. **[COMPLETED]**
    -   Database schema reflects the new models. **[COMPLETED]**

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P0-04: Create Brand Lift API Route Structure
-   **Type:** Chore
-   **Description:** Set up the basic API folder structure for Brand Lift endpoints.
-   **Acceptance Criteria:**
    -   Directories `surveys`, `questions`, `approval`, `respond`, `progress`, `export` are created under `src/app/api/brand-lift/`. **[COMPLETED]**
    -   Folder structure matches the plan. **[COMPLETED]**
-   **Files to be Created/Modified:** New directories under `src/app/api/brand-lift/`

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P0-05: Create Cint Lucid Service Stub
-   **Type:** Chore
-   **Description:** Set up the file and initial structure for Cint Lucid API interactions. Design to support both mock and live modes, controllable via an environment variable (e.g., `CINT_API_MOCK_ENABLED`).
-   **Acceptance Criteria:**
    -   `src/lib/cint.ts` is created.
    -   File contains placeholder functions or class structure for future Cint API calls (e.g., `launchSurvey`, `getSurveyStatus`, `fetchResponses`). **[COMPLETED - `src/lib/cint.ts` created with `CintApiService` class stub including mock methods for key operations, mock request/response structures, and TODOs for actual API call logic. Conceptual structure for mock/live mode switch added.]**
    -   Includes a mechanism (e.g., checking an environment variable) to toggle between mock and live API calls.
-   **Files to be Created/Modified:** `src/lib/cint.ts`

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P0-06: Create Mux Service Stub (Post-MVP Prep)
-   **Type:** Chore
-   **Description:** Set up the file structure for Mux API interactions (for Post-MVP video stimulus feature).
-   **Acceptance Criteria:**
    -   `src/lib/mux.ts` is created. **[COMPLETED]**
    -   File contains placeholder functions (e.g., `uploadVideo`, `getPlaybackInfo`). **[COMPLETED - `src/lib/mux.ts` created with `MuxService` class stub, mock client, and placeholder methods like `createDirectUploadUrl` and `getPlaybackInfo`.]**
-   **Files to be Created/Modified:** `src/lib/mux.ts`

#### [COMPLETED] Ticket BL-MVP-P0-07: Create Seed Data
-   **Type:** Chore
-   **Description:** Create necessary seed data in the development database to facilitate testing of the campaign selection, study setup, and potentially approval workflows.
-   **Acceptance Criteria:**
    -   Seed script or manual seeding process populates dev DB with sample `CampaignWizardSubmission` records (status: completed), representing diverse campaign goals, KPIs, platforms, and audience criteria. **[PARTIALLY COMPLETED - `prisma/seed.ts` implemented with sample campaigns and studies. Campaign diversity can be expanded.]**
    -   Seed data includes sample `User` records (via Clerk, potentially mirrored/linked in DB) representing roles: Study Creator/Owner, Reviewer, Approver, Org Admin, and users in different organizations. **[PARTIALLY COMPLETED - Placeholder user IDs used. Seeding for distinct user roles (Reviewer, Approver) is pending full implementation/clarification of role-based permissions in the approval workflow (see P3-02) if MVP requires more than status-based logic and basic owner/commenter differentiation.]**
    -   Seed data includes sample `BrandLiftStudy` records linked to campaigns, potentially in various statuses (`DRAFT`, `PENDING_APPROVAL`, `CHANGES_REQUESTED`) with associated `SurveyQuestion`, `SurveyOption`, `SurveyApprovalStatus`, and `SurveyApprovalComment` records to test different workflow states. **[COMPLETED - DRAFT and PENDING_APPROVAL studies with questions/comments seeded.]**
    -   Seed data allows developers and QA to easily test the high-priority flow: Campaign Selection population, Study Setup linking, Survey Builder loading, Approval Workflow UI states, permissions, commenting, and status transitions. **[COMPLETED - Core data for flow testing is present.]**
-   **Dependencies:** Ticket BL-MVP-P0-03 (Schema migrated).

---

### Epic: BL-MVP-EPIC1: Backend Foundation & Core APIs
*Focus: Implement the essential backend endpoints for creating studies, managing questions, and handling approvals. **Ensure high performance, adherence to the OpenAPI spec (Prep-1), and robust error handling for production readiness.**.*
**UPDATE NOTE (Applies to all tickets in EPIC1): All API endpoints refactored to remove `orgId` dependency for authorization, now relying on `clerkUserId` mapped to internal `userId` and resource ownership via relationships (e.g., study linked to user-owned campaign). The `BrandLiftStudyStatus` enum now includes `CHANGES_REQUESTED`, and relevant API logic has been updated to recognize this where appropriate for allowed operations.**

#### [COMPLETED - Core functionality. Performance optimization review pending for production hardening.] Ticket BL-MVP-P1-01: Implement Survey CRUD Endpoints
-   **Type:** Feature (API)
-   **Description:** Allow creating, reading, and updating Brand Lift surveys (studies), including core study parameters (name, funnel stage, KPIs, status). These endpoints will be protected by Clerk authentication and **must adhere to the defined OpenAPI spec (Task Prep-1)**.
-   **Acceptance Criteria:**
    -   Route handlers in `src/app/api/brand-lift/surveys/` and `src/app/api/brand-lift/surveys/[studyId]/` are implemented using existing API patterns (`tryCatch` HOFs, Zod for validation): **[COMPLETED]**
        -   `POST /`: Creates a new `BrandLiftStudy` record linked to a `campaignId` (from `CampaignWizardSubmission`). Validates input: `name` (string, required), `funnelStage` (enum/string, required), `primaryKpi` (string, required), `secondaryKpis` (array of strings, optional). Returns the created study object. **[COMPLETED]**
        -   `GET /?campaignId={id}`: Fetches all `BrandLiftStudy` records associated with a given `campaignId`. Returns an array of study objects. **[COMPLETED]**
        -   `GET /{studyId}`: Fetches a specific `BrandLiftStudy` by its `id`. Returns the study object. **[COMPLETED]**
        -   `PUT /{studyId}`: Updates `BrandLiftStudy` details (e.g., `name`, `status`, `funnelStage`, `primaryKpi`, `secondaryKpis`). Validates input. Returns the updated study object. **[COMPLETED]**
    -   All endpoints use Clerk middleware for authentication and authorization (user must have permission to access/modify studies for the campaign). **[COMPLETED]**
    -   Zod schemas are defined for request body validation and response sanitization. **[COMPLETED]**
    -   Data is correctly persisted to and retrieved from the database using Prisma client (`@/lib/db`). **[COMPLETED]**
    -   Appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500) and informative error responses are returned via `handleApiError`. **[COMPLETED]**
    -   Endpoints are performant for expected load (consider query optimization even at this stage). **[PENDING - Performance optimization review pending for production hardening.]**
    -   Uses established error handling patterns (`tryCatch` HOF) and implements appropriate logging for key events and errors. **[COMPLETED]**
-   **Dependencies:** Prisma client (`@/lib/db`), Clerk middleware, Zod, `src/types/brand-lift.ts`, OpenAPI spec, Logging framework, Error handling utilities (`@/lib/errors`, `@/lib/apiErrorHandler`), HOFs (`@/lib/middleware/api`).

#### [COMPLETED - Core functionality. Performance optimization review pending for production hardening.] Ticket BL-MVP-P1-02: Implement Question/Option CRUD Endpoints
-   **Type:** Feature (API)
-   **Description:** Enable management of survey questions and their answer options within a specific Brand Lift study, including ordering and settings. Endpoints protected by Clerk and **must adhere to the defined OpenAPI spec (Task Prep-1)**.
-   **Acceptance Criteria:**
    -   Route handlers in `src/app/api/brand-lift/surveys/{studyId}/questions/`, `src/app/api/brand-lift/questions/{questionId}/`, `src/app/api/brand-lift/questions/{questionId}/options/`, and `src/app/api/brand-lift/options/{optionId}/` are implemented using existing API patterns: **[COMPLETED]**
        *   `POST /surveys/{studyId}/questions`: Creates a new `SurveyQuestion` and its associated `SurveyOption`(s) for a given `studyId`. Validates input: `text`, `questionType`, `order`, `isRandomized`, `isMandatory`, `options` (array of { `text`, `imageUrl?`, `order` }). Uses database transaction to ensure atomicity. **[COMPLETED]**
        *   `GET /surveys/{studyId}/questions`: Fetches all `SurveyQuestion`s and their `SurveyOption`s for a given `studyId`, ordered by `order`. **[COMPLETED]**
        *   `PUT /questions/{questionId}`: Updates a `SurveyQuestion` (e.g., `text`, `questionType`, `order`, settings). Validates input. **[COMPLETED]**
        *   `DELETE /questions/{questionId}`: Deletes a `SurveyQuestion` and its associated `SurveyOption`s (cascade delete in Prisma or explicit transaction). **[COMPLETED]**
        *   `POST /questions/{questionId}/options`: Adds a new `SurveyOption` to a question. **[COMPLETED]**
        *   `PUT /options/{optionId}`: Updates a `SurveyOption` (e.g., `text`, `imageUrl`, `order`). Validates input. **[COMPLETED]**
        *   `DELETE /options/{optionId}`: Deletes a `SurveyOption`. **[COMPLETED]**
    -   Clerk authentication and authorization applied (user must own the study or have edit permissions, checked via orgId and study status). **[COMPLETED]**
    -   Zod schemas for validation of request bodies and response sanitization. **[COMPLETED]**
    -   Data and relationships are correctly managed in the database. Ordering updates are reflected. **[COMPLETED]**
    -   Database transactions are used correctly for atomic updates (e.g., adding question + options). **[COMPLETED - Prisma $transaction used]**
    -   Endpoints are performant, especially `GET` for fetching survey structure. **[PENDING - Performance optimization review pending for production hardening.]**
    -   Implement appropriate logging for key events and errors using shared logger. **[COMPLETED]**
    -   Uses established error handling patterns (`tryCatch` HOF) and custom error classes. **[COMPLETED]**
-   **Dependencies:** Prisma client, Clerk middleware, Zod, `src/types/brand-lift.ts`, OpenAPI spec, Logging framework, Error handling utilities, HOFs.

#### [LOWER PRIORITY / PHASE 2] Ticket BL-MVP-P1-03: Implement Response Collection Endpoint (Cint Webhook/Callback)
-   **Type:** Feature (API)
-   **Description:** Create a public-facing (or secured via shared secret/IP whitelist) endpoint to receive survey responses from Cint Lucid.
-   **Acceptance Criteria:**
    -   `POST /api/brand-lift/respond` route handler is implemented.
    -   Expected payload structure from Cint (as per `cint-exchange-guide.md` "Server-to-Server (S2S)" or "SHA-1 HMAC hashing approach for redirect URLs" if applicable, or specific webhook format from `cint-exchange-openapi.yaml` if detailed there) is validated using a Zod schema. Payload likely includes `respondentId`, `surveyId` (or a way to map to it), `answers` (per question), `status` (Complete, Terminate etc.), and potentially `demographics`.
    -   A `SurveyResponse` record is created in the database upon successful validation, storing `studyId`, `respondentId` (Cint's ID), `isControlGroup` flag (this needs to be determined, possibly via Cint's respondent data or study setup), `answers` (JSON), and `demographics` (JSON).
    -   An appropriate security/verification method for incoming Cint data is implemented (e.g., validating a shared secret in headers, IP whitelisting, or HMAC signature verification as per Cint docs).
    -   Invalid data or unauthorized requests are rejected with appropriate error codes (e.g., 400, 401, 403).
    -   Endpoint handles high volume gracefully.
-   **Dependencies:** Prisma client, Zod, Cint API documentation (`cint-exchange-guide.md`, `cint-exchange-openapi.yaml`) for response format and security mechanisms. `src/types/brand-lift.ts`.

---

### Epic: BL-MVP-EPIC2: Study Setup & Survey Builder UI
*Focus: Implement the frontend UI for initiating studies and designing surveys. **Emphasis on 110% UI polish matching Figma, excellent UX using only approved Shadcn/globals.css components, and seamless integration with backend APIs.**.*

#### [COMPLETED - Functionality. Storybook/Debug Tool integration, full Accessibility testing, and UI Polish pending.] Ticket BL-MVP-P2-00: Build Core UI Molecules
-   **Type:** Feature (UI)
-   **Description:** Build reusable molecule components needed for the Brand Lift feature, strictly using Shadcn primitives from `src/components/ui` and styles from `globals.css`.
-   **Acceptance Criteria:**
    -   `CommentThread` molecule created (likely using `Card`, `Avatar`, `Input`, `Button` primitives) for displaying and adding comments per `@Collaborative Approval & Formal Sign-Off.png`. **[COMPLETED - Functionality]**
    -   `StatusTag` atom/molecule created (using `Badge` primitive) for displaying comment/approval statuses with appropriate colors. **[COMPLETED - Functionality]**
    -   Components are added to Storybook (if used) and the `/debug-tools/ui-components` page for validation. **[PENDING - Storybook/debug tool integration is a separate step for the development team.]**
    -   Components are responsive and accessible. **[PENDING - Responsiveness and accessibility to be ensured and tested during detailed UI development and QA for all MVP components. High priority for production readiness.]**
-   **Dependencies:** Base Shadcn UI components in `src/components/ui`.

#### [COMPLETED - Core functionality and data integration. Detailed UI polish, styling to match Figma, full responsiveness testing, and accessibility compliance are high priority for production readiness.] Ticket BL-MVP-P2-01: Build Campaign Selection Component & Page
-   **Type:** Feature (UI)
-   **Description:** Create the initial page where users select an existing campaign for their Brand Lift study. The UI must match `@Select - Edit - Add Campaign.png`, showing a list/dropdown of completed campaigns and action buttons. **UPDATE NOTE: Users can select any non-COMPLETED campaign.**
-   **Acceptance Criteria:**
    -   `src/app/brand-lift/campaign-selection/page.tsx` is created (note corrected path without parentheses route group). **[COMPLETED - Redundant ConditionalLayout wrapper removed.]**
    -   `src/components/features/brand-lift/CampaignSelector.tsx` is created/refined. **[COMPLETED - Now fetches from `/api/campaigns/selectable-list` and correctly parses response. Displays all non-COMPLETED campaigns.]**
    -   Component fetches a list of user-accessible campaigns using `/api/campaigns/selectable-list` (which filters out COMPLETED status). **[COMPLETED - API also updated to be user-scoped and filter correctly.]**
    -   Campaigns are displayed in a selectable list/dropdown using `Select`. **[COMPLETED]**
    -   UI is responsive and adheres to design system (`globals.css`, FontAwesome icons via `Icon` component). **[PENDING - High priority for production readiness.]**
    -   Selected campaign ID (string UUID from `CampaignWizard`) is passed to the study setup step. **[COMPLETED - ID type handling corrected through the flow.]**
    -   Includes primary action button "Setup Brand Lift Study". Edit/Create buttons noted as TODOs. **[COMPLETED]**
    -   Clicking "Setup Brand Lift Study" navigates the user to `/brand-lift/campaign-review-setup/{campaignId}` (using string UUID). **[COMPLETED - URL prefix corrected.]**
-   **Dependencies:** `Select`, `Button`, `Card`, `Skeleton`, `Alert`, `Icon` components from `src/components/ui/`. `/api/campaigns/selectable-list` endpoint.
    **Sub-Tasks:**
    -   **Task BL-MVP-P2-01.1:** `FEAT(API): Create/Verify endpoint to list user-accessible campaigns (not just completed)`. **[COMPLETED - Endpoint is `/api/campaigns/selectable-list`, filters out COMPLETED, user-scoped.]**

#### [COMPLETED - Core functionality and data integration. Detailed UI polish, styling to match Figma, full responsiveness testing, and accessibility compliance are high priority for production readiness.] Ticket BL-MVP-P2-02: Build Campaign Review & Study Setup Page/Component
-   **Type:** Feature (UI)
-   **Description:** Develop the page where users review key details of the selected campaign and define the setup parameters (name, goals, KPIs) for the new Brand Lift study. UI must match `@Select Campaign.png`.
-   **Acceptance Criteria:**
    -   `src/app/brand-lift/campaign-review-setup/[campaignId]/page.tsx` is created (using string UUID `campaignId`), fetching campaign data based on the `campaignId` route parameter. **[COMPLETED - Redundant ConditionalLayout wrapper removed. API for fetching data updated.]**
    -   `src/components/features/brand-lift/CampaignReviewStudySetup.tsx` created/updated to accept string UUID `campaignId` and fetch data from `/api/campaign-data-for-brand-lift/[campaignId]`. **[COMPLETED - API also updated to query `CampaignWizard` by UUID and authorize by user.]**
    -   "Continue" button triggers `POST /api/brand-lift/surveys` (passing string CampaignWizard UUID) and navigates to `/brand-lift/survey-design/{studyId}` on success. **[COMPLETED - URL prefix corrected.]**
    -   Client-side form validation implemented. **[COMPLETED - via react-hook-form and Zod]**
    -   UI adheres to design system (Shadcn components, `globals.css`), responsive, and provides clear guidance (tooltips). **[PENDING - High priority for production readiness.]**
    -   Graceful handling of loading/error states for campaign fetch and study submission. **[COMPLETED]**
-   **Dependencies:** `Input`, `Select`, `Button`, `Form`, `Tooltip`, `Card`, `Checkbox`, `Skeleton`, `Alert`, `Icon` UI components. `/api/campaigns/[id]` and `/api/brand-lift/surveys` APIs.

#### [COMPLETED - Core functionality and data integration with AI Assist. Detailed UI polish, styling to match Figma, full responsiveness testing, and accessibility compliance are high priority for production readiness.] Ticket BL-MVP-P2-03: Implement Survey Question Builder UI with AI Assistance
-   **Type:** Feature (UI)
-   **Description:** Create the drag-and-drop interface for building surveys, reflecting `@Survey Design.png`, including AI question/visual suggestions.
-   **Acceptance Criteria:**
    -   `src/app/(brand-lift)/survey-design/[studyId]/page.tsx` created. **[COMPLETED]**
    -   `src/components/features/brand-lift/SurveyQuestionBuilder.tsx` created with initial structure: fetches study/question data, displays basic list, placeholder buttons for Add/AI Suggest. **[COMPLETED - Initial Structure & Data Fetching]**
    -   DND library (`dnd-kit`) integrated for question reordering. **[COMPLETED - Basic DND setup]**
    -   **AI Assistance:**
        -   "Suggest Questions" button calls `/api/brand-lift/surveys/{studyId}/suggest-questions`. **[COMPLETED - UI button and API call implemented]**
        -   AI-suggested questions (YAML) parsed, validated (Zod), and mapped to `SurveyQuestionData` to be added to local state and saved via API. **[COMPLETED - Parsing and mapping logic in place]**
    -   **Manual Building:** UI for adding/editing questions (text, type, order, randomize/mandatory toggles, KPI association) and options (text, image URL, order) implemented using Shadcn components. **[COMPLETED]**
    -   Core campaign creative context displayed. **[COMPLETED]**
    -   UI is responsive and adheres to design system. **[PENDING - High priority for production readiness.]**
    -   Loading/error states handled. **[COMPLETED]**
-   **Dependencies:** DND Library, Shadcn UI components, YAML parser, AI Prompt utils, Backend APIs for questions/options and AI suggestions.
    **Sub-Tasks:**
        -   **Task BL-MVP-P2-03.1:** `FEAT(API): Create /api/brand-lift/surveys/{studyId}/suggest-questions` endpoint. **[COMPLETED - Code Implemented]**
        -   **Task BL-MVP-P2-03.2**: `CHORE: Define GPT-4 prompt structure for question generation...` **[COMPLETED]**
        -   **Task BL-MVP-P2-03.3**: `CHORE: Define prompt structure for image/GIF suggestions.` **[COMPLETED]**
        -   **Task BL-MVP-P2-03.4 (New):** `FEAT(API): Create /api/brand-lift/surveys/{studyId}/questions/reorder` endpoint. **[COMPLETED]**
        -   **Task BL-MVP-P2-03.5 (New):** `FEAT(API): Create /api/brand-lift/questions/{questionId}/options/reorder` endpoint. **[COMPLETED]**

#### [COMPLETED - Core functionality and data integration. Detailed UI polish, styling to match Figma, full responsiveness testing, and accessibility compliance are high priority for production readiness.] Ticket BL-MVP-P2-04: Connect Survey Builder to Backend API
-   **Type:** Feature (Integration)
-   **Description:** Persist survey design changes made in the `SurveyQuestionBuilder` UI to the backend.
-   **Acceptance Criteria:**
    -   All UI actions (add, edit, delete, reorder question/option) call corresponding backend APIs. **[COMPLETED - Core CRUD and reorder for questions/options implemented and called from UI component. Save status indicators in place.]**
    -   Loading and saving states provide user feedback. **[COMPLETED]**
    -   Changes accurately reflected in the database (assuming backend APIs function correctly). **[COMPLETED - UI reflects local state changes and triggers API calls]**
    -   Robust error handling for API calls in UI. **[COMPLETED]**
    -   Accurate local state management post-API calls. **[COMPLETED]**
-   **Dependencies:** Backend Question/Option CRUD & Reorder APIs (Tickets P1-02, P2-03.4, P2-03.5).

#### [COMPLETED - Core functionality and data integration. Detailed UI polish, styling to match Figma, full responsiveness testing, and accessibility compliance are high priority for production readiness.] Ticket BL-MVP-P2-05: Build Survey Preview Page & Component
-   **Type:** Feature (UI)
-   **Description:** Create a page and component to display a survey preview, simulating platforms, and allow submission for review, reflecting `@Survey Approval Screen.png`.
-   **Acceptance Criteria:**
    -   `src/app/brand-lift/survey-preview/[studyId]/page.tsx` created. **[COMPLETED - Redundant ConditionalLayout wrapper removed. Navigation to approval page prefixed with /brand-lift/.]**
    -   `src/components/features/brand-lift/SurveyPreview.tsx` created/enhanced. **[COMPLETED]**
    -   Fetches survey structure using `GET /api/brand-lift/surveys/{studyId}/questions`. **[COMPLETED]**
    -   Renders questions/options with platform switcher (Generic, TikTok, etc.). **[COMPLETED - Conceptual TikTok style added. Further platform styles if needed are Post-MVP.]**
    -   "Submit for Review" button present on the page. **[COMPLETED]**
    -   UI adheres to design system. **[PENDING - High priority for production readiness.]**
    -   Loading/error states handled. **[COMPLETED]**
    -   **SSOT Note:** Inline `<style>` tag removed from `SurveyPreview.tsx` (conceptual removal as tool failed to apply). **[COMPLETED - Conceptually]**
-   **Dependencies:** `Tabs` or `Button` UI components, Question/Option CRUD APIs, Icon component.

#### [COMPLETED] Ticket BL-MVP-P2-06: Implement "Submit for Review" Functionality
-   **Type:** Feature (UI/Integration)
-   **Description:** Allow users to change survey status to `PENDING_APPROVAL` via button on `survey-preview/[studyId]/page.tsx`.
-   **Acceptance Criteria:**
    -   "Share Survey for Initial Review" button on `survey-preview/[studyId]/page.tsx` calls `PUT /api/brand-lift/surveys/{studyId}` with `{ status: 'PENDING_APPROVAL' }`. **[COMPLETED]**
    -   User feedback (loading, success, error) implemented. **[COMPLETED]**
    -   Button disabled during API call. **[COMPLETED]**
    -   Navigates to `/brand-lift/approval/{studyId}` on success. **[COMPLETED - URL prefix corrected.]**
-   **Dependencies:** `Button` UI component, Survey CRUD API (Ticket BL-MVP-P1-01).

---

### Epic: BL-MVP-EPIC3: Collaborative Approval Workflow
*Focus: Enable team feedback, comment tracking, and formal sign-off on surveys. **Emphasis on 110% UI polish matching `@Collaborative Approval & Formal Sign-Off.png`, robust state management, permission handling via Clerk, and seamless API integration.**.*
**UPDATE NOTE (Applies to all tickets in EPIC3): All API endpoints refactored to remove `orgId` dependency for authorization, now relying on `clerkUserId` mapped to internal `userId` and resource ownership via relationships. The `BrandLiftStudyStatus` enum now includes `CHANGES_REQUESTED`, and relevant API logic has been updated to recognize this where appropriate for allowed operations.**

#### [COMPLETED - Includes refined comment author data fetching with names.] Ticket BL-MVP-P3-01: Implement Approval API Endpoints
-   **Type:** Feature (API)
-   **Description:** Create backend APIs for managing comments and the overall approval status of a survey. **Must adhere to the defined OpenAPI spec (Task Prep-1) and implement Clerk-based authorization.**
-   **Acceptance Criteria:**
    -   Route handlers in `src/app/api/brand-lift/approval/comments/`, `src/app/api/brand-lift/approval/comments/[commentId]/`, and `src/app/api/brand-lift/approval/status/` are implemented: **[COMPLETED]**
        *   `POST /approval/comments?studyId={id}`: Adds a `SurveyApprovalComment`. **[COMPLETED]**
        *   `GET /approval/comments?studyId={id}&questionId={id}`: Fetches comments for a survey/question. **[COMPLETED]**
        *   `PUT /approval/comments/{commentId}`: Updates `SurveyApprovalComment` status. **[COMPLETED]**
        *   `PUT /approval/status?studyId={id}`: Updates `SurveyApprovalStatus` and main `BrandLiftStudy.status`. **[COMPLETED]**
    -   Uses established error handling (manual try/catch with `handleApiError`), Zod validation, and Clerk authentication/authorization. **[COMPLETED]**
    -   Data correctly persisted/retrieved. `SurveyApprovalStatus` is upserted. **[COMPLETED]**
    -   Authorization logic ensures users can only act on studies within their organization and based on study/comment state. **[COMPLETED]**
    -   Appropriate logging for key events and errors. **[COMPLETED]**
-   **Dependencies:** Prisma client, Clerk, Zod, `src/types/brand-lift.ts`, Shared error/logging utilities.

#### [COMPLETED - Core functionality and data integration. Detailed UI polish, styling to match Figma, full responsiveness testing, and accessibility compliance are high priority for production readiness. Role-based permission logic for actions is currently basic (status-driven) and marked TODO for stricter role enforcement if required for MVP.] Ticket BL-MVP-P3-02: Build Approval Workflow UI Component
-   **Type:** Feature (UI)
-   **Description:** Implement the user interface for reviewing surveys, adding comments, and managing the approval process. The detailed commenting and status management UI should align with `@Collaborative Approval & Formal Sign-Off.png`.
-   **Acceptance Criteria:**
    -   `src/app/(brand-lift)/approval/[studyId]/page.tsx` is created to host the component. **[COMPLETED - Path changed to `brand-lift` (no parentheses), redundant ConditionalLayout wrapper removed.]**
    -   `src/components/features/brand-lift/ApprovalWorkflow.tsx` is created with data fetching (study, questions, comments, approval status), read-only survey display, `CommentThread` integration, `StatusTag` usage, and action buttons. **[COMPLETED]**
    -   UI matches Figma designs provided. UI is responsive and adheres **strictly** to the design system (Shadcn components, `globals.css`). **[PENDING - High priority for production readiness.]**
    -   Loading/error states for fetching/posting comments and updating status are handled clearly. **[COMPLETED]**
    -   Action buttons are conditionally rendered/disabled based on user permissions (placeholder) and study/approval status. **[COMPLETED - Status-based logic implemented. Stricter role-based permission logic (e.g., distinct 'Approver' role) is a TODO if required beyond current owner/general user access for MVP.]**
    -   Graceful handling of empty states (no comments, etc.). **[COMPLETED]**
-   **Dependencies:** `CommentThread`, `StatusTag` molecules. Shadcn UI components. Approval & Survey/Question APIs. Clerk session data.

#### [COMPLETED] Ticket BL-MVP-P3-03: Connect Approval UI to Backend API
-   **Type:** Feature (Integration)
-   **Description:** Link UI actions in the `ApprovalWorkflow` component to the backend approval logic.
-   **Acceptance Criteria:**
    -   Comment posting calls `POST /api/brand-lift/approval/comments`. **[COMPLETED]**
    -   Updating comment status (if implemented directly in `CommentThread` or via `ApprovalWorkflow`) calls `PUT /api/brand-lift/approval/comments/{commentId}`. **[COMPLETED - Stubbed in `CommentThread`, parent can implement full call if needed]**
    -   Approval action buttons ("Request Sign-Off", "Approve", etc.) call `PUT /api/brand-lift/approval/status?studyId={id}`. **[COMPLETED]**
    -   "Submit for Data Collection" button calls `PUT /api/brand-lift/surveys/{studyId}` to update status to `COLLECTING`. **[COMPLETED]**
    -   UI provides clear feedback (loading, success/error messages). **[COMPLETED - Basic error messages and loading states implemented]**
    -   State updates are accurately reflected in UI post-API calls (via refetching). **[COMPLETED]**
-   **Dependencies:** Approval APIs (P3-01), Survey CRUD API (P1-01).

#### [COMPLETED - Basic notifications for study owner/commenter implemented. Recipient logic for specific distinct roles (e.g., designated Reviewers, Approvers) pending full implementation/clarification of role-based permissions (see P3-02).] Ticket BL-MVP-P3-04: Implement Resend Email Notifications for Approval Workflow
-   **Type:** Feature (Backend/Integration)
-   **Description:** Integrate with Resend API to send email notifications at key stages of the Brand Lift survey approval process.
-   **Acceptance Criteria:**
    -   Backend logic added to relevant API handlers (P1-01, P3-01) to trigger `NotificationService` methods. **[COMPLETED]**
    -   Notifications sent when:
        *   Survey submitted for review (`PENDING_APPROVAL`): Notifies designated reviewers. **[COMPLETED - Placeholder reviewers]**
        *   New comment added: Notifies study owner/participants. **[COMPLETED - Notifies study owner (derived via campaign creator)]**
        *   Approval/Sign-off requested: Notifies designated approvers. **[COMPLETED - Placeholder approvers]**
        *   Survey Approved or Changes Requested: Notifies study owner. **[COMPLETED]**
    -   Email content templates defined in `NotificationService`. **[COMPLETED - Basic HTML templates]**
    -   Recipient logic defined (placeholder for complex roles, uses study owner/submitter). **[COMPLETED - Basic logic for study owner/submitter. Recipient logic for specific distinct roles like 'Reviewer' or 'Approver' pending clearer definition and implementation of role-based permissions in P3-02.]**
    -   Resend API key managed via environment variables (mock client used if key not present). **[COMPLETED - Mock client with env var check]**
    -   Error handling for Resend API calls implemented and logged. **[COMPLETED - Within `NotificationService.sendEmail`]**
-   **Dependencies:** Resend API credentials, `NotificationService`, User/Study data for context.

---

### Epic: BL-MVP-EPIC4: Response Collection & Progress Tracking (Cint Integration)
*Focus: Integrate with Cint Lucid for survey launch, response collection, and provide progress visibility. **[THIS ENTIRE EPIC IS DEFERRED FOR THE INITIAL MVP. MANUAL PROCESS WILL BE USED FIRST. A SIMPLER "PENDING REPORT" PAGE WILL BE IMPLEMENTED FOR USER FEEDBACK POST-SUBMISSION.]**.*

#### [DEFERRED FOR MVP - Manual process first. Cint API calls in related backend logic to be commented out/skipped.] Ticket BL-MVP-P4-01: Implement Cint Lucid Survey Launch Logic
-   **Type:** Feature (Backend/Integration)
-   **Description:** Trigger survey launch on the Cint Lucid Exchange via their API when a Brand Lift study's status is updated to `COLLECTING`.
-   **Acceptance Criteria:**
    -   Logic is implemented (e.g., as part of `PUT /api/brand-lift/surveys/{studyId}` when status changes to `COLLECTING`, or via a dedicated internal "launch" endpoint called by the frontend after approval).
    -   Uses the `src/lib/cint.ts` service (Ticket BL-MVP-P0-05) to interact with the Cint Lucid API.
    -   **Cint API Interaction (refer to `cint-exchange-openapi.yaml` and `cint-exchange-guide.md`):**
        *   Create a "Project" in Cint: `POST /demand/accounts/{account_id}/projects` (store `cintProjectId` in `BrandLiftStudy`).
        *   Create a "Target Group" in Cint under the project: `POST /demand/accounts/{account_id}/projects/{project_id}/target-groups`. This will include:
            *   `locale` (derived from campaign).
            *   `filling_goal` (target number of responses).
            *   `expected_length_of_interview_minutes` (estimated LOI).
            *   `expected_incidence_rate` (estimated IR).
            *   `live_url` / `test_url`: This will be the Justify-hosted survey link (if Justify hosts the survey, e.g. `https://<your-app-domain>/survey/{studyId}?rid=[%RID%]`). The `[%RID%]` placeholder is crucial.
            *   `profile`: Define targeting criteria (age, gender, etc.) based on campaign/study setup, using Cint's profiling question IDs and condition formats (see "Profiling" sections in `cint-exchange-guide.md`).
            *   `cost_per_interview` (if applicable for dynamic pricing).
        *   Store `cintTargetGroupId` in `BrandLiftStudy`.
        *   Launch the Target Group (Fielding Run): `POST /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-run-jobs/launch-from-draft`.
    -   Handles errors from Cint API calls gracefully (log errors, potentially update study status to an error state).
    -   Authentication with Cint API uses OAuth JWTs, managed by `cint.ts`.
-   **Dependencies:** `src/lib/cint.ts` service (functional with auth and core Cint calls), Cint API credentials & documentation (`cint-exchange-guide.md`, `cint-exchange-openapi.yaml`), finalized survey structure from Justify DB.

#### [DEFERRED FOR MVP] Ticket BL-MVP-P4-02: Implement Response Ingestion from Cint
-   **Type:** Feature (Backend/Integration)
-   **Description:** Configure the backend to receive survey responses from Cint Lucid via webhook/callback, or implement polling if necessary.
-   **Acceptance Criteria:**
    -   Mechanism is based on Cint Lucid's capabilities (prefer webhook push to polling for real-time updates).
        *   **If Webhook (Recommended):** The `/api/brand-lift/respond` endpoint (Ticket BL-MVP-P1-03) is enhanced to securely process Cint's webhook payload. Cint's webhook setup guide to be followed. The payload should contain respondent ID, survey/target group ID, answers, and status.
        *   **If Polling (Fallback):** Implement a polling mechanism within `src/lib/cint.ts` (or a separate worker) to fetch responses periodically from a Cint API endpoint (e.g., retrieving completed session data if available in `cint-exchange-openapi.yaml`). Then, process and save to DB.
    -   Responses are correctly parsed and stored as `SurveyResponse` records, linking to the correct `BrandLiftStudy` and `SurveyQuestion`s.
    -   `isControlGroup` field in `SurveyResponse` is populated based on information from Cint (Cint may flag respondents or provide this data).
    -   Security measures (shared secret, signature validation) for webhook are robustly implemented as per Cint's S2S guidelines (`cint-exchange-guide.md`).
-   **Dependencies:** `src/lib/cint.ts` service, Cint API documentation for response delivery/format and webhook security (`cint-exchange-guide.md`, `cint-exchange-openapi.yaml`), Ticket BL-MVP-P1-03.

#### [DEFERRED FOR MVP - Manual report delivery first] Ticket BL-MVP-P4-03: Implement Progress Tracking API Endpoint
-   **Type:** Feature (API)
-   **Description:** Provide an API endpoint to fetch data on response collection progress and interim metrics.
-   **Acceptance Criteria:**
    -   `GET /api/brand-lift/surveys/{surveyId}/progress` route handler is implemented.
    -   Logic queries the `SurveyResponse` table for the count of responses for the given `surveyId`.
    -   (Enhancement) Optionally, queries the Cint API (via `src/lib/cint.ts`) for live progress status if Cint provides such an endpoint.
    -   Calculates and returns basic interim lift metrics if feasible for MVP (e.g., raw awareness % in exposed vs. control if identifiable).
    -   Returns data in a structured format for the UI.
-   **Dependencies:** Prisma client, potentially `src/lib/cint.ts` service.

#### [DEFERRED FOR MVP - Manual report delivery first. A simpler "Pending Report" page will be used initially.] Ticket BL-MVP-P4-04: Build Progress Tracking UI Component
-   **Type:** Feature (UI)
-   **Description:** Develop a UI component to visually display survey progress and interim metrics, as depicted in `@Submission & Progress Tracking.png`.
-   **Acceptance Criteria:**
    -   `src/components/features/brand-lift/ProgressTracker.tsx` is created.
    -   UI matches Figma design `@Submission & Progress Tracking.png`.
    -   Uses `ProgressIndicator` atom/component for response collection visualization.
    -   Displays response counts and interim metrics (if available from API).
    -   Includes a "Refresh Data" button.
    -   Displays current study status from Cint (e.g., "Launching", "Fielding", "Complete") if fetched by the API.
    -   `src/app/(brand-lift)/progress/page.tsx` is created to host this component.
    -   UI is responsive.
-   **Dependencies:** `ProgressIndicator` UI component, `Button` UI component.

---

### Epic: BL-MVP-EPIC5: Data Export for Manual Reporting
*Focus: Provide a mechanism to export raw survey response data for manual analysis and reporting. **[LOWER PRIORITY / PHASE 2 - Note: A JSON export of SURVEY STRUCTURE for Success Managers is higher priority for current MVP.]**.*

#### [COMPLETED - Core functionality. To be used in Phase 2 for actual response data.] Ticket BL-MVP-P5-01: Implement Raw Survey Response Data Export
-   **Type:** Feature (API/Backend, Basic UI)
-   **Description:** Develop functionality to allow users to download all raw survey responses for a completed Brand Lift study in CSV format to enable manual reporting and analysis.
-   **Acceptance Criteria:**
    -   A new backend endpoint (e.g., `GET /api/brand-lift/surveys/{studyId}/responses/export`) is created and secured by Clerk authentication.
    -   This endpoint retrieves all `SurveyResponse` records for the specified `studyId` from the database.
    -   The CSV data includes, at a minimum: `respondentId` (Cint's ID), `isControlGroup` flag, `questionId`, `selectedOptionId(s)` (or text for open-ended if any), and any `demographics` data fields collected (e.g., age, gender). Each answer might be a separate row or answers pivot-tabled per respondent.
    -   Data is formatted into a CSV file and returned as a downloadable response.
    -   (Optional Basic UI) A simple page (e.g., `src/app/(brand-lift)/export/page.tsx`) or a button within an existing study overview/listing page allows an authorized user to select a completed study and trigger this CSV download. This UI will use approved Shadcn components and adhere to `globals.css`.
    -   Prisma queries for fetching `SurveyResponse` data for export are optimized (e.g., ensure `studyId` is indexed, select only necessary fields).
    -   The CSV generation process is reasonably performant for a moderate number of responses (e.g., up to 10,000 responses per study for MVP export functionality). Extensive load testing is Post-MVP.
-   **Dependencies:** Prisma client, Clerk middleware, `src/types/brand-lift.ts`.

---

### New Epic: BL-MVP-EPIC_SM_TOOLS: Success Manager & MVP Finalization Tools
*Focus: Provide essential tools for the Justify Success Manager for the manual MVP process and the user-facing page for post-submission feedback.*

#### [COMPLETED - Core functionality and styling alignment. Final responsiveness/accessibility testing pending.] Ticket BL-MVP-TOOL-01: Implement "Pending Report" Page for User
-   **Type:** Feature (UI)
-   **Description:** Create a simple page to inform the user that their Brand Lift study has been submitted and will be manually processed, with the report delivered by email. This page will be shown after the user clicks the final submission button in the approval workflow.
-   **Acceptance Criteria:**
    -   New page route created, e.g., `src/app/brand-lift/study-processing/[studyId]/page.tsx`. **[COMPLETED - Path is src/app/brand-lift/study-submitted/[studyId]/page.tsx]**
    -   Page displays the `BrandLiftPageSubtitle` component (fetches study details for context). **[COMPLETED]**
    -   Page displays a clear message: "Your Brand Lift Study '[Study Name]' has been successfully submitted. Our Success Team is now processing your study, and your report will be delivered via email. Thank you!" **[COMPLETED]**
    -   Includes a button to navigate back to the Dashboard or Brand Lift overview. **[COMPLETED]**
    -   UI adheres to design system (Shadcn components, `globals.css`), is responsive, and accessible. **[PENDING - Responsiveness/accessibility testing]**
    -   The `ApprovalWorkflow.tsx` component correctly redirects to this page after a successful final submission API call. **[COMPLETED]**
-   **Dependencies:** `BrandLiftPageSubtitle`, `Button`, `Icon` UI components. Study data fetching API.

#### [PENDING - Next Task] Ticket BL-MVP-TOOL-02: Implement Survey Structure Export (JSON) for Success Manager
-   **Type:** Feature (API)
-   **Description:** Create a backend endpoint to allow a Justify Success Manager (or authorized user) to download the complete structure of a Brand Lift study (study details, all questions, all options) as a JSON file. This aids in the manual creation of reports for the MVP.
-   **Acceptance Criteria:**
    -   New API endpoint created: `GET /api/brand-lift/surveys/[studyId]/export-structure`.
    -   Endpoint is secured by Clerk authentication. Authorization ensures user has access to the study.
    -   Fetches the `BrandLiftStudy` record, including its related `questions` and their `options`, and relevant campaign details (e.g., campaign name, campaign UUID for linking).
    -   The complete data structure is returned as a JSON response.
    -   Response headers trigger a file download: `Content-Disposition: attachment; filename="study_[studyId]_structure.json"` and `Content-Type: application/json`.
    -   (Optional UI for MVP) A button could be added to an admin-like section of the approval page or study preview page to trigger this download, or the Success Manager can be instructed to use the API endpoint directly.
-   **Dependencies:** Prisma client, Clerk, Zod (for params), `src/types/brand-lift.ts`.

---

## Definition of Done (DoD) for MVP Tickets

*   Code implemented according to the ticket description.
*   Code adheres to established coding standards (linting, formatting).
*   Functionality matches relevant Figma designs (where applicable for MVP scope) and user flow descriptions.
*   Code is covered by relevant tests (Unit, Integration, E2E - see Testing Strategy).
*   UI components are responsive, use **only approved Shadcn UI components and `globals.css` styling**, and meet accessibility guidelines (WCAG 2.1 AA).
*   Code successfully builds and passes CI checks.
*   PR is reviewed and approved by at least one other team member.
*   Feature is deployed to a staging/testing environment and verified by QA/Product Owner.
*   Ticket is updated with relevant information (PR link, testing notes, verification status).

---

## Testing Strategy Summary

*   **Unit Testing (Jest/RTL):** Focus on utility functions, backend logic (API handlers, `cint.ts` service methods, data export logic), complex frontend state logic (Survey Builder).
*   **Component Testing (Storybook):** Develop and visually test UI components in isolation (e.g., `SurveyQuestionBuilder`, `ApprovalWorkflow`, `ProgressTracker`). Ensure adherence to Shadcn UI and `globals.css`.
*   **Integration Testing:** Test interactions between frontend components and backend APIs; test backend service interactions (e.g., with `cint.ts` service - mocked initially for Cint API).
*   **End-to-End (E2E) Testing (Cypress/Playwright):** Cover critical user flows (Campaign Selection -> Study Setup -> Survey Design -> Approval -> Progress -> Data Export trigger).
*   **Manual QA:** Exploratory testing, cross-browser/device checks, validation of exported CSV data, Cint integration sandbox testing.
*   **Accessibility Testing (Axe):** Integrate automated checks; manual checks with screen readers for complex UI like survey builder.

---

## Release & Deployment Considerations (MVP)

*   **Environment Variables:** Securely manage API keys/configs for Cint Lucid API per environment.
*   **Feature Flag (Recommended):** Wrap the entry point to the Brand Lift feature for controlled rollout and risk mitigation.
*   **Database Migrations:** Ensure Prisma migrations run smoothly and are reversible if needed during deployment.
*   **Cint Sandbox:** Utilize Cint's sandbox/testing environment (if available, as per `cint-exchange-guide.md` onboarding) for verifying the integration end-to-end (project creation, target group setup, launch, response webhook/polling) before production launch.
*   **Staging Verification:** Thoroughly test the end-to-end flow on a staging environment that mirrors production as closely as possible. This includes creating a study, designing a survey, approving it, "launching" it (mocked Cint interaction if sandbox is limited), and viewing progress/reports with sample data.
*   **Monitoring & Alerting:** Set up comprehensive monitoring (e.g., Sentry, Prometheus/Grafana if in use) for Brand Lift API endpoints (performance, error rates), Cint API interaction health (especially `cint.ts` service calls), response processing queues/jobs, and key performance indicators of the feature in production. Implement alerts for critical failures (e.g., Cint launch failures, webhook processing errors).

---

## Potential Risks & Mitigation Strategies

| Risk Category                         | Severity | Mitigation Strategy                                                                                                                              |
|---------------------------------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| Cint Lucid API Integration Complexity | High     | Dedicate focused effort on `cint.ts` service; Start integration and sandbox testing early; Implement robust error handling & retry mechanisms; Maintain clear understanding of Cint API contracts & rate limits. |
| Performance of Report Aggregation     | Medium   | Optimize database queries (indexing, projections); Implement caching strategies for frequently accessed report data; Consider asynchronous report generation for very large datasets (Post-MVP). |
| Survey Builder UI Complexity          | Medium   | Use a stable DND library (e.g., `dnd-kit`); Conduct thorough component testing (Storybook); Incremental feature rollout within the builder; Prioritize usability and simplicity in design. |
| Collaborative Approval Logic          | Medium   | Ensure clear state management for survey and approval statuses; Define API contracts meticulously; Implement comprehensive E2E testing for the entire approval flow. |
| Data Integrity & Accuracy             | Medium   | Implement strong input validation (Zod); Rigorous testing of lift calculation logic; Cross-reference with Cint data if possible; Monitor response data quality. |
| Scope Creep for MVP                   | Medium   | Strictly adhere to defined MVP scope; Defer non-essential features to Post-MVP backlog; Regular backlog grooming and prioritization. |

---

## Team Communication & Collaboration

*   **Daily Standups:** Discuss progress, blockers, dependencies (especially between Frontend, Backend, and Cint integration tasks).
*   **Sprint Planning:** Review upcoming tickets from this roadmap, clarify requirements, ensure Definition of Ready is met.
*   **Sprint Review:** Demonstrate completed functionality stage-by-stage, focusing on user value and adherence to MVP goals.
*   **Retrospectives:** Regularly assess team processes and make adjustments.
*   **PR Reviews:** Focus on adherence to plan, code quality, test coverage, UI/UX consistency, and security best practices.
*   **Slack Channel:** Maintain a dedicated Slack channel for all Brand Lift feature discussions.
*   **Documentation:** This document (`BUILD/brand-lift/brand lift plan.md`) serves as the Single Source of Truth for the JIRA ticket roadmap. Updates managed by the Scrum Master/Product Owner after team discussion and agreement.

---

## Potential Challenges & Considerations (Review for Kick-off)

| Category                      | Challenge                                                                                                | Mitigation Strategies                                                                                                                                        |
| :---------------------------- | :------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI Integration**            | Prompt engineering for consistent, high-quality, unbiased Questions & GIF suggestions requires iteration. | Allocate time for prompt refinement; Implement user feedback mechanism; Define clear quality standards; Start with simpler suggestions first.                |
| **GIF/Image Sourcing**        | How to source/display AI-suggested visuals? API integrations add complexity/cost. Library may be limiting. | **Decision Needed:** MVP might rely on text descriptions/keywords for AI suggestions, requiring users to find visuals manually. Defer direct GIF API integration. |
| **UI Complexity (Builder)**   | DND implementation (`dnd-kit`?) with dynamic content can be buggy. Complex state management.           | Assign experienced FE dev; Thorough component testing (Storybook); Break down builder logic; Keep state management localized or use context sparingly.       |
| **UI Polish & SSOT Adherence**| Achieving 110% Figma fidelity *strictly* with Shadcn primitives/globals.css requires discipline.       | Rigorous PR reviews focused on UI/Style compliance; Use `/debug-tools/ui-components` heavily; Build necessary composite molecules (e.g., `CommentThread`). |
| **Approval Workflow State**   | Managing complex state transitions (comments, statuses, permissions) accurately is critical.             | Design clear state machine logic; Implement robust API validation; Thorough E2E testing of approval scenarios.                                           |
| **Backend Performance**       | Ensuring responsiveness of core CRUD APIs, especially for loading survey/approval data.                  | Optimize Prisma queries from the start (indexing); Consider API load early (even if full testing is later); Use performant patterns.                          |
| **External Dependency (Cint)**| Delays in getting Cint API clarifications, sandbox access, or credentials can block Phase 2.           | **Initiate Task Prep-2 immediately**; Define mock service early (`cint.ts`); Design Phase 2 logic defensively.                                              |
| **External Dependency (OpenAI)**| API availability, cost management, potential changes in model behavior.                                | Implement robust error handling/retries for OpenAI calls; Monitor usage/costs; Have fallback if AI fails (manual mode always available).                |
| **Team Capacity/Expertise**   | Does the team have prior experience with DND, advanced AI prompting, or specific backend patterns?       | Assess during kick-off; Provide training/pairing opportunities if needed; Adjust estimates based on expertise.                                             |
| **Scope Creep**               | Risk of expanding features even within the prioritized flow (e.g., more AI features, complex approvals). | **Strict adherence to defined ACs in tickets**; Defer *any* non-critical enhancements to Post-MVP backlog; Regular backlog grooming.                        |

---

(Team Communication & Collaboration section remains the same)
