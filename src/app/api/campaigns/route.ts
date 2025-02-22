import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/lib/prisma'
import { Currency, Platform, KPI, SubmissionStatus, Position } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = parseInt(searchParams.get('id') || '');
    
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Invalid campaign ID' }), {
        status: 400,
      });
    }

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

    if (!campaign) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ campaign }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch campaign' }), {
      status: 500,
    });
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

    // Prepare the campaign data
    const campaignData = {
      campaignName: body.name,
      description: body.businessGoal,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      timeZone: body.timeZone,
      contacts: body.contacts || "",
      currency: body.currency as Currency,
      totalBudget: parseFloat(body.totalBudget),
      socialMediaBudget: parseFloat(body.socialMediaBudget),
      platform: body.platform as Platform,
      influencerHandle: body.influencerHandle,
      
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
        platform: body.platform as Platform,
        influencerHandle: body.influencerHandle,
        submissionStatus: "draft" as SubmissionStatus,
      },
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
