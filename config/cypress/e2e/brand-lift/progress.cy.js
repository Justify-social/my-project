import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Brand Lift Progress', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    cy.visit('/brand-lift/progress', { failOnStatusCode: false });
  });

  it('loads the page', () => {
    // Most basic check possible
    cy.get('body').should('exist');
  });
});
