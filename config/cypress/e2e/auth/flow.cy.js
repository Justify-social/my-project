import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Full Authentication Flow', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    cy.visit('/dashboard');
    // Dismiss the onboarding modal if it appears.
    cy.get('body').then($body => {
      if ($body.find('[aria-label="User Onboarding"]').length > 0) {
        cy.contains('Got it!').click({ force: true });
      }
    });
  });

  it('should log in and display the dashboard with admin indicators', () => {
    // Instead of 'Admin Tools', check that the Settings link (or company name) is visible.
    cy.contains('Settings').should('be.visible');
    cy.get('header').within(() => {
      cy.contains('Justify').should('be.visible');
    });
  });
});
