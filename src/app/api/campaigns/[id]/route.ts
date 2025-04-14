import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod'; // For input validation
import { Currency, Platform, SubmissionStatus } from '@prisma/client';
import { connectToDatabase } from '@/lib/db';
import { tryCatch } from '@/config/middleware/api';
import { DbOperation } from '@/lib/data-mapping/db-logger';
import { auth } from '@clerk/nextjs/server';

type RouteParams = { params: { id: string } };

// More comprehensive schema matching Prisma model
const campaignSchema = z.object({
  campaignName: z.string().min(1).max(255),
  description: z.string(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  timeZone: z.string(),
  currency: z.enum(['USD', 'GBP', 'EUR']),
  totalBudget: z.number().min(0),
  socialMediaBudget: z.number().min(0),
  platform: z.enum(['Instagram', 'YouTube', 'TikTok']),
  influencerHandle: z.string(),
  mainMessage: z.string(),
  hashtags: z.string(),
  memorability: z.string(),
  keyBenefits: z.string(),
  expectedAchievements: z.string(),
  purchaseIntent: z.string(),
  brandPerception: z.string(),
  primaryKPI: z.enum(['adRecall', 'brandAwareness', 'messageAssociation', 'purchaseIntent']),
  creativeGuidelines: z.string(),
  creativeNotes: z.string(),
  submissionStatus: z.enum(['draft', 'submitted']),
  contacts: z.string(),
  // Relationship validations
  primaryContact: z
    .object({
      firstName: z.string(),
      surname: z.string(),
      email: z.string().email(),
      position: z.string(),
    })
    .optional(),
  secondaryContact: z
    .object({
      firstName: z.string(),
      surname: z.string(),
      email: z.string().email(),
      position: z.string(),
    })
    .optional(),
  // Optional arrays for related data
  creativeRequirements: z
    .array(
      z.object({
        requirement: z.string(),
      })
    )
    .optional(),
  brandGuidelines: z
    .array(
      z.object({
        guideline: z.string(),
      })
    )
    .optional(),
});

// More comprehensive schema matching Prisma model
const campaignUpdateSchema = z.object({
  campaignName: z.string().min(1).max(255).optional(),
  businessGoal: z.string().optional(),
  description: z.string().optional(),
  startDate: z
    .string()
    .optional()
    .transform(str => (str ? new Date(str) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform(str => (str ? new Date(str) : undefined)),
  timeZone: z.string().optional(),
  currency: z.enum(['USD', 'GBP', 'EUR']).optional(),
  totalBudget: z.number().min(0).optional(),
  socialMediaBudget: z.number().min(0).optional(),
  platform: z.enum(['INSTAGRAM', 'YOUTUBE', 'TIKTOK']).optional(),
  influencerHandle: z.string().optional(),
  mainMessage: z.string().optional(),
  hashtags: z.string().optional(),
  memorability: z.string().optional(),
  keyBenefits: z.string().optional(),
  expectedAchievements: z.string().optional(),
  purchaseIntent: z.string().optional(),
  brandPerception: z.string().optional(),
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
    .optional(),
  // Step 2 specific fields
  secondaryKPIs: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  // Allow messaging as a nested object
  messaging: z
    .object({
      mainMessage: z.string().optional(),
      hashtags: z.string().optional(),
      memorability: z.string().optional(),
      keyBenefits: z.string().optional(),
      expectedAchievements: z.string().optional(),
      purchaseIntent: z.string().optional(),
      brandPerception: z.string().optional(),
    })
    .optional(),
  // Step 3 audience data - add comprehensive schema
  audience: z
    .object({
      location: z.array(z.string()).optional(),
      ageDistribution: z
        .object({
          age1824: z.number().optional(),
          age2534: z.number().optional(),
          age3544: z.number().optional(),
          age4554: z.number().optional(),
          age5564: z.number().optional(),
          age65plus: z.number().optional(),
        })
        .optional(),
      gender: z.array(z.string()).optional(),
      otherGender: z.string().optional(),
      screeningQuestions: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      educationLevel: z.string().optional(),
      jobTitles: z.array(z.string()).optional(),
      incomeLevel: z.number().optional(),
      competitors: z.array(z.string()).optional(),
    })
    .optional(),
  // Step metadata
  step: z.number().optional(),
  status: z.enum(['draft', 'submitted']).optional(),
  name: z.string().optional(),
  // Other fields
  contacts: z.string().optional(),
  additionalContacts: z.array(z.record(z.string(), z.any())).optional(),
  primaryContact: z
    .object({
      firstName: z.string(),
      surname: z.string(),
      email: z.string().email(),
      position: z.string(),
    })
    .optional(),
  secondaryContact: z
    .object({
      firstName: z.string(),
      surname: z.string(),
      email: z.string().email(),
      position: z.string(),
    })
    .optional(),
  creativeRequirements: z
    .array(
      z.object({
        requirement: z.string(),
      })
    )
    .optional(),
  brandGuidelines: z
    .array(
      z.object({
        guideline: z.string(),
      })
    )
    .optional(),
  // For backward compatibility
  submissionStatus: z.enum(['draft', 'submitted']).optional(),
  influencers: z.array(z.any()).optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rely solely on the inner try...catch for robust error handling
  try {
    console.log('[API GET /api/campaigns/[id]] Handler started'); // Log start
    // Get campaign ID from params - properly awaiting
    const { id } = await params;
    const campaignId = id;

    // Check if the ID is a UUID (string format) or a numeric ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      campaignId
    );

    // Connect to database
    await connectToDatabase();
    console.log('[API GET /api/campaigns/[id]] Database connected'); // Log DB connection

    let campaign = null;
    let isSubmittedCampaign = false;

    // Try to find the campaign based on ID format
    if (isUuid) {
      console.log('Using UUID format for campaign ID:', campaignId);
      // Look for draft in CampaignWizard table with string ID
      console.log('[API GET /api/campaigns/[id]] Querying CampaignWizard...'); // Log before query
      try {
        campaign = await prisma.campaignWizard.findUnique({
          where: { id: campaignId },
          include: {
            Influencer: true, // Include the Influencer relation
          },
        });
        console.log('[API GET /api/campaigns/[id]] Prisma query successful.'); // Log success
      } catch (prismaError) {
        console.error('[API GET /api/campaigns/[id]] Prisma query failed:', prismaError);
        throw prismaError; // Re-throw to be caught by the outer handler
      }
      console.log(
        '[API GET /api/campaigns/[id]] CampaignWizard query complete.',
        campaign ? 'Found.' : 'Not found.'
      ); // Log after query
    } else {
      // Handle legacy numeric IDs
      const numericId = parseInt(campaignId);
      if (isNaN(numericId)) {
        return NextResponse.json({ error: 'Invalid campaign ID format' }, { status: 400 });
      }
      console.log('Using numeric format for campaign ID:', numericId);
      // Look for submitted campaign in CampaignWizardSubmission table with numeric ID
      console.log('[API GET /api/campaigns/[id]] Querying CampaignWizardSubmission...'); // Log before query
      campaign = await prisma.campaignWizardSubmission.findUnique({
        where: { id: numericId },
        include: {
          primaryContact: true,
          secondaryContact: true,
          audience: true, // Simplified include to avoid type errors
          creativeAssets: true,
          creativeRequirements: true,
        },
      });
      console.log(
        '[API GET /api/campaigns/[id]] CampaignWizardSubmission query complete.',
        campaign ? 'Found.' : 'Not found.'
      ); // Log after query
      isSubmittedCampaign = true;
    }

    // If campaign not found, return 404
    if (!campaign) {
      return NextResponse.json(
        {
          error: 'Campaign not found',
          message: `No campaign found with ID ${campaignId}`,
        },
        { status: 404 }
      );
    }

    // Log the raw campaign data fetched from DB *before* transformation
    console.log(
      '[API GET /api/campaigns/[id]] Raw campaign data from DB:',
      JSON.stringify(campaign, null, 2)
    );

    // Debug logging for assets
    if (campaign && 'assets' in campaign && Array.isArray(campaign.assets)) {
      console.log('Campaign has assets array with', campaign.assets.length, 'items');
    } else {
      console.log('Campaign has no assets array or assets are not in array format');
    }

    // Import the EnumTransformers utility to transform enum values
    const { EnumTransformers } = await import('@/utils/enum-transformers');

    // Transform the campaign data for frontend consumption
    console.log('[API GET /api/campaigns/[id]] Transforming enums...'); // Log before enum transform
    let transformedCampaign;
    try {
      transformedCampaign = EnumTransformers.transformObjectFromBackend(campaign);
      console.log('[API GET /api/campaigns/[id]] Enum transformation successful.'); // Log success
    } catch (transformError) {
      console.error('[API GET /api/campaigns/[id]] Enum transformation failed:', transformError);
      // Log the data that caused the failure
      console.error(
        '[API GET /api/campaigns/[id]] Data causing transform failure:',
        JSON.stringify(campaign, null, 2)
      );
      throw transformError; // Re-throw to be caught by outer handler
    }
    console.log('[API GET /api/campaigns/[id]] Enum transformation complete.'); // Log after enum transform

    // Add draft status to the response
    const formattedCampaign = {
      ...transformedCampaign,
      isDraft: !isSubmittedCampaign,
    };

    // Log what we're returning to help with debugging
    console.log('Returning campaign data with ID:', campaignId, 'isDraft:', !isSubmittedCampaign);

    // For debugging date formats
    console.log('Date fields in response:', {
      startDate: formattedCampaign.startDate,
      endDate: formattedCampaign.endDate,
    });

    // Return the campaign data
    console.log('[API GET /api/campaigns/[id]] Preparing final response...'); // Log before final response
    return NextResponse.json({
      success: true,
      data: formattedCampaign,
    });
  } catch (internalError) {
    // Catch any errors within the main logic block
    console.error('[API GET /api/campaigns/[id]] Internal error caught:', internalError);
    // Return a generic 500 error response
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message:
          internalError instanceof Error ? internalError.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

export const PATCH = tryCatch(
  // Core async logic for PATCH
  async (request: NextRequest, { params }: RouteParams) => {
    const { id } = params;
    const campaignId = id;

    // Check if the ID is a UUID (string format) or a numeric ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      campaignId
    );
    const numericId = parseInt(campaignId);

    if (!isUuid && isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Parse and validate request body
    const body = await request.json();
    console.log('Received PATCH request body:', JSON.stringify(body, null, 2));

    const validationResult = campaignUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Import the EnumTransformers utility if needed for transforms
    const { EnumTransformers } = await import('@/utils/enum-transformers');

    let updatedCampaign;

    if (isUuid) {
      // Update the campaign in CampaignWizard table if it's a UUID
      console.log('Updating campaign with UUID:', campaignId);

      // Initialize mappedData reliably here
      const mappedData: any = {
        updatedAt: new Date(),
        // Initialize nested objects to prevent errors later
        demographics: {},
        locations: [],
        targeting: {},
        competitors: [],
      };

      // Add name and business goal if available
      if (data.name || data.campaignName) {
        mappedData.name = data.name || data.campaignName;
      }

      if (data.businessGoal || data.description) {
        mappedData.businessGoal = data.businessGoal || data.description;
      }

      // Handle date fields with proper conversion to Date objects
      if (data.startDate) {
        mappedData.startDate = new Date(data.startDate);
      }

      if (data.endDate) {
        mappedData.endDate = new Date(data.endDate);
      }

      if (data.timeZone) {
        mappedData.timeZone = data.timeZone;
      }

      // Handle budget as a JSON field
      if (data.currency || data.totalBudget || data.socialMediaBudget) {
        mappedData.budget = {
          currency: data.currency || 'USD',
          total: data.totalBudget || 0,
          socialMedia: data.socialMediaBudget || 0,
        };
      }

      // Handle primaryContact as a JSON field
      if (data.primaryContact) {
        mappedData.primaryContact = data.primaryContact;
      }

      // Handle secondaryContact as a JSON field
      if (data.secondaryContact) {
        mappedData.secondaryContact = data.secondaryContact;
      }

      // Handle Step 2 specific fields - using type assertions to bypass TypeScript errors
      if (data.primaryKPI) {
        console.log('Saving primaryKPI:', data.primaryKPI);
        mappedData.primaryKPI = data.primaryKPI;
      }

      if (data.secondaryKPIs) {
        console.log('Saving secondaryKPIs:', JSON.stringify(data.secondaryKPIs));
        // Make sure secondaryKPIs is an array
        mappedData.secondaryKPIs = Array.isArray(data.secondaryKPIs)
          ? data.secondaryKPIs
          : [data.secondaryKPIs];
      }

      if (data.features) {
        console.log('Saving features:', JSON.stringify(data.features));
        // Make sure features is an array
        mappedData.features = Array.isArray(data.features) ? data.features : [data.features];
      }

      // Handle messaging if present
      if (
        data.messaging ||
        data.mainMessage ||
        data.hashtags ||
        data.memorability ||
        data.keyBenefits ||
        data.expectedAchievements ||
        data.purchaseIntent ||
        data.brandPerception
      ) {
        console.log('Saving messaging fields:', {
          mainMessage: data.mainMessage || data.messaging?.mainMessage,
          hashtags: data.hashtags || data.messaging?.hashtags,
          memorability: data.memorability || data.messaging?.memorability,
        });

        // Construct messaging from either direct fields or the messaging object
        mappedData.messaging = {
          mainMessage: data.mainMessage || data.messaging?.mainMessage || '',
          hashtags: data.hashtags || data.messaging?.hashtags || '',
          memorability: data.memorability || data.messaging?.memorability || '',
          keyBenefits: data.keyBenefits || data.messaging?.keyBenefits || '',
          expectedAchievements:
            data.expectedAchievements || data.messaging?.expectedAchievements || '',
          purchaseIntent: data.purchaseIntent || data.messaging?.purchaseIntent || '',
          brandPerception: data.brandPerception || data.messaging?.brandPerception || '',
        };
      }

      // Handle audience data if present and ensure data.audience is checked
      if (data.audience) {
        console.log('Audience data received:', JSON.stringify(data.audience, null, 2));

        // demographics object is already initialized above
        // if (!mappedData.demographics) mappedData.demographics = {};

        // Map age distribution
        if (data.audience.ageDistribution) {
          mappedData.demographics.ageDistribution = data.audience.ageDistribution;
        }

        // Map gender and otherGender
        if (Array.isArray(data.audience.gender)) {
          mappedData.demographics.gender = data.audience.gender;
        }
        if (data.audience.otherGender) {
          // Check if otherGender exists
          mappedData.demographics.otherGender = data.audience.otherGender;
        }

        // Map educationLevel and incomeLevel
        if (data.audience.educationLevel) {
          // Check if educationLevel exists
          mappedData.demographics.educationLevel = data.audience.educationLevel;
        }
        if (data.audience.incomeLevel) {
          // Check if incomeLevel exists
          mappedData.demographics.incomeLevel = data.audience.incomeLevel;
        }

        // Map jobTitles
        if (Array.isArray(data.audience.jobTitles)) {
          mappedData.demographics.jobTitles = data.audience.jobTitles;
        }

        // Map location - locations array already initialized
        if (Array.isArray(data.audience.location)) {
          console.log('Location array:', data.audience.location);
          mappedData.locations = data.audience.location.map(loc => ({ location: loc }));
        }

        // targeting object is already initialized above
        // if (!mappedData.targeting) mappedData.targeting = {};

        // Map screeningQuestions
        if (Array.isArray(data.audience.screeningQuestions)) {
          console.log('Screening questions array:', data.audience.screeningQuestions);
          mappedData.targeting.screeningQuestions = data.audience.screeningQuestions.map(q => ({
            question: q,
          }));
        }

        // Map languages
        if (Array.isArray(data.audience.languages)) {
          console.log('Languages array:', data.audience.languages);
          mappedData.targeting.languages = data.audience.languages.map(lang => ({
            language: lang,
          }));
        }

        // Map competitors - competitors array already initialized
        if (Array.isArray(data.audience.competitors)) {
          console.log('Competitors array:', data.audience.competitors);
          mappedData.competitors = data.audience.competitors;
        }

        console.log('Mapped audience data:', {
          demographics: mappedData.demographics,
          locations: mappedData.locations,
          targeting: mappedData.targeting,
          competitors: mappedData.competitors,
        });
      }

      // Handle step status if present
      if (data.step) {
        mappedData.currentStep = data.step;

        // Set step completion flag based on current step
        switch (data.step) {
          case 1:
            mappedData.step1Complete = true;
            break;
          case 2:
            mappedData.step2Complete = true;
            break;
          case 3:
            mappedData.step3Complete = true;
            break;
          case 4:
            mappedData.step4Complete = true;
            break;
        }
      }

      // Handle status if present
      if (data.status) {
        mappedData.status = data.status.toUpperCase();
      }

      console.log('Mapped data for CampaignWizard update:', JSON.stringify(mappedData, null, 2));

      // Update the campaign with the properly mapped data
      updatedCampaign = await prisma.campaignWizard.update({
        where: { id: campaignId },
        data: mappedData,
        include: {
          Influencer: true,
        },
      });

      // If there are influencers in the request, create or update them
      if (data.influencers && Array.isArray(data.influencers) && data.influencers.length > 0) {
        console.log('Updating influencers for campaign:', campaignId);

        // First delete existing influencers to avoid duplicates
        await prisma.influencer.deleteMany({
          where: { campaignId },
        });

        // Then create new influencers for the campaign
        const influencerPromises = data.influencers
          .filter(inf => inf.handle && inf.platform) // Only include valid influencers
          .map(inf => {
            return prisma.influencer.create({
              data: {
                id: inf.id || `inf-${Date.now()}-${Math.round(Math.random() * 1000)}`,
                platform: inf.platform,
                handle: inf.handle,
                platformId: inf.platformId || '',
                campaignId: campaignId,
                updatedAt: new Date(),
              },
            });
          });

        await Promise.all(influencerPromises);

        // Refetch the campaign with updated influencers
        updatedCampaign = await prisma.campaignWizard.findUnique({
          where: { id: campaignId },
          include: {
            Influencer: true,
          },
        });
      }
    } else {
      // Update the submitted campaign if it's a numeric ID
      console.log('Updating submitted campaign with numeric ID:', numericId);

      // Create a properly mapped update object for CampaignWizardSubmission
      // This would need to be adapted based on the CampaignWizardSubmission schema
      const submissionData = {
        ...(data.name && { campaignName: data.name }),
        ...(data.businessGoal && { description: data.businessGoal }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.timeZone && { timeZone: data.timeZone }),
        updatedAt: new Date(),
      };

      // Ensure we use the numeric ID for the where clause
      updatedCampaign = await prisma.campaignWizardSubmission.update({
        where: { id: numericId },
        data: submissionData,
        include: {
          primaryContact: true,
          secondaryContact: true,
          audience: true,
          creativeAssets: true,
          creativeRequirements: true,
        },
      });
    }

    // Process date fields before they get serialized improperly
    if (updatedCampaign && updatedCampaign.startDate instanceof Date) {
      (updatedCampaign as any).startDate = updatedCampaign.startDate.toISOString();
    }

    if (updatedCampaign && updatedCampaign.endDate instanceof Date) {
      (updatedCampaign as any).endDate = updatedCampaign.endDate.toISOString();
    }

    // Transform response data for frontend
    const transformedCampaign = EnumTransformers.transformObjectFromBackend(updatedCampaign);

    return NextResponse.json({
      success: true,
      data: transformedCampaign,
    });
  },
  // Options for tryCatch
  {
    entityName: 'Campaign',
    operation: DbOperation.UPDATE,
  }
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params before using it
  const { id } = await params;
  const campaignId = id;
  console.log(`DELETE request started for campaign ID: ${campaignId}`);

  try {
    // Check authentication using Clerk
    const { userId, sessionClaims } = await auth();
    const userEmail = sessionClaims?.email; // Get email if needed for logging

    // Log authentication status
    console.log(`Authentication status: ${userId ? 'Authenticated' : 'Not authenticated'}`);

    if (!userId) {
      console.error('Delete failed: No authenticated user session');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    console.log(
      `Authenticated user ID: ${userId} ${userEmail ? `(${userEmail})` : ''}, attempting to delete campaign with ID: ${campaignId}`
    );

    // The ID differences:
    // - CampaignWizard uses String UUIDs as IDs
    // - CampaignWizardSubmission uses auto-increment Int IDs

    // Try to delete from CampaignWizard first (UUID string ID)
    let campaignWizardDeleted = false;

    try {
      // Check if it exists first
      const campaignWizard = await prisma.campaignWizard.findUnique({
        where: { id: campaignId },
      });

      if (campaignWizard) {
        console.log(`Found campaign in CampaignWizard: ${campaignWizard.name}`);

        // Use a transaction to delete related records
        await prisma.$transaction(async tx => {
          // Delete related influencers
          await tx.influencer.deleteMany({
            where: { campaignId: campaignId },
          });

          // Delete the campaign
          await tx.campaignWizard.delete({
            where: { id: campaignId },
          });
        });

        console.log(`Successfully deleted campaign from CampaignWizard table: ${campaignId}`);
        campaignWizardDeleted = true;
      } else {
        console.log(`No campaign found in CampaignWizard with ID: ${campaignId}`);
      }
    } catch (wizardError) {
      console.error(`Error deleting from CampaignWizard:`, wizardError);
      // Don't immediately return, try deleting from submission table
    }

    // Try to delete from CampaignWizardSubmission as fallback (numeric ID)
    let submissionDeleted = false;
    if (!campaignWizardDeleted) {
      const numericId = parseInt(campaignId);
      if (!isNaN(numericId)) {
        try {
          // Check if it exists first
          const submission = await prisma.campaignWizardSubmission.findUnique({
            where: { id: numericId },
          });

          if (submission) {
            console.log(`Found campaign in CampaignWizardSubmission: ${submission.campaignName}`);
            // Add transaction for submission deletion if complex relations exist
            await prisma.campaignWizardSubmission.delete({
              where: { id: numericId },
            });
            console.log(`Successfully deleted campaign from CampaignWizardSubmission table: ${numericId}`);
            submissionDeleted = true;
          } else {
            console.log(`No campaign found in CampaignWizardSubmission with ID: ${numericId}`);
          }
        } catch (submissionError) {
          console.error(`Error deleting from CampaignWizardSubmission:`, submissionError);
        }
      }
    }

    if (!campaignWizardDeleted && !submissionDeleted) {
      console.log(`Campaign not found in either table for ID: ${campaignId}`);
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    console.log(`DELETE request successful for campaign ID: ${campaignId}`);
    return NextResponse.json({ success: true, message: 'Campaign deleted' });

  } catch (error) {
    console.error(`Error during DELETE for campaign ID ${campaignId}:`, error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('[API PUT /api/campaigns/[id]] Handler started');
    const { id } = await params;
    const campaignId = id;

    // Check if the ID is a UUID (string format) or a numeric ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    const numericId = parseInt(campaignId, 10);
    const isNumeric = !isNaN(numericId);

    // Parse the request body
    const body = await request.json();
    const validatedData = campaignUpdateSchema.parse(body);

    // Connect to database
    await connectToDatabase();

    let updatedCampaign;

    if (isUuid) {
      // Update the campaign in CampaignWizard table for UUIDs (draft campaigns)
      console.log('[API PUT /api/campaigns/[id]] Updating draft campaign with UUID:', campaignId);
      updatedCampaign = await prisma.campaignWizard.update({
        where: { id: campaignId },
        data: {
          name: validatedData.name || validatedData.campaignName,
          businessGoal: validatedData.businessGoal || validatedData.description,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          timeZone: validatedData.timeZone,
          budget: {
            currency: validatedData.currency || 'USD',
            total: validatedData.totalBudget || 0,
            socialMedia: validatedData.socialMediaBudget || 0,
          },
          primaryContact: validatedData.primaryContact,
          secondaryContact: validatedData.secondaryContact,
          primaryKPI: validatedData.primaryKPI,
          secondaryKPIs: validatedData.secondaryKPIs,
          messaging: validatedData.messaging,
          features: validatedData.features,
          demographics: validatedData.audience ? {
            ageDistribution: validatedData.audience.ageDistribution || {},
            gender: validatedData.audience.gender || [],
            otherGender: validatedData.audience.otherGender || '',
            educationLevel: validatedData.audience.educationLevel || '',
            incomeLevel: validatedData.audience.incomeLevel || 0,
          } : {},
          locations: validatedData.audience && validatedData.audience.location ? validatedData.audience.location.map(loc => ({ location: loc })) : [],
          targeting: validatedData.audience ? {
            screeningQuestions: validatedData.audience.screeningQuestions || [],
            languages: validatedData.audience.languages || [],
            jobTitles: validatedData.audience.jobTitles || [],
          } : {},
          competitors: validatedData.audience && validatedData.audience.competitors ? validatedData.audience.competitors.map(comp => comp) : [],
          status: validatedData.status ? validatedData.status.toUpperCase() : 'DRAFT',
          updatedAt: new Date(),
        },
        include: {
          Influencer: true,
        },
      });
    } else if (isNumeric) {
      // Update the campaign in CampaignWizardSubmission table for numeric IDs (submitted campaigns)
      console.log('[API PUT /api/campaigns/[id]] Updating submitted campaign with numeric ID:', numericId);
      updatedCampaign = await prisma.campaignWizardSubmission.update({
        where: { id: numericId },
        data: {
          campaignName: validatedData.name || validatedData.campaignName,
          description: validatedData.businessGoal || validatedData.description,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          timeZone: validatedData.timeZone,
          currency: validatedData.currency as Currency,
          totalBudget: validatedData.totalBudget,
          socialMediaBudget: validatedData.socialMediaBudget,
          submissionStatus: validatedData.status as SubmissionStatus,
          updatedAt: new Date(),
        },
        include: {
          primaryContact: true,
          secondaryContact: true,
          audience: true,
          creativeAssets: true,
          creativeRequirements: true,
        },
      });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid campaign ID format' }, { status: 400 });
    }

    console.log(`[API PUT /api/campaigns/[id]] Campaign updated: ${campaignId}`);
    return NextResponse.json({ success: true, data: updatedCampaign }, { status: 200 });
  } catch (error) {
    console.error(`[API PUT /api/campaigns/[id]] Error:`, error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
