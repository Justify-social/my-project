import { BasePage } from '../shared/BasePage.js';

/**
 * Cypress Analytics Page Object Model
 * Handles the comprehensive Cypress analytics dashboard in debug tools
 *
 * Covers:
 * - Test execution metrics and trends
 * - Performance analytics and bottleneck analysis
 * - Test coverage visualization and reporting
 * - Error pattern analysis and debugging insights
 * - Real-time test monitoring and alerts
 * - SSOT compliance verification and reporting
 */

export class AnalyticsPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/debug-tools/analytics';
    this.pageTitle = 'Analytics Dashboard';
  }

  // Element selectors using data-cy attributes for Cypress Analytics
  elements = {
    // Main page container
    analyticsContainer: () => cy.get('.container'),
    pageHeader: () => cy.get('h1').contains('Cypress Analytics'),
    pageTitle: () => cy.contains('h1', 'Cypress Analytics'),

    // Key metrics overview cards (top priority section)
    metricsOverview: () => cy.get('.grid').first(),
    totalTestsCard: () => cy.contains('Total Tests').parent(),
    passedTestsCard: () => cy.contains('Passed').parent(),
    failedTestsCard: () => cy.contains('Failed').parent(),
    passRateCard: () => cy.contains('Pass Rate').parent(),

    // Tab navigation
    tabsList: () => cy.get('[role="tablist"]'),
    overviewTab: () => cy.get('[data-value="overview"]'),
    performanceTab: () => cy.get('[data-value="performance"]'),
    coverageTab: () => cy.get('[data-value="coverage"]'),
    errorsTab: () => cy.get('[data-value="errors"]'),

    // Overview tab content
    recentExecutions: () => cy.contains('Recent Test Executions').parent(),
    testStatusSummary: () => cy.contains('Test Status Summary').parent(),
    ssotCompliantFiles: () => cy.contains('SSOT Compliant Files'),
    performanceStats: () => cy.contains('Performance Stats'),

    // Performance tab content
    performanceMetrics: () => cy.contains('Performance Metrics').parent(),
    avgExecutionTime: () => cy.contains('Avg Execution Time').parent(),
    totalSuiteTime: () => cy.contains('Total Suite Time').parent(),
    performanceTrends: () => cy.contains('Performance Trends').parent(),

    // Coverage tab content
    testCoverage: () => cy.contains('Test Coverage Analysis').parent(),
    authTestsCoverage: () => cy.contains('Authentication Tests'),
    campaignTestsCoverage: () => cy.contains('Campaign Tests'),
    dashboardTestsCoverage: () => cy.contains('Dashboard Tests'),
    marketplaceTestsCoverage: () => cy.contains('Marketplace Tests'),

    // Error analysis tab content
    errorAnalysis: () => cy.contains('Common Error Patterns').parent(),
    errorTrendAnalysis: () => cy.contains('Error Trend Analysis').parent(),
    errorPatternsList: () => cy.contains('Error #1').parent(),

    // Controls and actions
    refreshButton: () => cy.contains('Refresh Data'),
    quickActions: () => cy.contains('Quick Actions').parent(),
    exportReportButton: () => cy.contains('Export Test Report'),
    runAllTestsButton: () => cy.contains('Run All Tests'),
    viewLogsButton: () => cy.contains('View Test Logs'),

    // Loading and status indicators
    loadingSpinner: () => cy.get('.animate-spin'),
    lastUpdatedText: () => cy.contains('Last updated:'),
  };

  // Page navigation actions
  visit() {
    this.logAction(`Visiting Cypress analytics dashboard: ${this.pageUrl}`);
    cy.visit(this.pageUrl);
    return this;
  }

  // Tab navigation actions for analytics sections
  openOverviewTab() {
    this.logAction('Opening Test Overview tab');
    this.elements.overviewTab().click();
    return this;
  }

  openPerformanceTab() {
    this.logAction('Opening Performance analytics tab');
    this.elements.performanceTab().click();
    return this;
  }

  openCoverageTab() {
    this.logAction('Opening Coverage analysis tab');
    this.elements.coverageTab().click();
    return this;
  }

  openErrorsTab() {
    this.logAction('Opening Error analysis tab');
    this.elements.errorsTab().click();
    return this;
  }

  // Page state assertions
  expectToBeOnAnalyticsPage() {
    cy.url().should('include', '/debug-tools/analytics');
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  expectMetricsOverviewVisible() {
    this.elements.metricsOverview().should('be.visible');
    this.elements.totalTestsCard().should('be.visible');
    this.elements.passedTestsCard().should('be.visible');
    this.elements.failedTestsCard().should('be.visible');
    this.elements.passRateCard().should('be.visible');
    return this;
  }

  expectTabsVisible() {
    this.elements.tabsList().should('be.visible');
    this.elements.overviewTab().should('be.visible');
    this.elements.performanceTab().should('be.visible');
    this.elements.coverageTab().should('be.visible');
    this.elements.errorsTab().should('be.visible');
    return this;
  }

  expectOverviewContentVisible() {
    this.elements.recentExecutions().should('be.visible');
    this.elements.testStatusSummary().should('be.visible');
    this.elements.ssotCompliantFiles().should('be.visible');
    return this;
  }

  expectPerformanceContentVisible() {
    this.elements.performanceMetrics().should('be.visible');
    this.elements.avgExecutionTime().should('be.visible');
    this.elements.totalSuiteTime().should('be.visible');
    return this;
  }

  expectCoverageContentVisible() {
    this.elements.testCoverage().should('be.visible');
    this.elements.authTestsCoverage().should('be.visible');
    this.elements.campaignTestsCoverage().should('be.visible');
    return this;
  }

  expectErrorContentVisible() {
    this.elements.errorAnalysis().should('be.visible');
    this.elements.errorPatternsList().should('be.visible');
    return this;
  }

  // Data interaction methods
  refreshAnalyticsData() {
    this.logAction('Refreshing analytics data');
    this.elements.refreshButton().click();

    // Should show loading state
    this.elements.dataLoading().should('be.visible');
    return this;
  }

  expectDataRefreshed() {
    this.logAction('Verifying analytics data refreshed');
    this.elements.dataLoading().should('not.exist');
    this.elements.lastUpdated().should('contain', new Date().toLocaleDateString());
    return this;
  }

  setDateRange(startDate, endDate) {
    this.logAction(`Setting date range: ${startDate} to ${endDate}`);
    this.elements.dateRangePicker().click();

    // Interact with date picker (implementation depends on your date picker component)
    cy.get('[data-cy="start-date"]').type(startDate);
    cy.get('[data-cy="end-date"]').type(endDate);
    cy.get('[data-cy="apply-date-range"]').click();

    return this;
  }

  exportAnalyticsData(format = 'csv') {
    this.logAction(`Exporting analytics data as ${format}`);
    this.elements.exportButton().click();

    // Select export format
    cy.get(`[data-cy="export-${format}"]`).click();

    return this;
  }

  toggleFilters() {
    this.logAction('Toggling analytics filters panel');
    this.elements.filterToggle().click();
    return this;
  }

  expectFiltersVisible() {
    this.elements.filterPanel().should('be.visible');
    return this;
  }

  expectFiltersHidden() {
    this.elements.filterPanel().should('not.be.visible');
    return this;
  }

  // Metrics validation methods
  validateOverviewMetrics(expectedMetrics) {
    this.logAction('Validating overview metrics', expectedMetrics);

    if (expectedMetrics.totalUsers) {
      this.elements.totalUsersCard().should('contain', expectedMetrics.totalUsers);
    }

    if (expectedMetrics.totalCampaigns) {
      this.elements.totalCampaignsCard().should('contain', expectedMetrics.totalCampaigns);
    }

    if (expectedMetrics.conversionRate) {
      this.elements.conversionRateCard().should('contain', expectedMetrics.conversionRate);
    }

    if (expectedMetrics.revenue) {
      this.elements.revenueCard().should('contain', expectedMetrics.revenue);
    }

    return this;
  }

  validateChartData() {
    this.logAction('Validating chart data presence');

    // Verify charts have data
    this.elements.userActivityChart().within(() => {
      cy.get('canvas, svg').should('exist');
    });

    this.elements.campaignPerformanceChart().within(() => {
      cy.get('canvas, svg').should('exist');
    });

    this.elements.revenueChart().within(() => {
      cy.get('canvas, svg').should('exist');
    });

    this.elements.conversionFunnelChart().within(() => {
      cy.get('canvas, svg').should('exist');
    });

    return this;
  }

  // Performance and interaction testing
  measureAnalyticsLoad() {
    this.logAction('Measuring analytics dashboard load performance');

    cy.measurePageLoadTime(this.pageUrl, {
      performanceBudget: 3000,
      includeName: 'analytics-dashboard-load',
    });

    return this;
  }

  measureChartRender() {
    this.logAction('Measuring chart rendering performance');

    cy.measureInteractionTime(
      () => {
        this.refreshAnalyticsData();
      },
      {
        performanceBudget: 2000,
        actionName: 'chart-render',
      }
    );

    return this;
  }

  // Error handling and edge cases
  handleAnalyticsErrors() {
    this.logAction('Testing analytics error handling');

    // Test API error states
    cy.intercept('GET', '**/api/analytics/**', {
      statusCode: 500,
      body: { error: 'Analytics service unavailable' },
    }).as('analyticsError');

    this.refreshAnalyticsData();
    cy.wait('@analyticsError');

    // Should show error state
    cy.contains('error', { matchCase: false }).should('be.visible');

    return this;
  }

  expectAnalyticsErrorState() {
    cy.contains('error', { matchCase: false }).should('be.visible');
    return this;
  }

  // Complex workflows for Cypress analytics
  testCompleteAnalyticsWorkflow() {
    this.logAction('Testing complete Cypress analytics workflow');

    // Page load and basic structure
    this.expectToBeOnAnalyticsPage();
    this.expectMetricsOverviewVisible();
    this.expectTabsVisible();

    // Test overview tab (default)
    this.openOverviewTab();
    this.expectOverviewContentVisible();

    // Test performance tab
    this.openPerformanceTab();
    this.expectPerformanceContentVisible();

    // Test coverage tab
    this.openCoverageTab();
    this.expectCoverageContentVisible();

    // Test error analysis tab
    this.openErrorsTab();
    this.expectErrorContentVisible();

    // Test data refresh
    this.refreshAnalyticsData();
    this.expectDataRefreshed();

    // Test quick actions
    this.testQuickActions();

    return this;
  }

  testQuickActions() {
    this.logAction('Testing quick actions functionality');

    this.elements.quickActions().should('be.visible');
    this.elements.exportReportButton().should('be.visible');
    this.elements.runAllTestsButton().should('be.visible');
    this.elements.viewLogsButton().should('be.visible');

    return this;
  }

  validateAnalyticsPerformance() {
    this.logAction('Validating analytics performance requirements');

    this.measureAnalyticsLoad();
    this.measureChartRender();

    return this;
  }

  // Accessibility testing
  checkAnalyticsAccessibility() {
    this.logAction('Checking analytics dashboard accessibility');

    cy.injectAxe();
    cy.checkA11y('[data-cy="analytics-container"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
      },
    });

    return this;
  }

  // Mobile and responsive testing
  testMobileAnalytics() {
    this.logAction('Testing analytics on mobile viewport');

    cy.viewport('iphone-x');
    this.visit();
    this.expectAnalyticsOverviewVisible();

    // Charts should be responsive
    this.expectAnalyticsChartsVisible();

    // Tools grid should stack on mobile
    this.expectAnalyticsToolsVisible();

    return this;
  }
}
