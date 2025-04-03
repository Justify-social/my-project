describe('Icon Rendering', () => {
  beforeEach(() => {
    cy.visit('/debug-tools/icons');
  });

  it('should render light icons correctly', () => {
    cy.get('[data-testid="light-icon-demo"]').should('be.visible');
    
    // Check that light icons have the correct CSS classes
    cy.get('[data-testid="light-icon-demo"] img').first()
      .should('have.attr', 'src')
      .and('include', '/icons/light/');
  });

  it('should render solid icons correctly', () => {
    cy.get('[data-testid="solid-icon-demo"]').should('be.visible');
    
    // Check that solid icons have the correct CSS classes
    cy.get('[data-testid="solid-icon-demo"] img').first()
      .should('have.attr', 'src')
      .and('include', '/icons/solid/');
  });

  it('should render brand icons correctly', () => {
    cy.get('[data-testid="brand-icon-demo"]').should('be.visible');
    
    // Check that brand icons have the correct CSS classes
    cy.get('[data-testid="brand-icon-demo"] img').first()
      .should('have.attr', 'src')
      .and('include', '/icons/brands/');
  });

  it('should handle hover state transitions correctly', () => {
    // Find an icon with hover effects
    cy.get('[data-testid="hover-icon-demo"]').should('be.visible');
    
    // Get the initial icon variant (light)
    cy.get('[data-testid="hover-icon-demo"] img')
      .should('have.attr', 'src')
      .and('include', '/icons/light/');
    
    // Hover over the icon and verify it changes to solid
    cy.get('[data-testid="hover-icon-demo"]').trigger('mouseover');
    cy.get('[data-testid="hover-icon-demo"] img')
      .should('have.attr', 'src')
      .and('include', '/icons/solid/');
    
    // Move away and verify it returns to light
    cy.get('[data-testid="hover-icon-demo"]').trigger('mouseout');
    cy.get('[data-testid="hover-icon-demo"] img')
      .should('have.attr', 'src')
      .and('include', '/icons/light/');
  });

  it('should render different icon sizes correctly', () => {
    // Check small icon
    cy.get('[data-testid="size-sm-icon"]').should('be.visible')
      .and('have.class', 'w-4')
      .and('have.class', 'h-4');
    
    // Check medium icon
    cy.get('[data-testid="size-md-icon"]').should('be.visible')
      .and('have.class', 'w-5')
      .and('have.class', 'h-5');
    
    // Check large icon
    cy.get('[data-testid="size-lg-icon"]').should('be.visible')
      .and('have.class', 'w-6')
      .and('have.class', 'h-6');
    
    // Check extra large icon
    cy.get('[data-testid="size-xl-icon"]').should('be.visible')
      .and('have.class', 'w-8')
      .and('have.class', 'h-8');
  });

  it('should show the fallback icon when an invalid icon is requested', () => {
    cy.get('[data-testid="fallback-icon-demo"]').should('be.visible');
    
    // Check that the fallback icon is shown
    cy.get('[data-testid="fallback-icon-demo"] img')
      .should('have.attr', 'src')
      .and('include', '/icons/light/question.svg');
  });
}); 