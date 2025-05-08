# Testing Strategy

**Last Reviewed:** 2025-05-09
**Status:** Active (Needs Expansion/Review)

## 1. Overview & Philosophy

Testing is a critical component of our development process, aimed at ensuring code quality, preventing regressions, and increasing confidence in deployments. Our strategy employs a multi-layered approach, combining different types of automated tests to cover various aspects of the application.

**Philosophy:**

- **Confidence:** Tests should give us confidence that the application works as expected for users and that new changes haven't broken existing functionality.
- **Maintainability:** Tests should be relatively easy to write, understand, and maintain alongside the application code.
- **Speed:** Provide fast feedback during development (unit/integration) while ensuring critical user flows are covered (E2E).
- **Focus on Behavior:** Prioritize testing _what_ the code does from a user or consumer perspective, rather than _how_ it does it internally (avoid testing implementation details where possible).

**Current Status:** _(Note: As of May 2025, test coverage is acknowledged as low due to previous refactoring/removals. Rebuilding comprehensive test coverage according to this strategy is a high priority.)_

## 2. Testing Pyramid & Types

We aim for a balanced testing pyramid, emphasizing faster, more numerous tests at the lower levels:

```
      /\      E2E Tests (Cypress)
     /  \     - Fewest, slowest, highest integration
    /____\    - Critical user workflows
   /      \   Integration Tests (Jest/RTL)
  /________\  - Moderate number, moderate speed
 /          \ - Interactions between units within a feature
/____________\ Unit Tests (Jest/RTL)
               - Most numerous, fastest
               - Isolated functions, hooks, simple components
```

- **Unit Tests:**
  - **Goal:** Verify small, isolated pieces of code (utility functions, simple hooks, individual components with minimal dependencies) work correctly in isolation.
  - **Focus:** Logic branches, edge cases, return values, basic rendering.
  - **Location:** Co-located (`__tests__`) or central (`tests/unit`).
- **Integration Tests:**
  - **Goal:** Verify that multiple units or components work together correctly within a defined boundary (e.g., a specific feature, a complex component and its children).
  - **Focus:** Interactions, data flow between components, state changes affecting multiple parts of a feature.
  - **Location:** Co-located (`__tests__`) or central (`tests/integration`).
- **End-to-End (E2E) Tests:**
  - **Goal:** Verify complete user workflows through the entire application stack, simulating real user interactions in a browser.
  - **Focus:** Critical user journeys (e.g., sign up, create campaign, view report), ensuring all layers (frontend, API, database) work together.
  - **Location:** Central (`tests/e2e` or `/cypress`).

## 3. Tools

- **Test Runner:** Jest
- **Component Testing (Unit/Integration):** React Testing Library (RTL) with Jest.
- **User Interactions (in RTL):** `@testing-library/user-event`.
- **E2E Testing:** Cypress.
- **Visual/Component Development:** Storybook (Primarily for UI development and visual testing, not automated functional testing in CI).

## 4. Test Location & Organization

- **Unit/Integration Tests (Jest/RTL):** The standard approach is to co-locate test files with the source code they are testing, typically within a `__tests__` subdirectory (e.g., `src/components/ui/Button/__tests__/Button.test.tsx`). Alternatively, a central `/tests/unit` and `/tests/integration` structure mirroring `src/` may be used (confirm project standard).
- **E2E Tests (Cypress):** Reside in a dedicated root directory, typically `/cypress` or `/tests/e2e`.

## 5. Writing Effective Tests

- **Focus on User Behavior (RTL):** Use user-centric queries (`getByRole`, `getByLabelText`, etc.) and simulate user interactions (`userEvent.click`, `userEvent.type`). Avoid testing implementation details.
- **AAA Pattern:** Structure tests clearly: Arrange (set up preconditions), Act (perform the action), Assert (verify the outcome).
- **Independence:** Ensure tests can run independently and in any order.
- **Descriptive Names:** Use clear `describe` and `it` blocks (e.g., `describe('<Button />', () => { it('should call onClick when clicked', () => { ... }); });`).
- **Mocking:** Use Jest's mocking features (`jest.fn`, `jest.mock`) to isolate units or mock external dependencies (APIs, modules) appropriately for the test type.

## 6. Expectations & Coverage

- **New Features/Code:** All new features or significant refactors should include appropriate unit and/or integration tests.
- **Bug Fixes:** Bug fixes should ideally include a regression test to prevent the issue from recurring.
- **Coverage Targets:** _(Action: Define specific code coverage targets if desired, e.g., 70% for critical modules)_. Focus should be on quality and testing critical paths over raw percentage.

## 7. Running Tests

Refer to the **[Local Testing Guide](../guides/developer/local-testing-guide.md)** for specific commands on how to run tests locally.
Tests are also run automatically as part of the CI/CD pipeline.

This strategy provides a framework for ensuring application quality. Consult the linked guides and specific examples within the codebase for practical implementation details.
