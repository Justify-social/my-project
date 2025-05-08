**Last Reviewed**: 2025-05-08
**Content Validated for Version**: [Specify Project Version/Date]

# Contributing to Justify

Thank you for your interest in contributing to the Justify Marketing Intelligence Platform. This guide outlines our development workflow, coding standards, and submission process to ensure smooth and effective collaboration.

## 1. Getting Started

Before contributing, please ensure you have:

1.  **Set up your development environment:** Follow the **[Developer Setup Guide](../../getting-started/developer-setup.md)** meticulously.
2.  **Understood the project:** Review the **[Project Overview](../../getting-started/project-overview.md)** and the **[Directory Structure](../../architecture/directory-structure.md)**.
3.  **Required Access:** Ensure you have the necessary permissions on the Git repository (fork if external contributor).

## 2. Development Workflow (Git & Branching)

We follow a standard feature branching workflow:

1.  **Sync Target Branch:** Ensure your local target branch (e.g., `main` or `develop` - _confirm project's integration branch_) is up-to-date: `git checkout main && git pull origin main`.
2.  **Create a Feature Branch:** Branch off the target branch: `git checkout -b <type>/<short-description>`.
    - **Branch Types (`<type>`):** Use conventional commit types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`, `build`.
    - **Description (`<short-description>`):** Briefly describe the change in kebab-case (e.g., `feat/add-campaign-filter`, `fix/user-login-redirect`).
3.  **Implement Changes:**
    - Write code adhering to all documented **[Standards](../../5-standards/README.md)** (Code, Naming, Linting/Formatting, Testing, API Design, etc.).
    - Develop incrementally and commit logically (see Commit Guidelines below).
4.  **Write/Update Tests:** Include relevant unit, integration, or E2E tests for new features or bug fixes as defined in the **[Testing Strategy](../../5-standards/testing-strategy.md)**.
5.  **Update Documentation:** If your changes affect architecture, features, setup, or processes, **you must** update the relevant documentation according to the **[Documentation Guide](../../documentation-guide.md)**.
6.  **Test Locally:** Ensure all tests pass (`npm test`) and the application runs correctly locally (`npm run dev`).

## 3. Commit Guidelines

We adhere to the **Conventional Commits** specification. This ensures a clear and automated changelog generation.

- **Format:** `<type>(<optional scope>): <description>`
  - Example: `feat(api): add endpoint for campaign summary`
  - Example: `fix(ui): correct button alignment on dashboard`
  - Example: `docs(architecture): update database schema diagram`
- Refer to the **[Commit Message Guidelines](../../5-standards/commit-messages.md)** for full details and allowed types/scopes.
- Keep commits focused on a single logical change.

## 4. Submitting a Pull Request (PR)

1.  **Push Branch:** Push your feature branch to the remote repository: `git push -u origin <branch-name>`.
2.  **Create PR:** Open a Pull Request in the Git platform (e.g., GitHub) targeting the appropriate integration branch (`main` or `develop`).
3.  **Fill Template:** Complete the PR template thoroughly, linking related issues (e.g., `Fixes #123`).
4.  **Request Review:** Request reviews from relevant team members/code owners.
5.  **Address Feedback:** Respond to comments and make necessary changes promptly.
6.  **Ensure Checks Pass:** Verify all automated checks (CI builds, tests, linting) are successful.

## 5. Code Review & Merge Process

1.  **Review:** At least one approving review is typically required (confirm team policy).
2.  **Rebase (If Necessary):** Before merging, rebase your branch onto the latest target branch to resolve conflicts and maintain a linear history: `git fetch origin && git rebase origin/<target-branch>`.
3.  **Squash & Merge:** Use the "Squash and merge" option (or team standard) in the Git platform. Ensure the final commit message is clean and follows Conventional Commits format.

## 6. Coding Standards & Quality

Adherence to standards is mandatory:

- **Code:** Follow **[Code Standards](../../5-standards/code-standards.md)**.
- **Naming:** Follow **[Naming Conventions](../../5-standards/naming-conventions.md)**.
- **Linting/Formatting:** Ensure code passes checks defined in **[Linting & Formatting Standards](../../5-standards/linting-formatting.md)** (`npm run lint`). Pre-commit hooks should enforce this.
- **Testing:** Follow **[Testing Strategy](../../5-standards/testing-strategy.md)**.
- **API Design:** Follow **[API Design Standards](../../5-standards/api-design.md)**.
- **Accessibility:** Follow **[Accessibility Standards](../../5-standards/accessibility.md)**.
- **Security:** Follow **[Security Standards](../../5-standards/security.md)**.

## 7. Documentation Contributions

Contributions to documentation (`/docs`) are highly encouraged and follow the same PR process. Ensure documentation changes adhere to the **[Documentation Guide](../../documentation-guide.md)**.
