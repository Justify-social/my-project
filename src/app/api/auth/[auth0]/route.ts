import { handleAuth } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

interface RouteParams {
  params: {
    auth0: string;
  };
}

// Create the handler using async functions to properly handle params
export async function GET(req: NextRequest, { params }: RouteParams) {
  // Make sure params are awaited before use in Next.js 15
  const auth0Route = await Promise.resolve(params.auth0);
  // Pass processed params to the Auth0 handler
  return handleAuth()(req, { params: { auth0: auth0Route } });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  // Make sure params are awaited before use in Next.js 15
  const auth0Route = await Promise.resolve(params.auth0);
  // Pass processed params to the Auth0 handler
  return handleAuth()(req, { params: { auth0: auth0Route } });
}