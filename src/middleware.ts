// Test comment to verify file edits
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server'; // Import NextResponse

// Define routes that should bypass the protection check (public routes)
const isPublicRoute = createRouteMatcher([
  '/api/webhooks/(.*)', // Corrected pattern for all webhook routes
  '/api/uploadthing(.*)', // Make UploadThing API route public to its own handler
  '/sign-in(.*)',
  '/sign-up(.*)', // Sign up routes
  // Add other public routes like '/pricing', '/about' here if needed
]);

// Define ALL routes that should be protected
// (Can be simplified if relying on Clerk's default behavior below)
// const isProtectedRoute = createRouteMatcher([
//     '/dashboard(.*)',
//     '/settings(.*)',
//     '/admin(.*)',
//     '/api/(.*)', // Protect ALL API routes initially, except public ones above
// ]);

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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Specific file extensions (svg, png, jpg, etc.)
     * It WILL run on API routes now because we removed the `(?!api)` exclusion
     * The logic inside clerkMiddleware handles public/protected status for APIs.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
