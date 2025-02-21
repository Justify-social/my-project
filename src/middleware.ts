import { authMiddleware } from '@clerk/nextjs/server';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  debug: true,
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/sign-in/(.*)",
    "/sign-up/(.*)"
  ],
  ignoredRoutes: [
    "/api/webhook/clerk",
    "/api/webhook/stripe"
  ]
});

// Stop Middleware running on static files and API routes
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 