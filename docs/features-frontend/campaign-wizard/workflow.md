# Campaign Wizard Workflow

**Last Updated:** 2025-03-07  
**Status:** Active  
**Owner:** Campaign Team

## Overview

This document outlines the complete end-to-end workflow for the Campaign Wizard in Justify.social, from initial login to campaign creation, submission, and follow-up activities.

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
   - Upload images or videos using UploadThing integration
   - Support for multiple file formats (JPEG, PNG, GIF, MP4)
   - Auto-detection of file type for proper preview rendering
   - Automatic thumbnail generation and optimization
   - Asset details customization (name, description, budget, influencer)

2. Asset preview functionality:
   - Square, centered thumbnails for consistent UI appearance
   - Videos autoplay for 5 seconds then loop for preview
   - Interactive play/pause controls with hover effects
   - Light to solid icon transitions on interactive elements
   - Robust error handling with retry options for failed uploads
   - Direct integration with UploadThing's storage API

3. System behavior:
   - Validates file formats and sizes on upload
   - Analyzes content for potential platform policy violations
   - Generates optimized versions for different platforms
   - Server-side proxy for CORS-protected assets
   - Resilient to connection issues with automatic recovery
   - Maintains consistent branding using global app color palette
   - Handles asset deletion with proper cleanup procedures
   - Uses query parameters for secure API authentication

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

## Application Architecture

### Data Management

1. **Global State & Context**:
   - The wizard uses React Context (`WizardContext`) to maintain state across steps
   - All form data is centralized through this context
   - Steps communicate through this shared state layer

2. **Data Loading**:
   - Campaign data loads once at initialization
   - Data is transformed from backend to frontend format
   - The app uses a single data fetch to minimize API calls
   - Each step references the same data source

3. **Draft Saving System**:
   - Drafts can be saved at any point in the workflow
   - The system uses flexible validation for drafts
   - Incomplete data is preserved without validation errors
   - Backend recognizes draft status and applies appropriate rules

4. **Data Format Transformation**:
   - Backend data uses UPPERCASE_SNAKE_CASE for enums
   - Frontend interfaces use camelCase
   - A transformer utility handles conversions in both directions
   - All API responses are standardized before display

### Technical Implementation Patterns

1. **Server/Client Component Pattern**:
   - Layout files handle server-side directives
   - Client components use the "use client" directive
   - Server components handle data fetching
   - Clear separation ensures proper rendering

2. **Validation Strategy**:
   - Step-specific validation for immediate feedback
   - Cross-step validation for related fields
   - Backend validation as final safeguard
   - Special validation rules for draft mode

3. **Component Architecture**:
   - Each step uses composition of smaller components
   - Form handling is standardized using React Hook Form
   - Reusable UI components ensure consistency
   - Error boundaries protect against component failures

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

## Editing Existing Campaigns

When editing an existing campaign:

1. Campaign ID is extracted from the URL
2. Initial data load fetches all campaign data
3. Data is transformed to frontend format
4. Form is pre-populated with existing values
5. Editing follows the same workflow as creation
6. Changes are tracked for auditing purposes

## Troubleshooting

Common issues and their solutions:

- **Form validation errors**: Check field format requirements
- **Data not loading**: Verify network connection and permissions
- **Changes not saving**: Check for validation issues or server connectivity
- **State transitions failing**: Ensure required fields are completed

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