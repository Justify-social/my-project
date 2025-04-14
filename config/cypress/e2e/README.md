# Cypress E2E Tests

This directory contains end-to-end tests organized by feature area.

## Directory Structure

- **auth/** - Authentication related tests

  - `flow.cy.js` - Full authentication flow tests
  - `signin.cy.js` - Sign-in page tests

- **billing/** - Billing functionality tests

  - `index.cy.js` - Main billing page tests

- **brand-health/** - Brand health feature tests

  - `card.cy.js` - Brand health card component tests
  - `index.cy.js` - Main brand health page tests

- **brand-lift/** - Brand lift feature tests

  - `index.cy.js` - Main brand lift page tests
  - `progress.cy.js` - Progress tracking tests
  - `report.cy.js` - Report generation tests
  - `selected-campaign.cy.js` - Campaign selection tests
  - `survey-approval.cy.js` - Survey approval tests
  - `survey-design.cy.js` - Survey design tests
  - `survey-preview.cy.js` - Survey preview tests

- **campaigns/** - Campaign management tests

  - `api.cy.js` - Campaign API tests
  - `crud.cy.js` - Campaign CRUD operation tests
  - `details.cy.js` - Campaign details page tests
  - `list.cy.js` - Campaign list page tests
  - **wizard/** - Campaign wizard tests
    - `step1-overview.cy.js` - Step 1: Campaign Overview
    - `step2-objectives.cy.js` - Step 2: Campaign Objectives
    - `step3-audience.cy.js` - Step 3: Audience Targeting
    - `step4-assets.cy.js` - Step 4: Creative Assets
    - `step5-review.cy.js` - Step 5: Review & Submit
    - `submission.cy.js` - Submission confirmation page

- **layout/** - Layout and navigation tests

  - `branding.cy.js` - Branding elements tests
  - `dashboard.cy.js` - Dashboard layout tests
  - `header.cy.js` - Header component tests
  - `help.cy.js` - Help page tests
  - `navigation.cy.js` - Navigation component tests
  - `noHydrationError.cy.js` - Hydration error tests
  - `settings.cy.js` - Settings page tests
  - `sidebar_navigation.cy.js` - Sidebar navigation tests

- **reports/** - Reporting functionality tests
  - `generation.cy.js` - Report generation tests
  - `index.cy.js` - Main reports page tests

## Best Practices

When creating new tests:

1. Place them in the appropriate feature directory
2. Follow the naming convention of the existing tests
3. If creating tests for a new feature, create a new directory
4. Use the `index.cy.js` naming for main page tests

### Lessons from Campaign Test Updates

1. **Authentication Handling**:

   - Use `cy.setCookie()` to bypass authentication
   - Handle uncaught exceptions with `cy.on('uncaught:exception', () => false)`
   - Mock API responses for auth-dependent endpoints

2. **Page Structure Testing**:

   - Test basic page load and UI elements first
   - Verify headers, sections, and critical UI components
   - Test responsive behavior for mobile views

3. **Form Testing**:

   - Test validation of required fields
   - Test validation of field formats and relationships
   - Test form submission and error handling

4. **API Mocking**:

   - Use `cy.intercept()` to mock API responses
   - Create fixtures for reusable API response data
   - Test both success and error API scenarios

5. **Navigation Testing**:

   - Test navigation between wizard steps
   - Verify URL changes during navigation
   - Test browser back/forward behavior

6. **Error Handling**:
   - Test form validation error messages
   - Test API error states
   - Verify user feedback for errors

## Running Tests

To run all tests:

```

```
