/**
 * Navigation Commands
 * Enhanced navigation with performance monitoring
 */

// Navigate with performance monitoring
Cypress.Commands.add('visitWithPerformance', (url, options = {}) => {
  const { timeout = 10000, performanceBudget = 3000 } = options;

  cy.visit(url, {
    timeout,
    onBeforeLoad: win => {
      win.performance.mark('navigation-start');
    },
    onLoad: win => {
      win.performance.mark('navigation-end');
      win.performance.measure('navigation', 'navigation-start', 'navigation-end');
    },
  });

  // Check performance budget
  cy.window().then(win => {
    const measure = win.performance.getEntriesByName('navigation')[0];
    if (measure) {
      cy.log(`Page load time: ${Math.round(measure.duration)}ms`);
      expect(measure.duration).to.be.lessThan(performanceBudget);
    }
  });
});

// Navigate to common pages
Cypress.Commands.add('goToDashboard', () => {
  cy.visit('/dashboard');
  cy.get('[data-cy="dashboard-content"]').should('be.visible');
});

Cypress.Commands.add('goToCampaigns', () => {
  cy.visit('/campaigns');
  cy.get('[data-cy="campaigns-list"]').should('be.visible');
});

Cypress.Commands.add('goToSettings', () => {
  cy.visit('/settings');
  cy.get('[data-cy="settings-content"]').should('be.visible');
});
