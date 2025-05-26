import { BasePage } from '../shared/BasePage.js';

/**
 * Super Admin Page Object Model
 * Handles admin-only functionality and organization management
 *
 * Covers:
 * - Organization management and oversight
 * - User administration across organizations
 * - Debug tools access and system monitoring
 * - Campaign wizard management
 * - Brand lift study administration
 * - System health and metrics
 */

export class SuperAdminPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/settings/super-admin';
    this.pageTitle = 'Super Admin';
  }

  // Element selectors using data-cy attributes
  elements = {
    // Main super admin container
    superAdminContainer: () => this.getByDataCy('super-admin-container'),
    superAdminHeader: () => this.getByDataCy('super-admin-header'),

    // Page header and actions
    pageTitle: () => cy.contains('h2', 'Organisation Management'),
    debugToolsButton: () => cy.contains('button', 'Debug'),
    debugToolsLink: () => cy.contains('a', 'Debug'),

    // Organizations section
    organizationsSection: () => this.getByDataCy('organizations-section'),
    organizationsTable: () => cy.get('[data-testid="organizations-table"]'),
    organizationRow: orgId => cy.get(`[data-testid="org-row-${orgId}"]`),
    organizationName: orgId => this.elements.organizationRow(orgId).find('[data-cy="org-name"]'),
    organizationLink: orgName => cy.contains('a', orgName),

    // Organization table headers
    nameHeader: () => cy.contains('th', 'Name'),
    idSlugHeader: () => cy.contains('th', 'ID/Slug'),
    membersHeader: () => cy.contains('th', 'Members'),
    createdHeader: () => cy.contains('th', 'Created At'),

    // Loading and empty states
    loadingSpinner: () => cy.get('[data-testid="loading"], .animate-spin'),
    emptyState: () => cy.contains('No organisations found'),
    errorState: () => cy.get('[data-cy="error-state"]'),

    // Access control indicators
    accessDeniedMessage: () => cy.contains('Access Denied'),
    superAdminBadge: () => cy.contains('Super Admin'),
    roleIndicator: () => this.getByDataCy('user-role-indicator'),
  };

  // Page navigation actions
  visit() {
    cy.visit(this.pageUrl);
    this.waitForPageLoad();
    return this;
  }

  // Organization management actions
  viewOrganization(orgName) {
    this.logAction(`Viewing organization: ${orgName}`);
    this.elements.organizationLink(orgName).click();
    return this;
  }

  openDebugTools() {
    this.logAction('Opening debug tools');
    this.elements.debugToolsButton().click();
    cy.url().should('include', '/debug-tools');
    return this;
  }

  // Page state assertions
  expectToBeOnSuperAdminPage() {
    cy.url().should('include', '/settings/super-admin');
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  expectAccessGranted() {
    this.elements.superAdminContainer().should('be.visible');
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  expectAccessDenied() {
    this.elements.accessDeniedMessage().should('be.visible');
    return this;
  }

  expectOrganizationsTableVisible() {
    this.elements.organizationsTable().should('be.visible');
    return this;
  }

  expectOrganizationInList(orgName) {
    this.elements.organizationLink(orgName).should('be.visible');
    return this;
  }

  // Wait for page load
  waitForPageLoad() {
    // Wait for either access granted or denied
    cy.get('body').should($body => {
      const hasTable = $body.find('[data-testid="organizations-table"]').length > 0;
      const hasAccessDenied = $body.text().includes('Access Denied');
      expect(hasTable || hasAccessDenied).to.be.true;
    });
    return this;
  }

  // Complex workflows
  validateSystemOverview() {
    this.logAction('Validating system overview and health');

    this.expectOrganizationsTableVisible();
    this.elements.debugToolsButton().should('be.visible');

    return this;
  }

  testSuperAdminAccess() {
    this.logAction('Testing super admin access controls');

    this.expectAccessGranted();
    this.elements.debugToolsButton().should('be.visible');

    return this;
  }
}
