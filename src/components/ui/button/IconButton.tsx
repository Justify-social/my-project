import React, { forwardRef } from 'react';
import { SafeIcon } from '../icons/safe-icon';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The icon name to display
   */
  icon: string;
  
  /**
   * The visual style of the button
   * @default "ghost"
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
   * Action type for the icon (affects color)
   */
  action?: 'default' | 'delete' | 'warning' | 'success';
  
  /**
   * Accessibility label for the button
   */
  ariaLabel?: string;
  
  /**
   * Additional props for the icon
   */
  iconProps?: Record<string, any>;
}

/**
 * IconButton component for icon-only actions with proper hover effects
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  loading,
  action = 'default',
  ariaLabel,
  iconProps = {},
  className = '',
  disabled,
  ...props
}, ref) => {
  // Use loading as fallback for isLoading for backward compatibility
  const isButtonLoading = isLoading || loading;

  // Size classes mapping for the button
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'p-1';
      case 'sm': return 'p-1.5';
      case 'md': return 'p-2';
      case 'lg': return 'p-2.5';
      case 'xl': return 'p-3';
      default: return 'p-2';
    }
  };

  // Size classes for the icons
  const getIconSizeClasses = () => {
    switch (size) {
      case 'xs': return 'h-3 w-3';
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-5 w-5';
      case 'lg': return 'h-6 w-6';
      case 'xl': return 'h-7 w-7';
      default: return 'h-5 w-5';
    }
  };

  // Variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--accent-color)] text-white border border-[var(--accent-color)] hover:bg-white hover:text-[var(--accent-color)] focus:ring-[var(--accent-color)]';
      case 'secondary':
        return 'bg-gray-100 text-gray-900 border border-gray-100 hover:bg-white hover:text-gray-900 hover:border-gray-300 focus:ring-gray-300';
      case 'outline':
        return 'border border-[var(--divider-color)] bg-transparent text-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-700 focus:ring-gray-300';
      case 'ghost':
        return 'bg-transparent text-gray-700 border border-transparent hover:bg-gray-100 focus:ring-gray-300';
      case 'link':
        return 'bg-transparent text-[var(--accent-color)] border-0 hover:text-[#008ecb] p-0 focus:ring-0';
      case 'danger':
        return 'bg-red-600 text-white border border-red-600 hover:bg-white hover:text-red-600 focus:ring-red-500';
      default:
        return 'bg-transparent text-gray-700 border border-transparent hover:bg-gray-100 focus:ring-gray-300';
    }
  };

  return (
    <button
      ref={ref}
      aria-label={ariaLabel || `${icon} icon button`}
      disabled={disabled || isButtonLoading}
      className={cn(
        // Base classes
        "group inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 box-border",
        // Variant and size classes
        getVariantClasses(),
        getSizeClasses(),
        // Loading state
        isButtonLoading ? 'opacity-80 cursor-not-allowed' : '',
        // Additional classes
        className
      )}
      {...props}
    >
      {isButtonLoading ? (
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
        <SafeIcon
          icon={icon}
          className={getIconSizeClasses()}
          iconType="button"
          action={action}
          {...iconProps}
        />
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;