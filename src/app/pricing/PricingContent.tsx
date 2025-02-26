"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useUser } from '@auth0/nextjs-auth0/client';
import { toast } from "react-hot-toast";
import Link from "next/link";

const tiers = [
  {
    name: "Essential",
    id: "essential",
    priceId: process.env.NEXT_PUBLIC_STRIPE_ESSENTIAL_PRICE_ID,
    price: "499",
    description: "Perfect for small influencer campaigns",
    features: [
      "Single platform campaign",
      "Basic audience targeting",
      "Up to 3 creative assets",
      "Standard analytics",
      "Email support"
    ],
  },
  {
    name: "Professional",
    id: "professional",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID,
    price: "999",
    description: "Ideal for growing brands",
    features: [
      "Multi-platform campaigns",
      "Advanced audience targeting",
      "Up to 10 creative assets",
      "Advanced analytics",
      "Priority support",
      "Campaign optimization",
    ],
  },
  {
    name: "Advanced",
    id: "advanced",
    priceId: process.env.NEXT_PUBLIC_STRIPE_ADVANCED_PRICE_ID,
    price: "1999",
    description: "For large-scale campaigns",
    features: [
      "Custom campaign strategy",
      "Premium influencer access",
      "Unlimited creative assets",
      "Real-time analytics",
      "Dedicated account manager",
      "Custom integrations",
      "24/7 support",
    ],
  },
];

export default function PricingContent() {
  const router = useRouter();
  const { user, error, isLoading: userLoading } = useUser();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePriceClick = async (priceId: string) => {
    try {
      setIsLoading(true);
      setSelectedTier(priceId);

      if (!user) {
        // Save selected plan to localStorage and redirect to sign in
        localStorage.setItem("selectedPriceId", priceId);
        router.push("/api/auth/login");
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to start checkout process");
    } finally {
      setIsLoading(false);
      setSelectedTier(null);
    }
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-base font-semibold leading-7 text-[var(--accent-color)]">
            Pricing
          </h1>
          <p className="mt-2 text-4xl font-bold tracking-tight text-[var(--primary-color)] sm:text-5xl">
            Choose your campaign package
          </p>
          <p className="mt-6 text-lg leading-8 text-[var(--secondary-color)]">
            Select the perfect plan for your influencer marketing needs
          </p>
        </div>

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-[var(--divider-color)] xl:p-10 ${
                tier.id === "professional" ? "lg:z-10 lg:rounded-b-none" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h2 className="text-lg font-semibold leading-8 text-[var(--primary-color)]">
                    {tier.name}
                  </h2>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--secondary-color)]">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  {tier.price === "Custom" ? (
                    <span className="text-4xl font-bold tracking-tight text-[var(--primary-color)]">
                      Custom
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold tracking-tight text-[var(--primary-color)]">
                        ${tier.price}
                      </span>
                      <span className="text-sm font-semibold leading-6 text-[var(--secondary-color)]">
                        /campaign
                      </span>
                    </>
                  )}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-[var(--secondary-color)]">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon
                        className="h-6 w-5 flex-none text-[var(--accent-color)]"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePriceClick(tier.priceId!)}
                disabled={isLoading && selectedTier === tier.priceId}
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
                  ${
                    tier.id === "professional"
                      ? "bg-[var(--accent-color)] text-white shadow-sm hover:opacity-90 focus-visible:outline-[var(--accent-color)]"
                      : "bg-[var(--background-color)] text-[var(--accent-color)] hover:bg-opacity-80"
                  }
                  ${isLoading && selectedTier === tier.priceId ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isLoading && selectedTier === tier.priceId
                  ? "Processing..."
                  : tier.price === "Custom"
                  ? "Contact Sales"
                  : "Get Started"}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Link to Billing Page */}
        <div className="mt-16 text-center">
          <p className="text-[var(--secondary-color)] mb-4">
            Already subscribed to a plan?
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center rounded-md bg-[var(--accent-color)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            View your subscription & billing
          </Link>
        </div>
      </div>
    </div>
  );
} 