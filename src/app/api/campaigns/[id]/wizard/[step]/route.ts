import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { EnumTransformers } from '@/utils/enum-transformers';
import { tryCatch } from '@/config/middleware/api';
import { z } from 'zod';
// Import the BASE schemas for partial validation
import {
  Step1BaseSchema,
  Step2BaseSchema,
  Step3BaseSchema,
  Step4BaseSchema,
  Step5BaseSchema
} from '@/components/features/campaigns/types';

// Keep the comprehensive schema for reference if needed, but don't use for top-level validation
const fullCampaignSchemaForReference = z.object({ /* ... existing full schema ... */ });

/**
 * PATCH handler for saving/updating campaign wizard step data
 */
export const PATCH = tryCatch(
  async (request: NextRequest, { params }: { params: Promise<{ id: string; step: string }> }) => {
    const { id: campaignId, step } = await params;
    const stepNumber = parseInt(step, 10);

    if (!campaignId || isNaN(stepNumber)) {
      return NextResponse.json(
        { error: 'Missing or invalid campaign ID or step' },
        { status: 400 }
      );
    }

    console.log(`PATCH /api/campaigns/${campaignId}/wizard/${stepNumber}`);

    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    console.log(`Received Step ${stepNumber} body:`, JSON.stringify(body, null, 2));

    // --- STEP-SPECIFIC VALIDATION AND MAPPING --- 
    let validationResult: z.SafeParseReturnType<any, any>;
    let dataToSave: Partial<any> = {}; // Use Partial or a specific step type
    const mappedData: any = { updatedAt: new Date(), currentStep: stepNumber }; // Initialize common fields

    // Set step completion flag based on current step
    if (stepNumber >= 1) mappedData.step1Complete = true;
    if (stepNumber >= 2) mappedData.step2Complete = true;
    if (stepNumber >= 3) mappedData.step3Complete = true;
    if (stepNumber >= 4) mappedData.step4Complete = true;
    if (stepNumber >= 5) mappedData.isComplete = true; // Step 5 might set isComplete

    switch (stepNumber) {
      case 1:
        // Use the BASE schema with .partial() for validation
        validationResult = Step1BaseSchema.partial().safeParse(body);
        if (!validationResult.success) {
          console.error('Step 1 Validation failed:', validationResult.error.format());
          return NextResponse.json({ error: 'Validation failed', details: validationResult.error.format() }, { status: 400 });
        }
        dataToSave = validationResult.data;
        console.log('Validated Step 1 data:', JSON.stringify(dataToSave, null, 2));

        // Map validated Step 1 fields
        if ('name' in dataToSave) mappedData.name = dataToSave.name;
        if ('businessGoal' in dataToSave) mappedData.businessGoal = dataToSave.businessGoal;
        if ('brand' in dataToSave) mappedData.brand = dataToSave.brand;
        if ('website' in dataToSave) mappedData.website = dataToSave.website;
        if ('startDate' in dataToSave && dataToSave.startDate) mappedData.startDate = new Date(dataToSave.startDate);
        if ('endDate' in dataToSave && dataToSave.endDate) mappedData.endDate = new Date(dataToSave.endDate);
        if ('timeZone' in dataToSave) mappedData.timeZone = dataToSave.timeZone;
        if ('budget' in dataToSave && dataToSave.budget) {
          mappedData.budget = {
            currency: dataToSave.budget.currency || 'USD',
            total: dataToSave.budget.total || 0,
            socialMedia: dataToSave.budget.socialMedia || 0
          };
        }
        if ('primaryContact' in dataToSave) mappedData.primaryContact = dataToSave.primaryContact;
        if ('secondaryContact' in dataToSave) mappedData.secondaryContact = dataToSave.secondaryContact;
        if ('additionalContacts' in dataToSave) mappedData.additionalContacts = dataToSave.additionalContacts;
        // Influencers handled separately
        break;

      case 2:
        console.log('[API PATCH Step 2] Raw body received:', JSON.stringify(body, null, 2)); // Log raw body
        // Use the BASE schema with .partial() for validation
        validationResult = Step2BaseSchema.partial().safeParse(body);
        console.log('[API PATCH Step 2] Validation Result:', JSON.stringify(validationResult, null, 2)); // Log validation result
        if (!validationResult.success) {
          console.error('Step 2 Validation failed:', validationResult.error.format());
          return NextResponse.json({ error: 'Validation failed', details: validationResult.error.format() }, { status: 400 });
        }
        dataToSave = validationResult.data;
        console.log('[API PATCH Step 2] Validated dataToSave:', JSON.stringify(dataToSave, null, 2)); // Log validated data

        // Map validated Step 2 fields
        if ('primaryKPI' in dataToSave) mappedData.primaryKPI = dataToSave.primaryKPI;
        if ('secondaryKPIs' in dataToSave) mappedData.secondaryKPIs = dataToSave.secondaryKPIs;
        if ('features' in dataToSave) mappedData.features = dataToSave.features;
        if ('messaging' in dataToSave) mappedData.messaging = dataToSave.messaging;
        if ('expectedOutcomes' in dataToSave) mappedData.expectedOutcomes = dataToSave.expectedOutcomes;
        console.log('[API PATCH Step 2] Mapped data (before transform):', JSON.stringify(mappedData, null, 2)); // Log mapped data
        break;

      case 3:
        // Use the BASE schema with .partial() for validation
        validationResult = Step3BaseSchema.partial().safeParse(body);
        if (!validationResult.success) {
          console.error('Step 3 Validation failed:', validationResult.error.format());
          return NextResponse.json({ error: 'Validation failed', details: validationResult.error.format() }, { status: 400 });
        }
        dataToSave = validationResult.data;
        console.log('Validated Step 3 data:', JSON.stringify(dataToSave, null, 2));

        // Map validated Step 3 fields (audience etc.)
        if ('demographics' in dataToSave) mappedData.demographics = { ...(mappedData.demographics || {}), ...dataToSave.demographics };
        if ('locations' in dataToSave) mappedData.locations = dataToSave.locations; // Expecting LocationSchema[] now
        if ('targeting' in dataToSave) mappedData.targeting = { ...(mappedData.targeting || {}), ...dataToSave.targeting };
        if ('competitors' in dataToSave) mappedData.competitors = dataToSave.competitors;
        console.log('[API PATCH Step 3] Mapped data (before transform):', JSON.stringify(mappedData, null, 2)); // Log mapped data
        break;

      case 4:
        // Use the BASE schema with .partial() for validation
        validationResult = Step4BaseSchema.partial().safeParse(body);
        if (!validationResult.success) {
          console.error('Step 4 Validation failed:', validationResult.error.format());
          return NextResponse.json({ error: 'Validation failed', details: validationResult.error.format() }, { status: 400 });
        }
        dataToSave = validationResult.data;
        console.log('Validated Step 4 data:', JSON.stringify(dataToSave, null, 2));

        // Map validated Step 4 fields
        if ('assets' in dataToSave) mappedData.assets = dataToSave.assets;
        if ('guidelines' in dataToSave) mappedData.guidelines = dataToSave.guidelines;
        if ('requirements' in dataToSave) mappedData.requirements = dataToSave.requirements;
        if ('notes' in dataToSave) mappedData.notes = dataToSave.notes;
        break;

      case 5:
        // Use the BASE schema with .partial() for validation
        validationResult = Step5BaseSchema.partial().safeParse(body);
        if (!validationResult.success) {
          console.error('Step 5 Validation failed:', validationResult.error.format());
          return NextResponse.json({ error: 'Validation failed', details: validationResult.error.format() }, { status: 400 });
        }
        dataToSave = validationResult.data;
        console.log('Validated Step 5 data:', JSON.stringify(dataToSave, null, 2));

        // Map validated Step 5 fields (e.g., final status)
        if ('status' in dataToSave && dataToSave.status) {
          mappedData.status = dataToSave.status.toUpperCase();
        }
        // Potentially set isComplete based on validation/status?
        // mappedData.isComplete = true;
        break;

      default:
        return NextResponse.json({ error: `Invalid step number: ${stepNumber}` }, { status: 400 });
    }

    // Ensure data was actually saved/validated before proceeding
    if (!dataToSave) {
      console.error(`Validation or data processing failed for step ${stepNumber}, but no error response was sent.`);
      return NextResponse.json({ error: 'Internal processing error for step data' }, { status: 500 });
    }

    // Transform enums only for the fields being updated in this step
    const transformedDataForDb = EnumTransformers.transformObjectToBackend(mappedData);
    // Log data JUST BEFORE DB update
    console.log(`[DB Update - Step ${stepNumber}] Data being sent to Prisma:`, JSON.stringify(transformedDataForDb, null, 2));

    let updatedCampaign;
    try {
      updatedCampaign = await prisma.campaignWizard.update({
        where: { id: campaignId },
        data: transformedDataForDb,
        include: {
          Influencer: true,
        },
      });
      // Log result IMMEDIATELY AFTER successful DB update
      console.log(`[DB Update - Step ${stepNumber}] Prisma update successful. Result:`, JSON.stringify(updatedCampaign, null, 2));
    } catch (dbError) {
      // Catch and log specific Prisma errors
      console.error(`[DB Update - Step ${stepNumber}] Prisma update FAILED:`, dbError);
      // Return a specific error response
      return NextResponse.json({ success: false, error: 'Database update failed.', details: dbError instanceof Error ? dbError.message : String(dbError) }, { status: 500 });
    }

    // --- Influencer Handling (only if DB update succeeded) ---
    const influencerData = body.Influencer;
    // Use the result from the main update as the default
    let campaignDataForResponse = updatedCampaign;
    let messageSuffix = '';

    if (
      stepNumber === 1 &&
      influencerData != null &&
      Array.isArray(influencerData)
    ) {
      console.log('Updating influencers for wizard campaign (Step 1):', campaignId);
      try {
        await prisma.$transaction(async tx => {
          await tx.influencer.deleteMany({ where: { campaignId } });
          console.log('Deleted existing influencers for campaign:', campaignId);
          const influencerCreateData = influencerData
            .filter((inf: any) => inf.handle && inf.platform)
            .map((inf: any) => ({
              id: typeof inf.id === 'string' ? inf.id : `inf-${Date.now()}-${Math.round(Math.random() * 1000)}`,
              platform: EnumTransformers.platformToBackend(inf.platform),
              handle: inf.handle,
              platformId: inf.platformId || '',
              campaignId: campaignId,
              updatedAt: new Date(),
            }));
          if (influencerCreateData.length > 0) {
            await tx.influencer.createMany({ data: influencerCreateData });
            console.log(`Created ${influencerCreateData.length} new influencers for campaign:`, campaignId);
          } else {
            console.log('No valid influencers provided to create for campaign:', campaignId);
          }
        });
        console.log('Influencer transaction successful.');
        // Refetch into a temporary variable to get updated influencers
        const refetchedCampaign = await prisma.campaignWizard.findUnique({
          where: { id: campaignId }, include: { Influencer: true },
        });
        // If refetch was successful, use it for the response
        if (refetchedCampaign) {
          campaignDataForResponse = refetchedCampaign;
          messageSuffix = ' with influencers';
        } else {
          console.error(`[Influencer Update] Failed to refetch campaign ${campaignId} after influencer update.`);
          // Keep campaignDataForResponse as the original updatedCampaign
          messageSuffix = ' (influencer refetch failed)';
        }
      } catch (infError) {
        console.error('[Influencer Update] Transaction FAILED:', infError);
        // Keep campaignDataForResponse as the original updatedCampaign
        messageSuffix = ' (influencer update error)';
      }
    }
    // --- End Influencer Handling ---

    // Final null check before transformation (using campaignDataForResponse)
    if (!campaignDataForResponse) {
      // This should not happen if the initial update worked, but handles edge cases
      console.error(`[API PATCH - Step ${stepNumber}] campaignDataForResponse became null unexpectedly before final transformation.`);
      return NextResponse.json({ success: false, error: 'Internal server error during final processing.' }, { status: 500 });
    }

    // Transform the final, non-null data for the frontend
    // const transformedCampaignForFrontend =
    //   EnumTransformers.transformObjectFromBackend(campaignDataForResponse);

    return NextResponse.json({
      success: true,
      // data: transformedCampaignForFrontend, // Send the raw data from DB
      data: campaignDataForResponse, // Send the raw data from DB
      message: `Step ${stepNumber} updated${messageSuffix}`,
    });
  },
  { entityName: 'CampaignWizardStep' }
);

// --- GET handler (Ensure this export is correct) ---
export const GET = tryCatch(
  async (request: NextRequest, { params }: { params: Promise<{ id: string; step: string }> }) => {
    // ... (Original GET handler logic) ...
    const { id: campaignId, step } = await params;
    const stepNumber = parseInt(step, 10);

    if (!campaignId || isNaN(stepNumber)) {
      return NextResponse.json(
        { error: 'Missing or invalid campaign ID or step' },
        { status: 400 }
      );
    }

    console.log(`GET /api/campaigns/${campaignId}/wizard/${stepNumber} - Fetching full record`);

    await connectToDatabase();

    const campaign = await prisma.campaignWizard.findUnique({
      where: { id: campaignId },
      include: {
        Influencer: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const transformedCampaign = EnumTransformers.transformObjectFromBackend(campaign);

    return NextResponse.json({
      success: true,
      data: transformedCampaign,
    });
  },
  { entityName: 'CampaignWizardStep' }
);