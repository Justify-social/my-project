import { NextRequest, NextResponse } from 'next/server';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';
import { 
  validateCampaignData, 
  validateAudienceData, 
  validateAssetData,
  ValidationResult,
  ValidationError
} from '@/lib/data-mapping/validation';

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
    const campaignId = parseInt(params.id, 10);
    const stepNumber = parseInt(params.step, 10);
    
    if (isNaN(campaignId) || isNaN(stepNumber)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid campaign ID or step number' 
      }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    const { data, autosave = false } = body;
    
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        message: 'No data provided' 
      }, { status: 400 });
    }
    
    dbLogger.info(
      DbOperation.UPDATE,
      `Processing ${autosave ? 'autosave' : 'submission'} for campaign ${campaignId} step ${stepNumber}`,
      { campaignId, step: stepNumber, autosave }
    );
    
    // Different handling based on step
    let validationResult: ValidationResult = { valid: true, errors: [] };
    let updateData: any = {};
    
    // Determine what data to validate and update based on step number
    switch (stepNumber) {
      case 1: // Overview
        // For step 1, we validate and update campaign overview data
        const campaignData = {
          name: data.name || '',
          status: data.status || 'draft',
          startDate: data.startDate,
          endDate: data.endDate,
          budget: data.budget,
          description: data.description,
          brandId: data.brandId
        };
        
        // For autosave, we skip validation to allow partial data
        if (!autosave) {
          validationResult = validateCampaignData({
            id: campaignId,
            ...campaignData
          });
          
          if (!validationResult.valid) {
            return NextResponse.json({
              success: false,
              message: 'Validation failed',
              errors: validationResult.errors
            }, { status: 400 });
          }
        }
        
        updateData = campaignData;
        break;
        
      case 2: // Objectives
        // For step 2, we validate and update campaign objectives
        const objectivesData = {
          objectives: data.objectives || []
        };
        
        updateData = objectivesData;
        break;
        
      case 3: // Audience
        // For step 3, we validate and update audience data
        const audienceData = {
          targetLocations: data.locations || [],
          targetGenders: data.genders || [],
          targetAgeRanges: data.ageRanges || [],
          screeningQuestions: data.screeningQuestions || [],
          languages: data.languages || [],
          competitors: data.competitors || []
        };
        
        // For autosave, we skip validation to allow partial data
        if (!autosave) {
          validationResult = validateAudienceData({
            campaignId,
            ...audienceData
          });
          
          if (!validationResult.valid) {
            return NextResponse.json({
              success: false,
              message: 'Validation failed',
              errors: validationResult.errors
            }, { status: 400 });
          }
        }
        
        updateData = {
          audience: audienceData
        };
        break;
        
      case 4: // Assets
        // For step 4, we validate and update assets data
        const assetsData = data.assets || [];
        
        // For autosave, we skip validation to allow partial data
        if (!autosave && assetsData.length > 0) {
          // Validate each asset
          for (const asset of assetsData) {
            const assetValidation = validateAssetData({
              campaignId,
              ...asset
            });
            
            if (!assetValidation.valid) {
              return NextResponse.json({
                success: false,
                message: 'Asset validation failed',
                errors: assetValidation.errors
              }, { status: 400 });
            }
          }
        }
        
        updateData = {
          assets: assetsData
        };
        break;
        
      default:
        return NextResponse.json({ 
          success: false, 
          message: `Invalid step number: ${stepNumber}` 
        }, { status: 400 });
    }
    
    // In a real implementation, we'd update the database here
    // For now, we'll simulate a successful update
    
    // For autosave, we include the autosave flag in the response
    if (autosave) {
      dbLogger.debug(
        DbOperation.UPDATE,
        `Auto-save successful for campaign ${campaignId} step ${stepNumber}`,
        { campaignId, step: stepNumber }
      );
      
      return NextResponse.json({
        success: true,
        message: 'Data auto-saved successfully',
        autosave: true,
        step: stepNumber,
        campaignId,
        data: updateData
      });
    } else {
      dbLogger.info(
        DbOperation.UPDATE,
        `Step ${stepNumber} submission successful for campaign ${campaignId}`,
        { campaignId, step: stepNumber }
      );
      
      return NextResponse.json({
        success: true,
        message: 'Step data saved successfully',
        step: stepNumber,
        campaignId,
        data: updateData
      });
    }
  } catch (error) {
    dbLogger.error(
      DbOperation.UPDATE,
      `Error processing campaign wizard step`,
      { id: params.id, step: params.step },
      error
    );
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
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
    const campaignId = parseInt(params.id, 10);
    const stepNumber = parseInt(params.step, 10);
    
    if (isNaN(campaignId) || isNaN(stepNumber)) {
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