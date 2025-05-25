import { BasePage } from '../shared/BasePage.js';

/**
 * Influencer Profile Page Object Model
 * Handles individual influencer profile details and interactions
 * 
 * Covers:
 * - Profile header and basic information
 * - Analytics tabs (Performance, Audience, Content, Demographics, etc.)
 * - Add to campaign functionality
 * - Risk report generation
 * - Profile editing and management actions
 * - Error handling and loading states
 */

export class InfluencerProfilePage extends BasePage {
    constructor() {
        super();
        this.pageUrl = '/influencer-marketplace';
        this.pageTitle = 'Influencer Profile';
    }

    // Element selectors using data-cy attributes
    elements = {
        // Main page container
        profileContainer: () => cy.get('.min-h-screen'),

        // Top navigation bar
        topBar: () => cy.get('.flex.justify-between.items-center').first(),
        backButton: () => cy.contains('button', 'Back to Marketplace'),
        removeButton: () => cy.contains('button', 'Remove'),
        editProfileButton: () => cy.contains('button', 'Edit Profile'),
        riskReportButton: () => cy.contains('button', 'Risk Report'),
        addToCampaignButton: () => cy.get('[data-testid="add-to-campaign-button"]'),

        // Profile header section
        profileHeader: () => cy.get('[data-testid="profile-header"]'),
        profileAvatar: () => cy.get('[data-testid="profile-avatar"]'),
        profileName: () => cy.get('[data-testid="profile-name"]'),
        profileHandle: () => cy.get('[data-testid="profile-handle"]'),
        profileBio: () => cy.get('[data-testid="profile-bio"]'),
        profilePlatform: () => cy.get('[data-testid="profile-platform"]'),
        profileFollowers: () => cy.get('[data-testid="profile-followers"]'),
        profileEngagement: () => cy.get('[data-testid="profile-engagement"]'),
        profileVerified: () => cy.get('[data-testid="profile-verified"]'),
        profileScore: () => cy.get('[data-testid="profile-score"]'),

        // Analytics tabs
        tabsList: () => cy.get('[role="tablist"]'),
        tabTrigger: (tabName) => cy.get(`[role="tab"][value="${tabName}"]`),
        tabContent: (tabName) => cy.get(`[role="tabpanel"][data-state="active"]`),

        // Performance tab
        performanceTab: () => this.elements.tabTrigger('performance'),
        performanceContent: () => cy.get('[data-testid="performance-section"]'),
        performanceMetrics: () => cy.get('[data-testid="performance-metrics"]'),
        engagementChart: () => cy.get('[data-testid="engagement-chart"]'),
        growthChart: () => cy.get('[data-testid="growth-chart"]'),

        // Audience tab
        audienceTab: () => this.elements.tabTrigger('audience'),
        audienceContent: () => cy.get('[data-testid="audience-section"]'),
        audienceDemographics: () => cy.get('[data-testid="audience-demographics"]'),
        audienceInterests: () => cy.get('[data-testid="audience-interests"]'),
        audienceQuality: () => cy.get('[data-testid="audience-quality"]'),

        // Content tab
        contentTab: () => this.elements.tabTrigger('content'),
        contentContent: () => cy.get('[data-testid="content-section"]'),
        contentGrid: () => cy.get('[data-testid="content-grid"]'),
        contentPost: (index) => cy.get(`[data-testid="content-post-${index}"]`),
        contentAnalytics: () => cy.get('[data-testid="content-analytics"]'),

        // Demographics tab
        demographicsTab: () => this.elements.tabTrigger('demographics'),
        demographicsContent: () => cy.get('[data-testid="demographics-section"]'),
        ageDistribution: () => cy.get('[data-testid="age-distribution"]'),
        genderDistribution: () => cy.get('[data-testid="gender-distribution"]'),
        locationDistribution: () => cy.get('[data-testid="location-distribution"]'),

        // Contact tab
        contactTab: () => this.elements.tabTrigger('contact'),
        contactContent: () => cy.get('[data-testid="contact-section"]'),
        contactEmail: () => cy.get('[data-testid="contact-email"]'),
        contactPhone: () => cy.get('[data-testid="contact-phone"]'),
        contactSocial: () => cy.get('[data-testid="contact-social"]'),
        contactAgent: () => cy.get('[data-testid="contact-agent"]'),

        // Platform tab
        platformTab: () => this.elements.tabTrigger('platform'),
        platformContent: () => cy.get('[data-testid="platform-section"]'),
        platformSpecificData: () => cy.get('[data-testid="platform-specific-data"]'),
        platformMetrics: () => cy.get('[data-testid="platform-metrics"]'),

        // Advanced tab
        advancedTab: () => this.elements.tabTrigger('advanced'),
        advancedContent: () => cy.get('[data-testid="advanced-section"]'),
        advancedAnalytics: () => cy.get('[data-testid="advanced-analytics"]'),
        aiInsights: () => cy.get('[data-testid="ai-insights"]'),
        predictiveMetrics: () => cy.get('[data-testid="predictive-metrics"]'),

        // Risk tab
        riskTab: () => this.elements.tabTrigger('risk'),
        riskContent: () => cy.get('[data-testid="risk-section"]'),
        riskScore: () => cy.get('[data-testid="risk-score"]'),
        riskFactors: () => cy.get('[data-testid="risk-factors"]'),
        certificationStatus: () => cy.get('[data-testid="certification-status"]'),
        brandSafety: () => cy.get('[data-testid="brand-safety"]'),

        // Campaigns tab
        campaignsTab: () => this.elements.tabTrigger('campaigns'),
        campaignsContent: () => cy.get('[data-testid="campaigns-section"]'),
        recentCampaigns: () => cy.get('[data-testid="recent-campaigns"]'),
        campaignHistory: () => cy.get('[data-testid="campaign-history"]'),
        campaignPerformance: () => cy.get('[data-testid="campaign-performance"]'),

        // Risk report dialog
        riskReportDialog: () => cy.get('[role="alertdialog"]'),
        riskReportDialogTitle: () => cy.contains('[role="alertdialog"] h2', 'Risk Assessment'),
        riskReportDialogDescription: () => cy.contains('comprehensive risk report'),
        generateReportButton: () => cy.contains('button', 'Generate Report'),
        cancelReportButton: () => cy.contains('button', 'Cancel'),

        // Add to campaign dialog
        addToCampaignDialog: () => cy.get('[data-testid="add-to-campaign-dialog"]'),
        campaignSelect: () => cy.get('[data-testid="campaign-select"]'),
        platformSelect: () => cy.get('[data-testid="platform-select"]'),
        addToCampaignConfirm: () => cy.contains('button', 'Add to Campaign'),
        addToCampaignCancel: () => cy.contains('button', 'Cancel'),

        // Loading states
        profileSkeleton: () => cy.get('[data-testid="profile-skeleton"]'),
        tabsSkeleton: () => cy.get('[data-testid="tabs-skeleton"]'),
        loadingSpinner: () => cy.get('.animate-spin'),

        // Error states
        errorDisplay: () => cy.get('[data-testid="error-display"]'),
        errorIcon: () => cy.get('[data-testid="error-icon"]'),
        errorTitle: () => cy.get('[data-testid="error-title"]'),
        errorMessage: () => cy.get('[data-testid="error-message"]'),

        // Toast notifications
        successToast: () => cy.contains('[role="status"]', 'success'),
        errorToast: () => cy.contains('[role="status"]', 'error'),
        loadingToast: () => cy.contains('[role="status"]', 'loading'),
        riskReportToast: () => cy.contains('Risk report ready'),
        campaignAddToast: () => cy.contains('added to'),
    };

    // Page navigation actions
    visitProfile(handle, platform = 'INSTAGRAM') {
        const profileUrl = `${this.pageUrl}/${encodeURIComponent(handle)}?platform=${platform}`;
        cy.visit(profileUrl);
        this.waitForProfileLoad();
        return this;
    }

    // Navigation actions
    goBackToMarketplace() {
        this.logAction('Navigating back to marketplace');
        this.elements.backButton().click();
        cy.url().should('include', '/influencer-marketplace');
        return this;
    }

    // Profile header interactions
    viewProfileDetails() {
        this.logAction('Viewing profile details');
        this.elements.profileHeader().should('be.visible');
        return this;
    }

    checkProfileVerification() {
        this.logAction('Checking profile verification status');
        this.elements.profileVerified().should('be.visible');
        return this;
    }

    // Tab navigation
    switchToTab(tabName) {
        this.logAction(`Switching to ${tabName} tab`);
        this.elements.tabTrigger(tabName).click();
        this.expectTabActive(tabName);
        return this;
    }

    switchToPerformanceTab() {
        return this.switchToTab('performance');
    }

    switchToAudienceTab() {
        return this.switchToTab('audience');
    }

    switchToContentTab() {
        return this.switchToTab('content');
    }

    switchToDemographicsTab() {
        return this.switchToTab('demographics');
    }

    switchToContactTab() {
        return this.switchToTab('contact');
    }

    switchToPlatformTab() {
        return this.switchToTab('platform');
    }

    switchToAdvancedTab() {
        return this.switchToTab('advanced');
    }

    switchToRiskTab() {
        return this.switchToTab('risk');
    }

    switchToCampaignsTab() {
        return this.switchToTab('campaigns');
    }

    // Performance tab actions
    viewPerformanceMetrics() {
        this.logAction('Viewing performance metrics');
        this.switchToPerformanceTab();
        this.elements.performanceMetrics().should('be.visible');
        return this;
    }

    analyzeEngagementChart() {
        this.logAction('Analyzing engagement chart');
        this.elements.engagementChart().should('be.visible');
        return this;
    }

    // Audience tab actions
    viewAudienceDemographics() {
        this.logAction('Viewing audience demographics');
        this.switchToAudienceTab();
        this.elements.audienceDemographics().should('be.visible');
        return this;
    }

    checkAudienceQuality() {
        this.logAction('Checking audience quality metrics');
        this.elements.audienceQuality().should('be.visible');
        return this;
    }

    // Content tab actions
    viewContentGrid() {
        this.logAction('Viewing content grid');
        this.switchToContentTab();
        this.elements.contentGrid().should('be.visible');
        return this;
    }

    analyzeContentPost(index) {
        this.logAction(`Analyzing content post ${index}`);
        this.elements.contentPost(index).click();
        return this;
    }

    // Demographics tab actions
    viewAgeDistribution() {
        this.logAction('Viewing age distribution');
        this.switchToDemographicsTab();
        this.elements.ageDistribution().should('be.visible');
        return this;
    }

    viewGenderDistribution() {
        this.logAction('Viewing gender distribution');
        this.elements.genderDistribution().should('be.visible');
        return this;
    }

    viewLocationDistribution() {
        this.logAction('Viewing location distribution');
        this.elements.locationDistribution().should('be.visible');
        return this;
    }

    // Contact tab actions
    viewContactInformation() {
        this.logAction('Viewing contact information');
        this.switchToContactTab();
        this.elements.contactContent().should('be.visible');
        return this;
    }

    checkContactEmail() {
        this.logAction('Checking contact email');
        this.elements.contactEmail().should('be.visible');
        return this;
    }

    // Risk tab actions
    viewRiskAssessment() {
        this.logAction('Viewing risk assessment');
        this.switchToRiskTab();
        this.elements.riskScore().should('be.visible');
        return this;
    }

    checkCertificationStatus() {
        this.logAction('Checking certification status');
        this.elements.certificationStatus().should('be.visible');
        return this;
    }

    // Risk report generation
    requestRiskReport() {
        this.logAction('Requesting risk report');
        this.elements.riskReportButton().click();
        this.expectRiskReportDialogVisible();
        this.elements.generateReportButton().click();
        this.expectRiskReportGenerated();
        return this;
    }

    cancelRiskReport() {
        this.logAction('Cancelling risk report request');
        this.elements.riskReportButton().click();
        this.elements.cancelReportButton().click();
        return this;
    }

    // Add to campaign functionality
    addInfluencerToCampaign(campaignName, platform = null) {
        this.logAction(`Adding influencer to campaign: ${campaignName}`);
        this.elements.addToCampaignButton().click();
        this.expectAddToCampaignDialogVisible();

        this.elements.campaignSelect().select(campaignName);

        if (platform) {
            this.elements.platformSelect().select(platform);
        }

        this.elements.addToCampaignConfirm().click();
        this.expectCampaignAddSuccess();
        return this;
    }

    cancelAddToCampaign() {
        this.logAction('Cancelling add to campaign');
        this.elements.addToCampaignButton().click();
        this.elements.addToCampaignCancel().click();
        return this;
    }

    // Profile management actions
    editProfile() {
        this.logAction('Editing profile');
        this.elements.editProfileButton().click();
        // Should navigate to edit page or open edit modal
        return this;
    }

    removeProfile() {
        this.logAction('Removing profile');
        this.elements.removeButton().click();
        // Should show confirmation dialog
        return this;
    }

    // Page state assertions
    expectToBeOnProfilePage(handle) {
        cy.url().should('include', `/influencer-marketplace/${handle}`);
        this.elements.profileHeader().should('be.visible');
        return this;
    }

    expectProfileHeaderVisible() {
        this.elements.profileHeader().should('be.visible');
        this.elements.profileName().should('be.visible');
        this.elements.profileHandle().should('be.visible');
        return this;
    }

    expectProfileDataLoaded() {
        this.elements.profileSkeleton().should('not.exist');
        this.elements.profileName().should('be.visible');
        this.elements.profileFollowers().should('be.visible');
        return this;
    }

    // Tab assertions
    expectTabActive(tabName) {
        this.elements.tabTrigger(tabName).should('have.attr', 'data-state', 'active');
        this.elements.tabContent(tabName).should('be.visible');
        return this;
    }

    expectAllTabsVisible() {
        const tabs = ['performance', 'audience', 'content', 'demographics', 'contact', 'platform', 'advanced', 'risk', 'campaigns'];
        tabs.forEach(tab => {
            this.elements.tabTrigger(tab).should('be.visible');
        });
        return this;
    }

    // Performance tab assertions
    expectPerformanceDataVisible() {
        this.elements.performanceMetrics().should('be.visible');
        this.elements.engagementChart().should('be.visible');
        return this;
    }

    expectEngagementRate(minRate) {
        this.elements.performanceMetrics().should('contain', `${minRate}%`);
        return this;
    }

    // Audience tab assertions
    expectAudienceDataVisible() {
        this.elements.audienceDemographics().should('be.visible');
        this.elements.audienceQuality().should('be.visible');
        return this;
    }

    expectAudienceQualityScore(minScore) {
        this.elements.audienceQuality().should('contain', minScore);
        return this;
    }

    // Content tab assertions
    expectContentGridVisible() {
        this.elements.contentGrid().should('be.visible');
        this.elements.contentPost(0).should('be.visible');
        return this;
    }

    expectContentCount(minCount) {
        this.elements.contentGrid().find('[data-testid^="content-post"]').should('have.length.at.least', minCount);
        return this;
    }

    // Risk tab assertions
    expectRiskScoreVisible() {
        this.elements.riskScore().should('be.visible');
        this.elements.riskFactors().should('be.visible');
        return this;
    }

    expectLowRiskScore() {
        this.elements.riskScore().should('contain', 'Low');
        return this;
    }

    // Dialog assertions
    expectRiskReportDialogVisible() {
        this.elements.riskReportDialog().should('be.visible');
        this.elements.riskReportDialogTitle().should('be.visible');
        return this;
    }

    expectRiskReportDialogHidden() {
        this.elements.riskReportDialog().should('not.exist');
        return this;
    }

    expectRiskReportGenerated() {
        this.elements.riskReportToast().should('be.visible');
        return this;
    }

    expectAddToCampaignDialogVisible() {
        this.elements.addToCampaignDialog().should('be.visible');
        this.elements.campaignSelect().should('be.visible');
        return this;
    }

    expectAddToCampaignDialogHidden() {
        this.elements.addToCampaignDialog().should('not.exist');
        return this;
    }

    expectCampaignAddSuccess() {
        this.elements.campaignAddToast().should('be.visible');
        this.elements.addToCampaignDialog().should('not.exist');
        return this;
    }

    // Error state assertions
    expectErrorState() {
        this.elements.errorDisplay().should('be.visible');
        this.elements.errorTitle().should('be.visible');
        return this;
    }

    expectErrorMessage(message) {
        this.elements.errorMessage().should('contain', message);
        return this;
    }

    expectProfileNotFound() {
        this.expectErrorMessage('profile not found');
        return this;
    }

    // Loading state assertions
    expectLoadingState() {
        this.elements.profileSkeleton().should('be.visible');
        return this;
    }

    expectContentLoaded() {
        this.elements.profileSkeleton().should('not.exist');
        this.elements.profileHeader().should('be.visible');
        return this;
    }

    // Wait for page load
    waitForProfileLoad() {
        this.elements.profileContainer().should('be.visible', { timeout: this.loadTimeout });
        // Wait for either profile content or error state
        cy.get('body').then($body => {
            if ($body.find('[data-testid="error-display"]').length > 0) {
                this.elements.errorDisplay().should('be.visible');
            } else {
                this.elements.profileHeader().should('be.visible', { timeout: this.loadTimeout });
            }
        });
        return this;
    }

    // Complex workflows
    performCompleteProfileAnalysis() {
        this.logAction('Performing complete profile analysis');

        // Verify profile header
        this.expectProfileHeaderVisible();
        this.expectProfileDataLoaded();

        // Test all analytics tabs
        this.viewPerformanceMetrics();
        this.expectPerformanceDataVisible();

        this.viewAudienceDemographics();
        this.expectAudienceDataVisible();

        this.viewContentGrid();
        this.expectContentGridVisible();

        this.viewRiskAssessment();
        this.expectRiskScoreVisible();

        return this;
    }

    testProfileInteractions() {
        this.logAction('Testing profile interactions');

        // Test risk report generation
        this.requestRiskReport();

        // Test add to campaign workflow
        this.addInfluencerToCampaign('Test Campaign');

        return this;
    }

    testAllAnalyticsTabs() {
        this.logAction('Testing all analytics tabs');

        const tabs = [
            'performance',
            'audience',
            'content',
            'demographics',
            'contact',
            'platform',
            'advanced',
            'risk',
            'campaigns'
        ];

        tabs.forEach(tab => {
            this.switchToTab(tab);
            this.expectTabActive(tab);
        });

        return this;
    }

    // Error handling
    handleProfileErrors() {
        cy.get('body').then($body => {
            if ($body.text().includes('Error') || $body.find('[data-testid="error-display"]').length > 0) {
                cy.log('⚠️ Profile error detected');
                this.takeScreenshot('profile-error');

                // Try to navigate back to marketplace
                this.goBackToMarketplace();
            }
        });
        return this;
    }

    // Performance monitoring
    measureProfileLoad() {
        return this.measurePageLoadTime({
            actionName: 'profile-page-load',
            performanceBudget: 3000 // 3 seconds for profile page
        });
    }

    measureTabSwitching(tabSwitchFn) {
        return this.measureInteractionTime(tabSwitchFn, {
            actionName: 'profile-tab-switch',
            performanceBudget: 1000 // 1 second for tab switching
        });
    }

    // Responsive design testing
    testMobileProfile() {
        cy.viewport('iphone-6');
        this.expectProfileHeaderVisible();
        this.expectAllTabsVisible();
        cy.viewport(1280, 720); // Reset
        return this;
    }

    // Accessibility testing
    checkProfileAccessibility() {
        cy.checkA11y('.min-h-screen', {
            rules: {
                'color-contrast': { enabled: true },
                'keyboard-navigation': { enabled: true },
                'aria-labels': { enabled: true },
                'tab-navigation': { enabled: true }
            }
        });
        return this;
    }

    // Complete profile workflow testing
    testCompleteProfileWorkflow(handle, platform = 'INSTAGRAM') {
        this.logAction(`Testing complete profile workflow for ${handle}`);

        this.visitProfile(handle, platform);
        this.expectToBeOnProfilePage(handle);

        // Perform complete analysis
        this.performCompleteProfileAnalysis();

        // Test interactions
        this.testProfileInteractions();

        // Test all tabs
        this.testAllAnalyticsTabs();

        // Test navigation back
        this.goBackToMarketplace();

        return this;
    }
} 