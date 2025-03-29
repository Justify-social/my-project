import React, { forwardRef } from 'react';
import { ButtonProps } from './types';
import { getButtonClasses } from './styles/button.styles';

/**
 * Button component for actions in forms, dialogs, and more.
 * 
 * @example
 * ```tsx
 * // Primary button (default)
 * <Button>Primary Button</Button>
 * 
 * // Secondary button
 * <Button variant="secondary">Secondary Button</Button>
 * 
 * // With loading state
 * <Button loading>Loading...</Button>
 * 
 * // With icon
 * <Button leftIcon="faPlus">With Icon</Button>
 * 
 * // Different sizes
 * <Button size="sm">Small Button</Button>
 * <Button size="lg">Large Button</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'default',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}, ref) => {
  const buttonClasses = getButtonClasses({
    variant,
    size,
    loading,
    fullWidth,
    className
  });

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current font-work-sans"
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
      
      {leftIcon && !loading && (
        <span className="mr-2 font-work-sans">{leftIcon}</span>
      )}
      
      {children}
      
      {rightIcon && (
        <span className="ml-2 font-work-sans">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;