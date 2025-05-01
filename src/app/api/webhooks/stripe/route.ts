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

// Initialize Stripe - ensure secret key is loaded
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

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
    rawBody = await request.text(); // Read body as text
    signature = request.headers.get('stripe-signature'); // Get signature

    // --- DEEPER DEBUG LOGGING ---
    console.log('DEBUG: Retrieved webhookSecret:', webhookSecret);
    console.log('DEBUG: Received signature header:', signature);
    console.log('DEBUG: Received rawBody (start):'.concat(rawBody.substring(0, 100))); // Log first 100 chars
    // --- END DEBUG LOGGING ---

    if (!signature || !webhookSecret) {
      console.error('Webhook Error: Missing signature or secret.');
      return NextResponse.json({ error: 'Missing webhook signature or secret.' }, { status: 400 });
    }

    // --- Implement BE-4: Signature Verification ---
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    // --- END BE-4 ---
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    // Log the secret used during the error for comparison
    console.error(`DEBUG: Secret used during failed verification: ${webhookSecret}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`Received Verified Stripe Event: ${event.type}, ID: ${event.id}`);
  // MONITOR-1: Track received event types
  // monitor.increment(`stripe.webhook.received.${event.type}`);

  // --- Implement BE-5 & BE-6: Handle specific events with DB updates ---
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
        console.log(`Processing payment_intent.succeeded: ${paymentIntentSucceeded.id}`);
        const piUserId = paymentIntentSucceeded.metadata.justifyUserId;
        // --- BE-5 DB Update ---
        if (piUserId) {
          // TODO: Add idempotency check (e.g., using a separate StripeEvent model/table)
          try {
            // Replace with your actual logic based on the payment's purpose
            // Example: Granting credits or updating subscription status
            // This assumes the User model has fields related to the payment's purpose
            await prisma.user.update({
              where: { id: piUserId },
              data: {
                // Example: Update subscription status or grant resource
                // subscriptionStatus: 'ACTIVE',
                // credits: { increment: 100 }
              },
            });
            console.log(
              `BE-5: DB updated successfully for user ${piUserId} after payment ${paymentIntentSucceeded.id}.`
            );
            // TODO: Trigger background job for fulfillment/notifications if needed
          } catch (dbError) {
            console.error(
              `BE-5 DB Error (payment_intent.succeeded) for user ${piUserId}:`,
              dbError
            );
            // MONITOR-1: Alert on critical DB errors in webhook
            // monitor.increment('stripe.webhook.error.db_update');
          }
        } else {
          console.error('BE-5 Error: justifyUserId missing in payment_intent.succeeded metadata.');
          // MONITOR-1: Track missing metadata errors
          // monitor.increment('stripe.webhook.error.missing_metadata');
        }
        // --- END BE-5 ---
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
        const piFailureReason = paymentIntentFailed.last_payment_error?.message || 'Unknown reason';
        console.error(
          `Processing payment_intent.payment_failed: ${paymentIntentFailed.id}, Reason: ${piFailureReason}`
        );
        // --- BE-6 DB/Notification ---
        const piFailUserId = paymentIntentFailed.metadata.justifyUserId;
        // Log failure, potentially update order status to FAILED if applicable
        console.log(
          `ACTION (BE-6): Logging payment failure event for user ${piFailUserId || 'unknown'}.`
        );
        // await prisma.paymentLog.create({ data: { ... } }); // Example logging
        // TODO: Trigger user notification (e.g., email)
        // --- END BE-6 ---
        break;

      case 'setup_intent.succeeded':
        const setupIntentSucceeded = event.data.object as Stripe.SetupIntent;
        console.log(`Processing setup_intent.succeeded: ${setupIntentSucceeded.id}`);
        const siUserId = setupIntentSucceeded.metadata?.justifyUserId ?? null;
        const paymentMethodId =
          typeof setupIntentSucceeded.payment_method === 'string'
            ? setupIntentSucceeded.payment_method
            : setupIntentSucceeded.payment_method?.id;
        // --- BE-5 DB Update ---
        if (siUserId && paymentMethodId) {
          // TODO: Add idempotency check
          try {
            // Update user record to indicate a payment method is saved
            // NOTE: Consider if you need to store the payment method ID or just a flag.
            // Storing the pm_ ID allows charging later, but requires careful handling.
            await prisma.user.update({
              where: { id: siUserId },
              data: {
                // Example: Store the Stripe PM ID to potentially set as default
                // stripeDefaultPaymentMethodId: paymentMethodId,
                // Or simply set a flag if you don't need the ID for future charges
                // hasSavedPaymentMethod: true
              },
            });
            console.log(
              `BE-5: DB updated successfully for user ${siUserId} after setup intent ${setupIntentSucceeded.id}.`
            );

            // Optional: Make this new payment method the default for the customer in Stripe
            // Requires stripeCustomerId to be reliably available (from BE-1.5)
            // const customerId = await getOrCreateStripeCustomerId(siUserId); // Ensure this doesn't error
            // if (customerId) {
            //    await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethodId } });
            //    console.log(`Set payment method ${paymentMethodId} as default for customer ${customerId}`);
            // }
          } catch (dbError) {
            console.error(`BE-5 DB Error (setup_intent.succeeded) for user ${siUserId}:`, dbError);
            // MONITOR-1: Alert on critical DB errors in webhook
            // monitor.increment('stripe.webhook.error.db_update');
          }
        } else {
          console.error(
            'BE-5 Error: justifyUserId or payment_method missing in setup_intent.succeeded.'
          );
          // MONITOR-1: Track missing metadata errors
          // monitor.increment('stripe.webhook.error.missing_metadata');
        }
        // --- END BE-5 ---
        break;

      case 'setup_intent.setup_failed':
        const setupIntentFailed = event.data.object as Stripe.SetupIntent;
        const siFailureReason = setupIntentFailed.last_setup_error?.message || 'Unknown reason';
        console.error(
          `Processing setup_intent.setup_failed: ${setupIntentFailed.id}, Reason: ${siFailureReason}`
        );
        // --- BE-6 DB/Notification ---
        const siFailUserId = setupIntentFailed.metadata?.justifyUserId ?? null;
        // Log failure
        console.log(
          `ACTION (BE-6): Logging setup intent failure event for user ${siFailUserId || 'unknown'}.`
        );
        // await prisma.paymentLog.create({ data: { ... } }); // Example logging
        // TODO: Notify user if action needed
        // --- END BE-6 ---
        break;

      // ... handle other relevant events ...
      // Example: Handle subscription updates if using Stripe Billing
      // case 'customer.subscription.updated':
      // case 'customer.subscription.deleted':
      //    const subscription = event.data.object as Stripe.Subscription;
      //    await handleSubscriptionChange(subscription);
      //    break;

      default:
        console.log(`Unhandled verified event type: ${event.type}`);
      // MONITOR-1: Track unhandled event types
      // monitor.increment('stripe.webhook.unhandled');
    }
  } catch (handlerError: any) {
    console.error(`Error handling event ${event.id} (type: ${event.type}):`, handlerError);
    // MONITOR-1: Alert on errors within specific event handlers
    // monitor.increment(`stripe.webhook.error.handler.${event.type}`);
  }
  // --- END BE-5 & BE-6 Implementation ---

  // MONITOR-1: Track successful webhook processing completion
  // monitor.increment('stripe.webhook.processed');
  return NextResponse.json({ received: true });
}
