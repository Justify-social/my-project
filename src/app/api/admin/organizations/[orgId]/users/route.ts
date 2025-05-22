import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError, BadRequestError } from '@/lib/errors';
import { OrganizationMembership } from '@clerk/backend';

// Helper to check if the user is a Super Admin
async function isSuperAdmin(clerkUserId: string): Promise<boolean> {
    try {
        const user = await clerkClient.users.getUser(clerkUserId);
        return user.publicMetadata?.role === 'super_admin';
    } catch (error) {
        logger.error('Error fetching user details from Clerk for Super Admin check', { clerkUserId, error });
        return false;
    }
}

export const GET = async (
    req: NextRequest,
    { params }: { params: { orgId: string } }
) => {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            throw new UnauthenticatedError('Authentication required.');
        }

        const isAdmin = await isSuperAdmin(clerkUserId);
        if (!isAdmin) {
            throw new ForbiddenError('Access restricted to Super Admins.');
        }

        const { orgId } = params;
        if (!orgId) {
            throw new BadRequestError('Organization ID is required.');
        }

        // Fetch organization membership list from Clerk
        // Adjust parameters as needed for pagination
        const organizationMembershipList = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: orgId });

        const users = organizationMembershipList.map((membership: OrganizationMembership) => {
            // The publicUserData should contain most of what we need (id, firstName, lastName, identifier for email, profileImageUrl)
            // Role is specific to the organization membership
            return {
                id: membership.publicUserData?.userId, // Clerk User ID
                firstName: membership.publicUserData?.firstName,
                lastName: membership.publicUserData?.lastName,
                identifier: membership.publicUserData?.identifier, // Usually the email for the user
                profileImageUrl: membership.publicUserData?.profileImageUrl,
                role: membership.role, // Role within this specific organization
                // Add other relevant fields from publicUserData or membership if needed
            };
        });

        logger.info(`Fetched ${users.length} users for organization ${orgId}`, { orgId, userId: clerkUserId });
        return NextResponse.json(users);

    } catch (error: unknown) {
        return handleApiError(error, req);
    }
}; 