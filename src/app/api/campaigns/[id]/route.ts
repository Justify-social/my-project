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
      const id = parseInt(campaignId);
      
      if (isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid campaign ID' },
          { status: 400 }
        );
      }
      
      // Connect to database
      await connectToDatabase();
      
      // Fetch the actual campaign from the database
      const campaign = await prisma.campaignWizardSubmission.findUnique({
        where: { id },
        include: {
          primaryContact: true,
          secondaryContact: true,
          audience: {
            include: {
              locations: true,
              genders: true,
              screeningQuestions: true,
              languages: true,
              competitors: true
            }
          },
          creativeAssets: true,
          creativeRequirements: true
        }
      });
      
      // If campaign not found, return 404
      if (!campaign) {
        return NextResponse.json(
          { 
            error: 'Campaign not found',
            message: `No campaign found with ID ${id}`
          }, 
          { status: 404 }
        );
      }
      
      // Format the audience data to match the expected structure
      const formattedCampaign = {
        ...campaign,
        audience: campaign.audience ? {
          demographics: {
            ageRange: [
              campaign.audience.age1824.toString(),
              campaign.audience.age2534.toString(),
              campaign.audience.age3544.toString(),
              campaign.audience.age4554.toString(),
              campaign.audience.age5564.toString(),
              campaign.audience.age65plus.toString()
            ],
            gender: campaign.audience.genders.map(g => g.gender),
            education: [campaign.audience.educationLevel],
            income: [campaign.audience.incomeLevel],
            interests: campaign.audience.screeningQuestions?.map(q => q.question) || [],
            locations: campaign.audience.locations?.map(l => l.location) || [],
            languages: campaign.audience.languages?.map(l => l.language) || []
          }
        } : null,
        secondaryKPIs: Array.isArray(campaign.secondaryKPIs) ? campaign.secondaryKPIs : [],
        features: Array.isArray(campaign.features) ? campaign.features : []
      };
      
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
