import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const getStripeCustomer = async (email: string) => {
  const customers = await stripe.customers.list({ email });

  if (customers.data.length > 0) {
    // Return existing customer
    return customers.data[0];
  }

  // Create new customer
  return stripe.customers.create({ email });
};

export const createPaymentIntent = async ({
  amount,
  currency = 'usd',
  customerId,
}: {
  amount: number;
  currency?: string;
  customerId: string;
}) => {
  return stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    payment_method_types: ['card'],
  });
};

export const createSubscription = async ({
  customerId,
  priceId,
}: {
  customerId: string;
  priceId: string;
}) => {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
};

export const createCheckoutSession = async ({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  return stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}; 