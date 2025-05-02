'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PricingInfoSection from '@/components/billing/PricingInfoSection';
import { useUser } from '@clerk/nextjs';
import { loadStripe } from '@stripe/stripe-js'; // Still needed for redirect

// Load Stripe outside component render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BillingClientComponent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [showPricing, setShowPricing] = useState(false);
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

  const handleTogglePricing = () => {
    setShowPricing(prev => !prev);
  };

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
    } catch (error: any) {
      console.error('Error creating or redirecting to checkout:', error);
      setErrorMessage(error.message || 'Could not initiate checkout.');
    } finally {
      setIsRedirecting(false); // Only reached on error
    }
  };
  // --- END FE-Redirect ---

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

      {/* Manage Billing Button */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Portal</CardTitle>
          {/* Optional: Display current plan/status here fetched from DB */}
        </CardHeader>
        <CardContent>
          {/* UI-1 / FE-Redirect Button */}
          <Button onClick={handleManageBillingClick} disabled={isRedirecting || !isUserLoaded}>
            {isRedirecting ? 'Redirecting...' : 'Manage Billing / Payment Methods'}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Securely manage your subscription and payment details via Stripe.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Pricing Section Card (Optional - can be kept or removed) */}
      <Card>
        <CardHeader>
          <CardTitle>Plans & Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleTogglePricing}>
            {showPricing ? 'Hide Pricing Plans' : 'View Pricing Plans'}
          </Button>
          {showPricing && <PricingInfoSection />}
        </CardContent>
      </Card>
    </div>
  );
}
