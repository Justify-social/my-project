'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';

// Portal-based tooltip component that renders outside table boundaries
const PortalTooltip: React.FC<{
  isVisible: boolean;
  targetRef: React.RefObject<HTMLDivElement>;
  content: string;
}> = ({ isVisible, targetRef, content }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isVisible && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        x: rect.right + 8, // 8px offset to the right
        y: rect.top + rect.height / 2 - 20, // Center vertically
      });
    }
  }, [isVisible, targetRef]);

  if (!isVisible || typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="fixed max-w-xs bg-primary text-white p-2 rounded text-sm shadow-lg pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 2147483647, // Maximum z-index value
      }}
    >
      {content}
    </div>,
    document.body
  );
};

// Coming soon badge component that renders outside table boundaries
const ComingSoonBadge: React.FC<{
  targetRef: React.RefObject<HTMLTableCellElement>;
}> = ({ targetRef }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        setPosition({
          x: rect.left - 8, // Position to the left of the cell
          y: rect.top - 8, // Position above the cell
        });
        setShouldShow(true);
      } else {
        setShouldShow(false);
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetRef]);

  if (!shouldShow || typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="fixed bg-sky-100 border border-accent text-accent px-2 py-1 rounded-full text-xs font-medium shadow-sm pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 2147483647, // Maximum z-index value
      }}
    >
      Coming Soon
    </div>,
    document.body
  );
};

// Savings badge component that renders outside table boundaries (solid background)
const SavingsBadge: React.FC<{
  targetRef: React.RefObject<HTMLTableCellElement>;
  savingsPercent: number;
}> = ({ targetRef, savingsPercent }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        setPosition({
          x: rect.right - 32, // Position to the right side of the cell (adjust for badge width)
          y: rect.top - 8, // Position above the cell
        });
        setShouldShow(true);
      } else {
        setShouldShow(false);
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetRef]);

  if (!shouldShow || typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="fixed bg-sky-100 border border-accent text-accent px-2 py-1 rounded-full text-xs font-medium shadow-sm pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 2147483647, // Maximum z-index value
      }}
    >
      Save {savingsPercent}%
    </div>,
    document.body
  );
};

// Pricing Toggle Component
const PricingToggle: React.FC<{
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}> = ({ isAnnual, onToggle }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 text-sm">
        <span
          className={cn(
            'transition-colors',
            !isAnnual ? 'text-primary font-medium' : 'text-gray-500'
          )}
        >
          Monthly
        </span>
        <button
          onClick={() => onToggle(!isAnnual)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
            isAnnual ? 'bg-accent' : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              isAnnual ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <span
          className={cn(
            'transition-colors',
            isAnnual ? 'text-primary font-medium' : 'text-gray-500'
          )}
        >
          Annual
        </span>
      </div>
    </div>
  );
};

// Based on BUILD/billing + pricing/billing + pricing.md
const plans = [
  {
    name: 'Pay-As-You-Go',
    monthlyPrice: '£2,499',
    annualPrice: '£2,499', // Same price for one-time payment
    monthlySavings: 0,
    annualSavings: 0, // No savings for one-time payment
    description: 'For occasional campaign needs',
    cta: 'Get started',
    monthlyPriceId: process.env.NEXT_PUBLIC_PRICE_PAY_AS_YOU_GO || 'price_1RU3DODGpcgxsytlyblMeeT9',
    annualPriceId: process.env.NEXT_PUBLIC_PRICE_PAY_AS_YOU_GO_ANNUAL || 'price_annual_payg',
    disabled: false,
    features: {
      StudiesPerMonth: '1',
      InfluencerMarketplace: true,
      BrandLift: true,
      CreativeTesting: true,
      BrandHealth: false,
      MMM: false,
      Support: 'Email',
    },
  },
  {
    name: 'Essential',
    monthlyPrice: '£7,499',
    annualPrice: '£76,490', // 15% savings (£89,988 - £13,498 = £76,490)
    monthlySavings: 0,
    annualSavings: 15,
    description: 'For growing marketing teams',
    cta: 'Get started',
    monthlyPriceId:
      process.env.NEXT_PUBLIC_PRICE_ESSENTIAL_MONTHLY || 'price_1RU3F2DGpcgxsytlpcaAjYRf',
    annualPriceId: process.env.NEXT_PUBLIC_PRICE_ESSENTIAL_ANNUAL || 'price_annual_essential',
    disabled: true,
    features: {
      StudiesPerMonth: '1',
      InfluencerMarketplace: true,
      BrandLift: true,
      CreativeTesting: true,
      BrandHealth: false,
      MMM: false,
      Support: 'Email + Chat',
    },
  },
  {
    name: 'Professional',
    monthlyPrice: '£14,999',
    annualPrice: '£143,990', // 20% savings (£179,988 - £35,998 = £143,990)
    monthlySavings: 0,
    annualSavings: 20,
    description: 'For established marketing teams',
    cta: 'Get started',
    monthlyPriceId:
      process.env.NEXT_PUBLIC_PRICE_PROFESSIONAL_MONTHLY || 'price_1RU3FDDGpcgxsytlWJ7DUCg2',
    annualPriceId: process.env.NEXT_PUBLIC_PRICE_PROFESSIONAL_ANNUAL || 'price_annual_professional',
    disabled: true,
    features: {
      StudiesPerMonth: '3',
      InfluencerMarketplace: true,
      BrandLift: true,
      CreativeTesting: true,
      BrandHealth: true,
      MMM: false,
      Support: 'Priority Support',
    },
  },
  {
    name: 'Advanced',
    monthlyPrice: '£29,999',
    annualPrice: '£269,990', // 25% savings (£359,988 - £89,998 = £269,990)
    monthlySavings: 0,
    annualSavings: 25,
    description: 'For large-scale marketing operations',
    cta: 'Get started',
    monthlyPriceId:
      process.env.NEXT_PUBLIC_PRICE_ADVANCED_MONTHLY || 'price_1RU3G1DGpcgxsytlnFAhb0v0',
    annualPriceId: process.env.NEXT_PUBLIC_PRICE_ADVANCED_ANNUAL || 'price_annual_advanced',
    disabled: true,
    features: {
      StudiesPerMonth: '6',
      InfluencerMarketplace: true,
      BrandLift: true,
      CreativeTesting: true,
      BrandHealth: true,
      MMM: true,
      Support: 'Dedicated Success Manager',
    },
  },
];

// Features in the requested order: Studies/Month first (moved back to top)
const features = [
  {
    key: 'StudiesPerMonth',
    label: 'Studies / Month',
    tooltip:
      'Number of brand lift studies you can conduct monthly to measure campaign effectiveness and ROI across different audiences and campaigns',
    hasComingSoon: false,
  },
  {
    key: 'InfluencerMarketplace',
    label: 'Influencer Marketplace',
    tooltip:
      'Discover and analyse vetted influencers with comprehensive performance data, audience insights, and brand safety scoring to identify perfect campaign partners',
    hasComingSoon: false,
  },
  {
    key: 'BrandLift',
    label: 'Brand Lift',
    tooltip:
      'Measure campaign impact on key brand metrics through pre/post surveys. Track awareness, consideration, and purchase intent lift with statistical significance',
    hasComingSoon: false,
  },
  {
    key: 'CreativeTesting',
    label: 'Creative Testing',
    tooltip:
      'A/B test multiple creative variations before full campaign launch. Optimise content performance and audience engagement through data-driven creative decisions',
    hasComingSoon: true,
  },
  {
    key: 'BrandHealth',
    label: 'Brand Health',
    tooltip:
      'Monitor brand sentiment, competitive positioning, and perception metrics over time. Track share of voice and brand equity development across key demographics',
    hasComingSoon: true,
  },
  {
    key: 'MMM',
    label: 'MMM',
    tooltip:
      'Marketing Mix Modelling to understand true cross-channel attribution, optimise budget allocation, and measure incrementality across all marketing touchpoints',
    hasComingSoon: true,
  },
  {
    key: 'Support',
    label: 'Support',
    tooltip:
      'Access to customer support channels including email, chat, priority support, and dedicated success management depending on your plan',
    hasComingSoon: false,
  },
];

export default function PricingGrid() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isAnnual, setIsAnnual] = useState(false);
  const [tooltipState, setTooltipState] = useState<{ [key: string]: boolean }>({});
  const [isRedirecting, setIsRedirecting] = useState<{ [key: string]: boolean }>({});
  const tooltipRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const comingSoonRefs = useRef<{ [key: string]: React.RefObject<HTMLTableCellElement> }>({});
  const pricingHeaderRefs = useRef<{ [key: string]: React.RefObject<HTMLTableCellElement> }>({});

  // Initialize refs for tooltips, coming soon badges, and pricing headers
  features.forEach(feature => {
    if (!tooltipRefs.current[feature.key]) {
      tooltipRefs.current[feature.key] = React.createRef<HTMLDivElement>();
    }
    if (feature.hasComingSoon && !comingSoonRefs.current[feature.key]) {
      comingSoonRefs.current[feature.key] = React.createRef<HTMLTableCellElement>();
    }
  });

  // Initialize refs for pricing column headers
  plans.forEach(plan => {
    if (!pricingHeaderRefs.current[plan.name]) {
      pricingHeaderRefs.current[plan.name] = React.createRef<HTMLTableCellElement>();
    }
  });

  const showTooltip = (featureKey: string) => {
    setTooltipState(prev => ({ ...prev, [featureKey]: true }));
  };

  const hideTooltip = (featureKey: string) => {
    setTooltipState(prev => ({ ...prev, [featureKey]: false }));
  };

  const handleGetStarted = async (plan: (typeof plans)[0]) => {
    if (plan.disabled) return;

    if (!isUserLoaded || !user?.id) {
      console.error('User not loaded or not logged in');
      return;
    }

    setIsRedirecting(prev => ({ ...prev, [plan.name]: true }));

    try {
      // Determine the correct mode and price ID based on plan type and billing period
      const isPayAsYouGo = plan.name === 'Pay-As-You-Go';
      const mode = isPayAsYouGo ? 'payment' : 'subscription';
      const priceId = isAnnual ? plan.annualPriceId : plan.monthlyPriceId;

      // Call the checkout session API
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId,
          mode: mode,
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

      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(m =>
        m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      );

      if (!stripe) {
        throw new Error('Stripe.js failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Stripe redirectToCheckout error:', error);
        throw new Error(error.message || 'Failed to redirect to checkout');
      }
    } catch (error) {
      console.error('Error creating or redirecting to checkout:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsRedirecting(prev => ({ ...prev, [plan.name]: false }));
    }
  };

  return (
    <div className="relative overflow-hidden">
      <Table className="border-collapse border border-divider relative">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4 p-4 text-left">
              <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
            </TableHead>
            {plans.map(plan => (
              <TableHead
                key={plan.name}
                className={cn(
                  'p-4 text-center',
                  plan.name === 'Professional' &&
                    'bg-accent/5 border-l-2 border-r-2 border-accent/20'
                )}
                ref={pricingHeaderRefs.current[plan.name]}
              >
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">{plan.name}</h3>
                  <div
                    className={cn(
                      'text-2xl font-bold',
                      plan.disabled ? 'text-gray-400' : 'text-primary'
                    )}
                  >
                    {plan.disabled
                      ? plan.name === 'Advanced'
                        ? '•••••'
                        : '••••'
                      : isAnnual
                        ? plan.annualPrice
                        : plan.monthlyPrice}
                    <span
                      className={cn(
                        'text-sm font-normal',
                        plan.disabled ? 'text-gray-400' : 'text-gray-600'
                      )}
                    >
                      {plan.disabled
                        ? ''
                        : plan.name === 'Pay-As-You-Go'
                          ? '/month'
                          : isAnnual
                            ? '/year'
                            : '/month'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>

                {/* Savings badge for plans with savings when annual is selected */}
                {plan.name !== 'Pay-As-You-Go' &&
                  isAnnual &&
                  plan.annualSavings > 0 &&
                  pricingHeaderRefs.current[plan.name] && (
                    <SavingsBadge
                      targetRef={pricingHeaderRefs.current[plan.name]}
                      savingsPercent={plan.annualSavings}
                    />
                  )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map(feature => (
            <TableRow key={feature.key}>
              <TableCell
                ref={feature.hasComingSoon ? comingSoonRefs.current[feature.key] : undefined}
                className="p-4 font-medium text-primary text-left sticky left-0 bg-white z-10 relative h-16"
              >
                <div
                  ref={tooltipRefs.current[feature.key]}
                  className="flex items-center gap-2 cursor-help"
                  onMouseEnter={() => showTooltip(feature.key)}
                  onMouseLeave={() => hideTooltip(feature.key)}
                >
                  {feature.label}
                  <Icon iconId="faCircleInfoLight" className="h-4 w-4 text-gray-400" />
                </div>

                {/* Portal-based tooltip */}
                <PortalTooltip
                  isVisible={tooltipState[feature.key] || false}
                  targetRef={tooltipRefs.current[feature.key]}
                  content={feature.tooltip}
                />

                {/* Coming soon badge for features that have it (only first column) */}
                {feature.hasComingSoon && comingSoonRefs.current[feature.key] && (
                  <ComingSoonBadge targetRef={comingSoonRefs.current[feature.key]} />
                )}
              </TableCell>
              {plans.map(plan => (
                <TableCell
                  key={`${feature.key}-${plan.name}`}
                  className={cn(
                    'p-4 text-center h-16',
                    plan.name === 'Professional' &&
                      'bg-accent/5 border-l-2 border-r-2 border-accent/20'
                  )}
                >
                  {feature.key === 'StudiesPerMonth' ? (
                    <span className="text-gray-600">
                      {plan.features[feature.key as keyof typeof plan.features]}
                    </span>
                  ) : feature.key === 'Support' ? (
                    <span className="text-gray-600 text-sm">
                      {plan.features[feature.key as keyof typeof plan.features]}
                    </span>
                  ) : plan.features[feature.key as keyof typeof plan.features] ? (
                    <Icon iconId="faCircleCheckLight" className="h-5 w-5 text-accent mx-auto" />
                  ) : (
                    <Icon iconId="faXmarkLight" className="h-5 w-5 text-gray-400 mx-auto" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {/* Get Started buttons row at the bottom */}
          <TableRow>
            <TableCell className="p-4 font-medium text-primary text-left sticky left-0 bg-white z-10 h-16">
              {/* Removed "Get Started" text as requested */}
            </TableCell>
            {plans.map(plan => (
              <TableCell
                key={`get-started-${plan.name}`}
                className={cn(
                  'p-4 text-center h-16',
                  plan.name === 'Professional' &&
                    'bg-accent/5 border-l-2 border-r-2 border-accent/20'
                )}
              >
                <Button
                  className={cn('w-full', plan.disabled && 'opacity-50 cursor-not-allowed')}
                  disabled={plan.disabled || isRedirecting[plan.name]}
                  onClick={() => handleGetStarted(plan)}
                >
                  {isRedirecting[plan.name] ? 'Loading...' : plan.cta}
                </Button>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
