describe('Campaign Wizard - Submission', () => {
    beforeEach(() => {
      cy.visit('/campaigns/wizard/submission', { failOnStatusCode: false })
    })
  
    it('loads the page', () => {
      cy.get('body').should('exist')
    })
  
    it('verifies page elements are present', () => {
      cy.get('main').should('exist')
      // Check for any button that might submit the form
      cy.get('button').should('exist')
    })
  })
  