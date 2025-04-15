# Clerk Authentication

This document outlines the integration of Clerk for authentication and user management within the application.

## Overview

Clerk serves as the Single Source of Truth (SSOT) for all authentication and user data. We leverage Clerk's Next.js SDK (`@clerk/nextjs`) for seamless integration, including pre-built UI components and middleware.

## Configuration

### Environment Variables

The following environment variables are required in `.env.local` (or equivalent):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk application's publishable key.
- `CLERK_SECRET_KEY`: Your Clerk application's secret key.

### Middleware

Authentication and route protection are handled by Clerk's middleware in `middleware.ts`. It uses `clerkMiddleware` and `createRouteMatcher` to protect specific routes.

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // Example protected route
  '/settings(.*)', // Settings page is protected
  '/api/(?!webhook).+', // Protect most API routes
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Standard Next.js matcher config
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

## UI Components

We utilize Clerk's pre-built React components for authentication UIs, styled to match our brand guidelines using the `appearance` prop and Shadcn UI.

### Sign-In & Sign-Up Pages

- **Location**: `app/signin/page.tsx`, `app/signup/page.tsx`
- **Components**: `<SignIn />`, `<SignUp />`
- **Styling**: Customized via the `appearance` prop, integrating brand colors, logo, and Shadcn components.
- **Routing**: Configured with `routing="path"` and redirects set via `afterSignInUrl` and `afterSignUpUrl`.

### Settings Page

- **Location**: `app/settings/[[...rest]]/page.tsx` (uses catch-all route)
- **Component**: `<UserProfile />`
- **Styling**: Customized via the `appearance` prop. Clerk's default navigation is hidden in favor of Shadcn UI `<Tabs>` for better integration.
- **Routing**: Configured with `routing="path"`.
- **Custom Sections**: Additional settings (e.g., Preferences) can be implemented alongside `<UserProfile />` using custom components and Clerk user metadata.

## Authentication Flow & Data Access

- **Route Protection**: Handled by `clerkMiddleware` as shown above.
- **Client-Side**: Use Clerk hooks like `useAuth()` and `useUser()` to access authentication state and user data.
- **Server-Side**: Use `auth()` from `@clerk/nextjs/server` within Server Components or API routes (after middleware processing) to get `userId` and `sessionClaims`.

## User Synchronization

- **Database**: The `User` model in the database (e.g., `prisma/schema.prisma`) uses a `clerkId` field (unique string) to link application users to Clerk users.
- **Syncing**: User data (email, name, custom roles/metadata) should be kept in sync between Clerk and the application database. This is often achieved using Clerk Webhooks to listen for user creation/update events and updating the database accordingly.

## Styling & Branding

Clerk components are styled using the `appearance` prop, overriding default styles with Tailwind/Shadcn classes defined in `globals.css` to match:

- **Primary**: Jet `#333333`
- **Secondary**: Payne's Grey `#4A5568`
- **Accent**: Deep Sky Blue `#00BFFF`
- **Interactive**: Medium Blue `#3182CE`
- etc.

Refer to the [UI Components Debug Tool](mdc:/debug-tools/ui-components) and `globals.css` for specific styles.
