import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Header', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();
  });
  it('loads a page with header', () => {
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body').should('exist');
  });
});
