'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PricingGrid from '@/components/billing/PricingGrid';
import FaqSection from '@/components/billing/FaqSection';
import { useUser } from '@clerk/nextjs';
import { loadStripe } from '@stripe/stripe-js'; // Still needed for redirect
import { Separator } from '@/components/ui/separator';
import { BillingSkeleton } from '@/components/ui/loading-skeleton';

// Load Stripe outside component render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BillingClientComponent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // --- FE-Return: Handle Redirect Back ---
  useEffect(() => {
    if (searchParams) {
      const checkoutStatus = searchParams.get('checkout'); // Using 'checkout' param now
      let message = null;
      if (checkoutStatus === 'success') {
        // Optionally retrieve session status via API for more details if needed
        message = 'Your payment/setup was successful!';
      } else if (checkoutStatus === 'cancel') {
        message = 'Checkout session cancelled.';
      }
      if (message) {
        setStatusMessage(message);
        // Optional: Clear URL params after reading them
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [searchParams]);
  // --- END FE-Return ---

  // --- FE-Redirect: Handle Button Click to Start Checkout ---
  const handleManageBillingClick = async () => {
    setIsRedirecting(true);
    setErrorMessage(null);
    setStatusMessage(null); // Clear previous status messages

    if (!isUserLoaded || !user?.id) {
      setErrorMessage('User not loaded or not logged in.');
      setIsRedirecting(false);
      return;
    }

    try {
      // 1. Call backend to create Checkout Session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Specify the mode: 'setup' for managing payment methods,
          // Or 'subscription'/'payment' with a priceId if upgrading/buying
          mode: 'setup',
          justifyUserId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const { sessionId } = await response.json();
      if (!sessionId) {
        throw new Error('Checkout Session ID not found in response.');
      }

      // 2. Initialize Stripe.js
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js failed to load.');
      }

      // 3. Redirect to Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      // This point is only reached if redirectToCheckout fails (e.g., network error)
      if (error) {
        console.error('Stripe redirectToCheckout error:', error);
        setErrorMessage(error.message || 'Failed to redirect to checkout.');
      }
      // Note: Successful redirect means the user leaves this page.
    } catch (error: unknown) {
      console.error('Error creating or redirecting to checkout:', error);
      setErrorMessage(
        error instanceof Error ? error.message : String(error) || 'Could not initiate checkout.'
      );
    } finally {
      setIsRedirecting(false); // Only reached on error
    }
  };
  // --- END FE-Redirect ---

  // Show loading skeleton while user data is loading
  if (!isUserLoaded) {
    return <BillingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {statusMessage && (
        <div
          className={`p-4 border rounded-md ${statusMessage.includes('success') ? 'border-green-300 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700'}`}
        >
          {statusMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-4 border rounded-md border-red-300 bg-red-50 text-red-700">
          Error: {errorMessage}
        </div>
      )}

      {/* Main Content with Tabs */}
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-2 h-auto bg-transparent p-0">
          {/* Reordered Tabs */}
          <TabsTrigger
            value="faq"
            className="w-full justify-start data-[state=active]:bg-muted data-[state=active]:shadow-sm data-[state=active]:border-accent data-[state=active]:border-b-2 rounded-none text-secondary hover:text-primary transition-colors duration-150 px-4 py-2 text-sm font-medium"
          >
            FAQ
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className="w-full justify-start data-[state=active]:bg-muted data-[state=active]:shadow-sm data-[state=active]:border-accent data-[state=active]:border-b-2 rounded-none text-secondary hover:text-primary transition-colors duration-150 px-4 py-2 text-sm font-medium"
          >
            Plans & Pricing
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="w-full justify-start data-[state=active]:bg-muted data-[state=active]:shadow-sm data-[state=active]:border-accent data-[state=active]:border-b-2 rounded-none text-secondary hover:text-primary transition-colors duration-150 px-4 py-2 text-sm font-medium"
          >
            Billing Portal
          </TabsTrigger>
        </TabsList>
        <Separator className="mb-6" /> {/* Reduced margin */}
        {/* CORRECTED Tab Contents Structure */}
        {/* Billing Portal Tab Content */}
        <TabsContent value="billing" className="p-6">
          <h2 className="text-3xl font-bold font-heading text-primary mb-2 text-center sm:text-left">
            Manage Billing
          </h2>
          <p className="text-secondary mb-4 text-center sm:text-left">
            Manage your current subscription and payment methods.
          </p>
          <Button onClick={handleManageBillingClick} disabled={isRedirecting || !isUserLoaded}>
            {isRedirecting ? 'Redirecting...' : 'Manage Billing / Payment Methods'}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Securely manage your subscription and payment details via Stripe.
          </p>
        </TabsContent>
        {/* Plans & Pricing Tab Content - Add padding */}
        <TabsContent value="plans" className="p-6">
          <PricingGrid />
        </TabsContent>
        {/* FAQ Tab Content */}
        <TabsContent value="faq" className="p-6">
          <h2 className="text-3xl font-bold font-heading text-primary mb-2 text-center sm:text-left">
            Frequently Asked Questions
          </h2>
          <p className="text-secondary mb-4 text-center sm:text-left">
            Find answers to common questions about billing, plans, and features.
          </p>
          <FaqSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
