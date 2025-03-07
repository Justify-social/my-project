import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma, Platform, Position, KPI, Currency, SubmissionStatus, CreativeAssetType, Feature, Status } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger'
import { v4 as uuidv4 } from 'uuid'
import { withValidation, tryCatch } from '@/middleware/api'

// Define schemas for campaign creation validation
// Note: Frontend uses 'Instagram', backend uses 'INSTAGRAM' - transformation required
const influencerSchema = z.object({
  name: z.string().optional().default(''),
  handle: z.string().min(1, "Handle is required"),
  // Accept any platform format - transformation will handle it
  platform: z.string(),
  id: z.string().optional(),
  url: z.string().optional().default(''),
  posts: z.number().optional().default(0),
  videos: z.number().optional().default(0),
  reels: z.number().optional().default(0),
  stories: z.number().optional().default(0)
}).optional();

// Define a more flexible influencer schema specifically for drafts
const draftInfluencerSchema = z.object({
  name: z.string().optional().default(''),
  handle: z.string().optional().default(''),  // Make handle optional for drafts
  platform: z.string().optional().default(''), // Make platform optional for drafts
  id: z.string().optional(),
  url: z.string().optional().default(''),
  posts: z.number().optional().default(0),
  videos: z.number().optional().default(0),
  reels: z.number().optional().default(0),
  stories: z.number().optional().default(0)
}).optional();

// Position has the same format in frontend and backend
const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  surname: z.string().min(1, "Surname is required").optional(),
  email: z.string().email("Valid email is required").optional(),
  position: z.string().optional()
}).optional();

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
  budget: z.any().optional() // Make budget an "any" type to be more flexible
});

const campaignUpdateSchema = z.object({
  id: z.string().uuid("Invalid campaign ID format"),
  campaignName: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  step: z.number().optional()
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
  features: z.array(z.string()).optional()
});

// Create a more flexible campaign schema that works for both drafts and complete submissions
const campaignFlexibleSchema = z.object({
  // Always required, even for drafts
  name: z.string().min(1, "Campaign name is required"),
  
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
  budget: z.any().optional()
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
      
      // Import the EnumTransformers utility
      const { EnumTransformers } = await import('@/utils/enum-transformers');
      
      // Transform enum values from backend to frontend format
      const transformedCampaigns = campaigns.map(campaign => {
        // First transform the campaign object
        const transformed = EnumTransformers.transformObjectFromBackend(campaign);
        
        // Then ensure date fields are properly formatted as strings
        // This avoids type errors since we're creating a new object
        return {
          ...transformed,
          startDate: campaign.startDate instanceof Date ? campaign.startDate.toISOString() : null,
          endDate: campaign.endDate instanceof Date ? campaign.endDate.toISOString() : null,
          createdAt: campaign.createdAt instanceof Date ? campaign.createdAt.toISOString() : null,
          updatedAt: campaign.updatedAt instanceof Date ? campaign.updatedAt.toISOString() : null
        };
      });
      
      return NextResponse.json({
        success: true,
        data: transformedCampaigns // Use 'data' key to be consistent with GET /api/campaigns/[id]
      });
    },
    { entityName: 'Campaign', operation: DbOperation.FETCH }
  );
}

// POST handler - Create campaign with flexible schema
export const POST = withValidation(
  campaignFlexibleSchema,
  async (data, request) => {
    try {
      // Log the raw request data
      console.log('Raw request data:', JSON.stringify(data, null, 2));
      
      // Import the EnumTransformers utility
      const { EnumTransformers } = await import('@/utils/enum-transformers');
      
      // Check if we're handling a draft submission
      const isDraft = data.status === 'draft';
      console.log(`Processing ${isDraft ? 'DRAFT' : 'COMPLETE'} submission`);
      
      // Apply stricter validation for non-drafts inside the handler
      if (!isDraft) {
        const requiredFields = ['businessGoal', 'startDate', 'endDate', 'timeZone', 'currency'] as const;
        const missingFields = requiredFields.filter(field => !data[field as keyof typeof data]);
        
        if (missingFields.length > 0) {
          console.error(`Missing required fields: ${missingFields.join(', ')}`);
          return NextResponse.json({
            success: false,
            error: `Missing required fields for complete submission: ${missingFields.join(', ')}`,
            details: { missingFields }
          }, { status: 400 });
        }
        
        // Validate influencers for non-draft submissions
        if (data.influencers && Array.isArray(data.influencers)) {
          // Check if any influencer is missing required fields
          const invalidInfluencers = data.influencers.filter(
            influencer => influencer && (!influencer.platform || !influencer.handle)
          );
          
          if (invalidInfluencers.length > 0) {
            console.error('Invalid influencers data:', invalidInfluencers);
            return NextResponse.json({
              success: false,
              error: 'Influencer data incomplete',
              details: { invalidInfluencers }
            }, { status: 400 });
          }
        }
      } else {
        // For drafts, filter out any incomplete influencer entries
        if (data.influencers && Array.isArray(data.influencers)) {
          data.influencers = data.influencers.filter(
            influencer => influencer && influencer.platform && influencer.handle
          );
        }
      }
      
      // Transform any enum values from frontend to backend format
      // Note: This will handle Currency, Platform, Position, KPI and Feature enums
      const transformedData = EnumTransformers.transformObjectToBackend(data);
      console.log('Transformed data for API:', JSON.stringify(transformedData, null, 2));
      
      // Extract budget data from either the budget object or top-level properties
      const budgetData = transformedData.budget || {
        total: transformedData.totalBudget || 0,
        currency: transformedData.currency || 'USD',
        socialMedia: transformedData.socialMediaBudget || 0
      };
      
      console.log('Budget data:', JSON.stringify(budgetData, null, 2));
      
      // For drafts, be more lenient with contact data handling
      // Initialize with empty objects for drafts
      const primaryContactData = transformedData.primaryContact && 
          (transformedData.primaryContact.firstName || 
           transformedData.primaryContact.email) ? {
          firstName: transformedData.primaryContact.firstName || '',
          surname: transformedData.primaryContact.surname || '',
          email: transformedData.primaryContact.email || '',
          position: transformedData.primaryContact.position || 'Manager'
        } : (isDraft ? {} : null);
      
      const secondaryContactData = transformedData.secondaryContact && 
          (transformedData.secondaryContact.firstName || 
           transformedData.secondaryContact.email) ? {
          firstName: transformedData.secondaryContact.firstName || '',
          surname: transformedData.secondaryContact.surname || '',
          email: transformedData.secondaryContact.email || '',
          position: transformedData.secondaryContact.position || 'Manager'
        } : (isDraft ? {} : null);
      
      // Convert to JSON strings for database storage
      const primaryContactJson = primaryContactData ? JSON.stringify(primaryContactData) : Prisma.JsonNull;
      const secondaryContactJson = secondaryContactData ? JSON.stringify(secondaryContactData) : Prisma.JsonNull;
      
      console.log('Primary contact:', primaryContactJson);
      console.log('Secondary contact:', secondaryContactJson);
      
      // Prepare DB creation data - only include fields that are in the database schema
      const dbData = {
        id: uuidv4(),
        name: transformedData.name,
        businessGoal: transformedData.businessGoal || '',
        // Ensure we always have valid dates
        startDate: transformedData.startDate && transformedData.startDate !== '' 
          ? new Date(transformedData.startDate) 
          : new Date(), // Default to current date if not provided
        endDate: transformedData.endDate && transformedData.endDate !== '' 
          ? new Date(transformedData.endDate) 
          : new Date(), // Default to current date if not provided
        timeZone: transformedData.timeZone || 'UTC',
        primaryContact: primaryContactJson,
        secondaryContact: secondaryContactJson,
        budget: JSON.stringify(budgetData),
        updatedAt: new Date(),
        status: isDraft ? Status.DRAFT : Status.COMPLETED,
        step1Complete: true,
        step2Complete: false, 
        step3Complete: false, 
        step4Complete: false,
        // Initialize arrays
        secondaryKPIs: [],
        features: [],
        locations: [],
        competitors: [],
        assets: [],
        requirements: []
      };
      
      console.log('Database creation data:', JSON.stringify(dbData, null, 2));
      
      try {
        // Create campaign and handle influencers in the same transaction
        const campaign = await prisma.$transaction(async (tx) => {
          // First create the campaign
          const newCampaign = await tx.campaignWizard.create({
            data: dbData
          });
          
          // If there are influencers in the request, create them
          if (transformedData.influencers && Array.isArray(transformedData.influencers) && transformedData.influencers.length > 0) {
            // Filter out any incomplete influencer data
            const validInfluencers = transformedData.influencers.filter(
              (inf): inf is NonNullable<typeof inf> => 
                !!inf && typeof inf === 'object' && 
                typeof inf.platform === 'string' && !!inf.platform &&
                typeof inf.handle === 'string' && !!inf.handle
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
                  updatedAt: new Date()
                }
              });
            }
          }
          
          return newCampaign;
        });

        dbLogger.info(
          DbOperation.CREATE,
          'Campaign created successfully',
          { campaignId: campaign.id }
        );

        // Fetch the complete campaign with influencers for the response
        const campaignWithInfluencers = await prisma.campaignWizard.findUnique({
          where: { id: campaign.id },
          include: {
            Influencer: true
          }
        });

        // Transform campaign data back to frontend format before returning
        const transformedCampaign = EnumTransformers.transformObjectFromBackend(campaignWithInfluencers);

        return NextResponse.json({
          success: true,
          data: transformedCampaign,
          message: 'Campaign created successfully'
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
        
        return NextResponse.json({
          success: false,
          error: 'Database error during campaign creation',
          details: dbError instanceof Error ? dbError.message : String(dbError),
          code: dbError instanceof Prisma.PrismaClientKnownRequestError ? dbError.code : undefined,
          meta: dbError instanceof Prisma.PrismaClientKnownRequestError ? dbError.meta : undefined
        }, { status: 500 });
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      
      // Provide detailed error information for debugging
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error', 
        details: error
      }, { status: 500 });
    }
  },
  { 
    entityName: 'Campaign', 
    logValidationErrors: true,
    logRequestBody: true
  }
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
