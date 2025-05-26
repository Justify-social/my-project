import { BasePage } from '../shared/BasePage.js';

/**
 * Approval Page Object Model
 * Handles brand lift study approval workflow and management
 *
 * Covers:
 * - Survey approval workflow with status management
 * - Comment threads and feedback system
 * - Question review and approval process
 * - Approval status transitions and sign-off
 * - Stakeholder collaboration and notifications
 * - Study submission for data collection
 */

export class ApprovalPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/brand-lift/approval';
    this.pageTitle = 'Survey Approval';
  }

  // Element selectors using data-cy attributes
  elements = {
    // Main page container
    approvalContainer: () => this.getByDataCy('approval-container'),
    pageHeader: () => this.getByDataCy('approval-header'),
    pageTitle: () => cy.contains('h1', 'Survey Approval'),

    // Study information
    studyInfoCard: () => this.getByDataCy('study-info-card'),
    studyName: () => this.getByDataCy('study-name'),
    studyStatus: () => this.getByDataCy('study-status'),
    approvalStatus: () => this.getByDataCy('approval-status'),

    // Questions review section
    questionsSection: () => this.getByDataCy('questions-section'),
    questionsHeader: () => cy.contains('h4', 'Questions & Options'),
    questionsContainer: () => cy.get('[data-testid="questions-container"]'),
    questionItem: index => cy.get(`[data-testid="question-${index}"]`),
    questionText: index => this.elements.questionItem(index).find('[data-cy="question-text"]'),
    questionType: index => this.elements.questionItem(index).find('[data-cy="question-type"]'),
    questionOptions: index =>
      this.elements.questionItem(index).find('[data-cy="question-options"]'),

    // Empty questions state
    noQuestionsMessage: () => cy.contains('No questions in this survey'),

    // Comments section
    commentsSection: () => this.getByDataCy('comments-section'),
    commentsHeader: () => cy.contains('Review Comments'),
    commentThread: () => this.getByDataCy('comment-thread'),
    commentItem: index => cy.get(`[data-testid="comment-${index}"]`),
    commentText: index => this.elements.commentItem(index).find('[data-cy="comment-text"]'),
    commentAuthor: index => this.elements.commentItem(index).find('[data-cy="comment-author"]'),
    commentTimestamp: index =>
      this.elements.commentItem(index).find('[data-cy="comment-timestamp"]'),
    commentStatus: index => this.elements.commentItem(index).find('[data-cy="comment-status"]'),

    // Comment creation
    addCommentButton: () => cy.contains('button', 'Add Comment'),
    commentInput: () => cy.get('textarea[placeholder*="comment"]'),
    commentTypeSelect: () => cy.get('select[name*="type"]'),
    submitCommentButton: () => cy.contains('button', 'Submit Comment'),
    cancelCommentButton: () => cy.contains('button', 'Cancel'),

    // Comment types
    generalCommentType: () => cy.contains('General Feedback'),
    issueCommentType: () => cy.contains('Issue/Concern'),
    approvalCommentType: () => cy.contains('Approval Note'),

    // Approval actions section
    approvalActionsCard: () => this.getByDataCy('approval-actions-card'),
    approvalActionsHeader: () => cy.contains('Approval Actions'),

    // Status buttons
    approveButton: () => cy.contains('button', 'Approve'),
    requestChangesButton: () => cy.contains('button', 'Request Changes'),
    requestSignOffButton: () => cy.contains('button', 'Request Sign-off'),
    signOffButton: () => cy.contains('button', 'Sign Off'),
    submitForCollectionButton: () => cy.contains('button', 'Submit for Data Collection'),

    // Status indicators
    statusBadge: status => cy.contains('.badge', status),
    pendingReviewStatus: () => this.elements.statusBadge('PENDING_REVIEW'),
    changesRequestedStatus: () => this.elements.statusBadge('CHANGES_REQUESTED'),
    approvedStatus: () => this.elements.statusBadge('APPROVED'),
    signedOffStatus: () => this.elements.statusBadge('SIGNED_OFF'),

    // Sign-off section
    signOffSection: () => this.getByDataCy('sign-off-section'),
    signOffDetails: () => this.getByDataCy('sign-off-details'),
    signedOffBy: () => this.getByDataCy('signed-off-by'),
    signedOffAt: () => this.getByDataCy('signed-off-at'),

    // Loading states
    loadingSpinner: () => cy.get('.animate-spin'),
    approvalLoadingState: () => cy.get('[data-testid="approval-loading"]'),
    actionsLoadingState: () => cy.get('[data-testid="actions-loading"]'),

    // Error states
    errorAlert: () => cy.get('[role="alert"]'),
    approvalError: () => this.getByDataCy('approval-error'),
    commentError: () => this.getByDataCy('comment-error'),

    // Success states
    successMessage: () => cy.contains('successfully'),
    approvalSuccessMessage: () => cy.contains('Status updated successfully'),
    commentSuccessMessage: () => cy.contains('Comment added successfully'),

    // Confirmation modals
    confirmationModal: () => cy.get('[role="dialog"]'),
    confirmApprovalModal: () => cy.get('[role="dialog"]').contains('Approve'),
    confirmChangesModal: () => cy.get('[role="dialog"]').contains('Request Changes'),
    confirmSignOffModal: () => cy.get('[role="dialog"]').contains('Sign Off'),
    confirmSubmissionModal: () => cy.get('[role="dialog"]').contains('Submit for Collection'),

    // Modal actions
    confirmButton: () => cy.contains('button', 'Confirm'),
    modalCancelButton: () => cy.contains('button', 'Cancel'),

    // Permissions and access
    accessDeniedMessage: () => cy.contains('Access Denied'),
    insufficientPermissionsMessage: () => cy.contains('Insufficient permissions'),

    // Workflow status messages
    workflowStatusMessage: () => this.getByDataCy('workflow-status-message'),
    nextStepsMessage: () => this.getByDataCy('next-steps-message'),

    // Stakeholder information
    stakeholdersSection: () => this.getByDataCy('stakeholders-section'),
    approversList: () => this.getByDataCy('approvers-list'),
    reviewersList: () => this.getByDataCy('reviewers-list'),
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

  // Approval actions
  approveStudy() {
    this.logAction('Approving study');

    this.elements.approveButton().click();
    this.expectConfirmApprovalModal();
    this.confirmApprovalAction();
    this.expectApprovalSuccess();

    return this;
  }

  requestChanges() {
    this.logAction('Requesting changes to study');

    this.elements.requestChangesButton().click();
    this.expectConfirmChangesModal();
    this.confirmChangesAction();
    this.expectChangesRequestSuccess();

    return this;
  }

  requestSignOff() {
    this.logAction('Requesting sign-off');

    this.elements.requestSignOffButton().click();
    this.expectConfirmSignOffModal();
    this.confirmSignOffRequest();
    this.expectSignOffRequestSuccess();

    return this;
  }

  signOffStudy() {
    this.logAction('Signing off study');

    this.elements.signOffButton().click();
    this.expectConfirmSignOffModal();
    this.confirmSignOffAction();
    this.expectSignOffSuccess();

    return this;
  }

  submitForDataCollection() {
    this.logAction('Submitting study for data collection');

    this.elements.submitForCollectionButton().click();
    this.expectConfirmSubmissionModal();
    this.confirmSubmissionAction();
    this.expectSubmissionSuccess();

    return this;
  }

  // Modal confirmation actions
  confirmApprovalAction() {
    this.elements.confirmButton().click();
    return this;
  }

  confirmChangesAction() {
    this.elements.confirmButton().click();
    return this;
  }

  confirmSignOffRequest() {
    this.elements.confirmButton().click();
    return this;
  }

  confirmSignOffAction() {
    this.elements.confirmButton().click();
    return this;
  }

  confirmSubmissionAction() {
    this.elements.confirmButton().click();
    return this;
  }

  cancelModalAction() {
    this.elements.modalCancelButton().click();
    this.expectConfirmationModalClosed();
    return this;
  }

  // Comment management actions
  addGeneralComment(commentText) {
    this.logAction(`Adding general comment: ${commentText}`);

    this.elements.addCommentButton().click();
    this.elements.commentTypeSelect().select('General Feedback');
    this.elements.commentInput().type(commentText);
    this.elements.submitCommentButton().click();
    this.expectCommentSuccess();

    return this;
  }

  addIssueComment(commentText) {
    this.logAction(`Adding issue comment: ${commentText}`);

    this.elements.addCommentButton().click();
    this.elements.commentTypeSelect().select('Issue/Concern');
    this.elements.commentInput().type(commentText);
    this.elements.submitCommentButton().click();
    this.expectCommentSuccess();

    return this;
  }

  addApprovalComment(commentText) {
    this.logAction(`Adding approval comment: ${commentText}`);

    this.elements.addCommentButton().click();
    this.elements.commentTypeSelect().select('Approval Note');
    this.elements.commentInput().type(commentText);
    this.elements.submitCommentButton().click();
    this.expectCommentSuccess();

    return this;
  }

  cancelCommentCreation() {
    this.elements.cancelCommentButton().click();
    return this;
  }

  // Page state assertions
  expectToBeOnApprovalPage() {
    cy.url().should('include', '/brand-lift/approval');
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  expectStudyInfoVisible() {
    this.elements.studyInfoCard().should('be.visible');
    this.elements.studyName().should('be.visible');
    return this;
  }

  expectQuestionsReviewVisible() {
    this.elements.questionsSection().should('be.visible');
    this.elements.questionsHeader().should('be.visible');
    return this;
  }

  expectApprovalActionsVisible() {
    this.elements.approvalActionsCard().should('be.visible');
    this.elements.approvalActionsHeader().should('be.visible');
    return this;
  }

  // Study information assertions
  expectStudyName(expectedName) {
    this.elements.studyName().should('contain', expectedName);
    return this;
  }

  expectStudyStatus(expectedStatus) {
    this.elements.studyStatus().should('contain', expectedStatus);
    return this;
  }

  expectApprovalStatus(expectedStatus) {
    this.elements.statusBadge(expectedStatus).should('be.visible');
    return this;
  }

  // Questions review assertions
  expectQuestionsCount(expectedCount) {
    if (expectedCount === 0) {
      this.elements.noQuestionsMessage().should('be.visible');
    } else {
      this.elements
        .questionsContainer()
        .find('[data-testid^="question-"]')
        .should('have.length', expectedCount);
    }
    return this;
  }

  expectQuestionAtIndex(index, expectedText) {
    this.elements.questionText(index).should('contain', expectedText);
    return this;
  }

  expectQuestionType(index, expectedType) {
    this.elements.questionType(index).should('contain', expectedType);
    return this;
  }

  // Comments assertions
  expectCommentsVisible() {
    this.elements.commentsSection().should('be.visible');
    this.elements.commentThread().should('be.visible');
    return this;
  }

  expectCommentCount(expectedCount) {
    this.elements
      .commentThread()
      .find('[data-testid^="comment-"]')
      .should('have.length', expectedCount);
    return this;
  }

  expectCommentAtIndex(index, expectedText) {
    this.elements.commentText(index).should('contain', expectedText);
    return this;
  }

  expectCommentAuthor(index, expectedAuthor) {
    this.elements.commentAuthor(index).should('contain', expectedAuthor);
    return this;
  }

  expectCommentStatus(index, expectedStatus) {
    this.elements.commentStatus(index).should('contain', expectedStatus);
    return this;
  }

  // Action button state assertions
  expectApproveButtonVisible() {
    this.elements.approveButton().should('be.visible').and('not.be.disabled');
    return this;
  }

  expectRequestChangesButtonVisible() {
    this.elements.requestChangesButton().should('be.visible').and('not.be.disabled');
    return this;
  }

  expectRequestSignOffButtonVisible() {
    this.elements.requestSignOffButton().should('be.visible').and('not.be.disabled');
    return this;
  }

  expectSignOffButtonVisible() {
    this.elements.signOffButton().should('be.visible').and('not.be.disabled');
    return this;
  }

  expectSubmitForCollectionButtonVisible() {
    this.elements.submitForCollectionButton().should('be.visible').and('not.be.disabled');
    return this;
  }

  expectActionsForStatus(approvalStatus) {
    switch (approvalStatus) {
      case 'PENDING_REVIEW':
        this.expectApproveButtonVisible();
        this.expectRequestChangesButtonVisible();
        break;
      case 'APPROVED':
        this.expectRequestSignOffButtonVisible();
        break;
      case 'SIGNED_OFF':
        this.expectSubmitForCollectionButtonVisible();
        break;
    }
    return this;
  }

  // Modal assertions
  expectConfirmApprovalModal() {
    this.elements.confirmApprovalModal().should('be.visible');
    this.elements.confirmButton().should('be.visible');
    return this;
  }

  expectConfirmChangesModal() {
    this.elements.confirmChangesModal().should('be.visible');
    this.elements.confirmButton().should('be.visible');
    return this;
  }

  expectConfirmSignOffModal() {
    this.elements.confirmSignOffModal().should('be.visible');
    this.elements.confirmButton().should('be.visible');
    return this;
  }

  expectConfirmSubmissionModal() {
    this.elements.confirmSubmissionModal().should('be.visible');
    this.elements.confirmButton().should('be.visible');
    return this;
  }

  expectConfirmationModalClosed() {
    this.elements.confirmationModal().should('not.exist');
    return this;
  }

  // Success/Error assertions
  expectApprovalSuccess() {
    this.elements.approvalSuccessMessage().should('be.visible');
    this.expectApprovalStatus('APPROVED');
    return this;
  }

  expectChangesRequestSuccess() {
    this.elements.approvalSuccessMessage().should('be.visible');
    this.expectApprovalStatus('CHANGES_REQUESTED');
    return this;
  }

  expectSignOffRequestSuccess() {
    this.elements.approvalSuccessMessage().should('be.visible');
    return this;
  }

  expectSignOffSuccess() {
    this.elements.approvalSuccessMessage().should('be.visible');
    this.expectApprovalStatus('SIGNED_OFF');
    return this;
  }

  expectSubmissionSuccess() {
    // Should navigate to study submitted page
    cy.url().should('include', '/brand-lift/study-submitted/');
    return this;
  }

  expectCommentSuccess() {
    this.elements.commentSuccessMessage().should('be.visible');
    return this;
  }

  expectApprovalError(message) {
    this.elements.approvalError().should('contain', message);
    return this;
  }

  expectCommentError(message) {
    this.elements.commentError().should('contain', message);
    return this;
  }

  // Access control assertions
  expectAccessDenied() {
    this.elements.accessDeniedMessage().should('be.visible');
    return this;
  }

  expectInsufficientPermissions() {
    this.elements.insufficientPermissionsMessage().should('be.visible');
    return this;
  }

  // Sign-off details assertions
  expectSignOffDetails(signedOffBy, signedOffAt) {
    this.elements.signOffSection().should('be.visible');
    this.elements.signedOffBy().should('contain', signedOffBy);
    if (signedOffAt) {
      this.elements.signedOffAt().should('contain', signedOffAt);
    }
    return this;
  }

  // Loading state assertions
  expectLoadingState() {
    this.elements.loadingSpinner().should('be.visible');
    return this;
  }

  expectApprovalLoadingState() {
    this.elements.approvalLoadingState().should('be.visible');
    return this;
  }

  expectActionsLoadingState() {
    this.elements.actionsLoadingState().should('be.visible');
    return this;
  }

  expectContentLoaded() {
    this.elements.loadingSpinner().should('not.exist');
    this.elements.studyInfoCard().should('be.visible');
    return this;
  }

  // Wait for page load
  waitForPageLoad() {
    this.elements.pageTitle().should('be.visible', { timeout: this.loadTimeout });
    this.elements.studyInfoCard().should('be.visible', { timeout: this.loadTimeout });
    return this;
  }

  // Complex workflows
  completeApprovalWorkflow() {
    this.logAction('Completing full approval workflow');

    // Start with pending review
    this.expectApprovalStatus('PENDING_REVIEW');

    // Add a review comment
    this.addGeneralComment('Initial review completed. Looks good overall.');

    // Approve the study
    this.approveStudy();
    this.expectApprovalStatus('APPROVED');

    // Request sign-off
    this.requestSignOff();

    // Sign off the study
    this.signOffStudy();
    this.expectApprovalStatus('SIGNED_OFF');

    // Submit for data collection
    this.submitForDataCollection();

    return this;
  }

  testChangesRequestWorkflow() {
    this.logAction('Testing changes request workflow');

    // Add issue comment
    this.addIssueComment('Question 3 needs clarification on the response options.');

    // Request changes
    this.requestChanges();
    this.expectApprovalStatus('CHANGES_REQUESTED');

    return this;
  }

  reviewSurveyQuestions() {
    this.logAction('Reviewing survey questions');

    this.expectQuestionsReviewVisible();

    // Count questions and verify content
    cy.get('[data-testid^="question-"]').then($questions => {
      const questionCount = $questions.length;
      cy.log(`Found ${questionCount} questions to review`);

      if (questionCount > 0) {
        // Review each question
        for (let i = 0; i < Math.min(questionCount, 5); i++) {
          this.elements.questionText(i).should('be.visible');
          this.elements.questionType(i).should('be.visible');
        }
      }
    });

    return this;
  }

  // Stakeholder collaboration testing
  testStakeholderWorkflow() {
    this.logAction('Testing stakeholder collaboration workflow');

    // Multiple stakeholders adding comments
    this.addGeneralComment('Marketing team review: Questions align with campaign objectives.');
    this.addApprovalComment('Legal review: All questions comply with data collection policies.');
    this.addGeneralComment('Research team: Statistical methodology is sound.');

    // Final approval
    this.approveStudy();

    return this;
  }

  // Error handling
  handleApprovalErrors() {
    cy.get('body').then($body => {
      if ($body.text().includes('Error') || $body.find('[role="alert"]').length > 0) {
        cy.log('⚠️ Approval workflow error detected');
        this.takeScreenshot('approval-error');

        // Try to recover by refreshing
        cy.reload();
        this.waitForPageLoad();
      }
    });
    return this;
  }

  // Performance monitoring
  measureApprovalAction() {
    return this.measureInteractionTime(
      () => {
        this.approveStudy();
      },
      {
        actionName: 'approval-action',
        performanceBudget: 3000, // 3 seconds for approval action
      }
    );
  }

  measureCommentSubmission() {
    return this.measureInteractionTime(
      () => {
        this.addGeneralComment('Performance test comment');
      },
      {
        actionName: 'comment-submission',
        performanceBudget: 2000, // 2 seconds for comment submission
      }
    );
  }

  // Responsive design testing
  testMobileApproval() {
    cy.viewport('iphone-6');
    this.expectStudyInfoVisible();
    this.expectApprovalActionsVisible();
    cy.viewport(1280, 720); // Reset
    return this;
  }

  // Accessibility testing
  checkApprovalAccessibility() {
    cy.checkA11y('[data-cy="approval-container"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
      },
    });
    return this;
  }

  // Workflow state validation
  validateWorkflowState(expectedState) {
    this.logAction(`Validating workflow state: ${expectedState}`);

    this.expectApprovalStatus(expectedState);
    this.expectActionsForStatus(expectedState);

    return this;
  }

  // Comment thread validation
  validateCommentThread(expectedComments) {
    this.logAction('Validating comment thread');

    this.expectCommentCount(expectedComments.length);

    expectedComments.forEach((comment, index) => {
      this.expectCommentAtIndex(index, comment.text);
      if (comment.author) {
        this.expectCommentAuthor(index, comment.author);
      }
      if (comment.status) {
        this.expectCommentStatus(index, comment.status);
      }
    });

    return this;
  }
}
