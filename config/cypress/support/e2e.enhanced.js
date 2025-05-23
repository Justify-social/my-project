// Import enhanced commands
import './commands/auth';
import './commands/forms';
import './commands/api';
import './commands/navigation';

// Import additional libraries
import 'cypress-file-upload';
import 'cypress-axe';
import 'cypress-real-events';
import 'cypress-wait-until';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log error for debugging
  cy.log('Uncaught exception:', err.message);

  // Don't fail tests on known non-critical errors
  const ignoredErrors = [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Script error',
    'Network Error',
  ];

  const shouldIgnore = ignoredErrors.some(ignoredError => err.message.includes(ignoredError));

  if (shouldIgnore) {
    return false;
  }

  // Capture screenshot for unknown errors
  cy.screenshot('uncaught-exception', {
    capture: 'fullPage',
    onAfterScreenshot: details => {
      cy.log(`Screenshot saved: ${details.path}`);
    },
  });

  return true;
});

// Global hooks
beforeEach(() => {
  // Clear state before each test
  cy.clearLocalStorage();
  cy.clearCookies();

  // Set viewport for consistency
  cy.viewport(1280, 720);

  // Dismiss onboarding modals if they appear
  cy.get('body').then($body => {
    if ($body.find('[aria-label="User Onboarding"]').length > 0) {
      cy.contains('Got it!').click({ force: true });
    }
  });
});

// Performance monitoring
Cypress.Commands.add('measurePageLoadTime', url => {
  cy.visitWithPerformance(url, { performanceBudget: 3000 });
});

// Accessibility testing
Cypress.Commands.add('checkA11y', (selector = null, options = {}) => {
  cy.injectAxe();
  cy.checkA11y(selector, options);
});

// Console error checking
Cypress.Commands.add('expectNoConsoleErrors', () => {
  cy.window().then(win => {
    const errors = win.console.error.args || [];
    expect(errors, 'Console errors found').to.have.length(0);
  });
});

// Enhanced waiting
Cypress.Commands.add('waitUntilVisible', (selector, options = {}) => {
  const { timeout = 10000 } = options;
  cy.waitUntil(() => cy.get(selector).then($el => $el.is(':visible')), { timeout });
});
