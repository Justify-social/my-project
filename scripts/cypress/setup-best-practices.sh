#!/bin/bash

# Cypress Best Practices Setup Script
# This script implements the recommended Cypress best practices structure

set -e

echo "🚀 Setting up Cypress Best Practices Implementation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Create enhanced directory structure
print_info "Creating enhanced Cypress directory structure..."

# Create new command organization
mkdir -p config/cypress/support/commands
mkdir -p config/cypress/support/page-objects/auth
mkdir -p config/cypress/support/page-objects/campaigns
mkdir -p config/cypress/support/page-objects/shared
mkdir -p config/cypress/support/utils
mkdir -p config/cypress/fixtures/users
mkdir -p config/cypress/fixtures/campaigns
mkdir -p config/cypress/fixtures/api-responses
mkdir -p config/cypress/e2e/shared

print_status "Directory structure created"

# Install additional Cypress dependencies
print_info "Installing enhanced Cypress dependencies..."

npm install --save-dev \
    cypress-file-upload \
    cypress-axe \
    cypress-real-events \
    cypress-wait-until \
    mochawesome \
    mochawesome-merge \
    mochawesome-report-generator \
    start-server-and-test

print_status "Dependencies installed"

# Create enhanced configuration
print_info "Creating enhanced Cypress configuration..."

cat > cypress.config.enhanced.js << 'EOF'
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Base configuration
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Performance optimization
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Test organization
    specPattern: 'config/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'config/cypress/support/e2e.js',
    fixturesFolder: 'config/cypress/fixtures',
    screenshotsFolder: 'config/cypress/screenshots',
    videosFolder: 'config/cypress/videos',
    
    // Enhanced reporting
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'config/cypress/reports',
      overwrite: false,
      html: false,
      json: true,
      timestamp: 'mmddyyyy_HHMMss'
    },
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    setupNodeEvents(on, config) {
      // Custom tasks
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        
        // Database reset task (customize for your database)
        resetDatabase() {
          // Implement your database reset logic here
          return null;
        },
        
        // Performance monitoring
        measurePerformance({ url, metrics }) {
          console.log(`Performance metrics for ${url}:`, metrics);
          return null;
        }
      });
      
      // Environment variables
      config.env = {
        ...config.env,
        // Add your environment-specific variables
        API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
        TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || 'test@example.com',
        TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD || 'testpassword123'
      };
      
      return config;
    }
  },
  
  // Component testing configuration (if needed)
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack'
    }
  }
});
EOF

print_status "Enhanced configuration created"

# Create authentication commands
print_info "Creating authentication commands..."

cat > config/cypress/support/commands/auth.js << 'EOF'
/**
 * Authentication Commands
 * Programmatic authentication following Cypress best practices
 */

// Programmatic login command
Cypress.Commands.add('login', (email, password, options = {}) => {
  const userEmail = email || Cypress.env('TEST_USER_EMAIL') || 'admin@example.com';
  const userPassword = password || Cypress.env('TEST_USER_PASSWORD') || 'password';
  
  cy.log(`Logging in as ${userEmail}`);
  
  // Option 1: API-based login (recommended)
  if (options.method === 'api') {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: userEmail,
        password: userPassword
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        // Store authentication token
        if (response.body.token) {
          window.localStorage.setItem('authToken', response.body.token);
          cy.setCookie('session', response.body.sessionId || 'test-session-id');
        }
        
        // Store user data
        if (response.body.user) {
          window.localStorage.setItem('user', JSON.stringify(response.body.user));
        }
      } else {
        throw new Error(`Login failed with status ${response.status}`);
      }
    });
  } else {
    // Option 2: Mock authentication (fallback)
    window.localStorage.setItem('authToken', 'fake-token-for-testing');
    window.localStorage.setItem('user', JSON.stringify({
      id: '1',
      email: userEmail,
      role: options.role || 'admin'
    }));
    cy.setCookie('appSession.0', 'dummyValue', { path: '/' });
  }
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.log('Logging out');
  
  // Clear authentication state
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Optional: Call logout API
  cy.request({
    method: 'POST',
    url: '/api/auth/logout',
    failOnStatusCode: false
  });
});

// Check authentication state
Cypress.Commands.add('checkAuthState', (expectedState = 'authenticated') => {
  if (expectedState === 'authenticated') {
    cy.window().then((win) => {
      expect(win.localStorage.getItem('authToken')).to.not.be.null;
    });
  } else {
    cy.window().then((win) => {
      expect(win.localStorage.getItem('authToken')).to.be.null;
    });
  }
});

// Login as specific role
Cypress.Commands.add('loginAs', (role) => {
  const roleCredentials = {
    admin: { email: 'admin@example.com', password: 'admin123' },
    user: { email: 'user@example.com', password: 'user123' },
    guest: { email: 'guest@example.com', password: 'guest123' }
  };
  
  const credentials = roleCredentials[role];
  if (!credentials) {
    throw new Error(`Unknown role: ${role}`);
  }
  
  cy.login(credentials.email, credentials.password, { role });
});
EOF

print_status "Authentication commands created"

# Create form interaction commands
print_info "Creating form interaction commands..."

cat > config/cypress/support/commands/forms.js << 'EOF'
/**
 * Form Interaction Commands
 * Enhanced form handling following Cypress best practices
 */

// Fill form by data-cy attributes
Cypress.Commands.add('fillFormByTestId', (formData, options = {}) => {
  const { submitAfterFill = false, waitForResponse = null } = options;
  
  Object.entries(formData).forEach(([field, value]) => {
    if (value === null || value === undefined) return;
    
    const selector = `[data-cy="${field}"]`;
    
    cy.get(selector).then(($el) => {
      const elementType = $el.prop('tagName').toLowerCase();
      const inputType = $el.prop('type');
      
      if (elementType === 'select') {
        cy.get(selector).select(value);
      } else if (inputType === 'checkbox') {
        if (value) {
          cy.get(selector).check();
        } else {
          cy.get(selector).uncheck();
        }
      } else if (inputType === 'radio') {
        cy.get(selector).check(value);
      } else if (elementType === 'textarea' || inputType === 'text' || inputType === 'email' || inputType === 'password') {
        cy.get(selector).clear().type(value);
      } else if (inputType === 'file') {
        cy.get(selector).selectFile(value);
      } else {
        cy.get(selector).clear().type(value);
      }
    });
  });
  
  if (submitAfterFill) {
    if (waitForResponse) {
      cy.intercept(waitForResponse.method, waitForResponse.url).as('formSubmission');
    }
    cy.get('[data-cy="submit"], [type="submit"]').click();
    if (waitForResponse) {
      cy.wait('@formSubmission');
    }
  }
});

// Validate form errors
Cypress.Commands.add('expectFormErrors', (expectedErrors) => {
  Object.entries(expectedErrors).forEach(([field, errorMessage]) => {
    cy.get(`[data-cy="${field}-error"]`).should('contain', errorMessage);
  });
});

// Clear form
Cypress.Commands.add('clearForm', (fields) => {
  fields.forEach(field => {
    cy.get(`[data-cy="${field}"]`).clear();
  });
});

// Validate form values
Cypress.Commands.add('expectFormValues', (expectedValues) => {
  Object.entries(expectedValues).forEach(([field, expectedValue]) => {
    cy.get(`[data-cy="${field}"]`).should('have.value', expectedValue);
  });
});
EOF

print_status "Form commands created"

# Create API interaction commands
print_info "Creating API interaction commands..."

cat > config/cypress/support/commands/api.js << 'EOF'
/**
 * API Interaction Commands
 * Direct API testing and setup commands
 */

// Create test data via API
Cypress.Commands.add('createTestCampaign', (campaignData = {}) => {
  const defaultCampaign = {
    name: `Test Campaign ${Date.now()}`,
    budget: 10000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ...campaignData
  };
  
  return cy.request({
    method: 'POST',
    url: '/api/campaigns',
    body: defaultCampaign,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`
    }
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

// Reset test data
Cypress.Commands.add('resetTestData', () => {
  return cy.task('resetDatabase');
});

// Wait for API response with timeout
Cypress.Commands.add('waitForApiResponse', (alias, timeout = 10000) => {
  cy.wait(alias, { timeout }).then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201, 204]);
    return interception.response.body;
  });
});

// Mock API response
Cypress.Commands.add('mockApiResponse', (method, url, response, alias) => {
  cy.intercept(method, url, response).as(alias);
});
EOF

print_status "API commands created"

# Create navigation commands
print_info "Creating navigation commands..."

cat > config/cypress/support/commands/navigation.js << 'EOF'
/**
 * Navigation Commands
 * Enhanced navigation with performance monitoring
 */

// Navigate with performance monitoring
Cypress.Commands.add('visitWithPerformance', (url, options = {}) => {
  const { timeout = 10000, performanceBudget = 3000 } = options;
  
  cy.visit(url, {
    timeout,
    onBeforeLoad: (win) => {
      win.performance.mark('navigation-start');
    },
    onLoad: (win) => {
      win.performance.mark('navigation-end');
      win.performance.measure('navigation', 'navigation-start', 'navigation-end');
    }
  });
  
  // Check performance budget
  cy.window().then((win) => {
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
EOF

print_status "Navigation commands created"

# Create enhanced support file
print_info "Creating enhanced support file..."

cat > config/cypress/support/e2e.enhanced.js << 'EOF'
// Import enhanced commands
import './commands/auth';
import './commands/forms';
import './commands/api';
import './commands/navigation';

// Import additional libraries
import 'cypress-file-upload';
import 'cypress-axe';
import 'cypress-real-events';
import 'cypress-wait-until';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log error for debugging
  cy.log('Uncaught exception:', err.message);
  
  // Don't fail tests on known non-critical errors
  const ignoredErrors = [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Script error',
    'Network Error'
  ];
  
  const shouldIgnore = ignoredErrors.some(ignoredError => 
    err.message.includes(ignoredError)
  );
  
  if (shouldIgnore) {
    return false;
  }
  
  // Capture screenshot for unknown errors
  cy.screenshot('uncaught-exception', { 
    capture: 'fullPage',
    onAfterScreenshot: (details) => {
      cy.log(`Screenshot saved: ${details.path}`);
    }
  });
  
  return true;
});

// Global hooks
beforeEach(() => {
  // Clear state before each test
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Set viewport for consistency
  cy.viewport(1280, 720);
  
  // Dismiss onboarding modals if they appear
  cy.get('body').then($body => {
    if ($body.find('[aria-label="User Onboarding"]').length > 0) {
      cy.contains('Got it!').click({ force: true });
    }
  });
});

// Performance monitoring
Cypress.Commands.add('measurePageLoadTime', (url) => {
  cy.visitWithPerformance(url, { performanceBudget: 3000 });
});

// Accessibility testing
Cypress.Commands.add('checkA11y', (selector = null, options = {}) => {
  cy.injectAxe();
  cy.checkA11y(selector, options);
});

// Console error checking
Cypress.Commands.add('expectNoConsoleErrors', () => {
  cy.window().then((win) => {
    const errors = win.console.error.args || [];
    expect(errors, 'Console errors found').to.have.length(0);
  });
});

// Enhanced waiting
Cypress.Commands.add('waitUntilVisible', (selector, options = {}) => {
  const { timeout = 10000 } = options;
  cy.waitUntil(() => 
    cy.get(selector).then($el => $el.is(':visible')), 
    { timeout }
  );
});
EOF

print_status "Enhanced support file created"

# Create Page Object Model examples
print_info "Creating Page Object Model examples..."

cat > config/cypress/support/page-objects/auth/LoginPage.js << 'EOF'
/**
 * Login Page Object Model
 * Encapsulates login page interactions
 */

export class LoginPage {
  // Element selectors
  elements = {
    emailInput: () => cy.get('[data-cy="email-input"]'),
    passwordInput: () => cy.get('[data-cy="password-input"]'),
    submitButton: () => cy.get('[data-cy="login-submit"]'),
    errorMessage: () => cy.get('[data-cy="login-error"]'),
    forgotPasswordLink: () => cy.get('[data-cy="forgot-password"]'),
    signUpLink: () => cy.get('[data-cy="sign-up-link"]')
  };

  // Page actions
  visit() {
    cy.visit('/auth/signin');
    this.elements.emailInput().should('be.visible');
    return this;
  }

  fillCredentials(email, password) {
    this.elements.emailInput().clear().type(email);
    this.elements.passwordInput().clear().type(password);
    return this;
  }

  submit() {
    this.elements.submitButton().click();
    return this;
  }

  clickForgotPassword() {
    this.elements.forgotPasswordLink().click();
    return this;
  }

  clickSignUp() {
    this.elements.signUpLink().click();
    return this;
  }

  // Assertions
  expectSuccessfulLogin() {
    cy.url().should('not.include', '/auth/signin');
    cy.get('[data-cy="user-menu"]').should('be.visible');
    return this;
  }

  expectLoginError(message) {
    this.elements.errorMessage().should('be.visible').and('contain', message);
    return this;
  }

  expectToBeOnLoginPage() {
    cy.url().should('include', '/auth/signin');
    this.elements.emailInput().should('be.visible');
    return this;
  }

  // Complete workflows
  loginWithCredentials(email, password) {
    return this.visit()
      .fillCredentials(email, password)
      .submit();
  }

  loginWithValidCredentials() {
    return this.loginWithCredentials(
      Cypress.env('TEST_USER_EMAIL'),
      Cypress.env('TEST_USER_PASSWORD')
    );
  }
}
EOF

cat > config/cypress/support/page-objects/campaigns/CampaignListPage.js << 'EOF'
/**
 * Campaign List Page Object Model
 * Encapsulates campaign list page interactions
 */

export class CampaignListPage {
  elements = {
    createButton: () => cy.get('[data-cy="create-campaign-btn"]'),
    campaignList: () => cy.get('[data-cy="campaigns-list"]'),
    campaignItem: (campaignName) => cy.get(`[data-cy="campaign-item-${campaignName}"]`),
    searchInput: () => cy.get('[data-cy="campaign-search"]'),
    filterButton: () => cy.get('[data-cy="filter-button"]'),
    sortDropdown: () => cy.get('[data-cy="sort-dropdown"]'),
    emptyState: () => cy.get('[data-cy="empty-campaigns"]')
  };

  visit() {
    cy.visit('/campaigns');
    this.elements.campaignList().should('be.visible');
    return this;
  }

  createNewCampaign() {
    this.elements.createButton().click();
    return this;
  }

  searchForCampaign(searchTerm) {
    this.elements.searchInput().clear().type(searchTerm);
    return this;
  }

  selectCampaign(campaignName) {
    this.elements.campaignItem(campaignName).click();
    return this;
  }

  expectCampaignExists(campaignName) {
    this.elements.campaignItem(campaignName).should('be.visible');
    return this;
  }

  expectEmptyState() {
    this.elements.emptyState().should('be.visible');
    return this;
  }

  expectCampaignCount(count) {
    cy.get('[data-cy^="campaign-item-"]').should('have.length', count);
    return this;
  }
}
EOF

print_status "Page Object Model examples created"

# Create test fixtures
print_info "Creating test fixtures..."

cat > config/cypress/fixtures/users/test-users.json << 'EOF'
{
  "admin": {
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  },
  "standardUser": {
    "email": "user@example.com",
    "password": "user123",
    "role": "user",
    "firstName": "Standard",
    "lastName": "User"
  },
  "guest": {
    "email": "guest@example.com",
    "password": "guest123",
    "role": "guest",
    "firstName": "Guest",
    "lastName": "User"
  }
}
EOF

cat > config/cypress/fixtures/campaigns/sample-campaigns.json << 'EOF'
{
  "basicCampaign": {
    "name": "Basic Test Campaign",
    "budget": 10000,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "objective": "brand-awareness",
    "status": "draft"
  },
  "advancedCampaign": {
    "name": "Advanced Test Campaign",
    "budget": 50000,
    "startDate": "2024-01-01",
    "endDate": "2024-06-30",
    "objective": "conversion",
    "status": "active",
    "targeting": {
      "ageRange": [25, 45],
      "interests": ["technology", "business"],
      "locations": ["US", "CA"]
    }
  }
}
EOF

print_status "Test fixtures created"

# Create GitHub Actions workflow
print_info "Creating GitHub Actions workflow..."

mkdir -p .github/workflows

cat > .github/workflows/cypress-e2e.yml << 'EOF'
name: Cypress E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        containers: [1, 2, 3, 4]
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start application
        run: npm start &
        
      - name: Wait for application
        run: npx wait-on http://localhost:3000 --timeout 60000
      
      - name: Run Cypress tests
        uses: cypress-io/github-action@v6
        with:
          config-file: cypress.config.enhanced.js
          record: true
          parallel: true
          group: 'E2E Tests - Chrome'
          tag: ${{ github.event_name }}
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # Test environment variables
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      
      - name: Generate test report
        if: always()
        run: |
          npx mochawesome-merge config/cypress/reports/*.json > config/cypress/reports/combined-report.json
          npx marge config/cypress/reports/combined-report.json --reportDir config/cypress/reports --inline
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cypress-results-${{ matrix.containers }}
          path: |
            config/cypress/screenshots
            config/cypress/videos
            config/cypress/reports
      
      - name: Comment PR with test results
        if: github.event_name == 'pull_request' && failure()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = 'config/cypress/reports/combined-report.json';
            if (fs.existsSync(path)) {
              const report = JSON.parse(fs.readFileSync(path, 'utf8'));
              const failedTests = report.stats.failures;
              if (failedTests > 0) {
                github.rest.issues.createComment({
                  issue_number: context.issue.number,
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  body: `❌ Cypress E2E tests failed with ${failedTests} failures. Please check the test results.`
                });
              }
            }
EOF

print_status "GitHub Actions workflow created"

# Create package.json scripts
print_info "Adding Cypress scripts to package.json..."

# Add scripts to package.json (this is a simple approach - in production you might want to use jq)
if command -v jq &> /dev/null; then
    # Use jq if available
    jq '.scripts += {
      "cy:open": "cypress open --config-file cypress.config.enhanced.js",
      "cy:run": "cypress run --config-file cypress.config.enhanced.js",
      "cy:run:parallel": "cypress run --config-file cypress.config.enhanced.js --record --parallel",
      "cy:run:headed": "cypress run --config-file cypress.config.enhanced.js --headed",
      "cy:test": "start-server-and-test start http://localhost:3000 cy:run",
      "cy:test:parallel": "start-server-and-test start http://localhost:3000 cy:run:parallel",
      "cy:report": "npx mochawesome-merge config/cypress/reports/*.json > config/cypress/reports/combined-report.json && npx marge config/cypress/reports/combined-report.json --reportDir config/cypress/reports --inline"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
    
    print_status "Scripts added to package.json using jq"
else
    print_warning "jq not found. Please manually add the following scripts to your package.json:"
    echo ""
    echo '"cy:open": "cypress open --config-file cypress.config.enhanced.js",'
    echo '"cy:run": "cypress run --config-file cypress.config.enhanced.js",'
    echo '"cy:run:parallel": "cypress run --config-file cypress.config.enhanced.js --record --parallel",'
    echo '"cy:run:headed": "cypress run --config-file cypress.config.enhanced.js --headed",'
    echo '"cy:test": "start-server-and-test start http://localhost:3000 cy:run",'
    echo '"cy:test:parallel": "start-server-and-test start http://localhost:3000 cy:run:parallel",'
    echo '"cy:report": "npx mochawesome-merge config/cypress/reports/*.json > config/cypress/reports/combined-report.json && npx marge config/cypress/reports/combined-report.json --reportDir config/cypress/reports --inline"'
fi

# Create example best practices test
print_info "Creating example best practices test..."

cat > config/cypress/e2e/shared/best-practices-example.cy.js << 'EOF'
/**
 * Example test demonstrating Cypress best practices
 * This file serves as a template for writing high-quality Cypress tests
 */

import { LoginPage } from '../../support/page-objects/auth/LoginPage';
import { CampaignListPage } from '../../support/page-objects/campaigns/CampaignListPage';

describe('Best Practices Example', () => {
  const loginPage = new LoginPage();
  const campaignListPage = new CampaignListPage();

  beforeEach(() => {
    // ✅ Clean state before each test
    cy.resetTestData();
    
    // ✅ Use programmatic authentication
    cy.login('admin@example.com', 'password', { method: 'api' });
  });

  context('Authentication Flow', () => {
    it('should login successfully with valid credentials', () => {
      // ✅ Use Page Object Model
      loginPage
        .visit()
        .fillCredentials('admin@example.com', 'password')
        .submit()
        .expectSuccessfulLogin();
      
      // ✅ Verify post-login state
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy="user-menu"]').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      loginPage
        .visit()
        .fillCredentials('invalid@example.com', 'wrongpassword')
        .submit()
        .expectLoginError('Invalid credentials');
    });
  });

  context('Campaign Management', () => {
    beforeEach(() => {
      // ✅ Set up test data for campaign tests
      cy.fixture('campaigns/sample-campaigns').as('campaignData');
    });

    it('should create a new campaign successfully', function() {
      // ✅ Use dynamic waits with API interception
      cy.intercept('POST', '/api/campaigns').as('createCampaign');
      
      campaignListPage
        .visit()
        .createNewCampaign();

      // ✅ Fill form using data-cy attributes
      cy.fillFormByTestId({
        'campaign-name': this.campaignData.basicCampaign.name,
        'campaign-budget': this.campaignData.basicCampaign.budget,
        'start-date': this.campaignData.basicCampaign.startDate,
        'end-date': this.campaignData.basicCampaign.endDate
      }, { 
        submitAfterFill: true,
        waitForResponse: { method: 'POST', url: '/api/campaigns' }
      });

      // ✅ Verify API response
      cy.waitForApiResponse('@createCampaign').then((response) => {
        expect(response.name).to.equal(this.campaignData.basicCampaign.name);
        expect(response.status).to.equal('draft');
      });

      // ✅ Verify UI state
      campaignListPage.expectCampaignExists(this.campaignData.basicCampaign.name);
    });

    it('should validate required fields', () => {
      campaignListPage
        .visit()
        .createNewCampaign();

      // ✅ Submit empty form to trigger validation
      cy.get('[data-cy="submit-campaign"]').click();

      // ✅ Verify validation errors
      cy.expectFormErrors({
        'campaign-name': 'Campaign name is required',
        'campaign-budget': 'Budget must be greater than 0'
      });
    });
  });

  context('Performance & Accessibility', () => {
    it('should load dashboard within performance budget', () => {
      // ✅ Performance monitoring
      cy.measurePageLoadTime('/dashboard');
    });

    it('should be accessible', () => {
      // ✅ Accessibility testing
      cy.visit('/dashboard');
      cy.checkA11y();
    });

    it('should have no console errors', () => {
      cy.visit('/dashboard');
      cy.expectNoConsoleErrors();
    });
  });

  context('Cross-Browser Compatibility', () => {
    it('should work consistently across viewports', () => {
      // ✅ Test responsive behavior
      const viewports = [
        { width: 1280, height: 720 },  // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 }    // Mobile
      ];

      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/dashboard');
        cy.get('[data-cy="dashboard-content"]').should('be.visible');
      });
    });
  });

  afterEach(() => {
    // ✅ Capture screenshot on failure (automatically handled by Cypress)
    // ✅ Clean up test data if needed (handled in beforeEach)
  });
});
EOF

print_status "Example test created"

# Create documentation
print_info "Creating team documentation..."

cat > config/cypress/README-BEST-PRACTICES.md << 'EOF'
# Cypress Best Practices Implementation

## 🚀 Quick Start

### Running Tests
```bash
# Open Cypress Test Runner
npm run cy:open

# Run tests headlessly
npm run cy:run

# Run tests with server startup
npm run cy:test

# Run tests in parallel (requires Cypress Dashboard)
npm run cy:test:parallel

# Generate test reports
npm run cy:report
```

### Writing New Tests

1. **Use Page Object Model**
   ```javascript
   import { LoginPage } from '../../support/page-objects/auth/LoginPage';
   
   const loginPage = new LoginPage();
   loginPage.visit().fillCredentials(email, password).submit();
   ```

2. **Use data-cy attributes for selectors**
   ```html
   <button data-cy="submit-button">Submit</button>
   ```
   ```javascript
   cy.get('[data-cy="submit-button"]').click();
   ```

3. **Use programmatic authentication**
   ```javascript
   beforeEach(() => {
     cy.login(); // Fast API-based login
   });
   ```

4. **Handle API interactions**
   ```javascript
   cy.intercept('POST', '/api/campaigns').as('createCampaign');
   cy.get('[data-cy="submit"]').click();
   cy.wait('@createCampaign');
   ```

## 📁 File Organization

- `e2e/` - Test specifications organized by feature
- `support/commands/` - Custom commands organized by purpose
- `support/page-objects/` - Page Object Model classes
- `fixtures/` - Test data organized by domain

## 🎯 Best Practices Checklist

### Before Writing Tests
- [ ] Identify the user journey being tested
- [ ] Plan test data requirements
- [ ] Ensure required data-cy attributes exist
- [ ] Consider Page Object Model structure

### Writing Tests
- [ ] Use descriptive test names
- [ ] Ensure test independence
- [ ] Use programmatic setup when possible
- [ ] Implement proper waiting strategies
- [ ] Add meaningful assertions

### After Writing Tests
- [ ] Verify tests run in isolation
- [ ] Check test execution time
- [ ] Ensure no false positives/negatives
- [ ] Update documentation if needed

## 🔧 Configuration

The enhanced configuration includes:
- Performance monitoring
- Accessibility testing
- Enhanced error handling
- Comprehensive reporting
- Parallel execution support

## 📊 Reporting

Tests generate detailed reports in `config/cypress/reports/`:
- Individual test results (JSON)
- Combined HTML report
- Screenshots on failure
- Performance metrics

## 🚀 CI/CD Integration

The GitHub Actions workflow provides:
- Parallel test execution
- Automatic report generation
- PR comments on failures
- Artifact upload for debugging

## 🎓 Training Resources

- [Cypress Best Practices Documentation](../../../docs/architecture/cypress-best-practices.md)
- [Official Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Real World App Examples](https://github.com/cypress-io/cypress-realworld-app)

## 🤝 Contributing

When adding new tests:
1. Follow the established patterns
2. Use the Page Object Model
3. Add appropriate fixtures
4. Update documentation
5. Ensure tests pass in CI

## 🆘 Troubleshooting

### Common Issues
- **Slow tests**: Check for unnecessary waits, optimize selectors
- **Flaky tests**: Improve waiting strategies, check for race conditions
- **Authentication issues**: Verify programmatic login setup
- **Element not found**: Ensure data-cy attributes are present

### Getting Help
- Check the troubleshooting guide in docs/
- Review existing similar tests
- Ask the team in #cypress-help Slack channel
EOF

print_status "Documentation created"

# Final summary
echo ""
echo "🎉 Cypress Best Practices Setup Complete!"
echo ""
print_info "✅ What was created:"
echo "   • Enhanced directory structure"
echo "   • Programmatic authentication commands"
echo "   • Form, API, and navigation commands"
echo "   • Page Object Model examples"
echo "   • Test fixtures and sample data"
echo "   • GitHub Actions workflow"
echo "   • Enhanced configuration"
echo "   • Comprehensive documentation"
echo ""
print_info "🚀 Next steps:"
echo "   1. Review cypress.config.enhanced.js and adjust for your environment"
echo "   2. Add data-cy attributes to your application components"
echo "   3. Update authentication commands for your API endpoints"
echo "   4. Create Page Objects for your key application pages"
echo "   5. Set up Cypress Dashboard for parallel execution"
echo "   6. Configure CI/CD environment variables"
echo ""
print_info "📚 Resources:"
echo "   • Best practices guide: docs/architecture/cypress-best-practices.md"
echo "   • Team documentation: config/cypress/README-BEST-PRACTICES.md"
echo "   • Example test: config/cypress/e2e/shared/best-practices-example.cy.js"
echo ""
print_warning "⚠️  Remember to:"
echo "   • Update API endpoints in commands to match your backend"
echo "   • Set environment variables for test credentials"
echo "   • Add CYPRESS_RECORD_KEY secret for parallel execution"
echo "   • Train team members on new patterns and conventions"
echo ""
echo "Happy testing! 🎯" 