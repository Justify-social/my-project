import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
'primary' |
'secondary' |
'outline' |
'ghost' |
'link' |
'danger';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style of the button
   * @default "primary"
   */
  variant?: ButtonVariant;

  /**
   * The size of the button
   * @default "md"
   */
  size?: ButtonSize;

  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Icon to show before the button text
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to show after the button text
   */
  rightIcon?: React.ReactNode;

  /**
   * Full width button (100%)
   * @default false
   */
  fullWidth?: boolean;
}

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
 * <Button leftIcon={<Icon />}>With Icon</Button>
 * 
 * // Different sizes
 * <Button size="sm">Small Button</Button>
 * <Button size="lg">Large Button</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
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
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 box-border';

  // Variant classes with inverted hover styles
  const variantClasses = {
    primary: 'bg-[var(--accent-color)] text-white border border-[var(--accent-color)] hover:bg-white hover:text-[var(--accent-color)] focus:ring-[var(--accent-color)]',
    secondary: 'bg-gray-100 text-gray-900 border border-gray-100 hover:bg-white hover:text-gray-900 hover:border-gray-300 focus:ring-gray-300',
    outline: 'border border-[var(--divider-color)] bg-transparent text-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-700 focus:ring-gray-300',
    ghost: 'bg-transparent text-gray-700 border border-transparent hover:bg-gray-700 hover:text-white focus:ring-gray-300',
    link: 'bg-transparent underline text-[var(--accent-color)] border-0 hover:text-[#008ecb] p-0 focus:ring-0',
    danger: 'bg-red-600 text-white border border-red-600 hover:bg-white hover:text-red-600 focus:ring-red-500'
  };

  // Size classes
  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-2.5',
    xl: 'text-xl px-6 py-3'
  };

  // Loading state classes
  const loadingClasses = loading ? 'opacity-80 cursor-not-allowed' : '';

  // Full width class
  const fullWidthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loadingClasses,
        fullWidthClass,
        className
      )} font-work-sans`}
      {...props}>

      {loading &&
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current font-work-sans"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24">

          <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4" />

          <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />

        </svg>
      }
      
      {leftIcon && !loading &&
      <span className="mr-2 font-work-sans">{leftIcon}</span>
      }
      
      {children}
      
      {rightIcon &&
      <span className="ml-2 font-work-sans">{rightIcon}</span>
      }
    </button>);

});

Button.displayName = 'Button';

export default Button;