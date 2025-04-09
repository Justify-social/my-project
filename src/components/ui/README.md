# UI Components

This directory contains reusable UI components for the application.

## Overview

*   **Foundation:** Primarily based on the [Shadcn UI](https://ui.shadcn.com/) library, utilizing Radix UI primitives for accessibility and Tailwind CSS for styling.
*   **Goal:** Adhere to Single Source of Truth (SSOT) principles, leveraging Shadcn components and Tailwind utilities wherever possible.
*   **Contents:** Includes both standard Shadcn components (like `Button`, `Input`, `Card`) and custom application-specific components built using Shadcn primitives (e.g., `KpiCard`, `MetricsComparison`, `SearchBar`, various `Chart-*` components).

## Documentation

Refer to individual component files for detailed JSDoc documentation (`@component`, `@category`, `@subcategory`, `@description`, `@param`, `@returns`).

## Exports

Standard Shadcn components are generally re-exported using wildcard (`export * from ...`). Custom components have been updated to use explicit named exports (`export { ComponentName } from ...`) for clarity and consistency. See `index.ts` for the full list of exported components.