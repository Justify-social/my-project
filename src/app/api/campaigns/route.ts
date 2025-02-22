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
    console.log('Received form data:', data);

    // Map the form fields to match the schema
    const campaignData = {
      campaignName: data.name, // Changed from name to campaignName
      description: data.businessGoal, // Changed from businessGoal to description
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      timeZone: data.timeZone,
      contacts: data.contacts || '', // Provide default if missing
      currency: data.currency || 'USD', // Default currency
      totalBudget: parseFloat(data.budget || '0'),
      socialMediaBudget: parseFloat(data.socialMediaBudget || '0'),
      platform: data.platform || 'Instagram',
      influencerHandle: data.influencerHandle || '',
      
      // Required fields with defaults
      mainMessage: data.mainMessage || '',
      hashtags: data.hashtags || '',
      memorability: data.memorability || '',
      keyBenefits: data.keyBenefits || '',
      expectedAchievements: data.expectedAchievements || '',
      purchaseIntent: data.purchaseIntent || '',
      brandPerception: data.brandPerception || '',
      primaryKPI: data.primaryKPI || 'adRecall',

      // Create contacts if provided
      primaryContact: {
        create: {
          firstName: data.primaryContact?.firstName || '',
          surname: data.primaryContact?.surname || '',
          email: data.primaryContact?.email || '',
          position: data.primaryContact?.position || 'Manager'
        }
      },
      secondaryContact: {
        create: {
          firstName: data.secondaryContact?.firstName || '',
          surname: data.secondaryContact?.surname || '',
          email: data.secondaryContact?.email || '',
          position: data.secondaryContact?.position || 'Manager'
        }
      }
    };

    console.log('Processed campaign data:', campaignData);

    const campaign = await prisma.campaignWizardSubmission.create({
      data: campaignData
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    // Log the detailed error
    console.error('Campaign creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
