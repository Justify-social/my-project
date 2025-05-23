/**
 * Campaign List Page Object Model
 * Encapsulates campaign list page interactions
 */

export class CampaignListPage {
  elements = {
    createButton: () => cy.get('[data-cy="create-campaign-btn"]'),
    campaignList: () => cy.get('[data-cy="campaigns-list"]'),
    campaignItem: campaignName => cy.get(`[data-cy="campaign-item-${campaignName}"]`),
    searchInput: () => cy.get('[data-cy="campaign-search"]'),
    filterButton: () => cy.get('[data-cy="filter-button"]'),
    sortDropdown: () => cy.get('[data-cy="sort-dropdown"]'),
    emptyState: () => cy.get('[data-cy="empty-campaigns"]'),
  };

  visit() {
    cy.visit('/campaigns');
    this.elements.campaignList().should('be.visible');
    return this;
  }

  createNewCampaign() {
    this.elements.createButton().click();
    return this;
  }

  searchForCampaign(searchTerm) {
    this.elements.searchInput().clear().type(searchTerm);
    return this;
  }

  selectCampaign(campaignName) {
    this.elements.campaignItem(campaignName).click();
    return this;
  }

  expectCampaignExists(campaignName) {
    this.elements.campaignItem(campaignName).should('be.visible');
    return this;
  }

  expectEmptyState() {
    this.elements.emptyState().should('be.visible');
    return this;
  }

  expectCampaignCount(count) {
    cy.get('[data-cy^="campaign-item-"]').should('have.length', count);
    return this;
  }
}
