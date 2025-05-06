import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma client is exported from @/lib/prisma
import { Status } from '@prisma/client';

export async function GET() {
  try {
    const campaigns = await prisma.campaignWizard.findMany({
      where: {
        status: {
          in: [Status.DRAFT, Status.ACTIVE],
        },
      },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 200, // Limiting to 200 selectable campaigns, adjust if necessary
    });

    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('[API /selectable-list GET] Error fetching selectable campaigns:', error);
    // It's good practice to avoid sending raw error messages to the client in production
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch selectable campaigns', details: errorMessage },
      { status: 500 }
    );
  }
}
