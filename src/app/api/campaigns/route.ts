import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        businessGoal: data.businessGoal,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        timeZone: data.timeZone,
        platforms: data.platforms || [],
        totalBudget: data.totalBudget ? parseFloat(data.totalBudget) : null,
        socialMediaBudget: data.socialMediaBudget ? parseFloat(data.socialMediaBudget) : null,
        primaryContact: data.primaryContact || null,
        secondaryContact: data.secondaryContact || null,
        currency: data.currency,
        platform: data.platform,
        influencerHandle: data.influencerHandle,
        currentStep: 1,
      }
    });
    
    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
