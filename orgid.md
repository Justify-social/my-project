# Plan: Refactor CampaignWizard and BrandLiftStudy for Organization-Centric Data Scoping

This document outlines the plan to refactor core entities (`CampaignWizard`, `BrandLiftStudy`) to be primarily scoped, owned, and authorized by `orgId` (Clerk Organization ID). The `userId` (internal User UUID) will be maintained for attribution purposes (e.g., "created by," "last modified by") within the organization's scope.

**Goal:** Enhance multi-tenancy support, ensure data isolation and sharing _within_ organizations, and align with best practices for SaaS applications.

**SSOT Principle:** Clerk will remain the Single Source of Truth for User and Organization identities and memberships. Our internal database will store `clerkUserId` (linking to Clerk's user) and `orgId` (Clerk's organization ID) as needed.

---

## Phase 1: Schema & Foundation

**Status: Completed**

1.  **Modify Prisma Schema (`config/prisma/schema.prisma`)** - Completed
2.  **Database Migration & Prisma Client Regeneration (User Action - Completed)** - Completed

---

## Phase 2: API Endpoint Modifications - Write Operations

**Status: Completed**

- **Sub-task:** Update Campaign Creation - Completed
- **Sub-task:** Update Campaign Wizard Step Updates - Completed
- **Sub-task:** Update Campaign Submission - Completed
- **Sub-task:** Update Brand Lift Study Creation - Completed
- **Sub-task:** Update Other Brand Lift Write Operations - Completed

---

## Phase 3: API Endpoint Modifications - Read & Delete Operations

**Status: Completed**

- **Sub-task:** Update List Campaigns - Completed
- **Sub-task:** Get Single Campaign - Completed
- **Sub-task:** Update Delete Campaign - Completed
- **Sub-task:** Update Brand Lift Read/Delete Operations - Completed

---

## Phase 4: Algolia Updates

**Status: Completed**

1.  **Update `CampaignAlgoliaRecord` Interface** - Completed
2.  **Update `transformCampaignForAlgolia` Function** - Completed
3.  **Configure Algolia Dashboard** - Completed (User confirmed for relevant indices)

---

## Phase 5: Frontend/UI Considerations

**Status: Completed** // All sub-tasks addressed

1.  **Organization Context:**
    - **Status:** Completed
2.  **Error Handling:**
    - **Status:** Completed
3.  **Display Logic:**
    - **Status:** Completed

---

## Phase 6: Testing & Data Migration

1.  **Thorough Testing:**
    - Test all CRUD operations for `CampaignWizard` and `BrandLiftStudy` across different user/organization scenarios (no org, single org, multiple orgs with switching).
    - Verify data isolation and sharing within orgs.
    - Verify Algolia search and updates with `orgId`.
    - **Status:** To Do
2.  **Data Migration Strategy (User Action):**
    - Develop and execute script to populate `orgId` for existing records.
    - **Plan:**
      - For each `CampaignWizard` with a `userId` but null `orgId`:
        - Use `clerkClient.users.getOrganizationMembershipList({ userId: clerkUserId })` or similar to find the Clerk organizations the creator user belongs to.
        - Define a rule for assignment (e.g., assign to primary organization if defined in Clerk, first organization, or leave null if no orgs / handle as a special case).
        - Update `CampaignWizard.orgId`.
      - For each `BrandLiftStudy` with a null `orgId`:
        - Update its `orgId` based on the `orgId` of its parent `CampaignWizard` (via `CampaignWizardSubmission`).
    - **Status:** To Do

---

This refined plan emphasizes `orgId` for ownership and sharing, while retaining `userId` for valuable attribution, ensuring a robust and clear multi-tenant architecture.
