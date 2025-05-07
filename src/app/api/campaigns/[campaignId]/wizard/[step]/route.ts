import { z } from 'zod';
import { Prisma, Status } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { EnumTransformers } from '@/utils/enum-transformers';
import { connectToDatabase, prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
// Import the specific schemas needed (adjust path if necessary)
import {
  Step1BaseSchema,
  Step2BaseSchema,
  Step3BaseSchema,
  Step4BaseSchema,
  Step5BaseSchema, // Assuming this exists for step 5 logic
} from '@/components/features/campaigns/types'; // Using types.ts as source

// Define interface for influencer data locally if not exported
interface ApiInfluencer {
  id?: string | number | null;
  handle?: string | null;
  platform?: string | null;
  platformId?: string | null;
}

/**
 * PATCH handler for saving/updating campaign wizard step data
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; step: string }> }
) {
  // Apply tryCatch logic internally
  try {
    // Await params resolution at the beginning
    const resolvedParams = await params;
    const campaignId = resolvedParams.campaignId;
    const step = parseInt(resolvedParams.step, 10);
    const { userId: _userId } = await auth(); // Prefixed userId
    const body = await request.json();

    if (!campaignId || isNaN(step)) {
      return NextResponse.json(
        { error: 'Missing or invalid campaign ID or step' },
        { status: 400 }
      );
    }

    console.log(`PATCH /api/campaigns/${campaignId}/wizard/${step}`);

    // Connect to database
    await connectToDatabase();

    // Parse request body
    console.log(`Received Step ${step} body:`, JSON.stringify(body, null, 2));

    // --- STEP-SPECIFIC VALIDATION AND MAPPING ---
    // Revert dataToSave back to any for now to resolve complex Prisma type issues
    // TODO: Refactor this API route handler with proper Prisma type mapping
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dataToSave: any = body;
    const mappedData: Prisma.CampaignWizardUpdateInput = {
      updatedAt: new Date(),
      currentStep: step,
    };

    // Set step completion flag based on current step
    if (step >= 1) mappedData.step1Complete = true;
    if (step >= 2) mappedData.step2Complete = true;
    if (step >= 3) mappedData.step3Complete = true;
    if (step >= 4) mappedData.step4Complete = true;
    if (step >= 5) mappedData.isComplete = true;

    // Revert validationResult back to any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let validationResult: z.SafeParseReturnType<any, any>;

    switch (step) {
      case 1:
        validationResult = Step1BaseSchema.partial().safeParse(body);
        break;
      case 2:
        validationResult = Step2BaseSchema.partial().safeParse(body);
        break;
      case 3:
        validationResult = Step3BaseSchema.partial().safeParse(body);
        break;
      case 4:
        validationResult = Step4BaseSchema.partial().safeParse(body);
        break;
      case 5:
        validationResult = Step5BaseSchema.partial().safeParse(body);
        break;
      default:
        return NextResponse.json({ error: `Invalid step number: ${step}` }, { status: 400 });
    }

    // Check validation result
    if (!validationResult.success) {
      console.error(`Step ${step} Validation failed:`, validationResult.error.format());
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    // Assign potentially 'any' type data
    dataToSave = validationResult.data;

    console.log(`Validated Step ${step} data:`, JSON.stringify(dataToSave, null, 2));

    // --- Map validated data (needs correct types based on dataToSave) ---
    // TODO: Ensure correct type mapping after fixing validationResult/dataToSave types
    if (step === 1) {
      if (dataToSave.name !== undefined) mappedData.name = dataToSave.name;
      if (dataToSave.businessGoal !== undefined)
        mappedData.businessGoal = dataToSave.businessGoal ?? null;
      if (dataToSave.brand !== undefined) mappedData.brand = dataToSave.brand;
      if (dataToSave.website !== undefined) mappedData.website = dataToSave.website ?? null;
      if (dataToSave.startDate) mappedData.startDate = new Date(dataToSave.startDate);
      if (dataToSave.endDate) mappedData.endDate = new Date(dataToSave.endDate);
      if (dataToSave.timeZone !== undefined) mappedData.timeZone = dataToSave.timeZone ?? null;
      if (dataToSave.budget !== undefined) {
        mappedData.budget = dataToSave.budget ?? Prisma.JsonNull;
      }
      if (dataToSave.primaryContact !== undefined) {
        mappedData.primaryContact = dataToSave.primaryContact ?? Prisma.JsonNull;
      }
      if (dataToSave.secondaryContact !== undefined) {
        mappedData.secondaryContact = dataToSave.secondaryContact ?? Prisma.JsonNull;
      }
      if (dataToSave.additionalContacts !== undefined) {
        mappedData.additionalContacts = dataToSave.additionalContacts ?? [];
      }
    } else if (step === 2) {
      if (dataToSave.primaryKPI !== undefined)
        mappedData.primaryKPI = dataToSave.primaryKPI ?? null;
      if (dataToSave.secondaryKPIs !== undefined)
        mappedData.secondaryKPIs = dataToSave.secondaryKPIs ?? [];
      if (dataToSave.features !== undefined) mappedData.features = dataToSave.features ?? [];
      if (dataToSave.messaging !== undefined)
        mappedData.messaging = dataToSave.messaging ?? Prisma.JsonNull;
      if (dataToSave.expectedOutcomes !== undefined)
        mappedData.expectedOutcomes = dataToSave.expectedOutcomes ?? Prisma.JsonNull;
    } else if (step === 3) {
      if (dataToSave.demographics !== undefined) {
        const existingDemographics =
          typeof mappedData.demographics === 'object' && mappedData.demographics !== null
            ? mappedData.demographics
            : {};
        mappedData.demographics = dataToSave.demographics
          ? { ...existingDemographics, ...dataToSave.demographics }
          : Prisma.JsonNull;
      }
      if (dataToSave.locations !== undefined) mappedData.locations = dataToSave.locations ?? [];
      if (dataToSave.targeting !== undefined) {
        const existingTargeting =
          typeof mappedData.targeting === 'object' && mappedData.targeting !== null
            ? mappedData.targeting
            : {};
        mappedData.targeting = dataToSave.targeting
          ? { ...existingTargeting, ...dataToSave.targeting }
          : Prisma.JsonNull;
      }
      if (dataToSave.competitors !== undefined)
        mappedData.competitors = dataToSave.competitors ?? [];
    } else if (step === 4) {
      if (dataToSave.assets !== undefined) mappedData.assets = dataToSave.assets ?? [];
    } else if (step === 5) {
      if ('status' in dataToSave && dataToSave.status) {
        // Ensure Status enum is imported from @prisma/client
        mappedData.status = String(dataToSave.status).toUpperCase() as Status;
      }
    }

    // Transform enums only for the fields being updated in this step
    const transformedDataForDb = EnumTransformers.transformObjectToBackend(mappedData);
    // Log data JUST BEFORE DB update
    console.log(
      `[DB Update - Step ${step}] Data being sent to Prisma:`,
      JSON.stringify(transformedDataForDb, null, 2)
    );

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
      console.log(
        `[DB Update - Step ${step}] Prisma update successful. Result:`,
        JSON.stringify(updatedCampaign, null, 2)
      );
    } catch (dbError) {
      // Catch and log specific Prisma errors
      console.error(`[DB Update - Step ${step}] Prisma update FAILED:`, dbError);
      // Return a specific error response
      return NextResponse.json(
        {
          success: false,
          error: 'Database update failed.',
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }

    // --- Influencer Handling (only if DB update succeeded) ---
    const influencerData = body.Influencer;
    // Use the result from the main update as the default
    let campaignDataForResponse = updatedCampaign;
    let messageSuffix = '';

    if (step === 1 && influencerData != null && Array.isArray(influencerData)) {
      console.log('Updating influencers for wizard campaign (Step 1):', campaignId);
      try {
        await prisma.$transaction(async tx => {
          await tx.influencer.deleteMany({ where: { campaignId } });
          console.log('Deleted existing influencers for campaign:', campaignId);
          const influencerCreateData = influencerData
            .filter(
              (
                inf: unknown
              ): inf is ApiInfluencer => // Runtime type guard
                inf != null && typeof inf === 'object' && 'handle' in inf && 'platform' in inf
            )
            .map((inf: ApiInfluencer) => ({
              id:
                typeof inf.id === 'string'
                  ? inf.id
                  : `inf-${Date.now()}-${Math.round(Math.random() * 1000)}`,
              platform: EnumTransformers.platformToBackend(inf.platform as string),
              handle: inf.handle as string,
              platformId: inf.platformId || '',
              campaignId: campaignId,
              updatedAt: new Date(),
            }));
          if (influencerCreateData.length > 0) {
            await tx.influencer.createMany({ data: influencerCreateData });
            console.log(
              `Created ${influencerCreateData.length} new influencers for campaign:`,
              campaignId
            );
          } else {
            console.log('No valid influencers provided to create for campaign:', campaignId);
          }
        });
        console.log('Influencer transaction successful.');
        // Refetch into a temporary variable to get updated influencers
        const refetchedCampaign = await prisma.campaignWizard.findUnique({
          where: { id: campaignId },
          include: { Influencer: true },
        });
        // If refetch was successful, use it for the response
        if (refetchedCampaign) {
          campaignDataForResponse = refetchedCampaign;
          messageSuffix = ' with influencers';
        } else {
          console.error(
            `[Influencer Update] Failed to refetch campaign ${campaignId} after influencer update.`
          );
          // Keep campaignDataForResponse as the original updatedCampaign
          messageSuffix = ' (influencer refetch failed)';
        }
      } catch (infError: unknown) {
        // Type error as unknown
        console.error('[Influencer Update] Transaction FAILED:', infError);
        // Add optional: check error type before logging message if needed
        // if (infError instanceof Error) { console.error(infError.message); }
        // Keep campaignDataForResponse as the original updatedCampaign
        messageSuffix = ' (influencer update error)';
      }
    }
    // --- End Influencer Handling ---

    // Final null check before transformation (using campaignDataForResponse)
    if (!campaignDataForResponse) {
      // This should not happen if the initial update worked, but handles edge cases
      console.error(
        `[API PATCH - Step ${step}] campaignDataForResponse became null unexpectedly before final transformation.`
      );
      return NextResponse.json(
        { success: false, error: 'Internal server error during final processing.' },
        { status: 500 }
      );
    }

    // Transform the final, non-null data for the frontend
    // const transformedCampaignForFrontend =
    //   EnumTransformers.transformObjectFromBackend(campaignDataForResponse);

    return NextResponse.json({
      success: true,
      // data: transformedCampaignForFrontend, // Send the raw data from DB
      data: campaignDataForResponse, // Send the raw data from DB
      message: `Step ${step} updated${messageSuffix}`,
    });
  } catch (error) {
    // Type the error as unknown for better safety
    const unknownError = error as unknown;

    // Try to get params even if the main try block failed early
    // This might be null if params itself rejected
    let campaignIdForLog = 'unknown';
    let stepForLog = 'unknown';
    try {
      // Use the already awaited params if available, otherwise try awaiting again (carefully)
      // This might be null if params promise itself rejected, which might not be safe
      // A more robust approach might involve passing params differently or handling its potential rejection.
      const resolvedParamsForLog = await params; // Re-awaiting might be problematic
      campaignIdForLog = resolvedParamsForLog.campaignId;
      stepForLog = resolvedParamsForLog.step;
    } catch (paramError) {
      console.error('Could not resolve params for error logging:', paramError);
    }

    console.error(
      `Error processing step ${stepForLog} for campaign ${campaignIdForLog}:`,
      unknownError
    );

    // Check if it's an error object before accessing message
    let errorMessage = 'Internal Server Error';
    if (unknownError instanceof Error) {
      errorMessage = unknownError.message;
    }

    // Add more specific error handling based on error type if possible
    if (errorMessage.includes('Unique constraint failed')) {
      // Example
      return NextResponse.json({ error: 'Duplicate entry detected.' }, { status: 409 });
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- GET handler (Ensure this export is correct) ---
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; step: string }> }
) {
  // Apply tryCatch logic internally
  try {
    const { campaignId, step } = await params;
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
  } catch (error) {
    // Log the error from the outer tryCatch
    // Await params before accessing properties
    const resolvedParams = await params;
    console.error(
      `Unhandled error in GET /api/campaigns/${resolvedParams.campaignId}/wizard/${resolvedParams.step}:`,
      error
    );
    // Consider using a more specific error handling function if available
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
