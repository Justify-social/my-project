import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-transparent border-solid border',
        sizeClasses[size],
        size === 'sm' ? 'border-2' : 'border-4',
        'border-blue-600',
        className
      )}
    />
  );
};

// This comment indicates that this file is deprecated and will be removed in a future update
// @deprecated Use the Spinner component with type="svg" instead 