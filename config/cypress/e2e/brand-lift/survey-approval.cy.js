describe('Brand Lift Survey Approval', () => {
  beforeEach(() => {
    cy.visit('/brand-lift/survey-approval', { failOnStatusCode: false })
  })

  it('loads the page', () => {
    cy.get('body').should('exist')
  })
})
  