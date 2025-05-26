import { BasePage } from '../shared/BasePage.js';

/**
 * Progress Page Object Model
 * Handles brand lift study progress tracking and monitoring
 *
 * Covers:
 * - Study progress tracking with response collection
 * - Cint integration and live progress data
 * - Progress bars and completion percentages
 * - Study status management and transitions
 * - Interim metrics for exposed/control groups
 * - Action buttons for study control (pause, view reports)
 * - Real-time data refresh functionality
 */

export class ProgressPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/brand-lift/progress';
    this.pageTitle = 'Brand Lift Study Progress';
  }

  // Element selectors using data-cy attributes
  elements = {
    // Main page container
    progressContainer: () => this.getByDataCy('progress-container'),
    pageHeader: () => this.getByDataCy('progress-header'),
    pageTitle: () => cy.contains('h1', 'Brand Lift Study Progress'),

    // Progress tracker card
    progressCard: () => cy.get('[data-testid="progress-card"]'),
    progressCardHeader: () => this.elements.progressCard().find('.card-header'),
    progressCardContent: () => this.elements.progressCard().find('.card-content'),

    // Study info and status
    studyTitle: () => cy.contains('Study Progress'),
    studyStatus: () => this.getByDataCy('study-status'),
    approvalStatus: () => this.getByDataCy('approval-status'),

    // Progress metrics
    progressSection: () => this.getByDataCy('progress-section'),
    responsesLabel: () => cy.contains('Responses Gathered'),
    progressCounter: () => this.getByDataCy('progress-counter'),
    progressBar: () => cy.get('[role="progressbar"]'),
    progressPercentage: () => this.elements.progressBar().should('have.attr', 'aria-valuenow'),

    // Database and Cint metrics
    localDbCount: () => cy.contains('Local DB count:'),
    cintStatusSection: () => this.getByDataCy('cint-status'),
    cintStatus: () => cy.contains('Cint Status:'),
    prescreensCount: () => cy.contains('Prescreens:'),
    medianIR: () => cy.contains('Median IR:'),
    medianLOI: () => cy.contains('Median LOI:'),

    // Target and current counts
    targetCompletes: () => this.getByDataCy('target-completes'),
    currentCompletes: () => this.getByDataCy('current-completes'),
    targetValue: () =>
      this.elements
        .progressCounter()
        .contains('/')
        .then($el => $el.text().split('/')[1]),
    currentValue: () =>
      this.elements
        .progressCounter()
        .contains('/')
        .then($el => $el.text().split('/')[0]),

    // Interim metrics section
    interimMetricsCard: () => cy.contains('Interim Metrics').parent(),
    interimMetricsHeader: () => cy.contains('Interim Metrics (Placeholder)'),
    exposedGroupCount: () => cy.contains('Exposed Group N:'),
    controlGroupCount: () => cy.contains('Control Group N:'),
    liftCalculationsNote: () => cy.contains('Detailed lift calculations'),

    // Action buttons
    refreshButton: () => cy.contains('button', 'Refresh Data'),
    pauseStudyButton: () => cy.contains('button', 'Pause Data Collection'),
    viewReportButton: () => cy.contains('button', 'View Full Report'),

    // Status badges and indicators
    statusBadge: status => cy.contains('.badge', status),
    collectingStatus: () => this.elements.statusBadge('COLLECTING'),
    completedStatus: () => this.elements.statusBadge('COMPLETED'),
    pausedStatus: () => this.elements.statusBadge('PAUSED'),

    // Loading states
    loadingSpinner: () => cy.get('.animate-spin'),
    loadingSkeleton: () => cy.get('[data-testid="loading-skeleton"]'),
    cardLoadingState: () => this.elements.progressCard().find('.animate-pulse'),

    // Error states
    errorAlert: () => cy.get('[role="alert"]'),
    errorTitle: () => this.elements.errorAlert().find('h4, h5'),
    errorDescription: () => this.elements.errorAlert().find('p'),
    tryAgainButton: () => cy.contains('button', 'Try Again'),

    // Success states
    successMessage: () => cy.contains('success'),
    updateSuccessMessage: () => cy.contains('successfully updated'),

    // Confirmation modals
    pauseConfirmModal: () => cy.get('[role="dialog"]').contains('Pause'),
    pauseConfirmButton: () => cy.contains('button', 'Confirm Pause'),
    pauseCancelButton: () => cy.contains('button', 'Cancel'),

    // Data refresh indicators
    lastUpdatedTime: () => this.getByDataCy('last-updated'),
    autoRefreshIndicator: () => this.getByDataCy('auto-refresh-indicator'),
    dataFreshness: () => this.getByDataCy('data-freshness'),
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

  // Data refresh actions
  refreshProgressData() {
    this.logAction('Refreshing progress data');

    this.elements.refreshButton().click();
    this.expectDataRefreshing();
    this.expectDataRefreshed();

    return this;
  }

  autoRefreshData(intervalSeconds = 30) {
    this.logAction(`Setting up auto-refresh every ${intervalSeconds} seconds`);

    // This would trigger automatic data refresh
    // In real implementation, this might be handled by the component
    cy.clock();
    cy.tick(intervalSeconds * 1000);
    this.expectDataRefreshed();

    return this;
  }

  // Study control actions
  pauseDataCollection() {
    this.logAction('Pausing data collection');

    this.elements.pauseStudyButton().click();
    this.expectPauseConfirmationModal();
    this.confirmPauseAction();
    this.expectStudyPaused();

    return this;
  }

  resumeDataCollection() {
    this.logAction('Resuming data collection');

    // This would be available if study is paused
    cy.contains('button', 'Resume').click();
    this.expectStudyResumed();

    return this;
  }

  viewFullReport() {
    this.logAction('Viewing full report');

    this.elements.viewReportButton().click();

    // Should navigate to report page
    cy.url().should('include', '/report/');
    return this;
  }

  // Modal actions
  confirmPauseAction() {
    this.elements.pauseConfirmButton().click();
    return this;
  }

  cancelPauseAction() {
    this.elements.pauseCancelButton().click();
    this.expectPauseConfirmationModalClosed();
    return this;
  }

  // Page state assertions
  expectToBeOnProgressPage() {
    cy.url().should('include', '/brand-lift/progress');
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  expectProgressCardVisible() {
    this.elements.progressCard().should('be.visible');
    this.elements.progressCardHeader().should('be.visible');
    this.elements.progressCardContent().should('be.visible');
    return this;
  }

  // Progress metrics assertions
  expectProgressData(expectedData) {
    if (expectedData.current !== undefined && expectedData.target !== undefined) {
      this.elements
        .progressCounter()
        .should('contain', `${expectedData.current} / ${expectedData.target}`);
    }

    if (expectedData.percentage !== undefined) {
      this.elements
        .progressBar()
        .should('have.attr', 'aria-valuenow', expectedData.percentage.toString());
    }

    return this;
  }

  expectProgressPercentage(expectedPercentage) {
    this.elements.progressBar().should('have.attr', 'aria-valuenow', expectedPercentage.toString());
    return this;
  }

  expectResponseCounts(current, target) {
    this.elements.progressCounter().should('contain', `${current} / ${target}`);
    return this;
  }

  expectLocalDbCount(count) {
    this.elements.localDbCount().should('contain', count.toString());
    return this;
  }

  // Status assertions
  expectStudyStatus(status) {
    this.elements.statusBadge(status).should('be.visible');
    return this;
  }

  expectStudyCollecting() {
    this.expectStudyStatus('COLLECTING');
    this.elements.pauseStudyButton().should('be.visible');
    return this;
  }

  expectStudyCompleted() {
    this.expectStudyStatus('COMPLETED');
    this.elements.viewReportButton().should('be.visible');
    return this;
  }

  expectStudyPaused() {
    this.expectStudyStatus('PAUSED');
    cy.contains('button', 'Resume').should('be.visible');
    return this;
  }

  expectStudyResumed() {
    this.expectStudyStatus('COLLECTING');
    this.elements.pauseStudyButton().should('be.visible');
    return this;
  }

  // Cint integration assertions
  expectCintStatusVisible() {
    this.elements.cintStatusSection().should('be.visible');
    this.elements.cintStatus().should('be.visible');
    return this;
  }

  expectCintMetrics(expectedMetrics) {
    if (expectedMetrics.prescreens !== undefined) {
      this.elements.prescreensCount().should('contain', expectedMetrics.prescreens.toString());
    }

    if (expectedMetrics.medianIR !== undefined) {
      this.elements.medianIR().should('contain', expectedMetrics.medianIR.toString());
    }

    if (expectedMetrics.medianLOI !== undefined) {
      this.elements.medianLOI().should('contain', expectedMetrics.medianLOI.toString());
    }

    return this;
  }

  // Interim metrics assertions
  expectInterimMetricsVisible() {
    this.elements.interimMetricsCard().should('be.visible');
    this.elements.interimMetricsHeader().should('be.visible');
    return this;
  }

  expectGroupCounts(exposedCount, controlCount) {
    this.elements.exposedGroupCount().should('contain', exposedCount.toString());
    this.elements.controlGroupCount().should('contain', controlCount.toString());
    return this;
  }

  expectLiftCalculationsNote() {
    this.elements.liftCalculationsNote().should('be.visible');
    return this;
  }

  // Action button states
  expectRefreshButtonVisible() {
    this.elements.refreshButton().should('be.visible').and('not.be.disabled');
    return this;
  }

  expectPauseButtonVisible() {
    this.elements.pauseStudyButton().should('be.visible').and('not.be.disabled');
    return this;
  }

  expectViewReportButtonVisible() {
    this.elements.viewReportButton().should('be.visible').and('not.be.disabled');
    return this;
  }

  expectActionButtonsForStatus(status) {
    switch (status) {
      case 'COLLECTING':
        this.expectPauseButtonVisible();
        this.elements.viewReportButton().should('not.exist');
        break;
      case 'COMPLETED':
        this.expectViewReportButtonVisible();
        this.elements.pauseStudyButton().should('not.exist');
        break;
      case 'PAUSED':
        cy.contains('button', 'Resume').should('be.visible');
        break;
    }
    return this;
  }

  // Modal assertions
  expectPauseConfirmationModal() {
    this.elements.pauseConfirmModal().should('be.visible');
    this.elements.pauseConfirmButton().should('be.visible');
    this.elements.pauseCancelButton().should('be.visible');
    return this;
  }

  expectPauseConfirmationModalClosed() {
    this.elements.pauseConfirmModal().should('not.exist');
    return this;
  }

  // Loading state assertions
  expectLoadingState() {
    this.elements.loadingSkeleton().should('be.visible');
    return this;
  }

  expectDataRefreshing() {
    this.elements.refreshButton().should('be.disabled');
    this.elements.loadingSpinner().should('be.visible');
    return this;
  }

  expectDataRefreshed() {
    this.elements.refreshButton().should('not.be.disabled');
    this.elements.loadingSpinner().should('not.exist');
    return this;
  }

  expectContentLoaded() {
    this.elements.loadingSkeleton().should('not.exist');
    this.elements.progressCard().should('be.visible');
    return this;
  }

  // Error state assertions
  expectErrorState() {
    this.elements.errorAlert().should('be.visible');
    this.elements.tryAgainButton().should('be.visible');
    return this;
  }

  expectErrorMessage(message) {
    this.elements.errorDescription().should('contain', message);
    return this;
  }

  // Wait for page load
  waitForPageLoad() {
    this.elements.pageTitle().should('be.visible', { timeout: this.loadTimeout });
    this.elements.progressCard().should('be.visible', { timeout: this.loadTimeout });
    return this;
  }

  // Complex workflows
  monitorProgressToCompletion(targetPercentage = 100) {
    this.logAction(`Monitoring progress to ${targetPercentage}% completion`);

    const checkProgress = () => {
      this.refreshProgressData();

      cy.get('[role="progressbar"]').then($progressBar => {
        const currentProgress = parseInt($progressBar.attr('aria-valuenow') || '0');

        if (currentProgress < targetPercentage) {
          cy.wait(30000); // Wait 30 seconds
          checkProgress(); // Recursive check
        } else {
          cy.log(`✅ Progress reached ${currentProgress}%`);
        }
      });
    };

    checkProgress();
    return this;
  }

  validateProgressDataConsistency() {
    this.logAction('Validating progress data consistency');

    // Verify local DB count matches displayed current count
    let localCount, currentCount;

    this.elements.localDbCount().then($localElement => {
      localCount = parseInt($localElement.text().match(/\d+/)[0]);

      this.elements.currentValue().then($currentElement => {
        currentCount = parseInt($currentElement.text());

        expect(localCount).to.equal(currentCount);
        cy.log('✅ Local DB count matches current count');
      });
    });

    return this;
  }

  testRealTimeUpdates() {
    this.logAction('Testing real-time progress updates');

    // Get initial values
    let initialCurrent, initialTarget;

    this.elements.progressCounter().then($counter => {
      const [current, target] = $counter
        .text()
        .split(' / ')
        .map(n => parseInt(n));
      initialCurrent = current;
      initialTarget = target;

      // Refresh and verify data
      this.refreshProgressData();

      this.elements.progressCounter().then($newCounter => {
        const [newCurrent, newTarget] = $newCounter
          .text()
          .split(' / ')
          .map(n => parseInt(n));

        // Progress should be equal or greater
        expect(newCurrent).to.be.at.least(initialCurrent);
        expect(newTarget).to.equal(initialTarget); // Target shouldn't change

        cy.log('✅ Real-time updates working correctly');
      });
    });

    return this;
  }

  // Study lifecycle testing
  testStudyLifecycleTransitions() {
    this.logAction('Testing study lifecycle transitions');

    // Test different status transitions
    cy.get('body').then($body => {
      const statusText = $body.text();

      if (statusText.includes('COLLECTING')) {
        this.testCollectingToCompleted();
      } else if (statusText.includes('COMPLETED')) {
        this.testCompletedReportAccess();
      }
    });

    return this;
  }

  testCollectingToCompleted() {
    this.expectStudyCollecting();

    // Simulate reaching completion
    // In real tests, this might involve API mocking
    cy.intercept('GET', '**/progress', {
      studyStatus: 'COMPLETED',
      currentCompletes: 1000,
      targetCompletes: 1000,
    }).as('progressCompleted');

    this.refreshProgressData();
    cy.wait('@progressCompleted');

    this.expectStudyCompleted();
    return this;
  }

  testCompletedReportAccess() {
    this.expectStudyCompleted();
    this.expectViewReportButtonVisible();

    // Test report navigation
    this.viewFullReport();
    return this;
  }

  // Error handling
  handleProgressErrors() {
    cy.get('body').then($body => {
      if ($body.text().includes('Error') || $body.find('[role="alert"]').length > 0) {
        cy.log('⚠️ Progress tracking error detected');
        this.takeScreenshot('progress-error');

        // Try to recover by refreshing
        this.elements.tryAgainButton().click();
      }
    });
    return this;
  }

  // Performance monitoring
  measureProgressRefresh() {
    return this.measureInteractionTime(
      () => {
        this.refreshProgressData();
      },
      {
        actionName: 'progress-data-refresh',
        performanceBudget: 3000, // 3 seconds for data refresh
      }
    );
  }

  measureStudyPause() {
    return this.measureInteractionTime(
      () => {
        this.pauseDataCollection();
      },
      {
        actionName: 'study-pause-action',
        performanceBudget: 2000, // 2 seconds for pause action
      }
    );
  }

  // Responsive design testing
  testMobileProgress() {
    cy.viewport('iphone-6');
    this.expectProgressCardVisible();
    this.expectRefreshButtonVisible();
    cy.viewport(1280, 720); // Reset
    return this;
  }

  // Accessibility testing
  checkProgressAccessibility() {
    cy.checkA11y('[data-cy="progress-container"]', {
      rules: {
        'color-contrast': { enabled: true },
        'aria-labels': { enabled: true },
        'keyboard-navigation': { enabled: true },
      },
    });
    return this;
  }

  // Data validation
  validateProgressMetrics(expectedMetrics) {
    this.logAction('Validating progress metrics');

    if (expectedMetrics.responseCount !== undefined) {
      this.expectResponseCounts(
        expectedMetrics.responseCount.current,
        expectedMetrics.responseCount.target
      );
    }

    if (expectedMetrics.percentage !== undefined) {
      this.expectProgressPercentage(expectedMetrics.percentage);
    }

    if (expectedMetrics.cint !== undefined) {
      this.expectCintMetrics(expectedMetrics.cint);
    }

    if (expectedMetrics.groups !== undefined) {
      this.expectGroupCounts(expectedMetrics.groups.exposed, expectedMetrics.groups.control);
    }

    return this;
  }
}
