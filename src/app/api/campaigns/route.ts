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
    console.log('[API] Received data:', data);

    // Validate the incoming data
    if (!data.name) {
      console.log('[API] Missing name field');
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Log the attempt to create
    console.log('[API] Attempting to create campaign...');

    const campaign = await prisma.campaignWizardSubmission.create({
      data: {
        campaignName: data.name,
        description: data.businessGoal || '',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        timeZone: data.timeZone || 'UTC',
        contacts: '',
        currency: 'USD' as Currency,
        totalBudget: 0,
        socialMediaBudget: 0,
        platform: 'Instagram' as Platform,
        influencerHandle: '',
        mainMessage: '',
        hashtags: '',
        memorability: '',
        keyBenefits: '',
        expectedAchievements: '',
        purchaseIntent: '',
        brandPerception: '',
        primaryKPI: 'adRecall' as KPI,
        creativeGuidelines: '',
        creativeNotes: '',
        submissionStatus: 'draft' as SubmissionStatus,
        // Create contacts inline
        primaryContact: {
          create: {
            firstName: 'Default',
            surname: 'User',
            email: 'default@example.com',
            position: 'Manager'
          }
        },
        secondaryContact: {
          create: {
            firstName: 'Default',
            surname: 'User',
            email: 'default2@example.com',
            position: 'Manager'
          }
        }
      },
    });

    console.log('[API] Campaign created successfully:', campaign);
    return NextResponse.json(campaign, { status: 201 });

  } catch (error: any) {
    console.error('[API] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    return NextResponse.json({
      error: 'Failed to create campaign',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
