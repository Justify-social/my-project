# Campaign Wizard Form Validation Guide

## Overview

This document provides a systematic approach to verify that all forms in the Campaign Wizard correctly save data to the database. This guide should be used to identify any forms or fields that are not properly storing information.

## Prerequisites

- Access to the application database (either direct or through an admin panel)
- Admin privileges in the application
- Basic understanding of the database schema
- A test environment (avoid using production if possible)

## Test Data Patterns

To easily identify test data, use consistent prefixes and patterns:
- Campaign names: "TEST-validation-[timestamp]" (e.g., "TEST-validation-20230525")
- Contact names: "Test User [step number]"
- Email addresses: "test.user+[campaign_name]@example.com"
- Descriptions: Include step and field identifiers

## Step-by-Step Validation Process

### Step 1: Campaign Details Form

**What to test:**
1. Create a new campaign with all fields filled
2. Create a campaign with only required fields
3. Create a campaign with additional contacts
4. Edit an existing campaign

**Fields to validate:**
- Campaign name
- Business goal
- Date range (start/end dates)
- Time zone
- Primary and secondary contacts
- Additional contacts
- Currency and budget amounts
- Platform and influencer handle

**Database verification:**
```sql
-- Check the main campaign record
SELECT id, campaignName, description, startDate, endDate, timeZone, 
       currency, totalBudget, socialMediaBudget, platform, influencerHandle
FROM campaigns
WHERE campaignName LIKE 'TEST-validation-%'
ORDER BY id DESC
LIMIT 1;

-- Verify contacts
SELECT * FROM contacts 
WHERE campaignId = [campaign_id];

-- Check additional contacts (if stored as JSON)
SELECT contacts FROM campaigns
WHERE id = [campaign_id];
```

### Step 2: Objectives & Messaging Form

**What to test:**
1. Add all objectives data to a test campaign
2. Test with minimum required fields
3. Add multiple KPIs and features
4. Edit existing objectives

**Fields to validate:**
- Main message
- Hashtags
- Memorability rating
- Key benefits
- Expected achievements
- Purchase intent
- Primary KPI (name and target)
- Secondary KPIs (multiple entries)
- Features (multiple entries)

**Database verification:**
```sql
-- Check objectives data
SELECT id, campaignName, objectives
FROM campaigns
WHERE id = [campaign_id];

-- If using separate tables for KPIs/features
SELECT * FROM campaign_kpis
WHERE campaignId = [campaign_id];

SELECT * FROM campaign_features
WHERE campaignId = [campaign_id];
```

### Step 3: Target Audience Form

**What to test:**
1. Add multiple audience segments
2. Add multiple competitors
3. Test removing segments/competitors
4. Edit existing audience data

**Fields to validate:**
- Audience segments (multiple entries)
- Competitors (multiple entries)

**Database verification:**
```sql
-- Check audience data
SELECT id, campaignName, audience
FROM campaigns
WHERE id = [campaign_id];

-- If using separate tables
SELECT * FROM campaign_audience_segments
WHERE campaignId = [campaign_id];

SELECT * FROM campaign_competitors
WHERE campaignId = [campaign_id];
```

### Step 4: Creative Assets Form

**What to test:**
1. Upload multiple assets with different file types
2. Add tags to assets
3. Delete assets
4. Edit asset metadata

**Fields to validate:**
- File uploads (successful upload and storage)
- File metadata (tags, descriptions)
- Asset organization

**Database verification:**
```sql
-- Check assets data
SELECT id, campaignName, assets
FROM campaigns
WHERE id = [campaign_id];

-- If using separate asset table
SELECT * FROM campaign_assets
WHERE campaignId = [campaign_id];
```

## Common Issues to Look For

1. **Missing Data**: Fields submitted but not saved
2. **Data Truncation**: Long text fields getting cut off
3. **Data Type Issues**: Numbers stored as strings or vice versa
4. **Array/Collection Issues**: Multiple items not being saved correctly
5. **Relationship Problems**: Foreign keys not properly established

## Debugging Tips

If data is not saving correctly:

1. **Check Browser Network Tab**: Look at the request payload and response
2. **Examine API Logs**: Look for errors or warnings
3. **Check Database Logs**: Look for failed queries or constraints
4. **Verify Form Submission**: Ensure the form is actually submitting (not blocked by validation)
5. **Check Data Transformations**: Ensure data isn't being improperly formatted before saving

## Systematic Testing Approach

1. **Test each form in isolation** by directly navigating to each step with a campaign ID
2. **Test the complete wizard flow** to ensure data persistence between steps
3. **Test with various browsers** to identify any browser-specific issues
4. **Test with different user roles** to verify permission handling

## Logging Results

Create a spreadsheet with these columns:
- Step / Form name
- Field name
- Test performed
- Expected result
- Actual result
- Pass/Fail
- Notes (including SQL queries run)

## Quick Database View Script

```javascript
// Save as campaign-validator.js and run with Node.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function validateCampaign(campaignId) {
  try {
    // Get the campaign with all related data
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(campaignId) },
      include: {
        primaryContact: true,
        secondaryContact: true,
        // Include other relations as needed
      }
    });
    
    if (!campaign) {
      console.log(`Campaign with ID ${campaignId} not found`);
      return;
    }
    
    console.log('\n=== CAMPAIGN BASIC DETAILS ===');
    console.log(`ID: ${campaign.id}`);
    console.log(`Name: ${campaign.campaignName}`);
    console.log(`Description: ${campaign.description}`);
    console.log(`Dates: ${campaign.startDate} to ${campaign.endDate}`);
    console.log(`Status: ${campaign.status}`);
    
    console.log('\n=== CONTACTS ===');
    if (campaign.primaryContact) {
      console.log('Primary:', campaign.primaryContact.firstName, campaign.primaryContact.surname);
    }
    if (campaign.secondaryContact) {
      console.log('Secondary:', campaign.secondaryContact.firstName, campaign.secondaryContact.surname);
    }
    
    // Additional contacts (if stored as JSON)
    if (campaign.contacts) {
      try {
        const additionalContacts = JSON.parse(campaign.contacts);
        console.log('Additional Contacts:', additionalContacts.length);
        additionalContacts.forEach((c, i) => {
          console.log(`  ${i+1}. ${c.firstName} ${c.surname} (${c.email})`);
        });
      } catch (e) {
        console.log('Error parsing additional contacts');
      }
    }
    
    // Other JSON fields
    if (campaign.objectives) {
      try {
        const objectives = JSON.parse(campaign.objectives);
        console.log('\n=== OBJECTIVES ===');
        console.log('Main Message:', objectives.mainMessage);
        console.log('Primary KPI:', objectives.primaryKPI?.name, objectives.primaryKPI?.target);
        console.log('Secondary KPIs:', objectives.secondaryKPIs?.length || 0);
        console.log('Features:', objectives.features?.length || 0);
      } catch (e) {
        console.log('Error parsing objectives');
      }
    }
    
    // Check for audience data
    if (campaign.audience) {
      try {
        const audience = JSON.parse(campaign.audience);
        console.log('\n=== AUDIENCE ===');
        console.log('Segments:', audience.segments?.length || 0);
        console.log('Competitors:', audience.competitors?.length || 0);
      } catch (e) {
        console.log('Error parsing audience data');
      }
    }
    
    // Check for assets
    if (campaign.assets) {
      try {
        const assets = JSON.parse(campaign.assets);
        console.log('\n=== ASSETS ===');
        console.log('Total files:', assets.files?.length || 0);
        if (assets.files && assets.files.length > 0) {
          assets.files.forEach((f, i) => {
            console.log(`  ${i+1}. ${f.url} (Tags: ${f.tags?.join(', ')})`);
          });
        }
      } catch (e) {
        console.log('Error parsing assets');
      }
    }
    
  } catch (error) {
    console.error('Validation error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get campaign ID from command line argument
const campaignId = process.argv[2];
if (!campaignId) {
  console.log('Please provide a campaign ID');
  process.exit(1);
}

validateCampaign(campaignId);
```

Run with: `node campaign-validator.js 123` (where 123 is your campaign ID) 