import { setupClerkTestingToken } from '@clerk/testing/cypress';
import {
    MarketplacePage,
    InfluencerProfilePage,
    SearchAndFilterPage,
    InfluencerEngagementPage
} from '../../support/page-objects';
import { TestSetup, ApiInterceptors, AssertionHelpers } from '../../support/test-helpers';

describe('Marketplace & Influencer Module - Comprehensive Tests', () => {
    let marketplacePage;
    let influencerProfilePage;
    let searchAndFilterPage;
    let influencerEngagementPage;

    beforeEach(() => {
        // Initialize page objects
        marketplacePage = new MarketplacePage();
        influencerProfilePage = new InfluencerProfilePage();
        searchAndFilterPage = new SearchAndFilterPage();
        influencerEngagementPage = new InfluencerEngagementPage();

        // Set up authenticated test environment
        setupClerkTestingToken();

        // Mock API responses for stable testing
        cy.intercept('GET', '**/api/influencers**', { fixture: 'influencers/marketplace-list.json' }).as('getInfluencers');
        cy.intercept('GET', '**/api/influencers/fetch-profile**', { fixture: 'influencers/profile-data.json' }).as('getProfile');
        cy.intercept('GET', '**/api/campaigns/selectable-list', { fixture: 'campaigns/selectable-campaigns.json' }).as('getCampaigns');
        cy.intercept('POST', '**/api/campaigns/*/influencers/bulk-add', { fixture: 'campaigns/bulk-add-success.json' }).as('bulkAddInfluencers');
    });

    afterEach(() => {
        // Reset state
        marketplacePage.resetPageState();
        influencerProfilePage.resetPageState();
        searchAndFilterPage.resetPageState();
        influencerEngagementPage.resetPageState();
    });

    describe('Influencer Marketplace Discovery', () => {
        it('should display marketplace with influencer listings', () => {
            cy.measurePageLoadTime(() => {
                marketplacePage.visit();
            }, 'marketplace-page-load', 3000);

            marketplacePage
                .expectToBeOnMarketplacePage()
                .expectInfluencersVisible()
                .expectInfluencerCount(12);

            cy.wait('@getInfluencers');
        });

        it('should handle empty search results gracefully', () => {
            marketplacePage.visit();

            cy.intercept('GET', '**/api/influencers**', {
                statusCode: 200,
                body: { influencers: [], total: 0, page: 1, limit: 12 }
            }).as('getEmptyResults');

            searchAndFilterPage
                .performSearch('nonexistent-influencer-xyz')
                .expectNoResults();

            cy.wait('@getEmptyResults');
        });

        it('should support pagination through influencer listings', () => {
            marketplacePage.visit();

            // Test pagination workflow
            marketplacePage
                .expectCurrentPage(1)
                .goToNextPage()
                .expectCurrentPage(2)
                .goToPreviousPage()
                .expectCurrentPage(1);

            // Test direct page navigation
            marketplacePage
                .goToPage(3)
                .expectCurrentPage(3);
        });

        it('should maintain performance under load', () => {
            // Test with large dataset
            cy.intercept('GET', '**/api/influencers**', {
                fixture: 'influencers/large-dataset.json',
                delay: 500
            }).as('getLargeDataset');

            cy.measurePageLoadTime(() => {
                marketplacePage.visit();
            }, 'large-dataset-load', 5000);

            marketplacePage.expectInfluencersVisible();
            cy.wait('@getLargeDataset');
        });
    });

    describe('Advanced Search & Filtering', () => {
        beforeEach(() => {
            marketplacePage.visit();
        });

        it('should perform comprehensive multi-criteria search', () => {
            const searchCriteria = {
                searchTerm: 'fashion',
                platforms: ['INSTAGRAM', 'TIKTOK'],
                minFollowers: 50000,
                maxFollowers: 500000,
                verifiedOnly: true,
                audienceQuality: 'High',
                categories: ['fashion', 'beauty'],
                location: { country: 'United States', city: 'New York' },
                ageRange: '25-34',
                gender: 'female',
                language: 'English',
                sortBy: 'engagement'
            };

            cy.measureInteractionTime(() => {
                searchAndFilterPage.performComplexSearch(searchCriteria);
            }, 'complex-search', 2000);

            searchAndFilterPage
                .expectSearchResultsVisible()
                .expectActiveFilterCount(8)
                .expectResultsSorted('engagement');
        });

        it('should handle search suggestions and autocomplete', () => {
            searchAndFilterPage
                .testSearchSuggestions()
                .expectSearchResultsVisible();
        });

        it('should support filter combinations and interactions', () => {
            searchAndFilterPage.testFilterCombinations();
        });

        it('should maintain filter state across sessions', () => {
            // Apply complex filters
            searchAndFilterPage
                .openFilters()
                .filterByPlatform('INSTAGRAM')
                .setFollowerRange(10000, 100000)
                .filterVerifiedOnly()
                .applyFilters();

            // Reload page and verify filters persist
            cy.reload();
            searchAndFilterPage.expectActiveFilterCount(3);
        });

        it('should provide accurate search performance metrics', () => {
            searchAndFilterPage
                .performSearch('beauty influencer')
                .expectSearchTimeUnder(1000);
        });

        it('should test all sorting options', () => {
            searchAndFilterPage.testSortingOptions();
        });

        it('should handle filter edge cases', () => {
            // Test extreme values
            searchAndFilterPage
                .openFilters()
                .setFollowerRange(999999999, 1000000000)
                .applyFilters()
                .expectNoResults();

            // Test invalid combinations
            searchAndFilterPage
                .resetAllFilters()
                .openFilters()
                .setFollowerRange(1000000, 1000)
                .applyFilters()
                .expectNoResults();
        });
    });

    describe('Influencer Profile Analytics', () => {
        const testInfluencer = 'fashion_influencer_test';
        const testPlatform = 'INSTAGRAM';

        it('should display comprehensive influencer profile', () => {
            cy.measurePageLoadTime(() => {
                influencerProfilePage.visitProfile(testInfluencer, testPlatform);
            }, 'profile-page-load', 3000);

            influencerProfilePage
                .expectToBeOnProfilePage(testInfluencer)
                .expectProfileHeaderVisible()
                .expectProfileDataLoaded();

            cy.wait('@getProfile');
        });

        it('should provide complete analytics across all tabs', () => {
            influencerProfilePage.visitProfile(testInfluencer, testPlatform);

            influencerProfilePage
                .performCompleteProfileAnalysis()
                .testAllAnalyticsTabs();
        });

        it('should handle tab switching performance', () => {
            influencerProfilePage.visitProfile(testInfluencer, testPlatform);

            const tabs = ['performance', 'audience', 'content', 'demographics', 'contact', 'platform', 'advanced', 'risk', 'campaigns'];

            tabs.forEach(tab => {
                cy.measureInteractionTime(() => {
                    influencerProfilePage.switchToTab(tab);
                }, `tab-switch-${tab}`, 1000);

                influencerProfilePage.expectTabActive(tab);
            });
        });

        it('should generate and display risk assessment', () => {
            influencerProfilePage.visitProfile(testInfluencer, testPlatform);

            influencerProfilePage
                .viewRiskAssessment()
                .expectRiskScoreVisible()
                .expectLowRiskScore();
        });

        it('should support risk report generation', () => {
            influencerProfilePage.visitProfile(testInfluencer, testPlatform);

            cy.intercept('POST', '**/api/risk-reports', {
                statusCode: 200,
                body: { success: true, reportUrl: '/sample-report.pdf' }
            }).as('generateRiskReport');

            influencerProfilePage
                .requestRiskReport()
                .expectRiskReportGenerated();

            cy.wait('@generateRiskReport');
        });

        it('should handle profile not found scenarios', () => {
            cy.intercept('GET', '**/api/influencers/fetch-profile**', {
                statusCode: 404,
                body: { success: false, error: 'Profile not found' }
            }).as('getProfileNotFound');

            influencerProfilePage.visitProfile('nonexistent_user', testPlatform);

            influencerProfilePage
                .expectErrorState()
                .expectProfileNotFound();

            cy.wait('@getProfileNotFound');
        });

        it('should maintain responsive design across devices', () => {
            influencerProfilePage.visitProfile(testInfluencer, testPlatform);
            influencerProfilePage.testMobileProfile();
        });

        it('should provide accessibility compliance', () => {
            influencerProfilePage.visitProfile(testInfluencer, testPlatform);
            influencerProfilePage.checkProfileAccessibility();
        });
    });

    describe('Influencer Engagement & Campaign Assignment', () => {
        beforeEach(() => {
            marketplacePage.visit();
        });

        it('should handle individual influencer campaign assignment', () => {
            const collaborationDetails = {
                type: 'sponsored-post',
                description: 'Create sponsored post for new product launch featuring key benefits and call-to-action',
                budget: 2500,
                timeline: '2-weeks',
                message: 'Hi! We love your content style and would like to collaborate on our upcoming campaign.'
            };

            cy.measureInteractionTime(() => {
                influencerEngagementPage.performCompleteEngagementWorkflow(
                    'Fashion Influencer',
                    'Summer Collection Campaign',
                    collaborationDetails
                );
            }, 'individual-engagement', 3000);

            influencerEngagementPage.expectCampaignAddSuccess();
        });

        it('should support bulk influencer selection and assignment', () => {
            // Select multiple influencers
            marketplacePage
                .selectInfluencer('influencer1')
                .selectInfluencer('influencer2')
                .selectInfluencer('influencer3')
                .expectSelectionCount(3)
                .expectBulkAddButtonVisible(3);

            // Perform bulk assignment
            influencerEngagementPage
                .performBulkEngagementWorkflow('Beauty Campaign', 3);

            cy.wait('@bulkAddInfluencers');
        });

        it('should test all engagement types and collaboration options', () => {
            influencerEngagementPage.testEngagementTypes();
        });

        it('should handle communication workflows', () => {
            influencerEngagementPage.testCommunicationOptions();
        });

        it('should support campaign filtering and selection', () => {
            influencerEngagementPage.testCampaignFiltering();
        });

        it('should handle engagement workflow errors gracefully', () => {
            cy.intercept('POST', '**/api/campaigns/*/influencers/bulk-add', {
                statusCode: 400,
                body: { success: false, error: 'Campaign not found' }
            }).as('bulkAddError');

            marketplacePage
                .selectInfluencer('influencer1')
                .expectBulkAddButtonVisible(1);

            influencerEngagementPage
                .openBulkAddDialog()
                .selectBulkCampaign('Invalid Campaign')
                .confirmBulkAdd()
                .expectEngagementError('Campaign not found');

            cy.wait('@bulkAddError');
        });

        it('should track engagement performance metrics', () => {
            influencerEngagementPage.expectEngagementMetrics();
        });

        it('should maintain engagement history', () => {
            influencerEngagementPage.expectEngagementHistory();
        });

        it('should provide engagement accessibility', () => {
            influencerEngagementPage.checkEngagementAccessibility();
        });
    });

    describe('Cross-Module Integration', () => {
        it('should support complete influencer discovery to campaign workflow', () => {
            // Start with marketplace discovery
            marketplacePage.visit();

            // Perform advanced search
            searchAndFilterPage.performComplexSearch({
                searchTerm: 'fitness',
                platforms: ['INSTAGRAM'],
                minFollowers: 100000,
                verifiedOnly: true,
                audienceQuality: 'High'
            });

            // View specific influencer profile
            marketplacePage.viewInfluencerProfile('fitness_influencer_1');

            // Analyze profile thoroughly
            influencerProfilePage
                .expectToBeOnProfilePage('fitness_influencer_1')
                .performCompleteProfileAnalysis();

            // Add to campaign
            influencerEngagementPage.performCompleteEngagementWorkflow(
                'Fitness Influencer',
                'Health & Wellness Campaign',
                {
                    type: 'video-content',
                    description: 'Create workout video featuring our fitness equipment',
                    budget: 5000,
                    timeline: '3-weeks',
                    message: 'We admire your fitness content and would love to partner with you!'
                }
            );

            // Return to marketplace
            influencerProfilePage.goBackToMarketplace();
            marketplacePage.expectToBeOnMarketplacePage();
        });

        it('should maintain consistent state across navigation', () => {
            // Apply filters in marketplace
            marketplacePage.visit();
            searchAndFilterPage
                .openFilters()
                .filterByPlatform('INSTAGRAM')
                .setFollowerRange(50000, 200000)
                .applyFilters();

            // Navigate to profile and back
            marketplacePage.viewInfluencerProfile('test_influencer');
            influencerProfilePage.goBackToMarketplace();

            // Verify filters maintained
            searchAndFilterPage.expectActiveFilterCount(2);
        });

        it('should handle concurrent operations', () => {
            marketplacePage.visit();

            // Select multiple influencers while performing search
            marketplacePage
                .selectInfluencer('influencer1')
                .selectInfluencer('influencer2');

            searchAndFilterPage.performSearch('fashion');

            // Verify selection maintained through search
            marketplacePage.expectSelectionCount(2);
        });
    });

    describe('Error Handling & Edge Cases', () => {
        it('should handle API timeouts gracefully', () => {
            cy.intercept('GET', '**/api/influencers**', {
                statusCode: 408,
                body: { error: 'Request timeout' },
                delay: 5000
            }).as('getInfluencersTimeout');

            marketplacePage.visit();
            marketplacePage.expectErrorState();

            cy.wait('@getInfluencersTimeout');
        });

        it('should handle network failures', () => {
            cy.intercept('GET', '**/api/influencers**', { forceNetworkError: true }).as('networkError');

            marketplacePage.visit();
            marketplacePage.handleMarketplaceErrors();

            cy.wait('@networkError');
        });

        it('should recover from temporary failures', () => {
            // First request fails
            cy.intercept('GET', '**/api/influencers**', {
                statusCode: 500,
                body: { error: 'Server error' }
            }).as('serverError');

            marketplacePage.visit();
            marketplacePage.expectErrorState();

            // Second request succeeds after retry
            cy.intercept('GET', '**/api/influencers**', { fixture: 'influencers/marketplace-list.json' }).as('retrySuccess');

            cy.reload();
            marketplacePage.expectInfluencersVisible();

            cy.wait('@serverError');
            cy.wait('@retrySuccess');
        });

        it('should handle invalid influencer data', () => {
            cy.intercept('GET', '**/api/influencers**', {
                body: { influencers: [{ id: null, handle: null }], total: 1 }
            }).as('invalidData');

            marketplacePage.visit();
            // Should gracefully handle invalid data without crashing

            cy.wait('@invalidData');
        });
    });

    describe('Performance & Scalability', () => {
        it('should maintain performance with large datasets', () => {
            // Test with 1000+ influencers
            cy.intercept('GET', '**/api/influencers**', {
                fixture: 'influencers/large-dataset.json'
            }).as('largeDataset');

            cy.measurePageLoadTime(() => {
                marketplacePage.visit();
            }, 'large-dataset-performance', 4000);

            marketplacePage.expectInfluencersVisible();
            cy.wait('@largeDataset');
        });

        it('should optimize search performance', () => {
            marketplacePage.visit();

            cy.measureInteractionTime(() => {
                searchAndFilterPage.performSearch('beauty');
            }, 'search-performance', 1500);

            searchAndFilterPage.expectSearchResultsVisible();
        });

        it('should handle rapid filter changes', () => {
            marketplacePage.visit();

            // Rapidly apply multiple filters
            searchAndFilterPage
                .openFilters()
                .filterByPlatform('INSTAGRAM')
                .filterByPlatform('TIKTOK')
                .setFollowerRange(10000, 100000)
                .filterVerifiedOnly()
                .applyFilters();

            searchAndFilterPage.expectFiltersApplied();
        });

        it('should maintain responsiveness during bulk operations', () => {
            marketplacePage.visit();

            // Select many influencers
            for (let i = 1; i <= 10; i++) {
                marketplacePage.selectInfluencer(`influencer${i}`);
            }

            marketplacePage.expectSelectionCount(10);

            cy.measureInteractionTime(() => {
                influencerEngagementPage.performBulkEngagementWorkflow('Test Campaign', 10);
            }, 'bulk-operation-performance', 3000);
        });
    });

    describe('Security & Data Protection', () => {
        it('should protect sensitive influencer data', () => {
            influencerProfilePage.visitProfile('test_influencer', 'INSTAGRAM');

            // Verify no sensitive data exposed in DOM
            cy.get('body').should('not.contain', 'password');
            cy.get('body').should('not.contain', 'api_key');
            cy.get('body').should('not.contain', 'secret');
        });

        it('should validate campaign assignment permissions', () => {
            marketplacePage.visit();

            // Test unauthorized campaign access
            cy.intercept('POST', '**/api/campaigns/*/influencers/bulk-add', {
                statusCode: 403,
                body: { error: 'Insufficient permissions' }
            }).as('unauthorizedAccess');

            marketplacePage.selectInfluencer('influencer1');
            influencerEngagementPage
                .openBulkAddDialog()
                .selectBulkCampaign('Restricted Campaign')
                .confirmBulkAdd()
                .expectEngagementError('Insufficient permissions');

            cy.wait('@unauthorizedAccess');
        });

        it('should sanitize user inputs', () => {
            marketplacePage.visit();

            // Test XSS prevention
            searchAndFilterPage.performSearch('<script>alert("xss")</script>');

            // Should not execute script
            cy.get('body').should('not.contain', 'alert');
        });
    });

    describe('Analytics & Reporting', () => {
        it('should track marketplace usage analytics', () => {
            marketplacePage.visit();

            // Verify analytics events are fired
            cy.window().then((win) => {
                expect(win.analytics).to.exist;
            });

            searchAndFilterPage.performSearch('fashion');
            marketplacePage.viewInfluencerProfile('test_influencer');
        });

        it('should measure engagement success rates', () => {
            influencerEngagementPage.expectEngagementMetrics();
        });

        it('should provide search analytics', () => {
            marketplacePage.visit();
            searchAndFilterPage
                .performSearch('beauty')
                .expectSearchTimeUnder(1000);
        });
    });
}); 