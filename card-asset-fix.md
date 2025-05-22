# Campaign Wizard Step 4 - Asset Card Data Saving Analysis

Date: 2024-05-24

## Issue Overview

Users can input data into the asset cards in Step 4 of the Campaign Wizard (specifically in `src/components/ui/card-asset-step-4.tsx`), but this data, particularly the `budget`, is not being saved correctly to the Prisma database. Other steps (1, 2, 3, 5) are reported to be working correctly.

## Relevant Files

- `schema.prisma`: Defines the database models, including `CampaignWizard` and `CreativeAsset`.
- `src/components/ui/card-asset-step-4.tsx`: The React component for Step 4 UI and logic.
- `src/components/ui/card-asset.tsx`: Contains related UI components, potentially including `AssetCard` or other shared elements.
- `src/components/ui/AssetPreview.tsx`: A simpler, potentially different `AssetPreview` component.

## Data Flow and Storage Analysis

### 1. Dual Asset Representation in `schema.prisma`

The system uses two primary ways to represent and store asset information relevant to the Campaign Wizard:

- **`CreativeAsset` Table:**

  - This is the main table for storing core details of creative assets.
  - Key fields: `id` (likely `internalAssetId` in frontend), `name`, `url`, `type`, `muxAssetId`, `muxPlaybackId`, `muxProcessingStatus`, `campaignWizardId` (links to `CampaignWizard`).
  - Intended for more permanent, structured asset data, especially once uploaded and processed (e.g., via Mux).

- **`CampaignWizard.assets` Field:**
  - Type: `Json[]`
  - According to schema comments: `// Store an array of objects, each containing asset details (url, name, type etc.), associatedInfluencerIds: String[], rationale: String? ('Why this content?'), budget: Float?`
  - This field acts as a temporary or draft-specific store for assets within a particular campaign wizard session. It augments core asset data with wizard-specific metadata crucial for Step 4.

**Implication:** `CreativeAsset` holds the canonical asset information, while `CampaignWizard.assets` stores a denormalized, augmented version specific to the wizard's editing state.

### 2. `card-asset-step-4.tsx` - UI and Form Management

- This component, located at `src/components/ui/card-asset-step-4.tsx`, renders a list of asset cards for editing.
- It uses `react-hook-form` (RHF) to manage the form state for each asset card.
  - `control`, `getValues`, `useWatch` are used for form interaction.
- The `AssetData` interface in this file defines the shape of asset objects handled by the form, including fields like `id`, `internalAssetId`, `muxAssetId`, `name`, `url`, `type`, `rationale`, `budget`, and `associatedInfluencerIds`.
- Users edit `name`, `rationale`, `budget`, and `associatedInfluencerIds` per asset.
- **Form Input:** In `src/components/ui/card-asset-step-4.tsx`, the budget input (likely an `<Input />` or custom currency input component) has an `onChange` handler. We need to verify how it translates empty inputs for RHF.

### 3. Saving Progress via `saveProgress`

- The `AssetCardStep4` component calls a `saveProgress` function (likely a server action or API call handler) when changes need to be persisted.
- The payload to `saveProgress` includes an `assets` array.
- This `assets` array is constructed by mapping over the current RHF form values (`currentData.assets`).
- Each object in `payload.assets` is intended to be stored in the `CampaignWizard.assets` JSON field.

### 4. Potential Core Issue: Budget Handling

- **Schema Definition:** `CampaignWizard.assets` stores `budget` as `Float?` (nullable float). This means the database expects a number or `null`.
- **Form Input:** In `src/components/ui/card-asset-step-4.tsx`, the budget input (`InputPrice`) has an `onChange` handler:
  ```typescript
  onChange={(e) => {
      const value = e.target.value;
      field.onChange(value === '' ? undefined : parseFloat(value));
  }}
  ```
  This correctly sets the RHF field value to `undefined` if the input is empty, or a `number` if it has a value. So, `asset.budget` from `getValues()` will be a `number` or `undefined`.
- **Data Preparation for Saving:**
  The problematic line in the mapping logic that prepares `assetsWithFieldIds` (which then becomes part of the payload for `saveProgress`) was:
  ```typescript
  budget: typeof asset.budget === 'number' ? asset.budget : 0, // THIS IS THE BUG
  ```
  This logic converts an `undefined` budget (which should signify "not set" or "empty") into the number `0`.
  - If `0` is a distinct and valid budget amount (e.g., "$0 budget"), this conversion leads to data misrepresentation.
  - For a `Float?` database field, the correct JSON representation for "not set" or "no value provided" is `null`.

**Consequence:** When a user clears the budget field, intending to leave it empty, the system was saving it as `0` instead of `null` in the `CampaignWizard.assets` JSON array.

### 5. Other Considerations

- **Asset Identification:** For the `CampaignWizard.assets` JSON data to be useful, each object within it must reliably identify the corresponding asset (if it's an existing `CreativeAsset`). This is likely handled by including `internalAssetId` (mapping to `CreativeAsset.id`) or `muxAssetId`. The spread `...asset` in the mapping logic should preserve these identifiers if they are part of the form's asset state.
- **Backend API Responsibility:** The backend API route that processes the `saveProgress` call is critical. It must:
  - Correctly deserialize the `payload.assets` array from the request.
  - Properly update the `CampaignWizard.assets` JSON field in the database, ensuring that `null` values for optional fields like `budget` are stored as `null` in the JSON, not as a string `"null"` or omitted.
  - Perform robust validation and type checking.
- **`AssetPreview` Component:** The `AssetPreview` component used in `src/components/ui/card-asset-step-4.tsx` is likely one of the provided preview components.

## Recommended Fix for Budget Issue

The `budget` field in the object prepared for saving within `src/components/ui/card-asset-step-4.tsx` should be mapped as follows:

```typescript
budget: typeof asset.budget === 'number' ? asset.budget : null,
```

This will ensure that an empty/undefined budget from the form is stored as `null` in the JSONB field, aligning with the `Float?` type.

## Next Steps

1.  **Verify and Apply the fix** to the budget mapping in `src/components/ui/card-asset-step-4.tsx`.
2.  **Verify the backend:** Ensure the API endpoint handling the save operation correctly persists `null` values in the JSON array for the `budget` field (this was previously confirmed to be likely okay if the frontend sends `null`).
3.  **Test thoroughly:**
    - Saving an asset with a budget.
    - Saving an asset with an empty budget (should be `null`).
    - Updating an asset from a set budget to an empty budget.
    - Updating an asset from an empty budget to a set budget.
    - Saving an asset with a budget of `0` (if this is a valid distinct value).

## Investigation Log (New Entry - Path Correction)

**Date: 2024-05-24 (After Path Correction)**

- The path for the Step 4 asset card UI component was corrected to `src/components/ui/card-asset-step-4.tsx`.
- Previous analysis regarding linter errors or file access issues on `src/app/(campaigns)/campaigns/wizard/components/steps/card-asset-step-4.tsx` can be disregarded as it was the wrong file.
- The immediate next step is to read and analyze the correct file: `src/components/ui/card-asset-step-4.tsx`.

---

(Previous analysis regarding the backend API at `src/app/api/campaigns/[campaignId]/wizard/[step]/route.ts` remains relevant and correct: it should handle `null` budgets properly if the frontend sends them.)

---

## Issue: Mux Video Autoplay Reloading/Looping (Step 4)

**Date:** 2024-05-24

**Observed Behavior:**
Even after a Mux video asset's `muxProcessingStatus` is 'READY' and the `loop={true}` prop was removed from the `MuxPlayer` component in `src/components/ui/card-asset.tsx`, the video player or the Step 4 page section containing the video appears to reload or the video restarts. This is evidenced by terminal logs showing repeated `GET /api/campaigns/[campaignId]` calls, which are indicative of the polling mechanism in `src/components/features/campaigns/Step4Content.tsx` calling `wizard.reloadCampaignData()`.

**Relevant Files & Components:**

- **`src/components/features/campaigns/Step4Content.tsx`:** Orchestrator for Step 4. Contains the asset polling logic that calls `wizard.reloadCampaignData()`. Renders `AssetCardStep4` for each asset.
- **`src/components/ui/card-asset-step-4.tsx` (`AssetCardStep4`):** Component for editing a single asset in Step 4. Renders `AssetPreview` from `card-asset.tsx`.
- **`src/components/ui/card-asset.tsx` (specifically its internal `AssetPreview` sub-component):** Renders the `<MuxPlayer />`.
- **`useWizard()` Context:** Provides `wizardState` and `reloadCampaignData()`.

**Hypothesis for Reloading:**

The primary hypothesis is that the polling mechanism in `Step4Content.tsx`, designed to update the status of processing Mux assets, continues to call `wizard.reloadCampaignData()` even when it might not be strictly necessary for an already 'READY' asset, or the reload itself triggers a cascade of re-renders that causes the `MuxPlayer` to re-initialize.

1.  **Polling Trigger:** The polling logic (Effect 2 in `Step4Content.tsx`) calls `wizard.reloadCampaignData()` if its list of assets to poll (`processingAssetIdsInPoll`) is not empty.
2.  **Global Reload Impact:** `wizard.reloadCampaignData()` updates the entire `wizardState`. This change is picked up by the main sync `useEffect` in `Step4Content.tsx`.
3.  **Re-render Cascade:** The sync `useEffect` updates the React Hook Form state for assets. This can cause the `assetFields` array (from `useFieldArray`) to yield new references for its items.
4.  **`AssetCardStep4` Re-render:** Even if wrapped with `React.memo`, if the `asset` prop passed to `AssetCardStep4` is a new object reference (due to the RHF update), `AssetCardStep4` re-renders.
5.  **`MuxPlayer` Re-initialization:** The re-render of `AssetCardStep4` leads to its child `AssetPreview` (containing `MuxPlayer`) also re-rendering. This re-render, potentially with new prop references (even if values are the same) or simply due to being part of a re-rendered tree, might cause the `MuxPlayer` instance to restart its autoplay behavior.

**SSOT Considerations for Video Playback State:**

- **Mux Processing Status:** The ultimate SSOT for whether a Mux asset is processed and ready for playback is Mux itself, reflected in the `muxProcessingStatus` (e.g., 'READY') and the availability of `muxPlaybackId`. This data is fetched from the backend (`CreativeAsset` table, updated by Mux webhooks) and arrives in `wizardState.assets`.
- **Frontend Display State:** The React components (`AssetPreview` in `card-asset.tsx`) use these props (`muxPlaybackId`, `muxProcessingStatus`) to decide whether and how to render the `MuxPlayer`.
- **Polling State (`Step4Content.tsx`):** Manages a list of asset IDs (`processingAssetIdsInPoll`) that it _believes_ still need their status checked. The accuracy and timeliness of this list are crucial.

**Actions Taken So Far (for video reload issue):**

1.  Removed `loop={true}` from `MuxPlayer` in `src/components/ui/card-asset.tsx` (to stop replay after finishing).
2.  Wrapped `AssetCardStep4` in `React.memo` in `src/components/ui/card-asset-step-4.tsx` (to potentially reduce re-renders if its props are stable).
3.  Added a stable `key={field.fieldId}` to the `<AssetCardStep4 />` instance in `src/components/features/campaigns/Step4Content.tsx` (to help React's list reconciliation).

**Next Steps for Investigation/Fixes (Video Reloading):**

1.  **Verify Impact of `key` Prop:** Test if the added `key` to `AssetCardStep4` has mitigated the reloading.
2.  **Refine Polling Trigger in `Step4Content.tsx`:** Make the `executePoll` function (within polling Effect 2) more defensive. Before calling `wizard.reloadCampaignData()`, it should re-verify against the _current form state_ (`form.getValues('assets')`) if any asset in its `processingAssetIdsInPoll` list is _still_ in a non-terminal processing state. If all are terminal, it should skip the reload, relying on Effect 3 to clear the poll list.
3.  **Ensure Polling List (`processingAssetIdsInPoll`) is Accurately Cleaned:** Double-check Effect 3 in `Step4Content.tsx` to ensure it promptly and correctly removes assets that have reached a terminal state (`READY`, `ERROR`, etc.) or timed out from `processingAssetIdsInPoll`.
4.  **Prop Stability for `AssetCardStep4`:** If `React.memo` (with the new `key`) isn't enough, investigate if the `asset` prop passed from `Step4Content.tsx` to `AssetCardStep4` is changing reference unnecessarily for 'READY' videos. This might require a custom comparison function for `React.memo` on `AssetCardStep4` or further refinement of the main sync `useEffect` in `Step4Content.tsx` to avoid unnecessary RHF updates for stable assets.

---

## Issue: Incorrect Redirect to Step 5 After Asset Deletion in Step 4

**Date:** 2024-05-24

**Observed Behavior:**
When an asset is deleted from the list in Step 4 of the Campaign Wizard, the user is incorrectly redirected to Step 5. The desired behavior is for the user to remain on Step 4, allowing them to continue managing assets (e.g., re-adding videos).

**Relevant Files & Components:**

- **`src/components/features/campaigns/Step4Content.tsx`:** This component contains the `handleDeleteAsset` function, which is responsible for both calling the delete API and updating the local form state (removing the asset from the `useFieldArray`). The navigation logic (or lack thereof, leading to a default progression) after deletion likely resides here or in how the wizard context/navigation is structured post-action.
- **`useWizard()` Context & `ProgressBarWizard`:** The wizard's navigation (`onNext`, `onBack`, `handleStepClick`) and how it determines the current/next step might be influenced by the state changes resulting from asset deletion.

**Hypothesis for Incorrect Redirection:**

1.  **State Update Triggering Navigation:** The removal of an asset from the `useFieldArray` in `Step4Content.tsx` might be causing a state update that the `ProgressBarWizard` or general wizard navigation logic interprets as a reason to move to the next step, especially if conditions for "completing" Step 4 are inadvertently met or re-evaluated.
2.  **`saveProgress` Call After Deletion:** If `saveProgress` is called implicitly or explicitly after an asset deletion, and if the state of `step4Complete` is re-evaluated and set to true (perhaps because the "at least one asset" validation now passes if other assets remain, or fails in a way that doesn't block progression), it might trigger a move to Step 5.
3.  **Default Fallback Navigation:** There might not be explicit navigation logic to "stay on Step 4" after deletion, and the wizard might default to progressing if no other action is specified and the step is considered "submittable."

**SSOT Considerations for Navigation & Step Completion:**

- **`CampaignWizard.currentStep` / `CampaignWizard.stepXComplete`:** These fields in the backend are the SSOT for the wizard's overall progress.
- **Frontend Form Validity (`form.formState.isValid` in `Step4Content.tsx`):** This is the SSOT for whether the _current Step 4 form_ meets its own validation criteria.
- **User Intent:** The user's intent after deleting an asset is likely to remain on Step 4 to continue editing or re-add assets, not to immediately proceed.

**Update (Post-Investigation & Fix Attempt):**

- **Action Taken (Budget Mapping in `Step4Content.tsx`):** Corrected the `budget` mapping in `onSubmitAndNavigate` and `handleSave` functions to use `null` for empty/undefined budgets, ensuring consistency with `AssetCardStep4`'s local save and `DraftAssetSchema`.
- **Action Taken (Redirect After Delete in `Step4Content.tsx`):** Modified `handleDeleteAsset` to explicitly call `wizard.saveProgress()` after an asset is removed (both for local-only and server-backed deletions). This payload includes the updated asset list and a re-evaluated `step4Complete` status (e.g., `false` if no assets remain). An attempt to force staying on Step 4 using `router.push()` was also added after this save.
- **Linter Fixes for `router.replace` (then `router.push`):** Corrected the syntax for `router.push(targetUrl)` calls within `handleDeleteAsset`.
- **Outcome (Redirect):** User now correctly stays on Step 4 after asset deletion.
- **New Observed Issue (Mux 404):** After deletion, a 404 error for the deleted Mux asset's playback ID appears in the console, although the UI correctly removes the asset card.
- **New Observed Issue (Media Chrome):** A console warning `Media Chrome: No style sheet found on style tag of #shadow-root (open)` appears.

**Next Steps for Investigation/Fixes (Console Errors on Step 4):**

1.  **Mux 404 Error Post-Deletion:**

    - **Cause:** Likely a race condition where `MuxPlayer` initiates a request for a playback ID just before its component is unmounted due to the asset being deleted from the state and Mux servers.
    - **Robustness:** If the UI is correct (deleted asset card disappears), this console error might be a transient, low-priority issue that is hard to completely eliminate from the client-side without changes to `MuxPlayer` internals.
    - **Further Checks:** Confirm no broken player UI remains. Consider if the perceived impact warrants deeper investigation into advanced player instance lifecycle management (if available via `MuxPlayer` API).

2.  **Media Chrome Stylesheet Warning:**
    - **Cause:** `media-chrome` (used by `MuxPlayer`) cannot find its expected stylesheet within its Shadow DOM.
    - **Fix:**
      - Review `@mux/mux-player-react` documentation for specific CSS import or Next.js/Turbopack setup instructions.
      - Attempt importing Mux Player theme CSS (e.g., `@import '@mux/mux-player/themes/default.css';`) in a global stylesheet if not already present.
      - Search for known issues/solutions related to `media-chrome` or `MuxPlayer` CSS with Next.js/Turbopack.

---

## Issue: Step 4 Asset Details (Budget, Rationale) Not Persisting/Displaying in Step 5

**Date:** 2024-05-24

**Observed Behavior:**
Data input into fields like 'Budget', 'Why this content?' (rationale), and potentially 'Associated Influencer(s)' in `AssetCardStep4` on Step 4 of the wizard does not appear correctly when reviewing the assets in Step 5 (using `AssetCard`). The diagnostic info in Step 5 shows these fields as "Not provided to card."

**Relevant Files & Components:**

- **`src/components/ui/card-asset-step-4.tsx` (`AssetCardStep4`):** Input component for asset details in Step 4.
- **`src/components/features/campaigns/Step4Content.tsx`:** Orchestrates Step 4, calls `wizard.saveProgress` with form data.
- **`src/components/features/campaigns/types.ts` (`Step4BaseSchema`, `DraftAssetSchema`):** Zod schemas for validation.
- **`src/app/api/campaigns/[campaignId]/wizard/[step]/route.ts` (PATCH handler for step 4):** Backend API that saves Step 4 data. Saves `rationale` to `CreativeAsset.description` and the full asset object (with budget, rationale, associatedInfluencerIds) to `CampaignWizard.assets` JSON field.
- **`src/components/features/campaigns/WizardContext.tsx` (`loadCampaignData`, `saveProgress` response handling):** Merges data from `CampaignWizard.assets` (JSON) and `CreativeAsset` table (relation) to form `wizardState.assets`.
- **Component rendering Step 5 (e.g., `Step5Content.tsx`):** Fetches `wizardState` and passes asset data to `AssetCard`.
- **`src/components/ui/card-asset.tsx` (`AssetCard`):** Display component for assets, used in Step 5.

**Hypothesis for Missing Data:**

1.  **Incomplete Backend Schema Validation (`Step4BaseSchema`):** The `Step4BaseSchema` used by the backend API for validating the Step 4 PATCH request payload does not explicitly include the `assets` field. While Zod might passthrough unpicked fields by default, this is implicit. If `assets` (containing budget, rationale, etc.) is stripped during validation, it won't be saved correctly to `CampaignWizard.assets` JSON field.
2.  **Incorrect Data Merging in `WizardContext`:** The logic in `loadCampaignData` (or `saveProgress` response handling) that merges data from `CampaignWizard.assets` (JSON) and the `creativeAssets` relation might be losing or incorrectly prioritizing fields, leading to `budget` or `rationale` being undefined when passed to Step 5.
3.  **Prop Passing to `AssetCard` in Step 5:** The component rendering Step 5 might not be correctly extracting and passing all necessary fields (like `description` for rationale, `budget`, and resolved `influencerHandle`) to the `AssetCard` props.

**SSOT for Step 4 Asset Metadata:**

- The `CampaignWizard.assets` JSON field is intended to be the SSOT for the wizard-specific metadata (budget, rationale, associatedInfluencerIds) for each asset in the context of that wizard draft.
- `CreativeAsset.description` is used as a secondary store for `rationale`.

**Initial Recommended Fix:**

1.  Modify `Step4BaseSchema` in `src/components/features/campaigns/types.ts` to explicitly include `assets: true`. This ensures the backend Zod validation is aware of and processes the full assets array from the client.

**Next Steps for Investigation/Fixes:**

1.  Apply the `Step4BaseSchema` fix.
2.  Retest the flow: Enter data in Step 4, save/next, check API payload and response for `assets` content (especially budget, rationale), then check Step 5 display and diagnostic info.
3.  If data is still missing in Step 5:
    - Trace data flow from `wizardState.assets` in `WizardContext` to the props of `AssetCard` in Step 5.
    - Verify the asset merging logic in `WizardContext.tsx` correctly prioritizes and includes `budget`, `rationale`, and `associatedInfluencerIds` from the `CampaignWizard.assets` JSON part of the data.

---
