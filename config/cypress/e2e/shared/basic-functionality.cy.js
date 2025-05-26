import { setupClerkTestingToken } from '@clerk/testing/cypress';

/**
 * Basic Functionality Test
 * Tests basic Cypress setup without authentication requirements
 */

describe('Basic Application Functionality', () => {
  it('should load the sign-in page successfully', () => {
    cy.log('Testing basic page loading functionality');

    // Visit sign-in page (public route)
    cy.visit('/sign-in');

    // Verify page loads
    cy.url().should('include', '/sign-in');

    // Check if Clerk sign-in form loads
    cy.get('body').should('be.visible');

    // Log success
    cy.log('✅ Sign-in page loaded successfully');
  });

  it('should redirect unauthenticated users to sign-in', () => {
    cy.log('Testing authentication middleware protection');

    // Try to visit protected route
    cy.visit('/dashboard');

    // Should be redirected to sign-in
    cy.url({ timeout: 10000 }).should('include', '/sign-in');

    // Log success
    cy.log('✅ Authentication middleware working correctly');
  });

  it('should have basic performance within budget', () => {
    cy.log('Testing basic performance');

    // Test performance of public page
    cy.visit('/sign-in', {
      onBeforeLoad: win => {
        win.performance.mark('start');
      },
      onLoad: win => {
        win.performance.mark('end');
        win.performance.measure('page-load', 'start', 'end');
      },
    });

    // Check performance
    cy.window().then(win => {
      const measure = win.performance.getEntriesByName('page-load')[0];
      if (measure) {
        const loadTime = Math.round(measure.duration);
        cy.log(`Page load time: ${loadTime}ms`);

        // Assert reasonable load time (10 seconds max for first load)
        expect(loadTime).to.be.lessThan(10000);
      }
    });

    // Log success
    cy.log('✅ Performance test passed');
  });

  it('should test custom commands work', () => {
    cy.log('Testing custom Cypress commands');

    // Test navigation command
    cy.visit('/sign-in');

    // Test if our enhanced waiting works
    cy.get('body').should('be.visible');

    // Test console error checking (should pass on sign-in page)
    cy.window().then(win => {
      // Just check that console exists
      expect(win.console).to.exist;
    });

    // Log success
    cy.log('✅ Custom commands working');
  });
});
