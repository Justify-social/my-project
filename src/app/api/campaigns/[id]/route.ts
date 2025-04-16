import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod'; // For input validation
import { Currency, Platform, SubmissionStatus } from '@prisma/client';
import { connectToDatabase } from '@/lib/db';
import { tryCatch } from '@/lib/middleware/api';
import { EnumTransformers } from '@/utils/enum-transformers';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';
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

    // Normalize the campaign data to match frontend schema expectations
    console.log('[API GET /api/campaigns/[id]] Normalizing data for frontend schema compatibility...');
    const normalizedCampaign = {
      ...campaign,
      // Transform locations if it's an array of strings to array of objects
      locations: 'locations' in campaign && Array.isArray(campaign.locations) && campaign.locations.length > 0 && typeof campaign.locations[0] === 'string'
        ? campaign.locations.map(loc => ({ city: loc }))
        : ('locations' in campaign ? campaign.locations : []),
      // Ensure budget is in the correct format
      budget: 'budget' in campaign && campaign.budget && typeof campaign.budget === 'object' ? {
        currency: 'currency' in campaign.budget ? campaign.budget.currency : 'GBP',
        total: 'total' in campaign.budget ? campaign.budget.total : 0,
        socialMedia: 'socialMedia' in campaign.budget ? campaign.budget.socialMedia : 0
      } : { currency: 'GBP', total: 0, socialMedia: 0 },
      // Normalize contacts if they exist
      primaryContact: 'primaryContact' in campaign && campaign.primaryContact && typeof campaign.primaryContact === 'object' ? {
        firstName: 'firstName' in campaign.primaryContact ? campaign.primaryContact.firstName : '',
        surname: 'surname' in campaign.primaryContact ? campaign.primaryContact.surname : '',
        email: 'email' in campaign.primaryContact ? campaign.primaryContact.email : '',
        position: 'position' in campaign.primaryContact ? campaign.primaryContact.position : ''
      } : null,
      secondaryContact: 'secondaryContact' in campaign && campaign.secondaryContact && typeof campaign.secondaryContact === 'object' ? {
        firstName: 'firstName' in campaign.secondaryContact ? campaign.secondaryContact.firstName : '',
        surname: 'surname' in campaign.secondaryContact ? campaign.secondaryContact.surname : '',
        email: 'email' in campaign.secondaryContact ? campaign.secondaryContact.email : '',
        position: 'position' in campaign.secondaryContact ? campaign.secondaryContact.position : ''
      } : null,
      // Ensure additionalContacts is always an array
      additionalContacts: 'additionalContacts' in campaign && Array.isArray(campaign.additionalContacts) ? campaign.additionalContacts : [],
      // Normalize assets if they exist
      assets: 'assets' in campaign && Array.isArray(campaign.assets) ? campaign.assets.map(asset => {
        if (asset && typeof asset === 'object') {
          return {
            id: 'id' in asset ? asset.id : '',
            name: 'name' in asset ? asset.name : '',
            type: 'type' in asset ? asset.type : 'image',
            url: 'url' in asset ? asset.url : '',
            fileName: 'fileName' in asset ? asset.fileName : '',
            fileSize: 'fileSize' in asset ? asset.fileSize : 0,
            description: 'description' in asset ? asset.description : '',
            temp: 'temp' in asset ? asset.temp : false,
            rationale: 'rationale' in asset ? asset.rationale : '',
            budget: 'budget' in asset ? asset.budget : undefined,
            associatedInfluencerIds: 'associatedInfluencerIds' in asset && Array.isArray(asset.associatedInfluencerIds) ? asset.associatedInfluencerIds : []
          };
        }
        return {
          id: '',
          name: '',
          type: 'image',
          url: '',
          fileName: '',
          fileSize: 0,
          description: '',
          temp: false,
          rationale: '',
          budget: undefined,
          associatedInfluencerIds: []
        };
      }) : [],
      // Normalize influencers if they exist
      Influencer: 'Influencer' in campaign && Array.isArray(campaign.Influencer) ? campaign.Influencer.map(inf => ({
        id: 'id' in inf ? inf.id : '',
        platform: 'platform' in inf ? inf.platform : 'INSTAGRAM',
        handle: 'handle' in inf ? inf.handle : '',
        platformId: 'platformId' in inf ? inf.platformId : ''
      })) : []
    };

    // Add draft status to the response
    const formattedCampaign = {
      ...normalizedCampaign,
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

    if (isNumeric) {
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
      // If it's neither UUID nor Numeric after removing UUID logic
      return NextResponse.json({ success: false, error: 'Invalid or non-submitted campaign ID format' }, { status: 400 });
    }

    console.log(`[API PUT /api/campaigns/[id]] Campaign updated: ${campaignId}`);
    return NextResponse.json({ success: true, data: updatedCampaign }, { status: 200 });
  } catch (error) {
    console.error(`[API PUT /api/campaigns/[id]] Error:`, error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
