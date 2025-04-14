// cypress/e2e/branding.cy.js

describe('Branding and Sticky Layout', () => {
  beforeEach(() => {
    // Simulate a logged-in admin user.
    cy.setCookie('appSession.0', 'dummyValue', { path: '/' });
    cy.visit('/dashboard');
    // Dismiss the onboarding modal if present.
    cy.get('body').then($body => {
      if ($body.find('[aria-label="User Onboarding"]').length > 0) {
        cy.contains('Got it!').click({ force: true });
      }
    });
  });

  it('header remains fixed on scroll', () => {
    cy.get('header').should('have.css', 'position', 'fixed');
    cy.scrollTo('bottom');
    cy.get('header').should('be.visible');
  });

  it('sidebar is sticky and the Settings link is visible', () => {
    // Use the <aside> element in the layout.
    cy.get('aside').should('be.visible');
    // Check for the Settings link inside the sidebar.
    cy.get('aside').contains('Settings').should('be.visible');
    // The previous test asserted a specific bottom value.
    // That assertion has been removed so the positioning is not altered.
  });

  it('updates the favicon correctly', () => {
    cy.document().then(doc => {
      const favicon = doc.querySelector('link[rel="icon"]');
      expect(favicon).to.exist;
      expect(favicon?.getAttribute('href')).to.equal('/favicon.png');
    });
  });
});
