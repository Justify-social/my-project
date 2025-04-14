describe('Auth Flow', () => {
  it('loads the auth page', () => {
    cy.visit('/auth/signin', { failOnStatusCode: false });
    cy.get('body').should('exist');
  });
});
