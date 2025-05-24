// Test comment to verify file edits
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define routes that should bypass the protection check (public routes)
const isPublicRoute = createRouteMatcher([
  '/', // Homepage
  '/sign-in(.*)', // Clerk sign-in routes
  '/sign-up(.*)', // Clerk sign-up routes
  '/api/webhooks/(.*)', // Allow all webhooks
  '/api/health(.*)', // Health check API
  '/api/asset-proxy(.*)', // Asset proxy
  '/api/debug/verify-api(.*)', // Public debug API
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/campaigns(.*)',
  '/brand-lift(.*)',
  '/settings(.*)',
  '/account(.*)',
  '/influencer-marketplace(.*)',
  '/debug-tools(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const currentPath = req.nextUrl.pathname;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const _isProduction = process.env.VERCEL_ENV === 'production';

  // Enhanced logging for development
  if (isDevelopment) {
    console.log('[MIDDLEWARE] Processing path:', currentPath, {
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasClerkKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });
  }

  // Allow public routes to pass through
  if (isPublicRoute(req)) {
    if (isDevelopment) {
      console.log('[MIDDLEWARE] Public route allowed:', currentPath);
    }
    return NextResponse.next();
  }

  // For protected routes, get authentication state
  try {
    const { userId } = await auth();

    if (isProtectedRoute(req) && !userId) {
      if (isDevelopment) {
        console.log(
          '[MIDDLEWARE] Protected route accessed without auth, redirecting to sign-in:',
          currentPath
        );
      }

      // Store the original URL for redirect after sign-in
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', currentPath);

      return NextResponse.redirect(signInUrl);
    }

    if (isDevelopment && userId) {
      console.log('[MIDDLEWARE] Authenticated user accessing:', currentPath, 'UserId:', userId);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[MIDDLEWARE] Auth error:', error);

    // In case of auth error, redirect to sign-in for protected routes
    if (isProtectedRoute(req)) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('error', 'auth_error');
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
