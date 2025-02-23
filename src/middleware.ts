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
      const roles = session?.user?.roles || [];
      if (!roles.includes('super_admin')) {
        console.log('Access denied to admin route. User roles:', roles);
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