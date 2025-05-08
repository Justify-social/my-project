# Database Architecture

**Last Reviewed:** 2025-05-09

This document provides an overview of the Justify platform's database architecture, focusing on the technology used, the schema structure, key models, and operational aspects like migrations and seeding.

## 1. Technology Stack

- **Database**: PostgreSQL (Version 14+ recommended)
- **ORM (Object-Relational Mapper)**: Prisma
- **Schema Definition**: The database schema is defined declaratively using the Prisma Schema Language (PSL) in the `config/prisma/schema.prisma` file.

## 2. Prisma Schema (`schema.prisma`)

The **Single Source of Truth (SSOT)** for our database structure is the schema file located at:
[`config/prisma/schema.prisma`](../../config/prisma/schema.prisma) _(Link may need verification based on exact project setup)_

This file defines:

- **Datasource**: Connection details for the PostgreSQL database (using `DATABASE_URL` environment variable).
- **Generator**: Configuration for the Prisma Client (`prisma-client-js`).
- **Models**: Represents the tables in our database (e.g., `User`, `CampaignWizard`).
- **Fields**: Columns within each table, including their data types (e.g., `String`, `Int`, `DateTime`, `Boolean`, `Json`, `Enum[]`).
- **Attributes**: Define properties like primary keys (`@id`), unique constraints (`@unique`), default values (`@default`), relations (`@relation`), indexes (`@@index`), and more.
- **Relations**: Define relationships between models (one-to-one, one-to-many, many-to-many).
- **Enums**: Define sets of allowed string values for specific fields (e.g., `Status`, `UserRole`, `Platform`).

**Key Prisma Concepts Used:**

- **Relations**: Explicitly defined using `@relation` attribute, specifying fields, references, and sometimes actions like `onDelete: Cascade`.
- **Indexes**: Defined using `@@index` for single or multi-field indexes to optimize query performance.
- **Unique Constraints**: Enforced using `@unique` on fields or `@@unique` for multi-field constraints.
- **JSON Fields**: Used for storing less structured data (e.g., `CampaignWizard.budget`, `SurveyResponse.answers`). Careful consideration is needed for querying JSON fields.

## 3. Key Data Models Overview

Below is a high-level overview of some core models defined in `schema.prisma`. Refer to the schema file itself for exhaustive details.

- **`User`**: Represents application users.
  - Linked to Clerk via `clerkId @unique`.
  - Linked to Stripe via `stripeCustomerId @unique`.
  - Contains basic profile info, application role (`UserRole`), notification preferences, branding settings, and relations to campaigns, teams, etc.
- **`CampaignWizard` / `CampaignWizardSubmission`**: Models related to the multi-step campaign creation process and the final submitted campaign data.
  - Includes details like name, budget, dates, KPIs, targeting, assets, associated user, etc.
- **`Audience`**: Defines target audience details for campaigns, including demographics, locations, interests, etc.
- **`CreativeAsset` / `CreativeRequirement`**: Stores information about creative assets uploaded for campaigns.
- **`MarketplaceInfluencer` / `InsightIQAccountLink`**: Models for storing persistent influencer profile data, potentially sourced from external platforms like InsightIQ, including performance metrics and platform links.
- **`BrandLiftStudy` / `SurveyQuestion` / `SurveyOption` / `SurveyResponse` / `BrandLiftReport` / `SurveyApprovalStatus` / `SurveyApprovalComment`**: A comprehensive set of related models for managing the entire Brand Lift survey feature, including study setup, questions, responses, reporting, and approval workflows.
- **`TeamMember` / `TeamInvitation`**: Models for implementing team functionality, allowing users to belong to teams with specific roles.
- **`BrandingSettings`**: Allows users to customize certain visual aspects (colors, fonts, logo) associated with their account.
- **`StripeEvent`**: Used for idempotency tracking when processing Stripe webhooks.

## 4. Database Migrations

We use Prisma Migrate to manage database schema changes.

- **Workflow**: Developers modify the `schema.prisma` file to reflect desired changes. A new migration is generated using the Prisma CLI, which creates SQL files representing the changes.
- **Applying Migrations (Development)**: In the local development environment, migrations are typically applied using a command like:
  ```bash
  npm run db:migrate
  ```
  _(This usually runs `prisma migrate dev`, which applies pending migrations, generates Prisma Client, and ensures the dev database schema matches `schema.prisma`.)_
- **Deployment**: In staging and production environments, migrations are typically applied as part of the deployment process using `prisma migrate deploy`.

## 5. Database Seeding

To populate the development database with initial sample data for testing and local development:

- **Seed Script**: A seed script (often defined in `package.json` and located in `prisma/seed.ts` or `scripts/seed.ts`) uses Prisma Client to create initial records.
- **Running the Seed Script**: Execute the seed command (if available):
  ```bash
  npm run db:seed
  ```

## 6. Database Access

Application code interacts with the database exclusively through the **Prisma Client**.

- **Location**: The Prisma Client instance is typically configured and exported from `src/lib/db.ts` or `src/lib/prisma.ts`.
- **Usage**: Services (`src/services/`) and API routes (`src/app/api/`) import and use the Prisma Client instance to perform type-safe database queries (CRUD operations).
- **Best Practice**: Avoid accessing the database directly from UI components. Data should be fetched via API routes or server components that utilize services or the Prisma client directly.

Refer to the **[Prisma Documentation](https://www.prisma.io/docs/)** for more details on schema syntax, migrations, and client usage.
