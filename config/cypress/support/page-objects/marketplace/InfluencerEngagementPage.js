import { BasePage } from '../shared/BasePage.js';

/**
 * Influencer Engagement Page Object Model
 * Handles communication and booking functionality
 * 
 * Covers:
 * - Add to campaign functionality
 * - Communication workflows
 * - Booking and collaboration processes
 * - Campaign assignment and management
 * - Bulk operations and selections
 * - Engagement tracking and history
 */

export class InfluencerEngagementPage extends BasePage {
    constructor() {
        super();
        this.pageUrl = '/influencer-marketplace';
        this.pageTitle = 'Influencer Engagement';
    }

    // Element selectors using data-cy attributes
    elements = {
        // Add to campaign interface
        addToCampaignButton: () => cy.get('[data-testid="add-to-campaign-button"]'),
        addToCampaignDialog: () => cy.get('[data-testid="add-to-campaign-dialog"]'),
        addToCampaignTitle: () => cy.contains('Add to Campaign'),

        // Campaign selection
        campaignSelect: () => cy.get('select[data-testid="campaign-select"]'),
        campaignOption: (campaignName) => cy.get('option').contains(campaignName),
        createNewCampaignButton: () => cy.contains('button', 'Create New Campaign'),
        campaignSearchInput: () => cy.get('input[placeholder*="Search campaigns"]'),

        // Platform selection
        platformSelect: () => cy.get('select[data-testid="platform-select"]'),
        platformOption: (platform) => cy.get(`option[value="${platform}"]`),
        platformRadio: (platform) => cy.get(`input[type="radio"][value="${platform}"]`),

        // Influencer information in dialog
        influencerInfo: () => cy.get('[data-testid="influencer-info"]'),
        influencerName: () => cy.get('[data-testid="influencer-name"]'),
        influencerHandle: () => cy.get('[data-testid="influencer-handle"]'),
        influencerPlatform: () => cy.get('[data-testid="influencer-platform"]'),
        influencerAvatar: () => cy.get('[data-testid="influencer-avatar"]'),
        influencerStats: () => cy.get('[data-testid="influencer-stats"]'),

        // Engagement options
        engagementType: () => cy.get('[data-testid="engagement-type"]'),
        collaborationType: (type) => cy.get(`input[value="${type}"]`),
        sponsoredPost: () => this.elements.collaborationType('sponsored-post'),
        storyMention: () => this.elements.collaborationType('story-mention'),
        videoContent: () => this.elements.collaborationType('video-content'),
        productReview: () => this.elements.collaborationType('product-review'),
        brandAmbassador: () => this.elements.collaborationType('brand-ambassador'),

        // Collaboration details
        collaborationDetails: () => cy.get('[data-testid="collaboration-details"]'),
        deliverableDescription: () => cy.get('textarea[data-testid="deliverable-description"]'),
        budgetInput: () => cy.get('input[data-testid="budget-input"]'),
        timelineSelect: () => cy.get('select[data-testid="timeline-select"]'),

        // Communication section
        communicationSection: () => cy.get('[data-testid="communication-section"]'),
        messageTextarea: () => cy.get('textarea[data-testid="message-textarea"]'),
        messageTemplateSelect: () => cy.get('select[data-testid="message-template"]'),
        attachmentInput: () => cy.get('input[type="file"][data-testid="attachment-input"]'),

        // Contact preferences
        contactPreferences: () => cy.get('[data-testid="contact-preferences"]'),
        contactMethod: (method) => cy.get(`input[value="${method}"]`),
        emailContact: () => this.elements.contactMethod('email'),
        directMessage: () => this.elements.contactMethod('dm'),
        phoneContact: () => this.elements.contactMethod('phone'),

        // Terms and conditions
        termsSection: () => cy.get('[data-testid="terms-section"]'),
        termsCheckbox: () => cy.get('input[data-testid="terms-checkbox"]'),
        termsLink: () => cy.get('a[data-testid="terms-link"]'),
        privacyCheckbox: () => cy.get('input[data-testid="privacy-checkbox"]'),

        // Action buttons
        actionButtons: () => cy.get('[data-testid="action-buttons"]'),
        addToCampaignConfirm: () => cy.contains('button', 'Add to Campaign'),
        sendInviteButton: () => cy.contains('button', 'Send Invite'),
        saveAsDraftButton: () => cy.contains('button', 'Save as Draft'),
        cancelButton: () => cy.contains('button', 'Cancel'),

        // Bulk operations
        bulkAddDialog: () => cy.get('[role="alertdialog"]'),
        bulkAddTitle: () => cy.contains('[role="alertdialog"] h2', 'Add'),
        bulkCampaignSelect: () => cy.get('select[data-testid="bulk-campaign-select"]'),
        bulkPlatformOptions: () => cy.get('[data-testid="bulk-platform-options"]'),
        bulkConfirmButton: () => cy.contains('button', 'Add Influencers'),
        bulkCancelButton: () => cy.contains('button', 'Cancel'),

        // Selection interface
        selectionInterface: () => cy.get('[data-testid="selection-interface"]'),
        selectAllCheckbox: () => cy.get('input[data-testid="select-all"]'),
        selectedCount: () => cy.get('[data-testid="selected-count"]'),
        selectionActions: () => cy.get('[data-testid="selection-actions"]'),
        clearSelectionButton: () => cy.contains('button', 'Clear Selection'),

        // Engagement history
        engagementHistory: () => cy.get('[data-testid="engagement-history"]'),
        historyItem: (index) => cy.get(`[data-testid="history-item-${index}"]`),
        historyDate: (index) => cy.get(`[data-testid="history-date-${index}"]`),
        historyAction: (index) => cy.get(`[data-testid="history-action-${index}"]`),
        historyCampaign: (index) => cy.get(`[data-testid="history-campaign-${index}"]`),

        // Status indicators
        engagementStatus: () => cy.get('[data-testid="engagement-status"]'),
        statusBadge: (status) => cy.get(`[data-testid="status-${status}"]`),
        pendingStatus: () => this.elements.statusBadge('pending'),
        acceptedStatus: () => this.elements.statusBadge('accepted'),
        rejectedStatus: () => this.elements.statusBadge('rejected'),
        completedStatus: () => this.elements.statusBadge('completed'),

        // Loading states
        addToCampaignLoading: () => cy.get('[data-testid="add-to-campaign-loading"]'),
        campaignListLoading: () => cy.get('[data-testid="campaign-list-loading"]'),
        submitLoading: () => cy.get('[data-testid="submit-loading"]'),

        // Error states
        engagementError: () => cy.get('[data-testid="engagement-error"]'),
        campaignLoadError: () => cy.get('[data-testid="campaign-load-error"]'),
        submissionError: () => cy.get('[data-testid="submission-error"]'),

        // Success states
        successMessage: () => cy.get('[data-testid="success-message"]'),
        campaignAddedSuccess: () => cy.contains('successfully added'),
        inviteSentSuccess: () => cy.contains('Invitation sent'),

        // Toast notifications
        successToast: () => cy.contains('[role="status"]', 'success'),
        errorToast: () => cy.contains('[role="status"]', 'error'),
        loadingToast: () => cy.contains('[role="status"]', 'loading'),

        // Collaboration management
        collaborationCard: () => cy.get('[data-testid="collaboration-card"]'),
        collaborationTitle: () => cy.get('[data-testid="collaboration-title"]'),
        collaborationDescription: () => cy.get('[data-testid="collaboration-description"]'),
        collaborationBudget: () => cy.get('[data-testid="collaboration-budget"]'),
        collaborationTimeline: () => cy.get('[data-testid="collaboration-timeline"]'),

        // Performance tracking
        engagementMetrics: () => cy.get('[data-testid="engagement-metrics"]'),
        responseRate: () => cy.get('[data-testid="response-rate"]'),
        acceptanceRate: () => cy.get('[data-testid="acceptance-rate"]'),
        completionRate: () => cy.get('[data-testid="completion-rate"]'),

        // Filters and search for campaigns
        campaignFilters: () => cy.get('[data-testid="campaign-filters"]'),
        activeCampaignsFilter: () => cy.get('input[data-testid="active-campaigns"]'),
        draftCampaignsFilter: () => cy.get('input[data-testid="draft-campaigns"]'),
        campaignTypeFilter: () => cy.get('select[data-testid="campaign-type-filter"]'),
    };

    // Add to campaign functionality
    openAddToCampaignDialog() {
        this.logAction('Opening add to campaign dialog');
        this.elements.addToCampaignButton().click();
        this.expectAddToCampaignDialogVisible();
        return this;
    }

    closeAddToCampaignDialog() {
        this.logAction('Closing add to campaign dialog');
        this.elements.cancelButton().click();
        this.expectAddToCampaignDialogHidden();
        return this;
    }

    // Campaign selection
    selectCampaign(campaignName) {
        this.logAction(`Selecting campaign: ${campaignName}`);
        this.elements.campaignSelect().select(campaignName);
        return this;
    }

    searchForCampaign(searchTerm) {
        this.logAction(`Searching for campaign: ${searchTerm}`);
        this.elements.campaignSearchInput().type(searchTerm);
        return this;
    }

    createNewCampaign() {
        this.logAction('Creating new campaign');
        this.elements.createNewCampaignButton().click();
        // Should navigate to campaign creation page
        return this;
    }

    // Platform selection
    selectPlatform(platform) {
        this.logAction(`Selecting platform: ${platform}`);
        this.elements.platformSelect().select(platform);
        return this;
    }

    selectPlatformRadio(platform) {
        this.logAction(`Selecting platform via radio: ${platform}`);
        this.elements.platformRadio(platform).check();
        return this;
    }

    // Collaboration type selection
    selectCollaborationType(type) {
        this.logAction(`Selecting collaboration type: ${type}`);
        this.elements.collaborationType(type).check();
        return this;
    }

    selectSponsoredPost() {
        return this.selectCollaborationType('sponsored-post');
    }

    selectStoryMention() {
        return this.selectCollaborationType('story-mention');
    }

    selectVideoContent() {
        return this.selectCollaborationType('video-content');
    }

    selectProductReview() {
        return this.selectCollaborationType('product-review');
    }

    selectBrandAmbassador() {
        return this.selectCollaborationType('brand-ambassador');
    }

    // Collaboration details
    setDeliverableDescription(description) {
        this.logAction(`Setting deliverable description: ${description}`);
        this.elements.deliverableDescription().clear().type(description);
        return this;
    }

    setBudget(amount) {
        this.logAction(`Setting budget: ${amount}`);
        this.elements.budgetInput().clear().type(amount.toString());
        return this;
    }

    setTimeline(timeline) {
        this.logAction(`Setting timeline: ${timeline}`);
        this.elements.timelineSelect().select(timeline);
        return this;
    }

    // Communication
    composeMessage(message) {
        this.logAction(`Composing message: ${message}`);
        this.elements.messageTextarea().clear().type(message);
        return this;
    }

    selectMessageTemplate(template) {
        this.logAction(`Selecting message template: ${template}`);
        this.elements.messageTemplateSelect().select(template);
        return this;
    }

    attachFile(filePath) {
        this.logAction(`Attaching file: ${filePath}`);
        this.elements.attachmentInput().selectFile(filePath);
        return this;
    }

    // Contact preferences
    selectContactMethod(method) {
        this.logAction(`Selecting contact method: ${method}`);
        this.elements.contactMethod(method).check();
        return this;
    }

    selectEmailContact() {
        return this.selectContactMethod('email');
    }

    selectDirectMessage() {
        return this.selectContactMethod('dm');
    }

    selectPhoneContact() {
        return this.selectContactMethod('phone');
    }

    // Terms and conditions
    acceptTerms() {
        this.logAction('Accepting terms and conditions');
        this.elements.termsCheckbox().check();
        return this;
    }

    acceptPrivacy() {
        this.logAction('Accepting privacy policy');
        this.elements.privacyCheckbox().check();
        return this;
    }

    viewTerms() {
        this.logAction('Viewing terms and conditions');
        this.elements.termsLink().click();
        return this;
    }

    // Actions
    confirmAddToCampaign() {
        this.logAction('Confirming add to campaign');
        this.elements.addToCampaignConfirm().click();
        this.expectCampaignAddSuccess();
        return this;
    }

    sendInvitation() {
        this.logAction('Sending invitation');
        this.elements.sendInviteButton().click();
        this.expectInvitationSent();
        return this;
    }

    saveAsDraft() {
        this.logAction('Saving as draft');
        this.elements.saveAsDraftButton().click();
        return this;
    }

    cancelEngagement() {
        this.logAction('Cancelling engagement');
        this.elements.cancelButton().click();
        return this;
    }

    // Bulk operations
    openBulkAddDialog() {
        this.logAction('Opening bulk add dialog');
        // Assumes some influencers are already selected
        this.elements.bulkAddDialog().should('be.visible');
        return this;
    }

    selectBulkCampaign(campaignName) {
        this.logAction(`Selecting bulk campaign: ${campaignName}`);
        this.elements.bulkCampaignSelect().select(campaignName);
        return this;
    }

    confirmBulkAdd() {
        this.logAction('Confirming bulk add operation');
        this.elements.bulkConfirmButton().click();
        this.expectBulkAddSuccess();
        return this;
    }

    cancelBulkAdd() {
        this.logAction('Cancelling bulk add operation');
        this.elements.bulkCancelButton().click();
        return this;
    }

    // Selection management
    selectAllInfluencers() {
        this.logAction('Selecting all influencers');
        this.elements.selectAllCheckbox().check();
        return this;
    }

    clearSelection() {
        this.logAction('Clearing selection');
        this.elements.clearSelectionButton().click();
        return this;
    }

    // Campaign filtering
    filterActiveCampaigns() {
        this.logAction('Filtering active campaigns');
        this.elements.activeCampaignsFilter().check();
        return this;
    }

    filterDraftCampaigns() {
        this.logAction('Filtering draft campaigns');
        this.elements.draftCampaignsFilter().check();
        return this;
    }

    filterCampaignsByType(type) {
        this.logAction(`Filtering campaigns by type: ${type}`);
        this.elements.campaignTypeFilter().select(type);
        return this;
    }

    // Assertions
    expectAddToCampaignDialogVisible() {
        this.elements.addToCampaignDialog().should('be.visible');
        this.elements.addToCampaignTitle().should('be.visible');
        return this;
    }

    expectAddToCampaignDialogHidden() {
        this.elements.addToCampaignDialog().should('not.exist');
        return this;
    }

    expectInfluencerInfoVisible() {
        this.elements.influencerInfo().should('be.visible');
        this.elements.influencerName().should('be.visible');
        this.elements.influencerHandle().should('be.visible');
        return this;
    }

    expectCampaignOptionsVisible() {
        this.elements.campaignSelect().should('be.visible');
        return this;
    }

    expectPlatformOptionsVisible() {
        this.elements.platformSelect().should('be.visible');
        return this;
    }

    expectCollaborationDetailsVisible() {
        this.elements.collaborationDetails().should('be.visible');
        this.elements.deliverableDescription().should('be.visible');
        return this;
    }

    expectCommunicationSectionVisible() {
        this.elements.communicationSection().should('be.visible');
        this.elements.messageTextarea().should('be.visible');
        return this;
    }

    expectTermsVisible() {
        this.elements.termsSection().should('be.visible');
        this.elements.termsCheckbox().should('be.visible');
        return this;
    }

    expectActionButtonsVisible() {
        this.elements.actionButtons().should('be.visible');
        this.elements.addToCampaignConfirm().should('be.visible');
        return this;
    }

    expectCampaignAddSuccess() {
        this.elements.successToast().should('be.visible');
        this.elements.campaignAddedSuccess().should('be.visible');
        return this;
    }

    expectInvitationSent() {
        this.elements.successToast().should('be.visible');
        this.elements.inviteSentSuccess().should('be.visible');
        return this;
    }

    expectBulkAddDialogVisible() {
        this.elements.bulkAddDialog().should('be.visible');
        this.elements.bulkAddTitle().should('be.visible');
        return this;
    }

    expectBulkAddSuccess() {
        this.elements.successToast().should('be.visible');
        this.elements.bulkAddDialog().should('not.exist');
        return this;
    }

    expectSelectionCount(count) {
        this.elements.selectedCount().should('contain', count.toString());
        return this;
    }

    expectEngagementStatus(status) {
        this.elements.statusBadge(status).should('be.visible');
        return this;
    }

    expectEngagementHistory() {
        this.elements.engagementHistory().should('be.visible');
        this.elements.historyItem(0).should('be.visible');
        return this;
    }

    expectEngagementMetrics() {
        this.elements.engagementMetrics().should('be.visible');
        this.elements.responseRate().should('be.visible');
        return this;
    }

    // Error state assertions
    expectEngagementError(message) {
        this.elements.engagementError().should('be.visible');
        this.elements.engagementError().should('contain', message);
        return this;
    }

    expectCampaignLoadError() {
        this.elements.campaignLoadError().should('be.visible');
        return this;
    }

    expectSubmissionError() {
        this.elements.submissionError().should('be.visible');
        return this;
    }

    // Loading state assertions
    expectLoadingState() {
        this.elements.addToCampaignLoading().should('be.visible');
        return this;
    }

    expectContentLoaded() {
        this.elements.addToCampaignLoading().should('not.exist');
        this.elements.campaignSelect().should('be.visible');
        return this;
    }

    // Complex workflows
    performCompleteEngagementWorkflow(influencerName, campaignName, collaborationDetails) {
        this.logAction('Performing complete engagement workflow');

        // Open add to campaign dialog
        this.openAddToCampaignDialog();
        this.expectInfluencerInfoVisible();

        // Select campaign and platform
        this.selectCampaign(campaignName);
        this.selectPlatform('INSTAGRAM');

        // Set collaboration details
        this.selectCollaborationType(collaborationDetails.type);
        this.setDeliverableDescription(collaborationDetails.description);
        this.setBudget(collaborationDetails.budget);
        this.setTimeline(collaborationDetails.timeline);

        // Add communication
        this.composeMessage(collaborationDetails.message);
        this.selectContactMethod('email');

        // Accept terms
        this.acceptTerms();
        this.acceptPrivacy();

        // Confirm addition
        this.confirmAddToCampaign();

        return this;
    }

    performBulkEngagementWorkflow(campaignName, influencerCount) {
        this.logAction(`Performing bulk engagement workflow for ${influencerCount} influencers`);

        // Verify selection
        this.expectSelectionCount(influencerCount);
        this.expectBulkAddDialogVisible();

        // Select campaign
        this.selectBulkCampaign(campaignName);

        // Confirm bulk operation
        this.confirmBulkAdd();

        return this;
    }

    testEngagementTypes() {
        this.logAction('Testing different engagement types');

        const engagementTypes = [
            'sponsored-post',
            'story-mention',
            'video-content',
            'product-review',
            'brand-ambassador'
        ];

        this.openAddToCampaignDialog();

        engagementTypes.forEach(type => {
            this.selectCollaborationType(type);
            // Verify selection and appropriate fields appear
        });

        return this;
    }

    testCommunicationOptions() {
        this.logAction('Testing communication options');

        this.openAddToCampaignDialog();

        // Test message templates
        this.selectMessageTemplate('collaboration-invite');
        this.selectMessageTemplate('follow-up');

        // Test contact methods
        this.selectEmailContact();
        this.selectDirectMessage();
        this.selectPhoneContact();

        return this;
    }

    testCampaignFiltering() {
        this.logAction('Testing campaign filtering');

        this.openAddToCampaignDialog();

        // Test different filters
        this.filterActiveCampaigns();
        this.expectCampaignOptionsVisible();

        this.filterDraftCampaigns();
        this.expectCampaignOptionsVisible();

        this.filterCampaignsByType('influencer-marketing');
        this.expectCampaignOptionsVisible();

        return this;
    }

    // Error handling
    handleEngagementErrors() {
        cy.get('body').then($body => {
            if ($body.find('[data-testid="engagement-error"]').length > 0) {
                cy.log('⚠️ Engagement error detected');
                this.takeScreenshot('engagement-error');

                // Try to close dialog and retry
                this.cancelEngagement();
            }
        });
        return this;
    }

    // Performance monitoring
    measureEngagementPerformance(engagementFn) {
        return this.measureInteractionTime(engagementFn, {
            actionName: 'engagement-performance',
            performanceBudget: 2000 // 2 seconds for engagement operations
        });
    }

    measureCampaignLoadPerformance() {
        return this.measurePageLoadTime({
            actionName: 'campaign-load-performance',
            performanceBudget: 1500 // 1.5 seconds for campaign loading
        });
    }

    // Accessibility testing
    checkEngagementAccessibility() {
        this.openAddToCampaignDialog();
        cy.checkA11y('[data-testid="add-to-campaign-dialog"]', {
            rules: {
                'keyboard-navigation': { enabled: true },
                'aria-labels': { enabled: true },
                'form-labels': { enabled: true },
                'color-contrast': { enabled: true }
            }
        });
        return this;
    }

    // Integration testing
    testCampaignIntegration() {
        this.logAction('Testing campaign integration');

        // Test adding influencer to campaign
        this.performCompleteEngagementWorkflow(
            'Test Influencer',
            'Test Campaign',
            {
                type: 'sponsored-post',
                description: 'Create sponsored post for new product launch',
                budget: 1000,
                timeline: '2-weeks',
                message: 'We would love to collaborate with you on our new campaign!'
            }
        );

        // Verify integration worked
        this.expectCampaignAddSuccess();

        return this;
    }

    // Complete engagement workflow testing
    testCompleteEngagementWorkflow() {
        this.logAction('Testing complete engagement functionality');

        // Test individual engagement
        this.performCompleteEngagementWorkflow(
            'Fashion Influencer',
            'Summer Collection Campaign',
            {
                type: 'sponsored-post',
                description: 'Showcase summer collection with 3 outfit posts',
                budget: 2500,
                timeline: '1-month',
                message: 'Hi! We love your style and would like to collaborate on our summer campaign.'
            }
        );

        // Test bulk engagement
        this.performBulkEngagementWorkflow('Beauty Campaign', 5);

        // Test different engagement types
        this.testEngagementTypes();

        // Test communication options
        this.testCommunicationOptions();

        // Test campaign filtering
        this.testCampaignFiltering();

        return this;
    }
} 