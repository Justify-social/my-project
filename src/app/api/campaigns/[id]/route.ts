import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const campaign = await prisma.campaign.findUnique({
    where: { id: Number(id) },
  });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }
  return NextResponse.json(campaign);
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
