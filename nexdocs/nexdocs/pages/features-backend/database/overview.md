# Database Architecture Overview

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Database Team

## Overview

The Campaign Wizard application is built on a robust database architecture using PostgreSQL with Prisma ORM for data access. The schema follows best practices for relational database design, including proper normalization, referential integrity, and performance optimization.

## Database Design Principles

Our database design adheres to the following principles:

1. **Normalization**: Models are properly normalized to minimize redundancy while maintaining practical access patterns.
2. **Referential Integrity**: Foreign key constraints ensure data consistency across related tables.
3. **Type Safety**: Enums and strict typing ensure data validity.
4. **Performance Optimization**: Indexes on frequently accessed fields and query paths.
5. **Scalability**: Model design supports horizontal scaling and future expansion.
6. **Audit Capability**: History tracking for critical operations.

## Core Subsystems

The database is organized into logical subsystems that align with business domains:

1. **User Management**: User accounts, team memberships, and permissions
2. **Campaign Management**: Campaign creation, editing, and submission processes
3. **Contact Management**: Business contacts and their relationships to campaigns
4. **Audience Targeting**: Target audiences with demographic and interest data
5. **Creative Management**: Creative assets and requirements for campaigns
6. **Brand Management**: Company-specific branding configurations

## Key Entities

The most important entities in our database:

- **CampaignWizard**: Stores campaign data during creation process
- **CampaignWizardSubmission**: Represents completed campaign submissions
- **User**: Core user entity for authentication and authorization
- **Audience**: Defines target audiences for campaigns
- **CreativeAsset**: Stores digital assets for campaigns

## Key Relationships

Important relationships between entities:

- User creates multiple Campaigns
- Campaigns have multiple Influencers
- Campaigns have multiple Audiences
- Submissions have multiple CreativeAssets

## Documentation Resources

For more detailed information:

- [Complete Database Schema](./schema.md) - Comprehensive schema reference
- [Database Operations](./operations.md) - Common database operations

## Related Documentation

- [Architecture Overview](../architecture/overview.md)
- [API Documentation](../apis/overview.md) 