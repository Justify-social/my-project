describe('Settings Page', () => {
  beforeEach(() => {
    cy.visit('/settings', { failOnStatusCode: false });
  });

  it('loads the settings page', () => {
    cy.contains('Settings').should('exist');
  });
});
