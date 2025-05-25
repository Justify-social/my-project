import { setupClerkTestingToken } from '@clerk/testing/cypress';
import {
    MarketplacePage,
    InfluencerProfilePage,
    SearchAndFilterPage,
    InfluencerEngagementPage
} from '../../support/page-objects';
import { TestSetup } from '../../support/test-helpers';

describe('Marketplace Module - SSOT Verification', () => {
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

        // Mock basic API responses
        cy.intercept('GET', '**/api/influencers**', {
            body: {
                influencers: [
                    { id: '1', handle: 'test_influencer', name: 'Test Influencer', platform: 'INSTAGRAM' }
                ],
                total: 1,
                page: 1,
                limit: 12
            }
        }).as('getInfluencers');
    });

    describe('Page Object SSOT Verification', () => {
        it('should verify MarketplacePage SSOT implementation', () => {
            // Test SSOT compliance
            expect(marketplacePage).to.be.instanceOf(MarketplacePage);
            expect(marketplacePage.resetPageState).to.be.a('function');
            expect(marketplacePage.logAction).to.be.a('function');
            expect(marketplacePage.takeScreenshot).to.be.a('function');

            // Test basic functionality
            marketplacePage.visit();
            marketplacePage.expectToBeOnMarketplacePage();

            cy.wait('@getInfluencers');
        });

        it('should verify InfluencerProfilePage SSOT implementation', () => {
            // Test SSOT compliance
            expect(influencerProfilePage).to.be.instanceOf(InfluencerProfilePage);
            expect(influencerProfilePage.resetPageState).to.be.a('function');
            expect(influencerProfilePage.logAction).to.be.a('function');

            // Mock profile API
            cy.intercept('GET', '**/api/influencers/fetch-profile**', {
                body: {
                    success: true,
                    data: {
                        id: '1',
                        handle: 'test_influencer',
                        name: 'Test Influencer',
                        platforms: ['INSTAGRAM']
                    }
                }
            }).as('getProfile');

            // Test basic functionality
            influencerProfilePage.visitProfile('test_influencer', 'INSTAGRAM');
            influencerProfilePage.expectProfileHeaderVisible();

            cy.wait('@getProfile');
        });

        it('should verify SearchAndFilterPage SSOT implementation', () => {
            // Test SSOT compliance
            expect(searchAndFilterPage).to.be.instanceOf(SearchAndFilterPage);
            expect(searchAndFilterPage.resetPageState).to.be.a('function');
            expect(searchAndFilterPage.logAction).to.be.a('function');

            // Test basic search functionality
            marketplacePage.visit();
            searchAndFilterPage.performSearch('test');
            searchAndFilterPage.expectSearchResultsVisible();
        });

        it('should verify InfluencerEngagementPage SSOT implementation', () => {
            // Test SSOT compliance
            expect(influencerEngagementPage).to.be.instanceOf(InfluencerEngagementPage);
            expect(influencerEngagementPage.resetPageState).to.be.a('function');
            expect(influencerEngagementPage.logAction).to.be.a('function');

            // Test engagement functionality exists
            expect(influencerEngagementPage.openAddToCampaignDialog).to.be.a('function');
            expect(influencerEngagementPage.selectCampaign).to.be.a('function');
            expect(influencerEngagementPage.confirmAddToCampaign).to.be.a('function');
        });
    });

    describe('Basic Functionality Verification', () => {
        it('should load marketplace successfully', () => {
            marketplacePage.visit();
            marketplacePage.expectToBeOnMarketplacePage();
            marketplacePage.expectInfluencersVisible();
        });

        it('should perform basic search', () => {
            marketplacePage.visit();
            searchAndFilterPage.performSearch('fashion');
            searchAndFilterPage.expectSearchResultsVisible();
        });

        it('should open filter panel', () => {
            marketplacePage.visit();
            searchAndFilterPage.openFilters();
            searchAndFilterPage.expectFiltersVisible();
        });

        it('should navigate to influencer profile', () => {
            cy.intercept('GET', '**/api/influencers/fetch-profile**', {
                body: {
                    success: true,
                    data: {
                        id: '1',
                        handle: 'test_influencer',
                        name: 'Test Influencer',
                        platforms: ['INSTAGRAM']
                    }
                }
            }).as('getProfile');

            influencerProfilePage.visitProfile('test_influencer', 'INSTAGRAM');
            influencerProfilePage.expectToBeOnProfilePage('test_influencer');

            cy.wait('@getProfile');
        });

        it('should test tab navigation', () => {
            cy.intercept('GET', '**/api/influencers/fetch-profile**', {
                body: {
                    success: true,
                    data: {
                        id: '1',
                        handle: 'test_influencer',
                        name: 'Test Influencer',
                        platforms: ['INSTAGRAM']
                    }
                }
            }).as('getProfile');

            influencerProfilePage.visitProfile('test_influencer', 'INSTAGRAM');
            influencerProfilePage.switchToPerformanceTab();
            influencerProfilePage.expectTabActive('performance');
        });
    });

    describe('Error Handling Verification', () => {
        it('should handle marketplace API errors', () => {
            cy.intercept('GET', '**/api/influencers**', {
                statusCode: 500,
                body: { error: 'Server error' }
            }).as('getInfluencersError');

            marketplacePage.visit();
            marketplacePage.expectErrorState();

            cy.wait('@getInfluencersError');
        });

        it('should handle profile not found', () => {
            cy.intercept('GET', '**/api/influencers/fetch-profile**', {
                statusCode: 404,
                body: { success: false, error: 'Profile not found' }
            }).as('getProfileNotFound');

            influencerProfilePage.visitProfile('nonexistent_user', 'INSTAGRAM');
            influencerProfilePage.expectErrorState();

            cy.wait('@getProfileNotFound');
        });
    });

    describe('Performance Verification', () => {
        it('should measure marketplace page load performance', () => {
            cy.measurePageLoadTime(() => {
                marketplacePage.visit();
            }, 'marketplace-load', 3000);

            marketplacePage.expectToBeOnMarketplacePage();
        });

        it('should measure search performance', () => {
            marketplacePage.visit();

            cy.measureInteractionTime(() => {
                searchAndFilterPage.performSearch('test');
            }, 'search-performance', 2000);

            searchAndFilterPage.expectSearchResultsVisible();
        });

        it('should measure profile load performance', () => {
            cy.intercept('GET', '**/api/influencers/fetch-profile**', {
                body: {
                    success: true,
                    data: {
                        id: '1',
                        handle: 'test_influencer',
                        name: 'Test Influencer',
                        platforms: ['INSTAGRAM']
                    }
                }
            }).as('getProfile');

            cy.measurePageLoadTime(() => {
                influencerProfilePage.visitProfile('test_influencer', 'INSTAGRAM');
            }, 'profile-load', 3000);

            influencerProfilePage.expectProfileHeaderVisible();
        });
    });

    describe('Integration Verification', () => {
        it('should test marketplace to profile navigation', () => {
            cy.intercept('GET', '**/api/influencers/fetch-profile**', {
                body: {
                    success: true,
                    data: {
                        id: '1',
                        handle: 'test_influencer',
                        name: 'Test Influencer',
                        platforms: ['INSTAGRAM']
                    }
                }
            }).as('getProfile');

            // Start at marketplace
            marketplacePage.visit();
            marketplacePage.expectToBeOnMarketplacePage();

            // Navigate to profile
            marketplacePage.viewInfluencerProfile('test_influencer');
            influencerProfilePage.expectToBeOnProfilePage('test_influencer');

            // Navigate back
            influencerProfilePage.goBackToMarketplace();
            marketplacePage.expectToBeOnMarketplacePage();
        });

        it('should test search and filter integration', () => {
            marketplacePage.visit();

            // Apply search
            searchAndFilterPage.performSearch('fashion');
            searchAndFilterPage.expectSearchResultsVisible();

            // Apply filters
            searchAndFilterPage.openFilters();
            searchAndFilterPage.filterByPlatform('INSTAGRAM');
            searchAndFilterPage.applyFilters();
            searchAndFilterPage.expectFiltersApplied();
        });
    });

    describe('Accessibility Verification', () => {
        it('should verify marketplace accessibility', () => {
            marketplacePage.visit();
            marketplacePage.checkMarketplaceAccessibility();
        });

        it('should verify search accessibility', () => {
            marketplacePage.visit();
            searchAndFilterPage.checkSearchAccessibility();
        });

        it('should verify profile accessibility', () => {
            cy.intercept('GET', '**/api/influencers/fetch-profile**', {
                body: {
                    success: true,
                    data: {
                        id: '1',
                        handle: 'test_influencer',
                        name: 'Test Influencer',
                        platforms: ['INSTAGRAM']
                    }
                }
            }).as('getProfile');

            influencerProfilePage.visitProfile('test_influencer', 'INSTAGRAM');
            influencerProfilePage.checkProfileAccessibility();
        });
    });
}); 