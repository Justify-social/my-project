import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET() {
  try {
    // Get the session
    const session = await getSession();
    
    // Return detailed information about the session and environment
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        user: session?.user ? {
          sub: session.user.sub,
          email: session.user.email,
          email_verified: session.user.email_verified,
          name: session.user.name,
          picture: session.user.picture,
          nickname: session.user.nickname,
          updated_at: session.user.updated_at
        } : null,
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? 'Set' : 'Not set',
        AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
      }
    });
  } catch (error: unknown) {
    console.error('Debug API error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      error: {
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      }
    }, { status: 500 });
  }
} 