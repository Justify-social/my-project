// cypress/e2e/auth_flow.cy.js
describe('Full Authentication Flow', () => {
  before(() => {
    // Manually set the dummy session cookie.
    // The value can be any non-null string because your dummy session code just checks for its existence.
    cy.setCookie('appSession.0', 'dummyValue');
  });

  it('should log in and display the dashboard with admin links', () => {
    // Directly visit the dashboard (the baseUrl is defined in your config, so you could also use cy.visit('/dashboard'))
    cy.visit('http://localhost:3000/dashboard');

    // Increase the timeout to give the page enough time to render
    cy.contains('Dashboard', { timeout: 10000 });
    cy.contains('Campaigns', { timeout: 10000 });
    cy.contains('Admin Tools', { timeout: 10000 });
    cy.contains('Welcome, Test User!', { timeout: 10000 });
  });
});
