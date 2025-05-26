import { BasePage } from '../shared/BasePage.js';

/**
 * Campaign Selection/Review Setup Page Object Model
 * Handles campaign linking and brand lift study setup workflow
 *
 * Covers:
 * - Campaign review and data validation
 * - Study configuration and naming
 * - KPI selection and funnel stage setup
 * - Campaign data review sections
 * - Study creation and progression to survey design
 * - Form validation and submission
 */

export class CampaignSelectionPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/brand-lift/campaign-review-setup';
    this.pageTitle = 'Campaign Review & Study Setup';
  }

  // Element selectors using data-cy attributes
  elements = {
    // Main page container
    campaignReviewContainer: () => this.getByDataCy('campaign-review-container'),
    pageHeader: () => this.getByDataCy('campaign-review-header'),
    pageTitle: () => cy.contains('h1', 'Campaign Review'),

    // Campaign information section
    campaignInfoCard: () => this.getByDataCy('campaign-info-card'),
    campaignName: () => this.getByDataCy('campaign-name'),
    campaignPlatform: () => this.getByDataCy('campaign-platform'),
    campaignKPI: () => this.getByDataCy('campaign-kpi'),
    campaignAudience: () => this.getByDataCy('campaign-audience'),

    // Campaign data review sections
    step1Section: () => this.getByDataCy('step1-review'),
    step2Section: () => this.getByDataCy('step2-review'),
    step3Section: () => this.getByDataCy('step3-review'),
    step4Section: () => this.getByDataCy('step4-review'),

    // Step 1: Brand & Product
    brandName: () => this.getByDataCy('brand-name'),
    productName: () => this.getByDataCy('product-name'),
    brandDescription: () => this.getByDataCy('brand-description'),

    // Step 2: Objectives & Hypotheses
    primaryObjective: () => this.getByDataCy('primary-objective'),
    memorabilityHypothesis: () => this.getByDataCy('memorability-hypothesis'),
    purchaseIntentHypothesis: () => this.getByDataCy('purchase-intent-hypothesis'),
    brandPerceptionHypothesis: () => this.getByDataCy('brand-perception-hypothesis'),

    // Step 3: Targeting
    targetGenders: () => this.getByDataCy('target-genders'),
    targetLanguages: () => this.getByDataCy('target-languages'),
    ageDistribution: () => this.getByDataCy('age-distribution'),
    targetInterests: () => this.getByDataCy('target-interests'),
    targetKeywords: () => this.getByDataCy('target-keywords'),
    targetLocations: () => this.getByDataCy('target-locations'),

    // Step 4: Assets & Budget
    campaignAssets: () => this.getByDataCy('campaign-assets'),
    assetList: () => this.getByDataCy('asset-list'),
    assetItem: index => cy.get(`[data-testid="asset-${index}"]`),
    totalBudget: () => this.getByDataCy('total-budget'),

    // Edit section buttons
    editStep1Button: () => cy.contains('button', 'Edit Brand & Product'),
    editStep2Button: () => cy.contains('button', 'Edit Objectives'),
    editStep3Button: () => cy.contains('button', 'Edit Targeting'),
    editStep4Button: () => cy.contains('button', 'Edit Assets'),

    // Study setup form
    studySetupForm: () => this.getByDataCy('study-setup-form'),
    studyNameInput: () => cy.get('input[name="studyName"]'),
    studyNameLabel: () => cy.contains('label', 'Study Name'),

    // KPI configuration
    kpiSection: () => this.getByDataCy('kpi-section'),
    primaryKpiDisplay: () => this.getByDataCy('primary-kpi'),
    secondaryKpisDisplay: () => this.getByDataCy('secondary-kpis'),
    funnelStageDisplay: () => this.getByDataCy('funnel-stage'),

    // KPI details
    kpiTooltip: kpiName => cy.get(`[data-tooltip="${kpiName}"]`),
    kpiDescription: kpiName => cy.contains(kpiName).parent().find('.description'),

    // Form validation
    validationError: () => cy.get('.text-red-500, .text-destructive'),
    studyNameError: () => cy.get('[data-testid="study-name-error"]'),
    formError: () => this.getByDataCy('form-error'),

    // Action buttons
    createStudyButton: () => cy.contains('button', 'Create Brand Lift Study'),
    backButton: () => cy.contains('button', 'Back'),
    cancelButton: () => cy.contains('button', 'Cancel'),

    // Loading states
    loadingSpinner: () => cy.get('.animate-spin'),
    formLoadingState: () => cy.get('[data-testid="form-loading"]'),
    submitLoadingState: () => cy.get('[data-testid="submit-loading"]'),

    // Error states
    errorAlert: () => cy.get('[role="alert"]'),
    fetchError: () => this.getByDataCy('fetch-error'),
    submitError: () => this.getByDataCy('submit-error'),

    // Success states
    successMessage: () => cy.contains('Study created successfully'),

    // Data items
    dataItem: label => cy.contains('dt', label).next('dd'),
    dataLabel: label => cy.contains('dt', label),

    // Missing data indicators
    missingDataIndicator: () => cy.contains('N/A'),
    incompleteSection: () => cy.contains('Incomplete'),

    // Confirmation modals
    confirmationModal: () => cy.get('[role="dialog"]'),
    confirmCreateButton: () => cy.contains('button', 'Confirm'),
    modalCancelButton: () => cy.contains('button', 'Cancel'),
  };

  // Page navigation actions
  visit(campaignId) {
    if (campaignId) {
      cy.visit(`${this.pageUrl}/${campaignId}`);
    } else {
      cy.visit(this.pageUrl);
    }
    this.waitForPageLoad();
    return this;
  }

  // Campaign data editing actions
  editBrandAndProduct() {
    this.logAction('Editing brand and product section');
    this.elements.editStep1Button().click();

    // Should navigate to campaign wizard step 1
    cy.url().should('include', '/campaigns/wizard/step-1');
    return this;
  }

  editObjectives() {
    this.logAction('Editing objectives section');
    this.elements.editStep2Button().click();

    // Should navigate to campaign wizard step 2
    cy.url().should('include', '/campaigns/wizard/step-2');
    return this;
  }

  editTargeting() {
    this.logAction('Editing targeting section');
    this.elements.editStep3Button().click();

    // Should navigate to campaign wizard step 3
    cy.url().should('include', '/campaigns/wizard/step-3');
    return this;
  }

  editAssets() {
    this.logAction('Editing assets section');
    this.elements.editStep4Button().click();

    // Should navigate to campaign wizard step 4
    cy.url().should('include', '/campaigns/wizard/step-4');
    return this;
  }

  // Study setup actions
  setStudyName(studyName) {
    this.logAction(`Setting study name: ${studyName}`);
    this.elements.studyNameInput().clear().type(studyName);
    return this;
  }

  clearStudyName() {
    this.elements.studyNameInput().clear();
    return this;
  }

  createBrandLiftStudy() {
    this.logAction('Creating brand lift study');

    this.elements.createStudyButton().click();
    this.expectStudyCreationInProgress();
    this.expectStudyCreationSuccess();

    return this;
  }

  createStudyWithConfirmation() {
    this.logAction('Creating study with confirmation modal');

    this.elements.createStudyButton().click();
    this.expectConfirmationModal();
    this.confirmStudyCreation();

    return this;
  }

  confirmStudyCreation() {
    this.elements.confirmCreateButton().click();
    this.expectStudyCreationInProgress();
    this.expectStudyCreationSuccess();
    return this;
  }

  cancelStudyCreation() {
    this.elements.modalCancelButton().click();
    this.expectConfirmationModalClosed();
    return this;
  }

  // Navigation actions
  goBack() {
    this.elements.backButton().click();
    return this;
  }

  cancel() {
    this.elements.cancelButton().click();
    return this;
  }

  // Page state assertions
  expectToBeOnCampaignReviewPage() {
    cy.url().should('include', '/brand-lift/campaign-review-setup');
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  expectCampaignInfoVisible() {
    this.elements.campaignInfoCard().should('be.visible');
    this.elements.campaignName().should('be.visible');
    return this;
  }

  expectStudySetupFormVisible() {
    this.elements.studySetupForm().should('be.visible');
    this.elements.studyNameInput().should('be.visible');
    return this;
  }

  // Campaign data assertions
  expectCampaignName(expectedName) {
    this.elements.campaignName().should('contain', expectedName);
    return this;
  }

  expectCampaignPlatform(expectedPlatform) {
    this.elements.campaignPlatform().should('contain', expectedPlatform);
    return this;
  }

  expectPrimaryKPI(expectedKPI) {
    this.elements.primaryKpiDisplay().should('contain', expectedKPI);
    return this;
  }

  expectFunnelStage(expectedStage) {
    this.elements.funnelStageDisplay().should('contain', expectedStage);
    return this;
  }

  // Step data validation
  expectStep1Data(brandData) {
    if (brandData.brandName) {
      this.elements.brandName().should('contain', brandData.brandName);
    }
    if (brandData.productName) {
      this.elements.productName().should('contain', brandData.productName);
    }
    if (brandData.description) {
      this.elements.brandDescription().should('contain', brandData.description);
    }
    return this;
  }

  expectStep2Data(objectivesData) {
    if (objectivesData.primaryObjective) {
      this.elements.primaryObjective().should('contain', objectivesData.primaryObjective);
    }
    if (objectivesData.memorability) {
      this.elements.memorabilityHypothesis().should('contain', objectivesData.memorability);
    }
    if (objectivesData.purchaseIntent) {
      this.elements.purchaseIntentHypothesis().should('contain', objectivesData.purchaseIntent);
    }
    return this;
  }

  expectStep3Data(targetingData) {
    if (targetingData.genders) {
      this.elements.targetGenders().should('contain', targetingData.genders.join(', '));
    }
    if (targetingData.languages) {
      this.elements.targetLanguages().should('contain', targetingData.languages.join(', '));
    }
    if (targetingData.interests) {
      this.elements.targetInterests().should('contain', targetingData.interests.join(', '));
    }
    return this;
  }

  expectStep4Data(assetsData) {
    if (assetsData.assetCount) {
      this.elements
        .assetList()
        .find('[data-testid^="asset-"]')
        .should('have.length', assetsData.assetCount);
    }
    if (assetsData.totalBudget) {
      this.elements.totalBudget().should('contain', assetsData.totalBudget);
    }
    return this;
  }

  // Form validation assertions
  expectStudyNameError(message) {
    this.elements.studyNameError().should('contain', message);
    return this;
  }

  expectFormError(message) {
    this.elements.formError().should('contain', message);
    return this;
  }

  expectNoValidationErrors() {
    this.elements.validationError().should('not.exist');
    return this;
  }

  // Button state assertions
  expectCreateButtonEnabled() {
    this.elements.createStudyButton().should('not.be.disabled');
    return this;
  }

  expectCreateButtonDisabled() {
    this.elements.createStudyButton().should('be.disabled');
    return this;
  }

  expectEditButtonsVisible() {
    this.elements.editStep1Button().should('be.visible');
    this.elements.editStep2Button().should('be.visible');
    this.elements.editStep3Button().should('be.visible');
    this.elements.editStep4Button().should('be.visible');
    return this;
  }

  // Loading state assertions
  expectLoadingState() {
    this.elements.loadingSpinner().should('be.visible');
    return this;
  }

  expectFormLoadingState() {
    this.elements.formLoadingState().should('be.visible');
    return this;
  }

  expectStudyCreationInProgress() {
    this.elements.submitLoadingState().should('be.visible');
    this.elements.createStudyButton().should('be.disabled');
    return this;
  }

  expectContentLoaded() {
    this.elements.loadingSpinner().should('not.exist');
    this.elements.campaignInfoCard().should('be.visible');
    return this;
  }

  // Success/Error state assertions
  expectStudyCreationSuccess() {
    // Should navigate to survey design page
    cy.url().should('include', '/brand-lift/survey-design/', { timeout: 10000 });
    return this;
  }

  expectFetchError() {
    this.elements.fetchError().should('be.visible');
    return this;
  }

  expectSubmitError(message) {
    this.elements.submitError().should('contain', message);
    return this;
  }

  // Modal assertions
  expectConfirmationModal() {
    this.elements.confirmationModal().should('be.visible');
    this.elements.confirmCreateButton().should('be.visible');
    return this;
  }

  expectConfirmationModalClosed() {
    this.elements.confirmationModal().should('not.exist');
    return this;
  }

  // Data completeness validation
  expectCompleteDataSections() {
    this.elements.step1Section().should('not.contain', 'Incomplete');
    this.elements.step2Section().should('not.contain', 'Incomplete');
    this.elements.step3Section().should('not.contain', 'Incomplete');
    this.elements.step4Section().should('not.contain', 'Incomplete');
    return this;
  }

  expectMissingData(sectionName) {
    cy.contains(sectionName).parent().should('contain', 'N/A');
    return this;
  }

  // Wait for page load
  waitForPageLoad() {
    this.elements.pageTitle().should('be.visible', { timeout: this.loadTimeout });
    this.elements.campaignInfoCard().should('be.visible', { timeout: this.loadTimeout });
    return this;
  }

  // Complex workflows
  reviewCompleteStudySetup(studyData) {
    this.logAction('Reviewing complete study setup');

    // Validate campaign information
    this.expectCampaignInfoVisible();

    // Validate all steps data
    if (studyData.brandData) {
      this.expectStep1Data(studyData.brandData);
    }
    if (studyData.objectivesData) {
      this.expectStep2Data(studyData.objectivesData);
    }
    if (studyData.targetingData) {
      this.expectStep3Data(studyData.targetingData);
    }
    if (studyData.assetsData) {
      this.expectStep4Data(studyData.assetsData);
    }

    // Set up study
    this.setStudyName(studyData.studyName);
    this.createBrandLiftStudy();

    return this;
  }

  validateCampaignDataIntegrity() {
    this.logAction('Validating campaign data integrity');

    // Check that all required sections are present
    this.elements.step1Section().should('be.visible');
    this.elements.step2Section().should('be.visible');
    this.elements.step3Section().should('be.visible');
    this.elements.step4Section().should('be.visible');

    // Verify KPI configuration
    this.elements.kpiSection().should('be.visible');
    this.elements.primaryKpiDisplay().should('not.contain', 'N/A');

    return this;
  }

  testCampaignEditingWorkflow() {
    this.logAction('Testing campaign editing workflow');

    const currentUrl = cy.url();

    // Test editing each section
    this.editBrandAndProduct();
    cy.go('back');
    this.expectToBeOnCampaignReviewPage();

    this.editObjectives();
    cy.go('back');
    this.expectToBeOnCampaignReviewPage();

    this.editTargeting();
    cy.go('back');
    this.expectToBeOnCampaignReviewPage();

    this.editAssets();
    cy.go('back');
    this.expectToBeOnCampaignReviewPage();

    return this;
  }

  // Form validation testing
  testStudyNameValidation() {
    this.logAction('Testing study name validation');

    // Test empty name
    this.clearStudyName();
    this.elements.createStudyButton().click();
    this.expectStudyNameError('Study name must be at least 3 characters');

    // Test short name
    this.setStudyName('AB');
    this.elements.createStudyButton().click();
    this.expectStudyNameError('Study name must be at least 3 characters');

    // Test valid name
    this.setStudyName('Valid Study Name');
    this.expectNoValidationErrors();
    this.expectCreateButtonEnabled();

    return this;
  }

  // KPI tooltip testing
  testKPITooltips() {
    this.logAction('Testing KPI tooltips and descriptions');

    const kpis = ['Brand Awareness', 'Ad Recall', 'Consideration', 'Purchase Intent'];

    kpis.forEach(kpi => {
      cy.get('body').then($body => {
        if ($body.text().includes(kpi)) {
          this.elements.kpiTooltip(kpi).trigger('mouseover');
          this.elements.kpiDescription(kpi).should('be.visible');
        }
      });
    });

    return this;
  }

  // Error handling
  handleCampaignReviewErrors() {
    cy.get('body').then($body => {
      if ($body.text().includes('Error') || $body.find('[role="alert"]').length > 0) {
        cy.log('⚠️ Campaign review error detected');
        this.takeScreenshot('campaign-review-error');

        // Try to reload the page
        cy.reload();
        this.waitForPageLoad();
      }
    });
    return this;
  }

  // Performance monitoring
  measureStudyCreation() {
    return this.measureInteractionTime(
      () => {
        this.createBrandLiftStudy();
      },
      {
        actionName: 'brand-lift-study-creation',
        performanceBudget: 5000, // 5 seconds for study creation
      }
    );
  }

  measurePageLoad() {
    return this.measurePageLoadTime({
      actionName: 'campaign-review-page-load',
      performanceBudget: 3000, // 3 seconds for page load
    });
  }

  // Responsive design testing
  testMobileCampaignReview() {
    cy.viewport('iphone-6');
    this.expectCampaignInfoVisible();
    this.expectStudySetupFormVisible();
    cy.viewport(1280, 720); // Reset
    return this;
  }

  // Accessibility testing
  checkCampaignReviewAccessibility() {
    cy.checkA11y('[data-cy="campaign-review-container"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
      },
    });
    return this;
  }

  // Data validation
  validateCampaignData(expectedData) {
    this.logAction('Validating campaign data');

    if (expectedData.campaignName) {
      this.expectCampaignName(expectedData.campaignName);
    }

    if (expectedData.platform) {
      this.expectCampaignPlatform(expectedData.platform);
    }

    if (expectedData.primaryKPI) {
      this.expectPrimaryKPI(expectedData.primaryKPI);
    }

    if (expectedData.funnelStage) {
      this.expectFunnelStage(expectedData.funnelStage);
    }

    return this;
  }
}
