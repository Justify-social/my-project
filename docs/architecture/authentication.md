# Authentication Architecture (Clerk Integration)

**Last Reviewed:** 2025-05-09

This document serves as the Single Source of Truth (SSOT) for authentication and user management within the Justify platform, detailing our integration with Clerk.

For a higher-level overview of all external services, see **[External Integrations](./external-integrations.md)**.

## 1. Overview

Clerk is our chosen provider and SSOT for all authentication and core user profile data. We utilize Clerk's Next.js SDK (`@clerk/nextjs`) for seamless integration, leveraging its pre-built UI components, middleware for route protection, and backend utilities for session verification and user management.

## 2. Configuration

### 2.1. Environment Variables

The following environment variables are essential for Clerk integration and must be configured in `.env.local` (or appropriate environment configuration):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk application's publishable key (safe for frontend use).
- `CLERK_SECRET_KEY`: Your Clerk application's secret key (keep secure, backend use only).
- `CLERK_WEBHOOK_SECRET`: Secret for verifying incoming webhooks from Clerk (used in `api/webhooks/clerk/route.ts`).

### 2.2. Clerk Provider

The root layout (`src/app/layout.tsx`) wraps the application with `<ClerkProvider>` to make authentication context available throughout the app.

```tsx
// src/app/layout.tsx (Simplified Example)
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## 3. Middleware & Route Protection

Authentication checks and route protection are primarily handled by Clerk's middleware defined in `src/middleware.ts`. We use `clerkMiddleware` along with `createRouteMatcher` to define public routes and protect all others by default.

```typescript
// src/middleware.ts (Conceptual Example)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define routes that should NOT be protected (e.g., landing page, API webhooks)
const isPublicRoute = createRouteMatcher([
  '/', // Example: Landing page
  '/pricing',
  '/api/webhooks/(.*)', // Allow all webhook routes
  '/sign-in(.*)', // Sign-in routes
  '/sign-up(.*)', // Sign-up routes
]);

export default clerkMiddleware((auth, req) => {
  // Protect routes that are NOT public
  if (!isPublicRoute(req)) {
    auth().protect(); // Redirects unauthenticated users to sign-in page
  }
});

export const config = {
  matcher: [
    // Matches all routes except static files and Next.js internals
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

## 4. UI Components & Integration

We leverage Clerk's pre-built React components for standard authentication UIs. These are styled using the `appearance` prop to align with our brand guidelines and Shadcn UI components.

- **Sign-In & Sign-Up Pages**:
  - Located in `src/app/(auth)/sign-in/[[...signin]]/page.tsx` and `src/app/(auth)/sign-up/[[...signup]]/page.tsx`.
  - Use `<SignIn />` and `<SignUp />` components.
  - Configuration includes `routing="path"`, path definitions, and redirects (`afterSignInUrl`, `afterSignUpUrl`).
  - Styling is applied via the `appearance` prop, targeting specific elements with Tailwind/Shadcn classes.
- **User Profile/Settings Page**:
  - Often located using a catch-all route like `src/app/(dashboard)/settings/[[...rest]]/page.tsx`.
  - Uses the `<UserProfile />` component.
  - Styled via `appearance` prop. Navigation might be customized using custom components (e.g., Shadcn Tabs) alongside `<UserProfile />`.
- **User Button & Conditional Rendering**:
  - `<UserButton />` provides a dropdown for profile links and sign-out.
  - `<SignedIn>` and `<SignedOut>` components are used to conditionally render UI elements based on authentication status (e.g., showing a sign-in button vs. the user button).

## 5. Accessing Authentication State & User Data

- **Client Components**: Use Clerk hooks:
  - `useAuth()`: Access `userId`, `sessionId`, `isSignedIn`.
  - `useUser()`: Access user details like `id`, `fullName`, `emailAddresses`, `profileImageUrl`, `publicMetadata`.
- **Server Components & API Routes**: Use the `auth()` helper from `@clerk/nextjs/server`:
  - Provides `userId`, `sessionId`, `getToken`, `sessionClaims` (including custom claims or metadata).
  - Crucially, the middleware must run first for `auth()` to work correctly in API routes or server components.

```typescript
// Example in a Server Component or API Route
import { auth } from '@clerk/nextjs/server';

async function someServerAction() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    // Handle unauthenticated state
    throw new Error('User not authenticated');
  }

  // Access user ID or claims
  const userRole = sessionClaims?.metadata?.role;
  // ... perform actions based on authenticated user ...
}
```

## 6. User Data Synchronization (Clerk <> Application DB)

While Clerk is the SSOT for auth and core user info, our application database (`User` model via Prisma) often needs to store related data (e.g., application-specific settings, links to campaigns, Stripe customer ID).

- **Linking**: The `User` model in `prisma/schema.prisma` must include a unique field to store the Clerk User ID (e.g., `clerkId String @unique`).
- **Synchronization Method**: We use **Clerk Webhooks** to listen for events (`user.created`, `user.updated`, `user.deleted`).
- **Webhook Handler**: An API route (e.g., `src/app/api/webhooks/clerk/route.ts`) is configured in the Clerk Dashboard.
  - It verifies the incoming webhook signature using the `CLERK_WEBHOOK_SECRET`.
  - It processes the event payload (e.g., user data).
  - It performs corresponding CRUD operations on our internal `User` table using Prisma (e.g., creating a new user record linked to the `clerkId`, updating email/name, marking a user as deleted).
  - Idempotency should be considered (e.g., ensuring an event isn't processed multiple times).
- **Initial User Creation**: Often, the `user.created` webhook is the primary mechanism for creating the corresponding user record in our database after a successful sign-up via Clerk.

## 7. Key Considerations & Best Practices

- **Security**: Keep `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` secure and out of version control.
- **Styling**: Maintain consistency between Clerk component appearance and the rest of the application UI using the `appearance` prop and global styles.
- **Data Sync**: Ensure the webhook handler is robust, idempotent, and correctly maps Clerk user data (including custom metadata if used for roles/permissions) to the internal database schema.
- **Error Handling**: Implement proper error handling for Clerk API calls, hook usage, and webhook processing.
- **Session Management**: Rely on Clerk's session management mechanisms provided by the SDK and middleware.

This Clerk integration provides a robust and secure foundation for user authentication and management within Justify.
