import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError } from '@/lib/errors';
import { Organization } from '@clerk/backend';

export const GET = async (req: NextRequest) => {
    try {
        const { userId: clerkUserId, sessionClaims } = await auth();
        if (!clerkUserId) {
            throw new UnauthenticatedError('Authentication required.');
        }

        if (sessionClaims?.['metadata.role'] !== 'super_admin') {
            logger.warn(
                'Non-Super Admin attempted to access /api/admin/organizations',
                { clerkUserId, metadataRole: sessionClaims?.['metadata.role'] }
            );
            throw new ForbiddenError('Access restricted to Super Admins.');
        }

        const client = await clerkClient();
        const paginatedOrganizations = await client.organizations.getOrganizationList();

        const organizationList = paginatedOrganizations.data || paginatedOrganizations;

        if (!Array.isArray(organizationList)) {
            logger.error('Unexpected response structure from getOrganizationList', { paginatedOrganizations });
            throw new Error('Failed to retrieve organization list in expected format.');
        }

        const organizations = organizationList.map((org: Organization) => ({
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