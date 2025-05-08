import React from 'react';
import { toast } from 'react-hot-toast';
// import { Icon } from '@/components/ui/icon/icon'; // Standard Alias Import - FAILED
import { Icon } from '../components/ui/icon/icon'; // Testing Relative Path Import

/**
 * Displays a standardized success toast.
 * @param message The message to display.
 * @param iconId Optional FontAwesome icon ID to override the default (faFloppyDiskLight).
 */
export const showSuccessToast = (message: string, iconId?: string) => {
  const finalIconId = iconId || 'faFloppyDiskLight';
  const successIcon = <Icon iconId={finalIconId} className="h-5 w-5 text-success" />;
  toast.success(message, {
    duration: 3000, // Standard success duration 3s
    className: 'toast-success-custom', // Defined in globals.css
    icon: successIcon,
  });
};

/**
 * Displays a standardized error toast.
 * @param message The message to display.
 * @param iconId Optional FontAwesome icon ID to override the default (faTriangleExclamationLight).
 */
export const showErrorToast = (message: string, iconId?: string) => {
  const finalIconId = iconId || 'faTriangleExclamationLight';
  const errorIcon = <Icon iconId={finalIconId} className="h-5 w-5 text-destructive" />;
  toast.error(message, {
    duration: 5000, // Standard error duration 5s
    className: 'toast-error-custom', // Defined in globals.css
    icon: errorIcon,
  });
};
