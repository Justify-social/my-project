"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckIcon, XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useUser } from '@auth0/nextjs-auth0/client';
import { toast } from "react-hot-toast";
import Link from "next/link";

// Define feature structure
interface FeatureInfo {
  description: string;
  features: Record<string, string>;
}

type FeatureDefinitions = {
  [category: string]: FeatureInfo;
};

// Feature definitions
const featureDefinitions: FeatureDefinitions = {
  "Platforms": {
    description: "Social media platforms where your campaigns can be launched and managed",
    features: {
      "Instagram": "Run campaigns on Instagram with our platform",
      "TikTok": "Launch and manage TikTok influencer campaigns",
      "YouTube": "Create video campaigns with YouTube creators",
      "Facebook": "Run campaigns with Facebook creators and groups",
      "LinkedIn": "Professional B2B influencer marketing on LinkedIn"
    }
  },
  "Audience Targeting": {
    description: "Tools to help you reach the right audience for your campaigns",
    features: {
      "Demographic Targeting": "Target by age, location, gender, and other demographics",
      "Interest-Based Targeting": "Find influencers whose audiences match specific interests",
      "Lookalike Audiences": "Target audiences similar to your existing customers",
      "Custom Audience Creation": "Build and save custom audience profiles for campaigns"
    }
  },
  "Creative Assets": {
    description: "Content creation and management tools",
    features: {
      "Content Library": "Store and organize approved campaign content",
      "Content Review Tools": "Tools for reviewing and approving influencer content",
      "Branded Templates": "Create branded templates for consistent campaigns",
      "AI Asset Generation": "Use AI to assist in creating campaign assets"
    }
  },
  "Analytics": {
    description: "Campaign performance tracking and reporting tools",
    features: {
      "Real-Time Reporting": "Access campaign metrics as they happen",
      "Engagement Analytics": "Detailed metrics on audience engagement",
      "Conversion Tracking": "Monitor conversions from your campaigns",
      "ROI Calculation": "Automatic calculation of campaign ROI",
      "Custom Reports": "Create and save custom reporting dashboards"
    }
  },
  "Support": {
    description: "Customer support and assistance options",
    features: {
      "Onboarding Support": "Get help setting up your account and first campaigns",
      "Technical Support": "Access to technical support for platform issues",
      "Account Management": "Dedicated account manager for your brand",
      "Response Time": "Guaranteed response times for support requests"
    }
  },
  "Studies / Month": {
    description: "Number of detailed campaign studies included in your plan",
    features: {
      "Campaign Studies": "In-depth analysis and insights from your campaigns"
    }
  },
  "Additional Services": {
    description: "Extra services beyond the core platform features",
    features: {
      "Strategy Consultation": "Expert guidance on influencer marketing strategy",
      "Creator Negotiation": "Assistance with negotiating terms with creators",
      "Content Production": "Professional content production services",
      "Campaign Management": "Full-service campaign management by our team"
    }
  }
};

type FeatureCategory = keyof typeof featureDefinitions;

// Define which features to highlight for each tier
const featureHighlights: Record<string, FeatureCategory[]> = {
  "pay-as-you-go": ["Analytics", "Support"],
  "essential": ["Platforms", "Analytics"],
  "professional": ["Audience Targeting", "Analytics", "Support"],
  "advanced": ["Creative Assets", "Analytics", "Support", "Additional Services"]
};

// Define tier type with typed features
interface Tier {
  name: string;
  id: string;
  priceId: string;
  price: string;
  popular: boolean;
  description: string;
  features: Record<FeatureCategory, string | number | boolean>;
  tooltip?: string;
}

// Updated tiers with more structured feature information
const tiers: Tier[] = [
  {
    name: "Pay-As-You-Go",
    id: "pay-as-you-go",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PAYG_PRICE_ID || "",
    price: "2,499",
    popular: false,
    description: "For occasional campaign needs",
    tooltip: "Perfect for brands looking for one-time campaign analysis without a monthly commitment",
    features: {
      "Studies / Month": "N/A",
      "Creative Testing": true,
      "Brand Lift": true,
      "Influencer Safety": false,
      "Brand Health": false,
      "MMM Analysis": false,
      "Support": "Email"
    }
  },
  {
    name: "Essential",
    id: "essential",
    priceId: process.env.NEXT_PUBLIC_STRIPE_ESSENTIAL_PRICE_ID || "",
    price: "1,999",
    popular: false,
    description: "Basic package for small teams",
    tooltip: "Our starter package with core features for brands beginning to scale their marketing efforts",
    features: {
      "Studies / Month": 1,
      "Creative Testing": true,
      "Brand Lift": true,
      "Influencer Safety": true,
      "Brand Health": false,
      "MMM Analysis": false,
      "Support": "Email"
    }
  },
  {
    name: "Professional",
    id: "professional",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || "",
    price: "5,999",
    popular: true,
    description: "Ideal for growing brands",
    tooltip: "Our most popular plan with advanced features and priority support",
    features: {
      "Studies / Month": 3,
      "Creative Testing": true,
      "Brand Lift": true,
      "Influencer Safety": true,
      "Brand Health": true,
      "MMM Analysis": false,
      "Support": "Email, Phone"
    }
  },
  {
    name: "Advanced",
    id: "advanced",
    priceId: process.env.NEXT_PUBLIC_STRIPE_ADVANCED_PRICE_ID || "",
    price: "10,999",
    popular: false,
    description: "Complete solution for enterprises",
    tooltip: "Enterprise-grade solution with all features and dedicated support for maximum marketing effectiveness",
    features: {
      "Studies / Month": 6,
      "Creative Testing": true,
      "Brand Lift": true,
      "Influencer Safety": true,
      "Brand Health": true,
      "MMM Analysis": true,
      "Support": "Full Support"
    }
  },
];

// Feature categories in the order they should appear in the table
const featureCategories: FeatureCategory[] = [
  "Studies / Month",
  "Creative Testing",
  "Brand Lift",
  "Influencer Safety",
  "Brand Health",
  "MMM Analysis",
  "Support"
];

// Tooltips for features
const featureTooltips: Record<string, string> = {
  "Studies / Month": "Number of campaign studies included per month with detailed insights and analytics",
  "Creative Testing": "Test different creative approaches to identify top-performing content variations",
  "Brand Lift": "Measure increase in brand awareness, consideration, and perception metrics",
  "Influencer Safety": "Advanced verification tools to ensure influencers align with brand values and safety standards",
  "Brand Health": "Comprehensive monitoring of overall brand perception, sentiment, and competitive positioning",
  "MMM Analysis": "Marketing Mix Modeling analysis to optimize budget allocation across channels",
  "Support": "Technical and strategic support channels available with your plan"
};

// Tooltips for specific feature values
const featureValueTooltips: Record<string, Record<string, string>> = {
  "Support": {
    "Email": "Standard email support with 24-48 hour response time",
    "Email, Phone": "Priority email support plus phone consultations during business hours",
    "Full Support": "24/7 dedicated support team with a named account manager"
  },
  "Studies / Month": {
    "1": "One in-depth campaign study per month",
    "3": "Three comprehensive campaign studies per month",
    "6": "Six detailed campaign studies per month",
    "N/A": "Pay per study, no monthly minimum"
  }
};

// Function to render feature value with tooltips
const renderFeatureValue = (category: FeatureCategory, value: string | number | boolean, tierName: string) => {
  // Convert the value to string for lookup in the tooltip object
  const valueKey = String(value);
  
  // Get tooltip for this specific feature value
  const tooltipText = 
    featureValueTooltips[category] && featureValueTooltips[category][valueKey]
      ? featureValueTooltips[category][valueKey]
      : null;

  // Check if this is a highlighted feature for this tier
  const isHighlightedFeature = 
    featureHighlights[tierName] && 
    featureHighlights[tierName].includes(category);
  
  if (typeof value === 'boolean') {
    return (
      <div className="flex justify-center">
        {value ? (
          <div className="relative group">
            <div className="flex items-center justify-center">
              <CheckIcon className="h-6 w-6 text-[var(--accent-color)] mx-auto" />
              {isHighlightedFeature && (
                <SparklesIcon className="h-4 w-4 text-[var(--accent-color)] absolute -top-1 -right-1" />
              )}
            </div>
            {tooltipText && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 z-50 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 w-48 font-normal shadow-lg">
                {tooltipText}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative group">
            <XMarkIcon className="h-6 w-6 text-gray-400 mx-auto" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 z-50 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 w-48 font-normal shadow-lg">
              Not included in this plan
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="relative group">
      <div className="flex items-center justify-center">
        <span>{value}</span>
        {isHighlightedFeature && (
          <SparklesIcon className="h-4 w-4 text-[var(--accent-color)] ml-1" />
        )}
      </div>
      {tooltipText && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 z-50 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 w-48 font-normal shadow-lg">
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
        </div>
      )}
    </div>
  );
};

export default function PricingContent() {
  const router = useRouter();
  const { user, error, isLoading: userLoading } = useUser();
  const [selectedTier, setSelectedTier] = useState<string>("professional");
  const [selectedMobileTier, setSelectedMobileTier] = useState<string>("professional");
  const [isLoading, setIsLoading] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<string>("essential");
  
  // Create refs for scrolling to sections
  const pricingRef = useRef<HTMLDivElement>(null);
  const whyJustifyRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll to section
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const yOffset = -20; 
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  const handleCheckout = async (tier: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setSelectedTier(tier);

    if (!user) {
      // Save selected plan to localStorage and redirect to sign in
      localStorage.setItem("selectedPriceId", tier);
      router.push("/api/auth/login");
      return;
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId: tier,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    // Redirect to Stripe Checkout
    window.location.href = data.url;
  };

  return (
    <div className="pt-8 pb-16 sm:pt-12 sm:pb-16 lg:pt-12 lg:pb-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      {/* Mini Navigation Bar */}
      <div className="sticky top-20 z-10 bg-white py-3 border-b border-gray-200 mb-8">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm">
          <button 
            onClick={() => scrollToSection(pricingRef)}
            className="font-medium text-gray-600 hover:text-[var(--accent-color)] transition-colors"
          >
            Pricing
          </button>
          <button 
            onClick={() => scrollToSection(whyJustifyRef)}
            className="font-medium text-gray-600 hover:text-[var(--accent-color)] transition-colors"
          >
            Why Justify?
          </button>
          <button 
            onClick={() => scrollToSection(faqRef)}
            className="font-medium text-gray-600 hover:text-[var(--accent-color)] transition-colors"
          >
            FAQ
          </button>
          <Link 
            href="https://www.justify.social/case-study" 
            target="_blank"
            className="font-medium text-gray-600 hover:text-[var(--accent-color)] transition-colors"
          >
            Case Study →
          </Link>
        </div>
      </div>

      {/* Pricing Header */}
      <div ref={pricingRef} className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-sora mb-4">Choose the Right Plan for Your Business</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          Transparent pricing options designed to scale with your marketing needs.
        </p>
      </div>

      {/* Comparison Legend */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8">
        <div className="flex items-center gap-2">
          <div className="relative group">
            <InformationCircleIcon className="h-5 w-5 text-gray-500" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 z-50 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 w-48 font-normal shadow-lg">
              Hover for more details
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
            </div>
          </div>
          <span className="text-sm text-gray-600">Hover for details</span>
        </div>
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-[var(--accent-color)]" />
          <span className="text-sm text-gray-600">Key feature</span>
        </div>
        <div className="flex items-center gap-2">
          <XMarkIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">Not included</span>
        </div>
      </div>

      {/* Mobile Plan Selection Tabs - Visible on small screens only */}
      <div className="md:hidden mb-6 px-1">
        <div className="flex rounded-md shadow-sm overflow-x-auto">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setActiveMobileTab(tier.id)}
              className={`relative flex-1 min-w-[120px] py-2 text-sm font-medium ${
                activeMobileTab === tier.id 
                  ? 'bg-[var(--accent-color)] text-white' 
                  : 'bg-white text-[var(--primary-color)] hover:bg-gray-50'
              } border border-[var(--divider-color)] ${
                tier.id === "pay-as-you-go" ? "rounded-l-md" : ""
              } ${
                tier.id === "advanced" ? "rounded-r-md" : ""
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 inset-x-0 flex justify-center" style={{ zIndex: 5 }}>
                  <span className="inline-flex items-center rounded-full bg-[var(--accent-color)] px-1.5 py-0.5 text-xs font-medium text-white">
                    Popular
                  </span>
                </span>
              )}
              {tier.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Plan Card - Visible on small screens only */}
      <div className="md:hidden mb-8">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            className={`${activeMobileTab === tier.id ? 'block' : 'hidden'} bg-white rounded-lg shadow-md border border-[var(--divider-color)] p-6`}
          >
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <h3 className="text-xl font-bold text-[var(--primary-color)] font-sora">{tier.name}</h3>
                {tier.tooltip && (
                  <div className="absolute top-0 -right-6 group">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                    <div className="absolute bottom-full right-0 transform -translate-y-2 z-50 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 w-56 font-normal shadow-lg">
                      {tier.tooltip}
                      <div className="absolute top-full right-1 transform border-4 border-transparent border-t-black"></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 flex justify-center items-baseline">
                <span className="text-2xl sm:text-3xl font-light tracking-tight text-[var(--primary-color)] font-['Work_Sans']">£{tier.price}</span>
                <span className="ml-1 text-sm font-medium text-[var(--secondary-color)]">/month</span>
              </div>
              <p className="mt-2 text-sm text-[var(--secondary-color)]">{tier.description}</p>
            </div>
            
            <div className="space-y-4">
              {featureCategories.map((category) => (
                <div key={category} className="flex justify-between pb-2 border-b border-gray-100">
                  <div className="font-medium text-[var(--primary-color)] flex items-center">
                    <span className="font-sora">{category}</span>
                    {featureDefinitions[category] && (
                      <div className="relative ml-1 group cursor-help">
                        <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                        <div className="absolute bottom-full left-0 transform -translate-y-2 z-50 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 w-56 font-normal shadow-lg">
                          {featureDefinitions[category].description}
                          <div className="absolute top-full left-4 transform border-4 border-transparent border-t-black"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-[var(--secondary-color)]">
                    {renderFeatureValue(category, tier.features[category] ?? false, tier.id)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <button
                onClick={() => handleCheckout(tier.priceId)}
                disabled={isLoading && selectedTier === tier.priceId}
                className={`w-full rounded-md py-3 px-4 text-center text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
                  ${
                    tier.popular
                      ? "bg-[var(--accent-color)] text-white hover:opacity-90 focus-visible:outline-[var(--accent-color)]"
                      : "bg-white border border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-gray-50"
                  }
                  ${isLoading && selectedTier === tier.priceId ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isLoading && selectedTier === tier.priceId ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span>Get Started</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Pricing Table */}
      <div className="hidden md:block overflow-x-auto pb-2">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-4 bg-gray-50 rounded-tl-lg w-1/4">
                <span className="font-sora text-sm sm:text-base lg:text-lg">Plan / Month</span>
              </th>
              {tiers.map((tier) => (
                <th key={tier.id} className={`p-4 w-1/4 ${tier.id === "professional" ? "bg-blue-50" : "bg-gray-50"} ${tier.id === "advanced" ? "rounded-tr-lg" : ""}`}>
                  <div className="text-center relative">
                    {tier.popular && (
                      <div className="inline-block px-3 py-1 text-xs font-medium text-[var(--accent-color)] bg-[var(--accent-color-light)] rounded-full mb-2" style={{ zIndex: 5 }}>
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 font-sora">{tier.name}</h3>
                    <div className="mt-2">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-900 font-['Work_Sans']">£{tier.price}</span>
                      <span className="text-xs sm:text-sm text-gray-500 ml-1 font-normal">GBP</span>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-gray-500 h-12 lg:h-auto">{tier.description}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Feature Categories */}
            {Object.keys(featureDefinitions).map((category) => (
              <React.Fragment key={category}>
                <tr className="bg-gray-50">
                  <th colSpan={5} className="text-left px-4 py-3 font-medium text-gray-800">
                    <div className="flex items-center">
                      <span className="font-sora">{category}</span>
                      <div className="relative ml-2 group">
                        <InformationCircleIcon className="h-5 w-5 text-gray-400" />
                        <div className="absolute bottom-full left-0 transform -translate-y-2 z-10 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 w-60 font-normal shadow-lg">
                          {featureDefinitions[category].description}
                          <div className="absolute top-full left-4 transform border-4 border-transparent border-t-black"></div>
                        </div>
                      </div>
                    </div>
                  </th>
                </tr>
                {/* Features within this category */}
                {Object.keys(featureDefinitions[category].features).map((feature) => (
                  <tr key={feature}>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="font-sora">{feature}</span>
                        <div className="relative ml-2 group">
                          <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                          <div className="absolute bottom-full left-0 transform -translate-y-2 z-50 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 w-60 font-normal shadow-lg">
                            {featureDefinitions[category].features[feature]}
                            <div className="absolute top-full left-4 transform border-4 border-transparent border-t-black"></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    {tiers.map((tier) => {
                      // Access feature safely with type checking
                      const featureValue = tier.features[category] && 
                        typeof tier.features[category] === 'object' ? 
                        tier.features[category][feature] : false;
                      
                      return (
                        <td key={`${tier.id}-${feature}`} className="px-4 py-3 text-center">
                          {renderFeatureValue(
                            category as FeatureCategory, 
                            featureValue, 
                            tier.id
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
            
            {/* Call to Action */}
            <tr>
              <td className="px-4 py-6 text-sm text-gray-600"></td>
              {tiers.map((tier) => (
                <td key={`${tier.id}-cta`} className="px-6 py-6 text-center">
                  <button
                    onClick={() => handleCheckout(tier.priceId)}
                    disabled={isLoading && selectedTier === tier.priceId}
                    className={`w-full rounded-md px-3 py-2 text-center text-sm font-medium leading-6 
                      ${tier.id === "professional" 
                        ? "bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color-dark)]" 
                        : "bg-white text-[var(--primary-color)] ring-1 ring-inset ring-[var(--divider-color)] hover:ring-[var(--accent-color)]"
                      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]`}
                  >
                    {isLoading && selectedTier === tier.priceId ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span>Get started</span>
                    )}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Why Justify Section */}
      <div ref={whyJustifyRef} className="mt-24 mb-16">
        <h2 className="text-3xl font-bold font-sora text-center mb-8">Why Choose Justify?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold mb-3 font-sora">Data-Driven Approach</h3>
            <p className="text-gray-600">Make informed decisions with our comprehensive analytics and reporting tools. Understand what works and why.</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold mb-3 font-sora">Seamless Integration</h3>
            <p className="text-gray-600">Connect easily with your existing tools and platforms. Our solution works with your current workflow.</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold mb-3 font-sora">Expert Support</h3>
            <p className="text-gray-600">Our team of marketing specialists is always ready to help you get the most out of your campaigns.</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div ref={faqRef} className="mt-20">
        <h2 className="text-2xl sm:text-3xl font-bold font-sora text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          <div className="border-b border-[var(--divider-color)] pb-4 mb-4">
            <h3 className="font-semibold text-[var(--primary-color)] mb-2 font-sora text-sm sm:text-base lg:text-lg">Can I upgrade my plan later?</h3>
            <p className="text-[var(--secondary-color)] text-xs sm:text-sm lg:text-base">Yes, you can upgrade at any time. The price difference will be prorated for your current billing period.</p>
          </div>
          <div className="border-b border-[var(--divider-color)] pb-4 mb-4">
            <h3 className="font-semibold text-[var(--primary-color)] mb-2 font-sora text-sm sm:text-base lg:text-lg">Do you offer custom enterprise plans?</h3>
            <p className="text-[var(--secondary-color)] text-xs sm:text-sm lg:text-base">Yes, please contact our sales team for custom solutions tailored to your specific business needs.</p>
          </div>
          <div className="border-b border-[var(--divider-color)] pb-4 mb-4">
            <h3 className="font-semibold text-[var(--primary-color)] mb-2 font-sora text-sm sm:text-base lg:text-lg">What payment methods do you accept?</h3>
            <p className="text-[var(--secondary-color)] text-xs sm:text-sm lg:text-base">We accept all major credit cards, and we can also arrange for bank transfers for annual subscriptions.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--primary-color)] mb-2 font-sora text-sm sm:text-base lg:text-lg">How do the studies work?</h3>
            <p className="text-[var(--secondary-color)] text-xs sm:text-sm lg:text-base">Each study provides comprehensive analysis of a marketing campaign, including audience response, engagement metrics, conversion data, and actionable recommendations.</p>
          </div>
        </div>
      </div>

      {/* Link to Billing Page */}
      <div className="mt-12 text-center pb-2">
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
  );
} 