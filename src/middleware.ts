import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/_next',
  '/favicon.ico',
];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
}

function isStaticAsset(path: string): boolean {
  return path.startsWith('/_next') || 
         path.includes('/images/') || 
         path.endsWith('.ico') ||
         path.endsWith('.png');
}

export default withMiddlewareAuthRequired(
  async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Allow public paths and static assets
    if (isPublicPath(path) || isStaticAsset(path)) {
      return NextResponse.next();
    }

    // For all other paths, the withMiddlewareAuthRequired will handle authentication
    return NextResponse.next();
  }
);

// Configure matcher to run middleware on all routes
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}; 