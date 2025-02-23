import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { Analytics } from '@/lib/analytics/analytics';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function handleSubscriptionCreated(subscription: any) {
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  // Update user subscription status
  await prisma.user.update({
    where: {
      email: customer.email!,
    },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customer.id,
      subscriptionStatus: subscription.status,
    },
  });

  Analytics.track('Subscription_Created', {
    subscriptionId: subscription.id,
    customerId: customer.id,
    status: subscription.status,
  });
}

async function handleSubscriptionUpdated(subscription: any) {
  await prisma.user.update({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      subscriptionStatus: subscription.status,
    },
  });

  Analytics.track('Subscription_Updated', {
    subscriptionId: subscription.id,
    status: subscription.status,
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  await prisma.user.update({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: null,
    },
  });

  Analytics.track('Subscription_Deleted', {
    subscriptionId: subscription.id,
  });
}

export async function POST(req: Request) {
  try {
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      // Add more event handlers as needed
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 