import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    // Check all possible locations for roles
    const userRoles = session?.user?.roles || [];
    const namespacedRoles = session?.user?.['https://justify.social/roles'] || [];
    const authRoles = session?.user?.['https://justify.social/authorization']?.roles || [];
    const appMetadataRoles = session?.user?.['https://justify.social/app_metadata']?.roles || [];
    
    // Combine all roles
    const allRoles = [...new Set([
      ...userRoles,
      ...namespacedRoles,
      ...authRoles,
      ...appMetadataRoles
    ])];
    
    const isSuperAdmin = allRoles.includes('super_admin');
    
    console.log('Role check:', {
      email: session?.user?.email,
      allRoles,
      isSuperAdmin,
      session: {
        user: session?.user,
        accessToken: !!session?.accessToken,
        idToken: !!session?.idToken
      }
    });

    return Response.json({
      message: "Session found",
      user: {
        email: session?.user?.email,
        roles: allRoles,
        isSuperAdmin,
        debug: {
          roleLocations: {
            directRoles: userRoles,
            namespacedRoles,
            authRoles,
            appMetadataRoles
          },
          sessionInfo: {
            hasAccessToken: !!session?.accessToken,
            hasIdToken: !!session?.idToken
          },
          fullSession: {
            user: {
              ...session?.user,
              picture: session?.user?.picture ? '[exists]' : null
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Verify role error:', error);
    return Response.json({ error: 'Failed to verify role' }, { status: 500 });
  }
} 