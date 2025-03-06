import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod'; // For input validation
import { Currency, Platform, SubmissionStatus } from '@prisma/client';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db';
import { tryCatch } from '@/middleware/api';
import { DbOperation } from '@/lib/data-mapping/db-logger';

type RouteParams = { params: { id: string } }

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
  primaryContact: z.object({
    firstName: z.string(),
    surname: z.string(),
    email: z.string().email(),
    position: z.string()
  }).optional(),
  secondaryContact: z.object({
    firstName: z.string(),
    surname: z.string(),
    email: z.string().email(),
    position: z.string()
  }).optional(),
  // Optional arrays for related data
  creativeRequirements: z.array(z.object({
    requirement: z.string()
  })).optional(),
  brandGuidelines: z.array(z.object({
    guideline: z.string()
  })).optional()
});

// More comprehensive schema matching Prisma model
const campaignUpdateSchema = z.object({
  campaignName: z.string().min(1).max(255).optional(),
  businessGoal: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
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
  primaryKPI: z.enum([
    'AD_RECALL', 
    'BRAND_AWARENESS', 
    'CONSIDERATION', 
    'MESSAGE_ASSOCIATION',
    'BRAND_PREFERENCE', 
    'PURCHASE_INTENT', 
    'ACTION_INTENT',
    'RECOMMENDATION_INTENT', 
    'ADVOCACY'
  ]).optional(),
  creativeGuidelines: z.string().optional(),
  creativeNotes: z.string().optional(),
  submissionStatus: z.enum(['draft', 'submitted']).optional(),
  contacts: z.string().optional(),
  additionalContacts: z.array(z.record(z.string(), z.any())).optional(),
  primaryContact: z.object({
    firstName: z.string(),
    surname: z.string(),
    email: z.string().email(),
    position: z.string()
  }).optional(),
  secondaryContact: z.object({
    firstName: z.string(),
    surname: z.string(),
    email: z.string().email(),
    position: z.string()
  }).optional(),
  creativeRequirements: z.array(z.object({
    requirement: z.string()
  })).optional(),
  brandGuidelines: z.array(z.object({
    guideline: z.string()
  })).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Using tryCatch middleware for error handling
  return tryCatch(
    async () => {
      // Get campaign ID from params
      const campaignId = params.id;
      
      // Check if the ID is a UUID (string format) or a numeric ID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
      
      // Connect to database
      await connectToDatabase();
      
      let campaign = null;
      let isSubmittedCampaign = false;
      
      // Try to find the campaign based on ID format
      if (isUuid) {
        console.log('Using UUID format for campaign ID:', campaignId);
        // Look for draft in CampaignWizard table with string ID
        campaign = await prisma.campaignWizard.findUnique({
          where: { id: campaignId },
          include: {
            Influencer: true // Include the Influencer relation
          }
        });
      } else {
        // Handle legacy numeric IDs
        const numericId = parseInt(campaignId);
        if (isNaN(numericId)) {
          return NextResponse.json(
            { error: 'Invalid campaign ID format' },
            { status: 400 }
          );
        }
        console.log('Using numeric format for campaign ID:', numericId);
        // Look for submitted campaign in CampaignWizardSubmission table with numeric ID
        campaign = await prisma.campaignWizardSubmission.findUnique({
          where: { id: numericId },
          include: {
            primaryContact: true,
            secondaryContact: true,
            audience: true,  // Simplified include to avoid type errors
            creativeAssets: true,
            creativeRequirements: true
          }
        });
        isSubmittedCampaign = true;
      }
      
      // If campaign not found, return 404
      if (!campaign) {
        return NextResponse.json(
          { 
            error: 'Campaign not found',
            message: `No campaign found with ID ${campaignId}`
          }, 
          { status: 404 }
        );
      }
      
      // Process date fields before they get serialized improperly
      // This fixes the issue with dates being serialized as empty objects
      if (campaign.startDate) {
        if (campaign.startDate instanceof Date) {
          console.log('Converting startDate from Date to ISO string:', campaign.startDate);
          // Use any type to bypass TypeScript's strict checking
          (campaign as any).startDate = campaign.startDate.toISOString();
        } else if (typeof campaign.startDate === 'object' && Object.keys(campaign.startDate).length === 0) {
          console.log('Empty startDate object detected, setting to null');
          (campaign as any).startDate = null;
        }
      }
      
      if (campaign.endDate) {
        if (campaign.endDate instanceof Date) {
          console.log('Converting endDate from Date to ISO string:', campaign.endDate);
          (campaign as any).endDate = campaign.endDate.toISOString();
        } else if (typeof campaign.endDate === 'object' && Object.keys(campaign.endDate).length === 0) {
          console.log('Empty endDate object detected, setting to null');
          (campaign as any).endDate = null;
        }
      }
      
      // Also handle createdAt and updatedAt
      if ('createdAt' in campaign && campaign.createdAt instanceof Date) {
        (campaign as any).createdAt = campaign.createdAt.toISOString();
      }
      
      if ('updatedAt' in campaign && campaign.updatedAt instanceof Date) {
        (campaign as any).updatedAt = campaign.updatedAt.toISOString();
      }
      
      // Also check for dates in Influencer objects
      if ('Influencer' in campaign && Array.isArray(campaign.Influencer)) {
        console.log('Processing dates in Influencer objects:', campaign.Influencer.length);
        (campaign as any).Influencer = campaign.Influencer.map(influencer => {
          const processedInfluencer = { ...influencer };
          
          // Process createdAt and updatedAt in influencers
          if (processedInfluencer.createdAt instanceof Date) {
            processedInfluencer.createdAt = processedInfluencer.createdAt.toISOString();
          }
          
          if (processedInfluencer.updatedAt instanceof Date) {
            processedInfluencer.updatedAt = processedInfluencer.updatedAt.toISOString();
          }
          
          return processedInfluencer;
        });
      }
      
      // Import the EnumTransformers utility to transform enum values
      const { EnumTransformers } = await import('@/utils/enum-transformers');
      
      // Transform the campaign data for frontend consumption
      const transformedCampaign = EnumTransformers.transformObjectFromBackend(campaign);

      // Add draft status to the response
      const formattedCampaign = {
        ...transformedCampaign,
        isDraft: !isSubmittedCampaign
      };
      
      // Log what we're returning to help with debugging
      console.log('Returning campaign data with ID:', campaignId, 'isDraft:', !isSubmittedCampaign);
      console.log('Date fields in response:', { 
        startDate: formattedCampaign.startDate, 
        endDate: formattedCampaign.endDate 
      });
      
      return NextResponse.json({
        success: true,
        data: formattedCampaign
      });
    },
    { 
      entityName: 'Campaign', 
      operation: DbOperation.FETCH 
    }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return tryCatch(
    async () => {
      const campaignId = parseInt(params.id);
      
      if (isNaN(campaignId)) {
        return NextResponse.json(
          { error: 'Invalid campaign ID' },
          { status: 400 }
        );
      }
      
      // Parse and validate request body
      const body = await request.json();
      const validationResult = campaignUpdateSchema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: validationResult.error.format() 
          },
          { status: 400 }
        );
      }
      
      const data = validationResult.data;
      
      // Process additional contacts if provided
      let contactsUpdate = {};
      if (data.additionalContacts && Array.isArray(data.additionalContacts)) {
        contactsUpdate = {
          contacts: JSON.stringify(data.additionalContacts)
        };
      }
  
      // Create the update data object
      const updateData = {
        ...(data.campaignName && { campaignName: data.campaignName }),
        ...(data.businessGoal && { description: data.businessGoal }),
        ...(data.description && { description: data.description }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
        ...(data.timeZone && { timeZone: data.timeZone }),
        ...(data.currency && { currency: data.currency }),
        ...(data.totalBudget && { totalBudget: data.totalBudget }),
        ...(data.socialMediaBudget && { socialMediaBudget: data.socialMediaBudget }),
        ...(data.platform && { platform: data.platform }),
        ...(data.influencerHandle && { influencerHandle: data.influencerHandle }),
        ...contactsUpdate,
        ...(data.submissionStatus && { submissionStatus: data.submissionStatus }),
      };
  
      const updatedCampaign = await prisma.campaignWizardSubmission.update({
        where: { id: campaignId },
        data: updateData,
      });
  
      return NextResponse.json({ 
        success: true, 
        id: updatedCampaign.id 
      });
    },
    { 
      entityName: 'Campaign', 
      operation: DbOperation.UPDATE 
    }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return tryCatch(
    async () => {
      const session = await getSession();
  
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized - No session' },
          { status: 401 }
        );
      }
  
      const campaignId = parseInt(params.id);
      
      if (isNaN(campaignId)) {
        return NextResponse.json(
          { error: 'Invalid campaign ID' },
          { status: 400 }
        );
      }
  
      // Delete everything in the correct order within a transaction
      await prisma.$transaction(async (tx) => {
        // First, check if the campaign exists
        const campaign = await tx.campaignWizardSubmission.findUnique({
          where: { id: campaignId },
        });
        
        if (!campaign) {
          throw new Error(`Campaign with ID ${campaignId} not found`);
        }
        
        // Delete related audience data
        if (campaign.audienceId) {
          const audience = await tx.audience.findUnique({
            where: { id: campaign.audienceId },
          });
          
          if (audience) {
            // Delete audience related records
            await tx.audienceLocation.deleteMany({
              where: { audienceId: audience.id },
            });
            
            await tx.audienceGender.deleteMany({
              where: { audienceId: audience.id },
            });
            
            await tx.audienceScreeningQuestion.deleteMany({
              where: { audienceId: audience.id },
            });
            
            await tx.audienceLanguage.deleteMany({
              where: { audienceId: audience.id },
            });
            
            await tx.audienceCompetitor.deleteMany({
              where: { audienceId: audience.id },
            });
            
            // Delete audience
            await tx.audience.delete({
              where: { id: audience.id },
            });
          }
        }
        
        // Delete creative assets and requirements
        await tx.creativeAsset.deleteMany({
          where: { submissionId: campaignId },
        });
        
        await tx.creativeRequirement.deleteMany({
          where: { submissionId: campaignId },
        });
        
        // Finally delete the campaign
        await tx.campaignWizardSubmission.delete({
          where: { id: campaignId },
        });
      });
      
      return NextResponse.json({
        success: true,
        message: `Campaign with ID ${campaignId} has been deleted`
      });
    },
    { 
      entityName: 'Campaign', 
      operation: DbOperation.DELETE 
    }
  );
}
