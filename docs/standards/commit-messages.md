# Commit Message Standards

**Last Reviewed:** 2025-05-08
**Status:** Active

## 1. Overview

This project adheres to the **Conventional Commits 1.0.0** specification for all Git commit messages. Following this standard is mandatory for all contributors.

## 2. Why Conventional Commits?

Using Conventional Commits provides several key benefits:

- **Automated Changelog Generation:** Allows for the automatic generation of human-readable CHANGELOG files.
- **Semantic Versioning:** Enables automatic determination of semantic version bumps (PATCH, MINOR, MAJOR) based on commit types.
- **Clear Communication:** Provides a clear and structured commit history, making it easier for teammates, reviewers, and future developers to understand the nature of changes.
- **Tooling Integration:** Facilitates integration with CI/CD pipelines for automated builds, testing, and deployments based on commit types.
- **Improved Contribution:** Makes the contribution process more straightforward by providing a clear format for commit messages.

## 3. Specification

This project follows the **Conventional Commits specification version 1.0.0**. The full specification can be found here:

[**Conventional Commits 1.0.0 Specification**](https://www.conventionalcommits.org/en/v1.0.0/)

## 4. Basic Structure

The commit message structure is as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- **`<type>`:** Indicates the nature of the change (see Section 5).
- **`[optional scope]`:** A noun describing the section of the codebase affected (e.g., `api`, `ui`, `billing`, `docs`). Enclosed in parentheses.
- **`<description>`:** A short, imperative summary of the change (e.g., "add user login endpoint", "fix campaign budget validation"). Use lowercase.
- **`[optional body]`:** Provides additional context, motivation, or details about the change. Starts one blank line after the description.
- **`[optional footer(s)]`:** Contains metadata like related issue numbers (`Refs: #123`), reviewers, or breaking change notices (`BREAKING CHANGE:`).

## 5. Common Types

The following types are commonly used in this project:

- **`feat`**: Introduces a new feature to the codebase (correlates with MINOR in SemVer).
- **`fix`**: Patches a bug in the codebase (correlates with PATCH in SemVer).
- **`build`**: Changes that affect the build system or external dependencies (e.g., gulp, broccoli, npm).
- **`chore`**: Other changes that don't modify `src` or `test` files (e.g., updating dependencies, managing config files).
- **`ci`**: Changes to our CI configuration files and scripts (e.g., GitHub Actions).
- **`docs`**: Documentation only changes.
- **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- **`refactor`**: A code change that neither fixes a bug nor adds a feature.
- **`perf`**: A code change that improves performance.
- **`test`**: Adding missing tests or correcting existing tests.
- **`revert`**: Reverts a previous commit.

_Note: Only `feat` and `fix` directly impact semantic versioning unless a BREAKING CHANGE is included._

## 6. Breaking Changes

Breaking changes (changes that alter the API or behavior in a non-backward-compatible way) MUST be clearly indicated:

1.  **Footer:** Add a footer starting with `BREAKING CHANGE:` followed by a description of the breaking change.
    ```
    BREAKING CHANGE: User ID is now required for campaign creation API.
    ```
2.  **`!` Indicator:** Append a `!` immediately before the `:` in the type/scope prefix.
    ```
    feat(api)!: require user ID for campaign creation
    ```
    (The commit body/description should still explain the breaking change if using `!`).

A commit with a breaking change (regardless of type) correlates with a MAJOR version bump in SemVer.

## 7. Examples

```git
feat(billing): add stripe checkout integration

Implements the necessary API endpoints and frontend components
to integrate Stripe Checkout for subscription management.

Refs: #456
```

```git
fix(ui): correct alignment issue in settings modal

Resolved a CSS flexbox issue causing button misalignment on smaller screens.
```

```git
chore: update eslint dependency to latest version
```

```git
docs(api): clarify rate limiting behavior for /users endpoint
```

```git
refactor(auth)!: migrate user session management from cookies to JWT

BREAKING CHANGE: Authentication tokens are now JWTs instead of opaque session cookies.
Frontend clients must update token handling logic.
```

## 8. Tooling & Enforcement

Commit message format may be enforced automatically via pre-commit hooks (e.g., using `husky` and `commitlint`). Ensure your commits adhere to this standard to avoid commit failures.

---

Please refer to the full [Conventional Commits 1.0.0 Specification](https://www.conventionalcommits.org/en/v1.0.0/) for complete details.
