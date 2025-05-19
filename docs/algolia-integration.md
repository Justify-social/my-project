# Algolia Integration Documentation

**Version:** 1.0
**Last Updated:** May 19, 2025

## 1. Overview

This document details the integration of Algolia search functionality within the `my-project` application. Algolia is used to provide fast and relevant search capabilities for **Campaigns** and **Brand Lift Studies**.

The integration ensures that:

- Data is automatically indexed in Algolia when Campaigns or Brand Lift Studies are created, updated, or deleted.
- Searches are scoped by organization ID (`orgId`) to maintain data privacy and relevance for users.
- Batch re-indexing mechanisms are available for full data synchronization.

## 2. Architecture

The Algolia integration primarily revolves around:

- **`src/lib/algolia.ts`**: This is the core library file containing all Algolia client initializations, data transformation functions, indexing logic, and search helper functions. It acts as the Single Source of Truth (SSOT) for Algolia interactions.
- **Prisma Models**: Data from `CampaignWizard` and `BrandLiftStudy` Prisma models is transformed and sent to Algolia.
- **Next.js API Routes**:
  - Specific API routes handle the Create, Update, Delete (CRUD) operations for Campaigns and Brand Lift Studies. These routes now include calls to `src/lib/algolia.ts` functions to keep Algolia in sync.
  - Dedicated API routes (`/api/search/index-campaigns` and `/api/search/index-brand-lift-studies`) exist for manual batch re-indexing.
- **Algolia Dashboard**: Used for managing indices, monitoring usage, and debugging.
- **Environment Variables**: Securely store Algolia application ID and API keys.

### Data Flow for Indexing:

1.  A CRUD operation occurs on a Campaign or Brand Lift Study (e.g., via an API call from the frontend).
2.  The relevant API route handler in `src/app/api/...` processes the request and performs the database operation using Prisma.
3.  After a successful database operation, the API route handler calls the appropriate function from `src/lib/algolia.ts` (e.g., `addOrUpdateCampaignInAlgolia`, `deleteBrandLiftStudyFromAlgolia`).
4.  The function in `src/lib/algolia.ts`:
    a. Ensures the Algolia admin client is initialized.
    b. Transforms the Prisma data into the corresponding Algolia record format (e.g., `CampaignAlgoliaRecord`, `BrandLiftStudyAlgoliaRecord`). This includes resolving and adding the `orgId`.
    c. Uses the Algolia admin client to save or delete the object in the designated Algolia index.
5.  Errors during Algolia operations are logged but generally do not fail the primary database operation to maintain application resilience.

## 3. Environment Variables

The following environment variables are required for Algolia integration:

- `NEXT_PUBLIC_ALGOLIA_APP_ID`: Your Algolia Application ID. (Public, used by frontend search client)
- `NEXT_PUBLIC_ALGOLIA_API_KEY`: Your Algolia Search-Only API Key. (Public, used by frontend search client)
- `ALGOLIA_ADMIN_API_KEY`: Your Algolia Admin API Key. (Secret, kept on the server for indexing operations)
- `ALGOLIA_CAMPAIGNS_INDEX_NAME` (Optional): Name of the Algolia index for campaigns. Defaults to `campaigns` if not set. (Used by `src/lib/algolia.ts`)
- `ALGOLIA_BRAND_LIFT_STUDIES_INDEX_NAME` (Optional): Name of the Algolia index for brand lift studies. Defaults to `brand_lift_studies` if not set. (Used by `src/lib/algolia.ts`)

These should be configured in your Vercel project settings and in your local `.env.local` file for development.

## 4. Key Files and Modules

- **`src/lib/algolia.ts`**:

  - Initializes Algolia search and admin clients.
  - Defines `CampaignAlgoliaRecord` and `BrandLiftStudyAlgoliaRecord` interfaces.
  - Contains transformation functions:
    - `transformCampaignForAlgolia(campaign: CampaignWizard): CampaignAlgoliaRecord`
    - `transformBrandLiftStudyToAlgoliaRecord(study: PrismaBrandLiftStudy, orgId: string): BrandLiftStudyAlgoliaRecord`
  - Provides CRUD operations for Algolia:
    - `addOrUpdateCampaignInAlgolia(campaignData: CampaignWizard)`
    - `deleteCampaignFromAlgolia(objectID: string)`
    - `reindexAllCampaigns(campaigns: CampaignWizard[])`
    - `addOrUpdateBrandLiftStudyInAlgolia(studyData: PrismaBrandLiftStudy)`
    - `deleteBrandLiftStudyFromAlgolia(objectID: string)`
    - `reindexAllBrandLiftStudies(studies: PrismaBrandLiftStudy[])`
  - Provides search functions with `orgId` scoping:
    - `searchAlgoliaCampaigns(query: string, orgId?: string)`
    - `searchAlgoliaBrandLiftStudies(query: string, orgId?: string)`
  - Exports `algoliaFrontendConfig` for potential use by client-side InstantSearch.

- **API Routes for CRUD operations (examples):**

  - `src/app/api/campaigns/route.ts` (POST for create)
  - `src/app/api/campaigns/[campaignId]/route.ts` (DELETE for delete)
  - `src/app/api/campaigns/[campaignId]/submit/route.ts` (POST for update on submission)
  - `src/app/api/brand-lift/surveys/route.ts` (POST for create)
  - `src/app/api/brand-lift/surveys/[studyId]/route.ts` (PUT for update, DELETE for delete)
    _These routes now contain logic to call the functions in `src/lib/algolia.ts`._

- **API Routes for Batch Re-indexing:**

  - `src/app/api/search/index-campaigns/route.ts` (GET): Triggers `reindexAllCampaigns`.
  - `src/app/api/search/index-brand-lift-studies/route.ts` (GET): Triggers `reindexAllBrandLiftStudies`.

- **Prisma Schema (`schema.prisma`)**: Defines the `CampaignWizard` and `BrandLiftStudy` models whose data is indexed. Ensure `orgId` fields are present and correctly populated.

## 5. Indexing Strategy

### 5.1. Indices

Two separate Algolia indices are used:

1.  **Campaigns Index**: Name configured by `ALGOLIA_CAMPAIGNS_INDEX_NAME` (defaults to `campaigns`). Stores `CampaignAlgoliaRecord` objects.
2.  **Brand Lift Studies Index**: Name configured by `ALGOLIA_BRAND_LIFT_STUDIES_INDEX_NAME` (defaults to `brand_lift_studies`). Stores `BrandLiftStudyAlgoliaRecord` objects.

### 5.2. Data Transformation

- **`transformCampaignForAlgolia`**:
  - Takes a `CampaignWizard` object from Prisma.
  - Maps its fields to `CampaignAlgoliaRecord`.
  - Includes `orgId`.
  - Uses `EnumTransformers` if necessary for any enum value conversions.
- **`transformBrandLiftStudyToAlgoliaRecord`**:
  - Takes a `PrismaBrandLiftStudy` object (expected to include related campaign data for `campaignName` and potentially for `orgId` resolution if not directly on the study) and an explicitly resolved `orgId`.
  - Maps its fields to `BrandLiftStudyAlgoliaRecord`.
  - Includes the resolved `orgId`.
  - Uses `EnumTransformers` if necessary.

### 5.3. Automatic Updates (CRUD Triggers)

- **Campaigns**:
  - **Create**: Indexed via `addOrUpdateCampaignInAlgolia` when a new campaign is created (`POST /api/campaigns`).
  - **Update**: Re-indexed via `addOrUpdateCampaignInAlgolia` when a campaign is submitted (`POST /api/campaigns/[campaignId]/submit`). Updates to draft campaigns do not automatically re-index in Algolia by default.
  - **Delete**: Removed from Algolia via `deleteCampaignFromAlgolia` when a campaign is deleted (`DELETE /api/campaigns/[campaignId]`).
- **Brand Lift Studies**:
  - **Create**: Indexed via `addOrUpdateBrandLiftStudyInAlgolia` when a new study is created (`POST /api/brand-lift/surveys`).
  - **Update**: Re-indexed via `addOrUpdateBrandLiftStudyInAlgolia` when a study is updated (`PUT /api/brand-lift/surveys/[studyId]`).
  - **Delete**: Removed from Algolia via `deleteBrandLiftStudyFromAlgolia` when a study is deleted (`DELETE /api/brand-lift/surveys/[studyId]`).

### 5.4. Batch Re-indexing

- To perform a full re-synchronization of data:
  - **Campaigns**: Send a GET request to `/api/search/index-campaigns`.
  - **Brand Lift Studies**: Send a GET request to `/api/search/index-brand-lift-studies`.
- These routes fetch all relevant records from the database, transform them, clear the respective Algolia index, and then upload the new set of records. This is useful for initial setup or correcting any data drift.
- **Caution**: These are destructive operations on the index (clear then re-populate). Secure these endpoints appropriately (e.g., admin-only access, IP restrictions) if they are exposed publicly.

## 6. `orgId` Scoping and Security

- **Indexing**: All records (`CampaignAlgoliaRecord`, `BrandLiftStudyAlgoliaRecord`) stored in Algolia include an `orgId` field. This is derived from the Prisma data (e.g., `CampaignWizard.orgId`, `BrandLiftStudy.orgId`, or via related campaign data).
- **Searching (Backend)**: The search helper functions `searchAlgoliaCampaigns` and `searchAlgoliaBrandLiftStudies` in `src/lib/algolia.ts` accept an `orgId` parameter. When provided, this `orgId` is used to construct an Algolia `filters` string (e.g., `orgId:'THE_ACTUAL_ORG_ID'`) to ensure search results are scoped to the specified organization.
- **Searching (Frontend - ACTION REQUIRED)**:
  - The frontend search implementation **must** ensure that the correct `orgId` (belonging to the currently authenticated user and their active organization/context) is used when querying Algolia.
  - **If using API Routes for Search**: The API route handler must fetch the user's `orgId` from the authentication context (e.g., Clerk) and pass it to the backend search functions.
  - **If using Direct Client-Side Algolia (e.g., React InstantSearch)**: The Algolia `searchClient` instance used by the frontend components needs to be configured to automatically apply the `orgId` filter. This typically involves wrapping the standard Algolia client to inject this filter based on the user's current `orgId` (obtained from Clerk's `useAuth()` or similar).

## 7. Frontend Considerations

- **Search UI**: If using a library like React InstantSearch, initialize its `searchClient` with the `NEXT_PUBLIC_ALGOLIA_APP_ID` and `NEXT_PUBLIC_ALGOLIA_API_KEY`.
- **`orgId` Filtering**: As mentioned above, ensure all frontend-initiated searches are scoped by the user's `orgId`.
- **Displaying Results**: The structure of `CampaignAlgoliaRecord` and `BrandLiftStudyAlgoliaRecord` should guide how search results are displayed.

## 8. Troubleshooting

- **Check Server Logs**: Backend logs (especially from `src/lib/algolia.ts` and API routes) will contain information about indexing operations and any errors.
- **Algolia Dashboard**:
  - **Indices Tab**: Verify records are present, check their structure, and see the total record count.
  - **Search Tab**: Test queries directly in the dashboard.
  - **API Logs / Monitoring Tab**: Look for errors in API calls made from your backend to Algolia.
- **Environment Variables**: Double-check that all Algolia environment variables are correctly set in your local `.env.local` and in your Vercel project settings.
- **Data Mismatches**: If data in Algolia seems stale or incorrect, consider using the batch re-indexing API routes.
- **Build Errors**: Ensure all Prisma client generations and Next.js build steps complete without error.

## 9. Future Enhancements (Potential)

- More granular error handling and retry mechanisms for Algolia operations.
- Use webhooks from Algolia for advanced monitoring or two-way sync if needed.
- Implement more sophisticated ranking and relevance tuning in Algolia if search requirements evolve.
- Consider using Algolia's features for A/B testing search configurations.

This document should provide a solid foundation for understanding and maintaining the Algolia integration.
