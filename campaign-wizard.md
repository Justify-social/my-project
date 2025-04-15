# Campaign Wizard Steps and Fields

Based on the `schema.prisma` definition for the `CampaignWizard` model.

## Step 1: Campaign Setup

This step focuses on the basic administrative and high-level details of the campaign.

*   **`name`**: `String` - The name of the campaign.
*   **`businessGoal`**: `String` - The primary business objective for the campaign.
*   **`startDate`**: `DateTime` - The planned start date of the campaign.
*   **`endDate`**: `DateTime` - The planned end date of the campaign.
*   **`timeZone`**: `String` - The time zone relevant to the campaign schedule.
*   **`primaryContact`**: `Json` - Details of the main contact person (e.g., name, email, position).
*   **`secondaryContact`**: `Json?` - Optional details for a secondary contact.
*   **`additionalContacts`**: `Json?` - Optional details for other contacts.
*   **`budget`**: `Json` - Budget allocation details (e.g., total budget, currency, breakdown).

## Step 2: Objectives & Strategy

This step defines the goals, messaging, and specific features for the campaign.

*   **`primaryKPI`**: `KPI?` - The main Key Performance Indicator.
*   **`secondaryKPIs`**: `KPI[]` - Additional KPIs to track.
*   **`messaging`**: `Json?` - Core campaign message, hashtags, key benefits.
*   **`expectedOutcomes`**: `Json?` - Desired results like purchase intent or brand perception changes.
*   **`features`**: `Feature[]` - Specific features or services included (e.g., Brand Lift study).

## Step 3: Target Audience

This step details the audience the campaign aims to reach.

*   **`demographics`**: `Json?` - Age ranges, gender splits, etc.
*   **`locations`**: `Json[]` - Geographic targeting details (countries, regions, proportions).
*   **`targeting`**: `Json?` - Specific targeting criteria like interests, keywords, languages.
*   **`competitors`**: `String[]` - List of key competitors relevant to this audience/campaign.

## Step 4: Creative & Assets

This step covers the creative aspects, assets, and any specific guidelines or requirements.

*   **`assets`**: `Json[]` - List of creative assets (images, videos) with details like URLs, types, formats.
*   **`guidelines`**: `String?` - Brand or creative guidelines.
*   **`requirements`**: `Json[]` - Specific creative requirements (mandatory/optional).
*   **`notes`**: `String?` - Any additional notes related to the creative aspects.
*   **`Influencer`**: `Influencer[]` - Details of influencers involved (platform, handle). (Related Model)

---

*Note: Fields like `id`, `createdAt`, `updatedAt`, `currentStep`, `isComplete`, `status`, `userId`, `user`, and `WizardHistory` are generally managed by the system or relate to the overall state and history, not typically direct user inputs within a specific step form.*
