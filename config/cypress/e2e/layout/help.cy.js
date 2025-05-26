import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Help Page', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    cy.visit('/help', { failOnStatusCode: false });
  });

  it('loads the help page', () => {
    cy.get('main').should('exist');
    cy.contains('Help', { timeout: 10000 }).should('exist');
  });
});
