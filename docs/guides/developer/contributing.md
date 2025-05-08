**Last Reviewed**: 2025-05-09
**Content Validated for Version**: [Specify Project Version/Date]

# Contributing to Justify

Thank you for your interest in contributing to the Justify Marketing Intelligence Platform. This guide outlines our development workflow, coding standards, and submission process to ensure smooth and effective collaboration.

## 1. Getting Started

Before contributing, please ensure you have:

1.  **Set up your development environment:** Follow the **[Developer Setup Guide](../../getting-started/developer-setup.md)** meticulously.
2.  **Understood the project:** Review the **[Project Overview](../../getting-started/project-overview.md)** and the **[Directory Structure](../../architecture/directory-structure.md)**.
3.  **Required Access:** Ensure you have the necessary permissions on the Git repository (fork if external contributor).

## 2. Development Workflow (Git & Branching)

We follow a standard feature branching workflow based on the primary integration branch (confirm if `main` or `develop` with your team lead):

1.  **Sync Target Branch:** Ensure your local target branch is up-to-date: `git checkout <target-branch> && git pull origin <target-branch>` (e.g., `git checkout main && git pull origin main`).
2.  **Create a Feature Branch:** Branch off the target branch: `git checkout -b <type>/<short-description>`.
    - **Branch Types (`<type>`):** Use conventional commit types (see Commit Guidelines below).
    - **Description (`<short-description>`):** Briefly describe the change in kebab-case (e.g., `feat/add-campaign-filter`, `fix/user-login-redirect`).
3.  **Implement Changes:**
    - Write code adhering to all documented **[Standards](../../standards/README.md)** (Code, Naming, Linting/Formatting, Testing, API Design, etc.).
    - Develop incrementally and commit logically using Conventional Commits (see below).
4.  **Write/Update Tests:** Include relevant unit, integration, or E2E tests for new features or bug fixes as defined in the **[Testing Strategy](../../standards/testing-strategy.md)**.
5.  **Update Documentation:** If your changes affect architecture, features, setup, processes, or user-facing functionality, **you must** update or create the relevant documentation according to the **[Documentation Guide](../../documentation-guide.md)**.
6.  **Test Locally:** Ensure all tests pass (`npm test`) and the application runs correctly locally (`npm run dev`).

## 3. Commit Guidelines (Conventional Commits)

We adhere strictly to the **Conventional Commits** specification (v1.0.0). This enables automated changelog generation and improves commit history clarity.

- **Format:** `<type>(<optional scope>): <description>`
  - The header (`<type>(<scope>): <description>`) must not exceed 100 characters.
  - A blank line MUST separate the header from the optional body/footer.
  - Example: `feat(api): add endpoint for campaign summary`
  - Example: `fix(ui): correct button alignment on dashboard`
  - Example: `docs(architecture): update database schema diagram`
- **Allowed Types:**
  - `feat`: A new feature for the end-user.
  - `fix`: A bug fix for the end-user.
  - `docs`: Documentation only changes.
  - `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc). **Must not** be used if code logic changes.
  - `refactor`: A code change that neither fixes a bug nor adds a feature (e.g., renaming variables, improving code structure).
  - `perf`: A code change that improves performance.
  - `test`: Adding missing tests or correcting existing tests. **Must not** be used if source code (`src/`) is also changed (use `feat` or `fix` instead).
  - `build`: Changes that affect the build system or external dependencies (example scopes: `deps`, `ci`, `vercel`, `docker`).
  - `ci`: Changes to our CI configuration files and scripts (example scopes: `github-actions`, `cypress`).
  - `chore`: Other changes that don't modify `src` or `test` files (e.g., updating dependencies).
  - `revert`: Reverts a previous commit.
- **Breaking Changes:** Use `!` after the type/scope (e.g., `refactor(auth)!:`) and include a `BREAKING CHANGE:` footer.
- Refer to the **[Commit Message Guidelines](../../standards/commit-messages.md)** (if it exists) or [conventionalcommits.org](https://www.conventionalcommits.org/) for full details.
- Keep commits focused on a single logical change.

## 4. Submitting a Pull Request (PR)

1.  **Push Branch:** Push your feature branch to the remote repository: `git push -u origin <branch-name>`.
2.  **Create PR:** Open a Pull Request in the Git platform (e.g., GitHub) targeting the appropriate integration branch (e.g., `main` or `develop`).
3.  **Fill Template:** Complete the PR template thoroughly, explaining the _what_ and _why_ of the change, and linking related issues (e.g., `Fixes #123`).
4.  **Request Review:** Request reviews from relevant team members/code owners.
5.  **Address Feedback:** Respond to comments and make necessary changes promptly.
6.  **Ensure Checks Pass:** Verify all automated checks (CI builds, tests, linting) are successful.

## 5. Code Review & Merge Process

1.  **Review:** Obtain the required number of approving reviews (confirm team policy, typically at least one).
2.  **Rebase (If Necessary):** Before merging, it's often good practice (confirm team policy) to rebase your branch onto the latest target branch to resolve conflicts and maintain a linear history: `git fetch origin && git rebase origin/<target-branch>`.
3.  **Squash & Merge:** Use the "Squash and merge" option (or team standard) in the Git platform. Ensure the final commit message is clean, follows Conventional Commits format, and references the original PR number.

## 6. Coding Standards & Quality

Adherence to documented project standards is mandatory:

- **Code:** Follow **[Code Standards](../../standards/code-standards.md)**.
- **Naming:** Follow **[Naming Conventions](../../standards/naming-conventions.md)**.
- **Linting/Formatting:** Ensure code passes checks defined in **[Linting & Formatting Standards](../../standards/linting-formatting.md)** (`npm run lint`). Pre-commit hooks should enforce this.
- **Testing:** Follow **[Testing Strategy](../../standards/testing-strategy.md)**.
- **API Design:** Follow **[API Design Standards](../../standards/api-design.md)**.
- **Accessibility:** Follow **[Accessibility Standards](../../standards/accessibility.md)**.
- **Security:** Follow **[Security Standards](../../standards/security.md)**.

## 7. Documentation Contributions

Contributions to documentation (`/docs`) are highly encouraged and follow the same PR process. Ensure documentation changes adhere to the principles outlined in the **[Documentation Guide](../../documentation-guide.md)** (SSOT, clarity, structure, etc.).

## 8. Getting Help

If you need assistance:

- Check relevant guides in `/docs` first.
- Ask questions in the appropriate Slack channel (e.g., `#development`).
- Contact the core development team or relevant feature owners.

Thank you for helping improve the Justify platform!
