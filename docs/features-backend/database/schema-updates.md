# Database Schema Updates

**Last Updated:** 2025-03-07  
**Status:** Active  
**Owner:** Backend Team

## Overview

This document outlines the database schema update approach for Justify.social, focusing on maintaining data integrity while enabling new features. Our schema evolves to support the platform's mission of capturing authentic audience opinions to measure social campaign impact.

## Schema Evolution Principles

1. **Backward Compatibility**: Updates preserve existing functionality
2. **Incremental Changes**: Small, testable migrations rather than large rewrites
3. **Type Safety**: Strong typing across the frontend-backend boundary
4. **Consistent Conventions**: Standard naming and formatting patterns

## Key Schema Components

| Component | Purpose | Key Relationships |
|-----------|---------|-------------------|
| Campaigns | Core campaign information | Influencers, CreativeAssets, BrandLiftStudies |
| Influencers | Influencer profiles and metrics | Campaigns, CreativeAssets |
| Audiences | Target demographic definitions | Campaigns |
| CreativeAssets | Campaign visual materials | Campaigns, Influencers |
| BrandLiftStudies | Measurement studies | Campaigns |
| Users | Platform users and permissions | Teams, Campaigns |
| Teams | Organizational groupings | Users, Campaigns |

## Data Format Standardization

### Enum Format Bridge Pattern

We maintain different enum formats across the stack:

```
Backend (Prisma Schema): UPPERCASE_SNAKE_CASE
Frontend (TypeScript): camelCase
```

**Why This Approach?**
- Database conventions favor UPPERCASE for enum values
- Frontend JavaScript conventions favor camelCase
- Consistent transformation prevents data format errors

**Implementation Pattern:**
```typescript
// Backend to Frontend transformation
function transformFromBackend(data) {
  // KPI.BRAND_AWARENESS → kpi.brandAwareness
  // Automatically handles all enum fields
  return transformedData;
}

// Frontend to Backend transformation
function transformToBackend(data) {
  // kpi.brandAwareness → KPI.BRAND_AWARENESS
  // Ensures data matches database schema
  return transformedData;
}
```

This transformation happens at the API boundary, ensuring each system works with its preferred format.

## Recent Schema Updates

### 1. Campaign Status Standardization

Enhanced the campaign status workflow with standardized states:

```prisma
enum Status {
  DRAFT
  IN_REVIEW
  APPROVED
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
}
```

**Benefits:**
- Clear campaign lifecycle visibility
- Consistent status transitions
- Improved filtering and reporting

### 2. Influencer Relationship Enhancement

Updated the Campaign-Influencer relationship:

```prisma
model Campaign {
  id String @id @default(uuid())
  // Other fields
  influencers Influencer[]
}

model Influencer {
  id String @id @default(uuid())
  platform String
  handle String
  campaignId String
  campaign Campaign @relation(fields: [campaignId], references: [id])
}
```

**Benefits:**
- Many-to-many relationship support
- Improved performance for influencer queries
- Better data integrity with proper foreign keys

### 3. JSON Field Optimization

Strategic use of JSON fields for flexible data:

```prisma
model Campaign {
  id String @id @default(uuid())
  // Other fields
  budget Json // Stores {currency, total, socialMedia}
  demographics Json // Stores targeting information
}
```

**Benefits:**
- Schema flexibility for evolving requirements
- Reduced migration frequency for minor changes
- Better support for deeply nested structures

## Implementation Approach

### Migration Strategy

1. **Plan**: Define schema changes and migration path
2. **Develop**: Create migration scripts with up/down methods
3. **Test**: Verify with production-like data
4. **Deploy**: Execute during maintenance windows
5. **Verify**: Confirm data integrity post-migration

### API Versioning

The API maintains version compatibility through:

- URI versioning (e.g., `/api/v1/campaigns`)
- Response transformers that adapt to client version
- Deprecation notices for legacy endpoints

## Integration Patterns

### Form to Database Flow

```
User Input → Form Validation → API Transformation → Zod Schema Validation → Prisma Schema → Database
```

Each layer ensures data integrity while allowing flexible user input.

### Database to UI Flow

```
Database → Prisma Query → API Transformation → React State → UI Components
```

Data is transformed at each boundary to match expected formats.

## Testing Approach

1. **Schema Validation Tests**: Verify schema constraints
2. **Migration Tests**: Ensure data integrity during migrations
3. **API Contract Tests**: Confirm API responses match expected schemas
4. **Integration Tests**: Test full data flow from UI to database

## Performance Considerations

1. **Indexing Strategy**: Indexes on frequently queried fields
2. **Query Optimization**: Structured queries with proper joins
3. **Connection Pooling**: Efficient database connection management
4. **Pagination**: All list endpoints support cursor-based pagination

## Schema Monitoring

We monitor schema health through:

- Query performance metrics
- Migration success rates
- Data integrity checks
- Schema drift detection

## Related Documentation

- [Database Schema](./schema.md)
- [Database Operations](./operations.md)
- [API Endpoints](../apis/endpoints.md) 