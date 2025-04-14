import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const session = await getSession(req, res);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No session found',
        },
        { status: 401 }
      );
    }

    // Check all possible locations for roles
    const userRoles = session.user.roles || [];
    const namespacedRoles = session.user['https://justify.social/roles'] || [];
    const authRoles = session.user['https://justify.social/authorization']?.roles || [];
    const appMetadataRoles = session.user['https://justify.social/app_metadata']?.roles || [];

    // Combine all roles and remove duplicates
    const allRoles = Array.from(
      new Set([...userRoles, ...namespacedRoles, ...authRoles, ...appMetadataRoles])
    );

    const isSuperAdmin = allRoles.includes('super_admin');

    console.log('Role check:', {
      email: session.user.email,
      allRoles,
      isSuperAdmin,
      session: {
        user: session.user,
        accessToken: !!session.accessToken,
        idToken: !!session.idToken,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        email: session.user.email,
        roles: allRoles,
        isSuperAdmin,
        debug: {
          roleLocations: {
            directRoles: userRoles,
            namespacedRoles,
            authRoles,
            appMetadataRoles,
          },
          sessionInfo: {
            hasAccessToken: !!session.accessToken,
            hasIdToken: !!session.idToken,
          },
          fullSession: {
            user: {
              ...session.user,
              picture: session.user.picture ? '[exists]' : null,
            },
          },
        },
      },
    });
  } catch (error) {
    console.error('Verify role error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify role',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
