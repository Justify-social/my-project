import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError, BadRequestError } from '@/lib/errors';
import { OrganizationMembership } from '@clerk/backend';

export const GET = async (
    req: NextRequest,
    { params }: { params: { orgId: string } }
) => {
    try {
        const { userId: clerkUserId, sessionClaims } = await auth();
        if (!clerkUserId) {
            throw new UnauthenticatedError('Authentication required.');
        }

        if (sessionClaims?.['metadata.role'] !== 'super_admin') {
            logger.warn(
                `Non-Super Admin attempted to access /api/admin/organizations/[orgId]/users for org ${params.orgId}`,
                { clerkUserId, metadataRole: sessionClaims?.['metadata.role'] }
            );
            throw new ForbiddenError('Access restricted to Super Admins.');
        }

        const { orgId } = params;
        if (!orgId) {
            throw new BadRequestError('Organization ID is required.');
        }

        const organizationMembershipList = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: orgId });

        const users = organizationMembershipList.map((membership: OrganizationMembership) => {
            return {
                id: membership.publicUserData?.userId,
                firstName: membership.publicUserData?.firstName,
                lastName: membership.publicUserData?.lastName,
                identifier: membership.publicUserData?.identifier,
                profileImageUrl: membership.publicUserData?.profileImageUrl,
                role: membership.role,
            };
        });

        logger.info(`Fetched ${users.length} users for organization ${orgId}`, { orgId, userId: clerkUserId });
        return NextResponse.json(users);

    } catch (error: unknown) {
        return handleApiError(error, req);
    }
}; 