import { BasePage } from '../shared/BasePage.js';

/**
 * Brand Lift Page Object Model
 * Handles the main brand lift dashboard and campaign selection
 *
 * Covers:
 * - Campaign selector and linking functionality
 * - Brand lift studies list and management
 * - Study actions (view, edit, delete, duplicate)
 * - Study creation workflow initiation
 * - Status indicators and filtering
 * - Table interactions and data validation
 */

export class BrandLiftPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/brand-lift/campaign-selection';
    this.pageTitle = 'Brand Lift';
  }

  // Element selectors using data-cy attributes
  elements = {
    // Main page container
    brandLiftContainer: () => this.getByDataCy('brand-lift-container'),
    pageHeader: () => this.getByDataCy('brand-lift-header'),
    pageTitle: () => cy.contains('h1', 'Brand Lift'),

    // Campaign selector section
    campaignSelectorSection: () => this.getByDataCy('campaign-selector-section'),
    campaignSelector: () => this.getByDataCy('campaign-selector'),
    campaignDropdown: () => cy.get('[data-testid="campaign-dropdown"]'),
    campaignOption: campaignName => cy.contains('[role="option"]', campaignName),
    selectedCampaign: () => cy.get('[data-testid="selected-campaign"]'),

    // Studies section
    studiesSection: () => this.getByDataCy('studies-section'),
    studiesHeader: () => cy.contains('h2', 'Recent Brand Lift Studies'),
    studiesTable: () => cy.get('table'),

    // Table headers
    nameHeader: () => cy.contains('th', 'Study Name'),
    dateHeader: () => cy.contains('th', 'Date'),
    statusHeader: () => cy.contains('th', 'Status'),
    kpiHeader: () => cy.contains('th', 'KPI'),
    actionsHeader: () => cy.contains('th', 'Actions'),

    // Table rows and data
    studyRow: studyName => cy.contains('tr', studyName),
    studyNameCell: studyName => this.elements.studyRow(studyName).find('td').first(),
    studyDateCell: studyName => this.elements.studyRow(studyName).find('td').eq(1),
    studyStatusCell: studyName => this.elements.studyRow(studyName).find('td').eq(2),
    studyKpiCell: studyName => this.elements.studyRow(studyName).find('td').eq(3),
    studyActionsCell: studyName => this.elements.studyRow(studyName).find('td').last(),

    // Study actions
    viewStudyButton: studyName =>
      this.elements.studyActionsCell(studyName).find('button').contains('View'),
    editStudyButton: studyName =>
      this.elements.studyActionsCell(studyName).find('button').contains('Edit'),
    duplicateStudyButton: studyName =>
      this.elements.studyActionsCell(studyName).find('button').contains('Duplicate'),
    deleteStudyButton: studyName =>
      this.elements.studyActionsCell(studyName).find('button').contains('Delete'),

    // Status badges
    statusBadge: status => cy.contains('.badge', status),
    draftStatus: () => this.elements.statusBadge('DRAFT'),
    pendingStatus: () => this.elements.statusBadge('PENDING_APPROVAL'),
    approvedStatus: () => this.elements.statusBadge('APPROVED'),
    collectingStatus: () => this.elements.statusBadge('COLLECTING'),
    completedStatus: () => this.elements.statusBadge('COMPLETED'),

    // Empty states
    emptyState: () => cy.contains('No recent brand lift studies found'),
    noStudiesMessage: () => cy.contains('td', 'No recent brand lift studies found'),

    // Error states
    errorAlert: () => cy.get('[role="alert"]'),
    errorTitle: () => cy.get('[role="alert"]').find('h4, h5'),
    errorDescription: () => cy.get('[role="alert"]').find('p'),

    // Modals and dialogs
    deleteModal: () => cy.get('[role="dialog"]').contains('Delete'),
    duplicateModal: () => cy.get('[role="dialog"]').contains('Duplicate'),

    // Delete modal elements
    deleteModalTitle: () => this.elements.deleteModal().find('h2, h3'),
    deleteConfirmButton: () => this.elements.deleteModal().find('button').contains('Delete'),
    deleteCancelButton: () => this.elements.deleteModal().find('button').contains('Cancel'),

    // Duplicate modal elements
    duplicateModalTitle: () => this.elements.duplicateModal().find('h2, h3'),
    duplicateNameInput: () => this.elements.duplicateModal().find('input[type="text"]'),
    duplicateConfirmButton: () =>
      this.elements.duplicateModal().find('button').contains('Duplicate'),
    duplicateCancelButton: () => this.elements.duplicateModal().find('button').contains('Cancel'),

    // Loading states
    loadingSpinner: () => cy.get('.animate-spin'),
    tableLoadingState: () => cy.contains('Loading studies'),

    // Success messages
    successToast: () => cy.get('[data-testid="toast"]').contains('success'),
    deleteSuccessMessage: () => cy.contains('deleted successfully'),
    duplicateSuccessMessage: () => cy.contains('duplicated'),
  };

  // Page navigation actions
  visit() {
    cy.visit(this.pageUrl);
    this.waitForPageLoad();
    return this;
  }

  visitWithCampaignId(campaignId) {
    cy.visit(`${this.pageUrl}?campaignId=${campaignId}`);
    this.waitForPageLoad();
    return this;
  }

  // Campaign selection actions
  selectCampaign(campaignName) {
    this.logAction(`Selecting campaign: ${campaignName}`);

    this.elements.campaignDropdown().click();
    this.elements.campaignOption(campaignName).click();

    // Verify selection
    this.expectCampaignSelected(campaignName);
    return this;
  }

  expectCampaignSelected(campaignName) {
    this.elements.selectedCampaign().should('contain', campaignName);
    return this;
  }

  // Study management actions
  viewStudy(studyName) {
    this.logAction(`Viewing study: ${studyName}`);
    this.elements.viewStudyButton(studyName).click();

    // Should navigate to report page
    cy.url().should('include', '/brand-lift/report/');
    return this;
  }

  editStudy(studyName) {
    this.logAction(`Editing study: ${studyName}`);
    this.elements.editStudyButton(studyName).click();

    // Should navigate to survey design page
    cy.url().should('include', '/brand-lift/survey-design/');
    return this;
  }

  duplicateStudy(studyName, newStudyName) {
    this.logAction(`Duplicating study: ${studyName} as ${newStudyName}`);

    this.elements.duplicateStudyButton(studyName).click();
    this.expectDuplicateModalVisible();

    // Fill in new study name
    this.elements.duplicateNameInput().clear().type(newStudyName);
    this.elements.duplicateConfirmButton().click();

    // Wait for success
    this.expectDuplicateSuccess();
    return this;
  }

  deleteStudy(studyName) {
    this.logAction(`Deleting study: ${studyName}`);

    this.elements.deleteStudyButton(studyName).click();
    this.expectDeleteModalVisible();

    // Confirm deletion
    this.elements.deleteConfirmButton().click();

    // Wait for success and verify removal
    this.expectDeleteSuccess();
    this.expectStudyNotInList(studyName);
    return this;
  }

  // Page state assertions
  expectToBeOnBrandLiftPage() {
    cy.url().should('include', '/brand-lift');
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  expectCampaignSelectorVisible() {
    this.elements.campaignSelector().should('be.visible');
    return this;
  }

  expectStudiesTableVisible() {
    this.elements.studiesTable().should('be.visible');
    return this;
  }

  expectStudiesHeaderVisible() {
    this.elements.studiesHeader().should('be.visible');
    return this;
  }

  // Studies list assertions
  expectStudyInList(studyName) {
    this.elements.studyRow(studyName).should('be.visible');
    return this;
  }

  expectStudyNotInList(studyName) {
    this.elements.studyRow(studyName).should('not.exist');
    return this;
  }

  expectStudyWithStatus(studyName, status) {
    this.elements.studyStatusCell(studyName).should('contain', status);
    return this;
  }

  expectStudyWithKpi(studyName, kpi) {
    this.elements.studyKpiCell(studyName).should('contain', kpi);
    return this;
  }

  expectStudyCount(expectedCount) {
    this.elements.studiesTable().find('tbody tr').should('have.length', expectedCount);
    return this;
  }

  expectEmptyStudiesList() {
    this.elements.emptyState().should('be.visible');
    return this;
  }

  // Modal assertions
  expectDeleteModalVisible() {
    this.elements.deleteModal().should('be.visible');
    this.elements.deleteModalTitle().should('be.visible');
    return this;
  }

  expectDuplicateModalVisible() {
    this.elements.duplicateModal().should('be.visible');
    this.elements.duplicateModalTitle().should('be.visible');
    return this;
  }

  // Success message assertions
  expectDeleteSuccess() {
    this.elements.deleteSuccessMessage().should('be.visible');
    return this;
  }

  expectDuplicateSuccess() {
    this.elements.duplicateSuccessMessage().should('be.visible');
    return this;
  }

  // Error state assertions
  expectErrorState() {
    this.elements.errorAlert().should('be.visible');
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
    this.elements.studiesTable().should('be.visible');
    return this;
  }

  // Wait for page load
  waitForPageLoad() {
    this.elements.pageTitle().should('be.visible', { timeout: this.loadTimeout });
    this.elements.campaignSelector().should('be.visible', { timeout: this.loadTimeout });
    return this;
  }

  // Complex workflows
  createNewBrandLiftStudy(campaignName) {
    this.logAction(`Creating new brand lift study for campaign: ${campaignName}`);

    this.selectCampaign(campaignName);

    // Should navigate to campaign review setup
    cy.url().should('include', '/brand-lift/campaign-review-setup/');
    return this;
  }

  completeStudyManagementWorkflow(studyName) {
    this.logAction('Testing complete study management workflow');

    // Verify study exists
    this.expectStudyInList(studyName);

    // Test duplicate
    const duplicateName = `Copy of ${studyName}`;
    this.duplicateStudy(studyName, duplicateName);
    this.expectStudyInList(duplicateName);

    // Test edit navigation
    this.editStudy(duplicateName);

    // Return to brand lift page for cleanup
    this.visit();

    // Clean up duplicate
    this.deleteStudy(duplicateName);

    return this;
  }

  validateStudiesTableData() {
    this.logAction('Validating studies table data');

    this.expectStudiesTableVisible();

    // Verify table headers
    this.elements.nameHeader().should('be.visible');
    this.elements.dateHeader().should('be.visible');
    this.elements.statusHeader().should('be.visible');
    this.elements.kpiHeader().should('be.visible');
    this.elements.actionsHeader().should('be.visible');

    return this;
  }

  // Status filtering and validation
  validateStudyStatuses() {
    this.logAction('Validating study status badges');

    const statuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'COLLECTING', 'COMPLETED'];

    statuses.forEach(status => {
      cy.get('tbody tr').each($row => {
        cy.wrap($row).within(() => {
          cy.get('td')
            .eq(2)
            .then($statusCell => {
              if ($statusCell.text().includes(status)) {
                this.elements.statusBadge(status).should('be.visible');
              }
            });
        });
      });
    });

    return this;
  }

  // Action button state validation
  validateActionButtonStates(studyName, expectedStates) {
    this.logAction(`Validating action button states for: ${studyName}`);

    if (expectedStates.viewEnabled !== undefined) {
      this.elements
        .viewStudyButton(studyName)
        .should(expectedStates.viewEnabled ? 'not.be.disabled' : 'be.disabled');
    }

    if (expectedStates.editEnabled !== undefined) {
      this.elements
        .editStudyButton(studyName)
        .should(expectedStates.editEnabled ? 'not.be.disabled' : 'be.disabled');
    }

    if (expectedStates.deleteEnabled !== undefined) {
      this.elements
        .deleteStudyButton(studyName)
        .should(expectedStates.deleteEnabled ? 'not.be.disabled' : 'be.disabled');
    }

    if (expectedStates.duplicateEnabled !== undefined) {
      this.elements
        .duplicateStudyButton(studyName)
        .should(expectedStates.duplicateEnabled ? 'not.be.disabled' : 'be.disabled');
    }

    return this;
  }

  // Error handling
  handleBrandLiftErrors() {
    cy.get('body').then($body => {
      if ($body.text().includes('Error') || $body.find('[role="alert"]').length > 0) {
        cy.log('⚠️ Brand lift error detected');
        this.takeScreenshot('brand-lift-error');

        // Try to recover by refreshing
        cy.reload();
        this.waitForPageLoad();
      }
    });
    return this;
  }

  // Performance monitoring
  measureStudyListLoad() {
    return this.measurePageLoadTime({
      actionName: 'brand-lift-studies-list',
      performanceBudget: 3000, // 3 seconds for studies list
    });
  }

  measureStudyAction(actionName, actionFn) {
    return this.measureInteractionTime(actionFn, {
      actionName: `brand-lift-${actionName}`,
      performanceBudget: 2000, // 2 seconds for study actions
    });
  }

  // Responsive design testing
  testMobileBrandLift() {
    cy.viewport('iphone-6');
    this.expectToBeOnBrandLiftPage();
    this.expectStudiesTableVisible();
    cy.viewport(1280, 720); // Reset
    return this;
  }

  // Accessibility testing
  checkBrandLiftAccessibility() {
    cy.checkA11y('[data-cy="brand-lift-container"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
      },
    });
    return this;
  }

  // Data validation
  validateStudyData(studyName, expectedData) {
    this.logAction(`Validating data for study: ${studyName}`);

    if (expectedData.status) {
      this.expectStudyWithStatus(studyName, expectedData.status);
    }

    if (expectedData.kpi) {
      this.expectStudyWithKpi(studyName, expectedData.kpi);
    }

    if (expectedData.date) {
      this.elements.studyDateCell(studyName).should('contain', expectedData.date);
    }

    return this;
  }
}
