# Naming Conventions Standard

**Last Reviewed:** 2025-05-09

This document defines the standard naming conventions for various code artifacts within the Justify project. Consistent naming is crucial for readability, maintainability, and understanding the codebase.

Adherence to these conventions is expected for all contributions.

## General Principles

- **Descriptive:** Names should clearly indicate the purpose or content of the artifact. Avoid overly generic names (e.g., `data`, `temp`, `handleStuff`).
- **Avoid Abbreviations:** Use full words unless the abbreviation is extremely common and widely understood within the project context (e.g., `db`, `id`, `url`, `http`).
- **Consistency:** Follow the specific casing and patterns outlined below for each artifact type.

## Specific Conventions

1.  **Directories:**

    - **Case:** `kebab-case` (all lowercase, words separated by hyphens).
    - **Examples:** `src/components/features/campaign-wizard/`, `src/lib/auth/`, `docs/guides/developer/`.

2.  **Files (Non-Component):**

    - **Case:** `kebab-case`.
    - **Examples:** `src/services/user-service.ts`, `src/lib/utils.ts`, `docs/standards/code-standards.md`.
    - **Exception:** Configuration files at the root might follow specific tool conventions (e.g., `tailwind.config.js`, `next.config.js`), although these often point to files within `/config` which _should_ use `kebab-case`.

3.  **React Component Files & Component Directories:**

    - **Case:** `PascalCase` (upper camel case).
    - **Convention:** The filename should match the name of the primary component exported.
    - **Examples:** `src/components/ui/Button.tsx`, `src/components/features/user/UserProfileCard.tsx`, `src/components/features/campaign-wizard/Step1Content.tsx`.
    - If a component requires multiple files (e.g., styles, types), place them in a directory named after the component (`PascalCase`), with the main component file usually being `index.tsx` or `ComponentName.tsx` within that directory. Example: `src/components/ui/Button/index.tsx`.

4.  **React Component Variables/Functions:**

    - **Case:** `PascalCase`.
    - **Examples:** `const UserProfile = (...) => { ... }`, `function CampaignWizard(...) { ... }`.

5.  **Variables (Non-component, non-constant):**

    - **Case:** `camelCase` (lower camel case).
    - **Examples:** `let userName = '...';`, `const campaignData = ...;`, `const itemCount = 0;`.

6.  **Functions (Non-component):**

    - **Case:** `camelCase`.
    - **Examples:** `function getUserById(...)`, `const calculateTotal = (...) => { ... }`.

7.  **Boolean Variables:**

    - **Prefix:** Use prefixes like `is`, `has`, `should`, `can`, `did`, `will` for clarity.
    - **Case:** `camelCase`.
    - **Examples:** `isLoading`, `hasChanges`, `shouldRedirect`, `canSubmit`, `didUpdate`.

8.  **Event Handlers:**

    - **Prefix:** Use `handle` or `on`.
    - **Case:** `camelCase`.
    - **Examples:** `handleSubmit`, `handleClick`, `onChange`, `onBlur`.

9.  **Constants:**

    - **Case:** `UPPER_SNAKE_CASE` (all uppercase, words separated by underscores).
    - **Usage:** For values that are truly constant and widely used (e.g., configuration keys, action types, fixed thresholds).
    - **Examples:** `MAX_ITEMS`, `DEFAULT_TIMEOUT`, `AUTH_TOKEN_KEY`.

10. **Types & Interfaces:**

    - **Case:** `PascalCase`.
    - **Prefix/Suffix:**
      - Do **not** use an `I` prefix for interfaces (e.g., use `UserProfile` not `IUserProfile`).
      - For React component props types/interfaces, **suffix** with `Props` (e.g., `ButtonProps`, `UserProfileProps`).
    - **Examples:** `interface UserProfile { ... }`, `type CampaignStatus = 'DRAFT' | 'ACTIVE';`, `interface ButtonProps { ... }`.

11. **Enums (TypeScript & Prisma):**

    - **Case:** `PascalCase` for the enum name.
    - **Member Case:** `UPPER_SNAKE_CASE` for enum members (to align with Prisma conventions and common practice).
    - **Examples:** `enum UserRole { ADMIN, USER }`, `enum Status { PENDING_APPROVAL, ACTIVE }`.

12. **Custom Hooks:**

    - **Prefix:** Must start with `use`.
    - **Case:** `camelCase` (following the `use` prefix).
    - **Filename:** `useHookName.ts` (`kebab-case` for the file, `useCamelCase` for the hook itself).
    - **Examples:** Hook `useAuth`, Filename `use-auth.ts`; Hook `useFormValidation`, Filename `use-form-validation.ts`.

13. **Test Files:**
    - **Location:** Preferably in a `__tests__` directory co-located with the source file.
    - **Naming:** `[filename].test.[ts|tsx]` (e.g., `Button.test.tsx`, `user-service.test.ts`).

Refer to the **[Directory Structure](../architecture/directory-structure.md)** document for guidance on where files and directories should be located.
