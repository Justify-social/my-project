import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  Prisma,
  Platform, // Restore Platform
  // Position, // Unused
  // KPI, // Unused
  // Currency, // Unused
  SubmissionStatus,
  // CreativeAssetType, // Unused
  // Feature, // Unused
  Status,
  CampaignWizardSubmission,
} from '@prisma/client';
import { prisma } from '@/lib/db';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';
import { v4 as uuidv4 } from 'uuid';
// import { withValidation, tryCatch } from '@/lib/middleware/api'; // tryCatch unused, withValidation used later
import { withValidation } from '@/lib/middleware/api';
import {
  // DraftCampaignDataSchema, // Unused
  ContactSchema,
  BudgetSchema,
  InfluencerSchema,
  KPIEnum,
  FeatureEnum,
  StatusEnum,
  DraftAssetSchema,
  LocationSchema,
  DemographicsSchema,
} from '@/components/features/campaigns/types';
// import { formatCampaignDataForResponse } from '@/utils/api-response-formatter'; // Unused
// import { handleDbError, validateRequest } from '@/lib/middleware/api'; // Unused
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import logger from '@/lib/logger'; // Import shared logger
import { handleApiError } from '@/lib/apiErrorHandler'; // Import shared error handler
import { BadRequestError, ForbiddenError, UnauthenticatedError, NotFoundError } from '@/lib/errors'; // Import custom errors
import { auth } from '@clerk/nextjs/server'; // Assuming Clerk setup
import { tryCatch } from '@/lib/middleware/api/util-middleware'; // Corrected path and function name

// Define interface for influencer data from request body (used in POST)
interface ApiInfluencer {
  id?: string | number | null;
  handle?: string | null;
  platform?: string | null;
  platformId?: string | null;
  // Add other potential fields if they exist
}

// Define schemas for campaign creation validation
// Note: Frontend uses 'Instagram', backend uses 'INSTAGRAM' - transformation required
// const influencerSchema = z
//   .object({
//     name: z.string().optional().default(''),
//     handle: z.string().min(1, 'Handle is required'),
//     // Accept any platform format - transformation will handle it
//     platform: z.string(),
//     id: z.string().optional(),
//     url: z.string().optional().default(''),
//     posts: z.number().optional().default(0),
//     videos: z.number().optional().default(0),
//     reels: z.number().optional().default(0),
//     stories: z.number().optional().default(0),
//   })
//   .optional();

// Define a more flexible influencer schema specifically for drafts
const _draftInfluencerSchema = z
  .object({
    name: z.string().optional().default(''),
    handle: z.string().optional().default(''), // Make handle optional for drafts
    platform: z.string().optional().default(''), // Make platform optional for drafts
    id: z.string().optional(),
    url: z.string().optional().default(''),
    posts: z.number().optional().default(0),
    videos: z.number().optional().default(0),
    reels: z.number().optional().default(0),
    stories: z.number().optional().default(0),
  })
  .optional();

// Position has the same format in frontend and backend
// const contactSchema = z
//   .object({
//     firstName: z.string().min(1, 'First name is required').optional(),
//     surname: z.string().min(1, 'Surname is required').optional(),
//     email: z.string().email('Valid email is required').optional(),
//     position: z.string().optional(),
//   })
//   .optional();

// const audienceSchema = z.object({
//   description: z.string().optional().default(''),
//   size: z.number().optional().default(0),
//   age1824: z.number().optional().default(0),
//   age2534: z.number().optional().default(0),
//   age3544: z.number().optional().default(0),
//   age4554: z.number().optional().default(0),
//   age5564: z.number().optional().default(0),
//   age65plus: z.number().optional().default(0),
// });

// const creativeAssetSchema = z.object({
//   type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']).default('IMAGE'),
//   url: z.string().optional().default(''),
//   description: z.string().optional().default(''),
// });

// const creativeRequirementSchema = z.object({
//   description: z.string().min(1, 'Description is required'),
//   priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
// });

// Unused Schema
/*
// ... existing code ...
*/

// Restore campaignUpdateSchema definition
const campaignUpdateSchema = z.object({
  id: z.string().uuid('Invalid campaign ID format'),
  campaignName: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  step: z.number().optional(),
});

// Unused Schema
/*
// Define a more flexible schema for campaign drafts
// This schema has minimal validations to allow partial completion
const campaignDraftSchema = z.object({
  name: z.string().optional().default('Untitled Campaign'),
  businessGoal: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeZone: z.string().optional(),
  // Make contacts optional with minimal validation
  primaryContact: z.any().optional(),
  secondaryContact: z.any().optional(),
  additionalContacts: z.array(z.any()).optional(),
  influencers: z.array(z.any()).optional(),
  // Accept any string format for enums
  currency: z.string().optional(),
  totalBudget: z.union([z.string(), z.number()]).optional(),
  socialMediaBudget: z.union([z.string(), z.number()]).optional(),
  // Exchange rate data
  exchangeRateData: z.any().optional(),
  // Status field to identify drafts
  status: z.string().optional(),
  // Allow any step number
  step: z.number().optional(),
  // Other fields
  audience: z.any().optional(),
  creativeAssets: z.array(z.any()).optional(),
  creativeRequirements: z.array(z.any()).optional(),
  budget: z.any().optional(),
  // Any other fields might be included
  platform: z.string().optional(),
  primaryKPI: z.string().optional(),
  secondaryKPIs: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});
*/

// Unused Schema
/*
// Create a more flexible campaign schema that works for both drafts and complete submissions
const campaignFlexibleSchema = z.object({
  // Always required, even for drafts
  name: z.string().min(1, 'Campaign name is required'),

  // Optional fields for drafts, but may be required for complete submissions
  businessGoal: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeZone: z.string().optional(),

  // Contact fields with flexible validation
  primaryContact: contactSchema.optional(),
  secondaryContact: contactSchema.optional(),
  additionalContacts: z.array(contactSchema).optional(),

  // Campaign details
  influencers: z.array(draftInfluencerSchema).optional(), // Use the more flexible draft schema
  currency: z.string().optional(),
  totalBudget: z.union([z.string(), z.number()]).optional(),
  socialMediaBudget: z.union([z.string(), z.number()]).optional(),

  // Additional fields
  audience: audienceSchema.optional(),
  creativeAssets: z.array(creativeAssetSchema).optional(),
  creativeRequirements: z.array(creativeRequirementSchema).optional(),

  // Draft status indicator
  status: z.enum(['draft', 'complete']).optional(),

  // Step tracking
  step: z.number().optional(),

  // Other fields
  exchangeRateData: z.any().optional(),
  budget: z.any().optional(),
});
*/

// Define a specific schema for the POST API endpoint validation
const CampaignPostApiSchema = z
  .object({
    id: z.string().optional(),
    createdAt: z
      .string()
      .datetime({ offset: true, message: 'Invalid ISO date string' })
      .nullable()
      .optional(), // Expect string
    updatedAt: z
      .string()
      .datetime({ offset: true, message: 'Invalid ISO date string' })
      .nullable()
      .optional(), // Expect string
    currentStep: z.number().default(1),
    isComplete: z.boolean().default(false),
    status: StatusEnum.default('DRAFT'),
    name: z.string().min(1, { message: 'Campaign name is required' }),
    businessGoal: z.string().nullable().optional(),
    brand: z.string().min(1, { message: 'Brand name is required' }),
    website: z.string().url({ message: 'Invalid website URL' }).nullable().optional(),
    // Use z.string().datetime() for API date string handling
    startDate: z
      .string()
      .datetime({ offset: true, message: 'Invalid ISO date string' })
      .nullable()
      .optional(), // Expect string
    endDate: z
      .string()
      .datetime({ offset: true, message: 'Invalid ISO date string' })
      .nullable()
      .optional(), // Expect string
    timeZone: z.string().nullable().optional(),
    primaryContact: ContactSchema.nullable().optional(),
    secondaryContact: z.preprocess(val => {
      const contact = val as Partial<z.infer<typeof ContactSchema>> | null;
      if (
        contact &&
        typeof contact === 'object' &&
        !contact.firstName &&
        !contact.surname &&
        !contact.email
      ) {
        return null;
      }
      return val;
    }, ContactSchema.nullable().optional()),
    additionalContacts: z.array(ContactSchema).default([]),
    budget: BudgetSchema.nullable().optional(),
    Influencer: z
      .array(
        InfluencerSchema.extend({
          // Ensure Influencer schema expects string dates here too
          createdAt: z
            .string()
            .datetime({ offset: true, message: 'Invalid ISO date string' })
            .nullable()
            .optional(),
          updatedAt: z
            .string()
            .datetime({ offset: true, message: 'Invalid ISO date string' })
            .nullable()
            .optional(),
        })
      )
      .optional(),
    step1Complete: z.boolean().default(false),
    primaryKPI: KPIEnum.nullable().optional(),
    secondaryKPIs: z.array(KPIEnum).nullable().optional(),
    messaging: z.object({}).passthrough().nullable().optional(),
    expectedOutcomes: z.object({}).passthrough().nullable().optional(),
    features: z.array(FeatureEnum).nullable().optional(),
    step2Complete: z.boolean().default(false),
    demographics: DemographicsSchema.nullable().optional(),
    locations: z.array(LocationSchema).nullable().optional(),
    targeting: z.object({}).passthrough().nullable().optional(),
    competitors: z.array(z.string()).nullable().optional(),
    step3Complete: z.boolean().default(false),
    assets: z.array(DraftAssetSchema).default([]),
    guidelines: z.string().nullable().optional(),
    requirements: z
      .array(z.object({ description: z.string(), mandatory: z.boolean() }))
      .default([]),
    notes: z.string().nullable().optional(),
    step4Complete: z.boolean().default(false),
    userId: z.string().nullable().optional(),
  })
  .passthrough()
  // Re-apply refinements needed for API validation (budget, dates)
  .refine(
    data => {
      if (data.budget?.socialMedia != null && data.budget?.total != null) {
        return data.budget.socialMedia <= data.budget.total;
      }
      return true;
    },
    {
      message: 'Social media budget cannot exceed total budget',
      path: ['budget', 'socialMedia'],
    }
  )
  .refine(
    data => {
      try {
        // Ensure dates are valid ISO strings before comparison
        if (
          data.startDate &&
          data.endDate &&
          z.string().datetime({ offset: true }).safeParse(data.startDate).success &&
          z.string().datetime({ offset: true }).safeParse(data.endDate).success
        ) {
          // Compare Date objects created from strings
          return new Date(data.endDate) >= new Date(data.startDate);
        }
      } catch {
        return false;
      } // Prefix unused variable
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

// Schema for validating expected query parameters for this specific endpoint usage
const queryParamsSchema = z.object({
  // user_accessible is conceptually required for security, default to true if not specified for this context
  user_accessible: z
    .string()
    .optional()
    .refine(val => val === undefined || val === 'true', {
      message: "user_accessible must be 'true' or omitted for this context",
    })
    .default('true'),
  // status=completed is required for the campaign selection UI in Brand Lift
  status: z
    .string()
    .optional()
    .refine(val => val === undefined || val === 'completed', {
      message: "status must be 'completed' or omitted for this context",
    })
    .default('completed'),
});

// Schema for query params for listing campaigns, specifically for Brand Lift use case
const listCampaignsQuerySchema = z.object({
  status: z.nativeEnum(SubmissionStatus).optional(),
  // Removed user_accessible as orgId check handles this
});

// Define the type for the selected campaign data
type SelectedCampaignData = Pick<
  CampaignWizardSubmission,
  'id' | 'campaignName' | 'createdAt' | 'submissionStatus'
>;

export const GET = async (req: NextRequest) => {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      // Throw consistent error
      throw new UnauthenticatedError('Authentication required.');
    }

    const searchParams = req.nextUrl.searchParams;
    const statusParam = searchParams.get('status'); // This will be null if no param is sent

    // Prepare the object for Zod parsing.
    // If statusParam is null, objectToParse will be {}, and .optional() in Zod will handle it.
    // If statusParam is a string, it will be included for validation against the enum.
    const objectToParse: { status?: string } = {}; // Zod will validate if this string is part of the enum

    if (statusParam !== null) {
      // Only if status query param is present
      if (statusParam.toLowerCase() === 'completed') {
        // Assuming SubmissionStatus.submitted is the string value like 'submitted'
        objectToParse.status = SubmissionStatus.submitted;
      } else {
        // For any other status string, pass it as is.
        // z.nativeEnum(SubmissionStatus) will validate if it's a correct enum string e.g. "draft".
        // If statusParam is "foo", Zod will correctly reject it.
        objectToParse.status = statusParam;
      }
    }
    // If statusParam is null, objectToParse remains {}.
    // safeParse({}) on a schema with an optional status field will result in data.status being undefined.

    const parsedParams = listCampaignsQuerySchema.safeParse(objectToParse);

    if (!parsedParams.success) {
      // Log the actual Zod error for better debugging
      logger.warn('API Zod Validation Error', {
        errors: parsedParams.error.format(), // Use .format() for readable errors
        method: req.method,
        url: req.url,
        statusCode: 400, // Keep for logging, handleApiError will set response status
      });
      // Throw the Zod error directly. handleApiError will format it for the response.
      throw parsedParams.error;
    }

    const { status: validatedStatus } = parsedParams.data; // validatedStatus will be undefined if no statusParam was provided

    const whereClause: Prisma.CampaignWizardSubmissionWhereInput = {
      userId: userId, // Assuming userId should always be part of the clause for security/data scoping
    };

    if (validatedStatus) {
      whereClause.submissionStatus = validatedStatus;
    }

    logger.info('Fetching campaigns for Brand Lift', {
      userId,
      whereClause,
    });

    const campaigns: SelectedCampaignData[] = await prisma.campaignWizardSubmission.findMany({
      where: whereClause,
      select: {
        id: true,
        campaignName: true,
        createdAt: true,
        submissionStatus: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const responseData = campaigns.map((c: SelectedCampaignData) => ({
      ...c,
      status: c.submissionStatus === SubmissionStatus.submitted ? 'COMPLETED' : 'DRAFT',
    }));

    logger.info(`Successfully fetched ${campaigns.length} campaigns for Brand Lift`, {
      userId,
      count: campaigns.length,
    });
    return NextResponse.json({ success: true, data: responseData });
  } catch (error: any) {
    logger.error('Error fetching campaigns', { error: error.message });
    return handleApiError(error, req);
  }
};

// Logic for postCampaignsHandler will be inlined into POST export
// const postCampaignsHandler = async (request: NextRequest, data: z.infer<typeof CampaignPostApiSchema>) => { ... };

// Inlining POST handler with validation and error handling
export const POST = async (request: NextRequest) => {
  try {
    // --- Start: Inlined withValidation logic ---
    if (!request.body) {
      return NextResponse.json(
        { success: false, error: 'Request body is required' },
        { status: 400 }
      );
    }
    const clone = request.clone();
    const body = await clone.json();
    const validationResult = CampaignPostApiSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('Campaign POST: Validation failed', { errors: validationResult.error.format() });
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    const data = validationResult.data; // This is the validated data
    logger.info('Campaign POST: Validated request body', { data });
    // --- End: Inlined withValidation logic ---

    // --- Start: Original postCampaignsHandler logic ---
    const { userId: clerkUserId, orgId } = await auth(); // Renamed to clerkUserId for clarity
    logger.info('Campaign POST: Auth details', { clerkUserId, orgId });

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Authentication required for POST' }, { status: 401 });
    }

    // Fetch the internal User record using the clerkUserId
    const userRecord = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }, // We only need the internal UUID (id)
    });

    if (!userRecord) {
      logger.error('Campaign POST: No User record found for clerkUserId', { clerkUserId });
      throw new NotFoundError('User record not found. Cannot create campaign.');
    }
    const internalUserId = userRecord.id; // This is the UUID
    logger.info('Campaign POST: Found internal User ID', { internalUserId, clerkUserId });

    logger.info('Campaign POST: Creating campaign', {
      internalUserId,
      orgId,
      campaignName: data.name,
    });

    // Import the EnumTransformers utility
    const { EnumTransformers } = await import('@/utils/enum-transformers');
    const transformedData = EnumTransformers.transformObjectToBackend(data);
    logger.info('Campaign POST: Transformed data for backend', { transformedData });

    const budgetData = transformedData.budget || { total: 0, currency: 'USD', socialMedia: 0 };
    const primaryContactJson = transformedData.primaryContact
      ? JSON.stringify(transformedData.primaryContact)
      : Prisma.JsonNull;
    const secondaryContactJson = transformedData.secondaryContact
      ? JSON.stringify(transformedData.secondaryContact)
      : Prisma.JsonNull;

    const dbData = {
      id: uuidv4(),
      name: transformedData.name,
      businessGoal: transformedData.businessGoal || '',
      brand: transformedData.brand || '',
      website: transformedData.website || null,
      startDate: transformedData.startDate ? new Date(transformedData.startDate) : new Date(),
      endDate: transformedData.endDate ? new Date(transformedData.endDate) : new Date(),
      timeZone: transformedData.timeZone || 'UTC',
      primaryContact: transformedData.primaryContact || Prisma.JsonNull,
      secondaryContact: transformedData.secondaryContact || Prisma.JsonNull,
      additionalContacts: transformedData.additionalContacts || [],
      budget: transformedData.budget || Prisma.JsonNull,
      primaryKPI: transformedData.primaryKPI,
      secondaryKPIs: transformedData.secondaryKPIs || [],
      features: transformedData.features || [],
      messaging: transformedData.messaging || Prisma.JsonNull,
      expectedOutcomes: transformedData.expectedOutcomes || Prisma.JsonNull,
      demographics: transformedData.demographics || Prisma.JsonNull,
      locations: transformedData.locations || [],
      targeting: transformedData.targeting || Prisma.JsonNull,
      competitors: transformedData.competitors || [],
      assets: transformedData.assets || [],
      status: Status.DRAFT,
      step1Complete: true,
      step2Complete: false,
      step3Complete: false,
      step4Complete: false,
      isComplete: false,
      currentStep: 1,
      updatedAt: new Date(),
      userId: internalUserId, // NEW WAY: Directly set the foreign key
    };
    logger.info('Campaign POST: Data prepared for DB create', { dbData });

    const campaign = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newCampaign = await tx.campaignWizard.create({
        data: dbData as Prisma.CampaignWizardCreateInput,
      });

      if (
        transformedData.Influencer &&
        Array.isArray(transformedData.Influencer) &&
        transformedData.Influencer.length > 0
      ) {
        const validInfluencers = transformedData.Influencer.filter(
          (inf: ApiInfluencer): inf is NonNullable<typeof inf> =>
            !!inf &&
            typeof inf === 'object' &&
            typeof inf.platform === 'string' &&
            !!inf.platform &&
            typeof inf.handle === 'string' &&
            !!inf.handle
        );

        for (const influencer of validInfluencers) {
          await tx.influencer.create({
            data: {
              id: influencer.id || uuidv4(),
              platform: influencer.platform as Platform,
              handle: influencer.handle,
              campaignId: newCampaign.id,
              updatedAt: new Date(),
            },
          });
        }
      }
      return newCampaign;
    });

    dbLogger.info(DbOperation.CREATE, 'Campaign created successfully', { campaignId: campaign.id });

    const campaignWithInfluencers = await prisma.campaignWizard.findUnique({
      where: { id: campaign.id },
      include: { Influencer: true },
    });

    const transformedCampaign =
      EnumTransformers.transformObjectFromBackend(campaignWithInfluencers);

    return NextResponse.json({
      success: true,
      data: transformedCampaign,
      message: 'Campaign created successfully',
    });
    // --- End: Original postCampaignsHandler logic ---
  } catch (error: any) {
    // --- Start: Inlined tryCatch logic ---
    logger.error('Campaign POST: Error occurred', { error: error.message, stack: error.stack });

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Inferring P2002 on CampaignWizard is likely due to name unique constraint (userId, name)
      // For more precision, you could check error.meta.target if it reliably shows the constraint fields.
      // Example: if (error.meta && Array.isArray(error.meta.target) && error.meta.target.includes('name'))
      logger.warn('Campaign POST: Prisma P2002 (Unique Constraint Violation) detected.', {
        target: error.meta?.target,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'A campaign with this name already exists. Please update the name.',
          errorCode: 'NAME_ALREADY_EXISTS',
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Using handleApiError directly, passing the original request
    return handleApiError(error, request);
    // --- End: Inlined tryCatch logic ---
  }
};

// Commenting out original HOF export for POST
// export const POST = tryCatch(
//   withValidation(CampaignPostApiSchema, postCampaignsHandler, {
//     entityName: 'Campaign',
//     logValidationErrors: true,
//     logRequestBody: true,
//   })
// );

// Logic for patchCampaignHandler will be inlined into PATCH export
// const patchCampaignHandler = async (request: NextRequest, data: z.infer<typeof campaignUpdateSchema>) => { ... };

// Inlining PATCH handler with validation and error handling
export const PATCH = async (request: NextRequest) => {
  try {
    // --- Start: Inlined withValidation logic ---
    if (!request.body) {
      return NextResponse.json(
        { success: false, error: 'Request body is required' },
        { status: 400 }
      );
    }
    const clone = request.clone();
    const body = await clone.json();
    const validationResult = campaignUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('Campaign PATCH: Validation failed', { errors: validationResult.error.format() });
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    const data = validationResult.data; // This is the validated data (includes id)
    logger.info('Campaign PATCH: Validated request body', { data });
    // --- End: Inlined withValidation logic ---

    // --- Start: Original patchCampaignHandler logic ---
    const { userId, orgId } = await auth();
    logger.info('Campaign PATCH: Auth details', { userId, orgId });

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required for PATCH' }, { status: 401 });
    }

    const { id, ...updateData } = data;

    // Addressing: // TODO: Check if updateData is empty after extracting id?
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('No update fields provided.');
    }

    logger.info('Campaign PATCH: Updating campaign', { userId, orgId, campaignId: id, updateData });

    // Authorization: Check if user/org has permission to update this campaignId
    const existingCampaign = await prisma.campaignWizard.findFirst({ where: { id, userId } }); // Check if campaign exists and belongs to user
    if (!existingCampaign)
      throw new NotFoundError('Campaign not found or not accessible for update.');

    const campaign = await prisma.campaignWizard.update({
      where: { id },
      data: {
        // Map fields from campaignUpdateSchema to CampaignWizard model
        name: updateData.campaignName,
        businessGoal: updateData.description,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
        currentStep: updateData.step,
        updatedAt: new Date(), // Always update timestamp
        // Add other potential fields from campaignUpdateSchema if needed
      },
    });

    // TODO: Consider if WizardHistory update is still needed/correct here
    try {
      await prisma.wizardHistory.create({
        data: {
          id: uuidv4(),
          wizardId: campaign.id,
          step: updateData.step ?? existingCampaign.currentStep ?? 1,
          timestamp: new Date(),
          action: 'UPDATE', // General update via this PATCH route
          changes: updateData, // Log the fields that were attempted to be updated
          performedBy: userId,
        },
      });
    } catch (error) {
      logger.error('Error creating wizard history during campaign update:', {
        campaignId: id,
        error,
      });
      // Continue with campaign update even if history creation fails
    }

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully',
    });
    // --- End: Original patchCampaignHandler logic ---
  } catch (error: any) {
    // --- Start: Inlined tryCatch logic ---
    logger.error('Campaign PATCH: Error occurred', { error: error.message, stack: error.stack });
    // Using handleApiError directly, passing the original request
    return handleApiError(error, request);
    // --- End: Inlined tryCatch logic ---
  }
};

// Commenting out original HOF export for PATCH
// export const PATCH = tryCatch(
//   withValidation(campaignUpdateSchema, patchCampaignHandler, {
//     entityName: 'Campaign',
//     logValidationErrors: true,
//   })
// );
