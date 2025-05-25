import { BasePage } from '../shared/BasePage.js';

/**
 * Billing Page Object Model
 * Handles Stripe billing integration and subscription management
 * 
 * Covers:
 * - Subscription plan selection and changes
 * - Payment method management via Stripe
 * - Billing portal access and navigation
 * - Pricing grid interactions
 * - Checkout session workflows
 * - FAQ section navigation
 */

export class BillingPage extends BasePage {
    constructor() {
        super();
        this.pageUrl = '/account/billing';
        this.pageTitle = 'Billing Management';
    }

    // Element selectors using data-cy attributes
    elements = {
        // Main billing container
        billingContainer: () => this.getByDataCy('billing-container'),
        billingHeader: () => this.getByDataCy('billing-header'),

        // Tabs navigation
        tabsList: () => cy.get('[role="tablist"]'),
        faqTab: () => cy.get('[data-value="faq"]'),
        plansTab: () => cy.get('[data-value="plans"]'),
        billingPortalTab: () => cy.get('[data-value="billing"]'),

        // Tab content areas
        faqContent: () => cy.get('[data-value="faq"][role="tabpanel"]'),
        plansContent: () => cy.get('[data-value="plans"][role="tabpanel"]'),
        billingPortalContent: () => cy.get('[data-value="billing"][role="tabpanel"]'),

        // Billing Portal section
        manageBillingButton: () => cy.contains('button', 'Manage Billing'),
        billingPortalDescription: () => cy.contains('Securely manage your subscription'),

        // Pricing Grid
        pricingGrid: () => this.getByDataCy('pricing-grid'),
        pricingCard: (planName) => this.getByDataCy(`pricing-card-${planName.toLowerCase()}`),

        // Plan cards
        starterPlanCard: () => this.elements.pricingCard('starter'),
        professionalPlanCard: () => this.elements.pricingCard('professional'),
        enterprisePlanCard: () => this.elements.pricingCard('enterprise'),

        // Plan selection buttons
        selectPlanButton: (planName) => this.elements.pricingCard(planName).find('button').contains('Select'),
        upgradePlanButton: (planName) => this.elements.pricingCard(planName).find('button').contains('Upgrade'),
        currentPlanBadge: () => cy.contains('.badge', 'Current Plan'),

        // Plan features
        planFeaturesList: (planName) => this.elements.pricingCard(planName).find('[data-cy="plan-features"]'),
        planPrice: (planName) => this.elements.pricingCard(planName).find('[data-cy="plan-price"]'),
        planTitle: (planName) => this.elements.pricingCard(planName).find('[data-cy="plan-title"]'),

        // FAQ Section
        faqSection: () => this.getByDataCy('faq-section'),
        faqAccordion: () => cy.get('[data-accordion-component]'),
        faqItem: (question) => cy.contains('[data-accordion-item]', question),
        faqTrigger: (question) => this.elements.faqItem(question).find('[data-accordion-trigger]'),
        faqContent: (question) => this.elements.faqItem(question).find('[data-accordion-content]'),

        // Status messages
        statusMessage: () => this.getByDataCy('status-message'),
        successMessage: () => cy.contains('successful'),
        cancelMessage: () => cy.contains('cancelled'),
        errorMessage: () => this.getByDataCy('error-message'),

        // Loading and redirect states
        redirectingMessage: () => cy.contains('Redirecting'),
        loadingSpinner: () => cy.get('.animate-spin'),

        // Stripe elements (when embedded)
        stripeElement: () => cy.get('[data-stripe-element]'),
        stripeForm: () => cy.get('form[data-stripe-form]'),

        // Payment methods (in billing portal)
        paymentMethodSection: () => cy.contains('Payment Methods').parent(),
        addPaymentMethodButton: () => cy.contains('button', 'Add Payment Method'),

        // Subscription status
        subscriptionStatus: () => this.getByDataCy('subscription-status'),
        subscriptionDetails: () => this.getByDataCy('subscription-details'),
        nextBillingDate: () => this.getByDataCy('next-billing-date'),
    };

    // Page navigation actions
    visit() {
        cy.visit(this.pageUrl);
        this.waitForPageLoad();
        return this;
    }

    // Tab navigation
    clickFaqTab() {
        this.logAction('Clicking FAQ tab');
        this.elements.faqTab().click();
        this.expectActiveTab('faq');
        return this;
    }

    clickPlansTab() {
        this.logAction('Clicking Plans & Pricing tab');
        this.elements.plansTab().click();
        this.expectActiveTab('plans');
        return this;
    }

    clickBillingPortalTab() {
        this.logAction('Clicking Billing Portal tab');
        this.elements.billingPortalTab().click();
        this.expectActiveTab('billing');
        return this;
    }

    // Billing portal actions
    openBillingPortal() {
        this.logAction('Opening Stripe billing portal');
        this.elements.manageBillingButton().click();

        // Note: This will redirect to Stripe, so we might need to mock this in tests
        // or test the redirect behavior specifically
        return this;
    }

    // Plan selection actions
    selectPlan(planName) {
        this.logAction(`Selecting plan: ${planName}`);
        this.elements.selectPlanButton(planName).click();

        // This should redirect to Stripe checkout
        // In tests, we might want to intercept this
        return this;
    }

    upgradeToPlan(planName) {
        this.logAction(`Upgrading to plan: ${planName}`);
        this.elements.upgradePlanButton(planName).click();
        return this;
    }

    // FAQ interactions
    expandFaqItem(question) {
        this.logAction(`Expanding FAQ: ${question}`);
        this.elements.faqTrigger(question).click();
        this.expectFaqExpanded(question);
        return this;
    }

    collapseFaqItem(question) {
        this.logAction(`Collapsing FAQ: ${question}`);
        this.elements.faqTrigger(question).click();
        this.expectFaqCollapsed(question);
        return this;
    }

    expandAllFaqItems() {
        this.elements.faqAccordion().find('[data-accordion-trigger]').each($trigger => {
            cy.wrap($trigger).click();
        });
        return this;
    }

    // Page state assertions
    expectToBeOnBillingPage() {
        cy.url().should('include', '/billing');
        this.elements.billingContainer().should('be.visible');
        return this;
    }

    expectActiveTab(tabValue) {
        cy.get(`[data-value="${tabValue}"]`).should('have.attr', 'data-state', 'active');
        return this;
    }

    // Plan assertions
    expectPricingGridVisible() {
        this.elements.pricingGrid().should('be.visible');
        return this;
    }

    expectPlanCardVisible(planName) {
        this.elements.pricingCard(planName).should('be.visible');
        return this;
    }

    expectAllPlansVisible() {
        this.expectPlanCardVisible('starter');
        this.expectPlanCardVisible('professional');
        this.expectPlanCardVisible('enterprise');
        return this;
    }

    expectCurrentPlan(planName) {
        this.elements.pricingCard(planName).within(() => {
            this.elements.currentPlanBadge().should('be.visible');
        });
        return this;
    }

    expectPlanPrice(planName, expectedPrice) {
        this.elements.planPrice(planName).should('contain', expectedPrice);
        return this;
    }

    expectPlanFeatures(planName, features) {
        this.elements.planFeaturesList(planName).within(() => {
            features.forEach(feature => {
                cy.contains(feature).should('be.visible');
            });
        });
        return this;
    }

    // FAQ assertions
    expectFaqSectionVisible() {
        this.elements.faqSection().should('be.visible');
        return this;
    }

    expectFaqExpanded(question) {
        this.elements.faqContent(question).should('be.visible');
        return this;
    }

    expectFaqCollapsed(question) {
        this.elements.faqContent(question).should('not.be.visible');
        return this;
    }

    // Status message assertions
    expectSuccessMessage() {
        this.elements.successMessage().should('be.visible');
        return this;
    }

    expectCancelMessage() {
        this.elements.cancelMessage().should('be.visible');
        return this;
    }

    expectErrorMessage() {
        this.elements.errorMessage().should('be.visible');
        return this;
    }

    expectRedirectingState() {
        this.elements.redirectingMessage().should('be.visible');
        return this;
    }

    // Subscription status assertions
    expectSubscriptionStatus(status) {
        this.elements.subscriptionStatus().should('contain', status);
        return this;
    }

    expectNextBillingDate(date) {
        this.elements.nextBillingDate().should('contain', date);
        return this;
    }

    // Wait for page load
    waitForPageLoad() {
        this.elements.tabsList().should('be.visible', { timeout: this.loadTimeout });
        this.elements.faqContent().should('be.visible', { timeout: this.loadTimeout });
        return this;
    }

    // Complex workflows
    completePlanUpgradeWorkflow(planName) {
        this.logAction(`Testing complete plan upgrade workflow for: ${planName}`);

        // Navigate to plans tab
        this.clickPlansTab();
        this.expectPricingGridVisible();

        // Select the plan
        this.selectPlan(planName);

        // Note: In real tests, we'd need to handle the Stripe redirect
        // This would be a good place to use API mocking

        return this;
    }

    validateBillingPortalAccess() {
        this.logAction('Validating billing portal access');

        this.clickBillingPortalTab();
        this.elements.manageBillingButton().should('be.visible');
        this.elements.billingPortalDescription().should('be.visible');

        return this;
    }

    exploreFaqSection() {
        this.logAction('Testing FAQ section functionality');

        this.clickFaqTab();
        this.expectFaqSectionVisible();

        // Test expanding/collapsing FAQ items
        cy.get('[data-accordion-trigger]').first().then($firstFaq => {
            const questionText = $firstFaq.text();
            this.expandFaqItem(questionText);
            this.collapseFaqItem(questionText);
        });

        return this;
    }

    // Error handling
    handleBillingErrors() {
        cy.get('body').then($body => {
            if ($body.text().includes('Error') || $body.find('[data-cy="error-message"]').length > 0) {
                cy.log('⚠️ Billing error detected');
                this.takeScreenshot('billing-error');

                // Try to recover by refreshing
                cy.reload();
                this.waitForPageLoad();
            }
        });
        return this;
    }

    // Performance monitoring
    measureBillingPortalAccess() {
        return this.measureInteractionTime(() => {
            this.openBillingPortal();
        }, {
            actionName: 'billing-portal-access',
            performanceBudget: 3000 // 3 seconds for external redirect
        });
    }

    measurePlanSelection() {
        return this.measureInteractionTime(() => {
            this.selectPlan('professional');
        }, {
            actionName: 'plan-selection',
            performanceBudget: 2000 // 2 seconds for plan selection
        });
    }

    // Responsive design testing
    testMobileBilling() {
        cy.viewport('iphone-6');
        this.expectPricingGridVisible();
        this.expectAllPlansVisible();
        cy.viewport(1280, 720); // Reset
        return this;
    }

    testTabletBilling() {
        cy.viewport('ipad-2');
        this.clickPlansTab();
        this.expectPricingGridVisible();
        cy.viewport(1280, 720); // Reset
        return this;
    }

    // Accessibility testing
    checkBillingAccessibility() {
        cy.checkA11y('[data-cy="billing-container"]', {
            rules: {
                'color-contrast': { enabled: true },
                'keyboard-navigation': { enabled: true },
                'aria-labels': { enabled: true }
            }
        });
        return this;
    }

    // Stripe integration testing helpers
    mockStripeCheckout() {
        // Mock Stripe checkout redirect for testing
        cy.intercept('POST', '**/create-checkout-session', {
            statusCode: 200,
            body: { url: 'https://checkout.stripe.com/mock-session' }
        }).as('createCheckout');
        return this;
    }

    mockBillingPortalRedirect() {
        // Mock billing portal redirect for testing
        cy.intercept('POST', '**/billing-portal', {
            statusCode: 200,
            body: { url: 'https://billing.stripe.com/mock-portal' }
        }).as('billingPortal');
        return this;
    }

    // Test with mocked Stripe
    testPlanSelectionWithMock(planName) {
        this.mockStripeCheckout();
        this.selectPlan(planName);
        cy.wait('@createCheckout');
        return this;
    }

    testBillingPortalWithMock() {
        this.mockBillingPortalRedirect();
        this.openBillingPortal();
        cy.wait('@billingPortal');
        return this;
    }
} 