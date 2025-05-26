import { setupClerkTestingToken } from '@clerk/testing/cypress';
import { AdminDashboardPage, AnalyticsPage } from '../../support/page-objects';

describe('Cypress Analytics Dashboard - Comprehensive Testing', () => {
  let adminDashboard;
  let analyticsPage;

  beforeEach(() => {
    // Setup authenticated admin test environment
    setupClerkTestingToken();

    // Initialize page objects
    adminDashboard = new AdminDashboardPage();
    analyticsPage = new AnalyticsPage();
  });

  context('Analytics Page Access and Navigation', () => {
    it('should access analytics dashboard from debug tools', () => {
      // Navigate to debug tools
      cy.visit('/debug-tools');

      // Verify analytics dashboard card is visible
      cy.contains('Cypress Analytics Dashboard').should('be.visible');
      cy.contains(
        'Comprehensive test analytics, performance metrics, coverage analysis, and error patterns.'
      ).should('be.visible');

      // Click analytics dashboard link
      cy.contains('View Analytics Dashboard').click();

      // Verify navigation to analytics page
      analyticsPage.expectToBeOnAnalyticsPage();
    });

    it('should display proper page structure and key metrics', () => {
      analyticsPage.visit();

      // Verify page title and description
      cy.contains('Cypress Analytics').should('be.visible');
      cy.contains(
        'Comprehensive test monitoring, performance insights, and quality metrics'
      ).should('be.visible');

      // Verify key metrics overview is visible and follows F-pattern (top-left priority)
      analyticsPage.expectMetricsOverviewVisible();

      // Verify refresh button is available
      cy.contains('Refresh Data').should('be.visible');
    });
  });

  context('Key Metrics Overview - Cognitive Load Optimization', () => {
    beforeEach(() => {
      analyticsPage.visit();
    });

    it('should display critical metrics in top-left priority area', () => {
      // Test F-pattern layout - most critical info first
      cy.get('.grid')
        .first()
        .within(() => {
          cy.contains('Total Tests').should('be.visible');
          cy.contains('Passed').should('be.visible');
          cy.contains('Failed').should('be.visible');
          cy.contains('Pass Rate').should('be.visible');
        });

      // Verify metrics show actual values
      cy.contains('59').should('be.visible'); // Total tests
      cy.contains('94.9%').should('be.visible'); // Pass rate
    });

    it('should provide immediate value interpretation without cognitive overload', () => {
      // Colors should provide immediate meaning
      analyticsPage.elements.passedTestsCard().should('contain', '56');
      analyticsPage.elements.failedTestsCard().should('contain', '3');

      // Pass rate should be prominently displayed
      analyticsPage.elements.passRateCard().should('contain', '94.9%');
    });
  });

  context('Tabbed Analytics - Progressive Disclosure', () => {
    beforeEach(() => {
      analyticsPage.visit();
    });

    it('should navigate between analytics tabs smoothly', () => {
      // Verify all tabs are visible
      analyticsPage.expectTabsVisible();

      // Test tab navigation
      analyticsPage.openOverviewTab();
      analyticsPage.expectOverviewContentVisible();

      analyticsPage.openPerformanceTab();
      analyticsPage.expectPerformanceContentVisible();

      analyticsPage.openCoverageTab();
      analyticsPage.expectCoverageContentVisible();

      analyticsPage.openErrorsTab();
      analyticsPage.expectErrorContentVisible();
    });

    it('should display SSOT compliance status in overview tab', () => {
      analyticsPage.openOverviewTab();

      // Verify SSOT compliance reporting
      cy.contains('SSOT Compliant Files (12/12)').should('be.visible');
      cy.contains('Modern Auth Pattern: 100%').should('be.visible');
      cy.contains('Zero Deprecated Methods').should('be.visible');

      // Verify specific compliant files are listed
      cy.contains('auth-official-simple.cy.js').should('be.visible');
      cy.contains('campaigns-with-page-objects.cy.js').should('be.visible');
    });

    it('should show performance metrics and bottleneck analysis', () => {
      analyticsPage.openPerformanceTab();

      // Verify performance metrics
      cy.contains('2.3s').should('be.visible'); // Avg execution time
      cy.contains('45.2s').should('be.visible'); // Total suite time

      // Verify bottleneck analysis
      cy.contains('Fastest: auth-official-simple.cy.js').should('be.visible');
      cy.contains('Slowest: campaigns-comprehensive.cy.js').should('be.visible');
      cy.contains('Most Flaky: marketplace-minimal.cy.js').should('be.visible');
    });

    it('should display test coverage analysis', () => {
      analyticsPage.openCoverageTab();

      // Verify coverage metrics for different test categories
      cy.contains('Authentication Tests').should('be.visible');
      cy.contains('95%').should('be.visible');

      cy.contains('Campaign Tests').should('be.visible');
      cy.contains('87%').should('be.visible');

      cy.contains('Dashboard Tests').should('be.visible');
      cy.contains('72%').should('be.visible');
    });

    it('should analyze error patterns for debugging insights', () => {
      analyticsPage.openErrorsTab();

      // Verify error pattern analysis
      cy.contains('Common Error Patterns').should('be.visible');
      cy.contains('Element not found: [data-cy="campaign-submit-button"]').should('be.visible');
      cy.contains('8 occurrences').should('be.visible');

      // Verify error context
      cy.contains('campaigns-with-page-objects.cy.js').should('be.visible');
    });
  });

  context('Recent Test Executions - Real-time Monitoring', () => {
    beforeEach(() => {
      analyticsPage.visit();
      analyticsPage.openOverviewTab();
    });

    it('should display recent test executions with status and timing', () => {
      cy.contains('Recent Test Executions').should('be.visible');

      // Verify execution entries show proper information
      cy.contains('Authentication Flow Complete').should('be.visible');
      cy.contains('auth-official-simple.cy.js').should('be.visible');
      cy.contains('passed').should('be.visible');

      // Verify timing information
      cy.contains('2340ms').should('be.visible');
      cy.contains('2 min ago').should('be.visible');
    });

    it('should show different execution statuses with appropriate visual indicators', () => {
      // Test status badges
      cy.get('[class*="bg-green"]').should('exist'); // Passed tests
      cy.get('[class*="bg-red"]').should('exist'); // Failed tests

      // Verify failed test is clearly indicated
      cy.contains('Dashboard Navigation').parent().should('contain', 'failed');
    });
  });

  context('Data Refresh and Real-time Updates', () => {
    beforeEach(() => {
      analyticsPage.visit();
    });

    it('should refresh analytics data and show updated timestamp', () => {
      // Get initial timestamp
      cy.contains('Last updated:').invoke('text').as('initialTimestamp');

      // Refresh data
      analyticsPage.refreshAnalyticsData();

      // Verify loading state
      cy.get('.animate-spin').should('be.visible');

      // Wait for refresh completion
      cy.get('.animate-spin').should('not.exist');

      // Verify timestamp updated
      cy.get('@initialTimestamp').then(initialTimestamp => {
        cy.contains('Last updated:').should('not.contain', initialTimestamp);
      });
    });
  });

  context('Quick Actions - Administrative Functions', () => {
    beforeEach(() => {
      analyticsPage.visit();
    });

    it('should provide quick access to common analytics actions', () => {
      analyticsPage.testQuickActions();

      // Verify all quick action buttons
      cy.contains('Export Test Report').should('be.visible');
      cy.contains('Run All Tests').should('be.visible');
      cy.contains('View Test Logs').should('be.visible');
      cy.contains('Coverage Report').should('be.visible');
      cy.contains('Performance Analysis').should('be.visible');
    });

    it('should enable export functionality for reports', () => {
      cy.contains('Export Test Report').should('be.enabled');
      cy.contains('Coverage Report').should('be.enabled');
      cy.contains('Performance Analysis').should('be.enabled');
    });
  });

  context('Comprehensive Analytics Workflow - End-to-End', () => {
    it('should complete full analytics workflow without cognitive overload', () => {
      // Run complete workflow test
      analyticsPage.testCompleteAnalyticsWorkflow();
    });

    it('should maintain consistent navigation patterns with debug tools', () => {
      // Test navigation consistency
      cy.visit('/debug-tools');
      cy.contains('View Analytics Dashboard').click();

      analyticsPage.expectToBeOnAnalyticsPage();

      // Verify breadcrumb or back navigation maintains context
      cy.url().should('include', '/debug-tools/analytics');
    });
  });

  context('Accessibility and Usability - Admin Team Focused', () => {
    beforeEach(() => {
      analyticsPage.visit();
    });

    it('should be keyboard navigable for admin efficiency', () => {
      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('contain', 'Refresh Data');

      // Test tab switching via keyboard
      cy.get('[role="tablist"]').within(() => {
        cy.get('[data-value="performance"]').focus().type('{enter}');
      });

      analyticsPage.expectPerformanceContentVisible();
    });

    it('should provide clear visual hierarchy for scanning', () => {
      // Verify proper heading hierarchy
      cy.get('h1').should('contain', 'Cypress Analytics');

      // Verify card structure follows consistent pattern
      cy.get('[class*="border-divider"]').should('have.length.greaterThan', 5);

      // Verify color coding is consistent
      cy.get('[class*="text-green-600"]').should('exist'); // Passed tests
      cy.get('[class*="text-red-600"]').should('exist'); // Failed tests
    });
  });

  context('Performance and Loading States', () => {
    it('should handle loading states gracefully', () => {
      // Test initial loading
      cy.visit('/debug-tools/analytics');

      // Should show loading spinner initially
      cy.get('.animate-spin', { timeout: 1000 }).should('be.visible');

      // Should complete loading within reasonable time
      cy.contains('Cypress Analytics', { timeout: 5000 }).should('be.visible');
      cy.get('.animate-spin').should('not.exist');
    });

    it('should load analytics data efficiently for admin workflow', () => {
      // Measure page load performance
      cy.visit('/debug-tools/analytics');

      // Key metrics should be visible quickly
      cy.contains('Total Tests', { timeout: 3000 }).should('be.visible');
      cy.contains('Pass Rate', { timeout: 3000 }).should('be.visible');

      // All tabs should be responsive
      analyticsPage.openPerformanceTab();
      cy.contains('Performance Metrics', { timeout: 2000 }).should('be.visible');
    });
  });
});
