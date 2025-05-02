'use client';

import React from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Based on BUILD/billing + pricing/billing + pricing.md
const plans = [
  {
    name: 'Pay-As-You-Go',
    price: '£2,499',
    interval: '/month',
    description: 'For occasional campaign needs',
    cta: 'Get started',
    features: {
      StudiesPerMonth: 'N/A',
      CreativeTesting: true,
      BrandLift: true,
      InfluencerSafety: false,
      BrandHealth: false,
      MMMAnalysis: false,
      Support: 'Email',
    },
    highlight: false,
  },
  {
    name: 'Essential',
    price: '£1,999',
    interval: '/month',
    description: 'Basic package for small teams',
    cta: 'Get started',
    features: {
      StudiesPerMonth: '1',
      CreativeTesting: true,
      BrandLift: true,
      InfluencerSafety: true,
      BrandHealth: false,
      MMMAnalysis: false,
      Support: 'Email',
    },
    highlight: false,
  },
  {
    name: 'Professional',
    price: '£5,999',
    interval: '/month',
    description: 'Ideal for growing brands',
    cta: 'Get started',
    features: {
      StudiesPerMonth: '3',
      CreativeTesting: true,
      BrandLift: true,
      InfluencerSafety: true,
      BrandHealth: true,
      MMMAnalysis: false,
      Support: 'Email, Phone',
    },
    highlight: true, // Often highlighted
  },
  {
    name: 'Advanced',
    price: '£10,999',
    interval: '/month',
    description: 'Complete solution for enterprises',
    cta: 'Get started',
    features: {
      StudiesPerMonth: '6',
      CreativeTesting: true,
      BrandLift: true,
      InfluencerSafety: true,
      BrandHealth: true,
      MMMAnalysis: true,
      Support: 'Full Support',
    },
    highlight: false,
  },
];

const featuresConfig = [
  {
    key: 'StudiesPerMonth',
    label: 'Studies / Month',
    tooltip: 'Number of comprehensive brand studies included per month.',
  },
  {
    key: 'CreativeTesting',
    label: 'Creative Testing',
    tooltip: 'Test the effectiveness of your ad creatives.',
  },
  {
    key: 'BrandLift',
    label: 'Brand Lift',
    tooltip: 'Measure the impact of your campaigns on brand perception.',
  },
  {
    key: 'InfluencerSafety',
    label: 'Influencer Safety',
    tooltip: 'Verify influencer accounts and ensure brand safety.',
  },
  {
    key: 'BrandHealth',
    label: 'Brand Health',
    tooltip: 'Monitor key brand health metrics over time.',
  },
  {
    key: 'MMMAnalysis',
    label: 'MMM Analysis',
    tooltip: 'Marketing Mix Modeling to understand channel effectiveness.',
  },
  { key: 'Support', label: 'Support', tooltip: 'Level of customer support provided.' },
];

const renderFeatureValue = (value: string | boolean | number | null | undefined) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Icon iconId="faCircleCheckLight" className="text-accent h-5 w-5 mx-auto" />
    ) : (
      <Icon iconId="faXmarkLight" className="text-secondary h-5 w-5 mx-auto" />
    );
  }
  if (value === 'N/A' || value === null || value === undefined) {
    // Consider using a specific icon for N/A or missing features if desired
    return <span className="text-secondary">N/A</span>;
  }
  return <span className="text-primary">{value}</span>;
};

export const PricingGrid: React.FC = () => {
  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold font-heading text-primary mb-2">Choose your plan</h2>
          <p className="text-secondary mb-4">
            Select the perfect package for your brand marketing needs
          </p>
        </div>

        <Table className="border-collapse border border-divider">
          <TableHeader className="bg-background">
            <TableRow className="border-b border-divider">
              <TableHead className="w-1/5 p-4 font-semibold text-primary text-left sticky top-0 bg-background z-10">
                Plan / Feature
              </TableHead>
              {plans.map(plan => (
                <TableHead
                  key={plan.name}
                  className={cn(
                    'w-1/5 p-4 text-center sticky top-0 bg-background z-10 border-l border-divider',
                    plan.highlight && 'bg-blue-50'
                  )}
                >
                  <h3 className="text-lg font-semibold font-heading text-primary">{plan.name}</h3>
                  <p className="text-xl font-bold text-primary mt-1">
                    {plan.price}
                    <span className="text-sm font-normal text-secondary">{plan.interval}</span>
                  </p>
                  <p className="text-xs text-secondary mt-1 h-8">{plan.description}</p>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {featuresConfig.map(feature => (
              <TableRow key={feature.key} className="border-b border-divider hover:bg-gray-50">
                <TableCell className="p-4 font-medium text-primary text-left sticky left-0 bg-white z-5">
                  <Tooltip>
                    <TooltipTrigger className="cursor-help flex items-center">
                      {feature.label}
                      <Icon
                        iconId="faCircleInfoLight"
                        className="ml-1.5 h-3.5 w-3.5 text-secondary"
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="max-w-xs bg-primary text-white p-2 rounded text-xs"
                    >
                      <p>{feature.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                {plans.map(plan => (
                  <TableCell
                    key={`${plan.name}-${feature.key}`}
                    className={cn(
                      'p-4 text-center border-l border-divider',
                      plan.highlight && 'bg-blue-50/50'
                    )}
                  >
                    {renderFeatureValue(plan.features[feature.key as keyof typeof plan.features])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {/* CTA Row */}
            <TableRow className="border-t-2 border-divider bg-background">
              <TableCell className="p-4 sticky left-0 bg-background z-5"></TableCell>
              {plans.map(plan => (
                <TableCell
                  key={`${plan.name}-cta`}
                  className={cn(
                    'p-4 text-center border-l border-divider',
                    plan.highlight && 'bg-blue-50/80'
                  )}
                >
                  <Button
                    variant={plan.highlight ? 'default' : 'outline'}
                    className={cn(plan.highlight && 'bg-interactive hover:bg-blue-700 text-white')}
                  >
                    {plan.cta}
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default PricingGrid;
