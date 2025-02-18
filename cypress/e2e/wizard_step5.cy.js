describe('Campaign Wizard - Step 5', () => {
    beforeEach(() => {
      cy.visit('/campaigns/wizard/step-5', { failOnStatusCode: false })
    })
  
    it('loads step 5 page', () => {
      cy.contains('Step 5').should('exist')
    })
  
    it('allows the user to submit the campaign and navigate to the submission page', () => {
      cy.get('[data-cy="next-button"]').click()
      cy.url().should('include', '/campaigns/wizard/submission')
    })
  })
  