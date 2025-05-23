/**
 * Form Interaction Commands
 * Enhanced form handling following Cypress best practices
 */

// Fill form by data-cy attributes
Cypress.Commands.add('fillFormByTestId', (formData, options = {}) => {
  const { submitAfterFill = false, waitForResponse = null } = options;

  Object.entries(formData).forEach(([field, value]) => {
    if (value === null || value === undefined) return;

    const selector = `[data-cy="${field}"]`;

    cy.get(selector).then($el => {
      const elementType = $el.prop('tagName').toLowerCase();
      const inputType = $el.prop('type');

      if (elementType === 'select') {
        cy.get(selector).select(value);
      } else if (inputType === 'checkbox') {
        if (value) {
          cy.get(selector).check();
        } else {
          cy.get(selector).uncheck();
        }
      } else if (inputType === 'radio') {
        cy.get(selector).check(value);
      } else if (
        elementType === 'textarea' ||
        inputType === 'text' ||
        inputType === 'email' ||
        inputType === 'password'
      ) {
        cy.get(selector).clear().type(value);
      } else if (inputType === 'file') {
        cy.get(selector).selectFile(value);
      } else {
        cy.get(selector).clear().type(value);
      }
    });
  });

  if (submitAfterFill) {
    if (waitForResponse) {
      cy.intercept(waitForResponse.method, waitForResponse.url).as('formSubmission');
    }
    cy.get('[data-cy="submit"], [type="submit"]').click();
    if (waitForResponse) {
      cy.wait('@formSubmission');
    }
  }
});

// Validate form errors
Cypress.Commands.add('expectFormErrors', expectedErrors => {
  Object.entries(expectedErrors).forEach(([field, errorMessage]) => {
    cy.get(`[data-cy="${field}-error"]`).should('contain', errorMessage);
  });
});

// Clear form
Cypress.Commands.add('clearForm', fields => {
  fields.forEach(field => {
    cy.get(`[data-cy="${field}"]`).clear();
  });
});

// Validate form values
Cypress.Commands.add('expectFormValues', expectedValues => {
  Object.entries(expectedValues).forEach(([field, expectedValue]) => {
    cy.get(`[data-cy="${field}"]`).should('have.value', expectedValue);
  });
});
