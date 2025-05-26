import { BasePage } from '../shared/BasePage.js';

/**
 * Team Management Page Object Model
 * Handles Clerk OrganizationProfile component interactions
 *
 * Covers:
 * - Team member invitation and management
 * - Organization profile settings
 * - Member role assignments and permissions
 * - Organization switching functionality
 * - Member removal and role changes
 */

export class TeamManagementPage extends BasePage {
  constructor() {
    super();
    this.pageUrl = '/settings/team';
    this.pageTitle = 'Team Management';
  }

  // Element selectors using data-cy attributes and Clerk component selectors
  elements = {
    // Main team management container
    teamContainer: () => this.getByDataCy('team-management-container'),

    // Organization Profile component (Clerk)
    organizationProfile: () => cy.get('[data-clerk-component="organization-profile"]'),

    // Organization switcher
    organizationSwitcher: () => cy.get('[data-testid="organization-switcher"]'),

    // Team member section
    membersSection: () => cy.contains('Members').parent(),
    membersList: () => cy.get('[data-testid="member-list"]'),
    memberItem: memberEmail => cy.contains('[data-testid="member-item"]', memberEmail),

    // Invitation section
    inviteSection: () => cy.contains('Invite').parent(),
    inviteEmailInput: () => cy.get('input[type="email"]').first(),
    inviteRoleSelect: () => cy.get('select, [role="combobox"]').contains('Role'),
    inviteButton: () => cy.contains('button', 'Invite').first(),

    // Member management actions
    memberRoleSelect: memberEmail => this.memberItem(memberEmail).find('select, [role="combobox"]'),
    removeMemberButton: memberEmail =>
      this.memberItem(memberEmail).find('button').contains('Remove'),

    // Organization settings
    organizationNameInput: () => cy.get('input[name*="name"]'),
    organizationSlugInput: () => cy.get('input[name*="slug"]'),
    saveOrganizationButton: () => cy.contains('button', 'Save'),

    // Pending invitations
    pendingInvitationsSection: () => cy.contains('Pending').parent(),
    pendingInvitationItem: email => cy.contains('[data-testid="pending-invitation"]', email),
    resendInviteButton: email =>
      this.pendingInvitationItem(email).find('button').contains('Resend'),
    revokeInviteButton: email =>
      this.pendingInvitationItem(email).find('button').contains('Revoke'),

    // No organization state
    noOrganizationCard: () => cy.contains('No Active Organization').parent(),
    createOrganizationButton: () => cy.contains('button', 'Create'),

    // Error and success messages
    successMessage: () => cy.get('[role="alert"]').contains('success'),
    errorMessage: () => cy.get('[role="alert"]').contains('error'),

    // Loading states
    loadingSpinner: () => cy.get('[data-testid="loading"], .animate-spin'),
  };

  // Page navigation actions
  visit() {
    cy.visit(this.pageUrl);
    this.waitForPageLoad();
    return this;
  }

  // Team member invitation actions
  inviteTeamMember(email, role = 'Member') {
    this.logAction(`Inviting team member: ${email} with role: ${role}`);

    this.elements.inviteEmailInput().clear().type(email);

    if (role !== 'Member') {
      this.elements.inviteRoleSelect().click();
      cy.contains('[role="option"]', role).click();
    }

    this.elements.inviteButton().click();
    this.expectSuccessMessage();
    return this;
  }

  inviteMultipleMembers(members) {
    members.forEach(member => {
      this.inviteTeamMember(member.email, member.role);
      cy.wait(1000); // Brief wait between invitations
    });
    return this;
  }

  // Member management actions
  changeMemberRole(memberEmail, newRole) {
    this.logAction(`Changing role for ${memberEmail} to ${newRole}`);

    this.elements.memberRoleSelect(memberEmail).click();
    cy.contains('[role="option"]', newRole).click();
    this.expectSuccessMessage();
    return this;
  }

  removeMember(memberEmail) {
    this.logAction(`Removing team member: ${memberEmail}`);

    this.elements.removeMemberButton(memberEmail).click();

    // Confirm removal in modal
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Remove').click();
    });

    this.expectSuccessMessage();
    this.expectMemberNotInList(memberEmail);
    return this;
  }

  // Pending invitation management
  resendInvitation(email) {
    this.logAction(`Resending invitation to: ${email}`);
    this.elements.resendInviteButton(email).click();
    this.expectSuccessMessage();
    return this;
  }

  revokeInvitation(email) {
    this.logAction(`Revoking invitation for: ${email}`);
    this.elements.revokeInviteButton(email).click();

    // Confirm revocation
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Revoke').click();
    });

    this.expectSuccessMessage();
    return this;
  }

  // Organization management actions
  updateOrganizationName(newName) {
    this.logAction(`Updating organization name to: ${newName}`);

    this.elements.organizationNameInput().clear().type(newName);
    this.elements.saveOrganizationButton().click();
    this.expectSuccessMessage();
    return this;
  }

  updateOrganizationSlug(newSlug) {
    this.logAction(`Updating organization slug to: ${newSlug}`);

    this.elements.organizationSlugInput().clear().type(newSlug);
    this.elements.saveOrganizationButton().click();
    this.expectSuccessMessage();
    return this;
  }

  // Organization switching
  switchToOrganization(organizationName) {
    this.logAction(`Switching to organization: ${organizationName}`);

    this.elements.organizationSwitcher().click();
    cy.contains('[role="option"]', organizationName).click();
    this.waitForPageLoad();
    return this;
  }

  createNewOrganization(organizationName) {
    this.logAction(`Creating new organization: ${organizationName}`);

    this.elements.createOrganizationButton().click();

    cy.get('[role="dialog"]').within(() => {
      cy.get('input[name*="name"]').type(organizationName);
      cy.contains('button', 'Create').click();
    });

    this.waitForPageLoad();
    return this;
  }

  // Page state assertions
  expectToBeOnTeamPage() {
    cy.url().should('include', '/settings/team');
    return this;
  }

  expectOrganizationProfileVisible() {
    this.elements.organizationProfile().should('be.visible');
    return this;
  }

  expectNoOrganizationState() {
    this.elements.noOrganizationCard().should('be.visible');
    this.elements.createOrganizationButton().should('be.visible');
    return this;
  }

  // Member verification
  expectMemberInList(memberEmail, role = null) {
    this.elements.memberItem(memberEmail).should('be.visible');

    if (role) {
      this.elements.memberItem(memberEmail).should('contain', role);
    }
    return this;
  }

  expectMemberNotInList(memberEmail) {
    this.elements.memberItem(memberEmail).should('not.exist');
    return this;
  }

  expectMemberCount(expectedCount) {
    this.elements
      .membersList()
      .find('[data-testid="member-item"]')
      .should('have.length', expectedCount);
    return this;
  }

  // Invitation verification
  expectPendingInvitation(email) {
    this.elements.pendingInvitationItem(email).should('be.visible');
    return this;
  }

  expectNoPendingInvitation(email) {
    this.elements.pendingInvitationItem(email).should('not.exist');
    return this;
  }

  // Message assertions
  expectSuccessMessage() {
    this.elements.successMessage().should('be.visible');
    return this;
  }

  expectErrorMessage() {
    this.elements.errorMessage().should('be.visible');
    return this;
  }

  // Form validation
  expectInviteFormEmpty() {
    this.elements.inviteEmailInput().should('be.empty');
    return this;
  }

  expectInviteFormError() {
    cy.get('[data-testid="invite-form"]').within(() => {
      cy.get('[role="alert"], .text-destructive').should('be.visible');
    });
    return this;
  }

  // Loading states
  expectLoadingState() {
    this.elements.loadingSpinner().should('be.visible');
    return this;
  }

  expectContentLoaded() {
    this.elements.loadingSpinner().should('not.exist');
    this.elements.organizationProfile().should('be.visible');
    return this;
  }

  // Wait for page load
  waitForPageLoad() {
    // Wait for either organization profile or no organization state
    cy.get('body').should($body => {
      const hasOrgProfile = $body.find('[data-clerk-component="organization-profile"]').length > 0;
      const hasNoOrg = $body.text().includes('No Active Organization');
      expect(hasOrgProfile || hasNoOrg).to.be.true;
    });
    return this;
  }

  // Complex workflows
  completeTeamSetup(organizationName, members) {
    this.logAction('Completing full team setup workflow');

    // Create organization if needed
    cy.get('body').then($body => {
      if ($body.text().includes('No Active Organization')) {
        this.createNewOrganization(organizationName);
      }
    });

    // Invite all team members
    if (members && members.length > 0) {
      this.inviteMultipleMembers(members);
    }

    return this;
  }

  validateTeamMembershipWorkflow(testEmail) {
    this.logAction('Testing complete team membership workflow');

    // Invite member
    this.inviteTeamMember(testEmail, 'Member');
    this.expectPendingInvitation(testEmail);

    // Change role while pending
    // Note: This might not be possible in Clerk, so we'll test after acceptance

    // Revoke invitation
    this.revokeInvitation(testEmail);
    this.expectNoPendingInvitation(testEmail);

    return this;
  }

  // Role management testing
  testRoleManagement(memberEmail) {
    const roles = ['Member', 'Admin'];

    roles.forEach(role => {
      this.changeMemberRole(memberEmail, role);
      this.expectMemberInList(memberEmail, role);
    });

    return this;
  }

  // Error handling
  handleTeamManagementErrors() {
    cy.get('body').then($body => {
      if ($body.text().includes('Error') || $body.find('[role="alert"]').length > 0) {
        cy.log('⚠️ Team management error detected');
        this.takeScreenshot('team-management-error');
      }
    });
    return this;
  }

  // Performance monitoring
  measureInvitationTime() {
    return this.measureInteractionTime(
      () => {
        this.inviteTeamMember('test@example.com', 'Member');
      },
      {
        actionName: 'team-member-invitation',
        performanceBudget: 2000, // 2 seconds for invitation
      }
    );
  }

  // Responsive design testing
  testMobileTeamManagement() {
    cy.viewport('iphone-6');
    this.expectOrganizationProfileVisible();
    // Clerk components should be responsive
    cy.viewport(1280, 720); // Reset
    return this;
  }

  // Accessibility testing
  checkTeamAccessibility() {
    cy.checkA11y('[data-clerk-component="organization-profile"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
      },
    });
    return this;
  }
}
