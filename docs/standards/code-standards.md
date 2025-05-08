# Code Standards

**Last Reviewed:** 2025-05-09

This document outlines the high-level coding standards and principles for the Justify project. These standards aim to promote code clarity, consistency, maintainability, and quality across the codebase. Specific tool configurations (ESLint, Prettier) are detailed in the **[Linting & Formatting](./linting-formatting.md)** standard.

## Core Principles

- **Readability:** Code should be easy to read and understand. Prioritize clarity over brevity or overly clever solutions.
- **Consistency:** Follow established patterns and conventions used throughout the codebase.
- **Simplicity (KISS):** Keep solutions as simple as possible. Avoid unnecessary complexity.
- **Maintainability:** Write code that is easy to modify, debug, and extend in the future.
- **Single Responsibility Principle (SRP):** Components, functions, and modules should ideally have one primary reason to change.
- **Don't Repeat Yourself (DRY):** Avoid duplicating code logic. Extract reusable logic into functions, hooks, or components.
- **Single Source of Truth (SSOT):** Core logic, types, configurations, and documentation should reside in canonical locations.

## General Guidelines

- **Comments:** Add comments to explain _why_ code is written a certain way, especially for complex logic, workarounds, or non-obvious decisions. Avoid commenting on _what_ the code does if it's clear from the code itself.
- **Error Handling:** Implement robust error handling, especially around API calls, database operations, and external service integrations. Use `try...catch` blocks appropriately and provide meaningful error messages/logging.
- **Performance:** Be mindful of performance implications. Optimize critical code paths, but avoid premature optimization. Use tools like bundle analyzers and profilers when necessary (See **[Performance Strategies](../architecture/performance.md)**).
- **Security:** Follow secure coding practices (See **[Security Standards](./security.md)**).
- **Accessibility:** Ensure UI components and features are accessible (See **[Accessibility Standards](./accessibility.md)**).

## TypeScript Best Practices

- **Enable `strict` mode:** Ensure `tsconfig.json` has `strict: true` enabled.
- **Avoid `any`:** Use `any` sparingly. Prefer specific types, `unknown` (with type checks), or generics.
- **Type Inference:** Leverage TypeScript's type inference where possible, but provide explicit types for function signatures, complex variables, and object properties for clarity and safety.
- **Interfaces vs. Types:** Use interfaces (`interface`) for defining the shape of objects and component props. Use type aliases (`type`) for defining unions, intersections, primitives, or more complex types.
- **Utility Types:** Utilize built-in utility types like `Partial`, `Required`, `Omit`, `Pick`, `Record` where appropriate.
- **Readonly:** Use the `readonly` modifier for properties or arrays that should not be mutated.
- **Enums:** Use TypeScript enums for sets of named constants (e.g., statuses, roles), especially when synchronized with Prisma enums.

## React & Next.js Guidelines

- **Functional Components & Hooks:** Use functional components and hooks exclusively.
- **Rules of Hooks:** Strictly adhere to the Rules of Hooks.
- **Component Structure:** Keep components focused and ideally small. Aim for components under ~300 lines where practical.
- **Props:** Define explicit `Props` interfaces for components. Avoid overly complex prop drilling; consider component composition or state management solutions (Context, Zustand).
- **State Management:** Follow the established **[State Management Strategy](../architecture/state-management.md)** (TanStack Query for server state, Zustand for global client state, local `useState` for component state).
- **Custom Hooks:** Extract reusable stateful logic or side effects into custom hooks (`src/hooks/`).
- **Conditional Rendering:** Use clear and concise conditional rendering (e.g., ternary operators, logical AND `&&`, or early returns).
- **Lists & Keys:** Always provide a stable, unique `key` prop when rendering lists of elements.
- **Server vs. Client Components (App Router):** Understand the distinction and use `'use client'` directive only when necessary (for interactivity, hooks like `useState`/`useEffect`, browser APIs).
- **Data Fetching (App Router):** Prefer fetching data in Server Components where possible. Use TanStack Query (`useQuery`) within Client Components for client-side fetching and caching.
- **Dynamic Imports (`next/dynamic`):** Use for lazy-loading components or heavy libraries to improve initial load performance.

## CSS/Styling (Tailwind CSS)

- **Utility-First:** Embrace the utility-first approach provided by Tailwind CSS.
- **Configuration as SSOT:** Use `tailwind.config.js` (or the centralized version in `/config/tailwind/`) for theme customization (colors, spacing, fonts). Avoid arbitrary values in class names.
- **Readability:** Group related utility classes together in `className` strings for better readability.
- **Component Abstraction:** For complex or frequently reused class combinations, encapsulate them within a React component rather than using `@apply` excessively.
- **Conditional Classes:** Use libraries like `clsx` or `tailwind-merge` for cleanly applying conditional classes.

These standards provide a baseline. Refer to specific standards documents (Naming, Linting, Testing, etc.) for more detailed rules.
