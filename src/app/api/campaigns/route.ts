import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/lib/prisma'
import { Currency, Platform, KPI, SubmissionStatus, Position } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    // If no ID is provided, return all campaigns
    if (!id) {
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
          creativeRequirements: true,
          influencers: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ 
        success: true, 
        campaigns 
      });
    }

    // If ID is provided, return specific campaign
    const campaignId = parseInt(id);
    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
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
        creativeRequirements: true,
        influencers: true
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      campaign 
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign(s)' },
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
      // Removing single platform and influencer handle
      // platform: body.platform as Platform,
      // influencerHandle: body.influencerHandle,
      
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
      
      // Exchange rate data if available
      exchangeRateData: body.exchangeRateData ? JSON.stringify(body.exchangeRateData) : null,
    };

    console.log('Prepared campaign data:', campaignData);

    // Create the campaign and related influencers in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the campaign first
      const campaign = await tx.campaignWizardSubmission.create({
        data: campaignData,
        include: {
          primaryContact: true,
          secondaryContact: true,
        },
      });
      
      // Create influencers if provided
      if (body.influencers && Array.isArray(body.influencers) && body.influencers.length > 0) {
        console.log(`Creating ${body.influencers.length} influencers for campaign:`, body.influencers);
        
        // Create all influencers
        for (const influencer of body.influencers) {
          if (influencer.platform && influencer.handle) {
            await tx.influencer.create({
              data: {
                platform: influencer.platform as Platform,
                handle: influencer.handle,
                platformId: influencer.id || null, // Store any platform-specific ID if available
                campaignId: campaign.id
              }
            });
          }
        }
      }
      
      return campaign;
    });

    return NextResponse.json({ 
      success: true, 
      id: result.id 
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

    // Update campaign and influencers in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the main campaign data
      const updatedCampaign = await tx.campaignWizardSubmission.update({
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
          // Removing single platform and influencer handle
          // platform: body.platform as Platform,
          // influencerHandle: body.influencerHandle,
          submissionStatus: "draft" as SubmissionStatus,
          
          // Exchange rate data if available
          exchangeRateData: body.exchangeRateData ? JSON.stringify(body.exchangeRateData) : null,
        },
      });

      // Handle influencers update if provided
      if (body.influencers && Array.isArray(body.influencers)) {
        // Delete existing influencers for this campaign
        await tx.influencer.deleteMany({
          where: { campaignId }
        });
        
        // Create new influencers
        for (const influencer of body.influencers) {
          if (influencer.platform && influencer.handle) {
            await tx.influencer.create({
              data: {
                platform: influencer.platform as Platform,
                handle: influencer.handle,
                platformId: influencer.id || null, // Store any platform-specific ID if available
                campaignId
              }
            });
          }
        }
      }
      
      return updatedCampaign;
    });

    return NextResponse.json({ 
      success: true, 
      id: result.id 
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
