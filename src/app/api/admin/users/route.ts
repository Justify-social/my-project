import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

// GET /api/admin/users - Fetch all users (admin only)
export async function GET(_request: NextRequest) {
  try {
    const { userId: clerkUserId, sessionClaims } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    // Check if user has admin permissions
    if (
      sessionClaims?.['metadata.role'] !== 'super_admin' &&
      sessionClaims?.['metadata.role'] !== 'admin'
    ) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const client = await clerkClient();

    // Fetch users and organizations in parallel
    const [usersResponse, organizationsResponse] = await Promise.all([
      client.users.getUserList({
        limit: 100,
        orderBy: '-created_at',
      }),
      client.organizations.getOrganizationList({
        limit: 100,
        orderBy: '-created_at',
      }),
    ]);

    // Transform users data
    const users = usersResponse.data.map(user => ({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || '',
      name:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || 'Unknown User',
      identifier: user.emailAddresses?.[0]?.emailAddress || user.id,
    }));

    // Transform organizations data
    const organizations = organizationsResponse.data.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      userCount: org.membersCount || 0,
    }));

    return NextResponse.json({
      users,
      organizations,
      totalUsers: usersResponse.totalCount,
      totalOrganizations: organizationsResponse.totalCount,
    });
  } catch (error) {
    console.error('Error fetching users and organizations:', error);
    return NextResponse.json({ error: 'Failed to fetch users and organizations' }, { status: 500 });
  }
}
