# Feature: Add Influencer to Campaign

**User Story:** As a user, I want to be able to add an influencer from their profile page to an existing campaign so that I can easily manage my campaign participants.

**Acceptance Criteria:**
*   Users can open an "Add to Campaign" dialog from an influencer's profile page (`/influencer-marketplace/[username]`).
*   The dialog displays a dropdown list of existing campaigns with `DRAFT` or `ACTIVE` status, fetched from a dedicated API endpoint.
*   If the influencer has multiple platforms (as per `MarketplaceInfluencer.platforms`), the user can select which platform this specific campaign engagement is for.
*   Users can select a campaign from the dropdown.
*   Upon confirming, the selected influencer (identified by handle and platform) is added to the chosen campaign.
*   The system provides clear feedback (e.g., toast notifications) on success or failure of the operation.
*   The backend prevents adding duplicates (same influencer handle/platform combination to the same campaign).

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
          "handle": "string", // Influencer's handle 
          "platform": "PLATFORM_ENUM_STRING" // Influencer's platform
        }
        ```
*   **Functionality:**
        1.  Receive `campaignId` from URL params and `{ handle, platform }` from request body.
        2.  **Validation:** Use Zod.
        3.  **Create/Idempotency:** Attempt to `prisma.influencer.create` using `campaignId`, `handle`, and `platform`. Catch Prisma error `P2002` (unique constraint violation) to handle existing influencers gracefully (return 200 OK).
            *   The `Influencer` table now has `@@unique([campaignId, handle, platform])`.
            *   The `platformId` field has been removed from the `Influencer` model.
        4.  Return appropriate JSON response (201, 200, 400, 404, 500).
*   **Status:** Schema Updated. Code Updated.

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
        *   Payload sends only `{ handle, platform }`.
*   **Effects (`useEffect`):** Implemented for triggering `fetchCampaignsForDropdown`.
*   **Status:** Implemented (Payload Updated)

#### Task 2.4: Highlight Selected Influencer Cards
*   **Description:** Apply a visual highlight (e.g., accent color border) to influencer cards on the marketplace page when they are selected via checkbox.
*   **Details:** Identify card component (e.g., `InfluencerSummaryCard`), pass selection state down from parent page, apply conditional styling (e.g., `border-2 border-sky-500 dark:border-sky-400`) to card container when selected.
*   **Status:** Implemented

---

### Epic 3: Data & Schema Considerations (Re-verified)

#### Task 3.1: Prisma Schema Interaction
*   **Description:** Solution correctly interacts with the updated Prisma schema.
*   **Details:**
    *   The `Influencer` model now uses `handle` and `platform` (along with `campaignId`) as the unique identifier.
    *   The redundant `platformId` field has been removed.
    *   Backend relies on the database unique constraint for idempotency.
*   **Status:** Verified and Updated.

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

# Feature: Bulk Add Influencers to Campaign (Marketplace)

**User Story:** As a user, I want to select multiple influencers from the marketplace list and add them all to a specific campaign in one action, so I can efficiently build campaign rosters.

**Prerequisites:**
*   Influencer list items on `/influencer-marketplace` have functional checkboxes for selection.
*   State management exists on `/influencer-marketplace` to track selected influencers.

**Acceptance Criteria:**
*   An "Add [N] to Campaign" button appears (e.g., next to the "Filters" button) when 1 or more influencers are selected via checkbox.
*   Clicking the button opens an `AlertDialog`.
*   The dialog title confirms the number of selected influencers (e.g., "Add 5 Influencers to Campaign").
*   The dialog displays a dropdown of `DRAFT`/`ACTIVE` campaigns (using `/api/campaigns/selectable-list`).
*   User can select a target campaign from the dropdown.
*   Upon confirming, all selected influencers (identified by handle/platform) are added to the chosen campaign.
*   Appropriate feedback (loading, success, already existed count, error) is provided using toasts.
*   The backend prevents adding duplicates (same handle/platform combination to the same campaign).
*   Influencer selection is cleared upon successful addition.

---

## Epics & Tasks:

### Epic 1: Backend Implementation (Bulk API)

#### Task 1.1: Create API Endpoint for Bulk Add Influencers
*   **File:** `src/app/api/campaigns/[id]/influencers/bulk-add/route.ts` (New File)
*   **Method:** `POST`
*   **Description:** Develop a new API endpoint to handle adding an array of influencers to a specific campaign efficiently.
*   **Details:**
    *   **URL Parameter:** `[id]` (ID of the target `CampaignWizard`).
    *   **Request Body Schema (Validated with Zod):**
    ```json
    {
          "influencers": [
            {
              "handle": "string",
              "platform": "PLATFORM_ENUM_STRING"
            }
          ]
    }
    ```
*   **Functionality:**
        1.  Receive `campaignId` from URL params.
        2.  Receive `influencers` array from the request body.
        3.  **Validation:** Use Zod to validate the incoming array and its objects (non-empty strings, valid `Platform` enum strings, etc.).
        4.  **Campaign Check:** Verify the target `CampaignWizard` (using `campaignId`) exists. Return 404 if not.
        5.  **Create & Handle Duplicates:** Iterate through input `influencers`. For each, attempt `prisma.influencer.create`. Catch Prisma error `P2002` (unique constraint) to count skipped duplicates.
            *   Removes need for pre-fetching/filtering duplicates.
            *   Uses `handle` and `platform` for creation.
        6.  **Response:** Return summary (added count, skipped count).
*   **Status:** Schema Updated. Code Updated.

---

### Epic 2: Frontend Implementation (Marketplace Page)

*   **File:** `src/app/influencer-marketplace/page.tsx` (or the component rendering the list/filters/actions - requires verification).
*   **Assumption:** This page/component already has state management for selected influencers (e.g., `selectedInfluencerIds: Set<string>`).

#### Task 2.1: State Management for Bulk Add Dialog
*   **Description:** Add necessary state variables for the bulk add dialog.
*   **Details (`useState` hooks):**
    *   `isBulkAddDialogOpen: boolean` (Controls dialog visibility).
    *   `bulkCampaignsList: CampaignType[]` (Stores campaigns for dropdown - reuse `CampaignType` from profile page).
    *   `bulkSelectedCampaignId: string | null` (Stores selected campaign ID).
    *   `isFetchingBulkCampaigns: boolean` (Loading state for campaign list fetch).
    *   `isBulkAddingToCampaign: boolean` (Loading state for bulk add API call).
*   **Status:** To be implemented.

#### Task 2.2: UI Development - Bulk Add Button & Dialog
*   **Description:** Add the "Add [N] to Campaign" button and implement the `AlertDialog`.
*   **Button:**
    *   Conditionally render the button (e.g., near "Filters") only when `selectedInfluencerIds.size > 0`.
    *   Display the number of selected influencers dynamically (e.g., "Add {selectedInfluencerIds.size} to Campaign").
    *   `onClick` sets `isBulkAddDialogOpen = true`.
*   **Dialog (`AlertDialog`):**
    *   Trigger: The new button.
    *   `AlertDialogContent`:
        *   `AlertDialogHeader`:
            *   `AlertDialogTitle`: "Add {selectedInfluencerIds.size} Influencers to Campaign"
            *   `AlertDialogDescription`: "Select a campaign to add the selected influencers to." (Note: We are simplifying by not having a platform selector here, see Task 2.3 platform derivation).
        *   **Main Content:**
            *   `Select` component (`@/components/ui/select`) for campaign selection.
                *   Populated from `bulkCampaignsList` (fetched using `/api/campaigns/selectable-list`).
                *   Handles loading/empty states.
                *   Updates `bulkSelectedCampaignId`.
        *   `AlertDialogFooter`:
            *   `AlertDialogCancel`: Closes dialog. Disabled during async ops.
            *   `AlertDialogAction` ("Add Influencers"): Triggers `handleBulkAddToCampaignSubmit`. Disabled during async ops or if no campaign is selected.
*   **Status:** To be implemented.

#### Task 2.3: Logic & Event Handlers
*   **Description:** Implement logic for fetching campaigns and submitting the bulk add request.
*   **Functions:**
    *   **`fetchBulkCampaignsForDropdown()` (async):** Similar to `fetchCampaignsForDropdown` on profile page. Calls `/api/campaigns/selectable-list`, updates `bulkCampaignsList`, sets `isFetchingBulkCampaigns`, handles errors with `toast`.
    *   **`handleBulkAddToCampaignSubmit()` (async):**
        1.  Check if `bulkSelectedCampaignId` and selected influencers exist.
        2.  Set `isBulkAddingToCampaign = true`. Show loading `toast`.
        3.  **Prepare Payload:** Map selected influencers to `{ handle, platform }` objects.
            *   Platform Derivation Strategy is still needed.
        4.  Make `POST` request to `/api/campaigns/${bulkSelectedCampaignId}/influencers/bulk-add` with the payload.
        5.  Handle success/error response from API with appropriate `toast` messages (e.g., "Added X influencers to [Campaign Name]. Y already existed.").
        6.  On success: Close dialog, clear `selectedInfluencerIds` state.
        7.  `finally`: Set `isBulkAddingToCampaign = false`.
*   **Effects (`useEffect`):**
    *   To trigger `fetchBulkCampaignsForDropdown` when `isBulkAddDialogOpen` becomes true.
*   **Status:** Implemented (Payload Updated)

#### Task 2.4: Highlight Selected Influencer Cards
*   **Description:** Apply a visual highlight (e.g., accent color border) to influencer cards on the marketplace page when they are selected via checkbox.
*   **Details:** Identify card component (e.g., `InfluencerSummaryCard`), pass selection state down from parent page, apply conditional styling (e.g., `border-2 border-sky-500 dark:border-sky-400`) to card container when selected.
*   **Status:** Implemented

---

### Epic 3: Data & Schema Considerations

#### Task 3.1: Verify Bulk Add Interaction
*   **Description:** Ensure the bulk add logic interacts correctly with the updated schema.
*   **Details:**
    *   Confirm the chosen **Platform Derivation Strategy** is correctly implemented.
    *   Verify the backend API correctly handles unique constraint errors (P2002) for duplicate counting.
*   **Status:** To be verified during/after implementation.