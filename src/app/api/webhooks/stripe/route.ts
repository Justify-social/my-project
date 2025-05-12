import Stripe from 'stripe';
// import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
// import { stripe } from '@/lib/stripe'; // Comment out unused import
import { prisma } from '@/lib/prisma';
import { Analytics as _Analytics } from '@/lib/analytics/analytics';
// import { subscriptionCreated } from '@/lib/stripe/webhook-handlers';
import { ReadableStream } from 'stream/web';
// Placeholder for a monitoring/logging service client
// import { logger, monitor } from '@/lib/monitoring';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Define an interface for subscription update data
interface _SubscriptionUpdateData {
  userId: string;
  subscriptionId: string;
  planId: string;
  status: Stripe.Subscription.Status;
  currentPeriodEnd: Date;
}

// Define an interface for analytics properties
interface _SubscriptionAnalyticsProps {
  userId: string;
  plan: string;
  status: string;
}

// Initialize Stripe with explicit API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil', // Update API version to match SDK types
});

// No longer need custom body parser config or buffer function
// export const config = { ... };
// async function buffer(...) { ... }

// --- Webhook Handler Functions ---

async function _handleSubscriptionEvent(
  event: Stripe.Event,
  userId: string,
  data: _SubscriptionUpdateData
) {
  // Implementation details...
  console.log(event, userId, data); // Example usage to satisfy linter if needed briefly
}

// --- Main Webhook POST Handler ---

export async function POST(request: Request) {
  console.log('Webhook request received...');
  let event: Stripe.Event;
  let rawBody: string;
  let signature: string | null;

  try {
    rawBody = await request.text();
    signature = request.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('Webhook Error: Missing signature or secret.');
      return NextResponse.json({ error: 'Missing webhook signature or secret.' }, { status: 400 });
    }

    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // --- Idempotency Check ---
  try {
    // Attempt to create a record for this event ID
    await prisma.stripeEvent.create({
      data: {
        id: event.id, // Use Stripe event ID as primary key
        type: event.type,
        status: 'pending', // Mark as pending initially
      },
    });
    console.log(`Idempotency check passed: Recorded event ${event.id}`);
  } catch (error: any) {
    // Check if error is because the record already exists (unique constraint violation)
    if (error.code === 'P2002') {
      // Prisma unique constraint violation code
      console.log(`Idempotency check failed: Event ${event.id} already processed.`);
      // Event already handled, return 200 OK to acknowledge receipt
      return NextResponse.json({ received: true, message: 'Event already processed' });
    } else {
      // Different error during idempotency check
      console.error(`Idempotency check DB error for event ${event.id}:`, error);
      // Return 500 as we couldn't safely check idempotency
      return NextResponse.json(
        { error: 'Internal Server Error during idempotency check' },
        { status: 500 }
      );
    }
  }
  // --- End Idempotency Check ---

  console.log(`Processing Verified Stripe Event: ${event.type}, ID: ${event.id}`);
  // MONITOR-1: Track received event types
  // monitor.increment(`stripe.webhook.received.${event.type}`);

  // --- Handle specific Checkout events ---
  let processingError: any = null;
  try {
    switch (event.type) {
      // --- BE-5-Checkout ---
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Processing checkout.session.completed: ${session.id}`);

        // Prefer client_reference_id if you set it during session creation, otherwise use metadata
        const userId = session.client_reference_id || session.metadata?.justifyUserId || null;
        const stripeCustomerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id;

        if (!userId) {
          throw new Error('User identifier missing in checkout.session.completed');
        }
        console.log(
          `Checkout completed for user: ${userId}, Stripe Customer: ${stripeCustomerId}, Mode: ${session.mode}`
        );

        // --- DB Update Logic ---
        if (session.mode === 'setup' && session.setup_intent) {
          // If using setup mode, maybe store the setup intent ID or payment method ID
          const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent as string, {
            expand: ['payment_method'],
          });
          const paymentMethodId = setupIntent.payment_method as Stripe.PaymentMethod | null;

          await prisma.user.update({
            where: { clerkId: userId }, // Assuming you query users by Clerk ID
            data: {
              stripeCustomerId: stripeCustomerId, // Ensure customer ID is stored
              // Optionally store default payment method details (ID, last4, brand)
              // stripePaymentMethodId: paymentMethodId?.id,
              // stripeCardLast4: paymentMethodId?.card?.last4,
              // stripeCardBrand: paymentMethodId?.card?.brand,
            },
          });
          console.log(`ACTION (BE-5): Updated user ${userId} payment method setup info.`);
        } else if (session.mode === 'subscription' && session.subscription) {
          // If using subscription mode, store subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await prisma.user.update({
            where: { clerkId: userId },
            data: {
              stripeCustomerId: stripeCustomerId,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.items.data[0].current_period_end * 1000
              ),
              // Add a field to your User model for subscription status if needed
              // subscriptionStatus: subscription.status,
            },
          });
          console.log(`ACTION (BE-5): Updated user ${userId} subscription data.`);
        } else if (session.mode === 'payment' && session.payment_intent) {
          // If using one-time payment mode, update based on the payment
          // You might store payment intent ID or update an order status
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string
          );
          await prisma.user.update({
            where: { clerkId: userId },
            data: {
              stripeCustomerId: stripeCustomerId,
              /* Grant credits, update order status based on paymentIntent details, etc. */
            },
          });
          console.log(`ACTION (BE-5): Processed one-time payment for user ${userId}.`);
        }
        break;
      // --- END BE-5-Checkout ---

      // --- BE-6: Handle Other Events ---
      case 'checkout.session.async_payment_failed':
        const failedSession = event.data.object as Stripe.Checkout.Session;
        console.error(`Processing checkout.session.async_payment_failed: ${failedSession.id}`);
        // Log details, potentially notify user/admin
        break;
      case 'invoice.payment_failed': // Important for subscription renewals
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.error(`Processing invoice.payment_failed: ${failedInvoice.id}`);
        // Lookup user via customer ID: failedInvoice.customer
        // Notify user about failed renewal payment
        break;
      // --- END BE-6 ---

      // Remove old intent handlers if desired, or keep for logging
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'setup_intent.succeeded':
      case 'setup_intent.setup_failed':
        console.log(`Ignoring old intent event type: ${event.type}`);
        break;

      default:
        console.log(`Unhandled verified event type: ${event.type}`);
    }
  } catch (handlerError: any) {
    console.error(`Error handling event ${event.id} (type: ${event.type}):`, handlerError);
    processingError = handlerError; // Store error to update StripeEvent status
  }
  // --- END BE-5 & BE-6 Implementation ---

  // --- Update StripeEvent Status ---
  try {
    await prisma.stripeEvent.update({
      where: { id: event.id },
      data: {
        status: processingError ? 'failed' : 'processed',
        error: processingError
          ? { message: processingError.message, stack: processingError.stack }
          : undefined,
      },
    });
  } catch (updateError) {
    console.error(`Error updating StripeEvent status for ${event.id}:`, updateError);
    // Don't fail the webhook response just because status update failed
  }
  // --- End Status Update ---

  // MONITOR-1: Track successful webhook processing completion
  // monitor.increment('stripe.webhook.processed');
  return NextResponse.json({ received: true });
}
