describe('Campaign Wizard - Step 1', () => {
  beforeEach(() => {
    cy.visit('/campaigns/wizard/step-1', { failOnStatusCode: false })
  })

  it('loads step 1 page', () => {
    cy.get('main').should('exist')
    cy.contains('Step 1', { timeout: 10000 }).should('exist')
    // Check for navigation elements
    cy.get('[data-cy="next-button"]').should('exist')
  })
})
  