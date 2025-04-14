# Database Operations

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Database Team

## Overview

This document covers best practices and common operations for working with the Campaign Wizard database. It provides guidelines for data manipulation, querying, and transaction management.

## Best Practices

### Transactions

Always use transactions for operations that modify multiple related records:

```typescript
// Example of using transactions
const result = await prisma.$transaction(async tx => {
  // Create campaign
  const campaign = await tx.campaignWizard.create({
    data: {
      name: 'Summer Campaign',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      // other fields...
    },
  });

  // Create related influencer in the same transaction
  const influencer = await tx.influencer.create({
    data: {
      campaignWizardId: campaign.id,
      platform: 'INSTAGRAM',
      handle: '@example',
      // other fields...
    },
  });

  return { campaign, influencer };
});
```

### Error Handling

Implement proper error handling for database operations:

```typescript
try {
  const result = await prisma.campaignWizard.create({
    data: {
      // data fields...
    },
  });
  return result;
} catch (error) {
  if (error.code === 'P2002') {
    throw new Error('A campaign with that name already exists');
  }
  throw new Error(`Database error: ${error.message}`);
}
```

### Query Optimization

Optimize queries by selecting only the fields you need:

```typescript
// Instead of this
const campaigns = await prisma.campaignWizard.findMany();

// Do this
const campaigns = await prisma.campaignWizard.findMany({
  select: {
    id: true,
    name: true,
    startDate: true,
    endDate: true,
    status: true,
  },
});
```

### Pagination

Use pagination for large result sets:

```typescript
const pageSize = 10;
const page = 2; // 1-indexed

const campaigns = await prisma.campaignWizard.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: {
    createdAt: 'desc',
  },
});

const total = await prisma.campaignWizard.count();
const totalPages = Math.ceil(total / pageSize);
```

## Common Operations

### Creating Records

```typescript
// Create a basic campaign
const campaign = await prisma.campaignWizard.create({
  data: {
    name: 'Campaign Name',
    businessGoal: 'Increase brand awareness',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    timeZone: 'UTC',
    status: 'DRAFT',
    step1Complete: true,
    // other fields...
  },
});
```

### Creating Records with Relations

```typescript
// Create a campaign with related records
const campaign = await prisma.campaignWizard.create({
  data: {
    name: 'Campaign with Relations',
    // other campaign fields...

    // Create influencer at the same time
    influencers: {
      create: [
        {
          platform: 'INSTAGRAM',
          handle: '@influencer1',
          // other influencer fields...
        },
      ],
    },
  },
});
```

### Updating Records

```typescript
// Update a campaign
const updatedCampaign = await prisma.campaignWizard.update({
  where: {
    id: 'campaign-id',
  },
  data: {
    name: 'Updated Campaign Name',
    status: 'IN_REVIEW',
  },
});
```

### Querying Records

```typescript
// Find campaigns with filters
const campaigns = await prisma.campaignWizard.findMany({
  where: {
    status: 'DRAFT',
    startDate: {
      gte: new Date(),
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  include: {
    influencers: true,
  },
});
```

### Deleting Records

```typescript
// Delete a campaign
const deletedCampaign = await prisma.campaignWizard.delete({
  where: {
    id: 'campaign-id',
  },
});
```

## Monitoring and Performance

We monitor database performance using the following metrics:

- Query execution time
- Connection pool utilization
- Lock contention
- Index usage

See the [Database Health Check API](../../features-frontend/admin/database-health.md) for information on how to access these metrics.

## Related Documentation

- [Database Schema](./schema.md)
- [Architecture Overview](../architecture/overview.md)
