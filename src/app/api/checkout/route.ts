import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { stripe, getStripeCustomer } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    console.log('Auth Session:', session); // Debug log
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('Request body:', body); // Debug log
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    try {
      const customer = await getStripeCustomer(session.user.email);
      console.log('Stripe customer:', customer); // Debug log

      // Create checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/campaigns/wizard/step-1?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
        metadata: {
          userId: session.user.sub, // Auth0 user ID
        },
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