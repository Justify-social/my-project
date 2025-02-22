import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaignWizardSubmission.update({
      where: { id: parseInt(params.id) },
      data: {
        submissionStatus: 'submitted'
      }
    });

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to submit campaign' },
      { status: 500 }
    );
  }
} 