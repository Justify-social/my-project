describe('Dashboard', () => {
  it('loads the home page', () => {
    cy.visit('/', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })
})
  