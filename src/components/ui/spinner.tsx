import React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The size of the spinner
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * The color of the spinner
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'accent' | 'white' | 'current';

  /**
   * The type of spinner to render
   * @default "border"
   */
  type?: 'border' | 'svg';
}

interface SVGSpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'white' | 'current';
}

/**
 * Spinner component for loading states
 * 
 * @example
 * ```tsx
 * // Border spinner (default)
 * <Spinner />
 * 
 * // SVG spinner
 * <Spinner type="svg" />
 * 
 * // With custom size
 * <Spinner size="lg" />
 * 
 * // With custom color
 * <Spinner variant="accent" />
 * ```
 */
export function Spinner({
  size = 'md',
  variant = 'primary',
  type = 'border',
  className,
  ...props
}: SpinnerProps) {
  // Size classes for border spinner
  const borderSizeClasses = {
    xs: 'h-3 w-3 border',
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };
  
  // Size classes for SVG spinner
  const svgSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };
  
  // Variant classes for border spinner
  const borderVariantClasses = {
    primary: 'border-primary border-t-transparent text-primary',
    secondary: 'border-secondary border-t-transparent text-secondary',
    accent: 'border-accent border-t-transparent text-accent',
    white: 'border-white border-t-transparent text-white',
    current: 'border-current border-t-transparent',
  };

  // If using SVG spinner
  if (type === 'svg') {
    return (
      <SVGSpinner 
        size={size} 
        variant={variant} 
        className={className}
        aria-label="Loading"
      />
    );
  }
  
  // Default border spinner
  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full',
        borderSizeClasses[size],
        borderVariantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

const SVGSpinner = ({ 
  size = 'md', 
  variant = 'primary', 
  className,
  ...props
}: SVGSpinnerProps) => {
  // Size classes for SVG spinner
  const svgSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };
  
  return (
    <svg
      className={cn(
        'animate-spin',
        svgSizeClasses[size],
        variant === 'current' ? 'text-current' : `text-${variant}`,
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
      <span className="sr-only">Loading...</span>
    </svg>
  );
};

export default Spinner; 