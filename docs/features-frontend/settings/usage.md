# Settings Usage Guide

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Platform Team

## Introduction

This guide provides detailed instructions for using the Settings feature in the Campaign Wizard application. The Settings module allows you to customize your experience, manage your team, configure branding, and control security preferences.

## Accessing Settings

1. Log in to your Campaign Wizard account
2. Click on your profile picture in the top-right corner
3. Select **Settings** from the dropdown menu
4. Alternatively, click on the **Settings** icon in the main navigation sidebar

## Key Features and How to Use Them

### Managing Profile Settings

To update your personal information and preferences:

1. Navigate to the **Profile Settings** tab (default view when accessing Settings)
2. Update your profile information:
   - Profile picture
   - Name
   - Email address
   - Job title
   - Contact information
3. Click **Save Changes** to update your profile

#### Password and Security

To manage your account security:

1. In the Profile Settings page, scroll down to the **Security** section
2. Click **Change Password** to update your password:
   - Enter your current password
   - Enter and confirm your new password
   - Click **Update Password**
3. To enable Multi-Factor Authentication (MFA):
   - Click **Enable MFA**
   - Select your preferred method (SMS, authenticator app)
   - Follow the on-screen instructions to complete setup
4. Review and manage active sessions:
   - View all devices currently logged into your account
   - Click **Revoke Access** next to any session you want to terminate

#### Notification Preferences

To customize how you receive notifications:

1. In the Profile Settings page, navigate to the **Notifications** section
2. Configure your preferences for:
   - Email notifications
   - In-app notifications
   - Mobile push notifications (if enabled)
3. Customize notification types:
   - Campaign status updates
   - Performance alerts
   - Team member activities
   - System announcements
4. Click **Save Preferences** to apply your changes

### Managing Team Settings

To add and manage team members (requires Admin or Owner role):

1. Navigate to the **Team Management** tab in Settings
2. View a list of current team members and their roles
3. To invite a new team member:
   - Click **Invite Team Member**
   - Enter their email address
   - Select their role (Viewer, Member, Admin, Owner)
   - Add a personalized message (optional)
   - Click **Send Invitation**
4. To manage existing team members:
   - Change roles by selecting a new role from the dropdown
   - Remove a member by clicking the **Remove** button
   - Resend invitation by clicking the **Resend** button for pending invites

#### Understanding Roles

The system supports four role levels:

- **Viewer**: Can view campaigns and reports but cannot make changes
- **Member**: Can create and edit campaigns but has limited settings access
- **Admin**: Can manage team members and has access to most settings
- **Owner**: Has full access to all features and settings

### Configuring Branding Settings

To customize the appearance according to your brand (requires Admin or Owner role):

1. Navigate to the **Branding** tab in Settings
2. Upload your company logo:
   - Click **Upload Logo**
   - Select a PNG or SVG file (max 2MB)
   - Crop and position as needed
   - Click **Save Logo**
3. Customize your brand colors:
   - Set primary color (main brand color)
   - Set secondary color (accent color)
   - Set background color
   - Preview changes in real-time
4. Configure typography:
   - Select heading font
   - Select body text font
   - Adjust font sizes (small, medium, large)
5. Click **Save Branding Settings** to apply changes across the platform

### Super Admin Console

For users with Super Admin privileges:

1. Navigate to the **Super Admin Console** tab in Settings (only visible to Super Admins)
2. Access system-wide configurations:
   - User management across all organizations
   - System health monitoring
   - Feature flag configuration
   - Global settings management

## Advanced Settings Features

### API Access Management

To generate and manage API keys:

1. Navigate to **Profile Settings**
2. Scroll to the **API Access** section
3. Click **Generate New Key**
4. Provide a name for this key (e.g., "Integration Testing")
5. Select permissions for this key
6. Click **Create Key**
7. Copy and securely store the generated key (it will only be shown once)

### Audit Logs

To review account activity:

1. Navigate to **Profile Settings**
2. Scroll to the **Security** section
3. Click **View Audit Logs**
4. Filter logs by:
   - Date range
   - Activity type
   - User
5. Export logs as CSV for record-keeping

## Best Practices

- **Review team access regularly**: Audit team members and their access levels quarterly
- **Update branding when needed**: Keep branding elements consistent with your company guidelines
- **Enable MFA**: Always use multi-factor authentication for enhanced security
- **Use descriptive names**: When creating API keys, use names that clearly indicate their purpose
- **Regularly rotate passwords**: Change passwords every 90 days for optimal security

## Troubleshooting

### Cannot Change Role of a Team Member

**Symptom:** The role dropdown for a team member is disabled

**Solution:** You cannot change the role of the account owner. If you need to transfer ownership, contact support. Also, ensure there is always at least one Admin in the team.

### Branding Changes Not Visible

**Symptom:** After saving branding changes, the new branding is not visible

**Solution:** Clear your browser cache and reload the page. If the issue persists, ensure your browser supports modern CSS variables. Try accessing the application in a different browser.

### Invitation Emails Not Received

**Symptom:** Team members report not receiving invitation emails

**Solution:** Check if the invitation appears in their spam folder. You can also resend the invitation from the Team Management page. Verify that the email address is correct.

## Related Documentation

- [Settings Overview](./overview.md)
- [Team Management Best Practices](./team-management.md)
- [API Documentation](../../features-backend/apis/overview.md)
- [Security Guidelines](../../guides/developer/security.md) 