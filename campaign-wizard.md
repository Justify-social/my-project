# Campaign Wizard Steps and Fields

Based on the `schema.prisma` definition for the `CampaignWizard` model.

## Step 1: Campaign Setup

This step focuses on the basic administrative and high-level details of the campaign.

*   **`name`**: `String` - The name of the campaign.
*   **`businessGoal`**: `String` - The primary business objective for the campaign.
*   **`brand`**: `String` - The brand this campaign is for.
*   **`website`**: `String?` - The primary website URL for the brand or campaign.
*   **`startDate`**: `DateTime` - The planned start date of the campaign.
*   **`endDate`**: `DateTime` - The planned end date of the campaign.
*   **`timeZone`**: `String` - The time zone relevant to the campaign schedule.
*   **`primaryContact`**: `Json` - Details of the main contact person (e.g., name, email, position).
*   **`secondaryContact`**: `Json?` - Optional details for a secondary contact.
*   **`additionalContacts`**: `Json?` - Optional details for other contacts.
*   **`budget`**: `Json` - Budget allocation details (e.g., total budget, currency, breakdown).

### Step 1 UI vs. Prisma Comparison

*   **Match:** Most fields align well between the UI described and the Prisma definition (`name`, `businessGoal`, `startDate`, `endDate`, `timeZone`, `primaryContact`, `secondaryContact`, `additionalContacts`, `budget`).
*   **Difference:** The UI includes adding **Influencers** (Platform, Handle) in Step 1. While `Influencer` is a related model in Prisma linked to `CampaignWizard`, it wasn't listed directly under the core Step 1 fields of `CampaignWizard` itself in the initial schema breakdown. The UI combines core setup with influencer addition.

## Step 2: Objectives & Strategy

This step defines the goals, messaging, and specific features for the campaign.

*   **`primaryKPI`**: `KPI?` - The main Key Performance Indicator.
*   **`secondaryKPIs`**: `KPI[]` - Additional KPIs to track.
*   **`messaging`**: `Json?` - Core campaign message, hashtags, key benefits.
*   **`expectedOutcomes`**: `Json?` - Desired results like purchase intent or brand perception changes.
*   **`features`**: `Feature[]` - Specific features or services included (e.g., Brand Lift study).

### Step 2 UI vs. Prisma Comparison

*   **Match:** There is a strong alignment. The UI provides specific input fields (text areas, checkboxes, selections) that directly map to the `primaryKPI`, `secondaryKPIs`, and `features` fields. The UI's "Messaging" and "Hypotheses" sections correspond directly to the expected content within the `messaging` and `expectedOutcomes` JSON fields defined in Prisma.
*   **Difference:** None observed.

## Step 3: Target Audience

This step details the audience the campaign aims to reach.

*   **`demographics`**: `Json?` - Age ranges, gender splits, etc.
*   **`locations`**: `Json[]` - Geographic targeting details (countries, regions, proportions).
*   **`targeting`**: `Json?` - Specific targeting criteria like interests, keywords, languages.
*   **`competitors`**: `String[]` - List of key competitors relevant to this audience/campaign.

### Step 3 UI vs. Prisma Comparison

*   **Match:** Strong alignment. The UI sections for "Demographics", "Locations", "Advanced Targeting", and "Competitor Tracking" directly correspond to the `demographics`, `locations`, `targeting`, and `competitors` fields defined in Prisma. The UI provides suitable inputs (sliders, selections, text inputs) to capture the data expected for these JSON or String array fields.
*   **Difference:** None observed.

## Step 4: Creative & Assets

This step covers the creative aspects, assets, and any specific guidelines or requirements.

*   **`assets`**: `Json[]` - List of creative assets (images, videos) with details like URLs, types, formats.
*   **`guidelines`**: `String?` - Brand or creative guidelines.
*   **`requirements`**: `Json[]` - Specific creative requirements (mandatory/optional).
*   **`notes`**: `String?` - Any additional notes related to the creative aspects.
*   **`Influencer`**: `Influencer[]` - Details of influencers involved (platform, handle). (Related Model)

### Step 4 UI vs. Prisma Comparison

*   **Partial Match:** The UI snippet focuses solely on the "Upload Campaign Assets" feature, which corresponds to the `assets` JSON field in Prisma.
*   **Difference:** The UI snippet **does not show** input fields for `guidelines`, `requirements`, or `notes`, which were identified as part of Step 4 in the Prisma schema analysis. The `Influencer` details (handled in UI Step 1) are also not present here.

---

*Note: Fields like `id`, `createdAt`, `updatedAt`, `currentStep`, `isComplete`, `status`, `userId`, `user`, and `WizardHistory` are generally managed by the system or relate to the overall state and history, not typically direct user inputs within a specific step form.*
