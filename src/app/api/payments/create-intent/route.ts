import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma'; // Import Prisma client

// Ensure the secret key is loaded from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2024-06-20', // Use a version compatible with your SDK install
  // If unsure, omitting it uses the SDK's default, which is usually safe.
  // Or find the exact version string expected by your SDK version.
});

// Function to get or create a Stripe Customer ID for a Justify User
async function getOrCreateStripeCustomerId(justifyUserId: string): Promise<string | undefined> {
  try {
    // 1. Find the user in your database
    const user = await prisma.user.findUnique({
      where: { id: justifyUserId },
      // Select the fields needed
      select: { stripeCustomerId: true, email: true, name: true },
    });

    if (!user) {
      console.error(`BE-1.5 Error: User not found for ID: ${justifyUserId}`);
      return undefined;
    }

    // 2. Return existing Stripe Customer ID if found
    // Check explicitly for null/undefined if the field is optional
    if (user.stripeCustomerId) {
      console.log(
        `BE-1.5: Found existing Stripe Customer ID for user ${justifyUserId}: ${user.stripeCustomerId}`
      );
      return user.stripeCustomerId;
    }

    // 3. Create a new Stripe Customer if none exists
    console.log(
      `BE-1.5: No Stripe Customer ID found for user ${justifyUserId}. Creating new customer...`
    );
    const customerParams: Stripe.CustomerCreateParams = {
      email: user.email ?? undefined, // Use nullish coalescing
      name: user.name ?? undefined, // Use nullish coalescing
      metadata: {
        justifyUserId: justifyUserId,
      },
    };
    const customer = await stripe.customers.create(customerParams);
    console.log(`BE-1.5: Created Stripe Customer ${customer.id} for user ${justifyUserId}`);

    // 4. Update your user record with the new Stripe Customer ID
    await prisma.user.update({
      where: { id: justifyUserId },
      data: { stripeCustomerId: customer.id },
    });
    console.log(`BE-1.5: Updated user ${justifyUserId} record with Stripe Customer ID.`);

    return customer.id;
  } catch (error: any) {
    console.error(
      `BE-1.5 Error getting or creating Stripe customer for user ${justifyUserId}:`,
      error
    );
    return undefined;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      amount, // Expect amount in smallest currency unit (e.g., pence for GBP)
      intentType = 'payment', // 'payment' or 'setup'
      justifyUserId = null, // Pass this from your frontend auth context
      // Add other metadata fields as needed based on your application logic
      metadata = {},
    } = body;

    const currency = 'gbp'; // Hardcoded for UK SaaS

    if (intentType === 'payment' && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json(
        { error: 'Invalid amount specified for PaymentIntent.' },
        { status: 400 }
      );
    }

    // --- Use BE-1.5 Implementation ---
    const customerId = await getOrCreateStripeCustomerId(justifyUserId);
    if (!customerId) {
      // Handle case where customer couldn't be retrieved or created
      console.error(
        `BE-2 Error: Could not get or create Stripe customer for user ${justifyUserId}`
      );
      return NextResponse.json({ error: 'Could not process payment setup.' }, { status: 500 });
    }
    // Add justifyUserId to metadata if needed (though linked via customer now)
    if (!metadata.justifyUserId) {
      metadata.justifyUserId = justifyUserId;
    }
    // --- End BE-1.5 Usage ---

    let clientSecret: string | null = null;

    if (intentType === 'setup') {
      // Create SetupIntent for saving payment methods
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card', 'bacs_debit'], // Common UK methods, add others as needed
        metadata,
        usage: 'on_session', // Default, adjust if needed for off-session
      });
      clientSecret = setupIntent.client_secret;
      console.log('Created SetupIntent:', setupIntent.id);
    } else {
      // intentType === 'payment'
      // Create PaymentIntent for immediate payment
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        customer: customerId,
        payment_method_types: ['card', 'bacs_debit'], // Common UK methods
        metadata,
        // Add other options like setup_future_usage if needed
        // setup_future_usage: 'on_session',
      });
      clientSecret = paymentIntent.client_secret;
      console.log('Created PaymentIntent:', paymentIntent.id);
    }

    if (!clientSecret) {
      throw new Error('Failed to create intent or extract client secret.');
    }

    return NextResponse.json({ clientSecret });
  } catch (error: any) {
    console.error('Error creating Stripe intent:', error);
    // Don't expose raw Stripe errors to the client
    return NextResponse.json(
      { error: 'Internal Server Error creating payment intent.' },
      { status: 500 }
    );
  }
}
