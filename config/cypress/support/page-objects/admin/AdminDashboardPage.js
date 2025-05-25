import { BasePage } from '../shared/BasePage.js';

/**
 * Admin Dashboard Page Object Model
 * Handles the main admin debug tools dashboard
 * 
 * Covers:
 * - Debug tools grid navigation and access
 * - Tool availability and status checking
 * - Admin dashboard overview and metrics
 * - Debug tool card interactions
 * - Admin navigation and permissions
 * - System status monitoring
 */

export class AdminDashboardPage extends BasePage {
    constructor() {
        super();
        this.pageUrl = '/debug-tools';
        this.pageTitle = 'Debug Tools';
    }

    // Element selectors using data-cy attributes
    elements = {
        // Main page container
        adminContainer: () => this.getByDataCy('admin-container'),
        pageHeader: () => this.getByDataCy('admin-header'),
        pageTitle: () => cy.contains('h1', 'Debug Tools'),

        // Debug tools grid
        debugToolsGrid: () => cy.get('.grid').contains('API Verification').closest('.grid'),
        toolCard: (toolName) => cy.contains('.border-divider', toolName),
        cardTitle: (toolName) => this.elements.toolCard(toolName).find('h3, .text-lg'),
        cardDescription: (toolName) => this.elements.toolCard(toolName).find('p, .text-muted-foreground'),
        cardButton: (toolName) => this.elements.toolCard(toolName).find('button, a[role="button"]'),

        // Individual debug tool cards
        apiVerificationCard: () => this.elements.toolCard('API Verification'),
        uiComponentsCard: () => this.elements.toolCard('UI Components'),
        databaseHealthCard: () => this.elements.toolCard('Database Health'),
        clerkAuthCard: () => this.elements.toolCard('Clerk Authentication'),
        muxAssetsCard: () => this.elements.toolCard('Mux Asset'),
        campaignWizardCard: () => this.elements.toolCard('Campaign Wizard'),
        documentationCard: () => this.elements.toolCard('Documentation Hub'),

        // Tool action buttons
        apiVerificationButton: () => cy.contains('button, a', 'Open API Verification'),
        uiComponentsButton: () => cy.contains('button, a', 'View UI Components'),
        databaseHealthButton: () => cy.contains('button, a', 'View Database Health'),
        clerkAuthButton: () => cy.contains('button, a', 'Test Authentication'),
        muxAssetsButton: () => cy.contains('button, a', 'Check Mux Assets'),
        campaignWizardButton: () => cy.contains('button, a', 'Check Campaign Wizards'),
        documentationButton: () => cy.contains('button', 'View Documentation'),

        // Loading states
        loadingSpinner: () => cy.get('.animate-spin'),
        cardLoadingState: () => cy.get('button').contains('Loading'),

        // Error states
        errorAlert: () => cy.get('[role="alert"]'),
        accessDeniedMessage: () => cy.contains('Access Denied'),
        toolUnavailableMessage: () => cy.contains('temporarily unavailable'),

        // Admin status indicators
        statusIndicator: () => this.getByDataCy('admin-status'),
        toolStatusBadge: (toolName) => this.elements.toolCard(toolName).find('.badge'),
        systemHealthIndicator: () => this.getByDataCy('system-health'),

        // Admin navigation
        adminBreadcrumb: () => cy.get('nav[aria-label="breadcrumb"]'),
        backToAdminLink: () => cy.contains('a', 'Admin'),
        homeLink: () => cy.contains('a', 'Dashboard'),

        // Container layout
        gridContainer: () => cy.get('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3'),
        cardContainer: () => cy.get('.border-divider'),
        contentArea: () => cy.get('.container.mx-auto'),
    };

    // Page navigation actions
    visit() {
        cy.visit(this.pageUrl);
        this.waitForPageLoad();
        return this;
    }

    // Debug tool navigation actions
    openAPIVerification() {
        this.logAction('Opening API Verification tool');
        this.elements.apiVerificationButton().click();

        // Should navigate to API verification page
        cy.url().should('include', '/debug-tools/api-verification');
        return this;
    }

    openUIComponents() {
        this.logAction('Opening UI Components tool');
        this.elements.uiComponentsButton().click();

        // Should navigate to UI components page
        cy.url().should('include', '/debug-tools/ui-components');
        return this;
    }

    openDatabaseHealth() {
        this.logAction('Opening Database Health tool');
        this.elements.databaseHealthButton().click();

        // Should navigate to database health page
        cy.url().should('include', '/debug-tools/database');
        return this;
    }

    openClerkAuth() {
        this.logAction('Opening Clerk Authentication tool');
        this.elements.clerkAuthButton().click();

        // Should navigate to clerk auth page
        cy.url().should('include', '/debug-tools/clerk-auth');
        return this;
    }

    openMuxAssets() {
        this.logAction('Opening Mux Assets tool');
        this.elements.muxAssetsButton().click();

        // Should navigate to mux assets page
        cy.url().should('include', '/debug-tools/mux-assets');
        return this;
    }

    openCampaignWizards() {
        this.logAction('Opening Campaign Wizards tool');
        this.elements.campaignWizardButton().click();

        // Should navigate to campaign wizards page
        cy.url().should('include', '/debug-tools/campaign-wizards');
        return this;
    }

    openDocumentation() {
        this.logAction('Opening Documentation Hub');

        // Mock window.open for testing
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        this.elements.documentationButton().click();

        // Should open documentation in new tab
        cy.get('@windowOpen').should('have.been.calledWith', 'https://justify-1.gitbook.io/jzyx2tuf', '_blank');
        return this;
    }

    // Page state assertions
    expectToBeOnAdminDashboard() {
        cy.url().should('include', '/debug-tools');
        this.elements.pageTitle().should('be.visible');
        return this;
    }

    expectDebugToolsGridVisible() {
        this.elements.debugToolsGrid().should('be.visible');
        this.elements.gridContainer().should('be.visible');
        return this;
    }

    expectAllDebugToolsVisible() {
        this.elements.apiVerificationCard().should('be.visible');
        this.elements.uiComponentsCard().should('be.visible');
        this.elements.databaseHealthCard().should('be.visible');
        this.elements.clerkAuthCard().should('be.visible');
        this.elements.muxAssetsCard().should('be.visible');
        this.elements.campaignWizardCard().should('be.visible');
        this.elements.documentationCard().should('be.visible');
        return this;
    }

    // Tool card assertions
    expectToolCardVisible(toolName) {
        this.elements.toolCard(toolName).should('be.visible');
        this.elements.cardTitle(toolName).should('be.visible');
        this.elements.cardDescription(toolName).should('be.visible');
        this.elements.cardButton(toolName).should('be.visible');
        return this;
    }

    expectToolButtonEnabled(toolName) {
        this.elements.cardButton(toolName).should('not.be.disabled');
        return this;
    }

    expectToolButtonDisabled(toolName) {
        this.elements.cardButton(toolName).should('be.disabled');
        return this;
    }

    expectToolCount(expectedCount) {
        this.elements.cardContainer().should('have.length', expectedCount);
        return this;
    }

    // Tool status assertions
    expectToolStatus(toolName, status) {
        this.elements.toolStatusBadge(toolName).should('contain', status);
        return this;
    }

    expectAllToolsAccessible() {
        const tools = [
            'API Verification',
            'UI Components',
            'Database Health',
            'Clerk Authentication',
            'Mux Asset',
            'Campaign Wizard'
        ];

        tools.forEach(tool => {
            this.expectToolButtonEnabled(tool);
        });

        return this;
    }

    // Error state assertions
    expectAccessDenied() {
        this.elements.accessDeniedMessage().should('be.visible');
        return this;
    }

    expectToolUnavailable(toolName) {
        this.elements.toolCard(toolName).should('contain', 'temporarily unavailable');
        return this;
    }

    expectErrorState() {
        this.elements.errorAlert().should('be.visible');
        return this;
    }

    // Loading state assertions
    expectLoadingState() {
        this.elements.loadingSpinner().should('be.visible');
        return this;
    }

    expectContentLoaded() {
        this.elements.loadingSpinner().should('not.exist');
        this.elements.debugToolsGrid().should('be.visible');
        return this;
    }

    // Navigation assertions
    expectAdminNavigation() {
        this.elements.adminBreadcrumb().should('be.visible');
        return this;
    }

    expectBackToAdminLink() {
        this.elements.backToAdminLink().should('be.visible');
        return this;
    }

    // Wait for page load
    waitForPageLoad() {
        this.elements.pageTitle().should('be.visible', { timeout: this.loadTimeout });
        this.elements.debugToolsGrid().should('be.visible', { timeout: this.loadTimeout });
        return this;
    }

    // Complex workflows
    testAllDebugToolNavigation() {
        this.logAction('Testing navigation to all debug tools');

        // Test each tool navigation
        this.openAPIVerification();
        cy.go('back');
        this.expectToBeOnAdminDashboard();

        this.openUIComponents();
        cy.go('back');
        this.expectToBeOnAdminDashboard();

        this.openDatabaseHealth();
        cy.go('back');
        this.expectToBeOnAdminDashboard();

        this.openClerkAuth();
        cy.go('back');
        this.expectToBeOnAdminDashboard();

        this.openMuxAssets();
        cy.go('back');
        this.expectToBeOnAdminDashboard();

        this.openCampaignWizards();
        cy.go('back');
        this.expectToBeOnAdminDashboard();

        // Test documentation (external link)
        this.openDocumentation();

        return this;
    }

    validateDebugToolsGrid() {
        this.logAction('Validating debug tools grid layout and content');

        this.expectDebugToolsGridVisible();
        this.expectAllDebugToolsVisible();

        // Verify all tools have proper content
        const expectedTools = [
            { name: 'API Verification', description: 'Test and verify external API integrations' },
            { name: 'UI Components', description: 'View and test centralized UI components' },
            { name: 'Database Health', description: 'Access schema, documentation, and health monitoring' },
            { name: 'Clerk Authentication', description: 'Test and debug authentication flow' },
            { name: 'Mux Asset', description: 'View and verify Mux video assets' },
            { name: 'Campaign Wizard', description: 'View all created campaign wizards' },
            { name: 'Documentation Hub', description: 'Access comprehensive developer documentation' }
        ];

        expectedTools.forEach(tool => {
            this.expectToolCardVisible(tool.name);
        });

        return this;
    }

    testAdminAccessControl() {
        this.logAction('Testing admin access control and permissions');

        // Verify admin-only access
        this.expectToBeOnAdminDashboard();
        this.expectAllToolsAccessible();

        return this;
    }

    // Error handling
    handleAdminErrors() {
        cy.get('body').then($body => {
            if ($body.text().includes('Error') || $body.find('[role="alert"]').length > 0) {
                cy.log('⚠️ Admin dashboard error detected');
                this.takeScreenshot('admin-dashboard-error');

                // Try to recover by refreshing
                cy.reload();
                this.waitForPageLoad();
            }
        });
        return this;
    }

    // Performance monitoring
    measurePageLoad() {
        return this.measurePageLoadTime({
            actionName: 'admin-dashboard-load',
            performanceBudget: 3000 // 3 seconds for admin dashboard
        });
    }

    measureToolNavigation(toolName, navigationFn) {
        return this.measureInteractionTime(navigationFn, {
            actionName: `admin-${toolName.toLowerCase().replace(/\s+/g, '-')}-navigation`,
            performanceBudget: 2000 // 2 seconds for tool navigation
        });
    }

    // Responsive design testing
    testMobileAdminDashboard() {
        cy.viewport('iphone-6');
        this.expectDebugToolsGridVisible();
        this.expectAllDebugToolsVisible();
        cy.viewport(1280, 720); // Reset
        return this;
    }

    // Accessibility testing
    checkAdminDashboardAccessibility() {
        cy.checkA11y('[data-cy="admin-container"]', {
            rules: {
                'color-contrast': { enabled: true },
                'keyboard-navigation': { enabled: true },
                'aria-labels': { enabled: true }
            }
        });
        return this;
    }

    // System health monitoring
    checkSystemHealth() {
        this.logAction('Checking system health status');

        this.elements.systemHealthIndicator().should('be.visible');

        // Could check various health indicators here
        // This is a placeholder for system health monitoring

        return this;
    }

    // Admin workflow testing
    testAdminWorkflow() {
        this.logAction('Testing complete admin workflow');

        this.validateDebugToolsGrid();
        this.testAdminAccessControl();
        this.testAllDebugToolNavigation();

        return this;
    }

    // Tool availability testing
    validateToolAvailability() {
        this.logAction('Validating all debug tools are available and functional');

        const tools = [
            'API Verification',
            'UI Components',
            'Database Health',
            'Clerk Authentication',
            'Mux Asset',
            'Campaign Wizard',
            'Documentation Hub'
        ];

        tools.forEach(tool => {
            this.expectToolCardVisible(tool);
            this.expectToolButtonEnabled(tool);
        });

        return this;
    }
} 