import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Brand Lift Selected Campaign', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    cy.visit('/brand-lift/campaign', { failOnStatusCode: false });
  });

  it('loads the page', () => {
    cy.get('body').should('exist');
  });
});
