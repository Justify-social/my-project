'use client';

/**
 * Shadcn Icon Adapter - CANONICAL IMPLEMENTATION
 *
 * This adapter provides compatibility with Shadcn UI components.
 * It implements the SSOT pattern by ultimately rendering through the core Icon component.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ShadcnIcon iconId="faChevronDownLight" />
 *
 * // With size variant
 * <ShadcnIcon iconId="faChevronDownLight" size="sm" />
 *
 * // With solid variant
 * <ShadcnIcon iconId="faChevronDownLight" variant="solid" />
 * ```
 */

import React, { forwardRef } from 'react';
import { Icon } from '..';
import { IconSize } from '../icon-types';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Utility function to combine class names
 * This is a simplified version of the cn utility for when it's not available
 */
const combinedClassNames = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Icon style variants using cva
 * These match Shadcn UI's styling expectations and provide consistent sizing
 */
const iconVariants = cva('inline-flex items-center justify-center', {
  variants: {
    size: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
      '2xl': 'w-10 h-10',
      '3xl': 'w-12 h-12',
      '4xl': 'w-16 h-16',
    },
    variant: {
      light: '',
      solid: 'font-bold',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'light',
  },
});

/**
 * ShadcnIcon Props
 * Extended from HTML attributes and cva variants for consistent typing
 */
export interface ShadcnIconProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof iconVariants> {
  /**
   * The ID of the icon to render (required)
   * For SSOT compliance, include the variant suffix:
   * e.g., "faChevronDownLight" or "faChevronDownSolid"
   */
  iconId: string;
}

/**
 * ShadcnIcon Component
 *
 * A Shadcn UI-compatible icon component that renders using our SSOT Icon implementation.
 * This component bridges our icon system with Shadcn UI expectations.
 *
 * Features:
 * - Follows Shadcn's styling patterns
 * - Maintains SSOT by using the core Icon component
 * - Provides consistent sizing and variants
 * - Supports ref forwarding for DOM access
 */
export const ShadcnIcon = forwardRef<HTMLSpanElement, ShadcnIconProps>(
  ({ iconId, className, size, variant, onClick, ...props }, _ref) => {
    // Convert the onClick handler to the format expected by Icon
    const handleClick = onClick ? () => onClick({} as React.MouseEvent<HTMLElement>) : undefined;

    // Render using the core Icon component (SSOT implementation)
    return (
      <Icon
        iconId={iconId}
        size={size as IconSize}
        className={combinedClassNames(iconVariants({ size, variant }), className)}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
ShadcnIcon.displayName = 'ShadcnIcon';

/**
 * Legacy adapter name
 * @deprecated Please use ShadcnIcon instead
 */
export const IconAdapter = ShadcnIcon;

/**
 * Legacy FontAwesome adapter name
 * @deprecated Please use ShadcnIcon instead
 */
export const FontAwesomeIcon = ShadcnIcon;
