# Reporting Architecture

**Last Reviewed**: 2025-05-09
**Status:** Draft - Requires Review by Feature Lead

This document outlines the architecture related to reporting features, derived from codebase analysis (May 8, 2025). It requires review and elaboration by the responsible development team.

## 1. Overview

The reporting system in Justify aims to provide users with actionable insights derived from campaign data, brand lift studies, and other platform activities. Based on current analysis, it appears to have two main functional areas:

1.  **In-App Dashboard Display:** Visualizing key performance indicators (KPIs), metrics, and trends directly within the application UI using interactive dashboards and chart components.
2.  **Downloadable Report Generation:** A user interface allowing users to configure parameters (metrics, date ranges, format) and generate downloadable reports (e.g., PDF, Excel).

## 2. Core Data Models (Prisma)

- **`BrandLiftReport`**: Found in `config/prisma/schema.prisma`, this model is specifically linked to a `BrandLiftStudy`. It stores generated report data (`metrics` JSONB field) and the generation status. This suggests reporting capabilities might currently be most developed for the Brand Lift feature.
- **Other Reporting Data**: No generic `ReportConfiguration` or `GeneratedReport` models were identified in the main schema. This implies that data for general dashboards or other downloadable reports might be:
  - Aggregated and calculated on-the-fly when requested via API.
  - Stored within the primary data models themselves (e.g., aggregated stats on a `Campaign` model - _not currently seen_).
  - Managed by a separate analytics database or data warehouse (See **[System Overview](./system-overview.md)** - _Conceptual_).

_(Action: Tech Lead/Reporting Lead to clarify how non-BrandLift reporting data is stored, configured, and aggregated.)_

## 3. Key Frontend Components

Several UI components support the display and configuration of reports and dashboards:

- **Dashboard Layout (`src/components/ui/metrics-dashboard.tsx`)**: Provides a responsive grid layout suitable for displaying multiple metric cards and charts.
- **KPI Card (`src/components/ui/card-kpi.tsx`)**: A dedicated component for rendering individual Key Performance Indicators in a standardized card format.
- **Chart Components (`src/components/ui/chart-*.tsx`)**: Various chart types (e.g., `LineChart`, `PieChart`, potentially others using libraries like Recharts) are likely used for data visualization.
- **Report Generation UI (`src/components/features/dashboard/page.tsx`)**: Based on code and associated E2E tests (`config/cypress/e2e/reports/generation.cy.js`), this component provides a form for users to:
  - Select report format (PDF/Excel).
  - Choose metrics to include.
  - Define date ranges.
  - Toggle options like including AI insights.
  - Trigger a preview or generation process.
- **Loading Skeletons (`src/components/ui/loading-skeleton.tsx`)**: Includes a `DashboardSkeleton` variant used to indicate loading states for dashboards or reports.

## 4. API Routes & Services

- **Data Fetching for Dashboards**: Specific API routes for fetching _all_ dashboard or report data were not immediately identified. It's likely that dashboard components fetch data from various feature-specific API endpoints (e.g., `/api/campaigns/[id]`, `/api/brand-lift/surveys/[studyId]/report`).
- **Report Generation Endpoint (_Assumed_)**: The report generation UI likely triggers a dedicated backend API endpoint (e.g., `POST /api/reports/generate`) which would:
  - Accept report configuration parameters (metrics, date range, format, campaign ID, etc.).
  - Invoke backend services (`src/services/ReportingService.ts` - _Assumed Location_) to aggregate data.
  - Generate the report file (PDF/Excel) potentially using specific libraries.
  - Return the generated file or a link/status for asynchronous generation.

_(Action: Tech Lead/Reporting Lead to document the specific API endpoints used for dashboard data fetching and report generation, and the corresponding backend services.)_

## 5. Data Aggregation & Generation Logic

- **Location (_Unclear_)**: The core logic for aggregating data across multiple sources (e.g., campaigns, brand lift studies, user data) for display in dashboards or inclusion in generated reports needs clarification. This logic likely resides in:
  - Backend services (`src/services/ReportingService.ts` or feature-specific services).
  - Dedicated API route handlers.
  - Potentially, database views or functions (if complex aggregations are needed).
  - Possibly an external data warehouse or analytics platform (e.g., component J in **[System Overview](./system-overview.md)**).
- **Brand Lift Reports**: The existence of the `BrandLiftReport` model suggests that at least for this feature, computationally intensive metrics might be pre-calculated (perhaps via a background job or triggered upon study completion) and stored in the `metrics` JSON field for faster retrieval.
- **Report Generation Libraries (_TBD_)**: The libraries used for generating PDF or Excel files need to be identified (e.g., `pdf-lib`, `exceljs`).

_(Action: Tech Lead/Reporting Lead to document the data aggregation strategies, calculation logic, and any libraries used for report generation.)_

## 6. Key Considerations

- **Performance**: Aggregating data for reports can be resource-intensive. Optimize database queries, consider caching aggregated results, and potentially use background jobs for generating complex reports.
- **Scalability**: Ensure the reporting system can handle growing amounts of data and user requests.
- **Data Accuracy**: Implement thorough validation and testing to ensure the accuracy of reported metrics.
- **Flexibility**: Balance pre-calculated reports (like `BrandLiftReport`) with the ability to generate custom or on-the-fly reports based on user-defined parameters.
- **Data Sources**: Clearly define the source of truth for each metric displayed or included in reports.

Further investigation and documentation are needed to fully understand the data aggregation logic and the specific implementation details of report generation.
