import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Re-added import as it's used
import { z } from 'zod'; // For input validation
import { Currency, SubmissionStatus } from '@prisma/client';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { campaignService as _campaignService } from '@/lib/data-mapping/campaign-service';
import { deleteCampaignFromAlgolia } from '@/lib/algolia'; // Import Algolia utility
import { logger } from '@/lib/logger'; // Added logger import back
import { UnauthenticatedError, NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';

// type RouteParams = { params: { id: string } }; // Unused

// Unused Schema
/*
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
*/

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    console.log('[API GET /api/campaigns/[campaignId]] Handler started');
    const { campaignId } = await params;
    const { userId: clerkUserId, orgId } = await auth(); // Fetch orgId

    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }

    const userRecord = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!userRecord) {
      throw new NotFoundError('User record not found.');
    }
    const internalUserId = userRecord.id;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      campaignId
    );

    await connectToDatabase();
    console.log('[API GET /api/campaigns/[campaignId]] Database connected');

    let campaign: any = null;
    let isSubmittedCampaign = false;

    if (isUuid) {
      console.log('Using UUID format for campaign ID:', campaignId);
      campaign = await prisma.campaignWizard.findUnique({
        where: { id: campaignId },
        include: { Influencer: true },
      });
      console.log(
        '[API GET /api/campaigns/[campaignId]] CampaignWizard query complete.',
        campaign ? 'Found.' : 'Not found.'
      );

      if (campaign) {
        // Authorization Logic for CampaignWizard
        if (campaign.orgId === null) {
          // Legacy campaign
          if (campaign.userId !== internalUserId) {
            logger.warn(
              `User ${internalUserId} attempting to access legacy campaign ${campaignId} not belonging to them. Access denied.`
            );
            throw new ForbiddenError('You do not have permission to access this legacy campaign.');
          }
        } else {
          // Org-scoped campaign
          if (!orgId) {
            logger.warn(
              `User ${internalUserId} (no active org) attempting to access org-scoped campaign ${campaignId}. Access denied.`
            );
            throw new ForbiddenError(
              'This campaign belongs to an organization. Please select an active organization context to view it.'
            );
          }
          if (campaign.orgId !== orgId) {
            logger.warn(
              `User ${internalUserId} in org ${orgId} attempting to access campaign ${campaignId} belonging to org ${campaign.orgId}. Access denied.`
            );
            throw new ForbiddenError('You do not have permission to access this campaign.');
          }
        }
      } // campaign still null if not found, will be caught by the check below
    } else {
      const numericId = parseInt(campaignId);
      if (isNaN(numericId)) {
        throw new BadRequestError('Invalid campaign ID format');
      }
      console.log('Using numeric format for campaign ID (CampaignWizardSubmission):', numericId);
      // Transitional rule for legacy numeric IDs: scope by user
      campaign = await prisma.campaignWizardSubmission.findFirst({
        where: {
          id: numericId,
          userId: internalUserId,
        },
        include: {
          primaryContact: true,
          secondaryContact: true,
          audience: true,
          creativeAssets: true,
          creativeRequirements: true,
        },
      });
      console.log(
        '[API GET /api/campaigns/[campaignId]] CampaignWizardSubmission query complete.',
        campaign ? 'Found.' : 'Not found.'
      );
      if (campaign) {
        isSubmittedCampaign = true;
      }
    }

    if (!campaign) {
      // This will now catch cases where campaign was not found OR authorization failed implicitly by campaign being null
      throw new NotFoundError(`Campaign not found with ID ${campaignId} or access denied.`);
    }

    // Log the raw campaign data fetched from DB *before* transformation
    console.log(
      '[API GET /api/campaigns/[campaignId]] Raw campaign data from DB:',
      JSON.stringify(campaign, null, 2)
    );

    // Debug logging for assets
    if (campaign && 'assets' in campaign && Array.isArray(campaign.assets)) {
      console.log('Campaign has assets array with', campaign.assets.length, 'items');
    } else {
      console.log('Campaign has no assets array or assets are not in array format');
    }

    // Normalize the campaign data to match frontend schema expectations
    console.log(
      '[API GET /api/campaigns/[campaignId]] Normalizing data for frontend schema compatibility...'
    );
    const normalizedCampaign = {
      ...campaign,
      locations:
        'locations' in campaign &&
        Array.isArray(campaign.locations) &&
        campaign.locations.length > 0 &&
        typeof campaign.locations[0] === 'string'
          ? campaign.locations.map((loc: string) => ({ city: loc }))
          : 'locations' in campaign
            ? campaign.locations
            : [],
      budget:
        'budget' in campaign && campaign.budget && typeof campaign.budget === 'object'
          ? {
              currency: String((campaign.budget as any).currency ?? 'GBP'),
              total: Number((campaign.budget as any).total ?? 0),
              socialMedia: Number((campaign.budget as any).socialMedia ?? 0),
            }
          : { currency: 'GBP', total: 0, socialMedia: 0 },
      primaryContact:
        'primaryContact' in campaign &&
        campaign.primaryContact &&
        typeof campaign.primaryContact === 'object'
          ? {
              firstName: String((campaign.primaryContact as any).firstName ?? ''),
              surname: String((campaign.primaryContact as any).surname ?? ''),
              email: String((campaign.primaryContact as any).email ?? ''),
              position: String((campaign.primaryContact as any).position ?? ''),
            }
          : null,
      secondaryContact:
        'secondaryContact' in campaign &&
        campaign.secondaryContact &&
        typeof campaign.secondaryContact === 'object'
          ? {
              firstName: String((campaign.secondaryContact as any).firstName ?? ''),
              surname: String((campaign.secondaryContact as any).surname ?? ''),
              email: String((campaign.secondaryContact as any).email ?? ''),
              position: String((campaign.secondaryContact as any).position ?? ''),
            }
          : null,
      additionalContacts:
        'additionalContacts' in campaign && Array.isArray(campaign.additionalContacts)
          ? campaign.additionalContacts
          : [],
      assets:
        'assets' in campaign && Array.isArray(campaign.assets)
          ? campaign.assets.map((asset_item: any) => {
              // asset_item to avoid conflict with 'assets' key
              if (asset_item && typeof asset_item === 'object') {
                return {
                  id: String(asset_item.id ?? ''),
                  name: String(asset_item.name ?? ''),
                  type: String(asset_item.type ?? 'image'),
                  url: String(asset_item.url ?? ''),
                  fileName: String(asset_item.fileName ?? ''),
                  fileSize: Number(asset_item.fileSize ?? 0),
                  description: String(asset_item.description ?? ''),
                  temp: Boolean(asset_item.temp ?? false),
                  rationale: String(asset_item.rationale ?? ''),
                  budget: asset_item.budget !== undefined ? Number(asset_item.budget) : undefined,
                  associatedInfluencerIds: Array.isArray(asset_item.associatedInfluencerIds)
                    ? asset_item.associatedInfluencerIds.map(String)
                    : [],
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
                associatedInfluencerIds: [],
              };
            })
          : [],
      Influencer:
        'Influencer' in campaign && Array.isArray(campaign.Influencer)
          ? campaign.Influencer.map((influencer_item: any) => ({
              // influencer_item to avoid conflict
              id: String(influencer_item.id ?? ''),
              platform: String(influencer_item.platform ?? 'INSTAGRAM'),
              handle: String(influencer_item.handle ?? ''),
              platformId: String(influencer_item.platformId ?? ''),
            }))
          : [],
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
    console.log('[API GET /api/campaigns/[campaignId]] Preparing final response...'); // Log before final response
    return NextResponse.json({
      success: true,
      data: formattedCampaign,
    });
  } catch (internalError) {
    // Catch any errors within the main logic block
    console.error('[API GET /api/campaigns/[campaignId]] Internal error caught:', internalError);
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
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { campaignId } = await params;
  logger.info(`DELETE /api/campaigns/${campaignId} - Request received`);

  try {
    const { userId: clerkUserId, orgId } = await auth();

    if (!clerkUserId) {
      logger.warn(`DELETE /api/campaigns/${campaignId} - Unauthenticated access attempt.`);
      throw new UnauthenticatedError('Authentication required to delete a campaign.');
    }
    if (!orgId) {
      logger.warn(`DELETE /api/campaigns/${campaignId} - Missing orgId for authenticated user.`, {
        clerkUserId,
      });
      throw new BadRequestError('Active organization context is required to delete a campaign.');
    }

    const userRecord = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!userRecord) {
      // This case should ideally not happen if clerkUserId is valid, but good for robustness
      logger.error(`DELETE /api/campaigns/${campaignId} - User record not found for clerkId.`, {
        clerkUserId,
      });
      throw new NotFoundError('User not found, cannot authorize campaign deletion.');
    }
    const internalUserId = userRecord.id;

    logger.info(`DELETE /api/campaigns/${campaignId} - Attempting to delete.`, {
      clerkUserId,
      orgId,
    });

    // Fetch campaign to verify ownership by orgId before deleting
    const campaignWizardToDelete = await prisma.campaignWizard.findUnique({
      where: { id: campaignId },
      select: { orgId: true, userId: true, name: true, submissionId: true }, // Added submissionId to select
    });

    if (!campaignWizardToDelete) {
      logger.warn(`DELETE /api/campaigns/${campaignId} - Campaign not found.`, {
        clerkUserId,
        orgId,
      });
      throw new NotFoundError('Campaign not found.');
    }

    // Authorization check
    if (campaignWizardToDelete.orgId === null) {
      // Legacy campaign: check if the current user is the owner
      if (campaignWizardToDelete.userId !== internalUserId) {
        logger.warn(
          `DELETE /api/campaigns/${campaignId} - Forbidden. User does not own legacy campaign.`,
          { clerkUserId, campaignOrgId: null, campaignUserId: campaignWizardToDelete.userId }
        );
        throw new ForbiddenError('You do not have permission to delete this legacy campaign.');
      }
      logger.info(
        `DELETE /api/campaigns/${campaignId} - Authorized to delete legacy campaign by owner.`,
        { clerkUserId }
      );
    } else if (campaignWizardToDelete.orgId !== orgId) {
      // Org-scoped campaign: check if user's current org matches campaign's org
      logger.warn(`DELETE /api/campaigns/${campaignId} - Forbidden. Organization mismatch.`, {
        clerkUserId,
        userOrgId: orgId,
        campaignOrgId: campaignWizardToDelete.orgId,
      });
      throw new ForbiddenError(
        'You do not have permission to delete this campaign from this organization.'
      );
    }
    // If orgId matches, or if it's a legacy campaign owned by the user, proceed.

    // Use a transaction to delete related records and the campaign itself
    await prisma.$transaction(async tx => {
      await tx.influencer.deleteMany({
        where: { campaignId: campaignId },
      });
      // Add deletion for WizardHistory if necessary
      await tx.wizardHistory.deleteMany({
        where: { wizardId: campaignId },
      });
      // Delete CampaignWizardSubmission if linked (handle if submissionId can be null)
      if (campaignWizardToDelete.submissionId) {
        // Check if submissionId exists before trying to delete
        await tx.campaignWizardSubmission.deleteMany({
          // deleteMany in case somehow multiple point to it, though submissionId is unique on wizard
          where: { id: campaignWizardToDelete.submissionId },
        });
      }
      await tx.campaignWizard.delete({
        where: { id: campaignId },
      });
    });

    logger.info(`DELETE /api/campaigns/${campaignId} - Successfully deleted campaign from DB.`, {
      clerkUserId,
      orgId,
    });

    try {
      await deleteCampaignFromAlgolia(campaignId);
      logger.info(
        `DELETE /api/campaigns/${campaignId} - Successfully deleted campaign from Algolia.`,
        { clerkUserId, orgId }
      );
    } catch (algoliaError) {
      logger.error(`DELETE /api/campaigns/${campaignId} - Error deleting campaign from Algolia.`, {
        clerkUserId,
        orgId,
        error: algoliaError,
      });
      // Do not fail the request if only Algolia deletion fails, but log it.
    }

    return NextResponse.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error: any) {
    // Log the error with campaignId if available from params
    logger.error(`DELETE /api/campaigns/${campaignId} - Error:`, {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    console.log('[API PUT /api/campaigns/[campaignId]] Handler started');
    const { campaignId } = await params;

    // Check if the ID is a UUID (string format) or a numeric ID
    const _isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      campaignId
    );
    const numericId = parseInt(campaignId, 10);
    const isNumeric = !isNaN(numericId);

    // Parse the request body and assert type
    const body = (await request.json()) as z.infer<typeof campaignUpdateSchema>;
    // Validate the body (type assertion doesn't replace runtime validation)
    const validationResult = campaignUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      console.error(
        '[API PUT /api/campaigns/[campaignId]] Validation failed:',
        validationResult.error.format()
      );
      return NextResponse.json(
        { success: false, error: 'Invalid request body', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    const validatedData = validationResult.data;

    // Connect to database
    await connectToDatabase();

    let updatedCampaign;

    if (isNumeric) {
      // Update the campaign in CampaignWizardSubmission table for numeric IDs (submitted campaigns)
      console.log(
        '[API PUT /api/campaigns/[campaignId]] Updating submitted campaign with numeric ID:',
        numericId
      );
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
      return NextResponse.json(
        { success: false, error: 'Invalid or non-submitted campaign ID format' },
        { status: 400 }
      );
    }

    console.log(`[API PUT /api/campaigns/[campaignId]] Campaign updated: ${campaignId}`);
    return NextResponse.json({ success: true, data: updatedCampaign }, { status: 200 });
  } catch (error) {
    console.error(`[API PUT /api/campaigns/[campaignId]] Error:`, error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
