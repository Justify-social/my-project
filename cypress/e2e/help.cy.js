describe('Help Page', () => {
  beforeEach(() => {
    cy.visit('/help', { failOnStatusCode: false })
  })

  it('loads the help page', () => {
    cy.get('main').should('exist')
    cy.contains('Help', { timeout: 10000 }).should('exist')
  })
}) 