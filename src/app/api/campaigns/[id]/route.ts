import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod'; // For input validation
import { Currency, Platform, SubmissionStatus } from '@prisma/client';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db';
import { tryCatch } from '@/config/middleware/api';
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
  // Step 2 specific fields
  secondaryKPIs: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  // Allow messaging as a nested object
  messaging: z.object({
    mainMessage: z.string().optional(),
    hashtags: z.string().optional(),
    memorability: z.string().optional(),
    keyBenefits: z.string().optional(),
    expectedAchievements: z.string().optional(),
    purchaseIntent: z.string().optional(),
    brandPerception: z.string().optional()
  }).optional(),
  // Step 3 audience data - add comprehensive schema
  audience: z.object({
    location: z.array(z.string()).optional(),
    ageDistribution: z.object({
      age1824: z.number().optional(),
      age2534: z.number().optional(),
      age3544: z.number().optional(),
      age4554: z.number().optional(),
      age5564: z.number().optional(),
      age65plus: z.number().optional(),
    }).optional(),
    gender: z.array(z.string()).optional(),
    otherGender: z.string().optional(),
    screeningQuestions: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    educationLevel: z.string().optional(),
    jobTitles: z.array(z.string()).optional(),
    incomeLevel: z.number().optional(),
    competitors: z.array(z.string()).optional(),
  }).optional(),
  // Step metadata
  step: z.number().optional(),
  status: z.enum(['draft', 'submitted']).optional(),
  name: z.string().optional(),
  // Other fields
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
  })).optional(),
  // For backward compatibility
  submissionStatus: z.enum(['draft', 'submitted']).optional(),
  influencers: z.array(z.any()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Using tryCatch middleware for error handling
  return tryCatch(
    async () => {
      // Get campaign ID from params - properly awaiting
      const { id } = await params;
      const campaignId = id;
      
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
      if (campaign && 'Influencer' in campaign && Array.isArray(campaign.Influencer)) {
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
      
      // Debug logging for assets
      if (campaign && 'assets' in campaign && Array.isArray(campaign.assets)) {
        console.log('Campaign has assets array with', campaign.assets.length, 'items');
      } else {
        console.log('Campaign has no assets array or assets are not in array format');
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
      
      // For debugging date formats
      console.log('Date fields in response:', {
        startDate: formattedCampaign.startDate, 
        endDate: formattedCampaign.endDate 
      });
      
      // Return the campaign data
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
  { params }: { params: Promise<{ id: string }> }
) {
  return tryCatch(
    async () => {
      const { id } = await params;
      const campaignId = id;
      
      // Check if the ID is a UUID (string format) or a numeric ID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
      const numericId = parseInt(campaignId);
      
      if (!isUuid && isNaN(numericId)) {
        return NextResponse.json(
          { error: 'Invalid campaign ID' },
          { status: 400 }
        );
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
            details: validationResult.error.format() 
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
        
        // Map the incoming data to match the CampaignWizard schema
        const mappedData: any = {
          // Map direct fields that match the schema
          updatedAt: new Date(),
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
            socialMedia: data.socialMediaBudget || 0
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
          mappedData.features = Array.isArray(data.features) 
            ? data.features 
            : [data.features];
        }
        
        // Handle messaging if present
        if (data.messaging || data.mainMessage || data.hashtags || data.memorability || 
            data.keyBenefits || data.expectedAchievements || 
            data.purchaseIntent || data.brandPerception) {
          
          console.log('Saving messaging fields:', {
            mainMessage: data.mainMessage || data.messaging?.mainMessage,
            hashtags: data.hashtags || data.messaging?.hashtags,
            memorability: data.memorability || data.messaging?.memorability
          });
          
          // Construct messaging from either direct fields or the messaging object
          mappedData.messaging = {
            mainMessage: data.mainMessage || data.messaging?.mainMessage || '',
            hashtags: data.hashtags || data.messaging?.hashtags || '',
            memorability: data.memorability || data.messaging?.memorability || '',
            keyBenefits: data.keyBenefits || data.messaging?.keyBenefits || '',
            expectedAchievements: data.expectedAchievements || data.messaging?.expectedAchievements || '',
            purchaseIntent: data.purchaseIntent || data.messaging?.purchaseIntent || '',
            brandPerception: data.brandPerception || data.messaging?.brandPerception || ''
          };
        }
        
        // Handle audience data if present
        if (data.audience) {
          console.log('Audience data received:', JSON.stringify(data.audience, null, 2));
          
          if (!mappedData.demographics) mappedData.demographics = {};
          
          // Map age distribution
          if (data.audience.ageDistribution) {
            mappedData.demographics.ageDistribution = data.audience.ageDistribution;
          }
          
          // Map gender and otherGender
          if (Array.isArray(data.audience.gender)) {
            mappedData.demographics.gender = data.audience.gender;
          }
          
          if (data.audience.otherGender) {
            mappedData.demographics.otherGender = data.audience.otherGender;
          }

          // Map educationLevel and incomeLevel
          if (data.audience.educationLevel) {
            mappedData.demographics.educationLevel = data.audience.educationLevel;
          }
          
          if (data.audience.incomeLevel) {
            mappedData.demographics.incomeLevel = data.audience.incomeLevel;
          }
          
          // Map jobTitles
          if (Array.isArray(data.audience.jobTitles)) {
            mappedData.demographics.jobTitles = data.audience.jobTitles;
          }
          
          // Map location
          if (Array.isArray(data.audience.location)) {
            console.log('Location array:', data.audience.location);
            mappedData.locations = data.audience.location.map(loc => ({ location: loc }));
          }
          
          // Initialize targeting if not present
          if (!mappedData.targeting) mappedData.targeting = {};
          
          // Map screeningQuestions
          if (Array.isArray(data.audience.screeningQuestions)) {
            console.log('Screening questions array:', data.audience.screeningQuestions);
            mappedData.targeting.screeningQuestions = data.audience.screeningQuestions.map(q => ({ question: q }));
          }
          
          // Map languages
          if (Array.isArray(data.audience.languages)) {
            console.log('Languages array:', data.audience.languages);
            mappedData.targeting.languages = data.audience.languages.map(lang => ({ language: lang }));
          }
          
          // Map competitors - Fix: Store as string array, not objects with competitor property
          if (Array.isArray(data.audience.competitors)) {
            console.log('Competitors array:', data.audience.competitors);
            // Store competitors as a string array, which is what Prisma expects
            mappedData.competitors = data.audience.competitors;
          }
          
          console.log('Mapped audience data:', {
            demographics: mappedData.demographics,
            locations: mappedData.locations,
            targeting: mappedData.targeting,
            competitors: mappedData.competitors
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
            Influencer: true
          }
        });
        
        // If there are influencers in the request, create or update them
        if (data.influencers && Array.isArray(data.influencers) && data.influencers.length > 0) {
          console.log('Updating influencers for campaign:', campaignId);
          
          // First delete existing influencers to avoid duplicates
          await prisma.influencer.deleteMany({
            where: { campaignId }
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
                  updatedAt: new Date()
                }
              });
            });
          
          await Promise.all(influencerPromises);
          
          // Refetch the campaign with updated influencers
          updatedCampaign = await prisma.campaignWizard.findUnique({
            where: { id: campaignId },
            include: {
              Influencer: true
            }
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
          updatedAt: new Date()
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
            creativeRequirements: true
          }
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
        data: transformedCampaign
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
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params before using it
  const { id } = await params;
  console.log(`DELETE request started for campaign ID: ${id}`);
  
  try {
    const session = await getSession();
    
    // Log authentication status
    console.log(`Authentication status: ${session ? 'Authenticated' : 'Not authenticated'}`);
    
    if (!session?.user) {
      console.error('Delete failed: No authenticated user session');
      return NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }
    
    // Get the campaign ID
    const campaignId = id;
    
    console.log(`Authenticated user: ${session.user.email}, attempting to delete campaign with ID: ${campaignId}`);
    
    // The ID differences:
    // - CampaignWizard uses String UUIDs as IDs
    // - CampaignWizardSubmission uses auto-increment Int IDs
    
    // Try to delete from CampaignWizard first (UUID string ID)
    let campaignWizardDeleted = false;
    
    try {
      // Check if it exists first
      const campaignWizard = await prisma.campaignWizard.findUnique({
        where: { id: campaignId }
      });
      
      if (campaignWizard) {
        console.log(`Found campaign in CampaignWizard: ${campaignWizard.name}`);
        
        // Use a transaction to delete related records
        await prisma.$transaction(async (tx) => {
          // Delete related influencers
          await tx.influencer.deleteMany({
            where: { campaignId: campaignId }
          });
          
          // Delete the campaign
          await tx.campaignWizard.delete({
            where: { id: campaignId }
          });
        });
        
        console.log(`Successfully deleted campaign from CampaignWizard table: ${campaignId}`);
        campaignWizardDeleted = true;
      } else {
        console.log(`No campaign found in CampaignWizard with ID: ${campaignId}`);
      }
    } catch (wizardError) {
      console.error(`Error deleting from CampaignWizard:`, wizardError);
    }
    
    // Try to delete from CampaignWizardSubmission as fallback (numeric ID)
    let submissionDeleted = false;
    
    if (!campaignWizardDeleted) {
      try {
        // Try to parse as number for CampaignWizardSubmission
        const numericId = parseInt(campaignId);
        
        if (!isNaN(numericId)) {
          // Check if it exists
          const submission = await prisma.campaignWizardSubmission.findUnique({
            where: { id: numericId }
          });
          
          if (submission) {
            console.log(`Found campaign in CampaignWizardSubmission: ${submission.campaignName}`);
            
            // Use a transaction to delete related records
            await prisma.$transaction(async (tx) => {
              // Find related audiences
              const relatedAudiences = await tx.audience.findMany({
                where: { campaignId: numericId },
              });
              
              console.log(`Found ${relatedAudiences.length} related audiences`);
              
              // Process each related audience
              for (const audience of relatedAudiences) {
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
              
              // Delete creative assets and requirements
              await tx.creativeAsset.deleteMany({
                where: { submissionId: numericId },
              });
              
              await tx.creativeRequirement.deleteMany({
                where: { submissionId: numericId },
              });
              
              // Finally delete the campaign
              await tx.campaignWizardSubmission.delete({
                where: { id: numericId },
              });
            });
            
            console.log(`Successfully deleted campaign from CampaignWizardSubmission table: ${numericId}`);
            submissionDeleted = true;
          } else {
            console.log(`No campaign found in CampaignWizardSubmission with ID: ${numericId}`);
          }
        } else {
          console.log(`Campaign ID ${campaignId} is not a numeric ID, can't delete from CampaignWizardSubmission`);
        }
      } catch (submissionError) {
        console.error(`Error deleting from CampaignWizardSubmission:`, submissionError);
      }
    }
    
    // Check if we were able to delete from either table
    if (campaignWizardDeleted || submissionDeleted) {
      return NextResponse.json({
        success: true,
        message: `Campaign with ID ${campaignId} has been deleted`,
        source: campaignWizardDeleted ? 'CampaignWizard' : 'CampaignWizardSubmission'
      });
    } else {
      // We couldn't find or delete the campaign
      console.error(`Campaign with ID ${campaignId} could not be found in any table`);
      return NextResponse.json(
        { error: `Campaign with ID ${campaignId} not found` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in DELETE handler:', error);
    return NextResponse.json(
      { 
        error: 'Server error', 
        details: error instanceof Error ? error.message : 'Unknown server error'
      },
      { status: 500 }
    );
  }
}
