/**
 * @component TypographyText
 * @category atom
 * @subcategory text
 * @description A flexible typography component for displaying text with various styles
 */
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { TypographyTextProps } from './types';

/**
 * A versatile Typography component for consistent text styling across the application.
 * 
 * Usage:
 * ```tsx
 * <TypographyText>Regular text</TypographyText>
 * <TypographyText variant="lead">Lead paragraph</TypographyText>
 * <TypographyText variant="small" weight="bold">Bold small text</TypographyText>
 * <TypographyText truncate>This text will be truncated if too long...</TypographyText>
 * ```
 */
export function TypographyText({
  as: Tag = 'p',
  asChild = false,
  variant = 'body',
  weight = 'normal',
  align = 'left',
  transform = 'normal',
  truncate = false,
  lines,
  className,
  children,
  ...props
}: TypographyTextProps) {
  const Component = asChild ? Slot : Tag;

  // Build variant classes
  const variantClasses = {
    body: 'text-base leading-7',
    lead: 'text-lg leading-7 md:text-xl',
    small: 'text-sm leading-5',
    muted: 'text-sm text-gray-500 dark:text-gray-400',
    caption: 'text-xs leading-4 text-gray-500 dark:text-gray-400',
  };

  // Build weight classes
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  // Build alignment classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // Build transform classes
  const transformClasses = {
    normal: '',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
  };

  // Build truncation classes
  const getTruncateClasses = () => {
    if (!truncate) return '';

    if (lines && lines > 1) {
      return 'overflow-hidden display-webkit-box -webkit-box-orient-vertical line-clamp-' + lines;
    }

    return 'truncate overflow-hidden text-ellipsis whitespace-nowrap';
  };

  return (
    <Component
      className={cn(
        variantClasses[variant],
        weightClasses[weight],
        alignClasses[align],
        transformClasses[transform],
        getTruncateClasses(),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default TypographyText; 