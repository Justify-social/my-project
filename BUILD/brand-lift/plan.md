# **Plan: Brand Lift Feature Implementation (MVP)**

**Scrum Leader Overview:** This document provides a highly granular, step-by-step plan for building the Minimum Viable Product (MVP) of the Brand Lift feature. The goal is to deliver a robust, user-friendly workflow for creating, managing, running, and analyzing brand lift studies integrated with existing campaigns and leveraging the Cint Lucid Exchange API for respondent sourcing. We will follow established architectural patterns, prioritize **minimizing cognitive load** for the user, ensure **seamless integration into the holistic Justify ecosystem**, and leverage **AI assistance** where appropriate to simplify complex tasks.

**Core User Value Proposition (Brand Marketer Persona):**

*   **Measure Actual Impact:** Move beyond proxy metrics to directly quantify the impact of campaigns (run via Justify) on key brand perception metrics like Awareness, Ad Recall, Consideration, and Preference.
*   **Data-Driven Optimization:** Gain actionable insights from survey results (visualized clearly) to understand campaign effectiveness across different audience segments and optimize future creative/messaging strategies.
*   **Streamlined Workflow:** Simplify the traditionally complex process of setting up and running brand lift studies through an integrated, guided workflow, **using AI to suggest relevant survey structures** and minimizing manual configuration.
*   **Collaborative Decision Making:** Facilitate team alignment and confidence in survey design through a structured review and approval process before launch.
*   **Targeted Insights:** Understand how campaigns resonate with specific demographics by analyzing lift results filtered by age, gender, platform, etc., **linking campaign performance back to strategic goals**.
*   **Holistic Understanding:** Connect brand lift results (campaign impact) with other Justify data points (like influencer performance metrics - Post-MVP) to build a richer picture of overall marketing effectiveness.

**Success Metrics (MVP):**

*   **Feature Adoption:** Number of Brand Lift studies successfully created and launched via the platform.
*   **Workflow Completion Rate:** Percentage of users successfully completing the flow from Campaign Selection to Report Viewing.
*   **Data Integrity:** Successful collection and processing of survey responses via the Cint Lucid integration (measured by low error rates).
*   **User Satisfaction (Qualitative):** Feedback from initial users on the ease of use of the survey builder, approval process, and clarity of the final report.
*   **(Post-MVP Metric):** Demonstrable use of Brand Lift insights to inform subsequent campaign planning or creative adjustments.

**MVP Scope Note:** This initial plan focuses on the core workflow: selecting a campaign, designing a standard survey (Single/Multiple Choice) **with AI assistance for question generation**, collaborative approval, launching the survey (via Cint Lucid integration), tracking basic progress, and viewing a standard report. Advanced question types, complex branching logic, highly custom reports, deep integration linking lift results *directly* to individual influencer profiles, and advanced analytics like benchmarking are considered Post-MVP.

**Architectural Integration Diagram:**

*(To be added - This will show interaction between Brand Lift UI components, Backend APIs, Prisma DB, Clerk Auth, Campaign Wizard Data, and the Cint Lucid API)*

**Accelerated Production Strategy:** *(Consider if applicable - Brand Lift might be more self-contained initially, but parallel FE/BE work is still likely beneficial)*

*(To be added - Outline parallel streams if adopted)*

**Refined User Journeys & Integration Flow (Based on Figma Designs):**

1.  **Campaign Selection & Study Setup** (`@Select Campaign.png`, `@Select - Edit - Add Campaign.png`):
    *   User navigates to the Brand Lift section.
    *   User selects an existing, completed campaign (originally created via Campaign Wizard).
    *   User initiates a new Brand Lift study, providing a Study Name.
    *   User defines the target Funnel Stage and selects Primary/Secondary KPIs (e.g., Brand Awareness, Ad Recall).
    *   System saves the initial `BrandLiftSurvey` record linked to the campaign.
2.  **Survey Design** (`@Survey Design.png`):
    *   User accesses the survey builder for the created study.
    *   User adds questions (Single/Multiple Choice).
    *   User adds text and/or image/GIF options to questions.
    *   User configures question settings (Randomization, Mandatory).
    *   User associates questions with KPIs.
    *   User reorders questions/options via drag-and-drop.
    *   Changes are saved via API calls to update `SurveyQuestion` and `SurveyOption` records.
3.  **Preview & Submit for Review** (`@Survey Approval Screen.png` - Right Side):
    *   User previews the survey appearance (simulating platforms like TikTok).
    *   User clicks "Share Survey for Initial Review" (or similar) which updates the survey status via API.
4.  **Collaborative Approval & Sign-Off** (`@Collaborative Approval & Formal Sign-Off.png`):
    *   Reviewers access the survey via a link or notification.
    *   Reviewers view questions and add comments/suggestions via the UI (saved via API).
    *   Comment status is tracked (Needs Action -> Resolved).
    *   Study owner/admin requests formal sign-off via UI action (updates status).
    *   Once approved/signed-off, the "Submit for Data Collection" button is enabled.
5.  **Launch & Response Collection (Integration with Cint Lucid):**
    *   User clicks "Submit for Data Collection".
    *   Backend system interacts with **Cint Lucid Exchange API** to:
        *   Define the target audience/panel based on campaign/study criteria.
        *   Launch the survey to the selected panel.
        *   (Mechanism TBD: Cint likely provides a survey link or Justify hosts a public page; responses might come via Cint webhook/callback or Cint polling).
    *   The `/api/brand-lift/respond` endpoint receives/processes incoming responses, storing them as `SurveyResponse` records.
6.  **Progress Tracking** (`@Submission & Progress Tracking.png`):
    *   User views the progress page for the active study.
    *   UI fetches data from `/api/brand-lift/surveys/{id}/progress` which calculates response counts (potentially querying the `SurveyResponse` table or getting counts from Cint API).
    *   Interim lift metrics are calculated and displayed.
7.  **Reporting** (`@Brand Lift Report Page.png`):
    *   Once sufficient responses are collected (or study duration ends), the user accesses the report page.
    *   UI fetches aggregated data from `/api/brand-lift/surveys/{id}/report`.
    *   Backend generates report data (lift scores, funnel data, trends, word cloud) by processing `SurveyResponse` data (comparing Control vs. Exposed if applicable).
    *   User interacts with filters (Age, Gender, Platform) to refine visualizations.
    *   User can export the report data.

**New File Directory Structure:**

*(Copied and potentially refined from brand-lift.md SSOT section)*
```plaintext
src/
├── app/
│   ├── (brand-lift)/         # <--- NEW Route Group
│   │   ├── layout.tsx          # <--- NEW
│   │   ├── campaign-selection/ # <--- NEW
│   │   │   └── page.tsx      # <--- NEW
│   │   ├── survey-design/      # <--- NEW
│   │   │   └── page.tsx      # <--- NEW
│   │   ├── approval/           # <--- NEW
│   │   │   └── page.tsx      # <--- NEW
│   │   ├── progress/           # <--- NEW
│   │   │   └── page.tsx      # <--- NEW
│   │   └── report/             # <--- NEW
│   │       └── page.tsx      # <--- NEW
│   ├── api/
│   │   └── brand-lift/       # <--- NEW
│   │       ├── surveys/        # <--- NEW
│   │       │   └── ... (route handlers)
│   │       ├── questions/      # <--- NEW
│   │       │   └── ...
│   │       ├── approval/       # <--- NEW
│   │       │   └── ...
│   │       ├── respond/        # <--- NEW (Endpoint for Cint Lucid callback/webhook?)
│   │       │   └── ...
│   │       ├── progress/       # <--- NEW
│   │       │   └── ...
│   │       └── report/         # <--- NEW
│   │           └── ...
│   ├── lib/                    # Existing libs
│   │   └── db.ts               # Existing Prisma client
│   │   └── mux.ts             # <--- NEW (Service/client for Mux API interaction)
│   │   └── cint.ts             # <--- NEW (Service/client for Cint Lucid API interaction)
│   └── ... (other app routes)
├── components/
│   ├── features/
│   │   └── brand-lift/       # <--- NEW
│   │       ├── CampaignSelector.tsx # <--- NEW (Example)
│   │       ├── StudySetupForm.tsx   # <--- NEW
│   │       ├── SurveyQuestionBuilder.tsx # <--- NEW
│   │       ├── SurveyPreview.tsx     # <--- NEW
│   │       ├── ApprovalWorkflow.tsx  # <--- NEW
│   │       ├── ProgressTracker.tsx   # <--- NEW
│   │       ├── ReportDashboard.tsx   # <--- NEW
│   │       ├── ChartWrapper.tsx      # <--- NEW
│   │       └── WordCloudDisplay.tsx  # <--- NEW
│   └── ui/                   # Existing shared UI components
│       └── ...
├── contexts/
│   └── BrandLiftStudyContext.tsx # <--- NEW (Optional, for managing state across steps if needed)
│   └── ...
├── prisma/
│   └── schema.prisma       # Existing (to be modified)
├── types/
│   └── brand-lift.ts       # <--- NEW (Specific types for surveys, questions, etc.)
│   └── ...
└── ...
```

**Backend Design & API Considerations (MVP Focus):**

*   **API Contract Definition (SSOT):** Define request/response schemas for all new `/api/brand-lift/...` endpoints using OpenAPI spec. Critical first step.
*   **Database Integration:** Extend `schema.prisma` with Brand Lift models (see Phase 1 below). Ensure relations to `CampaignWizardSubmission`. Use shared Prisma client (`@/lib/db`). Implement transactions where needed.
*   **Cint Lucid Exchange API Integration:**
    *   **Responsibility:** Backend service layer.
    *   **Key Interactions:**
        *   Launching surveys to specific target panels defined in Cint.
        *   Receiving/fetching survey responses (confirm mechanism: webhook push from Cint to `/api/brand-lift/respond` vs. Justify polling Cint API).
        *   Potentially fetching study progress/status updates from Cint.
    *   **Implementation:** Create a dedicated service/client (`src/lib/cint.ts`?) to encapsulate Cint API interactions, handling authentication, request formatting, and response parsing.
    *   **Error Handling:** Robustly handle errors from Cint API calls (timeouts, auth errors, panel issues) and response processing.
*   **Report Generation Logic:** Significant backend logic required for `/api/brand-lift/surveys/{id}/report`. This involves:
    *   Fetching relevant `SurveyResponse` data.
    *   Implementing lift calculation formulas (e.g., Exposed Group Metric - Control Group Metric).
    *   Aggregating data for different visualizations (funnel, trends, KPI breakdowns, demographics).
    *   Processing text data for word cloud generation.
    *   **Generate simple, data-driven recommendations** (e.g., "Ad Recall lift significant, consider using similar creative elements.").
    *   Consider performance implications and potential caching.
*   **Authentication & Authorization (Clerk):** Apply `clerkMiddleware` to secure all non-public endpoints. Define specific roles/permissions needed for creating studies, approving, viewing reports.
*   **API Handling Patterns:** Use existing patterns (`tryCatch`, `withValidation` w/ Zod) for consistency and robustness.
*   **Video Handling (Mux Integration - Post-MVP):**
    *   **Requirement:** To support video creative as survey stimulus.
    *   **Mechanism:** Use Mux for video ingestion, storage, and streaming.
    *   **Implementation:** Requires a backend service (`src/lib/mux.ts`) to interact with Mux APIs (uploads, playback IDs). Prisma schema (`SurveyQuestion` or related model) will need a field for `muxPlaybackId`. Video upload likely handled via existing asset system, then passed to Mux by the backend.
    *   **Serving:** Requires embedding Mux Player in the survey interface presented to respondents (potentially via HTML wrapper if needed for Cint).

**Assumptions about Existing Codebase (Review & Confirm):**

*(Copied and adapted from Influencer plan - verify UI components, Clerk, Prisma setup)*
*   **UI Library (`src/components/ui`):** Assumed presence of `Button`, `Card`, `Avatar`, `Badge`, `Icon`, `Input`, `Select`, `Checkbox`, `Slider`, `Table`, `Tabs`, `Pagination`, `LoadingSkeleton`, `Drawer`, basic Chart components. **Action:** Team Lead/FE Devs to quickly verify.
*   **Layouts:** `ConditionalLayout` assumed for standard page structure.
*   **Context:** Existing patterns for context usage (e.g., `WizardContext`).
*   **Types:** Core types exist (`src/types/`).
*   **Services:** Existing pattern for internal API service calls.
*   **Authentication:** Clerk (`clerkMiddleware`) is used for auth.
*   **Database:** Prisma ORM with PostgreSQL backend (`@/lib/db`).
*   **Routing:** Next.js App Router assumed.

**Design System & Single Source of Truth (SSOT):**

*(Copied and adapted from Influencer plan - enforce reuse of UI kit, styles, icons)*
*   **UI Component Library:** Reuse `src/components/ui` components. New components specific to Brand Lift go in `src/components/features/brand-lift/`. Discuss reusable patterns with leads.
*   **Styling:** Adhere to `src/app/globals.css` (Brand Colours, Typography, Spacing). No hardcoded styles.
*   **Icons:** Use existing `Icon` component and FontAwesome Pro set via registry.
*   **State Management:** Prefer local state or props drilling for MVP. Consider a dedicated `BrandLiftStudyContext` only if state becomes complex across multiple deep components within the feature.
*   **Types:** Define specific types in `src/types/brand-lift.ts`.

---

**Phase 0: Preparation & Foundation**

*Goal: Define data structures, types, and core configurations.*

*   **Ticket 0.1: `TYPE: Define Core Brand Lift Types`**
    *   **Goal:** Specify the data types needed for surveys, questions, options, responses, reports.
    *   **Action:** Create `src/types/brand-lift.ts`. Define interfaces like `BrandLiftSurveyData`, `SurveyQuestionData`, `SurveyOptionData`, `SurveyResponseData`, `BrandLiftReportData`, `SurveyApprovalCommentData`, `SurveyApprovalStatusData` based on the Prisma schema draft and feature needs.
    *   **Files Created/Modified:** `src/types/brand-lift.ts`
    *   **Verification:** Types accurately reflect the data requirements for each entity.
*   **Ticket 0.2: `CHORE: Update Prisma Schema`**
    *   **Goal:** Add Brand Lift models to the database schema.
    *   **Action:** Edit `prisma/schema.prisma`. Add the models: `BrandLiftSurvey`, `SurveyQuestion`, `SurveyOption`, `SurveyResponse`, `BrandLiftReport`, `SurveyApprovalComment`, `SurveyApprovalStatus` as defined in `brand-lift.md` Section 4, Phase 1, Step 1. Ensure relationships (e.g., to `CampaignWizardSubmission`) are correctly defined.
    *   **Files Modified:** `prisma/schema.prisma`
    *   **Verification:** Schema definitions are syntactically correct and match the required structure.
*   **Ticket 0.3: `CHORE: Run Prisma Migrations & Generate Client`**
    *   **Goal:** Apply schema changes to the database and update the Prisma client.
    *   **Action:** Run `npx prisma migrate dev --name add_brand_lift_models`. Run `npx prisma generate`.
    *   **Verification:** Migration applies successfully. Prisma client is updated without errors.
*   **Ticket 0.4: `CHORE: Create Brand Lift API Route Structure`**
    *   **Goal:** Set up the basic API folder structure.
    *   **Action:** Create directories under `src/app/api/brand-lift/`: `surveys`, `questions`, `approval`, `respond`, `progress`, `report`.
    *   **Files Created:** New directories.
    *   **Verification:** Folder structure matches the plan.
*   **Ticket 0.5: `CHORE: Create Cint Lucid Service Stub`**
    *   **Goal:** Set up the file for Cint Lucid API interactions.
    *   **Action:** Create `src/lib/cint.ts`. Add placeholder functions or class structure for future Cint API calls (e.g., `launchSurvey`, `getSurveyStatus`, `fetchResponses`).
    *   **Files Created:** `src/lib/cint.ts`
    *   **Verification:** File exists with basic structure.
*   **Ticket 0.6: `CHORE: Create Mux Service Stub`**
    *   **Goal:** Set up the file structure for Mux API interactions (Post-MVP feature).
    *   **Action:** Create `src/lib/mux.ts`. Add placeholder functions (e.g., `uploadVideo`, `getPlaybackInfo`).
    *   **Files Created:** `src/lib/mux.ts`
    *   **Verification:** File exists with basic structure.

---

**Phase 1: Backend Foundation (Core APIs)**

*Goal: Implement the essential backend endpoints for creating studies, managing questions, and receiving responses.*

*   **Ticket 1.1: `FEAT(API): Implement Survey CRUD Endpoints`**
    *   **Goal:** Allow creating, reading, updating Brand Lift surveys, including core study parameters.
    *   **Action:** Implement route handlers in `src/app/api/brand-lift/surveys/`:
        *   `POST /`: Create a new `BrandLiftSurvey` linked to a `campaignId`. Input must include `name`, `funnelStage`, `primaryKpi`, `secondaryKpis`. Use `tryCatch`, `withValidation` (Zod schema), Clerk auth.
        *   `GET /?campaignId={id}`: Fetch surveys for a campaign.
        *   `GET /{id}`: Fetch a specific survey by ID.
        *   `PUT /{id}`: Update survey details (e.g., name, status, funnelStage, KPIs).
    *   **Dependencies:** Prisma client, Clerk middleware, Validation middleware.
    *   **Verification:** Endpoints function correctly with tools like Postman/curl. Data is persisted/retrieved from DB. Auth/validation works.
*   **Ticket 1.2: `FEAT(API): Implement Question/Option CRUD Endpoints`**
    *   **Goal:** Allow managing questions and options within a survey.
    *   **Action:** Implement route handlers in `src/app/api/brand-lift/questions/` (or nested under `/surveys/{id}/questions/`):
        *   `POST /`: Create new `SurveyQuestion` and associated `SurveyOption`s for a given `surveyId`. Handle ordering. Use transactions.
        *   `GET /?surveyId={id}`: Fetch all questions/options for a survey.
        *   `PUT /{id}`: Update a question (text, type, settings, order).
        *   `PUT /options/{id}`: Update an option (text, imageUrl, order).
        *   `DELETE /{id}`: Delete a question.
        *   `DELETE /options/{id}`: Delete an option.
    *   **Dependencies:** Prisma client, Clerk middleware, Validation middleware.
    *   **Verification:** Endpoints correctly manage question/option data and relationships. Ordering works.
*   **Ticket 1.3: `FEAT(API): Implement Response Collection Endpoint`**
    *   **Goal:** Create the endpoint to receive survey responses, likely triggered by Cint Lucid.
    *   **Action:** Implement `POST /api/brand-lift/respond` route handler:
        *   Define expected payload structure (likely defined by Cint webhook/callback). Create Zod schema.
        *   Validate payload. Extract survey ID, question responses, respondent info.
        *   Create `SurveyResponse` record in the database.
        *   **Security:** Determine required auth/verification method (e.g., shared secret with Cint?). Implement necessary checks.
    *   **Dependencies:** Prisma client, Validation middleware.
    *   **Verification:** Endpoint successfully receives and stores valid response data. Invalid data is rejected. Security checks function.

---

**Phase 2: Study Setup & Survey Builder UI**

*Goal: Implement the frontend UI for initiating studies and designing surveys.*

*   **Ticket 2.1: `FEAT(UI): Build Campaign Selection Component`**
    *   **Goal:** Allow users to select an existing campaign to start a Brand Lift study.
    *   **Action:** Create `src/components/features/brand-lift/CampaignSelector.tsx`. Fetch list of user-accessible campaigns (requires a `/api/campaigns` endpoint - **Dependency**). Display in a Select/Dropdown. Create `src/app/(brand-lift)/campaign-selection/page.tsx` to host this.
    *   **Dependencies:** `Select` UI component, `/api/campaigns` endpoint.
    *   **Verification:** Component displays campaigns. Selection works.
*   **Ticket 2.2: `FEAT(UI): Build Study Setup Form`**
    *   **Goal:** Allow users to name the study and define goals/KPIs, **linking selections clearly to measurement outcomes and minimizing choices.**
    *   **Action:** Create `src/components/features/brand-lift/StudySetupForm.tsx`. Include inputs for Study Name, Funnel Stage (Select - Top/Mid/Bottom - **UI should explain how stage choice influences measurement focus**), Primary/Secondary KPIs (Select/Multiselect - **Provide clear descriptions/tooltips** for each KPI explaining *what* it measures, e.g., Awareness = "Did they recall seeing the brand?"). **Limit secondary KPI choices** to reduce cognitive load. On submit, call `POST /api/brand-lift/surveys` (Ticket 1.1) and navigate to survey design page on success.
    *   **Dependencies:** `Input`, `Select`, `Button`, `Form`, `Tooltip` UI components. Ticket 1.1 API.
    *   **Verification:** Form submits data correctly. Survey record is created with funnel/KPIs. UI guidance (tooltips, descriptions) is clear.
*   **Ticket 2.3: `FEAT(UI): Implement Survey Question Builder UI`**
    *   **Goal:** Create the core drag-and-drop interface for building surveys.
    *   **Action:** Create `src/components/features/brand-lift/SurveyQuestionBuilder.tsx`. Integrate a DND library (`dnd-kit`).
        *   **AI Assistance:** Implement a mechanism (e.g., a button "Suggest Questions based on KPIs") to call a new backend endpoint (`POST /api/brand-lift/surveys/{id}/suggest-questions`?) that uses AI (based on study KPIs, potentially campaign creative context) to generate and pre-populate relevant standard questions and potentially answer options (including image/GIF suggestions if feasible via existing asset system).
        *   **Manual Building:** Allow users to add questions manually (types: Single/Multi Choice), add text/image/GIF options, configure randomization/mandatory toggles, reorder questions/options.
        *   **Stimulus Display:** Clearly display the core campaign creative (fetched from campaign data) alongside the builder for context.
        *   **Cognitive Load:** Use templates/suggestions and a clean layout to simplify the process.
    *   **Files Created:** `src/components/features/brand-lift/SurveyQuestionBuilder.tsx`, `src/app/(brand-lift)/survey-design/page.tsx`.
    *   **MVP Scope:** Supports **Text and Image/GIF** options only. Video stimulus support via Mux is **Post-MVP**.
    *   **Dependencies:** DND Library, `Card`, `Input`, `Button`, `Switch`, `Icon`. Image upload mechanism (`UploadThing`?). Backend endpoint for AI suggestions.
    *   **Verification:** UI matches `@Survey Design.png` (for text/image). AI suggestions populate questions. Manual editing works. Stimulus is visible. State management is stable.
*   **Ticket 2.4: `FEAT: Connect Survey Builder to API`**
    *   **Goal:** Persist survey design changes made in the UI.
    *   **Action:** Wire up actions within `SurveyQuestionBuilder` (add, edit, delete, reorder question/option) to call the corresponding backend API endpoints (Ticket 1.2). Implement loading/saving states.
    *   **Dependencies:** Ticket 1.2 APIs.
    *   **Verification:** Changes made in the UI are correctly saved to the backend.
*   **Ticket 2.5: `FEAT(UI): Build Survey Preview Component`**
    *   **Goal:** Display a preview of the survey simulating different platforms.
    *   **Action:** Create `src/components/features/brand-lift/SurveyPreview.tsx`. Fetch survey structure (Ticket 1.2 GET endpoint). Implement UI to render questions/options based on fetched data. Add platform switcher UI (e.g., Tabs or Buttons) to toggle styles/layout (MVP might only show one style).
    *   **Dependencies:** `Tabs` (optional), Ticket 1.2 API.
    *   **Verification:** Preview accurately reflects the saved survey structure. Stimulus (Image/GIF) is displayed correctly in preview.
*   **Ticket 2.6: `FEAT: Implement Submit for Review Button`**
    *   **Goal:** Allow users to change the survey status to PENDING_APPROVAL.
    *   **Action:** Add a "Submit for Review" button (likely on the Survey Design page). On click, call `PUT /api/brand-lift/surveys/{id}` (Ticket 1.1) to update the status.
    *   **Dependencies:** Ticket 1.1 API.
    *   **Verification:** Button click successfully updates survey status in the database.

---

**Phase 3: Collaborative Approval Workflow**

*Goal: Enable team commenting, status tracking, and sign-off.*

*   **Ticket 3.1: `FEAT(API): Implement Approval Endpoints`**
    *   **Goal:** Create backend APIs for managing comments and approval status.
    *   **Action:** Implement route handlers in `src/app/api/brand-lift/approval/` (or nested):
        *   `POST /comments`: Add a `SurveyApprovalComment` (requires surveyId, authorId, text, optional questionId).
        *   `GET /comments?surveyId={id}&questionId={id}`: Get comments for a survey or specific question.
        *   `PUT /comments/{id}`: Update comment status (e.g., to RESOLVED).
        *   `PUT /status?surveyId={id}`: Update `SurveyApprovalStatus` (e.g., set `status`, `requestedSignOff`).
    *   **Dependencies:** Prisma client, Clerk middleware.
    *   **Verification:** Endpoints correctly manage approval comments and status.
*   **Ticket 3.2: `FEAT(UI): Build Approval Workflow Component`**
    *   **Goal:** Implement the UI for reviewing surveys and managing comments/status.
    *   **Action:** Create `src/components/features/brand-lift/ApprovalWorkflow.tsx`. Display read-only survey questions. Implement comment threads per question (using `CommentThread` molecule? - **Dependency Check**). Implement comment input, status tags (`StatusTag` atom? - **Dependency Check**), and action buttons ("Request Sign-Off", "Submit for Data Collection"). Create `src/app/(brand-lift)/approval/page.tsx` to host this.
    *   **Dependencies:** UI components for comments, tags, buttons. Ticket 3.1 APIs.
    *   **Verification:** UI matches `@Collaborative Approval & Formal Sign-Off.png`. Comments can be added/viewed. Status updates work.
*   **Ticket 3.3: `FEAT: Connect Approval UI to API`**
    *   **Goal:** Link UI actions to backend approval logic.
    *   **Action:** Wire up comment posting, comment status updates, "Request Sign-Off", and "Submit for Data Collection" buttons in `ApprovalWorkflow` to call the corresponding APIs (Ticket 3.1). Disable "Submit for Data Collection" based on approval status fetched from API.
    *   **Dependencies:** Ticket 3.1 APIs.
    *   **Verification:** UI actions correctly update backend state via API calls.

---

**Phase 4: Response Collection & Progress Tracking**

*Goal: Integrate with Cint Lucid for response collection and track progress.*

*   **Ticket 4.1: `FEAT(Backend): Implement Cint Lucid Survey Launch`**
    *   **Goal:** Trigger survey launch on Cint Lucid via their API when survey status is updated (e.g., to 'COLLECTING').
    *   **Action:** Implement logic (likely triggered by the `PUT /api/brand-lift/surveys/{id}` status update or a new endpoint) that uses the `cint.ts` service (Ticket 0.5) to call the relevant Cint Lucid API for launching a study with defined parameters (survey structure, target audience). **Note:** May require passing a Justify-hosted URL if using Mux video (Post-MVP).
    *   **Dependencies:** `cint.ts` service, Cint API credentials/setup, final survey structure.
    *   **Verification:** Backend successfully initiates survey launch on Cint platform.
*   **Ticket 4.2: `FEAT(Backend): Implement Response Ingestion (Webhook/Polling)`**
    *   **Goal:** Configure the backend to receive or fetch responses from Cint Lucid.
    *   **Action:** Based on Cint Lucid's mechanism: Implement the webhook handler logic within `POST /api/brand-lift/respond` (Ticket 1.3) OR implement a polling mechanism using `cint.ts` to fetch responses periodically.
    *   **Dependencies:** `cint.ts` service, Cint API documentation for response delivery.
    *   **Verification:** Backend correctly receives/fetches and stores responses from Cint.
*   **Ticket 4.2.1: `CHORE: Investigate Cint Survey Presentation Mechanism` (Parallel/Early Phase 4)**
        *   **Goal:** Determine how Cint presents surveys, especially regarding embedded media (for future Mux integration).
        *   **Action:** Review Cint documentation/support to understand if they support embedding custom HTML (which could contain Mux Player) or if Justify needs to host the survey page and provide Cint with a link.
        *   **Verification:** Clear understanding of the technical requirements for presenting surveys with rich media via Cint.
*   **Ticket 4.3: `FEAT(API): Implement Progress Tracking Endpoint`**
    *   **Goal:** Provide data on response collection progress.
    *   **Action:** Implement `GET /api/brand-lift/surveys/{id}/progress` route handler. Logic should query `SurveyResponse` count for the survey ID. **Enhancement:** Potentially query Cint API via `cint.ts` for live progress status if available.
    *   **Dependencies:** Prisma client, potentially `cint.ts` service.
    *   **Verification:** Endpoint returns accurate response count and potentially interim metrics.
*   **Ticket 4.4: `FEAT(UI): Build Progress Tracking Component`**
    *   **Goal:** Display survey progress visually.
    *   **Action:** Create `src/components/features/brand-lift/ProgressTracker.tsx`. Implement UI matching `@Submission & Progress Tracking.png` using `ProgressIndicator` atom/component, Text for counts, potentially simple display for interim metrics. Add Refresh button. Create `src/app/(brand-lift)/progress/page.tsx` to host this.
    *   **Cint Status:** Include a field to display the current status from Cint (e.g., "Launching", "Fielding", "Complete") if available via the Progress API (Ticket 4.3).
    *   **Dependencies:** `ProgressIndicator` component, `Button`.
    *   **Verification:** UI displays progress information (response count, interim metrics, Cint status) correctly.
*   **Ticket 4.5: `FEAT: Connect Progress UI to API`**
    *   **Goal:** Fetch and display live progress data.
    *   **Action:** Wire up `ProgressTracker` component to fetch data from `/api/brand-lift/surveys/{id}/progress` (Ticket 4.3) periodically or via refresh button click.
    *   **Dependencies:** Ticket 4.3 API.
    *   **Verification:** UI updates with fetched progress data. Refresh works.

---

**Phase 5: Reporting Dashboard**

*Goal: Implement the backend logic and frontend UI for visualizing report results.*

*   **Ticket 5.1: `FEAT(Backend): Implement Report Generation Logic`**
    *   **Goal:** Create the backend logic to process responses and calculate lift metrics.
    *   **Action:** Implement the core logic within `/api/brand-lift/surveys/{id}/report` route handler. Fetch relevant `SurveyResponse` data. Implement lift calculations, data aggregation for charts (funnel, KPI breakdown, trends), and word cloud data generation. **Generate simple, data-driven recommendations** (e.g., "Ad Recall lift significant, consider using similar creative elements."). Consider caching heavy computations.
    *   **Dependencies:** Prisma client, potentially a text analysis library for word cloud.
    *   **Verification:** Backend logic correctly calculates and structures data for all required report sections, including recommendations.
*   **Ticket 5.2: `FEAT(UI): Build Report Dashboard Component`**
    *   **Goal:** Create the main UI for displaying the Brand Lift report.
    *   **Action:** Create `src/components/features/brand-lift/ReportDashboard.tsx`. Implement layout matching `@Brand Lift Report Page.png`. Include sections for Key Metrics, Funnel Viz, KPI Breakdowns, Trends, Word Cloud, Recommendations. Add Filter controls (Dropdowns/Selects). Add Export button. **Prioritize clarity and minimize cognitive load** in information hierarchy and visualization design. Create `src/app/(brand-lift)/report/page.tsx` to host this.
    *   **Dependencies:** `Card`, `Select`, `Button`, Chart components, Word Cloud component.
    *   **Verification:** UI structure matches mockup. Placeholders for charts/data exist.
*   **Ticket 5.3: `FEAT(UI): Integrate Charting Library`**
    *   **Goal:** Display report data using charts.
    *   **Action:** Select/confirm charting library (e.g., Recharts). Create `ChartWrapper` molecule (Ticket 9.3 from brand-lift.md analysis). Integrate charts (Bar, Line, potentially custom Funnel) into `ReportDashboard`, feeding them data fetched from the report API.
    *   **Dependencies:** Charting library, `ChartWrapper` component.
    *   **Verification:** Charts render correctly with fetched data and match brand styles.
*   **Ticket 5.4: `FEAT(UI): Integrate Word Cloud Library`**
    *   **Goal:** Display message themes as a word cloud.
    *   **Action:** Select/confirm word cloud library (e.g., `react-wordcloud`). Create `WordCloudDisplay` molecule. Integrate into `ReportDashboard`, feeding it data from the report API.
    *   **Dependencies:** Word cloud library, `WordCloudDisplay` component.
    *   **Verification:** Word cloud renders correctly with fetched data.
*   **Ticket 5.5: `FEAT: Connect Report UI to API & Filters`**
    *   **Goal:** Fetch report data and enable filtering.
    *   **Action:** Wire up `ReportDashboard` to fetch data from `/api/brand-lift/surveys/{id}/report` (Ticket 5.1). Implement frontend or backend filtering logic based on user selections in filter controls.
    *   **Dependencies:** Ticket 5.1 API.
    *   **Verification:** Report displays data fetched from API. Filters correctly update visualizations. **Recommendations are displayed.**
*   **Ticket 5.6: `FEAT: Implement Report Export Functionality`**
    *   **Goal:** Allow users to download report data.
    *   **Action:** Implement backend endpoint (`/api/brand-lift/surveys/{id}/export`?) to generate CSV/PDF data. Connect Export button in `ReportDashboard` to trigger the download.
    *   **Dependencies:** Backend export logic, potentially CSV/PDF generation libraries.
    *   **Verification:** Export button successfully downloads report data in the specified format.

---

**Phase 6: Testing, Validation & Deployment**

*Goal: Ensure quality, compliance, and readiness for production.*

*   **Ticket 6.1: `TEST: Implement Unit & Integration Tests`**: Cover backend services, API routes, Prisma queries, frontend components, utils.
*   **Ticket 6.2: `TEST: Implement E2E Tests`**: Cover key user flows (Campaign Selection -> Study Setup -> Survey Design -> Approval -> Progress -> Report).
*   **Ticket 6.3: `TEST: Perform Accessibility Testing`**: Use axe-core/Lighthouse against all UI pages/components. Target WCAG 2.1 AA.
*   **Ticket 6.4: `TEST: Manual QA & Cross-Browser/Device Testing`**: Execute exploratory testing, verify responsiveness.
*   **Ticket 6.5: `CHORE: Performance Testing & Optimization`**: Benchmark API/DB and frontend rendering. Optimize as needed.
*   **Ticket 6.6: `CHORE: Security Review`**: Audit endpoints, permissions, data handling, Cint integration security.
*   **Ticket 6.7: `CHORE: Deployment Preparation`**: Configure CI/CD, monitoring, logging for production.
*   **Ticket 6.8: `DOCS: Create/Update Documentation`**: User guides, technical docs.
*   **Ticket 6.9: `CHORE: Graphiti Knowledge Capture`**: Log key decisions, procedures using `mcp_Graphiti_add_episode`.

---

**Phase 7: Post-MVP Enhancements & Holistic Integration**

*Goal: Deepen integration with the Justify ecosystem and add advanced features based on user needs.*

*   **Ticket 7.1: `FEAT: Link Lift Insights to Campaign Wizard`**
    *   **Goal:** Surface relevant Brand Lift report recommendations during setup of *new* campaigns with similar goals/products.
    *   **Action:** Requires backend logic to identify relevant past studies. Update Campaign Wizard UI to conditionally display past recommendations.
*   **Ticket 7.2: `FEAT: Correlate Lift with Influencer Performance (Exploratory)`**
    *   **Goal:** Investigate linking high campaign lift to specific influencers used in that campaign.
    *   **Action:** Requires complex analysis, potentially A/B testing features. Initial step might involve simply displaying associated influencers on the BL report. Add indicator to Influencer Profile (Marketplace).
*   **Ticket 7.3: `FEAT: Brand Lift Benchmarking`**
    *   **Goal:** Provide industry/vertical benchmarks for lift metrics in reports.
    *   **Action:** Requires sourcing benchmark data (ethically/anonymously). Update Report API and UI to display comparisons.
*   **Ticket 7.4: `FEAT: Survey Templates & Question Bank`**
    *   **Goal:** Further reduce cognitive load and speed up survey creation.
    *   **Action:** Develop pre-built templates and a searchable bank of standard BL questions in the Survey Builder UI.
*   **Ticket 7.5: `FEAT: Advanced Reporting Filters & Views`**
    *   **Goal:** Allow deeper analysis within reports.
    *   **Action:** Add more demographic filters, potentially open-text response analysis, or custom report views.
*   **Ticket 7.6: `FEAT: Mux Video Stimulus Support`**
    *   **Goal:** Enable video creative in surveys.
    *   **Action:** Implement Mux integration (backend service, DB fields), update Survey Builder UI, ensure Cint compatibility (HTML wrapper?), embed Mux player.

---

**Definition of Done (DoD) for MVP Tickets:**

*   Code implemented according to the ticket description.
*   Code adheres to established coding standards (linting, formatting).
*   Functionality matches relevant Figma designs and user flow descriptions.
*   Code is covered by relevant tests (Unit, Integration, E2E - see Testing Strategy).
*   UI components are responsive and meet accessibility guidelines (basic checks).
*   Code successfully builds and passes CI checks.
*   PR is reviewed and approved by at least one other team member.
*   Feature is deployed to a staging/testing environment and verified.
*   Ticket is updated with relevant information (PR link, testing notes).

---

**Testing Strategy Summary:**

*   **Unit Testing (Jest/RTL):** Focus on utility functions, backend logic (lift calculation, API handlers), complex frontend state logic (Survey Builder).
*   **Component Testing (Storybook):** Develop and visually test UI components in isolation (`SurveyQuestionBuilder`, `ApprovalWorkflow`, `ReportDashboard` charts, etc.).
*   **Integration Testing:** Test interactions between frontend components and backend APIs; test backend service interactions (e.g., with `cint.ts` service - likely mocked initially).
*   **End-to-End (E2E) Testing (Cypress/Playwright):** Cover critical user flows (Campaign Selection -> Study Setup -> Survey Design -> Approval -> Progress -> Report).
*   **Manual QA:** Exploratory testing, cross-browser/device checks, validation of reporting data against known inputs.
*   **Accessibility Testing (Axe):** Integrate automated checks; manual checks with screen readers for complex UI like builder/reports.

---

**Release & Deployment Considerations (MVP):**

*   **Environment Variables:** Manage API keys/configs for Cint Lucid API securely per environment.
*   **Feature Flag (Recommended):** Wrap the entry point to the Brand Lift feature for controlled rollout.
*   **Database Migrations:** Ensure Prisma migrations run smoothly during deployment.
*   **Staging Verification:** Thoroughly test the end-to-end flow, including launching a test survey via Cint sandbox (if available) and verifying response handling.
*   **Monitoring:** Set up alerts for Brand Lift API errors, Cint API interaction failures, and response processing issues.

---

(Potential Risks & Mitigation Strategies section will go here)

---

**Team Communication & Collaboration:**

*   **Daily Standups:** Discuss progress, blockers, dependencies (esp. FE/BE/Cint integration).
*   **Sprint Planning:** Review upcoming tickets from this plan, clarify requirements, ensure DoR is met.
*   **Sprint Review:** Demonstrate completed functionality stage-by-stage.
*   **PR Reviews:** Focus on adherence to plan, code quality, testing, UI consistency, security.
*   **Slack Channel:** Dedicated channel for Brand Lift feature.
*   **Plan Updates:** This document (`plan.md`) is the SSOT. Updates managed by Scrum Master after team discussion.

**Potential Risks & Mitigation Strategies:**

| Risk Category | Severity | Mitigation Strategy |
|---------------|----------|--------------------|
| Cint Lucid API Integration Complexity | High | Dedicated service (`cint.ts`); Start integration early; Robust error handling; Clear contract understanding. |
| Performance of report aggregation | Medium | Optimize DB queries, use indexing, implement caching strategies (backend task). |
| Video Stimulus (Mux) Integration Complexity | High | **Post-MVP Priority.** Dedicated service (`mux.ts`); Handle upload/processing/serving; Ensure Cint compatibility (HTML wrapper?); Robust player implementation. |
| Survey Builder UI complexity (Drag & Drop) | High | Choose stable libraries (e.g., dnd-kit), thorough component testing (Storybook), feature flag rollout. |
| Collaborative Approval logic complexity | Medium | Clear state management, well-defined API contracts, E2E testing of approval flow. |
