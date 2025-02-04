import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  // Fetch all campaigns
  const campaigns = await prisma.campaign.findMany();
  return NextResponse.json(campaigns);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, startDate, endDate } = body;
  try {
    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    return NextResponse.error();
  }
}
