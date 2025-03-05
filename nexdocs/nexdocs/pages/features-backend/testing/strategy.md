# Campaign Wizard Testing Documentation

This document outlines the testing strategy, tools, and procedures for the Campaign Wizard application.

## Testing Strategy

Our testing strategy follows a comprehensive approach to ensure the quality and reliability of the Campaign Wizard application. The strategy includes:

1. **Unit Tests**: Testing individual components and functions in isolation
2. **Integration Tests**: Testing interactions between components
3. **API Tests**: Testing the API endpoints for functionality and error handling
4. **End-to-End Tests**: Testing complete user flows
5. **Performance Tests**: Testing application performance under load

## Test Types

### Unit Testing

Unit tests focus on testing individual components, functions, and utilities to ensure they work correctly in isolation.

**Tools**:
- Jest: JavaScript testing framework
- React Testing Library: For testing React components

**Location**: `src/__tests__/unit`

**Command**: `npm run test:unit`

### API Testing

API tests verify that all API endpoints work correctly, handle errors appropriately, and return data in the expected format.

**Tools**:
- Node.js
- node-fetch: For making HTTP requests
- chalk: For colorful output
- UUID: For generating test data

**Location**: `src/scripts/test-api-endpoints.js`

**Command**: `npm run test:api`

### Integration Testing

Integration tests verify that different components of the application work correctly together.

**Tools**:
- Jest
- React Testing Library
- MSW (Mock Service Worker): For mocking API responses

**Location**: `src/__tests__/integration`

**Command**: `npm run test:integration`

### End-to-End Testing

End-to-end tests verify that complete user flows work correctly from start to finish.

**Tools**:
- Cypress: End-to-end testing framework

**Location**: `cypress/integration`

**Command**: `npm run test:e2e`

### Performance Testing

Performance tests verify that the application performs well under load.

**Tools**:
- k6: Load testing tool

**Location**: `performance-tests`

**Command**: `npm run test:performance`

## Running Tests

### Running API Tests

To run the API tests, use the following command:

```bash
npm run test:api
```

This will execute the API tests against the development environment. To run against the test environment:

```bash
npm run test:api:ci
```

The tests will output the results to the console, including a summary of passed, failed, and skipped tests. Example output:

```
▶▶▶ CAMPAIGN WIZARD API ENDPOINT TESTS ◀◀◀
API Base URL: http://localhost:3000/api

▶ Testing Campaign Creation
Creating test campaign: TEST_API_Campaign_1623845678901
✓ PASS: Create campaign with valid data
Created campaign with ID: 550e8400-e29b-41d4-a716-446655440000

▶ Testing Validation
✓ PASS: Validation: missing required field (name)
✓ PASS: Validation: invalid date format
✓ PASS: Validation: invalid enum value

▶ Testing Campaign Retrieval
✓ PASS: Get campaign by ID
✓ PASS: Get all campaigns

▶ Testing Campaign Update
✓ PASS: Update campaign
✓ PASS: Verify campaign update

▶ Testing Error Handling
✓ PASS: Error: non-existent resource
✓ PASS: Error: invalid JSON payload
✓ PASS: Error: unauthorized access

▶ Testing Database Health
✓ PASS: Database health check

▶ Testing Campaign Deletion
✓ PASS: Delete campaign
✓ PASS: Verify campaign deletion

▶▶▶ TEST SUMMARY ◀◀◀
Total Tests: 14
Passed: 14
Failed: 0
Skipped: 0

✅ All tests passed!
```

### Running End-to-End Tests

To run the end-to-end tests, use the following command:

```bash
npm run test:e2e
```

This will open the Cypress test runner. You can then select the test you want to run.

### Running All Tests

To run all tests, use the following command:

```bash
npm run test
```

This will run all unit, integration, API, and end-to-end tests in sequence.

## CI/CD Integration

Our testing strategy is integrated with our CI/CD pipeline. The pipeline runs all tests on every pull request and merge to the main branch. The pipeline will fail if any tests fail, preventing deployment of broken code.

**GitHub Actions Workflow**:

```yaml
name: Test Suite

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Run unit tests
      run: npm run test:unit
    - name: Run integration tests
      run: npm run test:integration
    - name: Run API tests
      run: npm run test:api:ci
    - name: Run E2E tests
      run: npm run test:e2e:headless
```

## Test Data Management

### Test Data Generation

Test data is generated programmatically using factories and fixtures. This ensures that tests are reproducible and isolated.

**Factory Example**:

```javascript
const createTestCampaign = (overrides = {}) => ({
  name: `TEST_Campaign_${Date.now()}`,
  businessGoal: 'Test campaign',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  timeZone: 'UTC',
  primaryContact: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1 (555) 123-4567',
    position: 'Manager'
  },
  ...overrides
});
```

### Database Cleanup

Tests that create data in the database are responsible for cleaning up that data after the test completes. This ensures that tests do not interfere with each other and that the database remains in a clean state.

## Test Coverage

We aim for high test coverage, but focus on testing critical paths and business logic rather than just increasing coverage numbers. Our target coverage is:

- **Unit Tests**: 80%
- **Integration Tests**: 70%
- **API Tests**: 100% of endpoints
- **End-to-End Tests**: Critical user flows

## Best Practices

1. **Isolation**: Tests should be isolated and not depend on each other or external state
2. **Deterministic**: Tests should produce the same results every time they run
3. **Fast**: Tests should run quickly to provide fast feedback
4. **Maintainable**: Tests should be easy to maintain and update as the application evolves
5. **Readable**: Tests should be easy to read and understand
6. **Realistic**: Tests should use realistic data and scenarios

## Troubleshooting

### Common Issues

1. **Tests fail only in CI**: This is often due to environment differences. Check environment variables, database access, and timing issues.
2. **Flaky tests**: Tests that sometimes pass and sometimes fail. Look for race conditions, timing issues, or dependencies on external services.
3. **Slow tests**: Look for unnecessary operations, database calls, or external service calls.

### Getting Help

If you encounter issues with the tests, contact the testing team or raise an issue in the GitHub repository.

## Future Improvements

1. **Visual Regression Testing**: Add visual regression testing to verify UI components
2. **Contract Testing**: Add contract testing to verify API contracts
3. **Property-Based Testing**: Add property-based testing for complex logic
4. **Accessibility Testing**: Add accessibility testing to ensure the application is accessible
5. **Security Testing**: Add security testing to identify vulnerabilities 