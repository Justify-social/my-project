// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Import cypress-file-upload
import 'cypress-file-upload';

// Hide fetch/XHR requests in the Cypress command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Preserve cookies between tests for session handling
Cypress.Cookies.defaults({
  preserve: ['authToken', 'sessionId'],
});

// Custom command for logging in
Cypress.Commands.add('login', (email = 'admin@example.com', role = 'admin') => {
  localStorage.setItem('authToken', 'fake-token-for-testing');
  localStorage.setItem('user', JSON.stringify({ id: '1', email, role }));
});

// Custom command for navigating to settings page sections
Cypress.Commands.add('navigateToSettings', section => {
  cy.visit('/settings');
  if (section) {
    cy.contains(section).click();
  }
});
