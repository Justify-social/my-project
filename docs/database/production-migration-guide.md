# Production Database Migration Guide

## Overview

This guide covers how to safely deploy database migrations from development to production environments while preserving data integrity and ensuring zero-downtime deployments.

## Migration Workflow

### 1. Development Environment

```bash
# Create and test new migration
npx prisma migrate dev --name add_comprehensive_influencer_data

# Verify migration
npm run db:status

# Test with fresh data
npx prisma db seed
```

### 2. Pre-Production Validation

```bash
# Check migration status
npm run db:status

# Generate Prisma client with new schema
npx prisma generate

# Type check all code
npm run type-check

# Run full test suite
npm test
```

### 3. Production Deployment Process

#### Option A: Automatic Deployment (Recommended for Vercel/Neon)

```bash
# Add to your deployment pipeline (vercel.json or similar)
{
  "buildCommand": "npm run build",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- migrations/",
  "scripts": {
    "postdeploy": "npx prisma migrate deploy && npx prisma generate"
  }
}
```

#### Option B: Manual Production Migration

```bash
# 1. Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# 2. Check current migration status
npm run db:status

# 3. Deploy pending migrations
npm run db:migrate:production

# 4. Verify deployment
npm run db:status
```

## Environment-Specific Considerations

### Development

- Use `prisma migrate dev` for schema changes
- Safe to reset database with `prisma migrate reset`
- Test data can be recreated with seeds

### Production

- **ONLY** use `prisma migrate deploy`
- Never use `prisma migrate reset` or `prisma db push`
- Always backup before major migrations
- Consider downtime for breaking changes

## Migration Safety Checklist

### Before Deployment

- [ ] Migration tested in development
- [ ] Breaking changes documented
- [ ] Rollback plan prepared
- [ ] Database backup created
- [ ] Team notified of deployment

### Breaking Changes Requiring Downtime

- Dropping columns
- Changing column types
- Adding required fields without defaults
- Renaming tables or columns

### Safe Changes (Zero Downtime)

- Adding optional columns
- Adding new tables
- Adding indexes
- Updating enum values (additive)

## Comprehensive Influencer Schema Migration

Our recent migration `add_rich_influencer_display_data` includes:

### Core Display Data

```typescript
name: string; // Display name (e.g., "Leo Messi")
avatarUrl: string; // Profile image URL
isVerified: boolean; // Verification status
followersCount: number; // Follower count
engagementRate: number; // Engagement rate percentage
```

### Business Intelligence

```typescript
category: string; // Content niche
audienceQuality: string; // HIGH/MEDIUM/LOW
rateCard: JSON; // Pricing structure
brandCollaborations: JSON; // Partnership history
```

### Performance Metrics

```typescript
ctr: number; // Click-through rate
conversionRate: number; // Campaign conversion rate
averageRating: number; // Brand satisfaction rating
```

## SSOT Implementation Strategy

### 1. Single Source Schema

All influencer data flows through the `Influencer` model in `schema.prisma`

### 2. Consistent TypeScript Types

Generated from Prisma schema via `InfluencerSchema` in `types.ts`

### 3. Cross-Feature Usage

- **Campaign Wizard**: Step 1 influencer selection
- **Brand Lift**: Study participant data
- **Marketplace**: Influencer discovery
- **Analytics**: Performance reporting
- **Asset Management**: Creator attribution

### 4. Data Sync Strategy

```typescript
// Example: Updating influencer data across platform
const updateInfluencerData = async (influencerId: string, data: Partial<Influencer>) => {
  // Single update affects all features
  await prisma.influencer.update({
    where: { id: influencerId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  // Trigger cache invalidation for all dependent features
  await invalidateInfluencerCache(influencerId);
};
```

## Rollback Procedures

### Emergency Rollback

```bash
# 1. Identify last known good migration
npm run db:status

# 2. Create rollback migration
npx prisma migrate dev --name rollback_problematic_change

# 3. Deploy rollback
npm run db:migrate:production
```

### Data Recovery

```bash
# 1. Restore from backup (if needed)
# 2. Apply necessary data migrations
# 3. Verify data integrity
```

## Monitoring & Validation

### Post-Migration Checks

- [ ] All services start successfully
- [ ] Critical user flows work
- [ ] Data integrity maintained
- [ ] Performance metrics stable
- [ ] Error rates normal

### Long-term Monitoring

- Database query performance
- Migration execution time
- Data consistency across features
- User experience impact

## Best Practices

1. **Small, Incremental Migrations**: Easier to debug and rollback
2. **Backward Compatibility**: Maintain old columns during transitions
3. **Feature Flags**: Control rollout of schema-dependent features
4. **Comprehensive Testing**: Unit, integration, and E2E tests
5. **Documentation**: Keep migration rationale and impact documented

## Troubleshooting

### Common Issues

- **Migration conflicts**: Resolve with `prisma migrate resolve`
- **Schema drift**: Sync with `prisma db pull` and reconcile
- **Type mismatches**: Regenerate client with `prisma generate`

### Emergency Contacts

- Database admin team
- DevOps on-call
- Feature owners for affected systems
