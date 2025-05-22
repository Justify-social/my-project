import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError } from '@/lib/errors';
import { Organization } from '@clerk/backend';

// Helper to check if the user is a Super Admin (can be moved to a shared utils if used elsewhere)
async function isSuperAdmin(clerkUserId: string): Promise<boolean> {
    try {
        const user = await clerkClient.users.getUser(clerkUserId);
        return user.publicMetadata?.role === 'super_admin';
    } catch (error) {
        logger.error('Error fetching user details from Clerk for Super Admin check', { clerkUserId, error });
        return false;
    }
}

export const GET = async (req: NextRequest) => {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            throw new UnauthenticatedError('Authentication required.');
        }

        const isAdmin = await isSuperAdmin(clerkUserId);
        if (!isAdmin) {
            throw new ForbiddenError('Access restricted to Super Admins.');
        }

        const organizationListResult = await clerkClient.organizations.getOrganizationList();

        const organizations = organizationListResult.map((org: Organization) => ({
            id: org.id,
            name: org.name,
            slug: org.slug,
            membersCount: org.membersCount,
            createdAt: new Date(org.createdAt).toISOString(),
            updatedAt: new Date(org.updatedAt).toISOString(),
        }));

        logger.info('Fetched organization list for Super Admin', { count: organizations.length, userId: clerkUserId });
        return NextResponse.json(organizations);

    } catch (error: unknown) {
        return handleApiError(error, req);
    }
}; 