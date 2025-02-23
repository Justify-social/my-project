'use client';

import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";

export default function Page() {
  const [pageUrl, setPageUrl] = useState<string>('');
  const [pagePath, setPagePath] = useState<string>('');
  const [stripeInfo, setStripeInfo] = useState<any>(null);

  useEffect(() => {
    console.log('Pricing page rendering');
    setPageUrl(window.location.href);
    setPagePath(window.location.pathname);

    // Debug Stripe environment
    const stripePubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const essentialPriceId = process.env.NEXT_PUBLIC_STRIPE_ESSENTIAL_PRICE_ID;
    const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID;
    const advancedPriceId = process.env.NEXT_PUBLIC_STRIPE_ADVANCED_PRICE_ID;

    console.log('Stripe Configuration:', {
      pubKey: stripePubKey,
      essential: essentialPriceId,
      pro: proPriceId,
      advanced: advancedPriceId
    });

    setStripeInfo({
      stripePubKey: {
        exists: !!stripePubKey,
        value: stripePubKey,
        isTestMode: stripePubKey?.startsWith('pk_test_')
      },
      prices: {
        essential: {
          exists: !!essentialPriceId,
          value: essentialPriceId,
          isTestMode: essentialPriceId?.startsWith('price_test_')
        },
        professional: {
          exists: !!proPriceId,
          value: proPriceId,
          isTestMode: proPriceId?.startsWith('price_test_')
        },
        advanced: {
          exists: !!advancedPriceId,
          value: advancedPriceId,
          isTestMode: advancedPriceId?.startsWith('price_test_')
        }
      }
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold">Pricing Page Test</h1>
              <p>If you can see this, the route is working!</p>
              <div className="mt-4 p-4 bg-red-100 rounded">
                <p className="font-bold text-red-600">⚠️ Mode Mismatch Warning</p>
                <p>Your price IDs are in live mode but should be in test mode for development.</p>
                <p>Please create test mode products in Stripe and update the environment variables.</p>
              </div>
              {pageUrl && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <p className="font-bold">Debug Info:</p>
                  <p>Current URL: {pageUrl}</p>
                  <p>Pathname: {pagePath}</p>
                  
                  {stripeInfo && (
                    <div className="mt-4">
                      <p className="font-bold">Stripe Configuration:</p>
                      <pre className="bg-gray-200 p-2 mt-2 rounded text-xs overflow-auto">
                        {JSON.stringify(stripeInfo, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
} 