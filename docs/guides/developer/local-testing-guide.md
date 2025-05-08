# Local Testing Guide

**Last Reviewed:** 2025-05-08
**Status:** Active

## 1. Overview

This guide explains how to run and write various types of automated tests locally for the Justify platform. Consistent local testing before committing code is crucial for maintaining code quality, preventing regressions, and ensuring features work as expected.

Refer to the **[Testing Strategy](../standards/testing-strategy.md)** document for the overall approach and philosophy regarding different test types.

## 2. Testing Stack

We utilize the following primary tools for testing:

- **Test Runner & Framework:** [Jest](https://jestjs.io/) - Used for running unit and integration tests.
- **React Component Testing:** [React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro/) - Used for querying and interacting with React components in a user-centric way.
- **DOM Assertions:** `@testing-library/jest-dom` - Provides custom Jest matchers for asserting on DOM state.
- **User Interactions:** `@testing-library/user-event` - Simulates real user interactions more realistically than basic DOM events.
- **End-to-End (E2E) Testing:** [Cypress](https://www.cypress.io/) - Used for testing complete user flows through the application in a real browser.

## 3. Running Tests Locally

Use the following npm scripts defined in `package.json` to run tests:

- **Run All Unit & Integration Tests:**

  ```bash
  npm test
  ```

  (This runs `test:unit` and `test:integration` in parallel using `npm-run-all`)

- **Run Unit Tests Only:**

  ```bash
  npm run test:unit
  ```

  (Targets files matching the `tests/unit` path pattern)

- **Run Integration Tests Only:**

  ```bash
  npm run test:integration
  ```

  (Targets files matching the `tests/integration` path pattern)

- **Run Tests within `src` Directory:**

  ```bash
  npm run test:local
  ```

  (Useful for running tests co-located with source code during development)

- **Run Tests in Watch Mode:**

  ```bash
  npm run test:watch
  ```

  (Runs Jest in watch mode, re-running tests automatically when files change)

- **Run Tests with Coverage Report:**

  ```bash
  npm run test:coverage
  ```

  (Generates a test coverage report)

- **Run E2E Tests (Headless):**

  ```bash
  npm run test:e2e
  # OR
  npm run cypress
  ```

  (Runs all Cypress tests defined in `cypress/e2e/` in the terminal)

- **Open Cypress Interactive Runner:**
  ```bash
  npm run cypress:open
  ```
  (Opens the Cypress GUI for interactively running, viewing, and debugging E2E tests)

## 4. Writing Tests

### 4.1. Unit Tests (`tests/unit/` or `*.test.ts` in `src`)

- **Focus:** Test individual functions, hooks, or simple components in isolation.
- **Naming:** Use `*.test.ts` or `*.spec.ts` file extension.
- **Structure (Arrange-Act-Assert):**
  1.  **Arrange:** Set up necessary preconditions, mock data, and dependencies.
  2.  **Act:** Execute the function or render the component being tested.
  3.  **Assert:** Verify the outcome using Jest matchers (`expect(...)`).
- **Mocking:** Use `jest.fn()`, `jest.spyOn()`, and `jest.mock()` to mock dependencies (functions, modules, API calls).
- **Example (Utility Function):**

  ```typescript
  // src/utils/calculations.test.ts
  import { calculateTotal } from './calculations';

  describe('calculateTotal', () => {
    it('should return the sum of item prices', () => {
      const items = [{ price: 10 }, { price: 20 }, { price: 5 }];
      expect(calculateTotal(items)).toBe(35);
    });

    it('should return 0 for an empty array', () => {
      expect(calculateTotal([])).toBe(0);
    });
  });
  ```

### 4.2. Integration Tests (`tests/integration/` or `*.test.ts` in `src`)

- **Focus:** Test the interaction between multiple components, hooks, context providers, or modules.
- **Tools:** Use React Testing Library (`render`, `screen`, `fireEvent`, `waitFor`) and `user-event`.
- **Philosophy:** Test components from the user's perspective. Query elements by accessible roles, text, labels, etc. (`screen.getByRole`, `screen.getByText`). Avoid testing implementation details.
- **Example (Form Component):**

  ```typescript
  // tests/integration/CampaignForm.test.tsx
  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import { CampaignForm } from '@/components/features/campaigns/CampaignForm';
  // Mock necessary providers or API calls

  describe('CampaignForm', () => {
    it('should display validation error when submitting empty form', async () => {
      render(<CampaignForm />);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await userEvent.click(submitButton);

      // Expect validation errors to appear (adjust query as needed)
      expect(await screen.findByText(/campaign name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/brand name is required/i)).toBeInTheDocument();
    });

    // Add more tests for filling form, successful submission, etc.
  });
  ```

### 4.3. End-to-End (E2E) Tests (`cypress/e2e/`)

- **Focus:** Simulate complete user journeys through the application in a browser.
- **Tools:** Cypress (`cy` commands).
- **Structure:** Organize tests by feature or user flow in `cypress/e2e/`.
- **Selectors:** Prefer stable, user-facing selectors (`data-testid`, accessible roles, text) over brittle CSS selectors.
- **Example (Login Flow):**

  ```typescript
  // cypress/e2e/auth/login.cy.ts
  describe('Login Flow', () => {
    it('should allow a user to log in and redirect to dashboard', () => {
      cy.visit('/signin');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('correct-password');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/dashboard');
      cy.contains(/welcome back/i).should('be.visible');
    });

    // Add tests for invalid login, etc.
  });
  ```

## 5. Debugging Tests

- **Jest/RTL:**
  - Use `console.log` within tests.
  - Use `screen.debug()` to print the current DOM structure.
  - Use the VS Code debugger with a Jest launch configuration.
- **Cypress:**
  - Use the Cypress interactive runner (`npm run cypress:open`) for time-travel debugging, DOM snapshots, and console output.
  - Use `cy.log(...)` within tests.
  - Use `.debug()` command on Cypress chains.

## 6. Best Practices

- **Write Clear Descriptions:** Use `describe` and `it` blocks with clear, descriptive names.
- **Test Behavior, Not Implementation:** Focus on what the user experiences or what the code outputs, not how it does it internally.
- **Keep Tests Independent:** Tests should not rely on the state or outcome of previous tests.
- **Use Factories/Fixtures:** Create reusable functions or fixtures for generating test data.
- **Mock Effectively:** Mock only what's necessary for the test in isolation.
- **Aim for Readability:** Write tests that are easy to understand.

---

Regularly running and writing effective local tests is a key part of our development workflow.
