import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const campaigns = await prisma.campaignWizardSubmission.findMany({
      select: {
        id: true,
        campaignName: true,
        description: true,
        startDate: true,
        endDate: true,
        platform: true,
        submissionStatus: true,
        createdAt: true,
        primaryContact: {
          select: {
            firstName: true,
            surname: true,
            email: true,
            position: true
          }
        },
        audience: {
          select: {
            age1824: true,
            age2534: true,
            age3544: true,
            age4554: true,
            age5564: true,
            age65plus: true
          }
        },
        creativeAssets: {
          select: {
            assetName: true,
            type: true,
            url: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Found campaigns:', JSON.stringify(campaigns, null, 2));

    return NextResponse.json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns,
      message: 'Available campaigns listed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error listing campaigns:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list campaigns',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 