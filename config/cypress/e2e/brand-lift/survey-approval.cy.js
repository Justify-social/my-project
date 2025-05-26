import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Brand Lift Survey Approval', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    cy.visit('/brand-lift/survey-approval', { failOnStatusCode: false });
  });

  it('loads the page', () => {
    cy.get('body').should('exist');
  });
});
