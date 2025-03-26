import 'cypress-file-upload'; 

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom command to verify form field validation
Cypress.Commands.add('verifyValidationError', (fieldName, errorMessage) => {
  cy.get(`[data-testid="${fieldName}-error"]`).should('contain', errorMessage);
});

// Custom command to fill a form
Cypress.Commands.add('fillForm', (formFields) => {
  Object.entries(formFields).forEach(([field, value]) => {
    if (typeof value === 'boolean') {
      // Handle checkbox/toggle
      if (value) {
        cy.get(`[name="${field}"]`).check();
      } else {
        cy.get(`[name="${field}"]`).uncheck();
      }
    } else {
      // Handle text input, select, etc.
      cy.get(`[name="${field}"]`).clear().type(value);
    }
  });
}); 