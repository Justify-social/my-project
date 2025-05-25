import { BasePage } from '../shared/BasePage.js';

/**
 * Profile Page Object Model
 * Handles Clerk UserProfile component interactions
 * 
 * Covers:
 * - User profile information management
 * - Email and phone number updates
 * - Password and security settings
 * - Profile image upload and management
 * - Account preferences and notifications
 * - Sign out functionality
 */

export class ProfilePage extends BasePage {
    constructor() {
        super();
        this.pageUrl = '/settings/profile';
        this.pageTitle = 'Profile Settings';
    }

    // Element selectors using data-cy attributes and Clerk component selectors
    elements = {
        // Main profile container
        profileContainer: () => this.getByDataCy('profile-container'),

        // Clerk UserProfile component
        userProfile: () => cy.get('[data-clerk-component="user-profile"]'),

        // Profile header and basic info
        profileHeader: () => cy.get('[data-testid="user-profile-header"]'),
        profileImage: () => cy.get('[data-testid="profile-image"]'),
        userName: () => cy.get('[data-testid="user-name"]'),
        userEmail: () => cy.get('[data-testid="user-email"]'),

        // Profile editing sections
        personalInfoSection: () => cy.contains('Personal information').parent(),
        emailSection: () => cy.contains('Email').parent(),
        phoneSection: () => cy.contains('Phone').parent(),
        passwordSection: () => cy.contains('Password').parent(),

        // Form inputs
        firstNameInput: () => cy.get('input[name*="firstName"]'),
        lastNameInput: () => cy.get('input[name*="lastName"]'),
        usernameInput: () => cy.get('input[name*="username"]'),

        // Email management
        emailInput: () => cy.get('input[type="email"]'),
        addEmailButton: () => cy.contains('button', 'Add email'),
        primaryEmailBadge: () => cy.contains('.badge', 'Primary'),
        setPrimaryEmailButton: (email) => cy.contains(email).parent().find('button').contains('Set as primary'),
        removeEmailButton: (email) => cy.contains(email).parent().find('button').contains('Remove'),

        // Phone management
        phoneInput: () => cy.get('input[type="tel"]'),
        addPhoneButton: () => cy.contains('button', 'Add phone'),
        primaryPhoneBadge: () => cy.contains('.badge', 'Primary'),
        setPrimaryPhoneButton: (phone) => cy.contains(phone).parent().find('button').contains('Set as primary'),
        removePhoneButton: (phone) => cy.contains(phone).parent().find('button').contains('Remove'),

        // Password management
        currentPasswordInput: () => cy.get('input[name*="currentPassword"]'),
        newPasswordInput: () => cy.get('input[name*="newPassword"]'),
        confirmPasswordInput: () => cy.get('input[name*="confirmPassword"]'),
        changePasswordButton: () => cy.contains('button', 'Change password'),

        // Profile image management
        profileImageUpload: () => cy.get('input[type="file"]'),
        uploadImageButton: () => cy.contains('button', 'Upload'),
        removeImageButton: () => cy.contains('button', 'Remove'),
        imagePreview: () => cy.get('[data-testid="image-preview"]'),

        // Form actions
        saveButton: () => cy.contains('button', 'Save'),
        cancelButton: () => cy.contains('button', 'Cancel'),
        editButton: () => cy.contains('button', 'Edit'),

        // Sign out section
        signOutSection: () => cy.get('[data-testid="sign-out-section"]'),
        signOutButton: () => cy.contains('button', 'Sign Out'),

        // Verification and security
        verificationSection: () => cy.contains('Verification').parent(),
        twoFactorSection: () => cy.contains('Two-factor').parent(),
        enableTwoFactorButton: () => cy.contains('button', 'Enable'),
        disableTwoFactorButton: () => cy.contains('button', 'Disable'),

        // Notifications and preferences
        notificationsSection: () => cy.contains('Notifications').parent(),
        emailNotificationsToggle: () => cy.get('[data-testid="email-notifications-toggle"]'),
        smsNotificationsToggle: () => cy.get('[data-testid="sms-notifications-toggle"]'),

        // Status messages
        successMessage: () => cy.get('[role="alert"]').contains('success'),
        errorMessage: () => cy.get('[role="alert"]').contains('error'),

        // Loading states
        loadingSpinner: () => cy.get('[data-testid="loading"], .animate-spin'),
        formLoading: () => cy.get('[data-testid="form-loading"]'),
    };

    // Page navigation actions
    visit() {
        cy.visit(this.pageUrl);
        this.waitForPageLoad();
        return this;
    }

    // Profile information actions
    updateFirstName(firstName) {
        this.logAction(`Updating first name to: ${firstName}`);
        this.elements.firstNameInput().clear().type(firstName);
        this.elements.saveButton().click();
        this.expectSuccessMessage();
        return this;
    }

    updateLastName(lastName) {
        this.logAction(`Updating last name to: ${lastName}`);
        this.elements.lastNameInput().clear().type(lastName);
        this.elements.saveButton().click();
        this.expectSuccessMessage();
        return this;
    }

    updateUsername(username) {
        this.logAction(`Updating username to: ${username}`);
        this.elements.usernameInput().clear().type(username);
        this.elements.saveButton().click();
        this.expectSuccessMessage();
        return this;
    }

    updateFullName(firstName, lastName) {
        this.logAction(`Updating full name to: ${firstName} ${lastName}`);
        this.elements.firstNameInput().clear().type(firstName);
        this.elements.lastNameInput().clear().type(lastName);
        this.elements.saveButton().click();
        this.expectSuccessMessage();
        return this;
    }

    // Email management actions
    addEmail(email) {
        this.logAction(`Adding email: ${email}`);
        this.elements.addEmailButton().click();
        this.elements.emailInput().type(email);
        this.elements.saveButton().click();
        this.expectSuccessMessage();
        return this;
    }

    setPrimaryEmail(email) {
        this.logAction(`Setting primary email: ${email}`);
        this.elements.setPrimaryEmailButton(email).click();
        this.expectSuccessMessage();
        return this;
    }

    removeEmail(email) {
        this.logAction(`Removing email: ${email}`);
        this.elements.removeEmailButton(email).click();

        // Confirm removal in modal
        cy.get('[role="dialog"]').within(() => {
            cy.contains('button', 'Remove').click();
        });

        this.expectSuccessMessage();
        return this;
    }

    // Phone management actions
    addPhone(phoneNumber) {
        this.logAction(`Adding phone: ${phoneNumber}`);
        this.elements.addPhoneButton().click();
        this.elements.phoneInput().type(phoneNumber);
        this.elements.saveButton().click();
        this.expectSuccessMessage();
        return this;
    }

    setPrimaryPhone(phone) {
        this.logAction(`Setting primary phone: ${phone}`);
        this.elements.setPrimaryPhoneButton(phone).click();
        this.expectSuccessMessage();
        return this;
    }

    removePhone(phone) {
        this.logAction(`Removing phone: ${phone}`);
        this.elements.removePhoneButton(phone).click();

        // Confirm removal in modal
        cy.get('[role="dialog"]').within(() => {
            cy.contains('button', 'Remove').click();
        });

        this.expectSuccessMessage();
        return this;
    }

    // Password management actions
    changePassword(currentPassword, newPassword) {
        this.logAction('Changing password');
        this.elements.currentPasswordInput().type(currentPassword);
        this.elements.newPasswordInput().type(newPassword);
        this.elements.confirmPasswordInput().type(newPassword);
        this.elements.changePasswordButton().click();
        this.expectSuccessMessage();
        return this;
    }

    // Profile image actions
    uploadProfileImage(imagePath) {
        this.logAction(`Uploading profile image: ${imagePath}`);
        this.elements.profileImageUpload().selectFile(imagePath);
        this.elements.uploadImageButton().click();
        this.expectSuccessMessage();
        return this;
    }

    removeProfileImage() {
        this.logAction('Removing profile image');
        this.elements.removeImageButton().click();

        // Confirm removal
        cy.get('[role="dialog"]').within(() => {
            cy.contains('button', 'Remove').click();
        });

        this.expectSuccessMessage();
        return this;
    }

    // Two-factor authentication actions
    enableTwoFactor() {
        this.logAction('Enabling two-factor authentication');
        this.elements.enableTwoFactorButton().click();

        // Handle 2FA setup flow (this would be complex in real implementation)
        // For now, just expect the setup modal
        cy.get('[role="dialog"]').should('be.visible');
        return this;
    }

    disableTwoFactor() {
        this.logAction('Disabling two-factor authentication');
        this.elements.disableTwoFactorButton().click();

        // Confirm disable
        cy.get('[role="dialog"]').within(() => {
            cy.contains('button', 'Disable').click();
        });

        this.expectSuccessMessage();
        return this;
    }

    // Notification preferences
    toggleEmailNotifications() {
        this.logAction('Toggling email notifications');
        this.elements.emailNotificationsToggle().click();
        return this;
    }

    toggleSmsNotifications() {
        this.logAction('Toggling SMS notifications');
        this.elements.smsNotificationsToggle().click();
        return this;
    }

    // Sign out action
    signOut() {
        this.logAction('Signing out');
        this.elements.signOutButton().click();

        // Should redirect to sign-in page
        cy.url().should('include', '/sign-in');
        return this;
    }

    // Page state assertions
    expectToBeOnProfilePage() {
        cy.url().should('include', '/settings/profile');
        this.elements.userProfile().should('be.visible');
        return this;
    }

    expectUserProfileVisible() {
        this.elements.userProfile().should('be.visible');
        return this;
    }

    // Profile information assertions
    expectUserName(firstName, lastName) {
        this.elements.userName().should('contain', `${firstName} ${lastName}`);
        return this;
    }

    expectUserEmail(email) {
        this.elements.userEmail().should('contain', email);
        return this;
    }

    expectPrimaryEmail(email) {
        cy.contains(email).parent().within(() => {
            this.elements.primaryEmailBadge().should('be.visible');
        });
        return this;
    }

    expectPrimaryPhone(phone) {
        cy.contains(phone).parent().within(() => {
            this.elements.primaryPhoneBadge().should('be.visible');
        });
        return this;
    }

    expectProfileImageVisible() {
        this.elements.profileImage().should('be.visible');
        return this;
    }

    expectNoProfileImage() {
        this.elements.profileImage().should('not.exist');
        return this;
    }

    // Form state assertions
    expectFormInEditMode() {
        this.elements.saveButton().should('be.visible');
        this.elements.cancelButton().should('be.visible');
        return this;
    }

    expectFormInViewMode() {
        this.elements.editButton().should('be.visible');
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

    // Loading state assertions
    expectLoadingState() {
        this.elements.loadingSpinner().should('be.visible');
        return this;
    }

    expectContentLoaded() {
        this.elements.loadingSpinner().should('not.exist');
        this.elements.userProfile().should('be.visible');
        return this;
    }

    // Wait for page load
    waitForPageLoad() {
        this.elements.userProfile().should('be.visible', { timeout: this.loadTimeout });
        return this;
    }

    // Complex workflows
    completeProfileSetup(profileData) {
        this.logAction('Completing full profile setup');

        const { firstName, lastName, username, email, phone, profileImage } = profileData;

        // Update basic information
        if (firstName || lastName) {
            this.updateFullName(firstName, lastName);
        }

        if (username) {
            this.updateUsername(username);
        }

        // Add additional contact methods
        if (email) {
            this.addEmail(email);
        }

        if (phone) {
            this.addPhone(phone);
        }

        // Upload profile image
        if (profileImage) {
            this.uploadProfileImage(profileImage);
        }

        return this;
    }

    validateContactManagement() {
        this.logAction('Testing contact management workflow');

        const testEmail = 'test+new@example.com';
        const testPhone = '+1234567890';

        // Add new email
        this.addEmail(testEmail);
        this.expectPrimaryEmail(testEmail); // Might become primary if it's the first

        // Add new phone
        this.addPhone(testPhone);
        this.expectPrimaryPhone(testPhone);

        // Clean up
        this.removeEmail(testEmail);
        this.removePhone(testPhone);

        return this;
    }

    testSecuritySettings() {
        this.logAction('Testing security settings');

        // Test password change (with mock passwords)
        // Note: In real tests, we'd need proper test credentials
        // this.changePassword('oldpass', 'newpass123!');

        // Test 2FA toggle
        cy.get('body').then($body => {
            if ($body.find('button').text().includes('Enable')) {
                this.enableTwoFactor();
            } else {
                this.disableTwoFactor();
            }
        });

        return this;
    }

    // Error handling
    handleProfileErrors() {
        cy.get('body').then($body => {
            if ($body.text().includes('Error') || $body.find('[role="alert"]').length > 0) {
                cy.log('⚠️ Profile error detected');
                this.takeScreenshot('profile-error');

                // Try to recover
                this.elements.cancelButton().click({ force: true });
            }
        });
        return this;
    }

    // Performance monitoring
    measureProfileUpdate() {
        return this.measureInteractionTime(() => {
            this.updateFirstName('TestUser');
        }, {
            actionName: 'profile-update',
            performanceBudget: 2000 // 2 seconds for profile update
        });
    }

    measureImageUpload() {
        return this.measureInteractionTime(() => {
            this.uploadProfileImage('cypress/fixtures/test-image.jpg');
        }, {
            actionName: 'profile-image-upload',
            performanceBudget: 5000 // 5 seconds for image upload
        });
    }

    // Responsive design testing
    testMobileProfile() {
        cy.viewport('iphone-6');
        this.expectUserProfileVisible();
        cy.viewport(1280, 720); // Reset
        return this;
    }

    // Accessibility testing
    checkProfileAccessibility() {
        cy.checkA11y('[data-clerk-component="user-profile"]', {
            rules: {
                'color-contrast': { enabled: true },
                'keyboard-navigation': { enabled: true },
                'aria-labels': { enabled: true }
            }
        });
        return this;
    }

    // Form validation testing
    testFormValidation() {
        this.logAction('Testing form validation');

        // Test invalid email
        this.elements.addEmailButton().click();
        this.elements.emailInput().type('invalid-email');
        this.elements.saveButton().click();
        this.expectErrorMessage();

        // Cancel to reset
        this.elements.cancelButton().click();

        return this;
    }
} 