/**
 * Test Helpers - SSOT for Common Test Utilities
 *
 * This file contains reusable test utilities and patterns.
 * Ensures consistent test setup and API mocking across all tests.
 */

/**
 * API Interceptors - SSOT for all API mocking
 */
export class ApiInterceptors {
  // Authentication API interceptors
  static setupAuthInterceptors() {
    // Clerk session check
    cy.intercept('GET', '**/v1/client?**', {
      statusCode: 200,
      body: { object: 'client', sessions: [] },
    }).as('clerkClient');

    // User session
    cy.intercept('GET', '**/api/user**', {
      statusCode: 200,
      body: {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    }).as('userSession');
  }

  // Dashboard API interceptors
  static setupDashboardInterceptors() {
    // Dashboard data
    cy.intercept('GET', '**/api/dashboard**', {
      statusCode: 200,
      body: {
        metrics: {
          totalCampaigns: 12,
          surveyResponses: 1450,
          liveCampaigns: 3,
          creditsAvailable: 850,
        },
        upcomingCampaigns: [],
        calendarEvents: [],
      },
    }).as('dashboardData');

    // Calendar events
    cy.intercept('GET', '**/api/dashboard/events**', {
      statusCode: 200,
      body: [],
    }).as('calendarEvents');
  }

  // Campaign API interceptors
  static setupCampaignInterceptors() {
    // Campaign list
    cy.intercept('GET', '**/api/campaigns**', {
      statusCode: 200,
      body: {
        campaigns: [
          {
            id: 'camp-1',
            name: 'Test Campaign 1',
            status: 'active',
            objective: 'brand-awareness',
            startDate: '2024-01-15',
            endDate: '2024-02-15',
          },
          {
            id: 'camp-2',
            name: 'Test Campaign 2',
            status: 'draft',
            objective: 'engagement',
            startDate: '2024-02-01',
            endDate: '2024-03-01',
          },
        ],
        total: 2,
      },
    }).as('campaignsList');

    // Individual campaign
    cy.intercept('GET', '**/api/campaigns/*', {
      statusCode: 200,
      body: {
        id: 'camp-1',
        name: 'Test Campaign 1',
        status: 'active',
        objective: 'brand-awareness',
      },
    }).as('campaignDetails');

    // Campaign creation
    cy.intercept('POST', '**/api/campaigns', {
      statusCode: 201,
      body: {
        id: 'new-camp-id',
        message: 'Campaign created successfully',
      },
    }).as('createCampaign');

    // Campaign update
    cy.intercept('PUT', '**/api/campaigns/*', {
      statusCode: 200,
      body: { message: 'Campaign updated successfully' },
    }).as('updateCampaign');

    // Campaign deletion
    cy.intercept('DELETE', '**/api/campaigns/*', {
      statusCode: 200,
      body: { message: 'Campaign deleted successfully' },
    }).as('deleteCampaign');
  }

  // Setup all interceptors at once
  static setupAllInterceptors() {
    this.setupAuthInterceptors();
    this.setupDashboardInterceptors();
    this.setupCampaignInterceptors();
  }
}

/**
 * Test Setup Utilities - SSOT for test initialization
 */
export class TestSetup {
  // Standard beforeEach setup for authenticated tests
  static setupAuthenticatedTest(options = {}) {
    const {
      skipApiInterceptors = false,
      clearData = true,
      viewport = { width: 1280, height: 720 },
    } = options;

    if (clearData) {
      cy.clearLocalStorage();
      cy.clearCookies();
    }

    if (viewport) {
      cy.viewport(viewport.width, viewport.height);
    }

    if (!skipApiInterceptors) {
      ApiInterceptors.setupAllInterceptors();
    }

    // Mock authentication session
    cy.window().then(win => {
      win.localStorage.setItem('__clerk_db_jwt', 'mock-jwt-token');
    });
  }

  // Setup for unauthenticated tests (sign-in page, etc.)
  static setupUnauthenticatedTest(options = {}) {
    const { viewport = { width: 1280, height: 720 } } = options;

    cy.clearLocalStorage();
    cy.clearCookies();

    if (viewport) {
      cy.viewport(viewport.width, viewport.height);
    }

    ApiInterceptors.setupAuthInterceptors();
  }

  // Performance test setup
  static setupPerformanceTest(options = {}) {
    const { budget = 3000 } = options;

    this.setupAuthenticatedTest(options);

    // Add performance monitoring
    cy.window().then(win => {
      win.performance.mark('test-start');
    });
  }
}

/**
 * Data Generators - SSOT for test data creation
 */
export class TestDataGenerators {
  static generateCampaign(overrides = {}) {
    return {
      id: `camp-${Date.now()}`,
      name: `Test Campaign ${Date.now()}`,
      status: 'draft',
      objective: 'brand-awareness',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ...overrides,
    };
  }

  static generateUser(overrides = {}) {
    return {
      id: `user-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      ...overrides,
    };
  }

  static generateMetrics(overrides = {}) {
    return {
      totalCampaigns: Math.floor(Math.random() * 50),
      surveyResponses: Math.floor(Math.random() * 5000),
      liveCampaigns: Math.floor(Math.random() * 10),
      creditsAvailable: Math.floor(Math.random() * 1000),
      ...overrides,
    };
  }
}

/**
 * Assertion Helpers - SSOT for common test assertions
 */
export class AssertionHelpers {
  // URL assertions
  static expectUrlToBe(expectedUrl) {
    cy.url().should('eq', Cypress.config().baseUrl + expectedUrl);
  }

  static expectUrlToContain(urlFragment) {
    cy.url().should('include', urlFragment);
  }

  // Element assertions with data-cy
  static expectElementVisible(dataCy, timeout = 10000) {
    cy.get(`[data-cy="${dataCy}"]`, { timeout }).should('be.visible');
  }

  static expectElementText(dataCy, expectedText) {
    cy.get(`[data-cy="${dataCy}"]`).should('contain', expectedText);
  }

  static expectElementCount(dataCy, count) {
    cy.get(`[data-cy="${dataCy}"]`).should('have.length', count);
  }

  // API assertions
  static expectApiCallToHaveBeenMade(alias, times = 1) {
    cy.get(`@${alias.replace('@', '')}`).should('have.property', 'response');
    if (times > 1) {
      cy.get(`@${alias.replace('@', '')}.all`).should('have.length', times);
    }
  }

  static expectSuccessToast(message = null) {
    cy.get('[data-cy="toast-success"], [role="alert"]').should('be.visible');
    if (message) {
      cy.get('[data-cy="toast-success"], [role="alert"]').should('contain', message);
    }
  }

  static expectErrorToast(message = null) {
    cy.get('[data-cy="toast-error"], [role="alert"]').should('be.visible');
    if (message) {
      cy.get('[data-cy="toast-error"], [role="alert"]').should('contain', message);
    }
  }
}

/**
 * Wait Utilities - SSOT for dynamic waiting strategies
 */
export class WaitUtilities {
  // Wait for page to be fully loaded
  static waitForPageLoad(timeout = 15000) {
    cy.get('body', { timeout }).should('be.visible');
    cy.window().its('document.readyState').should('eq', 'complete');
  }

  // Wait for specific API calls to complete
  static waitForApiCalls(aliases, timeout = 10000) {
    const aliasArray = Array.isArray(aliases) ? aliases : [aliases];
    aliasArray.forEach(alias => {
      cy.wait(alias, { timeout });
    });
  }

  // Wait for element to appear and be interactive
  static waitForInteractiveElement(selector, timeout = 10000) {
    cy.get(selector, { timeout }).should('be.visible').and('not.be.disabled');
  }

  // Wait for loader to disappear
  static waitForLoadingToComplete(loaderSelector = '[data-cy*="loading"], .spinner, .loading') {
    cy.get(loaderSelector).should('not.exist');
  }
}
