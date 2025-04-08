/**
 * @component LoadingSkeleton
 * @category feedback
 * @subcategory loading
 * @description A placeholder loading component that displays animated skeleton shapes
 */
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSkeletonProps } from './types';

/**
 * Skeleton loading placeholder component for showing content being loaded
 */
export function LoadingSkeleton({
  variant = 'text',
  width,
  height,
  animate = true,
  count = 1,
  gap = '0.5rem',
  className,
  fullWidth = false,
  radius,
}: LoadingSkeletonProps) {
  // Determine width/height based on variant if not specified
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'text':
        return { w: fullWidth ? '100%' : '12rem', h: '1rem' };
      case 'circle':
        return { w: '2.5rem', h: '2.5rem' };
      case 'rect':
        return { w: fullWidth ? '100%' : '12rem', h: '5rem' };
      case 'card':
        return { w: fullWidth ? '100%' : '20rem', h: '12rem' };
    }
  };

  const { w, h } = getDefaultDimensions();
  const finalWidth = width || w;
  const finalHeight = height || h;

  // Default border radius based on variant
  const getDefaultRadius = () => {
    switch (variant) {
      case 'text':
        return '0.25rem';
      case 'circle':
        return '50%';
      case 'rect':
        return '0.375rem';
      case 'card':
        return '0.5rem';
    }
  };

  const finalRadius = radius || getDefaultRadius();

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
        <div
          key={i}
          className={cn(
            "bg-gray-200 dark:bg-gray-700",
            animate && "animate-pulse",
            className
          )}
          style={{
            width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
            height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
            borderRadius: finalRadius,
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * TableSkeleton component for displaying loading state in tables
 * @param {number} rows - Number of skeleton rows to display
 * @param {number} columns - Number of columns per row
 * @param {string} className - Additional CSS classes
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
    <div className={cn("w-full animate-pulse", className)}>
      {/* Header row */}
      <div className="flex mb-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={`header-${i}`}
            className="h-6 bg-gray-300 dark:bg-gray-700 rounded flex-1"
          />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex mb-3 gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 bg-gray-200 dark:bg-gray-800 rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * DashboardSkeleton component for displaying loading state on dashboard pages
 */
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header area with metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`metric-${i}`}
            className="bg-white dark:bg-gray-800 animate-pulse rounded-xl p-5 border border-gray-200 dark:border-gray-700 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
            <div className="h-8 w-28 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>

      {/* Main content - charts and tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="h-5 w-40 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Side stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`stat-${i}`} className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-5 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
        <TableSkeleton rows={3} columns={5} />
      </div>
    </div>
  );
}

/**
 * WizardSkeleton component for displaying loading state on campaign wizard pages
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
  return (
    <div className={cn("max-w-6xl mx-auto px-6 py-8 space-y-6", className)}>
      {/* Wizard header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Step indicator */}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div
          className="h-2 bg-blue-500 rounded-full animate-pulse"
          style={{ width: `${(step / 5) * 100}%` }}
        ></div>
      </div>

      {/* Step content or default skeleton */}
      {stepContent || (
        <div className="space-y-6">
          {/* Default form fields */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Form fields - different per step */}
            {Array.from({ length: 3 + step }).map((_, i) => (
              <div key={`field-${i}`} className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"></div>
              </div>
            ))}
          </div>

          {step >= 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`opt-${i}`} className="h-12 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-28 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSkeleton; 