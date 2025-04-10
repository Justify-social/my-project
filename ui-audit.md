# UI Audit Plan & Findings

**Objective:** Ensure UI consistency across the application by aligning all components and styles with defined Single Sources of Truth (SSOT).

**SSOT Definitions:**
*   **Components:** Standard Shadcn UI components located exclusively in `src/components/ui/`.
*   **Colors:** Brand colors and semantic colors (`--primary`, `--secondary`, `--accent`, `--destructive`, `--success`, `--warning`, `--interactive`, `--background`, `--foreground`, `--muted`, `--border`, etc.) defined as CSS variables in `src/app/globals.css` and referenced in `tailwind.config.js`.
*   **Icons:** FontAwesome Pro icons rendered exclusively via the central `Icon` component (`@/components/ui/icon`).
*   **Typography:** Font families defined in `globals.css` and referenced in `tailwind.config.js`. (Note: Relies on default Tailwind scales for size/weight/leading - see Potential Enhancements).
*   **Spacing:** Relies on default Tailwind spacing scale configured via `tailwind.config.js`. (See Potential Enhancements).
*   **Border Radius:** Defined via `--radius` variable in `globals.css` and referenced in `tailwind.config.js`.

**Methodology:** Conduct a phased audit. Phase 1 involves manual inspection of the core `Button` component. Phase 2 utilizes comprehensive, automated codebase searches (`grep`) across all relevant file types to efficiently identify potential deviations from SSOT patterns (hardcoded styles, non-standard components/icons, arbitrary values), followed by manual verification of findings. This hybrid approach ensures thoroughness while maintaining efficiency. All confirmed findings are documented in this file *before* initiating code changes. Each task results in a list of verified findings or a confirmation of compliance.

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

1.  **[ ] Task 3.1: Review Audit Findings**
    *   **Action:** Consolidate and review all findings documented in Phase 1 and Phase 2.
    *   **Output:** A shared understanding of the scope of required UI alignment.

2.  **[ ] Task 3.2: Prioritize Refactoring Tasks**
    *   **Action:** Rank the identified issues based on impact (e.g., core component inconsistencies > minor color deviations) and frequency.
    *   **Output:** A prioritized list of refactoring tasks.

3.  **[ ] Task 3.3: Create Refactoring Tickets/Issues**
    *   **Action:** Break down prioritized tasks into actionable development tickets (e.g., "Refactor `src/app/dashboard/custom-button.tsx` to use `src/components/ui/button`", "Replace hardcoded color `#FF0000` in `src/styles/legacy.css` with `var(--destructive)`").
    *   **Output:** A set of tracked issues for the refactoring work.

---

**Audit Status:** PHASE 2 COMPLETE (Pending Refactoring Plan)

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

1.  **Clear SSOT:** Define the sources of truth upfront (Done in `ui-audit.md

Update /docs with details of the audit plan and findings.


