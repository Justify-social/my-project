// /Users/edadams/my-project/cypress/e2e/onboarding.cy.js
describe('Onboarding Modal', () => {
  beforeEach(() => {
    // Clear cookies and local storage to simulate a fresh session.
    cy.clearCookies();
    cy.clearLocalStorage();
    // Set the dummy session cookie so that getSession returns a valid session.
    cy.setCookie("appSession.0", "dummyValue");
  });

  it('displays the onboarding modal for a new user', () => {
    // Visit the dashboard. The modal should appear if the user hasn't seen onboarding.
    cy.visit('/dashboard');

    // Use the class selector to find the modal.
    cy.get('.onboarding-modal', { timeout: 10000 })
      .should('be.visible');

    // Verify expected content is present.
    cy.contains('Welcome to the Dashboard!');
    cy.contains("Here’s a quick guide to get you started.");
    cy.contains('button', 'Got it!').should('be.visible');
  });

  it('dismisses the onboarding modal when "Got it!" is clicked', () => {
    // Intercept the API call that updates the user's onboarding status.
    cy.intercept('POST', '/api/user/setOnboardingTrue').as('setOnboarding');

    cy.visit('/dashboard');

    // Ensure the modal is visible.
    cy.get('.onboarding-modal', { timeout: 10000 })
      .should('be.visible');

    // Click the "Got it!" button.
    cy.contains('button', 'Got it!').click();

    // Wait for the API call to complete and verify a 200 status code.
    cy.wait('@setOnboarding').its('response.statusCode').should('eq', 200);

    // Confirm that the modal is no longer visible.
    cy.get('.onboarding-modal').should('not.exist');
  });
});
