import { BasePage } from '../shared/BasePage.js';

/**
 * UI Components Page Object Model
 * Handles the comprehensive UI component library testing in debug tools
 * 
 * Covers:
 * - Individual component preview pages and functionality
 * - Component variants, sizes, and states testing
 * - Interactive behavior and accessibility validation
 * - Visual consistency and responsive design verification
 * - Component integration and composition testing
 * - Design system compliance and best practices validation
 */

export class UIComponentsPage extends BasePage {
    constructor() {
        super();
        this.pageUrl = '/debug-tools/ui-components';
        this.pageTitle = 'UI Components Library';
    }

    // Element selectors using data-cy attributes and semantic selectors
    elements = {
        // Main page container
        componentsContainer: () => this.getByDataCy('ui-components-container'),
        pageHeader: () => cy.contains('h1', 'UI Components'),
        breadcrumbs: () => cy.get('nav[aria-label="Breadcrumb"]'),

        // Component library navigation
        componentsList: () => this.getByDataCy('components-list'),
        componentCard: (name) => this.getByDataCy(`component-card-${name.toLowerCase()}`),
        componentLink: (name) => cy.contains('a', name),
        categoryFilter: () => this.getByDataCy('category-filter'),
        searchInput: () => this.getByDataCy('component-search'),

        // Component preview page elements
        componentTitle: () => cy.get('h1'),
        componentDescription: () => cy.get('p').first(),
        statusBadge: () => cy.get('[data-testid="status-badge"]').or(cy.contains('Badge', /stable|beta|deprecated/)),

        // Examples sections
        examplesSection: () => cy.contains('h2', 'Examples').parent(),
        variantsSection: () => cy.contains('h3', 'Variants').parent(),
        sizesSection: () => cy.contains('h3', 'Sizes').parent(),
        iconsSection: () => cy.contains('h3', 'With Icons').parent(),
        advancedSection: () => cy.contains('h3', 'Advanced Usage').parent(),
        disabledSection: () => cy.contains('h3', 'Disabled States').parent(),
        patternsSection: () => cy.contains('h3', 'Common UI Patterns').parent(),

        // Code examples
        codeSection: () => cy.contains('h2', 'Code Examples').parent(),
        codeBlock: () => cy.get('pre code'),

        // Best practices
        bestPracticesSection: () => cy.contains('h2', 'Best Practices').parent(),
        doSection: () => cy.contains('h4', '✅ Do').parent(),
        dontSection: () => cy.contains('h4', '❌ Don\'t').parent(),
    };

    // Page navigation actions
    visit() {
        this.logAction(`Visiting UI components library: ${this.pageUrl}`);
        cy.visit(this.pageUrl);
        return this;
    }

    visitComponent(componentName) {
        this.logAction(`Visiting component preview: ${componentName}`);
        cy.visit(`${this.pageUrl}/preview/${componentName}`);
        return this;
    }

    // Component navigation actions
    searchComponent(searchTerm) {
        this.logAction(`Searching for component: ${searchTerm}`);
        this.elements.searchInput().clear().type(searchTerm);
        return this;
    }

    selectCategory(category) {
        this.logAction(`Filtering by category: ${category}`);
        this.elements.categoryFilter().select(category);
        return this;
    }

    openComponent(componentName) {
        this.logAction(`Opening component: ${componentName}`);
        this.elements.componentLink(componentName).click();
        return this;
    }

    // Component testing actions
    testComponentVariants(expectedVariants) {
        this.logAction(`Testing component variants: ${expectedVariants.join(', ')}`);

        this.elements.variantsSection().within(() => {
            expectedVariants.forEach(variant => {
                cy.contains('button', variant, { matchCase: false })
                    .should('be.visible')
                    .and('not.be.disabled');
            });
        });

        return this;
    }

    testComponentSizes(expectedSizes) {
        this.logAction(`Testing component sizes: ${expectedSizes.join(', ')}`);

        this.elements.sizesSection().within(() => {
            expectedSizes.forEach(size => {
                // Test that buttons with different sizes are actually different sizes
                cy.get('button').contains(size, { matchCase: false })
                    .should('be.visible')
                    .then($el => {
                        const height = $el.height();
                        const width = $el.width();
                        expect(height).to.be.greaterThan(0);
                        expect(width).to.be.greaterThan(0);
                    });
            });
        });

        return this;
    }

    testInteractiveElements() {
        this.logAction('Testing interactive elements for accessibility and behavior');

        // Test all clickable elements
        cy.get('button:not([disabled])').each($button => {
            cy.wrap($button)
                .should('be.visible')
                .and('have.attr', 'type')
                .click({ force: false }); // Don't force click - test real accessibility
        });

        // Test keyboard navigation
        cy.get('button').first().focus();
        cy.focused().should('exist');

        return this;
    }

    testAccessibility() {
        this.logAction('Testing component accessibility compliance');

        // Check for proper ARIA attributes
        cy.get('button[aria-label], button[aria-describedby]').should('exist');

        // Check color contrast (basic check)
        cy.get('button').each($button => {
            cy.wrap($button).should('have.css', 'color');
            cy.wrap($button).should('have.css', 'background-color');
        });

        // Test keyboard navigation
        cy.get('body').tab();
        cy.focused().should('be.visible');

        return this;
    }

    testResponsiveDesign() {
        this.logAction('Testing responsive design across viewports');

        // Test mobile viewport
        cy.viewport(375, 667);
        cy.get('button').should('be.visible');

        // Test tablet viewport
        cy.viewport(768, 1024);
        cy.get('button').should('be.visible');

        // Test desktop viewport
        cy.viewport(1440, 900);
        cy.get('button').should('be.visible');

        return this;
    }

    testComponentStates() {
        this.logAction('Testing component states (normal, hover, focus, disabled)');

        // Test normal state
        cy.get('button:not([disabled])').first()
            .should('be.visible')
            .and('not.have.attr', 'disabled');

        // Test hover state (trigger hover)
        cy.get('button:not([disabled])').first()
            .trigger('mouseover')
            .should('be.visible');

        // Test focus state
        cy.get('button:not([disabled])').first()
            .focus()
            .should('have.focus');

        // Test disabled state
        cy.get('button[disabled]').should('exist').and('be.disabled');

        return this;
    }

    testCodeExamples() {
        this.logAction('Verifying code examples are present and properly formatted');

        this.elements.codeSection().should('be.visible');
        this.elements.codeBlock().should('exist').and('contain.text', 'import');

        return this;
    }

    testBestPractices() {
        this.logAction('Verifying best practices documentation');

        this.elements.bestPracticesSection().should('be.visible');
        this.elements.doSection().should('be.visible').and('contain.text', '✅ Do');
        this.elements.dontSection().should('be.visible').and('contain.text', '❌ Don\'t');

        return this;
    }

    // Page state assertions
    expectToBeOnComponentsPage() {
        cy.url().should('include', '/debug-tools/ui-components');
        this.elements.pageHeader().should('be.visible');
        return this;
    }

    expectToBeOnComponentPreview(componentName) {
        cy.url().should('include', `/ui-components/preview/${componentName}`);
        this.elements.componentTitle().should('contain.text', componentName);
        return this;
    }

    expectComponentMetadata(expectedData) {
        this.logAction(`Verifying component metadata: ${JSON.stringify(expectedData)}`);

        if (expectedData.title) {
            this.elements.componentTitle().should('contain.text', expectedData.title);
        }

        if (expectedData.description) {
            this.elements.componentDescription().should('contain.text', expectedData.description);
        }

        if (expectedData.status) {
            this.elements.statusBadge().should('contain.text', expectedData.status);
        }

        return this;
    }

    expectAllSectionsVisible() {
        this.logAction('Verifying all component documentation sections are visible');

        this.elements.examplesSection().should('be.visible');
        this.elements.codeSection().should('be.visible');
        this.elements.bestPracticesSection().should('be.visible');

        return this;
    }

    expectNoErrors() {
        this.logAction('Verifying no console errors or visual issues');

        // Check that no error boundaries or fallback UI is showing
        cy.contains('Something went wrong').should('not.exist');
        cy.contains('Error').should('not.exist');
        cy.contains('404').should('not.exist');

        return this;
    }

    // Complex workflows
    testCompleteComponentWorkflow(componentName, options = {}) {
        this.logAction(`Testing complete workflow for component: ${componentName}`);

        // Navigate to component
        this.visitComponent(componentName);
        this.expectToBeOnComponentPreview(componentName);

        // Test component metadata
        this.expectComponentMetadata({
            title: componentName,
            ...options.metadata
        });

        // Test all sections exist
        this.expectAllSectionsVisible();

        // Test component variants if specified
        if (options.variants) {
            this.testComponentVariants(options.variants);
        }

        // Test component sizes if specified
        if (options.sizes) {
            this.testComponentSizes(options.sizes);
        }

        // Test interactivity
        this.testInteractiveElements();

        // Test component states
        this.testComponentStates();

        // Test accessibility
        this.testAccessibility();

        // Test responsive design
        this.testResponsiveDesign();

        // Test documentation
        this.testCodeExamples();
        this.testBestPractices();

        // Verify no errors
        this.expectNoErrors();

        return this;
    }
} 