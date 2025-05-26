/**
 * Simple Official Clerk Test - Based on Official Example
 *
 * This test exactly follows the pattern from:
 * https://github.com/clerk/example-cypress-nextjs/blob/main/cypress/e2e/testing-tokens.cy.ts
 */
import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Official Clerk Simple Test', () => {
  it('should access protected route with Testing Token', () => {
    setupClerkTestingToken();

    cy.visit('/dashboard');

    // Simple assertion - just check we're not redirected to sign-in
    cy.url().should('not.include', '/sign-in');
    cy.url().should('include', '/dashboard');

    // Check the page loaded successfully
    cy.get('body').should('be.visible');
  });

  it('should access marketplace with Testing Token', () => {
    setupClerkTestingToken();

    cy.visit('/influencer-marketplace');

    // Simple assertion
    cy.url().should('not.include', '/sign-in');
    cy.url().should('include', '/influencer-marketplace');

    cy.get('body').should('be.visible');
  });
});
