# Campaign Wizard Form Validation Guide

This guide provides a systematic approach to verify that all forms in the Campaign Wizard correctly save data to the database. By following these steps, you can identify which forms might have issues with data persistence.

## Prerequisites

- Access to the application database
- Admin privileges in the application
- A test environment or a safe way to test in production
- Ability to execute database queries

## Test Data Patterns

When creating test campaigns, use a consistent naming pattern to easily identify test data:

- Prefix: TEST_
- Date: YYYYMMDD
- Random suffix: 3-4 characters

Example: `TEST_20230615_A7B9`

## Step-by-Step Validation Process

### 1. Campaign Details Form (Step 1)

**What to test:**
- Basic campaign information
- Contacts information
- Date selection
- Budget information

**Fields to validate:**
- Campaign Name
- Description
- Start/End Dates
- Time Zone
- Currency
- Total Budget
- Social Media Budget
- Primary Contact
- Secondary Contact (if applicable)
- Additional Contacts (if applicable)

**Database verification:**
```sql
SELECT 
    id, 
    campaign_name, 
    description, 
    start_date, 
    end_date, 
    time_zone, 
    currency, 
    total_budget, 
    social_media_budget, 
    contacts
FROM 
    campaigns 
WHERE 
    id = 'campaign_id';
```

### 2. Objectives & Messaging Form (Step 2)

**What to test:**
- Main message
- Hashtags
- Primary KPI selection and target
- Secondary KPIs
- Features/USPs

**Fields to validate:**
- Main Message
- Hashtags
- Primary KPI (name and target)
- Secondary KPIs
- Features/USPs

**Database verification:**
```sql
SELECT 
    id, 
    objectives
FROM 
    campaigns 
WHERE 
    id = 'campaign_id';
```

Then parse the JSON in the `objectives` field.

### 3. Target Audience Form (Step 3)

**What to test:**
- Audience segments
- Demographic information
- Geographic targeting
- Competitors

**Fields to validate:**
- Target audience segments
- Age ranges
- Gender distribution
- Geographic locations
- Competitor information

**Database verification:**
```sql
SELECT 
    id, 
    target_audience, 
    competitors
FROM 
    campaigns 
WHERE 
    id = 'campaign_id';
```

### 4. Creative Assets Form (Step 4)

**What to test:**
- Asset uploads
- Asset metadata
- Guidelines

**Fields to validate:**
- Uploaded assets
- Asset descriptions
- Brand guidelines
- Content preferences

**Database verification:**
```sql
SELECT 
    id, 
    assets,
    guidelines
FROM 
    campaigns 
WHERE 
    id = 'campaign_id';
```

Then check associated asset records:

```sql
SELECT * FROM assets WHERE campaign_id = 'campaign_id';
```

## Common Issues to Look For

1. **Missing Data**: Fields that were filled in the form but are empty in the database
2. **Data Type Issues**: Numbers stored as strings, dates in wrong format
3. **JSON Parsing Errors**: Improperly formatted JSON in fields like objectives or contacts
4. **Truncated Data**: Text fields that are cut off
5. **Character Encoding Issues**: Special characters not displaying correctly

## Debugging Tips

If you find issues with a particular form:

1. Check the browser's network tab to see the request payload and response
2. Verify that the API endpoint is correctly handling the data
3. Review the component's form submission function
4. Check for validation errors that might prevent submission
5. Look for console errors during form submission

## Systematic Testing Approach

1. **Test Each Form in Isolation**: Complete only one step at a time and verify database state
2. **Test Complete Flow**: Complete all steps in sequence to check for interdependencies
3. **Test Edge Cases**: Very long text, special characters, minimum/maximum values
4. **Test with Different Data**: Create multiple test campaigns with different data to ensure consistency

## Logging Results

Create a spreadsheet with the following columns:
- Campaign ID
- Step Number
- Fields Tested
- Expected Data
- Actual Data in Database
- Status (Pass/Fail)
- Notes

## Quick Database View Script

Here's a JavaScript snippet that can be used with PrismaClient to validate campaign data:

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateCampaignData(campaignId) {
  // Fetch campaign with all related data
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      assets: true,
    }
  });

  console.log('Basic Campaign Data:');
  console.log(JSON.stringify({
    id: campaign.id,
    name: campaign.campaignName,
    description: campaign.description,
    dates: {
      start: campaign.startDate,
      end: campaign.endDate,
    },
    budget: {
      total: campaign.totalBudget,
      socialMedia: campaign.socialMediaBudget,
      currency: campaign.currency,
    }
  }, null, 2));

  // Parse JSON fields
  try {
    const contacts = JSON.parse(campaign.contacts || '{}');
    console.log('Contacts:');
    console.log(JSON.stringify(contacts, null, 2));
  } catch (e) {
    console.log('Error parsing contacts:', e.message);
  }

  try {
    const objectives = JSON.parse(campaign.objectives || '{}');
    console.log('Objectives:');
    console.log(JSON.stringify(objectives, null, 2));
  } catch (e) {
    console.log('Error parsing objectives:', e.message);
  }

  try {
    const targetAudience = JSON.parse(campaign.targetAudience || '{}');
    console.log('Target Audience:');
    console.log(JSON.stringify(targetAudience, null, 2));
  } catch (e) {
    console.log('Error parsing target audience:', e.message);
  }

  // List assets
  console.log('Assets:');
  console.log(JSON.stringify(campaign.assets, null, 2));
}

// Usage:
// validateCampaignData('campaign_id_here');
``` 