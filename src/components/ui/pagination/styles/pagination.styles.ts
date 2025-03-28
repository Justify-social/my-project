/**
 * Pagination Component Styles
 * 
 * This file contains style utility functions for the Pagination component system.
 */

import { cn } from '@/utils/string/utils';

/**
 * Get classes for pagination container
 */
export function getPaginationContainerClasses({
  className = ''
}: {
  className?: string;
}): string {
  return cn(
    'flex items-center justify-between py-3 font-work-sans',
    className
  );
}

/**
 * Get classes for page size selector container
 */
export function getPageSizeSelectorClasses({
  className = ''
}: {
  className?: string;
}): string {
  return cn(
    'flex items-center space-x-2',
    className
  );
}

/**
 * Get classes for page size selector dropdown
 */
export function getPageSizeSelectClasses({
  className = ''
}: {
  className?: string;
}): string {
  return cn(
    'rounded-md border border-gray-200 px-2 py-1 text-sm font-work-sans',
    className
  );
}

/**
 * Get classes for info text
 */
export function getInfoTextClasses({
  className = ''
}: {
  className?: string;
}): string {
  return cn(
    'text-sm text-gray-700',
    className
  );
}

/**
 * Get classes for pagination controls container
 */
export function getPaginationControlsClasses({
  className = ''
}: {
  className?: string;
}): string {
  return cn(
    'flex items-center space-x-1',
    className
  );
}

/**
 * Get classes for pagination button
 */
export function getPaginationButtonClasses({
  className = '',
  isActive = false,
  isDisabled = false
}: {
  className?: string;
  isActive?: boolean;
  isDisabled?: boolean;
}): string {
  return cn(
    'px-3 py-1 rounded-md text-sm font-medium font-work-sans',
    isActive && 'bg-blue-50 text-[var(--interactive-color)]',
    !isActive && !isDisabled && 'hover:bg-gray-100',
    isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 cursor-pointer',
    className
  );
} 