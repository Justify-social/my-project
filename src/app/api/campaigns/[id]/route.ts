import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = { params: { id: string } }

export async function GET(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const id = context.params.id;
    
    const campaign = {
      id,
      name: `Campaign ${id}`,
      status: 'active',
    };

    return NextResponse.json(campaign);
  } catch (err) {
    // Log error but don't expose it in response
    console.error('Campaign fetch error:', err);
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
    const campaignId = params.id;
    const data = await request.json();

    // Update campaign with audience targeting data
    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: parseInt(campaignId)
      },
      data: {
        // Demographics
        location: data.location,
        ageDistribution: data.ageDistribution,
        gender: data.gender,
        otherGender: data.otherGender,
        
        // Screening & Languages
        screeningQuestions: data.screeningQuestions,
        languages: data.languages,
        
        // Advanced Targeting
        educationLevel: data.educationLevel,
        jobTitles: data.jobTitles,
        incomeLevel: data.incomeLevel,
        
        // Competitors
        competitors: data.competitors,
        
        // Update the step completion
        currentStep: 3,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error('Failed to update campaign:', error);
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
