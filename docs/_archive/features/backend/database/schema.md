# Database Schema Documentation

## Overview

This document provides a comprehensive overview of the database schema for the Justify.social platform. The database is built using PostgreSQL with Prisma ORM for data access. The schema follows best practices for relational database design, including proper normalization, referential integrity, and performance optimization.

## Core Subsystems

The database is organized into logical subsystems that align with the business domains:

1. **User Management Subsystem**
   - Managing user accounts, team memberships, and permissions
2. **Campaign Management Subsystem**
   - Handling campaign creation, editing, and submission processes
3. **Contact Management Subsystem**
   - Managing business contacts and their relationships to campaigns
4. **Audience Targeting Subsystem**
   - Defining target audiences with demographic and interest data
5. **Creative Management Subsystem**
   - Managing creative assets and requirements for campaigns
6. **Brand Management Subsystem**
   - Storing company-specific branding configurations

## Model Definitions

### User Management Models

#### User

The core user entity that represents an authenticated user in the system.

```prisma
model User {
  id        String      @id @default(uuid())
  email     String      @unique
  name      String?
  image     String?
  role      UserRole    @default(USER)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  // Relationships
  notificationPrefs NotificationPrefs?
  campaigns         CampaignWizard[]
  teamMemberships   TeamMember[]
}
```

#### TeamMember

Represents a user's membership in a team with a specific role.

```prisma
model TeamMember {
  id        String    @id @default(uuid())
  teamId    String
  userId    String
  role      TeamRole  @default(MEMBER)
  createdAt DateTime  @default(now())

  // Relationships
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### TeamInvitation

Tracks invitations sent to users to join teams.

```prisma
model TeamInvitation {
  id         String           @id @default(uuid())
  teamId     String
  email      String
  status     InvitationStatus @default(PENDING)
  expiresAt  DateTime
  createdAt  DateTime         @default(now())
  respondedAt DateTime?
}
```

#### NotificationPrefs

Stores user preferences for notifications.

```prisma
model NotificationPrefs {
  id                String  @id @default(uuid())
  userId           String  @unique
  emailNotifications Boolean @default(true)
  pushNotifications Boolean @default(false)

  // Relationships
  user             User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Campaign Management Models

#### CampaignWizard

Stores draft campaign data during the creation process.

```prisma
model CampaignWizard {
  id           String    @id @default(uuid())
  name         String
  businessGoal String?
  startDate    DateTime
  endDate      DateTime
  timeZone     String    @default("UTC")
  status       Status    @default(DRAFT)
  isComplete   Boolean   @default(false)
  updatedAt    DateTime
  currentStep  Int       @default(1)
  userId       String?

  // JSON fields
  primaryContact   Json?
  secondaryContact Json?
  budget           Json?

  // Flags for step completion
  step1Complete Boolean @default(false)
  step2Complete Boolean @default(false)
  step3Complete Boolean @default(false)
  step4Complete Boolean @default(false)

  // Array fields
  secondaryKPIs Json[] @default([])
  features      Json[] @default([])
  locations     Json[] @default([])
  competitors   Json[] @default([])
  assets        Json[] @default([])
  requirements  Json[] @default([])

  // Relationships
  user          User?           @relation(fields: [userId], references: [id])
  influencers   Influencer[]
  history       WizardHistory[]
}
```

#### CampaignWizardSubmission

Represents a completed campaign submission ready for review.

```prisma
model CampaignWizardSubmission {
  id                String           @id @default(uuid())
  campaignName      String
  description       String
  startDate         DateTime
  endDate           DateTime
  timeZone          String           @default("UTC")
  contacts          String?
  currency          Currency         @default(USD)
  totalBudget       Float            @default(0)
  socialMediaBudget Float            @default(0)
  platform          Platform
  influencerHandle  String?
  primaryContactId  Int?
  secondaryContactId Int?
  mainMessage       String?
  hashtags          String?
  memorability      String?
  keyBenefits       String?
  expectedAchievements String?
  purchaseIntent    String?
  brandPerception   String?
  primaryKPI        KPI              @default(BRAND_AWARENESS)
  secondaryKPIs     String?
  features          String?
  submissionStatus  SubmissionStatus @default(draft)
  createdAt         DateTime         @default(now())
  userId            String?

  // Relationships
  audience           Audience[]
  primaryContact     PrimaryContact?    @relation(fields: [primaryContactId], references: [id])
  secondaryContact   SecondaryContact?  @relation(fields: [secondaryContactId], references: [id])
  user               User?              @relation(fields: [userId], references: [id])
  creativeAssets     CreativeAsset[]
  creativeRequirements CreativeRequirement[]
}
```

#### Influencer

Stores information about influencers associated with campaigns.

```prisma
model Influencer {
  id              String    @id @default(uuid())
  campaignWizardId String
  platform        Platform  @default(INSTAGRAM)
  handle          String
  url             String?
  posts           Int       @default(0)
  videos          Int       @default(0)
  reels           Int       @default(0)
  stories         Int       @default(0)

  // Relationships
  campaignWizard  CampaignWizard @relation(fields: [campaignWizardId], references: [id], onDelete: Cascade)
}
```

#### WizardHistory

Tracks changes made to campaigns during the wizard process.

```prisma
model WizardHistory {
  id              String    @id @default(uuid())
  campaignWizardId String
  step            Int
  timestamp       DateTime  @default(now())
  action          String?
  changes         Json?     @default("{}")
  performedBy     String?

  // Relationships
  campaignWizard  CampaignWizard @relation(fields: [campaignWizardId], references: [id], onDelete: Cascade)
}
```

### Contact Management Models

#### PrimaryContact

Stores information about primary business contacts.

```prisma
model PrimaryContact {
  id        Int      @id @default(autoincrement())
  firstName String
  surname   String
  email     String
  position  Position @default(Manager)

  // Relationships
  submissions CampaignWizardSubmission[]
}
```

#### SecondaryContact

Stores information about secondary business contacts.

```prisma
model SecondaryContact {
  id        Int      @id @default(autoincrement())
  firstName String
  surname   String
  email     String
  position  Position @default(Manager)

  // Relationships
  submissions CampaignWizardSubmission[]
}
```

### Audience Targeting Models

#### Audience

Core audience definition with demographic targeting.

```prisma
model Audience {
  id              String    @id @default(uuid())
  campaignId      String
  ageRangeMin     Int?
  ageRangeMax     Int?
  keywords        String?
  interests       String?

  // Age demographics
  age1824         Int       @default(0)
  age2534         Int       @default(0)
  age3544         Int       @default(0)
  age4554         Int       @default(0)
  age5564         Int       @default(0)
  age65plus       Int       @default(0)

  // Relationships
  campaign        CampaignWizardSubmission @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  competitors     AudienceCompetitor[]
  gender          AudienceGender[]
  locations       AudienceLocation[]
  screeningQuestions AudienceScreeningQuestion[]
  languages       AudienceLanguage[]
}
```

#### AudienceLocation

Geographic targeting for audiences.

```prisma
model AudienceLocation {
  id         String   @id @default(uuid())
  audienceId String
  country    String
  region     String?
  city       String?

  // Relationships
  audience   Audience @relation(fields: [audienceId], references: [id], onDelete: Cascade)
}
```

#### AudienceGender

Gender targeting for audiences.

```prisma
model AudienceGender {
  id         String   @id @default(uuid())
  audienceId String
  gender     String
  percentage Int      @default(0)

  // Relationships
  audience   Audience @relation(fields: [audienceId], references: [id], onDelete: Cascade)
}
```

#### AudienceScreeningQuestion

Custom qualification criteria for audience targeting.

```prisma
model AudienceScreeningQuestion {
  id         String   @id @default(uuid())
  audienceId String
  question   String
  required   Boolean  @default(false)

  // Relationships
  audience   Audience @relation(fields: [audienceId], references: [id], onDelete: Cascade)
}
```

#### AudienceLanguage

Language preferences for audience targeting.

```prisma
model AudienceLanguage {
  id         String   @id @default(uuid())
  audienceId String
  language   String

  // Relationships
  audience   Audience @relation(fields: [audienceId], references: [id], onDelete: Cascade)
}
```

#### AudienceCompetitor

Competitive landscape analysis for audience targeting.

```prisma
model AudienceCompetitor {
  id         String   @id @default(uuid())
  audienceId String
  name       String

  // Relationships
  audience   Audience @relation(fields: [audienceId], references: [id], onDelete: Cascade)
}
```

### Creative Management Models

#### CreativeAsset

Digital assets for campaigns.

```prisma
model CreativeAsset {
  id           String            @id @default(uuid())
  name         String?
  description  String?
  url          String?
  type         CreativeAssetType @default(image)
  fileSize     Int?
  dimensions   String?
  duration     Int?
  format       String
  submissionId String

  // Relationships
  submission   CampaignWizardSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
}
```

#### CreativeRequirement

Guidelines for asset creation.

```prisma
model CreativeRequirement {
  id           String    @id @default(uuid())
  description  String
  mandatory    Boolean   @default(false)
  submissionId String

  // Relationships
  submission   CampaignWizardSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
}
```

### Brand Management Models

#### BrandingSettings

Company-specific styling and branding.

```prisma
model BrandingSettings {
  id              String    @id @default(uuid())
  companyId       String    @unique
  primaryColor    String?
  secondaryColor  String?
  logoUrl         String?
  faviconUrl      String?
  fontFamily      String?
  updatedAt       DateTime  @updatedAt
}
```

## Enum Definitions

```prisma
enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}

enum Status {
  DRAFT
  IN_REVIEW
  APPROVED
  ACTIVE
  COMPLETED
}

enum Platform {
  INSTAGRAM
  YOUTUBE
  TIKTOK
}

enum Position {
  Manager
  Director
  VP
}

enum KPI {
  AD_RECALL
  BRAND_AWARENESS
  CONSIDERATION
  MESSAGE_ASSOCIATION
  BRAND_PREFERENCE
  PURCHASE_INTENT
  ACTION_INTENT
  RECOMMENDATION_INTENT
  ADVOCACY
}

enum Currency {
  USD
  EUR
  GBP
}

enum SubmissionStatus {
  draft
  submitted
}

enum CreativeAssetType {
  image
  video
  document
}

enum Feature {
  CREATIVE_ASSET_TESTING
  BRAND_LIFT
  BRAND_HEALTH
  MIXED_MEDIA_MODELING
}
```

## Entity Relationships

### One-to-One Relationships

- `User` ↔ `NotificationPrefs`: Each user has one set of notification preferences
- `Company` ↔ `BrandingSettings`: Each company has one set of branding settings

### One-to-Many Relationships

- `User` → `CampaignWizard`: A user can create multiple campaigns
- `User` → `TeamMember`: A user can be a member of multiple teams
- `CampaignWizard` → `Influencer`: A campaign can have multiple influencers
- `CampaignWizard` → `WizardHistory`: A campaign has multiple history records
- `CampaignWizardSubmission` → `Audience`: A submission can target multiple audience segments
- `CampaignWizardSubmission` → `CreativeAsset`: A submission can have multiple creative assets
- `CampaignWizardSubmission` → `CreativeRequirement`: A submission can have multiple creative requirements
- `Audience` → `AudienceLocation`: An audience can target multiple locations
- `Audience` → `AudienceGender`: An audience can target multiple gender segments
- `Audience` → `AudienceScreeningQuestion`: An audience can have multiple screening questions
- `Audience` → `AudienceLanguage`: An audience can have multiple language preferences
- `Audience` → `AudienceCompetitor`: An audience can have multiple competitors

### Many-to-One Relationships

- `TeamMember` → `User`: Multiple team memberships belong to a user
- `Influencer` → `CampaignWizard`: Multiple influencers belong to a campaign
- `WizardHistory` → `CampaignWizard`: Multiple history records belong to a campaign
- `CampaignWizardSubmission` → `PrimaryContact`: Many submissions can use the same primary contact
- `CampaignWizardSubmission` → `SecondaryContact`: Many submissions can use the same secondary contact
- `AudienceLocation` → `Audience`: Multiple locations belong to an audience
- `AudienceGender` → `Audience`: Multiple gender segments belong to an audience
- `AudienceScreeningQuestion` → `Audience`: Multiple screening questions belong to an audience
- `AudienceLanguage` → `Audience`: Multiple language preferences belong to an audience
- `AudienceCompetitor` → `Audience`: Multiple competitors belong to an audience
- `CreativeAsset` → `CampaignWizardSubmission`: Multiple assets belong to a submission
- `CreativeRequirement` → `CampaignWizardSubmission`: Multiple requirements belong to a submission

## Database Design Principles

Our database design adheres to the following principles:

1. **Normalization**: Models are properly normalized to minimize redundancy while maintaining practical access patterns.
2. **Referential Integrity**: Foreign key constraints ensure data consistency across related tables.
3. **Type Safety**: Enums and strict typing ensure data validity.
4. **Performance Optimization**: Indexes on frequently accessed fields and query paths.
5. **Scalability**: Model design supports horizontal scaling and future expansion.
6. **Audit Capability**: History tracking for critical operations.

## Indexing Strategy

Indexes are defined on frequently accessed fields to optimize query performance:

```prisma
// Primary key indexes
@@id([id])

// Foreign key indexes
@@index([userId])
@@index([campaignWizardId])
@@index([submissionId])
@@index([audienceId])

// Common query fields
@@index([status])
@@index([createdAt])
@@index([email])
@@index([handle])

// Compound indexes for common queries
@@index([userId, status])
@@index([platform, handle])
```

## Data Migration Strategy

For schema changes, we follow a structured process:

1. Create a Prisma migration using `prisma migrate dev --name migration_name`
2. Test the migration in development environments
3. Apply the migration in production using `prisma migrate deploy`
4. Monitor for any issues or performance impacts

## Best Practices for Database Operations

1. **Use Transactions** for operations that modify multiple related records to ensure data consistency.
2. **Implement Proper Error Handling** for database operations to recover gracefully from failures.
3. **Optimize Queries** by selecting only the fields you need to minimize data transfer.
4. **Use Pagination** for large result sets to improve performance.
5. **Monitor Query Performance** to identify and fix slow queries.
6. **Implement Connection Pooling** to efficiently manage database connections.
7. **Apply Proper Validation** before database operations to ensure data integrity.
8. **Use Prisma's Include** functionality carefully to avoid N+1 query issues.

## Conclusion

This database schema provides a solid foundation for the Justify.social platform, with a clean, normalized structure, proper relationships between models, and performance optimizations for scaling. All models are properly defined, accessible through a type-safe client, and follow consistent patterns.

The schema is designed to support current requirements while allowing for future expansion, making it a robust solution for enterprise-grade applications.
