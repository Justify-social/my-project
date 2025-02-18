import { NextRequest, NextResponse } from 'next/server';
import prisma from "../../../../lib/prisma";

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

export async function PUT(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const body = await request.json();
  const { name, startDate, endDate } = body;
  try {
    const updatedCampaign = await prisma.campaign.update({
      where: { id: Number(id) },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    return NextResponse.json(updatedCampaign);
  } catch (error) {
    return NextResponse.error();
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
