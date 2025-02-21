import { authMiddleware } from '@clerk/nextjs/server';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  debug: true,
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)", "/api(.*)"],
  afterAuth(auth, req, evt) {
    console.log("Auth state:", auth.isPublicRoute, auth.isApiRoute, req.url);
  }
});

// Stop Middleware running on static files and API routes
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 