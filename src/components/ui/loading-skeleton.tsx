/**
 * @component LoadingSkeleton
 * @category atom
 * @subcategory loading
 * @description A placeholder loading component that displays animated skeleton shapes using the base Skeleton primitive.
 * @status 10th April
 * @author Shadcn (adapted)
 * @since 2023-03-01
 */
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Define props locally if needed, or import from a shared types file if preferred
interface LoadingSkeletonProps {
  variant?: 'text' | 'circle' | 'rect' | 'card';
  width?: string | number;
  height?: string | number;
  animate?: boolean; // Base Skeleton handles animation, but keep prop if used elsewhere
  count?: number;
  gap?: string; // e.g., '0.5rem'
  className?: string;
  fullWidth?: boolean;
  radius?: string; // e.g., '0.25rem', '50%', 'rounded-md'
}

/**
 * Skeleton loading placeholder component using base Skeleton primitive.
 */
export function LoadingSkeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  gap = '0.5rem',
  className,
  fullWidth = false,
  radius,
}: LoadingSkeletonProps) {
  // Determine width/height classes based on variant if not specified
  const getDefaultDimensionsClasses = () => {
    switch (variant) {
      case 'text':
        return { wClass: fullWidth ? 'w-full' : 'w-48', hClass: 'h-4' }; // e.g., w-[12rem] = w-48
      case 'circle':
        return { wClass: 'w-10', hClass: 'h-10' }; // e.g., 2.5rem = 10 * 0.25rem
      case 'rect':
        return { wClass: fullWidth ? 'w-full' : 'w-48', hClass: 'h-20' }; // e.g., h-[5rem] = h-20
      case 'card':
        return { wClass: fullWidth ? 'w-full' : 'w-80', hClass: 'h-48' }; // e.g., w-[20rem] = w-80, h-[12rem] = h-48
    }
  };

  const { wClass, hClass } = getDefaultDimensionsClasses();
  // Convert number width/height to arbitrary Tailwind class if needed
  const widthClass = width ? (typeof width === 'number' ? `w-[${width}px]` : width) : wClass;
  const heightClass = height ? (typeof height === 'number' ? `h-[${height}px]` : height) : hClass;

  // Default border radius class based on variant
  const getDefaultRadiusClass = () => {
    switch (variant) {
      case 'text':
        return 'rounded-sm'; // e.g., 0.25rem
      case 'circle':
        return 'rounded-full'; // 50%
      case 'rect':
        return 'rounded-md'; // 0.375rem
      case 'card':
        return 'rounded-lg'; // 0.5rem
    }
  };

  // Allow overriding radius via prop (accepts Tailwind class names)
  const finalRadiusClass = radius || getDefaultRadiusClass();

  // Generate an array of items based on count
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={cn('flex', count > 1 ? 'flex-col' : '', className)}
      style={{ gap: count > 1 ? gap : undefined, backgroundColor: 'hsl(var(--muted))' }}
      role="status"
      aria-label="Loading"
    >
      {items.map(i => (
        <Skeleton key={i} className={cn(widthClass, heightClass, finalRadiusClass)} />
      ))}
    </div>
  );
}

/**
 * @component TableSkeleton
 * @category molecule
 * @subcategory loading
 * @description Displays a skeleton loading state for a table structure.
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      {/* Header row */}
      <div className="flex mb-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-6 rounded flex-1" />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex mb-3 gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * @component DashboardSkeleton
 * @category organism
 * @subcategory loading
 * @description Displays a skeleton loading state for a typical dashboard layout.
 */
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header area with metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`metric-${i}`} className="rounded-xl p-5 border space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
            <Skeleton className="h-8 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Main content - charts and tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main chart area */}
        <div className="lg:col-span-2 rounded-xl p-5 border">
          <Skeleton className="h-5 w-40 rounded mb-6" />
          <Skeleton className="h-64 rounded" />
        </div>

        {/* Side stats area */}
        <div className="rounded-xl p-5 border">
          <Skeleton className="h-5 w-32 rounded mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`stat-${i}`} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="rounded-xl p-5 border">
        <Skeleton className="h-5 w-48 rounded mb-6" />
        <TableSkeleton rows={3} columns={5} />
      </div>
    </div>
  );
}

// Helper: Skeleton Card Structure
const SkeletonCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('rounded-xl p-4 md:p-6 border border-border bg-card space-y-4', className)}>
    {children}
  </div>
);

// Helper: Skeleton Form Field
const SkeletonField: React.FC<{ labelWidth?: string; inputHeight?: string }> = ({
  labelWidth = 'w-32',
  inputHeight = 'h-10',
}) => (
  <div className="space-y-2">
    <Skeleton className={cn('h-4 rounded', labelWidth)} />
    <Skeleton className={cn('w-full rounded border border-input', inputHeight, 'bg-transparent')} />
  </div>
);

// Step 1: Basic Info, Contacts, Budget, Influencers
const Step1SkeletonContent = () => (
  <div className="space-y-6">
    <SkeletonCard>
      {' '}
      {/* Basic Info */}
      <Skeleton className="h-6 w-1/3 rounded mb-4" />
      <SkeletonField labelWidth="w-1/4" />
      <SkeletonField labelWidth="w-1/4" inputHeight="h-16" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonField labelWidth="w-1/3" />
        <SkeletonField labelWidth="w-1/3" />
      </div>
      <SkeletonField labelWidth="w-1/3" />
    </SkeletonCard>
    <SkeletonCard>
      {' '}
      {/* Contacts */}
      <Skeleton className="h-6 w-1/4 rounded mb-4" />
      <SkeletonField labelWidth="w-1/3" />
      <SkeletonField labelWidth="w-1/3" />
      <SkeletonField labelWidth="w-1/3" />
    </SkeletonCard>
    <SkeletonCard>
      {' '}
      {/* Budget */}
      <Skeleton className="h-6 w-1/5 rounded mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonField labelWidth="w-1/2" />
        <SkeletonField labelWidth="w-1/2" />
        <SkeletonField labelWidth="w-1/2" />
      </div>
    </SkeletonCard>
    <SkeletonCard>
      {' '}
      {/* Influencers */}
      <Skeleton className="h-6 w-1/4 rounded mb-4" />
      <SkeletonField labelWidth="w-1/3" />
      <Skeleton className="h-12 w-full rounded border border-input bg-transparent" />
    </SkeletonCard>
  </div>
);

// Step 2: KPIs, Messaging, Hypotheses, Features
const Step2SkeletonContent = () => (
  <div className="space-y-6">
    <SkeletonCard>
      {' '}
      {/* KPIs */}
      <Skeleton className="h-6 w-1/2 rounded mb-4" />
      <TableSkeleton rows={5} columns={3} />
      <Skeleton className="h-20 w-full rounded mt-4 bg-muted/50" /> {/* Summary Boxes */}
    </SkeletonCard>
    <SkeletonCard>
      {' '}
      {/* Messaging */}
      <Skeleton className="h-6 w-1/3 rounded mb-4" />
      <SkeletonField labelWidth="w-1/4" inputHeight="h-16" />
      <SkeletonField labelWidth="w-1/4" />
      <SkeletonField labelWidth="w-1/4" />
    </SkeletonCard>
    <SkeletonCard>
      {' '}
      {/* Hypotheses */}
      <Skeleton className="h-6 w-2/5 rounded mb-4" />
      <SkeletonField labelWidth="w-1/3" inputHeight="h-16" />
      <SkeletonField labelWidth="w-1/3" inputHeight="h-16" />
      <SkeletonField labelWidth="w-1/3" inputHeight="h-16" />
    </SkeletonCard>
    <SkeletonCard>
      {' '}
      {/* Features */}
      <Skeleton className="h-6 w-1/3 rounded mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded border border-input bg-transparent" />
        <Skeleton className="h-24 rounded border border-input bg-transparent" />
        <Skeleton className="h-24 rounded border border-input bg-transparent" />
        <Skeleton className="h-24 rounded border border-input bg-transparent" />
      </div>
    </SkeletonCard>
  </div>
);

// Step 3: Demographics, Locations, Targeting, Competitors
const Step3SkeletonContent = () => (
  <div className="space-y-6">
    <SkeletonCard>
      {' '}
      {/* Demographics */}
      <Skeleton className="h-6 w-1/3 rounded mb-4" />
      <Skeleton className="h-16 w-full rounded bg-muted/50 mb-4" /> {/* Age sliders */}
      <Skeleton className="h-10 w-1/2 rounded bg-muted/50" /> {/* Gender selector */}
    </SkeletonCard>
    <SkeletonCard>
      {' '}
      {/* Locations */}
      <Skeleton className="h-6 w-1/4 rounded mb-4" />
      <SkeletonField labelWidth="w-1/3" />
    </SkeletonCard>
    <SkeletonCard>
      {' '}
      {/* Targeting */}
      <Skeleton className="h-6 w-1/3 rounded mb-4" />
      <SkeletonField labelWidth="w-1/4" />
      <SkeletonField labelWidth="w-1/4" />
      <SkeletonField labelWidth="w-1/4" />
    </SkeletonCard>
    <SkeletonCard>
      {' '}
      {/* Competitors */}
      <Skeleton className="h-6 w-2/5 rounded mb-4" />
      <SkeletonField labelWidth="w-1/3" />
    </SkeletonCard>
  </div>
);

// Step 4: Assets
const Step4SkeletonContent = () => (
  <div className="space-y-6">
    <SkeletonCard>
      {' '}
      {/* Assets */}
      <Skeleton className="h-6 w-1/3 rounded mb-2" />
      <Skeleton className="h-4 w-full rounded mb-4" />
      {/* File Uploader Area */}
      <Skeleton className="h-32 w-full rounded border border-dashed border-input mb-4" />
      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Skeleton className="h-48 rounded border border-input bg-transparent" />{' '}
        {/* Mimic AssetCard */}
        <Skeleton className="h-48 rounded border border-input bg-transparent" />
        <Skeleton className="h-48 rounded border" /> {/* Mimic AssetCard */}
        <Skeleton className="h-48 rounded border" />
        <Skeleton className="h-48 rounded border" />
        <Skeleton className="h-48 rounded border" />
      </div>
    </SkeletonCard>
  </div>
);

// Step 5: Review Accordion + Confirmation
const Step5SkeletonContent = () => (
  <div className="space-y-4">
    {/* Accordion items */}
    <Skeleton className="h-16 w-full rounded border" />
    <Skeleton className="h-16 w-full rounded border" />
    <Skeleton className="h-16 w-full rounded border" />
    <Skeleton className="h-16 w-full rounded border" />
    {/* Confirmation Card */}
    <SkeletonCard className="mt-6">
      <Skeleton className="h-6 w-1/3 rounded mb-4" />
      <div className="flex items-start space-x-3">
        <Skeleton className="h-6 w-6 rounded" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-full rounded" />
        </div>
      </div>
    </SkeletonCard>
  </div>
);

/**
 * @component WizardSkeleton
 * @category organism
 * @subcategory loading
 * @description Displays a skeleton loading state for a multi-step wizard.
 */
export function WizardSkeleton({ step = 1, className }: { step?: number; className?: string }) {
  const normalizedStep = Math.max(1, Math.min(step, 5));

  // Moved render function definition outside return
  const renderStepContentSkeleton = () => {
    switch (normalizedStep) {
      case 1:
        return <Step1SkeletonContent />;
      case 2:
        return <Step2SkeletonContent />;
      case 3:
        return <Step3SkeletonContent />;
      case 4:
        return <Step4SkeletonContent />;
      case 5:
        return <Step5SkeletonContent />;
      default: // Should not be reached
        return (
          <SkeletonCard>
            <SkeletonField />
          </SkeletonCard>
        );
    }
  };

  return (
    <div className={cn('max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>

      {/* Progress Bar - Made thinner and less prominent */}
      <Skeleton className="h-1 w-full rounded-full mb-4 bg-muted/50" />

      {/* Main Content Area - renders step-specific skeleton */}
      <div className="min-h-[300px]">{renderStepContentSkeleton()}</div>

      {/* Footer Navigation */}
      {/* Ensure footer is visually separated and sticky if StepContent uses padding-bottom */}
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm p-4 border-t border-border flex justify-between items-center z-10 mt-8">
        <Skeleton className="h-10 w-24 rounded-md" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * @component AuthSkeleton
 * @category molecule
 * @subcategory loading
 * @description Displays a skeleton loading state for authentication forms (sign-in/sign-up).
 */
export function AuthSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="bg-white shadow-md border border-divider p-6 rounded-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Skeleton className="h-7 w-32 mx-auto rounded" />
          <Skeleton className="h-4 w-48 mx-auto rounded" />
        </div>

        {/* Social buttons */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded border border-divider" />
          <Skeleton className="h-10 w-full rounded border border-divider" />
        </div>

        {/* Divider */}
        <div className="flex items-center">
          <Skeleton className="h-px flex-1 bg-divider" />
          <Skeleton className="h-4 w-8 mx-3 rounded" />
          <Skeleton className="h-px flex-1 bg-divider" />
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2 rounded" />
            <Skeleton className="h-10 w-full rounded border border-divider" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2 rounded" />
            <Skeleton className="h-10 w-full rounded border border-divider" />
          </div>
        </div>

        {/* Submit button */}
        <Skeleton className="h-10 w-full rounded bg-interactive/20" />

        {/* Footer link */}
        <div className="text-center">
          <Skeleton className="h-4 w-40 mx-auto rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * @component BillingSkeleton
 * @category molecule
 * @subcategory loading
 * @description Displays a skeleton loading state for billing management pages.
 */
export function BillingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 h-auto bg-transparent p-0">
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
        </div>
        <Skeleton className="h-px w-full bg-divider" />
      </div>

      {/* Tab content */}
      <div className="p-6 space-y-6">
        {/* Section header */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 rounded" />
          <Skeleton className="h-4 w-80 rounded" />
        </div>

        {/* Billing portal section */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded bg-interactive/20" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>

        {/* Pricing grid placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`pricing-${i}`} className="border border-divider rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-24 rounded" />
                <Skeleton className="h-8 w-32 rounded" />
                <Skeleton className="h-4 w-full rounded" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={`feature-${j}`} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 flex-1 rounded" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded bg-interactive/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * @component ProfileSkeleton
 * @category molecule
 * @subcategory loading
 * @description Displays a skeleton loading state for user profile settings pages.
 */
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>

      {/* Profile sections */}
      <div className="space-y-6">
        {/* Profile picture and basic info */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 rounded border-b border-divider pb-2" />
          <div className="flex items-start space-x-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-3 flex-1">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded border border-input" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded border border-input" />
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-32 rounded bg-primary/20" />
        </div>

        {/* Email addresses section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-36 rounded border-b border-divider pb-2" />
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-input rounded">
              <div className="space-y-1">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <Skeleton className="h-8 w-20 rounded" />
            </div>
            <Skeleton className="h-10 w-40 rounded bg-primary/20" />
          </div>
        </div>

        {/* Security section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 rounded border-b border-divider pb-2" />
          <div className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-10 w-full rounded border border-input" />
            </div>
            <Skeleton className="h-10 w-40 rounded bg-primary/20" />
          </div>
        </div>

        {/* Connected accounts section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-44 rounded border-b border-divider pb-2" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={`account-${i}`}
                className="flex items-center justify-between p-3 border border-input rounded"
              >
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sign out section */}
      <div className="pt-4 border-t border-divider">
        <Skeleton className="h-10 w-24 rounded border border-input" />
      </div>
    </div>
  );
}

export default LoadingSkeleton;
