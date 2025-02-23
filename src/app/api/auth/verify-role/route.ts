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

    // Get all possible locations where roles might be
    const roleLocations = {
      directRoles: session.user.roles,
      authRoles: session.user['https://justify.social/roles'],
      rawRoles: session.user.raw?.roles,
      appMetadata: session.user.app_metadata?.roles,
      userMetadata: session.user.user_metadata?.roles,
    };

    // Full session debug (excluding sensitive data)
    const sessionDebug = {
      user: {
        ...session.user,
        picture: session.user.picture ? '[exists]' : null,
        sub: session.user.sub,
        sid: session.user.sid,
      },
      accessTokenClaims: session.accessTokenClaims,
      idTokenClaims: session.idTokenClaims,
    };

    console.log('Full session debug:', sessionDebug);
    console.log('Role locations:', roleLocations);

    // Combine all possible roles
    const allRoles = [
      ...(roleLocations.directRoles || []),
      ...(roleLocations.authRoles || []),
      ...(roleLocations.rawRoles || []),
      ...(roleLocations.appMetadata?.roles || []),
      ...(roleLocations.userMetadata?.roles || [])
    ].filter(Boolean);

    // Remove duplicates
    const uniqueRoles = [...new Set(allRoles)];
    const isSuperAdmin = uniqueRoles.includes('super_admin');

    return NextResponse.json({
      message: 'Session found',
      user: {
        email: session.user.email,
        roles: uniqueRoles,
        isSuperAdmin: isSuperAdmin,
        debug: {
          roleLocations,
          sessionInfo: {
            hasAccessToken: !!session.accessTokenClaims,
            hasIdToken: !!session.idTokenClaims,
            tokenExpiry: session.accessTokenClaims?.exp,
            sessionExpiry: session.idTokenClaims?.exp,
          },
          fullSession: sessionDebug
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