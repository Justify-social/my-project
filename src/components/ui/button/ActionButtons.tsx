import React, { forwardRef } from 'react';
import { IconButton, IconButtonProps } from './IconButton';
import { cn } from '@/lib/utils';

// Base action button type extending IconButtonProps
interface ActionButtonProps extends Omit<IconButtonProps, 'icon' | 'action'> {
  /**
   * Optional text for tooltip
   */
  tooltip?: string;
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
        action="default"
        ariaLabel={ariaLabel}
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
        action="default"
        ariaLabel={ariaLabel}
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
        action="default"
        ariaLabel={ariaLabel}
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
        action="delete"
        ariaLabel={ariaLabel}
        variant="ghost"
        title={tooltip}
        className={cn('text-gray-500 hover:text-red-600', className)}
        {...props}
      />
    );
  }
);

DeleteButton.displayName = 'DeleteButton'; 