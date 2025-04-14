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

export default clerkMiddleware((auth, req) => {
    // If it's NOT a public route AND it IS a protected route, then protect it.
    if (!isPublicRoute(req) && isProtectedRoute(req)) {
        auth.protect();
    }
    // Clerk handles its own auth routes implicitly, but isPublicRoute check adds safety.
    // All other routes not matching isProtectedRoute are implicitly public.
});

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