import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = parseInt(params.id);
    console.log('Debug: Checking campaign existence:', campaignId);

    // First check if campaign exists
    const exists = await prisma.campaignWizardSubmission.count({
      where: { id: campaignId }
    });

    if (!exists) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found',
        message: `No campaign found with ID ${campaignId}`
      });
    }

    // If it exists, get full details
    const campaign = await prisma.campaignWizardSubmission.findUnique({
      where: { id: campaignId },
      include: {
        primaryContact: true,
        secondaryContact: true,
        audience: {
          include: {
            locations: true,
            genders: true,
            languages: true,
          }
        },
        creativeAssets: true,
        creativeRequirements: true,
      }
    });

    return NextResponse.json({
      success: true,
      exists: true,
      campaign: campaign,
      message: `Campaign ${campaignId} found`
    });

  } catch (error) {
    console.error('Debug: Error checking campaign:', error);
    return NextResponse.json({
      success: false,
      error: 'Error checking campaign',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 