# Brand Lift Feature Implementation Plan

## Executive Summary

Based on a thorough analysis of the codebase, the Brand Lift feature has most of its frontend components implemented, but lacks proper backend integration. The feature relies heavily on mock data and has several incomplete API endpoints. This plan outlines a systematic approach to connect the existing frontend with a robust backend implementation, focusing on database models, API endpoints, and data flow.

## Current State Assessment (9/10)

### Frontend Components
- ✅ Main navigation and routing structure is complete
- ✅ Survey design workflows are implemented
- ✅ Survey preview and approval pages exist
- ✅ Progress tracking and reporting UIs are in place
- ✅ Creative asset preview components are functional

### Backend Implementation
- ⚠️ API endpoints exist but many are incomplete
- ⚠️ Most endpoints return mock data (TODOs in code)
- ⚠️ Database connectivity is partial
- ⚠️ Missing proper error handling using the application's standardized patterns
- ⚠️ No data persistence for survey responses

### Data Flow
- ⚠️ Frontend service layer (`brandLiftService.ts`) falls back to mock data
- ⚠️ Survey results aren't properly stored or retrieved
- ⚠️ No authentication/authorization checks in API endpoints
- ⚠️ Missing validation for data submissions
- ⚠️ Mapping functions exist but aren't connected to real data

## Detailed Technical Analysis

### Existing Frontend Architecture

The frontend components are well-structured around a complete survey workflow:

1. **Campaign Selection (`SelectedCampaignContent.tsx`)**: 
   - Allows users to select a campaign for brand lift study
   - Currently uses client-side data fetching with fallback to hard-coded data
   - Missing connection to real API for campaign retrieval

2. **Survey Design (`SurveyDesignContent.tsx`)**:
   - Comprehensive 1,798-line component with drag-and-drop functionality
   - Uses React state for question management
   - Has GIF integration for options
   - Missing server-side persistence of survey design changes

3. **Survey Preview (`SurveyPreviewContent.tsx`)**:
   - Shows how the survey will appear to respondents
   - Implements platform switching (Instagram, TikTok, YouTube)
   - Uses `BrandLiftService` for data but falls back to mock data

4. **Survey Progress Tracking (`BrandLiftProgressContent.tsx`)**:
   - Simple UI for showing collection progress
   - Uses static data instead of real-time metrics
   - Missing connection to actual response collection system

5. **Report Generation (`BrandLiftReportContent.tsx`)**:
   - Shows aggregated survey results
   - Contains chart implementations
   - Uses static data instead of actual response aggregations

### Existing Backend Architecture

1. **API Endpoints**:
   - `/api/brand-lift/survey-preview`: Partially implemented, falls back to mock data
   - `/api/brand-lift/save-draft`: Contains TODO comments, lacks database implementation
   - `/api/brand-lift/change-platform`: Missing database connectivity
   - `/api/brand-lift/update-asset`: Missing database implementation
   - `/api/brand-lift/report`: Stub implementation returning empty data

2. **Data Transformation**:
   - `surveyMappers.ts`: Contains comprehensive mapping logic between campaign data and survey format
   - Functions like `mapCampaignToSurveyData()` and `generateQuestionsFromKPIs()` are implemented
   - Missing connection to actual database retrieval and storage

3. **Database Integration**:
   - No Prisma schema definitions for Brand Lift surveys
   - Application uses standard `db.ts` for database connectivity
   - Missing transaction handling for survey data

4. **API Handling Patterns**:
   - App uses middleware pattern in `middleware/api` directory
   - Standard error handling through `tryCatch` middleware
   - Validation middleware using Zod schemas
   - Brand Lift endpoints aren't fully utilizing these patterns

## Implementation Plan

### Phase 1: Database Schema Enhancement

1. **Update Prisma Schema for Brand Lift**
   - Create `BrandLiftSurvey` model with connections to `CampaignWizardSubmission`
   - Add `SurveyQuestion` and `SurveyOption` models
   - Create `SurveyResponse` model for storing participant answers
   - Add `BrandLiftReport` model for storing aggregated results

   ```prisma
   model BrandLiftSurvey {
     id               Int                     @id @default(autoincrement())
     campaignId       Int
     campaign         CampaignWizardSubmission @relation(fields: [campaignId], references: [id], onDelete: Cascade)
     createdAt        DateTime                @default(now())
     updatedAt        DateTime                @updatedAt
     status           SubmissionStatus        @default(DRAFT)
     questions        SurveyQuestion[]
     activePlatform   Platform                @default(INSTAGRAM)
     availablePlatforms Platform[]
     submissionDate   DateTime?
     responses        SurveyResponse[]
     reports          BrandLiftReport[]
   }
   
   model SurveyQuestion {
     id               Int                     @id @default(autoincrement())
     surveyId         Int
     survey           BrandLiftSurvey         @relation(fields: [surveyId], references: [id], onDelete: Cascade)
     title            String
     kpi              KPI
     type             String                  // "Single Choice" or "Multiple Choice"
     required         Boolean                 @default(true)
     isRandomized     Boolean                 @default(false)
     order            Int                     @default(0)
     options          SurveyOption[]
   }
   
   model SurveyOption {
     id               Int                     @id @default(autoincrement())
     questionId       Int
     question         SurveyQuestion          @relation(fields: [questionId], references: [id], onDelete: Cascade)
     text             String
     imageUrl         String?
     order            Int                     @default(0)
   }
   
   model SurveyResponse {
     id               Int                     @id @default(autoincrement())
     surveyId         Int
     survey           BrandLiftSurvey         @relation(fields: [surveyId], references: [id], onDelete: Cascade)
     responseData     Json                    // Stores question ID to selected option IDs
     respondentId     String?                 // For tracking unique respondents
     platform         Platform                // Platform where response was collected
     createdAt        DateTime                @default(now())
     demographics     Json?                   // Optional demographic information
     completionTime   Int?                    // Time in seconds to complete
   }
   
   model BrandLiftReport {
     id               Int                     @id @default(autoincrement())
     surveyId         Int
     survey           BrandLiftSurvey         @relation(fields: [surveyId], references: [id], onDelete: Cascade)
     generatedAt      DateTime                @default(now())
     reportData       Json                    // Aggregated metrics by KPI
     status           String                  @default("active")
     kpiResults       Json                    // Results broken down by KPI
     demographicResults Json?                 // Results broken down by demographics
   }
   ```

2. **Run Database Migrations**
   - Generate Prisma migration
   - Apply migration to development database
   - Update Prisma client
   - Create database seed data for testing

### Phase 2: API Endpoint Implementation

1. **Survey Preview API (`/api/brand-lift/survey-preview`)**
   - Complete the existing implementation
   - Add database connectivity to fetch real survey data
   - Create proper mapping between campaign data and survey preview format
   - Implement error handling using `tryCatch` middleware
   - Add validation using Zod schemas and `withValidation` middleware

   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { z } from 'zod';
   import { SurveyPreviewData } from '@/types/brandLift';
   import { Platform, KPI, CreativeAssetType } from '@prisma/client';
   import { connectToDatabase, prisma } from '@/lib/db';
   import { mapCampaignToSurveyData } from '@/utils/surveyMappers';
   import { tryCatch, withValidation } from '@/middleware/api';
   import { DbOperation } from '@/lib/data-mapping/db-logger';

   // Create a Zod schema for request validation
   const requestSchema = z.object({
     id: z.string().min(1)
   });

   export const GET = withValidation(
     requestSchema,
     async (data, request: NextRequest) => {
       return tryCatch(
         async () => {
           await connectToDatabase();
           const id = parseInt(data.id);
           
           // Get the campaign data
           const campaign = await prisma.campaignWizardSubmission.findUnique({
             where: { id },
             include: {
               primaryContact: true,
               audience: true,
               creativeAssets: true
             }
           });
           
           if (!campaign) {
             return NextResponse.json(
               { error: 'Campaign not found' },
               { status: 404 }
             );
           }
           
           // Check if a survey already exists for this campaign
           let survey = await prisma.brandLiftSurvey.findFirst({
             where: { campaignId: id },
             include: {
               questions: {
                 include: {
                   options: true
                 },
                 orderBy: { order: 'asc' }
               }
             }
           });
           
           // If not, create a new survey with default questions based on KPIs
           if (!survey) {
             survey = await createSurveyFromCampaign(campaign);
           }
           
           // Map database models to frontend API response format
           const surveyData = mapSurveyToApiResponse(survey, campaign);
           
           return NextResponse.json(surveyData);
         },
         { entityName: 'BrandLiftSurvey', operation: DbOperation.FETCH }
       );
     },
     { entityName: 'BrandLiftSurvey' }
   );
   ```

2. **Save Draft API (`/api/brand-lift/save-draft`)**
   - Implement database connectivity for saving survey drafts
   - Add validation for submitted data using Zod schema
   - Implement transaction handling for atomic operations
   - Add comprehensive error handling
   - Handle concurrent edit cases

3. **Change Platform API (`/api/brand-lift/change-platform`)**
   - Update database to store active platform selection
   - Add validation for platform changes
   - Ensure platform-specific asset relationships
   - Implement permission checks

4. **Update Asset API (`/api/brand-lift/update-asset`)**
   - Implement asset selection changes in database
   - Add validation for asset updates
   - Implement file type and size validation
   - Connect with existing asset storage

5. **Report Generation API (`/api/brand-lift/report`)**
   - Implement result aggregation from survey responses
   - Create performance metrics calculation based on KPIs
   - Add filtering and sorting capabilities
   - Implement caching for performance
   - Add export functionality

6. **Survey Response Collection API (`/api/brand-lift/respond`)**
   - Create new endpoint for collecting survey responses
   - Add validation for response data
   - Implement storage in database
   - Add rate limiting to prevent abuse
   - Implement fraud detection for survey responses

### Phase 3: Service Layer Enhancements

1. **Update Brand Lift Service**
   - Remove mock data reliance
   - Improve error handling
   - Add better typing and validation
   - Implement exponential backoff for API calls
   - Add caching for performance

   ```typescript
   // Example of updating getSurveyPreviewData method
   public async getSurveyPreviewData(campaignId: string): Promise<SurveyPreviewData> {
     try {
       const cacheKey = `survey_preview_${campaignId}`;
       
       // Check cache first
       const cachedData = this.cache.get(cacheKey);
       if (cachedData) {
         return cachedData as SurveyPreviewData;
       }
       
       // If not in cache, fetch from API
       const response = await fetch(`${this.baseUrl}/survey-preview?id=${campaignId}`, {
         headers: await this.getAuthHeaders(),
       });
       
       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(
           `API error: ${response.status}. ${errorData.error || 'Unknown error'}`
         );
       }
       
       const data = await response.json();
       const validData = this.ensureValidSurveyData(data, campaignId);
       
       // Store in cache for 5 minutes
       this.cache.set(cacheKey, validData, 300);
       
       return validData;
     } catch (error) {
       this.logger.error('Failed to fetch survey preview data:', error);
       throw error;
     }
   }
   ```

2. **Data Transformation Utilities**
   - Enhance existing mapping functions to handle new database models
   - Implement bidirectional mapping (DB ↔ API ↔ UI)
   - Add validation for all data transformations
   - Improve type safety with more specific TypeScript types
   - Add unit tests for data transformation

3. **Authentication Integration**
   - Integrate with the existing Auth system (Auth0 according to file structure)
   - Add role-based permissions for survey operations
   - Implement JWT validation in API routes
   - Add secure survey sharing capabilities

### Phase 4: Frontend Connectivity

1. **Remove Mock Data Fallbacks**
   - Update components to handle loading states with skeleton UI
   - Add error handling for API failures
   - Implement retry logic where appropriate
   - Add detailed error messages for users

2. **Survey Design Workflow**
   - Connect form submissions to API endpoints
   - Implement autosave functionality
   - Add validation for required fields
   - Implement optimistic UI updates for better UX

3. **Survey Preview Integration**
   - Update to use real platform and asset data
   - Connect platform switcher to database changes
   - Implement responsive previews for all platforms
   - Add shareable preview links

4. **Progress Tracking**
   - Connect to real response data
   - Implement real-time updates for new responses
   - Add filtering capabilities for response data
   - Create exportable progress reports

5. **Reporting Dashboard**
   - Connect charts to real survey data
   - Implement export functionality (PDF, CSV)
   - Add comparison capabilities between campaigns
   - Create benchmark visualizations

### Phase 5: Testing and Validation

1. **Unit Tests**
   - Create tests for all API endpoints
   - Test data transformation utilities
   - Validate error handling
   - Test permissions and authentication

2. **Integration Tests**
   - Test workflow from survey creation to report generation
   - Validate data integrity across the system
   - Test edge cases and error recovery
   - Test performance under load

3. **End-to-End Tests**
   - Create test scenarios for complete user journeys
   - Verify frontend and backend integration
   - Test performance under load
   - Validate mobile responsiveness

### Phase 6: Deployment and Monitoring

1. **Staged Rollout**
   - Deploy to testing environment
   - Validate with sample data
   - Monitor performance and errors
   - Gather early user feedback

2. **Analytics Integration**
   - Add tracking for feature usage
   - Monitor API performance
   - Set up alerting for errors
   - Create dashboard for survey completion rates

3. **Documentation**
   - Create API documentation using OpenAPI
   - Update user guides with new features
   - Document database schema
   - Create architectural diagrams

## Implementation Priorities

1. **Database Schema Enhancement** - Foundational for all other work
2. **Core API Endpoints** - Survey preview, save draft, and response collection
3. **Service Layer Enhancements** - Remove mock data dependencies
4. **Frontend Connectivity** - Update components to use real API data
5. **Reporting Functionality** - Connect reporting dashboard to real data
6. **Testing and Validation** - Ensure reliability across the system

## Technical Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data model changes affect existing campaigns | High | Create migration script to preserve existing data |
| Performance issues with large response datasets | Medium | Implement pagination and optimized queries, add caching |
| Inconsistent frontend behavior after removing mock data | High | Create comprehensive test suite for UI flows |
| API failures affecting user experience | Medium | Implement graceful error handling and retry logic |
| Survey data integrity issues | High | Add validation at every data entry point |
| Authentication integration issues | Medium | Leverage existing auth patterns from other authenticated routes |
| Scalability concerns with high survey volume | Medium | Implement database indexing and query optimization |

## Integration Points with Existing Systems

1. **Campaign Management System**
   - Integrate with `CampaignService` for campaign data
   - Use existing campaign validation logic
   - Leverage campaign permissions model

2. **Asset Management**
   - Connect with existing asset storage system
   - Reuse file upload components and validation
   - Maintain consistency with asset management workflow

3. **Authentication/Authorization**
   - Use existing auth middleware
   - Inherit role-based permissions model
   - Implement feature-specific permissions

4. **Analytics Integration**
   - Connect with existing analytics tracking
   - Add custom events for survey interactions
   - Create conversion funnel for survey completion

## Success Metrics

- Zero frontend components relying on mock data
- Complete data flow from survey creation to reporting
- All API endpoints returning proper responses with real data
- Ability to collect and analyze survey responses
- Reliable report generation with accurate metrics
- Performance benchmarks met (response time < 200ms for API calls)
- Successful integration with existing campaign management
- Consistent adherence to application architecture patterns

This implementation plan systematically addresses the gaps between the existing frontend components and backend functionality, ensuring a robust and reliable Brand Lift feature that integrates seamlessly with the rest of the application.
