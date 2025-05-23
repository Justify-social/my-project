/**
 * Authentication Test for Clerk
 * Tests the custom authentication commands with Clerk
 */

describe('Clerk Authentication Test', () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should test mock session authentication', () => {
    cy.log('Testing mock Clerk session authentication');

    // Use session method for fast testing
    cy.login('test@example.com', 'password', { method: 'session' });

    // Verify we're authenticated
    cy.checkAuthState('authenticated');

    // Should be able to access dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should test authentication state checking', () => {
    cy.log('Testing authentication state checking');

    // Should be unauthenticated initially
    cy.checkAuthState('unauthenticated');

    // Login with mock session
    cy.fastLogin('test@example.com');

    // Should now be authenticated
    cy.checkAuthState('authenticated');
  });

  it('should test logout functionality', () => {
    cy.log('Testing logout functionality');

    // Login first
    cy.fastLogin('test@example.com');
    cy.checkAuthState('authenticated');

    // Logout
    cy.logout();

    // Should be unauthenticated
    cy.checkAuthState('unauthenticated');
  });

  // Uncomment this test when you have real test credentials
  /*
    it('should test real UI login', () => {
      cy.log('Testing real Clerk UI login');
      
      // Use real UI login (requires valid test credentials)
      cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'), { method: 'ui' });
      
      // Verify authentication
      cy.checkAuthState('authenticated');
      cy.url().should('include', '/dashboard');
    });
    */
});
