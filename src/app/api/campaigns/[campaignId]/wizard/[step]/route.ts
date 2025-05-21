import { z } from 'zod';
import {
  Prisma,
  Status,
  Position,
  Currency,
  Platform,
  KPI,
  SubmissionStatus,
} from '@prisma/client';
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
  const handlerStartTime = Date.now();
  logger.info(
    `[WIZARD_PATCH_PERF] Handler started for step ${params ? (await params).step : 'unknown'} campaign ${params ? (await params).campaignId : 'unknown'}`
  );

  // Apply tryCatch logic internally
  try {
    // Await params resolution at the beginning
    const resolvedParams = await params;
    const campaignId = resolvedParams.campaignId;
    const step = parseInt(resolvedParams.step, 10);
    const { userId: clerkUserId, orgId } = await auth(); // Fetch Clerk user and org IDs
    logger.info(`[WIZARD_PATCH_PERF] Auth check completed in ${Date.now() - handlerStartTime}ms`);

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

    const dbConnectStartTime = Date.now();
    // Connect to database
    await connectToDatabase();
    logger.info(`[WIZARD_PATCH_PERF] Database connected in ${Date.now() - dbConnectStartTime}ms`);

    // Fetch current campaign state
    const fetchCampaignStartTime = Date.now();
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
    logger.info(
      `[WIZARD_PATCH_PERF] Fetched current campaign in ${Date.now() - fetchCampaignStartTime}ms`
    );

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

    const validationStartTime = Date.now();
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
    logger.info(
      `[WIZARD_PATCH_PERF] Validation completed in ${Date.now() - validationStartTime}ms`
    );
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
      // IMPORTANT: Do NOT save dataToSave.assets (client-side optimistic/potentially stale assets)
      // into CampaignWizard.assets (Json[] field).
      // The CreativeAsset table is the SSOT for Mux assets.
      // We only save other step-specific fields here if any (e.g., targetPlatforms).
      if (dataToSave.targetPlatforms !== undefined)
        mappedData.targetPlatforms = dataToSave.targetPlatforms ?? [];
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
      const prismaUpdateStartTime = Date.now();
      updatedCampaign = await prisma.campaignWizard.update({
        where: { id: campaignId },
        data: transformedDataForDb,
        include: {
          Influencer: true,
          submission: true,
          creativeAssets: true,
        },
      });
      logger.info(
        `[WIZARD_PATCH_PERF] Prisma campaign update completed in ${Date.now() - prismaUpdateStartTime}ms`
      );
      console.log(
        `[DB Update - Step ${step}] Prisma update successful. Result:`,
        JSON.stringify(updatedCampaign, null, 2)
      );
    } catch (dbError: unknown) {
      console.error(`[DB Update - Step ${step}] Prisma update FAILED:`, dbError);
      let detailedMessage = 'Database update failed.';
      if (dbError instanceof Error) {
        detailedMessage += ` Cause: ${dbError.message}`;
      }
      throw new BadRequestError(detailedMessage);
    }

    // --- CampaignWizardSubmission Creation/Update Logic ---
    let finalSubmissionId = updatedCampaign.submissionId;
    let submissionWasCreatedOrUpdated = false;
    let campaignDataForResponse = updatedCampaign; // Initialize with the campaign data we just updated/fetched

    // Create CampaignWizardSubmission if Step 3 is being completed and no submission exists yet
    if (step === 3 && transformedDataForDb.step3Complete && !finalSubmissionId) {
      logger.info(
        `[WIZARD_PATCH_PERF] Step 3 complete for CW ${campaignId}, submissionId is null. Creating CampaignWizardSubmission.`
      );
      const wizardDataForSubmission = await prisma.campaignWizard.findUnique({
        // Re-fetch to ensure all data is current for submission
        where: { id: campaignId },
        include: {
          Influencer: true,
          creativeAssets: true,
        },
      });

      if (!wizardDataForSubmission)
        throw new NotFoundError('CampaignWizard not found for submission creation.');

      try {
        const submissionResultId = await prisma.$transaction(async tx => {
          let pcRecordId: number;
          if (
            wizardDataForSubmission.primaryContact &&
            typeof wizardDataForSubmission.primaryContact === 'object'
          ) {
            const pcData = wizardDataForSubmission.primaryContact as any;
            if (pcData.firstName && pcData.surname && pcData.email) {
              const createdPC = await tx.primaryContact.create({
                data: {
                  firstName: pcData.firstName,
                  surname: pcData.surname,
                  email: pcData.email,
                  position: pcData.position
                    ? EnumTransformers.positionToBackend(pcData.position)
                    : Position.Associate,
                },
              });
              pcRecordId = createdPC.id;
            } else {
              throw new BadRequestError('Primary contact details incomplete.');
            }
          } else {
            throw new BadRequestError('Primary contact missing.');
          }

          let scRecordId: number | null = null;
          if (
            wizardDataForSubmission.secondaryContact &&
            typeof wizardDataForSubmission.secondaryContact === 'object' &&
            Object.keys(wizardDataForSubmission.secondaryContact).length > 0
          ) {
            const scData = wizardDataForSubmission.secondaryContact as any;
            if (scData.firstName && scData.surname && scData.email) {
              const createdSC = await tx.secondaryContact.create({
                data: {
                  firstName: scData.firstName,
                  surname: scData.surname,
                  email: scData.email,
                  position: scData.position
                    ? EnumTransformers.positionToBackend(scData.position)
                    : Position.Associate,
                },
              });
              scRecordId = createdSC.id;
            }
          }

          // CRITICAL TODO: Review and complete this mapping with actual data from wizardDataForSubmission
          const submissionCreateData: Prisma.CampaignWizardSubmissionCreateInput = {
            campaignName: wizardDataForSubmission.name || 'Untitled Campaign',
            description: wizardDataForSubmission.businessGoal || 'N/A',
            startDate: wizardDataForSubmission.startDate || new Date(),
            endDate: wizardDataForSubmission.endDate || new Date(),
            timeZone: wizardDataForSubmission.timeZone || 'UTC',
            contacts: JSON.stringify({
              p: wizardDataForSubmission.primaryContact,
              s: wizardDataForSubmission.secondaryContact,
            }),
            currency: (wizardDataForSubmission.budget as any)?.currency
              ? EnumTransformers.currencyToBackend((wizardDataForSubmission.budget as any).currency)
              : Currency.USD,
            totalBudget: (wizardDataForSubmission.budget as any)?.total || 0,
            socialMediaBudget: (wizardDataForSubmission.budget as any)?.socialMedia || 0,
            platform: wizardDataForSubmission.targetPlatforms?.[0]
              ? EnumTransformers.platformToBackend(wizardDataForSubmission.targetPlatforms[0])
              : Platform.INSTAGRAM,
            influencerHandle: wizardDataForSubmission.Influencer?.[0]?.handle || 'N/A',
            primaryContact: { connect: { id: pcRecordId } },
            ...(scRecordId && { secondaryContact: { connect: { id: scRecordId } } }),
            mainMessage: (wizardDataForSubmission.messaging as any)?.mainMessage || 'N/A',
            hashtags: JSON.stringify((wizardDataForSubmission.messaging as any)?.hashtags || []),
            memorability: (wizardDataForSubmission.expectedOutcomes as any)?.memorability || 'N/A',
            keyBenefits: JSON.stringify(
              (wizardDataForSubmission.messaging as any)?.keyBenefits || []
            ),
            expectedAchievements:
              (wizardDataForSubmission.expectedOutcomes as any)?.brandPerception || 'N/A', // Placeholder, review mapping
            purchaseIntent:
              (wizardDataForSubmission.expectedOutcomes as any)?.purchaseIntent || 'N/A',
            brandPerception:
              (wizardDataForSubmission.expectedOutcomes as any)?.brandPerception || 'N/A',
            primaryKPI: wizardDataForSubmission.primaryKPI
              ? EnumTransformers.kpiToBackend(wizardDataForSubmission.primaryKPI)
              : KPI.BRAND_AWARENESS,
            secondaryKPIs:
              wizardDataForSubmission.secondaryKPIs?.map(kpi =>
                EnumTransformers.kpiToBackend(kpi as string)
              ) || [],
            features:
              wizardDataForSubmission.features?.map(f =>
                EnumTransformers.featureToBackend(f as string)
              ) || [],
            user: { connect: { id: internalUserId } },
            submissionStatus: SubmissionStatus.draft,
          };

          const newSubmission = await tx.campaignWizardSubmission.create({
            data: submissionCreateData,
          });
          await tx.campaignWizard.update({
            where: { id: campaignId },
            data: { submissionId: newSubmission.id, currentStep: 4 },
          });
          return newSubmission.id;
        });
        finalSubmissionId = submissionResultId;
        submissionWasCreatedOrUpdated = true;
        logger.info(
          `[WIZARD_PATCH_PERF] CampaignWizardSubmission ${finalSubmissionId} created for CW ${campaignId}.`
        );
      } catch (error) {
        logger.error(
          `[WIZARD_PATCH_PERF] Failed to create CampaignWizardSubmission for CW ${campaignId}:`
        );
        if (error instanceof Error) {
          logger.error('Error details:', {
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack,
          });
        } else {
          logger.error('Raw error details:', { errorDetails: error });
        }
        throw new Error(
          `Failed to create campaign submission: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    // Finalize CampaignWizardSubmission status if wizard is being submitted in Step 5
    else if (step === 5) {
      const wizardIsBeingSubmitted =
        mappedData.status &&
        (mappedData.status === Status.SUBMITTED ||
          mappedData.status === Status.APPROVED ||
          mappedData.status === Status.COMPLETED);
      if (wizardIsBeingSubmitted && finalSubmissionId) {
        const submissionIdForUpdate = finalSubmissionId;
        logger.info(
          `Wizard ${campaignId} submitted. Updating CWS ${submissionIdForUpdate} status and linking assets.`
        );
        try {
          await prisma.$transaction(async tx => {
            // Update CampaignWizardSubmission status
            await tx.campaignWizardSubmission.update({
              where: { id: submissionIdForUpdate },
              data: { submissionStatus: SubmissionStatus.submitted },
            });

            // Link CreativeAssets from CampaignWizard to the CampaignWizardSubmission
            const updatedAssets = await tx.creativeAsset.updateMany({
              where: {
                campaignWizardId: campaignId,
                // @ts-ignore // Assuming Prisma handles `null` correctly for an optional Int field filter
                submissionId: null,
              },
              data: {
                submissionId: submissionIdForUpdate,
              },
            });
            logger.info(
              `Linked ${updatedAssets.count} assets to submission ${submissionIdForUpdate}.`
            );
          });
          submissionWasCreatedOrUpdated = true;
        } catch (error: unknown) {
          const logMessage = `Failed to update status or link assets for CWS ${submissionIdForUpdate}:`;
          if (error instanceof Error) {
            logger.error(logMessage, {
              errorName: error.name,
              errorMessage: error.message,
              stack: error.stack,
            });
          } else {
            logger.error(logMessage, { errorDetails: error });
          }
        }
      } else if (wizardIsBeingSubmitted && !finalSubmissionId) {
        logger.error(`Wizard ${campaignId} submitted, but no submissionId linked.`);
      }
    }

    // If submission was created/updated, refetch campaignDataForResponse to include all latest data + relations
    if (submissionWasCreatedOrUpdated) {
      const refetchedCampaign = await prisma.campaignWizard.findUnique({
        where: { id: campaignId },
        include: {
          Influencer: true,
          submission: true,
          creativeAssets: true,
        },
      });
      if (refetchedCampaign) campaignDataForResponse = refetchedCampaign;
    }
    // --- End CampaignWizardSubmission Logic ---

    // --- Influencer Handling (only if DB update succeeded) ---
    const influencerData = body.Influencer;
    // Use the result from the main update as the default
    let messageSuffix = '';

    if (step === 1 && influencerData != null && Array.isArray(influencerData)) {
      console.log('Updating influencers for wizard campaign (Step 1):', campaignId);
      try {
        const influencerTxStartTime = Date.now();
        await prisma.$transaction(async tx => {
          await tx.influencer.deleteMany({ where: { campaignId } });
          console.log('Deleted existing influencers for campaign:', campaignId);
          const influencerCreateData = influencerData
            .filter(
              (inf: unknown): inf is ApiInfluencer =>
                inf != null && typeof inf === 'object' && 'handle' in inf && 'platform' in inf
            )
            .map((inf: ApiInfluencer) => ({
              id:
                typeof inf.id === 'string'
                  ? inf.id
                  : `inf-${Date.now()}-${Math.round(Math.random() * 1000)}`,
              platform: EnumTransformers.platformToBackend(inf.platform as string),
              handle: inf.handle as string,
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
        logger.info(
          `[WIZARD_PATCH_PERF] Influencer transaction completed in ${Date.now() - influencerTxStartTime}ms`
        );
        // Refetch into a temporary variable to get updated influencers
        const refetchCampaignStartTime = Date.now();
        const refetchedCampaign = await prisma.campaignWizard.findUnique({
          where: { id: campaignId },
          include: {
            Influencer: true,
            submission: true, // Ensure submission is included here as well
            creativeAssets: true,
          },
        });
        logger.info(
          `[WIZARD_PATCH_PERF] Refetch after influencer TX completed in ${Date.now() - refetchCampaignStartTime}ms`
        );
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
    // If submission was just created, refetch campaignDataForResponse to include the new submissionId and updated currentStep
    if (submissionWasCreatedOrUpdated) {
      const refetchedCampaignWithSubmission = await prisma.campaignWizard.findUnique({
        where: { id: campaignId },
        include: {
          Influencer: true,
          submission: true,
          creativeAssets: true,
        },
      });
      if (refetchedCampaignWithSubmission) {
        campaignDataForResponse = refetchedCampaignWithSubmission;
        messageSuffix += ' and submission initialized';
      } else {
        logger.error(`Failed to refetch CampaignWizard ${campaignId} after submission creation.`);
        // campaignDataForResponse remains as is, but submissionId might be stale if only in finalSubmissionId var
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

    // Define mappedResponseAssets here to ensure it's in scope for responsePayload
    let mappedResponseAssetsForPATCH: any[] = [];

    // Index the updated campaign in Algolia
    if (campaignDataForResponse) {
      // BEGIN SSOT ASSET MAPPING FOR RESPONSE
      if (
        campaignDataForResponse.creativeAssets &&
        Array.isArray(campaignDataForResponse.creativeAssets)
      ) {
        logger.info('[WIZARD PATCH API] Mapping creativeAssets for response.');
        mappedResponseAssetsForPATCH = campaignDataForResponse.creativeAssets.map((ca: any) => ({
          id: String(ca.id),
          internalAssetId: ca.id,
          name: String(ca.name ?? ''),
          fileName: String(ca.fileName ?? ca.name ?? ''),
          type: String(ca.type ?? 'video'),
          description: String(ca.description ?? ''),
          url: ca.url ?? undefined,
          fileSize: ca.fileSize ?? undefined,
          muxAssetId: ca.muxAssetId ?? undefined,
          muxPlaybackId: ca.muxPlaybackId ?? undefined,
          muxProcessingStatus: ca.muxProcessingStatus ?? undefined,
          duration: ca.duration ?? undefined,
          userId: ca.userId ?? undefined,
          createdAt: ca.createdAt?.toISOString() ?? undefined,
          updatedAt: ca.updatedAt?.toISOString() ?? undefined,
          isPrimaryForBrandLiftPreview: ca.isPrimaryForBrandLiftPreview ?? false,
          // Fields not on CreativeAsset model, to be handled by frontend state if needed
          rationale: '',
          budget: undefined,
          associatedInfluencerIds: [],
        }));
      } else {
        logger.info(
          '[WIZARD PATCH API] No creativeAssets found on campaignDataForResponse to map for response. campaignDataForResponse.assets (Json[]) will be used if it exists, or empty.'
        );
        mappedResponseAssetsForPATCH =
          campaignDataForResponse.assets && Array.isArray(campaignDataForResponse.assets)
            ? campaignDataForResponse.assets
            : [];
      }
      // END SSOT ASSET MAPPING FOR RESPONSE

      const algoliaIndexStartTime = Date.now();
      // Fire and forget Algolia indexing for faster API response
      addOrUpdateCampaignInAlgolia(campaignDataForResponse as any)
        .then(() => {
          logger.info(
            `[WIZARD_PATCH_PERF] Algolia indexing completed in background in ${Date.now() - algoliaIndexStartTime}ms`
          );
          logger.info(
            `PATCH Step ${step}: Successfully indexed updated campaign in Algolia (background)`,
            {
              campaignId,
            }
          );
        })
        .catch(algoliaError => {
          logger.error(
            `PATCH Step ${step}: Failed to index updated campaign in Algolia (background)`,
            {
              campaignId,
              error: algoliaError,
            }
          );
        });
      // Log immediate dispatch, not completion
      logger.info(
        `[WIZARD_PATCH_PERF] Algolia indexing dispatched to background. Main handler continues.`
      );
    } else {
      logger.warn(
        `PATCH Step ${step}: campaignDataForResponse was null, skipping Algolia indexing.`,
        { campaignId }
      );
    }

    const responsePayload = {
      success: true,
      data: campaignDataForResponse
        ? {
            ...EnumTransformers.transformObjectFromBackend(campaignDataForResponse),
            submissionId: finalSubmissionId,
            assets: mappedResponseAssetsForPATCH, // Use the correctly scoped and mapped assets
          }
        : null,
      message: `Step ${step} updated${messageSuffix}`,
    };

    logger.info(`[WIZARD_PATCH_PERF] Handler finished in ${Date.now() - handlerStartTime}ms`);
    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
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
        submission: true, // Eager load the related CampaignWizardSubmission
        creativeAssets: true, // ***** Ensure creativeAssets is fetched for GET too *****
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const transformedCampaign = EnumTransformers.transformObjectFromBackend(campaign);

    // SSOT Asset Mapping for GET response
    let responseAssetsForGET = [];
    if (campaign.creativeAssets && Array.isArray(campaign.creativeAssets)) {
      logger.info('[WIZARD GET API] Mapping creativeAssets for response.');
      responseAssetsForGET = campaign.creativeAssets.map((ca: any) => ({
        id: String(ca.id),
        internalAssetId: ca.id,
        name: String(ca.name ?? ''),
        fileName: String(ca.fileName ?? ca.name ?? ''),
        type: String(ca.type ?? 'video'),
        description: String(ca.description ?? ''),
        url: ca.url ?? undefined,
        fileSize: ca.fileSize ?? undefined,
        muxAssetId: ca.muxAssetId ?? undefined,
        muxPlaybackId: ca.muxPlaybackId ?? undefined,
        muxProcessingStatus: ca.muxProcessingStatus ?? undefined,
        duration: ca.duration ?? undefined,
        userId: ca.userId ?? undefined,
        createdAt: ca.createdAt?.toISOString() ?? undefined,
        updatedAt: ca.updatedAt?.toISOString() ?? undefined,
        isPrimaryForBrandLiftPreview: ca.isPrimaryForBrandLiftPreview ?? false,
        rationale: '',
        budget: undefined,
        associatedInfluencerIds: [],
      }));
    } else {
      logger.info(
        '[WIZARD GET API] No creativeAssets found on campaign to map for response. Using campaign.assets (Json[]) if available.'
      );
      responseAssetsForGET =
        campaign.assets && Array.isArray(campaign.assets) ? campaign.assets : [];
    }

    // Ensure submissionId is at the top level if it came via the relation
    const responseData = {
      ...transformedCampaign,
      assets: responseAssetsForGET, // ***** USE THE NEWLY MAPPED ASSETS for GET response *****
      submissionId: campaign.submissionId, // Explicitly ensure direct field is present, even if relation is also transformed
    };

    return NextResponse.json({
      success: true,
      data: responseData,
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
