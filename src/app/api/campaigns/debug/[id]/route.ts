import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connectToDatabase } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Debug: Checking campaign existence:', params.id);
    
    const campaignId = parseInt(params.id);
    if (isNaN(campaignId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid campaign ID',
        message: `The provided ID '${params.id}' is not a valid number`
      }, { status: 400 });
    }

    // Connect to the database
    await connectToDatabase();
    
    // First check if campaign exists
    const exists = await prisma.campaignWizardSubmission.count({
      where: { id: campaignId }
    });

    if (!exists) {
      return NextResponse.json({
        success: false,
        exists: false,
        error: 'Campaign not found',
        message: `No campaign found with ID ${campaignId}`
      }, { status: 404 });
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
            screeningQuestions: true,
            competitors: true
          }
        },
        creativeAssets: true,
        creativeRequirements: true,
      }
    });

    // Check DB connection
    const dbStatus = await prisma.$queryRaw`SELECT 1 as connected`;
    
    return NextResponse.json({
      success: true,
      exists: true,
      campaign: campaign,
      dbStatus: dbStatus,
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