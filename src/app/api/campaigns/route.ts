import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@prisma/client';
import { Currency, Platform, KPI, SubmissionStatus, Position } from '@prisma/client';

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
    
    console.log('=== DEBUG START ===');
    console.log('Raw form data:', JSON.stringify(data, null, 2));

    // First create the contacts
    const primaryContact = await prisma.primaryContact.create({
      data: {
        firstName: 'Default',
        surname: 'User',
        email: 'default@example.com',
        position: 'Manager' as Position
      }
    });

    const secondaryContact = await prisma.secondaryContact.create({
      data: {
        firstName: 'Default',
        surname: 'User',
        email: 'default2@example.com',
        position: 'Manager' as Position
      }
    });

    const campaign = await prisma.campaignWizardSubmission.create({
      data: {
        // Basic campaign details
        campaignName: data.name || 'Untitled Campaign',
        description: data.businessGoal || '',
        startDate: new Date(data.startDate || new Date()),
        endDate: new Date(data.endDate || new Date()),
        timeZone: data.timeZone || 'UTC',
        contacts: '',
        currency: (data.currency as Currency) || 'USD',
        totalBudget: 0,
        socialMediaBudget: 0,
        platform: (data.platform as Platform) || 'Instagram',
        influencerHandle: '',

        // Required message fields
        mainMessage: '',
        hashtags: '',
        memorability: '',
        keyBenefits: '',
        expectedAchievements: '',
        purchaseIntent: '',
        brandPerception: '',
        primaryKPI: 'adRecall' as KPI,
        
        // Optional arrays
        secondaryKPIs: [],
        features: [],
        
        // Status
        submissionStatus: 'draft' as SubmissionStatus,
        
        // Link the contacts
        primaryContactId: primaryContact.id,
        secondaryContactId: secondaryContact.id
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
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
