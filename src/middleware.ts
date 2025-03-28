import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Import our Graphiti check enforcer
import { graphitiCheckEnforcer } from './middlewares/cursor-ai';

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

// Apply the Graphiti check enforcer to all CursorAI requests
export default withMiddlewareAuthRequired(
  async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    
    // Allow public paths and static assets to bypass all middleware
    if (isPublicPath(path) || isStaticAsset(path)) {
      return NextResponse.next();
    }

    // For CursorAI API requests, apply the Graphiti check enforcer
    if (path.startsWith('/api/cursor-ai') || req.headers.get('user-agent')?.includes('CursorAI')) {
      return graphitiCheckEnforcer(req, async () => {
        // Continue with the regular middleware pipeline after Graphiti check
        return handleAuthMiddleware(req);
      });
    }
    
    // For non-CursorAI requests, continue with regular auth middleware
    return handleAuthMiddleware(req);
  }
);

// Helper function to handle the authentication middleware
async function handleAuthMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  const path = req.nextUrl.pathname;

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

// Configure matcher to run middleware on all routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 