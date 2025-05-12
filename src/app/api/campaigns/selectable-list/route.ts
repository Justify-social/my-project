import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma client is exported from @/lib/prisma
import { Status } from '@prisma/client';
import { auth } from '@clerk/nextjs/server'; // Import auth
import { logger } from '@/lib/logger'; // Import logger
import { UnauthenticatedError, NotFoundError, BadRequestError } from '@/lib/errors'; // Import custom errors

export async function GET() {
  try {
    const { userId: clerkUserId, orgId } = await auth();
    if (!clerkUserId) {
      logger.error('[API /selectable-list GET] User not authenticated.');
      throw new UnauthenticatedError('Authentication required.');
    }

    if (!orgId) {
      logger.info(
        '[API /selectable-list GET] No active organization for user, returning empty list.',
        { clerkUserId }
      );
      return NextResponse.json({ success: true, data: [] });
    }

    const campaigns = await prisma.campaignWizard.findMany({
      where: {
        orgId: orgId,
        status: {
          not: Status.COMPLETED,
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
      take: 200,
    });

    logger.info(
      `[API /selectable-list GET] Found ${campaigns.length} selectable campaigns for org ${orgId}`
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
