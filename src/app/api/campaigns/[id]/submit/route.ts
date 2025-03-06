import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Import the EnumTransformers utility
    const { EnumTransformers } = await import('@/utils/enum-transformers');
    
    const campaignId = params.id;
    
    // Check if the ID is a UUID (string format) or a numeric ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    const numericId = parseInt(campaignId, 10);
    
    if (!isUuid && isNaN(numericId)) {
      return NextResponse.json({
        error: 'Invalid campaign ID format'
      }, { status: 400 })
    }
    
    // Handle submission differently based on the ID format
    let campaign;
    
    if (isUuid) {
      // For UUID format, update CampaignWizard table
      campaign = await prisma.campaignWizard.update({
        where: { id: campaignId },
        data: {
          status: 'SUBMITTED',
          isComplete: true
        }
      });
    } else {
      // Legacy format - update CampaignWizardSubmission
      campaign = await prisma.campaignWizardSubmission.update({
        where: { id: numericId },
        data: {
          submissionStatus: 'submitted'
        }
      });
    }
    
    // Transform campaign data to frontend format before returning
    const transformedCampaign = EnumTransformers.transformObjectFromBackend(campaign);

    return NextResponse.json({
      success: true,
      campaign: transformedCampaign,
      message: 'Campaign submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to submit campaign' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    
    // Check if the ID is a UUID (string format) or a numeric ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    const numericId = parseInt(campaignId, 10);
    
    if (!isUuid && isNaN(numericId)) {
      return NextResponse.json({
        error: 'Invalid campaign ID format'
      }, { status: 400 })
    }
    
    // Use the appropriate model based on ID format
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
          // Include other relationships as needed
        }
      });
    }
    
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    // Rest of the code ...
  } catch (error) {
    console.error('Error retrieving campaign:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve campaign' },
      { status: 500 }
    );
  }
} 