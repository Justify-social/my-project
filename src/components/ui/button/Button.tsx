import React, { forwardRef } from 'react';
import { SafeIcon } from '../icons/safe-icon';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style of the button
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';

  /**
   * The size of the button
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Whether the button is in a loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Alias for isLoading for backward compatibility
   * @deprecated Use isLoading instead
   */
  loading?: boolean;

  /**
   * Name of the icon to show before the button text
   */
  leftIcon?: string;

  /**
   * Name of the icon to show after the button text
   */
  rightIcon?: string;

  /**
   * Additional props for the icons
   */
  iconProps?: Record<string, any>;

  /**
   * Full width button (100%)
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Button component for actions in forms, dialogs, and more with proper icon integration.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading,
  leftIcon,
  rightIcon,
  iconProps = {},
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}, ref) => {
  // Use loading as fallback for isLoading for backward compatibility
  const isButtonLoading = isLoading || loading;

  // Determine the action type for the icons based on variant
  const iconAction = variant === 'danger' ? 'delete' : 'default';

  // Size classes for the button
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'px-2 py-1 text-xs';
      case 'sm': return 'px-3 py-1.5 text-sm';
      case 'md': return 'px-4 py-2 text-base';
      case 'lg': return 'px-5 py-2.5 text-lg';
      case 'xl': return 'px-6 py-3 text-xl';
      default: return 'px-4 py-2 text-base';
    }
  };

  // Size classes for the icons
  const getIconSizeClasses = () => {
    switch (size) {
      case 'xs': return 'h-3 w-3';
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-5 w-5';
      case 'lg': return 'h-5 w-5';
      case 'xl': return 'h-6 w-6';
      default: return 'h-5 w-5';
    }
  };

  // Variant classes with inverted hover styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--accent-color)] text-white border border-[var(--accent-color)] hover:bg-white hover:text-[var(--accent-color)] focus:ring-[var(--accent-color)]';
      case 'secondary':
        return 'bg-gray-100 text-gray-900 border border-gray-100 hover:bg-white hover:text-gray-900 hover:border-gray-300 focus:ring-gray-300';
      case 'outline':
        return 'border border-[var(--divider-color)] bg-transparent text-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-700 focus:ring-gray-300';
      case 'ghost':
        return 'bg-transparent text-gray-700 border border-transparent hover:bg-gray-700 hover:text-white focus:ring-gray-300';
      case 'link':
        return 'bg-transparent underline text-[var(--accent-color)] border-0 hover:text-[#008ecb] p-0 focus:ring-0';
      case 'danger':
        return 'bg-red-600 text-white border border-red-600 hover:bg-white hover:text-red-600 focus:ring-red-500';
      default:
        return 'bg-[var(--accent-color)] text-white border border-[var(--accent-color)] hover:bg-white hover:text-[var(--accent-color)] focus:ring-[var(--accent-color)]';
    }
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isButtonLoading}
      className={cn(
        // Base classes
        "group inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 box-border font-work-sans",
        // Variant, size and width classes
        getVariantClasses(),
        getSizeClasses(),
        fullWidth ? 'w-full' : '',
        // Loading state
        isButtonLoading ? 'opacity-80 cursor-not-allowed' : '',
        // Additional classes
        className
      )}
      {...props}
    >
      {isButtonLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
      )}

      {leftIcon && !isButtonLoading && (
        <span className="mr-2">
          <SafeIcon
            icon={leftIcon}
            className={getIconSizeClasses()}
            iconType="button"
            action={iconAction}
            {...iconProps}
          />
        </span>
      )}

      {children}

      {rightIcon && (
        <span className="ml-2">
          <SafeIcon
            icon={rightIcon}
            className={getIconSizeClasses()}
            iconType="button"
            action={iconAction}
            {...iconProps}
          />
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;