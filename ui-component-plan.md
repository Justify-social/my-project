# UI Component Browser Plan (Two-Script Build-Time Generation: JSON Registry + Static Previews)

## 1. Goal

Create a UI Component Browser available at `/debug-tools/ui-components`. This tool will:
1.  Use a **build script** to parse JSDoc comments from `src/components/ui` and generate a static **`component-registry.json`** file.
2.  Use a **second build script** to read the generated JSON registry and automatically create **static preview pages** (e.g., `/debug-tools/ui-components/preview/button/page.tsx`) for each component.
3.  The main browser page will list components based on the static JSON data.
4.  Each static preview page will directly import and render its corresponding component, guaranteeing runtime rendering stability.

## 2. Guiding Principles

*   **Runtime Rendering Guarantee (Highest Priority):** Individual component previews are guaranteed to render via direct imports within their statically generated pages, eliminating runtime dynamic loading issues.
*   **Automation (Build-Time):** Component discovery, metadata extraction, *and* preview page file generation are automated via build scripts.
*   **SSOT Link (Build-Time):** JSDoc comments drive the generation of the JSON registry, which in turn drives the generation of the preview pages.
*   **Runtime Simplicity:** The live application interacts only with static JSON data (for listing) and statically generated pages (for previews), removing runtime dependencies on file system access or complex server/client boundary interactions during rendering.
*   **Trade-off:** Requires running the build scripts (`npm run build`) to see *any* updates (metadata changes, new components, preview page structure changes).

## 3. Implementation Steps

### Step 3.1: Refine Discovery Utility (`discovery.ts`)

*   **Location:** `src/app/(admin)/debug-tools/ui-components/utils/discovery.ts`
*   **Status:** **DONE** (Functionality confirmed).
*   **Task:** Ensure utility functions (`findComponentFiles`, `extractComponentMetadata`, `buildComponentRegistry`) correctly parse JSDoc and produce the full registry object needed for JSON generation.
*   **Outcome:** A utility module usable by the build scripts.

### Step 3.2: Create Script 1 - Generate JSON Registry (`scripts/build-component-registry.ts`)

*   **Location:** `scripts/build-component-registry.ts` 
*   **Status:** **DONE** (Script simplified to call `buildComponentRegistry` which includes filtering).
*   **Task:** Use `discovery.ts` functions to build the filtered registry object and write it to `public/static/component-registry.json`.
*   **Outcome:** A runnable script (`tsx scripts/build-component-registry.ts`) that generates the static, filtered JSON data source.

### Step 3.3: Create Script 2 - Generate Static Preview Pages (`scripts/generate-preview-pages.ts`)

*   **Location:** `scripts/generate-preview-pages.ts`
*   **Status:** **NEEDS REVISION**.
*   **Task:**
    *   Import `fs`, `path`.
    *   Read and parse `public/static/component-registry.json`.
    *   Define a template string or function (`generatePageContent`) that generates the content for a preview `page.tsx` file.
        *   **FIX:** Remove generic imports (like `import { Badge } ...`) from the template, rely only on the specific component import.
        *   **FIX:** Handle component names with hyphens. Convert them to a valid alias (e.g., PascalCase) when generating the `import { original-name as AliasName } ...` statement and use the alias for rendering (`<AliasName />`).
    *   Iterate through each component in the JSON registry.
    *   For each component:
        *   Determine the output directory (e.g., `src/app/(admin)/debug-tools/ui-components/preview/[ComponentName]/`). Ensure directory name is valid (handle potential name conflicts/invalid characters if necessary).
        *   Ensure the directory exists (`fs.mkdirSync(..., { recursive: true })`).
        *   Generate the `page.tsx` content using the template, injecting:
            *   The correct relative import path and alias handling.
            *   Component metadata.
            *   Placeholders for hardcoded rendering examples.
            *   Code snippets from JSDoc examples.
            *   Breadcrumb structure.
        *   Write the generated content to `page.tsx` within the component's directory.
*   **Outcome:** A runnable script (`tsx scripts/generate-preview-pages.ts`) that correctly creates/updates the static preview pages, handling different component name formats.

### Step 3.4: Integrate Build Scripts into `package.json`

*   **Location:** `package.json`
*   **Status:** **PENDING (Manual User Task)**.
*   **Task:** Add script commands for both generation steps and ensure they run sequentially in the main `"build"` script.
    ```json
    "scripts": {
      "registry:build": "tsx scripts/build-component-registry.ts",
      "previews:build": "tsx scripts/generate-preview-pages.ts",
      "build": "npm run registry:build && npm run previews:build && next build"
      // ... (or yarn/pnpm equivalents)
    },
    ```
*   **Outcome:** Both JSON registry and static preview pages are generated automatically during project builds.

### Step 3.5: Refactor Main Browser Page (`page.tsx`)

*   **Location:** `src/app/(admin)/debug-tools/ui-components/page.tsx`
*   **Status:** **DONE** (Fetching static JSON, link case sensitivity fixed).
*   **Task:**
    *   **Data Source:** Read `public/static/component-registry.json` (Done via `fetch` in `useEffect`).
    *   Use component list from JSON data to render cards (Done).
    *   Ensure `Link` components point to generated static preview paths using correct casing (Done).
*   **Outcome:** The main browser page displays components based on the static JSON registry and links correctly.

### Step 3.6: (Optional/Alternative) Simplify API Route (`route.ts`)

*   **Location:** `src/app/api/debug-tools/ui-components/route.ts`
*   **Status:** **N/A** (Main page fetches static JSON directly, API route can be removed in cleanup).
*   **Task:** Modify the route to simply read and return `public/static/component-registry.json`.
*   **Outcome:** A minimal API route serving static JSON.

### Step 3.7: Cleanup Unused Files/Code

*   **Status:** **PARTIALLY DONE**.
*   **Task:** Once the generated static pages are working, safely remove:
    *   The dynamic preview route folder: `src/app/(admin)/debug-tools/ui-components/preview/[componentName]` (Done).
    *   `src/app/(admin)/debug-tools/ui-components/preview/ComponentPreviewRenderer.tsx` (Done - did not exist or deleted).
    *   `src/app/api/debug-tools/ui-components/route.ts` (Pending - can be deleted).
    *   Potentially parts of `discovery.ts` not needed by `build-component-registry.ts` (Pending Review).
    *   The manual list file `src/lib/manual-component-list.ts` (Done - was never used in this plan).
*   **Outcome:** A cleaner codebase focused on the build-time generation approach.

## 4. Workflow Summary (Accurate)

1.  Add/update a component in `src/components/ui/` with correct JSDoc.
2.  Run `npm run build` (or the specific generation scripts).
3.  The `component-registry.json` is updated.
4.  The static preview pages (`preview/[componentName]/page.tsx`) are automatically created/updated by the second script.
    *   **Manual Step:** Edit the generated preview page to add/update rendering examples.
    *   **Manual Step:** If component exports are non-standard (e.g., multiple named exports like `ResizablePanel`), manually adjust the `import` statement in the generated page.
5.  The live application reflects the changes after the build.

This plan provides the highest runtime rendering guarantee by generating static preview pages, while retaining automation based on JSDoc via build scripts.
