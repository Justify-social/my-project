describe('Campaign Wizard - Step 2', () => {
  beforeEach(() => {
    cy.visit('/campaigns/wizard/step-2', { failOnStatusCode: false })
  })

  it('loads step 2 page', () => {
    cy.get('main').should('exist')
    cy.contains('Step 2', { timeout: 10000 }).should('exist')
    // Check for navigation elements
    cy.get('[data-cy="next-button"]').should('exist')
  })
})
  