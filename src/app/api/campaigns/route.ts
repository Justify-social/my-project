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
    
    // Detailed logging of received data
    console.log('=== DEBUG START ===');
    console.log('Raw form data:', JSON.stringify(data, null, 2));
    console.log('Database URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Campaign name is required' },
        { status: 400 }
      );
    }

    // Create minimal campaign first
    const campaign = await prisma.campaignWizardSubmission.create({
      data: {
        campaignName: data.name,
        description: data.businessGoal || '',
        startDate: new Date(data.startDate || new Date()),
        endDate: new Date(data.endDate || new Date()),
        timeZone: data.timeZone || 'UTC',
        contacts: '',
        currency: 'USD',
        totalBudget: 0,
        socialMediaBudget: 0,
        platform: 'Instagram',
        influencerHandle: '',
        mainMessage: '',
        hashtags: '',
        memorability: '',
        keyBenefits: '',
        expectedAchievements: '',
        purchaseIntent: '',
        brandPerception: '',
        primaryKPI: 'adRecall',
        creativeGuidelines: '',
        
        // Create basic contacts
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
      }
    });

    console.log('Campaign created:', campaign);
    console.log('=== DEBUG END ===');

    return NextResponse.json({ 
      success: true, 
      campaign,
      message: 'Campaign created successfully'
    });

  } catch (error) {
    console.error('=== ERROR DETAILS ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create campaign',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
