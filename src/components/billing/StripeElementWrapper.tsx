'use client';

import React, { useState, useEffect } from 'react';
import {
  loadStripe,
  Appearance,
  StripeElementsOptions,
  SetupIntentResult,
  SetupIntent,
} from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- Type Predicate for Result ---
function isStripeSetupIntentResult(
  result: SetupIntentResult
): result is { setupIntent: SetupIntent } {
  // If error is not present, it must be the success type with setupIntent
  return result.error == null;
}

// PaymentForm component
const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/account/billing?setup_status=complete`,
        },
        redirect: 'if_required',
      });

      // --- Use Type Predicate ---
      if (isStripeSetupIntentResult(result)) {
        // Type is narrowed to { setupIntent: SetupIntent }
        // console.log('Stripe confirmSetup successful. Intent:', result.setupIntent);
        switch (result.setupIntent.status) {
          case 'succeeded':
            setMessage('Card saved successfully!');
            break;
          case 'processing':
            setMessage('Processing payment details...');
            break;
          case 'requires_payment_method':
            setMessage('Failed to save card. Please try a different payment method.');
            break;
          case 'requires_action':
            setMessage('Further action is required...');
            break;
          case 'requires_confirmation':
            setMessage('Card requires confirmation.');
            break;
          default:
            setMessage('Something went wrong processing your card.');
            break;
        }
      } else {
        // Type is narrowed to { error: StripeError }
        console.error('Stripe confirmSetup error:', result.error);
        setMessage(result.error.message || 'An unexpected error occurred.');
      }
      // --- End Type Predicate Usage ---
    } catch (e) {
      console.error('Unexpected error during confirmSetup call:', e);
      setMessage('An unexpected error occurred while confirming setup.');
    }

    setIsProcessing(false);
  };

  // ... rest of PaymentForm return ...
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      <Button className="mt-4" type="submit" disabled={!stripe || !elements || isProcessing}>
        {isProcessing ? 'Processing...' : 'Save Card (Test)'}
      </Button>
      {message && (
        <div
          id="payment-message"
          className={`mt-4 text-sm ${message.includes('success') ? 'text-green-700' : 'text-red-700'}`}
        >
          {message}
        </div>
      )}
    </form>
  );
};

// ... StripeElementWrapper component remains the same ...
export default function StripeElementWrapper() {
  // ... state and useEffect ...
  const { user, isLoaded: isUserLoaded } = useUser();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingClientSecret, setLoadingClientSecret] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoaded && user?.id) {
      const createIntent = async () => {
        setLoadingClientSecret(true);
        setErrorMessage(null);
        try {
          const response = await fetch('/api/payments/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              intentType: 'setup',
              justifyUserId: user.id,
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
          }
          const data = await response.json();
          if (!data.clientSecret) {
            throw new Error('Client secret not found in response.');
          }
          setClientSecret(data.clientSecret);
        } catch (error: unknown) {
          console.error('Error fetching client secret:', error);
          setErrorMessage((error as Error).message || 'Failed to initialize payment.');
        } finally {
          setLoadingClientSecret(false);
        }
      };
      createIntent();
    } else if (isUserLoaded && !user) {
      setErrorMessage('You must be logged in to manage payment methods.');
      setLoadingClientSecret(false);
    }
  }, [isUserLoaded, user]);

  const appearance: StripeElementsOptions['appearance'] = {
    theme: 'flat',
    variables: {
      colorPrimary: '#3182CE',
      colorBackground: '#FFFFFF',
      colorText: '#333333',
      colorDanger: '#E53E3E',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
    },
  };

  const options: StripeElementsOptions | null = clientSecret
    ? {
        clientSecret,
        appearance,
      }
    : null;

  const isLoading = !isUserLoaded || loadingClientSecret;

  return (
    <div>
      {isLoading && <p>Initializing Payment Setup...</p>}
      {!isLoading && errorMessage && <p className="text-sm text-red-700">Error: {errorMessage}</p>}

      {stripePromise && options && isUserLoaded && user && !errorMessage && (
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm />
        </Elements>
      )}

      {!stripePromise && !errorMessage && <p>Loading Stripe...</p>}
    </div>
  );
}
