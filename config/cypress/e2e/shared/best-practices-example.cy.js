import { setupClerkTestingToken } from '@clerk/testing/cypress';

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
    // Setup authenticated test environment
    setupClerkTestingToken();

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

    it('should create a new campaign successfully', function () {
      // ✅ Use dynamic waits with API interception
      cy.intercept('POST', '/api/campaigns').as('createCampaign');

      campaignListPage.visit().createNewCampaign();

      // ✅ Fill form using data-cy attributes
      cy.fillFormByTestId(
        {
          'campaign-name': this.campaignData.basicCampaign.name,
          'campaign-budget': this.campaignData.basicCampaign.budget,
          'start-date': this.campaignData.basicCampaign.startDate,
          'end-date': this.campaignData.basicCampaign.endDate,
        },
        {
          submitAfterFill: true,
          waitForResponse: { method: 'POST', url: '/api/campaigns' },
        }
      );

      // ✅ Verify API response
      cy.waitForApiResponse('@createCampaign').then(response => {
        expect(response.name).to.equal(this.campaignData.basicCampaign.name);
        expect(response.status).to.equal('draft');
      });

      // ✅ Verify UI state
      campaignListPage.expectCampaignExists(this.campaignData.basicCampaign.name);
    });

    it('should validate required fields', () => {
      campaignListPage.visit().createNewCampaign();

      // ✅ Submit empty form to trigger validation
      cy.get('[data-cy="submit-campaign"]').click();

      // ✅ Verify validation errors
      cy.expectFormErrors({
        'campaign-name': 'Campaign name is required',
        'campaign-budget': 'Budget must be greater than 0',
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
        { width: 1280, height: 720 }, // Desktop
        { width: 768, height: 1024 }, // Tablet
        { width: 375, height: 667 }, // Mobile
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
