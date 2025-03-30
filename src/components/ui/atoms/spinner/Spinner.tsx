'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'white';
}

const sizeClasses = {
  xs: 'h-3 w-3 border-[1px]',
  sm: 'h-4 w-4 border-[2px]',
  md: 'h-6 w-6 border-[2px]',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-12 w-12 border-[4px]',
};

const colorClasses = {
  primary: 'border-primary border-t-transparent',
  secondary: 'border-secondary border-t-transparent',
  accent: 'border-accent border-t-transparent',
  white: 'border-white border-t-transparent',
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'primary', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-solid',
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

export default Spinner;
