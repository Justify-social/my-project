# Refactoring Plan: /brand-lift/campaign-review-setup Page

**Objective:** Refactor the `/brand-lift/campaign-review-setup/[campaignId]` page (Component: `CampaignReviewStudySetup.tsx`) to have a "Study Name" input at the top, followed by a detailed campaign review section mimicking the layout of `/campaigns/wizard/step-5`, and a "Continue to Survey Design" button.

**Current Overall Status:** In Progress. Key structural elements and data utilities have been added, but type compatibility issues with `InfluencerCard` and `AssetCard` are blocking full replication of Step 5's review display.

---

## Phase 1: Preparation and Top Section (Largely Completed)

- **Step A: Add Necessary Imports**
  - **Status:** ✅ Done.
  - **Details:** Imports for `Accordion`, `Badge`, `Image`, `IconButtonAction`, and `cn` utility have been added to `CampaignReviewStudySetup.tsx`. `InfluencerCard` and `AssetCard` imports are present but their usage is problematic.
- **Step B: Define Comprehensive `CampaignDetails` Interface & Copy Helper Utilities**
  - **Status:** ✅ Done.
  - **Details:** A comprehensive `CampaignDetails` interface (similar to `DraftCampaignData`) and numerous helper functions (formatting, KPI lookups) from `Step5Content.tsx` have been integrated into `CampaignReviewStudySetup.tsx`.
- **Step C: Basic Layout Restructure (Top Section) & Form Simplification**
  - **Status:** ✅ Done.
  - **Details:**
    - The top `Card` in `CampaignReviewStudySetup.tsx` now correctly contains only the "New Brand Lift Study Setup" title, a description, and the "Study Name" input field.
    - The Zod schema (`studySetupSchema`) and `useForm` defaults are simplified to only manage `studyName`.
    - The primary action button ("Continue to Survey Design") is at the bottom, within the main form.

## Phase 2: Integrate Campaign Review Display (Accordion Structure - Partially Completed)

- **Step D: Define Core Display Components**
  - **Status:** ✅ Done.
  - **Details:** `DataItem`, `SummarySection` (updated to use `IconButtonAction`), and `KpiBadge` components are correctly defined at the module level in `CampaignReviewStudySetup.tsx`.
- **Step E: Copy Step-Specific Review Components**
  - **Status:** ✅ Done (with caveats for card display).
  - **Details:** `Step1Review`, `Step2Review`, `Step3Review`, and `Step4Review` components are copied into `CampaignReviewStudySetup.tsx`.
    - **Issue:** `Step1Review` (for Influencers) and `Step4Review` (for Assets) are currently causing linter errors due to type mismatches when trying to use `InfluencerCard` and `AssetCard`.
- **Step F: Implement Accordion and Main Action Button**
  - **Status:** ✅ Done.
  - **Details:** The main JSX in `CampaignReviewStudySetup.tsx` now includes the "Study Name" card, followed by an `<h1>` "Review Campaign Details", and the `<Accordion>` structure using `SummarySection` and `StepXReview` components. The final "Continue to Survey Design" button is correctly placed within the form.

## Phase 3: Data Flow, Type Resolution, and Finalization (Blocked/Pending)

- **Step G: Connect Fetched Data & Resolve Type Errors (BLOCKED)**

  - **Status:** ❗ **BLOCKED by persistent type errors.**
  - **Details:**
    - `campaignData` (fetched from `/api/campaign-data-for-brand-lift/${campaignId}`) is passed to `StepXReview` components.
    - **Blocker 1 (`InfluencerCard`):** The `platform` prop of `InfluencerCard` expects `PlatformEnum` (from `@/types/enums`), but `campaignData.Influencer[].platform` is `PrismaClient.Platform | null | undefined`. Direct passing or mapping attempts have failed due to type incompatibility in the context of `CampaignReviewStudySetup.tsx`.
      - **Needed:** Exact definition of `PlatformEnum` and `InfluencerCardProps` to create a correct mapping or determine why it works in `Step5Content.tsx` but not here.
    - **Blocker 2 (`AssetCard`):** The `asset.budget` prop (and previously `description`, `type`, `url`) causes type errors if `null` is passed instead of `undefined`. While `?? undefined` should fix this, the `budget` error (`Type 'number | null | undefined' is not assignable to type 'string | number | undefined'`) was still present in the last linter run. This suggests `AssetData.budget` might allow a string (e.g. formatted currency) and the `?? undefined` for budget was not correctly applied/retained in the last attempt.
      - **Needed:** Exact definition of `AssetData` (props for `AssetCard`) to ensure correct null/undefined handling for all fields.
  - **Next Action (To Unblock):** Temporarily revert `Step1Review` and `Step4Review` to use simple list displays for influencers and assets, removing the direct dependency on `InfluencerCard` and `AssetCard` until type definitions are clarified.

- **Step H: Refine Skeleton Loader**

  - **Status:** ✅ Done.
  - **Details:** The `isLoading` state in `CampaignReviewStudySetup.tsx` now renders a more representative skeleton for the page structure.

- **Step I: API Alignment for `/api/campaign-data-for-brand-lift/${campaignId}`**

  - **Status:** 🟡 Pending.
  - **Details:** This API endpoint _must_ return data that fully aligns with the comprehensive `CampaignDetails` interface defined in `CampaignReviewStudySetup.tsx` for the review sections to populate correctly.
  - **Next Action:** Verify/update the API endpoint.

- **Step J: `onEdit` Functionality for `SummarySection`**

  - **Status:** 🟡 Pending.
  - **Details:** Currently `onEdit={() => {}}`. Needs to be decided what action these buttons should perform (e.g., navigate to a specific part of the main campaign view/edit, or be removed).

- **Step K: `onSubmit` Payload for `/api/brand-lift/surveys`**
  - **Status:** 🟡 Pending review.
  - **Details:** Currently sends `name` (study name) and `campaignId`. The API must be designed to handle this. It may need to fetch full parent campaign details or expect more specific Brand Lift study parameters (KPIs, funnel stage for _this study_) to be passed. These would need to be added back to the form if required at this stage.

---

## Next Immediate Steps:

1.  **Unblock Type Errors:**
    - **Option A (Recommended to move forward):** Modify `CampaignReviewStudySetup.tsx` to temporarily display influencers and assets in `Step1Review` and `Step4Review` as simple lists, removing the use of `InfluencerCard` and `AssetCard` to clear the persistent linter errors.
    - **Option B (If type info is available):** Provide the exact type definitions for `PlatformEnum` (`@/types/enums`), `InfluencerCardProps.platform`, and `AssetData` (from `AssetCard.tsx`) so a correct type mapping can be implemented.
2.  **Once unblocked:**
    - Thoroughly test the display of all other data in the review sections.
    - Verify/Update the API at `/api/campaign-data-for-brand-lift/${campaignId}` to ensure it provides all necessary data for the `CampaignDetails` interface (Step I).
    - Define the behavior for `onEdit` in `SummarySection` (Step J).
    - Confirm the required payload for the `/api/brand-lift/surveys` endpoint and adjust the `onSubmit` function and form schema if additional fields for the Brand Lift study itself (like its own KPIs/funnel stage) need to be collected on this page (Step K).
    - Commit all changes.

This detailed breakdown should help clarify the current state and the path forward!
