# UI Audit Plan & Findings

**Objective:** Ensure UI consistency across the application by aligning all components and styles with defined Single Sources of Truth (SSOT).

**SSOT Definitions:**
*   **Components:** Standard Shadcn UI components located exclusively in `src/components/ui/`.
*   **Colors:** Brand colors and semantic colors (`--primary`, `--secondary`, `--accent`, `--destructive`, `--success`, `--warning`, `--interactive`, `--background`, `--foreground`, `--muted`, `--border`, etc.) defined as CSS variables in `src/app/globals.css` and referenced in `tailwind.config.js`.
*   **Icons:** FontAwesome Pro icons rendered exclusively via the central `Icon` component (`@/components/ui/icon`).
*   **Typography:** Font families defined in `globals.css` and referenced in `tailwind.config.js`. (Note: Relies on default Tailwind scales for size/weight/leading - see Potential Enhancements).
*   **Spacing:** Relies on default Tailwind spacing scale configured via `tailwind.config.js`. (See Potential Enhancements).
*   **Border Radius:** Defined via `--radius` variable in `globals.css` and referenced in `tailwind.config.js`.

**Methodology:** Conduct a phased audit. Phase 1 involves manual inspection of the core `Button` component. Phase 2 utilizes automated codebase searches (e.g., using `grep` or similar tools) to efficiently identify potential deviations across the entire project, followed by manual verification of findings. All confirmed findings will be documented in this file *before* initiating code changes. Each task should result in a list of verified findings or a confirmation of compliance.

**Potential Future SSOT Enhancements (Not included in current audit scope):**
*   Define explicit Typography scales (size, weight, line-height) as CSS variables in `globals.css`.
*   Define an explicit Spacing scale as CSS variables in `globals.css`.
*   Define standard Box Shadow variables in `globals.css`.
*   Define a Z-Index scale in `globals.css`.

---

## Phase 1: Button Component Audit (`src/components/ui/button.tsx`)

**Goal:** Verify the base `Button` component perfectly aligns with SSOT definitions.

**Tasks:**

1.  **[X] Task 1.1: Verify Button Variant Colors**
    *   **Action:** Analyze CSS/Tailwind classes applied to each button variant (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`) within `button.tsx`.
    *   **Check:** Compare the applied background, text, and border colors for all states (default, hover, focus, disabled) against the CSS variables defined in `globals.css`.
    *   **SSOT:** `globals.css` color variables.
    *   **Output:** List any discrepancies below (e.g., "Destructive hover background uses `#FF0000` instead of `var(--destructive-hover)`").
    *   **Findings:**
        *   **Compliant.** All variants use Tailwind classes configured via `tailwind.config.js` which correctly reference CSS variables from `globals.css`.

2.  **[X] Task 1.2: Verify Icon Integration**
    *   **Action:** Review how icons are handled when passed as children to the `Button` component in `button.tsx`. Examine associated CSS/Tailwind for spacing (e.g., `gap`).
    *   **Check:** Confirm the component correctly uses the central `Icon` component (`@/components/ui/icon`) and applies appropriate, consistent spacing between the icon and text.
    *   **SSOT:** `Icon` component usage, standard spacing scale (from Tailwind config).
    *   **Output:** Confirm compliance or list required adjustments (e.g., "Needs `gap-2` applied when icon is present").
    *   **Findings:**
        *   **Compliant.** Base button uses `gap-2` for spacing and `[&_svg]:size-4` for sizing, aligning with Tailwind scales. Standard usage involves passing `Icon` as a child.
        *   _Note:_ Preview page uses explicit `mr-2`/`ml-2` on icons in text buttons; verify if `gap-2` is visually sufficient to remove these.

3.  **[X] Task 1.3: Verify Button Accessibility**
    *   **Action:** Inspect the rendered button variants in the browser (using dev tools).
    *   **Check:**
        *   Ensure sufficient color contrast between text and background for all variants and states.
        *   Confirm focus indicators are clear and visible.
        *   Verify necessary ARIA attributes are present (though likely handled by base Shadcn).
    *   **SSOT:** WCAG AA contrast ratios, accessible design principles.
    *   **Output:** Note any contrast issues or missing accessibility features.
    *   **Findings:**
        *   **Likely Compliant (Visual Check Recommended).** Color contrast appears sufficient based on theme colors. Focus ring styles are defined (`focus-visible:ring-ring`). `IconButtonAction` uses `aria-label` correctly.

---

## Phase 2: Full Codebase UI Audit

**Goal:** Identify all deviations from UI SSOT across the entire application.

**Tasks:**

1.  **[X] Task 2.1: Audit Component Sources**
    *   **Action:** Search the codebase *outside* `src/components/ui` (e.g., `src/app`, `src/components/*` (if exists), `src/lib`, etc.) for any files defining React components (`.tsx`) that render custom UI elements (buttons, inputs, cards, modals, etc.) or replicate `src/components/ui` functionality.
    *   **Check:** Identify any component that should be replaced by a standard component from `src/components/ui`.
    *   **SSOT:** `src/components/ui` directory.
    *   **Output:** List violating components and their file paths.
    *   **Findings:**
        *   **Violation:** `src/components/features/campaigns/Step2Content.tsx` - Defines `StyledField` component. Should likely use standard `Input`, `Label`, and `Form` components from `src/components/ui`. Uses direct CSS color variables instead of Tailwind classes.
        *   **Violation:** `src/components/features/campaigns/Step2Content.tsx` - Implements custom "Feature" selection boxes using styled `div`s. Investigate using standard `Checkbox` or `Toggle` components.
        *   **Violation:** `src/components/features/campaigns/Step2Content.tsx` - Inline implementation of Light/Solid icon hover toggle for "Remove Secondary KPI" button. Should use `IconButtonAction` component.
        *   **Violation:** `src/components/features/campaigns/FilterPanel.tsx` - Uses standard HTML `<button>` for "Reset Filters" with custom styles (`bg-[var(--secondary-color)]`). Should use standard `Button` component (`variant="secondary"`).

2.  **[X] Task 2.2: Audit Tailwind Configuration**
    *   **Action:** Review `tailwind.config.js`.
    *   **Check:** Ensure the `theme.extend.colors` section correctly references the CSS variables defined in `globals.css` (e.g., `primary: 'var(--primary)'`). Verify the `theme.extend.spacing`, `theme.extend.fontSize`, `theme.extend.fontFamily`, etc., align with design system standards.
    *   **SSOT:** `globals.css`, Design System specifications.
    *   **Output:** Confirm compliance or list misconfigurations.
    *   **Findings:**
        *   **Compliant.** Color, font family, and border radius configurations correctly reference CSS variables from `globals.css`.
        *   **Observation:** Spacing and font size scales primarily rely on Tailwind defaults rather than explicitly defined custom scales in the config.

3.  **[X] Task 2.3: Audit Color Usage**
    *   **Action:** Search the entire codebase (`.tsx`, `.ts`, `.css`, `.scss`) for:
        *   Hardcoded hex color values (`#...`).
        *   `rgb(...)` / `rgba(...)` color definitions.
        *   Tailwind color classes not defined in `tailwind.config.js` (e.g., `text-red-500` if `red-500` isn't part of the theme).
        *   Inline `style` attributes applying colors.
    *   **Check:** Identify any color usage that doesn't leverage the approved brand colors via CSS variables or configured Tailwind classes.
    *   **SSOT:** `globals.css` color variables, `tailwind.config.js` color theme.
    *   **Output:** List instances (file path, line number, violating color/class).
    *   **Findings:**
        *   **Violation:** Widespread use of hardcoded hex values (`#...`) found in:
            *   `src/lib/db.ts` (brand colors)
            *   `src/lib/email.ts` (inline styles)
            *   `src/components/features/campaigns/AgeDistributionSlider.tsx` (slider UI)
            *   `src/components/features/dashboard/BrandLiftCharts.tsx` (chart colors)
            *   `src/components/features/campaigns/CampaignAssetUploader.tsx` (hover style)
            *   `src/components/features/campaigns/BasicInfo.tsx` (focus ring)
            *   Multiple `src/components/ui/chart-*.tsx` files (grid, border, default color arrays)
            *   `src/components/ui/navigation/sidebar*.tsx` (bg, text, border)
            *   `src/components/ui/navigation/header.tsx` (text color)
        *   **Violation:** Use of `rgba(...)` for background colors (e.g., `bg-[rgba(0,191,255,0.1)]`) in `Step5Content.tsx` and `/[id]/page.tsx`. Should likely use Tailwind opacity modifiers (e.g., `bg-accent/10`).
        *   **Observation:** `rgba(...)` used for `box-shadow` in multiple components and chart fills (`chart-area.tsx`). May be acceptable but could potentially be standardized in theme.

4.  **[X] Task 2.4: Audit Icon Usage**
    *   **Action:** Search the codebase for:
        *   Direct usage of inline `<svg>` elements.
        *   Usage of `<img>` elements for icons.
        *   Imports from icon libraries other than `@fortawesome/*`.
        *   Any rendering of icons *not* using the `@/components/ui/icon` component.
    *   **Check:** Identify all instances where icons are implemented outside the standard `Icon` component.
    *   **SSOT:** `Icon` component (`@/components/ui/icon`).
    *   **Output:** List instances (file path, line number, method used).
    *   **Findings:**
        *   **Violation:** Inline `<svg>` elements used directly in multiple components (spinners, checkmark, chevron) instead of the `Icon` component. Files include `ObjectivesContent.tsx`, `AutosaveIndicator.tsx`, `ProgressBar.tsx`, `Step3Content.tsx`, various `loading/layout.tsx` files, `header.tsx`, `campaigns/page.tsx`.
        *   **Compliant (Likely):** No clear evidence of `<img>` tags used for icons.
        *   **Compliant:** No evidence of imports from other icon libraries.

5.  **[X] Task 2.5: Audit Typography Usage**
    *   **Action:** Search the codebase for:
        *   Inline `style` attributes setting `font-family`, `font-size`, `font-weight`, `line-height`.
        *   CSS/SCSS rules defining typography properties that conflict with or override `globals.css` or Tailwind defaults.
        *   Tailwind typography classes not defined in the theme (e.g., `text-xl` if `xl` isn't configured).
    *   **Check:** Identify typography usage inconsistent with the established theme.
    *   **SSOT:** `globals.css`, `tailwind.config.js` typography theme.
    *   **Output:** List instances (file path, line number, violating style/class).
    *   **Findings:**
        *   **Violation:** Arbitrary text size `text-[10px]` used in `src/components/features/campaigns/ProgressBar.tsx`. Should use standard Tailwind class (e.g., `text-xs`).
        *   **Violation:** Widespread use of arbitrary Tailwind text color classes `text-[var(--...)]` instead of configured theme classes (`text-primary`, `text-secondary`, etc.) in campaign wizard components (`Step1Content.tsx`, `Step2Content.tsx`, `Step3Content.tsx`, `WizardNavigation.tsx`, `ProgressBar.tsx`).
        *   **Violation:** Inline style `font-size: 14px` in `src/lib/email.ts` (May be acceptable for email compatibility).
        *   **Compliant (Likely):** No major violations found for font-family or font-weight; standard classes seem to be used correctly.

6.  **[X] Task 2.6: Audit Spacing Usage**
    *   **Action:** Search the codebase for:
        *   Inline `style` attributes setting `margin`, `padding`.
        *   CSS/SCSS rules defining spacing properties using hardcoded pixel values (e.g., `margin-top: 15px;`) instead of relative units or theme variables.
        *   Tailwind spacing classes using arbitrary values if disallowed (e.g., `mt-[15px]`) or classes not part of the configured spacing scale.
    *   **Check:** Identify spacing usage inconsistent with the Tailwind theme's spacing scale.
    *   **SSOT:** `tailwind.config.js` spacing theme.
    *   **Output:** List instances (file path, line number, violating style/class).
    *   **Findings:**
        *   **Violation:** Inline style `padding` in `src/lib/email.ts` (Likely acceptable for email compatibility).
        *   **Observation:** Inline style `paddingTop` used for Recharts Legend in `chart-line.tsx` and previews.
        *   **Observation:** Arbitrary Tailwind values used:
            *   Large fixed layout margins (`ml-[240px]`, `mt-[64px]`) in `LayoutContent.tsx`. Consider converting to theme spacing or CSS variables.
            *   Small pixel adjustments (`top-[-1px]`, `p-[1px]`, `pb-[3px]`) in various components. Acceptable if used sparingly for fine-tuning.
            *   Centering values (`left-[50%]` etc.) in Dialog/AlertDialog components. Standard practice, likely acceptable.

---

## Phase 3: Refactoring Plan (To be created AFTER Phase 1 & 2 Completion)

**Goal:** Prioritize and plan the execution of fixes based on audit findings.

**Tasks:**

1.  **[X] Task 3.1: Review Audit Findings**
    *   **Action:** Consolidate and review all findings documented in Phase 1 and Phase 2.
    *   **Output:** A shared understanding of the scope of required UI alignment.

2.  **[X] Task 3.2: Prioritize Refactoring Tasks**
    *   **Action:** Rank the identified issues based on impact (e.g., core component inconsistencies > minor color deviations) and frequency.
    *   **Output:** A prioritized list of refactoring tasks.
    *   **Prioritization:**
        *   **P1: Core Component & Styling Violations (High Impact & Frequency)**
            1.  Refactor `StyledField` component (`Step2Content.tsx`) to use standard UI components & themed styles.
            2.  Replace `text-[var(--...)]` with themed text classes (`text-primary`, etc.) in campaign wizard files.
            3.  Replace hardcoded hex colors in navigation (`sidebar*.tsx`, `header.tsx`) with themed classes.
            4.  Replace inline `<svg>` elements with `Icon` component globally.
            5.  Replace custom HTML `<button>` in `FilterPanel.tsx` with standard `Button` component.
            6.  Replace inline icon hover toggle in `Step2Content.tsx` with `IconButtonAction`.
        *   **P2: Other Hardcoded Colors & Potential Component Issues (Medium Impact)**
            7.  Refactor hardcoded colors in chart components (`chart-*.tsx`).
            8.  Replace hardcoded hex colors in features/libs (`db.ts`, `AgeDistributionSlider.tsx`, etc.).
            9.  Investigate replacing custom "Feature" selection boxes (`Step2Content.tsx`) with standard components.
        *   **P3: Minor Styling & Observations (Lower Impact)**
            10. Replace arbitrary `rgba()` backgrounds with Tailwind opacity modifiers.
            11. Replace `text-[10px]` (`ProgressBar.tsx`) with standard size class.
            12. Review large arbitrary layout margins (`LayoutContent.tsx`).
            13. Review minor arbitrary spacing/padding adjustments.
            14. Review button icon margins (`mr-2`/`ml-2`) in preview.
            15. Perform visual accessibility checks (contrast, focus).
        *   *(Lowest Priority: Inline styles in `email.ts`)*

3.  **[X] Task 3.3: Create Refactoring Tickets/Issues**
    *   **Action:** Break down prioritized tasks into actionable development tickets (e.g., "Refactor `src/app/dashboard/custom-button.tsx` to use `src/components/ui/button`", "Replace hardcoded color `#FF0000` in `src/styles/legacy.css` with `var(--destructive)`").
    *   **Output:** A set of tracked issues for the refactoring work.
    *   **Ticket Drafts:**

        **Priority 1: Core Component & Styling Violations**

        *   **Ticket 1: Refactor `StyledField` Component**
            *   **Title:** Refactor `StyledField` in `Step2Content.tsx` to use standard UI components
            *   **Priority:** P1
            *   **Reference:** Task 2.1 Finding 1
            *   **File(s):** `src/components/features/campaigns/Step2Content.tsx`
            *   **Violation:** The `StyledField` component duplicates standard UI component functionality (Input, Label, Form integration) and uses non-standard styling (direct CSS variables like `text-[var(--primary-color)]`, `border-[var(--divider-color)]` instead of themed Tailwind classes), violating Component and Color SSOTs.
            *   **Goal:** Replace `StyledField` with standard `src/components/ui` components and themed styling for consistency and maintainability.
            *   **Acceptance Criteria:**
                *   Remove the `StyledField` component definition from `Step2Content.tsx`.
                *   Refactor all usages within the file to use a combination of standard components from `src/components/ui` (likely `Form`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input`, `Textarea`, `Label`, `Icon`).
                *   Ensure all styling (borders, colors, focus states, padding, icon placement) uses themed Tailwind utility classes (e.g., `border`, `ring-ring`, `focus-visible:ring-2`, `text-primary`, `text-secondary`, `text-muted-foreground`, `text-destructive` for errors via `FormMessage`) derived from `globals.css` via `tailwind.config.js`.
                *   Ensure icons within inputs are rendered using the `Icon` component and standard classes.
                *   Verify existing form functionality (including Formik integration and validation) remains unchanged.
                *   Verify visual appearance aligns with the application's design system based on standard component styles.

        *   **Ticket 2: Replace Arbitrary Text Colors in Campaign Wizard**
            *   **Title:** Replace `text-[var(--...)]` with Themed Classes in Campaign Wizard
            *   **Priority:** P1
            *   **Reference:** Task 2.5 Finding 2
            *   **File(s):** `src/components/features/campaigns/Step1Content.tsx`, `Step2Content.tsx`, `Step3Content.tsx`, `WizardNavigation.tsx`, `ProgressBar.tsx`
            *   **Violation:** Widespread use of arbitrary Tailwind text color classes like `text-[var(--primary-color)]`, `text-[var(--secondary-color)]`, `text-[var(--accent-color)]`. This bypasses the Tailwind theme configuration which maps semantic names (`primary`, `secondary`, `accent`, etc.) to these variables, violating the Color SSOT.
            *   **Goal:** Enforce consistent color usage by leveraging the Tailwind theme configuration.
            *   **Acceptance Criteria:**
                *   Search all listed files for the pattern `text-[var(--`. Identify the intended semantic color for each instance (e.g., primary text, secondary text, accent highlight).
                *   Replace each instance with the corresponding themed Tailwind class (e.g., `text-[var(--primary-color)]` likely becomes `text-primary` or `text-foreground`; `text-[var(--secondary-color)]` likely becomes `text-secondary` or `text-muted-foreground`; `text-[var(--accent-color)]` likely becomes `text-accent`). Choose the most semantically appropriate class based on context.
                *   Verify text colors render correctly according to the theme defined in `globals.css` in both light and dark modes.

        *   **Ticket 3: Replace Hardcoded Colors in Navigation**
            *   **Title:** Replace Hardcoded Hex Colors in Sidebar/Header Navigation
            *   **Priority:** P1
            *   **Reference:** Task 2.3 Finding 1 (Navigation files)
            *   **File(s):** `src/components/ui/navigation/sidebar-ui-components.tsx`, `src/components/ui/navigation/sidebar.tsx`, `src/components/ui/navigation/header.tsx`
            *   **Violation:** Navigation components use hardcoded hex color values (e.g., `#f5f5f5`, `#fafafa`, `#333333`, `#00BFFF`, `#D1D5DB`) instead of themed Tailwind classes derived from `globals.css`.
            *   **Goal:** Align navigation component styling with the application's Color SSOT.
            *   **Acceptance Criteria:**
                *   Identify all hardcoded hex values used for background, text, or border colors in the specified files.
                *   Replace them with the appropriate themed Tailwind utility classes (e.g., `bg-muted`, `bg-background`, `text-foreground`, `text-accent`, `border`, `hover:bg-muted/50`, etc.) based on semantic meaning.
                *   Verify navigation components render with the correct theme colors in both light and dark modes.

        *   **Ticket 4: Replace Inline SVGs (Icons & Spinners) with Icon Component**
            *   **Title:** Replace Inline `<svg>` Elements (Icons & Spinners) with `<Icon />` Component
            *   **Priority:** P1
            *   **Reference:** Task 2.4 Finding 1, Task LS.4 Finding 1
            *   **File(s):** `ObjectivesContent.tsx`, `AutosaveIndicator.tsx`, `ProgressBar.tsx`, `Step3Content.tsx`, various `loading/layout.tsx` files, `header.tsx`, `campaigns/page.tsx` (Full list in Task 2.4 Findings).
            *   **Violation:** Inline `<svg>` elements are used for icons (checkmark, chevron) and spinners instead of leveraging the central `<Icon />` component SSOT.
            *   **Goal:** Standardize all icon and simple spinner rendering via the `Icon` component for consistency and maintainability.
            *   **Acceptance Criteria:**
                *   For each listed file, identify the specific icon/spinner represented by the inline `<svg>` element.
                *   Find the corresponding Font Awesome Pro icon ID in the project's icon registry (e.g., `faCheckLight`, `faChevronDownLight`, `faSpinnerLight`).
                *   Replace each inline `<svg>` element with the `<Icon iconId="..." />` component, passing the correct `iconId`.
                *   Transfer necessary styling classes (e.g., `animate-spin`, size classes like `h-5 w-5`, color classes like `text-accent`) to the `Icon` component's `className` prop.
                *   Verify icons and spinners render correctly and maintain required animations.

        *   **Ticket 5: Standardize Reset Button in FilterPanel**
            *   **Title:** Replace Custom Reset Button in `FilterPanel.tsx` with Standard Button
            *   **Priority:** P1
            *   **Reference:** Task 2.1 Finding 4
            *   **File(s):** `src/components/features/campaigns/FilterPanel.tsx`
            *   **Violation:** Uses standard HTML `<button>` with custom styles (`bg-[var(--secondary-color)]`) instead of the standard `Button` component from `src/components/ui`.
            *   **Goal:** Ensure all buttons use the standard, themed `Button` component.
            *   **Acceptance Criteria:**
                *   Replace the `<button>` element with `<Button variant="secondary">Reset Filters</Button>`.
                *   Remove the custom Tailwind classes (`bg-[var(--secondary-color)]`, etc.) previously applied directly.
                *   Verify the button renders with the correct standard "secondary" variant styles and retains its `onClick` functionality.

        *   **Ticket 6: Standardize Icon Hover Toggle in Step2Content**
            *   **Title:** Replace Inline Icon Hover Toggle with `IconButtonAction`
            *   **Priority:** P1
            *   **Reference:** Task 2.1 Finding 3
            *   **File(s):** `src/components/features/campaigns/Step2Content.tsx`
            *   **Violation:** Inline conditional logic for icon hover effect (Light -> Solid) duplicates `IconButtonAction` component functionality.
            *   **Goal:** Consolidate specific interactive patterns into reusable components.
            *   **Acceptance Criteria:**
                *   Locate the button responsible for removing secondary KPIs.
                *   Replace the existing icon implementation with `<IconButtonAction iconBaseName="faTrashCan" hoverColorClass="text-destructive" ariaLabel="Remove KPI" onClick={...} />`.
                *   Ensure the correct `onClick` handler is passed to the component.
                *   Verify the button functions correctly and displays the standard Light/Solid hover effect.

        *   **Ticket 7: Fix Hardcoded Borders in Skeleton Presets**
            *   **Title:** Replace Hardcoded Borders in Dashboard/Wizard Skeletons
            *   **Priority:** P1
            *   **Reference:** Task LS.2 Finding 2
            *   **File(s):** `src/components/ui/loading-skeleton.tsx`
            *   **Violation:** The `DashboardSkeleton` and `WizardSkeleton` components use hardcoded gray border classes (`border-gray-200 dark:border-gray-700`, `border-input`) instead of the themed `border` class.
            *   **Goal:** Ensure skeleton components align with the application's border color SSOT.
            *   **Acceptance Criteria:**
                *   Search within the `DashboardSkeleton` and `WizardSkeleton` component definitions for hardcoded border classes (`border-gray-*`, `dark:border-gray-*`, `border-input`).
                *   Replace these with the standard `border` utility class (which maps to `hsl(var(--border))`).
                *   Verify the skeletons render with the correct themed border color in both light and dark modes where they are used.

        **Priority 2: Other Hardcoded Colors & Potential Component Issues**

        *   **Ticket 8: Refactor Hardcoded Colors in Chart Components**
            *   **Title:** Replace Hardcoded Colors in UI Chart Components
            *   **Priority:** P2
            *   **Reference:** Task 2.3 Finding 1 (Chart files)
            *   **File(s):** `src/components/ui/chart-*.tsx` (bar, area, line, radar, scatter)
            *   **Violation:** Chart components contain hardcoded hex/rgba values for default color arrays, grid lines, borders, fills, and strokes, violating the Color SSOT. (`chart-pie` appears mostly compliant).
            *   **Goal:** Align chart visual styling with the application's theme colors.
            *   **Acceptance Criteria:**
                *   Review each specified chart component.
                *   Replace hardcoded hex values for static elements (grid lines, borders - e.g., `#E2E8F0`, `#E5E7EB`) with the themed `border` class or `hsl(var(--border))` where appropriate.
                *   Refactor default color arrays (`DEFAULT_COLORS`) to reference themed colors via CSS variables (e.g., `hsl(var(--accent))`, `hsl(var(--interactive))`, `hsl(var(--primary))`, `hsl(var(--secondary))`). Ensure a sufficient palette of distinct theme colors exists or add semantic variations if needed (e.g., `--chart-color-1`, `--chart-color-2`, etc.) to `globals.css` and `tailwind.config.js`.
                *   Replace hardcoded `rgba` fills/strokes where possible by referencing themed colors and using opacity (e.g., if base color uses `hsl(var(--accent))`, try applying opacity via chart library props if possible, or fall back to `rgba(hsl(var(--accent)), 0.2)` if necessary).
                *   Verify charts still render correctly and legibly with themed colors.

        *   **Ticket 9: Replace Hardcoded Colors in Features/Libs**
            *   **Title:** Replace Hardcoded Hex Colors in Feature Components & Libs
            *   **Priority:** P2
            *   **Reference:** Task 2.3 Finding 1
            *   **File(s):** `src/lib/db.ts`, `src/components/features/campaigns/AgeDistributionSlider.tsx`, `src/components/features/dashboard/BrandLiftCharts.tsx`, `src/components/features/campaigns/CampaignAssetUploader.tsx`, `src/components/features/campaigns/BasicInfo.tsx`.
            *   **Violation:** These files contain various hardcoded hex colors used for specific UI elements (slider parts, focus rings, hover effects, chart elements) instead of themed Tailwind classes or CSS variables.
            *   **Goal:** Ensure all UI elements adhere to the Color SSOT.
            *   **Acceptance Criteria:**
                *   Locate the hardcoded hex values in each specified file.
                *   Replace them with the appropriate themed Tailwind classes (`focus:ring-ring`, `hover:bg-accent/90`, etc.) or direct CSS variable references (`hsl(var(--accent))`) if Tailwind classes are insufficient (e.g., for slider track color).
                *   Verify the elements render correctly with themed colors.

        *   **Ticket 10: Investigate "Feature" Selection Box Replacement**
            *   **Title:** Investigate Replacing Custom "Feature" Selection Boxes
            *   **Priority:** P2
            *   **Reference:** Task 2.1 Finding 2
            *   **File(s):** `src/components/features/campaigns/Step2Content.tsx`
            *   **Violation:** The component uses custom styled `div`s with click handlers for selecting "Features", potentially duplicating standard component functionality and introducing accessibility issues.
            *   **Goal:** Utilize standard components for better consistency, maintainability, and accessibility where possible.
            *   **Acceptance Criteria:**
                *   Analyze the required multi-select functionality and visual design of the feature selection section.
                *   Determine if standard `Checkbox`/`Toggle` components from `src/components/ui` are feasible replacements.
                *   If yes, refactor. If no, document justification.

        *   **Ticket 11 (New): Implement Campaign Wizard Autosave**
            *   **Title:** Implement Autosave Functionality in Campaign Wizard
            *   **Priority:** P2 (New Task)
            *   **File(s):** Primarily within `WizardProvider` (`WizardContext.tsx`) and individual step components (`Step*.tsx`).
            *   **Description:** To improve user experience and prevent data loss, an autosave mechanism should be implemented for the campaign wizard. Changes should be saved automatically in the background after a short delay following user input, in addition to the manual "Save Draft" button.
            *   **Goal:** Automatically save draft progress as the user fills out the wizard forms.
            *   **Acceptance Criteria:**
                *   Modify `WizardProvider` or relevant context to include autosave logic (e.g., using `useEffect` with debouncing on form data changes).
                *   Trigger the existing `handleSaveDraft` function (or a similar background save mechanism) automatically after a defined debounce period (e.g., 2-3 seconds) when form values change (`isDirty` state can be useful here).
                *   Ensure autosave only triggers if there are actual changes (`isDirty`).
                *   Provide subtle visual feedback during/after autosave (e.g., updating the "Last saved" time in `ProgressBar` more frequently, potentially a brief "Saving..." indicator).
                *   Ensure autosave does not interfere with manual saving or final submission.
                *   Test thoroughly across different input types and steps.

        **Priority 3: Minor Styling & Observations**

        *   **Ticket 12 (was 11):** (Replace Arbitrary `rgba()` Backgrounds) - *Renumbered*
        *   **Ticket 13 (was 12):** (Fix Arbitrary Text Size) - *Renumbered*
        *   **Ticket 14 (was 13):** (Review Arbitrary Layout Margins) - *Renumbered*
        *   **Ticket 15 (was 14):** (Review Minor Arbitrary Spacing) - *Renumbered*
        *   **Ticket 16 (was 15):** (Review Button Icon Margins) - *Renumbered*
        *   **Ticket 17 (was 16):** (Review Spinner vs. Skeleton Usage) - *Renumbered*
        *   **Ticket 18 (was 17):** (Perform Visual Accessibility Checks) - *Renumbered*

---

## Phase 4: Loading State Audit (Restored & Detailed)

**Goal:** Ensure consistent and appropriate use of loading indicators (Skeletons vs. Spinners) across the application, adhering to SSOT.

**Tasks:**

1.  **[X] Task LS.1: Review `Skeleton` Base Component (`src/components/ui/skeleton.tsx`)**
    *   **Action:** Code reviewed.
    *   **Check:** Verify usage of themed colors (`bg-muted`) and standard Tailwind classes.
    *   **SSOT:** `globals.css` colors, Tailwind theme.
    *   **Findings:** **Compliant.** Uses themed `bg-muted` and standard Tailwind animation (`animate-pulse`, `rounded-md`).

2.  **[X] Task LS.2: Review `LoadingSkeleton` Presets (`src/components/ui/loading-skeleton.tsx`)**
    *   **Action:** Code reviewed.
    *   **Check:** Verify composition of base `Skeleton`, use of standard Tailwind classes, and handling of props. Check for hardcoded styles.
    *   **SSOT:** Base `Skeleton` component, layout best practices, `globals.css` colors, Tailwind theme.
    *   **Findings:**
        *   `LoadingSkeleton` & `TableSkeleton`: **Compliant.** Correctly compose base `Skeleton` and use standard Tailwind classes/scales.
        *   `DashboardSkeleton` & `WizardSkeleton`: **Violation.** Use hardcoded borders (`border-gray-200 dark:border-gray-700`, `border-input`) instead of the themed `border` class. Needs refactoring (See Ticket 7).

3.  **[X] Task LS.3: Audit Codebase for Skeleton Usage**
    *   **Action:** Searched codebase for imports and usage of `Skeleton`, `LoadingSkeleton`, `TableSkeleton`, `DashboardSkeleton`, `WizardSkeleton`.
    *   **Check:** Identify where and how skeletons are used, especially for page/large component loads.
    *   **SSOT:** Consistent application UX patterns.
    *   **Findings:** **Generally Compliant.** Skeletons (`DashboardSkeleton`, `WizardSkeleton`, `TableSkeleton`) are appropriately used for page-level and large component loading states (e.g., `/dashboard/loading.tsx`, wizard steps, campaign table), promoting good perceived performance.

4.  **[X] Task LS.4: Audit Codebase for Spinners / Other Loaders**
    *   **Action:** Searched codebase for inline SVG spinners, `animate-spin` on non-icon elements, imports/usage of `LoadingSpinner`.
    *   **Check:** Identify instances where spinners are used, especially where skeletons might be more appropriate (page loads).
    *   **SSOT:** Consistent application UX patterns, preference for skeletons over spinners for structural loading.
    *   **Findings:**
        *   **Violation:** Inline `<svg>` spinners or `animate-spin` on `div`s used instead of standard `<Icon iconId="faSpinner..." />` or `<LoadingSpinner />` component in multiple files (Task 2.4 violation, requires fix via Ticket 4).
        *   **Potential Improvement:** Review `LoadingSpinner` usage for initial page load (`client-layout.tsx`) and potentially large sections (`GraphitiDashboard.tsx`); consider replacing with Skeleton components for better perceived performance (See Ticket 16).
        *   **Observation:** Spinners/Icons (`LoadingSpinner`, `<Icon iconId="faSpinner..."/>`, `<Icon iconId="faCircleNotchLight"/>`) are appropriately used for localized loading states (buttons, autosave, validation, search, small previews).

---

**Audit Status:** COMPLETE

**(Update status as phases progress: PENDING -> IN PROGRESS -> PHASE 1 COMPLETE -> PHASE 2 COMPLETE -> COMPLETE)**



My apologies! You are absolutely right. We need to solidify the *how* before jumping into the *what*. Thank you for clarifying. Let's focus on the research and planning stage, specifically how to conduct this audit efficiently and successfully.

**Audit Methodology & Efficiency Plan:**

The goal is a comprehensive audit without unnecessary manual effort. We can achieve this with a hybrid approach combining targeted manual inspection and automated codebase scanning.

1.  **Phase 1 (Button Audit - Primarily Manual):**
    *   **Why Manual?** This phase focuses on a single, core component (`button.tsx`). The checks involve understanding the component's logic (CVA variants), visual comparison (colors, icon spacing - potentially via the `/debug-tools/ui-components/preview/Button` page), and accessibility inspection (dev tools). These are nuanced tasks best done manually for this specific component to ensure deep understanding and perfection.
    *   **Efficiency:** It's efficient because the scope is small and well-defined. It allows us to perfect the understanding of the SSOT application before scaling.

2.  **Phase 2 (Full Codebase Audit - Automated Scanning + Manual Verification):**
    *   **Why Automated Scanning?** Searching the entire codebase for specific patterns (rogue components, hardcoded colors/styles, incorrect icon usage) manually is extremely time-consuming and error-prone.
    *   **How?** We can leverage:
        *   **Code Search Tools (like `grep`):** Use precise search patterns (regex) to find potential violations across all relevant file types (`.tsx`, `.css`, `.scss`, `.ts`). This is highly efficient for finding:
            *   Component definitions outside `src/components/ui` (Task 2.1).
            *   Hex codes (`#...`), `rgb`/`rgba` values (Task 2.3).
            *   Specific non-standard Tailwind classes (Task 2.3, 2.5, 2.6 - requires knowing the theme classes).
            *   Inline style attributes (`style=`) (Task 2.3, 2.5, 2.6).
            *   `<svg>` tags, `<img>` tags used for icons, imports from non-standard icon libraries (Task 2.4).
        *   **(Optional) Custom Scripts:** For more complex logic (e.g., cross-referencing Tailwind classes against the actual config, basic AST parsing), a dedicated Node.js script could be written. However, `grep` likely covers 80-90% of the pattern finding efficiently.
        *   **(Optional) Linters (ESLint):** If not already configured, ESLint rules could potentially be added to *prevent* future issues (e.g., `no-restricted-syntax` to ban hex codes), but setting this up might be beyond the scope of the *audit* itself.
    *   **Manual Verification:** The automated scans will produce a list of *potential* violations. A manual review of these findings is crucial to confirm they are actual deviations from the SSOT and not false positives. This review step is essential for accuracy.
    *   **Efficiency:** This approach leverages automation for the heavy lifting (searching) and reserves manual effort for verification and analysis, striking a balance between speed and accuracy.

**Refining `ui-audit.md` Methodology Section:**

I propose we update the "Methodology" section in `ui-audit.md` to explicitly state this hybrid approach:

```markdown
**Methodology:** Conduct a phased audit. Phase 1 involves manual inspection of the core `Button` component. Phase 2 utilizes automated codebase searches (e.g., using `grep` or similar tools) to efficiently identify potential deviations across the entire project, followed by manual verification of findings. All confirmed findings will be documented in this file *before* initiating code changes. Each task should result in a list of verified findings or a confirmation of compliance.
```

**Summary of Efficient & Successful Approach:**

1.  **Clear SSOT:** Define the sources of truth upfront (Done in `ui-audit.md`).

Update /docs with details of the audit plan and findings.


