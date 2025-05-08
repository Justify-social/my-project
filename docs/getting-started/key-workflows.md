# Key Developer Workflows

**Last Reviewed:** 2025-05-09

This document provides an overview of essential development workflows within the Justify project. Understanding these processes will help you contribute effectively and maintain code quality. More detailed guides for each area may exist in the `guides/developer/` section.

## 1. Local Development & Running the Application

- **Setup**: Ensure your environment is configured as per the **[Developer Setup](./developer-setup.md)** guide.
- **Running the App**: Start the local development server using:
  ```bash
  npm run dev
  ```
  The application is typically accessible at `http://localhost:3000`.

## 2. Debugging

Effective debugging is crucial. Here are the primary approaches:

- **Browser Developer Tools**: Use your browser's (e.g., Chrome, Firefox) developer tools for frontend debugging. This includes:
  - Inspecting HTML elements and CSS.
  - Setting JavaScript breakpoints in the "Sources" tab.
  - Monitoring network requests in the "Network" tab.
  - Using the console for logging and executing commands.
- **VS Code Debugger (Recommended for Backend/Full-stack)**:
  - Ensure you have the "JavaScript Debugger" extension (or similar for your IDE).
  - Utilize launch configurations in `.vscode/launch.json` (if provided) to debug Node.js (backend API routes) and frontend code.
  - Set breakpoints directly in your TypeScript/JavaScript code.
- **Console Logging**: Strategic `console.log()` statements in both frontend and backend code can help trace execution flow and inspect variable states.

  _Refer to the more detailed `guides/developer/debugging-guide.md` (when available) for advanced techniques._

## 3. Local Testing

We employ a multi-layered testing strategy. Running tests locally before committing code is essential.

- **Running All Tests**: A general command to execute the main test suite (unit, integration) is often:
  ```bash
  npm test
  ```
- **Specific Test Suites**: You can usually run specific types of tests:
  ```bash
  npm run test:unit       # For unit tests
  npm run test:integration  # For integration tests
  # npm run test:e2e        # For end-to-end tests (may require different setup)
  ```
- **Tools Used**: Our primary testing tools include:

  - **Jest**: As the core test runner.
  - **React Testing Library (RTL)**: For component unit and integration tests, focusing on user-centric interactions.
  - **(Possibly) Cypress**: For End-to-End (E2E) tests that simulate full user flows.

  _For comprehensive details on our testing philosophy, types of tests, and how to write them, please see the `standards/testing-strategy.md` and `guides/developer/local-testing-guide.md` (when available)._

## 4. Using the UI Component Browser (Storybook/Equivalent)

To facilitate UI development and ensure consistency, we use a component browser. This tool allows you to view, interact with, and test UI components in isolation.

- **Access**: The UI component browser is typically available at a local development URL, such as:
  `http://localhost:3000/debug-tools/ui-components`
  _(Verify this path, it might be different or require a separate command to run, e.g., `npm run storybook`)_
- **Purpose**:

  - Visually inspect all available UI components (Atoms, Molecules, Organisms).
  - Test components with different props and states.
  - Verify responsiveness and accessibility.
  - Understand component usage and see examples.

  _Refer to `guides/developer/icon-system-guide.md` and any specific guides for the UI browser/Storybook for more details._

## 5. Linting & Formatting

To maintain code quality and consistency, we use linters and code formatters.

- **ESLint**: For identifying and reporting on patterns in JavaScript/TypeScript code.
- **Prettier**: For automatic code formatting.
- **Commands**:
  ```bash
  npm run lint      # To check for linting errors
  npm run format    # To automatically format code (if configured)
  ```
- **Pre-commit Hooks**: These are often set up (e.g., via Husky) to automatically run linting and formatting before you commit code, helping to prevent errors from entering the codebase.

  _See `standards/linting-formatting.md` for detailed rules and setup._

## 6. Environment Management Basics

Justify utilizes different environments for various stages of development and deployment.

- **Local Development (`.env.local`)**: Your local machine setup, configured via `config/env/.env.local` (or `.env.local`). This is where you do most ofyour coding and initial testing.
- **Preview/Feature Environments**: Often, deploying a branch to Vercel (or a similar platform) creates a unique preview URL for that specific branch. This allows for isolated testing and review of new features before merging.
- **Staging Environment**: A shared environment that mirrors production as closely as possible. Code merged into a specific branch (e.g., `develop` or `staging`) is typically auto-deployed here for final testing and QA.
  - Example URL: `https://staging.justify.social` (verify actual URL)
- **Production Environment**: The live application accessible to end-users. Code merged into the main branch (e.g., `main`) is deployed here after thorough testing.
  - Example URL: `https://justify.social` (verify actual URL)

Understanding which environment you are targeting or testing on is crucial, especially when dealing with environment-specific configurations or data.

## 7. Version Control & Branching Strategy

We follow a standard Git workflow:

- Create feature branches from a main development branch (e.g., `develop` or `main`).
- Commit changes regularly with clear, conventional commit messages.
- Push your branch and open a Pull Request (PR) for review.

  _For full details, refer to `guides/developer/contributing.md` and `standards/commit-messages.md`._
