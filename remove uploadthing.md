# Plan: Deprecate UploadThing for Video Assets in Favor of Mux

**Objective**: Transition all video asset uploads and management from UploadThing to Mux to establish Mux as the Single Source of Truth (SSOT) for video content. This will streamline the video pipeline, improve reliability for obtaining `muxPlaybackId`s, and leverage Mux's video-specific features more directly.

**Background**: Currently, video uploads (e.g., in Campaign Wizard Step 4) might be using UploadThing. The `muxPlaybackId`, crucial for video display, is not consistently available, leading to issues like the creative preview not loading. This plan outlines the steps to refactor the video upload process to use Mux directly.

**Mux Credentials (Assumed to be in `.env` or similar):**

```
# Mux Video Uploader
MUX_TOKEN_ID=your_mux_token_id_here
MUX_TOKEN_SECRET=your_mux_token_secret_here
```

_(User has provided these: `MUX_TOKEN_ID=8c3bbb0d-8cb8-49f2-a3c3-cdf8c5c876ca`, `MUX_TOKEN_SECRET=0QWk8TIENCu2awhGNywswxd6YXt/SxZWrPx53iHSgCS4r32s8FIut7WaNqn0d1bJLwoxXUlbkP2`)_

## Phase 1: Backend Implementation for Mux Video Uploads

1.  **Configuration & Setup:**

    - [ ] **Action**: Ensure `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` are securely stored in server-side environment variables.
    - [ ] **Action**: Update `src/config/server-config.ts` to load and expose these Mux credentials for backend services.
    - [ ] **Action**: Install Mux Node SDK: `npm install @mux/mux-node` (or `yarn add @mux/mux-node`).

2.  \*\*Mux Service (`src/lib/muxService.ts` - Create or Enhance):

    - [ ] **Action**: Initialize Mux Node SDK (`const Mux = require('@mux/mux-node'); const { Video } = new Mux(MUX_TOKEN_ID, MUX_TOKEN_SECRET);`).
    - [ ] **Function**: `createDirectUploadUrl()`:
      - Calls Mux API (`Video.Uploads.create(...)`) to generate a direct, secure upload URL.
      - Specifies `new_asset_settings: { playback_policy: ['public'] }` and appropriate `cors_origin`.
      - Returns the Mux `upload_url` and `asset_id` (Mux's internal ID for the asset being uploaded).
    - [ ] **Function**: `getAssetPlaybackInfo(muxAssetId: string)`:
      - Calls Mux API (`Video.Assets.get(muxAssetId)`) to retrieve details for a processed asset, including `playback_ids`.
      - This might be used by webhooks or a polling mechanism if direct status from upload isn't enough.

3.  \*\*New API Endpoint for Mux Upload Initiation (e.g., `/api/mux/create-video-upload`):

    - [ ] **Action**: Create a new Next.js API route handler.
    - [ ] **Authentication**: Ensure the endpoint is authenticated (e.g., using Clerk `getAuth`).
    - [ ] **Functionality**:
      - Receives request (potentially with metadata like `campaignId`, original filename, file type).
      - Calls `muxService.createDirectUploadUrl()` to get the Mux upload URL and Mux asset ID.
      - Creates an initial `CreativeAsset` record in the database with:
        - `name` (original filename)
        - `type` (e.g., `VIDEO`)
        - `submissionId` (linking to `CampaignWizardSubmission` if applicable)
        - `muxAssetId` (the ID returned by Mux for the upload session)
        - `status` (e.g., a new field like `uploadStatus: 'PENDING_MUX_UPLOAD'` or `muxProcessingStatus: 'uploading'`)
      - Returns the Mux `upload_url` and your internal `CreativeAsset.id` (or the Mux `asset_id`) to the client.

4.  \*\*Mux Webhook Handler (e.g., `/api/webhooks/mux`):

    - [ ] **Action**: Create a new Next.js API route handler for Mux webhooks.
    - [ ] **Signature Verification**: Implement Mux webhook signature verification using `Mux.Webhooks.verifyHeader(payload, signature, MUX_WEBHOOK_SIGNING_SECRET)` (requires setting up a webhook signing secret in Mux and in your env vars).
    - [ ] **Event Handling**:
      - **`video.asset.created`**: Mux creates an asset when the upload URL is generated. Store the `asset.id` (Mux asset ID) against your internal `CreativeAsset` record if not already done during upload URL creation.
      - **`video.asset.ready`**: This is the crucial event. When received:
        - Payload contains `data.id` (Mux Asset ID) and `data.playback_ids`.
        - Find your `CreativeAsset` record using `muxAssetId`.
        - Update the `CreativeAsset` record with:
          - `muxPlaybackId` (from `data.playback_ids`, usually the public one).
          - `duration` (from `data.duration`).
          - `aspectRatio` (from `data.aspect_ratio`, might need to store in `dimensions` or a new field).
          - Set `status` or `muxProcessingStatus` to `'READY'` or `'AVAILABLE'`.
      - **`video.asset.errored`**: Update `CreativeAsset` status to `'ERROR'` and log error details.
      - **`video.upload.asset_created`**: If using direct uploads, this event links an upload ID to an asset ID. You might store the upload ID initially and then link it to the Mux asset ID here to update your internal `CreativeAsset` record.

5.  \*\*Update Prisma Schema (`CreativeAsset` model):
    - [ ] **Action**: Add `muxAssetId: String? @unique` (if not already present from previous Mux work).
    - [ ] **Action**: Consider adding `muxProcessingStatus: String?` (e.g., "PENDING_UPLOAD", "UPLOADED_TO_MUX", "MUX_PROCESSING", "READY", "ERROR").
    - [ ] **Action**: Run `npx prisma generate` after schema changes.

## Phase 2: Frontend Integration (Campaign Wizard Step 4 - `Step4Content.tsx` & `FileUploader.tsx`)

1.  \*\*Update `FileUploader.tsx` (or create a Mux-specific uploader component):

    - [ ] **Conditional Logic**: If `FileUploader` is to handle both images (via UploadThing) and videos (via Mux), add logic to differentiate based on file type.
    - **Video Upload Process**:
      - When a video file is selected:
        - Call the new backend endpoint (e.g., `/api/mux/create-video-upload`) to get the Mux direct upload URL and your internal `CreativeAsset.id` (or Mux Asset ID).
        - Use a Mux-compatible uploader (e.g., `@mux/upchunk` for robust resumable uploads, or a direct `fetch` PUT for simpler cases) to send the file to the Mux `upload_url`.
        - **Action**: Install `@mux/upchunk` if chosen: `npm install @mux/upchunk`.
        - Display upload progress using events from the uploader.
      - **On Upload Success (to Mux URL)**:
        - The file is now with Mux for processing. The Mux webhook (`video.asset.ready`) will handle the final update to your database.
        - The frontend can show an "Processing" or "Uploaded, awaiting confirmation" status.
        - Optionally, the client could call another backend endpoint `/api/assets/mux-upload-complete` with the Mux Asset ID and your internal CreativeAsset ID. This endpoint would update your `CreativeAsset` status to something like `MUX_PROCESSING` before the webhook confirms it's `READY`.
      - **On Upload Error**: Display an error message.

2.  \*\*Update `Step4Content.tsx` (Campaign Wizard):
    - [ ] **Action**: Ensure it uses the modified `FileUploader` or a new Mux-specific video uploader component.
    - [ ] **Action**: Adjust how uploaded asset data (now potentially including Mux asset IDs or processing statuses) is handled in the form state and passed to `saveProgress` or `updateWizardState`.
    - The `assets` array in `DraftCampaignData` should now accommodate Mux-related info (`muxAssetId`, initial `muxPlaybackId` if available early, processing status).

## Phase 3: Deprecating UploadThing for Videos

1.  **Code Removal/Modification:**

    - [ ] **Action**: Remove `video` configurations from `ourFileRouter` in `src/app/api/uploadthing/core.ts` and `src/lib/uploadthing.ts` if it's a duplicate/old router.
    - [ ] **Action**: If UploadThing is no longer used for _any_ file types, you can progressively remove:
      - `src/app/api/uploadthing/*` (core.ts, route.ts, test.ts, diagnostics.ts).
      - `src/lib/uploadthing.ts`.
      - `src/lib/uploadthing-config.tsx` (and its usages if `UploadDropzone` is only for UploadThing).
      - `UTSSR` component in `src/app/layout.tsx`.
      - UploadThing related environment variables (`UPLOADTHING_SECRET`, `UPLOADTHING_TOKEN`, `UPLOADTHING_APP_ID`).
      - References in `src/lib/api-verification.ts` (`verifyUploadthingApiServerSide`).
      - UploadThing specific logic in `src/app/api/asset-proxy/route.ts`.
    - [ ] **Action**: If UploadThing is kept for images/PDFs, ensure `FileUploader.tsx` correctly routes only non-video files to UploadThing endpoints.

2.  **Database Cleanup (Optional/Future):**
    - [ ] **Consideration**: If videos previously uploaded via UploadThing have URLs stored, decide on a migration strategy to move them to Mux and update `CreativeAsset` records with `muxPlaybackId`s. This might be a separate, later task.

## Phase 4: Testing & Verification

- [ ] **Unit/Integration Tests**: For new Mux service functions, API endpoints, and frontend uploader logic.
- [ ] **E2E Tests**: For the complete video upload flow in Step 4 and subsequent preview in the Survey Preview page.
- [ ] **Manual Testing**: Across different browsers and network conditions.
- [ ] **Webhook Testing**: Use Mux dashboard tools to simulate webhook events and verify your handler's behavior.

## Affected Files (Initial List - To be refined as refactoring progresses):

- **Core UploadThing (to be modified or removed for video):**
  - `src/lib/uploadthing.ts`
  - `src/app/api/uploadthing/core.ts`
  - `src/app/api/uploadthing/route.ts`
  - `src/lib/uploadthing-config.tsx`
- **UI Components (to be modified):**
  - `src/components/ui/file-uploader.tsx` (if it handles videos)
  - `src/app/(campaigns)/campaigns/wizard/step-4/Step4Content.tsx` (or the component that uses the uploader)
- **Server Config & Verification (to be modified/cleaned):**
  - `src/config/server-config.ts` (remove UploadThing env vars if fully deprecated)
  - `src/lib/api-verification.ts` (remove UploadThing verification if fully deprecated)
- **Potentially Impacted by Full Removal:**
  - `src/app/layout.tsx` (UTSSR component)
  - `src/app/api/uploadthing/test/route.ts`
  - `src/app/api/uploadthing/diagnostics/route.ts`
  - `src/app/api/asset-proxy/route.ts` (if it proxies UploadThing URLs)
  - `src/utils/file-utils.ts` (if `extractAssetUrl` is UploadThing specific)
- **New Files/Services to Create:**
  - `src/lib/muxService.ts` (or similar)
  - `/api/mux/create-video-upload` (API route)
  - `/api/webhooks/mux` (API route)
  - Possibly a new Mux-specific uploader UI component if `FileUploader.tsx` becomes too complex.

## Open Questions & Considerations:

- Will UploadThing still be used for non-video assets (images, PDFs)? This affects how much UploadThing code can be removed.
- What is the current detailed process in Step 4 for handling `onUploadComplete` from UploadThing and how does it update the `CreativeAsset` state/database? This will inform how the Mux flow needs to integrate.
- Error handling strategy for Mux uploads (client-side and server-side via webhooks).
- Strategy for migrating existing video assets from UploadThing to Mux (if necessary).

This plan provides a comprehensive starting point. We will refine it as we delve into each phase and understand the existing UploadThing integration more deeply.
