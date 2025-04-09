# Campaign Wizard Overview

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Campaign Team

## Overview

The Campaign Wizard is a core feature of the application that guides users through the process of creating and managing marketing campaigns. It provides a step-by-step workflow for defining campaign details, objectives, target audiences, and creative assets.

## Key Functionality

- Multi-step campaign creation process
- Autosave functionality to prevent data loss
- Comprehensive validation at each step
- Dynamic form fields based on campaign type
- Support for file uploads and rich media
- Campaign preview and submission

## User Experience

The Campaign Wizard is designed to be intuitive and user-friendly. Users progress through a series of steps, each focused on a specific aspect of campaign creation:

1. **Campaign Details**: Basic information, contacts, dates, and budget
2. **Objectives & Messaging**: KPIs, messaging, and hashtags
3. **Target Audience**: Demographics, locations, and interests
4. **Creative Assets**: Asset uploads, guidelines, and requirements

At each step, the wizard provides:
- Clear guidance on required information
- Automatic validation of inputs
- Progress indicators
- Save and continue functionality
- Ability to navigate between steps

## Technical Implementation

The Campaign Wizard is built using:

- React components for the UI
- Form state management with React hooks
- Client-side validation using Zod schemas
- Autosave functionality with debouncing
- REST API integration for data persistence

## Integration Points

The Campaign Wizard integrates with several other system components:

- **Database**: Stores campaign data using the CampaignWizard schema
- **Authentication**: Ensures only authorized users can create campaigns
- **File Storage**: Handles creative asset uploads
- **Notification System**: Alerts users of campaign status changes

## Documentation Resources

- [Usage Guide](./usage.md): How to use the Campaign Wizard
- [Form Validation](./form-validation.md): Validation guidelines and troubleshooting
- [Workflow](./workflow.md): End-to-end wizard workflow

## Related Documentation

- [Database Schema](../../features-backend/database/schema.md)
- [API Endpoints](../../features-backend/apis/endpoints.md) 