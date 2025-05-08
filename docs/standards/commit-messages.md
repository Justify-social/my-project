# Commit Message Guidelines (Conventional Commits)

**Last Reviewed:** 2025-05-09
**Status:** Active

## Overview

This document defines the standard format for Git commit messages in the Justify project. We adhere strictly to the **Conventional Commits specification (v1.0.0)**. This practice is mandatory as it enables automated changelog generation, helps track features/fixes/breaking changes clearly, and improves the overall readability and navigability of the project history.

Reference: [https://www.conventionalcommits.org/](https://www.conventionalcommits.org/)

## Format

The commit message must follow this structure:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 1. Header

The header is mandatory and consists of `type`, optional `scope`, and `description`.

- **`<type>`:** Describes the kind of change introduced by the commit. Must be one of the allowed types listed below.
- **`[optional scope]`:** A noun describing the section of the codebase affected by the change, enclosed in parentheses. Examples: `api`, `ui`, `auth`, `deps`, `config`, `wizard`, `brand-lift`.
- **`<description>`:** A concise, imperative, lower-case description of the change, starting with a verb. It should not end with a period.

  - _Bad:_ ~~Fixed bug with login redirect.~~
  - _Good:_ `fix(auth): correct login redirect on successful sign-in`

The entire header line must not exceed 100 characters.

### 2. Body (Optional)

- Provides additional context about the code changes.
- Use imperative, present tense ("change" not "changed" nor "changes").
- Explain the _why_ behind the change, not just the _what_.
- Must be separated from the header by one blank line.

### 3. Footer(s) (Optional)

- Contains metadata about the commit.
- Must be separated from the body (or header, if no body) by one blank line.
- **Breaking Changes:** Use `BREAKING CHANGE:` followed by a description of the breaking change. A `!` can also be added after the type/scope in the header (e.g., `feat(api)!:`) to draw attention to breaking changes.
- **Issue References:** Link to related issues using keywords like `Closes #123`, `Fixes #456`, `Refs #789`.

## Allowed Types

- **`feat`**: A new feature for the end-user.
- **`fix`**: A bug fix for the end-user.
- **`docs`**: Documentation only changes.
- **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc). **Must not** be used if code logic changes.
- **`refactor`**: A code change that neither fixes a bug nor adds a feature (e.g., renaming variables, improving code structure).
- **`perf`**: A code change that improves performance.
- **`test`**: Adding missing tests or correcting existing tests. **Must not** be used if source code (`src/`) is also changed (use `feat` or `fix` instead).
- **`build`**: Changes that affect the build system or external dependencies (example scopes: `deps`, `ci`, `vercel`, `docker`).
- **`ci`**: Changes to our CI configuration files and scripts (example scopes: `github-actions`, `cypress`).
- **`chore`**: Other changes that don't modify `src` or `test` files (e.g., updating dependencies, housekeeping tasks).
- **`revert`**: Reverts a previous commit.

## Examples

**Simple Fix:**

```
fix(ui): resolve button overflow on small screens
```

**New Feature with Scope:**

```
feat(wizard): add support for secondary contact details

Allows users to optionally provide a secondary contact person during campaign creation in Step 1.

Closes #234
```

**Refactor with Breaking Change:**

```
refactor(auth)!: replace legacy auth context with Clerk hooks

Removes the custom AuthStateProvider and updates all components
to use useAuth() and useUser() from @clerk/nextjs for authentication state.

BREAKING CHANGE: Components previously consuming AuthStateContext must be updated to use Clerk hooks directly.
```

**Chore (Dependency Update):**

```
chore(deps): update react and nextjs to latest versions
```

## Enforcement

- Commit messages will be linted (e.g., using `commitlint`) as part of CI checks or pre-commit hooks.
- Pull Requests with non-compliant commit messages (after squashing) may be rejected.

Adhering to these guidelines ensures a clean, informative, and useful Git history.
