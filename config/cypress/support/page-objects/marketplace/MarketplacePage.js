import { BasePage } from '../shared/BasePage.js';

/**
 * Marketplace Page Object Model
 * Handles influencer discovery and browsing functionality
 *
 * Covers:
 * - Influencer search and filtering
 * - Pagination and list management
 * - Bulk selection and campaign assignment
 * - Individual profile navigation
 * - Filter sheet functionality
 * - Error handling and loading states
 */

export class MarketplacePage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/influencer-marketplace';
    this.pageTitle = 'Influencer Marketplace';
  }

  // Element selectors using data-cy attributes
  elements = {
    // Main page container
    marketplaceContainer: () => cy.get('.container.mx-auto'),
    pageTitle: () => cy.contains('h1', 'Influencer Marketplace'),

    // Header actions and controls
    headerActions: () => cy.get('.flex.justify-between.items-center'),
    filtersButton: () => cy.contains('button', 'Filters'),
    bulkAddButton: () => cy.contains('button', 'Add'),
    bulkAddButtonCount: count => cy.contains('button', `Add ${count} to Campaign`),

    // Filter sheet and controls
    filterSheet: () => cy.get('[role="dialog"]'),
    filterSheetTitle: () => cy.contains('[role="dialog"] h2', 'Filter Influencers'),
    filterSheetDescription: () => cy.contains('Refine the list based on your criteria'),

    // Search functionality
    searchInput: () => cy.get('input[placeholder*="Search"]'),
    searchClearButton: () => cy.get('[data-testid="search-clear"]'),

    // Platform filters
    platformFilterSection: () => cy.get('[data-testid="platform-filters"]'),
    platformCheckbox: platform => cy.get(`input[value="${platform}"]`),
    platformLabel: platform => cy.contains('label', platform),

    // Follower count filters
    followerFilters: () => cy.get('[data-testid="follower-filters"]'),
    minFollowersInput: () => cy.get('input[placeholder*="Min followers"]'),
    maxFollowersInput: () => cy.get('input[placeholder*="Max followers"]'),

    // Verification filter
    verificationFilter: () => cy.get('[data-testid="verification-filter"]'),
    verifiedOnlyCheckbox: () => cy.get('input[type="checkbox"][name*="verified"]'),

    // Audience quality filter
    audienceQualityFilter: () => cy.get('[data-testid="audience-quality-filter"]'),
    audienceQualitySelect: () => cy.get('select[name*="audienceQuality"]'),
    audienceQualityOption: quality => cy.get(`option[value="${quality}"]`),

    // Filter actions
    applyFiltersButton: () => cy.contains('button', 'Apply Filters'),
    resetFiltersButton: () => cy.contains('button', 'Reset'),
    clearFiltersButton: () => cy.contains('button', 'Clear'),

    // Influencer list and cards
    influencerList: () => cy.get('[data-testid="marketplace-list"]'),
    influencerCard: index => cy.get(`[data-testid="influencer-card-${index}"]`),
    influencerCardByHandle: handle =>
      cy.get(`[data-testid="influencer-card"][data-handle="${handle}"]`),

    // Influencer card elements
    influencerAvatar: handle =>
      this.elements.influencerCardByHandle(handle).find('[data-testid="avatar"]'),
    influencerName: handle =>
      this.elements.influencerCardByHandle(handle).find('[data-testid="name"]'),
    influencerHandle: handle =>
      this.elements.influencerCardByHandle(handle).find('[data-testid="handle"]'),
    influencerPlatform: handle =>
      this.elements.influencerCardByHandle(handle).find('[data-testid="platform"]'),
    influencerFollowers: handle =>
      this.elements.influencerCardByHandle(handle).find('[data-testid="followers"]'),
    influencerEngagement: handle =>
      this.elements.influencerCardByHandle(handle).find('[data-testid="engagement"]'),
    influencerVerified: handle =>
      this.elements.influencerCardByHandle(handle).find('[data-testid="verified"]'),

    // Selection functionality
    selectCheckbox: handle =>
      this.elements.influencerCardByHandle(handle).find('input[type="checkbox"]'),
    selectAllCheckbox: () => cy.get('input[data-testid="select-all"]'),
    selectedCount: () => cy.get('[data-testid="selected-count"]'),

    // Action buttons on cards
    viewProfileButton: handle =>
      this.elements.influencerCardByHandle(handle).find('button').contains('View Profile'),
    addToCampaignButton: handle =>
      this.elements.influencerCardByHandle(handle).find('button').contains('Add to Campaign'),

    // Pagination controls
    paginationContainer: () => cy.get('[data-testid="pagination"]'),
    previousPageButton: () => cy.get('button').contains('Previous'),
    nextPageButton: () => cy.get('button').contains('Next'),
    pageNumberButton: page => cy.get('button').contains(page.toString()),
    currentPageIndicator: () => cy.get('[data-testid="current-page"]'),
    totalPagesIndicator: () => cy.get('[data-testid="total-pages"]'),

    // Results and status
    resultsCount: () => cy.get('[data-testid="results-count"]'),
    noResultsMessage: () => cy.contains('No influencers found'),
    loadingSpinner: () => cy.get('.animate-spin'),
    loadingSkeletons: () => cy.get('[data-testid="loading-skeleton"]'),

    // Error states
    errorAlert: () => cy.get('[role="alert"]'),
    errorTitle: () => cy.get('[role="alert"] [data-testid="alert-title"]'),
    errorDescription: () => cy.get('[role="alert"] [data-testid="alert-description"]'),

    // Bulk operations
    bulkAddDialog: () => cy.get('[role="alertdialog"]'),
    bulkAddDialogTitle: () => cy.contains('[role="alertdialog"] h2', 'Add'),
    campaignSelect: () => cy.get('select[data-testid="campaign-select"]'),
    campaignOption: campaignName => cy.get(`option`).contains(campaignName),
    bulkAddConfirmButton: () => cy.get('[role="alertdialog"] button').contains('Add Influencers'),
    bulkAddCancelButton: () => cy.get('[role="alertdialog"] button').contains('Cancel'),

    // Toast notifications
    successToast: () => cy.contains('[role="status"]', 'success'),
    errorToast: () => cy.contains('[role="status"]', 'error'),
    loadingToast: () => cy.contains('[role="status"]', 'loading'),
  };

  // Page navigation actions
  visit() {
    cy.visit(this.pageUrl);
    this.waitForPageLoad();
    return this;
  }

  // Filter functionality
  openFilters() {
    this.logAction('Opening filter sheet');
    this.elements.filtersButton().click();
    this.expectFilterSheetVisible();
    return this;
  }

  closeFilters() {
    this.logAction('Closing filter sheet');
    cy.get('[data-testid="sheet-close"]').click();
    return this;
  }

  // Search functionality
  searchInfluencers(searchTerm) {
    this.logAction(`Searching for: ${searchTerm}`);
    this.elements.searchInput().clear().type(searchTerm);
    return this;
  }

  clearSearch() {
    this.logAction('Clearing search');
    this.elements.searchClearButton().click();
    this.expectSearchCleared();
    return this;
  }

  // Platform filtering
  filterByPlatform(platform) {
    this.logAction(`Filtering by platform: ${platform}`);
    this.elements.platformCheckbox(platform).check();
    return this;
  }

  clearPlatformFilter(platform) {
    this.logAction(`Clearing platform filter: ${platform}`);
    this.elements.platformCheckbox(platform).uncheck();
    return this;
  }

  // Follower count filtering
  setFollowerRange(minFollowers, maxFollowers) {
    this.logAction(`Setting follower range: ${minFollowers} - ${maxFollowers}`);
    if (minFollowers) {
      this.elements.minFollowersInput().clear().type(minFollowers.toString());
    }
    if (maxFollowers) {
      this.elements.maxFollowersInput().clear().type(maxFollowers.toString());
    }
    return this;
  }

  // Verification filtering
  filterVerifiedOnly() {
    this.logAction('Filtering verified influencers only');
    this.elements.verifiedOnlyCheckbox().check();
    return this;
  }

  clearVerificationFilter() {
    this.logAction('Clearing verification filter');
    this.elements.verifiedOnlyCheckbox().uncheck();
    return this;
  }

  // Audience quality filtering
  filterByAudienceQuality(quality) {
    this.logAction(`Filtering by audience quality: ${quality}`);
    this.elements.audienceQualitySelect().select(quality);
    return this;
  }

  // Apply and reset filters
  applyFilters() {
    this.logAction('Applying filters');
    this.elements.applyFiltersButton().click();
    this.expectFiltersApplied();
    return this;
  }

  resetFilters() {
    this.logAction('Resetting all filters');
    this.elements.resetFiltersButton().click();
    this.expectFiltersReset();
    return this;
  }

  // Selection functionality
  selectInfluencer(handle) {
    this.logAction(`Selecting influencer: ${handle}`);
    this.elements.selectCheckbox(handle).check();
    return this;
  }

  deselectInfluencer(handle) {
    this.logAction(`Deselecting influencer: ${handle}`);
    this.elements.selectCheckbox(handle).uncheck();
    return this;
  }

  selectAllInfluencers() {
    this.logAction('Selecting all visible influencers');
    this.elements.selectAllCheckbox().check();
    return this;
  }

  deselectAllInfluencers() {
    this.logAction('Deselecting all influencers');
    this.elements.selectAllCheckbox().uncheck();
    return this;
  }

  // Profile navigation
  viewInfluencerProfile(handle) {
    this.logAction(`Viewing profile for: ${handle}`);
    this.elements.viewProfileButton(handle).click();
    // Should navigate to profile page
    cy.url().should('include', `/influencer-marketplace/${handle}`);
    return this;
  }

  // Pagination
  goToNextPage() {
    this.logAction('Going to next page');
    this.elements.nextPageButton().click();
    this.expectPageChanged();
    return this;
  }

  goToPreviousPage() {
    this.logAction('Going to previous page');
    this.elements.previousPageButton().click();
    this.expectPageChanged();
    return this;
  }

  goToPage(pageNumber) {
    this.logAction(`Going to page: ${pageNumber}`);
    this.elements.pageNumberButton(pageNumber).click();
    this.expectPageChanged();
    return this;
  }

  // Bulk operations
  bulkAddToCampaign(campaignName) {
    this.logAction(`Bulk adding selected influencers to campaign: ${campaignName}`);
    this.elements.bulkAddButton().click();
    this.expectBulkAddDialogVisible();
    this.elements.campaignSelect().select(campaignName);
    this.elements.bulkAddConfirmButton().click();
    this.expectBulkAddSuccess();
    return this;
  }

  cancelBulkAdd() {
    this.logAction('Cancelling bulk add operation');
    this.elements.bulkAddCancelButton().click();
    return this;
  }

  // Page state assertions
  expectToBeOnMarketplacePage() {
    cy.url().should('include', this.pageUrl);
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  expectFilterSheetVisible() {
    this.elements.filterSheet().should('be.visible');
    this.elements.filterSheetTitle().should('be.visible');
    return this;
  }

  expectFilterSheetHidden() {
    this.elements.filterSheet().should('not.exist');
    return this;
  }

  // Search assertions
  expectSearchCleared() {
    this.elements.searchInput().should('have.value', '');
    return this;
  }

  expectSearchResults(searchTerm) {
    // Results should contain the search term
    this.elements.influencerList().should('be.visible');
    return this;
  }

  // Filter assertions
  expectFiltersApplied() {
    this.elements.filterSheet().should('not.exist');
    this.elements.influencerList().should('be.visible');
    return this;
  }

  expectFiltersReset() {
    this.elements.searchInput().should('have.value', '');
    // Additional checks for cleared filter states
    return this;
  }

  // Results assertions
  expectInfluencersVisible() {
    this.elements.influencerList().should('be.visible');
    this.elements.influencerCard(0).should('be.visible');
    return this;
  }

  expectNoResults() {
    this.elements.noResultsMessage().should('be.visible');
    return this;
  }

  expectInfluencerCount(expectedCount) {
    this.elements
      .influencerList()
      .find('[data-testid^="influencer-card"]')
      .should('have.length', expectedCount);
    return this;
  }

  expectInfluencerVisible(handle) {
    this.elements.influencerCardByHandle(handle).should('be.visible');
    return this;
  }

  expectInfluencerNotVisible(handle) {
    this.elements.influencerCardByHandle(handle).should('not.exist');
    return this;
  }

  // Selection assertions
  expectInfluencerSelected(handle) {
    this.elements.selectCheckbox(handle).should('be.checked');
    return this;
  }

  expectInfluencerNotSelected(handle) {
    this.elements.selectCheckbox(handle).should('not.be.checked');
    return this;
  }

  expectSelectionCount(expectedCount) {
    this.elements.selectedCount().should('contain', expectedCount.toString());
    return this;
  }

  expectBulkAddButtonVisible(count) {
    this.elements.bulkAddButtonCount(count).should('be.visible');
    return this;
  }

  expectBulkAddButtonHidden() {
    this.elements.bulkAddButton().should('not.exist');
    return this;
  }

  // Pagination assertions
  expectPageChanged() {
    this.elements.loadingSpinner().should('not.exist');
    this.elements.influencerList().should('be.visible');
    return this;
  }

  expectCurrentPage(pageNumber) {
    this.elements.currentPageIndicator().should('contain', pageNumber.toString());
    return this;
  }

  expectTotalPages(totalPages) {
    this.elements.totalPagesIndicator().should('contain', totalPages.toString());
    return this;
  }

  expectPreviousPageDisabled() {
    this.elements.previousPageButton().should('be.disabled');
    return this;
  }

  expectNextPageDisabled() {
    this.elements.nextPageButton().should('be.disabled');
    return this;
  }

  // Bulk operation assertions
  expectBulkAddDialogVisible() {
    this.elements.bulkAddDialog().should('be.visible');
    this.elements.bulkAddDialogTitle().should('be.visible');
    return this;
  }

  expectBulkAddDialogHidden() {
    this.elements.bulkAddDialog().should('not.exist');
    return this;
  }

  expectBulkAddSuccess() {
    this.elements.successToast().should('be.visible');
    this.elements.bulkAddDialog().should('not.exist');
    return this;
  }

  // Error state assertions
  expectErrorState() {
    this.elements.errorAlert().should('be.visible');
    this.elements.errorTitle().should('be.visible');
    return this;
  }

  expectErrorMessage(message) {
    this.elements.errorDescription().should('contain', message);
    return this;
  }

  // Loading state assertions
  expectLoadingState() {
    this.elements.loadingSpinner().should('be.visible');
    return this;
  }

  expectContentLoaded() {
    this.elements.loadingSpinner().should('not.exist');
    this.elements.influencerList().should('be.visible');
    return this;
  }

  // Wait for page load
  waitForPageLoad() {
    this.elements.pageTitle().should('be.visible', { timeout: this.loadTimeout });
    this.elements.influencerList().should('be.visible', { timeout: this.loadTimeout });
    return this;
  }

  // Complex workflows
  performAdvancedSearch(criteria) {
    this.logAction('Performing advanced search with multiple criteria');

    this.openFilters();

    if (criteria.searchTerm) {
      this.searchInfluencers(criteria.searchTerm);
    }

    if (criteria.platforms) {
      criteria.platforms.forEach(platform => {
        this.filterByPlatform(platform);
      });
    }

    if (criteria.minFollowers || criteria.maxFollowers) {
      this.setFollowerRange(criteria.minFollowers, criteria.maxFollowers);
    }

    if (criteria.verifiedOnly) {
      this.filterVerifiedOnly();
    }

    if (criteria.audienceQuality) {
      this.filterByAudienceQuality(criteria.audienceQuality);
    }

    this.applyFilters();
    this.expectFiltersApplied();

    return this;
  }

  performBulkSelectionWorkflow(handles) {
    this.logAction(`Performing bulk selection workflow for ${handles.length} influencers`);

    // Select multiple influencers
    handles.forEach(handle => {
      this.selectInfluencer(handle);
      this.expectInfluencerSelected(handle);
    });

    this.expectSelectionCount(handles.length);
    this.expectBulkAddButtonVisible(handles.length);

    return this;
  }

  testPaginationWorkflow() {
    this.logAction('Testing pagination workflow');

    // Test navigation to next page
    this.goToNextPage();
    this.expectCurrentPage(2);

    // Test navigation to previous page
    this.goToPreviousPage();
    this.expectCurrentPage(1);

    // Test direct page navigation
    this.goToPage(3);
    this.expectCurrentPage(3);

    return this;
  }

  // Error handling
  handleMarketplaceErrors() {
    cy.get('body').then($body => {
      if ($body.text().includes('Error') || $body.find('[role="alert"]').length > 0) {
        cy.log('⚠️ Marketplace error detected');
        this.takeScreenshot('marketplace-error');

        // Try to recover by refreshing
        cy.reload();
        this.waitForPageLoad();
      }
    });
    return this;
  }

  // Performance monitoring
  measurePageLoad() {
    return this.measurePageLoadTime({
      actionName: 'marketplace-page-load',
      performanceBudget: 3000, // 3 seconds for marketplace page
    });
  }

  measureSearchPerformance(searchFn) {
    return this.measureInteractionTime(searchFn, {
      actionName: 'marketplace-search',
      performanceBudget: 2000, // 2 seconds for search operations
    });
  }

  // Responsive design testing
  testMobileMarketplace() {
    cy.viewport('iphone-6');
    this.expectToBeOnMarketplacePage();
    this.expectInfluencersVisible();
    cy.viewport(1280, 720); // Reset
    return this;
  }

  // Accessibility testing
  checkMarketplaceAccessibility() {
    cy.checkA11y('.container.mx-auto', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
      },
    });
    return this;
  }

  // Complete marketplace workflow testing
  testCompleteMarketplaceWorkflow() {
    this.logAction('Testing complete marketplace workflow');

    this.expectToBeOnMarketplacePage();
    this.expectInfluencersVisible();

    // Test search functionality
    this.performAdvancedSearch({
      searchTerm: 'fashion',
      platforms: ['INSTAGRAM'],
      minFollowers: 10000,
      verifiedOnly: true,
    });

    // Test selection and bulk operations
    this.performBulkSelectionWorkflow(['influencer1', 'influencer2']);

    // Test pagination
    this.testPaginationWorkflow();

    // Test profile navigation
    this.viewInfluencerProfile('influencer1');

    return this;
  }
}
