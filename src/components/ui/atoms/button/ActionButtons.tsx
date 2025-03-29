import React, { forwardRef } from 'react';
import { IconButton } from './IconButton';
import type { IconButtonProps } from './types';
import { cn } from '@/utils/string/utils';

// Base action button type extending IconButtonProps
interface ActionButtonProps extends Omit<IconButtonProps, 'icon' | 'aria-label'> {
  /**
   * Optional text for tooltip
   */
  tooltip?: string;
  
  /**
   * Accessible label for the button
   */
  ariaLabel?: string;
}

/**
 * EditButton - Used for edit actions with proper hover effects
 */
export const EditButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, ariaLabel = 'Edit', tooltip = 'Edit', ...props }, ref) => {
    return (
      <IconButton
        ref={ref}
        icon="faPenToSquare"
        aria-label={ariaLabel}
        variant="ghost"
        title={tooltip}
        className={cn('text-gray-500 hover:text-blue-600', className)}
        {...props}
      />
    );
  }
);

EditButton.displayName = 'EditButton';

/**
 * ViewButton - Used for view/preview actions with proper hover effects
 */
export const ViewButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, ariaLabel = 'View', tooltip = 'View', ...props }, ref) => {
    return (
      <IconButton
        ref={ref}
        icon="faEye"
        aria-label={ariaLabel}
        variant="ghost"
        title={tooltip}
        className={cn('text-gray-500 hover:text-blue-600', className)}
        {...props}
      />
    );
  }
);

ViewButton.displayName = 'ViewButton';

/**
 * CopyButton - Used for copy actions with proper hover effects
 */
export const CopyButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, ariaLabel = 'Copy', tooltip = 'Copy', ...props }, ref) => {
    return (
      <IconButton
        ref={ref}
        icon="faCopy"
        aria-label={ariaLabel}
        variant="ghost"
        title={tooltip}
        className={cn('text-gray-500 hover:text-blue-600', className)}
        {...props}
      />
    );
  }
);

CopyButton.displayName = 'CopyButton';

/**
 * DeleteButton - Used for delete actions with proper hover effects
 */
export const DeleteButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, ariaLabel = 'Delete', tooltip = 'Delete', ...props }, ref) => {
    return (
      <IconButton
        ref={ref}
        icon="faTrashCan"
        aria-label={ariaLabel}
        variant="ghost"
        title={tooltip}
        className={cn('text-gray-500 hover:text-red-600', className)}
        {...props}
      />
    );
  }
);

DeleteButton.displayName = 'DeleteButton'; 