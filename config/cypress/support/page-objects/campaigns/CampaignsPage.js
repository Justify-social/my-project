import { BasePage } from '../shared/BasePage.js';

/**
 * Campaigns Page Object Model
 * Encapsulates campaigns list page interactions using our data-cy attributes
 */

export class CampaignsPage extends BasePage {
  // Element selectors using our data-cy attributes
  elements = {
    // Main campaigns page elements
    campaignsList: () => cy.get('[data-cy="campaigns-list"]'),
    campaignsHeader: () => cy.get('[data-cy="campaigns-header"]'),
    campaignsTitle: () => cy.get('[data-cy="campaigns-title"]'),
    campaignsSubtitle: () => cy.get('[data-cy="campaigns-subtitle"]'),

    // Action buttons
    filtersButton: () => cy.get('[data-cy="filters-button"]'),
    filtersPanel: () => cy.get('[data-cy="filters-panel"]'),
    newCampaignButton: () => cy.get('[data-cy="new-campaign-button"]'),

    // Campaigns table elements
    campaignsTable: () => cy.get('[data-cy="campaigns-table"]'),
    tableHeader: () => cy.get('[data-cy="table-header"]'),
    tableBody: () => cy.get('[data-cy="table-body"]'),

    // Table header sorting
    sortCampaignName: () => cy.get('[data-cy="sort-campaign-name"]'),
    sortStatus: () => cy.get('[data-cy="sort-status"]'),
    sortObjective: () => cy.get('[data-cy="sort-objective"]'),
    sortStartDate: () => cy.get('[data-cy="sort-start-date"]'),
    sortEndDate: () => cy.get('[data-cy="sort-end-date"]'),
    actionsHeader: () => cy.get('[data-cy="actions-header"]'),
  };

  // Dynamic selectors for campaign rows
  campaignRow = campaignId => cy.get(`[data-cy="campaign-row-${campaignId}"]`);
  campaignLink = campaignId => cy.get(`[data-cy="campaign-link-${campaignId}"]`);
  campaignStatus = campaignId => cy.get(`[data-cy="campaign-status-${campaignId}"]`);
  campaignObjective = campaignId => cy.get(`[data-cy="campaign-objective-${campaignId}"]`);
  campaignStartDate = campaignId => cy.get(`[data-cy="campaign-start-date-${campaignId}"]`);
  campaignEndDate = campaignId => cy.get(`[data-cy="campaign-end-date-${campaignId}"]`);
  campaignActions = campaignId => cy.get(`[data-cy="campaign-actions-${campaignId}"]`);

  // Campaign action buttons
  viewCampaignButton = campaignId => cy.get(`[data-cy="view-campaign-${campaignId}"]`);
  editCampaignButton = campaignId => cy.get(`[data-cy="edit-campaign-${campaignId}"]`);
  duplicateCampaignButton = campaignId => cy.get(`[data-cy="duplicate-campaign-${campaignId}"]`);
  deleteCampaignButton = campaignId => cy.get(`[data-cy="delete-campaign-${campaignId}"]`);

  // Page actions
  visit() {
    cy.visit('/campaigns');
    this.elements.campaignsList().should('be.visible', { timeout: 15000 });
    return this;
  }

  waitForLoad() {
    this.elements.campaignsList().should('be.visible');
    this.elements.campaignsHeader().should('be.visible');
    this.elements.campaignsTitle().should('be.visible');
    return this;
  }

  // Navigation actions
  clickNewCampaign() {
    this.elements.newCampaignButton().click();
    return this;
  }

  clickFilters() {
    this.elements.filtersButton().click();
    this.elements.filtersPanel().should('be.visible');
    return this;
  }

  // Table sorting actions
  sortByCampaignName() {
    this.elements.sortCampaignName().click();
    return this;
  }

  sortByStatus() {
    this.elements.sortStatus().click();
    return this;
  }

  sortByObjective() {
    this.elements.sortObjective().click();
    return this;
  }

  sortByStartDate() {
    this.elements.sortStartDate().click();
    return this;
  }

  sortByEndDate() {
    this.elements.sortEndDate().click();
    return this;
  }

  // Campaign row interactions
  clickCampaignLink(campaignId) {
    this.campaignLink(campaignId).click();
    return this;
  }

  viewCampaign(campaignId) {
    this.viewCampaignButton(campaignId).click();
    cy.url().should('include', `/campaigns/${campaignId}`);
    return this;
  }

  editCampaign(campaignId) {
    this.editCampaignButton(campaignId).click();
    cy.url().should('include', '/campaigns/wizard');
    return this;
  }

  duplicateCampaign(campaignId) {
    this.duplicateCampaignButton(campaignId).click();
    // Duplicate dialog should appear
    cy.get('[role="dialog"]').should('be.visible');
    return this;
  }

  deleteCampaign(campaignId) {
    this.deleteCampaignButton(campaignId).click();
    // Delete confirmation dialog should appear
    cy.get('[role="dialog"]').should('be.visible');
    return this;
  }

  // Campaign row assertions
  expectCampaignVisible(campaignId) {
    this.campaignRow(campaignId).should('be.visible');
    return this;
  }

  expectCampaignName(campaignId, name) {
    this.campaignLink(campaignId).should('contain', name);
    return this;
  }

  expectCampaignStatus(campaignId, status) {
    this.campaignStatus(campaignId).should('contain', status);
    return this;
  }

  expectCampaignObjective(campaignId, objective) {
    this.campaignObjective(campaignId).should('contain', objective);
    return this;
  }

  expectCampaignStartDate(campaignId, date) {
    this.campaignStartDate(campaignId).should('contain', date);
    return this;
  }

  expectCampaignEndDate(campaignId, date) {
    this.campaignEndDate(campaignId).should('contain', date);
    return this;
  }

  // Table verification
  expectTableVisible() {
    this.elements.campaignsTable().should('be.visible');
    this.elements.tableHeader().should('be.visible');
    this.elements.tableBody().should('be.visible');
    return this;
  }

  expectTableHeaders() {
    this.elements.sortCampaignName().should('contain', 'Campaign Name');
    this.elements.sortStatus().should('contain', 'Status');
    this.elements.sortObjective().should('contain', 'Objective');
    this.elements.sortStartDate().should('contain', 'Start Date');
    this.elements.sortEndDate().should('contain', 'End Date');
    this.elements.actionsHeader().should('contain', 'Actions');
    return this;
  }

  expectCampaignActionsVisible(campaignId) {
    this.campaignActions(campaignId).should('be.visible');
    this.viewCampaignButton(campaignId).should('be.visible');
    this.editCampaignButton(campaignId).should('be.visible');
    this.duplicateCampaignButton(campaignId).should('be.visible');
    this.deleteCampaignButton(campaignId).should('be.visible');
    return this;
  }

  // Page state assertions
  expectToBeOnCampaignsPage() {
    cy.url().should('include', '/campaigns');
    this.waitForLoad();
    return this;
  }

  expectPageTitle() {
    this.elements.campaignsTitle().should('contain', 'Campaigns');
    this.elements.campaignsSubtitle().should('contain', 'Manage and track your brand campaigns');
    return this;
  }

  expectNewCampaignButtonEnabled() {
    this.elements.newCampaignButton().should('not.be.disabled');
    return this;
  }

  expectFiltersButtonVisible() {
    this.elements.filtersButton().should('be.visible');
    return this;
  }

  // Complex workflows
  createNewCampaign() {
    this.clickNewCampaign();
    cy.url().should('include', '/campaigns/wizard/step-1');
    return this;
  }

  openFiltersAndApply(filters = {}) {
    this.clickFilters();

    // Apply filters if provided
    if (filters.search) {
      cy.get('[data-cy="filter-search"]').type(filters.search);
    }
    if (filters.status) {
      cy.get('[data-cy="filter-status"]').select(filters.status);
    }
    if (filters.objective) {
      cy.get('[data-cy="filter-objective"]').select(filters.objective);
    }

    // Apply filters
    cy.get('[data-cy="apply-filters"]').click();
    return this;
  }

  searchCampaigns(searchTerm) {
    this.openFiltersAndApply({ search: searchTerm });
    return this;
  }

  filterByStatus(status) {
    this.openFiltersAndApply({ status });
    return this;
  }

  // Bulk operations
  expectMultipleCampaigns(campaignIds) {
    campaignIds.forEach(id => {
      this.expectCampaignVisible(id);
    });
    return this;
  }

  verifyAllCampaignActions(campaignIds) {
    campaignIds.forEach(id => {
      this.expectCampaignActionsVisible(id);
    });
    return this;
  }

  // Campaign lifecycle workflows
  completeCampaignDuplication(campaignId, newName) {
    this.duplicateCampaign(campaignId);

    // Fill in new campaign name
    cy.get('input[placeholder*="name"], input[type="text"]').clear().type(newName);

    // Confirm duplication
    cy.get('button').contains('Duplicate').click();

    // Wait for success and page refresh
    cy.contains('Campaign duplicated successfully').should('be.visible');
    return this;
  }

  completeCampaignDeletion(campaignId) {
    this.deleteCampaign(campaignId);

    // Confirm deletion
    cy.get('button').contains('Delete', { matchCase: false }).click();

    // Wait for success message
    cy.contains('Campaign deleted successfully').should('be.visible');
    return this;
  }

  // Advanced table interactions
  expectCampaignInPosition(campaignId, position) {
    this.elements
      .tableBody()
      .find('tr')
      .eq(position - 1)
      .should('have.attr', 'data-cy', `campaign-row-${campaignId}`);
    return this;
  }

  expectTableSorted(column, direction = 'ascending') {
    // Verify sorting indicator is present
    this.elements[`sort${column.charAt(0).toUpperCase() + column.slice(1)}`]().should(
      'contain',
      direction === 'ascending' ? '▲' : '▼'
    );
    return this;
  }
}
