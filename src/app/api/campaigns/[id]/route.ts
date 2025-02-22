import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';
import { z } from 'zod'; // For input validation
import { Currency, Platform, SubmissionStatus } from '@prisma/client';

type RouteParams = { params: { id: string } }

// More comprehensive schema matching Prisma model
const campaignSchema = z.object({
  campaignName: z.string().min(1).max(255),
  description: z.string(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  timeZone: z.string(),
  currency: z.enum(['USD', 'GBP', 'EUR']),
  totalBudget: z.number().min(0),
  socialMediaBudget: z.number().min(0),
  platform: z.enum(['Instagram', 'YouTube', 'TikTok']),
  influencerHandle: z.string(),
  mainMessage: z.string(),
  hashtags: z.string(),
  memorability: z.string(),
  keyBenefits: z.string(),
  expectedAchievements: z.string(),
  purchaseIntent: z.string(),
  brandPerception: z.string(),
  primaryKPI: z.enum(['adRecall', 'brandAwareness', 'messageAssociation', 'purchaseIntent']),
  creativeGuidelines: z.string(),
  creativeNotes: z.string(),
  submissionStatus: z.enum(['draft', 'submitted']),
  contacts: z.string(),
  // Relationship validations
  primaryContact: z.object({
    firstName: z.string(),
    surname: z.string(),
    email: z.string().email(),
    position: z.string()
  }).optional(),
  secondaryContact: z.object({
    firstName: z.string(),
    surname: z.string(),
    email: z.string().email(),
    position: z.string()
  }).optional(),
  // Optional arrays for related data
  creativeRequirements: z.array(z.object({
    requirement: z.string()
  })).optional(),
  brandGuidelines: z.array(z.object({
    guideline: z.string()
  })).optional()
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaignWizardSubmission.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        primaryContact: true,
        secondaryContact: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = parseInt(params.id);
    const body = await request.json();
    console.log('Updating campaign:', campaignId, 'with data:', body);

    // Create the update data object
    const updateData = {
      ...(body.name && { campaignName: body.name }),
      ...(body.businessGoal && { description: body.businessGoal }),
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
      ...(body.timeZone && { timeZone: body.timeZone }),
      ...(body.currency && { currency: body.currency as Currency }),
      ...(body.totalBudget && { totalBudget: parseFloat(body.totalBudget) }),
      ...(body.socialMediaBudget && { socialMediaBudget: parseFloat(body.socialMediaBudget) }),
      ...(body.platform && { platform: body.platform as Platform }),
      ...(body.influencerHandle && { influencerHandle: body.influencerHandle }),
      submissionStatus: "draft" as SubmissionStatus,
    };

    const updatedCampaign = await prisma.campaignWizardSubmission.update({
      where: { id: campaignId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      id: updatedCampaign.id 
    });

  } catch (error) {
    console.error('Campaign update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to update campaign',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
    await prisma.campaign.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.error();
  }
}
