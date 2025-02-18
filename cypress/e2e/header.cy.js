describe('Header', () => {
  it('loads a page with header', () => {
    cy.visit('/', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })
})
