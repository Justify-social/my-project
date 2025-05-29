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

// Check if Stripe publishable key is available
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Validate Stripe key format
const validateStripeKey = (key: string | undefined): { isValid: boolean; error?: string } => {
  if (!key) {
    return { isValid: false, error: 'No Stripe publishable key provided' };
  }

  if (!key.startsWith('pk_')) {
    return { isValid: false, error: 'Invalid Stripe key format - must start with pk_' };
  }

  if (key.startsWith('pk_test_') && key.length < 50) {
    return { isValid: false, error: 'Invalid Stripe test key - too short' };
  }

  if (key.startsWith('pk_live_') && key.length < 50) {
    return { isValid: false, error: 'Invalid Stripe live key - too short' };
  }

  return { isValid: true };
};

// Enhanced Stripe loading with comprehensive error handling
const loadStripeWithErrorHandling = async (key: string) => {
  try {
    console.log(
      '🔧 [Stripe Debug] Attempting to load Stripe with key:',
      key.substring(0, 15) + '...'
    );

    // Validate key format first
    const validation = validateStripeKey(key);
    if (!validation.isValid) {
      throw new Error(`Stripe key validation failed: ${validation.error}`);
    }

    // Test network connectivity to Stripe
    try {
      const response = await fetch('https://js.stripe.com/v3/', {
        method: 'HEAD',
        mode: 'no-cors', // Avoid CORS issues for connectivity test
      });
      console.log('🔧 [Stripe Debug] Network connectivity test completed');
    } catch (networkError) {
      console.warn('🔧 [Stripe Debug] Network connectivity issue:', networkError);
      throw new Error(
        'Unable to reach Stripe servers. Check your internet connection or firewall settings.'
      );
    }

    // Load Stripe with timeout
    const stripePromise = loadStripe(key);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Stripe loading timeout - check for ad blockers or network issues')),
        10000
      );
    });

    const stripe = await Promise.race([stripePromise, timeoutPromise]);

    if (!stripe) {
      throw new Error('Stripe failed to initialize - received null object');
    }

    console.log('✅ [Stripe Debug] Stripe loaded successfully');
    return stripe;
  } catch (error) {
    console.error('❌ [Stripe Debug] Failed to load Stripe:', error);
    throw error;
  }
};

// Load Stripe only if the key exists and is valid
let stripePromise: Promise<any> | null = null;
if (stripePublishableKey) {
  const validation = validateStripeKey(stripePublishableKey);
  if (validation.isValid) {
    stripePromise = loadStripeWithErrorHandling(stripePublishableKey);
  } else {
    console.error('❌ [Stripe Debug] Invalid key format:', validation.error);
  }
}

export default function BillingClientComponent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stripeLoadError, setStripeLoadError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Check for Stripe configuration on mount with detailed diagnostics
  useEffect(() => {
    const runStripeDiagnostics = async () => {
      console.log('🔧 [Stripe Diagnostics] Starting comprehensive check...');

      if (!stripePublishableKey) {
        console.warn(
          '❌ [Stripe Diagnostics] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured'
        );
        setStripeLoadError('Stripe publishable key not configured');
        return;
      }

      const validation = validateStripeKey(stripePublishableKey);
      if (!validation.isValid) {
        console.error('❌ [Stripe Diagnostics] Key validation failed:', validation.error);
        setStripeLoadError(`Invalid Stripe key: ${validation.error}`);
        return;
      }

      // Test Stripe loading
      if (stripePromise) {
        try {
          await stripePromise;
          console.log('✅ [Stripe Diagnostics] Stripe loaded successfully');
          setStripeLoadError(null);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('❌ [Stripe Diagnostics] Stripe loading failed:', errorMsg);
          setStripeLoadError(errorMsg);
        }
      }
    };

    runStripeDiagnostics();
  }, []);

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

    if (!stripePublishableKey) {
      setErrorMessage('Stripe is not configured. Please contact support for billing assistance.');
      setIsRedirecting(false);
      return;
    }

    if (stripeLoadError) {
      setErrorMessage(`Stripe loading failed: ${stripeLoadError}`);
      setIsRedirecting(false);
      return;
    }

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

      // 2. Initialize Stripe.js with enhanced error handling
      if (!stripePromise) {
        throw new Error('Stripe is not properly configured');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error(
          'Stripe.js failed to load. Please check your configuration and network connection.'
        );
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

  const isStripeConfigured = !!stripePublishableKey && !stripeLoadError;
  const keyValidation = validateStripeKey(stripePublishableKey);

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

      {/* Stripe Configuration Warning */}
      {!isStripeConfigured && (
        <div className="p-4 border rounded-md border-yellow-300 bg-yellow-50 text-yellow-700">
          <h4 className="font-semibold mb-2">Payment System Configuration</h4>
          {!stripePublishableKey ? (
            <p>
              Stripe payment processing is currently not configured. Contact your administrator to
              set up billing functionality.
            </p>
          ) : !keyValidation.isValid ? (
            <div>
              <p>Invalid Stripe configuration detected:</p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>{keyValidation.error}</li>
                <li>Current key format: {stripePublishableKey.substring(0, 15)}...</li>
              </ul>
            </div>
          ) : stripeLoadError ? (
            <div>
              <p>Stripe loading failed:</p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>{stripeLoadError}</li>
                <li>Check browser console for detailed diagnostics</li>
                <li>Possible causes: ad blockers, firewall, network connectivity</li>
              </ul>
            </div>
          ) : (
            <p>Payment processing is currently not available.</p>
          )}
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
          <h2 className="text-3xl font-bold text-primary mb-2 text-center sm:text-left">
            Manage Billing
          </h2>
          <p className="text-secondary mb-4 text-center sm:text-left">
            Manage your current subscription and payment methods.
          </p>
          <Button
            onClick={handleManageBillingClick}
            disabled={isRedirecting || !isUserLoaded || !isStripeConfigured}
          >
            {isRedirecting ? 'Redirecting...' : 'Manage Billing / Payment Methods'}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            {isStripeConfigured
              ? 'Securely manage your subscription and payment details via Stripe.'
              : 'Payment processing is currently not available.'}
          </p>
        </TabsContent>
        {/* Plans & Pricing Tab Content - Add padding */}
        <TabsContent value="plans" className="p-6">
          <PricingGrid />
        </TabsContent>
        {/* FAQ Tab Content */}
        <TabsContent value="faq" className="p-6">
          <h2 className="text-3xl font-bold text-primary mb-2 text-center sm:text-left">
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
