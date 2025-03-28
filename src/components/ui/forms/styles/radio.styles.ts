/**
 * Radio Component Styles
 * 
 * This file contains style utility functions for the Radio component.
 */

import { cn } from '@/utils/string/utils';
import { RadioSize, LabelPosition, RadioOrientation } from '../types';

/**
 * Get size-based classes for radio
 */
export function getRadioSizeClasses(size: RadioSize): string {
  const sizeClasses: Record<RadioSize, string> = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  return sizeClasses[size];
}

/**
 * Generate classes for the radio input element
 */
export function getRadioClasses({
  size = 'md',
  disabled = false,
  className = ''
}: {
  size: RadioSize;
  disabled?: boolean;
  className?: string;
}): string {
  return cn(
    'border-gray-300 text-blue-600 shadow-sm',
    'focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
    disabled && 'opacity-50 cursor-not-allowed',
    getRadioSizeClasses(size),
    className
  );
}

/**
 * Generate classes for the label element
 */
export function getLabelClasses({
  labelPosition = 'right',
  disabled = false,
  labelClassName = ''
}: {
  labelPosition: LabelPosition;
  disabled?: boolean;
  labelClassName?: string;
}): string {
  return cn(
    'text-sm font-medium text-gray-700',
    labelPosition === 'left' ? 'mr-2' : 'ml-2',
    disabled && 'opacity-50 cursor-not-allowed',
    labelClassName
  );
}

/**
 * Generate classes for the radio group container
 */
export function getRadioGroupClasses({
  orientation = 'vertical',
  className = ''
}: {
  orientation: RadioOrientation;
  className?: string;
}): string {
  return cn(
    'flex',
    orientation === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2',
    className
  );
} 