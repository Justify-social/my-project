# Campaign Tests

This directory contains tests for the Campaign Management functionality.

## Test Files

- `list.cy.js` - Tests for the Campaign List page

  - Table structure verification
  - Search and filtering functionality
  - Pagination and sorting controls
  - Campaign action buttons (view, edit, duplicate, delete)
  - Responsive design (desktop vs mobile)

- `details.cy.js` - Tests for the Campaign Details page

  - Campaign information display
  - Status badge verification
  - Metrics and KPIs display
  - Audience information presentation
  - Assets gallery
  - Action buttons functionality
  - Timeline events display

- `crud.cy.js` - Tests for Campaign CRUD operations

  - Creating new campaigns
  - Reading campaign information
  - Updating existing campaigns
  - Deleting campaigns

- `api.cy.js` - Tests for Campaign API endpoints
  - API response structure
  - Error handling
  - Data validation

## Wizard Tests

The `wizard/` subdirectory contains tests for each step of the Campaign Wizard:

- `step1-overview.cy.js` - Campaign Overview

  - Form field validation
  - Date range validation
  - Budget input
  - Brand selection

- `step2-objectives.cy.js` - Campaign Objectives

  - KPI selection
  - Objectives selection
  - Target metrics

- `step3-audience.cy.js` - Audience Targeting

  - Location selection
  - Demographics (gender, age)
  - Languages
  - Custom screening questions

- `step4-assets.cy.js` - Creative Assets

  - Asset uploading
  - Asset library integration
  - Asset metadata editing
  - Asset validation

- `step5-review.cy.js` - Review & Submit

  - Campaign summary verification
  - Edit links functionality
  - Validation and submission process

- `submission.cy.js` - Submission Confirmation
  - Confirmation display
  - Navigation options
  - Status tracking

## Test Data

Test fixtures are located in `cypress/fixtures/`:

- `campaigns.json` - Mock data for campaign list
- `campaign_details.json` - Mock data for campaign details
- `campaign_form_data.json` - Mock data for wizard form inputs

## Running Campaign Tests

To run all campaign tests:

```
npx cypress run --spec "cypress/e2e/campaigns/**/*.cy.js"
```

To run only the wizard tests:

```
npx cypress run --spec "cypress/e2e/campaigns/wizard/*.cy.js"
```
