import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
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
    const res = NextResponse.next();
    const session = await getSession(req, res);
    const path = req.nextUrl.pathname;

    // Allow public paths and static assets
    if (isPublicPath(path) || isStaticAsset(path)) {
      return res;
    }

    // Check for admin routes
    if (path.startsWith('/admin')) {
      // Get roles directly from the session
      const userRoles = session?.user?.roles || [];
      
      console.log('Auth Check:', {
        email: session?.user?.email,
        path,
        roles: userRoles,
        hasRole: userRoles.includes('super_admin')
      });

      if (!userRoles.includes('super_admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return res;
  }
);

// Configure matcher to run middleware on all routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 