'use client'; // Required if using hooks like useState, useEffect

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions, StripeError } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button'; // Import Button

// Ensure this key is accessed correctly from your environment variables
// Note: Keys starting with NEXT_PUBLIC_ are exposed to the browser.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// PaymentForm component now uses Stripe hooks
const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // --- Implement Task FE-5 (and incorporating FE-7) ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      console.log('Stripe.js not loaded yet.');
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    // --- FE-7 / FE-8 Needs Resolution ---
    console.warn('TODO: Resolve FE-7 Stripe confirmation call and type handling.');
    setMessage('Confirmation logic needs fix (See console warning).');
    /* 
        try {
            // --- Implement FE-7 --- 
            const result = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    // Make sure to change this to your payment completion page/state
                    // Using query params on the same page for this example
                    return_url: `${window.location.origin}/account/billing?setup_status=complete`,
                },
                // redirect: 'if_required' // Optional: Only redirect if necessary
            });

            // --- Part of FE-8: Handle immediate errors or success --- 
            if (result.error) {
                // Error occurred during confirmation. 
                // result is type { error: StripeError }
                console.error("Stripe confirmSetup error:", result.error);
                setMessage(result.error.message || 'An unexpected error occurred.');
            } else {
                // No error: confirmSetup successful OR redirect initiated.
                // If no error, result is type { setupIntent: SetupIntent }
                // The setupIntent object is guaranteed to be present if there's no error.
                console.log("SetupIntent details:", result.setupIntent);
                if (result.setupIntent.status === 'succeeded') {
                    setMessage('Card saved successfully!');
                    // TODO: Update UI, maybe clear form or show saved card list
                } else if (result.setupIntent.status === 'processing') {
                    setMessage('Processing payment details...');
                    // Handle processing state if needed - user might need to wait briefly
                } else if (result.setupIntent.status === 'requires_action' || result.setupIntent.status === 'requires_confirmation') {
                    // This usually implies a redirect happened or is needed, 
                    // but confirmSetup might resolve here if redirect: 'if_required' isn't used or doesn't trigger.
                    setMessage('Further action required to save card.');
                } else {
                    // Handle other unexpected statuses if necessary
                    setMessage(`SetupIntent status: ${result.setupIntent.status}`);
                }
            }
            // --- End FE-8 part ---

        } catch (e) {
            // Catch any other unexpected errors during the API call itself
            console.error("Unexpected error during confirmSetup call:", e);
            setMessage('An unexpected error occurred while confirming setup.');
        } 
        */
    // --- END FE-7 Needs Resolution ---

    // Simulate processing time for now
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsProcessing(false);
  };
  // --- END Task FE-5/FE-7 ---

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      <Button className="mt-4" type="submit" disabled={!stripe || !elements || isProcessing}>
        {isProcessing ? 'Processing...' : 'Save Card / Pay Now (Placeholder)'}
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

export default function StripeElementWrapper() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true); // State to track loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for errors

  // --- Implement Task FE-6 ---
  useEffect(() => {
    // This function fetches the intent secret from the backend
    // In a real app, you might trigger this based on user action (e.g., clicking checkout)
    // or on component mount if the intent is always needed immediately.
    // You also need to decide if it's a 'payment' or 'setup' intent.
    const createIntent = async () => {
      setLoadingIntent(true);
      setErrorMessage(null);
      try {
        // Example: Always creating a SetupIntent when the component loads
        // Adjust intentType and body based on your actual requirements (e.g., pass amount for PaymentIntent)
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intentType: 'setup', // Change to 'payment' and add 'amount' if needed
            // Pass justifyUserId from auth context if available
            // justifyUserId: 'user_123',
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
      } catch (error: any) {
        console.error('Error fetching client secret:', error);
        setErrorMessage(error.message || 'Failed to initialize payment.');
      } finally {
        setLoadingIntent(false);
      }
    };

    createIntent();
  }, []); // Empty dependency array means this runs once on mount
  // --- END Task FE-6 ---

  // Define appearance based on SPIKE-1 research (using basic values for now)
  const appearance: StripeElementsOptions['appearance'] = {
    theme: 'flat', // Start with flat theme
    variables: {
      // Map colors from globals.css here
      colorPrimary: '#3182CE', // Example: Medium Blue
      colorBackground: '#FFFFFF', // Example: White
      colorText: '#333333', // Example: Jet
      colorDanger: '#E53E3E', // Example: Red
      fontFamily: 'Ideal Sans, system-ui, sans-serif', // Use your app's font
      spacingUnit: '4px', // Base spacing unit
      borderRadius: '4px', // Standard border radius
      // ... other variables as needed
    },
    // Add specific rules if needed
    // rules: {
    //   '.Input': {
    //     borderColor: '#D1D5DB', // Example: French Grey
    //   }
    // }
  };

  // Options depend on clientSecret being available
  const options: StripeElementsOptions | null = clientSecret
    ? {
        clientSecret,
        appearance,
      }
    : null;

  return (
    <div>
      {loadingIntent && <p>Initializing Payment Setup...</p>}
      {errorMessage && <p className="text-sm text-red-700">Error: {errorMessage}</p>}

      {stripePromise && options && (
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm />
        </Elements>
      )}

      {!stripePromise && !errorMessage && <p>Loading Stripe...</p>}
    </div>
  );
}
