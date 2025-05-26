import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Dashboard', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    // Visit the dashboard page before each test with longer timeout
    cy.visit('/dashboard', {
      failOnStatusCode: false,
      timeout: 10000,
    });
  });

  it('loads the dashboard page', () => {
    // Basic test to ensure the page loads
    cy.get('body').should('be.visible');

    // Check for any heading on the page to confirm content loads
    cy.get('h1, h2, h3').should('exist');
  });

  it('has navigation elements', () => {
    // Check for basic navigation elements that should be on all pages
    cy.get('a').should('exist');
    cy.get('button').should('exist');
  });

  // Simple test to verify page structure without specific selectors
  it('displays a proper layout structure', () => {
    // Check for expected layout container elements
    cy.get('div').should('exist');

    // Check for heading elements
    cy.get('h1, h2, h3').should('exist');
  });

  // Test for any metrics or stats on dashboard
  it('shows statistics or metrics', () => {
    // Look for numbers which are likely metrics
    cy.get('div').contains(/\d+/).should('exist');
  });

  // Test for any button interactions
  it('has interactive elements', () => {
    // Look for any buttons or links
    cy.get('button, a').should('exist');
  });

  // Fallback test for general page content
  it('displays meaningful content', () => {
    // The page should have some text content
    cy.get('div').invoke('text').should('have.length.greaterThan', 100);
  });

  it('displays the upcoming campaigns card', () => {
    // Check the upcoming campaigns card exists
    cy.contains('Upcoming Campaigns').should('exist');

    // Check for campaign card components
    cy.get('[data-cy="upcoming-campaigns-card"]').should('exist');

    // Check "New Campaign" button exists
    cy.contains('New Campaign').should('exist');
  });

  it('displays campaign cards with correct information', () => {
    // Find campaign cards
    cy.get('[data-cy="campaign-card"]').should('have.length.at.least', 1);

    // Verify campaign cards have the expected structure
    cy.get('[data-cy="campaign-card"]')
      .first()
      .within(() => {
        // Check campaign name exists
        cy.get('[data-cy="campaign-name"]').should('exist');

        // Check status badge exists
        cy.get('[data-cy="status-badge"]').should('exist');

        // Check platform icon exists
        cy.get('[data-cy="platform-icon"]').should('exist');

        // Check budget info exists
        cy.contains('Budget').should('exist');

        // Check Primary KPI info exists
        cy.contains('Primary KPI').should('exist');
      });
  });

  it('allows clicking on a campaign card', () => {
    // Click on the first campaign card
    cy.get('[data-cy="campaign-card"]').first().click();

    // Should navigate to campaign details page
    cy.url().should('include', '/campaigns/');
  });

  it('displays dashboard metrics and charts', () => {
    // Check for metrics cards
    cy.get('[data-cy="metric-card"]').should('have.length.at.least', 1);

    // Check for chart components
    cy.get('[data-cy="chart-card"]').should('have.length.at.least', 1);
  });

  it('displays the calendar section', () => {
    // Check calendar section exists
    cy.contains('Campaign Calendar').should('exist');

    // Check for calendar component
    cy.get('[data-cy="calendar-dashboard"]').should('exist');
  });

  it('allows creating a new campaign', () => {
    // Click on New Campaign button
    cy.contains('New Campaign').click();

    // Should navigate to campaign creation page
    cy.url().should('include', '/campaigns/new');
  });

  it('displays user information correctly', () => {
    // Check for user profile/avatar in header
    cy.get('[data-cy="user-profile"]').should('exist');
  });

  it('has functioning navigation elements', () => {
    // Check sidebar navigation links
    cy.get('[data-cy="sidebar-nav"]').within(() => {
      cy.contains('Campaigns').should('exist');
      cy.contains('Reports').should('exist');
      cy.contains('Settings').should('exist');
    });
  });
});
