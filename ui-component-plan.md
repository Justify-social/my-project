# UI Component Browser Plan (SSOT via JSDoc)

## 1. Goal

Create a UI Component Browser available at `/debug-tools/ui-components`. This tool will automatically discover UI components located within `src/components/ui`, parse metadata directly from their JSDoc comments, and display them in an organized manner. Each component will have its own dedicated preview page with breadcrumbs, detailed information, code examples, and a live render attempt.

## 2. Guiding Principles

*   **Single Source of Truth (SSOT):** JSDoc comments within each component's `.tsx` file are the *only* source for metadata (name, category, description, examples, status, etc.). No separate registration files or manual lists.
*   **Simplicity:** Minimize new files and complex configurations. Leverage existing file structure and code where possible.
*   **Automation:** Component discovery and metadata extraction should be fully automatic.
*   **Developer Experience:** Provide clear categorization, easy navigation, visible code examples, and a live preview to help developers understand and use components effectively.

## 3. Implementation Steps

### Step 3.1: Refine and Fix Component Discovery (`discovery.ts`)

*   **Location:** `src/app/(admin)/debug-tools/ui-components/utils/discovery.ts`
*   **Task:** Correct the existing utility to reliably find component files and parse JSDoc metadata.
    *   **Fix JSDoc Regex:** Update the regular expression used in `extractComponentMetadata` to correctly capture the entire JSDoc block (e.g., `/^\s*\/\*\*[\s\S]*?\*\//m`). Address the parsing errors reported by the linter.
    *   **Fix Type Errors:** Resolve type mismatches between extracted JSDoc tag values (strings) and the expected enum/literal types defined in `ComponentMetadata` (imported from `@/components/ui/utils/classify`). This might involve:
        *   Adjusting the `ComponentMetadata` type definition itself.
        *   Adding type guards or validation within `extractComponentMetadata` to ensure parsed values conform to the expected types (e.g., mapping `'atom'` string to the `'atom'` literal type).
    *   **Fix Structural Errors:** Correct the missing `return` statement and the extra closing brace (`}`) identified by the linter in `getComponentsByCategory`. Remove the duplicated code block within this function.
    *   **Validate File Discovery:** Ensure `findComponentFiles` correctly identifies component `.tsx` files and excludes non-component files (like `index.ts`, utils, types, stories). The heuristic check (`/^[A-Z]/.test(...)`) is reasonable but ensure it covers all intended components.
    *   **Error Handling:** Enhance error handling during file reading, parsing, and stat checks to provide clearer warnings without crashing the discovery process.

### Step 3.2: Create Main Browser Page (`page.tsx`)

*   **Location:** `src/app/(admin)/debug-tools/ui-components/page.tsx`
*   **Type:** Server Component.
*   **Task:**
    *   Import and use `getComponentRegistry` from the corrected `discovery.ts`.
    *   Fetch the full list of component metadata (`registry.components`).
    *   Pass the fetched `components` array as a prop to the `ComponentBrowser` client component.
    *   Include basic page structure (heading).

### Step 3.3: Create Component Browser UI (`ComponentBrowser.tsx`)

*   **Location:** `src/app/(admin)/debug-tools/ui-components/ComponentBrowser.tsx`
*   **Type:** Client Component (`'use client'`).
*   **Task:**
    *   Receive the `components: ExtendedComponentMetadata[]` prop.
    *   Implement state for potential filtering or search later (optional initially).
    *   Group the received components by `category` (and potentially `subcategory` if present).
    *   Render UI elements (e.g., Tabs from Headless UI or a similar library) to allow users to select a category.
    *   Within each category tab/section, render a list or grid of "Component Cards".
    *   Each Component Card should display:
        *   Component Name (`metadata.name`)
        *   Description (`metadata.description`)
        *   Status (`metadata.status`) - visually distinct (e.g., badges).
        *   A link (`next/link`) pointing to the dedicated preview page: `/debug-tools/ui-components/[componentName]`.

### Step 3.4: Create Dynamic Component Preview Page (`[componentName]/page.tsx`)

*   **Location:** `src/app/(admin)/debug-tools/ui-components/[componentName]/page.tsx`
*   **Type:** Server Component.
*   **Task:**
    *   Access the `componentName` from `params`.
    *   Use `getComponentRegistry` and filter/find to get the specific `ComponentMetadata` for the requested `componentName`. Handle the case where the component isn't found.
    *   Construct and display breadcrumbs (e.g., "Debug Tools > UI Components > [Category] > [ComponentName]").
    *   Display detailed metadata fields (Description, Status, Author, Since, Category, Subcategory).
    *   Display extracted `@example` code snippets in `<pre>` blocks for easy copying.
    *   Pass the component's `filePath` (relative path from metadata) to the `ComponentPreviewRenderer` client component.

### Step 3.5: Create Live Preview Renderer (`ComponentPreviewRenderer.tsx`)

*   **Location:** `src/app/(admin)/debug-tools/ui-components/[componentName]/ComponentPreviewRenderer.tsx` (or similar location)
*   **Type:** Client Component (`'use client'`).
*   **Task:**
    *   Receive the `filePath` prop.
    *   Use `next/dynamic` to dynamically import the React component from the provided `filePath`. Ensure the import path is correctly resolved (likely needs to be relative to the project root or use aliases if configured).
    *   Provide a `loading` state fallback for the dynamic import.
    *   Render the dynamically imported component.
        *   **Initial Render:** Render the component without any props initially.
        *   **Error Handling:** Wrap the rendering in a simple React Error Boundary or try/catch within the component to catch rendering errors from the dynamically loaded component and display a user-friendly message (e.g., "Failed to render preview").
    *   *(Future Enhancement):* Add logic to parse props from `@example` blocks and render the examples dynamically, but this is complex and deferred for simplicity.

## 4. Dependencies & Considerations

*   **JSDoc Consistency:** The success relies heavily on consistent and accurate JSDoc comments in all `src/components/ui` files. A linting rule could enforce this.
*   **Dynamic Import Paths:** Ensure `next/dynamic` can correctly resolve the relative `filePath` stored in the metadata. Aliases (`@/`) might need to be handled or paths adjusted.
*   **Client Components:** Dynamically imported components marked with `'use client'` should render correctly within the `ComponentPreviewRenderer` client boundary.
*   **Component Dependencies:** Components might require specific context providers or props to render correctly. The initial preview might be basic or fail for complex components. This is acceptable for V1; wrappers or example parsing are V2+.
*   **Styling:** Ensure Tailwind/global styles apply correctly to the previewed components.

This plan prioritizes using the code itself as the documentation source, minimizing maintenance overhead and keeping information synchronized.
