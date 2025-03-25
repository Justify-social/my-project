describe('Brand Lift Report', () => {
  beforeEach(() => {
    cy.visit('/brand-lift/report', { failOnStatusCode: false })
  })

  it('loads the page', () => {
    cy.get('body').should('exist')
  })
})
  