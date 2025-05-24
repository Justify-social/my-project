/**
 * Base Page Object - SSOT for Common Page Functionality
 *
 * This class contains common patterns and utilities that all page objects inherit.
 * Ensures consistent behavior and reduces code duplication across page objects.
 */

export class BasePage {
  constructor() {
    this.defaultTimeout = 10000;
    this.shortTimeout = 5000;
    this.loadTimeout = 15000;
  }

  // Common element patterns
  getElementWithTimeout(selector, timeout = this.defaultTimeout) {
    return cy.get(selector, { timeout });
  }

  waitForElementVisible(selector, timeout = this.defaultTimeout) {
    return cy.get(selector, { timeout }).should('be.visible');
  }

  waitForElementToDisappear(selector, timeout = this.defaultTimeout) {
    return cy.get(selector, { timeout }).should('not.exist');
  }

  // Navigation utilities
  visitAndWaitForLoad(url, expectedElement = 'body') {
    cy.visit(url);
    this.waitForElementVisible(expectedElement, this.loadTimeout);
    return this;
  }

  // Form interactions
  fillInput(selector, value, options = {}) {
    const { clear = true, validate = true } = options;

    const input = cy.get(selector);

    if (clear) {
      input.clear();
    }

    input.type(value);

    if (validate) {
      input.should('have.value', value);
    }

    return this;
  }

  selectOption(selector, value) {
    cy.get(selector).select(value);
    cy.get(selector).should('have.value', value);
    return this;
  }

  clickButton(selector, options = {}) {
    const { timeout = this.defaultTimeout, force = false } = options;

    cy.get(selector, { timeout }).should('be.visible').and('not.be.disabled').click({ force });

    return this;
  }

  // Wait patterns for SSOT dynamic waiting
  waitForApiCall(alias, timeout = this.defaultTimeout) {
    cy.wait(alias, { timeout });
    return this;
  }

  waitForMultipleApiCalls(aliases, timeout = this.defaultTimeout) {
    aliases.forEach(alias => {
      cy.wait(alias, { timeout });
    });
    return this;
  }

  // Assertion utilities
  expectUrl(urlPattern) {
    cy.url().should('include', urlPattern);
    return this;
  }

  expectElement(selector, assertion = 'be.visible') {
    cy.get(selector).should(assertion);
    return this;
  }

  expectText(selector, text, contains = true) {
    const assertion = contains ? 'contain' : 'have.text';
    cy.get(selector).should(assertion, text);
    return this;
  }

  // Error handling
  handleConditionalElement(selector, callback, timeout = this.shortTimeout) {
    cy.get('body').then($body => {
      if ($body.find(selector).length > 0) {
        callback();
      }
    });
    return this;
  }

  dismissModalIfPresent(modalSelector = '[role="dialog"]', closeSelector = '[aria-label="Close"]') {
    this.handleConditionalElement(modalSelector, () => {
      cy.get(closeSelector).click();
    });
    return this;
  }

  // Performance and accessibility utilities
  measurePagePerformance(budget = 3000) {
    cy.measurePageLoadTime(cy.url(), { performanceBudget: budget });
    return this;
  }

  checkAccessibility(selector = null) {
    cy.checkA11y(selector);
    return this;
  }

  // Data-cy selector utilities for consistent attribute usage
  getByDataCy(dataCyValue, timeout = this.defaultTimeout) {
    return cy.get(`[data-cy="${dataCyValue}"]`, { timeout });
  }

  clickByDataCy(dataCyValue, options = {}) {
    this.getByDataCy(dataCyValue).click(options);
    return this;
  }

  typeInDataCy(dataCyValue, text, options = {}) {
    const { clear = true } = options;
    const input = this.getByDataCy(dataCyValue);

    if (clear) {
      input.clear();
    }

    input.type(text);
    return this;
  }

  expectDataCyVisible(dataCyValue, timeout = this.defaultTimeout) {
    this.getByDataCy(dataCyValue, timeout).should('be.visible');
    return this;
  }

  expectDataCyText(dataCyValue, text, contains = true) {
    const assertion = contains ? 'contain' : 'have.text';
    this.getByDataCy(dataCyValue).should(assertion, text);
    return this;
  }

  // Logging and debugging utilities
  logAction(action, details = '') {
    cy.log(`🎯 ${action}${details ? `: ${details}` : ''}`);
    return this;
  }

  takeScreenshot(name) {
    cy.screenshot(name);
    return this;
  }

  // Test data cleanup - for test independence
  resetPageState() {
    // Override in child classes for page-specific reset logic
    cy.clearLocalStorage();
    cy.clearCookies();
    return this;
  }
}
