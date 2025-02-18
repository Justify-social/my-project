describe('Campaign Wizard - Step 4: Creative Assets', () => {
  beforeEach(() => {
    cy.visit('/campaigns/wizard/step-4', { failOnStatusCode: false })
  })

  it('displays the Creative Assets header', () => {
    cy.contains('Step 4: Creative Assets', { timeout: 10000 }).should('be.visible')
  })

  it('verifies page elements are present', () => {
    // Check for basic page structure
    cy.get('[data-cy="next-button"]').should('exist')
    cy.contains('Save as Draft').should('be.visible')
  })
})
  