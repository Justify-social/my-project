# Testing Guide

This document provides comprehensive guidance for writing and running tests in our project. Following these guidelines ensures consistent test quality and maintainability.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Directory Structure](#test-directory-structure)
- [Testing Tools](#testing-tools)
- [Types of Tests](#types-of-tests)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Testing Best Practices](#testing-best-practices)
- [End-to-End Testing](#end-to-end-testing)
- [Test Maintenance](#test-maintenance)

## Testing Philosophy

Our testing approach follows these key principles:

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it's implemented
2. **Prioritize User Perspective**: Test from the user's point of view whenever possible
3. **Isolate Tests**: Tests should not depend on each other
4. **Maintain Fast Feedback**: Tests should run quickly to maintain developer productivity
5. **Cover Edge Cases**: Test boundary conditions and error scenarios
6. **Keep Tests Simple**: Tests should be easy to understand and maintain

## Test Directory Structure

Tests are organized in a structured way to match their purpose:

```
project/
├── src/
│   └── components/
│       └── ...
├── tests/
│   ├── unit/               # Unit tests for isolated functions
│   │   ├── utils/
│   │   ├── hooks/
│   │   └── ...
│   ├── integration/        # Tests that check multiple units working together
│   │   ├── features/
│   │   ├── api/
│   │   └── ...
│   ├── e2e/                # End-to-end tests with Cypress
│   │   ├── auth/
│   │   ├── campaigns/
│   │   └── ...
│   └── __mocks__/          # Mock implementations for tests
│       ├── next/
│       ├── services/
│       └── ...
└── cypress/                # Cypress configuration and support files
    ├── fixtures/
    ├── integration/
    └── support/
```

## Testing Tools

Our testing stack includes:

- **Jest**: Our primary test runner and assertion library
- **React Testing Library**: For testing React components
- **Cypress**: For end-to-end testing
- **MSW (Mock Service Worker)**: For mocking API requests
- **Jest Axe**: For accessibility testing

## Types of Tests

### Unit Tests

Unit tests verify that individual functions or components work correctly in isolation.

**Best for**:

- Pure functions
- Utility functions
- Hooks
- Small, isolated components

**Example**:

```typescript
// utils/formatDate.test.ts
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats a date in the correct format', () => {
    const date = new Date('2025-03-15T12:30:00Z');
    expect(formatDate(date)).toBe('March 15, 2025');
  });

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('');
  });
});
```

### Integration Tests

Integration tests verify that multiple units work together correctly.

**Best for**:

- Feature components
- API endpoints
- State management
- Form submissions

**Example**:

```typescript
// features/auth/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '@/contexts/auth';

describe('LoginForm', () => {
  it('submits the form with user credentials', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ success: true });

    render(
      <AuthProvider loginFn={mockLogin}>
        <LoginForm />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' }
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123'
      });
    });
  });
});
```

### End-to-End Tests

E2E tests verify that complete user flows work correctly from start to finish.

**Best for**:

- Critical user journeys
- Business processes
- Multi-step workflows

**Example**:

```typescript
// cypress/integration/campaigns/create-campaign.spec.ts
describe('Campaign Creation', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/campaigns/new');
  });

  it('creates a new campaign successfully', () => {
    // Step 1: Fill out campaign basics
    cy.getByTestId('campaign-name').type('Test Campaign');
    cy.getByTestId('campaign-goal').type('Increase brand awareness');
    cy.getByTestId('next-button').click();

    // Step 2: Fill out audience information
    cy.getByTestId('target-audience').type('Young professionals');
    cy.getByTestId('next-button').click();

    // Step 3: Fill out budget information
    cy.getByTestId('budget-amount').type('10000');
    cy.getByTestId('submit-button').click();

    // Assert: Campaign created
    cy.url().should('include', '/campaigns');
    cy.contains('Campaign created successfully');
  });
});
```

## Writing Tests

### Unit Test Structure

Follow this structure for unit tests:

1. **Arrange**: Set up test data and conditions
2. **Act**: Perform the action being tested
3. **Assert**: Verify the expected outcome

```typescript
describe('ComponentName', () => {
  describe('behavior category', () => {
    it('should do something specific', () => {
      // Arrange
      const props = {
        /* ... */
      };

      // Act
      const { result } = renderHook(() => useMyHook(props));

      // Assert
      expect(result.current).toEqual(expectedValue);
    });
  });
});
```

### Integration Test Structure

For integration tests, focus on user interactions:

```typescript
describe('FeatureName', () => {
  it('allows the user to complete a specific task', async () => {
    // Arrange
    render(<ComponentWithProviders />);

    // Act: User interactions
    userEvent.click(screen.getByText('Submit'));

    // Assert: Expected outcomes
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });
});
```

### Common Testing Patterns

#### Testing Asynchronous Code

```typescript
it('loads data asynchronously', async () => {
  // Arrange
  render(<AsyncComponent />);

  // Assert initial loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Wait for data to load
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  // Assert loaded state
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});
```

#### Testing Error States

```typescript
it('handles errors gracefully', async () => {
  // Arrange: Set up a scenario that will cause an error
  server.use(
    rest.get('/api/data', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  render(<DataFetchingComponent />);

  // Wait for error state
  await waitFor(() => {
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
  });

  // Assert that retry mechanism is available
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});
```

## Running Tests

### Command Line

Run tests using npm scripts defined in package.json:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

We aim for high test coverage, but prioritize meaningful tests over coverage numbers. Focus on covering:

1. Critical business logic
2. Edge cases and error conditions
3. User-facing functionality
4. Recent bug fixes

Check coverage with:

```bash
npm run test:coverage
```

## Testing Best Practices

### Do's and Don'ts

✅ **Do**:

- Test from the user's perspective
- Use meaningful test and variable names
- Keep tests independent and isolated
- Test edge cases and error scenarios
- Clean up after tests (restore mocks, clear state)

❌ **Don't**:

- Test implementation details
- Use unnecessary mocks
- Write brittle tests that break with minor changes
- Create tests that depend on one another
- Write tests just to increase coverage

### Testing React Components

- Use React Testing Library's queries in this order of preference:
  1. Accessible queries (`getByRole`, `getByLabelText`, `getByPlaceholderText`)
  2. Text content (`getByText`)
  3. Test IDs (`getByTestId`) - use as a last resort

```typescript
// Preferred: Using accessible queries
const submitButton = screen.getByRole('button', { name: /submit/i });

// Less preferred: Using text content
const submitButton = screen.getByText(/submit/i);

// Least preferred: Using test IDs
const submitButton = screen.getByTestId('submit-button');
```

### Mocking

- Mock external dependencies, not the component under test
- Use Jest's mock functions for simple mocks
- Use Mock Service Worker (MSW) for API mocks
- Prefer shallow, focused mocks over deep, broad ones

```typescript
// Mocking a module
jest.mock('@/services/api', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' }),
}));

// Mocking with MSW
rest.get('/api/user', (req, res, ctx) => {
  return res(ctx.status(200), ctx.json({ id: 1, name: 'Test User' }));
});
```

## End-to-End Testing

### Cypress Best Practices

1. **Use custom commands** for repeated actions:

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('login', (email = 'user@example.com', password = 'password') => {
  cy.visit('/login');
  cy.get('[data-testid=email]').type(email);
  cy.get('[data-testid=password]').type(password);
  cy.get('[data-testid=submit]').click();
  cy.url().should('include', '/dashboard');
});
```

2. **Use data attributes** for selecting elements:

```html
<button data-testid="submit-button">Submit</button>
```

```typescript
cy.get('[data-testid=submit-button]').click();
```

3. **Properly handle async operations**:

```typescript
cy.intercept('POST', '/api/campaigns').as('createCampaign');
cy.get('[data-testid=submit-button]').click();
cy.wait('@createCampaign');
cy.get('[data-testid=success-message]').should('be.visible');
```

## Test Maintenance

### Dealing with Flaky Tests

1. **Identify** flaky tests by running them multiple times
2. **Isolate** the cause (timing issues, race conditions, etc.)
3. **Fix** by adding proper waiting, improving selectors, or removing dependencies
4. **Monitor** to ensure the fix works consistently

### Test Refactoring

When refactoring tests:

1. Ensure they still test the same behavior
2. Improve readability and maintainability
3. Remove duplication by extracting common setup
4. Keep test files focused on specific functionality

## Conclusion

Following these testing guidelines will help ensure our tests are reliable, maintainable, and valuable. Remember that tests are also code and deserve the same level of care and attention as production code.

If you have questions or suggestions for improving this guide, please open an issue or pull request.
