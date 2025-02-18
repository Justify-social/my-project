// /src/app/api/campaigns/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const campaign = await prisma.campaign.create({
      data,
    });
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
