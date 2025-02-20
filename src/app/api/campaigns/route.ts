import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const campaigns = await prisma.campaignWizardSubmission.findMany({
      include: {
        primaryContact: true,
        secondaryContact: true,
      }
    });
    
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Error fetching campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const submission = await prisma.campaignWizardSubmission.create({
      data: {
        ...data,
        primaryContact: {
          create: data.primaryContact
        },
        secondaryContact: {
          create: data.secondaryContact
        }
      }
    });
    
    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Error creating campaign' },
      { status: 500 }
    );
  }
}
