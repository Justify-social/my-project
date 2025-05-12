import { z } from 'zod';
import { Prisma, Status } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { EnumTransformers } from '@/utils/enum-transformers';
import { connectToDatabase, prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import logger from '@/lib/logger'; // Added logger import
// Import the specific schemas needed (adjust path if necessary)
import {
  Step1BaseSchema,
  Step2BaseSchema,
  Step3BaseSchema,
  Step4BaseSchema,
  Step5BaseSchema, // Assuming this exists for step 5 logic
} from '@/components/features/campaigns/types'; // Using types.ts as source
import { addOrUpdateCampaignInAlgolia } from '@/lib/algolia'; // Import Algolia utility
import { BadRequestError, ForbiddenError, UnauthenticatedError, NotFoundError } from '@/lib/errors'; // Import custom errors

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
    const { userId: clerkUserId, orgId } = await auth(); // Fetch Clerk user and org IDs

    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required to update campaign wizard.');
    }

    if (!orgId) {
      throw new BadRequestError(
        'Active organization context is required to update campaign wizard.'
      );
    }

    // Fetch the internal User record using the clerkUserId
    const userRecord = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!userRecord) {
      logger.error('Campaign Wizard PATCH: No User record found for clerkUserId', { clerkUserId });
      throw new NotFoundError('User record not found. Cannot update campaign wizard.');
    }
    const internalUserId = userRecord.id;

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

    // Fetch current campaign state
    const currentCampaign = await prisma.campaignWizard.findUnique({
      where: { id: campaignId },
      select: {
        orgId: true,
        userId: true,
        step1Complete: true,
        step2Complete: true,
        step3Complete: true,
        step4Complete: true,
        currentStep: true,
      },
    });

    if (!currentCampaign) {
      // return NextResponse.json({ error: 'Campaign not found for update' }, { status: 404 });
      throw new NotFoundError('Campaign not found for update.');
    }

    // Authorization Check
    if (currentCampaign.orgId === null) {
      logger.warn(
        `Attempt to update legacy campaign (ID: ${campaignId}, null orgId) by user ${internalUserId} in org ${orgId}. Access denied as per current rules.`
      );
      throw new ForbiddenError(
        'This campaign is not associated with an organization and cannot be updated in this context.'
      );
    } else if (currentCampaign.orgId !== orgId) {
      logger.warn(
        `User ${internalUserId} in org ${orgId} attempted to update campaign ${campaignId} belonging to org ${currentCampaign.orgId}. Access denied.`
      );
      throw new ForbiddenError('You do not have permission to update this campaign.');
    }

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
      user: { connect: { id: internalUserId } }, // Update user relation for "last editor"
    };

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
      if (dataToSave.step1Complete !== undefined)
        mappedData.step1Complete = dataToSave.step1Complete;
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
      if (dataToSave.step2Complete !== undefined)
        mappedData.step2Complete = dataToSave.step2Complete;
    } else if (step === 3) {
      if (dataToSave.demographics !== undefined) {
        // Logging received demographics
        console.log(
          '[API Step 3] Received demographics:',
          JSON.stringify(dataToSave.demographics, null, 2)
        );
        mappedData.demographics = dataToSave.demographics ?? Prisma.JsonNull;
      }
      if (dataToSave.locations !== undefined) {
        // Logging received locations
        console.log(
          '[API Step 3] Received locations:',
          JSON.stringify(dataToSave.locations, null, 2)
        );
        mappedData.locations = dataToSave.locations ?? [];
      }
      if (dataToSave.targeting !== undefined) {
        // Logging received targeting
        console.log(
          '[API Step 3] Received targeting:',
          JSON.stringify(dataToSave.targeting, null, 2)
        );
        mappedData.targeting = dataToSave.targeting ?? Prisma.JsonNull;
      }
      if (dataToSave.competitors !== undefined) {
        // Logging received competitors
        console.log(
          '[API Step 3] Received competitors:',
          JSON.stringify(dataToSave.competitors, null, 2)
        );
        mappedData.competitors = dataToSave.competitors ?? [];
      }
      if (dataToSave.step3Complete !== undefined)
        mappedData.step3Complete = dataToSave.step3Complete;
      // Log the mapped data specifically for step 3 before transformation
      console.log(
        '[API Step 3] mappedData before transformation:',
        JSON.stringify(mappedData, null, 2)
      );
    } else if (step === 4) {
      if (dataToSave.assets !== undefined) mappedData.assets = dataToSave.assets ?? [];
      if (dataToSave.step4Complete !== undefined)
        mappedData.step4Complete = dataToSave.step4Complete;
    } else if (step === 5) {
      if ('status' in dataToSave && dataToSave.status) {
        // Ensure Status enum is imported from @prisma/client
        mappedData.status = String(dataToSave.status).toUpperCase() as Status;
      }
      // Note: step5Complete might be sent from client, but isComplete is derived from steps 1-4.
      // if (dataToSave.step5Complete !== undefined) { /* handle if needed, but not for main isComplete logic */ }
    }

    // Determine the overall isComplete status
    const s1c =
      mappedData.step1Complete !== undefined
        ? mappedData.step1Complete
        : currentCampaign.step1Complete;
    const s2c =
      mappedData.step2Complete !== undefined
        ? mappedData.step2Complete
        : currentCampaign.step2Complete;
    const s3c =
      mappedData.step3Complete !== undefined
        ? mappedData.step3Complete
        : currentCampaign.step3Complete;
    const s4c =
      mappedData.step4Complete !== undefined
        ? mappedData.step4Complete
        : currentCampaign.step4Complete;

    mappedData.isComplete = !!(s1c && s2c && s3c && s4c);

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

    // Index the updated campaign in Algolia
    if (campaignDataForResponse) {
      try {
        // Ensure campaignDataForResponse is not null and is the complete wizard object
        await addOrUpdateCampaignInAlgolia(campaignDataForResponse as any); // Cast to any if type mismatch with CampaignWizard
        logger.info(`PATCH Step ${step}: Successfully indexed updated campaign in Algolia`, {
          campaignId,
        });
      } catch (algoliaError) {
        logger.error(`PATCH Step ${step}: Failed to index updated campaign in Algolia`, {
          campaignId,
          error: algoliaError,
        });
        // Decide if this should be a critical error that fails the request,
        // or just logged. For now, logging and continuing.
      }
    } else {
      logger.warn(
        `PATCH Step ${step}: campaignDataForResponse was null, skipping Algolia indexing.`,
        { campaignId }
      );
    }

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
