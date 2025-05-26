import { BasePage } from '../shared/BasePage.js';

/**
 * Search and Filter Page Object Model
 * Handles advanced search capabilities and filtering functionality
 *
 * Covers:
 * - Advanced search functionality
 * - Multi-criteria filtering
 * - Search suggestions and autocomplete
 * - Filter combinations and interactions
 * - Search result validation
 * - Performance optimization
 */

export class SearchAndFilterPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/influencer-marketplace';
    this.pageTitle = 'Search & Filter';
  }

  // Element selectors using data-cy attributes
  elements = {
    // Search interface
    searchContainer: () => cy.get('[data-testid="search-container"]'),
    searchInput: () => cy.get('input[placeholder*="Search"]'),
    searchButton: () => cy.get('[data-testid="search-button"]'),
    searchClearButton: () => cy.get('[data-testid="search-clear"]'),
    searchIcon: () => cy.get('[data-testid="search-icon"]'),

    // Search suggestions
    searchSuggestions: () => cy.get('[data-testid="search-suggestions"]'),
    suggestionItem: index => cy.get(`[data-testid="suggestion-${index}"]`),
    suggestionCategory: category => cy.get(`[data-testid="suggestion-category-${category}"]`),
    recentSearches: () => cy.get('[data-testid="recent-searches"]'),
    popularSearches: () => cy.get('[data-testid="popular-searches"]'),

    // Filter panel and controls
    filtersPanel: () => cy.get('[data-testid="filters-panel"]'),
    filtersButton: () => cy.contains('button', 'Filters'),
    filtersSheet: () => cy.get('[role="dialog"]'),
    filtersHeader: () => cy.get('[data-testid="filters-header"]'),
    filtersTitle: () => cy.contains('Filter Influencers'),

    // Platform filters
    platformSection: () => cy.get('[data-testid="platform-filters"]'),
    platformLabel: () => cy.contains('Platform'),
    platformCheckbox: platform => cy.get(`input[value="${platform}"]`),
    platformLabelText: platform => cy.contains('label', platform),
    instagramFilter: () => this.elements.platformCheckbox('INSTAGRAM'),
    tiktokFilter: () => this.elements.platformCheckbox('TIKTOK'),
    youtubeFilter: () => this.elements.platformCheckbox('YOUTUBE'),
    twitterFilter: () => this.elements.platformCheckbox('TWITTER'),

    // Follower count filters
    followersSection: () => cy.get('[data-testid="follower-filters"]'),
    followersLabel: () => cy.contains('Followers'),
    minFollowersInput: () => cy.get('input[placeholder*="Min followers"]'),
    maxFollowersInput: () => cy.get('input[placeholder*="Max followers"]'),
    followersSlider: () => cy.get('[data-testid="followers-slider"]'),
    followersPreset: preset => cy.get(`[data-testid="followers-preset-${preset}"]`),

    // Engagement rate filters
    engagementSection: () => cy.get('[data-testid="engagement-filters"]'),
    engagementLabel: () => cy.contains('Engagement Rate'),
    minEngagementInput: () => cy.get('input[placeholder*="Min engagement"]'),
    maxEngagementInput: () => cy.get('input[placeholder*="Max engagement"]'),
    engagementSlider: () => cy.get('[data-testid="engagement-slider"]'),

    // Verification filters
    verificationSection: () => cy.get('[data-testid="verification-filter"]'),
    verificationLabel: () => cy.contains('Verification'),
    verifiedOnlyCheckbox: () => cy.get('input[type="checkbox"][name*="verified"]'),
    verifiedOnlyLabel: () => cy.contains('Verified only'),

    // Audience quality filters
    audienceQualitySection: () => cy.get('[data-testid="audience-quality-filter"]'),
    audienceQualityLabel: () => cy.contains('Audience Quality'),
    audienceQualitySelect: () => cy.get('select[name*="audienceQuality"]'),
    audienceQualityOption: quality => cy.get(`option[value="${quality}"]`),
    highQualityOption: () => this.elements.audienceQualityOption('High'),
    mediumQualityOption: () => this.elements.audienceQualityOption('Medium'),
    lowQualityOption: () => this.elements.audienceQualityOption('Low'),

    // Location filters
    locationSection: () => cy.get('[data-testid="location-filters"]'),
    locationLabel: () => cy.contains('Location'),
    countrySelect: () => cy.get('select[name*="country"]'),
    cityInput: () => cy.get('input[placeholder*="City"]'),
    locationSuggestions: () => cy.get('[data-testid="location-suggestions"]'),

    // Category/Niche filters
    categorySection: () => cy.get('[data-testid="category-filters"]'),
    categoryLabel: () => cy.contains('Category'),
    categoryCheckbox: category => cy.get(`input[value="${category}"]`),
    fashionCategory: () => this.elements.categoryCheckbox('fashion'),
    beautyCategory: () => this.elements.categoryCheckbox('beauty'),
    fitnessCategory: () => this.elements.categoryCheckbox('fitness'),
    travelCategory: () => this.elements.categoryCheckbox('travel'),
    foodCategory: () => this.elements.categoryCheckbox('food'),

    // Age demographics filters
    ageSection: () => cy.get('[data-testid="age-filters"]'),
    ageLabel: () => cy.contains('Age Demographics'),
    ageRange: range => cy.get(`input[value="${range}"]`),
    age18_24: () => this.elements.ageRange('18-24'),
    age25_34: () => this.elements.ageRange('25-34'),
    age35_44: () => this.elements.ageRange('35-44'),

    // Gender filters
    genderSection: () => cy.get('[data-testid="gender-filters"]'),
    genderLabel: () => cy.contains('Gender'),
    genderRadio: gender => cy.get(`input[value="${gender}"]`),
    maleGender: () => this.elements.genderRadio('male'),
    femaleGender: () => this.elements.genderRadio('female'),
    nonBinaryGender: () => this.elements.genderRadio('non-binary'),

    // Language filters
    languageSection: () => cy.get('[data-testid="language-filters"]'),
    languageLabel: () => cy.contains('Language'),
    languageSelect: () => cy.get('select[name*="language"]'),
    languageOption: language => cy.get(`option[value="${language}"]`),

    // Date filters
    dateSection: () => cy.get('[data-testid="date-filters"]'),
    dateLabel: () => cy.contains('Activity Date'),
    lastPostDateInput: () => cy.get('input[name*="lastPost"]'),
    joinDateInput: () => cy.get('input[name*="joinDate"]'),

    // Filter actions
    filterActions: () => cy.get('[data-testid="filter-actions"]'),
    applyFiltersButton: () => cy.contains('button', 'Apply Filters'),
    resetFiltersButton: () => cy.contains('button', 'Reset'),
    clearAllFiltersButton: () => cy.contains('button', 'Clear All'),
    saveFilterPresetButton: () => cy.contains('button', 'Save Preset'),

    // Active filters display
    activeFilters: () => cy.get('[data-testid="active-filters"]'),
    activeFilterChip: filterName => cy.get(`[data-testid="filter-chip-${filterName}"]`),
    activeFilterCount: () => cy.get('[data-testid="active-filter-count"]'),
    clearActiveFilter: filterName => cy.get(`[data-testid="clear-filter-${filterName}"]`),

    // Search results
    searchResults: () => cy.get('[data-testid="search-results"]'),
    resultsCount: () => cy.get('[data-testid="results-count"]'),
    resultsSummary: () => cy.get('[data-testid="results-summary"]'),
    noResultsMessage: () => cy.contains('No influencers found'),

    // Sort options
    sortSection: () => cy.get('[data-testid="sort-section"]'),
    sortSelect: () => cy.get('select[name*="sort"]'),
    sortOption: option => cy.get(`option[value="${option}"]`),
    sortByRelevance: () => this.elements.sortOption('relevance'),
    sortByFollowers: () => this.elements.sortOption('followers'),
    sortByEngagement: () => this.elements.sortOption('engagement'),
    sortByRecent: () => this.elements.sortOption('recent'),

    // View options
    viewOptions: () => cy.get('[data-testid="view-options"]'),
    gridViewButton: () => cy.get('[data-testid="grid-view"]'),
    listViewButton: () => cy.get('[data-testid="list-view"]'),

    // Loading states
    searchLoading: () => cy.get('[data-testid="search-loading"]'),
    filtersLoading: () => cy.get('[data-testid="filters-loading"]'),
    resultsLoading: () => cy.get('[data-testid="results-loading"]'),

    // Error states
    searchError: () => cy.get('[data-testid="search-error"]'),
    filtersError: () => cy.get('[data-testid="filters-error"]'),

    // Performance indicators
    searchTime: () => cy.get('[data-testid="search-time"]'),
    resultMetrics: () => cy.get('[data-testid="result-metrics"]'),
  };

  // Search functionality
  performSearch(searchTerm) {
    this.logAction(`Performing search for: ${searchTerm}`);
    this.elements.searchInput().clear().type(searchTerm);
    this.elements.searchButton().click();
    this.expectSearchResultsVisible();
    return this;
  }

  performAdvancedSearch(searchTerm) {
    this.logAction(`Performing advanced search for: ${searchTerm}`);
    this.elements.searchInput().clear().type(searchTerm);
    // Wait for suggestions to appear
    this.elements.searchSuggestions().should('be.visible');
    this.elements.searchButton().click();
    return this;
  }

  clearSearch() {
    this.logAction('Clearing search');
    this.elements.searchClearButton().click();
    this.expectSearchCleared();
    return this;
  }

  selectSearchSuggestion(index) {
    this.logAction(`Selecting search suggestion ${index}`);
    this.elements.suggestionItem(index).click();
    return this;
  }

  selectRecentSearch(searchTerm) {
    this.logAction(`Selecting recent search: ${searchTerm}`);
    this.elements.recentSearches().contains(searchTerm).click();
    return this;
  }

  // Filter management
  openFilters() {
    this.logAction('Opening filters panel');
    this.elements.filtersButton().click();
    this.expectFiltersVisible();
    return this;
  }

  closeFilters() {
    this.logAction('Closing filters panel');
    cy.get('[data-testid="filters-close"]').click();
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

  filterByMultiplePlatforms(platforms) {
    this.logAction(`Filtering by multiple platforms: ${platforms.join(', ')}`);
    platforms.forEach(platform => {
      this.elements.platformCheckbox(platform).check();
    });
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

  useFollowerPreset(preset) {
    this.logAction(`Using follower preset: ${preset}`);
    this.elements.followersPreset(preset).click();
    return this;
  }

  // Engagement rate filtering
  setEngagementRange(minEngagement, maxEngagement) {
    this.logAction(`Setting engagement range: ${minEngagement}% - ${maxEngagement}%`);
    if (minEngagement) {
      this.elements.minEngagementInput().clear().type(minEngagement.toString());
    }
    if (maxEngagement) {
      this.elements.maxEngagementInput().clear().type(maxEngagement.toString());
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

  // Location filtering
  filterByLocation(country, city = null) {
    this.logAction(`Filtering by location: ${city ? `${city}, ` : ''}${country}`);
    this.elements.countrySelect().select(country);
    if (city) {
      this.elements.cityInput().type(city);
    }
    return this;
  }

  // Category filtering
  filterByCategory(category) {
    this.logAction(`Filtering by category: ${category}`);
    this.elements.categoryCheckbox(category).check();
    return this;
  }

  filterByMultipleCategories(categories) {
    this.logAction(`Filtering by multiple categories: ${categories.join(', ')}`);
    categories.forEach(category => {
      this.elements.categoryCheckbox(category).check();
    });
    return this;
  }

  // Age demographics filtering
  filterByAgeRange(ageRange) {
    this.logAction(`Filtering by age range: ${ageRange}`);
    this.elements.ageRange(ageRange).check();
    return this;
  }

  // Gender filtering
  filterByGender(gender) {
    this.logAction(`Filtering by gender: ${gender}`);
    this.elements.genderRadio(gender).check();
    return this;
  }

  // Language filtering
  filterByLanguage(language) {
    this.logAction(`Filtering by language: ${language}`);
    this.elements.languageSelect().select(language);
    return this;
  }

  // Apply and reset filters
  applyFilters() {
    this.logAction('Applying filters');
    this.elements.applyFiltersButton().click();
    this.expectFiltersApplied();
    return this;
  }

  resetAllFilters() {
    this.logAction('Resetting all filters');
    this.elements.resetFiltersButton().click();
    this.expectFiltersReset();
    return this;
  }

  clearAllFilters() {
    this.logAction('Clearing all filters');
    this.elements.clearAllFiltersButton().click();
    this.expectFiltersCleared();
    return this;
  }

  // Active filters management
  clearActiveFilter(filterName) {
    this.logAction(`Clearing active filter: ${filterName}`);
    this.elements.clearActiveFilter(filterName).click();
    return this;
  }

  // Sorting functionality
  sortResultsBy(sortOption) {
    this.logAction(`Sorting results by: ${sortOption}`);
    this.elements.sortSelect().select(sortOption);
    this.expectResultsSorted(sortOption);
    return this;
  }

  // View options
  switchToGridView() {
    this.logAction('Switching to grid view');
    this.elements.gridViewButton().click();
    return this;
  }

  switchToListView() {
    this.logAction('Switching to list view');
    this.elements.listViewButton().click();
    return this;
  }

  // Search assertions
  expectSearchResultsVisible() {
    this.elements.searchResults().should('be.visible');
    this.elements.resultsCount().should('be.visible');
    return this;
  }

  expectSearchCleared() {
    this.elements.searchInput().should('have.value', '');
    return this;
  }

  expectSearchSuggestionsVisible() {
    this.elements.searchSuggestions().should('be.visible');
    return this;
  }

  expectResultsCount(expectedCount) {
    this.elements.resultsCount().should('contain', expectedCount.toString());
    return this;
  }

  expectNoResults() {
    this.elements.noResultsMessage().should('be.visible');
    return this;
  }

  // Filter assertions
  expectFiltersVisible() {
    this.elements.filtersSheet().should('be.visible');
    this.elements.filtersTitle().should('be.visible');
    return this;
  }

  expectFiltersHidden() {
    this.elements.filtersSheet().should('not.exist');
    return this;
  }

  expectFiltersApplied() {
    this.elements.filtersSheet().should('not.exist');
    this.elements.activeFilters().should('be.visible');
    return this;
  }

  expectFiltersReset() {
    this.elements.activeFilters().should('not.exist');
    return this;
  }

  expectFiltersCleared() {
    this.elements.activeFilters().should('not.exist');
    this.elements.searchInput().should('have.value', '');
    return this;
  }

  expectActiveFilter(filterName) {
    this.elements.activeFilterChip(filterName).should('be.visible');
    return this;
  }

  expectActiveFilterCount(count) {
    this.elements.activeFilterCount().should('contain', count.toString());
    return this;
  }

  // Platform filter assertions
  expectPlatformFilterSelected(platform) {
    this.elements.platformCheckbox(platform).should('be.checked');
    return this;
  }

  expectPlatformFilterNotSelected(platform) {
    this.elements.platformCheckbox(platform).should('not.be.checked');
    return this;
  }

  // Results assertions
  expectResultsSorted(sortOption) {
    // Verify results are sorted according to the option
    this.elements.searchResults().should('be.visible');
    return this;
  }

  expectResultsContainPlatform(platform) {
    this.elements.searchResults().should('contain', platform);
    return this;
  }

  expectResultsWithinFollowerRange(minFollowers, maxFollowers) {
    // Verify all results have followers within range
    this.elements.searchResults().should('be.visible');
    return this;
  }

  // Performance assertions
  expectSearchTimeUnder(maxTime) {
    this.elements.searchTime().should('contain', `< ${maxTime}ms`);
    return this;
  }

  // Complex search workflows
  performComplexSearch(criteria) {
    this.logAction('Performing complex search with multiple criteria');

    if (criteria.searchTerm) {
      this.performSearch(criteria.searchTerm);
    }

    this.openFilters();

    if (criteria.platforms) {
      this.filterByMultiplePlatforms(criteria.platforms);
    }

    if (criteria.minFollowers || criteria.maxFollowers) {
      this.setFollowerRange(criteria.minFollowers, criteria.maxFollowers);
    }

    if (criteria.minEngagement || criteria.maxEngagement) {
      this.setEngagementRange(criteria.minEngagement, criteria.maxEngagement);
    }

    if (criteria.verifiedOnly) {
      this.filterVerifiedOnly();
    }

    if (criteria.audienceQuality) {
      this.filterByAudienceQuality(criteria.audienceQuality);
    }

    if (criteria.categories) {
      this.filterByMultipleCategories(criteria.categories);
    }

    if (criteria.location) {
      this.filterByLocation(criteria.location.country, criteria.location.city);
    }

    if (criteria.ageRange) {
      this.filterByAgeRange(criteria.ageRange);
    }

    if (criteria.gender) {
      this.filterByGender(criteria.gender);
    }

    if (criteria.language) {
      this.filterByLanguage(criteria.language);
    }

    this.applyFilters();

    if (criteria.sortBy) {
      this.sortResultsBy(criteria.sortBy);
    }

    return this;
  }

  testSearchSuggestions() {
    this.logAction('Testing search suggestions functionality');

    // Type partial search term
    this.elements.searchInput().type('fash');
    this.expectSearchSuggestionsVisible();

    // Select a suggestion
    this.selectSearchSuggestion(0);
    this.expectSearchResultsVisible();

    return this;
  }

  testFilterCombinations() {
    this.logAction('Testing various filter combinations');

    // Test platform + follower combination
    this.openFilters();
    this.filterByPlatform('INSTAGRAM');
    this.setFollowerRange(10000, 100000);
    this.applyFilters();
    this.expectActiveFilterCount(2);

    // Add verification filter
    this.openFilters();
    this.filterVerifiedOnly();
    this.applyFilters();
    this.expectActiveFilterCount(3);

    // Clear one filter
    this.clearActiveFilter('verified');
    this.expectActiveFilterCount(2);

    return this;
  }

  testSortingOptions() {
    this.logAction('Testing sorting options');

    const sortOptions = ['relevance', 'followers', 'engagement', 'recent'];

    sortOptions.forEach(option => {
      this.sortResultsBy(option);
      this.expectResultsSorted(option);
    });

    return this;
  }

  // Error handling
  handleSearchErrors() {
    cy.get('body').then($body => {
      if ($body.find('[data-testid="search-error"]').length > 0) {
        cy.log('⚠️ Search error detected');
        this.takeScreenshot('search-error');

        // Try to clear and retry search
        this.clearSearch();
        this.resetAllFilters();
      }
    });
    return this;
  }

  // Performance monitoring
  measureSearchPerformance(searchFn) {
    return this.measureInteractionTime(searchFn, {
      actionName: 'search-performance',
      performanceBudget: 2000, // 2 seconds for search operations
    });
  }

  measureFilterPerformance(filterFn) {
    return this.measureInteractionTime(filterFn, {
      actionName: 'filter-performance',
      performanceBudget: 1500, // 1.5 seconds for filter operations
    });
  }

  // Accessibility testing
  checkSearchAccessibility() {
    cy.checkA11y('[data-testid="search-container"]', {
      rules: {
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
        'color-contrast': { enabled: true },
      },
    });
    return this;
  }

  checkFiltersAccessibility() {
    this.openFilters();
    cy.checkA11y('[data-testid="filters-panel"]', {
      rules: {
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
        'form-labels': { enabled: true },
      },
    });
    return this;
  }

  // Complete search workflow testing
  testCompleteSearchWorkflow() {
    this.logAction('Testing complete search and filter workflow');

    // Test basic search
    this.performSearch('fashion influencer');
    this.expectSearchResultsVisible();

    // Test search suggestions
    this.testSearchSuggestions();

    // Test complex filtering
    this.performComplexSearch({
      searchTerm: 'beauty',
      platforms: ['INSTAGRAM', 'TIKTOK'],
      minFollowers: 50000,
      maxFollowers: 500000,
      verifiedOnly: true,
      audienceQuality: 'High',
      categories: ['beauty', 'fashion'],
      sortBy: 'engagement',
    });

    // Test filter combinations
    this.testFilterCombinations();

    // Test sorting
    this.testSortingOptions();

    // Clear all and verify
    this.clearAllFilters();
    this.expectFiltersCleared();

    return this;
  }
}
