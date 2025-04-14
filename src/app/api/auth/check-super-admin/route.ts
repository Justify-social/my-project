import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ isSuperAdmin: false }, { status: 401 });
    }

    // Check for super_admin role in Auth0 roles
    const roles = session.user['https://justify.social/roles'] || [];
    const isSuperAdmin = roles.includes('super_admin');

    return NextResponse.json({ isSuperAdmin });
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
