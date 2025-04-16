import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  Prisma,
  Platform,
  Position,
  KPI,
  Currency,
  SubmissionStatus,
  CreativeAssetType,
  Feature,
  Status,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';
import { v4 as uuidv4 } from 'uuid';
import { withValidation, tryCatch } from '@/lib/middleware/api';
import {
  DraftCampaignDataSchema,
  ContactSchema,
  BudgetSchema,
  InfluencerSchema,
  KPIEnum,
  FeatureEnum,
  StatusEnum,
  DraftAssetSchema,
  LocationSchema,
  DemographicsSchema
} from '@/components/features/campaigns/types';

// Define schemas for campaign creation validation
// Note: Frontend uses 'Instagram', backend uses 'INSTAGRAM' - transformation required
const influencerSchema = z
  .object({
    name: z.string().optional().default(''),
    handle: z.string().min(1, 'Handle is required'),
    // Accept any platform format - transformation will handle it
    platform: z.string(),
    id: z.string().optional(),
    url: z.string().optional().default(''),
    posts: z.number().optional().default(0),
    videos: z.number().optional().default(0),
    reels: z.number().optional().default(0),
    stories: z.number().optional().default(0),
  })
  .optional();

// Define a more flexible influencer schema specifically for drafts
const draftInfluencerSchema = z
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
const contactSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').optional(),
    surname: z.string().min(1, 'Surname is required').optional(),
    email: z.string().email('Valid email is required').optional(),
    position: z.string().optional(),
  })
  .optional();

const audienceSchema = z.object({
  description: z.string().optional().default(''),
  size: z.number().optional().default(0),
  age1824: z.number().optional().default(0),
  age2534: z.number().optional().default(0),
  age3544: z.number().optional().default(0),
  age4554: z.number().optional().default(0),
  age5564: z.number().optional().default(0),
  age65plus: z.number().optional().default(0),
});

const creativeAssetSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']).default('IMAGE'),
  url: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

const creativeRequirementSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

const submissionSchema = z
  .object({
    primaryContact: contactSchema.optional(),
    secondaryContact: contactSchema.optional(),
    contacts: z.string().optional().default(''),
    // Backend expects UPPERCASE platform values
    platform: z.enum(['INSTAGRAM', 'YOUTUBE', 'TIKTOK']).default('INSTAGRAM'),
    mainMessage: z.string().optional().default(''),
    hashtags: z.string().optional().default(''),
    memorability: z.string().optional().default(''),
    keyBenefits: z.string().optional().default(''),
    expectedAchievements: z.string().optional().default(''),
    purchaseIntent: z.string().optional().default(''),
    brandPerception: z.string().optional().default(''),
    // Backend expects UPPERCASE_SNAKE_CASE KPI values
    primaryKPI: z
      .enum([
        'AD_RECALL',
        'BRAND_AWARENESS',
        'CONSIDERATION',
        'MESSAGE_ASSOCIATION',
        'BRAND_PREFERENCE',
        'PURCHASE_INTENT',
        'ACTION_INTENT',
        'RECOMMENDATION_INTENT',
        'ADVOCACY',
      ])
      .default('BRAND_AWARENESS'),
    secondaryKPIs: z.string().optional().default(''),
    features: z.string().optional().default(''),
    audiences: z.array(audienceSchema).optional().default([]),
    creativeAssets: z.array(creativeAssetSchema).optional().default([]),
    creativeRequirements: z.array(creativeRequirementSchema).optional().default([]),
  })
  .optional();

const campaignCreateSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  businessGoal: z.string().optional(),
  startDate: z.string().optional(), // Changed from datetime() to string() to be more flexible
  endDate: z.string().optional(), // Changed from datetime() to string() to be more flexible
  timeZone: z.string().optional(),
  primaryContact: contactSchema,
  secondaryContact: contactSchema,
  additionalContacts: z.array(contactSchema).optional(),
  influencers: z.array(influencerSchema).optional(),
  // Accept any of these formats for currency, budget
  currency: z.string().optional(),
  totalBudget: z.union([z.string(), z.number()]).optional(),
  socialMediaBudget: z.union([z.string(), z.number()]).optional(),
  // Exchange rate data
  exchangeRateData: z.any().optional(),
  // Status can be a string
  status: z.string().optional(),
  // Other fields
  audience: audienceSchema.optional(),
  creativeAssets: z.array(creativeAssetSchema).optional(),
  creativeRequirements: z.array(creativeRequirementSchema).optional(),
  budget: z.any().optional(), // Make budget an "any" type to be more flexible
});

const campaignUpdateSchema = z.object({
  id: z.string().uuid('Invalid campaign ID format'),
  campaignName: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  step: z.number().optional(),
});

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

// Define a specific schema for the POST API endpoint validation
const CampaignPostApiSchema = z.object({
  id: z.string().optional(),
  createdAt: z.string().datetime({ offset: true, message: "Invalid ISO date string" }).nullable().optional(), // Expect string
  updatedAt: z.string().datetime({ offset: true, message: "Invalid ISO date string" }).nullable().optional(), // Expect string
  currentStep: z.number().default(1),
  isComplete: z.boolean().default(false),
  status: StatusEnum.default('DRAFT'),
  name: z.string().min(1, { message: "Campaign name is required" }),
  businessGoal: z.string().nullable().optional(),
  brand: z.string().min(1, { message: "Brand name is required" }),
  website: z.string().url({ message: "Invalid website URL" }).nullable().optional(),
  // Use z.string().datetime() for API date string handling
  startDate: z.string().datetime({ offset: true, message: "Invalid ISO date string" }).nullable().optional(), // Expect string
  endDate: z.string().datetime({ offset: true, message: "Invalid ISO date string" }).nullable().optional(),   // Expect string
  timeZone: z.string().nullable().optional(),
  primaryContact: ContactSchema.nullable().optional(),
  secondaryContact: z.preprocess(
    (val) => {
      const contact = val as Partial<z.infer<typeof ContactSchema>> | null;
      if (contact && typeof contact === 'object' && !contact.firstName && !contact.surname && !contact.email) {
        return null;
      }
      return val;
    },
    ContactSchema.nullable().optional()
  ),
  additionalContacts: z.array(ContactSchema).default([]),
  budget: BudgetSchema.nullable().optional(),
  Influencer: z.array(InfluencerSchema.extend({ // Ensure Influencer schema expects string dates here too
    createdAt: z.string().datetime({ offset: true, message: "Invalid ISO date string" }).nullable().optional(),
    updatedAt: z.string().datetime({ offset: true, message: "Invalid ISO date string" }).nullable().optional(),
  })).optional(),
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
  requirements: z.array(z.object({ description: z.string(), mandatory: z.boolean() })).default([]),
  notes: z.string().nullable().optional(),
  step4Complete: z.boolean().default(false),
  userId: z.string().nullable().optional(),
}).passthrough()
  // Re-apply refinements needed for API validation (budget, dates)
  .refine(data => {
    if (data.budget?.socialMedia !== undefined && data.budget?.total !== undefined) {
      return data.budget.socialMedia <= data.budget.total;
    }
    return true;
  }, {
    message: "Social media budget cannot exceed total budget",
    path: ["budget", "socialMedia"],
  })
  .refine(data => {
    try {
      // Ensure dates are valid ISO strings before comparison
      if (data.startDate && data.endDate && z.string().datetime({ offset: true }).safeParse(data.startDate).success && z.string().datetime({ offset: true }).safeParse(data.endDate).success) {
        // Compare Date objects created from strings
        return new Date(data.endDate) >= new Date(data.startDate);
      }
    } catch (e) { return false; }
    return true;
  }, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

// GET handler - List campaigns
export async function GET(request: NextRequest) {
  // --- Add runtime logging for DATABASE_URL ---
  // console.log("[/api/campaigns GET] Runtime DATABASE_URL:", process.env.DATABASE_URL); // Keep commented out for now
  // -------------------------------------------
  try {
    // --- Low-level diagnostic: Check if table exists via raw SQL (REMOVED) ---
    // console.log("[/api/campaigns GET] Running raw query to check for CampaignWizard table...");
    // const tableExistsResult = await prisma.$queryRawUnsafe(
    //   `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'CampaignWizard');`
    // );
    // console.log("[/api/campaigns GET] Raw query result:", tableExistsResult);
    // // @ts-expect-error - Prisma types for raw queries can be complex
    // const tableExists = tableExistsResult?.[0]?.exists;
    // console.log("[/api/campaigns GET] Does 'CampaignWizard' table exist according to DB?", tableExists);
    // --- End diagnostic ---

    // --- Original code (Restored) ---
    const campaigns = await prisma.campaignWizard.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      take: 100,
    });
    console.log('Raw campaigns from DB:', JSON.stringify(campaigns, null, 2));
    const { EnumTransformers } = await import('@/utils/enum-transformers');
    const transformedCampaigns = campaigns.map(campaign => {
      const transformed = EnumTransformers.transformObjectFromBackend(campaign);
      return {
        ...transformed,
        startDate: campaign.startDate instanceof Date ? campaign.startDate.toISOString() : null,
        endDate: campaign.endDate instanceof Date ? campaign.endDate.toISOString() : null,
        createdAt: campaign.createdAt instanceof Date ? campaign.createdAt.toISOString() : null,
        updatedAt: campaign.updatedAt instanceof Date ? campaign.updatedAt.toISOString() : null,
      };
    });
    return NextResponse.json({
      success: true,
      data: transformedCampaigns,
    });
    // --- End original code ---

    // --- Placeholder response (Removed) ---
    // if (!tableExists) {
    //   throw new Error("Diagnostic check failed: 'CampaignWizard' table not found in information_schema.");
    // }
    // return NextResponse.json({ success: true, data: [], message: "Diagnostic OK - Table exists." });
  } catch (error) {
    console.error('Error fetching campaigns:', error); // Restored original error message context
    dbLogger.error(
      DbOperation.FETCH,
      'Error fetching campaigns',
      {},
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaigns',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST handler - Create campaign
export const POST = withValidation(
  CampaignPostApiSchema, // Use the original, refined schema
  async (data: z.infer<typeof CampaignPostApiSchema>, request: NextRequest) => {
    try {
      // Remove manual refinement checks

      // Log the raw request data (now validated against the stricter schema)
      console.log('Raw request data:', JSON.stringify(data, null, 2));

      // Import the EnumTransformers utility
      const { EnumTransformers } = await import('@/utils/enum-transformers');

      // Transform any enum values from frontend to backend format
      // Note: This will handle Currency, Platform, Position, KPI and Feature enums
      const transformedData = EnumTransformers.transformObjectToBackend(data);
      console.log('Transformed data for API:', JSON.stringify(transformedData, null, 2));

      // Extract budget data directly from the validated object
      const budgetData = transformedData.budget || { total: 0, currency: 'USD', socialMedia: 0 }; // Use default if null/undefined
      console.log('Budget data:', JSON.stringify(budgetData, null, 2));

      // Contact data is now validated correctly, handle nulls properly
      const primaryContactJson = transformedData.primaryContact
        ? JSON.stringify(transformedData.primaryContact)
        : Prisma.JsonNull;
      const secondaryContactJson = transformedData.secondaryContact // Already processed by preprocess
        ? JSON.stringify(transformedData.secondaryContact)
        : Prisma.JsonNull;

      console.log('Primary contact:', primaryContactJson);
      console.log('Secondary contact:', secondaryContactJson);

      // Prepare DB creation data - converting date strings to Date objects
      const dbData = {
        id: uuidv4(),
        name: transformedData.name,
        businessGoal: transformedData.businessGoal || '',
        brand: transformedData.brand || '',
        website: transformedData.website || null,
        // Convert validated date strings to Date objects for Prisma
        startDate: transformedData.startDate ? new Date(transformedData.startDate) : new Date(),
        endDate: transformedData.endDate ? new Date(transformedData.endDate) : new Date(),
        timeZone: transformedData.timeZone || 'UTC',
        // Pass objects/arrays directly for Json/Json[] fields
        primaryContact: transformedData.primaryContact || Prisma.JsonNull,
        secondaryContact: transformedData.secondaryContact || Prisma.JsonNull,
        additionalContacts: transformedData.additionalContacts || [],
        budget: transformedData.budget || Prisma.JsonNull,
        primaryKPI: transformedData.primaryKPI,
        secondaryKPIs: transformedData.secondaryKPIs || [], // Prisma expects Enum[]
        features: transformedData.features || [], // Prisma expects Enum[]
        messaging: transformedData.messaging || Prisma.JsonNull,
        expectedOutcomes: transformedData.expectedOutcomes || Prisma.JsonNull,
        demographics: transformedData.demographics || Prisma.JsonNull,
        locations: transformedData.locations || [], // Pass array directly
        targeting: transformedData.targeting || Prisma.JsonNull,
        competitors: transformedData.competitors || [], // Prisma expects String[]
        assets: transformedData.assets || [], // Pass array directly
        status: Status.DRAFT,
        step1Complete: true,
        step2Complete: false,
        step3Complete: false,
        step4Complete: false,
        isComplete: false,
        currentStep: 1,
        updatedAt: new Date(),
        // userId: ??? 
      };

      console.log('Database creation data (Corrected Types):', JSON.stringify(dbData, null, 2));

      try {
        // Create campaign and handle influencers in the same transaction
        const campaign = await prisma.$transaction(async tx => {
          // First create the campaign
          const newCampaign = await tx.campaignWizard.create({
            data: dbData as any, // Use 'as any' carefully or ensure dbData matches Prisma types
          });

          // If there are influencers in the request, create them
          // Use transformedData.Influencer (capital I)
          if (
            transformedData.Influencer &&
            Array.isArray(transformedData.Influencer) &&
            transformedData.Influencer.length > 0
          ) {
            // Filter out any incomplete influencer data
            const validInfluencers = transformedData.Influencer.filter(
              (inf: any): inf is NonNullable<typeof inf> =>
                !!inf &&
                typeof inf === 'object' &&
                typeof inf.platform === 'string' &&
                !!inf.platform &&
                typeof inf.handle === 'string' &&
                !!inf.handle
            );

            console.log('Creating influencers:', JSON.stringify(validInfluencers, null, 2));

            // Create all influencers connected to this campaign
            for (const influencer of validInfluencers) {
              await tx.influencer.create({
                data: {
                  id: influencer.id || uuidv4(),
                  // Cast string platform to Platform enum type
                  platform: influencer.platform as Platform,
                  handle: influencer.handle,
                  // We don't have platformId in our schema, so don't try to use it
                  campaignId: newCampaign.id,
                  updatedAt: new Date(),
                },
              });
            }
          }

          return newCampaign;
        });

        dbLogger.info(DbOperation.CREATE, 'Campaign created successfully', {
          campaignId: campaign.id,
        });

        // Fetch the complete campaign with influencers for the response
        const campaignWithInfluencers = await prisma.campaignWizard.findUnique({
          where: { id: campaign.id },
          include: {
            Influencer: true,
          },
        });

        // Transform campaign data back to frontend format before returning
        const transformedCampaign =
          EnumTransformers.transformObjectFromBackend(campaignWithInfluencers);

        return NextResponse.json({
          success: true,
          data: transformedCampaign,
          message: 'Campaign created successfully',
        });
      } catch (dbError) {
        console.error('Database error during campaign creation:', dbError);

        // Check for specific Prisma errors
        if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
          console.error(`Prisma error code: ${dbError.code}`);
          console.error(`Prisma error message: ${dbError.message}`);

          if (dbError.meta) {
            console.error(`Prisma error meta: ${JSON.stringify(dbError.meta, null, 2)}`);
          }
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Database error during campaign creation',
            details: dbError instanceof Error ? dbError.message : String(dbError),
            code:
              dbError instanceof Prisma.PrismaClientKnownRequestError ? dbError.code : undefined,
            meta:
              dbError instanceof Prisma.PrismaClientKnownRequestError ? dbError.meta : undefined,
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Campaign creation error:', error);

      // Provide detailed error information for debugging
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
        { status: 500 }
      );
    }
  },
  {
    entityName: 'Campaign',
    logValidationErrors: true,
    logRequestBody: true,
  }
);

// PATCH handler - Update campaign
export const PATCH = withValidation(
  campaignUpdateSchema,
  async (data: z.infer<typeof campaignUpdateSchema>, request: NextRequest) => {
    const { id, ...updateData } = data;

    const campaign = await prisma.campaignWizard.update({
      where: { id },
      data: {
        name: updateData.campaignName,
        businessGoal: updateData.description,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
        // Other fields need to be updated here
      },
    });

    // Update wizard history record
    try {
      await prisma.wizardHistory.create({
        data: {
          id: uuidv4(),
          wizardId: campaign.id,
          step: updateData.step ?? 1,
          timestamp: new Date(),
          action: 'UPDATE',
          changes: {},
          performedBy: 'system',
        },
      });
    } catch (error) {
      console.error('Error creating wizard history:', error);
      // Continue with campaign update even if history creation fails
    }

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully',
    });
  },
  { entityName: 'Campaign', logValidationErrors: true }
);
