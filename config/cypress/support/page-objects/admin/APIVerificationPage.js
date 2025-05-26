import { BasePage } from '../shared/BasePage.js';

/**
 * API Verification Page Object Model
 * Handles API testing and verification tools
 *
 * Covers:
 * - External API endpoint testing and validation
 * - API response verification and analysis
 * - Integration health monitoring
 * - API performance testing
 * - Authentication and authorization testing
 * - Error handling and debugging tools
 */

export class APIVerificationPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/debug-tools/api-verification';
    this.pageTitle = 'API Verification';
  }

  // Element selectors using data-cy attributes
  elements = {
    // Main page container
    apiVerificationContainer: () => this.getByDataCy('api-verification-container'),
    pageHeader: () => this.getByDataCy('api-verification-header'),
    pageTitle: () => cy.contains('h1', 'API Verification'),

    // API testing interface
    apiTestingInterface: () => this.getByDataCy('api-testing-interface'),
    endpointSelector: () => cy.get('[data-testid="endpoint-selector"]'),
    methodSelector: () => cy.get('[data-testid="method-selector"]'),
    customEndpointInput: () => cy.get('input[data-testid="custom-endpoint"]'),
    headersSection: () => cy.get('[data-testid="headers-section"]'),
    bodySection: () => cy.get('[data-testid="body-section"]'),

    // HTTP methods
    getMethod: () => cy.contains('option', 'GET'),
    postMethod: () => cy.contains('option', 'POST'),
    putMethod: () => cy.contains('option', 'PUT'),
    deleteMethod: () => cy.contains('option', 'DELETE'),

    // Pre-defined API endpoints
    predefinedEndpoints: () => this.getByDataCy('predefined-endpoints'),
    endpointOption: endpointName => cy.get(`[data-testid="endpoint-${endpointName}"]`),
    healthEndpoint: () => this.elements.endpointOption('health'),
    authEndpoint: () => this.elements.endpointOption('auth'),
    campaignsEndpoint: () => this.elements.endpointOption('campaigns'),
    usersEndpoint: () => this.elements.endpointOption('users'),
    brandLiftEndpoint: () => this.elements.endpointOption('brand-lift'),

    // Request configuration
    requestHeaders: () => cy.get('[data-testid="request-headers"]'),
    requestBody: () => cy.get('textarea[data-testid="request-body"]'),
    authTokenInput: () => cy.get('input[data-testid="auth-token"]'),
    contentTypeSelect: () => cy.get('[data-testid="content-type"]'),
    acceptHeaderInput: () => cy.get('input[data-testid="accept-header"]'),

    // Test execution
    executeTestButton: () => cy.contains('button', 'Execute Test'),
    clearRequestButton: () => cy.contains('button', 'Clear'),
    saveRequestButton: () => cy.contains('button', 'Save Request'),
    loadRequestButton: () => cy.contains('button', 'Load Request'),

    // Response display
    responseSection: () => this.getByDataCy('response-section'),
    responseStatus: () => cy.get('[data-testid="response-status"]'),
    responseStatusCode: () => cy.get('[data-testid="status-code"]'),
    responseTime: () => cy.get('[data-testid="response-time"]'),
    responseHeaders: () => cy.get('[data-testid="response-headers"]'),
    responseBody: () => cy.get('[data-testid="response-body"]'),

    // Response analysis
    responseAnalysis: () => this.getByDataCy('response-analysis'),
    statusCodeAnalysis: () => cy.get('[data-testid="status-code-analysis"]'),
    performanceAnalysis: () => cy.get('[data-testid="performance-analysis"]'),
    structureAnalysis: () => cy.get('[data-testid="structure-analysis"]'),
    validationResults: () => cy.get('[data-testid="validation-results"]'),

    // Status indicators
    statusIndicator: status => cy.get(`[data-testid="status-${status}"]`),
    successStatus: () => this.elements.statusIndicator('success'),
    errorStatus: () => this.elements.statusIndicator('error'),
    warningStatus: () => this.elements.statusIndicator('warning'),
    timeoutStatus: () => this.elements.statusIndicator('timeout'),

    // API health monitoring
    healthMonitoring: () => this.getByDataCy('health-monitoring'),
    healthDashboard: () => cy.get('[data-testid="health-dashboard"]'),
    endpointHealthCard: endpoint => cy.get(`[data-testid="health-${endpoint}"]`),
    overallHealthScore: () => cy.get('[data-testid="overall-health-score"]'),
    healthTrend: () => cy.get('[data-testid="health-trend"]'),

    // Performance metrics
    performanceMetrics: () => this.getByDataCy('performance-metrics'),
    avgResponseTime: () => cy.get('[data-testid="avg-response-time"]'),
    successRate: () => cy.get('[data-testid="success-rate"]'),
    errorRate: () => cy.get('[data-testid="error-rate"]'),
    requestsPerMinute: () => cy.get('[data-testid="requests-per-minute"]'),

    // Test history
    testHistory: () => this.getByDataCy('test-history'),
    historyList: () => cy.get('[data-testid="history-list"]'),
    historyItem: index => cy.get(`[data-testid="history-item-${index}"]`),
    clearHistoryButton: () => cy.contains('button', 'Clear History'),
    exportHistoryButton: () => cy.contains('button', 'Export'),

    // Batch testing
    batchTesting: () => this.getByDataCy('batch-testing'),
    batchTestList: () => cy.get('[data-testid="batch-test-list"]'),
    addBatchTestButton: () => cy.contains('button', 'Add to Batch'),
    runBatchTestsButton: () => cy.contains('button', 'Run Batch Tests'),
    batchResults: () => cy.get('[data-testid="batch-results"]'),

    // Authentication testing
    authTesting: () => this.getByDataCy('auth-testing'),
    authMethodSelect: () => cy.get('[data-testid="auth-method"]'),
    bearerTokenInput: () => cy.get('input[data-testid="bearer-token"]'),
    apiKeyInput: () => cy.get('input[data-testid="api-key"]'),
    basicAuthUsername: () => cy.get('input[data-testid="basic-auth-username"]'),
    basicAuthPassword: () => cy.get('input[data-testid="basic-auth-password"]'),

    // Error handling
    errorDetails: () => this.getByDataCy('error-details'),
    errorMessage: () => cy.get('[data-testid="error-message"]'),
    errorCode: () => cy.get('[data-testid="error-code"]'),
    errorStackTrace: () => cy.get('[data-testid="error-stack-trace"]'),
    retryButton: () => cy.contains('button', 'Retry'),

    // Loading states
    loadingSpinner: () => cy.get('.animate-spin'),
    testingInProgress: () => cy.get('[data-testid="testing-in-progress"]'),
    batchTestingProgress: () => cy.get('[data-testid="batch-progress"]'),

    // Success states
    successMessage: () => cy.contains('success'),
    testSuccessMessage: () => cy.contains('Test completed successfully'),
    validationSuccessMessage: () => cy.contains('Validation passed'),

    // Export and reporting
    exportOptions: () => this.getByDataCy('export-options'),
    exportJsonButton: () => cy.contains('button', 'Export JSON'),
    exportCsvButton: () => cy.contains('button', 'Export CSV'),
    generateReportButton: () => cy.contains('button', 'Generate Report'),
  };

  // Page navigation actions
  visit() {
    cy.visit(this.pageUrl);
    this.waitForPageLoad();
    return this;
  }

  // API endpoint selection actions
  selectPredefinedEndpoint(endpointName) {
    this.logAction(`Selecting predefined endpoint: ${endpointName}`);
    this.elements.endpointSelector().select(endpointName);
    return this;
  }

  setCustomEndpoint(url) {
    this.logAction(`Setting custom endpoint: ${url}`);
    this.elements.customEndpointInput().clear().type(url);
    return this;
  }

  selectHttpMethod(method) {
    this.logAction(`Selecting HTTP method: ${method}`);
    this.elements.methodSelector().select(method);
    return this;
  }

  // Request configuration actions
  setRequestHeaders(headers) {
    this.logAction('Setting request headers');
    this.elements
      .requestHeaders()
      .clear()
      .type(JSON.stringify(headers, null, 2));
    return this;
  }

  setRequestBody(body) {
    this.logAction('Setting request body');
    this.elements
      .requestBody()
      .clear()
      .type(typeof body === 'string' ? body : JSON.stringify(body, null, 2));
    return this;
  }

  setAuthToken(token) {
    this.logAction('Setting authentication token');
    this.elements.authTokenInput().clear().type(token);
    return this;
  }

  setContentType(contentType) {
    this.logAction(`Setting content type: ${contentType}`);
    this.elements.contentTypeSelect().select(contentType);
    return this;
  }

  // Authentication methods
  setBearerToken(token) {
    this.logAction('Setting Bearer token authentication');
    this.elements.authMethodSelect().select('Bearer');
    this.elements.bearerTokenInput().clear().type(token);
    return this;
  }

  setApiKey(apiKey) {
    this.logAction('Setting API key authentication');
    this.elements.authMethodSelect().select('API Key');
    this.elements.apiKeyInput().clear().type(apiKey);
    return this;
  }

  setBasicAuth(username, password) {
    this.logAction('Setting Basic authentication');
    this.elements.authMethodSelect().select('Basic');
    this.elements.basicAuthUsername().clear().type(username);
    this.elements.basicAuthPassword().clear().type(password);
    return this;
  }

  // Test execution actions
  executeAPITest() {
    this.logAction('Executing API test');
    this.elements.executeTestButton().click();
    this.expectTestInProgress();
    this.expectTestResults();
    return this;
  }

  clearRequest() {
    this.logAction('Clearing request configuration');
    this.elements.clearRequestButton().click();
    return this;
  }

  saveRequest(name) {
    this.logAction(`Saving request configuration: ${name}`);
    this.elements.saveRequestButton().click();
    // Handle save modal if it appears
    cy.get('body').then($body => {
      if ($body.find('input[placeholder*="name"]').length > 0) {
        cy.get('input[placeholder*="name"]').type(name);
        cy.contains('button', 'Save').click();
      }
    });
    return this;
  }

  loadSavedRequest(name) {
    this.logAction(`Loading saved request: ${name}`);
    this.elements.loadRequestButton().click();
    cy.contains(name).click();
    return this;
  }

  // Batch testing actions
  addToBatch() {
    this.logAction('Adding current request to batch tests');
    this.elements.addBatchTestButton().click();
    return this;
  }

  runBatchTests() {
    this.logAction('Running batch tests');
    this.elements.runBatchTestsButton().click();
    this.expectBatchTestingInProgress();
    this.expectBatchResults();
    return this;
  }

  // Page state assertions
  expectToBeOnAPIVerificationPage() {
    cy.url().should('include', '/debug-tools/api-verification');
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  expectAPITestingInterfaceVisible() {
    this.elements.apiTestingInterface().should('be.visible');
    this.elements.endpointSelector().should('be.visible');
    this.elements.methodSelector().should('be.visible');
    return this;
  }

  expectPredefinedEndpointsVisible() {
    this.elements.predefinedEndpoints().should('be.visible');
    this.elements.healthEndpoint().should('be.visible');
    return this;
  }

  // Test execution assertions
  expectTestInProgress() {
    this.elements.testingInProgress().should('be.visible');
    this.elements.executeTestButton().should('be.disabled');
    return this;
  }

  expectTestResults() {
    this.elements.responseSection().should('be.visible');
    this.elements.responseStatus().should('be.visible');
    this.elements.responseTime().should('be.visible');
    return this;
  }

  expectSuccessfulResponse() {
    this.elements.successStatus().should('be.visible');
    this.elements.responseStatusCode().should('contain', '200');
    return this;
  }

  expectErrorResponse() {
    this.elements.errorStatus().should('be.visible');
    this.elements.errorDetails().should('be.visible');
    return this;
  }

  expectResponseTime(maxTime) {
    this.elements
      .responseTime()
      .invoke('text')
      .then(text => {
        const responseTime = parseInt(text.replace(/\D/g, ''));
        expect(responseTime).to.be.lessThan(maxTime);
      });
    return this;
  }

  // Response analysis assertions
  expectResponseAnalysis() {
    this.elements.responseAnalysis().should('be.visible');
    this.elements.statusCodeAnalysis().should('be.visible');
    this.elements.performanceAnalysis().should('be.visible');
    return this;
  }

  expectValidationResults() {
    this.elements.validationResults().should('be.visible');
    return this;
  }

  expectValidationPassed() {
    this.elements.validationSuccessMessage().should('be.visible');
    return this;
  }

  // Health monitoring assertions
  expectHealthMonitoringVisible() {
    this.elements.healthMonitoring().should('be.visible');
    this.elements.healthDashboard().should('be.visible');
    return this;
  }

  expectOverallHealthScore(minScore) {
    this.elements
      .overallHealthScore()
      .invoke('text')
      .then(text => {
        const score = parseInt(text.replace(/\D/g, ''));
        expect(score).to.be.at.least(minScore);
      });
    return this;
  }

  expectEndpointHealthy(endpoint) {
    this.elements.endpointHealthCard(endpoint).should('contain', 'Healthy');
    return this;
  }

  // Performance metrics assertions
  expectPerformanceMetrics() {
    this.elements.performanceMetrics().should('be.visible');
    this.elements.avgResponseTime().should('be.visible');
    this.elements.successRate().should('be.visible');
    return this;
  }

  expectSuccessRate(minRate) {
    this.elements
      .successRate()
      .invoke('text')
      .then(text => {
        const rate = parseFloat(text.replace(/[^\d.]/g, ''));
        expect(rate).to.be.at.least(minRate);
      });
    return this;
  }

  // Batch testing assertions
  expectBatchTestingInProgress() {
    this.elements.batchTestingProgress().should('be.visible');
    this.elements.runBatchTestsButton().should('be.disabled');
    return this;
  }

  expectBatchResults() {
    this.elements.batchResults().should('be.visible');
    return this;
  }

  expectBatchTestCount(expectedCount) {
    this.elements
      .batchTestList()
      .find('[data-testid^="batch-test-"]')
      .should('have.length', expectedCount);
    return this;
  }

  // Error handling assertions
  expectErrorDetails() {
    this.elements.errorDetails().should('be.visible');
    this.elements.errorMessage().should('be.visible');
    return this;
  }

  expectSpecificError(errorMessage) {
    this.elements.errorMessage().should('contain', errorMessage);
    return this;
  }

  // Loading state assertions
  expectLoadingState() {
    this.elements.loadingSpinner().should('be.visible');
    return this;
  }

  expectContentLoaded() {
    this.elements.loadingSpinner().should('not.exist');
    this.elements.apiTestingInterface().should('be.visible');
    return this;
  }

  // Wait for page load
  waitForPageLoad() {
    this.elements.pageTitle().should('be.visible', { timeout: this.loadTimeout });
    this.elements.apiTestingInterface().should('be.visible', { timeout: this.loadTimeout });
    return this;
  }

  // Complex workflows
  testHealthEndpoint() {
    this.logAction('Testing health endpoint');

    this.selectPredefinedEndpoint('health');
    this.selectHttpMethod('GET');
    this.executeAPITest();
    this.expectSuccessfulResponse();
    this.expectResponseTime(2000); // 2 seconds

    return this;
  }

  testAuthenticatedEndpoint(token) {
    this.logAction('Testing authenticated endpoint');

    this.selectPredefinedEndpoint('campaigns');
    this.selectHttpMethod('GET');
    this.setBearerToken(token);
    this.executeAPITest();
    this.expectSuccessfulResponse();

    return this;
  }

  testPostRequest(endpoint, data) {
    this.logAction(`Testing POST request to: ${endpoint}`);

    this.setCustomEndpoint(endpoint);
    this.selectHttpMethod('POST');
    this.setContentType('application/json');
    this.setRequestBody(data);
    this.executeAPITest();

    return this;
  }

  runComprehensiveAPITests() {
    this.logAction('Running comprehensive API test suite');

    // Test multiple endpoints
    const endpoints = ['health', 'auth', 'campaigns', 'users'];

    endpoints.forEach(endpoint => {
      this.selectPredefinedEndpoint(endpoint);
      this.executeAPITest();
      this.expectTestResults();
      this.clearRequest();
    });

    return this;
  }

  validateAPIPerformance() {
    this.logAction('Validating API performance');

    this.expectPerformanceMetrics();
    this.expectSuccessRate(95); // 95% success rate
    this.expectOverallHealthScore(80); // 80% health score

    return this;
  }

  testBatchAPIRequests() {
    this.logAction('Testing batch API requests');

    // Add multiple requests to batch
    this.selectPredefinedEndpoint('health');
    this.addToBatch();

    this.selectPredefinedEndpoint('campaigns');
    this.addToBatch();

    this.selectPredefinedEndpoint('users');
    this.addToBatch();

    // Run batch tests
    this.runBatchTests();
    this.expectBatchResults();

    return this;
  }

  testErrorHandling() {
    this.logAction('Testing error handling');

    // Test invalid endpoint
    this.setCustomEndpoint('/invalid-endpoint');
    this.executeAPITest();
    this.expectErrorResponse();

    // Test unauthorized request
    this.selectPredefinedEndpoint('campaigns');
    this.setBearerToken('invalid-token');
    this.executeAPITest();
    this.expectSpecificError('Unauthorized');

    return this;
  }

  // Export and reporting
  exportTestResults(format = 'json') {
    this.logAction(`Exporting test results as: ${format}`);

    if (format === 'json') {
      this.elements.exportJsonButton().click();
    } else if (format === 'csv') {
      this.elements.exportCsvButton().click();
    }

    return this;
  }

  generateReport() {
    this.logAction('Generating API verification report');
    this.elements.generateReportButton().click();
    return this;
  }

  // Error handling
  handleAPIVerificationErrors() {
    cy.get('body').then($body => {
      if ($body.text().includes('Error') || $body.find('[role="alert"]').length > 0) {
        cy.log('⚠️ API verification error detected');
        this.takeScreenshot('api-verification-error');

        // Try to recover by refreshing
        cy.reload();
        this.waitForPageLoad();
      }
    });
    return this;
  }

  // Performance monitoring
  measureAPITestExecution() {
    return this.measureInteractionTime(
      () => {
        this.executeAPITest();
      },
      {
        actionName: 'api-test-execution',
        performanceBudget: 3000, // 3 seconds for API test
      }
    );
  }

  measureBatchTesting() {
    return this.measureInteractionTime(
      () => {
        this.runBatchTests();
      },
      {
        actionName: 'batch-api-testing',
        performanceBudget: 10000, // 10 seconds for batch tests
      }
    );
  }

  // Responsive design testing
  testMobileAPIVerification() {
    cy.viewport('iphone-6');
    this.expectAPITestingInterfaceVisible();
    cy.viewport(1280, 720); // Reset
    return this;
  }

  // Accessibility testing
  checkAPIVerificationAccessibility() {
    cy.checkA11y('[data-cy="api-verification-container"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
      },
    });
    return this;
  }

  // Complete API verification workflow
  testCompleteAPIWorkflow() {
    this.logAction('Testing complete API verification workflow');

    this.testHealthEndpoint();
    this.runComprehensiveAPITests();
    this.validateAPIPerformance();
    this.testBatchAPIRequests();
    this.testErrorHandling();

    return this;
  }
}
