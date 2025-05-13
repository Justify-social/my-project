import { NextResponse } from 'next/server';
import Stripe from 'stripe'; // Uncomment import

// TODO: Uncomment Stripe initialization and ensure STRIPE_SECRET_KEY is set in environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
  try {
    // Immediately return error as Stripe is temporarily disabled
    /* // Comment out this block
    console.error('Stripe checkout temporarily disabled: STRIPE_SECRET_KEY not configured.');
    return NextResponse.json(
      { error: 'Checkout functionality is temporarily disabled.' },
      { status: 503 } // Service Unavailable
    );
    */

    // TODO: Uncomment the following block when Stripe is re-enabled // This comment can be removed
    const { priceId, mode } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    if (!stripe) {
      // Add check in case stripe is conditionally initialized later
      throw new Error('Stripe client is not initialized. Check STRIPE_SECRET_KEY.');
    }

    const session = await stripe.checkout.sessions.create({
      mode: mode || 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return NextResponse.json({ url: session.url });
    // */ // Remove this trailing comment if it exists from the original
  } catch (error) {
    console.error('Stripe checkout error (initialization or session creation):', error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
