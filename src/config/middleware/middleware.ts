import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { graphitiCheckEnforcer } from './cursor-ai';

// Expanded static asset detection
function isStaticAsset(path: string): boolean {
  return path.startsWith('/_next') ||
    path.includes('/images/') ||
    path.includes('/icons/') ||    // Add icons path exclusion
    path.endsWith('.svg') ||       // All SVG files
    path.endsWith('.ico') ||
    path.endsWith('.png') ||
    path.endsWith('.css') ||
    path.endsWith('.js');
}

// Public paths constant and function removed as they are no longer needed for the initial bypass logic
// const PUBLIC_PATHS = [
//   '/api/auth/login',
//   '/api/auth/callback',
//   '/api/auth/logout',
//   '/_next',
//   '/favicon.ico',
// ];
// function isPublicPath(path: string): boolean {
//   return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
// }

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // --- SIMPLIFIED CHECK ---
  // Allow static assets to bypass middleware early.
  // Public paths like /api/auth/* are already excluded by config.matcher.
  if (isStaticAsset(path)) {
    return NextResponse.next();
  }
  // --- END SIMPLIFIED CHECK ---

  // For CursorAI API requests, apply the Graphiti check enforcer
  if (path.startsWith('/api/cursor-ai') || req.headers.get('user-agent')?.includes('CursorAI')) {
    return graphitiCheckEnforcer(req, async () => {
      // Continue with the regular middleware pipeline after Graphiti check
      return handleAuthMiddleware(req);
    });
  }

  // Only apply auth check to admin routes and API routes that require auth
  // (Note: The condition !path.startsWith('/api/auth') is also technically redundant
  // due to the matcher, but harmless to keep for clarity)
  if (path.startsWith('/admin') ||
    (path.startsWith('/api') && !path.startsWith('/api/auth'))) {
    // Create a response object to pass to getSession
    const res = NextResponse.next();
    const session = await getSession(req, res);
    if (!session) {
      // Instead of redirecting, which interrupts rendering,
      // respond with a 401 status for API routes
      if (path.startsWith('/api')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }
      // For admin routes, redirect to login
      return NextResponse.redirect(new URL('/api/auth/login', req.url));
    }

    // Role-based auth only for admin routes
    if (path.startsWith('/admin')) {
      const userRoles = session.user?.roles || [];
      if (!userRoles.includes('super_admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  // For all other paths (now including non-static, non-CursorAI, non-admin, non-protected-API), allow rendering
  return NextResponse.next();
}

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

// Matcher config remains the same (already excludes /api/auth/*)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Auth0 routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ]
}