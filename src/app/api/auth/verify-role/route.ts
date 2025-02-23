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

    // Get roles directly from the user object
    const roles = session.user.roles || [];
    const isSuperAdmin = roles.includes('super_admin');

    return NextResponse.json({
      message: 'Session found',
      user: {
        email: session.user.email,
        roles: roles,
        isSuperAdmin: isSuperAdmin,
        // Include these for debugging
        sessionRoles: session.user['https://justify.social/roles'],
        rawRoles: session.user.raw?.roles,
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