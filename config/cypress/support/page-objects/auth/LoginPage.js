/**
 * Login Page Object Model
 * Encapsulates login page interactions
 */

export class LoginPage {
  // Element selectors
  elements = {
    emailInput: () => cy.get('[data-cy="email-input"]'),
    passwordInput: () => cy.get('[data-cy="password-input"]'),
    submitButton: () => cy.get('[data-cy="login-submit"]'),
    errorMessage: () => cy.get('[data-cy="login-error"]'),
    forgotPasswordLink: () => cy.get('[data-cy="forgot-password"]'),
    signUpLink: () => cy.get('[data-cy="sign-up-link"]'),
  };

  // Page actions
  visit() {
    cy.visit('/auth/signin');
    this.elements.emailInput().should('be.visible');
    return this;
  }

  fillCredentials(email, password) {
    this.elements.emailInput().clear().type(email);
    this.elements.passwordInput().clear().type(password);
    return this;
  }

  submit() {
    this.elements.submitButton().click();
    return this;
  }

  clickForgotPassword() {
    this.elements.forgotPasswordLink().click();
    return this;
  }

  clickSignUp() {
    this.elements.signUpLink().click();
    return this;
  }

  // Assertions
  expectSuccessfulLogin() {
    cy.url().should('not.include', '/auth/signin');
    cy.get('[data-cy="user-menu"]').should('be.visible');
    return this;
  }

  expectLoginError(message) {
    this.elements.errorMessage().should('be.visible').and('contain', message);
    return this;
  }

  expectToBeOnLoginPage() {
    cy.url().should('include', '/auth/signin');
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
}
