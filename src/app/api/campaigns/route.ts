import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/lib/prisma'
import { Currency, Platform, KPI, SubmissionStatus, Position } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    // If no ID is provided, return all campaigns
    if (!id) {
      try {
        const campaigns = await prisma.campaignWizardSubmission.findMany({
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return NextResponse.json({ 
          success: true, 
          campaigns: campaigns || []
        });
      } catch (dbError) {
        console.error('Database error fetching campaigns:', dbError);
        // Return empty array instead of error
        return NextResponse.json({ 
          success: true, 
          campaigns: [] 
        });
      }
    }

    // If ID is provided, return specific campaign
    try {
      const campaignId = parseInt(id);
      if (isNaN(campaignId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid campaign ID', campaign: null },
          { status: 400 }
        );
      }

      const campaign = await prisma.campaignWizardSubmission.findUnique({
        where: { id: campaignId },
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

      if (!campaign) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found', campaign: null },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        campaign 
      });
    } catch (dbError) {
      console.error('Database error fetching specific campaign:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error fetching campaign',
        campaign: null
      });
    }
  } catch (error) {
    console.error('Unexpected error in campaigns API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign(s)', campaigns: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    // Create primary contact first
    const primaryContact = await prisma.primaryContact.create({
      data: {
        firstName: body.primaryContact?.firstName || "",
        surname: body.primaryContact?.surname || "",
        email: body.primaryContact?.email || "",
        position: (body.primaryContact?.position || "Manager") as Position,
      },
    });

    // Create secondary contact
    const secondaryContact = await prisma.secondaryContact.create({
      data: {
        firstName: body.secondaryContact?.firstName || "",
        surname: body.secondaryContact?.surname || "",
        email: body.secondaryContact?.email || "",
        position: (body.secondaryContact?.position || "Manager") as Position,
      },
    });

    // Process additional contacts if any
    let additionalContactsJSON = "[]";
    if (body.additionalContacts && Array.isArray(body.additionalContacts) && body.additionalContacts.length > 0) {
      additionalContactsJSON = JSON.stringify(body.additionalContacts);
      console.log('Processing additional contacts:', additionalContactsJSON);
    }

    // Prepare the campaign data
    const campaignData = {
      campaignName: body.name,
      description: body.businessGoal,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      timeZone: body.timeZone,
      contacts: additionalContactsJSON, // Store additional contacts as JSON
      currency: body.currency as Currency,
      totalBudget: parseFloat(body.totalBudget),
      socialMediaBudget: parseFloat(body.socialMediaBudget),
      // Add required fields that were missing
      platform: body.platform as Platform || "Instagram" as Platform,
      influencerHandle: body.influencerHandle || "",
      
      // Required fields from schema
      mainMessage: body.businessGoal || "",
      hashtags: "",
      memorability: "",
      keyBenefits: "",
      expectedAchievements: "",
      purchaseIntent: "",
      brandPerception: "",
      primaryKPI: "brandAwareness" as KPI,
      secondaryKPIs: [],
      features: [],
      
      // Connect the contacts
      primaryContactId: primaryContact.id,
      secondaryContactId: secondaryContact.id,
      
      submissionStatus: "draft" as SubmissionStatus,
    };

    console.log('Prepared campaign data:', campaignData);

    // Create the campaign without using influencers (which don't exist in schema)
    const campaign = await prisma.campaignWizardSubmission.create({
      data: campaignData,
      include: {
        primaryContact: true,
        secondaryContact: true,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      id: campaign.id 
    });

  } catch (error) {
    console.error('Campaign creation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to create campaign',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const campaignId = parseInt(request.url.split('/').pop() || '0');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Update the campaign without transaction or influencers
    const updatedCampaign = await prisma.campaignWizardSubmission.update({
      where: { id: campaignId },
      data: {
        campaignName: body.name,
        description: body.businessGoal,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        timeZone: body.timeZone,
        currency: body.currency as Currency,
        totalBudget: parseFloat(body.totalBudget),
        socialMediaBudget: parseFloat(body.socialMediaBudget),
        // Include required fields
        platform: body.platform as Platform || "Instagram" as Platform,
        influencerHandle: body.influencerHandle || "",
        submissionStatus: "draft" as SubmissionStatus,
      },
    });

    return NextResponse.json({ 
      success: true, 
      campaign: updatedCampaign 
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
