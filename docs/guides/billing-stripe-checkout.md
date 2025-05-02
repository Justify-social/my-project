# Stripe Checkout Integration Guide

This document outlines the implementation of Stripe Checkout for managing user billing and payment methods within the Justify application.

## Overview

We utilize Stripe Checkout, a Stripe-hosted page, to provide a secure and pre-built UI for users to manage payment methods (e.g., adding a card). This approach minimizes PCI compliance scope and leverages Stripe's robust infrastructure.

## Prerequisites

- **Clerk User Synchronization:** A functioning system must be in place to synchronize users from Clerk Authentication to the application's Prisma database. The user's Clerk ID must be stored in the `clerkId` field of the `User` model. Refer to `BUILD/billing + pricing/clerk-sync.md` for details.
- **Environment Variables:** Ensure the following are configured correctly for both Sandbox (local development) and Production environments:
  - `STRIPE_SECRET_KEY` (sk*... or sk_test*...)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk*... or pk_test*...)
  - `STRIPE_WEBHOOK_SECRET` (whsec\_... - _obtained from Stripe Dashboard Webhook Endpoint settings_)
  - `CLERK_SECRET_KEY` & `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_WEBHOOK_SECRET` (whsec\_... - _obtained from Clerk Dashboard Webhook Endpoint settings_)
  - `DATABASE_URL` / `POSTGRES_DATABASE_URL`
  - `NEXT_PUBLIC_APP_URL` (Base URL of the deployed application, e.g., `https://app.justify.social`)

## Implementation Details

### User Flow

1.  User navigates to `/account/billing`.
2.  User clicks the "Manage Billing / Payment Methods" button.
3.  Frontend calls the backend API (`/api/payments/create-checkout-session`) to create a Checkout Session.
4.  Backend retrieves/creates the corresponding Stripe Customer ID linked to the user's `clerkId`.
5.  Backend creates a Stripe Checkout Session (typically in `setup` mode for managing payment methods) with `success_url` and `cancel_url` pointing back to `/account/billing`.
6.  Frontend receives the `sessionId` and uses `stripe.redirectToCheckout()` to send the user to the Stripe-hosted page.
7.  User interacts with the Stripe UI (enters card details, authenticates if required).
8.  Stripe redirects the user back to the `success_url` (`...?checkout=success`) or `cancel_url` (`...?checkout=cancel`).
9.  The `/account/billing` page detects the query parameter and displays an appropriate status message.
10. **Asynchronously:** Stripe sends a `checkout.session.completed` webhook event to the backend.
11. The backend webhook handler verifies the event, checks idempotency (`StripeEvent` table), retrieves the user ID, and updates the database accordingly (e.g., storing payment method details or updating subscription status based on session `mode`).

### Key Code Components

- **Backend API Route (`/api/payments/create-checkout-session/route.ts`):**
  - Receives requests (requires authenticated `justifyUserId`).
  - Calls `getOrCreateStripeCustomerId` (uses `prisma.user.findUnique({ where: { clerkId: ... } })`).
  - Creates Stripe Customer via `stripe.customers.create` if needed.
  - Updates `User` record with `stripeCustomerId`.
  - Creates Stripe Checkout Session via `stripe.checkout.sessions.create`.
  - Returns `{ sessionId }`.
- \*\*Backend Webhook Handler (`/api/webhooks/stripe/route.ts`):
  - Verifies signature using `stripe.webhooks.constructEvent` and `STRIPE_WEBHOOK_SECRET`.
  - Performs idempotency check using `prisma.stripeEvent.create` (catches P2002 error).
  - Handles `checkout.session.completed`:
    - Extracts user ID (`client_reference_id` or `metadata.justifyUserId`).
    - Performs DB updates (`prisma.user.update`) based on `session.mode`.
  - Updates `prisma.stripeEvent` status.
  - Handles other events like `invoice.payment_failed` (for future subscription logic).
- \*\*Frontend Billing Page (`/app/account/billing/BillingClientComponent.tsx`):
  - Uses `useUser` to get Clerk `userId`.
  - Contains the "Manage Billing" `Button`.
  - `handleManageBillingClick` function calls `/api/payments/create-checkout-session`.
  - Uses `loadStripe` and `stripe.redirectToCheckout({ sessionId })`.
  - Uses `useSearchParams` in `useEffect` to read `?checkout=` status on return and display messages.
- \*\*Prisma Schema (`schema.prisma`):
  - `User` model includes `clerkId @unique` and `stripeCustomerId @unique`.
  - `StripeEvent` model includes `id @unique` (for event ID `evt_...`).
- \*\*Middleware (`src/middleware.ts`):
  - Ensures `/api/webhooks/(.*)` is excluded from Clerk authentication.

### Testing Notes

- **Local:** Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and `stripe trigger checkout.session.completed` (and others). Ensure local `.env` uses the `whsec_...` provided by `stripe listen`.
- **Clerk Sync:** Requires separate local testing via `ngrok` or Clerk CLI forwarding for `/api/webhooks/clerk`.
- **Production:** Requires **Live** Stripe keys/secrets and the **Live** webhook secret configured in Vercel environment variables. Live Stripe/Clerk webhook endpoints must point to the production URL.
