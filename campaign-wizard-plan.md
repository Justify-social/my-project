# Campaign Wizard Improvement Tasks

This document outlines the tasks required to address the identified issues in the campaign wizard.

**Overall Goal:** Resolve inconsistencies, fix bugs, enhance user experience, and clean up technical debt in the campaign wizard flow.

---

## Phase 1: Unblock Build & Core Stability

**Objective:** Resolve foundational issues preventing further development and stabilize core save logic.

- [x] **Task 1.1 (Blocker): Fix Linter/Build Errors in `Step1Content.tsx`**
  - [x] Correct `ProgressBarWizard` prop types/usage (add `onStepClick`, `onBack`, `onSave`, remove `getCurrentFormData` if obsolete based on refactor).
  - [x] Fix `DatePicker` type mismatches (ensure `value`/`onChange` use `Date` objects).
  - [x] Resolve `logger.info` type errors (simplify payloads or define types).
  - [x] Review and fix any other TypeScript/JSX errors reported by `npm run build`.
- [x] **Task 1.2 (Issue A): Finalize Save Button Logic**
  - [x] Ensure `handleSave` (passed as `onSave` prop) in `Step1Content.tsx` includes `form.trigger()` for validation.
  - [x] Ensure `handleSave` payload construction matches `onSubmitAndNavigate` (incl. data transformations like `parseFloat` for budget).
  - [x] Implement consistent `handleSave` logic (validation, payload) in `Step2Content.tsx`, `Step3Content.tsx`, `Step4Content.tsx`.
  - [x] Add toast notifications for save success/failure in `handleSave` for all relevant steps.
- [x] **Task 1.3 (Issue B): Implement Robust Automatic Timezone Detection**
  - **Objective:** Ensure automatic timezone detection works reliably, handles failures gracefully, provides clear user feedback, and resolves potential race conditions with form initialization.
  - [x] **Sub-Task 1.3.1: Investigate & Stabilize API Calls**
    - [x] Verify `NEXT_PUBLIC_IPGEOLOCATION_API_KEY` is correctly configured and valid.
    - [x] Implement robust error handling and logging around `fetch` calls to `api.ipgeolocation.io` and `ipapi.co/json/` (handle timeouts, network errors, API errors, unexpected responses).
    - [x] Consider adding `Intl.DateTimeFormat().resolvedOptions().timeZone` as a client-side fallback if API methods fail.
  - [x] **Sub-Task 1.3.2: Resolve Race Condition & State Handling**
    - [x] Refactor `useEffect` hooks in `Step1Content.tsx` to ensure form initialization reliably waits for timezone detection completion (success or failure).
    - [x] Implement loading state (e.g., `isDetectingTimezone`) for the detection process.
    - [x] Ensure priority order for setting initial value: `wizardState.timeZone` (saved) > detected timezone > default ('UTC').
  - [x] **Sub-Task 1.3.3: Improve User Feedback**
    - [x] Show a loading indicator near the timezone field during detection.
    - [x] If detection fails, clearly default to 'UTC' (and pre-select it in the dropdown) and potentially indicate detection failure subtly near the field.
    - [x] Ensure the successfully detected timezone is correctly pre-selected in the dropdown (populated from `timezones.json`).

---

## Phase 2: Enhance User Experience & Address Critical Failures

**Objective:** Improve user feedback during saves and resolve the critical Step 2 saving failure.

- [x] **Task 2.1 (Issue E): Improve Save Feedback**
  - [x] Add loading indicator (spinner/text) in `ProgressBarWizard` or step components during `await wizard.saveProgress()`.
  - [x] Verify post-save state updates (`setWizardState`, `router.replace`) correctly reflect the new campaign UUID in UI/URL.
  - [ ] _Optional:_ Log save operation durations to identify potential backend latency.
- [ ] **Task 2.2 (Issue F): Resolve Step 2 Saving Failure**
  - [x] **Client-Side:** Debug `form.getValues()` in `Step2Content.tsx` to ensure correct data capture for all fields (KPIs, messaging, outcomes, features, hashtags).
  - [x] **Backend Investigation:** Review API route handler (`PATCH /api/campaigns/.../wizard/[step]`) for Step 2 data processing, validation, and field mapping. (Validation restored).
  - [ ] **Error Handling:** Ensure backend provides meaningful errors on validation failure, and display these via client-side toasts. (Partially addressed by validation restoration).
  - [ ] **Verify Prisma Schema** (If needed after further testing).
  - **Status:** Addressed (Pending testing confirmation).

---

## Phase 3: Implement Features & Address Technical Debt

**Objective:** Add missing features (currency conversion, Phyllo) identified during the initial investigation.

- [x] **Task 3.1 (Issue C): Implement Currency Conversion**
  - [x] Choose conversion method (API via `src/utils/currency.ts`).
  - [x] Integrate conversion logic into `Step1Content.tsx`.
  - [x] Display converted budget values in the UI (read-only field or tooltip).
  - [x] Ensure original budget + currency are stored (SSOT).
- [ ] **Task 3.2 (Issue D): Implement Phyllo Integration**
  - **Objective:** Integrate the real Phyllo API to fetch/validate influencer data, displaying results in `InfluencerCard`, handling API credentials and errors robustly for production use.
  - **Current Status:** BLOCKED - Requires Backend API Endpoint.
  - [x] **Sub-Task 3.2.1: Restore & Adapt Frontend Code**
    - [x] Restore commented-out code in `InfluencerEntry` for validation and display logic.
    - [x] Add state variables (`isValidating`, `validationData`, `validationError`) to `InfluencerEntry`.
    - [x] Add placeholder `handleVerifyInfluencer` function.
  - [ ] **Sub-Task 3.2.2: Implement API Integration Logic (BLOCKED)**
    - **Action Required (Backend):** Create a new API route (e.g., `/api/phyllo/validate-influencer`).
      - Handler should accept `POST` requests with `{ platform: string, handle: string }` in the body.
      - Handler must securely retrieve Phyllo Client ID and Secret from environment variables.
      - Handler must use the Phyllo SDK/API (server-side) to query Phyllo's profile or identity endpoints based on the provided platform and handle.
      - Handler must implement robust error handling for Phyllo API calls (e.g., invalid handle, platform not found, API errors, timeouts).
      - Handler must return a consistent JSON response:
        - On success: `{ success: true, data: { /* Relevant influencer profile data */ } }` (Define structure based on Phyllo response and `InfluencerCard` needs: `id`, `displayName`, `handle`, `platform`, `avatarUrl`, `followerCount`, `verified`, etc.)
        - On failure: `{ success: false, error: "User-friendly error message" }`
    - **Action Required (Frontend - Once Backend Ready):** Update `handleVerifyInfluencer` in `src/components/features/campaigns/Step1Content.tsx`.
      - Replace simulation logic with `fetch('/api/phyllo/validate-influencer', { method: 'POST', ... })`.
      - Send `watchedPlatform` and `watchedHandle` in the request body.
      - Process the JSON response, updating `validationData` state on `success: true` or `validationError` state on `success: false`.
      - Define a proper TypeScript interface/type for the `validationData` based on the expected backend response structure and replace the current `any` type.
  - [x] **Sub-Task 3.2.3: Implement Frontend Trigger**
    - [x] Add "Verify" button to `InfluencerEntry` to trigger validation.
  - [x] **Sub-Task 3.2.4: Implement Frontend UI Feedback**
    - [x] Implement loading state (spinner on button).
    - [x] Implement display of validation error messages.
    - [x] Implement display of `InfluencerCard` using `validationData` state upon successful validation.

---

## Original Investigation Log (Reference)

_(The previous content detailing the investigation steps and root cause analysis can be preserved below this line for reference if needed, or removed if the task list is sufficient)_

```
(Original content of campaign-wizard.md can be pasted here or linked)
```
