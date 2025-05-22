import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError, BadRequestError } from '@/lib/errors';

export const GET = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ orgId: string }> }
) => {
  try {
    const { userId: clerkUserId, sessionClaims } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }

    const params = await paramsPromise;

    if (sessionClaims?.['metadata.role'] !== 'super_admin') {
      logger.warn(
        `User lacking Super Admin role attempted to access Campaign Wizards for org ${params.orgId}`,
        { clerkUserId, metadataRole: sessionClaims?.['metadata.role'] }
      );
      throw new ForbiddenError('Access restricted to Super Admins.');
    }

    const { orgId } = params;
    if (!orgId) {
      throw new BadRequestError('Organisation ID is required.');
    }

    const campaignWizards = await db.campaignWizard.findMany({
      where: {
        orgId: orgId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      // Select fields needed by the Super Admin view
      select: {
        id: true, // CampaignWizard UUID
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true, // To potentially show who created it
        user: { select: { name: true, email: true } }, // Include basic user details
        // Add other fields like submissionId if needed
      },
    });

    logger.info(`Fetched ${campaignWizards.length} campaign wizards for organisation ${orgId}`, {
      orgId,
      userId: clerkUserId,
    });
    return NextResponse.json(campaignWizards);
  } catch (error: unknown) {
    return handleApiError(error, req);
  }
};
