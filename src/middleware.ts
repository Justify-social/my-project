// Test comment to verify file edits
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define routes that should bypass the protection check (public routes)
const isPublicRoute = createRouteMatcher([
  '/api/webhook/(.*)', // Webhooks
  '/signin(.*)', // Sign in routes
  '/signup(.*)', // Sign up routes
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
export default clerkMiddleware((auth, req) => {
  // By default, if it's not a public route, it's protected.
  if (!isPublicRoute(req)) {
    auth(); // Calling auth() implicitly protects non-public routes here
  }
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
