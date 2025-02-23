'use client';

import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";

export default function Page() {
  const essentialPriceId = process.env.NEXT_PUBLIC_STRIPE_ESSENTIAL_PRICE_ID;
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID;
  const advancedPriceId = process.env.NEXT_PUBLIC_STRIPE_ADVANCED_PRICE_ID;

  const handleSubscribe = async (priceId: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode: 'subscription'
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Select the perfect plan for your business needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {/* Essential Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Essential</h3>
              <p className="mt-4 text-sm text-gray-500">Perfect for getting started with influencer marketing</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$9.99</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <button
                onClick={() => handleSubscribe(essentialPriceId!)}
                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
              >
                Subscribe to Essential
              </button>
            </div>
          </div>

          {/* Professional Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Professional</h3>
              <p className="mt-4 text-sm text-gray-500">For growing businesses scaling their influencer reach</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$29.99</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <button
                onClick={() => handleSubscribe(proPriceId!)}
                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
              >
                Subscribe to Professional
              </button>
            </div>
          </div>

          {/* Advanced Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Advanced</h3>
              <p className="mt-4 text-sm text-gray-500">For enterprises requiring maximum influencer impact</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$99.99</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <button
                onClick={() => handleSubscribe(advancedPriceId!)}
                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
              >
                Subscribe to Advanced
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 