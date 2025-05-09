import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma client is exported from @/lib/prisma
import { Status } from '@prisma/client';
import { auth } from '@clerk/nextjs/server'; // Import auth
import { logger } from '@/lib/logger'; // Import logger
import { UnauthenticatedError, NotFoundError } from '@/lib/errors'; // Import custom errors

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      // Use custom error for consistent handling by handleApiError if this were wrapped
      // For now, returning a direct response as per original structure, but logging it.
      logger.error('[API /selectable-list GET] User not authenticated.');
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const userRecord = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!userRecord) {
      logger.error('[API /selectable-list GET] User record not found for clerkId:', {
        clerkUserId,
      });
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }
    const internalUserId = userRecord.id;

    const campaigns = await prisma.campaignWizard.findMany({
      where: {
        userId: internalUserId, // Scope by user
        status: {
          not: Status.COMPLETED, // Exclude COMPLETED campaigns
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

    logger.info(
      `[API /selectable-list GET] Found ${campaigns.length} selectable campaigns for user ${internalUserId}`
    );
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    logger.error(
      '[API /selectable-list GET] Error fetching selectable campaigns:',
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { error: String(error) }
    );
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch selectable campaigns', details: errorMessage },
      { status: 500 }
    );
  }
}
