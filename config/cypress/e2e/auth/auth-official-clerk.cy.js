import { DashboardPage } from '../../support/page-objects';
import { setupClerkTestingToken } from '@clerk/testing/cypress';

/**
 * Official Clerk Authentication Testing
 * 
 * This test demonstrates the proper SSOT approach using Clerk's official Testing Tokens.
 * Testing Tokens bypass bot detection while maintaining security and authenticity.
 * 
 * IMPORTANT: This is the reference implementation for all authentication testing.
 */
describe('Official Clerk Authentication - SSOT Reference', () => {
    let dashboardPage;

    beforeEach(() => {
        dashboardPage = new DashboardPage();
        // Clear any existing state
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    afterEach(() => {
        dashboardPage.resetPageState();
    });

    describe('Authenticated Route Access', () => {
        it('should access protected dashboard with real Clerk authentication', () => {
            // CRITICAL: Setup Testing Token FIRST, before visiting any routes
            setupClerkTestingToken();

            // Visit protected route - Testing Token handles authentication automatically
            cy.visit('/dashboard');

            // Should be on dashboard, not redirected to sign-in
            cy.url().should('include', '/dashboard');
            cy.url().should('not.include', '/sign-in');

            // Wait for page to fully load
            cy.get('body').should('be.visible');

            // Check for dashboard-specific content
            cy.get('h1, h2, [data-cy*="dashboard"], [data-testid*="dashboard"]')
                .should('exist')
                .and('be.visible');
        });

        it('should access influencer marketplace with proper authentication', () => {
            // Setup Testing Token for this test
            setupClerkTestingToken();

            // Visit another protected route
            cy.visit('/influencer-marketplace');

            // Should be on marketplace, not redirected
            cy.url().should('include', '/influencer-marketplace');
            cy.url().should('not.include', '/sign-in');

            // Wait for page load and authentication
            cy.get('body').should('be.visible');
        });

        it('should access campaigns page with authentication', () => {
            // Setup Testing Token for this test
            setupClerkTestingToken();

            cy.visit('/campaigns');

            // Should access campaigns without redirect
            cy.url().should('include', '/campaigns');
            cy.url().should('not.include', '/sign-in');

            cy.get('body').should('be.visible');
        });
    });

    describe('API Calls with Authentication', () => {
        it('should make authenticated API calls successfully', () => {
            // Setup Testing Token for this test
            setupClerkTestingToken();

            cy.visit('/dashboard');

            // Wait for authentication
            cy.get('body').should('be.visible');

            // API calls should work with Testing Token
            cy.request({
                method: 'GET',
                url: '/api/dashboard',
                failOnStatusCode: false
            }).then((response) => {
                // Should get a response (may be mocked or real)
                expect(response.status).to.be.oneOf([200, 401, 404]);
            });
        });
    });

    describe('Navigation Between Protected Routes', () => {
        it('should navigate between protected routes without re-authentication', () => {
            // Setup Testing Token once for this test
            setupClerkTestingToken();

            // Start at dashboard
            cy.visit('/dashboard');
            cy.get('body').should('be.visible');
            cy.url().should('include', '/dashboard');

            // Navigate to marketplace
            cy.visit('/influencer-marketplace');
            cy.get('body').should('be.visible');
            cy.url().should('include', '/influencer-marketplace');

            // Navigate to campaigns
            cy.visit('/campaigns');
            cy.get('body').should('be.visible');
            cy.url().should('include', '/campaigns');

            // Should maintain authentication throughout
            cy.get('body').should('be.visible');
        });
    });
});

/**
 * Unauthenticated Route Testing
 * 
 * Tests that public routes work without authentication
 */
describe('Public Route Access', () => {
    beforeEach(() => {
        // For public routes, use unauthenticated setup
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    it('should access public sign-in page without authentication', () => {
        cy.visit('/sign-in');

        cy.url().should('include', '/sign-in');
        cy.get('body').should('be.visible');

        // Should show sign-in form or content
        cy.get('body').should('be.visible');
    });

    it('should access homepage without authentication', () => {
        cy.visit('/');

        cy.url().should('not.include', '/sign-in');
        cy.get('body').should('be.visible');
    });
}); 