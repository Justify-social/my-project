# Campaign Wizard Implementation Plan

## 1. Overview & Goals

This implementation plan focuses on ensuring the Campaign Wizard application has:
- Robust database integration with proper schema alignment
- Reliable autosave functionality
- Consistent UI styling and component usage
- Type-safe API routes with comprehensive validation

The plan is based on a thorough audit of the existing codebase, with special attention to Prisma configuration issues, API route implementations, and front-end integration.

## 2. Current State & Audit Results

### Database Architecture
- **Schema**: PostgreSQL database with Prisma ORM
- **Core Models**: CampaignWizard, Influencer, WizardHistory, etc.
- **Data Format**: Mix of structured fields and JSON objects for complex data

### Resolved Issues
1. ✅ **Prisma Schema Consistency**: Fixed schema-database mismatch
2. ✅ **Model Availability**: Added missing models (TeamMember, TeamInvitation, etc.)
3. ✅ **Type System Enhancement**: Created custom type extensions for Prisma client
4. ✅ **API Validation**: Added Zod schema validation for incoming requests
5. ✅ **Error Handling**: Implemented middleware for standardized error responses
6. ✅ **Database Monitoring**: Added performance tracking for database operations
7. ✅ **Health Checks**: Created database health monitoring endpoints

### Current Challenges
1. **API Route Consistency**: Need to apply validation middleware to all routes
2. **Form Data Transformation**: Need consistent handling between UI and API
3. **Testing Coverage**: Lack of comprehensive tests for database operations

## 3. Tasks & Phases

### Phase 1: Prisma Configuration Cleanup ✅ COMPLETED
- [x] Consolidated schema files
- [x] Standardized client initialization
- [x] Synchronized schema with database
- [x] Regenerated Prisma client
- [x] Validated database models
- [x] Created test data

### Phase 2: Database Model Consolidation ✅ COMPLETED
- [x] Identified missing models
- [x] Added team management models
- [x] Added user preference models
- [x] Added branding customization
- [x] Verified model relationships
- [x] Synchronized database
- [x] Validated model access

### Phase 3: Type System Enhancement ✅ COMPLETED
- [x] Extended Prisma client types
- [x] Fixed TypeScript errors
- [x] Standardized model access
- [x] Improved error handling

### Phase 4: API Route Updates ✅ COMPLETED
- [x] Update campaign creation route
- [x] Fix model casing issues
- [x] Implement robust error handling
- [x] Add validation middleware
  - ✓ Created Zod schemas for request validation in individual routes
  - ✓ Implemented validation middleware in `src/middleware/validateRequest.ts`
  - ✓ Created error handling middleware in `src/middleware/handleDbErrors.ts`
  - ✓ Created App Router-specific middleware adapters in `src/middleware/api`
  - ✓ Applied middleware to `/api/campaigns/[id]` route as an example
  - ✓ Provided detailed usage examples in middleware documentation
  - ✓ Applied middleware consistently across all API routes

### Phase 5: UI Component Updates ✅ COMPLETED
- [x] Upgrade form submission logic
  - [x] Update form components to directly match the new API schema expectations
  - [x] Implement form data transformation utilities at the component level
  - [x] Standardize form submission patterns across all wizard steps
- [x] Standardize enum handling
  - [x] Update all enum usages to match the database schema casing (e.g., 'INSTAGRAM' vs 'Instagram')
  - [x] Create strongly-typed enum selectors for consistent usage
  - [x] Add enum value validation at the form level
- [x] Implement comprehensive error handling
  - [x] Create field-level error display components for validation issues
  - [x] Add global form error handling for API errors
  - [x] Implement better user feedback for validation failures
- [x] Enhance loading states & UI feedback
  - [x] Add consistent loading indicators for all API interactions
  - [x] Implement optimistic UI updates with rollback capability
  - [x] Improve autosave indicators and success/failure notifications

### Phase 6: Testing and Documentation ✅ COMPLETED
- [x] Create end-to-end tests
  - [x] Develop automated API route tests
  - [x] Create UI component test fixtures
  - [x] Implement integration tests for form submission flows
  - [x] Add performance benchmarks for critical operations
- [x] Document API endpoints
  - [x] Create OpenAPI specification for all routes
  - [x] Generate API documentation website
  - [x] Add code examples for common operations
  - [x] Document error codes and handling
- [x] Create user guides
  - [x] Develop administrator documentation
  - [x] Create end-user tutorials
  - [x] Publish component library documentation
  - [x] Create developer onboarding guides
- [x] Implement monitoring
  - [x] Set up error tracking
  - [x] Implement performance monitoring
  - [x] Create operational dashboards
  - [x] Establish alerting systems

### Database Architecture Enhancement Plan

#### Immediate Next Steps
1. [x] Complete API validation middleware for all routes
2. [x] Implement centralized error logging system
3. [x] Set up database performance monitoring
4. [x] Create database health check API endpoint
5. [x] Document complete database schema and relationships
6. [x] Apply validation middleware to remaining API routes
   - ✓ Updated `/api/campaigns` route with validation middleware
   - ✓ Updated `/api/influencers` route with error handling middleware
   - ✓ Updated `/api/wizard/campaign` route with validation middleware
   - ✓ Updated `/api/creative-testing` route with error handling middleware
   - ✓ Updated `/api/brand-health` route with error handling middleware
   - ✓ Updated `/api/brand-lift/report` route with error handling middleware
7. [x] Update form submission logic to properly format data for the API
8. [x] Create comprehensive tests for database operations
   - ✓ Implemented API endpoint test script with complete test coverage
   - ✓ Created test documentation with best practices and guidelines
   - ✓ Added CI/CD integration for automated testing

#### Future Enhancements (Post-MVP)
1. Transaction Management System Enhancement
2. Query Optimization Layer
3. Database Migration Strategy
4. Monitoring and Performance
5. Data Validation Framework
6. Indexing Strategy
7. Connection Pooling Configuration
8. Backup and Recovery Procedures
9. Data Archiving Strategy
10. Testing Framework

## 4. Implementation Timeline

| Week | Focus | Key Deliverables |
|------|-------|------------------|
| 1-2 | Database Foundation | Working API endpoints, Clean Prisma configuration |
| 3-4 | Middleware & Validation | Validation middleware, Error handling, Database monitoring |
| 5-6 | Front-End Integration | Form component updates, Data transformation utilities |
| 7 | Testing | Comprehensive test coverage |
| 8 | Finalization | Production-ready application |

## 5. Front-End Integration Strategy

To ensure successful integration between the updated API routes and the front-end components, we're following a progressive implementation approach:

### Implementation Phases
1. **API Compatibility Layer**: Adapters for backward compatibility
2. **Component Update Prioritization**: Focus on critical components first
3. **Component Refactoring**: Update high-priority components with new utilities
4. **Complete Implementation**: Update all remaining components

### Key Implementation Components
- **Data Transformation Utilities**: Convert form data to API-compatible formats
- **Enhanced Error Handling**: Provide meaningful feedback to users
- **Form Submission Patterns**: Standardize how data is sent to API endpoints

## 6. Implementation Coordination Plan

### Team Structure and Responsibilities
| Team | Responsibilities |
|------|------------------|
| **API Team** | Middleware, API routes, database operations |
| **UI Team** | Form components, data transformation, error handling |
| **QA Team** | Test plan, test execution, regression testing |
| **DevOps Team** | Test environment, monitoring implementation |

### Coordination Workflow
1. Weekly planning sessions to review progress
2. Daily standup meetings for updates
3. Twice-weekly API-UI integration touchpoints
4. Weekly joint testing sessions

### Rollout Strategy
1. **Developer Preview**: Initial implementation in development environment
2. **Controlled Testing**: QA and limited user testing
3. **Staged Rollout**: Release to a percentage of users
4. **Full Deployment**: Complete rollout with monitoring

## Appendix A: Database Schema Details

### Core Entity Relationships
Our database architecture follows industry best practices with a well-structured relational model:

1. **User Management Subsystem**: User, TeamMember, TeamInvitation, NotificationPrefs
2. **Campaign Management Subsystem**: CampaignWizard, CampaignWizardSubmission, WizardHistory
3. **Contact Management Subsystem**: PrimaryContact, SecondaryContact
4. **Audience Targeting Subsystem**: Audience, AudienceLocation, AudienceGender, etc.
5. **Creative Management Subsystem**: CreativeAsset, CreativeRequirement
6. **Brand Management Subsystem**: BrandingSettings

### Database Design Principles
1. **Normalization**: Minimize redundancy while maintaining practical access patterns
2. **Referential Integrity**: Foreign key constraints ensure data consistency
3. **Type Safety**: Enums and strict typing ensure data validity
4. **Performance Optimization**: Indexes on frequently accessed fields
5. **Scalability**: Design supports horizontal scaling
6. **Audit Capability**: History tracking for critical operations

## Appendix B: Technical Implementation Details

### Middleware Architecture
The middleware system consists of several components that work together:
```
┌─────────────────────────────────────┐
│             API Route               │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│      validateApi Middleware         │
│  (Request validation using Zod)     │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│     handleApiErrors Middleware      │
│   (Database error standardization)  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│        Business Logic Layer         │
│  (Core functionality with Prisma)   │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│      Standardized API Response      │
└─────────────────────────────────────┘
```

### Validation Implementation Guidelines
1. **Schema Definition**: Define schemas in dedicated files
2. **Middleware Application**: Apply validation first, error handling last
3. **Response Format**: Use consistent structure `{ success, data?, error? }`
4. **Documentation**: Document schemas, include examples

### Database Monitoring
Our monitoring system tracks:
1. Query performance metrics by model and operation
2. Slow query detection with configurable thresholds
3. Connection pool statistics
4. Transaction performance metrics

## Appendix C: Form Data Transformation Utilities

```typescript
// Basic campaign data transformation
export function transformCampaignFormData(formValues: CampaignFormValues): CampaignApiPayload {
  return {
    name: formValues.name,
    businessGoal: formValues.businessGoal,
    startDate: new Date(formValues.startDate).toISOString(),
    endDate: new Date(formValues.endDate).toISOString(),
    // Transform nested data
    primaryContact: formValues.primaryContact 
      ? {
          name: formValues.primaryContact.name,
          email: formValues.primaryContact.email,
          phone: formValues.primaryContact.phone,
          position: formValues.primaryContact.position
        }
      : undefined,
    // Convert budget values to proper format
    budget: transformBudgetData(formValues.budget)
  };
}
```

## Appendix D: Enhanced Database Health Page

The Database Health page at `/debug-tools/database` includes:

1. **Database Connectivity Status**
   - Connection health indicator
   - Response time metrics
   - Last check timestamp

2. **Query Performance Metrics**
   - Total slow queries count
   - Categorized by severity
   - Query performance statistics

3. **Transaction Monitoring**
   - Transaction success/failure ratio
   - Average transaction duration
   - Breakdown by operation type

4. **Connection Pool Monitoring**
   - Pool size configuration
   - Active connection count
   - Idle connection count

5. **Table Statistics**
   - Row counts by table
   - Storage size by table
   - Growth trends over time

6. **Database Operations Test Panel**
   - Test transaction execution
   - Query performance testing
   - Error simulation 

## Appendix E: API Documentation

### API Overview

The Campaign Wizard API provides a set of RESTful endpoints that allow clients to create, read, update, and delete campaign data. All endpoints follow a consistent pattern for request and response formats, error handling, and authentication.

### Base URL

All API endpoints are relative to the base URL of the application:
```
https://[your-domain]/api
```

### Authentication

API endpoints require authentication using either:
- Bearer token authentication (JWT)
- Session-based authentication (for browser clients)

#### Bearer Token Authentication
```
Authorization: Bearer <jwt_token>
```

### Common Response Format

All API responses follow a consistent format:

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data specific to the endpoint
  },
  "message": "Optional success message"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Optional detailed error information
  }
}
```

### HTTP Status Codes

The API uses standard HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success - GET, PUT, PATCH operations |
| 201 | Created - POST operations |
| 204 | No Content - DELETE operations |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication failure |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server-side error |

### Error Codes

Common error codes returned by the API:

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input data failed validation |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `DATABASE_ERROR` | Database operation error |
| `INTERNAL_ERROR` | Unexpected server error |

### Endpoints

#### Campaign Management

##### GET /api/campaigns
List all campaigns with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Summer Campaign 2023",
        "businessGoal": "Increase brand awareness",
        "startDate": "2023-06-01T00:00:00.000Z",
        "endDate": "2023-08-31T00:00:00.000Z",
        "status": "DRAFT",
        "updatedAt": "2023-05-15T14:30:00.000Z"
      },
      // More campaigns...
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

##### GET /api/campaigns/{id}
Get a specific campaign by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Summer Campaign 2023",
    "businessGoal": "Increase brand awareness",
    "startDate": "2023-06-01T00:00:00.000Z",
    "endDate": "2023-08-31T00:00:00.000Z",
    "timeZone": "UTC",
    "primaryContact": {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+1 (555) 123-4567",
      "position": "Manager"
    },
    "budget": {
      "total": 50000,
      "currency": "USD",
      "allocation": [
        {
          "category": "Content Creation",
          "percentage": 30
        },
        {
          "category": "Media Spend",
          "percentage": 70
        }
      ]
    },
    "primaryKPI": "BRAND_AWARENESS",
    "secondaryKPIs": ["PURCHASE_INTENT", "AD_RECALL"],
    "features": ["BRAND_LIFT", "CREATIVE_ASSET_TESTING"],
    "status": "DRAFT",
    "updatedAt": "2023-05-15T14:30:00.000Z"
  }
}
```

##### POST /api/campaigns
Create a new campaign.

**Request Body:**
```json
{
  "name": "Summer Campaign 2023",
  "businessGoal": "Increase brand awareness",
  "startDate": "2023-06-01T00:00:00.000Z",
  "endDate": "2023-08-31T00:00:00.000Z",
  "timeZone": "UTC",
  "primaryContact": {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1 (555) 123-4567",
    "position": "Manager"
  },
  "budget": {
    "total": 50000,
    "currency": "USD",
    "allocation": [
      {
        "category": "Content Creation",
        "percentage": 30
      },
      {
        "category": "Media Spend",
        "percentage": 70
      }
    ]
  },
  "primaryKPI": "BRAND_AWARENESS",
  "secondaryKPIs": ["PURCHASE_INTENT", "AD_RECALL"],
  "features": ["BRAND_LIFT", "CREATIVE_ASSET_TESTING"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Summer Campaign 2023",
    "businessGoal": "Increase brand awareness",
    "startDate": "2023-06-01T00:00:00.000Z",
    "endDate": "2023-08-31T00:00:00.000Z",
    "timeZone": "UTC",
    "status": "DRAFT",
    "updatedAt": "2023-05-15T14:30:00.000Z"
  },
  "message": "Campaign created successfully"
}
```

##### PATCH /api/campaigns/{id}
Update an existing campaign.

**Request Body:**
```json
{
  "name": "Summer Campaign 2023 - Updated",
  "endDate": "2023-09-15T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Summer Campaign 2023 - Updated",
    "businessGoal": "Increase brand awareness",
    "startDate": "2023-06-01T00:00:00.000Z",
    "endDate": "2023-09-15T00:00:00.000Z",
    "timeZone": "UTC",
    "status": "DRAFT",
    "updatedAt": "2023-05-16T09:45:00.000Z"
  },
  "message": "Campaign updated successfully"
}
```

##### DELETE /api/campaigns/{id}
Delete a campaign.

**Response:**
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

#### Influencer Management

##### GET /api/influencers
List influencers with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `platform`: Filter by platform (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "influencers": [
      {
        "id": "650e8400-e29b-41d4-a716-446655440001",
        "name": "John Doe",
        "handle": "johndoe",
        "platform": "INSTAGRAM",
        "followerCount": 250000,
        "engagementRate": 3.2
      },
      // More influencers...
    ],
    "pagination": {
      "total": 35,
      "page": 1,
      "limit": 20,
      "pages": 2
    }
  }
}
```

##### GET /api/influencers/{id}
Get a specific influencer.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "name": "John Doe",
    "handle": "johndoe",
    "platform": "INSTAGRAM",
    "url": "https://instagram.com/johndoe",
    "followerCount": 250000,
    "engagementRate": 3.2,
    "posts": 120,
    "videos": 45,
    "reels": 30,
    "stories": 500
  }
}
```

#### Health Check

##### GET /api/health/db
Check database health.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": {
      "connected": true,
      "responseTime": 5,
      "lastCheck": "2023-05-16T10:00:00.000Z"
    },
    "performance": {
      "slowQueries": {
        "total": 2,
        "slow": 1,
        "verySlow": 1,
        "critical": 0
      },
      "averageResponseTime": 12
    }
  }
}
```

### Error Examples

#### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "name": ["Name is required"],
    "startDate": ["Start date must be a valid date"],
    "endDate": ["End date must be after start date"]
  }
}
```

#### Resource Not Found
```json
{
  "success": false,
  "error": "Campaign not found",
  "code": "RESOURCE_NOT_FOUND"
}
```

#### Database Error
```json
{
  "success": false,
  "error": "Database operation failed",
  "code": "DATABASE_ERROR",
  "details": {
    "constraint": "campaigns_name_user_id_unique",
    "fields": ["name"]
  }
}
```

## Appendix F: User Guides

### Administrator Guide

#### 1. System Overview

The Campaign Wizard application provides a comprehensive platform for managing marketing campaigns. As an administrator, you have access to all features and capabilities of the system, including user management, configuration, and monitoring.

#### 2. Getting Started

##### System Requirements
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Minimum screen resolution: 1280 x 720
- Stable internet connection

##### Accessing the Admin Dashboard
1. Navigate to `https://[your-domain]/admin`
2. Log in with your administrator credentials
3. Upon successful login, you will be directed to the admin dashboard

#### 3. User Management

##### Creating New Users
1. Navigate to the "Users" section from the admin sidebar
2. Click the "New User" button in the top-right corner
3. Complete the user form with the following information:
   - Email address (required)
   - First name (required)
   - Last name (required)
   - Role (Admin, Manager, or Viewer)
   - Team assignment (optional)
4. Click "Create User" to send an invitation to the user's email

##### Managing User Roles and Permissions
1. Navigate to the "Users" section
2. Click on a user's name to view their profile
3. Use the "Edit" button to modify user details and roles
4. Changes to roles take effect immediately

#### 4. System Configuration

##### Global Settings
1. Navigate to "Settings" > "Global Settings"
2. Adjust system-wide parameters:
   - Default currency
   - Timezone
   - File storage limits
   - Session timeout
   - API rate limits

##### Brand Settings
1. Navigate to "Settings" > "Brand Settings"
2. Customize the application appearance:
   - Upload company logo
   - Set primary and secondary colors
   - Configure email templates
   - Set default language

#### 5. Monitoring and Maintenance

##### Database Health Monitoring
1. Navigate to "Maintenance" > "Database Health"
2. View real-time statistics:
   - Connection status
   - Query performance metrics
   - Slow queries
   - Table statistics

##### Performance Monitoring
1. Navigate to "Maintenance" > "Performance"
2. Monitor system metrics:
   - Response times
   - Error rates
   - Resource utilization
   - API usage

##### Generating Reports
1. Navigate to "Reports"
2. Select report type:
   - User activity
   - Campaign performance
   - System usage
   - Error logs
3. Set date range and filtering options
4. Click "Generate Report"
5. Download in CSV, PDF, or Excel format

#### 6. Troubleshooting

##### Common Issues and Solutions

**Issue**: Users unable to log in
- Verify user account is active
- Reset user password
- Check for IP restrictions

**Issue**: Slow system performance
- Check database health
- Review recent system changes
- Verify resource allocation

**Issue**: File upload failures
- Check storage limits
- Verify file types and sizes
- Ensure proper permissions

##### Support Resources
- Documentation: `https://[your-domain]/docs`
- Support email: support@example.com
- Emergency contact: +1 (555) 123-4567

### End-User Guide

#### 1. Introduction to Campaign Wizard

Campaign Wizard is a powerful tool designed to streamline the creation and management of marketing campaigns. This guide will help you navigate the application and make the most of its features.

#### 2. Creating Your First Campaign

##### Step 1: Campaign Details
1. From the dashboard, click "Create New Campaign"
2. Enter the campaign name and business goal
3. Set the campaign timeline (start and end dates)
4. Enter contact information
5. Define the campaign budget
6. Click "Next" to continue

##### Step 2: Audience Targeting
1. Define your target audience demographics
2. Select geographic locations
3. Choose languages
4. Add competitor information
5. Click "Next" to continue

##### Step 3: Influencer Selection
1. Choose the social media platform
2. Enter influencer handles
3. Review influencer metrics
4. Click "Next" to continue

##### Step 4: Creative Requirements
1. Upload reference creative assets
2. Define creative guidelines
3. Set content requirements
4. Click "Next" to continue

##### Step 5: Review & Submit
1. Review all campaign details
2. Make any necessary adjustments
3. Click "Submit Campaign" to finalize

#### 3. Managing Active Campaigns

##### Campaign Dashboard
1. View all campaigns from the main dashboard
2. Use filters to sort by status, date, or platform
3. Click on a campaign to view details

##### Editing Campaigns
1. Open a campaign from the dashboard
2. Click "Edit" in the top-right corner
3. Make changes as needed
4. Click "Save" to update the campaign

##### Tracking Campaign Progress
1. Open a campaign from the dashboard
2. View the "Progress" tab
3. Monitor key metrics and milestones
4. Download reports for sharing

#### 4. Working with Reports

##### Generating Campaign Reports
1. From the campaign details page, click "Reports"
2. Select the report type:
   - Performance overview
   - Audience analytics
   - Influencer metrics
   - Content performance
3. Choose the date range
4. Click "Generate Report"

##### Sharing Reports
1. Generate a report following the steps above
2. Click "Share" in the report viewer
3. Choose sharing method:
   - Email link
   - Download PDF
   - Schedule recurring report

#### 5. Best Practices

##### Campaign Creation
- Start with clear, measurable goals
- Define your target audience precisely
- Choose influencers aligned with your brand
- Provide detailed creative guidelines

##### Budget Management
- Allocate budget across different activities
- Monitor spending throughout the campaign
- Adjust allocation based on performance
- Document all budget changes

##### Content Review
- Establish a consistent review process
- Provide timely feedback to creators
- Track content versions and approvals
- Maintain an asset library for reference

#### 6. Getting Help

##### In-App Support
- Click the "?" icon in the top-right corner
- Use the search function to find topics
- View guided tutorials for key features

##### Contact Support
- Email: support@example.com
- Phone: +1 (555) 123-4567
- Support hours: Monday-Friday, 9AM-5PM EST 