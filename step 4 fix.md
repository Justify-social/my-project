# Deep Dive: Step 4 Video Processing UI Issue

## Current Status & Understanding Recap

1.  **SSOT & Webhook Logic:** `CreativeAsset` is SSOT. `muxUploadId` field added to schema. Webhook logic refined to use `muxUploadId` for initial linking of `muxAssetId`, then `muxAssetId` for status updates (e.g., to "READY").
2.  **API Responses:** `GET /api/campaigns/[campaignId]` and `PATCH .../wizard/[step]` modified to derive `response.data.assets` from `creativeAssets` relation.
3.  **Frontend:** Optimistic updates and resilient polling mechanism implemented.
4.  **DELETE API:** Param handling corrected.
5.  **Prisma Migration & Clean Build:** User has run `prisma migrate dev` and re-installed `node_modules`, and should have cleared `.next` cache and restarted the dev server.
6.  **Backend SSOT & Webhooks:** `CreativeAsset` table is SSOT. Mux webhooks correctly update `CreativeAsset.muxProcessingStatus` to `"READY"` in the DB (confirmed by Mux dashboard and backend webhook logs showing successful updates without "record not found" errors).
7.  **API `GET /api/campaigns/[campaignId]` Response:** **Crucially, latest backend logs for this GET (when triggered by polling) show it _does_ eventually fetch and return the `CreativeAsset` with `muxProcessingStatus: "READY"` and correct Mux playback details.** This means the data freshness issue at the API read level seems to resolve with polling.
8.  **Frontend Optimistic Update & Polling:** Works as intended. Form shows `MUX_PROCESSING`, polling triggers `wizard.reloadCampaignData()`, which updates `WizardContext`.
9.  **Frontend Sync (`Step4Content.tsx` `useEffect`):** A `ReferenceError` for `requiresFullReset` was introduced in the last modification of the main asset sync `useEffect`, preventing it from working correctly. This is the immediate blocker.
10. **CRITICAL BLOCKER: TypeScript Errors & Stale UI:**
    - **Enum Import Errors in `types.ts`:** Linter reports Prisma enums (e.g., `Platform`, `Status`) are not exported from `@prisma/client`, despite `schema.prisma` defining them and `prisma generate` running. This points to a TypeScript server/cache issue or a Prisma Client generation/resolution problem.
    - **Pervasive Type Errors in `Step4Content.tsx`:** Errors like `Type '{}' is missing properties...` and `Two different types with this name exist...` for RHF `Control` still indicate fundamental type definition conflicts, likely stemming from `types.ts` and its interaction with RHF.
    - **UI Still Stuck:** The "Video is processing..." UI issue persists, strongly suggesting that even if the `GET` API eventually returns "READY", this status is not correctly propagating through the frontend type system and React Hook Form state to update the `AssetCardStep4`.

## Critical Next Steps: Testing & Verification (USER ACTIONS - CURRENT PHASE)

**Phase 1: Test Asset Deletion (USER ACTION - IMMEDIATE)**

- **Action (USER):**
  1.  Ensure the server was restarted after deleting the `.next` folder.
  2.  Attempt to delete an asset on Step 4.
  3.  Check browser console for client-side errors.
  4.  Check backend terminal logs for the `DELETE /api/creative-assets/[assetId]` route: confirm successful execution without `params` errors and successful deletion messages from DB/Mux.
- **Goal:** Confirm delete functionality is fully working.

**Phase 2: Comprehensive Test of Video Upload & Processing Status (USER ACTION - AFTER PHASE 1 SUCCESS)**

- **Action (USER):**
  1.  With a clean server state, upload a new video on Step 4.
  2.  Monitor backend terminal logs for `POST /api/webhooks/mux` flow:
      - **`video.upload.asset_created`:** Does it log finding `CreativeAsset` by `muxUploadId` and successfully updating it with `muxAssetId` and status `MUX_PROCESSING`? **Verify NO "No record was found for an update" errors.**
      - **`video.asset.ready`:** Does it log finding `CreativeAsset` by `muxAssetId` and successfully updating `muxProcessingStatus` to `READY` (plus `muxPlaybackId`, `url`)? **Verify NO "No record was found for an update" errors.**
  3.  Monitor browser Network tab for `GET /api/campaigns/[campaignId]` requests (triggered by polling):
      - After backend logs confirm `video.asset.ready` was processed successfully, inspect the JSON response of subsequent `GET` calls. Does `data.assets` show the asset with `muxProcessingStatus: "READY"`, valid `muxPlaybackId`, and `url`?
  4.  Monitor browser Console logs for frontend data flow:
      - `[Step4Content Polling Effect...]` logs.
      - `[WizardContext loadCampaignData]` logging `API Response data.assets`.
      - `[Step4Content useEffect - ASSET SYNC]` logs (asset matching, `form.setValue` calls).
      - `[AssetCardStep4]` logs (props received, especially `Mux Status`).
  5.  Observe UI: Does the asset card update to show the video player?
- **Goal:** Confirm the entire chain from Mux webhook -> DB update -> API read (via polling) -> Context update -> Form sync -> UI update is working correctly and in a timely manner.

**Phase 3: Reporting Findings (USER ACTION - AFTER PHASE 2)**

- Report on delete functionality.
- Report on Mux webhook handler behavior (absence of DB update errors is key).
- **Provide the JSON response of a `GET /api/campaigns/[campaignId]` call from a polling cycle where the asset _is confirmed READY in the DB via webhook logs_.**
- Provide relevant frontend console log excerpts showing the data flow for the video status update.
- Confirm if the UI now updates to show the processed video.

**If issues persist, the detailed logs and API responses from these tests will be crucial for pinpointing the remaining bottleneck.**

## Holistic Investigation Points (Pending API Fix Verification)

(Content from previous deep dive remains relevant if API fixes don't fully resolve the issue, but API is the primary focus now)

### II. Frontend State Management & Data Flow (`WizardContext` and `Step4Content`)

...

### III. Backend API Responses (`PATCH .../wizard/4`)

...

### IV. Deeper React Hook Form & Context Interactions

...

### V. Investigating the Logs (Developer Tools)

...

### VI. Hypothesis on Current `useEffect` in `Step4Content` with Corrected API

...

## Summary of Key Areas to Fix/Verify (Prioritized):

1.  **`GET /api/campaigns/[campaignId]/route.ts` (IN PROGRESS):**
    - **MUST** `include: { creativeAssets: true }`.
    - **MUST** map `campaignWizardData.creativeAssets` to the `assets` field in the JSON response.
    - **MUST** ensure each object in `responseData.assets` conforms to frontend `DraftAssetSchema`.
2.  **`PATCH /api/campaigns/[campaignId]/wizard/[step]/route.ts`:**
    - Response **MUST** return the full updated campaign object, including correctly mapped `assets` (from `creativeAssets`).
3.  **`CreativeAsset` Model & API Data:**
    - Ensure `internalAssetId` is reliably used for matching.
4.  **Frontend `useEffect` in `Step4Content.tsx`:**
    - Verify asset matching logic.

## Action Plan: Resolve Type System & Environment Issues First

**Phase 1: Stabilize TypeScript Environment & Prisma Client (USER ACTION - IMMEDIATE & ESSENTIAL)**

1.  **Restart TypeScript Server (USER):** In your IDE (e.g., VS Code), open the Command Palette (Cmd+Shift+P or Ctrl+Shift+P) and run "TypeScript: Restart TS server".
2.  **Explicitly Regenerate Prisma Client (USER):**
    - Run `npx prisma generate` in your terminal. Observe its output for any errors.
3.  **Full Server Restart & Cache Clear (USER):**
    - **STOP** `npm run dev` server.
    - **DELETE** the `.next` folder.
    - **RESTART** server with `npm run dev`.

- **Goal:** Ensure the TypeScript environment is using the correctly generated Prisma client types and resolve the enum import errors in `types.ts` and related deep type conflicts.

**Phase 2: Verify Type Error Resolution & Test Basic Functionality (USER ACTION - AFTER PHASE 1)**

1.  **Check `types.ts` & `Step4Content.tsx`:** Do the enum import errors and the widespread "Two different types..." / "Type '{}' is missing..." errors disappear or significantly reduce in your IDE?
2.  **Test Asset Deletion:** Confirm it works without `params` or other errors.

**Phase 3: Test Video Processing & Frontend Sync (USER ACTION - AFTER PHASE 2 SUCCESS)**

- **Action (USER):** With a stable type environment, re-test video upload. Meticulously monitor:
  1.  **Backend Webhook Logs:** Confirm `CreativeAsset` is updated to `READY` without DB errors.
  2.  **`GET /api/campaigns/[campaignId]` Network Response (during polling):** Does it return `muxProcessingStatus: "READY"`?
  3.  **Frontend Console Logs:** Trace the data flow from `WizardContext` -> `Step4Content` sync `useEffect` (especially asset matching and `form.setValue` calls) -> `AssetCardStep4` props.
  4.  **UI Behavior:** Does the card update?
- **Goal:** If types are stable, these logs will definitively show if the "READY" status, once fetched by the API, is correctly applied to the form state and rendered.

**Phase 4: Targeted Frontend Logic Fixes (AI - If UI still stuck despite correct data propagation in logs)**

- If logs show `AssetCardStep4` _receives_ the "READY" prop but the UI doesn't change, the issue is isolated to `AssetCardStep4`'s internal rendering logic.
- If logs show `form.setValue` is called with "READY" but `AssetCardStep4` _doesn't_ receive it, the issue is with RHF `useFieldArray` update propagation.

**Next Step for User:** Perform **Phase 1** (TS Server Restart, Prisma Generate, Server Restart/Cache Clear). Then report on **Phase 2** (Type error status, Delete functionality). Then proceed to **Phase 3** (Video processing test & log gathering).
