# Algolia Integration Plan

This document outlines the plan to ensure Algolia search is working correctly and efficiently for both Campaigns and Brand Lift Studies, including automatic updates upon data modification.

## Phase 1: Current State Analysis & Root Cause (Completed)

### Key Findings:

1.  **Root Cause of Immediate Build Failure**:

    - A `git reset --hard 2bc628e9` operation removed critical functions and constants from `src/lib/algolia.ts` that were specifically designed for Brand Lift Study indexing.
    - This broke the batch indexing API route `src/app/api/search/index-brand-lift-studies/route.ts`, which depends on:
      - `indexObjects` (a batch indexing utility)
      - `transformBrandLiftStudyToAlgoliaRecord` (a data transformer)
      - `BRAND_LIFT_STUDIES_INDEX_NAME` (an Algolia index name constant)
      - `BrandLiftStudyAlgoliaRecord` (a type definition)

2.  **Campaign Algolia Integration Status**:

    - **Batch Indexing**: The route `src/app/api/search/index-campaigns/route.ts` (GET and POST) uses `reindexAllCampaigns` from `src/lib/algolia.ts` for batch operations. This function appears to be intact.
    - **Automatic Updates (CRUD)**:
      - **Create**: New campaigns (created via `POST /api/campaigns` or duplicated) are **NOT** automatically indexed in Algolia upon creation.
      - **Update**: Draft campaign updates (via `PATCH /api/campaigns` or `PATCH /api/campaigns/[campaignId]/wizard/[step]`) are **NOT** automatically re-indexed.
      - **Submit**: When a campaign is submitted (via `POST /api/campaigns/[campaignId]/submit`), it **IS** correctly indexed/updated in Algolia using `addOrUpdateCampaignInAlgolia`.
      - **Delete**: Deleted campaigns (via `DELETE /api/campaigns/[campaignId]`) are **NOT** removed from Algolia.
    - **`orgId` Scoping**: `src/lib/algolia.ts` correctly includes `orgId` in `CampaignAlgoliaRecord` if it's present in the Prisma `CampaignWizard` data.

3.  **Brand Lift Study Algolia Integration Status**:

    - **Batch Indexing**: The route `src/app/api/search/index-brand-lift-studies/route.ts` (GET) is **BROKEN** due to the missing utilities mentioned above.
    - **Automatic Updates (CRUD)**: There is **NO EVIDENCE** of automatic indexing (create, update, delete) for individual Brand Lift Studies in the current codebase. This functionality was likely not implemented prior to the `git reset`, or the relevant code was also lost.
    - **`orgId` Scoping**: The broken batch indexing route for Brand Lift Studies (`src/app/api/search/index-brand-lift-studies/route.ts`) includes logic to resolve and use `orgId`.

4.  **Environment Variables & Client Initialization**:
    - `src/lib/algolia.ts` correctly loads and uses necessary Algolia environment variables (`NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_API_KEY`, `ALGOLIA_ADMIN_API_KEY`).
    - Initialization of `searchClient` (frontend) and `adminClient` (backend) appears correct.

### Gaps Identified:

- Missing Algolia utility functions for Brand Lift Studies in `src/lib/algolia.ts`.
- No automatic Algolia updates for Campaign creation (except on final submission) and deletion.
- No automatic Algolia updates for Brand Lift Study CRUD operations at all (beyond the broken batch indexer).

## Phase 2: Design & Implementation Strategy (Backend Completed)

The goal is to create a robust, consistent, and automatically updating Algolia integration for both Campaigns and Brand Lift Studies.

### Step 2.1: Restore/Rebuild Core Algolia Utilities for Brand Lift Studies (In Progress)

**File**: `src/lib/algolia.ts`

The following have been added (stubbed implementations, require refinement):

1.  **`BrandLiftStudyAlgoliaRecord` Interface**:

    ```typescript
    // In src/lib/algolia.ts
    export interface BrandLiftStudyAlgoliaRecord {
      objectID: string; // Typically BrandLiftStudy.id
      id: string;
      orgId: string; // Crucial for multi-tenancy
      name: string;
      studyStatus: string; // e.g., DRAFT, COLLECTING, COMPLETED
      funnelStage?: string;
      primaryKpi?: string;
      secondaryKpis?: string[];
      campaignSubmissionId: number; // Link to CampaignWizardSubmission
      campaignName?: string; // Denormalized for easier display/filtering
      createdAt: string; // ISO string
      updatedAt: string; // ISO string
    }
    ```

2.  **`BRAND_LIFT_STUDIES_INDEX_NAME` Constant**:

    ```typescript
    // In src/lib/algolia.ts
    export const BRAND_LIFT_STUDIES_INDEX_NAME =
      process.env.ALGOLIA_BRAND_LIFT_STUDIES_INDEX_NAME || 'brand_lift_studies';
    ```

3.  **`transformBrandLiftStudyToAlgoliaRecord` Function**:

    - Takes a Prisma `BrandLiftStudy` object (type `any` for now, needs Prisma type) and a resolved `orgId`.
    - Transforms it into `BrandLiftStudyAlgoliaRecord`.
    - Basic implementation added; needs proper Prisma types and detailed field mapping.

    ```typescript
    // Signature in src/lib/algolia.ts
    export function transformBrandLiftStudyToAlgoliaRecord(
      study: any, // TODO: Replace with PrismaBrandLiftStudy type with relations
      orgId: string
    ): BrandLiftStudyAlgoliaRecord;
    ```

4.  **`addOrUpdateBrandLiftStudyInAlgolia` Function**:

    - Takes Prisma `BrandLiftStudy` data (type `any` for now).
    - Internally calls `transformBrandLiftStudyToAlgoliaRecord` and saves to `BRAND_LIFT_STUDIES_INDEX_NAME`.
    - Basic implementation added; needs Prisma types and robust `orgId` handling before calling the transformer.

    ```typescript
    // Signature in src/lib/algolia.ts
    export async function addOrUpdateBrandLiftStudyInAlgolia(
      studyData: any // TODO: Replace with PrismaBrandLiftStudy type
    ): Promise<void>;
    ```

5.  **`deleteBrandLiftStudyFromAlgolia` Function**:

    - Takes a `studyId` (objectID).
    - Deletes the object from `BRAND_LIFT_STUDIES_INDEX_NAME`.
    - Basic implementation added.

    ```typescript
    // Signature in src/lib/algolia.ts
    export async function deleteBrandLiftStudyFromAlgolia(objectID: string): Promise<void>;
    ```

6.  **`reindexAllBrandLiftStudies` Function**:
    - Takes an array of Prisma `BrandLiftStudy` objects (type `any[]` for now).
    - Clears the `BRAND_LIFT_STUDIES_INDEX_NAME` and indexes all provided studies.
    - Basic implementation added (mirrors `reindexAllCampaigns`); needs Prisma types and robust `orgId` resolution within its map function.
    ```typescript
    // Signature in src/lib/algolia.ts
    export async function reindexAllBrandLiftStudies(
      studies: any[] // TODO: Replace with PrismaBrandLiftStudy[] type
    ): Promise<void>;
    ```

**Next actions for Step 2.1:**

- Replace `any` types with correct Prisma types in `src/lib/algolia.ts`.
- Implement robust `orgId` resolution within these new functions.
- Fully implement the transformation logic in `transformBrandLiftStudyToAlgoliaRecord`.

### Step 2.2: Repair API Routes (Upcoming)

1.  **`src/app/api/search/index-brand-lift-studies/route.ts`**:
    - Update imports to use `reindexAllBrandLiftStudies` and related constants/types.
2.  **`src/app/api/search/index-campaigns/route.ts`**:
    - Verify continued correct operation.

### Step 2.3: Implement Automatic CRUD Updates for Algolia (Completed)

**For Campaigns:**

- `POST /api/campaigns`: Calls `addOrUpdateCampaignInAlgolia` after successful DB creation.
- `POST /api/campaigns/[campaignId]/submit`: Already calls `addOrUpdateCampaignInAlgolia`.
- `DELETE /api/campaigns/[campaignId]`: Calls `deleteCampaignFromAlgolia` after successful DB deletion.
- Draft campaign updates are **not** currently re-indexed automatically on every save (only on submission). This matches the existing pattern and can be reviewed if requirements change.

**For Brand Lift Studies:**

- `POST /api/brand-lift/surveys` (Create): Calls `addOrUpdateBrandLiftStudyInAlgolia` after successful DB creation.
- `PUT /api/brand-lift/surveys/[studyId]` (Update): Calls `addOrUpdateBrandLiftStudyInAlgolia` after successful DB update.
- `DELETE /api/brand-lift/surveys/[studyId]`: Calls `deleteBrandLiftStudyFromAlgolia` after successful DB deletion.

### Step 2.4: Security and `orgId` Scoping for Search (Backend Completed, Frontend Partially Implemented - Requires Testing & Verification)

- **Server-Side Functions (`src/lib/algolia.ts`) (Completed)**:

  - `searchAlgoliaCampaigns` and `searchAlgoliaBrandLiftStudies` now accept an optional `orgId` parameter and apply it as a `filters` condition in the Algolia query.
  - Indexing functions ensure `orgId` is part of the Algolia records for both campaigns and brand lift studies, derived from the Prisma data.

- **Frontend/Client-Side Integration (`src/providers/SearchProvider.tsx` Updated):**
  - The main `SearchProvider.tsx` has been updated to fetch the `orgId` using Clerk's `useAuth()` hook and pass it to `searchAlgoliaCampaigns`.
  - **USER TODO & VERIFICATION NEEDED**:
    1.  **Test `SearchProvider`**: Thoroughly test the global campaign search to ensure `orgId` filtering is working correctly.
    2.  **Other Search Instances**: If other parts of the application use Algolia search directly (e.g., via React InstantSearch without going through `SearchProvider.tsx`) or through different API routes, those implementations **must also be updated** to incorporate `orgId` filtering. This involves:
        - For API routes: Fetching `orgId` on the server and passing it to the search functions.
        - For direct client-side Algolia (React InstantSearch): Wrapping the `searchClient` to inject the `orgId` filter, using `orgId` from `useAuth()`.

## Phase 3: Testing & Validation (USER TODO - CRITICAL NEXT STEP)

**Objective**: Ensure the Algolia integration is robust, correct, and secure across the full application.

**Key Areas to Test (on both localhost and Vercel/staging):**

1.  **Campaign CRUD & Indexing**:
    - Create, submit, (optionally update post-submission), and delete campaigns. Verify Algolia `campaigns` index reflects changes immediately and accurately, including `orgId`.
2.  **Brand Lift Study (BLS) CRUD & Indexing**:
    - Create, update, and delete BLS. Verify Algolia `brand_lift_studies` index reflects changes immediately and accurately, including `orgId`.
3.  **Search Functionality & `orgId` Scoping (Comprehensive)**:
    - **Verify `SearchProvider.tsx`**: Test global campaign search with users in different organizations and users with no `orgId`. Results must be strictly scoped to the active `orgId`.
    - **Verify ALL other search instances**: If other search UIs exist (e.g., for BLS, or specialized campaign views), ensure they correctly implement and respect `orgId` filtering.
    - Confirm users cannot access data from other organizations via search.
4.  **Batch Re-indexing API Routes**:
    - Trigger `GET /api/search/index-campaigns` and `GET /api/search/index-brand-lift-studies`. Verify correct re-indexing and check server logs.
5.  **Algolia Dashboard Verification**:
    - Monitor Algolia dashboard during all tests for operations, record structure, and errors.
6.  **Error Handling & Edge Cases**:
    - Test with missing `orgId` if possible. Test behavior if Algolia API is temporarily down (DB operations should succeed).
7.  **Build & Linting**:
    - Confirm `npm run build` and `npm run lint` pass cleanly (address any remaining non-critical linter warnings in `src/app/api/campaigns/route.ts` if desired for perfect cleanliness).

## Phase 4: Documentation (This document & Detailed Docs - In Progress)

- This document (`algolia.md`) serves as the high-level plan and status tracker.
- A more comprehensive document (`docs/algolia-integration.md`) will be created to detail the architecture and usage for developers.
- Review and refine error logging for all Algolia operations for better monitoring.
