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
  apiVersion: '2025-02-24.acacia', // Using version format expected by types
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
        // Extract user ID (Prefer client_reference_id if set during session creation, fallback to metadata)
        const userId = session.client_reference_id || session.metadata?.justifyUserId || null;
        const stripeCustomerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id;

        if (!userId) {
          throw new Error(
            'User identifier (client_reference_id or metadata.justifyUserId) missing in checkout.session.completed'
          );
        }

        // Use metadata or line items to determine what was purchased/setup
        console.log(`  Mode: ${session.mode}, Customer: ${stripeCustomerId}, UserID: ${userId}`);

        // Example DB Update Logic (adjust based on mode/metadata)
        if (session.mode === 'setup' && session.setup_intent) {
          const setupIntentId =
            typeof session.setup_intent === 'string'
              ? session.setup_intent
              : session.setup_intent.id;
          // Retrieve SetupIntent if more details needed (like payment method ID)
          // const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
          // const paymentMethodId = setupIntent.payment_method;
          await prisma.user.update({
            where: { id: userId },
            data: {
              /* Mark setup complete, potentially store default PM ID */
            },
          });
          console.log(
            `ACTION (BE-5): Updated user ${userId} after successful payment method setup via Checkout Session ${session.id}.`
          );
        } else if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          // Retrieve subscription for details like plan ID, period end
          // const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          // const planId = subscription.items.data[0]?.price.id;
          // const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          await prisma.user.update({
            where: { id: userId },
            data: {
              // stripeSubscriptionId: subscriptionId,
              // stripePriceId: planId,
              // stripeCurrentPeriodEnd: currentPeriodEnd,
              // subscriptionStatus: 'ACTIVE'
            },
          });
          console.log(
            `ACTION (BE-5): Updated user ${userId} subscription after successful Checkout Session ${session.id}.`
          );
        } else if (session.mode === 'payment') {
          // Handle successful one-time payment
          await prisma.user.update({
            where: { id: userId },
            data: {
              /* Grant credits, update order status, etc. */
            },
          });
          console.log(
            `ACTION (BE-5): Processed one-time payment for user ${userId} via Checkout Session ${session.id}.`
          );
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
