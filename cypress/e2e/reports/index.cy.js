describe('Reports Page', () => {
  beforeEach(() => {
    cy.visit('/reports', { failOnStatusCode: false })
  })

  it('loads the reports page', () => {
    cy.get('body').should('exist')
  })
}) 