describe('Brand Lift Main Page', () => {
  beforeEach(() => {
    cy.visit('/brand-lift', { failOnStatusCode: false })
  })

  it('loads the page', () => {
    cy.get('body').should('exist')
  })
})
  