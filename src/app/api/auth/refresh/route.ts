import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

/**
 * This endpoint refreshes the session cookie by validating the current session
 * It's useful for ensuring authentication is valid before making critical API calls
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // Return minimal user info to confirm the session is valid
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        email: session.user.email,
      },
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 });
  }
}
