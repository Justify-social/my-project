import { setupClerkTestingToken } from '@clerk/testing/cypress';
import {
  BrandLiftPage,
  SurveyDesignPage,
  CampaignSelectionPage,
  ProgressPage,
  ApprovalPage,
} from '../../support/page-objects';
import { TestSetup, ApiInterceptors, AssertionHelpers } from '../../support/test-helpers';

/**
 * Brand Lift Module Comprehensive Test Suite
 *
 * Tests all 5 Brand Lift page objects with complete coverage:
 * - BrandLiftPage: Main dashboard with campaign selection and studies management
 * - SurveyDesignPage: Survey creation with AI-powered question suggestions
 * - CampaignSelectionPage: Campaign linking and study setup workflow
 * - ProgressPage: Study progress tracking with Cint integration
 * - ApprovalPage: Approval workflow with comment threads and sign-off
 *
 * Demonstrates advanced SSOT patterns, API integration, and workflow testing
 */

describe('Brand Lift Module - Complete Functionality', () => {
  let brandLiftPage;
  let surveyDesignPage;
  let campaignSelectionPage;
  let progressPage;
  let approvalPage;

  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    // Initialize all page objects
    brandLiftPage = new BrandLiftPage();
    surveyDesignPage = new SurveyDesignPage();
    campaignSelectionPage = new CampaignSelectionPage();
    progressPage = new ProgressPage();
    approvalPage = new ApprovalPage();

    // Setup API interceptors for brand lift workflows
    ApiInterceptors.setupBrandLiftInterceptors();

    // Performance monitoring for brand lift workflows
    cy.measurePageLoadTime({ performanceBudget: 3000 });
  });

  afterEach(() => {
    // Clean up test state
    brandLiftPage.resetPageState();
    surveyDesignPage.resetPageState();
    campaignSelectionPage.resetPageState();
    progressPage.resetPageState();
    approvalPage.resetPageState();
  });

  describe('Brand Lift Dashboard & Studies Management', () => {
    beforeEach(() => {
      // Setup studies API interceptors
      cy.intercept('GET', '**/api/brand-lift/surveys', {
        fixture: 'brand-lift/studies-list.json',
      }).as('getStudies');
      cy.intercept('POST', '**/api/brand-lift/surveys/*', { statusCode: 200 }).as('duplicateStudy');
      cy.intercept('DELETE', '**/api/brand-lift/surveys/*', { statusCode: 200 }).as('deleteStudy');
    });

    it('should display brand lift dashboard with studies management', () => {
      brandLiftPage
        .visit()
        .expectToBeOnBrandLiftPage()
        .expectCampaignSelectorVisible()
        .expectStudiesTableVisible();

      cy.wait('@getStudies');

      brandLiftPage.validateStudiesTableData().validateStudyStatuses();

      // Performance assertion
      AssertionHelpers.expectPageLoadUnder(3000);
    });

    it('should handle campaign selection and study creation workflow', () => {
      // Mock campaign selector
      cy.intercept('GET', '**/api/campaigns/selectable-list', {
        fixture: 'campaigns/campaigns-list.json',
      }).as('getCampaigns');

      brandLiftPage.visit().expectCampaignSelectorVisible();

      cy.wait('@getCampaigns');

      brandLiftPage.selectCampaign('Test Campaign').expectCampaignSelected('Test Campaign');

      // Should navigate to campaign review setup
      cy.url().should('include', '/brand-lift/campaign-review-setup/');
      AssertionHelpers.expectNavigationCompletion();
    });

    it('should manage study actions (view, edit, duplicate, delete)', () => {
      brandLiftPage.visit().expectStudiesTableVisible();

      cy.wait('@getStudies');

      // Test with first study in the list
      cy.get('tbody tr')
        .first()
        .within(() => {
          cy.get('td').first().invoke('text').as('studyName');
        });

      cy.get('@studyName').then(studyName => {
        // Test action button states
        brandLiftPage.validateActionButtonStates(studyName, {
          viewEnabled: true,
          editEnabled: true,
          duplicateEnabled: true,
          deleteEnabled: true,
        });

        // Test duplicate workflow
        const duplicateName = `Copy of ${studyName}`;
        brandLiftPage.duplicateStudy(studyName, duplicateName);

        cy.wait('@duplicateStudy');
        brandLiftPage.expectDuplicateSuccess();
      });

      AssertionHelpers.expectWorkflowCompletion();
    });

    it('should handle empty states and error conditions', () => {
      // Test empty studies state
      cy.intercept('GET', '**/api/brand-lift/surveys', { body: { success: true, data: [] } }).as(
        'getEmptyStudies'
      );

      brandLiftPage.visit().expectCampaignSelectorVisible();

      cy.wait('@getEmptyStudies');
      brandLiftPage.expectEmptyStudiesList();

      // Test error state
      cy.intercept('GET', '**/api/brand-lift/surveys', {
        statusCode: 500,
        body: { error: 'Server error' },
      }).as('getStudiesError');

      cy.reload();
      cy.wait('@getStudiesError');
      brandLiftPage.expectErrorState();

      AssertionHelpers.expectErrorRecovery();
    });

    it('should be responsive and accessible', () => {
      brandLiftPage.visit().testMobileBrandLift().checkBrandLiftAccessibility();

      AssertionHelpers.expectResponsiveDesign();
      AssertionHelpers.expectAccessibilityCompliance();
    });
  });

  describe('Survey Design & Question Builder', () => {
    beforeEach(() => {
      // Setup survey design API interceptors
      cy.intercept('GET', '**/api/brand-lift/surveys/*/questions', {
        fixture: 'brand-lift/questions-list.json',
      }).as('getQuestions');
      cy.intercept('POST', '**/api/brand-lift/surveys/*/questions', { statusCode: 201 }).as(
        'createQuestion'
      );
      cy.intercept('POST', '**/api/brand-lift/surveys/*/suggest-questions', {
        fixture: 'brand-lift/ai-suggestions.yaml',
      }).as('aiSuggestions');
    });

    it('should handle survey design and question creation', () => {
      const studyId = 'test-study-123';

      surveyDesignPage
        .visit(studyId)
        .expectToBeOnSurveyDesignPage()
        .expectSurveyBuilderVisible()
        .expectHeaderActionsVisible();

      cy.wait('@getQuestions');

      // Test question creation
      surveyDesignPage
        .createYesNoQuestion('Do you recall seeing this ad?')
        .createMultipleChoiceQuestion('Which platform did you see it on?', [
          'TikTok',
          'Instagram',
          'Facebook',
          'Other',
        ])
        .createRatingScaleQuestion('How likely are you to purchase?', 1, 5, {
          min: 'Very Unlikely',
          max: 'Very Likely',
        });

      cy.wait('@createQuestion').its('response.statusCode').should('eq', 201);

      surveyDesignPage.expectQuestionCount(3);
      AssertionHelpers.expectWorkflowCompletion();
    });

    it('should handle AI-powered question suggestions', () => {
      const studyId = 'test-study-456';

      surveyDesignPage.visit(studyId).expectSurveyBuilderVisible();

      // Test AI suggestions workflow
      surveyDesignPage.testAISuggestionsWorkflow();

      cy.wait('@aiSuggestions');
      surveyDesignPage.expectAISuggestionComplete();

      // Should have questions after AI suggestions
      surveyDesignPage.expectQuestionCount(5); // Based on fixture

      AssertionHelpers.expectPerformanceUnder(10000); // AI suggestions can take longer
    });

    it('should manage question editing and reordering', () => {
      const studyId = 'test-study-789';

      surveyDesignPage.visit(studyId).expectSurveyBuilderVisible();

      cy.wait('@getQuestions');

      // Add multiple questions for testing
      surveyDesignPage
        .createYesNoQuestion('Question 1')
        .createYesNoQuestion('Question 2')
        .createYesNoQuestion('Question 3');

      // Test reordering
      surveyDesignPage.testQuestionReordering();

      // Test editing
      surveyDesignPage
        .editQuestion(0)
        .fillQuestionDetails('Updated Question 1', 'Multiple Choice')
        .addQuestionOptions(['Option A', 'Option B', 'Option C'])
        .saveQuestion();

      AssertionHelpers.expectInteractionCompletion();
    });

    it('should validate survey structure and navigation', () => {
      const studyId = 'test-study-validation';

      surveyDesignPage.visit(studyId).validateSurveyStructure().testQuestionValidation();

      // Test navigation to preview
      surveyDesignPage.createYesNoQuestion('Test question for preview').proceedToPreview();

      cy.url().should('include', '/brand-lift/survey-preview/');
      AssertionHelpers.expectNavigationCompletion();
    });

    it('should be responsive and handle errors gracefully', () => {
      const studyId = 'test-study-responsive';

      surveyDesignPage.visit(studyId).testMobileSurveyDesign().checkSurveyDesignAccessibility();

      // Test error handling
      cy.intercept('POST', '**/api/brand-lift/surveys/*/questions', {
        statusCode: 400,
        body: { error: 'Validation error' },
      }).as('createQuestionError');

      surveyDesignPage.addNewQuestion();
      surveyDesignPage.saveQuestion(); // Should trigger validation error

      cy.wait('@createQuestionError');
      surveyDesignPage.expectValidationError('Question title is required');

      AssertionHelpers.expectErrorRecovery();
    });
  });

  describe('Campaign Review & Study Setup', () => {
    beforeEach(() => {
      // Setup campaign review API interceptors
      cy.intercept('GET', '**/api/campaign-data-for-brand-lift/*', {
        fixture: 'brand-lift/campaign-data.json',
      }).as('getCampaignData');
      cy.intercept('POST', '**/api/brand-lift/surveys', {
        fixture: 'brand-lift/created-study.json',
      }).as('createStudy');
    });

    it('should display campaign review and setup form', () => {
      const campaignId = 'test-campaign-123';

      campaignSelectionPage
        .visit(campaignId)
        .expectToBeOnCampaignReviewPage()
        .expectCampaignInfoVisible()
        .expectStudySetupFormVisible();

      cy.wait('@getCampaignData');

      campaignSelectionPage.validateCampaignDataIntegrity().expectCompleteDataSections();

      AssertionHelpers.expectPageLoadUnder(3000);
    });

    it('should validate campaign data sections', () => {
      const campaignId = 'test-campaign-456';

      campaignSelectionPage.visit(campaignId).expectCampaignInfoVisible();

      cy.wait('@getCampaignData');

      // Validate campaign data from fixture
      campaignSelectionPage
        .expectCampaignName('Test Brand Campaign')
        .expectCampaignPlatform('TikTok')
        .expectPrimaryKPI('Brand Awareness')
        .expectFunnelStage('Top Funnel');

      AssertionHelpers.expectDataValidation();
    });

    it('should handle study creation workflow', () => {
      const campaignId = 'test-campaign-789';
      const studyName = 'Test Brand Lift Study - Performance Campaign';

      campaignSelectionPage.visit(campaignId).expectStudySetupFormVisible();

      cy.wait('@getCampaignData');

      campaignSelectionPage
        .setStudyName(studyName)
        .expectCreateButtonEnabled()
        .createBrandLiftStudy();

      cy.wait('@createStudy');
      campaignSelectionPage.expectStudyCreationSuccess();

      // Should navigate to survey design
      cy.url().should('include', '/brand-lift/survey-design/');
      AssertionHelpers.expectWorkflowCompletion();
    });

    it('should validate form inputs and handle errors', () => {
      const campaignId = 'test-campaign-validation';

      campaignSelectionPage.visit(campaignId).expectStudySetupFormVisible();

      cy.wait('@getCampaignData');

      // Test validation
      campaignSelectionPage.testStudyNameValidation();

      // Test API error
      cy.intercept('POST', '**/api/brand-lift/surveys', {
        statusCode: 400,
        body: { error: 'Invalid campaign data' },
      }).as('createStudyError');

      campaignSelectionPage.setStudyName('Valid Study Name').createBrandLiftStudy();

      cy.wait('@createStudyError');
      campaignSelectionPage.expectSubmitError('Invalid campaign data');

      AssertionHelpers.expectFormValidation();
    });

    it('should handle campaign editing workflow', () => {
      const campaignId = 'test-campaign-editing';

      campaignSelectionPage.visit(campaignId).expectEditButtonsVisible();

      cy.wait('@getCampaignData');

      campaignSelectionPage.testCampaignEditingWorkflow();

      AssertionHelpers.expectNavigationCompletion();
    });
  });

  describe('Progress Tracking & Monitoring', () => {
    beforeEach(() => {
      // Setup progress tracking API interceptors
      cy.intercept('GET', '**/api/brand-lift/surveys/*/progress', {
        fixture: 'brand-lift/progress-data.json',
      }).as('getProgress');
      cy.intercept('PUT', '**/api/brand-lift/surveys/*', { statusCode: 200 }).as(
        'updateStudyStatus'
      );
    });

    it('should display study progress with Cint integration', () => {
      const studyId = 'test-study-progress';

      progressPage.visit(studyId).expectToBeOnProgressPage().expectProgressCardVisible();

      cy.wait('@getProgress');

      progressPage
        .expectProgressData({ current: 750, target: 1000, percentage: 75 })
        .expectCintStatusVisible()
        .expectInterimMetricsVisible();

      AssertionHelpers.expectDataVisualization();
    });

    it('should handle progress refresh and real-time updates', () => {
      const studyId = 'test-study-realtime';

      progressPage.visit(studyId).expectProgressCardVisible();

      cy.wait('@getProgress');

      // Test data refresh
      progressPage
        .refreshProgressData()
        .expectDataRefreshed()
        .testRealTimeUpdates()
        .validateProgressDataConsistency();

      AssertionHelpers.expectRealTimeUpdates();
    });

    it('should manage study control actions', () => {
      const studyId = 'test-study-control';

      progressPage.visit(studyId).expectStudyCollecting();

      cy.wait('@getProgress');

      // Test pause functionality
      progressPage.pauseDataCollection();

      cy.wait('@updateStudyStatus');
      progressPage.expectStudyPaused();

      // Test resume functionality
      progressPage.resumeDataCollection();
      progressPage.expectStudyResumed();

      AssertionHelpers.expectStudyLifecycleManagement();
    });

    it('should handle completed studies and report access', () => {
      const studyId = 'test-study-completed';

      // Mock completed study
      cy.intercept('GET', '**/api/brand-lift/surveys/*/progress', {
        fixture: 'brand-lift/progress-completed.json',
      }).as('getCompletedProgress');

      progressPage.visit(studyId).expectProgressCardVisible();

      cy.wait('@getCompletedProgress');

      progressPage.expectStudyCompleted().expectViewReportButtonVisible().viewFullReport();

      cy.url().should('include', '/report/');
      AssertionHelpers.expectNavigationCompletion();
    });

    it('should validate progress metrics and performance', () => {
      const studyId = 'test-study-metrics';

      progressPage.visit(studyId).measureProgressRefresh();

      cy.wait('@getProgress');

      progressPage.validateProgressMetrics({
        responseCount: { current: 500, target: 1000 },
        percentage: 50,
        cint: { prescreens: 1200, medianIR: 0.42 },
        groups: { exposed: 250, control: 250 },
      });

      AssertionHelpers.expectPerformanceUnder(3000);
    });
  });

  describe('Approval Workflow & Management', () => {
    beforeEach(() => {
      // Setup approval workflow API interceptors
      cy.intercept('GET', '**/api/brand-lift/surveys/*', {
        fixture: 'brand-lift/study-details.json',
      }).as('getStudyDetails');
      cy.intercept('GET', '**/api/brand-lift/surveys/*/questions', {
        fixture: 'brand-lift/questions-list.json',
      }).as('getQuestions');
      cy.intercept('GET', '**/api/brand-lift/approval/comments**', {
        fixture: 'brand-lift/comments-list.json',
      }).as('getComments');
      cy.intercept('GET', '**/api/brand-lift/approval/status**', {
        fixture: 'brand-lift/approval-status.json',
      }).as('getApprovalStatus');
      cy.intercept('PUT', '**/api/brand-lift/approval/status**', { statusCode: 200 }).as(
        'updateApprovalStatus'
      );
      cy.intercept('POST', '**/api/brand-lift/approval/comments', { statusCode: 201 }).as(
        'addComment'
      );
    });

    it('should display approval workflow with survey review', () => {
      const studyId = 'test-study-approval';

      approvalPage
        .visit(studyId)
        .expectToBeOnApprovalPage()
        .expectStudyInfoVisible()
        .expectQuestionsReviewVisible()
        .expectApprovalActionsVisible();

      cy.wait('@getStudyDetails');
      cy.wait('@getQuestions');
      cy.wait('@getComments');
      cy.wait('@getApprovalStatus');

      approvalPage.reviewSurveyQuestions().expectQuestionsCount(5);

      AssertionHelpers.expectPageLoadUnder(3000);
    });

    it('should handle comment management and feedback', () => {
      const studyId = 'test-study-comments';

      approvalPage.visit(studyId).expectCommentsVisible();

      cy.wait('@getComments');

      // Test adding different types of comments
      approvalPage
        .addGeneralComment('Overall survey structure looks good.')
        .addIssueComment('Question 3 may be leading the respondent.')
        .addApprovalComment('Marketing team has approved the messaging.');

      cy.wait('@addComment').its('response.statusCode').should('eq', 201);

      approvalPage.expectCommentSuccess();
      AssertionHelpers.expectCollaborationFeatures();
    });

    it('should handle complete approval workflow', () => {
      const studyId = 'test-study-workflow';

      approvalPage.visit(studyId).expectApprovalActionsVisible();

      cy.wait('@getApprovalStatus');

      // Mock pending review status
      approvalPage.expectApprovalStatus('PENDING_REVIEW').expectActionsForStatus('PENDING_REVIEW');

      // Complete approval workflow
      approvalPage.completeApprovalWorkflow();

      cy.wait('@updateApprovalStatus');
      approvalPage.expectSubmissionSuccess();

      AssertionHelpers.expectWorkflowCompletion();
    });

    it('should handle changes request workflow', () => {
      const studyId = 'test-study-changes';

      approvalPage.visit(studyId).expectApprovalActionsVisible();

      cy.wait('@getApprovalStatus');

      approvalPage.testChangesRequestWorkflow();

      cy.wait('@updateApprovalStatus');
      approvalPage.expectChangesRequestSuccess();

      AssertionHelpers.expectFeedbackLoop();
    });

    it('should validate stakeholder collaboration', () => {
      const studyId = 'test-study-stakeholders';

      approvalPage.visit(studyId).testStakeholderWorkflow();

      cy.wait('@addComment');
      cy.wait('@updateApprovalStatus');

      approvalPage.validateCommentThread([
        { text: 'Marketing team review', author: 'Marketing' },
        { text: 'Legal review', author: 'Legal' },
        { text: 'Research team', author: 'Research' },
      ]);

      AssertionHelpers.expectStakeholderCollaboration();
    });

    it('should handle access control and permissions', () => {
      const studyId = 'test-study-permissions';

      // Mock insufficient permissions
      cy.intercept('GET', '**/api/brand-lift/approval/status**', {
        statusCode: 403,
        body: { error: 'Insufficient permissions' },
      }).as('getApprovalStatusForbidden');

      approvalPage.visit(studyId);

      cy.wait('@getApprovalStatusForbidden');
      approvalPage.expectInsufficientPermissions();

      AssertionHelpers.expectAccessControl();
    });
  });

  describe('Cross-Module Integration & End-to-End Workflows', () => {
    it('should complete full brand lift study lifecycle', () => {
      // Start from campaign selection
      const campaignId = 'test-campaign-e2e';

      campaignSelectionPage.visit(campaignId).setStudyName('E2E Test Study').createBrandLiftStudy();

      // Move to survey design
      surveyDesignPage
        .expectToBeOnSurveyDesignPage()
        .createYesNoQuestion('Do you recall seeing this ad?')
        .createRatingScaleQuestion('How likely are you to purchase?', 1, 5)
        .proceedToPreview();

      // Navigate through approval
      cy.visit('/brand-lift/approval/test-study-e2e');
      approvalPage
        .expectToBeOnApprovalPage()
        .approveStudy()
        .signOffStudy()
        .submitForDataCollection();

      AssertionHelpers.expectCompleteWorkflow();
    });

    it('should handle navigation between all brand lift modules', () => {
      // Test seamless navigation between all modules
      brandLiftPage.visit().expectToBeOnBrandLiftPage();

      // Navigate to each module
      cy.visit('/brand-lift/survey-design/test-study');
      surveyDesignPage.expectToBeOnSurveyDesignPage();

      cy.visit('/brand-lift/campaign-review-setup/test-campaign');
      campaignSelectionPage.expectToBeOnCampaignReviewPage();

      cy.visit('/brand-lift/progress/test-study');
      progressPage.expectToBeOnProgressPage();

      cy.visit('/brand-lift/approval/test-study');
      approvalPage.expectToBeOnApprovalPage();

      AssertionHelpers.expectModuleNavigation();
    });

    it('should maintain performance across all brand lift modules', () => {
      // Test performance budgets across all modules
      brandLiftPage.measureStudyListLoad();
      surveyDesignPage.measureQuestionCreation();
      campaignSelectionPage.measureStudyCreation();
      progressPage.measureProgressRefresh();
      approvalPage.measureApprovalAction();

      AssertionHelpers.expectPerformanceBudgets();
    });

    it('should be accessible across all brand lift modules', () => {
      // Test accessibility for each module
      brandLiftPage.checkBrandLiftAccessibility();
      surveyDesignPage.checkSurveyDesignAccessibility();
      campaignSelectionPage.checkCampaignReviewAccessibility();
      progressPage.checkProgressAccessibility();
      approvalPage.checkApprovalAccessibility();

      AssertionHelpers.expectAccessibilityCompliance();
    });

    it('should handle errors gracefully across all modules', () => {
      // Test error handling in each module
      brandLiftPage.handleBrandLiftErrors();
      surveyDesignPage.handleSurveyDesignErrors();
      campaignSelectionPage.handleCampaignReviewErrors();
      progressPage.handleProgressErrors();
      approvalPage.handleApprovalErrors();

      AssertionHelpers.expectErrorRecovery();
    });
  });

  describe('Real-world User Scenarios', () => {
    it('should handle marketing team workflow', () => {
      // Marketing team creating and managing brand lift studies
      const campaignData = {
        campaignName: 'Q1 Brand Awareness Campaign',
        studyName: 'Q1 Brand Awareness - Brand Lift Study',
        primaryKPI: 'Brand Awareness',
        funnelStage: 'Top Funnel',
      };

      campaignSelectionPage.visit('marketing-campaign-123').reviewCompleteStudySetup(campaignData);

      surveyDesignPage.expectToBeOnSurveyDesignPage().createCompleteSurvey({
        questions: [
          { type: 'yes-no', title: 'Do you recall seeing this ad?' },
          {
            type: 'multiple-choice',
            title: 'Where did you see it?',
            options: ['TikTok', 'Instagram', 'Facebook'],
          },
          { type: 'rating-scale', title: 'How likely to purchase?', min: 1, max: 5 },
        ],
      });

      AssertionHelpers.expectMarketingWorkflow();
    });

    it('should handle research team approval workflow', () => {
      // Research team reviewing and approving studies
      const studyId = 'research-review-study';

      approvalPage
        .visit(studyId)
        .reviewSurveyQuestions()
        .addApprovalComment('Statistical methodology approved. Sample size is appropriate.')
        .approveStudy()
        .requestSignOff();

      AssertionHelpers.expectResearchWorkflow();
    });

    it('should handle data collection monitoring workflow', () => {
      // Operations team monitoring live studies
      const studyId = 'live-study-monitoring';

      progressPage
        .visit(studyId)
        .expectStudyCollecting()
        .validateProgressDataConsistency()
        .testRealTimeUpdates();

      // Monitor until 50% completion
      progressPage.monitorProgressToCompletion(50);

      AssertionHelpers.expectMonitoringWorkflow();
    });
  });
});
