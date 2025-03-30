'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the badge
   * @default "default"
   */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
  
  /**
   * Whether the badge is a pill shape (fully rounded corners)
   * @default false
   */
  pill?: boolean;
  
  /**
   * Whether the badge should have a small dot indicator
   * @default false
   */
  withDot?: boolean;
  
  /**
   * The size of the badge
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge component - An inline element for status, counts, or labels
 * 
 * Badges are used to highlight status, show counts, or emphasize small pieces of information.
 * They can be customized with different variants, sizes, and shapes.
 * 
 * @component
 * @param {BadgeProps} props - The props for the Badge component
 * @returns {React.ReactElement} - The rendered Badge component
 * 
 * @example
 * // Default badge
 * <Badge>New</Badge>
 * 
 * // Primary badge with pill shape
 * <Badge variant="primary" pill>Featured</Badge>
 * 
 * // Small success badge with dot indicator
 * <Badge variant="success" size="sm" withDot>Active</Badge>
 * 
 * // Destructive outlined badge
 * <Badge variant="destructive" variant="outline">Deleted</Badge>
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant = 'default', 
    pill = false,
    withDot = false,
    size = 'md',
    children,
    ...props 
  }, ref) => {
    // Size classes
    const sizeClasses = {
      sm: 'text-xs py-0.5',
      md: 'text-xs py-1',
      lg: 'text-sm py-1'
    };
    
    // Padding based on size and pill
    const paddingClasses = {
      sm: pill ? 'px-2' : 'px-1.5',
      md: pill ? 'px-2.5' : 'px-2',
      lg: pill ? 'px-3' : 'px-2.5'
    };
    
    // Border radius based on pill
    const radiusClass = pill ? 'rounded-full' : 'rounded';
    
    // Variant classes using the design tokens
    const variantClasses = {
      default: 'bg-secondary/10 text-secondary',
      primary: 'bg-accent text-white',
      secondary: 'bg-secondary text-white',
      outline: 'bg-transparent border border-divider text-primary',
      success: 'bg-success/15 text-success',
      warning: 'bg-warning/15 text-warning',
      destructive: 'bg-destructive/15 text-destructive'
    };
    
    return (
      <div
        ref={ref}
        role="status"
        aria-label={typeof children === 'string' ? children : undefined}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors',
          sizeClasses[size],
          paddingClasses[size],
          radiusClass,
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {withDot && (
          <span 
            className={cn(
              'mr-1 h-1.5 w-1.5 rounded-full',
              {
                'bg-white': variant === 'primary' || variant === 'secondary',
                'bg-secondary': variant === 'default',
                'bg-success': variant === 'success',
                'bg-warning': variant === 'warning',
                'bg-destructive': variant === 'destructive',
                'bg-primary': variant === 'outline'
              }
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * badge - Combined component exporting all subcomponents
 * 
 * This component is the default export to ensure compatibility with dynamic imports.
 */
const badge = {
  Badge
};

export default badge;
