# Feature: Add Influencer to Campaign

**User Story:** As a user, I want to be able to add an influencer from their profile page to an existing campaign so that I can easily manage my campaign participants.

**Acceptance Criteria:**
*   Users can open an "Add to Campaign" dialog from an influencer's profile page (`/influencer-marketplace/[username]`).
*   The dialog displays a dropdown list of existing campaigns with `DRAFT` or `ACTIVE` status, fetched from a dedicated API endpoint.
*   If the influencer has multiple platforms (as per `MarketplaceInfluencer.platforms`), the user can select which platform this specific campaign engagement is for.
*   Users can select a campaign from the dropdown.
*   Upon confirming, the selected influencer (and their chosen platform for this engagement) is added to the chosen campaign in the database.
*   The system provides clear feedback (e.g., toast notifications) on success or failure of the operation.
*   The system prevents adding the exact same influencer (for the same platform) to the same campaign multiple times.

---

## Epics & Tasks:

### Epic 1: Backend Implementation (API Endpoints)

#### Task 1.1: Create Dedicated API Endpoint for Selectable Campaigns
*   **File:** New file, e.g., `src/app/api/campaigns/selectable-list/route.ts` (or similar distinct path).
*   **Method:** `GET`
*   **Description:** Create a new, dedicated API endpoint to fetch campaigns suitable for UI dropdowns, specifically those with `DRAFT` or `ACTIVE` status. This is preferred over modifying the general `GET /api/campaigns` endpoint to maintain separation of concerns and simplicity.
*   **Details:**
    *   The endpoint must fetch campaigns from the `CampaignWizard` table.
    *   **Filter Criteria:** Strictly filter by `status: DRAFT` or `ACTIVE`.
    *   **Response Data:** Return a list of campaigns, including at least `id`, `name`, and `status` for each.
    *   **Ordering:** Consider ordering by `name` or `updatedAt` for user convenience.
*   **Status:** Code Generated (`src/app/api/campaigns/selectable-list/route.ts`)

#### Task 1.2: Create API Endpoint to Add Influencer to Campaign
*   **File:** `src/app/api/campaigns/[id]/influencers/route.ts` (New File)
*   **Method:** `POST`
*   **Description:** Develop a new API endpoint to handle adding an influencer to a specific campaign, ensuring data integrity and good UX.
*   **Details:**
    *   **URL Parameter:** `[id]` (ID of the target `CampaignWizard`).
    *   **Request Body Schema (Validated with Zod):**
        ```json
        {
          "handle": "string", // Influencer's handle (from MarketplaceInfluencer.handle)
          "platform": "PLATFORM_ENUM_STRING", // Influencer's specific platform (e.g., "INSTAGRAM", "TIKTOK").
                                          // Frontend must ensure this is a valid Prisma Platform enum string.
          "marketplaceInfluencerId": "string" // The MarketplaceInfluencer.id (or .profileId for uniqueness)
        }
        ```
    *   **Functionality:**
        1.  Receive `campaignId` (from URL `[id]`) and influencer details (`handle`, `platform`, `marketplaceInfluencerId`) from the request body.
        2.  **Validation:** Use Zod for robust request body validation (e.g., non-empty strings, valid `Platform` enum string for `platform`).
        3.  **Idempotency Check (Crucial for good UX):**
            *   Query the `Influencer` table for an existing record with the same `campaignId` and `platformId` (where `platformId` stores the provided `marketplaceInfluencerId`).
            *   If such a record exists, return an appropriate success response indicating the influencer is already part of the campaign (e.g., a 200 OK with a specific message, or a 409 Conflict if preferred, though 200 might be friendlier if it's not strictly an error state for the user).
        4.  Create a new record in the `Influencer` table if no duplicate is found:
            *   `id`: New UUID.
            *   `handle`: From request.
            *   `platform`: From request (this should be the direct Prisma `Platform` enum string if frontend sends correctly; backend should validate it's a member of the enum).
            *   `platformId`: `marketplaceInfluencerId` from request. (This links back to the `MarketplaceInfluencer.id` for traceability, aligning with `wizard/[step]/route.ts` pattern and schema).
            *   `campaignId`: `campaignId` from URL.
        5.  Return JSON response (e.g., 201 Created for new additions, 200 OK if already added and handled gracefully, 400 Bad Request, 404 Not Found for campaign, 500 Server Error) with appropriate status codes and messages.
*   **Status:** Code Generated (`src/app/api/campaigns/[id]/influencers/route.ts`)

---

### Epic 2: Frontend Implementation (Influencer Profile Page)

*   **File:** `src/app/influencer-marketplace/[username]/page.tsx` (Modify Existing)

#### Task 2.1: State Management for "Add to Campaign" Dialog
*   **Description:** Implement React state hooks, following existing patterns on the page.
*   **Details (`useState` hooks):**
    *   `isAddCampaignDialogOpen: boolean`
    *   `campaignsList: Array<{ id: string; name: string; status: string }>`
    *   `selectedCampaignId: string | null`
    *   `selectedPlatformForCampaign: PlatformEnum | null` (from `@/types/enums`; used if `MarketplaceInfluencer.platforms.length > 1`)
    *   `isFetchingCampaigns: boolean`
    *   `isAddingToCampaign: boolean`
*   **Status:** Implemented

#### Task 2.2: UI Development - "Add to Campaign" Dialog
*   **Description:** Build and integrate the `AlertDialog`, mirroring existing dialogs (e.g., "Request Risk Report") and using `@/components/ui/` components.
*   **Components & Structure (`@/components/ui/alert-dialog`, `@/components/ui/select`):
    *   **Trigger Button:** Use/modify existing "Add to Campaign" button. `onClick` sets `isAddCampaignDialogOpen = true`, triggers `fetchCampaignsForDropdown`.
    *   **Dialog Content (`AlertDialogContent`):**
        *   `AlertDialogHeader`:
            *   `AlertDialogTitle`: "Add [Influencer's Name] to Campaign" (dynamic).
            *   `AlertDialogDescription`: "Select a campaign and platform (if applicable) to add this influencer."
        *   **Main Content Area:**
            *   **Campaign Selection:** Functional `Select` component for campaigns (fetched via Task 1.1).
            *   **Platform Selection (Conditional):** Functional `Select` component for platform if `influencer.platforms && influencer.platforms.length > 1`.
        *   `AlertDialogFooter`:
            *   `AlertDialogCancel`: Disabled during async operations.
            *   `AlertDialogAction` ("Add to Campaign"): Disabled during async operations or if required selections are not made.
*   **Status:** Implemented

#### Task 2.3: Logic & Event Handlers
*   **Description:** Implement client-side logic using `fetch` API and `sonner` for toasts, following page patterns.
*   **Functions:**
    *   **`fetchCampaignsForDropdown()` (async):** Implemented.
    *   **Campaign & Platform Selection Handlers:** Implemented via `onValueChange` in `Select` components.
    *   **`handleAddToCampaignSubmit()` (async):** Implemented.
*   **Effects (`useEffect`):** Implemented for triggering `fetchCampaignsForDropdown`.
*   **Status:** Implemented

---

### Epic 3: Data & Schema Considerations (Re-verified)

#### Task 3.1: Prisma Schema Interaction
*   **Description:** Solution correctly interacts with the existing Prisma schema.
*   **Details:**
    *   New `Influencer` record links `MarketplaceInfluencer` (via `platformId` storing `MarketplaceInfluencer.id`) to `CampaignWizard`.
    *   Stores a single, user-selected (if necessary) `platform` for the campaign engagement.
*   **Status:** Verified during planning and implementation.

---

## Workflow Visualization (Conceptual - Updated):

1.  **User Action:** Clicks "Add to Campaign" button.
2.  **Frontend:** Opens dialog, calls `fetchCampaignsForDropdown()` (Task 1.1 API).
3.  **User Action:** Selects campaign (and platform if `MarketplaceInfluencer` has multiple).
4.  **User Action:** Clicks "Confirm".
5.  **Frontend:** Calls `handleAddToCampaignSubmit()` which POSTs to Task 1.2 API.
6.  **Backend (Task 1.2 API):** Validates, checks idempotency, creates `Influencer` record (if new), responds.
7.  **Frontend:** Shows toast (success, already added, or error), closes dialog.

---

## Out of Scope for this Iteration (Future Considerations):

*   Bulk add from marketplace page.
*   Create new campaign directly from the pop-up.
*   Advanced permissions/role checks.