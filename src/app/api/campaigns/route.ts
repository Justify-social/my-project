import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@prisma/client';
import { Currency, Platform, KPI, SubmissionStatus } from '@prisma/client';

const prismaClient = new PrismaClient();

export async function GET() {
  try {
    const campaigns = await prisma.campaignWizardSubmission.findMany({
      include: {
        primaryContact: true,
        secondaryContact: true,
      }
    });
    
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Error fetching campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Log the incoming data
    console.log('Received campaign data:', data);

    const campaign = await prisma.campaignWizardSubmission.create({
      data: {
        // Make sure all required fields are present
        campaignName: data.campaignName,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        timeZone: data.timeZone,
        contacts: data.contacts,
        currency: data.currency,
        totalBudget: parseFloat(data.totalBudget),
        socialMediaBudget: parseFloat(data.socialMediaBudget),
        platform: data.platform,
        influencerHandle: data.influencerHandle,
        
        // Create primary contact
        primaryContact: {
          create: {
            firstName: data.primaryContact.firstName,
            surname: data.primaryContact.surname,
            email: data.primaryContact.email,
            position: data.primaryContact.position,
          }
        },
        
        // Create secondary contact
        secondaryContact: {
          create: {
            firstName: data.secondaryContact.firstName,
            surname: data.secondaryContact.surname,
            email: data.secondaryContact.email,
            position: data.secondaryContact.position,
          }
        },

        // Required fields from schema
        mainMessage: '',
        hashtags: '',
        memorability: '',
        keyBenefits: '',
        expectedAchievements: '',
        purchaseIntent: '',
        brandPerception: '',
        primaryKPI: 'adRecall', // Default value
      }
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
