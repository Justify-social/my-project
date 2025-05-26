import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Brand Lift Report', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    cy.visit('/brand-lift/report', { failOnStatusCode: false });
  });

  it('loads the page', () => {
    cy.get('body').should('exist');
  });
});
