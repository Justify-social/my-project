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

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ 
        error: 'Campaign name is required',
        field: 'name',
        type: 'required'
      }, { status: 400 });
    }

    if (!data.businessGoal) {
      return NextResponse.json({ 
        error: 'Business goal is required',
        field: 'businessGoal',
        type: 'required'
      }, { status: 400 });
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (endDate < startDate) {
      return NextResponse.json({ 
        error: 'End date must be after start date',
        field: 'endDate',
        type: 'validation'
      }, { status: 400 });
    }

    // Map currency symbols to enum values
    const currencyMap: { [key: string]: Currency } = {
      '£': 'GBP',
      '$': 'USD',
      '€': 'EUR'
    };

    // Validate currency
    if (!currencyMap[data.currency]) {
      return NextResponse.json({ 
        error: 'Invalid currency. Supported currencies are £, $, €',
        field: 'currency',
        type: 'validation',
        supportedValues: Object.keys(currencyMap)
      }, { status: 400 });
    }

    // Create transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      try {
        // Create primary contact
        const primaryContact = await tx.primaryContact.create({
          data: {
            firstName: data.primaryContact?.firstName || 'Default',
            surname: data.primaryContact?.surname || 'User',
            email: data.primaryContact?.email || 'default@example.com',
            position: (data.primaryContact?.position || 'Manager') as Position
          }
        });

        // Create secondary contact
        const secondaryContact = await tx.secondaryContact.create({
          data: {
            firstName: data.secondaryContact?.firstName || 'Default',
            surname: data.secondaryContact?.surname || 'User',
            email: data.secondaryContact?.email || 'default2@example.com',
            position: (data.secondaryContact?.position || 'Manager') as Position
          }
        });

        // Create campaign with mapped currency
        const campaign = await tx.campaignWizardSubmission.create({
          data: {
            campaignName: data.name,
            description: data.businessGoal,
            startDate: startDate,
            endDate: endDate,
            timeZone: data.timeZone,
            contacts: '',
            currency: currencyMap[data.currency],
            totalBudget: parseFloat(data.totalBudget) || 0,
            socialMediaBudget: parseFloat(data.socialMediaBudget) || 0,
            platform: data.platform as Platform,
            influencerHandle: data.influencerHandle || '',
            mainMessage: '',
            hashtags: '',
            memorability: '',
            keyBenefits: '',
            expectedAchievements: '',
            purchaseIntent: '',
            brandPerception: '',
            primaryKPI: 'adRecall' as KPI,
            primaryContactId: primaryContact.id,
            secondaryContactId: secondaryContact.id,
          }
        });

        return campaign;
      } catch (txError) {
        // Handle specific transaction errors
        if (txError instanceof Error) {
          throw new Error(`Transaction failed: ${txError.message}`);
        }
        throw txError;
      }
    });

    console.log('Campaign created successfully:', result);
    console.log('=== DEBUG END ===');

    return NextResponse.json({ 
      success: true, 
      campaign: result,
      message: 'Campaign created successfully',
      details: {
        name: result.campaignName,
        id: result.id,
        status: 'draft',
        created: new Date().toISOString(),
        nextStep: '/campaigns/wizard/step-2'
      },
      notifications: [
        {
          type: 'success',
          title: 'Campaign Saved',
          message: `${result.campaignName} has been saved as a draft`
        }
      ]
    });

  } catch (error) {
    console.error('=== ERROR DETAILS ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    // Provide user-friendly error messages
    let userMessage = 'Failed to create campaign';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        userMessage = 'A campaign with this name already exists';
        statusCode = 409;
      } else if (error.message.includes('Invalid value')) {
        userMessage = 'Some fields contain invalid values. Please check and try again';
        statusCode = 400;
      } else if (error.message.includes('Transaction failed')) {
        userMessage = 'Failed to save all campaign details. Please try again';
        statusCode = 500;
      }
    }

    return NextResponse.json(
      { 
        error: userMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
        type: 'error',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}
