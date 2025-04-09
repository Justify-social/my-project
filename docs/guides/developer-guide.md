# Developer Guide

This guide provides essential information, standards, and processes for developers working on the Justify project.

## Getting Started

If you are new to the project, please refer to the main **[Getting Started Guide](../getting-started/README.md)** for initial setup and project overview.

## Core Principles & Architecture

*   **Directory Structure:** Understand how the codebase is organised by reviewing the **[Directory Structure documentation](../architecture/directory-structure.md)**.
*   **Architecture Overview:** For a high-level understanding of the system design, see the **[Architecture README](../architecture/README.md)**.
*   **SSOT:** We strive for a Single Source of Truth. Core logic, types, configurations, and documentation should reside in canonical locations.

## Coding Standards

Consistency and clarity are key. Please adhere to the following standards.

### Naming Conventions

*   **General:** Use descriptive names. Avoid unclear abbreviations.
*   **Files/Directories:** Use `kebab-case` (e.g., `user-profile.tsx`, `api-client/`).
*   **React Components:** Use `PascalCase` for component names and filenames (e.g., `UserProfile.tsx`).
*   **Variables/Functions:** Use `camelCase` (e.g., `userName`, `fetchData`).
*   **Booleans:** Prefix with `is`, `has`, `should` (e.g., `isLoading`).
*   **Event Handlers:** Prefix with `handle` or `on` (e.g., `handleSubmit`).
*   **Constants:** Use `UPPER_SNAKE_CASE` (e.g., `MAX_ITEMS`).
*   **Types/Interfaces:** Use `PascalCase` (e.g., `UserProfile`). Suffix props types with `Props` (e.g., `ButtonProps`). Do not use an `I` prefix for interfaces.

### File Organisation

*   Group code by feature or technical concern.
*   Follow the structure outlined in the [Directory Structure documentation](../architecture/directory-structure.md).
*   Keep components focused and aim for files under ~300 lines where practical.

### TypeScript Best Practices

*   Enable and respect `strict` mode.
*   Avoid `any` where possible; use `unknown` or specific types/generics.
*   Use interfaces for object shapes and props.
*   Use utility types (`Partial`, `Omit`, etc.) where helpful.
*   Leverage type inference but provide explicit types for function signatures and complex variables.

### React Guidelines

*   Use functional components and hooks.
*   Follow the Rules of Hooks.
*   Extract complex logic into custom hooks (`src/hooks`).
*   Keep components focused on a single responsibility.
*   Manage state appropriately (local state, Zustand/Context for shared state, React Query for server state).
*   Optimise performance using `React.memo`, `useMemo`, `useCallback` where necessary (profile first).
*   Use `next/dynamic` for lazy-loading components, especially those with heavy dependencies (`ssr: false` for client-only libs).

### CSS/Styling Conventions (Tailwind CSS)

*   Follow the utility-first approach.
*   Use `tailwind.config.js` for theme customisation (colours, spacing) - treat config as SSOT.
*   Group related utilities in `className` for readability.
*   Extract complex or reusable class combinations into components or potentially `@apply` directives (use sparingly).

## Linting & Formatting

*   We use **ESLint** for code analysis and **Prettier** for automated code formatting.
*   Configurations are located in the `/config` directory.
*   **Run `npm run lint` before committing** to catch issues early.
*   Configure your editor to format on save using Prettier.
*   Pre-commit hooks should be configured (via Husky/lint-staged) to enforce linting and formatting.

## Testing Strategy

Testing is crucial for maintaining code quality and preventing regressions.

**Current Status:** Test coverage is currently **low** as many older tests were removed. **Rebuilding test coverage is a high priority.**

### Tools
*   **Jest:** Core test runner.
*   **React Testing Library (RTL):** For component testing (Unit/Integration).
*   **User Event:** For simulating user interactions in RTL.
*   **Storybook:** For visual testing and component development.
*   **Cypress:** For End-to-End (E2E) tests.

### Test Types & Goals
*   **Unit Tests (`tests/unit`):** Test small, isolated pieces (utils, hooks, simple components). Aim for high coverage of logic branches.
*   **Integration Tests (`tests/integration`):** Test how multiple units work together within a feature.
*   **E2E Tests (`tests/e2e`):** Test critical user flows through the entire application.

### Writing Tests
*   Place tests in the central `/tests` directory, mirroring the `src` structure.
*   Focus on testing behaviour from the user's perspective (RTL).
*   Use user-centric queries (`getByRole`, `getByLabelText`, etc.).
*   Use `userEvent` for interactions.
*   Keep tests independent and focused.
*   Refer to the [Testing Strategy documentation](./testing-strategy.md) for more detailed examples and best practices (especially regarding RTL).

## Git Workflow & Commits

*   Follow the branching strategy and PR process outlined in **[CONTRIBUTING.md](../CONTRIBUTING.md)**.
*   Write commit messages adhering to the Conventional Commits standard (e.g., `feat: Add user profile page`, `fix(auth): Correct login redirect`).

## Documentation

*   Update documentation alongside code changes.
*   Follow guidelines in **[CONTRIBUTING.md](../CONTRIBUTING.md)** for documentation contributions (naming, language, SSOT). 