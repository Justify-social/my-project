import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
// import { stripe } from '@/lib/stripe'; // Comment out unused import
import { prisma } from '@/lib/prisma';
import { Analytics } from '@/lib/analytics/analytics';
import Stripe from 'stripe'; // Keep this type import if needed for interfaces

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Define an interface for subscription update data
interface SubscriptionUpdateData {
  stripeSubscriptionId: string | null;
  stripeCustomerId: string;
  subscriptionStatus: string;
  // role?: string; // Optional: Example if role were used
}

// Define an interface for analytics properties
interface SubscriptionAnalyticsProps {
  userId: string;
  subscriptionId: string;
  status?: string; // Optional as it's deleted for deletion event
  [key: string]: unknown; // Add index signature to satisfy Analytics.track
}

// --- Webhook Handler Functions ---

async function handleSubscriptionEvent(
  _subscription: Stripe.Subscription, // Prefix unused
  _eventType: string // Prefix unused
) {
  // TODO: Uncomment logic when Stripe is re-enabled and stripe object is available.
  // Requires null check for stripe object if imported from modified @/lib/stripe
  console.log('handleSubscriptionEvent called, but processing is disabled.');
  /*
  const clerkUserId = subscription.metadata?.userId;
  // ... rest of original function body ...
  */
}

// --- Main Webhook POST Handler ---

export async function POST(req: Request) {
  // TODO: Add back Stripe event construction and handling when Stripe is re-enabled.
  console.log('Received Stripe webhook, processing temporarily disabled.');

  // Still check for webhook secret configuration
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not defined');
    // Return 500 as it's a server config issue, prevents processing anyway
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // For now, just acknowledge receipt immediately to prevent Stripe retries
  return NextResponse.json({ received: true, processing_disabled: true });

  /*  // Original logic (commented out)
  try {
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not defined');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get('stripe-signature');

    if (!signature) {
      console.warn('Stripe webhook request missing signature');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Requires stripe object from @/lib/stripe
    // let event: Stripe.Event;
    // try {
    //   event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    // } catch (err) {
    //   ...
    // }

    // console.log(`Received Stripe Event: ${event.type}`);
    // switch (event.type) {
    //   ...
    // }

    return NextResponse.json({ received: true });
  } catch (err) {
    // ... error handling ...
  }
  */
}
