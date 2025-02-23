import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        error: 'No session found',
        session: null 
      }, { status: 401 });
    }

    // Check all possible locations for roles
    const possibleRoleLocations = {
      directRoles: session.user.roles,
      namespacedRoles: session.user['https://justify.social/roles'],
      rawRoles: session.user.raw?.roles,
      authorizationRoles: session.user.authorization?.roles,
    };

    console.log('Checking role locations:', possibleRoleLocations);

    // Combine all possible roles
    const roles = [
      ...(possibleRoleLocations.directRoles || []),
      ...(possibleRoleLocations.namespacedRoles || []),
      ...(possibleRoleLocations.rawRoles || []),
      ...(possibleRoleLocations.authorizationRoles || [])
    ].filter(Boolean);

    // Remove duplicates
    const uniqueRoles = [...new Set(roles)];
    const isSuperAdmin = uniqueRoles.includes('super_admin');

    return NextResponse.json({
      message: 'Session found',
      user: {
        email: session.user.email,
        roles: uniqueRoles,
        isSuperAdmin: isSuperAdmin,
        debug: {
          possibleRoleLocations,
          sessionUser: {
            ...session.user,
            // Remove large profile picture URL for clarity
            picture: session.user.picture ? 'exists' : null
          }
        }
      }
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 