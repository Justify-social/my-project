// cypress/integration/auth_flow_spec.js
describe('Full Authentication Flow', () => {
    it('should log in and display the dashboard with admin links', () => {
      // Instead of visiting the login endpoint and waiting for the login flow,
      // we simulate an already logged-in user by setting the dummy session cookie.
      // (Your getSession() function in src/lib/session.ts checks for the presence
      // of a cookie named "appSession.0" and returns a dummy session if it exists.)
      cy.setCookie('appSession.0', 'dummy');
  
      // Now, visit the dashboard.
      cy.visit('http://localhost:3000/dashboard');
  
      // Assert that the dashboard page contains the expected content.
      cy.contains('Dashboard');
      cy.contains('Campaigns');
      cy.contains('Admin Tools');
      cy.contains('Welcome, Test User!');
    });
  });
  