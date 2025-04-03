'use client';

import React, { forwardRef } from 'react';
import { Icon } from '@/components/ui/atoms/icon';
import { IconSize, IconVariant } from '@/components/ui/atoms/icon/types';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

// Create icon variants to match shadcn/ui expectations
const iconVariants = cva('inline-flex items-center justify-center', {
  variants: {
    size: {
      'xs': 'w-3 h-3',
      'sm': 'w-4 h-4',
      'md': 'w-5 h-5',
      'lg': 'w-6 h-6',
      'xl': 'w-8 h-8',
      '2xl': 'w-10 h-10',
      '3xl': 'w-12 h-12',
      '4xl': 'w-16 h-16',
    },
    variant: {
      light: '',
      solid: 'font-bold',
    }
  },
  defaultVariants: {
    size: 'md',
    variant: 'light'
  }
});

export interface ShadcnIconProps extends
  React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof iconVariants> {
  name: string;
}

/**
 * ShadcnIcon
 * 
 * A wrapper around our Icon component that provides shadcn/ui compatible styling.
 * Uses the SSOT Icon component from /src/components/ui/atoms/icon that 
 * sources all data from icon-registry.json.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ShadcnIcon iconId="faChevronDownLight" />
 * 
 * // With size variant
 * <ShadcnIcon iconId="faChevronDownLight" size="sm" />
 * 
 * // With solid variant (for hover states)
 * <ShadcnIcon iconId="faChevronDownLight" variant="solid" />
 * ```
 */
export const ShadcnIcon = forwardRef<HTMLSpanElement, ShadcnIconProps>(
  ({ name, className, size, variant, ...props }, ref) => {
    // Simple utility function if cn is missing
    const combineClasses = cn || function(...classes: any[]) {
      return classes.filter(Boolean).join(' ');
    };
    
    return (
      <Icon
        name={name}
        size={size as IconSize}
        variant={variant as IconVariant}
        className={combineClasses(iconVariants({ size, variant }), className)}
        {...props}
      />
    );
  }
);
ShadcnIcon.displayName = 'ShadcnIcon';

/**
 * For backward compatibility
 * @deprecated Please use ShadcnIcon instead
 */
export const IconAdapter = ShadcnIcon;

/**
 * FontAwesomeIcon (deprecated)
 * 
 * @deprecated Please use ShadcnIcon instead
 */
export const FontAwesomeIcon = ShadcnIcon; 