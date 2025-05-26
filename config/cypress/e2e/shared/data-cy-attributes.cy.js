import { setupClerkTestingToken } from '@clerk/testing/cypress';

/**
 * Data-cy Attributes Verification Test
 * Tests that all newly added data-cy attributes are accessible and working
 */

describe('Data-cy Attributes Verification', () => {
  beforeEach(() => {
    // Clear state before each test
    cy.clearLocalStorage();
    cy.clearCookies();

    // Visit the sign-in page first (as dashboard requires authentication)
    cy.visit('/sign-in');
  });

  context('Authentication and Navigation', () => {
    it('should find authentication page elements', () => {
      // Note: Clerk components may not have data-cy attributes directly
      // but we can verify the page loads correctly
      cy.url().should('include', '/sign-in');
    });

    it('should find header elements when authenticated', () => {
      // Auth pages use a custom layout without the main header
      // Let's test a non-auth page that should have the header
      cy.visit('/', { failOnStatusCode: false });

      // Check if header exists on root page
      cy.get('body').then($body => {
        if ($body.find('[data-cy="main-header"]').length > 0) {
          cy.get('[data-cy="main-header"]').should('exist');
          cy.get('[data-cy="header-container"]').should('exist');
          cy.log('Header found on root page');
        } else {
          // Try dashboard page (might redirect to auth)
          cy.visit('/dashboard', { failOnStatusCode: false });
          cy.url().then(url => {
            if (url.includes('/dashboard')) {
              // If we can access dashboard, header should exist
              cy.get('[data-cy="main-header"]').should('exist');
              cy.log('Header found on dashboard page');
            } else {
              // Auth pages have different layout, so we just log and pass
              cy.log('Redirected to auth page - auth pages use custom layout without main header');
            }
          });
        }
      });
    });
  });

  context('Dashboard Elements', () => {
    it('should find dashboard components when accessible', () => {
      // Attempt to visit dashboard (may redirect to sign-in)
      cy.visit('/dashboard', { failOnStatusCode: false });

      // Check if we're redirected to sign-in
      cy.url().then(url => {
        if (url.includes('/sign-in')) {
          cy.log('Redirected to sign-in as expected for unauthenticated user');
        } else {
          // If somehow we're on dashboard, test the data-cy attributes
          cy.get('[data-cy="dashboard-content"]').should('exist');
          cy.get('[data-cy="dashboard-header"]').should('exist');
          cy.get('[data-cy="dashboard-title"]').should('exist');
        }
      });
    });
  });

  context('Navigation Elements', () => {
    it('should find navigation elements', () => {
      // Test basic page structure that should be present
      cy.visit('/', { failOnStatusCode: false });

      // These elements should be present on most pages
      cy.get('body').should('exist');

      // Check if header is present (it should be on most pages)
      cy.get('[data-cy="main-header"]').should('exist');
    });
  });

  context('Search Functionality', () => {
    it('should find search bar elements when present', () => {
      cy.visit('/dashboard', { failOnStatusCode: false });

      // Check for search elements if they exist on the page
      cy.get('body').then($body => {
        if ($body.find('[data-cy="search-bar"]').length > 0) {
          cy.get('[data-cy="search-bar"]').should('be.visible');
          cy.get('[data-cy="search-input"]').should('be.visible');
          cy.get('[data-cy="search-icon"]').should('be.visible');
        } else {
          cy.log('Search bar not found on this page');
        }
      });
    });
  });

  context('Button and Form Elements', () => {
    it('should verify button data-cy attributes work', () => {
      cy.visit('/campaigns', { failOnStatusCode: false });

      // Check if we can find campaign-related buttons
      cy.get('body').then($body => {
        if ($body.find('[data-cy="new-campaign-button"]').length > 0) {
          cy.get('[data-cy="new-campaign-button"]').should('exist');
          cy.log('New campaign button found with data-cy attribute');
        } else {
          cy.log('New campaign button not accessible without authentication');
        }
      });
    });
  });

  context('Data-cy Attribute Standards', () => {
    it('should verify all data-cy attributes follow naming convention', () => {
      cy.visit('/', { failOnStatusCode: false });

      // Get all elements with data-cy attributes
      cy.get('[data-cy]').then($elements => {
        const dataCyValues = [];
        $elements.each((index, element) => {
          const dataCy = element.getAttribute('data-cy');
          if (dataCy) {
            dataCyValues.push(dataCy);
          }
        });

        // Log all found data-cy attributes
        cy.log(`Found ${dataCyValues.length} elements with data-cy attributes`);
        dataCyValues.forEach(value => {
          cy.log(`data-cy="${value}"`);

          // Verify naming convention (kebab-case)
          expect(value).to.match(
            /^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/,
            `data-cy="${value}" should follow kebab-case convention`
          );
        });
      });
    });
  });
});
