/**
 * Card Component Styles
 * 
 * This file contains style utility functions for the Card component system.
 */

import { cn } from '@/utils/string/utils';
import { CardVariant } from '../types';

/**
 * Get classes for the main card container based on variant and hoverable state
 */
export function getCardClasses({
  variant = 'default',
  hoverable = false,
  className = ''
}: {
  variant: CardVariant;
  hoverable: boolean;
  className?: string;
}): string {
  return cn(
    'bg-white rounded-lg font-work-sans',
    // Variant-specific styling
    {
      'border border-gray-200 shadow-sm': variant === 'default',
      'border border-[var(--divider-color)] shadow-sm transition-all duration-300': variant === 'interactive',
      'border border-gray-200': variant === 'outline',
      'border border-gray-200 shadow-md': variant === 'raised'
    },
    // Hover effects if enabled
    hoverable && {
      'hover:shadow-md hover:border-gray-300': variant === 'default',
      'hover:shadow-md hover:border-[var(--accent-color)] hover:border-opacity-50': variant === 'interactive',
      'hover:border-gray-300': variant === 'outline',
      'hover:shadow-lg': variant === 'raised'
    },
    className
  );
}

/**
 * Get classes for the card header
 */
export function getCardHeaderClasses(className?: string): string {
  return cn(
    'px-6 py-4 border-b border-gray-200 flex items-center justify-between font-sora',
    className
  );
}

/**
 * Get classes for the card content
 */
export function getCardContentClasses({
  withPadding = true,
  className = ''
}: {
  withPadding: boolean;
  className?: string;
}): string {
  return cn(
    withPadding ? 'px-6 py-4' : '',
    'font-work-sans',
    className
  );
}

/**
 * Get classes for the card footer
 */
export function getCardFooterClasses({
  align = 'right',
  withBorder = true,
  className = ''
}: {
  align: 'left' | 'center' | 'right' | 'between';
  withBorder: boolean;
  className?: string;
}): string {
  return cn(
    'px-6 py-4 flex items-center font-work-sans',
    // Border if enabled
    withBorder && 'border-t border-gray-200',
    // Alignment classes
    {
      'justify-start': align === 'left',
      'justify-center': align === 'center',
      'justify-end': align === 'right',
      'justify-between': align === 'between'
    },
    className
  );
}

/**
 * Get classes for the metric card
 */
export function getMetricCardClasses(className?: string): string {
  return cn(
    'p-6 bg-white border border-gray-200 rounded-lg shadow-sm font-work-sans',
    className
  );
}

/**
 * Get classes for trend indicators
 */
export function getTrendClasses(trend?: number): string {
  if (trend === undefined) return '';
  
  return cn(
    'ml-2 text-sm flex items-center',
    {
      'text-green-600': trend > 0,
      'text-red-600': trend < 0,
      'text-gray-600': trend === 0
    }
  );
} 