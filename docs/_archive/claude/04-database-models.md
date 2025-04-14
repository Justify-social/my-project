# Database Models

## Overview

The application uses PostgreSQL as the database with Prisma ORM for type-safe database queries and migrations. The schema is defined in `schema.prisma` and includes various models for campaigns, users, and related data.

## Key Models

### CampaignWizard

The central model for managing campaign creation:

```prisma
model CampaignWizard {
  id               String          @id
  createdAt        DateTime        @default(now())
  updatedAt        DateTime
  currentStep      Int             @default(1)
  isComplete       Boolean         @default(false)
  status           Status          @default(DRAFT)
  name             String          @db.VarChar(255)
  businessGoal     String
  startDate        DateTime
  endDate          DateTime
  timeZone         String
  primaryContact   Json
  secondaryContact Json?
  budget           Json
  step1Complete    Boolean         @default(false)
  primaryKPI       KPI?
  secondaryKPIs    KPI[]
  messaging        Json?
  expectedOutcomes Json?
  features         Feature[]
  step2Complete    Boolean         @default(false)
  demographics     Json?
  locations        Json[]
  targeting        Json?
  competitors      String[]
  step3Complete    Boolean         @default(false)
  assets           Json[]
  guidelines       String?
  requirements     Json[]
  notes            String?
  step4Complete    Boolean         @default(false)
  userId           String?
  user             User?           @relation(fields: [userId], references: [id])
  Influencer       Influencer[]
  WizardHistory    WizardHistory[]
}
```

### Influencer

Model for influencers associated with campaigns:

```prisma
model Influencer {
  id             String         @id
  platform       Platform
  handle         String
  platformId     String?
  campaignId     String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime
  CampaignWizard CampaignWizard @relation(fields: [campaignId], references: [id], onDelete: Cascade)
}
```

### User

User account model:

```prisma
model User {
  id                  String                     @id @default(uuid())
  email               String                     @unique
  name                String?
  role                UserRole                   @default(USER)
  campaigns           CampaignWizard[]
  submissions         CampaignWizardSubmission[]
  notificationPrefs   NotificationPrefs?
  receivedInvitations TeamInvitation[]           @relation("InvitationReceiver")
  sentInvitations     TeamInvitation[]           @relation("InvitationSender")
  memberOfTeams       TeamMember[]               @relation("TeamMember")
  ownedTeamMembers    TeamMember[]               @relation("TeamOwner")
}
```

### Audience

Audience targeting information:

```prisma
model Audience {
  id                 Int                         @id @default(autoincrement())
  ageRangeMin        Int
  ageRangeMax        Int
  keywords           String[]
  interests          String[]
  campaignId         Int
  age1824            Int                        @default(0)
  age2534            Int                        @default(0)
  age3544            Int                        @default(0)
  age4554            Int                        @default(0)
  age5564            Int                        @default(0)
  age65plus          Int                        @default(0)
  campaign           CampaignWizardSubmission    @relation(fields: [campaignId], references: [id])
  competitors        AudienceCompetitor[]
  gender             AudienceGender[]
  languages          AudienceLanguage[]
  geographicSpread   AudienceLocation[]
  screeningQuestions AudienceScreeningQuestion[]
}
```

### Creative Assets

```prisma
model CreativeAsset {
  id           Int                      @id @default(autoincrement())
  name         String
  description  String
  url          String
  type         CreativeAssetType
  fileSize     Int
  dimensions   String?
  duration     Int?
  format       String
  submissionId Int
  submission   CampaignWizardSubmission @relation(fields: [submissionId], references: [id])
}
```

## Key Enums

```prisma
enum Platform {
  INSTAGRAM
  YOUTUBE
  TIKTOK
  FACEBOOK
  TWITTER
  LINKEDIN
}

enum KPI {
  BRAND_AWARENESS
  AD_RECALL
  MESSAGE_ASSOCIATION
  CONSIDERATION
  BRAND_PREFERENCE
  PURCHASE_INTENT
  ACTION_INTENT
  RECOMMENDATION_INTENT
  ADVOCACY
  BRAND_SAFETY
  AUDIENCE_FIT
}

enum Feature {
  CAMPAIGN_WIZARD
  BRAND_LIFT
  CREATIVE_ASSET_TESTING
  INFLUENCER_DISCOVERY
  BRAND_HEALTH
  MMM
  REPORTING
}

enum Status {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  IN_PROGRESS
  COMPLETED
  ARCHIVED
  REJECTED
  PAUSED
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
  MANAGER
  VIEWER
}
```

## Relationships

The database schema includes several important relationships:

1. **One-to-Many**:

   - User → CampaignWizard (one user can have many campaigns)
   - CampaignWizard → Influencer (one campaign can have many influencers)

2. **One-to-One**:

   - User → NotificationPrefs (one user has one notification preferences record)

3. **Many-to-Many** (using junction tables):
   - Teams and Users (through TeamMember)

## Migrations

Database migrations are managed using Prisma Migrate:

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations to production
npx prisma migrate deploy
```

## Seeding

The database can be seeded with initial data using:

```bash
npm run db:seed
```

This runs seeders located in the `/prisma/seed.ts` file.

## Indexes

The schema includes performance-optimizing indexes on commonly queried fields:

```prisma
@@index([status, createdAt])
@@index([campaignId])
@@index([wizardId, timestamp])
```

## JSON Fields

Several model fields use JSON type for storing flexible structured data:

- `primaryContact` and `secondaryContact` in CampaignWizard
- `budget`, `messaging`, `expectedOutcomes`, `demographics`, `targeting`, etc.

These provide flexibility for storing complex data structures without requiring additional tables.
