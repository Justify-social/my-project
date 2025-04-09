/**
 * @component TypographyHeading
 * @category atom
 * @subcategory heading
 * @description A heading component with various levels (h1-h6) following typographic best practices
 */
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { TypographyHeadingProps } from './types';

/**
 * A heading component with various levels (h1-h6)
 * 
 * Usage:
 * ```tsx
 * <TypographyHeading level={1}>Page Title</TypographyHeading>
 * <TypographyHeading level={2} align="center">Section Title</TypographyHeading>
 * <TypographyHeading level={3} size="xl">Larger Than Default H3</TypographyHeading>
 * ```
 */
export function TypographyHeading({
  level = 2,
  size,
  asChild = false,
  align = 'left',
  tracking = 'normal',
  truncate = false,
  className,
  children,
  ...props
}: TypographyHeadingProps) {
  // Determine the heading element based on level
  const Component = asChild ? Slot : `h${level}` as React.ElementType;

  // Get size class based on level or override
  const getSizeClass = () => {
    if (size) {
      switch (size) {
        case 'xs': return 'text-xs';
        case 'sm': return 'text-sm';
        case 'md': return 'text-base';
        case 'lg': return 'text-lg';
        case 'xl': return 'text-xl';
        case '2xl': return 'text-2xl';
        case '3xl': return 'text-3xl';
        case '4xl': return 'text-4xl';
        case '5xl': return 'text-5xl';
        default: return '';
      }
    }

    // Default sizes based on heading level
    switch (level) {
      case 1: return 'text-4xl md:text-5xl';
      case 2: return 'text-3xl md:text-4xl';
      case 3: return 'text-2xl md:text-3xl';
      case 4: return 'text-xl md:text-2xl';
      case 5: return 'text-lg md:text-xl';
      case 6: return 'text-base md:text-lg';
      default: return 'text-base';
    }
  };

  // Get alignment class
  const getAlignClass = () => {
    switch (align) {
      case 'left': return 'text-left';
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return '';
    }
  };

  // Get tracking class
  const getTrackingClass = () => {
    switch (tracking) {
      case 'tight': return 'tracking-tight';
      case 'wide': return 'tracking-wide';
      default: return 'tracking-normal';
    }
  };

  // Get weight class based on level
  const getWeightClass = () => {
    switch (level) {
      case 1: return 'font-extrabold';
      case 2: return 'font-bold';
      case 3: case 4: return 'font-semibold';
      default: return 'font-medium';
    }
  };

  // Build truncate class
  const getTruncateClass = () => {
    return truncate ? 'truncate overflow-hidden text-ellipsis whitespace-nowrap' : '';
  };

  return (
    <Component
      className={cn(
        getSizeClass(),
        getWeightClass(),
        getAlignClass(),
        getTrackingClass(),
        getTruncateClass(),
        'text-gray-900 dark:text-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default TypographyHeading; 