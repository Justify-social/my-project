import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';
import { z } from 'zod'; // For input validation

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
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaignWizardSubmission.findUnique({
      where: { id },
      include: {
        primaryContact: true,
        secondaryContact: true,
        // Include other relations if needed
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);

  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaignWizardSubmission.update({
      where: { id },
      data: {
        campaignName: data.campaignName,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        timeZone: data.timeZone,
        currency: data.currency,
        totalBudget: data.totalBudget,
        socialMediaBudget: data.socialMediaBudget,
        platform: data.platform,
        influencerHandle: data.influencerHandle,
        submissionStatus: data.submissionStatus,
        // Add other fields as needed
      },
      include: {
        primaryContact: true,
        secondaryContact: true,
      }
    });

    return NextResponse.json(campaign);

  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
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
