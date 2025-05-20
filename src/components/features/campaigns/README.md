# Campaign Wizard Feature

This directory contains the components responsible for the multi-step Campaign Wizard feature.

## Overview

The Campaign Wizard guides users through the process of creating a new marketing campaign by collecting details across several steps:

1.  **Details:** Basic information, contacts, budget, influencers.
2.  **Objectives:** KPIs, messaging, expected outcomes, features.
3.  **Audience:** Demographics, location, languages, interests, competitors.
4.  **Assets:** Creative uploads, guidelines, requirements, notes.
5.  **Review:** Summary and final submission.

## Architecture (Post-Refactor)

- **State Management:** Uses `WizardContext.tsx` as the Single Source of Truth (SSOT) for all shared campaign draft data across steps.
- **Forms:** Built using React Hook Form (`useForm`) for state management and Zod (`zodResolver`) for validation. See `types.ts` for schemas.
- **UI:** Primarily uses generic, reusable components from `/src/components/ui/` (e.g., `Button`, `Card`, `Input`, `Select`, `AgeRangeSlider`, `GenderSelector`, `LanguageSelector`, `FileUploader`, `InfluencerCard`, `AutosaveIndicator`) orchestrated by the step components (`Step1Content.tsx` - `Step5Content.tsx`).
- **Navigation:** Handled centrally by `/src/components/ui/progress-bar-wizard.tsx`, which is rendered within each step component. Step components themselves do not contain footer navigation buttons.
- **Autosave:** Implemented via `WizardContext.tsx`, triggered automatically on valid form changes within steps.
- **Styling:** Uses Tailwind CSS and adheres to conventions established by Shadcn UI.

## Key Components

- `WizardContext.tsx`: Manages state, data loading, and saving logic.
- `Step[1-5]Content.tsx`: Components for each step of the wizard, handling layout and form fields.
- `types.ts`: Contains TypeScript interfaces and Zod schemas for form data, validation, and API payloads.
- `ProgressBar.tsx`: _Feature-specific_ wrapper/logic around the progress bar UI (though the main nav is now `/ui/progress-bar-wizard.tsx`).
- `Header.tsx`: Displays the wizard title and step count.
- `InfluencerCard.tsx`: _Feature-specific_ widget displaying aggregate influencer metrics (distinct from `/ui/card-influencer.tsx`).

## Related UI Components (`/src/components/ui/`)

- `progress-bar-wizard.tsx`: Handles step display and navigation buttons.
- `slider-age-range.tsx`: Reusable age range slider.
- `selector-gender.tsx`: Reusable gender checkbox group.
- `selector-language.tsx`: Reusable language selector (Command-based).
- `video-file-uploader.tsx`: Reusable video uploader with Mux integration.
- `card-influencer.tsx`: Reusable card for displaying individual influencer details.
- `autosave-indicator.tsx`: Displays autosave status.
- `card-asset-step-4.tsx`: Card for displaying and interacting with assets in Step 4.

## Further Development

- Implement remaining specific UI components (e.g., Location Selector, Interest Selector).
- Integrate actual API for influencer validation.
- Refine error handling and user feedback.
- Conduct thorough testing (E2E, integration).
- Review and enhance JSDoc comments for all components.

### UI Components (`@/components/ui`)

Many specific UI elements for the wizard steps are composed from primitive UI components (e.g., `Input`, `Button`, `Card`) found in the main `@/components/ui` directory. Key reusable UI components directly related to or heavily used by the wizard include:

- `progress-bar-wizard.tsx`: The step indicator at the top.
- `video-file-uploader.tsx`: Handles video uploads via Mux.
- `card-asset-step-4.tsx`: Card for displaying and interacting with assets in Step 4.
- `selector-*`: Various command-based selectors (e.g., `selector-currency.tsx`, `selector-platform.tsx`).

### State Management (`WizardContext.tsx`)
