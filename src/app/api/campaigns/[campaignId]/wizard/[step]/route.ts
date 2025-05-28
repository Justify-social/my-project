import { z } from 'zod';
import { Prisma, Status, SubmissionStatus, CreativeAsset } from '@prisma/client';
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
  name?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean | null;
  followersCount?: number | null;
  engagementRate?: number | null;
  email?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  language?: string | null;
}

interface CreativeAssetClientPayload {
  id?: string | number;
  name?: string;
  type?: string;
  internalAssetId?: number;
  rationale?: string;
  budget?: number | null;
  associatedInfluencerIds?: string[];
  url?: string;
  fileSize?: number;
  muxAssetId?: string;
  muxPlaybackId?: string;
  muxProcessingStatus?: string;
  duration?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  isPrimaryForBrandLiftPreview?: boolean;
  fileName?: string;
  [key: string]: unknown;
}

// Validation schema for influencer data
const validateInfluencerData = (inf: ApiInfluencer): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!inf.handle || typeof inf.handle !== 'string' || inf.handle.trim().length === 0) {
    errors.push('handle is required and must be a non-empty string');
  }

  if (!inf.platform || typeof inf.platform !== 'string') {
    errors.push('platform is required and must be a valid string');
  }

  // Optional field validations
  if (inf.followersCount !== null && inf.followersCount !== undefined) {
    if (
      typeof inf.followersCount !== 'number' ||
      inf.followersCount < 0 ||
      inf.followersCount > 1000000000
    ) {
      errors.push('followersCount must be a positive number less than 1 billion');
    }
  }

  if (inf.engagementRate !== null && inf.engagementRate !== undefined) {
    if (
      typeof inf.engagementRate !== 'number' ||
      inf.engagementRate < 0 ||
      inf.engagementRate > 1
    ) {
      errors.push('engagementRate must be a number between 0 and 1');
    }
  }

  if (inf.avatarUrl && (typeof inf.avatarUrl !== 'string' || inf.avatarUrl.length > 2048)) {
    errors.push('avatarUrl must be a valid string with max length 2048 characters');
  }

  if (inf.name && (typeof inf.name !== 'string' || inf.name.length > 255)) {
    errors.push('name must be a string with max length 255 characters');
  }

  if (
    inf.email &&
    (typeof inf.email !== 'string' || !inf.email.includes('@') || inf.email.length > 255)
  ) {
    errors.push('email must be a valid email string with max length 255 characters');
  }

  if (inf.bio && (typeof inf.bio !== 'string' || inf.bio.length > 2000)) {
    errors.push('bio must be a string with max length 2000 characters');
  }

  return { isValid: errors.length === 0, errors };
};

// Safe ID generation with collision prevention
const generateSafeInfluencerId = (handle: string, platform: string): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const platformPrefix = platform.substring(0, 3).toLowerCase();
  const handlePrefix = handle
    .substring(0, 8)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  return `inf-${platformPrefix}-${handlePrefix}-${timestamp}-${randomSuffix}`;
};

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
      if (dataToSave.targetPlatforms !== undefined)
        mappedData.targetPlatforms = dataToSave.targetPlatforms ?? [];
      if (dataToSave.step4Complete !== undefined)
        mappedData.step4Complete = dataToSave.step4Complete;

      // ✅ REMOVED DUAL STORAGE: CreativeAsset table is now SSOT
      // Assets are managed directly via /api/creative-assets endpoints, not through JSON storage
      console.log('[API PATCH Step 4] Using CreativeAsset table as SSOT - no JSON assets storage');
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
    const finalSubmissionId = updatedCampaign.submissionId;
    let submissionWasCreatedOrUpdated = false;
    let campaignDataForResponse = updatedCampaign; // Initialize with the campaign data we just updated/fetched

    // Finalize CampaignWizardSubmission status if wizard is being submitted in Step 5
    if (step === 5) {
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

      // STEP 1: Validate all influencer data before any database operations
      const validationResults = influencerData.map((inf, index) => ({
        index,
        data: inf,
        validation: validateInfluencerData(inf as ApiInfluencer),
      }));

      const invalidInfluencers = validationResults.filter(result => !result.validation.isValid);

      if (invalidInfluencers.length > 0) {
        const errorDetails = invalidInfluencers
          .map(invalid => `Influencer ${invalid.index}: ${invalid.validation.errors.join(', ')}`)
          .join('; ');

        logger.error('[Influencer Update] Validation failed', {
          campaignId,
          errorDetails,
          invalidCount: invalidInfluencers.length,
          totalCount: influencerData.length,
        });

        throw new BadRequestError(`Influencer validation failed: ${errorDetails}`);
      }

      // STEP 2: Filter and prepare valid influencer data
      const validInfluencers = influencerData.filter(
        (inf: unknown): inf is ApiInfluencer =>
          inf != null && typeof inf === 'object' && 'handle' in inf && 'platform' in inf
      );

      if (validInfluencers.length === 0) {
        logger.warn('[Influencer Update] No valid influencers provided', { campaignId });
        // Continue without influencers - this might be intentional
      }

      // STEP 3: Prepare influencer data with comprehensive logging
      const influencerCreateData = validInfluencers.map((inf: ApiInfluencer) => {
        const safeId =
          typeof inf.id === 'string' && inf.id.length > 0
            ? inf.id
            : generateSafeInfluencerId(inf.handle as string, inf.platform as string);

        const preparedData = {
          id: safeId,
          platform: EnumTransformers.platformToBackend(inf.platform as string),
          handle: (inf.handle as string).trim(),
          campaignId: campaignId,
          updatedAt: new Date(),
          // Rich profile data fields with safe defaults
          name: inf.name?.trim() || null,
          avatarUrl: inf.avatarUrl?.trim() || null,
          isVerified: typeof inf.isVerified === 'boolean' ? inf.isVerified : null,
          followersCount:
            typeof inf.followersCount === 'number'
              ? Math.max(0, Math.floor(inf.followersCount))
              : null,
          engagementRate:
            typeof inf.engagementRate === 'number'
              ? Math.max(0, Math.min(1, inf.engagementRate))
              : null,
          email: inf.email?.trim() || null,
          bio: inf.bio?.trim() || null,
          location: inf.location?.trim() || null,
          website: inf.website?.trim() || null,
          language: inf.language?.trim() || null,
        };

        logger.info('[Influencer Update] Prepared influencer data', {
          campaignId,
          influencerId: safeId,
          handle: preparedData.handle,
          platform: preparedData.platform,
          hasRichData: !!(
            preparedData.name ||
            preparedData.avatarUrl ||
            preparedData.followersCount
          ),
        });

        return preparedData;
      });

      // STEP 4: Execute atomic transaction with comprehensive error handling
      try {
        const influencerTxStartTime = Date.now();

        await prisma.$transaction(
          async tx => {
            // Delete existing influencers
            const deleteResult = await tx.influencer.deleteMany({
              where: { campaignId },
            });

            logger.info('[Influencer Update] Deleted existing influencers', {
              campaignId,
              deletedCount: deleteResult.count,
            });

            // Create new influencers if any exist
            if (influencerCreateData.length > 0) {
              try {
                const createResult = await tx.influencer.createMany({
                  data: influencerCreateData,
                  skipDuplicates: true, // Handle potential ID collisions gracefully
                });

                logger.info('[Influencer Update] Created new influencers', {
                  campaignId,
                  expectedCount: influencerCreateData.length,
                  actualCount: createResult.count,
                  success: createResult.count === influencerCreateData.length,
                });

                if (createResult.count !== influencerCreateData.length) {
                  logger.warn(
                    '[Influencer Update] Some influencers were skipped due to duplicates',
                    {
                      campaignId,
                      expectedCount: influencerCreateData.length,
                      actualCount: createResult.count,
                      skippedCount: influencerCreateData.length - createResult.count,
                    }
                  );
                }
              } catch (createError) {
                logger.error('[Influencer Update] Failed to create influencers', {
                  campaignId,
                  error: createError,
                  dataAttempted: influencerCreateData.length,
                });
                throw createError; // Re-throw to trigger transaction rollback
              }
            } else {
              logger.info('[Influencer Update] No influencers to create', { campaignId });
            }
          },
          {
            timeout: 10000, // 10 second timeout for the transaction
            maxWait: 5000, // 5 second max wait to acquire connection
          }
        );

        logger.info('[Influencer Update] Transaction completed successfully', {
          campaignId,
          duration: Date.now() - influencerTxStartTime,
          influencerCount: influencerCreateData.length,
        });

        logger.info(
          `[WIZARD_PATCH_PERF] Influencer transaction completed in ${Date.now() - influencerTxStartTime}ms`
        );

        // STEP 5: Refetch campaign data with error handling
        const refetchCampaignStartTime = Date.now();
        const refetchedCampaign = await prisma.campaignWizard.findUnique({
          where: { id: campaignId },
          include: {
            Influencer: true,
            submission: true,
            creativeAssets: true,
          },
        });

        logger.info(
          `[WIZARD_PATCH_PERF] Refetch after influencer TX completed in ${Date.now() - refetchCampaignStartTime}ms`
        );

        if (refetchedCampaign) {
          campaignDataForResponse = refetchedCampaign;
          messageSuffix = ` with ${refetchedCampaign.Influencer.length} influencers`;

          logger.info('[Influencer Update] Successfully refetched campaign with influencers', {
            campaignId,
            influencerCount: refetchedCampaign.Influencer.length,
            hasRichData: refetchedCampaign.Influencer.some(
              inf => (inf as any).name || (inf as any).avatarUrl || (inf as any).followersCount
            ),
          });
        } else {
          logger.error(
            '[Influencer Update] Failed to refetch campaign after successful influencer update',
            {
              campaignId,
            }
          );
          messageSuffix = ' (influencer refetch failed)';
          // Don't throw here - influencers were saved successfully
        }
      } catch (transactionError: unknown) {
        logger.error('[Influencer Update] Transaction failed - all changes rolled back', {
          campaignId,
          error: transactionError,
          influencerCount: influencerCreateData.length,
          errorType:
            transactionError instanceof Error ? transactionError.constructor.name : 'Unknown',
        });

        // Determine if this is a recoverable error or should fail the entire request
        if (transactionError instanceof Error) {
          if (
            transactionError.message.includes('Unique constraint') ||
            transactionError.message.includes('timeout') ||
            transactionError.message.includes('connection')
          ) {
            // These are recoverable - campaign data is still saved
            messageSuffix = ' (influencer update failed - campaign saved)';
            logger.warn(
              '[Influencer Update] Continuing with campaign save despite influencer failure',
              {
                campaignId,
                reason: 'Recoverable error type',
              }
            );
          } else {
            // Unknown error - might indicate data corruption
            logger.error('[Influencer Update] Unknown error type - may need investigation', {
              campaignId,
              errorMessage: transactionError.message,
              errorStack: transactionError.stack,
            });
            messageSuffix = ' (influencer update error - data may be inconsistent)';
          }
        } else {
          messageSuffix = ' (influencer update error - unknown error type)';
        }
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
    let mappedResponseAssetsForPATCH: CreativeAssetClientPayload[] = [];

    // Index the updated campaign in Algolia
    if (campaignDataForResponse) {
      // BEGIN SSOT ASSET MAPPING FOR RESPONSE
      if (
        campaignDataForResponse.creativeAssets &&
        Array.isArray(campaignDataForResponse.creativeAssets) &&
        campaignDataForResponse.creativeAssets.length > 0
      ) {
        logger.info('[WIZARD PATCH API] Mapping creativeAssets for response.');
        mappedResponseAssetsForPATCH = campaignDataForResponse.creativeAssets.map(
          (ca: CreativeAsset): CreativeAssetClientPayload => ({
            id: String(ca.id),
            name: ca.name ?? '',
            type: ca.type ?? 'video',
            url: ca.url ?? '',
            description: ca.description ?? '',
            fileSize: ca.fileSize ?? 0,
            muxAssetId: ca.muxAssetId ?? '',
            muxPlaybackId: ca.muxPlaybackId ?? '',
            muxProcessingStatus: ca.muxProcessingStatus ?? 'PREPARING',
            duration: ca.duration ?? 0,
            userId: ca.userId ?? '',
            createdAt: ca.createdAt?.toISOString?.() ?? ca.createdAt?.toString?.() ?? '',
            updatedAt: ca.updatedAt?.toISOString?.() ?? ca.updatedAt?.toString?.() ?? '',
            isPrimaryForBrandLiftPreview: ca.isPrimaryForBrandLiftPreview ?? false,
          })
        );
      } else {
        logger.info(
          '[WIZARD PATCH API] No creativeAssets found on campaignDataForResponse to map for response. Using SSOT CreativeAsset table only.'
        );
        mappedResponseAssetsForPATCH = [];
      }
      // END SSOT ASSET MAPPING FOR RESPONSE

      const algoliaIndexStartTime = Date.now();
      // Fire and forget Algolia indexing for faster API response
      addOrUpdateCampaignInAlgolia(
        campaignDataForResponse as Prisma.CampaignWizardGetPayload<{
          include: { Influencer: true; submission: true; creativeAssets: true };
        }>
      )
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
            assets: mappedResponseAssetsForPATCH,
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
        submission: true,
        creativeAssets: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const transformedCampaign = EnumTransformers.transformObjectFromBackend(campaign);

    // SSOT Asset Mapping for GET response
    let responseAssetsForGET: CreativeAssetClientPayload[] = [];
    if (campaign.creativeAssets && Array.isArray(campaign.creativeAssets)) {
      logger.info('[WIZARD GET API] Mapping creativeAssets for response.');
      responseAssetsForGET = campaign.creativeAssets.map(
        (ca: CreativeAsset): CreativeAssetClientPayload => ({
          id: String(ca.id),
          name: ca.name ?? '',
          type: ca.type ?? 'video',
          url: ca.url ?? '',
          description: ca.description ?? '',
          fileSize: ca.fileSize ?? 0,
          muxAssetId: ca.muxAssetId ?? '',
          muxPlaybackId: ca.muxPlaybackId ?? '',
          muxProcessingStatus: ca.muxProcessingStatus ?? 'PREPARING',
          duration: ca.duration ?? 0,
          userId: ca.userId ?? '',
          createdAt: ca.createdAt?.toISOString?.() ?? ca.createdAt?.toString?.() ?? '',
          updatedAt: ca.updatedAt?.toISOString?.() ?? ca.updatedAt?.toString?.() ?? '',
          isPrimaryForBrandLiftPreview: ca.isPrimaryForBrandLiftPreview ?? false,
        })
      );
    } else {
      logger.info(
        '[WIZARD GET API] No creativeAssets found on campaign to map for response. Using SSOT CreativeAsset table only.'
      );
      responseAssetsForGET = [];
    }

    const responseData = {
      ...transformedCampaign,
      assets: responseAssetsForGET,
      submissionId: campaign.submissionId,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    const resolvedParams = await params;
    console.error(
      `Unhandled error in GET /api/campaigns/${resolvedParams.campaignId}/wizard/${resolvedParams.step}:`,
      error
    );
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
