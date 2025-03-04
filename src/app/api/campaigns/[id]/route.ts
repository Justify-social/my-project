import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod'; // For input validation
import { Currency, Platform, SubmissionStatus } from '@prisma/client';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get campaign ID from params
    const campaignId = params.id;
    const id = parseInt(campaignId);
    
    console.log(`Fetching campaign data for ID: ${campaignId}`);
    
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
      console.log(`Campaign with ID ${id} not found`);
      return new Response(
        JSON.stringify({ 
          error: 'Campaign not found',
          message: `No campaign found with ID ${id}`
        }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
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
    
    console.log(`Successfully fetched campaign with ID ${id}`);
    
    return new Response(
      JSON.stringify(formattedCampaign), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching campaign:', error);
    
    // Return proper error response
    return new Response(
      JSON.stringify({ 
        error: 'Error fetching campaign', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = parseInt(params.id);
    const body = await request.json();
    console.log('Updating campaign:', campaignId, 'with data:', body);

    // Process additional contacts if provided
    let contactsUpdate = {};
    if (body.additionalContacts && Array.isArray(body.additionalContacts)) {
      contactsUpdate = {
        contacts: JSON.stringify(body.additionalContacts)
      };
      console.log('Updating additional contacts:', contactsUpdate);
    }

    // Create the update data object
    const updateData = {
      ...(body.name && { campaignName: body.name }),
      ...(body.businessGoal && { description: body.businessGoal }),
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
      ...(body.timeZone && { timeZone: body.timeZone }),
      ...(body.currency && { currency: body.currency as Currency }),
      ...(body.totalBudget && { totalBudget: parseFloat(body.totalBudget) }),
      ...(body.socialMediaBudget && { socialMediaBudget: parseFloat(body.socialMediaBudget) }),
      ...(body.platform && { platform: body.platform as Platform }),
      ...(body.influencerHandle && { influencerHandle: body.influencerHandle }),
      ...contactsUpdate, // Add the contacts update if it exists
      submissionStatus: "draft" as SubmissionStatus,
    };

    const updatedCampaign = await prisma.campaignWizardSubmission.update({
      where: { id: campaignId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      id: updatedCampaign.id 
    });

  } catch (error) {
    console.error('Campaign update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to update campaign',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('Starting delete operation for campaign:', params.id);
  
  try {
    const session = await getSession();
    console.log('Session:', session);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: 'Unauthorized - No session' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const campaignId = parseInt(params.id);
    
    if (isNaN(campaignId)) {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid campaign ID' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Delete everything in the correct order within a transaction
    await prisma.$transaction(async (tx) => {
      // First, check if the campaign exists
      const campaign = await tx.campaignWizardSubmission.findUnique({
        where: { id: campaignId },
        include: {
          audience: true,
          creativeAssets: true,
          creativeRequirements: true,
        }
      });

      if (!campaign) {
        throw new Error(`Campaign with ID ${campaignId} not found`);
      }

      // Delete audience-related records if audience exists
      if (campaign.audience) {
        // Delete audience relations first
        await tx.audienceLocation.deleteMany({
          where: { audienceId: campaign.audience.id }
        });
        
        await tx.audienceGender.deleteMany({
          where: { audienceId: campaign.audience.id }
        });
        
        await tx.audienceLanguage.deleteMany({
          where: { audienceId: campaign.audience.id }
        });
        
        await tx.audienceScreeningQuestion.deleteMany({
          where: { audienceId: campaign.audience.id }
        });
        
        await tx.audienceCompetitor.deleteMany({
          where: { audienceId: campaign.audience.id }
        });
        
        // Then delete the audience
        await tx.audience.delete({
          where: { id: campaign.audience.id }
        });
      }

      // Delete creative requirements
      await tx.creativeRequirement.deleteMany({
        where: { submissionId: campaignId }
      });

      // Delete creative assets
      await tx.creativeAsset.deleteMany({
        where: { submissionId: campaignId }
      });

      // Delete the campaign itself
      await tx.campaignWizardSubmission.delete({
        where: { id: campaignId }
      });
    });

    return new NextResponse(
      JSON.stringify({ message: 'Campaign deleted successfully' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Server error deleting campaign:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
