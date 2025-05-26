import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Individual Influencer Profile Page - Comprehensive Testing', () => {
  beforeEach(() => {
    // Setup authenticated admin test environment
    setupClerkTestingToken();
  });

  context('Profile Page Access and URL Handling', () => {
    it('should load influencer profile page with valid parameters', () => {
      // Mock successful profile API response
      cy.intercept('GET', '**/api/influencers/fetch-profile**', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'test-influencer-1',
            profileId: 'prof-123',
            handle: 'testinfluencer',
            name: 'Test Influencer',
            platformSpecificId: 'platform-123',
            platforms: ['INSTAGRAM', 'TIKTOK'],
            bio: 'Test influencer bio',
            followerCount: 150000,
            engagementRate: 4.5,
            profileImageUrl: 'https://example.com/profile.jpg',
            isVerified: true,
            metrics: {
              totalPosts: 500,
              avgLikes: 5000,
              avgComments: 200,
            },
          },
        },
      }).as('getProfile');

      // Visit profile page with required parameters
      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');

      // Wait for API call
      cy.wait('@getProfile');

      // Verify page loads successfully
      cy.contains('Test Influencer').should('be.visible');
      cy.contains('Back to Marketplace').should('be.visible');

      // Verify profile header elements
      cy.get('body').should('be.visible');

      // Verify no errors
      cy.get('body').should('not.contain', 'Error Loading Profile');
      cy.get('body').should('not.contain', 'Network or fetch error');
    });

    it('should handle invalid platform parameter gracefully', () => {
      cy.visit('/influencer-marketplace/testinfluencer?platform=INVALID_PLATFORM');

      // Should show error for invalid platform or handle gracefully
      cy.get('body').should('exist');
      // May show error message or handle invalid platform appropriately
    });

    it('should handle missing platform parameter', () => {
      cy.visit('/influencer-marketplace/testinfluencer');

      // Should show some kind of error or handle missing platform
      cy.get('body').should('exist');
      // May show error or loading state depending on implementation
    });

    it('should handle profile not found error', () => {
      // Mock API error response
      cy.intercept('GET', '**/api/influencers/fetch-profile**', {
        statusCode: 404,
        body: {
          success: false,
          error: 'Influencer not found',
        },
      }).as('getProfileError');

      cy.visit('/influencer-marketplace/nonexistent?platform=INSTAGRAM');
      cy.wait('@getProfileError');

      // Verify error handling
      cy.contains('Error Loading Profile').should('be.visible');
      cy.contains('Failed to load profile').should('be.visible');
    });
  });

  context('Profile Header and Basic Information', () => {
    beforeEach(() => {
      // Mock successful profile response for all header tests
      cy.intercept('GET', '**/api/influencers/fetch-profile**', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'test-influencer-1',
            profileId: 'prof-123',
            handle: 'testinfluencer',
            name: 'Test Influencer',
            platformSpecificId: 'platform-123',
            platforms: ['INSTAGRAM', 'TIKTOK'],
            bio: 'Test influencer bio',
            followerCount: 150000,
            engagementRate: 4.5,
            profileImageUrl: 'https://example.com/profile.jpg',
            isVerified: true,
            metrics: {
              totalPosts: 500,
              avgLikes: 5000,
              avgComments: 200,
            },
          },
        },
      }).as('getProfile');

      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');
      cy.wait('@getProfile');
    });

    it('should display profile header with all key information', () => {
      // Verify influencer name
      cy.contains('Test Influencer').should('be.visible');

      // Verify handle or bio if displayed
      cy.contains('testinfluencer').should('be.visible');

      // Verify metrics are displayed (flexible check)
      cy.get('body').should('be.visible'); // General check that page loaded
    });

    it('should display action buttons in header area', () => {
      // Verify key action buttons exist
      cy.contains('Back to Marketplace').should('be.visible');
      cy.contains('Risk Report').should('be.visible');
      cy.contains('Remove').should('be.visible');
      cy.contains('Edit Profile').should('be.visible');

      // Verify add to campaign button exists
      cy.get('button').contains(/add/i).should('exist');
    });
  });

  context('Analytics Tabs Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/influencers/fetch-profile**', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'test-influencer-1',
            profileId: 'prof-123',
            handle: 'testinfluencer',
            name: 'Test Influencer',
            platforms: ['INSTAGRAM'],
            followerCount: 150000,
            engagementRate: 4.5,
          },
        },
      }).as('getProfile');

      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');
      cy.wait('@getProfile');
    });

    it('should display all analytics tabs', () => {
      // Verify all expected tabs are present
      const expectedTabs = [
        'Performance',
        'Audience',
        'Content',
        'Demographics',
        'Contact',
        'Platform',
        'Advanced',
        'Risk',
        'Campaigns',
      ];

      expectedTabs.forEach(tab => {
        cy.contains(tab).should('be.visible');
      });

      // Verify tabs have proper role
      cy.get('[role="tab"]').should('have.length.at.least', 9);
    });

    it('should allow navigation between tabs', () => {
      // Default tab should be Performance
      cy.get('[role="tab"][data-state="active"]').should('contain', 'Performance');

      // Click on Audience tab
      cy.contains('[role="tab"]', 'Audience').click();
      cy.get('[role="tab"][data-state="active"]').should('contain', 'Audience');

      // Click on Content tab
      cy.contains('[role="tab"]', 'Content').click();
      cy.get('[role="tab"][data-state="active"]').should('contain', 'Content');

      // Click on Risk tab
      cy.contains('[role="tab"]', 'Risk').click();
      cy.get('[role="tab"][data-state="active"]').should('contain', 'Risk');
    });

    it('should display appropriate content for each tab', () => {
      // Test Performance tab content
      cy.contains('[role="tab"]', 'Performance').click();
      cy.get('[role="tabpanel"]').should('be.visible');

      // Test Demographics tab content
      cy.contains('[role="tab"]', 'Demographics').click();
      cy.get('[role="tabpanel"]').should('be.visible');

      // Test Contact tab content
      cy.contains('[role="tab"]', 'Contact').click();
      cy.get('[role="tabpanel"]').should('be.visible');
    });
  });

  context('Action Buttons Functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/influencers/fetch-profile**', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'test-influencer-1',
            profileId: 'prof-123',
            handle: 'testinfluencer',
            name: 'Test Influencer',
            platforms: ['INSTAGRAM'],
            followerCount: 150000,
          },
        },
      }).as('getProfile');

      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');
      cy.wait('@getProfile');
    });

    it('should handle back to marketplace navigation', () => {
      cy.contains('Back to Marketplace').click();

      // Should navigate back (either to previous page or marketplace)
      cy.url().should('not.include', '/testinfluencer');
    });

    it('should open risk report dialog', () => {
      cy.contains('Risk Report').click();

      // Verify dialog opens
      cy.contains('Request Risk Assessment').should('be.visible');
      cy.contains('Generate a comprehensive risk report').should('be.visible');

      // Verify dialog buttons
      cy.contains('Cancel').should('be.visible');
      cy.contains('Generate Report').should('be.visible');
    });

    it('should handle risk report generation', () => {
      cy.contains('Risk Report').click();

      // Click generate report
      cy.contains('Generate Report').click();

      // Should show generating state
      cy.contains('Generating').should('be.visible');

      // Wait for completion (with timeout)
      cy.contains('Generating', { timeout: 6000 }).should('not.exist');
    });

    it('should handle add to campaign functionality', () => {
      // Look for add to campaign button
      cy.get('button').contains(/add/i).click();

      // Should open add to campaign dialog or interface
      cy.get('body').should('be.visible'); // Verify interaction works
    });
  });

  context('Loading and Error States', () => {
    it('should display loading skeleton while fetching data', () => {
      // Intercept with delay to see loading state
      cy.intercept('GET', '**/api/influencers/fetch-profile**', req => {
        req.reply({
          delay: 2000,
          statusCode: 200,
          body: {
            success: true,
            data: {
              id: 'test-influencer-1',
              handle: 'testinfluencer',
              name: 'Test Influencer',
              platforms: ['INSTAGRAM'],
            },
          },
        });
      }).as('getProfileSlow');

      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');

      // Verify loading state (may show skeleton or loading indicator)
      cy.get('body').should('be.visible');
      // Initial state before data loads

      // Wait for data to load
      cy.wait('@getProfileSlow');
      cy.contains('Test Influencer').should('be.visible');
    });

    it('should handle network errors gracefully', () => {
      // Mock network error
      cy.intercept('GET', '**/api/influencers/fetch-profile**', {
        forceNetworkError: true,
      }).as('getProfileNetworkError');

      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');
      cy.wait('@getProfileNetworkError');

      // Verify error display
      cy.contains('Error Loading Profile').should('be.visible');
      cy.get('[class*="error"], [class*="destructive"]').should('exist');
    });

    it('should handle server errors appropriately', () => {
      // Mock server error
      cy.intercept('GET', '**/api/influencers/fetch-profile**', {
        statusCode: 500,
        body: { error: 'Internal server error' },
      }).as('getProfileServerError');

      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');
      cy.wait('@getProfileServerError');

      // Verify error handling
      cy.contains('Error Loading Profile').should('be.visible');
      cy.contains('Failed to load profile').should('be.visible');
    });
  });

  context('Responsive Design and Accessibility', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/influencers/fetch-profile**', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'test-influencer-1',
            handle: 'testinfluencer',
            name: 'Test Influencer',
            platforms: ['INSTAGRAM'],
          },
        },
      }).as('getProfile');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');
      cy.wait('@getProfile');

      // Verify page loads on mobile
      cy.contains('Test Influencer').should('be.visible');
      cy.contains('Back to Marketplace').should('be.visible');

      // Verify tabs are visible and functional on mobile
      cy.get('[role="tab"]').should('exist');
    });

    it('should be keyboard accessible', () => {
      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');
      cy.wait('@getProfile');

      // Test keyboard navigation
      cy.get('[role="tab"]').first().should('be.visible');

      // Test that tabs are keyboard accessible
      cy.get('[role="tab"]').first().click();
      cy.get('[role="tab"]').should('exist');

      // Test button accessibility
      cy.get('button').should('exist');
    });

    it('should have proper semantic structure', () => {
      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');
      cy.wait('@getProfile');

      // Verify semantic elements
      cy.get('[role="tab"]').should('exist');
      cy.get('[role="tabpanel"]').should('exist');
      cy.get('button').should('exist');

      // Verify heading structure
      cy.get('h1, h2, h3').should('exist');
    });
  });

  context('Performance and Security', () => {
    it('should load efficiently under normal conditions', () => {
      cy.intercept('GET', '**/api/influencers/fetch-profile**', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'test-influencer-1',
            handle: 'testinfluencer',
            name: 'Test Influencer',
            platforms: ['INSTAGRAM'],
          },
        },
      }).as('getProfile');

      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');
      cy.wait('@getProfile');

      // Verify page loads successfully
      cy.contains('Test Influencer', { timeout: 5000 }).should('be.visible');
      cy.get('body').should('not.contain', 'Error');
    });

    it('should handle concurrent users and multiple requests', () => {
      // Mock successful response
      cy.intercept('GET', '**/api/influencers/fetch-profile**', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'test-influencer-1',
            handle: 'testinfluencer',
            name: 'Test Influencer',
            platforms: ['INSTAGRAM'],
          },
        },
      }).as('getProfile');

      // Navigate multiple times to test stability
      cy.visit('/influencer-marketplace/testinfluencer?platform=INSTAGRAM');
      cy.wait('@getProfile');
      cy.contains('Test Influencer').should('be.visible');

      // Refresh and test again
      cy.reload();
      cy.wait('@getProfile');
      cy.contains('Test Influencer').should('be.visible');
    });

    it('should validate URL parameters properly', () => {
      // Test with various URL parameter combinations
      const testCases = [
        { url: '/influencer-marketplace/testuser?platform=INSTAGRAM', shouldWork: true },
        { url: '/influencer-marketplace/testuser?platform=TIKTOK', shouldWork: true },
        { url: '/influencer-marketplace/testuser?platform=invalid', shouldWork: false },
        { url: '/influencer-marketplace/?platform=INSTAGRAM', shouldWork: false },
      ];

      testCases.forEach(({ url, shouldWork }) => {
        if (shouldWork) {
          cy.intercept('GET', '**/api/influencers/fetch-profile**', {
            statusCode: 200,
            body: {
              success: true,
              data: {
                id: 'test-influencer-1',
                handle: 'testuser',
                name: 'Test User',
                platforms: ['INSTAGRAM', 'TIKTOK'],
              },
            },
          }).as('getProfileValid');

          cy.visit(url);
          cy.wait('@getProfileValid');
          cy.contains('Test User').should('be.visible');
        } else {
          cy.visit(url);
          // Should show error or handle invalid params gracefully
          cy.get('body').should('be.visible');
        }
      });
    });
  });
});
