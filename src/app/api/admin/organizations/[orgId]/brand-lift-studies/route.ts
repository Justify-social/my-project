import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError, BadRequestError } from '@/lib/errors';

// Helper to check if the user is a Super Admin
async function isSuperAdmin(clerkUserId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    return user.publicMetadata?.role === 'super_admin';
  } catch (error) {
    logger.error('Error fetching user details from Clerk for Super Admin check', {
      clerkUserId,
      error,
    });
    return false;
  }
}

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
        `User lacking Super Admin role attempted to access Brand Lift Studies for org ${params.orgId}`,
        { clerkUserId, metadataRole: sessionClaims?.['metadata.role'] }
      );
      throw new ForbiddenError('Access restricted to Super Admins.');
    }

    const { orgId } = params;
    if (!orgId) {
      throw new BadRequestError('Organisation ID is required.');
    }

    const brandLiftStudies = await db.brandLiftStudy.findMany({
      where: {
        orgId: orgId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true, // BrandLiftStudy ID
        name: true, // BrandLiftStudy name
        status: true,
        createdAt: true,
        updatedAt: true,
        submissionId: true, // Foreign key to CampaignWizardSubmission
        campaign: {
          // This is the CampaignWizardSubmission
          select: {
            campaignName: true, // Name from CampaignWizardSubmission
            wizard: {
              // This is the CampaignWizard
              select: {
                id: true, // UUID of the CampaignWizard
                name: true, // Name from CampaignWizard (might be same as submission.campaignName or different)
              },
            },
          },
        },
        // Add other fields if needed for the Super Admin view
      },
    });

    // Reshape data for clarity if needed, e.g., to provide a direct campaign UUID and name
    const studiesToReturn = brandLiftStudies.map(study => ({
      ...study,
      campaignWizardId: study.campaign?.wizard?.id,
      campaignWizardName: study.campaign?.wizard?.name || study.campaign?.campaignName, // Fallback to submission name
    }));

    logger.info(`Fetched ${studiesToReturn.length} brand lift studies for organisation ${orgId}`, {
      orgId,
      userId: clerkUserId,
    });
    return NextResponse.json(studiesToReturn);
  } catch (error: unknown) {
    return handleApiError(error, req);
  }
};
