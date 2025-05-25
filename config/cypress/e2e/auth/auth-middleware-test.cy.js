import { DashboardPage } from '../../support/page-objects';
import { TestSetup, AssertionHelpers } from '../../support/utils/test-helpers';
import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Clerk Middleware Authentication Test', () => {
    let dashboardPage;

    beforeEach(() => {
        dashboardPage = new DashboardPage();
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    afterEach(() => {
        dashboardPage.resetPageState();
    });

    describe('Protected Route Access', () => {
        it('should access protected dashboard route without redirect loop', () => {
            setupClerkTestingToken();

            cy.visit('/dashboard');
            cy.url().should('include', '/dashboard');
            cy.url().should('not.include', '/sign-in');

            // Page should load successfully
            cy.get('body').should('be.visible');

            cy.log('✅ Protected route accessed successfully - no redirect loop!');
        });

        it('should access influencer marketplace without redirect loop', () => {
            setupClerkTestingToken();

            cy.visit('/influencer-marketplace');
            cy.url().should('include', '/influencer-marketplace');
            cy.url().should('not.include', '/sign-in');

            // Page should load successfully
            cy.get('body').should('be.visible');

            cy.log('✅ Marketplace accessed successfully - no redirect loop!');
        });

        it('should access campaigns page without redirect loop', () => {
            setupClerkTestingToken();

            cy.visit('/campaigns');
            cy.url().should('include', '/campaigns');
            cy.url().should('not.include', '/sign-in');

            // Page should load successfully
            cy.get('body').should('be.visible');

            cy.log('✅ Campaigns page accessed successfully - no redirect loop!');
        });

        it('should verify middleware recognizes authentication', () => {
            setupClerkTestingToken();

            cy.visit('/dashboard');
            cy.url().should('include', '/dashboard');
            cy.url().should('not.include', '/sign-in');

            // Wait for page to load completely
            cy.get('body').should('be.visible');

            // The fact that we're on dashboard means middleware allowed access
            AssertionHelpers.expectUrlToContain('/dashboard');

            cy.log('✅ Middleware correctly recognizes authentication!');
        });
    });

    describe('Public Route Access', () => {
        it('should allow sign-in page access without authentication', () => {
            // Public routes should work without special setup
            cy.visit('/sign-in');

            cy.url().should('include', '/sign-in');
            cy.get('body').should('be.visible');

            cy.log('✅ Public route access works correctly');
        });
    });
}); 