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
    
    if (!if (isUuid) isNaN(numericId)) {
      return NextResponse.json({
        error: 'Invalid campaign ID format'
      }, { status: 400 })
    }
    
    console.log(`Processing submission for campaign ID: ${campaignId}, format: ${isUuid ? 'UUID' : 'numeric'}`);
    
    // Handle submission differently based on the ID format
    let campaign;
    
    if (isUuid) {
      // For UUID format, update CampaignWizard table
      // Change status to APPROVED instead of ACTIVE
      campaign = await prisma.campaignWizard.update({
        where: { id: campaignId },
        data: {
          status: 'APPROVED',
          isComplete: true
        }
      });
      
      console.log(`Successfully updated CampaignWizard with ID ${campaignId} to APPROVED status`);
    } else {
      // Legacy format - update CampaignWizardSubmission
      campaign = await prisma.campaignWizardSubmission.update({
        where: { id: numericId },
        data: {
          submissionStatus: 'submitted'
        }
      });
      
      console.log(`Successfully updated CampaignWizardSubmission with ID ${numericId} to submitted status`);
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
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
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
    
    if (!if (isUuid) isNaN(numericId)) {
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