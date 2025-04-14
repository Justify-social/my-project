import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

interface SessionClaimsMetadata {
  role?: string;
  // Add other expected metadata properties here
}

interface CustomSessionClaims {
  metadata?: SessionClaimsMetadata;
  // Add other expected claims properties here
}

export async function GET() {
  try {
    // Use Clerk's auth() helper to get session details
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      // No active session, user is not authenticated
      return NextResponse.json({ isSuperAdmin: false }, { status: 401 });
    }

    // Safely check for role in Clerk's session claims metadata
    const metadata = (sessionClaims as CustomSessionClaims | null)?.metadata;
    const isSuperAdmin = metadata?.role === 'super_admin';

    return NextResponse.json({ isSuperAdmin });
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
