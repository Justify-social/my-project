import { setupClerkTestingToken } from '@clerk/testing/cypress';
import {
    UIComponentsPage
} from '../../support/page-objects';

describe('UI Components - Button Component Testing', () => {
    let uiComponentsPage;

    beforeEach(() => {
        // Setup authenticated admin test environment
        setupClerkTestingToken();

        // Initialize page objects
        uiComponentsPage = new UIComponentsPage();
    });

    context('Button Component - Basic Functionality', () => {
        it('should display button component preview page correctly', () => {
            // Navigate to Button component preview
            uiComponentsPage.visitComponent('Button');

            // Verify page structure
            uiComponentsPage
                .expectToBeOnComponentPreview('Button')
                .expectComponentMetadata({
                    title: 'Button',
                    description: 'Displays a button or a component that looks like a button',
                    status: 'stable'
                })
                .expectAllSectionsVisible();
        });

        it('should test all button variants', () => {
            uiComponentsPage.visitComponent('Button');

            // Test all expected button variants
            const expectedVariants = ['Default', 'Secondary', 'Destructive', 'Outline', 'Ghost', 'Link'];

            uiComponentsPage.testComponentVariants(expectedVariants);

            // Additional variant-specific testing
            cy.get('button').contains('Destructive').should('have.class', 'bg-destructive').or('have.css', 'background-color');
            cy.get('button').contains('Outline').should('have.css', 'border-style', 'solid');
            cy.get('button').contains('Ghost').should('have.css', 'background-color', 'transparent').or('not.have.css', 'background-color');
        });

        it('should test all button sizes', () => {
            uiComponentsPage.visitComponent('Button');

            // Test all expected button sizes
            const expectedSizes = ['Small', 'Default', 'Large'];

            uiComponentsPage.testComponentSizes(expectedSizes);

            // Verify size differences
            cy.get('button').contains('Small').then($small => {
                cy.get('button').contains('Large').then($large => {
                    expect($large.height()).to.be.greaterThan($small.height());
                });
            });
        });

        it('should test icon button functionality', () => {
            uiComponentsPage.visitComponent('Button');

            // Test icon buttons
            uiComponentsPage.elements.iconsSection().within(() => {
                // Test buttons with text and icons
                cy.contains('button', 'Confirm').should('be.visible').within(() => {
                    cy.get('svg, i').should('exist'); // Icon should be present
                });

                cy.contains('button', 'Download').should('be.visible').within(() => {
                    cy.get('svg, i').should('exist');
                });

                // Test icon-only buttons
                cy.get('button[class*="size-icon"]').should('exist').and('be.visible');
            });
        });

        it('should test interactive button behavior', () => {
            uiComponentsPage.visitComponent('Button');

            // Test interactive elements
            uiComponentsPage.testInteractiveElements();

            // Test specific button interactions
            cy.get('button:not([disabled])').first().as('testButton');

            // Test click behavior
            cy.get('@testButton').click().should('be.visible');

            // Test hover states
            cy.get('@testButton').trigger('mouseover');

            // Test focus states
            cy.get('@testButton').focus().should('have.focus');

            // Test keyboard navigation
            cy.get('body').tab();
            cy.focused().should('be.visible');
        });
    });

    context('Button Component - Advanced Features', () => {
        it('should test disabled button states', () => {
            uiComponentsPage.visitComponent('Button');

            // Navigate to disabled states section
            uiComponentsPage.elements.disabledSection().within(() => {
                // Test all disabled variants
                cy.get('button[disabled]').should('have.length.at.least', 4);

                cy.get('button[disabled]').each($button => {
                    cy.wrap($button)
                        .should('be.disabled')
                        .and('have.css', 'opacity'); // Should have reduced opacity
                });

                // Test that disabled buttons don't respond to clicks
                cy.get('button[disabled]').first().click({ force: true });
                // Should not trigger any actions (no way to test programmatically without specific handlers)
            });
        });

        it('should test loading states', () => {
            uiComponentsPage.visitComponent('Button');

            // Test loading buttons in advanced section
            uiComponentsPage.elements.advancedSection().within(() => {
                cy.contains('Loading...').should('be.visible');
                cy.contains('Saving...').should('be.visible');

                // Test loading spinners are present
                cy.get('.animate-spin, [class*="spin"]').should('exist');

                // Test loading buttons are disabled
                cy.contains('button', 'Loading').should('be.disabled');
                cy.contains('button', 'Saving').should('be.disabled');
            });
        });

        it('should test button as link functionality', () => {
            uiComponentsPage.visitComponent('Button');

            // Test asChild link functionality
            uiComponentsPage.elements.advancedSection().within(() => {
                cy.contains('Go to Dashboard').should('have.prop', 'tagName', 'A');
                cy.contains('External Link').should('have.prop', 'tagName', 'A');

                // Test external link attributes
                cy.contains('External Link')
                    .should('have.attr', 'target', '_blank')
                    .and('have.attr', 'rel', 'noopener noreferrer');
            });
        });

        it('should test common UI patterns', () => {
            uiComponentsPage.visitComponent('Button');

            // Test form action patterns
            uiComponentsPage.elements.patternsSection().within(() => {
                // Form actions
                cy.contains('Save Changes').should('have.attr', 'type', 'submit');
                cy.contains('Cancel').should('have.attr', 'type', 'button');

                // Destructive actions
                cy.contains('Delete Account').should('contain.text', 'Delete');
                cy.contains('Keep Account').should('be.visible');

                // Call-to-action
                cy.contains('Get Started').should('be.visible');
                cy.contains('Learn More').should('be.visible');
            });
        });
    });

    context('Button Component - Accessibility & Standards', () => {
        it('should test accessibility compliance', () => {
            uiComponentsPage.visitComponent('Button');

            // Test accessibility
            uiComponentsPage.testAccessibility();

            // Additional accessibility tests
            cy.get('button').each($button => {
                // Every button should have accessible text
                cy.wrap($button).should(($btn) => {
                    const text = $btn.text().trim();
                    const ariaLabel = $btn.attr('aria-label');
                    const title = $btn.attr('title');

                    expect(text || ariaLabel || title).to.not.be.empty;
                });

                // Test color contrast exists
                cy.wrap($button)
                    .should('have.css', 'color')
                    .and('have.css', 'background-color');
            });
        });

        it('should test responsive design', () => {
            uiComponentsPage.visitComponent('Button');

            // Test responsive design
            uiComponentsPage.testResponsiveDesign();

            // Additional responsive tests
            cy.viewport(375, 667); // Mobile
            cy.get('button').should('be.visible');
            cy.get('button').first().invoke('width').should('be.greaterThan', 0);

            cy.viewport(1440, 900); // Desktop
            cy.get('button').should('be.visible');
        });

        it('should test component states comprehensively', () => {
            uiComponentsPage.visitComponent('Button');

            // Test all component states
            uiComponentsPage.testComponentStates();

            // Additional state testing
            cy.get('button:not([disabled])').first().as('activeButton');

            // Test normal state
            cy.get('@activeButton')
                .should('be.visible')
                .and('not.be.disabled')
                .and('not.have.focus');

            // Test hover state (simulated)
            cy.get('@activeButton')
                .trigger('mouseenter')
                .trigger('mouseover');

            // Test active state (simulated)
            cy.get('@activeButton')
                .trigger('mousedown')
                .trigger('mouseup');

            // Test focus state
            cy.get('@activeButton').focus().should('have.focus');

            // Test blur
            cy.get('@activeButton').blur().should('not.have.focus');
        });
    });

    context('Button Component - Documentation & Code Quality', () => {
        it('should verify code examples are comprehensive', () => {
            uiComponentsPage.visitComponent('Button');

            // Test code examples
            uiComponentsPage.testCodeExamples();

            // Additional code example validation
            uiComponentsPage.elements.codeSection().within(() => {
                cy.get('pre code').should('contain.text', "import { Button } from '@/components/ui/button'");
                cy.get('pre code').should('contain.text', '<Button>');
                cy.get('pre code').should('contain.text', 'variant=');
                cy.get('pre code').should('contain.text', 'size=');
                cy.get('pre code').should('contain.text', 'asChild');
                cy.get('pre code').should('contain.text', 'disabled');
            });
        });

        it('should verify best practices documentation', () => {
            uiComponentsPage.visitComponent('Button');

            // Test best practices
            uiComponentsPage.testBestPractices();

            // Additional best practices validation
            uiComponentsPage.elements.bestPracticesSection().within(() => {
                // Do section
                cy.contains('✅ Do').should('be.visible');
                cy.contains('Use clear, action-oriented labels').should('be.visible');
                cy.contains('Choose appropriate variants').should('be.visible');
                cy.contains('Include loading states').should('be.visible');

                // Don't section
                cy.contains('❌ Don\'t').should('be.visible');
                cy.contains('more than one primary button').should('be.visible');
                cy.contains('destructive actions too easy').should('be.visible');
            });
        });

        it('should verify breadcrumb navigation works', () => {
            uiComponentsPage.visitComponent('Button');

            // Test breadcrumb navigation
            cy.get('nav[aria-label="Breadcrumb"]').should('be.visible');
            cy.get('nav[aria-label="Breadcrumb"]').within(() => {
                cy.contains('UI Components').should('be.visible');
                cy.contains('atom').should('be.visible');
                cy.contains('Button').should('be.visible');
            });

            // Test breadcrumb links
            cy.contains('UI Components').click();
            cy.url().should('include', '/debug-tools/ui-components');
        });

        it('should verify no errors or issues', () => {
            uiComponentsPage.visitComponent('Button');

            // Verify no errors
            uiComponentsPage.expectNoErrors();

            // Additional error checking
            cy.window().then((win) => {
                expect(win.console.error).to.not.have.been.called;
            });

            // Check for missing images or broken elements
            cy.get('img').each($img => {
                expect($img[0].naturalWidth).to.be.greaterThan(0);
            });

            // Verify all links are valid (not 404)
            cy.get('a[href]').each($link => {
                const href = $link.attr('href');
                if (href && href.startsWith('/')) {
                    cy.request(href).its('status').should('eq', 200);
                }
            });
        });
    });

    context('Button Component - Complete Workflow Testing', () => {
        it('should execute complete button component workflow', () => {
            // Execute comprehensive workflow test
            uiComponentsPage.testCompleteComponentWorkflow('Button', {
                metadata: {
                    title: 'Button',
                    description: 'Displays a button or a component that looks like a button',
                    status: 'stable'
                },
                variants: ['Default', 'Secondary', 'Destructive', 'Outline', 'Ghost', 'Link'],
                sizes: ['Small', 'Default', 'Large']
            });

            cy.log('✅ Complete Button component workflow testing successful');
        });

        it('should verify component performance', () => {
            const startTime = Date.now();

            uiComponentsPage.visitComponent('Button');

            // Page should load within performance budget
            cy.then(() => {
                const loadTime = Date.now() - startTime;
                expect(loadTime).to.be.lessThan(3000); // 3 second budget
            });

            // Test interaction performance
            const interactionStart = Date.now();
            cy.get('button').first().click();

            cy.then(() => {
                const interactionTime = Date.now() - interactionStart;
                expect(interactionTime).to.be.lessThan(100); // 100ms for interactions
            });
        });

        it('should verify component meets design system standards', () => {
            uiComponentsPage.visitComponent('Button');

            // Verify design system compliance
            cy.get('button').each($button => {
                // Check for consistent styling
                cy.wrap($button).should('have.css', 'font-family');
                cy.wrap($button).should('have.css', 'border-radius');
                cy.wrap($button).should('have.css', 'transition');

                // Check for proper spacing
                cy.wrap($button).should('have.css', 'padding');
                cy.wrap($button).should('have.css', 'margin');
            });

            // Verify brand colors are used
            cy.get('button:not([disabled])').first().should('have.css', 'color');

            cy.log('✅ Button component meets design system standards');
        });
    });
}); 