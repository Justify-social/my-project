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
import { Skeleton } from "@/components/ui/skeleton";

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
      className={cn(
        "flex",
        count > 1 ? "flex-col" : "",
        className
      )}
      style={{ gap: count > 1 ? gap : undefined }}
      role="status"
      aria-label="Loading"
    >
      {items.map((i) => (
        <Skeleton
          key={i}
          className={cn(
            widthClass,
            heightClass,
            finalRadiusClass,
          )}
        />
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
  className
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
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
    <div className={cn("space-y-6", className)}>
      {/* Header area with metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`metric-${i}`}
            className="rounded-xl p-5 border space-y-4"
          >
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

/**
 * @component WizardSkeleton
 * @category organism
 * @subcategory loading
 * @description Displays a skeleton loading state for a multi-step wizard.
 */
export function WizardSkeleton({
  step = 1,
  stepContent,
  className
}: {
  step?: number;
  stepContent?: React.ReactNode;
  className?: string;
}) {
  // Ensure step is within a reasonable range if needed (e.g., 1 to 5)
  const normalizedStep = Math.max(1, Math.min(step, 5));

  return (
    <div className={cn("max-w-6xl mx-auto px-6 py-8 space-y-6", className)}>
      {/* Wizard header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <Skeleton className="h-10 w-24 rounded" />
      </div>

      {/* Step indicator - Use Progress component? Or keep simple? Keep simple for now */}
      <Skeleton className="h-2 w-full rounded-full">
        {/* Maybe indicate progress visually? Difficult with skeleton primitive */}
        {/* <div
          className="h-2 bg-primary rounded-full"
          style={{ width: `${(normalizedStep / 5) * 100}%` }}
        ></div> */}
      </Skeleton>

      {/* Step content or default skeleton */}
      {stepContent || (
        <div className="space-y-6">
          {/* Default form fields */}
          <div className="rounded-xl p-6 border space-y-5">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="h-6 w-40 rounded" />
            </div>

            {/* Form fields - vary number based on step */}
            {Array.from({ length: 3 + normalizedStep }).map((_, i) => (
              <div key={`field-${i}`} className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded border" />
              </div>
            ))}
          </div>

          {/* Optional second block */}
          {normalizedStep >= 2 && (
            <div className="rounded-xl p-6 border space-y-5">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="h-6 w-48 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={`opt-${i}`} className="h-12 rounded border" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-background p-4 border-t border flex justify-between items-center">
        <Skeleton className="h-10 w-24 rounded" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded" />
          <Skeleton className="h-10 w-28 rounded" />
        </div>
      </div>
    </div>
  );
}

export default LoadingSkeleton; 