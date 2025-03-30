/**
 * Alert Component Styles
 * 
 * This file contains style utility functions for the Alert component.
 */

import { cn } from '@/utils/string/utils';
import { AlertStatus, AlertVariant } from '../types';

/**
 * Icon mapping for different alert statuses
 */
export const iconMap: Record<AlertStatus, string> = {
  success: 'checkCircle',
  error: 'xCircle',
  warning: 'warning',
  info: 'info',
};

/**
 * Icon color mapping for different alert statuses
 */
export const colorMap: Record<AlertStatus, string> = {
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  warning: 'text-amber-500 dark:text-amber-400',
  info: 'text-blue-500 dark:text-blue-400',
};

/**
 * Background color mapping for different alert statuses
 */
export const bgColorMap: Record<AlertStatus, string> = {
  success: 'bg-green-50 dark:bg-green-900/20',
  error: 'bg-red-50 dark:bg-red-900/20',
  warning: 'bg-amber-50 dark:bg-amber-900/20',
  info: 'bg-blue-50 dark:bg-blue-900/20',
};

/**
 * Border color mapping for different alert statuses
 */
export const borderColorMap: Record<AlertStatus, string> = {
  success: 'border-green-500 dark:border-green-400',
  error: 'border-red-500 dark:border-red-400',
  warning: 'border-amber-500 dark:border-amber-400',
  info: 'border-blue-500 dark:border-blue-400',
};

/**
 * Generate classes for the alert container
 */
export function getAlertClasses({
  status,
  variant,
  className,
}: {
  status: AlertStatus;
  variant: AlertVariant;
  className?: string;
}): string {
  return cn(
    'p-4 rounded-md flex items-start',
    variant === 'default' ? bgColorMap[status] : 'border',
    variant === 'bordered' && borderColorMap[status],
    className
  );
}

/**
 * Get icon classes for the alert icon
 */
export function getIconClasses(status: AlertStatus): string {
  return cn('h-5 w-5', colorMap[status]);
} 

// Default export added by auto-fix script
export default {
  iconMap,
  colorMap,
  bgColorMap,
  borderColorMap,
};
