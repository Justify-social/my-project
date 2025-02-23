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

    setStripeInfo({
      hasStripePubKey: !!stripePubKey,
      stripePubKeyPrefix: stripePubKey?.substring(0, 8),
      hasEssentialPrice: !!essentialPriceId,
      essentialPricePrefix: essentialPriceId?.substring(0, 8),
      hasProPrice: !!proPriceId,
      proPricePrefix: proPriceId?.substring(0, 8),
      hasAdvancedPrice: !!advancedPriceId,
      advancedPricePrefix: advancedPriceId?.substring(0, 8),
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