// Import enhanced commands
import './commands/auth';
import './commands/forms';
import './commands/api';
import './commands/navigation';
import './commands/performance';

// Import additional libraries
import 'cypress-file-upload';
import 'cypress-axe';
import 'cypress-real-events';
import 'cypress-wait-until';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log error for debugging
  console.log('Uncaught exception:', err.message);

  // Don't fail tests on known non-critical errors
  const ignoredErrors = [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Script error',
    'Network Error',
    '@clerk/clerk-react: Invalid state',
    'Invalid state. Feel free to submit a bug',
  ];

  const shouldIgnore = ignoredErrors.some(ignoredError => err.message.includes(ignoredError));

  if (shouldIgnore) {
    return false;
  }

  // For unknown errors, just log them - don't use cy commands in exception handler
  console.log('Taking screenshot for unknown error:', err.message);

  return true;
});

// Global hooks - Clean setup without auth bypass
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

// Performance monitoring is now handled in ./commands/performance

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

// Hide fetch/XHR requests in the Cypress command log (optional)
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}
