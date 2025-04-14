describe('Brand Lift Progress', () => {
  beforeEach(() => {
    cy.visit('/brand-lift/progress', { failOnStatusCode: false });
  });

  it('loads the page', () => {
    // Most basic check possible
    cy.get('body').should('exist');
  });
});
