import { BasePage } from '../shared/BasePage.js';

/**
 * Sign-In Page Object Model
 * Encapsulates Clerk sign-in page interactions
 * Works with our actual authentication implementation
 */

export class SignInPage extends BasePage {
  // Element selectors - Updated to match actual Clerk implementation
  elements = {
    // Since Clerk components don't have data-cy attributes, we use Clerk's selectors
    emailInput: () => cy.get('input[name="identifier"]'),
    passwordInput: () => cy.get('input[name="password"]'),
    continueButton: () => cy.get('button[data-localization-key="formButtonPrimary"]'),
    submitButton: () => cy.get('button[type="submit"]'),
    errorMessage: () => cy.get('[data-localization-key*="error"]'),
    signUpLink: () => cy.get('a[href*="sign-up"]'),
    // Auth layout elements (these don't have Clerk's data-cy but our custom layout does)
    authLayout: () => cy.get('body'),
  };

  // Page actions
  visit() {
    cy.visit('/sign-in');
    // Wait for Clerk to load
    cy.get('input[name="identifier"]', { timeout: 10000 }).should('be.visible');
    return this;
  }

  fillEmail(email) {
    this.elements.emailInput().clear().type(email);
    return this;
  }

  fillPassword(password) {
    this.elements.passwordInput().clear().type(password);
    return this;
  }

  fillCredentials(email, password) {
    this.fillEmail(email);
    // Click continue to go to password step (Clerk's multi-step flow)
    this.elements.continueButton().click();

    // Wait for password field to appear
    this.elements.passwordInput().should('be.visible');
    this.fillPassword(password);
    return this;
  }

  submit() {
    this.elements.submitButton().click();
    return this;
  }

  clickSignUp() {
    this.elements.signUpLink().click();
    return this;
  }

  // Assertions
  expectSuccessfulLogin() {
    // Should redirect to dashboard after successful login
    cy.url().should('include', '/dashboard');
    // Dashboard should load
    cy.get('[data-cy="dashboard-content"]', { timeout: 15000 }).should('be.visible');
    return this;
  }

  expectLoginError(message) {
    this.elements.errorMessage().should('be.visible');
    if (message) {
      this.elements.errorMessage().should('contain', message);
    }
    return this;
  }

  expectToBeOnSignInPage() {
    cy.url().should('include', '/sign-in');
    this.elements.emailInput().should('be.visible');
    return this;
  }

  // Complete workflows
  loginWithCredentials(email, password) {
    return this.visit().fillCredentials(email, password).submit();
  }

  loginWithValidCredentials() {
    return this.loginWithCredentials(
      Cypress.env('TEST_USER_EMAIL'),
      Cypress.env('TEST_USER_PASSWORD')
    );
  }

  // Quick sign-in for test setup (bypasses UI for speed)
  quickSignIn(
    email = Cypress.env('TEST_USER_EMAIL'),
    password = Cypress.env('TEST_USER_PASSWORD')
  ) {
    // Use our custom auth command for faster test setup
    cy.login(email, password, { method: 'session' });
    return this;
  }
}
