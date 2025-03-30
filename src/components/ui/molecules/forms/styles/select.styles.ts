/**
 * Select Component Styles
 * 
 * This file contains style utility functions for the Select component.
 */

import { cn } from '@/utils/string/utils';
import { SelectSize } from '../types';

/**
 * Get size-based classes for select
 */
export function getSelectSizeClasses(size: SelectSize): string {
  const sizeClasses: Record<SelectSize, string> = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  };
  
  return sizeClasses[size];
}

/**
 * Generate classes for the select element
 */
export function getSelectClasses({
  size = 'md',
  error = false,
  showChevron = true,
  className = ''
}: {
  size: SelectSize;
  error?: boolean;
  showChevron?: boolean;
  className?: string;
}): string {
  // Error styles
  const errorStyles = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-900 placeholder-red-300' 
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  return cn(
    'block w-full appearance-none rounded-md border bg-white px-3 shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-opacity-50',
    getSelectSizeClasses(size),
    errorStyles,
    showChevron && 'pr-10',
    className
  );
}

/**
 * Generate classes for the select container
 */
export function getContainerClasses({
  fullWidth = false,
  containerClassName = ''
}: {
  fullWidth?: boolean;
  containerClassName?: string;
}): string {
  return cn(
    'relative',
    fullWidth ? 'w-full' : '',
    containerClassName
  );
}

/**
 * Generate classes for the chevron icon
 */
export function getChevronClasses(error: boolean): string {
  return cn(
    'h-5 w-5',
    error ? 'text-red-500' : 'text-gray-500'
  );
} 

// Default export added by auto-fix script
export default {};
