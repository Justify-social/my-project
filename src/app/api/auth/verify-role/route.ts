import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'Not authenticated',
        user: null
      });
    }
    
    // In a real app, you would check roles from your database or Auth0
    // For now, we'll use a simplified approach
    const isSuperAdmin = session.user.email === 'admin@example.com';
    
    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.user.email,
        name: session.user.name,
        isSuperAdmin: isSuperAdmin,
        roles: isSuperAdmin ? ['super_admin'] : ['user']
      }
    });
    
  } catch (error: unknown) {
    console.error('Error verifying role:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json({
      authenticated: false,
      error: errorMessage
    }, { status: 500 });
  }
} 