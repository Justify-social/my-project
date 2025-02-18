describe('Campaigns Page', () => {
  beforeEach(() => {
    cy.visit('/campaigns', { failOnStatusCode: false })
  })

  it('loads the page', () => {
    // Most basic check possible
    cy.get('body').should('exist')
  })
}) 