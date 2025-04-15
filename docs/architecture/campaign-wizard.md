# Campaign Wizard Architecture

## 1. Overview

The Campaign Wizard provides a multi-step interface for users to create and configure marketing campaigns. It guides the user through collecting necessary details, objectives, audience targeting, asset requirements, and finally, review before submission. The wizard is designed to save draft progress incrementally and culminates in the creation of a `CampaignWizardSubmission` record upon final submission (handled by a separate API).

## 2. Core Components & Structure

The wizard utilizes a combination of Next.js App Router features, React Context, and custom UI components.

**File Structure Highlights:**
src/
├── app/
│ └── (campaigns)/
│ └── campaigns/
│ ├── layout.tsx # Layout for the overall /campaigns section
│ └── wizard/
│ ├── layout.tsx # Wizard-specific layout (Client Component)
│ └── step-[N]/
│ ├── page.tsx # Route segment for each step
│ └── ClientPage.tsx # Client component wrapper for step content
├── components/
│ ├── features/
│ │ └── campaigns/
│ │ ├── WizardContext.tsx # Context provider and hook
│ │ ├── StepContentLoader.tsx # Dynamically loads step components
│ │ ├── Step1Content.tsx # UI and logic for Step 1
│ │ ├── Step2Content.tsx # UI and logic for Step 2
│ │ ├── Step3Content.tsx # ...
│ │ ├── Step4Content.tsx # ...
│ │ ├── Step5Content.tsx # ...
│ │ └── types.ts # Zod schemas and TypeScript types
│ └── ui/
│ ├── progress-bar-wizard.tsx # Shared footer navigation/save button
│ └── autosave-indicator.tsx # Top-center save status indicator
└── app/
└── api/
└── campaigns/
├── [id]/
│ ├── route.ts # GET (fetch), PUT (update submitted), DELETE
│ ├── submit/route.ts # POST (submit final campaign)
│ └── wizard/
│ └── [step]/route.ts # PATCH (save draft step progress - SSOT)
└── route.ts # POST (create initial draft - TBC)

**Component Breakdown:**

*   **`wizard/layout.tsx` (Client Component):**
    *   **SSOT for Context:** Wraps all wizard steps (`{children}`) with `<WizardProvider>`. Ensures all steps share the same context instance.
    *   **SSOT for Status Indicator:** Renders the `<AutosaveIndicator />` in a fixed top-center position. It uses the `useWizard` hook to get `isLoading` and `lastSaved` status *only when the current route is a step page*. It manages the temporary display logic (show for 5s on successful save).
    *   Marked `'use client'` because it uses hooks (`usePathname`, `useWizard`).

*   **`wizard/step-[N]/page.tsx` (Server Component):**
    *   Standard Next.js page file for the route segment (e.g., `/campaigns/wizard/step-1`).
    *   Typically renders the corresponding `ClientPage.tsx` within a `<Suspense>` boundary.
    *   May contain route segment config like `export const dynamic = 'force-dynamic';`.

*   **`wizard/step-[N]/ClientPage.tsx` (Client Component):**
    *   Wraps the dynamic loading of the step content.
    *   Renders `<StepContentLoader step={N} />` within `<Suspense>`.

*   **`StepContentLoader.tsx` (Client Component):**
    *   Uses `React.lazy()` to dynamically import the specific `StepXContent.tsx` component based on the `step` prop.
    *   Renders the loaded component within `<Suspense>`, showing `<WizardSkeleton />` while loading.

*   **`StepXContent.tsx` (Client Components):**
    *   Contain the actual UI (forms, inputs, displays) for each specific wizard step.
    *   Utilize `react-hook-form` (`useForm`) for form state management and validation, using step-specific Zod schemas from `types.ts`.
    *   Implement `useEffect` to reset the form with data loaded into `WizardContext`.
    *   Pass the `form.getValues` function down to `ProgressBarWizard` via the `getCurrentFormData` prop.
    *   Implement navigation logic (`onSubmitAndNavigate`, `handleBack`) which typically involves updating context state via `updateWizardState`, calling `wizard.saveProgress(payload)`, and then using `next/navigation`'s `router`.
    *   **Autosave Logic:** Contains *commented-out* code for potential future autosave functionality. This code is currently **inactive**.

*   **`ProgressBarWizard.tsx` (Client Component):**
    *   Provides the fixed footer UI with step indicators and navigation buttons ("Back", "Save", "Next"/"Submit").
    *   Receives step configuration, current step, callbacks (`onBack`, `onNext`), loading/disabled states, and `getCurrentFormData` as props.
    *   The "Save" button handler (`handleManualSave`) calls `getCurrentFormData` to get data from the active step, constructs a payload including `currentStep`, calls `wizard.updateWizardState(payload)` to ensure context has latest data *before* saving, and then calls `await wizard.saveProgress()` to trigger the API save. Manages its own `isManualSaving` state and associated toasts.

*   **`WizardContext.tsx` (Client Component Logic):**
    *   Manages the shared state (`wizardState`, `isLoading`, `lastSaved`, `autosaveEnabled`, etc.) using `useState`.
    *   Provides the `useWizard` hook for consuming context.
    *   `loadCampaignData`: Fetches initial campaign data using `GET /api/campaigns/[id]` on mount if an ID is present.
    *   `updateWizardState`: Function called by step components to update the shared `wizardState` (typically before saving or navigating).
    *   `saveProgress`: **Crucially, accepts the data payload as an argument**. It sends this payload directly to the `PATCH /api/campaigns/[id]/wizard/[step]` endpoint. It handles setting `isLoading` and `lastSaved` state based on the API response. It updates the internal `wizardState` with the data returned from the successful API call.
    *   **Autosave Logic:** Contains *commented-out* code (`debouncedSaveProgress`, autosave `useEffect`) for potential future use. This is **inactive**.

*   **`AutosaveIndicator.tsx` (Client Component):**
    *   Displays the save status ("Saving...", "Saved [time]", "Error"). Receives `status` and `lastSaved` props.
    *   The actual temporary display logic (show for 5s) is handled in the `wizard/layout.tsx`.

## 3. Data Flow & State Management

*   **Loading:**
    1.  `WizardProvider` mounts (via `wizard/layout.tsx`).
    2.  `useEffect` detects `campaignId` from URL params.
    3.  `loadCampaignData` fetches data using `GET /api/campaigns/[id]`.
    4.  Sets `isLoading = true`.
    5.  On success, parses response with `DraftCampaignDataSchema`, updates `wizardState`.
    6.  Sets `isLoading = false`, `hasLoaded = true`.
    7.  Active `StepXContent` component's `useEffect` detects `wizardState` update and calls `form.reset()` with the context data.
*   **Manual Save:**
    1.  User clicks "Save" button in `ProgressBarWizard`.
    2.  `handleManualSave` is called.
    3.  `props.getCurrentFormData()` (which is `form.getValues` from the active step) is called.
    4.  Payload (including `currentStep` and form data) is constructed.
    5.  `wizard.updateWizardState(payload)` is called (ensures context reflects current form *before* save attempt, though `saveProgress` uses its argument now).
    6.  `wizard.saveProgress(payload)` is called, passing the fresh data.
    7.  `saveProgress` sends data to `PATCH /api/.../wizard/[step]`. Sets `isSaving = true`.
    8.  API route validates step-specific data, updates DB, returns updated data.
    9.  `saveProgress` receives success response, updates `lastSaved`, updates `wizardState` with response data. Sets `isSaving = false`.
    10. `wizard/layout.tsx` detects `lastSaved` change, shows indicator for 5s.
*   **Navigation (Next/Back):**
    1.  User clicks "Next" or "Back" in `ProgressBarWizard`.
    2.  `onNext` or `onBack` prop (passed from active `StepXContent`) is called.
    3.  The handler function (e.g., `onSubmitAndNavigate`):
        *   Triggers form validation (`form.trigger()`).
        *   Gets form values (`form.getValues()`).
        *   Constructs payload for the *current* step, also setting the *next* step number and completion flags (e.g., `step1Complete: true, currentStep: 2`).
        *   Calls `wizard.updateWizardState(payload)`.
        *   Calls `await wizard.saveProgress(payload)` to save the current step's data.
        *   If save succeeds, uses `router.push()` to navigate to the next/previous step URL.

## 4. API Endpoints

*   **`PATCH /api/campaigns/[id]/wizard/[step]` (SSOT for Draft Saves):**
    *   Receives partial campaign data relevant to a specific `step`.
    *   Uses step-specific **base** Zod schemas (`StepXBaseSchema.partial()`) for validation, allowing partial updates.
    *   Maps only the validated, step-relevant fields to the database schema (`CampaignWizard` model).
    *   Handles `Influencer` updates transactionally specifically for Step 1 saves.
    *   Updates the `CampaignWizard` record in the database.
    *   Returns the updated campaign data.
*   **`GET /api/campaigns/[id]`:**
    *   Fetches either a draft (`CampaignWizard`) or a submitted campaign (`CampaignWizardSubmission`) based on ID format (UUID vs. numeric).
    *   Includes relevant relations.
    *   Returns the campaign data.
*   **`PUT /api/campaigns/[id]`:**
    *   **Only** updates **submitted** campaigns (`CampaignWizardSubmission` - identified by numeric ID). Logic for updating draft campaigns (UUIDs) has been removed.
*   **`DELETE /api/campaigns/[id]`:**
    *   Deletes either a draft or submitted campaign based on ID format. Handles deleting related `Influencer` records for drafts.
*   **`POST /api/campaigns/[id]/submit`:**
    *   Handles the final campaign submission logic (currently placeholder). Likely transforms the final `CampaignWizard` draft into a `CampaignWizardSubmission` record.
*   **`POST /api/campaigns`:**
    *   Handles the creation of a *new* campaign draft (`CampaignWizard` record). Likely called before navigating to the wizard for a new campaign.

## 5. Type Definitions (`types.ts`)

*   **`DraftCampaignDataBaseSchema`:** Defines the core structure and fields for the entire wizard state, based on the `CampaignWizard` Prisma model and potential JSON fields. Uses `.passthrough()` to allow extra fields.
*   **`DraftCampaignDataSchema`:** Extends the base schema with cross-field refinements (e.g., budget comparison, date order). This is the schema used for parsing the *full* state loaded from the DB.
*   **`StepXBaseSchema`:** Defines the structure for *each individual step*, typically by using `z.object({...})` or picking fields from `DraftCampaignDataBaseSchema`. Contains only field type definitions, no refinements. Used by the API route (`PATCH .../wizard/[step]`) with `.partial()` for validating incoming step data.
*   **`StepXValidationSchema`:** Extends the corresponding `StepXBaseSchema` with refinements and extensions needed for client-side form validation within that specific step's component (e.g., making a field required only for that step, adding cross-field rules within the step). Used in the `useForm` resolver for `StepXContent` components.
*   **`StepXFormData`:** TypeScript types inferred from `StepXValidationSchema`, used for typing form state and handlers within step components.
*   **`SubmissionPayloadSchema` / `SubmissionPayloadData`:** Defines the structure expected by the final submission API endpoint (`POST /api/campaigns`). Requires careful alignment with backend expectations.

## 6. Autosave (Currently Disabled)

*   The logic for automatically saving form changes after a debounce period exists but is **commented out** in:
    *   `Step1Content.tsx`, `Step2Content.tsx`, `Step3Content.tsx`, `Step4Content.tsx` (commented-out `handleAutosave`, `debouncedAutosaveRef`, `useEffect`).
    *   `WizardContext.tsx` (commented-out `debouncedSaveProgress`, autosave `useEffect`, `userEdited` state logic).
*   To re-enable, this code would need to be uncommented and potentially reviewed/refined. The current implementation relies on the manual "Save" button.
