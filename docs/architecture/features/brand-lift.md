# Brand Lift Feature Architecture

**Last Reviewed:** 2025-05-09
**Status:** Draft - Requires Review by Feature Lead

## 1. Overview & Goals

The Brand Lift feature allows users (Brand Marketers, Agencies) to measure the impact of their marketing campaigns on key brand metrics. This is achieved by conducting surveys among target audiences (typically exposed vs. control groups) before, during, or after a campaign.

**Core Goals:**

- Quantify changes in brand awareness, ad recall, message association, consideration, purchase intent, etc.
- Provide users with actionable insights based on survey results.
- Integrate seamlessly with campaign setup and reporting.
- Facilitate an approval workflow for survey design.

## 2. Core Data Models (Prisma)

The persistence layer relies heavily on a set of interconnected models defined in `config/prisma/schema.prisma`:

- **`BrandLiftStudy`**: The central model representing a single study linked to a `CampaignWizardSubmission`. Stores metadata like name, status (`BrandLiftStudyStatus` enum), target funnel stage, KPIs, and importantly, links to the external survey platform (e.g., `cintProjectId`).
- **`SurveyQuestion`**: Defines individual questions within a study, including text, type (`SurveyQuestionType` enum), order, and links to options and approval comments.
- **`SurveyOption`**: Represents the possible answers for a multiple-choice or single-choice question.
- **`SurveyResponse`**: Stores individual responses collected from the external panel (e.g., Cint), including respondent ID, control/exposed group flag, and the actual answers (stored in a JSON field).
- **`BrandLiftReport`**: Holds the calculated results and metrics derived from analyzing `SurveyResponse` data, typically stored in a JSON `metrics` field.
- **`SurveyApprovalStatus` / `SurveyApprovalComment`**: Manage the collaborative review and approval workflow for survey questions before launch.

_(Refer to `config/prisma/schema.prisma` for full field details and relations.)_

## 3. Key Components & UI Flow

The user interacts with the Brand Lift feature through several frontend components, primarily located under `src/components/features/brand-lift/`:

1.  **Campaign Selection (`CampaignSelector.tsx`)**: User selects a completed campaign to associate the Brand Lift study with.
2.  **Study Setup (`CampaignReviewStudySetup.tsx`)**: User defines the study name, funnel stage, and selects primary/secondary KPIs.
3.  **Survey Design (`SurveyQuestionBuilder.tsx`)**: Interface for adding, editing, reordering, and configuring survey questions and options. May include AI suggestions.
4.  **Survey Preview**: Allows users to see how the survey will appear to respondents.
5.  **Approval Workflow (`ApprovalWorkflow.tsx`)**: Facilitates review and commenting on survey questions by stakeholders before sign-off.
6.  **Progress Tracking (`ProgressTracker.tsx`)**: Displays the status of data collection (e.g., response counts from Cint) after launch.
7.  **Reporting**: Visualization of results stored in the `BrandLiftReport` model (likely integrated into a general reporting dashboard or a dedicated Brand Lift report page).

## 4. Backend Logic & API

- **API Routes (`src/app/api/brand-lift/surveys/...`)**: Dedicated API endpoints handle CRUD operations for studies, questions, options, responses, approvals, and potentially report generation/retrieval.
- **Services (`src/services/BrandLiftService.ts` - _Assumed Location_)**: Encapsulates the core business logic:
  - Managing study/question/response state transitions.
  - Interacting with the database (via Prisma).
  - Orchestrating calls to the external survey panel provider (Cint).
  - Potentially triggering report generation logic.

## 5. External Integration: Cint (Survey Panel Provider)

- **Role**: Cint provides the respondents for the surveys.
- **Integration Points (Primarily Backend)**:
  - **Survey Launch**: The backend service likely calls the Cint API to:
    - Create a new survey project in Cint based on study parameters.
    - Define the target audience (demographics, location) and quotas.
    - Provide the survey questions/link.
  - **Response Collection**: The backend needs a mechanism (likely Cint webhooks or polling Cint's API) to retrieve survey responses as they are collected.
  - **Progress Monitoring**: The backend may periodically query the Cint API to get live progress updates (completes, prescreens) for display in the `ProgressTracker` component.
- **Data Mapping**: Careful mapping is required between Justify's internal study/audience definitions and Cint's API requirements.
- **Authentication**: Securely managing API keys/credentials for the Cint API.

_(See `docs/architecture/external-integrations.md#3-cint-survey-panels--audience-data` for more context - Requires detailed input from feature lead.)_

## 6. Data Flow (Simplified: Study Launch & Response)

1.  User completes survey design and approval, clicks "Launch".
2.  Frontend calls a "launch study" API endpoint (e.g., `PUT /api/brand-lift/surveys/{studyId}/launch`).
3.  API Handler calls `BrandLiftService`.
4.  `BrandLiftService` validates study status.
5.  `BrandLiftService` makes API calls to Cint to create the project, define target groups, and launch the survey.
6.  `BrandLiftService` stores relevant Cint project IDs (`cintProjectId`, `cintTargetGroupId`) in the `BrandLiftStudy` record.
7.  `BrandLiftService` updates the `BrandLiftStudy` status to `COLLECTING`.
8.  (Asynchronously) Cint collects responses.
9.  A Cint Webhook triggers an endpoint (e.g., `POST /api/webhooks/cint`) OR a scheduled job polls the Cint API.
10. The webhook handler/polling job retrieves new responses from Cint.
11. It maps Cint response data to the `SurveyResponse` model format.
12. It saves the `SurveyResponse` records to the Justify database.
13. (Periodically/On Completion) A separate process analyzes `SurveyResponse` data and generates/updates the `BrandLiftReport`.

## 7. Key Considerations & Potential Challenges

- **Cint API Reliability & Rate Limits**: Handling potential errors or rate limits from the Cint API.
- **Asynchronous Operations**: Managing the asynchronous nature of survey launch and response collection (webhooks, polling, status updates).
- **Data Consistency**: Ensuring data remains consistent between Justify's database and Cint's system, especially regarding survey status and response counts.
- **Scalability**: Handling potentially large numbers of survey responses and efficient report generation.
- **Error Handling**: Robust error handling throughout the process (API calls, data processing, webhook validation).
- **Cost Management**: Monitoring Cint API usage and associated costs.

This document provides a foundational understanding. Specific implementation details, API contracts with Cint, and detailed error handling strategies require further elaboration and review.
