# Admin Panel

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Platform Team

## Overview

The Admin Panel provides advanced administrative capabilities for super administrators and authorized personnel to manage the entire Campaign Wizard platform. This feature offers tools for user management across organizations, system monitoring, platform configuration, and maintenance operations that extend beyond regular user settings.

## Key Components

### User Management

- Cross-organization user administration
- Account suspension and restoration
- Role management and privilege assignment
- Access control and permission auditing
- User activity monitoring and reporting

### System Health

- Real-time system performance monitoring
- Error tracking and alerting
- Database health and optimization tools
- Resource utilization analytics
- Service uptime tracking

### Platform Configuration

- Feature flag management
- Global default settings configuration
- Integration endpoints management
- Authentication provider configuration
- Data retention policy settings

### Maintenance Tools

- Database maintenance operations
- Backup and restore functionality
- Caching management
- Log analysis and data export
- Scheduled maintenance management

## Technical Implementation

The Admin Panel is built with security and efficiency as primary considerations:

- Protected routes accessible only to users with super_admin role
- Two-factor authentication required for sensitive operations
- Audit logging for all administrative actions
- Backend validation for all requests
- Rate limiting to prevent abuse
- Specialized React components for administrative functions

Role verification is performed both on the client and server side to ensure proper access control.

## Usage Guidelines

The Admin Panel is designed exclusively for system administrators who need to:

1. Manage users and organizations across the entire platform
2. Monitor and maintain system health
3. Configure platform-wide settings
4. Perform maintenance operations
5. Troubleshoot system issues

Due to the powerful nature of this feature, access is strictly limited to authorized personnel with super_admin privileges.

## Configuration Options

| Option | Description | Default | Allowed Values |
|--------|-------------|---------|---------------|
| User Session Timeout | Maximum inactive time before admin logout | 15 minutes | 5, 15, 30, 60 minutes |
| Audit Log Retention | How long to keep detailed admin action logs | 90 days | 30, 60, 90, 180, 365 days |
| Maintenance Mode | System availability during maintenance | Partial | Full, Partial, None |
| Access IP Restriction | Limit admin access to specific IP ranges | Disabled | Enabled, Disabled |

## Troubleshooting

### Access Denied to Admin Panel

**Symptom:** User cannot access the Admin Panel despite having what they believe are appropriate permissions

**Solution:** Verify the user has the super_admin role assigned in Auth0. Check IP restrictions if enabled. Ensure the user has completed any required security verification steps.

### Bulk User Operations Failing

**Symptom:** Attempts to perform bulk operations on users (role changes, suspensions) fail

**Solution:** Check that the operation doesn't include protected system users or the user's own account. Verify that the batch size doesn't exceed system limits (max 100 users per operation).

## Related Documentation

- [Admin Usage Guide](./usage.md)
- [Security Configuration](../../features-backend/authentication/overview.md)
- [User Role Management](../settings/team-management.md)
- [System Architecture](../../features-backend/architecture/overview.md) 