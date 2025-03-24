import { handleAuth } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{
    auth0: string;
  }>;
}

// Create the handler using async functions to properly handle params
export async function GET(req: NextRequest, context: RouteParams) {
  // Properly await the params object in Next.js 15
  const { auth0 } = await context.params;
  // Pass processed params to the Auth0 handler
  return handleAuth()(req, { params: { auth0 } });
}

export async function POST(req: NextRequest, context: RouteParams) {
  // Properly await the params object in Next.js 15
  const { auth0 } = await context.params;
  // Pass processed params to the Auth0 handler
  return handleAuth()(req, { params: { auth0 } });
}