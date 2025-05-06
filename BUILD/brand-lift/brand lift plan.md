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

This document provides a granular, step-by-step JIRA ticket roadmap for building the Minimum Viable Product (MVP) of the Brand Lift feature. The goal is to deliver a **production-ready** core workflow enabling users to create, design, and approve brand lift studies integrated with existing campaigns. The initial focus is on the **high-priority flow**, leveraging the Cint Lucid Exchange API conceptually, with actual integration and data export deferred to Phase 2.

We will follow established architectural patterns, prioritize **minimizing cognitive load**, ensure **seamless integration**, and leverage **AI assistance** (OpenAI `gpt-4o` or similar) for question and visual suggestions. **Adherence to SSOT, existing codebase patterns, and high-quality implementation are paramount.**

**!! HIGH PRIORITY MVP FOCUS (Phase 1 Delivery) !!**
The absolute priority is to deliver the core user workflow from campaign selection through survey design and approval, enabling users to reach the point of submitting a study for data collection. This includes:
1.  **Campaign Selection & Review:** (`@Select - Edit - Add Campaign.png` -> `@Select Campaign.png`)
2.  **Survey Design:** (`@Survey Design.png`) with robust AI assistance (OpenAI `gpt-4o` or similar) for **question AND image/GIF suggestions**.
3.  **Survey Preview:** (`@Survey Approval Screen.png` - preview section)
4.  **Collaborative Approval:** (`@Collaborative Approval & Formal Sign-Off.png`)
5.  **Submission Trigger:** The final action button before data collection.
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
    -   OpenAPI spec file (`brand_lift_api.yaml` or similar) is created in the project documentation.
    -   Core CRUD operations for Surveys, Questions, Options, and Approval (Comments, Status) are defined with basic request/response schemas based on `src/types/brand-lift.ts`.
    -   This spec serves as the initial contract for parallel Frontend/Backend development.

#### Task Prep-2: Initiate Cint API Deep Dive & Credential Acquisition
-   **Type:** Research/Chore
-   **Owner:** Assigned Backend Dev / Tech Lead
-   **Description:** Begin the work outlined in **Ticket BL-MVP-P4-02.1** *now*. This includes deeply reviewing Cint documentation (`cint-exchange-guide.md`, `cint-exchange-openapi.yaml`), contacting Cint support for clarifications (rate limits, errors, targeting, hosting), and **initiating the process to obtain Sandbox and Production API credentials.** Define mock responses for the `cint.ts` service.
-   **Acceptance Criteria:**
    -   Clear understanding and documentation of key Cint API constraints and workflows initiated.
    -   Process for obtaining Cint credentials underway.
    -   Initial mock structures for `cint.ts` service defined for testing.

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
(Ensure this structure is strictly followed to maintain SSOT. Reuse is key.)
```plaintext
src/
├── app/
│   ├── (brand-lift)/         # <--- NEW Route Group (Protected by Clerk Auth - reusing existing `clerkMiddleware` pattern)
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
*   **Authentication & Authorization (Clerk):** Apply the existing `clerkMiddleware` pattern (from `src/middleware.ts`) to secure all API endpoints requiring authentication. Define roles/permissions clearly if needed.
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
    -   `src/types/brand-lift.ts` file is created and populated.
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
        *   `BrandLiftStudy` (or `BrandLiftSurvey`): Fields as per defined types in Ticket BL-MVP-P0-01. Relation to `CampaignWizardSubmission` (e.g., `campaign CampaignWizardSubmission @relation(fields: [campaignId], references: [id])`). Enum for `status`.
        *   `SurveyQuestion`: Fields as per defined types. Relation to `BrandLiftStudy`. Enum for `questionType`.
        *   `SurveyOption`: Fields as per defined types. Relation to `SurveyQuestion`.
        *   `SurveyResponse`: Fields as per defined types. Relation to `BrandLiftStudy`. Store `answers` and `demographics` as `Json`.
        *   `BrandLiftReport`: Fields as per defined types. Relation to `BrandLiftStudy`. Store `metrics` and `recommendations` as `Json` or appropriate types.
        *   `SurveyApprovalComment`: Fields as per defined types. Relation to `SurveyApprovalStatus` or `BrandLiftStudy` and optionally `SurveyQuestion`.
        *   `SurveyApprovalStatus`: Fields as per defined types. Relation to `BrandLiftStudy`. Enum for `status`.
    -   All necessary relations (one-to-many, one-to-one) are correctly defined with appropriate `onDelete` and `onUpdate` behaviors.
    -   Indexes are added for frequently queried fields (e.g., `surveyId` on `SurveyQuestion` and `SurveyResponse`).
    -   Schema definitions are syntactically correct and pass Prisma validation.
    -   Schema aligns with details from `brand-lift.md` Section 4, Phase 1, Step 1 and `plan.md` Phase 1.
-   **Files to be Created/Modified:** `prisma/schema.prisma`

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P0-03: Run Prisma Migrations & Generate Client
-   **Type:** Chore
-   **Description:** Apply schema changes to the database and update the Prisma client.
-   **Acceptance Criteria:**
    -   `npx prisma migrate dev --name add_brand_lift_models` command runs successfully.
    -   `npx prisma generate` command runs successfully.
    -   Prisma client is updated without errors.
    -   Database schema reflects the new models.

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P0-04: Create Brand Lift API Route Structure
-   **Type:** Chore
-   **Description:** Set up the basic API folder structure for Brand Lift endpoints.
-   **Acceptance Criteria:**
    -   Directories `surveys`, `questions`, `approval`, `respond`, `progress`, `export` are created under `src/app/api/brand-lift/`.
    -   Folder structure matches the plan.
-   **Files to be Created/Modified:** New directories under `src/app/api/brand-lift/`

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P0-05: Create Cint Lucid Service Stub
-   **Type:** Chore
-   **Description:** Set up the file and initial structure for Cint Lucid API interactions.
-   **Acceptance Criteria:**
    -   `src/lib/cint.ts` is created.
    -   File contains placeholder functions or class structure for future Cint API calls (e.g., `launchSurvey`, `getSurveyStatus`, `fetchResponses`).
-   **Files to be Created/Modified:** `src/lib/cint.ts`

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P0-06: Create Mux Service Stub (Post-MVP Prep)
-   **Type:** Chore
-   **Description:** Set up the file structure for Mux API interactions (for Post-MVP video stimulus feature).
-   **Acceptance Criteria:**
    -   `src/lib/mux.ts` is created.
    -   File contains placeholder functions (e.g., `uploadVideo`, `getPlaybackInfo`).
-   **Files to be Created/Modified:** `src/lib/mux.ts`

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P0-07: Create Seed Data
-   **Type:** Chore
-   **Description:** Create necessary seed data in the development database to facilitate testing of the campaign selection, study setup, and potentially approval workflows.
-   **Acceptance Criteria:**
    -   Seed script or manual seeding process populates dev DB with sample `CampaignWizardSubmission` records (status: completed).
    -   Seed data includes sample users with appropriate roles for testing permissions (if applicable).
    -   Seed data allows developers to easily test the flow defined in Epics 2 & 3.
-   **Dependencies:** Ticket BL-MVP-P0-03 (Schema migrated).

---

### Epic: BL-MVP-EPIC1: Backend Foundation & Core APIs
*Focus: Implement the essential backend endpoints for creating studies, managing questions, and handling approvals. **Ensure high performance, adherence to the OpenAPI spec (Prep-1), and robust error handling for production readiness.**.*

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P1-01: Implement Survey CRUD Endpoints
-   **Type:** Feature (API)
-   **Description:** Allow creating, reading, and updating Brand Lift surveys (studies), including core study parameters (name, funnel stage, KPIs, status). These endpoints will be protected by Clerk authentication and **must adhere to the defined OpenAPI spec (Task Prep-1)**.
-   **Acceptance Criteria:**
    -   Route handlers in `src/app/api/brand-lift/surveys/` are implemented using existing API patterns (`tryCatch`, `withValidation` with Zod schemas):
        -   `POST /`: Creates a new `BrandLiftStudy` record linked to a `campaignId` (from `CampaignWizardSubmission`). Validates input: `name` (string, required), `funnelStage` (enum/string, required), `primaryKpi` (string, required), `secondaryKpis` (array of strings, optional). Returns the created study object.
        -   `GET /?campaignId={id}`: Fetches all `BrandLiftStudy` records associated with a given `campaignId`. Returns an array of study objects.
        -   `GET /{studyId}`: Fetches a specific `BrandLiftStudy` by its `id`. Returns the study object.
        -   `PUT /{studyId}`: Updates `BrandLiftStudy` details (e.g., `name`, `status`, `funnelStage`, `primaryKpi`, `secondaryKpis`). Validates input. Returns the updated study object.
    -   All endpoints use Clerk middleware for authentication and authorization (user must have permission to access/modify studies for the campaign).
    -   Zod schemas are defined for request body validation and response sanitization.
    -   Data is correctly persisted to and retrieved from the database using Prisma client (`@/lib/db`).
    -   Appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500) and informative error responses are returned.
    -   Endpoints are performant for expected load (consider query optimization even at this stage).
    -   Uses established error handling patterns (`tryCatch`) and implements appropriate logging for key events and errors.
-   **Dependencies:** Prisma client (`@/lib/db`), Clerk middleware, Zod, `src/types/brand-lift.ts`, OpenAPI spec, Logging framework.

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P1-02: Implement Question/Option CRUD Endpoints
-   **Type:** Feature (API)
-   **Description:** Enable management of survey questions and their answer options within a specific Brand Lift study, including ordering and settings. Endpoints protected by Clerk and **must adhere to the defined OpenAPI spec (Task Prep-1)**.
-   **Acceptance Criteria:**
    -   Route handlers in `src/app/api/brand-lift/surveys/{studyId}/questions/` (or `/api/brand-lift/questions/` with `studyId` in body/query) are implemented using existing API patterns:
        *   `POST /`: Creates a new `SurveyQuestion` and its associated `SurveyOption`(s) for a given `studyId`. Validates input: `text`, `questionType`, `order`, `isRandomized`, `isMandatory`, `options` (array of { `text`, `imageUrl?`, `order` }). Uses database transaction to ensure atomicity.
        *   `GET /`: Fetches all `SurveyQuestion`s and their `SurveyOption`s for a given `studyId`, ordered by `order`.
        *   `PUT /{questionId}`: Updates a `SurveyQuestion` (e.g., `text`, `questionType`, `order`, settings). Validates input.
        *   `DELETE /{questionId}`: Deletes a `SurveyQuestion` and its associated `SurveyOption`s (cascade delete in Prisma or explicit transaction).
        *   `POST /{questionId}/options`: Adds a new `SurveyOption` to a question.
        *   `PUT /options/{optionId}`: Updates a `SurveyOption` (e.g., `text`, `imageUrl`, `order`). Validates input.
        *   `DELETE /options/{optionId}`: Deletes a `SurveyOption`.
    -   Clerk authentication and authorization applied (user must own the study or have edit permissions).
    -   Zod schemas for validation of request bodies and response sanitization.
    -   Data and relationships are correctly managed in the database. Ordering updates are reflected.
    -   Database transactions are used correctly for atomic updates (e.g., adding question + options).
    -   Endpoints are performant, especially `GET` for fetching survey structure.
    -   Implement appropriate logging for key events and errors.
-   **Dependencies:** Prisma client, Clerk middleware, Zod, `src/types/brand-lift.ts`, OpenAPI spec, Logging framework.

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

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P2-00: Build Core UI Molecules
-   **Type:** Feature (UI)
-   **Description:** Build reusable molecule components needed for the Brand Lift feature, strictly using Shadcn primitives from `src/components/ui` and styles from `globals.css`.
-   **Acceptance Criteria:**
    -   `CommentThread` molecule created (likely using `Card`, `Avatar`, `Input`, `Button` primitives) for displaying and adding comments per `@Collaborative Approval & Formal Sign-Off.png`.
    -   `StatusTag` atom/molecule created (likely using `Badge` primitive) for displaying comment/approval statuses with appropriate colors.
    -   Components are added to Storybook (if used) and the `/debug-tools/ui-components` page for validation.
    -   Components are responsive and accessible.
-   **Dependencies:** Base Shadcn UI components in `src/components/ui`.

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P2-01: Build Campaign Selection Component & Page
-   **Type:** Feature (UI)
-   **Description:** Create the initial page where users select an existing campaign for their Brand Lift study. The UI must match `@Select - Edit - Add Campaign.png`, showing a list/dropdown of completed campaigns and action buttons.
-   **Acceptance Criteria:**
    -   `src/app/(brand-lift)/campaign-selection/page.tsx` is created and uses `ConditionalLayout`.
    -   `src/components/features/brand-lift/CampaignSelector.tsx` is created.
    -   Component fetches a list of user-accessible campaigns (requires a new or existing `/api/campaigns?user_accessible=true&status=completed` endpoint - **Task BL-MVP-P2-01.1**). Data should include campaign name, ID, and potentially other relevant details for selection.
    -   Campaigns are displayed in a selectable list or dropdown (e.g., using existing `Select` or `Table` component from `src/components/ui/`).
    -   UI is responsive and adheres to design system (`globals.css`, FontAwesome icons via `Icon` component).
    -   Selected campaign ID is passed to the study setup step.
    -   Includes buttons like "Edit", "+ Create New Campaign" (functionality for these might be deferred or link to existing Campaign Wizard flows), and a primary action button like "Setup Brand Lift Study" (replacing "Launch Selected Campaign" text if clearer).
    -   Clicking "Setup Brand Lift Study" navigates the user to the Campaign Review & Study Setup page (`/campaign-review-setup/{campaignId}`).
-   **Dependencies:** `Select` or `Table` UI component from `src/components/ui/`. **Task BL-MVP-P2-01.1** API endpoint.
-   **Sub-Tasks:**
    -   **Task BL-MVP-P2-01.1:** `FEAT(API): Create/Verify endpoint to list user-accessible completed campaigns`.

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P2-02: Build Campaign Review & Study Setup Page/Component
-   **Type:** Feature (UI)
-   **Description:** Develop the page where users review key details of the selected campaign and define the setup parameters (name, goals, KPIs) for the new Brand Lift study. UI must match `@Select Campaign.png`.
-   **Acceptance Criteria:**
    -   `src/app/(brand-lift)/campaign-review-setup/[campaignId]/page.tsx` is created, fetching campaign data based on the `campaignId` route parameter.
    -   A new component (e.g., `src/components/features/brand-lift/CampaignReviewStudySetup.tsx`) is created to display:
        *   Read-only campaign details (fetched via API using `campaignId`): Campaign Name, Primary Objective, Audience Summary, Platforms (as shown in `@Select Campaign.png`).
        *   Form fields for the **New Brand Lift Study**: Study Name, Funnel Stage selection, Primary KPI selection, Secondary KPI selection (as shown in `@Select Campaign.png`).
    -   The "Continue" button triggers a `POST /api/brand-lift/surveys` (Ticket BL-MVP-P1-01) call, passing the `campaignId` and the newly defined study parameters (`name`, `funnelStage`, `primaryKpi`, `secondaryKpis`).
    -   Upon successful creation (API returns the new `studyId`), the user is navigated to the survey design page (`/survey-design/{studyId}`).
    -   Client-side form validation is implemented (e.g., required fields).
    -   UI is responsive, adheres **strictly** to design system (Shadcn components from `src/components/ui`, styles from `globals.css`), and minimizes cognitive load with clear guidance.
    -   Ensure graceful handling and clear display for empty states (e.g., no selectable campaigns initially).
-   **Dependencies:** `Input`, `Select`, `Button`, `Form`, `Tooltip`, `Card` (likely) UI components from `src/components/ui/`. Ticket BL-MVP-P1-01 API. **API endpoint to fetch details for a specific campaign by ID (reuse existing if possible, or create following patterns).**

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P2-03: Implement Survey Question Builder UI with AI Assistance
-   **Type:** Feature (UI)
-   **Description:** Create the drag-and-drop interface for building surveys, directly reflecting the UI shown in `@Survey Design.png`, including **AI-assisted question generation AND image/GIF suggestions** capabilities using OpenAI (`gpt-4o` or similar).
-   **Acceptance Criteria:**
    -   `src/app/(brand-lift)/survey-design/[studyId]/page.tsx` is created to host the builder.
    -   `src/components/features/brand-lift/SurveyQuestionBuilder.tsx` is created.
    -   Integrates a DND library (e.g., `dnd-kit`, confirm if a standard exists) for question and option reordering. Use `DragHandle` molecule.
    -   **AI Assistance:**
        -   A "Suggest Questions" button (using `Button` component) triggers a call to a new backend endpoint: **Task BL-MVP-P2-03.1: `FEAT(API): Create /api/brand-lift/surveys/{studyId}/suggest-questions` endpoint.** This endpoint uses an AI model (e.g., GPT-4, via OpenAI SDK) to generate an array of relevant standard `SurveyQuestionData` (including `SurveyOptionData`) based on the study's `funnelStage`, `primaryKpi`, `secondaryKpis`, and potentially campaign creative context (if available).
        -   AI-suggested questions are pre-populated in the builder UI, allowing user editing.
    -   **Manual Building:**
        *   Users can add new questions (MVP: Single Choice, Multiple Choice using `Select` for type).
        *   Users can add text for question title and option text (using `Input`).
        *   Users can add Image/GIF URLs for options (MVP: direct URL input, future: integrate `UploadThing`).
        *   Users can configure randomization and mandatory toggles (using `Switch` from `src/components/ui/`).
    -   Core campaign creative (e.g., key image/video thumbnail from Campaign Wizard data) is displayed alongside the builder for context.
    -   UI elements (`Card` for questions, `Input`, `Button`, `Switch`, `Icon`) are from `src/components/ui/`.
    -   MVP Scope: Supports Text and Image/GIF options for answers. Video stimulus (Mux) is Post-MVP.
    -   UI is responsive, adheres to design system (`globals.css`), and prioritizes minimizing cognitive load (e.g., clear affordances, simple layouts).
    -   The 'Suggest Questions based on KPIs' button triggers a call to `/api/brand-lift/surveys/{studyId}/suggest-questions`. This backend service will utilize **GPT-4 (or a similar capable model)**.
    -   The AI prompt will be engineered to incorporate study KPIs, funnel stage, and campaign context (from `BrandLiftStudy` data) to generate relevant questions.
    -   AI-suggested questions should primarily be single-choice or multiple-choice, typically with 3-5 well-differentiated answer options, including 'None of the above' or similar where appropriate.
    -   A simple user feedback mechanism (e.g., thumbs up/down icons next to AI-suggested questions) is implemented to allow users to rate the relevance/quality of suggestions. (Note: Actual model tuning based on this feedback is Post-MVP).
    -   The core prompt structure and any significant pre/post-processing logic for AI question generation will be documented in a new file, e.g., `src/lib/ai/brandlift_prompts.ts`.
    -   **AI Assistance includes suggesting relevant and culturally sensitive Images/GIFs** based on question text and options (e.g., providing descriptions or searchable keywords).
    -   UI has a mechanism to display or allow searching for suggested images/GIFs (Note: Actual GIF sourcing/display mechanism needs careful implementation - see Challenges). UI built **strictly** with Shadcn primitives.
    -   Ensure graceful handling of empty states (no questions yet) and potential edge cases (long text).
    -   **Dependencies:** DND Library (e.g., `dnd-kit`), `Card`, `Input`, `Button`, `Switch`, `Icon`, `Select` UI components (from `src/components/ui/`). Image upload mechanism (MVP: URL input). **Task BL-MVP-P2-03.1** API endpoint.
    -   **Sub-Tasks:**
        -   **Task BL-MVP-P2-03.1:** `FEAT(API): Create /api/brand-lift/surveys/{studyId}/suggest-questions` endpoint.
        -   **Task BL-MVP-P2-03.2**: `CHORE: Define GPT-4 prompt structure for question generation, ensuring relevance to brand lift KPIs.`
        -   **Task BL-MVP-P2-03.3**: `CHORE: Define prompt structure for image/GIF suggestions.`
    -   Includes a platform switcher UI (e.g., Tabs or Buttons from Shadcn UI) if feasible for MVP.
    -   The "Submit for Review" functionality (Ticket BL-MVP-P2-06) is hosted on this page.
    -   UI is responsive and adheres **strictly** to design system (Shadcn components from `src/components/ui`, styles from `globals.css`).
    -   Loading state (e.g., using `Skeleton`) handled while fetching survey structure.
    -   **Dependencies:** `Tabs` UI component (optional from `src/components/ui`), Ticket BL-MVP-P1-02 API.

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P2-04: Connect Survey Builder to Backend API
-   **Type:** Feature (Integration)
-   **Description:** Persist survey design changes made in the `SurveyQuestionBuilder` UI to the backend.
-   **Acceptance Criteria:**
    -   All UI actions in `SurveyQuestionBuilder` (add, edit, delete, reorder question/option) are wired to call the corresponding backend API endpoints from Ticket BL-MVP-P1-02.
    -   Loading and saving states are implemented to provide user feedback.
    -   Changes are accurately reflected in the database.
-   **Dependencies:** Ticket BL-MVP-P1-02 APIs.

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P2-05: Build Survey Preview Page & Component
-   **Type:** Feature (UI)
-   **Description:** Create a dedicated page (`survey-preview/[studyId]/page.tsx`) and component (`SurveyPreview.tsx`) to display a preview of the survey, simulating different platforms, and allow submission for review. The UI should reflect the preview panel shown in `@Survey Approval Screen.png`.
-   **Acceptance Criteria:**
    -   `src/app/(brand-lift)/survey-preview/[studyId]/page.tsx` is created to host the `SurveyPreview.tsx` component, fetching data based on `studyId`.
    -   `src/components/features/brand-lift/SurveyPreview.tsx` is created/enhanced.
    -   Component fetches the survey structure using `GET /api/brand-lift/surveys/{studyId}/questions/` (Ticket BL-MVP-P1-02).
    -   Renders questions and options based on fetched data, simulating platform appearance (e.g., TikTok preview style as seen in `@Survey Approval Screen.png`).
    -   Includes a platform switcher UI (e.g., Tabs or Buttons from Shadcn UI) if feasible for MVP.
    -   The "Submit for Review" functionality (Ticket BL-MVP-P2-06) is hosted on this page.
    -   UI is responsive and adheres to design system (Shadcn components, `globals.css`).
-   **Dependencies:** `Tabs` UI component (optional from Shadcn), Ticket BL-MVP-P1-02 API.

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P2-06: Implement "Submit for Review" Functionality
-   **Type:** Feature (UI/Integration)
-   **Description:** Allow users to change the survey status to `PENDING_APPROVAL` by clicking the primary action button on the `survey-preview/[studyId]/page.tsx`.
-   **Acceptance Criteria:**
    -   A "Share Survey for Initial Review" button (or similar text, reflecting `@Survey Approval Screen.png`) is present on the `survey-preview/[studyId]/page.tsx`.
    -   Clicking the button calls `PUT /api/brand-lift/surveys/{studyId}` (Ticket BL-MVP-P1-01, passing the correct `studyId`) to update the survey status to `PENDING_APPROVAL`.
    -   User receives feedback on successful submission.
-   **Dependencies:** `Button` UI component, Ticket BL-MVP-P1-01 API.

---

### Epic: BL-MVP-EPIC3: Collaborative Approval Workflow
*Focus: Enable team feedback, comment tracking, and formal sign-off on surveys. **Emphasis on 110% UI polish matching `@Collaborative Approval & Formal Sign-Off.png`, robust state management, permission handling via Clerk, and seamless API integration.**.*

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P3-01: Implement Approval API Endpoints
-   **Type:** Feature (API)
-   **Description:** Create backend APIs for managing comments and the overall approval status of a survey. **Must adhere to the defined OpenAPI spec (Task Prep-1) and implement Clerk-based authorization.**
-   **Acceptance Criteria:**
    -   Route handlers in `src/app/api/brand-lift/approval/` (or nested under surveys) are implemented:
        *   `POST /comments`: Adds a `SurveyApprovalComment` (requires `surveyId`, `authorId` (Clerk User ID), `text`, optional `questionId`).
        -   `GET /comments?surveyId={id}&questionId={id}`: Fetches comments for a survey or a specific question within a survey.
        -   `PUT /comments/{commentId}`: Updates `SurveyApprovalComment` status (e.g., to `RESOLVED`, `NEED_ACTION`).
        -   `PUT /status?surveyId={id}`: Updates `SurveyApprovalStatus` record for a survey (e.g., sets `status` to `CHANGES_REQUESTED`, `APPROVED`, `SIGNED_OFF`; sets `requestedSignOff` boolean).
    -   Uses `tryCatch`, `withValidation` (Zod schema), and Clerk authentication.
    -   Data is correctly persisted/retrieved.
    -   Endpoints handle potential race conditions gracefully (e.g., multiple users commenting/approving).
    -   Performant queries for fetching comments and status.
    -   **Authorization logic implemented using Clerk:** Define which roles (e.g., 'Admin', 'Team Lead', 'Study Owner', 'Reviewer' - TBD) can perform specific actions (add comment, resolve comment, request sign-off, approve). API must reject unauthorized actions with 403.
    -   Implement appropriate logging for key events and errors.
-   **Dependencies:** Prisma client, Clerk middleware & user roles, Zod, `src/types/brand-lift.ts`, OpenAPI spec, Logging framework.

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P3-02: Build Approval Workflow UI Component
-   **Type:** Feature (UI)
-   **Description:** Implement the user interface for reviewing surveys, adding comments, and managing the approval process. The detailed commenting and status management UI should align with `@Collaborative Approval & Formal Sign-Off.png`.
-   **Acceptance Criteria:**
    -   `src/app/(brand-lift)/approval/page.tsx` is created to host the component.
    -   `src/components/features/brand-lift/ApprovalWorkflow.tsx` is created.
    -   Displays survey questions and options in a read-only format (reusing parts of `SurveyPreview` or a similar rendering logic).
    -   Implements comment threads per question (or for the overall survey). This will utilize a `CommentThread` molecule (to be built or adapted from existing UI, as per `brand-lift.md` UI analysis) which includes:
        *   Input field for new comments (using `Input` or `Textarea`).
        *   Display of existing comments with author (Clerk user name/avatar) and timestamp.
    -   Displays comment status tags (e.g., "OPEN", "RESOLVED", "NEED_ACTION") using a `StatusTag` atom (to be built or adapted, as per `brand-lift.md` UI analysis).
    -   Provides action buttons (using `Button` component):
        *   "Request Sign-Off" (updates `SurveyApprovalStatus.requestedSignOff`).
        *   "Approve" / "Request Changes" (updates `SurveyApprovalStatus.status`).
        *   "Submit for Data Collection" (updates `BrandLiftStudy.status` to `COLLECTING`). This button is only enabled if `SurveyApprovalStatus.status` is `APPROVED` or `SIGNED_OFF`.
    -   UI matches Figma designs provided. UI is responsive and adheres **strictly** to the design system (Shadcn components, `globals.css`).
    -   Loading/error states for fetching/posting comments and updating status are handled clearly (e.g., using `Skeleton`, standard error display patterns).
    -   UI elements like action buttons ('Request Sign-Off', 'Approve', 'Submit for Data Collection') are conditionally rendered or disabled based on the logged-in user's permissions fetched from the backend or Clerk session.
    -   Ensure graceful handling and clear display for empty states (e.g., no comments yet) and loading states.
-   **Dependencies:** **Ticket BL-MVP-P2-00** (Molecules: `CommentThread`, `StatusTag`), `Button`, `Input`, `Card`, `Avatar`? UI components (from `src/components/ui`). Ticket BL-MVP-P3-01 APIs. `src/types/brand-lift.ts`, Clerk session data.

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P3-03: Connect Approval UI to Backend API
-   **Type:** Feature (Integration)
-   **Description:** Link UI actions in the `ApprovalWorkflow` component to the backend approval logic.
-   **Acceptance Criteria:**
    -   Comment posting in the UI calls `POST /api/brand-lift/approval/comments`.
    -   Updating comment status in UI calls `PUT /api/brand-lift/approval/comments/{commentId}`.
    -   "Request Sign-Off" button calls `PUT /api/brand-lift/approval/status?surveyId={id}` to update the `SurveyApprovalStatus`.
    -   "Submit for Data Collection" button calls `PUT /api/brand-lift/surveys/{id}` (Ticket BL-MVP-P1-01) to update survey status to `COLLECTING`. This button is enabled only if the `SurveyApprovalStatus` is `SIGNED_OFF` (or `APPROVED` for MVP).
    -   UI provides clear feedback (loading states, success/error messages using standard patterns) for all actions.
    -   State updates (e.g., comment appearing, status changing) are reflected accurately in the UI after successful API calls.
-   **Dependencies:** Ticket BL-MVP-P3-01 APIs, Ticket BL-MVP-P1-01 API.

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P3-04: Implement Resend Email Notifications for Approval Workflow
-   **Type:** Feature (Backend/Integration)
-   **Description:** Integrate with Resend API to send email notifications at key stages of the Brand Lift survey approval process to facilitate collaboration.
-   **Acceptance Criteria:**
    -   Backend logic is added (e.g., within relevant API handlers in EPIC3 or via background jobs/event listeners) to trigger Resend email sends.
    -   Notifications are sent when:
        *   A survey is submitted for review (notifying designated reviewers/team).
        *   A new comment is added (potentially notifying the study owner or relevant participants).
        *   Approval/Sign-off is requested (notifying designated approvers).
        *   A survey is Approved or Rejected/Changes Requested (notifying the study owner).
    -   Email content templates are defined (simple text-based initially is fine).
    -   Recipient logic is defined (e.g., notify specific users based on roles associated with the study/campaign).
    -   Resend API key is securely managed via environment variables.
    -   Error handling for Resend API calls is implemented and logged.
-   **Dependencies:** Resend API credentials, defined email templates, user role/notification preference logic (TBD), Clerk user data for emails.

---

### Epic: BL-MVP-EPIC4: Response Collection & Progress Tracking (Cint Integration)
*Focus: Integrate with Cint Lucid for survey launch, response collection, and provide progress visibility. **[LOWER PRIORITY / PHASE 2]**.*

#### [LOWER PRIORITY / PHASE 2] Ticket BL-MVP-P4-01: Implement Cint Lucid Survey Launch Logic
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

#### [LOWER PRIORITY / PHASE 2] Ticket BL-MVP-P4-02: Implement Response Ingestion from Cint
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

#### [HIGH PRIORITY MVP FLOW] Ticket BL-MVP-P4-02.1: Investigate Cint Survey Presentation Mechanism (Parallel Task)
-   **Type:** Research/Chore - **High Priority**
-   **Description:** Determine how Cint presents surveys to respondents, including rich media support. Critically, investigate and document **Cint API constraints such as rate limits, error handling best practices (retry policies), and available respondent targeting parameters** by thoroughly reviewing `cint-exchange-guide.md` and `cint-exchange-openapi.yaml`, and liaising with Cint support if necessary.
-   **Acceptance Criteria:**
    -   Documented findings on Cint's survey hosting capabilities (e.g., custom HTML support for Mux videos Post-MVP, redirect links).
    -   Clarified and documented Cint API rate limits, recommended retry policies for transient errors, and available respondent targeting options (e.g., how to translate Justify campaign criteria to Cint's `profile` objects in Target Group creation as per `cint-exchange-guide.md`).
    -   A defined mock API response structure for key Cint interactions (e.g., survey launch, response webhook) to facilitate decoupled backend development.
    -   Findings shared in a dedicated Slack channel for Brand Lift and documented in `brand-lift.md` or a new `cint_integration_details.md`.
    -   Implement robust error handling and retry mechanisms for Cint API interactions, based on findings from this ticket and Cint documentation (e.g., handling common HTTP errors, idempotency for creation requests as per `cint-exchange-guide.md`).
-   **Dependencies:** Cint API documentation (`cint-exchange-guide.md`, `cint-exchange-openapi.yaml`), Cint support.
-   **Note:** **Priority: High.** Must be substantially completed before full implementation of BL-MVP-P4-01 begins. A fallback strategy (e.g., mock Cint service in `cint.ts`) should be defined to decouple development if Cint specifics cause delays.

#### [LOWER PRIORITY / PHASE 2] Ticket BL-MVP-P4-03: Implement Progress Tracking API Endpoint
-   **Type:** Feature (API)
-   **Description:** Provide an API endpoint to fetch data on response collection progress and interim metrics.
-   **Acceptance Criteria:**
    -   `GET /api/brand-lift/surveys/{surveyId}/progress` route handler is implemented.
    -   Logic queries the `SurveyResponse` table for the count of responses for the given `surveyId`.
    -   (Enhancement) Optionally, queries the Cint API (via `src/lib/cint.ts`) for live progress status if Cint provides such an endpoint.
    -   Calculates and returns basic interim lift metrics if feasible for MVP (e.g., raw awareness % in exposed vs. control if identifiable).
    -   Returns data in a structured format for the UI.
-   **Dependencies:** Prisma client, potentially `src/lib/cint.ts` service.

#### [LOWER PRIORITY / PHASE 2] Ticket BL-MVP-P4-04: Build Progress Tracking UI Component
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

#### [LOWER PRIORITY / PHASE 2] Ticket BL-MVP-P4-05: Connect Progress UI to Backend API
-   **Type:** Feature (Integration)
-   **Description:** Fetch and display live progress data in the `ProgressTracker` component.
-   **Acceptance Criteria:**
    -   `ProgressTracker` component calls `GET /api/brand-lift/surveys/{surveyId}/progress` (Ticket BL-MVP-P4-03) on load and/or periodically.
    -   "Refresh Data" button triggers a new API call to update the displayed data.
    -   UI updates dynamically with fetched progress information.
-   **Dependencies:** Ticket BL-MVP-P4-03 API.

---

### Epic: BL-MVP-EPIC5: Data Export for Manual Reporting
*Focus: Provide a mechanism to export raw survey response data for manual analysis and reporting. **[LOWER PRIORITY / PHASE 2]**.*

#### [LOWER PRIORITY / PHASE 2] Ticket BL-MVP-P5-01: Implement Raw Survey Response Data Export
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

### Epic: BL-MVP-EPIC6: Testing, Validation & Deployment
*Focus: Ensure a high-quality, **production-ready** feature through comprehensive testing and deployment procedures. **Initial testing efforts must focus on the high-priority MVP flow (Epics 0-3).**.*

#### [HIGH PRIORITY MVP FLOW - Initial Focus] Ticket BL-MVP-P6-01: Implement Unit & Integration Tests
-   **Type:** Test
-   **Description:** Write unit and integration tests for all new backend services, API routes, Prisma queries, critical frontend components, and utility functions.
-   **Acceptance Criteria:**
    -   Sufficient test coverage for new backend logic (services, API handlers, mappers, utils) using Jest/Supertest.
    -   Sufficient test coverage for critical frontend components and logic (e.g., SurveyQuestionBuilder state, ReportDashboard data handling) using Jest/RTL.
    -   Integration tests verify interactions between frontend and backend, and backend service interactions (e.g., `cint.ts` - mocked).
-   **Tools:** Jest, React Testing Library, Supertest.

#### [HIGH PRIORITY MVP FLOW - Initial Focus] Ticket BL-MVP-P6-02: Implement End-to-End (E2E) Tests
-   **Type:** Test
-   **Description:** Create E2E tests covering the main user flows of the Brand Lift feature. **Prioritize tests for the high-priority MVP flow first.**
-   **Acceptance Criteria:**
    -   **High Priority:** E2E tests cover critical paths: Campaign Selection -> Study Setup -> Survey Design -> Survey Preview -> Approval -> Submit Action.
    -   (Lower Priority) E2E tests cover Progress Tracking and Data Export trigger.
    -   Tests are stable and run as part of the CI pipeline.
-   **Tools:** Cypress or Playwright.

#### [HIGH PRIORITY MVP FLOW - Initial Focus] Ticket BL-MVP-P6-03: Perform Accessibility Testing
-   **Type:** Test
-   **Description:** Ensure all UI components and pages comply with WCAG 2.1 AA accessibility standards.
-   **Acceptance Criteria:**
    -   Automated accessibility checks (e.g., axe-core) are integrated into the development workflow or CI pipeline.
    -   Manual testing (keyboard navigation, screen reader checks) performed on all new UI pages and complex components.
    -   Identified accessibility issues are addressed.

#### [HIGH PRIORITY MVP FLOW - Initial Focus] Ticket BL-MVP-P6-04: Manual QA & Cross-Browser/Device Testing
-   **Type:** Test
-   **Description:** Conduct thorough manual quality assurance testing, including exploratory testing and verification across different browsers and devices.
-   **Acceptance Criteria:**
    -   All features and user flows are tested manually.
    -   Edge cases are explored and documented.
    -   UI is verified for responsiveness and consistent appearance on target browsers (Chrome, Firefox, Safari) and devices (desktop, tablet, mobile).
    -   No major uncaught errors or UI bugs.

#### [HIGH PRIORITY MVP FLOW - Initial Focus] Ticket BL-MVP-P6-05: Error Handling & Validation Review
-   **Type:** Chore
-   **Description:** Ensure robust error handling and user-friendly error messages are implemented throughout the application (both frontend and backend).
-   **Acceptance Criteria:**
    -   Backend API endpoints return clear and informative error messages with appropriate HTTP status codes.
    -   Frontend displays user-friendly error messages for API errors, validation failures, and other issues.
    -   Input validation (Zod schemas) is comprehensive.

#### [HIGH PRIORITY MVP FLOW - Initial Focus] Ticket BL-MVP-P6-06: Performance Testing & Optimization
-   **Type:** Chore
-   **Description:** Test API response times and UI rendering speed, especially for data-intensive operations like reporting, and optimize as needed.
-   **Acceptance Criteria:**
    -   API response times for key endpoints supporting the core flow (Survey CRUD, Question/Option CRUD, Approval CRUD) are within acceptable limits (e.g., <300-500ms) to ensure a snappy UI experience.
    -   UI rendering speed is smooth, especially for pages with complex components or large data sets.
    -   Identify and address performance bottlenecks.

#### [HIGH PRIORITY MVP FLOW - Initial Focus] Ticket BL-MVP-P6-07: Security Review
-   **Type:** Chore
-   **Description:** Conduct a security audit of the new Brand Lift feature, including API endpoints, permissions, data handling, and integration with the Cint API.
-   **Acceptance Criteria:**
    -   All API endpoints are properly secured using Clerk authentication and authorization.
    -   Permissions are correctly enforced based on user roles.
    -   Sensitive data (if any) is handled securely.
    -   Integration with Cint API follows security best practices (e.g., secure credential storage, validated callbacks).
    -   Potential vulnerabilities (XSS, CSRF, SQLi, etc.) are assessed and mitigated.

#### Ticket BL-MVP-P6-08: Deployment Preparation & Staged Rollout
-   **Type:** Chore
-   **Description:** Prepare for deployment to staging and production environments, including CI/CD pipeline updates, environment variable configuration, and monitoring setup.
-   **Acceptance Criteria:**
    -   CI/CD pipeline is updated to build and deploy the Brand Lift feature.
    -   Environment variables (API keys for Cint, Mux Post-MVP, feature flags) are configured securely for all environments.
    -   Feature is deployed to a staging environment for final validation.
    -   Monitoring and logging are set up for API performance, errors, and key feature usage in production.
    -   Consider a feature flag for controlled rollout to production.

#### Ticket BL-MVP-P6-09: Documentation
-   **Type:** Docs
-   **Description:** Create and/or update user guides and technical documentation for the Brand Lift feature.
-   **Acceptance Criteria:**
    -   User guides clearly explain how to use the Brand Lift feature, from setup to report interpretation.
    -   Technical documentation covers architecture, API endpoints, data models, and integration points.
    -   Documentation is accessible to relevant team members and users.

#### Ticket BL-MVP-P6-10: Knowledge Capture in Graphiti
-   **Type:** Chore
-   **Description:** Store key implementation procedures, decisions, and learned preferences related to the Brand Lift feature in Graphiti for future reference and team knowledge sharing.
-   **Acceptance Criteria:**
    -   Relevant information (e.g., Cint API integration patterns, complex logic decisions, UI component design choices, AI prompt strategies) is captured using `mcp_Graphiti_add_episode`.
    -   Entries are appropriately categorized for easy recall.

---

### Epic: BL-POSTMVP-EPIC7: Post-MVP Enhancements & Holistic Integration
*Focus: Deepen integration with the Justify ecosystem and add advanced features based on user needs and MVP feedback.*

#### Ticket BL-POSTMVP-P7-01: Comprehensive Reporting Dashboard Implementation
-   **Type:** Feature (UI/Backend)
-   **Description:** Build the full-featured visual reporting dashboard with charts, lift calculations, AI recommendations, and filtering. This includes implementing the backend logic for complex aggregations and the frontend for visualization. The UI for this dashboard should align with the design specified in `@Brand Lift Report Page.png`.
-   **Acceptance Criteria:**
    -   Backend endpoint `/api/brand-lift/surveys/{studyId}/report` implements full aggregation logic, lift calculations (Absolute & Relative), and AI-driven recommendations.
    -   Implement a caching strategy (e.g., Redis with an appropriate TTL like 5 minutes, or on-demand invalidation) for aggregated report data.
    -   All Prisma queries for report aggregation are highly optimized, utilizing appropriate database indexes on `SurveyResponse` and related tables.
    -   `src/components/features/brand-lift/ReportDashboard.tsx` is created, matching Figma design `@Brand Lift Report Page.png`.
    -   Dashboard includes sections for Key Metrics, Funnel Visualization, KPI Breakdowns, Trends, and Recommendations.
    -   Filter controls (Age, Gender, Platform) are implemented and functional.
    -   `src/app/(brand-lift)/report/page.tsx` hosts the dashboard.
    -   Conduct load testing for the reporting API with realistic large response volumes (e.g., 50,000+ responses) targeting <2-3s for initial load.
-   **Dependencies:** `Card`, `Select`, `Button` UI components; Charting library, `ChartWrapper` component. Redis setup (if chosen for caching), Prisma indexing configuration.

#### Ticket BL-POSTMVP-P7-02: Link Lift Insights to Campaign Wizard
-   **Type:** Feature (UI)
-   **Description:** Surface relevant BL report recommendations during new campaign setup.
-   **Acceptance Criteria:**
    -   `src/components/features/brand-lift/ReportDashboard.tsx` is implemented to include relevant BL report recommendations during new campaign setup.
    -   Recommendations are based on campaign lift insights and are displayed in the report dashboard.
-   **Dependencies:** `ReportDashboard.tsx` implementation.

#### Ticket BL-POSTMVP-P7-03: Correlate Lift with Influencer Performance
-   **Type:** Feature (UI)
-   **Description:** Investigate linking campaign lift to specific influencers; display on BL report & Influencer Profile.
-   **Acceptance Criteria:**
    -   `src/components/features/brand-lift/ReportDashboard.tsx` is implemented to include influencer performance insights.
    -   Influencer performance is correlated with campaign lift and displayed in the report dashboard.
-   **Dependencies:** `ReportDashboard.tsx` implementation.

#### Ticket BL-POSTMVP-P7-04: Brand Lift Benchmarking
-   **Type:** Feature (UI)
-   **Description:** Provide industry/vertical benchmarks for lift metrics.
-   **Acceptance Criteria:**
    -   `src/components/features/brand-lift/ReportDashboard.tsx` is implemented to include industry/vertical benchmarks for lift metrics.
    -   Benchmarks are displayed in the report dashboard.
-   **Dependencies:** `ReportDashboard.tsx` implementation.

#### Ticket BL-POSTMVP-P7-05: Survey Templates & Question Bank
-   **Type:** Feature (UI)
-   **Description:** Pre-built templates and searchable question bank in Survey Builder.
-   **Acceptance Criteria:**
    -   `src/components/features/brand-lift/SurveyQuestionBuilder.tsx` is implemented to include pre-built templates and a searchable question bank.
    -   Templates and questions are available in the survey builder.
-   **Dependencies:** `SurveyQuestionBuilder.tsx` implementation.

#### Ticket BL-POSTMVP-P7-06: Mux Video Stimulus Support
-   **Type:** Feature (UI)
-   **Description:** Enable video creative in surveys via Mux integration.
-   **Acceptance Criteria:**
    -   `src/components/features/brand-lift/SurveyQuestionBuilder.tsx` is implemented to include video stimulus support.
    -   Video stimulus is available in the survey builder.
-   **Dependencies:** `SurveyQuestionBuilder.tsx` implementation.

#### Ticket BL-POSTMVP-P7-07: Advanced AI for Survey Personalization & Analysis
-   **Type:** Feature (UI)
-   **Description:** Explore deeper AI integration for dynamic question paths or more nuanced insight generation.
-   **Acceptance Criteria:**
    -   `src/components/features/brand-lift/SurveyQuestionBuilder.tsx` is implemented to include advanced AI for survey personalization and analysis.
    -   AI is available in the survey builder for personalizing questions and generating insights.
-   **Dependencies:** `SurveyQuestionBuilder.tsx` implementation.

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
