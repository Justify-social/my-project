import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Settings Page', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    cy.visit('/settings', { failOnStatusCode: false });
  });

  it('loads the settings page', () => {
    cy.contains('Settings').should('exist');
  });
});
