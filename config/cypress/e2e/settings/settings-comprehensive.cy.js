import { setupClerkTestingToken } from '@clerk/testing/cypress';
import {
  SettingsPage,
  TeamManagementPage,
  BillingPage,
  ProfilePage,
  SuperAdminPage,
} from '../../support/page-objects';
import { TestSetup, ApiInterceptors, AssertionHelpers } from '../../support/test-helpers';

/**
 * Settings Module Comprehensive Test Suite
 *
 * Tests all 5 Settings page objects with complete coverage:
 * - SettingsPage: Navigation and layout
 * - TeamManagementPage: Clerk OrganizationProfile interactions
 * - BillingPage: Stripe billing and subscription management
 * - ProfilePage: Clerk UserProfile interactions
 * - SuperAdminPage: Admin organization management
 *
 * Demonstrates SSOT patterns, dynamic waiting, and error handling
 */

describe('Settings Module - Complete Functionality', () => {
  let settingsPage;
  let teamPage;
  let billingPage;
  let profilePage;
  let superAdminPage;

  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    // Initialize all page objects
    settingsPage = new SettingsPage();
    teamPage = new TeamManagementPage();
    billingPage = new BillingPage();
    profilePage = new ProfilePage();
    superAdminPage = new SuperAdminPage();

    // Setup API interceptors for settings modules
    ApiInterceptors.setupSettingsInterceptors();

    // Performance monitoring for settings workflows
    cy.measurePageLoadTime({ performanceBudget: 3000 });
  });

  afterEach(() => {
    // Clean up test state
    settingsPage.resetPageState();
    teamPage.resetPageState();
    billingPage.resetPageState();
    profilePage.resetPageState();
    superAdminPage.resetPageState();
  });

  describe('Settings Navigation & Layout', () => {
    it('should display all settings tabs and navigate properly', () => {
      settingsPage
        .visit()
        .expectToBeOnSettingsPage()
        .expectAllBasicTabsVisible()
        .validateSettingsNavigation();

      // Test tab navigation
      settingsPage.clickTeamTab().expectTeamTabActive().expectTeamContentVisible();

      settingsPage.clickBrandingTab().expectBrandingTabActive().expectBrandingContentVisible();

      settingsPage.clickProfileTab().expectProfileTabActive().expectProfileContentVisible();

      // Performance assertion
      AssertionHelpers.expectPageLoadUnder(3000);
    });

    it('should handle role-based navigation for super admin', () => {
      // Mock super admin role
      cy.window().then(win => {
        win.sessionStorage.setItem('userRole', 'super_admin');
      });

      settingsPage
        .visit()
        .expectSuperAdminSettings()
        .clickSuperAdminTab()
        .expectSuperAdminTabActive();

      AssertionHelpers.expectPageLoadUnder(3000);
    });

    it('should be responsive across different screen sizes', () => {
      settingsPage.visit();

      // Test mobile navigation
      settingsPage.testMobileNavigation();

      // Test tablet navigation
      settingsPage.testTabletNavigation();

      AssertionHelpers.expectResponsiveDesign();
    });
  });

  describe('Team Management with Clerk Integration', () => {
    beforeEach(() => {
      // Setup organization API interceptors
      cy.intercept('GET', '**/api/organizations/**', { fixture: 'organizations/test-org.json' }).as(
        'getOrganization'
      );
      cy.intercept('POST', '**/api/organizations/*/invitations', { statusCode: 200 }).as(
        'sendInvitation'
      );
    });

    it('should manage team members and invitations', () => {
      teamPage.visit().expectToBeOnTeamPage().expectOrganizationProfileVisible();

      // Test member invitation workflow
      const testMember = {
        email: 'newuser@example.com',
        role: 'Member',
      };

      teamPage
        .inviteTeamMember(testMember.email, testMember.role)
        .expectPendingInvitation(testMember.email);

      // Verify API call was made
      cy.wait('@sendInvitation').then(interception => {
        expect(interception.request.body).to.include(testMember.email);
      });

      AssertionHelpers.expectApiCallWithin(2000);
    });

    it('should handle organization management', () => {
      teamPage.visit().expectOrganizationProfileVisible();

      // Test organization creation workflow
      cy.get('body').then($body => {
        if ($body.text().includes('No Active Organization')) {
          teamPage.createNewOrganization('Test Organization').expectOrganizationProfileVisible();
        }
      });

      AssertionHelpers.expectWorkflowCompletion();
    });

    it('should validate team member role management', () => {
      teamPage.visit().expectOrganizationProfileVisible();

      // Mock existing team member for role testing
      const memberEmail = 'existing@example.com';

      // Test role change workflow (if member exists)
      cy.get('body').then($body => {
        if ($body.text().includes(memberEmail)) {
          teamPage.testRoleManagement(memberEmail);
        }
      });

      teamPage.measureInvitationTime();
      AssertionHelpers.expectPerformanceUnder(2000);
    });
  });

  describe('Billing & Stripe Integration', () => {
    beforeEach(() => {
      // Setup billing API interceptors
      cy.intercept('POST', '**/api/create-checkout-session', {
        body: { url: 'https://checkout.stripe.com/mock-session' },
      }).as('createCheckout');

      cy.intercept('POST', '**/api/billing-portal', {
        body: { url: 'https://billing.stripe.com/mock-portal' },
      }).as('billingPortal');
    });

    it('should display pricing plans and handle plan selection', () => {
      billingPage
        .visit()
        .expectToBeOnBillingPage()
        .clickPlansTab()
        .expectPricingGridVisible()
        .expectAllPlansVisible();

      // Test plan features display
      billingPage.expectPlanFeatures('professional', [
        'Advanced Analytics',
        'Priority Support',
        'Custom Integrations',
      ]);

      // Test plan selection with mock Stripe
      billingPage.testPlanSelectionWithMock('professional');

      cy.wait('@createCheckout');
      AssertionHelpers.expectApiCallWithin(2000);
    });

    it('should handle billing portal access', () => {
      billingPage.visit().clickBillingPortalTab().validateBillingPortalAccess();

      // Test billing portal with mock
      billingPage.testBillingPortalWithMock();

      cy.wait('@billingPortal');
      AssertionHelpers.expectRedirectHandling();
    });

    it('should test FAQ functionality', () => {
      billingPage.visit().exploreFaqSection().expectFaqSectionVisible();

      // Test FAQ interaction
      cy.get('[data-accordion-trigger]')
        .first()
        .then($trigger => {
          const questionText = $trigger.text();
          billingPage
            .expandFaqItem(questionText)
            .expectFaqExpanded(questionText)
            .collapseFaqItem(questionText)
            .expectFaqCollapsed(questionText);
        });

      AssertionHelpers.expectInteractionCompletion();
    });

    it('should be responsive for mobile billing management', () => {
      billingPage.visit().testMobileBilling().testTabletBilling();

      AssertionHelpers.expectResponsiveDesign();
    });
  });

  describe('Profile Management with Clerk UserProfile', () => {
    beforeEach(() => {
      // Setup profile API interceptors
      cy.intercept('PATCH', '**/api/user/profile', { statusCode: 200 }).as('updateProfile');
      cy.intercept('POST', '**/api/user/avatar', { statusCode: 200 }).as('uploadAvatar');
    });

    it('should update user profile information', () => {
      profilePage.visit().expectToBeOnProfilePage().expectUserProfileVisible();

      // Test profile updates
      const profileData = {
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser123',
      };

      profilePage
        .updateFullName(profileData.firstName, profileData.lastName)
        .updateUsername(profileData.username);

      // Verify profile information
      profilePage.expectUserName(profileData.firstName, profileData.lastName);

      cy.wait('@updateProfile');
      AssertionHelpers.expectApiCallWithin(2000);
    });

    it('should manage contact information', () => {
      profilePage.visit().expectUserProfileVisible();

      // Test contact management workflow
      profilePage.validateContactManagement();

      AssertionHelpers.expectWorkflowCompletion();
    });

    it('should handle profile image upload', () => {
      profilePage.visit().expectUserProfileVisible();

      // Test image upload (with fixture)
      cy.fixture('test-image.jpg', null).then(() => {
        profilePage.measureImageUpload();
      });

      AssertionHelpers.expectPerformanceUnder(5000);
    });

    it('should test security settings', () => {
      profilePage.visit().expectUserProfileVisible().testSecuritySettings();

      AssertionHelpers.expectSecurityFeatures();
    });

    it('should validate form validation', () => {
      profilePage.visit().expectUserProfileVisible().testFormValidation();

      AssertionHelpers.expectFormValidation();
    });
  });

  describe('Super Admin Organization Management', () => {
    beforeEach(() => {
      // Setup super admin API interceptors
      cy.intercept('GET', '**/api/admin/organizations', {
        fixture: 'admin/organizations-list.json',
      }).as('getOrganizations');

      cy.intercept('GET', '**/api/admin/organizations/*', {
        fixture: 'admin/organization-details.json',
      }).as('getOrganizationDetails');
    });

    it('should display organizations list for super admin', () => {
      // Mock super admin role
      cy.window().then(win => {
        win.sessionStorage.setItem('userRole', 'super_admin');
      });

      superAdminPage
        .visit()
        .expectToBeOnSuperAdminPage()
        .expectAccessGranted()
        .expectOrganizationsTableVisible();

      cy.wait('@getOrganizations');

      superAdminPage.validateSystemOverview().testSuperAdminAccess();

      AssertionHelpers.expectApiCallWithin(3000);
    });

    it('should deny access to non-super admin users', () => {
      // Mock regular user role
      cy.window().then(win => {
        win.sessionStorage.setItem('userRole', 'user');
      });

      superAdminPage.visit().expectAccessDenied();

      AssertionHelpers.expectAccessControl();
    });

    it('should handle organization details navigation', () => {
      cy.window().then(win => {
        win.sessionStorage.setItem('userRole', 'super_admin');
      });

      superAdminPage.visit().expectOrganizationsTableVisible();

      // Test organization details if organizations exist
      cy.get('body').then($body => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr')
            .first()
            .find('a')
            .then($link => {
              const orgName = $link.text();
              superAdminPage.viewOrganization(orgName);
            });
        }
      });

      AssertionHelpers.expectNavigationCompletion();
    });

    it('should provide debug tools access', () => {
      cy.window().then(win => {
        win.sessionStorage.setItem('userRole', 'super_admin');
      });

      superAdminPage.visit().expectAccessGranted();

      // Test debug tools access
      cy.get('body').then($body => {
        if ($body.find('button').text().includes('Debug')) {
          superAdminPage.openDebugTools();
        }
      });

      AssertionHelpers.expectSystemAccess();
    });
  });

  describe('Cross-Module Integration Tests', () => {
    it('should navigate between all settings modules seamlessly', () => {
      // Complete settings module navigation workflow
      settingsPage.visit().navigateToAllTabs();

      // Test deep linking to specific modules
      teamPage.visit().expectToBeOnTeamPage();

      billingPage.visit().expectToBeOnBillingPage();

      profilePage.visit().expectToBeOnProfilePage();

      // Performance monitoring for complete workflow
      cy.measurePageLoadTime({
        actionName: 'settings-module-navigation',
        performanceBudget: 5000,
      });

      AssertionHelpers.expectCompleteWorkflow();
    });

    it('should maintain state across module navigation', () => {
      // Test state persistence across navigation
      settingsPage.visit().clickTeamTab();

      // Navigate to billing and back
      billingPage.visit().clickPlansTab();

      // Return to settings
      settingsPage.visit().expectTeamTabActive(); // Should remember last active tab

      AssertionHelpers.expectStatePersistence();
    });

    it('should handle errors gracefully across all modules', () => {
      // Test error handling in each module
      settingsPage.handleTabLoadingErrors();
      teamPage.handleTeamManagementErrors();
      billingPage.handleBillingErrors();
      profilePage.handleProfileErrors();
      superAdminPage.handleSuperAdminErrors();

      AssertionHelpers.expectErrorRecovery();
    });
  });

  describe('Performance & Accessibility', () => {
    it('should meet performance budgets across all settings pages', () => {
      // Test each page performance
      settingsPage.measureTabSwitchTime();
      teamPage.measureInvitationTime();
      billingPage.measurePlanSelection();
      profilePage.measureProfileUpdate();

      AssertionHelpers.expectPerformanceBudgets();
    });

    it('should be accessible across all settings modules', () => {
      // Test accessibility for each module
      settingsPage.checkSettingsAccessibility();
      teamPage.checkTeamAccessibility();
      billingPage.checkBillingAccessibility();
      profilePage.checkProfileAccessibility();
      superAdminPage.checkSuperAdminAccessibility();

      AssertionHelpers.expectAccessibilityCompliance();
    });

    it('should work responsively on mobile devices', () => {
      // Test mobile experience for all modules
      settingsPage.testMobileNavigation();
      teamPage.testMobileTeamManagement();
      billingPage.testMobileBilling();
      profilePage.testMobileProfile();
      superAdminPage.testMobileSuperAdmin();

      AssertionHelpers.expectMobileOptimization();
    });
  });

  describe('Real-world User Scenarios', () => {
    it('should complete new user onboarding workflow', () => {
      // Complete user setup across all settings
      const userData = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        phone: '+1234567890',
        organization: 'Test Company',
      };

      // Profile setup
      profilePage.visit().completeProfileSetup(userData);

      // Team setup
      teamPage
        .visit()
        .completeTeamSetup(userData.organization, [
          { email: 'teammate@example.com', role: 'Member' },
        ]);

      // Billing setup
      billingPage.visit().completePlanUpgradeWorkflow('professional');

      AssertionHelpers.expectOnboardingCompletion();
    });

    it('should handle organization admin workflow', () => {
      // Complete organization administration workflow
      teamPage.visit().expectOrganizationProfileVisible();

      // Invite multiple team members
      const teamMembers = [
        { email: 'developer@example.com', role: 'Member' },
        { email: 'manager@example.com', role: 'Admin' },
      ];

      teamPage.inviteMultipleMembers(teamMembers);

      // Setup billing for organization
      billingPage.visit().selectPlan('enterprise');

      AssertionHelpers.expectAdminWorkflow();
    });

    it('should test complete settings audit workflow', () => {
      // Perform comprehensive settings audit
      cy.window().then(win => {
        win.sessionStorage.setItem('userRole', 'super_admin');
      });

      superAdminPage.visit().performOrganizationAudit().testSearchAndFilterFunctionality();

      AssertionHelpers.expectAuditCompletion();
    });
  });
});
