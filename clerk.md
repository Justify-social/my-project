# Clerk Integration & UI Development Plan

**Quality Target**: 9+/10

**Overview**: This document provides a comprehensive plan for integrating Clerk for authentication and developing production-ready authentication and settings UI components. It covers both the initial migration from Auth0 (if applicable) and the subsequent UI build using Shadcn UI and FontAwesome, adhering to defined brand guidelines.

**Core Principles**:
- **Single Source of Truth (SSOT)**: Clerk manages all authentication and user data.
- **Simplicity**: Leverage Clerk's components and middleware.
- **Precision**: Surgical updates to minimize disruption.
- **Scalability**: Ensure the solution handles growth.
- **Brand Consistency**: Adhere strictly to UI/UX guidelines.
- **Knowledge Management**: Document procedures in Graphiti.

---

## Table of Contents
1.  [Prerequisites](#prerequisites)
2.  [Part 1: Auth0 to Clerk Transition Plan](#part-1-auth0-to-clerk-transition-plan)
    *   [Step-by-Step Migration](#step-by-step-migration)
    *   [Migration File Summary](#migration-file-summary)
    *   [Migration Checklist](#migration-checklist)
3.  [Part 2: Production-Ready Auth & Settings UI Plan](#part-2-production-ready-auth--settings-ui-plan)
    *   [Design and Branding Alignment](#design-and-branding-alignment)
    *   [Sign-Up and Login Pages Implementation](#sign-up-and-login-pages-implementation)
    *   [Settings Page Implementation](#settings-page-implementation)
    *   [Clerk Authentication Integration](#clerk-authentication-integration)
    *   [User Experience and Accessibility](#user-experience-and-accessibility)
    *   [UI Implementation File Summary](#ui-implementation-file-summary)
    *   [UI Development Checklist](#ui-development-checklist)
4.  [General Considerations](#general-considerations)
    *   [Testing and Validation Strategy](#testing-and-validation-strategy)
    *   [Potential Challenges](#potential-challenges)
    *   [Graphiti Documentation](#graphiti-documentation)
    *   [Brand Guidelines Reference](#brand-guidelines-reference)
5.  [Next Steps](#next-steps)

---

## Prerequisites
*   **Clerk Account**: Create a Clerk application and obtain API keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
*   **Environment Variables**: Configure Clerk keys in `.env.local` (or equivalent), removing old Auth0 vars.
*   **Dependencies**: `@clerk/nextjs` installed (`npm install @clerk/nextjs`).
*   **Graphiti Check**: Before starting, use `mcp_Graphiti_search_nodes` and `mcp_Graphiti_search_facts` for relevant existing procedures or preferences related to authentication or UI implementation.

---

## Part 1: Auth0 to Clerk Transition Plan
*If not migrating from Auth0, skip to Part 2.*

**Goal**: Surgically replace Auth0 with Clerk, establishing Clerk as the SSOT for authentication.

### Step-by-Step Migration

1.  **Install Clerk SDK**: (Already Completed) `npm install @clerk/nextjs`.
2.  **Update Environment Variables**:
    *   **File**: `.env.local`
    *   **Action**: Remove Auth0 vars, add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3.  **Replace Middleware**:
    *   **File**: `middleware.ts`
    *   **Action**: Implement `clerkMiddleware` and `createRouteMatcher` for route protection. Remove Auth0 logic.
    ```typescript
    import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

    const isProtectedRoute = createRouteMatcher([
      '/dashboard(.*)', // Add all protected routes
      '/settings(.*)',
      '/api/(?!webhook).+', // Protect API routes except webhooks if needed
    ]);

    export default clerkMiddleware((auth, req) => {
      if (isProtectedRoute(req)) auth.protect();
    });

    export const config = {
      matcher: [
        '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
      ],
    };
    ```
4.  **Update Auth Library**:
    *   **File**: `src/lib/auth.ts` (or similar)
    *   **Action**: Remove Auth0 init; adapt or remove file.
5.  **Update Session Management**:
    *   **File**: `src/lib/session.ts` (or similar)
    *   **Action**: Replace Auth0 `getSession` with Clerk's `auth()` for server-side session data. Remove mock session logic once stable.
    ```typescript
    import { auth } from '@clerk/nextjs/server';

    export async function getSession() {
      try {
        const { userId, sessionClaims } = auth();
        if (!userId) {
          // Handle unauthenticated state appropriately
          return null;
        }
        // Optionally fetch additional user data from your DB based on userId
        return { user: { id: userId, ...sessionClaims } };
      } catch (error) {
        console.error('Error getting session:', error);
        return null; // Or throw error depending on desired handling
      }
    }
    ```
6.  **Update API Routes**:
    *   **Files**: All files under `src/app/api/` using authentication.
    *   **Action**: Replace Auth0 checks (e.g., `getSession`, `handleAuth`) with Clerk's `auth()` or `clerkMiddleware`. Remove/Rename `src/app/api/auth/[auth0]`.
7.  **Update UI Auth Components**:
    *   **File**: `src/lib/auth/authCoordinator.tsx` (or similar contexts/providers)
    *   **Action**: Replace Auth0 hooks/context with Clerk's `useAuth`, `useUser`. Remove redundant state management if Clerk handles it.
    *   **File**: `src/components/features/users/AuthCheck.tsx` (or similar wrappers)
    *   **Action**: Update component to use `useAuth` for client-side checks and redirects. Ensure proper loading states.
    *   **File**: `app/layout.tsx`
    *   **Action**: Wrap the application with `<ClerkProvider>`. Add `<SignedIn>`, `<SignedOut>`, `<UserButton>`, etc., where needed (e.g., header).
8.  **Update Permission Checks**:
    *   **File**: `src/hooks/use-permissions.ts` (or similar hooks)
    *   **Action**: Update client-side permission checks to use `useAuth` and `session.claims.metadata`.
    *   **File**: `config/middleware/api/check-permissions.ts` (or server-side checks)
    *   **Action**: Update server-side permission checks to use `auth()` and `sessionClaims.metadata`.
9.  **Database/User Sync**:
    *   **Files**: User creation/update logic (e.g., API routes, webhooks, database utilities).
    *   **Action**: Use Clerk `userId` as the foreign key in your user table (`clerkId`). Implement logic (e.g., using Clerk webhooks) to sync user data (email, name, roles/metadata) between Clerk and your database.
10. **Testing & Validation**:
    *   **Action**: Thoroughly test all authentication flows (sign-up, sign-in, sign-out, protected routes, API calls, role access).
11. **Remove Deprecated Code**:
    *   **Action**: After successful testing and migration, remove all Auth0-related packages, environment variables, files, and code snippets.

### Migration File Summary
*This list covers core files. The team should also anticipate edits in related areas like tests, database schema, and potentially CI/CD.*

| File Path / Category                         | Primary Change                                                                 |
|------------------------------------------------|--------------------------------------------------------------------------------|
| `.env.local`                                   | Replace Auth0 keys with Clerk keys.                                            |
| `middleware.ts`                                | Implement `clerkMiddleware` for route protection.                              |
| `src/lib/auth.ts`                              | Remove Auth0 init; adapt or remove file.                                       |
| `src/lib/session.ts`                           | Replace Auth0 session logic with Clerk's `auth()`.                             |
| `src/app/api/...`                              | Update authentication checks using `auth()`.                                   |
| `src/app/api/auth/[auth0]/route.ts`            | Remove or rename.                                                              |
| `src/lib/auth/authCoordinator.tsx`             | Replace Auth0 hooks/context with Clerk equivalents.                            |
| `src/components/features/users/AuthCheck.tsx`  | Update client-side auth checks using `useAuth`.                                |
| `app/layout.tsx`                               | Add `<ClerkProvider>`, use Clerk UI components.                                |
| `src/hooks/use-permissions.ts`                 | Update client-side permission logic using `useAuth`.                           |
| `config/middleware/api/check-permissions.ts`   | Update server-side permission logic using `auth()`.                            |
| Database/User Management Logic                 | Sync user data using Clerk `userId` and webhooks/metadata.                     |
| **Database Schema** (e.g., `prisma/schema.prisma`) | Add `clerkId` to User model, adjust relations if needed.                     |
| **Testing Files** (e.g., `*.test.ts`, e2e tests) | Update tests related to auth, user sessions, permissions, and affected UI. |
| **Seeding Scripts** (e.g., `prisma/seed.ts`)    | Update user creation logic if applicable.                                      |
| **CI/CD Config** (e.g., `.github/workflows/*`)  | Update environment variable handling if necessary.                             |

### Migration Checklist
- [ ] Verify Clerk Account and API Keys are set up.
- [ ] Environment variables updated (`.env.local`).
- [ ] `@clerk/nextjs` installed.
- [ ] `middleware.ts` implemented with `clerkMiddleware`.
- [ ] `src/lib/auth.ts` adapted or removed.
- [ ] `src/lib/session.ts` updated to use `auth()`.
- [X] All API routes secured using Clerk's `auth()`.
- [X] `[auth0]` API route removed/renamed.
- [X] Auth context/provider (`authCoordinator.tsx`) updated.
- [X] Client-side `AuthCheck` component updated.
- [X] `app/layout.tsx` wrapped in `<ClerkProvider>`, UI components added.
- [X] Client-side permission hook (`use-permissions.ts`) updated.
- [X] Server-side permission checks updated.
- [ ] Database user sync logic implemented (using Clerk `userId`). *(`clerkId` field added to schema, Stripe webhook updated. Full sync via webhooks recommended but pending)*
- [ ] Comprehensive testing completed (sign-up, sign-in, protected routes, roles).
- [ ] All deprecated Auth0 code/files/variables removed.
- [ ] Document migration procedure in Graphiti (`mcp_Graphiti_add_episode`).

---

## Part 2: Production-Ready Auth & Settings UI Plan
**Goal**: Develop branded, accessible, and production-ready Sign-Up, Sign-In, and User Settings pages using Clerk, Shadcn UI, and FontAwesome.

### Design and Branding Alignment
- **Objective**: Ensure UI strictly adheres to brand guidelines.
- **Actions**:
    - Apply Brand Colors consistently (see [Brand Guidelines Reference](#brand-guidelines-reference)).
    - Implement FontAwesome Pro Icons (`fa-light` default, `fa-solid` hover). Reference icon mapping files ([`icon-registry.json`](mdc:src/components/ui/icons/mapping/icon-registry.json), [`icon-url-map.json`](mdc:src/components/ui/icons/mapping/icon-url-map.json)).
    - Utilize Shadcn UI components for forms, buttons, layout.
    - Customize Shadcn theme/CSS as needed.
    - Verify color contrast for accessibility (WCAG 2.1 AA).
- **Resources**:
    - [UI Components Debug Tool](mdc:/debug-tools/ui-components)
    - [`globals.css`](mdc:src/app/globals.css)
    - [FontAwesome Docs](mdc:docs/icons/font-awesome.md)

### Sign-Up and Login Pages Implementation
- **Objective**: Create branded, user-friendly, secure sign-up/sign-in pages.
- **Files**: `app/signin/page.tsx`, `app/signup/page.tsx`.
- **Actions**:
    - Use Clerk's `<SignIn />` and `<SignUp />` components.
    - Customize appearance using the `appearance` prop and Shadcn UI elements/styling.
    - Integrate brand logo, colors, and typography.
    - Ensure responsive design.
    - Link between sign-in and sign-up pages.
    - Configure redirects (`afterSignInUrl`, `afterSignUpUrl`).
- **Example Snippet (`app/signin/page.tsx`)**:
    ```typescript
    'use client'; // Keep client directive if using hooks like useRouter

    import { SignIn } from '@clerk/nextjs';
    import Link from 'next/link';

    export default function SignInPage() {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full p-6 md:p-8 rounded-lg shadow-lg bg-white border border-divider">
            <div className="text-center mb-8">
              {/* Add Logo Component Here */}
              <h1 className="text-2xl font-bold text-primary mt-4">Welcome Back</h1>
              <p className="text-secondary">Sign in to continue</p>
            </div>
            <SignIn
              routing="path" // Use "path" routing
              path="/signin" // Current path
              signUpUrl="/signup" // Link to sign-up
              afterSignInUrl="/dashboard" // Redirect after success
              appearance={{
                baseTheme: undefined, // Remove Clerk themes if fully customising
                elements: {
                  formButtonPrimary: 'bg-interactive hover:bg-interactive/90 text-white text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
                  card: 'bg-transparent shadow-none border-none',
                  headerTitle: 'text-primary text-xl font-semibold', // Adjust size if needed
                  headerSubtitle: 'text-secondary text-sm',
                  formFieldInput: 'block w-full rounded-md border border-divider shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3',
                  formFieldLabel: 'text-sm font-medium text-primary',
                  footerActionLink: 'text-accent hover:underline text-sm',
                  identityPreviewEditButton: 'text-accent hover:text-accent/80',
                  dividerLine: 'bg-divider',
                  socialButtonsBlockButton: 'border-divider hover:bg-gray-50',
                  // Add other element overrides as needed
                },
              }}
            />
            <div className="text-center mt-6 text-sm text-secondary">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-accent hover:underline">
                Sign up here
              </Link>
            </div>
          </div>
        </div>
      );
    }
    ```

### Settings Page Implementation
- **Objective**: Develop a comprehensive, branded user settings page.
- **File**: `app/settings/[[...rest]]/page.tsx` (using Clerk's catch-all convention).
- **Actions**:
    - Use Clerk's `<UserProfile />` component, configured for path routing.
    - Structure using Shadcn UI `<Tabs>` for navigation (Account, Security, Preferences, etc.).
    - Customize `<UserProfile />` appearance to match brand and remove redundant Clerk navigation if using Tabs.
    - Implement custom sections (e.g., "Preferences") using Clerk user metadata and custom forms/API calls.
    - Ensure the route is protected via `middleware.ts`.
- **Example Snippet (`app/settings/[[...rest]]/page.tsx`)**:
    ```typescript
    'use client'; // Keep client directive

    import { UserProfile } from '@clerk/nextjs';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming Shadcn tabs

    // Define tab values for clarity
    const TABS = {
      ACCOUNT: 'account',
      SECURITY: 'security',
      PREFERENCES: 'preferences',
    };

    export default function SettingsPage() {
      return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-primary mb-8">Settings</h1>
          <Tabs defaultValue={TABS.ACCOUNT} className="w-full">
            <TabsList className="border-b border-divider mb-6">
              <TabsTrigger value={TABS.ACCOUNT} className="data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent pb-2 px-4">Account</TabsTrigger>
              <TabsTrigger value={TABS.SECURITY} className="data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent pb-2 px-4">Security</TabsTrigger>
              <TabsTrigger value={TABS.PREFERENCES} className="data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent pb-2 px-4">Preferences</TabsTrigger>
              </TabsList>

            {/* Use TabsContent to wrap UserProfile sections */}
            <TabsContent value={TABS.ACCOUNT}>
              <UserProfileSection />
              </TabsContent>
            <TabsContent value={TABS.SECURITY}>
              <UserProfileSection />
              </TabsContent>
            {/* Custom Preferences Section */}
            <TabsContent value={TABS.PREFERENCES}>
              <div className="p-6 border border-divider rounded-lg bg-white">
                <h2 className="text-xl font-semibold text-primary mb-4">Application Preferences</h2>
                <p className="text-secondary mb-6">Customize your application experience.</p>
                {/* Add custom form components here */}
                {/* Example: <PreferenceForm /> */}
                </div>
              </TabsContent>
            </Tabs>
          </div>
      );
    }

    // Helper component to configure UserProfile for Account/Security tabs
    function UserProfileSection() {
       return (
         <UserProfile
            path="/settings" // Base path for settings
            routing="path" // Use path routing
            appearance={{
              baseTheme: undefined,
              elements: {
                card: 'bg-transparent shadow-none border-none p-0',
                navbar: 'hidden', // Hide Clerk's navbar if using Tabs
                pageScrollBox: 'p-0', // Remove default padding
                headerTitle: 'text-xl font-semibold text-primary mb-4',
                headerSubtitle: 'text-sm text-secondary mb-6',
                formButtonPrimary: 'bg-interactive hover:bg-interactive/90 text-white text-sm font-medium py-2 px-4 rounded-md',
                formFieldInput: 'block w-full rounded-md border border-divider shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3',
                formFieldLabel: 'text-sm font-medium text-primary mb-1',
                dividerLine: 'my-6 border-divider',
                // etc.
              },
            }}
          />
      );
    }
    ```

### Clerk Authentication Integration
- **Objective**: Ensure seamless integration with Clerk's authentication flow.
- **Actions**:
    - Protect `/settings` and other necessary routes in `middleware.ts`.
    - Handle unauthenticated redirects gracefully.
    - Use `useAuth`, `useUser` hooks for client-side state and data.
    - Use `auth()` for server-side data fetching and checks.

### User Experience and Accessibility
- **Objective**: Deliver an intuitive, accessible, and responsive UI.
- **Actions**:
    - Implement clear form validation and error messages (use Shadcn form utilities).
    - Provide loading states (e.g., Shadcn `<Skeleton>`) during async operations.
    - Ensure full keyboard navigation and screen reader compatibility (ARIA attributes).
    - Test responsiveness across devices (mobile, tablet, desktop).

### UI Implementation File Summary
*This list covers the main new UI pages and related configuration. Custom components and testing files will also be required.*

| File Path / Category                       | Purpose                                                            | Status      |
|--------------------------------------------|--------------------------------------------------------------------|-------------|
| `app/signin/page.tsx`                      | Branded Sign-In page using `<SignIn>` component.                   | To Be Created |
| `app/signup/page.tsx`                      | Branded Sign-Up page using `<SignUp>` component.                   | To Be Created |
| `app/settings/[[...rest]]/page.tsx`        | Branded Settings page using `<UserProfile>` and Shadcn Tabs.      | To Be Created |
| `middleware.ts`                            | Updated to protect `/settings` route (verify protection rules).     | To Be Updated |
| `src/app/globals.css`                      | Ensure brand colors and base styles are defined.                  | To Be Verified |
| **Theme Config** (e.g., `tailwind.config.js`) | Ensure Shadcn/Tailwind theme aligns with brand colors.             | To Be Verified |
| `components/ui/icons/...`                  | Verify FontAwesome setup and icon components.                      | To Be Verified |
| Custom Components (e.g., Preferences Form) | Components for settings not covered by `<UserProfile>`.            | To Be Created |
| **Testing Files** (Unit, Integration, E2E) | Tests for sign-in, sign-up, settings pages, and custom components. | To Be Created |
| **Storybook Stories** (if applicable)      | Stories for new auth/settings components.                          | To Be Created |

### UI Development Checklist
- [ ] Design Alignment: Colors, icons, typography match brand guidelines.
- [ ] Sign-In Page (`app/signin/page.tsx`): Created, styled, functional.
- [ ] Sign-Up Page (`app/signup/page.tsx`): Created, styled, functional.
- [ ] Settings Page (`app/settings/[[...rest]]/page.tsx`): Created with Tabs, `<UserProfile>` styled.
- [ ] Settings Page: Custom sections (e.g., Preferences) implemented.
- [ ] Middleware: Settings route protected.
- [ ] Responsiveness: Pages tested on mobile, tablet, desktop.
- [ ] Accessibility: Keyboard navigation, screen reader support, color contrast checked.
- [ ] Loading States: Implemented for async actions.
- [ ] Error Handling: Clear validation messages displayed.
- [ ] Form Submission: Sign-up, sign-in, settings updates work correctly.
- [ ] Data Sync: Custom settings persist correctly (check database/Clerk metadata).
- [ ] Comprehensive Testing: User flows tested thoroughly.
- [ ] Document UI implementation details in this file (`clerk.md`).
- [ ] Store UI implementation procedure in Graphiti (`mcp_Graphiti_add_episode`).

---

## General Considerations

### Testing and Validation Strategy
- **Unit/Integration Tests**: For any custom hooks or complex logic.
- **End-to-End Tests**: Simulate user flows (sign-up, sign-in, settings update, protected route access) using tools like Cypress or Playwright.
- **Manual Testing**: Cover edge cases, different browsers, and devices. Use checklists from above.
- **Accessibility Testing**: Use tools like axe-core, Lighthouse, and manual keyboard/screen reader checks.

### Potential Challenges
1.  **Clerk Component Customization**: Balancing deep customization with Clerk's intended component behavior. Refer heavily to Clerk docs.
2.  **Data Synchronization**: Ensuring seamless sync between Clerk metadata and your application's database for custom settings/roles. Webhooks are often the best approach.
3.  **Accessibility**: Achieving full WCAG compliance with custom styles requires diligence.
4.  **State Management**: Coordinating Clerk's auth state with application state if necessary.
5.  **Third-Party Logins**: Additional setup if social providers are required.

### Graphiti Documentation
- **Requirement**: After completing the migration (Part 1) and/or the UI implementation (Part 2), document the procedures.
- **Action**: Use `mcp_Graphiti_add_episode` with clear names like:
    - `Auth0 to Clerk Migration Procedure`
    - `Clerk UI Implementation: Auth Pages`
    - `Clerk UI Implementation: Settings Page`
- **Content**: Briefly describe the steps taken, key files modified, and any important decisions or configurations.

### Brand Guidelines Reference
- **Primary**: Jet `#333333`
- **Secondary**: Payne's Grey `#4A5568`
- **Accent**: Deep Sky Blue `#00BFFF`
- **Background**: White `#FFFFFF`
- **Divider**: French Grey `#D1D5DB`
- **Interactive**: Medium Blue `#3182CE`
- **Icons**: FontAwesome Pro (`fa-light` default, `fa-solid` hover)

---

## Next Steps
1.  **Review Plan**: Team reviews this plan for completeness and feasibility.
2.  **Prerequisites**: Ensure all prerequisites are met.
3.  **Execute Part 1 (Migration)**: If migrating from Auth0, follow the migration steps and checklist. Test thoroughly.
4.  **Execute Part 2 (UI Development)**: Follow the UI implementation steps and checklist. Develop pages iteratively.
5.  **Testing**: Perform comprehensive testing as outlined.
6.  **Documentation**: Update Graphiti upon completion of major parts.

This structured plan aims for a high-quality, robust, and maintainable Clerk integration and UI.
