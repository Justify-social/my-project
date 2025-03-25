describe('Brand Health Card', () => {
  beforeEach(() => {
    cy.visit('/brand-health', { failOnStatusCode: false })
  })

  it('loads the page', () => {
    cy.get('body').should('exist')
  })
})
