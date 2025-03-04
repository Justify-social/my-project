# Campaign Wizard Enhancement Plan

## Goals
1. Make the Campaign Wizard more on-brand with global.css
2. Add autosave feature / Implement data persistence improvements
3. Verify external APIs are working effectively
4. Ensure data is being correctly saved at every step (especially step 4)
5. Add options for additional contacts on Step 1
6. Make the wizard more robust with additional enhancements

## Plan of Attack

### 1. UI Brand Alignment
- Review `global.css` to identify brand colors, typography, and styling patterns
- Update each step component to ensure consistent use of brand styling
- Review components for responsive behavior and accessibility
- Focus on consistency across all wizard steps

### 2. Autosave & Data Persistence
- ✅ Implement a debounced autosave function that triggers after user interaction pauses
- ✅ Add a last saved indicator to show users when their progress was last saved
- ✅ Implement browser storage (localStorage/sessionStorage) as a backup for form data
- ✅ Ensure clean recovery if user navigates away and returns
- ✅ Add ability to resume from last saved step

### 3. API Integration Verification
- Test the IP Geolocation API integration for timezone detection
- Verify Exchange Rates API functionality for currency conversion
- Test Phyllo API integration for influencer data
- Ensure all APIs have proper error handling and fallbacks

### 4. Data Saving Verification
- ✅ Review Step 4 implementation to identify potential saving issues
- ✅ Add comprehensive logging for save operations
- ✅ Implement validation to ensure data integrity at each step
- ✅ Test save functionality with various input combinations
- ✅ Ensure all form fields are properly mapped to database fields

### 5. Additional Contacts Feature
- ✅ Modifying Step 1 UI to support variable number of contacts
- ✅ Update database schema if needed to support multiple contacts
- ✅ Implement add/remove functionality for contact entries
- ✅ Ensure backend API can handle multiple contacts

### 6. Robustness Enhancements
- ✅ Add form state preservation between sessions
- ✅ Implement comprehensive error recovery
- Add progress indicators showing completion status across steps
- Create a "review all" option before final submission
- Add data export functionality
- Implement a wizard recovery system in case of unexpected errors
- Add analytics to track user progression and drop-off points

## Implementation Order
1. ✅ Verify data saving (especially Step 4) as the highest priority
2. ✅ Add autosave functionality
3. ✅ Implement additional contacts feature
4. 🔄 API verification (In Progress)
5. UI brand alignment
6. Additional robustness enhancements

## Progress Updates

### Completed Tasks
- ✅ Enhanced Step 4 with better validation, error handling, and data saving
- ✅ Implemented autosave functionality with debounce to prevent excessive API calls
- ✅ Added last saved indicator to the ProgressBar component
- ✅ Improved form data persistence using localStorage as a backup
- ✅ Added error recovery with fallback to cached data
- ✅ Updated API route handlers to support additional contacts
- ✅ Modified database schema to store contacts as JSON in the contacts field
- ✅ Implemented validation schema for additional contacts in Step 1
- ✅ Added functionality to add/remove contact entries dynamically
- ✅ Implemented localStorage backup for additional contacts

### Next Steps
1. Finalize UI for additional contacts feature in Step 1
2. Add comprehensive testing for the contacts feature
3. Verify external API integrations are working correctly
4. Update UI styling to match global.css
5. Implement additional robustness enhancements

### Current Status
- 🔍 Identified critical data persistence issues through debug tools verification
- ⚠️ Found major gaps in data storage for Campaign ID 13, particularly in:
  - Objectives data (Step 2) - missing despite user completion
  - Audience data (Step 3) - null despite user completion
  - Creative Assets (Step 4) - empty arrays despite user completion
- 🔄 Updated admin panel UI and implemented campaign debug tools

## Data Persistence Fix Plan - Schema-Aware Steps

After analyzing Campaign ID 13 data and reviewing our Prisma schema, we've identified systematic issues with data persistence across relational tables. Here's our detailed fix plan:

### STEP 1: Map Database Schema to Form Fields
1. Create a complete field mapping between wizard forms and database tables:
   - CampaignWizardSubmission (main table)
   - Audience, AudienceLocation, AudienceGender, etc.
   - CreativeAsset and related tables
2. Identify gaps in field mapping that could cause data loss
3. Document all required fields vs. optional fields based on schema

### STEP 2: Update Main Campaign PATCH Endpoint
1. Open `/api/campaigns/[id]/route.ts`
2. Update the updateData object to match CampaignWizardSubmission schema:
   ```typescript
   const updateData = {
     campaignName: body.name,
     description: body.businessGoal,
     startDate: body.startDate,
     endDate: body.endDate,
     timeZone: body.timeZone,
     contacts: JSON.stringify(body.contacts), // Using existing JSON field
     currency: body.currency,
     totalBudget: parseFloat(body.budget?.total),
     socialMediaBudget: parseFloat(body.budget?.socialMedia),
     platform: body.platform,
     mainMessage: body.mainMessage,
     hashtags: body.hashtags,
     memorability: body.memorability,
     // All other fields from schema...
   };
   ```
3. Add logging before and after database operations
4. Implement proper error handling with specific error messages

### STEP 3: Implement Prisma Transaction-Based Updates
1. Modify the database update logic to use Prisma transactions
2. Handle all related tables within the same transaction:
   ```typescript
   await prisma.$transaction(async (tx) => {
     // 1. Update main CampaignWizardSubmission record
     const updatedCampaign = await tx.campaignWizardSubmission.update({
       where: { id: campaignId },
       data: campaignUpdateData,
     });
     
     // 2. Handle Audience table relation (upsert operation)
     if (body.audience) {
       const existingAudience = await tx.audience.findFirst({
         where: { campaignId: campaignId }
       });
       
       const audienceData = {
         campaignId: campaignId,
         age1824: body.audience.demographics?.ageRange?.includes('18-24') || false,
         age2534: body.audience.demographics?.ageRange?.includes('25-34') || false,
         age3544: body.audience.demographics?.ageRange?.includes('35-44') || false,
         age4554: body.audience.demographics?.ageRange?.includes('45-54') || false,
         age55plus: body.audience.demographics?.ageRange?.includes('55+') || false,
         // Other audience fields from schema...
       };
       
       if (existingAudience) {
         await tx.audience.update({
           where: { id: existingAudience.id },
           data: audienceData,
         });
       } else {
         await tx.audience.create({
           data: audienceData,
         });
       }
       
       // 3. Handle AudienceLocation records (delete and recreate)
       await tx.audienceLocation.deleteMany({
         where: { audienceId: existingAudience?.id || -1 }
       });
       
       // Create new location records
       if (body.audience.locations?.length) {
         for (const location of body.audience.locations) {
           await tx.audienceLocation.create({
             data: {
               audienceId: existingAudience?.id || -1,
               country: location.country,
               region: location.region || null,
               city: location.city || null
             }
           });
         }
       }
       
       // 4. Similar handling for other related tables:
       // - AudienceGender
       // - AudienceScreeningQuestion
       // - AudienceLanguage
       // - AudienceCompetitor
     }
     
     // 5. Handle CreativeAsset records
     if (body.creativeAssets?.length) {
       // Delete existing assets
       await tx.creativeAsset.deleteMany({
         where: { campaignId: campaignId }
       });
       
       // Create new assets
       for (const asset of body.creativeAssets) {
         await tx.creativeAsset.create({
           data: {
             campaignId: campaignId,
             type: asset.type,
             url: asset.url,
             title: asset.title || null,
             description: asset.description || null
             // Other fields from schema...
           }
         });
       }
     }
     
     // 6. Handle CreativeRequirement records
     // Similar pattern of delete and recreate
   });
   ```

### STEP 4: Create Step-Specific API Endpoints
1. Create `/api/campaigns/[id]/objectives.ts`:
   - Implement PUT method specific to objectives data
   - Map form fields to database fields based on schema
   - Handle scalar fields directly on CampaignWizardSubmission

2. Create `/api/campaigns/[id]/audience.ts`:
   - Implement PUT method for Audience and related tables
   - Handle complex joins with AudienceLocation, AudienceGender, etc.
   - Use transactions to ensure data consistency

3. Create `/api/campaigns/[id]/assets.ts`:
   - Implement PUT method for CreativeAsset table
   - Handle arrays and multiple asset types
   - Ensure proper handling of file references

### STEP 5: Implement Zod Validation Based on Schema
1. Create validation schemas that match Prisma models:
   ```typescript
   const audienceSchema = z.object({
     // Match fields exactly to database schema
     demographics: z.object({
       ageRange: z.array(z.enum(['18-24', '25-34', '35-44', '45-54', '55+'])),
       genders: z.array(z.enum(['Male', 'Female', 'Non-binary', 'Other'])),
       // Other demographic fields...
     }),
     locations: z.array(z.object({
       country: z.string().min(1, "Country is required"),
       region: z.string().optional(),
       city: z.string().optional()
     })).min(1, "At least one location is required"),
     // Other audience fields...
   });
   
   // Use in validation
   try {
     const validatedData = audienceSchema.parse(body.audience);
     // Process validated data...
   } catch (error) {
     return NextResponse.json({ 
       error: 'Validation failed',
       details: error.errors 
     }, { status: 400 });
   }
   ```

### STEP 6: Update WizardContext with Schema-Aware Formatting
1. Modify saveProgress to properly format data for schema:
   ```typescript
   const formatAudienceData = (formData) => {
     // Transform UI form data to match database schema expectations
     return {
       demographics: {
         ageRange: formData.ageGroups || [],
         genders: formData.genderSelections || [],
         // Other mappings...
       },
       locations: (formData.targetLocations || []).map(loc => ({
         country: loc.country,
         region: loc.region || null,
         city: loc.city || null
       })),
       // Other transformations...
     };
   };
   ```

2. Update step-specific data formatting for each wizard step

### STEP 7: Fix Form Submit Handlers
1. Update each step's handleSubmit function
2. Ensure proper data formatting for database schema:
   ```typescript
   const handleSubmit = async (values) => {
     try {
       setIsSaving(true);
       
       // Format data to match database schema expectations
       const formattedData = {
         // Map form values to database fields
         audience: {
           age1824: values.ageGroups?.includes('18-24') || false,
           age2534: values.ageGroups?.includes('25-34') || false,
           // Other mappings...
         },
         locations: values.locations.map(loc => ({
           country: loc.country,
           region: loc.region || null,
           city: loc.city || null
         }))
         // Other formatted fields...
       };
       
       // Call API with properly formatted data
       const response = await fetch(`/api/campaigns/${campaignId}/audience`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formattedData),
       });
       
       // Handle response...
     } catch (error) {
       // Handle errors...
     }
   };
   ```

### STEP 8: Add Database Diagnostic Logging
1. Implement detailed logging focused on data persistence:
   - Log exact data sent to each database operation
   - Record SQL queries in development
   - Track success/failure with specific error details
   - Log exact data returned from database operations

2. Create diagnostic endpoints for verifying data persistence

### STEP 9: Build Campaign ID 13 Recovery Tool
1. Create special admin route for handling Campaign ID 13
2. Query all related tables to identify missing data
3. Build recovery form with pre-filled existing data
4. Implement validation to ensure all required schema fields are filled
5. Use transactions to safely update all related records

### STEP 10: Implement Comprehensive Testing
1. Create tests with sample data matching schema requirements
2. Test each database operation individually
3. Verify data integrity across all related tables
4. Test error handling and recovery mechanisms
5. Check data consistency in complex relational scenarios

### Success Criteria - Database Integrity Focus
1. Zero null/missing values in required schema fields
2. Proper relational integrity between all linked tables
3. Consistent data types matching schema definitions
4. Successful validation against schema constraints
5. Full data recovery for Campaign ID 13

This schema-aware approach directly addresses our PostgreSQL database structure and ensures proper handling of all relational data, focusing on maintaining data integrity across the complex campaign wizard data model.
