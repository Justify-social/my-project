import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connectToDatabase } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Debug: Checking campaign existence:', params.id);
    
    const campaignId = params.id;
    
    // Check if the ID is a UUID (string format) or a numeric ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    const numericId = parseInt(campaignId, 10);
    
    if (!isUuid && isNaN(numericId)) {
      return NextResponse.json({
        error: 'Invalid campaign ID format'
      }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase();
    
    // First check if campaign exists
    let exists;
    if (isUuid) {
      exists = await prisma.campaignWizard.count({
        where: { id: campaignId }
      });
    } else {
      exists = await prisma.campaignWizardSubmission.count({
        where: { id: numericId }
      });
    }

    if (!exists) {
      return NextResponse.json({
        success: false,
        exists: false,
        error: 'Campaign not found',
        message: `No campaign found with ID ${campaignId}`
      }, { status: 404 });
    }

    // If it exists, get full details
    let campaign;
    if (isUuid) {
      campaign = await prisma.campaignWizard.findUnique({
        where: { id: campaignId },
        include: {
          Influencer: true
        }
      });
    } else {
      campaign = await prisma.campaignWizardSubmission.findUnique({
        where: { id: numericId },
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
    }

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