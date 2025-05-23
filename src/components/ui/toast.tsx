/**
 * @component Toast
 * @category atom
 * @subcategory feedback
 * @description Standardized toast notification functions for success and error messages with customizable icons.
 * @status 23rd May 2025
 * @author Justify
 * @since 2023-05-15
 */
import React from 'react';
import { toast } from 'react-hot-toast';
import { Icon } from '@/components/ui/icon/icon'; // Using alias for robustness

/**
 * Display a success toast notification
 * @param message - The message to display
 * @param iconId - Optional icon ID to display (defaults to faFloppyDiskLight)
 * @param duration - Optional duration in milliseconds (defaults to 3000)
 */
export const showSuccessToast = (
  message: string,
  iconId: string = 'faFloppyDiskLight',
  duration: number = 3000
) => {
  toast.success(message, {
    duration,
    className: 'success-toast',
    icon: <Icon iconId={iconId} className="text-white" />,
  });
};

/**
 * Display an error toast notification
 * @param message - The error message to display
 * @param iconId - Optional icon ID to display (defaults to faTriangleExclamationLight)
 * @param duration - Optional duration in milliseconds (defaults to 5000)
 */
export const showErrorToast = (
  message: string,
  iconId: string = 'faTriangleExclamationLight',
  duration: number = 5000
) => {
  toast.error(message, {
    duration,
    className: 'error-toast',
    icon: <Icon iconId={iconId} className="text-white" />,
  });
};
