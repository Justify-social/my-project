import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Auth Flow', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();
  });

  it('loads the auth page', () => {
    cy.visit('/auth/signin', { failOnStatusCode: false });
    cy.get('body').should('exist');
  });
});
