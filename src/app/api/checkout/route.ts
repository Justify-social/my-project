import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // Use Clerk auth
import { stripe, getStripeCustomer } from '@/lib/stripe';

// Define expected structure for sessionClaims if possible
interface CustomSessionClaims {
  email?: string;
  // Add other claims if needed
}

export async function POST(req: Request) {
  try {
    // Get session using Clerk's auth()
    const { userId, sessionClaims } = await auth();
    const typedClaims = sessionClaims as CustomSessionClaims | null;

    console.log('Clerk Auth Data:', { userId, sessionClaims }); // Debug log

    // Check for authenticated user ID
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user email from claims (ensure it exists)
    const userEmail = typedClaims?.email;
    if (!userEmail) {
      console.error('User email not found in Clerk session claims.');
      return NextResponse.json({ error: 'User email missing' }, { status: 400 });
    }

    // Get the base URL from the request
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const body = await req.json();
    console.log('Request body:', body); // Debug log
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Get or create Stripe customer using email
    try {
      // Assuming getStripeCustomer uses email, pass the email from claims
      const customer = await getStripeCustomer(userEmail);
      console.log('Stripe customer:', customer); // Debug log

      // Updated to use subscription mode
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription', // Changed from 'payment' to 'subscription'
        success_url: `${baseUrl}/campaigns/wizard/step-1?success=true`,
        cancel_url: `${baseUrl}/pricing?canceled=true`,
        // Use Clerk userId in metadata
        metadata: {
          userId: userId,
        },
        subscription_data: {
          metadata: {
            userId: userId,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        payment_method_types: ['card'],
      });

      console.log('Checkout session:', checkoutSession); // Debug log

      if (!checkoutSession.url) {
        throw new Error('No checkout URL returned from Stripe');
      }

      return NextResponse.json({ url: checkoutSession.url });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      return NextResponse.json(
        { error: stripeError instanceof Error ? stripeError.message : 'Stripe operation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
