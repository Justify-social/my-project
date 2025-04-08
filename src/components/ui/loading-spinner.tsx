/**
 * @component LoadingSpinner
 * @category ui
 * @subcategory feedback
 * @description A customizable loading spinner component for indicating loading states
 */
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Color of the spinner
   * @default "primary"
   */
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

  /**
   * Text label to display with the spinner
   */
  label?: string;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * LoadingSpinner component for indicating loading states
 */
export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  label,
  className
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };

  const colorClasses = {
    primary: 'border-blue-600 border-b-transparent',
    secondary: 'border-gray-600 border-b-transparent',
    success: 'border-green-600 border-b-transparent',
    danger: 'border-red-600 border-b-transparent',
    warning: 'border-amber-600 border-b-transparent',
    info: 'border-cyan-600 border-b-transparent'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-solid",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {label && <p className="mt-2 text-sm text-gray-600">{label}</p>}
    </div>
  );
}

export default LoadingSpinner; 