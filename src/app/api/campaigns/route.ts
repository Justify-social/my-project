import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma, Platform, Position, KPI, Currency, SubmissionStatus, CreativeAssetType, Feature } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger'
import { v4 as uuidv4 } from 'uuid'
import { withValidation, tryCatch } from '@/middleware/api'

// Define schemas for campaign creation validation
const influencerSchema = z.object({
  name: z.string().optional().default(''),
  handle: z.string().min(1, "Handle is required"),
  platform: z.enum(['INSTAGRAM', 'YOUTUBE', 'TIKTOK']).default('INSTAGRAM'),
  url: z.string().optional().default(''),
  posts: z.number().optional().default(0),
  videos: z.number().optional().default(0),
  reels: z.number().optional().default(0),
  stories: z.number().optional().default(0)
}).optional();

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Valid email is required"),
  position: z.enum(['Manager', 'Director', 'VP']).default('Manager')
});

const audienceSchema = z.object({
  description: z.string().optional().default(''),
  size: z.number().optional().default(0),
  age1824: z.number().optional().default(0),
  age2534: z.number().optional().default(0),
  age3544: z.number().optional().default(0),
  age4554: z.number().optional().default(0),
  age5564: z.number().optional().default(0),
  age65plus: z.number().optional().default(0)
});

const creativeAssetSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']).default('IMAGE'),
  url: z.string().optional().default(''),
  description: z.string().optional().default('')
});

const creativeRequirementSchema = z.object({
  description: z.string().min(1, "Description is required"),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM')
});

const submissionSchema = z.object({
  primaryContact: contactSchema.optional(),
  secondaryContact: contactSchema.optional(),
  contacts: z.string().optional().default(''),
  platform: z.enum(['INSTAGRAM', 'YOUTUBE', 'TIKTOK']).default('INSTAGRAM'),
  mainMessage: z.string().optional().default(''),
  hashtags: z.string().optional().default(''),
  memorability: z.string().optional().default(''),
  keyBenefits: z.string().optional().default(''),
  expectedAchievements: z.string().optional().default(''),
  purchaseIntent: z.string().optional().default(''),
  brandPerception: z.string().optional().default(''),
  primaryKPI: z.enum([
    'AD_RECALL', 'BRAND_AWARENESS', 'CONSIDERATION', 'MESSAGE_ASSOCIATION',
    'BRAND_PREFERENCE', 'PURCHASE_INTENT', 'ACTION_INTENT',
    'RECOMMENDATION_INTENT', 'ADVOCACY'
  ]).default('BRAND_AWARENESS'),
  secondaryKPIs: z.string().optional().default(''),
  features: z.string().optional().default(''),
  audiences: z.array(audienceSchema).optional().default([]),
  creativeAssets: z.array(creativeAssetSchema).optional().default([]),
  creativeRequirements: z.array(creativeRequirementSchema).optional().default([])
}).optional();

const campaignCreateSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  businessGoal: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timeZone: z.string().optional(),
  primaryContact: contactSchema.optional(),
  secondaryContact: contactSchema.optional(),
  influencers: z.array(influencerSchema).optional(),
  audience: audienceSchema.optional(),
  creativeAssets: z.array(creativeAssetSchema).optional(),
  creativeRequirements: z.array(creativeRequirementSchema).optional(),
  budget: z.object({
    total: z.number().min(0, "Budget must be a positive number"),
    currency: z.enum(['USD', 'GBP', 'EUR']).default('USD'),
    allocation: z.array(z.object({
      category: z.string(),
      percentage: z.number().min(0).max(100)
    })).optional()
  }).optional()
});

const campaignUpdateSchema = z.object({
  id: z.string().uuid("Invalid campaign ID format"),
  campaignName: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  step: z.number().optional()
});

// GET handler - List campaigns
export async function GET(request: NextRequest) {
  return tryCatch(
    async () => {
      const campaigns = await prisma.campaignWizard.findMany({
        orderBy: {
          updatedAt: 'desc'
        },
        take: 100
      });
      
      return NextResponse.json({
        success: true,
        data: campaigns
      });
    },
    { entityName: 'Campaign', operation: DbOperation.FETCH }
  );
}

// POST handler - Create campaign
export const POST = withValidation(
  campaignCreateSchema,
  async (data, request) => {
    const campaign = await prisma.campaignWizard.create({
      data: {
        id: uuidv4(),
        name: data.name,
        businessGoal: data.businessGoal || '',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(),
        timeZone: data.timeZone || 'UTC',
        primaryContact: data.primaryContact ? JSON.stringify(data.primaryContact) : Prisma.JsonNull,
        secondaryContact: data.secondaryContact ? JSON.stringify(data.secondaryContact) : Prisma.JsonNull,
        budget: data.budget ? JSON.stringify(data.budget) : Prisma.JsonNull,
        updatedAt: new Date(),
        step1Complete: true,
        step2Complete: false, 
        step3Complete: false, 
        step4Complete: false,
        secondaryKPIs: [],
        features: [],
        locations: [],
        competitors: [],
        assets: [],
        requirements: []
      },
    });

    dbLogger.info(
      DbOperation.CREATE,
      'Campaign created successfully',
      { campaignId: campaign.id }
    );

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  },
  { entityName: 'Campaign', logValidationErrors: true }
);

// PATCH handler - Update campaign
export const PATCH = withValidation(
  campaignUpdateSchema,
  async (data, request) => {
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
          action: "UPDATE",
          changes: {},
          performedBy: "system",
        },
      });
    } catch (error) {
      console.error('Error creating wizard history:', error);
      // Continue with campaign update even if history creation fails
    }

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully'
    });
  },
  { entityName: 'Campaign', logValidationErrors: true }
);
