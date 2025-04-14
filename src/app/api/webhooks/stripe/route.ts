import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { Analytics } from '@/lib/analytics/analytics';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// --- Webhook Handler Functions ---

async function handleSubscriptionEvent(subscription: Stripe.Subscription, eventType: string) {
  const clerkUserId = subscription.metadata?.userId; // Get Clerk ID from metadata

  if (!clerkUserId) {
    console.error(`Clerk User ID not found in ${eventType} subscription metadata: ${subscription.id}`);
    // Depending on strictness, you might want to throw an error or just return
    return; // Exit if no Clerk ID is found
  }

  console.log(`Handling ${eventType} for Clerk User ID: ${clerkUserId}, Subscription ID: ${subscription.id}`);

  let updateData: any = {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    subscriptionStatus: subscription.status,
  };

  let analyticsEventName = 'Subscription_Event';
  const analyticsProps: any = {
    userId: clerkUserId,
    subscriptionId: subscription.id,
    status: subscription.status,
  };

  if (eventType === 'customer.subscription.created') {
    analyticsEventName = 'Subscription_Created';
    // Add specific logic for creation, e.g., setting initial role if applicable
    // updateData.role = 'MEMBER'; // Example: Set role on creation
  }

  if (eventType === 'customer.subscription.updated') {
    analyticsEventName = 'Subscription_Updated';
    // Only update relevant fields for update
    updateData = {
      subscriptionStatus: subscription.status,
      stripeCustomerId: subscription.customer as string, // Keep customer ID potentially updated
    };
  }

  if (eventType === 'customer.subscription.deleted') {
    analyticsEventName = 'Subscription_Deleted';
    // Update fields for deletion
    updateData = {
      subscriptionStatus: 'canceled', // Explicitly set status
      stripeSubscriptionId: null, // Clear subscription ID
      stripeCustomerId: subscription.customer as string, // Keep customer ID for history?
      // Consider setting role back to default if needed
      // role: 'USER', // Example: Revert role on cancellation
    };
    // Remove status from analytics for deletion event
    delete analyticsProps.status;
  }

  try {
    await prisma.user.update({
      where: {
        clerkId: clerkUserId, // Use Clerk ID to find the user
      },
      data: updateData,
    });
    console.log(`User record updated for Clerk ID: ${clerkUserId} based on ${eventType}`);

    // Track analytics event
    Analytics.track(analyticsEventName, analyticsProps);

  } catch (error) {
    console.error(`Failed to update user for Clerk ID ${clerkUserId} during ${eventType}:`, error);
    // Optionally, re-throw or handle the error for retry logic
  }
}

// --- Main Webhook POST Handler ---

export async function POST(req: Request) {
  try {
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not defined');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await req.text();
    // Await headers() as suggested by linter
    const headerList = await headers();
    const signature = headerList.get('stripe-signature');

    if (!signature) {
      console.warn('Stripe webhook request missing signature');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error constructing event';
      console.error(`⚠️ Webhook signature verification failed: ${errorMessage}`);
      return NextResponse.json({ error: `Webhook signature verification failed: ${errorMessage}` }, { status: 400 });
    }

    console.log(`Received Stripe Event: ${event.type}`);

    // Handle specific subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription, event.type);
        break;
      // TODO: Add handlers for other relevant events if needed
      // case 'invoice.payment_succeeded':
      // case 'invoice.payment_failed':
      // case 'checkout.session.completed': // Could also get metadata here
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // Catch unexpected errors in the handler logic
    const errorMessage = err instanceof Error ? err.message : 'Unknown webhook handler error';
    console.error('Stripe webhook handler error:', errorMessage);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 }); // Return 500 for internal errors
  }
}
