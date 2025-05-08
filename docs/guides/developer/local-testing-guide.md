# Local Testing Guide

**Last Reviewed:** 2025-05-09
**Status:** Placeholder - Needs Content

## Overview

This guide explains how to run various types of automated tests locally and provides guidance on writing effective tests for the Justify platform.

Refer to the **[Testing Strategy](../../standards/testing-strategy.md)** document for the overall approach, philosophy, and goals of our testing efforts.

_(Action: Tech Lead/QA Lead to populate this guide with specific commands, examples, and best practices.)_

## Running Tests Locally

### 1. Running All Tests

- **Command:**
  ```bash
  npm test
  ```
- **Description:** This command typically executes the primary test suite, which usually includes unit and integration tests run via Jest.

### 2. Running Specific Test Suites

- **Unit Tests:**
  ```bash
  npm run test:unit
  # or potentially: npm test -- --testPathPattern=src/lib
  ```
  _(Verify exact command/pattern)_ Focuses on testing isolated functions and components.
- **Integration Tests:**
  ```bash
  npm run test:integration
  # or potentially: npm test -- --testPathPattern=src/components/features
  ```
  _(Verify exact command/pattern)_ Tests the interaction between multiple components or modules within a feature.
- **End-to-End (E2E) Tests (e.g., Cypress):**

  ```bash
  # To run headlessly:
  npm run test:e2e
  # or: npx cypress run

  # To open the Cypress GUI:
  npm run cypress:open
  # or: npx cypress open
  ```

  _(Verify exact commands)_ These tests simulate full user flows through the application and often require the development server (`npm run dev`) to be running separately.

### 3. Running Individual Test Files or Suites

- **Jest/RTL:** You can usually target specific files or use test name patterns:
  ```bash
  npm test -- MyComponent.test.tsx
  npm test -- -t "should render correctly"
  ```
  _(Consult Jest documentation for specific CLI options)_
- **Cypress:** Use the Cypress GUI (`cypress:open`) to select and run specific spec files interactively.

## Writing Tests

### 1. General Principles

- **Test Behavior, Not Implementation:** Focus tests on verifying the component or function behaves as expected from a user or consumer perspective.
- **Arrange, Act, Assert (AAA):** Structure tests clearly with setup, action execution, and result verification steps.
- **Independence:** Tests should be independent and not rely on the state or outcome of previous tests.
- **Readability:** Write clear, descriptive test names (`it('should do X when Y happens')`).

### 2. Unit Testing (Jest & RTL)

- **Location:** Typically co-located with the source file (`MyComponent.test.tsx`) or in a `__tests__` subdirectory.
- **Focus:** Test utility functions, custom hooks, and simple UI components in isolation.
- **Tools:** Use React Testing Library (RTL) utilities (`render`, `screen`, `fireEvent`, `waitFor`) for component tests.
- **Queries:** Prefer user-centric RTL queries (`getByRole`, `getByLabelText`, `getByText`). Avoid implementation-detail queries (`getByTestId`) unless necessary.
- **Mocking:** Use Jest's mocking capabilities (`jest.fn()`, `jest.mock()`) to isolate the unit under test from its dependencies (e.g., API calls, other modules).

### 3. Integration Testing (Jest & RTL)

- **Location:** Can be co-located or in a central `tests/integration` directory.
- **Focus:** Test the interaction between several components within a feature (e.g., a form with multiple inputs and validation, a list with filtering/sorting).
- **Mocking:** Mock external dependencies (APIs, external services) but allow components within the feature boundary to interact naturally.

### 4. End-to-End Testing (Cypress)

- **Location:** Typically in a root `/cypress` directory.
- **Focus:** Simulate complete user workflows across multiple pages (e.g., login -> create campaign -> view campaign).
- **Selectors:** Use stable selectors (like `data-cy` attributes) that are less likely to break with UI refactoring. Avoid relying heavily on CSS classes or text content.
- **Assertions:** Verify key application states, UI visibility, and data persistence resulting from the workflow.
- **Setup/Teardown:** Use `beforeEach` / `afterEach` hooks for setting up necessary preconditions (e.g., user login, database seeding via API) and cleaning up afterward.

## Best Practices

- **Test Coverage:** While aiming for high coverage is good, prioritize testing critical paths, complex logic, and areas prone to regression.
- **Maintainability:** Write tests that are easy to understand and update as the codebase evolves.
- **Speed:** Keep unit and integration tests fast. E2E tests are naturally slower.
- **CI Integration:** Ensure tests are running reliably in the CI/CD pipeline.

_(Action: Tech Lead/QA Lead to add specific examples, common patterns, and mocking strategies relevant to the Justify codebase.)_
