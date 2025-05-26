import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Navigation', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    cy.visit('/', { failOnStatusCode: false });
  });

  it('shows main navigation elements', () => {
    cy.get('nav').should('exist');
  });
});
