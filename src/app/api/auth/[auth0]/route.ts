import { handleAuth } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

// Remove the RouteParams interface
// interface RouteParams {
//   params: Promise<{
//     auth0: string;
//   }>;
// }

// Update the GET function signature and access params directly
export async function GET(req: NextRequest, { params }: { params: { auth0: string } }) {
  // Access auth0 directly from params, no await needed
  const { auth0 } = params;
  // Pass processed params to the Auth0 handler
  return handleAuth()(req, { params: { auth0 } });
}

// Update the POST function signature and access params directly
export async function POST(req: NextRequest, { params }: { params: { auth0: string } }) {
  // Access auth0 directly from params, no await needed
  const { auth0 } = params;
  // Pass processed params to the Auth0 handler
  return handleAuth()(req, { params: { auth0 } });
}