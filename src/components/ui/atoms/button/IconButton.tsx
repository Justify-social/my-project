import React, { forwardRef } from 'react';
import { IconButtonProps } from './types';
import { getButtonClasses } from './styles/button.styles';
import { Icon } from '@/components/ui/atoms/icons'

/**
 * IconButton component for icon-only buttons with proper accessibility.
 * 
 * @example
 * ```tsx
 * <IconButton 
 *   icon={<Icon name="trash" />} 
 *   aria-label="Delete item"
 *   variant="danger"
 * />
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  variant = 'default',
  size = 'md',
  loading = false,
  icon,
  'aria-label': ariaLabel,
  fullWidth = false,
  className,
  disabled,
  ...props
}, ref) => {
  if (!ariaLabel) {
    console.warn('IconButton: aria-label prop is required for accessibility');
  }

  const buttonClasses = getButtonClasses({
    variant,
    size,
    loading,
    fullWidth,
    className: `p-2 ${className || ''}`
  });

  return (
    <button
      ref={ref}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;