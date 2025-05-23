import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError } from '@/lib/errors';

export const GET = async (req: NextRequest) => {
  try {
    const { userId: clerkUserId, sessionClaims } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }

    if (sessionClaims?.['metadata.role'] !== 'super_admin') {
      logger.warn(`User lacking Super Admin role attempted to access campaign wizards list.`, {
        clerkUserId,
        metadataRole: sessionClaims?.['metadata.role'],
      });
      throw new ForbiddenError('Access restricted to Super Admins.');
    }

    const campaignWizards = await db.campaignWizard.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        orgId: true,
        userId: true,
        user: {
          // User who created the wizard
          select: { name: true, email: true },
        },
        // If CampaignWizard has a direct relation to an Organization model in your DB:
        // organization: { select: { name: true } }
      },
    });

    logger.info(`Fetched ${campaignWizards.length} campaign wizards for debug view.`, {
      userId: clerkUserId,
    });
    return NextResponse.json(campaignWizards);
  } catch (error: unknown) {
    return handleApiError(error, req);
  }
};
