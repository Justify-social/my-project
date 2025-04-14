describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/', { failOnStatusCode: false });
  });

  it('shows main navigation elements', () => {
    cy.get('nav').should('exist');
  });
});
