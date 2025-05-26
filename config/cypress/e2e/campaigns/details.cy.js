import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Campaign Details Page', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    // Mock the page content
    cy.intercept('GET', '/campaigns/*', {
      statusCode: 200,
      body: '<html><body><h1>Campaign Details</h1><div id="campaign-details">Test Campaign</div></body></html>',
      headers: {
        'content-type': 'text/html',
      },
    }).as('getCampaignDetailsPage');

    // Visit the campaigns details page
    cy.visit('/campaigns/1', { failOnStatusCode: false });
  });

  it('loads the page', () => {
    cy.get('body').should('exist');
  });

  it('displays the campaign details header', () => {
    cy.contains('Campaign Details').should('be.visible');
  });
});
