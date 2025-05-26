import { BasePage } from '../shared/BasePage.js';

/**
 * Settings Page Object Model
 * Handles main settings navigation and layout interactions
 *
 * Covers:
 * - Settings navigation tabs (Profile, Team, Branding, Super Admin)
 * - Tab switching and active state verification
 * - Settings layout structure and responsive behavior
 * - Role-based navigation (Super Admin tab visibility)
 */

export class SettingsPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/settings';
    this.pageTitle = 'Settings';
  }

  // Element selectors using data-cy attributes
  elements = {
    // Main settings container
    settingsLayout: () => this.getByDataCy('settings-layout'),
    settingsHeader: () => this.getByDataCy('settings-header'),

    // Navigation tabs
    tabsList: () => cy.get('[role="tablist"]'),
    profileTab: () => cy.get('[data-value="profile"]'),
    teamTab: () => cy.get('[data-value="team"]'),
    brandingTab: () => cy.get('[data-value="branding"]'),
    superAdminTab: () => cy.get('[data-value="super-admin"]'),

    // Tab content areas
    activeTabContent: () => cy.get('[role="tabpanel"]:not([hidden])'),
    profileTabContent: () => cy.get('[data-value="profile"][role="tabpanel"]'),
    teamTabContent: () => cy.get('[data-value="team"][role="tabpanel"]'),
    brandingTabContent: () => cy.get('[data-value="branding"][role="tabpanel"]'),
    superAdminTabContent: () => cy.get('[data-value="super-admin"][role="tabpanel"]'),

    // Settings navigation items
    profileSettingsLink: () => cy.contains('a', 'Profile Settings'),
    teamManagementLink: () => cy.contains('a', 'Team Management'),
    brandingLink: () => cy.contains('a', 'Branding'),
    superAdminLink: () => cy.contains('a', 'Super Admin'),
  };

  // Page navigation actions
  visit(subPath = '/profile') {
    const fullPath = subPath.startsWith('/settings') ? subPath : `/settings${subPath}`;
    cy.visit(fullPath);
    this.waitForPageLoad();
    return this;
  }

  visitProfile() {
    return this.visit('/profile');
  }

  visitTeam() {
    return this.visit('/team');
  }

  visitBranding() {
    return this.visit('/branding');
  }

  visitSuperAdmin() {
    return this.visit('/super-admin');
  }

  // Tab navigation actions
  clickProfileTab() {
    this.logAction('Clicking Profile Settings tab');
    this.elements.profileTab().click();
    this.expectActiveTab('profile');
    return this;
  }

  clickTeamTab() {
    this.logAction('Clicking Team Management tab');
    this.elements.teamTab().click();
    this.expectActiveTab('team');
    return this;
  }

  clickBrandingTab() {
    this.logAction('Clicking Branding tab');
    this.elements.brandingTab().click();
    this.expectActiveTab('branding');
    return this;
  }

  clickSuperAdminTab() {
    this.logAction('Clicking Super Admin tab');
    this.elements.superAdminTab().click();
    this.expectActiveTab('super-admin');
    return this;
  }

  // Navigation link actions
  clickProfileSettingsLink() {
    this.logAction('Navigating to Profile Settings via link');
    this.elements.profileSettingsLink().click();
    cy.url().should('include', '/settings/profile');
    return this;
  }

  clickTeamManagementLink() {
    this.logAction('Navigating to Team Management via link');
    this.elements.teamManagementLink().click();
    cy.url().should('include', '/settings/team');
    return this;
  }

  clickBrandingLink() {
    this.logAction('Navigating to Branding via link');
    this.elements.brandingLink().click();
    cy.url().should('include', '/settings/branding');
    return this;
  }

  clickSuperAdminLink() {
    this.logAction('Navigating to Super Admin via link');
    this.elements.superAdminLink().click();
    cy.url().should('include', '/settings/super-admin');
    return this;
  }

  // Page state assertions
  expectToBeOnSettingsPage() {
    cy.url().should('include', '/settings');
    this.elements.tabsList().should('be.visible');
    return this;
  }

  expectActiveTab(tabValue) {
    cy.get(`[data-value="${tabValue}"]`).should('have.attr', 'data-state', 'active');
    return this;
  }

  expectProfileTabActive() {
    return this.expectActiveTab('profile');
  }

  expectTeamTabActive() {
    return this.expectActiveTab('team');
  }

  expectBrandingTabActive() {
    return this.expectActiveTab('branding');
  }

  expectSuperAdminTabActive() {
    return this.expectActiveTab('super-admin');
  }

  // Tab visibility assertions
  expectAllBasicTabsVisible() {
    this.elements.profileTab().should('be.visible');
    this.elements.teamTab().should('be.visible');
    this.elements.brandingTab().should('be.visible');
    return this;
  }

  expectSuperAdminTabVisible() {
    this.elements.superAdminTab().should('be.visible');
    return this;
  }

  expectSuperAdminTabNotVisible() {
    this.elements.superAdminTab().should('not.exist');
    return this;
  }

  // Content area assertions
  expectTabContentVisible() {
    this.elements.activeTabContent().should('be.visible');
    return this;
  }

  expectProfileContentVisible() {
    this.elements.profileTabContent().should('be.visible');
    return this;
  }

  expectTeamContentVisible() {
    this.elements.teamTabContent().should('be.visible');
    return this;
  }

  expectBrandingContentVisible() {
    this.elements.brandingTabContent().should('be.visible');
    return this;
  }

  expectSuperAdminContentVisible() {
    this.elements.superAdminTabContent().should('be.visible');
    return this;
  }

  // Role-based functionality
  expectStandardUserSettings() {
    this.expectAllBasicTabsVisible();
    this.expectSuperAdminTabNotVisible();
    return this;
  }

  expectSuperAdminSettings() {
    this.expectAllBasicTabsVisible();
    this.expectSuperAdminTabVisible();
    return this;
  }

  // Tab content validation
  expectTabContentLoaded(tabValue) {
    cy.get(`[data-value="${tabValue}"][role="tabpanel"]`).within(() => {
      // Should contain some loaded content, not just loading states
      cy.get('body').should('not.contain', 'Loading...');
    });
    return this;
  }

  // Complex workflows
  navigateToAllTabs() {
    this.logAction('Testing navigation to all available tabs');

    // Start with profile
    this.clickProfileTab();
    this.expectTabContentLoaded('profile');

    // Navigate to team
    this.clickTeamTab();
    this.expectTabContentLoaded('team');

    // Navigate to branding
    this.clickBrandingTab();
    this.expectTabContentLoaded('branding');

    // Navigate to super admin if visible
    cy.get('body').then($body => {
      if ($body.find('[data-value="super-admin"]').length > 0) {
        this.clickSuperAdminTab();
        this.expectTabContentLoaded('super-admin');
      }
    });

    return this;
  }

  validateSettingsNavigation() {
    this.logAction('Validating complete settings navigation');

    this.expectToBeOnSettingsPage();
    this.expectAllBasicTabsVisible();
    this.expectTabContentVisible();

    return this;
  }

  // Wait for page load
  waitForPageLoad() {
    this.elements.tabsList().should('be.visible', { timeout: this.loadTimeout });
    this.elements.activeTabContent().should('be.visible', { timeout: this.loadTimeout });
    return this;
  }

  // Responsive design testing
  testMobileNavigation() {
    cy.viewport('iphone-6');
    this.expectAllBasicTabsVisible();
    this.clickTeamTab();
    this.expectTeamTabActive();
    cy.viewport(1280, 720); // Reset to desktop
    return this;
  }

  testTabletNavigation() {
    cy.viewport('ipad-2');
    this.navigateToAllTabs();
    cy.viewport(1280, 720); // Reset to desktop
    return this;
  }

  // Error state handling
  handleTabLoadingErrors() {
    // Handle common tab loading issues
    cy.get('body').then($body => {
      if ($body.text().includes('Error')) {
        cy.log('⚠️ Tab content error detected, attempting recovery');
        cy.reload();
        this.waitForPageLoad();
      }
    });
    return this;
  }

  // Performance monitoring
  measureTabSwitchTime() {
    return this.measureInteractionTime(
      () => {
        this.clickTeamTab();
      },
      {
        actionName: 'settings-tab-switch',
        performanceBudget: 1000, // 1 second for tab switching
      }
    );
  }

  // Accessibility testing
  checkSettingsAccessibility() {
    cy.checkA11y('[role="tablist"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
      },
    });
    return this;
  }
}
