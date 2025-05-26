import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('UI Components Preview Pages - Comprehensive Testing', () => {
  beforeEach(() => {
    // Setup authenticated admin test environment
    setupClerkTestingToken();
  });

  context('Critical Form Components - Priority 1', () => {
    it('should load and display all form component preview pages', () => {
      const formComponents = [
        'Input',
        'Form',
        'Textarea',
        'Select',
        'Checkbox',
        'RadioGroup',
        'Switch',
        'Slider',
      ];

      formComponents.forEach(component => {
        cy.visit(`/debug-tools/ui-components/preview/${component}`, { timeout: 10000 });

        // Verify page loads without errors
        cy.contains('h1', component, { timeout: 5000 }).should('be.visible');

        // Verify breadcrumb navigation
        cy.contains('UI Components').should('be.visible');

        // Verify no errors
        cy.get('body').should('not.contain', 'Error');
        cy.get('body').should('not.contain', 'undefined');
      });
    });

    it('should test form component interactivity', () => {
      // Test Input component interactions
      cy.visit('/debug-tools/ui-components/preview/Input');

      // Look for input examples and test them
      cy.get('input[type="text"]').first().should('be.visible');
      cy.get('input[type="text"]').first().type('Test input value');
      cy.get('input[type="text"]').first().should('have.value', 'Test input value');
    });
  });

  context('Critical Navigation Components - Priority 1', () => {
    it('should load and display all navigation component preview pages', () => {
      const navComponents = ['MobileMenu', 'NavigationMenu', 'Tabs', 'Pagination'];

      navComponents.forEach(component => {
        cy.visit(`/debug-tools/ui-components/preview/${component}`, { timeout: 10000 });

        // Verify page loads
        cy.contains('h1', component, { timeout: 5000 }).should('be.visible');

        // Verify navigation structure
        cy.contains('UI Components').should('be.visible');

        // No errors displayed
        cy.get('body').should('not.contain', 'Error');
      });
    });

    it('should test navigation component functionality', () => {
      // Test Tabs component interactions
      cy.visit('/debug-tools/ui-components/preview/Tabs');

      // Look for tab buttons and test switching
      cy.get('[role="tab"]').should('exist');
      cy.get('[role="tabpanel"]').should('exist');
    });
  });

  context('Critical Chart Components - Priority 1', () => {
    it('should load and display all chart component preview pages', () => {
      const chartComponents = [
        'AreaChart',
        'BarChart',
        'LineChart',
        'PieChart',
        'FunnelChart',
        'RadarChart',
        'ScatterChart',
      ];

      chartComponents.forEach(component => {
        cy.visit(`/debug-tools/ui-components/preview/${component}`, { timeout: 10000 });

        // Verify page loads
        cy.contains('h1', component, { timeout: 5000 }).should('be.visible');

        // Verify no errors
        cy.get('body').should('not.contain', 'Error');
        cy.get('body').should('not.contain', 'undefined');
      });
    });
  });

  context('Critical Layout Components - Priority 1', () => {
    it('should load and display all layout component preview pages', () => {
      const layoutComponents = [
        'Card',
        'Dialog',
        'Sheet',
        'Accordion',
        'Alert',
        'AlertDialog',
        'Popover',
        'Tooltip',
      ];

      layoutComponents.forEach(component => {
        cy.visit(`/debug-tools/ui-components/preview/${component}`, { timeout: 10000 });

        // Verify page loads
        cy.contains('h1', component, { timeout: 5000 }).should('be.visible');

        // No errors
        cy.get('body').should('not.contain', 'Error');
      });
    });

    it('should test interactive layout components', () => {
      // Test Dialog component
      cy.visit('/debug-tools/ui-components/preview/Dialog');

      // Look for trigger buttons
      cy.get('button')
        .contains(/open|show|trigger/i)
        .should('exist');
    });
  });

  context('Additional UI Components - Priority 2', () => {
    it('should load and display all additional component preview pages', () => {
      const additionalComponents = [
        'Avatar',
        'Calendar',
        'Carousel',
        'Collapsible',
        'Command',
        'ContextMenu',
        'DatePicker',
        'DropdownMenu',
        'HoverCard',
        'Progress',
        'Resizable',
        'ScrollArea',
        'SearchBar',
        'SectionHeader',
        'Separator',
        'Skeleton',
        'Table',
        'Toast',
      ];

      additionalComponents.forEach(component => {
        cy.visit(`/debug-tools/ui-components/preview/${component}`, { timeout: 10000 });

        // Basic page load verification
        cy.contains('h1', component, { timeout: 5000 }).should('be.visible');
        cy.get('body').should('not.contain', 'Error');
      });
    });
  });

  context('Specialized Components - Priority 2', () => {
    it('should load and display all specialized component preview pages', () => {
      const specializedComponents = [
        'AssetCard',
        'ButtonIconAction',
        'KpiCard',
        'LoadingSkeleton',
        'LoadingSpinner',
        'MetricsComparison',
        'MetricsDashboard',
        'UpcomingCampaignsTable',
        'AspectRatio',
      ];

      specializedComponents.forEach(component => {
        cy.visit(`/debug-tools/ui-components/preview/${component}`, { timeout: 10000 });

        // Basic verification
        cy.contains('h1', component, { timeout: 5000 }).should('be.visible');
        cy.get('body').should('not.contain', 'Error');
      });
    });
  });

  context('UI Component Browser Integration', () => {
    it('should navigate to component previews from main UI components page', () => {
      cy.visit('/debug-tools/ui-components');

      // Verify main page loads
      cy.contains('h1', 'UI Components').should('be.visible');

      // Test navigation to a component
      cy.contains('Button').should('be.visible');
      cy.contains('Button').click();

      // Verify navigation to Button preview
      cy.url().should('include', '/debug-tools/ui-components/preview/Button');
      cy.contains('h1', 'Button').should('be.visible');
    });

    it('should handle breadcrumb navigation correctly', () => {
      cy.visit('/debug-tools/ui-components/preview/Input');

      // Test breadcrumb back navigation
      cy.contains('UI Components').click();
      cy.url().should('include', '/debug-tools/ui-components');
      cy.contains('h1', 'UI Components').should('be.visible');
    });
  });

  context('Performance and Accessibility Testing', () => {
    it('should load key UI component pages efficiently', () => {
      const testComponents = ['Button', 'Card', 'Input', 'Form', 'Table'];

      testComponents.forEach(component => {
        cy.visit(`/debug-tools/ui-components/preview/${component}`, { timeout: 10000 });

        // Verify page loads successfully
        cy.contains('h1', component, { timeout: 5000 }).should('be.visible');
        cy.get('body').should('not.contain', 'Error');
      });
    });

    it('should be accessible with keyboard navigation', () => {
      cy.visit('/debug-tools/ui-components/preview/Button');

      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('exist');

      // Test that interactive elements are focusable
      cy.get('button, input, [role="button"], [tabindex="0"]').should('exist');
    });
  });

  context('Error Handling and Edge Cases', () => {
    it('should handle invalid component routes gracefully', () => {
      // Test non-existent component
      cy.visit('/debug-tools/ui-components/preview/NonExistentComponent', {
        failOnStatusCode: false,
      });

      // Should either redirect or show appropriate error
      cy.get('body').should('contain.text', 'Not Found').or('contain.text', '404');
    });

    it('should handle network issues gracefully', () => {
      // Intercept and delay requests to test loading states
      cy.intercept('GET', '/debug-tools/ui-components/preview/**', { delay: 1000 }).as('slowLoad');

      cy.visit('/debug-tools/ui-components/preview/Button');

      // Page should still load eventually
      cy.contains('h1', 'Button').should('be.visible');
    });
  });
});
