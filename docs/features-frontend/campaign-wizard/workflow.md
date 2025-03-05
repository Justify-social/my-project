# Campaign Wizard Workflow

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Campaign Team

## Overview

This document outlines the complete end-to-end workflow for the Campaign Wizard, from initial login to campaign creation, submission, and follow-up activities.

## User Journey Map

### 1. Login & Access

1. **Authentication**:
   - User enters email and password or uses SSO
   - System validates credentials
   - User is redirected to the dashboard

2. **Dashboard Overview**:
   - Campaign summary cards display active campaigns
   - Performance metrics show across all campaigns
   - "Create Campaign" button is prominently displayed

3. **Initiate Campaign Creation**:
   - Click "Create Campaign" on the dashboard
   - Alternatively, navigate to Campaigns section and click "New Campaign"

### 2. Campaign Wizard Steps

#### Step 1: Campaign Overview

1. Enter basic campaign information:
   - Campaign name
   - Business goal (awareness, consideration, conversion)
   - Start/end dates
   - Budget and currency
   - Primary and secondary contact information

2. System behavior:
   - Autosaves data after each field change
   - Validates required fields
   - Updates completion status
   - Enables "Next" button when required fields are completed

#### Step 2: Campaign Objectives

1. Define marketing objectives:
   - Primary KPI selection
   - Target metrics
   - Main message
   - Campaign hashtags
   - Core audience definition

2. System behavior:
   - Suggests appropriate KPIs based on business goal
   - Provides example messages based on selected industry
   - Validates metric targets for reasonableness
   - Autosaves data

#### Step 3: Audience Targeting

1. Define target audience:
   - Demographics (age range, gender)
   - Geographic targeting (locations)
   - Advanced targeting options
   - Competitor tracking preferences
   - Language preferences

2. System behavior:
   - Shows estimated reach based on selections
   - Highlights potential targeting conflicts
   - Suggests additional targeting options
   - Saves audience segments for future reuse

#### Step 4: Creative Assets

1. Upload and manage creative assets:
   - Upload images or videos
   - Select aspect ratios for different platforms
   - Add captions and hashtags
   - Preview assets on different platforms

2. System behavior:
   - Validates file formats and sizes
   - Analyzes content for potential platform policy violations
   - Generates optimized versions for different platforms
   - Provides preview functionality

#### Step 5: Review & Submit

1. Final review process:
   - Campaign summary page with all details
   - Edit buttons for each section
   - Submit campaign button
   - Save as draft option

2. System behavior:
   - Performs final validation across all steps
   - Calculates estimated performance metrics
   - Prepares submission package
   - Transitions campaign to "Submitted" state upon submission

### 3. Post-Submission Flow

1. **Confirmation Screen**:
   - Success message with campaign ID
   - Next steps guidance
   - Options to view campaign or create another

2. **Campaign List View**:
   - Updated list showing the new campaign
   - Status indicator showing "Submitted" or "In Review"
   - Options to duplicate or edit (if still permitted)

3. **Campaign Detail Page**:
   - Complete campaign information
   - Timeline of campaign activities
   - Performance tracking (once campaign is active)
   - Related actions (Brand Lift, Creative Testing, etc.)

## State Transitions

The Campaign Wizard maintains state throughout the workflow:

| State | Description | Allowed Transitions |
|-------|-------------|---------------------|
| Draft | Initial creation state | In Review, Deleted |
| In Review | Submitted for review | Approved, Rejected, Draft |
| Approved | Ready for activation | Active, Draft |
| Active | Currently running | Completed, Paused |
| Paused | Temporarily suspended | Active, Completed |
| Completed | Campaign ended | Archived |
| Archived | Stored for reference | None |

## Data Persistence

The Campaign Wizard persists data at these key points:

1. **Autosave**: Every 30 seconds during active editing
2. **Step Transition**: When moving between steps
3. **Manual Save**: When clicking "Save" or "Save as Draft"
4. **Submission**: When submitting the completed campaign

## Related Features

After campaign creation, users typically proceed to:

1. **Brand Lift Setup**: Creating brand lift studies
2. **Creative Testing**: Testing campaign creative assets
3. **Performance Monitoring**: Tracking campaign metrics
4. **Report Generation**: Creating campaign reports

## Related Documentation

- [Campaign Wizard Usage](./usage.md)
- [Form Validation](./form-validation.md)
- [Dashboard Overview](../dashboard/overview.md) 