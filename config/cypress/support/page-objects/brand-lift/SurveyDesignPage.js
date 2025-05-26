import { BasePage } from '../shared/BasePage.js';

/**
 * Survey Design Page Object Model
 * Handles survey creation and question builder workflow
 *
 * Covers:
 * - Survey question creation and management
 * - AI-powered question suggestions (Draft functionality)
 * - Question types and options configuration
 * - Survey structure and ordering
 * - Survey preview navigation
 * - Question validation and editing
 */

export class SurveyDesignPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/brand-lift/survey-design';
    this.pageTitle = 'Survey Design';
  }

  // Element selectors using data-cy attributes
  elements = {
    // Main page container
    surveyDesignContainer: () => this.getByDataCy('survey-design-container'),
    pageHeader: () => this.getByDataCy('survey-design-header'),
    pageTitle: () => cy.contains('h1', 'Survey Design'),

    // Header actions
    headerActionsContainer: () => this.getByDataCy('header-actions'),
    aiDraftButton: () => cy.contains('button', 'Draft'),
    addQuestionButton: () => cy.contains('button', 'Add Question'),
    proceedToPreviewButton: () => cy.contains('button', 'Proceed to Preview'),

    // AI suggestion state
    aiSpinner: () => cy.get('.animate-spin'),
    aiSuggestionIndicator: () => cy.contains('AI is suggesting'),

    // Campaign/Study info section
    campaignInfoSection: () => this.getByDataCy('campaign-info-section'),
    campaignLink: () => cy.get('a[href*="/campaigns/"]'),
    studyName: () => this.getByDataCy('study-name'),
    funnelStage: () => this.getByDataCy('funnel-stage'),

    // Survey builder container
    surveyBuilder: () => this.getByDataCy('survey-builder'),
    questionsContainer: () => this.getByDataCy('questions-container'),

    // Question items
    questionItem: index => cy.get(`[data-testid="question-${index}"]`),
    questionTitle: index => this.elements.questionItem(index).find('[data-cy="question-title"]'),
    questionType: index => this.elements.questionItem(index).find('[data-cy="question-type"]'),
    questionOptions: index =>
      this.elements.questionItem(index).find('[data-cy="question-options"]'),

    // Question editing
    editQuestionButton: index => this.elements.questionItem(index).find('button').contains('Edit'),
    deleteQuestionButton: index =>
      this.elements.questionItem(index).find('button').contains('Delete'),
    moveUpButton: index => this.elements.questionItem(index).find('button').contains('Move Up'),
    moveDownButton: index => this.elements.questionItem(index).find('button').contains('Move Down'),

    // Question creation modal/form
    questionModal: () => cy.get('[role="dialog"]').contains('Question'),
    questionTitleInput: () => cy.get('input[name*="title"], input[placeholder*="question"]'),
    questionTypeSelect: () => cy.get('select[name*="type"], [data-testid="question-type-select"]'),

    // Question types
    multipleChoiceType: () => cy.contains('Multiple Choice'),
    singleChoiceType: () => cy.contains('Single Choice'),
    ratingScaleType: () => cy.contains('Rating Scale'),
    textInputType: () => cy.contains('Text Input'),
    yesNoType: () => cy.contains('Yes/No'),

    // Question options management
    optionsContainer: () => cy.get('[data-cy="question-options-container"]'),
    optionInput: index => cy.get(`input[name*="option"][data-index="${index}"]`),
    addOptionButton: () => cy.contains('button', 'Add Option'),
    removeOptionButton: index => cy.get(`button[data-remove-option="${index}"]`),

    // Rating scale configuration
    ratingScaleMin: () => cy.get('input[name*="min"], input[placeholder*="minimum"]'),
    ratingScaleMax: () => cy.get('input[name*="max"], input[placeholder*="maximum"]'),
    ratingScaleLabels: () => cy.get('input[name*="label"]'),

    // Modal actions
    saveQuestionButton: () => cy.contains('button', 'Save'),
    cancelQuestionButton: () => cy.contains('button', 'Cancel'),

    // Empty states
    emptyQuestionsState: () => cy.contains('No questions added yet'),
    addFirstQuestionPrompt: () => cy.contains('Add your first question'),

    // Loading states
    loadingSpinner: () => cy.get('[data-testid="loading"], .animate-spin'),
    savingIndicator: () => cy.contains('Saving'),

    // Error states
    errorAlert: () => cy.get('[role="alert"]'),
    validationError: () => cy.get('.text-red-500, .text-destructive'),

    // Success states
    successMessage: () => cy.contains('Question saved'),
    questionAddedMessage: () => cy.contains('Question added'),

    // Navigation confirmation
    unsavedChangesModal: () => cy.get('[role="dialog"]').contains('unsaved changes'),
    confirmLeaveButton: () => cy.contains('button', 'Leave'),
    stayOnPageButton: () => cy.contains('button', 'Stay'),
  };

  // Page navigation actions
  visit(studyId) {
    if (studyId) {
      cy.visit(`${this.pageUrl}/${studyId}`);
    } else {
      cy.visit(this.pageUrl);
    }
    this.waitForPageLoad();
    return this;
  }

  // AI-powered question suggestions
  generateAISuggestions() {
    this.logAction('Generating AI question suggestions');

    this.elements.aiDraftButton().click();
    this.expectAISuggestionInProgress();

    // Wait for suggestions to complete
    this.expectAISuggestionComplete();
    return this;
  }

  expectAISuggestionInProgress() {
    this.elements.aiSuggestionIndicator().should('be.visible');
    this.elements.aiSpinner().should('be.visible');
    this.elements.aiDraftButton().should('be.disabled');
    return this;
  }

  expectAISuggestionComplete() {
    this.elements.aiSuggestionIndicator().should('not.exist');
    this.elements.aiSpinner().should('not.exist');
    this.elements.aiDraftButton().should('not.be.disabled');
    return this;
  }

  // Question management actions
  addNewQuestion() {
    this.logAction('Adding new question');

    this.elements.addQuestionButton().click();
    this.expectQuestionModalVisible();
    return this;
  }

  createMultipleChoiceQuestion(title, options) {
    this.logAction(`Creating multiple choice question: ${title}`);

    this.addNewQuestion();
    this.fillQuestionDetails(title, 'Multiple Choice');
    this.addQuestionOptions(options);
    this.saveQuestion();

    return this;
  }

  createRatingScaleQuestion(title, min, max, labels = {}) {
    this.logAction(`Creating rating scale question: ${title}`);

    this.addNewQuestion();
    this.fillQuestionDetails(title, 'Rating Scale');
    this.configureRatingScale(min, max, labels);
    this.saveQuestion();

    return this;
  }

  createYesNoQuestion(title) {
    this.logAction(`Creating yes/no question: ${title}`);

    this.addNewQuestion();
    this.fillQuestionDetails(title, 'Yes/No');
    this.saveQuestion();

    return this;
  }

  fillQuestionDetails(title, type) {
    this.elements.questionTitleInput().clear().type(title);

    if (type) {
      this.elements.questionTypeSelect().click();
      cy.contains('[role="option"]', type).click();
    }

    return this;
  }

  addQuestionOptions(options) {
    options.forEach((option, index) => {
      if (index > 0) {
        this.elements.addOptionButton().click();
      }
      this.elements.optionInput(index).type(option);
    });
    return this;
  }

  configureRatingScale(min, max, labels) {
    this.elements.ratingScaleMin().clear().type(min.toString());
    this.elements.ratingScaleMax().clear().type(max.toString());

    if (labels.min) {
      this.elements.ratingScaleLabels().first().clear().type(labels.min);
    }
    if (labels.max) {
      this.elements.ratingScaleLabels().last().clear().type(labels.max);
    }

    return this;
  }

  saveQuestion() {
    this.elements.saveQuestionButton().click();
    this.expectQuestionSaved();
    return this;
  }

  cancelQuestionCreation() {
    this.elements.cancelQuestionButton().click();
    this.expectQuestionModalNotVisible();
    return this;
  }

  // Question editing actions
  editQuestion(questionIndex) {
    this.logAction(`Editing question at index: ${questionIndex}`);

    this.elements.editQuestionButton(questionIndex).click();
    this.expectQuestionModalVisible();
    return this;
  }

  deleteQuestion(questionIndex) {
    this.logAction(`Deleting question at index: ${questionIndex}`);

    this.elements.deleteQuestionButton(questionIndex).click();

    // Confirm deletion if modal appears
    cy.get('body').then($body => {
      if ($body.find('[role="dialog"]').length > 0) {
        cy.contains('button', 'Delete').click();
      }
    });

    return this;
  }

  moveQuestionUp(questionIndex) {
    this.logAction(`Moving question ${questionIndex} up`);
    this.elements.moveUpButton(questionIndex).click();
    return this;
  }

  moveQuestionDown(questionIndex) {
    this.logAction(`Moving question ${questionIndex} down`);
    this.elements.moveDownButton(questionIndex).click();
    return this;
  }

  // Navigation actions
  proceedToPreview() {
    this.logAction('Proceeding to survey preview');

    this.elements.proceedToPreviewButton().click();

    // Should navigate to preview page
    cy.url().should('include', '/brand-lift/survey-preview/');
    return this;
  }

  // Page state assertions
  expectToBeOnSurveyDesignPage() {
    cy.url().should('include', '/brand-lift/survey-design');
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  expectSurveyBuilderVisible() {
    this.elements.surveyBuilder().should('be.visible');
    return this;
  }

  expectQuestionModalVisible() {
    this.elements.questionModal().should('be.visible');
    this.elements.questionTitleInput().should('be.visible');
    return this;
  }

  expectQuestionModalNotVisible() {
    this.elements.questionModal().should('not.exist');
    return this;
  }

  // Question assertions
  expectQuestionCount(expectedCount) {
    if (expectedCount === 0) {
      this.expectEmptyQuestionsState();
    } else {
      this.elements
        .questionsContainer()
        .find('[data-testid^="question-"]')
        .should('have.length', expectedCount);
    }
    return this;
  }

  expectQuestionAtIndex(index, expectedTitle) {
    this.elements.questionTitle(index).should('contain', expectedTitle);
    return this;
  }

  expectQuestionType(index, expectedType) {
    this.elements.questionType(index).should('contain', expectedType);
    return this;
  }

  expectEmptyQuestionsState() {
    this.elements.emptyQuestionsState().should('be.visible');
    return this;
  }

  expectQuestionSaved() {
    this.elements.successMessage().should('be.visible');
    this.expectQuestionModalNotVisible();
    return this;
  }

  // Action button states
  expectHeaderActionsVisible() {
    this.elements.aiDraftButton().should('be.visible');
    this.elements.addQuestionButton().should('be.visible');
    this.elements.proceedToPreviewButton().should('be.visible');
    return this;
  }

  expectProceedButtonEnabled() {
    this.elements.proceedToPreviewButton().should('not.be.disabled');
    return this;
  }

  expectProceedButtonDisabled() {
    this.elements.proceedToPreviewButton().should('be.disabled');
    return this;
  }

  // Validation assertions
  expectValidationError(message) {
    this.elements.validationError().should('contain', message);
    return this;
  }

  expectNoValidationErrors() {
    this.elements.validationError().should('not.exist');
    return this;
  }

  // Loading states
  expectLoadingState() {
    this.elements.loadingSpinner().should('be.visible');
    return this;
  }

  expectContentLoaded() {
    this.elements.loadingSpinner().should('not.exist');
    this.elements.surveyBuilder().should('be.visible');
    return this;
  }

  // Wait for page load
  waitForPageLoad() {
    this.elements.pageTitle().should('be.visible', { timeout: this.loadTimeout });
    this.elements.surveyBuilder().should('be.visible', { timeout: this.loadTimeout });
    return this;
  }

  // Complex workflows
  createCompleteSurvey(surveyData) {
    this.logAction('Creating complete survey with multiple questions');

    surveyData.questions.forEach((question, index) => {
      switch (question.type) {
        case 'multiple-choice':
          this.createMultipleChoiceQuestion(question.title, question.options);
          break;
        case 'rating-scale':
          this.createRatingScaleQuestion(
            question.title,
            question.min,
            question.max,
            question.labels
          );
          break;
        case 'yes-no':
          this.createYesNoQuestion(question.title);
          break;
        default:
          this.logAction(`Unknown question type: ${question.type}`);
      }
    });

    this.expectQuestionCount(surveyData.questions.length);
    return this;
  }

  testQuestionReordering() {
    this.logAction('Testing question reordering functionality');

    // Verify we have at least 2 questions
    cy.get('[data-testid^="question-"]').should('have.length.at.least', 2);

    // Get first question title
    let firstQuestionTitle;
    this.elements.questionTitle(0).then($title => {
      firstQuestionTitle = $title.text();

      // Move first question down
      this.moveQuestionDown(0);

      // Verify it's no longer first
      this.elements.questionTitle(0).should('not.contain', firstQuestionTitle);
      this.elements.questionTitle(1).should('contain', firstQuestionTitle);
    });

    return this;
  }

  validateSurveyStructure() {
    this.logAction('Validating survey structure and navigation');

    this.expectSurveyBuilderVisible();
    this.expectHeaderActionsVisible();

    // Check if proceed button is enabled (depends on having questions)
    cy.get('[data-testid^="question-"]').then($questions => {
      if ($questions.length > 0) {
        this.expectProceedButtonEnabled();
      } else {
        this.expectProceedButtonDisabled();
      }
    });

    return this;
  }

  // AI suggestions workflow
  testAISuggestionsWorkflow() {
    this.logAction('Testing AI suggestions workflow');

    const originalQuestionCount = cy.get('[data-testid^="question-"]').its('length');

    this.generateAISuggestions();

    // Should have questions after AI suggestions
    cy.get('[data-testid^="question-"]').should('have.length.greaterThan', 0);

    return this;
  }

  // Error handling
  handleSurveyDesignErrors() {
    cy.get('body').then($body => {
      if ($body.text().includes('Error') || $body.find('[role="alert"]').length > 0) {
        cy.log('⚠️ Survey design error detected');
        this.takeScreenshot('survey-design-error');

        // Try to recover
        if ($body.find('[role="dialog"]').length > 0) {
          this.cancelQuestionCreation();
        }
      }
    });
    return this;
  }

  // Performance monitoring
  measureQuestionCreation() {
    return this.measureInteractionTime(
      () => {
        this.createYesNoQuestion('Test Performance Question');
      },
      {
        actionName: 'survey-question-creation',
        performanceBudget: 2000, // 2 seconds for question creation
      }
    );
  }

  measureAISuggestions() {
    return this.measureInteractionTime(
      () => {
        this.generateAISuggestions();
      },
      {
        actionName: 'ai-question-suggestions',
        performanceBudget: 10000, // 10 seconds for AI processing
      }
    );
  }

  // Responsive design testing
  testMobileSurveyDesign() {
    cy.viewport('iphone-6');
    this.expectSurveyBuilderVisible();
    this.expectHeaderActionsVisible();
    cy.viewport(1280, 720); // Reset
    return this;
  }

  // Accessibility testing
  checkSurveyDesignAccessibility() {
    cy.checkA11y('[data-cy="survey-design-container"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
      },
    });
    return this;
  }

  // Form validation testing
  testQuestionValidation() {
    this.logAction('Testing question validation');

    // Try to save empty question
    this.addNewQuestion();
    this.saveQuestion();
    this.expectValidationError('Question title is required');

    // Fill title and try again
    this.fillQuestionDetails('Valid Question', 'Yes/No');
    this.saveQuestion();
    this.expectNoValidationErrors();

    return this;
  }

  // Navigation safety
  testUnsavedChangesWarning() {
    this.logAction('Testing unsaved changes warning');

    // Make changes
    this.addNewQuestion();
    this.fillQuestionDetails('Unsaved Question', 'Yes/No');

    // Try to navigate away
    cy.visit('/dashboard');

    // Should show unsaved changes modal
    this.elements.unsavedChangesModal().should('be.visible');
    this.elements.stayOnPageButton().click();

    // Should stay on survey design page
    this.expectToBeOnSurveyDesignPage();

    return this;
  }
}
