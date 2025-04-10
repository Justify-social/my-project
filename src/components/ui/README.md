# UI Components (`src/components/ui`)

This directory contains the core reusable UI components for the application.

## Overview

*   **Foundation:** Primarily based on the [Shadcn UI](https://ui.shadcn.com/) methodology, utilizing Radix UI primitives for accessibility and Tailwind CSS for styling.
*   **Atomic Design (loosely):** Components are categorized internally using JSDoc (`@category atom | molecule | organism`) to aid understanding.
*   **Goal:** Maintain consistency, reusability, and adhere to the project's design system (fonts, colors, icons).
*   **Contents:** Includes standard Shadcn components (like `Button`, `Input`, `Card`, `Table`) and custom application-specific components often built using Shadcn primitives (e.g., `KpiCard`, `MetricsComparison`, `SearchBar`, various `Chart-*` components, `navigation/*`).

## Documentation

*   **Detailed Guide:** See `/docs/components/ui/README.md` for a comprehensive guide on principles, styling, icons, and usage.
*   **Component JSDoc:** Refer to individual component files (`.tsx`) for specific JSDoc documentation (`@component`, `@category`, `@description`, `@param`, `@returns`).
*   **UI Browser:** Use the interactive UI Browser at `/debug-tools/ui-components` (local dev) to see components in action with examples.
    *   Preview pages in `/src/app/(admin)/debug-tools/ui-components/preview/` are manually maintained to show these examples.

## Exports

Components are exported via the `