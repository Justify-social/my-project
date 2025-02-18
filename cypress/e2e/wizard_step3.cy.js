describe('Campaign Wizard - Step 3: Audience Targeting', () => {
    beforeEach(() => {
      cy.visit('/campaigns/wizard/step-3', { failOnStatusCode: false })
    })
  
    it('displays the Audience Targeting header', () => {
      cy.contains('Step 3: Audience Targeting').should('be.visible')
    })
  
    it('verifies page elements are present', () => {
      cy.get('[data-cy="next-button"]').should('exist')
      cy.contains('Save as Draft').should('be.visible')
    })
  
    it('allows the user to select languages and other demographic options', () => {
      // Fill in required fields
      // Location
      cy.get('[aria-label="Location search"]')
        .type('London')
      cy.get('[role="option"]').contains('London').click()

      // Gender selection
      cy.get('[name="gender"][value="Male"]').check()

      // Languages
      cy.get('[aria-label="Select languages"]')
        .select(['English', 'Spanish'])

      // Wait for form to be valid
      cy.get('[data-cy="next-button"]')
        .should('not.be.disabled')
        .click()

      // Verify navigation
      cy.url().should('include', '/campaigns/wizard/step-4', { timeout: 10000 })
    })
  })
  