# Team Management Guide

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Platform Team

## Overview

This guide provides detailed information on managing team members and roles within the Justify.social platform. Team management is a critical component of the Settings feature, allowing organization administrators to control access, assign appropriate permissions, and maintain security across the platform.

## Team Roles and Permissions

Campaign Wizard uses a role-based access control system with four primary roles:

### Role Hierarchy

1. **Owner**
   - Complete access to all features and settings
   - Can add/remove all user types including admins
   - Can transfer ownership
   - Full billing and subscription management

2. **Admin**
   - Access to most features and settings
   - User management (except cannot remove owners)
   - Access to branding and team settings
   - Can invite new users
   - Limited billing access

3. **Member**
   - Can create and manage campaigns
   - Limited access to settings
   - Cannot invite or manage other users
   - Cannot access billing information
   - Cannot modify branding

4. **Viewer**
   - Read-only access to campaigns and reports
   - Cannot make changes to any content
   - Cannot access settings
   - Ideal for clients or executives who need visibility

### Permission Details by Function

| Function | Owner | Admin | Member | Viewer |
|----------|-------|-------|--------|--------|
| View Campaigns | ✅ | ✅ | ✅ | ✅ |
| Create/Edit Campaigns | ✅ | ✅ | ✅ | ❌ |
| Delete Campaigns | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Create Custom Reports | ✅ | ✅ | ✅ | ❌ |
| Invite Team Members | ✅ | ✅ | ❌ | ❌ |
| Manage Team Roles | ✅ | ✅ | ❌ | ❌ |
| Access Billing | ✅ | Limited | ❌ | ❌ |
| Modify Branding | ✅ | ✅ | ❌ | ❌ |
| API Access Management | ✅ | ✅ | ❌ | ❌ |

## Managing Your Team

### Adding Team Members

To invite new users to your organization:

1. Navigate to **Settings > Team Management**
2. Click the **Invite Team Member** button
3. Enter the required information:
   - Email address
   - First name
   - Last name
   - Role (Owner, Admin, Member, Viewer)
   - Optional personal message
4. Click **Send Invitation**
5. The system will send an email invitation with instructions to join

Notes:
- New users will need to create an account or sign in with existing credentials
- Invitations expire after 7 days
- You can resend or cancel pending invitations

### Managing Existing Team Members

To modify roles or remove team members:

1. Navigate to **Settings > Team Management**
2. Locate the team member in the list
3. To change a role:
   - Select the new role from the dropdown menu
   - Changes take effect immediately
4. To remove a team member:
   - Click the **Remove** button next to their name
   - Confirm the removal in the dialog box

Important restrictions:
- You cannot change the role of the account owner
- There must always be at least one Admin in the organization
- Removing a user revokes their access immediately

### Managing Pending Invitations

To manage invitations that haven't been accepted:

1. Navigate to **Settings > Team Management**
2. Click the **Pending Invitations** tab
3. For each pending invitation, you can:
   - **Resend**: Send the invitation email again
   - **Edit**: Change the role or personal message
   - **Remove**: Cancel the invitation

## Best Practices for Team Management

### Role Assignment

- **Assign minimum necessary permissions**: Give users only the access they need for their job functions
- **Regularly audit user roles**: Review team member access quarterly
- **Use Viewer role for clients**: Provide clients and external stakeholders with Viewer access to maintain control
- **Limit Admin accounts**: Restrict administrative access to those who truly need it

### Security Considerations

- **Promptly remove former employees**: Deactivate accounts immediately when team members leave
- **Regularly review activity logs**: Check for unusual patterns in user activity
- **Use strong passwords**: Enforce strong password policies for all team members
- **Enable two-factor authentication**: Require 2FA, especially for Admin and Owner accounts

### Team Organization

- **Create a clear hierarchy**: Establish who team members should contact for access issues
- **Document role assignments**: Maintain documentation of which roles are assigned to which job functions
- **Establish an onboarding process**: Create a consistent procedure for adding new team members
- **Set up an offboarding checklist**: Ensure all necessary steps are taken when removing users

## Troubleshooting

### Common Issues and Solutions

#### Cannot Remove a Team Member

**Issue**: The remove button is disabled for a team member.

**Solution**: Check if they are the organization owner. Ownership must be transferred before removing.

#### Cannot Change a Role

**Issue**: Role dropdown is disabled or changes don't save.

**Solution**:
- You may be trying to change the organization owner's role
- You may be trying to remove the last Admin
- You may not have sufficient permissions yourself

#### Invitation Not Received

**Issue**: New team member reports not receiving the invitation email.

**Solution**:
- Check if the email address is correct
- Ask them to check their spam/junk folder
- Use the Resend Invitation function
- Check if they already have an account with a different email

#### Too Many Seats Error

**Issue**: You receive an error about exceeding your seat limit when inviting new users.

**Solution**:
- Review current team members and remove inactive users
- Contact billing to upgrade your subscription
- Contact support for temporary seat extension

## Related Documentation

- [Settings Overview](./overview.md)
- [Settings Usage Guide](./usage.md)
- [Branding Guidelines](./branding.md)
- [Security Guidelines](../../guides/developer/security.md) 