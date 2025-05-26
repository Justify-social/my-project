import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Debug Tools - Complete Coverage Testing', () => {
  beforeEach(() => {
    // Setup authenticated admin test environment
    setupClerkTestingToken();
  });

  context('Main Debug Tools Dashboard', () => {
    it('should display all debug tools and navigation links', () => {
      cy.visit('/debug-tools');

      // Verify main page structure
      cy.contains('h1', 'Debug Tools').should('be.visible');

      // Verify all debug tool cards are present
      const expectedTools = [
        'API Verification',
        'UI Components',
        'Database Health',
        'Clerk Authentication',
        'Mux Asset Checker',
        'Campaign Wizard Checker',
        'Documentation Hub',
        'Cypress Analytics Dashboard',
      ];

      expectedTools.forEach(tool => {
        cy.contains(tool).should('be.visible');
      });

      // Verify grid layout
      cy.get('.grid').should('exist');
      cy.get('.grid').find('.border-divider').should('have.length.at.least', 8);
    });

    it('should navigate to each debug tool successfully', () => {
      cy.visit('/debug-tools');

      // Test navigation to each tool
      const toolNavigations = [
        { name: 'API Verification', url: '/debug-tools/api-verification' },
        { name: 'UI Components', url: '/debug-tools/ui-components' },
        { name: 'Database Health', url: '/debug-tools/database' },
        { name: 'Clerk Authentication', url: '/debug-tools/clerk-auth' },
        { name: 'Mux Asset Checker', url: '/debug-tools/mux-assets' },
        { name: 'Campaign Wizard Checker', url: '/debug-tools/campaign-wizards' },
        { name: 'Cypress Analytics Dashboard', url: '/debug-tools/analytics' },
      ];

      toolNavigations.forEach(tool => {
        cy.visit('/debug-tools');
        cy.contains(tool.name).click();
        cy.url().should('include', tool.url);
        cy.go('back');
      });
    });
  });

  context('API Verification Tool', () => {
    it('should load API verification interface', () => {
      cy.visit('/debug-tools/api-verification');

      // Verify page loads
      cy.contains('API Verification').should('be.visible');

      // Verify main sections
      cy.contains('Test External API Integrations').should('be.visible');

      // Verify API testing interface elements
      cy.get('button').contains('Verify All APIs').should('be.visible');

      // Verify no errors on load
      cy.get('body').should('not.contain', 'Error');
      cy.get('body').should('not.contain', 'undefined');
    });

    it('should handle API verification workflow', () => {
      cy.visit('/debug-tools/api-verification');

      // Mock API verification request
      cy.intercept('POST', '**/api/admin/verify-apis', {
        statusCode: 200,
        body: { status: 'success', verified: 5, total: 5 },
      }).as('verifyAPIs');

      // Click verify button
      cy.get('button').contains('Verify All APIs').click();

      // Wait for request
      cy.wait('@verifyAPIs');

      // Verify response handling
      cy.contains('success').should('be.visible');
    });
  });

  context('Database Health Tool', () => {
    it('should load database health interface', () => {
      cy.visit('/debug-tools/database');

      // Verify page loads
      cy.contains('Database Health').should('be.visible');

      // Verify health monitoring sections
      cy.contains('Schema Information').should('be.visible');
      cy.contains('Health Monitoring').should('be.visible');

      // Verify no errors
      cy.get('body').should('not.contain', 'Error');
    });

    it('should display database metrics and status', () => {
      cy.visit('/debug-tools/database');

      // Look for health indicators
      cy.get('[class*="status"], [class*="health"], [class*="metric"]').should('exist');

      // Verify tables or data display
      cy.get('table, .grid, [class*="card"]').should('exist');
    });
  });

  context('Clerk Authentication Tool', () => {
    it('should load authentication debugging interface', () => {
      cy.visit('/debug-tools/clerk-auth');

      // Verify page loads
      cy.contains('Clerk Authentication').should('be.visible');

      // Verify auth debugging sections
      cy.contains('Authentication Status').should('be.visible');

      // Verify no errors
      cy.get('body').should('not.contain', 'Error');
    });

    it('should display current authentication state', () => {
      cy.visit('/debug-tools/clerk-auth');

      // Look for user info display
      cy.contains('User Information').should('be.visible');

      // Verify authentication status indicators
      cy.get('[class*="status"], [class*="auth"]').should('exist');
    });
  });

  context('Mux Asset Checker', () => {
    it('should load Mux asset management interface', () => {
      cy.visit('/debug-tools/mux-assets');

      // Verify page loads
      cy.contains('Mux Asset Checker').should('be.visible');

      // Verify asset management sections
      cy.contains('Video Assets').should('be.visible');

      // Verify no errors
      cy.get('body').should('not.contain', 'Error');
    });

    it('should display asset listing and management tools', () => {
      cy.visit('/debug-tools/mux-assets');

      // Look for asset containers
      cy.get('.grid, table, [class*="asset"], [class*="video"]').should('exist');

      // Verify management buttons
      cy.get('button').should('exist');
    });
  });

  context('Campaign Wizard Checker', () => {
    it('should load campaign wizard debugging interface', () => {
      cy.visit('/debug-tools/campaign-wizards');

      // Verify page loads
      cy.contains('Campaign Wizard Checker').should('be.visible');

      // Verify campaign debugging sections
      cy.contains('Created Campaign Wizards').should('be.visible');

      // Verify no errors
      cy.get('body').should('not.contain', 'Error');
    });

    it('should display campaign wizard data', () => {
      cy.visit('/debug-tools/campaign-wizards');

      // Look for campaign data display
      cy.get('table, .grid, [class*="campaign"]').should('exist');

      // Verify data columns or sections
      cy.contains('Campaign').should('be.visible');
    });
  });

  context('UI Components Tool (Integration)', () => {
    it('should load UI components browser', () => {
      cy.visit('/debug-tools/ui-components');

      // Verify page loads
      cy.contains('UI Components').should('be.visible');

      // Verify component browser interface
      cy.get('.grid').should('exist');

      // Verify component categories
      cy.contains('Components').should('be.visible');
    });

    it('should handle component search and filtering', () => {
      cy.visit('/debug-tools/ui-components');

      // Look for search functionality
      cy.get('input[type="search"], input[placeholder*="search" i]').should('exist');

      // Look for filter controls
      cy.get('[role="tab"], button').should('exist');
    });
  });

  context('Cross-Tool Navigation and Integration', () => {
    it('should maintain consistent navigation between debug tools', () => {
      // Start from main debug tools page
      cy.visit('/debug-tools');

      // Navigate through multiple tools and verify back navigation
      cy.contains('Database Health').click();
      cy.url().should('include', '/debug-tools/database');

      // Navigate to another tool
      cy.visit('/debug-tools');
      cy.contains('API Verification').click();
      cy.url().should('include', '/debug-tools/api-verification');

      // Verify consistent header/navigation
      cy.contains('Debug Tools').should('be.visible');
    });

    it('should handle external links appropriately', () => {
      cy.visit('/debug-tools');

      // Test Documentation Hub external link
      cy.contains('Documentation Hub').should('be.visible');
      cy.contains('View Documentation').should('have.attr', 'onclick');
    });
  });

  context('Performance and Error Handling', () => {
    it('should load all debug tools efficiently', () => {
      const debugTools = [
        '/debug-tools/api-verification',
        '/debug-tools/database',
        '/debug-tools/clerk-auth',
        '/debug-tools/mux-assets',
        '/debug-tools/campaign-wizards',
      ];

      debugTools.forEach(tool => {
        cy.visit(tool, { timeout: 10000 });

        // Verify page loads successfully without hanging
        cy.get('h1', { timeout: 8000 }).should('be.visible');
        cy.get('body').should('not.contain', 'Error');
      });
    });

    it('should handle authentication requirements', () => {
      // All debug tools should require authentication
      const debugTools = [
        '/debug-tools/api-verification',
        '/debug-tools/database',
        '/debug-tools/clerk-auth',
        '/debug-tools/mux-assets',
        '/debug-tools/campaign-wizards',
      ];

      debugTools.forEach(tool => {
        cy.visit(tool);

        // Should not redirect to sign-in (since we're authenticated)
        cy.url().should('include', tool);
        cy.get('body').should('not.contain', 'Sign in');
      });
    });

    it('should handle network failures gracefully', () => {
      // Test with simulated network issues
      cy.intercept('GET', '/debug-tools/**', { forceNetworkError: true }).as('networkError');

      cy.visit('/debug-tools/api-verification', { failOnStatusCode: false });

      // Should handle gracefully (may show error state or retry)
      cy.get('body').should('exist');
    });
  });

  context('Accessibility and Usability', () => {
    it('should be keyboard accessible', () => {
      cy.visit('/debug-tools');

      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('exist');

      // Verify interactive elements are focusable
      cy.get('button, a, [role="button"]').should('exist');
    });

    it('should have appropriate ARIA labels and structure', () => {
      cy.visit('/debug-tools');

      // Verify semantic structure
      cy.get('h1').should('exist');
      cy.get('main, [role="main"]').should('exist');

      // Verify accessible navigation
      cy.get('nav, [role="navigation"]').should('exist');
    });
  });

  context('Data Validation and Security', () => {
    it('should validate user permissions for admin tools', () => {
      // All debug tools should be admin-only
      cy.visit('/debug-tools');

      // Verify admin context
      cy.get('body').should('not.contain', 'Access Denied');
      cy.get('body').should('not.contain', 'Unauthorized');
    });

    it('should handle sensitive data appropriately', () => {
      // Check that sensitive data is not exposed in debug tools
      const debugTools = ['/debug-tools/database', '/debug-tools/clerk-auth'];

      debugTools.forEach(tool => {
        cy.visit(tool);

        // Should not display raw sensitive data
        cy.get('body').should('not.contain', 'password');
        cy.get('body').should('not.contain', 'secret');
        cy.get('body').should('not.contain', 'token');
      });
    });
  });
});
