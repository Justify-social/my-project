import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError, BadRequestError } from '@/lib/errors';
import { OrganizationMembership } from '@clerk/backend';

export const GET = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ orgId: string }> }
) => {
  try {
    const { userId: clerkUserId, sessionClaims } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }

    if (sessionClaims?.['metadata.role'] !== 'super_admin') {
      const paramsForLog = await paramsPromise;
      logger.warn(
        `User lacking Super Admin role attempted to access users for org ${paramsForLog.orgId}`,
        { clerkUserId, metadataRole: sessionClaims?.['metadata.role'] }
      );
      throw new ForbiddenError('Access restricted to Super Admins.');
    }

    const params = await paramsPromise;
    const { orgId } = params;
    if (!orgId) {
      throw new BadRequestError('Organization ID is required.');
    }

    const client = await clerkClient();
    const organizationMembershipList = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    const users = organizationMembershipList.data.map((membership: OrganizationMembership) => {
      return {
        id: membership.publicUserData?.userId,
        firstName: membership.publicUserData?.firstName,
        lastName: membership.publicUserData?.lastName,
        identifier: membership.publicUserData?.identifier,
        profileImageUrl: membership.publicUserData?.imageUrl,
        role: membership.role,
      };
    });

    logger.info(`Fetched ${users.length} users for organization ${orgId}`, {
      orgId,
      userId: clerkUserId,
    });
    return NextResponse.json(users);
  } catch (error: unknown) {
    return handleApiError(error, req);
  }
};
