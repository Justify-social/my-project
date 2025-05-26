import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Brand Lift Main Page', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    cy.visit('/brand-lift', { failOnStatusCode: false });
  });

  it('loads the page', () => {
    cy.get('body').should('exist');
  });
});
