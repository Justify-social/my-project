# Brand Lift Feature Implementation Plan

## Existing Codebase & SSOT File Directory

**Purpose**: To maintain a Single Source of Truth (SSOT) for all Brand Lift feature-related files, ensuring no duplicate files or logic exist in the codebase. This section maps the existing codebase structure to the planned implementation, identifying where new files will be created for simplicity and modularity, as no existing Brand Lift-specific files were found.

- **Brand Lift Pages**:
  - **New**: `src/app/(brand-lift)/layout.tsx` - Central layout file for Brand Lift feature navigation, to be created as no existing structure was found.
  - **New**: `src/app/(brand-lift)/campaign-selection/page.tsx` - SSOT for Campaign Selection & Study Setup page, integrating with existing Campaign Wizard data.
  - **New**: `src/app/(brand-lift)/survey-design/page.tsx` - SSOT for Survey Design page with drag-and-drop UI for question building.
  - **New**: `src/app/(brand-lift)/approval/page.tsx` - SSOT for Collaborative Approval & Sign-Off page, including comment and status tracking.
  - **New**: `src/app/(brand-lift)/progress/page.tsx` - SSOT for Progress Tracking page, showing response collection metrics.
  - **New**: `src/app/(brand-lift)/report/page.tsx` - SSOT for Reporting page, featuring visualizations and export functionality.
- **Custom Components**:
  - **Existing**: `src/components/ui/` - Contains reusable Shadcn UI components like `button.tsx`, `input.tsx`, `card.tsx`, `tabs.tsx`, and `table.tsx`, which will be leveraged for Brand Lift UI to ensure modularity and avoid duplication.
  - **New**: `src/components/features/brand-lift/` - Proposed directory for custom Brand Lift components (e.g., Survey Question Builder, Chart Wrappers, Word Cloud), to centralize custom logic and avoid scattering across pages.
- **API Routes**:
  - **New**: `src/app/api/brand-lift/surveys/` - Centralized API endpoints for CRUD operations on Brand Lift surveys and studies.
  - **New**: `src/app/api/brand-lift/questions/` - Centralized API endpoints for managing survey questions and options.
  - **New**: `src/app/api/brand-lift/approval/` - Centralized API endpoints for approval comments and status updates.
  - **New**: `src/app/api/brand-lift/respond/` - Public API endpoint for collecting survey responses.
  - **New**: `src/app/api/brand-lift/progress/` - Centralized API endpoint for progress tracking metrics.
  - **New**: `src/app/api/brand-lift/report/` - Centralized API endpoint for report data aggregation and export.
- **Database & Configuration**:
  - **Existing**: `schema.prisma` - To be updated with Brand Lift models (e.g., `BrandLiftSurvey`, `SurveyQuestion`) as outlined in the plan.
  - **Existing**: `src/middleware.ts` - To be verified and updated if necessary for route protection and authentication using `clerkMiddleware`.

**Note**: Developers must adhere to this structure, ensuring all related code is placed in the designated files or directories. Since no existing Brand Lift-specific files were found, new files will be created in a centralized manner to maintain SSOT. Existing UI components will be reused to prevent duplication. Any deviation or creation of duplicate files must be reviewed and justified.

**Quality Target**: 10/10

**Focus**: This plan outlines the development of a robust, production-ready Brand Lift feature, ensuring seamless integration with the existing application architecture (Campaign Wizard, Authentication via Clerk, UI component library, API patterns) to deliver an enhanced user experience.

## 1. Overview & Goal

**Goal**: Implement a comprehensive Brand Lift feature allowing users to create, manage, run, and analyze brand lift studies based on existing campaigns (created via the Campaign Wizard). The feature will guide users through survey design, collaborative approval, response collection, and detailed reporting to measure campaign impact on key branding metrics.

**Core Principles**:
- **Robust Integration**: Build upon the existing codebase, utilizing established patterns and the core tech stack (Next.js App Router, React, TypeScript, Clerk, Prisma, Shadcn UI, Tailwind CSS, FontAwesome Pro).
- **Data-Driven**: Provide clear, actionable insights based on collected survey data.
- **User-Friendly Workflow**: Guide users logically through study setup, survey creation, approval, and analysis, matching the flow shown in Figma designs.
- **Collaborative**: Enable team feedback and formal sign-off on surveys before launch.
- **Visually Engaging Reporting**: Present complex results clearly using charts and visualizations.
- **Maintainability & Scalability**: Ensure code quality, testing, and adherence to architectural best practices.
- **Brand Consistency**: Adhere to brand guidelines with consistent use of colors, typography, and icons.
- **Accessibility**: Ensure compliance with WCAG 2.1 AA standards for all user interfaces.

## 2. Key Features & User Flow (Based on Figma Designs)

1.  **Campaign Selection & Study Setup** (`@Select Campaign.png`, `@Select - Edit - Add Campaign.png`):
    *   Select an existing campaign created via the Campaign Wizard.
    *   Initiate a new Brand Lift study associated with the campaign.
    *   Define study name, funnel stage, and primary/secondary KPIs (e.g., Brand Awareness, Ad Recall). (`@Select Campaign.png`)
2.  **Survey Design** (`@Survey Design.png`):
    *   Build survey questions using a Question Builder UI.
    *   Support multiple question types (Single/Multiple Choice).
    *   Allow adding text and image/GIF options.
    *   Configure questions (Randomization, Mandatory).
    *   Associate questions with specific KPIs.
    *   Drag-and-drop reordering of questions/options.
3.  **Preview & Submit for Review** (`@Survey Approval Screen.png` - Right Side):
    *   Preview the survey appearance on different platforms (e.g., TikTok).
    *   Submit the survey for internal team review/approval.
4.  **Collaborative Approval & Sign-Off** (`@Collaborative Approval & Formal Sign-Off.png`):
    *   Reviewers can view survey questions.
    *   Add comments and suggestions per question.
    *   Track comment status (Resolved, Need Action).
    *   Implement suggestions (linking comments to actions).
    *   Formal "Request Sign-Off" process.
    *   "Submit for Data Collection" button enabled after approval.
5.  **Progress Tracking** (`@Submission & Progress Tracking.png`):
    *   Monitor the number of collected responses against the target.
    *   Display interim lift metrics (Awareness, Perception, Impact).
    *   Option to refresh data or return to the dashboard.
6.  **Reporting** (`@Brand Lift Report Page.png`):
    *   Display key lift metrics at a glance (+pts for Awareness, Recall, Consideration).
    *   Show funnel visualization (Control vs. Exposed) with filters (Age, Gender, Platform).
    *   Visualize results per KPI (e.g., bar charts by age group).
    *   Allow drilling down into specific survey question responses.
    *   Show trend over time chart.
    *   Display message themes (Word Cloud).
    *   Provide actionable recommendations based on results.
    *   Export report functionality.

## 3. Technical Analysis (Leveraging Existing Codebase)

*(This section integrates and updates the analysis from the previous version of the plan)*

### Existing Frontend Architecture & Required Enhancements
The frontend components must be built or adapted to match Figma designs, utilizing existing Shadcn UI components and application styling. All UI elements must adhere to brand guidelines:
- **Brand Colors**: Primary (Jet #333333), Secondary (Payne's Grey #4A5568), Accent (Deep Sky Blue #00BFFF), Background (White #FFFFFF), Divider (French Grey #D1D5DB), Interactive (Medium Blue #3182CE).
- **Icons**: FontAwesome Pro with `fa-light` as default and `fa-solid` on hover.
- **Validation Tool**: Use `/debug-tools/ui-components` to preview and validate UI components before integration.

*   **Campaign Selection (`SelectedCampaignContent.tsx` - Adapt/Rebuild)**:
    *   Needs connection to a real API endpoint fetching `CampaignWizardSubmission` data accessible to the user.
    *   UI to match `@Select Campaign.png` and `@Select - Edit - Add Campaign.png`.
*   **Study Setup (`NewBrandLiftStudyForm.tsx` - New)**:
    *   Component within the campaign selection flow to capture study name, goals, KPIs as per `@Select Campaign.png`.
    *   Submits data to create a `BrandLiftSurvey` record.
*   **Survey Design (`SurveyDesignContent.tsx` - Adapt/Refactor)**:
    *   Connect existing drag-and-drop UI from `@Survey Design.png` to backend API for saving questions/options.
    *   Requires integration of a suitable drag-and-drop library (e.g., `dnd-kit` or similar, confirm standard if one exists).
    *   Ensure GIF integration uses existing asset/upload mechanisms (e.g., reuse `UploadThing` integration).
    *   Needs robust state management for the builder.
*   **Survey Preview (`SurveyPreviewContent.tsx` - Adapt)**:
    *   Fetch draft survey data from the backend API.
    *   Ensure platform switcher (`@Survey Approval Screen.png`) dynamically updates the preview.
*   **Approval UI (`SurveyApprovalContent.tsx` - New)**:
    *   Implement UI from `@Collaborative Approval & Formal Sign-Off.png`.
    *   Requires components for displaying questions, comment threads per question, status indicators, and action buttons.
    *   Connect to backend API for comments and status updates.
*   **Progress Tracking (`BrandLiftProgressContent.tsx` - Adapt)**:
    *   Connect UI from `@Submission & Progress Tracking.png` to backend API fetching response counts and interim metrics.
    *   Implement data refresh mechanism.
*   **Report Generation (`BrandLiftReportContent.tsx` - Adapt/Rebuild)**:
    *   Implement UI from `@Brand Lift Report Page.png`.
    *   Integrate a charting library (e.g., Recharts, Chart.js - ensure consistency with other app charts if applicable) for visualizations (bars, lines).
    *   Integrate a word cloud visualization library.
    *   Implement filtering controls.
    *   Connect to backend API for fetching aggregated report data.
    *   Implement Export functionality.

### Existing Backend Architecture & Required Enhancements
Backend implementation must utilize existing patterns (Prisma, API middleware, error handling, Clerk auth) and provide new endpoints for Brand Lift specific functionality.

*   **API Endpoints (Review/Implement/Enhance)**:
    *   `/api/campaigns?user_accessible=true` (New/Existing?): To list campaigns for selection.
    *   `/api/brand-lift/surveys` (New): CRUD operations for `BrandLiftSurvey`.
    *   `/api/brand-lift/surveys/{surveyId}/questions` (New): CRUD for `SurveyQuestion`, `SurveyOption`.
    *   `/api/brand-lift/surveys/{surveyId}/preview` (Enhance existing): Fetch structured data for preview/approval screen.
    *   `/api/brand-lift/surveys/{surveyId}/submit-for-review` (New): Update survey status.
    *   `/api/brand-lift/surveys/{surveyId}/approval` (New): GET/POST comments, GET/PUT approval status.
    *   `/api/brand-lift/surveys/{surveyId}/submit-for-collection` (New): Update survey status.
    *   `/api/brand-lift/respond` (New): Public endpoint (or requires specific auth) to receive survey responses. Needs validation and potential rate limiting/fraud detection.
    *   `/api/brand-lift/surveys/{surveyId}/progress` (New): Fetch response count and interim metrics.
    *   `/api/brand-lift/surveys/{surveyId}/report` (Enhance existing): Fetch detailed, aggregated report data including lift scores, funnel data, trends, word cloud data. Requires significant aggregation logic.
    *   `/api/brand-lift/surveys/{surveyId}/export` (New): Generate and return report data in desired format(s).
*   **Data Transformation (`surveyMappers.ts` - Enhance)**:
    *   Adapt existing mapping functions (`mapCampaignToSurveyData`, `generateQuestionsFromKPIs`) to work with final Prisma models.
    *   Create mappers for approval comments, report data structures.
    *   Ensure robust type safety.
*   **Database Integration (`@/lib/db`, Prisma - Enhance)**:
    *   Implement the final Prisma schema for Brand Lift (see Phase 1 below), ensuring relations with existing models like `CampaignWizardSubmission`.
    *   Ensure all database operations utilize the existing shared Prisma client instance (`@/lib/db`).
    *   Implement database transactions where multiple entities are modified atomically (e.g., saving survey design changes).
*   **API Handling Patterns (Utilize Existing)**:
    *   Strictly apply existing API middleware patterns from `@/middleware/api` for robust error handling (`tryCatch`), request validation (`withValidation` using Zod), and authentication/authorization checks via Clerk.

## 4. Implementation Plan (Phased Approach)

### Implementation Timeline and Prioritization
- **Objective**: Provide a clear sequence of tasks with estimated timelines to ensure efficient development and dependency management for the team.
- **Timeline**:
    1. **Weeks 1-2: Phase 1 - Backend Foundation (DB Schema & Core APIs)**
        - Define and refine Prisma schema for Brand Lift models.
        - Run migrations and implement core API endpoints for surveys, questions, and responses.
    2. **Weeks 3-4: Phase 2 - Study Setup & Survey Builder UI**
        - Develop UI components for campaign selection, study setup, and survey builder.
        - Connect UI to backend APIs for data persistence.
    3. **Weeks 5-6: Phase 3 - Collaborative Approval Workflow**
        - Implement approval APIs and UI for comments and sign-off processes.
        - Ensure integration with survey status updates.
    4. **Weeks 7-8: Phase 4 - Response Collection & Progress Tracking**
        - Build public survey interface and response submission logic.
        - Develop progress tracking UI and API for response metrics.
    5. **Weeks 9-10: Phase 5 - Reporting Dashboard**
        - Implement report generation backend for data aggregation and visualizations.
        - Build reporting UI with charting and export functionalities.
    6. **Weeks 11-12: Phase 6 - Testing, Validation & Deployment**
        - Conduct comprehensive testing (unit, integration, E2E, accessibility).
        - Deploy to staging for final validation and then to production.
- **Dependencies**:
    - Backend foundation (Phase 1) must be completed before UI development can begin in earnest.
    - API endpoints for surveys and questions must be ready before Phases 2-4 UI components can be fully functional.
    - Authentication via Clerk must be integrated from the start to secure endpoints.

### Phase 1: Backend Foundation (DB Schema & Core APIs)
*   **Goal**: Establish the data structure and core backend capabilities.
    1.  **[ ] Update Prisma Schema**: Define/refine models in `schema.prisma`: `BrandLiftSurvey` (linking to `CampaignWizardSubmission`), `SurveyQuestion`, `SurveyOption`, `SurveyResponse`, `BrandLiftReport`, `SurveyApprovalComment`, `SurveyApprovalStatus`. *(Utilize schema draft below)*
        ```prisma
        model BrandLiftSurvey {
          id               Int                     @id @default(autoincrement())
          name             String                  // New field for Study Name
          campaignId       Int
          campaign         CampaignWizardSubmission @relation(fields: [campaignId], references: [id], onDelete: Cascade)
          createdAt        DateTime                @default(now())
          updatedAt        DateTime                @updatedAt
          status           SubmissionStatus        @default(DRAFT) // DRAFT, PENDING_APPROVAL, APPROVED, COLLECTING, COMPLETED, ARCHIVED
          questions        SurveyQuestion[]
          // activePlatform   Platform                @default(INSTAGRAM) // Preview platform? Or actual data collection platform? Clarify usage.
          // availablePlatforms Platform[]
          submissionDate   DateTime?
          responses        SurveyResponse[]
          reports          BrandLiftReport[]
          approvalStatus   SurveyApprovalStatus? // Link to approval tracking
          // Add fields for goals, funnel stage, KPIs
          funnelStage      String? // e.g., "Top Funnel", "Mid Funnel", "Bottom Funnel"
          primaryKpi       String? // e.g., "Brand Awareness", "Ad Recall"
          secondaryKpis    String[] // Array of strings for secondary KPIs
        }

        model SurveyQuestion {
          id               Int                     @id @default(autoincrement())
          surveyId         Int
          survey           BrandLiftSurvey         @relation(fields: [surveyId], references: [id], onDelete: Cascade)
          title            String
          kpi              String?                 // Associated KPI string
          type             String                  // "Single Choice" or "Multiple Choice"
          required         Boolean                 @default(true)
          isRandomized     Boolean                 @default(false)
          order            Int                     @default(0)
          options          SurveyOption[]
          approvalComments SurveyApprovalComment[] // Link to comments for this question
        }

        model SurveyOption {
          id               Int                     @id @default(autoincrement())
          questionId       Int
          question         SurveyQuestion          @relation(fields: [questionId], references: [id], onDelete: Cascade)
          text             String
          imageUrl         String?                 // URL for image/GIF
          order            Int                     @default(0)
        }

        model SurveyResponse {
          id               Int                     @id @default(autoincrement())
          surveyId         Int
          survey           BrandLiftSurvey         @relation(fields: [surveyId], references: [id], onDelete: Cascade)
          responseData     Json                    // Stores question ID to selected option IDs map: { "questionId": ["optionId1", "optionId2"] }
          respondentId     String?                 // For tracking unique respondents (if possible/needed)
          platform         String?                 // Platform where response was collected (e.g., TikTok, Instagram)
          createdAt        DateTime                @default(now())
          demographics     Json?                   // Optional demographic information: { "age": "18-24", "gender": "Female", ... }
          completionTime   Int?                    // Time in seconds to complete
          isControlGroup   Boolean                 @default(false) // Flag for control vs exposed
        }

        // Tracks the overall approval state and sign-off
        model SurveyApprovalStatus {
          id               Int              @id @default(autoincrement())
          surveyId         Int              @unique // One status per survey
          survey           BrandLiftSurvey  @relation(fields: [surveyId], references: [id], onDelete: Cascade)
          status           String           @default("PENDING") // PENDING_REVIEW, CHANGES_REQUESTED, APPROVED, SIGNED_OFF
          requestedSignOff Boolean          @default(false)
          signedOffBy      String?          // User ID of the final approver
          signedOffAt      DateTime?
          createdAt        DateTime         @default(now())
          updatedAt        DateTime         @updatedAt
          comments         SurveyApprovalComment[]
        }

        // Stores individual comments on specific questions
        model SurveyApprovalComment {
          id               Int                   @id @default(autoincrement())
          approvalStatusId Int
          approvalStatus   SurveyApprovalStatus  @relation(fields: [approvalStatusId], references: [id], onDelete: Cascade)
          questionId       Int?                  // Optional: Link comment to a specific question
          question         SurveyQuestion?       @relation(fields: [questionId], references: [id])
          authorId         String                // Clerk User ID of the commenter
          // authorName       String?               // Store name for display? Or fetch via Clerk ID?
          commentText      String
          createdAt        DateTime              @default(now())
          status           String                @default("OPEN") // OPEN, RESOLVED, NEED_ACTION
          resolutionNote   String?
        }

        model BrandLiftReport {
           id               Int                     @id @default(autoincrement())
           surveyId         Int
           survey           BrandLiftSurvey         @relation(fields: [surveyId], references: [id], onDelete: Cascade)
           generatedAt      DateTime                @default(now())
           reportData       Json                    // Main aggregated metrics: { "overallLift": 15, "awarenessLift": 20, ... }
           funnelData       Json                    // Data for funnel viz: { "control": {...}, "exposed": {...} }
           kpiResults       Json                    // Results broken down by KPI: { "Brand Awareness": {...}, "Ad Recall": {...} }
           demographicResults Json?                 // Results by demographics: { "age": {...}, "gender": {...} }
           trendData        Json?                   // Data for trend chart: [{ "date": "...", "lift": ... }]
           wordCloudData    Json?                   // Data for word cloud: [{ "text": "...", "value": ... }]
           recommendations  String[]                // Array of recommendation strings
           status           String                  @default("ACTIVE") // ACTIVE, ARCHIVED
         }
        ```
    2.  **[ ] Run Migrations**: `npx prisma migrate dev --name add_brand_lift_models`. Update client: `npx prisma generate`.
    3.  **[ ] Seed Data**: Create sample `BrandLiftSurvey`, etc. for development.
    4.  **[ ] Implement Core APIs**:
        *   [ ] `POST /api/brand-lift/surveys` (Create study linked to campaign)
        *   [ ] `GET /api/brand-lift/surveys?campaignId={id}` (Get study for a campaign)
        *   [ ] `PUT /api/brand-lift/surveys/{id}` (Update study - e.g., status)
        *   [ ] `POST /api/brand-lift/surveys/{id}/questions` (Add/update questions/options - potentially complex logic for batch updates/ordering)
        *   [ ] `GET /api/brand-lift/surveys/{id}/questions` (Get survey structure)
        *   [ ] `POST /api/brand-lift/respond` (Receive response data) - Consider security implications.
    5.  **[ ] Integrate Auth**: Apply Clerk authentication middleware/checks to all new non-public endpoints.

### Phase 2: Study Setup & Survey Builder UI
*   **Goal**: Allow users to initiate studies and build surveys visually.
    1.  **[ ] Build Campaign Selection UI**: Create/adapt component matching `@Select Campaign.png` & `@Select - Edit - Add Campaign.png`. Fetch accessible campaigns.
    2.  **[ ] Build Study Setup UI**: Form for Name, Goals, KPIs (`@Select Campaign.png`). Connect to `POST /api/brand-lift/surveys`.
    3.  **[ ] Build Survey Builder UI**: Implement/adapt component matching `@Survey Design.png`.
        *   [ ] Connect UI actions (add/edit/delete question/option, reorder) to backend APIs (e.g., `POST/PUT/DELETE /api/brand-lift/surveys/{id}/questions`).
        *   [ ] Integrate image/GIF upload (reuse existing asset system like `UploadThing`).
        *   [ ] Implement robust state management for the builder UI.
        *   [ ] Select and integrate a suitable drag-and-drop library (e.g., `dnd-kit`).
    4.  **[ ] Implement Survey Preview**: Adapt preview component. Fetch data using `GET /api/brand-lift/surveys/{id}/questions`. Implement platform switcher UI.
    5.  **[ ] Implement "Submit for Review"**: Button click updates survey status via `PUT /api/brand-lift/surveys/{id}`.

### Phase 3: Collaborative Approval Workflow
*   **Goal**: Enable team feedback and formal sign-off on surveys.
    1.  **[ ] Implement Approval APIs**:
        *   [ ] `POST /api/brand-lift/surveys/{id}/approval/comments` (Add comment, link to question optional)
        *   [ ] `GET /api/brand-lift/surveys/{id}/approval/comments` (Get comments for survey/question)
        *   [ ] `PUT /api/brand-lift/surveys/{id}/approval/comments/{commentId}` (Update comment status - Resolved)
        *   [ ] `PUT /api/brand-lift/surveys/{id}/approval/status` (Update overall status - e.g., Request Sign-off, Approve)
    2.  **[ ] Build Approval Screen UI**: Implement component matching `@Collaborative Approval & Formal Sign-Off.png`.
        *   [ ] Display read-only survey questions.
        *   [ ] Implement comment section per question, fetching/posting via API.
        *   [ ] Implement comment status UI (tags, resolution controls).
        *   [ ] Implement "Request Sign-Off" button (calls API).
        *   [ ] Implement "Submit for Data Collection" button (enabled based on approval status, calls API to update survey status).
    3.  **[ ] Notifications (Optional)**: Implement system for notifying relevant users of comments/status changes.

### Phase 4: Response Collection & Progress Tracking
*   **Goal**: Collect survey responses and provide progress visibility.
    1.  **[ ] Build Public Survey Interface**: Create the page/component respondents interact with. Needs careful consideration of URL structure and authentication (if any). Fetch survey structure via API.
    2.  **[ ] Implement Response Submission**: Ensure public interface correctly validates and submits data to `POST /api/brand-lift/respond`.
    3.  **[ ] Implement Progress API**:
        *   [ ] `GET /api/brand-lift/surveys/{id}/progress` (Fetch response count, potentially calculate interim metrics).
    4.  **[ ] Build Progress Tracking UI**: Implement component matching `@Submission & Progress Tracking.png`.
        *   [ ] Fetch data from progress API.
        *   [ ] Implement refresh button.

### Phase 5: Reporting Dashboard
*   **Goal**: Visualize brand lift results effectively.
    1.  **[ ] Implement Report Generation Backend**: Enhance/implement `/api/brand-lift/surveys/{id}/report`.
        *   [ ] Add logic to aggregate `SurveyResponse` data.
        *   [ ] Implement lift calculation algorithms (Control vs. Exposed).
        *   [ ] Calculate data needed for funnel viz, KPI breakdowns, trends, word cloud.
        *   [ ] Consider caching results for performance.
    2.  **[ ] Build Report UI**: Implement component matching `@Brand Lift Report Page.png`.
        *   [ ] Select and integrate a suitable charting library (ensure consistency) for all visualizations.
        *   [ ] Implement filtering UI and logic (connect to backend or filter frontend data).
        *   [ ] Select and integrate a suitable word cloud component.
        *   [ ] Implement Export Report API & UI logic.

### Phase 6: Testing, Validation & Deployment
*   **Goal**: Ensure a high-quality, production-ready feature.
    1.  **[ ] Unit & Integration Tests**: Write tests for all new components, API endpoints, mappers, and utility functions using Jest and Supertest.
    2.  **[ ] End-to-End Tests (Cypress/Playwright)**: Create tests covering the main user flows identified in Section 2.
    3.  **[ ] Accessibility Tests**: Use axe-core or Lighthouse to validate WCAG 2.1 AA compliance for all UI components and visualizations.
    4.  **[ ] Manual QA**: Thoroughly test all features, edge cases, and different user roles/permissions across multiple devices (mobile, tablet, desktop) and browsers (Chrome, Firefox, Safari).
    5.  **[ ] Error Handling & Validation**: Ensure robust validation and user-friendly error messages throughout.
    6.  **[ ] Performance Testing**: Test API response times and UI rendering speed, especially for reporting.
    7.  **[ ] Security Review**: Audit endpoints, permissions, and data handling.
    8.  **[ ] Staged Rollout**: Deploy to a staging environment for final validation.
    9.  **[ ] Monitoring**: Set up logging and monitoring for API performance and errors in production.
    10. **[ ] Documentation**: Update user guides and technical documentation.
    11. **[ ] Knowledge Capture**: Store implementation procedures and preferences in Graphiti using `mcp_Graphiti_add_episode` for future reference.

## 5. Technical Risks and Mitigations
*(Review and adapt from previous plan - key risks remain relevant)*
| Risk                                                    | Impact | Mitigation                                                      |
| ------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| Data model complexity / changes                         | High   | Thorough upfront schema design; careful migration planning.     |
| Performance of report aggregation                       | Medium | Optimize queries, use indexing, implement caching strategies.   |
| Survey Builder UI complexity                            | High   | Choose stable libraries (e.g., dnd-kit), thorough testing.      |
| Collaborative Approval logic complexity                 | Medium | Clear state management, well-defined API contracts, testing.    |
| Public response collection security/spam                | Medium | Implement rate limiting, CAPTCHA (if needed), data validation.  |
| Frontend state management complexity                    | Medium | Use established patterns (e.g., Zustand, Context), clear data flow. |
| Integration with existing Campaign data                 | Medium | Ensure robust API/DB lookups, handle missing/invalid data.    |
| Authentication/Authorization                            | Medium | Leverage existing Clerk middleware/patterns consistently.       |
| Accessibility compliance issues                         | Medium | Use accessibility testing tools, follow WCAG 2.1 AA guidelines. |

## 6. Integration Points with Existing Systems
*(Review and adapt from previous plan)*
1.  **Campaign Wizard**: Source of campaigns to attach studies to. Requires API access to list/fetch relevant campaign details.
2.  **Asset Management (`UploadThing`?)**: For handling image/GIF uploads in the survey builder. Reuse existing system.
3.  **Authentication/Authorization (Clerk)**: Secure all backend endpoints using `clerkMiddleware` patterns. Use Clerk user IDs where relevant (e.g., comment authors).
4.  **UI Component Library (Shadcn)**: Reuse existing styled components (`Button`, `Card`, `Input`, `Table`, `Dialog`, etc.) for consistency, validated via `/debug-tools/ui-components`.
5.  **API Middleware/Patterns (`@/middleware/api`)**: Utilize existing middleware for validation, error handling, auth checks.
6.  **Database (Prisma ORM, PostgreSQL)**: Extend existing Prisma schema (`schema.prisma`) and use shared client (`@/lib/db`).
7.  **Analytics**: Integrate tracking for feature usage (study creation, completion, report views).

## 7. Success Metrics
*(Review and adapt from previous plan)*
- Feature adoption rate (number of studies created/completed).
- Successful completion of the end-to-end workflow by users.
- Zero frontend components relying on mock data in production.
- API response times within acceptable limits (e.g., < 500ms for most, < 2s for complex reports).
- Positive user feedback on usability and reporting clarity.
- High test coverage (Unit > 80%, E2E covering critical paths).
- Successful integration with Campaign Wizard and Auth systems.
- Accessibility compliance with WCAG 2.1 AA standards.

## 8. Detailed Checklist / Tasks
*(High-level breakdown based on phases - expand as needed)*

*   **Phase 1: Backend Foundation**
    *   [ ] Define/Refine Prisma Schema (All Brand Lift models)
    *   [ ] Run Prisma migrations & generate client
    *   [ ] Implement API: Surveys CRUD (POST, GET, PUT)
    *   [ ] Implement API: Questions/Options CRUD (within Survey context)
    *   [ ] Implement API: Response Collection (POST /respond)
    *   [ ] Implement API: Basic Report Structure (GET /report)
    *   [ ] Implement API: Approval Comment/Status CRUD
    *   [ ] Secure all new endpoints with Clerk Auth middleware
    *   [ ] Create Seed Data
*   **Phase 2: Study Setup & Survey Builder UI**
    *   [ ] Build Campaign Selection Component + API Integration
    *   [ ] Build Study Setup Form Component + API Integration
    *   [ ] Build/Adapt Survey Builder Component (`SurveyDesignContent`)
    *   [ ] Implement Question/Option add/edit/delete/reorder + API Integration
    *   [ ] Implement Image/GIF Upload Integration
    *   [ ] Build/Adapt Survey Preview Component + API Integration
    *   [ ] Implement "Submit for Review" Button + API Integration
*   **Phase 3: Collaborative Approval Workflow**
    *   [ ] Implement Approval APIs (Comments GET/POST, Status PUT)
    *   [ ] Build Approval Screen UI (`SurveyApprovalContent`)
    *   [ ] Implement Comment display and posting feature
    *   [ ] Implement Comment status update feature
    *   [ ] Implement "Request Sign-Off" button logic
    *   [ ] Implement "Submit for Data Collection" button logic
    *   [ ] (Optional) Implement Notifications
*   **Phase 4: Response Collection & Progress Tracking**
    *   [ ] Build Public Survey Interface page/component
    *   [ ] Implement Response Submission logic (frontend validation + API call)
    *   [ ] Implement Progress API (GET /progress)
    *   [ ] Build Progress Tracking UI (`BrandLiftProgressContent`) + API Integration
    *   [ ] Implement Refresh Data functionality
*   **Phase 5: Reporting Dashboard**
    *   [ ] Implement Report Generation Backend Logic (Aggregation, Lift Calc, etc.)
    *   [ ] Build Report UI (`BrandLiftReportContent`)
    *   [ ] Integrate Charting Library for all visualizations
    *   [ ] Implement Filtering UI and logic
    *   [ ] Integrate Word Cloud UI and logic
    *   [ ] Implement Export Report API & UI logic
*   **Phase 6: Testing, Validation & Deployment**
    *   [ ] Write Unit Tests (Backend APIs, Mappers, Utils) using Jest
    *   [ ] Write Unit/Integration Tests (Frontend Components) using Jest
    *   [ ] Write E2E Tests (Cypress/Playwright - Key User Flows)
    *   [ ] Perform Accessibility Testing with axe-core for WCAG 2.1 AA compliance
    *   [ ] Perform Manual QA & Cross-Browser/Device Testing
    *   [ ] Conduct Performance Testing
    *   [ ] Conduct Security Review
    *   [ ] Prepare Deployment (Staging -> Production)
    *   [ ] Set up Monitoring & Alerting
    *   [ ] Create/Update Documentation
    *   [ ] Store Implementation Procedures in Graphiti using `mcp_Graphiti_add_episode`

## 9. UI Component Analysis for Brand Lift Feature

### Analysis of Brand Lift Feature UI Requirements

The Brand Lift feature, as outlined in this document, requires a variety of UI components to support its user flows (campaign selection, survey design, approval workflow, progress tracking, and reporting). Given the adherence to the atomic UI structure (atoms, molecules, organisms, templates, pages), the needs are broken down accordingly. The goal is to reuse existing Shadcn UI components where possible, identify gaps for new components, and assess if direct downloads from Shadcn can accelerate development.

**Key UI Needs for Brand Lift Feature**:
1. **Campaign Selection & Study Setup**:
   - Dropdowns or select components for choosing campaigns.
   - Form inputs for study name, funnel stage, and KPIs.
   - Buttons for initiating a study.
2.  **Survey Design**:
   - Drag-and-drop interface for question and option reordering.
   - Form inputs for question text and options (text, image/GIF).
   - Toggle switches for randomization and mandatory settings.
   - Cards or containers for question blocks.
3.  **Preview & Submit for Review**:
   - Responsive preview containers to simulate different platforms (e.g., TikTok).
   - Buttons for submission actions.
4.  **Collaborative Approval & Sign-Off**:
   - Comment input fields and threaded comment displays.
   - Status indicators (tags for Resolved, Need Action).
   - Buttons for "Request Sign-Off" and "Submit for Data Collection".
5.  **Progress Tracking**:
   - Progress bars or counters for response collection.
   - Cards or dashboards for interim metrics.
   - Refresh buttons.
6.  **Reporting**:
   - Chart components for bar charts, line charts (trends), and funnel visualizations.
   - Word cloud visualization component.
   - Filter dropdowns or menus for demographic and platform filtering.
   - Export buttons.

### Review of Existing Shadcn UI Components

Based on the structure in the project's UI component directory and the UI Component Browser page, it is assumed that the project already includes a set of Shadcn UI components that follow the atomic design structure. Common Shadcn components likely available include:
- **Atoms**: `Button`, `Input`, `Card`, `Icon`, `Switch`, `Skeleton` (for loading states).
- **Molecules**: `Form`, `Select`, `DropdownMenu`, `Table`, `Dialog` (modals).
- **Organisms**: `Tabs`, potentially some dashboard or layout components.

These components cover many of the basic needs for forms, buttons, and layout structures required by the Brand Lift feature. However, there are specific functionalities (like drag-and-drop, charts, and word clouds) that may not be part of the standard Shadcn UI library or existing components.

### Additional UI Components Needed for Brand Lift

Following the atomic UI structure, here are the additional components anticipated to be created or adapted for the Brand Lift feature, categorized by atomic level:

1. **Atoms**:
   - **StatusTag**: A small component to display status indicators (e.g., "Resolved", "Need Action") for comments in the approval workflow. This could be a styled variant of an existing `Badge` component if available, or a new component with color-coded backgrounds.
   - **ProgressIndicator**: A component to visually represent response collection progress (could be a variant of a `Progress` bar if not already in Shadcn).

2. **Molecules**:
   - **DragHandle**: A component to serve as a grip for drag-and-drop functionality in the survey builder. This would be paired with a library like `dnd-kit` for functionality.
   - **CommentThread**: A component to display and input comments for the approval workflow, including author, timestamp, and status. This could build on existing `Input` and `Card` components but requires specific threading layout.
   - **ChartWrapper**: A base component to standardize the styling of various charts (bar, line, funnel) for reporting, ensuring brand consistency (colors, typography). This would wrap a charting library like Recharts or Chart.js.
   - **WordCloud**: A specialized component for visualizing message themes in reporting. This would likely integrate a library like `react-wordcloud` with custom styling.

3. **Organisms**:
   - **SurveyQuestionBuilder**: A complex component for adding, editing, and reordering survey questions and options. It would combine `DragHandle`, `Input`, `Switch`, and `Button` components with drag-and-drop logic.
   - **SurveyPreviewContainer**: A component to render survey previews with platform-specific styling (e.g., TikTok layout). This would use `Card` and custom CSS to mimic platform UIs.
   - **ApprovalDashboard**: A component to manage the approval workflow, displaying survey questions, comment threads, and action buttons. It would combine `CommentThread`, `StatusTag`, and `Button` components.
   - **BrandLiftReportDashboard**: A comprehensive component for displaying all reporting visualizations (charts, word clouds, metrics) with filtering controls. It would integrate `ChartWrapper`, `WordCloud`, `Select`, and `Button` components.

4. **Templates**:
   - **BrandLiftWorkflowTemplate**: A layout template to standardize the multi-step workflow (campaign selection to reporting) with consistent navigation and styling. This would use `Tabs` or a custom stepper component if not already available.

5. **Pages**:
   - Specific page components for each step of the Brand Lift feature (e.g., `CampaignSelectionPage`, `SurveyDesignPage`, `ReportPage`), which would use the above organisms and templates.

### Can We Speed Up by Downloading from Shadcn UI?

Shadcn UI provides a library of reusable components that can be directly installed or copied into a project, which can significantly speed up development for common UI elements. Here's how this can be leveraged:

- **Directly Usable Components from Shadcn UI**:
  - Many of the atomic and molecular components needed (e.g., `Button`, `Input`, `Card`, `Select`, `DropdownMenu`, `Switch`, `Dialog`, `Table`, `Progress`) are likely already part of Shadcn UI or can be directly downloaded from their repository or via their CLI tool if you use it (`npx shadcn-ui@latest add <component-name>`).
  - If any of these are missing from the current UI component directory, they can be quickly added by following Shadcn's installation guide. This avoids custom development for basic components.

- **Components Requiring Customization**:
  - Components like `StatusTag` and `ProgressIndicator` can be built as variants of existing Shadcn components (`Badge`, `Progress`) with custom styling to match brand colors (e.g., Primary: Jet #333333, Accent: Deep Sky Blue #00BFFF).
  - `DragHandle` can be a styled `Icon` component from Shadcn with a grip icon from FontAwesome Pro, combined with a drag-and-drop library.

- **Components Requiring New Development**:
  - Specialized components like `SurveyQuestionBuilder`, `SurveyPreviewContainer`, `ApprovalDashboard`, `BrandLiftReportDashboard`, `ChartWrapper`, and `WordCloud` are unlikely to be directly available in Shadcn UI. These will need custom development, though they can build on Shadcn primitives (e.g., `Card`, `Input`, `Button`) for consistency.
  - For charts and word clouds, integration of external libraries (e.g., Recharts for charts, `react-wordcloud` for word clouds) is necessary, wrapped in custom components styled with Tailwind CSS to match brand guidelines.

- **Speeding Up with Shadcn**:
  - **Recommendation**: Use Shadcn UI's CLI or manually copy any missing basic components (atoms and molecules) directly into the UI component directory. This can save significant time for components like `Progress`, `Badge`, or `Tabs` if they aren't already present.
  - **Process**: Check the Shadcn UI documentation or repository (likely at `shadcn/ui` or via their CLI) for available components. For each missing component, run the appropriate command or copy the code, ensuring it's placed in the correct atomic category in the structure (e.g., atoms for `Button`, molecules for `Select`).
  - **Customization**: After downloading, customize these components with brand colors and FontAwesome icons as needed, using the `/debug-tools/ui-components` tool to validate the look and feel.

### Summary of Action Plan

1. **Audit Existing Components**:
   - Review the contents of the UI component directory to confirm which Shadcn components are already present and categorize them by atomic level (atoms, molecules, etc.).
   - Use the `/debug-tools/ui-components` page to visually inspect available components and their styles.

2. **Download Missing Shadcn Components**:
   - Identify any basic components needed for Brand Lift that are missing (e.g., `Progress`, `Badge`, `Tabs`) and download them directly from Shadcn UI using their CLI or by copying from their repository.
   - Place them in the appropriate atomic structure directories (e.g., atoms for basic elements, molecules for compound components).

3. **Develop Custom Components**:
   - Plan development for specialized components like `SurveyQuestionBuilder`, `ChartWrapper`, and `WordCloud`, building on Shadcn primitives where possible.
   - Integrate external libraries for drag-and-drop (e.g., `dnd-kit`), charts (e.g., Recharts), and word clouds (e.g., `react-wordcloud`), ensuring they are styled to match brand guidelines.

4. **Follow Atomic Structure**:
   - Ensure all new components are organized into atoms, molecules, organisms, templates, and pages, maintaining consistency with the existing structure.
   - For example, `StatusTag` (atom) builds into `CommentThread` (molecule), which builds into `ApprovalDashboard` (organism).

5. **Validate with Brand Guidelines**:
   - Apply brand colors, FontAwesome icon styles (`fa-light` default, `fa-solid` hover), and validate all components using `/debug-tools/ui-components` to ensure consistency.

### Conclusion and Rating

**Rating**: 9.5/10  
This analysis provides a clear path for identifying and creating the necessary UI components for the Brand Lift feature while leveraging Shadcn UI to speed up development. By downloading missing basic components directly from Shadcn and focusing custom development on specialized needs, the team can accelerate the UI build process while maintaining brand consistency and atomic structure.

If further details on specific components, a proposed file structure for new components, or assistance with installation commands for Shadcn UI components are needed, please request them. This approach will ensure a robust and efficient UI development process for the Brand Lift feature.
