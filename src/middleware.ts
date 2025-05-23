// Test comment to verify file edits
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server'; // Import NextResponse

// Define routes that should bypass the protection check (public routes)
const isPublicRoute = createRouteMatcher([
  '/', // Homepage
  '/sign-in(.*)', // Clerk sign-in routes
  '/sign-up(.*)', // Clerk sign-up routes
  '/api/webhooks/(.*)', // Allow all webhooks
  '/api/health(.*)', // Health check API
  '/api/asset-proxy(.*)', // Asset proxy (if still needed for other assets, though it was UT specific)
  '/api/debug/verify-api(.*)', // Public debug API for verification
  // Add other public API routes or static asset paths if needed
]);

// Define ALL routes that should be protected
const _isProtectedRoute = createRouteMatcher([
  '/(dashboard|campaigns|brand-lift|settings|account)(.*)', // All routes under these paths
  '/influencer-marketplace(.*)',
  '/admin(.*)', // Admin tools
  // Add other specific protected routes here if not covered by patterns
]);

// Explicitly configure public/protected routes within clerkMiddleware
export default clerkMiddleware(async (auth, req) => {
  const currentPath = req.nextUrl.pathname;

  if (isPublicRoute(req)) {
    console.log('[MIDDLEWARE LOG] Path IS public:', currentPath);
    return NextResponse.next(); // Allow public routes to pass through
  }

  // For protected routes, call auth() to get current session state and protect implicitly
  const { userId } = await auth(); // Await the auth() call

  console.log('[MIDDLEWARE LOG] Path:', currentPath, 'UserId:', userId, '(Protected Route Check)');

  if (!userId) {
    // If auth() was called and there's still no userId,
    // Clerk should have already initiated a redirect to sign-in based on its default behavior.
    // This block might be redundant if Clerk handles the redirect internally after auth() is called.
    // However, an explicit redirect can be a fallback or for clearer logging.
    console.log(
      '[MIDDLEWARE LOG] No UserId on protected route, redirecting to /sign-in for path:',
      currentPath
    );
    const signInUrlString = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in';
    const signInUrl = new URL(signInUrlString, req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If userId exists, user is authenticated, allow access to protected route
  return NextResponse.next();
});

export const config = {
  // The matcher ensures the middleware runs on relevant paths,
  // excluding static files and specific framework paths.
  matcher: [
    // Skip Next.js internals and static files
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
