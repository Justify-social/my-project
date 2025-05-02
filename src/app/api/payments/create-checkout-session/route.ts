import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma'; // Import Prisma client
import { logger } from '@/utils/logger';

// Initialize Stripe with explicit API version required by installed SDK types
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // Using version format expected by types
});

// Function to get or create a Stripe Customer ID for a Justify User
async function getOrCreateStripeCustomerId(justifyUserId: string): Promise<string | undefined> {
  try {
    // 1. Find the user in your database USING THE CLERK ID
    const user = await prisma.user.findUnique({
      // Query using the clerkId field, which stores the Clerk User ID
      where: { clerkId: justifyUserId },
      select: { id: true, stripeCustomerId: true, email: true, name: true }, // Select internal ID too
    });

    if (!user) {
      logger.error('User not found in DB', { clerkId: justifyUserId });
      return undefined;
    }

    // 2. Return existing Stripe Customer ID if found
    // Check explicitly for null/undefined if the field is optional
    if (user.stripeCustomerId) {
      try {
        logger.info('Found existing Stripe Customer ID, verifying with Stripe...', {
          clerkId: justifyUserId,
          stripeCustomerId: user.stripeCustomerId,
        });
        const existingCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
        // Check if customer exists and is not deleted
        if (existingCustomer && !existingCustomer.deleted) {
          logger.info('Existing Stripe Customer verified.', {
            clerkId: justifyUserId,
            stripeCustomerId: user.stripeCustomerId,
          });
          return user.stripeCustomerId;
        } else {
          logger.warn(
            'Stripe Customer ID found in DB but customer is deleted or invalid in Stripe. Will create a new one.',
            { clerkId: justifyUserId, stripeCustomerId: user.stripeCustomerId }
          );
          // Fall through to create a new customer
        }
      } catch (error: any) {
        // Specifically handle "resource_missing" which means customer doesn't exist in Stripe
        if (error.code === 'resource_missing') {
          logger.warn(
            'Stripe Customer ID found in DB but does not exist in Stripe. Will create a new one.',
            { clerkId: justifyUserId, stripeCustomerId: user.stripeCustomerId }
          );
          // Fall through to create a new customer
        } else {
          // Log other errors during verification but still attempt to create new customer as fallback
          logger.error(
            'Error verifying existing Stripe Customer ID, attempting to create new one.',
            {
              clerkId: justifyUserId,
              stripeCustomerId: user.stripeCustomerId,
              error: error.message,
            }
          );
          // Fall through might be risky depending on error, consider specific handling
        }
      }
    }

    // 3. Create a new Stripe Customer if none exists OR if existing one was invalid/deleted
    logger.info('Creating new Stripe Customer...', { clerkId: justifyUserId });
    const customerParams: Stripe.CustomerCreateParams = {
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: {
        // Use internal DB User ID if helpful, otherwise Clerk ID is fine
        justifyUserId: user.id, // Use internal ID for metadata if preferred
        clerkUserId: justifyUserId, // Keep clerkId for reference
      },
    };
    const customer = await stripe.customers.create(customerParams);
    logger.info('Created Stripe Customer', {
      clerkId: justifyUserId,
      stripeCustomerId: customer.id,
    });

    // 4. Update your user record with the new Stripe Customer ID
    await prisma.user.update({
      where: { id: user.id }, // Use the internal DB ID here
      data: { stripeCustomerId: customer.id },
    });
    logger.info('Updated user record with new Stripe Customer ID.', {
      clerkId: justifyUserId,
      stripeCustomerId: customer.id,
    });

    return customer.id;
  } catch (error: any) {
    logger.error('Error in getOrCreateStripeCustomerId', {
      clerkId: justifyUserId,
      error: error.message,
    });
    return undefined;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      // --- Parameters needed for Checkout Session ---
      priceId = null, // e.g., price_xxx from your Stripe Dashboard (for subscriptions/products)
      mode = 'setup', // 'payment', 'subscription', or 'setup' (for saving card details)
      justifyUserId = null, // Should come from auth context
      // Add other necessary parameters (e.g., quantity for payment mode)
      // --- End Parameters ---
    } = body;

    if (!justifyUserId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Get or create Stripe Customer ID using the function (which now queries by clerkId)
    const customerId = await getOrCreateStripeCustomerId(justifyUserId);
    if (!customerId) {
      return NextResponse.json(
        { error: 'Could not retrieve or create customer.' },
        { status: 500 }
      );
    }

    // Define Success and Cancel URLs (pointing back to billing page)
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/billing?checkout=success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/billing?checkout=cancel`;

    // Construct Session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: mode,
      // Configure payment methods (can also be done in Stripe Dashboard settings)
      payment_method_types: ['card'], // Add 'bacs_debit' etc. if enabled
      // Provide EITHER line_items OR priceId depending on mode/use case
      // line_items: mode === 'payment' || mode === 'subscription' ? [{ price: priceId, quantity: 1 }] : undefined,
      // For setup mode, specify intent options
      setup_intent_data:
        mode === 'setup'
          ? {
              metadata: { justifyUserId: justifyUserId }, // Pass metadata here too if needed for setup intent
            }
          : undefined,
      // For subscription mode, provide priceId
      line_items: mode === 'subscription' ? [{ price: priceId, quantity: 1 }] : undefined,
      // Include metadata if needed for the session itself
      metadata: {
        justifyUserId: justifyUserId,
      },
      // Add customer_update to allow updating billing address during setup mode
      customer_update: mode === 'setup' ? { address: 'auto' } : undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    // Specific logic for payment mode if needed (e.g., requires line_items directly)
    if (mode === 'payment' && priceId) {
      sessionParams.line_items = [{ price: priceId, quantity: 1 }];
    } else if (mode === 'payment' && !priceId) {
      // Handle payment mode without a priceId - needs direct line_items array
      // This example assumes you pass line_items directly in the request body
      if (!body.line_items) {
        // Check if line_items were passed in body
        return NextResponse.json(
          { error: 'Line items are required for payment mode without priceId.' },
          { status: 400 }
        );
      }
      sessionParams.line_items = body.line_items;
    }

    // Validate required params based on mode
    if ((mode === 'payment' || mode === 'subscription') && !sessionParams.line_items) {
      return NextResponse.json(
        { error: 'Price ID or Line Items are required for payment/subscription mode.' },
        { status: 400 }
      );
    }
    if (mode === 'setup' && !sessionParams.setup_intent_data) {
      // This shouldn't happen based on above logic, but good check
      return NextResponse.json(
        { error: 'Setup intent data required for setup mode.' },
        { status: 400 }
      );
    }

    // Create the Checkout Session
    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.id) {
      throw new Error('Stripe Checkout Session creation failed.');
    }

    // Return the Session ID to the frontend
    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating Stripe Checkout session:', error);
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
