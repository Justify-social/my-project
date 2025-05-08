# Campaign Wizard Architecture

**Last Reviewed:** 2025-05-09
**Status:** Current (Based on review of previous version)

## 1. Overview

The Campaign Wizard provides a multi-step interface for users to create and configure marketing campaigns. It guides the user through collecting necessary details, objectives, audience targeting, asset requirements, and finally, review before submission. The wizard is designed to save draft progress incrementally (via manual save or future autosave) and culminates in the creation of a `CampaignWizardSubmission` record upon final submission (handled by a separate API).

## 2. Core Components & Structure

The wizard utilizes a combination of Next.js App Router features, React Context, custom UI components, React Hook Form, and Zod for validation.

**File Structure Highlights:**

```text
src/
├── app/
│   └── (campaigns)/           # Route group for campaign features
│       └── campaigns/
│           ├── layout.tsx     # Layout for the overall /campaigns section
│           └── wizard/
│               ├── layout.tsx # Wizard-specific layout (Client Component, provides Context)
│               └── step-[N]/  # Dynamic route segments for each step (N=1 to 5)
│                   ├── page.tsx # Server Component page for the step route
│                   └── ClientPage.tsx # Client Component wrapper for step content
├── components/
│   ├── features/
│   │   └── campaigns/
│   │       ├── wizard/        # Wizard-specific feature components
│   │       │   ├── WizardContext.tsx # Context provider and useWizard hook (SSOT for state)
│   │       │   ├── StepContentLoader.tsx # Dynamically loads step components using React.lazy
│   │       │   ├── Step1Content.tsx # UI and logic for Step 1
│   │       │   ├── Step2Content.tsx # UI and logic for Step 2
│   │       │   ├── Step3Content.tsx # ... etc. ...
│   │       │   ├── Step4Content.tsx
│   │       │   └── Step5Content.tsx # Review step UI
│   │       └── types.ts         # Zod schemas and TypeScript types for wizard data
│   └── ui/                      # Reusable UI library components used by the wizard
│       ├── progress-bar-wizard.tsx # Shared footer navigation/save button UI
│       └── autosave-indicator.tsx # Top-center save status indicator UI
└── app/
    └── api/
        └── campaigns/
            ├── [id]/            # Routes for specific campaign drafts
            │   ├── route.ts     # GET (fetch draft), PUT (update draft metadata), DELETE
            │   ├── submit/      # Routes related to final submission
            │   │   └── route.ts # POST (submit final campaign, creates CampaignWizardSubmission)
            │   └── wizard/
            │       └── [step]/  # Route for saving individual step progress
            │           └── route.ts # PATCH (save draft step progress - SSOT for persistence)
            └── route.ts         # POST (create initial draft CampaignWizard record)
```

**Component Breakdown & Responsibilities:**

- **`wizard/layout.tsx` (Client Component):**
  - **SSOT for Context:** Wraps all wizard steps (`{children}`) with `<WizardProvider>`. Ensures all steps share the same context instance.
  - **SSOT for Status Indicator:** Renders the `<AutosaveIndicator />` UI component.
  - Marked `'use client'` because it uses hooks (`usePathname`, `useWizard`).
- **`wizard/step-[N]/page.tsx` (Server Component):**
  - Standard Next.js page file for the route segment (e.g., `/campaigns/wizard/step-1`).
  - Renders the corresponding `ClientPage.tsx`.
- **`wizard/step-[N]/ClientPage.tsx` (Client Component):**
  - Wraps the dynamic loading of the step content within `<Suspense>`.
  - Renders `<StepContentLoader step={N} />`.
- **`StepContentLoader.tsx` (Client Component):**
  - Uses `React.lazy()` to dynamically import the specific `StepXContent.tsx` component based on the `step` prop.
  - Renders the loaded component, showing a skeleton while loading.
- **`StepXContent.tsx` (Client Components - Steps 1-4):**
  - Contain the actual UI (forms, inputs) for each specific wizard step.
  - Use `react-hook-form` (`useForm`) for form state management and validation, using Zod schemas from `types.ts`.
  - Use `useEffect` to reset the form with data loaded into `WizardContext`.
  - Render the `<ProgressBarWizard />` UI component, passing down callbacks (`onBack`, `onNext`), state (`isLoading`), and `form.getValues` via the `getCurrentFormData` prop.
  - Implement navigation logic (`onSubmitAndNavigate`, `handleBack`) which typically involves:
    1.  Validating the current step's form.
    2.  Preparing a payload with current form data and completion flags.
    3.  Calling `wizard.saveProgress(payload)` to persist data via API.
    4.  Using `next/navigation`'s `router.push()` on successful save.
- **`Step5Content.tsx` (Client Component - Review Step):**
  - Displays a summary of data from all previous steps, fetched from `WizardContext`.
  - Provides "Edit" links/buttons to navigate back to previous steps.
  - Contains the final "Submit Campaign" button logic which calls a specific submission API (`POST /api/campaigns/[id]/submit`).
  - Uses `react-hook-form` primarily for the final confirmation checkbox.
- **`ProgressBarWizard.tsx` (UI Component):**
  - Provides the fixed footer UI with step indicators and navigation buttons ("Back", "Save Draft", "Next"/"Submit Campaign").
  - Receives step configuration, current step, callbacks (`onBack`, `onNext`), loading/disabled states, and `getCurrentFormData` as props.
  - The "Save Draft" button handler (`handleManualSave`) calls `getCurrentFormData`, constructs a payload, calls `wizard.updateWizardState`, and then `await wizard.saveProgress()` to trigger the API save. Manages its own saving state.
- **`WizardContext.tsx` (Client Component Logic):**
  - **State:** Manages shared state (`wizardState`, `isLoading`, `lastSaved`, `autosaveEnabled`, etc.) using `useState`.
  - **Hook:** Provides the `useWizard` hook for components to consume context.
  - **Loading:** `loadCampaignData` fetches initial data using `GET /api/campaigns/[id]` if an ID is present, otherwise initializes default state.
  - **State Updates:** `updateWizardState` function allows step components to update the shared `wizardState` locally (e.g., before saving).
  - **Saving:** `saveProgress` function:
    - Accepts the data payload for the current step.
    - Handles **creation** (if `campaignId` is null) by calling `POST /api/campaigns` first to get an ID.
    - Sends the step data to the persistence endpoint: `PATCH /api/campaigns/[id]/wizard/[step]`.
    - Manages `isLoading` and `lastSaved` state.
    - Updates internal `wizardState` with the validated data returned from the successful API call.
- **`AutosaveIndicator.tsx` (UI Component):**
  - Displays the save status ("Saving...", "Saved [time]", "Error"). Receives status and timestamp props from the `wizard/layout.tsx` which consumes them from the context.

## 3. Data Flow & State Management

- **Single Source of Truth**: `WizardContext` holds the draft campaign data (`wizardState`).
- **Loading**: Context loads data via `GET /api/campaigns/[id]` if ID exists, otherwise initializes default state.
- **Form State**: Each `StepXContent` uses `react-hook-form` for local form state, initialized/reset from `WizardContext`.
- **Saving (Manual)**:
  1.  Button click in `ProgressBarWizard` triggers `handleManualSave`.
  2.  Calls `getCurrentFormData` (which is `form.getValues` from active step).
  3.  Calls `wizard.saveProgress(payload)`.
  4.  `saveProgress` handles API call (`POST` for create, `PATCH` for update) and updates context state (`isLoading`, `lastSaved`, `wizardState`).
- **Saving (Navigation)**:
  1.  "Next" click in `ProgressBarWizard` triggers `onNext` (handler in active step, e.g., `onSubmitAndNavigate`).
  2.  Handler validates form (`form.trigger()`).
  3.  Handler gets form data (`form.getValues()`).
  4.  Handler prepares payload for _current_ step.
  5.  Handler calls `await wizard.saveProgress(payload)`.
  6.  On success, handler uses `router.push()` to navigate.
- **Final Submission**: "Submit Campaign" button in `Step5Content` triggers a call to a dedicated submission endpoint (`POST /api/campaigns/[id]/submit`), likely changing the campaign status and potentially creating the `CampaignWizardSubmission` record.

## 4. API Endpoints

- **`POST /api/campaigns`**: Creates a new initial `CampaignWizard` draft record. Returns the new campaign data including its ID.
- **`GET /api/campaigns/[id]`**: Fetches the full current state of a campaign draft.
- **`PATCH /api/campaigns/[id]/wizard/[step]`**: Saves/updates the data for a specific step of an existing draft. Returns the updated (and validated) campaign draft data.
- **`POST /api/campaigns/[id]/submit`**: Finalizes the campaign draft, performs final validation, potentially creates the `CampaignWizardSubmission` record, and updates the status.
- **`PUT /api/campaigns/[id]`**: (Potentially) Updates top-level metadata of a campaign draft.
- **`DELETE /api/campaigns/[id]`**: Deletes a campaign draft.

## 5. Validation

- **Client-Side**: Each `StepXContent` component uses `react-hook-form` with a `zodResolver` pointing to a step-specific Zod schema (e.g., `Step1ValidationSchema`) defined in `types.ts`. These schemas handle field requirements and basic format checks within the step.
- **Server-Side**: API route handlers (especially the `PATCH .../wizard/[step]` endpoint) should re-validate the incoming step data against a corresponding Zod schema (e.g., `Step1BaseSchema.partial()`) before saving to the database.
- **Schema Strategy (`types.ts`)**:
  - `DraftCampaignDataBaseSchema`: Base Zod schema mirroring the `CampaignWizard` Prisma model.
  - `StepXBaseSchema`: Defines structure for each step, often picking fields from the base schema.
  - `StepXValidationSchema`: Extends base step schema with client-side refinements (used by `useForm`).
  - `SubmissionPayloadSchema`: Defines structure for the final submission API.

## 6. Autosave (Currently Disabled)

- The logic for automatically saving form changes after a debounce period exists but is **commented out** in step components and `WizardContext.tsx`.
- Re-enabling would require uncommenting and testing this logic.

## 7. Key Considerations

- **Context as SSOT**: `WizardContext` is central. Ensure data flows correctly between context, step forms, and API.
- **API Granularity**: The `PATCH .../wizard/[step]` endpoint allows saving progress incrementally without needing the entire campaign object.
- **Validation Consistency**: Ensure server-side validation aligns with client-side Zod schemas.
- **State Management**: Balancing local form state (React Hook Form) with shared context state (`WizardContext`).
- **Error Handling**: Robust error handling for API calls (loading, saving, submitting) with user feedback (e.g., toasts).
