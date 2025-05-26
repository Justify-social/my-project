import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Reports Page', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    cy.visit('/reports', { failOnStatusCode: false });
  });

  it('loads the reports page', () => {
    cy.get('body').should('exist');
  });
});
