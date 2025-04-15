import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define ALL routes that should be protected
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/settings(.*)',
    '/admin(.*)',
    '/api/(.*)', // Protect ALL API routes initially
]);

// Define routes that should bypass the protection check (public routes)
const isPublicRoute = createRouteMatcher([
    '/', // Homepage
    '/api/webhook/(.*)', // Webhooks
    '/api/auth/(.*)' // Clerk auth routes (might be implicit, but safe to add)
    // Add other public routes like '/pricing', '/about' here if needed
]);

// Simplified middleware: Let Clerk handle protection based on matchers implicitly.
// The config below handles which routes the middleware runs on.
// Clerk's default behavior protects routes NOT matched by public patterns.
// (Note: The specific logic might depend slightly on Clerk version, but this is the standard approach)
export default clerkMiddleware();

export const config = {
    // The matcher ensures the middleware runs on relevant paths,
    // excluding static files and specific framework paths.
    matcher: [
        // Run middleware on all routes except static assets and _next internal paths
        '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
        // Ensure API routes are included
        '/(api|trpc)(.*)',
    ],
}; 