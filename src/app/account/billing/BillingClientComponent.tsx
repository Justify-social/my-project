'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
// Import shadcn UI components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// Import custom components
import StripeElementWrapper from '@/components/billing/StripeElementWrapper';
import PricingInfoSection from '@/components/billing/PricingInfoSection';

export default function BillingClientComponent() {
  const [showPricing, setShowPricing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      const setupStatus = searchParams.get('setup_status');
      const paymentStatus = searchParams.get('payment_status');
      let message = null;
      if (setupStatus === 'complete') {
        message = 'Card details saved successfully!';
      } else if (setupStatus === 'failed') {
        message = 'Failed to save card details. Please try again.';
      } else if (paymentStatus === 'complete') {
        message = 'Payment successful!';
      } else if (paymentStatus === 'failed') {
        message = 'Payment failed. Please try again.';
      }
      if (message) {
        setStatusMessage(message);
        // Optional: Clear URL params after reading them
        // window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [searchParams]);

  const handleTogglePricing = () => {
    setShowPricing(prev => !prev);
  };

  return (
    <div className="space-y-6">
      {/* Display status message from return URL */}
      {statusMessage && (
        <div
          className={`p-4 border rounded-md ${
            statusMessage.includes('success')
              ? 'border-green-300 bg-green-50 text-green-700'
              : 'border-red-300 bg-red-50 text-red-700'
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Payment Methods Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          {/* Optional: Add CardDescription here */}
        </CardHeader>
        <CardContent>
          <StripeElementWrapper />
        </CardContent>
      </Card>

      <Separator />

      {/* Pricing Section Card */}
      <Card>
        <CardHeader>
          <CardTitle>Plans & Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleTogglePricing}>
            {/* TODO: Add icons from icon system if desired */}
            {showPricing ? 'Hide Pricing Plans' : 'View Pricing Plans'}
          </Button>

          {/* Conditionally rendered Pricing Info */}
          {showPricing && <PricingInfoSection />}
        </CardContent>
      </Card>
    </div>
  );
}
