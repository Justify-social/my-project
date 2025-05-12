# Plan: Refactor CampaignWizard and BrandLiftStudy for Organization-Centric Data Scoping

This document outlines the plan to refactor core entities (`CampaignWizard`, `BrandLiftStudy`) to be primarily scoped, owned, and authorized by `orgId` (Clerk Organization ID). The `userId` (internal User UUID) will be maintained for attribution purposes (e.g., "created by," "last modified by") within the organization's scope.

**Goal:** Enhance multi-tenancy support, ensure data isolation and sharing _within_ organizations, and align with best practices for SaaS applications.

**SSOT Principle:** Clerk will remain the Single Source of Truth for User and Organization identities and memberships. Our internal database will store `clerkUserId` (linking to Clerk's user) and `orgId` (Clerk's organization ID) as needed.

---

## Phase 1: Schema & Foundation (Completed & Applied)

1.  **Modify Prisma Schema (`config/prisma/schema.prisma`)**

    - **`CampaignWizard` Model:**
      - [x] Add `orgId String?` (nullable for phased migration; new records will require it via API logic). This field denotes **organization ownership**.
      - [x] Keep existing `userId String?` (maps to internal User UUID). This field signifies the **creator or last editor** of the campaign _within the organization_.
      - [x] Add `@@index([orgId])`.
    - **`BrandLiftStudy` Model:**
      - [x] Add `orgId String?` (nullable for phased migration; new records will require it). This field denotes **organization ownership**.
      - [x] Keep `userId` association via `CampaignWizardSubmission` for attribution of the underlying submitted campaign.
      - [x] Add `@@index([orgId])`.
    - **Rationale for Nullable `orgId`:** Allows for a phased rollout and easier data migration for existing records. API logic will enforce `orgId` for all _new_ records.

2.  **Database Migration & Prisma Client Regeneration (User Action - Completed)**
    - [x] User to run `npx prisma migrate dev --name add_org_id_to_campaigns_and_brandlift`.
    - [x] User to run `npx prisma generate`.

---

## Phase 2: API Endpoint Modifications - Write Operations

**Core Principle for Write Operations:** All create, update, and delete operations must be authorized to ensure the user is acting within their authenticated `orgId`, and that the data being modified belongs to that `orgId`.

1.  **Campaign Creation (`POST /api/campaigns` - `src/app/api/campaigns/route.ts`)**

    - [x] Fetch `clerkUserId` and `orgId` from `await auth()`.
    - [x] **Enforce `orgId`:** If `orgId` is null/undefined, throw `BadRequestError` ("Active organization context is required to create a campaign.").
    - [x] Map `clerkUserId` to `internalUserId` (internal User UUID).
    - [x] Store the fetched `orgId` in the new `CampaignWizard.orgId` field (for **organization ownership**).
    - [x] Store `internalUserId` in `CampaignWizard.userId` (for **creator attribution**).
    - [x] Ensure `addOrUpdateCampaignInAlgolia` is called with the `CampaignWizard` object that now includes `orgId`.

2.  **Campaign Wizard Step Updates (`PATCH /api/campaigns/[campaignId]/wizard/[step]` - `src/app/api/campaigns/[campaignId]/wizard/[step]/route.ts`)**

    - Fetch `clerkUserId` and `orgId` from `await auth()`.
    - **Enforce `orgId`:** If `orgId` is null/undefined, throw `BadRequestError`.
    - **Authorization:** Before updating, fetch the `CampaignWizard` (by `campaignId`) and verify `campaignWizard.orgId === orgId`. If not, or if `campaignWizard.orgId` is null (for legacy data not yet migrated but being accessed by an org-context user), throw `ForbiddenError`.
    - Update `CampaignWizard.userId` to the current `internalUserId` if tracking last editor is desired.
    - If the update modifies data that affects Algolia, ensure `addOrUpdateCampaignInAlgolia` is called with the updated `CampaignWizard` (which includes `orgId`). _(Existing Algolia call is okay)_

3.  **Campaign Submission (`POST /api/campaigns/[campaignId]/submit` - `src/app/api/campaigns/[campaignId]/submit/route.ts`)**

    - Fetch `clerkUserId` and `orgId` from `await auth()`.
    - **Enforce `orgId`:** If `orgId` is null/undefined, throw `BadRequestError`.
    - **Authorization:** Before creating `CampaignWizardSubmission` and updating `CampaignWizard` status, verify `CampaignWizard.orgId === orgId`. If not, throw `ForbiddenError`.
    - The `CampaignWizardSubmission.userId` will store the `internalUserId` of the user performing the submission, for attribution.
    - When updating `CampaignWizard` status to `SUBMITTED`, ensure `addOrUpdateCampaignInAlgolia` is called. _(Existing Algolia call is okay)_

4.  **Brand Lift Study Creation (`POST /api/brand-lift/surveys` - `src/app/api/brand-lift/surveys/route.ts`)**

    - Fetch `clerkUserId` and `orgId` from `await auth()`.
    - **Enforce `orgId`:** If `orgId` is null/undefined, throw `BadRequestError`.
    - **Authorization & Association:**
      - When creating a `BrandLiftStudy`, the `campaignWizardId` (leading to `CampaignWizardSubmission`) is provided.
      - Fetch the associated `CampaignWizard` and verify `CampaignWizard.orgId === orgId`. If not, throw `ForbiddenError`.
      - Store the active `orgId` in the new `BrandLiftStudy.orgId` field (for **organization ownership**).
      - The user performing the action can be logged if necessary for audit, but primary ownership is by `orgId`.

5.  **Other Brand Lift Write Operations (e.g., Updates, Deletes, Question/Option Reordering):**
    - Fetch `orgId` from `await auth()`. Enforce its presence.
    - Verify that the target `BrandLiftStudy.orgId === orgId` before allowing modification. If not, throw `ForbiddenError`.

---

## Phase 3: API Endpoint Modifications - Read & Delete Operations

**Core Principle for Read Operations:** Data fetched should be scoped to the user's active `orgId` to ensure they only see campaigns and studies belonging to their organization.

1.  **List Campaigns (`GET /api/list-campaigns` - used by `/campaigns` page)**
    - Fetch `orgId` from `await auth()`.
    - **Enforce `orgId`:** If `orgId` is null/undefined, return an empty list or an appropriate error/message (e.g., "Please select an active organization to view campaigns.").
    - Refactor `getAllCampaignsForUser` (in `src/lib/data/campaigns.ts`) to `getAllCampaignsForOrg(orgId: string, currentUserId?: string)`.
      - The primary Prisma query `prisma.campaignWizard.findMany()` **must** include `where: { orgId: orgId, ...otherFilters }` to ensure campaigns are shared across the organization.
      - The `currentUserId` can be used for a secondary filter like a "Created by me (within this org)" toggle in the UI, but the default view should list all campaigns for the `orgId`.
2.  **Get Single Campaign (`GET /api/campaigns/[campaignId]` - `src/app/api/campaigns/[campaignId]/route.ts`)**
    - Fetch `orgId` from `await auth()`. Enforce its presence for non-legacy data.
    - **Authorization:** Modify `prisma.campaignWizard.findFirst()` (or `findUnique`) to `where: { id: campaignId, orgId: orgId }`.
    - Handle legacy campaigns (where `CampaignWizard.orgId` is null) by potentially allowing access if `CampaignWizard.userId` matches the current user's internal ID. This is a transitional rule.
3.  **Delete Campaign (`DELETE /api/campaigns/[campaignId]` - `src/app/api/campaigns/[campaignId]/route.ts`)**

    - Fetch `orgId` from `await auth()`. Enforce its presence.
    - **Authorization:** Before deleting, fetch `CampaignWizard` and verify `CampaignWizard.orgId === orgId`. If not, throw `ForbiddenError`.
    - The call to `deleteCampaignFromAlgolia(campaignId)` remains correct.

4.  **Brand Lift Read/Delete Operations:**
    - Apply similar `orgId` enforcement and filtering to all `GET` and `DELETE` endpoints for `BrandLiftStudy`. Authorization is by `BrandLiftStudy.orgId === orgId`.

---

## Phase 4: Algolia Updates

1.  **Update `CampaignAlgoliaRecord` Interface (in `src/lib/algolia.ts` or `types.ts`):**
    - Add `orgId?: string;` to the interface.
2.  **Update `transformCampaignForAlgolia` Function (in `src/lib/algolia.ts`):**
    - Ensure it maps `campaignWizard.orgId` to `algoliaRecord.orgId`.
3.  **Configure Algolia Dashboard:**
    - Add `orgId` as a `facet` and `attributeForFiltering` in your "campaigns" index settings. This allows org-scoped searches if performed directly against Algolia (API-level scoping is primary for user queries).

---

## Phase 5: Frontend/UI Considerations

1.  **Organization Context:**
    - UI must clearly show the active Clerk organization and allow switching if the user belongs to multiple.
    - API calls now requiring `orgId` must only be made when an `orgId` is available in the Clerk session.
2.  **Error Handling:**
    - Gracefully handle API errors if a user lacks an active `orgId` for an action that now requires it (e.g., prompt to select/create an org).
3.  **Display Logic:**
    - The main campaign list on `/campaigns` **must** default to showing all campaigns for the active `orgId`, implementing the shared-across-the-organization behavior. Filters like "Created by me" are secondary.

---

## Phase 6: Testing & Data Migration

1.  **Thorough Testing:**
    - Test all CRUD operations for `CampaignWizard` and `BrandLiftStudy` across different user/organization scenarios (no org, single org, multiple orgs with switching).
    - Verify data isolation: users in Org A cannot see/edit data for Org B.
    - Verify data sharing: users within the same Org can see/edit org-owned campaigns as intended by your permission model.
    - Verify Algolia search reflects `orgId` scoping if searches are made that way, and that updates/deletes propagate correctly.
2.  **Data Migration Strategy (User Action):**
    - Develop and execute a script/process to populate `orgId` for existing `CampaignWizard` and `BrandLiftStudy` records.
    - **Plan:**
      - For each `CampaignWizard` with a `userId` but null `orgId`:
        - Use `clerkClient.users.getOrganizationMembershipList({ userId: clerkUserId })` or similar to find the Clerk organizations the creator user belongs to.
        - Define a rule for assignment (e.g., assign to primary organization if defined in Clerk, first organization, or leave null if no orgs / handle as a special case).
        - Update `CampaignWizard.orgId`.
      - For each `BrandLiftStudy` with a null `orgId`:
        - Update its `orgId` based on the `orgId` of its parent `CampaignWizard` (via `CampaignWizardSubmission`).

---

This refined plan emphasizes `orgId` for ownership and sharing, while retaining `userId` for valuable attribution, ensuring a robust and clear multi-tenant architecture.

Okay, I can help structure the tasks from `orgid.md` into a Jira-like format.

First, I need to read the file to make sure I have the correct content.

Read file: orgid.md
Okay, here is the plan structured into a Jira ticket format. I've noted which items were already marked as completed in the original document.

---

**Epic:** Refactor Core Entities for Organization-Centric Scoping

**Description:**
Refactor core entities (`CampaignWizard`, `BrandLiftStudy`) to be primarily scoped, owned, and authorized by `orgId` (Clerk Organization ID). Maintain `userId` (internal User UUID) for attribution within the organization's scope. This enhances multi-tenancy, data isolation/sharing within organizations, and aligns with SaaS best practices. Clerk remains the SSOT for User/Org identities.

---

**Story:** Phase 1: Schema & Foundation

**Description:** Modify the database schema to include `orgId` for ownership and run necessary migrations.
**Status:** Completed

- **Sub-task:** Modify `CampaignWizard` Model in Prisma Schema
  - **Description:** Add nullable `orgId: String?` and `@@index([orgId])`. Keep `userId`.
  - **Status:** Completed
- **Sub-task:** Modify `BrandLiftStudy` Model in Prisma Schema
  - **Description:** Add nullable `orgId: String?` and `@@index([orgId])`. Keep `userId` association via `CampaignWizardSubmission`.
  - **Status:** Completed
- **Sub-task:** Run Database Migration & Generate Prisma Client
  - **Description:** Execute `npx prisma migrate dev` and `npx prisma generate`.
  - **Status:** Completed

---

**Story:** Phase 2: API Endpoint Modifications - Write Operations

**Description:** Update API endpoints for creating and modifying `CampaignWizard` and `BrandLiftStudy` to enforce `orgId` presence and authorization.

- **Sub-task:** Update Campaign Creation (`POST /api/campaigns`)
  - **Description:** Enforce `orgId` from `auth()`, map `clerkUserId` to `internalUserId`, store `orgId` on `CampaignWizard.orgId`, store `internalUserId` on `CampaignWizard.userId`, ensure `addOrUpdateCampaignInAlgolia` includes `orgId`.
  - **Status:** Completed
- **Sub-task:** Update Campaign Wizard Step Updates (`PATCH /api/campaigns/.../wizard/[step]`)
  - **Description:** Enforce `orgId` from `auth()`, authorize by checking `campaignWizard.orgId === orgId`, update `CampaignWizard.userId` for last editor tracking, ensure Algolia update includes `orgId`.
  - **Status:** To Do
- **Sub-task:** Update Campaign Submission (`POST /api/campaigns/.../submit`)
  - **Description:** Enforce `orgId` from `auth()`, authorize by checking `CampaignWizard.orgId === orgId`, store submitter's `internalUserId` on `CampaignWizardSubmission.userId`, ensure Algolia update includes `orgId`.
  - **Status:** To Do
- **Sub-task:** Update Brand Lift Study Creation (`POST /api/brand-lift/surveys`)
  - **Description:** Enforce `orgId` from `auth()`, authorize by checking associated `CampaignWizard.orgId === orgId`, store active `orgId` on `BrandLiftStudy.orgId`.
  - **Status:** To Do
- **Sub-task:** Update Other Brand Lift Write Operations
  - **Description:** Enforce `orgId` presence and verify `BrandLiftStudy.orgId === orgId` for all other write operations (updates, deletes, reordering).
  - **Status:** To Do

---

**Story:** Phase 3: API Endpoint Modifications - Read & Delete Operations

**Description:** Update API endpoints for reading and deleting `CampaignWizard` and `BrandLiftStudy` to scope data by the user's active `orgId`.

- **Sub-task:** Update List Campaigns (`GET /api/list-campaigns`)
  - **Description:** Enforce `orgId` from `auth()`. Refactor `getAllCampaignsForUser` to `getAllCampaignsForOrg` filtering primarily by `orgId`. Secondary filtering by `currentUserId` is optional.
  - **Status:** To Do
- **Sub-task:** Update Get Single Campaign (`GET /api/campaigns/[campaignId]`)
  - **Description:** Enforce `orgId` from `auth()`. Modify Prisma query to include `where: { id: campaignId, orgId: orgId }`. Handle legacy data transitionally.
  - **Status:** To Do
- **Sub-task:** Update Delete Campaign (`DELETE /api/campaigns/[campaignId]`)
  - **Description:** Enforce `orgId` from `auth()`. Authorize by checking `CampaignWizard.orgId === orgId` before deletion.
  - **Status:** To Do
- **Sub-task:** Update Brand Lift Read/Delete Operations
  - **Description:** Apply `orgId` enforcement and filtering (`BrandLiftStudy.orgId === orgId`) to all `GET` and `DELETE` endpoints for `BrandLiftStudy`.
  - **Status:** To Do

---

**Story:** Phase 4: Algolia Updates

**Description:** Update Algolia integration to include and utilize the `orgId`.

- **Sub-task:** Update `CampaignAlgoliaRecord` Interface
  - **Description:** Add `orgId?: string;` to the interface definition (`src/lib/algolia.ts` or `types.ts`).
  - **Status:** To Do
- **Sub-task:** Update `transformCampaignForAlgolia` Function
  - **Description:** Ensure the function maps `campaignWizard.orgId` to `algoliaRecord.orgId` (`src/lib/algolia.ts`).
  - **Status:** To Do
- **Sub-task:** Configure Algolia Index Settings
  - **Description:** Add `orgId` as a `facet` and `attributeForFiltering` in the "campaigns" index settings via the Algolia dashboard.
  - **Status:** To Do

---

**Story:** Phase 5: Frontend/UI Considerations

**Description:** Adapt the frontend UI to handle the organization context and associated changes.

- **Sub-task:** Implement Organization Context Handling in UI
  - **Description:** Ensure UI clearly shows/allows switching active Clerk organization. Only make API calls requiring `orgId` when one is present in the session.
  - **Status:** To Do
- **Sub-task:** Implement API Error Handling for Missing `orgId`
  - **Description:** Gracefully handle errors when an action requires an `orgId` but none is active (e.g., prompt user).
  - **Status:** To Do
- **Sub-task:** Update Campaign List Display Logic
  - **Description:** Modify the `/campaigns` page to default to showing all campaigns for the active `orgId`. Allow secondary filtering (e.g., "Created by me").
  - **Status:** To Do

---

**Story:** Phase 6: Testing & Data Migration

**Description:** Perform thorough testing of the changes and migrate existing data.

- **Sub-task:** Perform Thorough Testing
  - **Description:** Test all CRUD operations across various user/org scenarios. Verify data isolation, data sharing within orgs, and Algolia integration.
  - **Status:** To Do
- **Sub-task:** Develop and Execute Data Migration Script
  - **Description:** Create and run a script to populate `orgId` for existing `CampaignWizard` and `BrandLiftStudy` records based on defined rules (e.g., using `clerkClient` to find user orgs, assigning based on primary/first org, updating `BrandLiftStudy` from parent `CampaignWizard`).
  - **Status:** To Do

---
