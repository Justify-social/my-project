describe('Sidebar Navigation', () => {
  beforeEach(() => {
    // Simulate a logged-in user by setting a dummy session cookie.
    cy.setCookie('appSession.0', 'dummyValue', { path: '/' });
    // Visit the dashboard page (which includes the sidebar).
    cy.visit('/dashboard');
    // Dismiss the onboarding modal if it appears.
    cy.get('body').then($body => {
      if ($body.find('[aria-label="User Onboarding"]').length > 0) {
        cy.contains('Got it!').click({ force: true });
      }
    });
  });

  it('displays only top-level navigation items by default', () => {
    const topItems = [
      'Home',
      'Campaigns',
      'Creative Testing',
      'Brand Lift',
      'Brand Health',
      'Influencers',
      'MMM', // Changed from "MMM Analysis" to "MMM"
      'Reports',
      'Billing',
      'Help',
      'Settings',
    ];
    topItems.forEach(item => {
      cy.contains(item).should('be.visible');
    });
    // Verify that submenu items (e.g. "List", "Wizard", etc.) are not visible by default.
    cy.contains('List').should('not.exist');
    cy.contains('Wizard').should('not.exist');
    cy.contains('Attribution').should('not.exist');
  });

  it('shows submenu items when a section is active and indents them correctly', () => {
    // Navigate to the Campaigns page so that its submenu appears.
    cy.visit('/campaigns');
    cy.contains('Campaigns').should('be.visible');
    cy.contains('List').should('be.visible');
    cy.contains('Wizard').should('be.visible');

    // Check that the submenu items have greater left padding than the parent.
    cy.contains('Campaigns')
      .parent()
      .invoke('css', 'padding-left')
      .then(parentPadding => {
        cy.contains('List')
          .invoke('css', 'padding-left')
          .then(submenuPadding => {
            expect(parseInt(submenuPadding, 10)).to.be.greaterThan(parseInt(parentPadding, 10));
          });
      });

    // Verify that when active, the submenu text color turns deep sky blue.
    cy.contains('List').should('have.css', 'color').and('equal', 'rgb(0, 191, 255)'); // Adjust this value if your computed color differs
  });

  it('navigates to correct pages when top-level links are clicked', () => {
    // Dismiss onboarding modal if present.
    cy.get('body').then($body => {
      if ($body.find('[aria-label="User Onboarding"]').length > 0) {
        cy.contains('Got it!').click({ force: true });
      }
    });
    // Click on the Home link (which points to "/dashboard").
    cy.contains('Home').click();
    cy.url().should('include', '/dashboard');

    // Click on the Reports link and check that the URL updates.
    cy.contains('Reports').click();
    cy.url().should('include', '/reports');
  });

  it('has the Settings link fixed at the bottom left of the sidebar', () => {
    // Now that we’ve added data-testid="sidebar", we target that container.
    cy.get('[data-testid="sidebar"]')
      .should('be.visible')
      .within(() => {
        // Check that the Settings link is visible.
        cy.contains('Settings').should('be.visible');
      });
  });
});
