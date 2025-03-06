import { NextRequest, NextResponse } from 'next/server';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';
import { z } from 'zod';
import { 
  validateCampaignData, 
  validateAudienceData, 
  validateAssetData,
  ValidationResult,
  ValidationError
} from '@/lib/data-mapping/validation';

// Define flexible schemas for each step
const step1FlexibleSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  businessGoal: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeZone: z.string().optional(),
  primaryContact: z.any().optional(),
  secondaryContact: z.any().optional(),
  additionalContacts: z.array(z.any()).optional(),
  currency: z.string().optional(),
  totalBudget: z.union([z.string(), z.number()]).optional(),
  socialMediaBudget: z.union([z.string(), z.number()]).optional(),
  status: z.enum(['draft', 'complete']).optional()
});

const step2FlexibleSchema = z.object({
  primaryKPI: z.string().optional(),
  secondaryKPIs: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  status: z.enum(['draft', 'complete']).optional()
});

const step3FlexibleSchema = z.object({
  audience: z.any().optional(),
  status: z.enum(['draft', 'complete']).optional()
});

const step4FlexibleSchema = z.object({
  assets: z.array(z.any()).optional(),
  status: z.enum(['draft', 'complete']).optional()
});

/**
 * PATCH handler for updating campaign data by wizard step
 * This API handles both manual submission and autosave functionality
 * 
 * @param request The incoming request
 * @param params Route parameters including campaign ID and step number
 * @returns API response
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string, step: string } }
) {
  try {
    // Import the EnumTransformers utility
    const { EnumTransformers } = await import('@/utils/enum-transformers');
    
    const campaignId = params.id;
    const stepNumber = parseInt(params.step, 10);
    
    // Check if the ID is a UUID (string format) or a numeric ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    const numericId = parseInt(campaignId, 10);
    
    if ((!isUuid && isNaN(numericId)) || isNaN(stepNumber)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid campaign ID or step number' 
      }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    console.log(`Raw request data for step ${stepNumber}:`, JSON.stringify(body, null, 2));
    
    // Check if this is a draft submission
    const isDraft = body.status === 'draft';
    console.log(`Processing ${isDraft ? 'DRAFT' : 'COMPLETE'} submission for step ${stepNumber}`);
    
    // Validate the request data using the appropriate schema
    let validationResult: { success: boolean, data?: any, error?: any } = { success: true };
    
    try {
      // Select the appropriate schema based on step
      let schema;
      switch (stepNumber) {
        case 1:
          schema = step1FlexibleSchema;
          break;
        case 2:
          schema = step2FlexibleSchema;
          break;
        case 3:
          schema = step3FlexibleSchema;
          break;
        case 4:
          schema = step4FlexibleSchema;
          break;
        default:
          return NextResponse.json({
            success: false,
            message: `Invalid step number: ${stepNumber}`
          }, { status: 400 });
      }
      
      // Validate the data
      validationResult.data = schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        validationResult = {
          success: false,
          error: {
            message: 'Validation failed',
            details: error.format()
          }
        };
      } else {
        throw error;
      }
    }
    
    // If validation fails, return errors
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: validationResult.error.message,
        details: validationResult.error.details
      }, { status: 400 });
    }
    
    // Transform the incoming data to backend format
    const transformedData = EnumTransformers.transformObjectToBackend(validationResult.data);
    console.log(`Transformed step ${stepNumber} data:`, JSON.stringify(transformedData, null, 2));
    
    dbLogger.info(
      DbOperation.UPDATE,
      `Processing ${isDraft ? 'draft' : 'submission'} for campaign ${campaignId} step ${stepNumber}`,
      { campaignId, step: stepNumber, isDraft }
    );
    
    // For non-drafts, apply stricter validation
    if (!isDraft) {
      // Different handling based on step
      let legacyValidationResult: ValidationResult = { valid: true, errors: [] };
      
      // Process data based on step
      switch (stepNumber) {
        case 1:
          // Basic campaign info
          legacyValidationResult = validateCampaignData(transformedData);
          break;
        case 2:
          // Campaign objectives
          // Validate and prepare update data
          // ...
          break;
        case 3:
          // Audience targeting
          legacyValidationResult = validateAudienceData(transformedData);
          break;
        case 4:
          // Creative assets
          legacyValidationResult = validateAssetData(transformedData);
          break;
      }
      
      // If validation fails, return errors
      if (!legacyValidationResult.valid) {
        return NextResponse.json({
          success: false,
          errors: legacyValidationResult.errors,
          message: 'Validation failed'
        }, { status: 400 });
      }
    }
    
    // Prepare update data based on step
    let updateData: any = {
      ...transformedData,
      updatedAt: new Date()
    };
    
    // Set step completion flag if not a draft
    if (!isDraft) {
      switch (stepNumber) {
        case 1:
          updateData.step1Complete = true;
          break;
        case 2:
          updateData.step2Complete = true;
          break;
        case 3:
          updateData.step3Complete = true;
          break;
        case 4:
          updateData.step4Complete = true;
          break;
      }
    }
    
    // Update the campaign
    // ...
    // Mock successful response for now
    const updatedCampaign = { 
      id: campaignId,
      ...updateData
    };
    
    // Transform response data back to frontend format
    const responseData = EnumTransformers.transformObjectFromBackend(updatedCampaign);
    
    return NextResponse.json({
      success: true,
      data: responseData,
      message: `Campaign step ${stepNumber} ${isDraft ? 'saved as draft' : 'updated'} successfully`
    });
    
  } catch (error) {
    console.error('Error updating campaign step:', error);
    return NextResponse.json({
      success: false,
      message: `Failed to update campaign step: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}

/**
 * GET handler for retrieving campaign data for a specific wizard step
 * 
 * @param request The incoming request
 * @param params Route parameters including campaign ID and step number
 * @returns API response with step data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, step: string } }
) {
  try {
    const campaignId = params.id;
    const stepNumber = parseInt(params.step, 10);
    
    // Check if the ID is a UUID (string format) or a numeric ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    const numericId = parseInt(campaignId, 10);
    
    if ((!isUuid && isNaN(numericId)) || isNaN(stepNumber)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid campaign ID or step number' 
      }, { status: 400 });
    }
    
    dbLogger.info(
      DbOperation.FETCH,
      `Fetching data for campaign ${campaignId} step ${stepNumber}`,
      { campaignId, step: stepNumber }
    );
    
    // In a real implementation, we'd fetch from the database
    // For now, we'll return simulated data
    
    // Different response based on step
    let stepData: any = {};
    
    switch (stepNumber) {
      case 1: // Overview
        stepData = {
          name: `Campaign ${campaignId}`,
          status: 'draft',
          startDate: '2023-06-01',
          endDate: '2023-09-01',
          budget: 50000,
          description: 'Sample campaign description',
          brandId: 1
        };
        break;
        
      case 2: // Objectives
        stepData = {
          objectives: ['Brand Awareness', 'Lead Generation']
        };
        break;
        
      case 3: // Audience
        stepData = {
          locations: [
            { country: 'USA', region: 'California', city: 'San Francisco' },
            { country: 'Canada', region: 'Ontario', city: 'Toronto' }
          ],
          genders: [
            { gender: 'male' },
            { gender: 'female' }
          ],
          ageRanges: [
            { minAge: 18, maxAge: 34 },
            { minAge: 35, maxAge: 54 }
          ],
          screeningQuestions: [
            { 
              question: 'Do you use social media daily?', 
              required: true,
              options: ['Yes', 'No'] 
            }
          ],
          languages: [
            { language: 'English' },
            { language: 'Spanish' }
          ],
          competitors: [
            { name: 'Competitor 1' },
            { name: 'Competitor 2' }
          ]
        };
        break;
        
      case 4: // Assets
        stepData = {
          assets: [
            { 
              id: 1, 
              type: 'image', 
              name: 'Banner Ad',
              description: 'Main banner for campaign', 
              status: 'completed',
              url: 'https://example.com/assets/banner.jpg'
            },
            { 
              id: 2, 
              type: 'video', 
              name: 'Promo Video',
              description: '30-second promotional video', 
              status: 'pending'
            }
          ]
        };
        break;
        
      default:
        return NextResponse.json({ 
          success: false, 
          message: `Invalid step number: ${stepNumber}` 
        }, { status: 400 });
    }
    
    dbLogger.debug(
      DbOperation.FETCH,
      `Successfully fetched data for campaign ${campaignId} step ${stepNumber}`,
      { campaignId, step: stepNumber }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Step data retrieved successfully',
      step: stepNumber,
      campaignId,
      data: stepData
    });
  } catch (error) {
    dbLogger.error(
      DbOperation.FETCH,
      `Error fetching campaign wizard step data`,
      { id: params.id, step: params.step },
      error
    );
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
} 