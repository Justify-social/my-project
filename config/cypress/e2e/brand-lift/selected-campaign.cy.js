describe('Brand Lift Selected Campaign', () => {
  beforeEach(() => {
    cy.visit('/brand-lift/campaign', { failOnStatusCode: false })
  })

  it('loads the page', () => {
    cy.get('body').should('exist')
  })
})
  