import { authMiddleware } from '@clerk/nextjs/server';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  debug: true,
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api(.*)",
    "/dashboard"  // Temporarily make dashboard public for testing
  ],
  afterAuth(auth, req, evt) {
    // Debug authentication state
    console.log("Auth Debug:", {
      isAuthenticated: auth.userId !== null,
      isPublicRoute: auth.isPublicRoute,
      path: req.nextUrl.pathname,
      userId: auth.userId
    });
  }
});

// Stop Middleware running on static files and API routes
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

// Check if we're getting the right environment
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0,10) + '...',
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
}); 