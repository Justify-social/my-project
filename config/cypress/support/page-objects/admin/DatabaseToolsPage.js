import { BasePage } from '../shared/BasePage.js';

/**
 * Database Tools Page Object Model
 * Handles database health monitoring and management tools
 *
 * Covers:
 * - Database schema exploration and documentation
 * - Health monitoring and status checks
 * - Table data browsing and analysis
 * - Query execution and testing
 * - Database performance metrics
 * - Connection status monitoring
 */

export class DatabaseToolsPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/debug-tools/database';
    this.pageTitle = 'Database Health';
  }

  // Element selectors using data-cy attributes
  elements = {
    // Main page container
    databaseContainer: () => this.getByDataCy('database-container'),
    pageHeader: () => this.getByDataCy('database-header'),
    pageTitle: () => cy.contains('h1', 'Database Health'),

    // Navigation tabs
    tabNavigation: () => cy.get('[role="tablist"]'),
    schemaTab: () => cy.contains('[role="tab"]', 'Schema'),
    healthTab: () => cy.contains('[role="tab"]', 'Health'),
    tablesTab: () => cy.contains('[role="tab"]', 'Tables'),
    queryTab: () => cy.contains('[role="tab"]', 'Query'),

    // Database health overview
    healthOverview: () => this.getByDataCy('health-overview'),
    connectionStatus: () => this.getByDataCy('connection-status'),
    connectionStatusBadge: () => cy.get('[data-testid="connection-status-badge"]'),
    healthScore: () => this.getByDataCy('health-score'),
    healthMetrics: () => this.getByDataCy('health-metrics'),

    // Health status indicators
    statusIndicator: status => cy.get(`[data-testid="status-${status}"]`),
    connectedStatus: () => this.elements.statusIndicator('connected'),
    disconnectedStatus: () => this.elements.statusIndicator('disconnected'),
    healthyStatus: () => this.elements.statusIndicator('healthy'),
    warningStatus: () => this.elements.statusIndicator('warning'),
    criticalStatus: () => this.elements.statusIndicator('critical'),

    // Database metrics
    metricsGrid: () => cy.get('[data-testid="metrics-grid"]'),
    totalTables: () => cy.get('[data-testid="total-tables"]'),
    totalRecords: () => cy.get('[data-testid="total-records"]'),
    databaseSize: () => cy.get('[data-testid="database-size"]'),
    avgQueryTime: () => cy.get('[data-testid="avg-query-time"]'),
    connectionCount: () => cy.get('[data-testid="connection-count"]'),
    uptime: () => cy.get('[data-testid="uptime"]'),

    // Schema explorer
    schemaExplorer: () => this.getByDataCy('schema-explorer'),
    schemaTree: () => cy.get('[data-testid="schema-tree"]'),
    tablesList: () => cy.get('[data-testid="tables-list"]'),
    tableItem: tableName => cy.get(`[data-testid="table-${tableName}"]`),
    tableExpander: tableName =>
      this.elements.tableItem(tableName).find('[data-testid="expand-table"]'),
    columnsList: tableName =>
      this.elements.tableItem(tableName).find('[data-testid="columns-list"]'),
    columnItem: (tableName, columnName) =>
      cy.get(`[data-testid="column-${tableName}-${columnName}"]`),

    // Table details
    tableDetails: () => this.getByDataCy('table-details'),
    tableNameDisplay: () => cy.get('[data-testid="table-name"]'),
    tableRowCount: () => cy.get('[data-testid="table-row-count"]'),
    tableSize: () => cy.get('[data-testid="table-size"]'),
    tableColumns: () => cy.get('[data-testid="table-columns"]'),
    tableIndexes: () => cy.get('[data-testid="table-indexes"]'),

    // Column details
    columnDetails: () => this.getByDataCy('column-details'),
    columnName: () => cy.get('[data-testid="column-name"]'),
    columnType: () => cy.get('[data-testid="column-type"]'),
    columnNullable: () => cy.get('[data-testid="column-nullable"]'),
    columnDefault: () => cy.get('[data-testid="column-default"]'),
    columnConstraints: () => cy.get('[data-testid="column-constraints"]'),

    // Query interface
    queryInterface: () => this.getByDataCy('query-interface'),
    queryEditor: () => cy.get('[data-testid="query-editor"]'),
    queryInput: () => cy.get('textarea[data-testid="query-input"]'),
    executeQueryButton: () => cy.contains('button', 'Execute Query'),
    clearQueryButton: () => cy.contains('button', 'Clear'),
    queryHistory: () => cy.get('[data-testid="query-history"]'),

    // Query results
    queryResults: () => this.getByDataCy('query-results'),
    resultsTable: () => cy.get('[data-testid="results-table"]'),
    resultsCount: () => cy.get('[data-testid="results-count"]'),
    queryExecutionTime: () => cy.get('[data-testid="execution-time"]'),
    resultsPagination: () => cy.get('[data-testid="results-pagination"]'),

    // Pre-defined queries
    predefinedQueries: () => this.getByDataCy('predefined-queries'),
    queryTemplate: queryName => cy.get(`[data-testid="query-template-${queryName}"]`),
    healthCheckQuery: () => this.elements.queryTemplate('health-check'),
    performanceQuery: () => this.elements.queryTemplate('performance'),
    tablesOverviewQuery: () => this.elements.queryTemplate('tables-overview'),

    // Table browser
    tableBrowser: () => this.getByDataCy('table-browser'),
    tableSelector: () => cy.get('[data-testid="table-selector"]'),
    tableDataGrid: () => cy.get('[data-testid="table-data-grid"]'),
    tableDataRow: index => cy.get(`[data-testid="table-row-${index}"]`),
    tableDataCell: (row, column) => cy.get(`[data-testid="cell-${row}-${column}"]`),
    tablePagination: () => cy.get('[data-testid="table-pagination"]'),
    tableFilters: () => cy.get('[data-testid="table-filters"]'),

    // Refresh and controls
    refreshButton: () => cy.contains('button', 'Refresh'),
    autoRefreshToggle: () => cy.get('[data-testid="auto-refresh-toggle"]'),
    refreshInterval: () => cy.get('[data-testid="refresh-interval"]'),
    lastUpdated: () => cy.get('[data-testid="last-updated"]'),

    // Loading states
    loadingSpinner: () => cy.get('.animate-spin'),
    schemaLoading: () => cy.get('[data-testid="schema-loading"]'),
    queryLoading: () => cy.get('[data-testid="query-loading"]'),
    healthLoading: () => cy.get('[data-testid="health-loading"]'),

    // Error states
    errorAlert: () => cy.get('[role="alert"]'),
    connectionError: () => cy.get('[data-testid="connection-error"]'),
    queryError: () => cy.get('[data-testid="query-error"]'),
    schemaError: () => cy.get('[data-testid="schema-error"]'),

    // Success states
    successMessage: () => cy.contains('success'),
    querySuccessMessage: () => cy.contains('Query executed successfully'),
    connectionSuccessMessage: () => cy.contains('Connected to database'),
  };

  // Page navigation actions
  visit() {
    cy.visit(this.pageUrl);
    this.waitForPageLoad();
    return this;
  }

  // Tab navigation actions
  switchToSchema() {
    this.logAction('Switching to Schema tab');
    this.elements.schemaTab().click();
    this.expectSchemaExplorerVisible();
    return this;
  }

  switchToHealth() {
    this.logAction('Switching to Health tab');
    this.elements.healthTab().click();
    this.expectHealthOverviewVisible();
    return this;
  }

  switchToTables() {
    this.logAction('Switching to Tables tab');
    this.elements.tablesTab().click();
    this.expectTableBrowserVisible();
    return this;
  }

  switchToQuery() {
    this.logAction('Switching to Query tab');
    this.elements.queryTab().click();
    this.expectQueryInterfaceVisible();
    return this;
  }

  // Health monitoring actions
  refreshHealthData() {
    this.logAction('Refreshing health data');
    this.elements.refreshButton().click();
    this.expectHealthLoading();
    this.expectHealthDataRefreshed();
    return this;
  }

  enableAutoRefresh(intervalSeconds = 30) {
    this.logAction(`Enabling auto-refresh every ${intervalSeconds} seconds`);
    this.elements.autoRefreshToggle().click();
    this.elements.refreshInterval().select(intervalSeconds.toString());
    return this;
  }

  disableAutoRefresh() {
    this.logAction('Disabling auto-refresh');
    this.elements.autoRefreshToggle().click();
    return this;
  }

  // Schema exploration actions
  expandTable(tableName) {
    this.logAction(`Expanding table: ${tableName}`);
    this.elements.tableExpander(tableName).click();
    this.expectColumnsVisible(tableName);
    return this;
  }

  selectTable(tableName) {
    this.logAction(`Selecting table: ${tableName}`);
    this.elements.tableItem(tableName).click();
    this.expectTableDetailsVisible(tableName);
    return this;
  }

  viewTableDetails(tableName) {
    this.logAction(`Viewing details for table: ${tableName}`);
    this.selectTable(tableName);
    this.expectTableDetailsComplete(tableName);
    return this;
  }

  // Query execution actions
  executeQuery(query) {
    this.logAction(`Executing query: ${query.substring(0, 50)}...`);
    this.elements.queryInput().clear().type(query);
    this.elements.executeQueryButton().click();
    this.expectQueryExecutionInProgress();
    this.expectQueryResults();
    return this;
  }

  executePredefinedQuery(queryName) {
    this.logAction(`Executing predefined query: ${queryName}`);
    this.elements.queryTemplate(queryName).click();
    this.elements.executeQueryButton().click();
    this.expectQueryResults();
    return this;
  }

  clearQuery() {
    this.logAction('Clearing query editor');
    this.elements.clearQueryButton().click();
    this.expectQueryCleared();
    return this;
  }

  // Table browsing actions
  selectTableForBrowsing(tableName) {
    this.logAction(`Selecting table for browsing: ${tableName}`);
    this.elements.tableSelector().select(tableName);
    this.expectTableDataLoaded();
    return this;
  }

  navigateTableData(direction) {
    this.logAction(`Navigating table data: ${direction}`);
    if (direction === 'next') {
      this.elements.tablePagination().contains('Next').click();
    } else if (direction === 'previous') {
      this.elements.tablePagination().contains('Previous').click();
    }
    this.expectTableDataLoaded();
    return this;
  }

  // Page state assertions
  expectToBeOnDatabaseToolsPage() {
    cy.url().should('include', '/debug-tools/database');
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  expectTabNavigationVisible() {
    this.elements.tabNavigation().should('be.visible');
    this.elements.schemaTab().should('be.visible');
    this.elements.healthTab().should('be.visible');
    this.elements.tablesTab().should('be.visible');
    this.elements.queryTab().should('be.visible');
    return this;
  }

  expectHealthOverviewVisible() {
    this.elements.healthOverview().should('be.visible');
    this.elements.connectionStatus().should('be.visible');
    this.elements.healthMetrics().should('be.visible');
    return this;
  }

  expectSchemaExplorerVisible() {
    this.elements.schemaExplorer().should('be.visible');
    this.elements.schemaTree().should('be.visible');
    return this;
  }

  expectQueryInterfaceVisible() {
    this.elements.queryInterface().should('be.visible');
    this.elements.queryEditor().should('be.visible');
    return this;
  }

  expectTableBrowserVisible() {
    this.elements.tableBrowser().should('be.visible');
    this.elements.tableSelector().should('be.visible');
    return this;
  }

  // Health status assertions
  expectConnectionStatus(status) {
    this.elements.connectionStatusBadge().should('contain', status);
    return this;
  }

  expectDatabaseConnected() {
    this.expectConnectionStatus('Connected');
    this.elements.connectedStatus().should('be.visible');
    return this;
  }

  expectDatabaseDisconnected() {
    this.expectConnectionStatus('Disconnected');
    this.elements.disconnectedStatus().should('be.visible');
    return this;
  }

  expectHealthStatus(status) {
    this.elements.statusIndicator(status).should('be.visible');
    return this;
  }

  expectHealthMetrics() {
    this.elements.metricsGrid().should('be.visible');
    this.elements.totalTables().should('be.visible');
    this.elements.totalRecords().should('be.visible');
    this.elements.databaseSize().should('be.visible');
    return this;
  }

  // Schema assertions
  expectTableVisible(tableName) {
    this.elements.tableItem(tableName).should('be.visible');
    return this;
  }

  expectColumnsVisible(tableName) {
    this.elements.columnsList(tableName).should('be.visible');
    return this;
  }

  expectTableDetailsVisible(tableName) {
    this.elements.tableDetails().should('be.visible');
    this.elements.tableNameDisplay().should('contain', tableName);
    return this;
  }

  expectTableDetailsComplete(tableName) {
    this.expectTableDetailsVisible(tableName);
    this.elements.tableRowCount().should('be.visible');
    this.elements.tableSize().should('be.visible');
    this.elements.tableColumns().should('be.visible');
    return this;
  }

  // Query assertions
  expectQueryResults() {
    this.elements.queryResults().should('be.visible');
    this.elements.resultsTable().should('be.visible');
    this.elements.resultsCount().should('be.visible');
    return this;
  }

  expectQueryExecutionInProgress() {
    this.elements.queryLoading().should('be.visible');
    this.elements.executeQueryButton().should('be.disabled');
    return this;
  }

  expectQueryCleared() {
    this.elements.queryInput().should('have.value', '');
    return this;
  }

  expectQueryExecutionTime() {
    this.elements.queryExecutionTime().should('be.visible');
    return this;
  }

  // Table browsing assertions
  expectTableDataLoaded() {
    this.elements.tableDataGrid().should('be.visible');
    return this;
  }

  expectTableRowCount(expectedCount) {
    this.elements
      .tableDataGrid()
      .find('[data-testid^="table-row-"]')
      .should('have.length', expectedCount);
    return this;
  }

  // Error state assertions
  expectConnectionError() {
    this.elements.connectionError().should('be.visible');
    return this;
  }

  expectQueryError(errorMessage) {
    this.elements.queryError().should('be.visible');
    if (errorMessage) {
      this.elements.queryError().should('contain', errorMessage);
    }
    return this;
  }

  expectSchemaError() {
    this.elements.schemaError().should('be.visible');
    return this;
  }

  // Loading state assertions
  expectLoadingState() {
    this.elements.loadingSpinner().should('be.visible');
    return this;
  }

  expectHealthLoading() {
    this.elements.healthLoading().should('be.visible');
    return this;
  }

  expectSchemaLoading() {
    this.elements.schemaLoading().should('be.visible');
    return this;
  }

  expectContentLoaded() {
    this.elements.loadingSpinner().should('not.exist');
    this.elements.healthOverview().should('be.visible');
    return this;
  }

  expectHealthDataRefreshed() {
    this.elements.healthLoading().should('not.exist');
    this.elements.lastUpdated().should('be.visible');
    return this;
  }

  // Wait for page load
  waitForPageLoad() {
    this.elements.pageTitle().should('be.visible', { timeout: this.loadTimeout });
    this.elements.tabNavigation().should('be.visible', { timeout: this.loadTimeout });
    return this;
  }

  // Complex workflows
  performDatabaseHealthCheck() {
    this.logAction('Performing comprehensive database health check');

    // Check connection status
    this.switchToHealth();
    this.expectDatabaseConnected();
    this.expectHealthMetrics();

    // Refresh health data
    this.refreshHealthData();

    // Verify key metrics are healthy
    this.expectHealthStatus('healthy');

    return this;
  }

  exploreCompleteSchema() {
    this.logAction('Exploring complete database schema');

    this.switchToSchema();
    this.expectSchemaExplorerVisible();

    // Get list of tables and explore first few
    cy.get('[data-testid^="table-"]').then($tables => {
      const tableCount = Math.min($tables.length, 3); // Limit to first 3 tables

      for (let i = 0; i < tableCount; i++) {
        const tableName = $tables.eq(i).attr('data-testid').replace('table-', '');
        this.expandTable(tableName);
        this.viewTableDetails(tableName);
      }
    });

    return this;
  }

  runDatabaseQueries() {
    this.logAction('Running database diagnostic queries');

    this.switchToQuery();
    this.expectQueryInterfaceVisible();

    // Run predefined health check queries
    this.executePredefinedQuery('health-check');
    this.expectQueryResults();

    this.executePredefinedQuery('performance');
    this.expectQueryResults();

    this.executePredefinedQuery('tables-overview');
    this.expectQueryResults();

    return this;
  }

  browseTableData() {
    this.logAction('Browsing table data');

    this.switchToTables();
    this.expectTableBrowserVisible();

    // Select first available table
    cy.get('[data-testid="table-selector"] option')
      .eq(1)
      .then($option => {
        const tableName = $option.val();
        this.selectTableForBrowsing(tableName);
        this.expectTableDataLoaded();

        // Navigate through data
        this.navigateTableData('next');
        this.navigateTableData('previous');
      });

    return this;
  }

  testDatabasePerformance() {
    this.logAction('Testing database performance');

    // Execute performance queries
    this.switchToQuery();

    const performanceQueries = [
      'SELECT COUNT(*) FROM campaigns',
      'SELECT COUNT(*) FROM users',
      'SELECT COUNT(*) FROM brand_lift_surveys',
    ];

    performanceQueries.forEach(query => {
      this.executeQuery(query);
      this.expectQueryExecutionTime();
      this.clearQuery();
    });

    return this;
  }

  // Error handling
  handleDatabaseErrors() {
    cy.get('body').then($body => {
      if ($body.text().includes('Error') || $body.find('[role="alert"]').length > 0) {
        cy.log('⚠️ Database tools error detected');
        this.takeScreenshot('database-tools-error');

        // Try to recover by refreshing
        cy.reload();
        this.waitForPageLoad();
      }
    });
    return this;
  }

  // Performance monitoring
  measureDatabasePageLoad() {
    return this.measurePageLoadTime({
      actionName: 'database-tools-load',
      performanceBudget: 3000, // 3 seconds for database tools page
    });
  }

  measureQueryExecution(query, queryFn) {
    return this.measureInteractionTime(queryFn, {
      actionName: 'database-query-execution',
      performanceBudget: 5000, // 5 seconds for query execution
    });
  }

  // Responsive design testing
  testMobileDatabaseTools() {
    cy.viewport('iphone-6');
    this.expectTabNavigationVisible();
    this.expectHealthOverviewVisible();
    cy.viewport(1280, 720); // Reset
    return this;
  }

  // Accessibility testing
  checkDatabaseToolsAccessibility() {
    cy.checkA11y('[data-cy="database-container"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
      },
    });
    return this;
  }

  // Complete database workflow
  testCompleteDatabaseWorkflow() {
    this.logAction('Testing complete database tools workflow');

    this.performDatabaseHealthCheck();
    this.exploreCompleteSchema();
    this.runDatabaseQueries();
    this.browseTableData();
    this.testDatabasePerformance();

    return this;
  }

  // Data validation
  validateDatabaseMetrics(expectedMetrics) {
    this.logAction('Validating database metrics');

    if (expectedMetrics.totalTables !== undefined) {
      this.elements.totalTables().should('contain', expectedMetrics.totalTables);
    }

    if (expectedMetrics.minRecords !== undefined) {
      this.elements
        .totalRecords()
        .invoke('text')
        .then(text => {
          const recordCount = parseInt(text.replace(/,/g, ''));
          expect(recordCount).to.be.at.least(expectedMetrics.minRecords);
        });
    }

    return this;
  }
}
