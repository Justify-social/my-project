# Admin Panel Usage Guide

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Platform Team

## Introduction

This guide provides detailed instructions for using the Admin Panel in the Justify.social platform. The Admin Panel is a powerful tool designed exclusively for super administrators to manage the entire platform, including users, organizations, system settings, and maintenance operations.

## Accessing the Admin Panel

1. Log in to your Campaign Wizard account with super_admin privileges
2. Access the Admin Panel through one of these methods:
   - Click on **Admin** in the main navigation sidebar
   - Navigate to **Settings** and select the **Super Admin Console** tab
   - Go directly to `/admin` in the URL

Note: The Admin Panel is only accessible to users with the super_admin role. Additional security verification may be required.

## Key Features and How to Use Them

### User Management

The User Management section allows you to manage all users across the platform:

1. Navigate to **Admin > Users** in the sidebar
2. View the list of all users across all organizations
3. Use the search and filter options to find specific users:
   - By email
   - By organization
   - By role
   - By status (active, suspended, pending)
4. To view a user's details:
   - Click on the user's email or name
   - Review their profile information, roles, organization, and activity logs
5. To suspend a user:
   - Select the user(s) by checking the checkbox next to their name
   - Click the **Suspend** button
   - Confirm the action
6. To reactivate a suspended user:
   - Filter to show suspended users
   - Select the user(s)
   - Click the **Reactivate** button
7. To update a user's role:
   - Click on the user
   - Go to the **Roles** tab
   - Use the role selector to add or remove roles
   - Click **Save Changes**

### System Health Monitoring

To monitor the health and performance of the Campaign Wizard platform:

1. Navigate to **Admin > System Health** in the sidebar
2. View the dashboard with key metrics:
   - Server response times
   - API endpoint performance
   - Database connection status
   - Error rates and types
   - Resource utilization (CPU, memory, storage)
3. Use the time range selector to view historical data
4. Set up alerts by clicking **Configure Alerts**:
   - Select the metrics to monitor
   - Set thresholds for alerts
   - Configure notification methods (email, SMS)
   - Click **Save Alert Configuration**

### Platform Configuration

To manage global platform settings:

1. Navigate to **Admin > Configuration** in the sidebar
2. Manage feature flags:
   - Toggle features on/off platform-wide
   - Enable features for specific organizations
   - Set gradual rollout percentages
3. Configure default settings:
   - Default user roles for new organizations
   - Global password policies
   - Session timeout durations
   - File upload limitations
4. Manage integration endpoints:
   - API credentials for third-party services
   - Webhook configurations
   - External service status monitoring

### Maintenance Operations

To perform system maintenance tasks:

1. Navigate to **Admin > Maintenance** in the sidebar
2. Schedule maintenance windows:
   - Select date and time
   - Set duration
   - Choose maintenance mode (Full, Partial, None)
   - Compose user notification message
3. Manage database operations:
   - Run optimization queries
   - View table sizes and growth
   - Initiate backups
4. Clear system caches:
   - API response cache
   - Authentication cache
   - Static asset cache
5. View and analyze system logs:
   - Filter by log level (error, warning, info)
   - Search for specific events
   - Export logs for detailed analysis

### Organization Management

To manage multiple organizations on the platform:

1. Navigate to **Admin > Organizations** in the sidebar
2. View all organizations with key information:
   - User count
   - Subscription status
   - Created date
   - Last activity
3. To create a new organization:
   - Click **Add Organization**
   - Fill in organization details
   - Select subscription plan
   - Assign initial admin user
   - Click **Create Organization**
4. To manage an existing organization:
   - Click on the organization name
   - View and edit organization details
   - Manage subscription and billing
   - View organization-wide activity
   - Impersonate organization admin (for troubleshooting)

## Advanced Features

### Audit Logging

To review all administrative actions:

1. Navigate to **Admin > Audit Logs** in the sidebar
2. View a chronological list of all administrative actions
3. Filter logs by:
   - Action type
   - User
   - Time range
   - Affected resource
4. Export audit logs for compliance or record-keeping

### Impersonation Mode

To troubleshoot user-specific issues:

1. Navigate to the user's profile in User Management
2. Click **Impersonate User**
3. Confirm the security prompt
4. You'll now see the application as the selected user would see it
5. A banner will remain visible to remind you that you're in impersonation mode
6. Click **Exit Impersonation** when finished

Note: All actions taken while impersonating are logged in the audit trail.

### Bulk Operations

To manage multiple users or organizations efficiently:

1. In the Users or Organizations list, select multiple items using checkboxes
2. Use the bulk action dropdown to select an operation:
   - Update roles
   - Suspend/reactivate accounts
   - Delete users (with confirmation)
   - Export data
3. Configure the operation parameters
4. Click **Apply to Selected** to execute

## Best Practices

- **Use MFA**: Always use multi-factor authentication when accessing the Admin Panel
- **Limit access**: Grant super_admin privileges only to essential personnel
- **Schedule maintenance**: Plan maintenance operations during low-traffic periods
- **Document changes**: Add detailed notes when making significant configuration changes
- **Regular audits**: Review the audit logs weekly to detect any unauthorized actions
- **Test in staging**: Test major changes in a staging environment before applying to production

## Troubleshooting

### Cannot Access Certain Admin Functions

**Symptom:** Some administrative functions appear disabled or produce errors when accessed

**Solution:** Verify that you have completed all security verification steps. Some sensitive operations require recent authentication or additional verification.

### Bulk Operation Timeout

**Symptom:** Bulk operations on large datasets fail with a timeout error

**Solution:** Break the operation into smaller batches. The system limits bulk operations to prevent performance issues.

### Configuration Changes Not Taking Effect

**Symptom:** Changes to configuration settings don't appear to be applied

**Solution:** Some configuration changes require a cache refresh or service restart. Use the **Clear Cache** function in the Maintenance section, or contact the development team if the issue persists.

## Related Documentation

- [Admin Panel Overview](./overview.md)
- [System Architecture](../../features-backend/architecture/overview.md)
- [Security Guidelines](../../guides/developer/security.md)
- [Data Management Policies](../../features-backend/database/overview.md)
