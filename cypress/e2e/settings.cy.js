// End-to-end tests for settings pages

describe('Settings Pages', () => {
  // Mock user authentication before each test
  beforeEach(() => {
    // Intercept API calls and provide mock responses
    cy.intercept('GET', '/api/user/profile', {
      statusCode: 200,
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        location: 'New York, NY',
        profilePictureUrl: 'https://example.com/profile.jpg'
      }
    }).as('getUserProfile');

    cy.intercept('PUT', '/api/user/profile', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          jobTitle: 'Product Manager',
          department: 'Product',
          location: 'San Francisco, CA',
          profilePictureUrl: 'https://example.com/profile.jpg'
        }
      }
    }).as('updateUserProfile');

    cy.intercept('POST', '/api/user/change-password', {
      statusCode: 200,
      body: { success: true }
    }).as('changePassword');

    cy.intercept('GET', '/api/notifications/preferences', {
      statusCode: 200,
      body: {
        campaignUpdates: true,
        brandHealthAlerts: false,
        aiInsightNotifications: true
      }
    }).as('getNotificationPreferences');

    cy.intercept('PUT', '/api/notifications/preferences', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          campaignUpdates: false,
          brandHealthAlerts: true,
          aiInsightNotifications: true
        }
      }
    }).as('updateNotificationPreferences');

    // Mock authentication (simplified for test)
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'john.doe@example.com' }));
    
    // Visit settings page
    cy.visit('/settings');
  });

  it('navigates through settings pages correctly', () => {
    // Check sidebar navigation
    cy.contains('Profile Settings').click();
    cy.url().should('include', '/settings/profile-settings');
    
    cy.contains('Team Management').click();
    cy.url().should('include', '/settings/team-management');
    
    cy.contains('Branding').click();
    cy.url().should('include', '/settings/branding');
    
    // Return to profile settings
    cy.contains('Profile Settings').click();
    cy.url().should('include', '/settings/profile-settings');
  });

  it('updates personal information successfully', () => {
    // Navigate to profile settings
    cy.contains('Profile Settings').click();
    cy.url().should('include', '/settings/profile-settings');
    
    // Wait for data to load
    cy.wait('@getUserProfile');
    
    // Find Personal Information section
    cy.contains('Personal Information')
      .parentsUntil('[data-testid="personal-info-section"]')
      .find('button')
      .contains('Edit')
      .click();
    
    // Update fields
    cy.get('input[name="firstName"]').clear().type('Jane');
    cy.get('input[name="lastName"]').clear().type('Smith');
    cy.get('input[name="jobTitle"]').clear().type('Product Manager');
    cy.get('input[name="department"]').clear().type('Product');
    cy.get('input[name="location"]').clear().type('San Francisco, CA');
    
    // Save changes
    cy.contains('Save Changes').click();
    
    // Verify request was made
    cy.wait('@updateUserProfile');
    
    // Verify success message
    cy.contains('Personal information updated successfully').should('be.visible');
  });

  it('changes password successfully', () => {
    // Navigate to profile settings
    cy.contains('Profile Settings').click();
    cy.url().should('include', '/settings/profile-settings');
    
    // Wait for data to load
    cy.wait('@getUserProfile');
    
    // Find Password Management section
    cy.contains('Password Management')
      .parentsUntil('[data-testid="password-section"]')
      .find('button')
      .contains('Edit')
      .click();
    
    // Fill password fields
    cy.get('input[name="currentPassword"]').type('OldPassword123!');
    cy.get('input[name="newPassword"]').type('NewStrongP@ssw0rd');
    cy.get('input[name="confirmPassword"]').type('NewStrongP@ssw0rd');
    
    // Save changes
    cy.contains('Save Changes').click();
    
    // Verify request was made
    cy.wait('@changePassword');
    
    // Verify success message
    cy.contains('Password changed successfully').should('be.visible');
  });

  it('updates notification preferences successfully', () => {
    // Navigate to profile settings
    cy.contains('Profile Settings').click();
    cy.url().should('include', '/settings/profile-settings');
    
    // Wait for data to load
    cy.wait('@getUserProfile');
    cy.wait('@getNotificationPreferences');
    
    // Find Notification Preferences section
    cy.contains('Notification Preferences')
      .parentsUntil('[data-testid="notification-section"]')
      .find('button')
      .contains('Edit')
      .click();
    
    // Toggle preferences
    cy.get('[data-testid="campaign-updates-toggle"]').click(); // Was true, now false
    cy.get('[data-testid="brand-health-toggle"]').click(); // Was false, now true
    
    // Save changes
    cy.contains('Save Changes').click();
    
    // Verify request was made
    cy.wait('@updateNotificationPreferences');
    
    // Verify success message
    cy.contains('Notification preferences updated successfully').should('be.visible');
  });
}); 