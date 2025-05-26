import { BasePage } from '../shared/BasePage.js';

/**
 * Dashboard Page Object Model
 * Encapsulates dashboard page interactions using our data-cy attributes
 */

export class DashboardPage extends BasePage {
  // Element selectors using our data-cy attributes
  elements = {
    // Main dashboard elements
    dashboardContent: () => cy.get('[data-cy="dashboard-content"]'),
    dashboardHeader: () => cy.get('[data-cy="dashboard-header"]'),
    dashboardTitle: () => cy.get('[data-cy="dashboard-title"]'),
    dashboardGrid: () => cy.get('[data-cy="dashboard-grid"]'),

    // Header navigation elements
    newCampaignButton: () => cy.get('[data-cy="new-campaign-button"]'),

    // Calendar card elements
    calendarCard: () => cy.get('[data-cy="calendar-card"]'),
    calendarContent: () => cy.get('[data-cy="calendar-content"]'),
    calendarLoading: () => cy.get('[data-cy="calendar-loading"]'),
    calendarEmptyState: () => cy.get('[data-cy="calendar-empty-state"]'),

    // Campaigns card elements
    campaignsCard: () => cy.get('[data-cy="campaigns-card"]'),
    campaignsContent: () => cy.get('[data-cy="campaigns-content"]'),

    // Main header elements (should be present on dashboard)
    mainHeader: () => cy.get('[data-cy="main-header"]'),
    headerContainer: () => cy.get('[data-cy="header-container"]'),
    headerLogo: () => cy.get('[data-cy="header-logo"]'),
    companyName: () => cy.get('[data-cy="company-name"]'),

    // Search functionality
    searchContainer: () => cy.get('[data-cy="header-search-container"]'),
    searchBar: () => cy.get('[data-cy="search-bar"]'),
    searchInput: () => cy.get('[data-cy="search-input"]'),

    // Header actions
    headerActions: () => cy.get('[data-cy="header-actions"]'),
    creditsButton: () => cy.get('[data-cy="credits-button"]'),
    notificationsButton: () => cy.get('[data-cy="notifications-button"]'),
    authControls: () => cy.get('[data-cy="auth-controls"]'),

    // Sidebar navigation
    mainSidebar: () => cy.get('[data-cy="main-sidebar"]'),
    sidebarHeader: () => cy.get('[data-cy="sidebar-header"]'),
    sidebarTitle: () => cy.get('[data-cy="sidebar-title"]'),
    mainNavigation: () => cy.get('[data-cy="main-navigation"]'),
  };

  // Page actions
  visit() {
    cy.visit('/dashboard');
    // Wait for authentication to be established
    cy.window().should('have.property', '__clerk_loaded', true);
    // Wait for dashboard content with longer timeout
    this.elements.dashboardContent().should('be.visible', { timeout: 20000 });
    return this;
  }

  waitForLoad() {
    this.elements.dashboardContent().should('be.visible');
    this.elements.dashboardHeader().should('be.visible');
    this.elements.dashboardTitle().should('be.visible');
    return this;
  }

  // Navigation actions
  clickNewCampaign() {
    this.elements.newCampaignButton().click();
    return this;
  }

  clickLogo() {
    this.elements.headerLogo().click();
    return this;
  }

  clickCredits() {
    this.elements.creditsButton().click();
    return this;
  }

  clickNotifications() {
    this.elements.notificationsButton().click();
    return this;
  }

  // Search actions
  searchFor(query) {
    this.elements.searchInput().clear().type(query);
    return this;
  }

  performSearch(query) {
    this.elements.searchInput().clear().type(query).type('{enter}');
    return this;
  }

  clearSearch() {
    this.elements.searchInput().clear();
    return this;
  }

  // Calendar interactions
  expectCalendarVisible() {
    this.elements.calendarCard().should('be.visible');
    this.elements.calendarContent().should('be.visible');
    return this;
  }

  expectCalendarEmptyState() {
    this.elements.calendarEmptyState().should('be.visible');
    this.elements.calendarEmptyState().should('contain', 'Calendar Clear!');
    return this;
  }

  expectCalendarLoading() {
    this.elements.calendarLoading().should('be.visible');
    return this;
  }

  // Campaigns interactions
  expectCampaignsVisible() {
    this.elements.campaignsCard().should('be.visible');
    this.elements.campaignsContent().should('be.visible');
    return this;
  }

  clickCampaign(campaignId) {
    cy.get(`[data-cy="campaign-link-${campaignId}"]`).click();
    return this;
  }

  // Navigation verification
  expectNavigationVisible() {
    this.elements.mainSidebar().should('be.visible');
    this.elements.mainNavigation().should('be.visible');
    return this;
  }

  clickNavigationItem(itemName) {
    cy.get(`[data-cy="nav-link-${itemName.toLowerCase().replace(/\s+/g, '-')}"]`).click();
    return this;
  }

  // Header verification
  expectHeaderVisible() {
    this.elements.mainHeader().should('be.visible');
    this.elements.headerContainer().should('be.visible');
    return this;
  }

  expectUserNameInTitle(userName) {
    this.elements.dashboardTitle().should('contain', userName);
    return this;
  }

  // Complete dashboard verification
  expectDashboardLoaded() {
    this.expectHeaderVisible();
    this.expectNavigationVisible();
    this.elements.dashboardContent().should('be.visible');
    this.elements.dashboardGrid().should('be.visible');
    this.elements.newCampaignButton().should('be.visible');
    return this;
  }

  // Assertions
  expectToBeOnDashboard() {
    cy.url().should('include', '/dashboard');
    this.waitForLoad();
    return this;
  }

  expectDashboardTitle(title) {
    this.elements.dashboardTitle().should('contain', title);
    return this;
  }

  expectNewCampaignButtonEnabled() {
    this.elements.newCampaignButton().should('not.be.disabled');
    return this;
  }

  expectSearchFunctionality() {
    this.elements.searchContainer().should('be.visible');
    this.elements.searchBar().should('be.visible');
    this.elements.searchInput().should('be.visible');
    return this;
  }

  // Complex workflows
  createNewCampaign() {
    this.clickNewCampaign();
    cy.url().should('include', '/campaigns/wizard');
    return this;
  }

  navigateToCampaigns() {
    this.clickNavigationItem('campaigns');
    cy.url().should('include', '/campaigns');
    return this;
  }

  navigateToSettings() {
    this.clickNavigationItem('settings');
    cy.url().should('include', '/settings');
    return this;
  }
}
