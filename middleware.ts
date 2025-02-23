// Remove or replace this file if it contains Clerk middleware
// If using Auth0, you might not need middleware at all
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only these paths will be public
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
];

// Function to check if the path is public
function isPublicPath(path: string) {
  return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
}

// Function to check if the path is a static asset
function isStaticPath(path: string) {
  return path.startsWith('/_next') || 
         path.startsWith('/images') || 
         path.includes('favicon.ico');
}

export default withMiddlewareAuthRequired({
  returnTo: '/api/auth/login',
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. Auth0 authentication routes (/api/auth/*)
     * 2. Next.js static files and images
     * 3. Favicon
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/.*|images).*)',
  ],
}; 