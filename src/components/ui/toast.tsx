/**
 * @component Toast
 * @category atom
 * @subcategory feedback
 * @description SSOT toast notification functions for success and error messages with branded styling.
 * Uses global.css classes for proper borders (green for success, red for error, orange for warning).
 * @status 23rd May 2025
 * @author Justify
 * @since 2023-05-15
 */
import React from 'react';
import { toast } from 'react-hot-toast';
import { Icon } from '@/components/ui/icon/icon';

/**
 * Display a success toast notification with green border
 * @param message - The message to display
 * @param iconId - Optional icon ID from registry (defaults to faCircleCheckLight)
 * @param duration - Optional duration in milliseconds (defaults to 3000)
 */
export const showSuccessToast = (
  message: string,
  iconId: string = 'faCircleCheckLight',
  duration: number = 3000
) => {
  toast.success(message, {
    duration,
    className: 'toast-success-custom', // Uses global.css for green border
    icon: <Icon iconId={iconId} className="text-green-600" />,
  });
};

/**
 * Display an error toast notification with red border
 * @param message - The error message to display
 * @param iconId - Optional icon ID from registry (defaults to faTriangleExclamationLight)
 * @param duration - Optional duration in milliseconds (defaults to 5000)
 */
export const showErrorToast = (
  message: string,
  iconId: string = 'faTriangleExclamationLight',
  duration: number = 5000
) => {
  toast.error(message, {
    duration,
    className: 'toast-error-custom', // Uses global.css for red border
    icon: <Icon iconId={iconId} className="text-red-600" />,
  });
};

/**
 * Display a warning toast notification with orange border
 * @param message - The warning message to display
 * @param iconId - Optional icon ID from registry (defaults to faTriangleExclamationLight)
 * @param duration - Optional duration in milliseconds (defaults to 4000)
 */
export const showWarningToast = (
  message: string,
  iconId: string = 'faTriangleExclamationLight',
  duration: number = 4000
) => {
  toast(message, {
    duration,
    className: 'toast-warning-custom', // We'll add this to global.css
    icon: <Icon iconId={iconId} className="text-orange-600" />,
  });
};
