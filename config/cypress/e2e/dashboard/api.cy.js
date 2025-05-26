import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Dashboard API Integration', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    // Mock the API responses before visiting the page
    cy.intercept('GET', '/api/campaigns', {
      fixture: 'dashboard/campaigns.json',
      statusCode: 200,
    }).as('getCampaigns');

    // Visit the dashboard page
    cy.visit('/dashboard');

    // Wait for API call to complete
    cy.wait('@getCampaigns');
  });

  it('loads campaign data from API', () => {
    // Verify that campaign cards are displayed with the mock data
    cy.get('[data-cy="campaign-card"]').should('have.length.at.least', 1);
  });

  it('shows correct metrics from API response', () => {
    // Verify that metrics display the mock data values
    cy.get('[data-cy="metric-card"]')
      .contains('Total Campaigns')
      .parent()
      .within(() => {
        cy.get('p.text-2xl').should('contain', '154');
      });

    cy.get('[data-cy="metric-card"]')
      .contains('Survey Responses')
      .parent()
      .within(() => {
        cy.get('p.text-2xl').should('contain', '3000');
      });
  });

  it('handles API error states gracefully', () => {
    // Refresh the page with a different intercept for error
    cy.intercept('GET', '/api/campaigns', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('getCampaignsError');

    cy.visit('/dashboard');
    cy.wait('@getCampaignsError');

    // Check that an error message is displayed
    cy.contains(/error|failed/i).should('exist');
  });

  it('handles empty campaign data gracefully', () => {
    // Refresh with empty campaigns data
    cy.intercept('GET', '/api/campaigns', {
      statusCode: 200,
      body: {
        success: true,
        campaigns: [],
      },
    }).as('getEmptyCampaigns');

    cy.visit('/dashboard');
    cy.wait('@getEmptyCampaigns');

    // Verify empty state is displayed
    cy.get('[data-cy="upcoming-campaigns-card"]').should('exist');
    cy.get('[data-cy="upcoming-campaigns-card"]').contains('No upcoming campaigns').should('exist');
  });

  it('renders campaign calendar with API data', () => {
    // Verify calendar events are rendered
    cy.get('[data-cy="calendar-dashboard"]').should('exist');

    // Check if calendar events are displayed (this would depend on your mock data)
    cy.get('[data-cy="calendar-dashboard"]').find('.calendar-event').should('exist');
  });

  it('handles data refreshing correctly', () => {
    // Set up an intercept for a data refresh
    cy.intercept('GET', '/api/campaigns', {
      statusCode: 200,
      body: {
        success: true,
        campaigns: [
          {
            id: 999,
            campaignName: 'Refreshed Campaign',
            submissionStatus: 'submitted',
            platform: 'Instagram',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
            totalBudget: 50000,
            primaryKPI: 'Engagement',
          },
        ],
      },
    }).as('refreshData');

    // Trigger a refresh (this might be a polling mechanism or a manual refresh)
    // Find some way to trigger a refresh - maybe clicking a refresh button if one exists
    cy.get('button')
      .contains(/refresh|reload/i)
      .click({ force: true });

    // Wait for the refresh to complete
    cy.wait('@refreshData');

    // Verify the new data appears
    cy.contains('Refreshed Campaign').should('exist');
  });

  it('renders dashboard charts with API data', () => {
    // Check that charts are rendered with the mock data
    cy.get('[data-cy="chart-card"]').should('exist');

    // Verify chart components have SVG elements
    cy.get('[data-cy="chart-card"]').find('svg').should('exist');
  });

  it('supports data filtering by timeframe', () => {
    // Set up an intercept for filtered data
    cy.intercept('GET', '/api/campaigns?timeframe=90d', {
      fixture: 'dashboard/campaigns-90d.json',
      statusCode: 200,
    }).as('getFilteredData');

    // Select a different timeframe
    cy.get('select').select('Last 90 days');

    // Wait for the filtered data to load
    cy.wait('@getFilteredData');

    // Verify filtered data is displayed
    // This would depend on your mock data in the fixture
    cy.get('[data-cy="metric-card"]').should('exist');
  });
});
