// Clean Clerk Middleware Implementation - SSOT for Authentication
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Route Matchers - SSOT for route protection rules
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/campaigns(.*)',
  '/influencer-marketplace(.*)',
  '/settings(.*)',
  '/brand-lift(.*)',
  '/account(.*)',
]);

const isApiRoute = createRouteMatcher(['/api(.*)']);

/**
 * Testing Token Detection
 * Safely detects if this is a Testing Token request from Cypress
 */
function hasTestingToken(request: Request): boolean {
  try {
    // Check for Cypress Testing Token in various places
    const authHeader = request.headers.get('authorization');
    const cookies = request.headers.get('cookie') || '';
    const userAgent = request.headers.get('user-agent') || '';

    // Check for Clerk Testing Token patterns
    const hasClerkTestingToken =
      authHeader?.includes('testing_') ||
      cookies.includes('__clerk_testing_token') ||
      cookies.includes('testing_') ||
      userAgent.includes('Cypress');

    // Only bypass in development/testing environments
    const isTestEnvironment =
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test' ||
      process.env.CYPRESS_ENV === 'true';

    return hasClerkTestingToken && isTestEnvironment;
  } catch (error) {
    console.error('[MIDDLEWARE] Testing token detection error:', error);
    return false;
  }
}

/**
 * Enhanced Clerk Middleware with Testing Support
 */
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  console.log(`[MIDDLEWARE] Processing path: ${pathname}`, {
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    hasClerkKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });

  // **TESTING BYPASS** - Allow Testing Tokens to pass through
  if (hasTestingToken(req)) {
    console.log(`[MIDDLEWARE] Testing Token detected, allowing access: ${pathname}`);
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(req)) {
    console.log(`[MIDDLEWARE] Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  // Handle API routes
  if (isApiRoute(req)) {
    console.log(`[MIDDLEWARE] API route: ${pathname}`);

    // Protect sensitive API routes
    if (isProtectedRoute(req)) {
      try {
        await auth.protect();
        console.log(`[MIDDLEWARE] Protected API route authenticated: ${pathname}`);
      } catch {
        console.log(`[MIDDLEWARE] Protected API route access denied: ${pathname}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(req)) {
    try {
      await auth.protect();
      console.log(`[MIDDLEWARE] Protected route authenticated: ${pathname}`);
    } catch {
      console.log(
        `[MIDDLEWARE] Protected route accessed without auth, redirecting to sign-in: ${pathname}`
      );
      // Let Clerk handle the redirect
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
