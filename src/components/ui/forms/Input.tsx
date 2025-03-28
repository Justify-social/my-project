import React, { forwardRef } from 'react';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/icons';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Label for the input
   */
  label?: string;

  /**
   * Help text to display below the input
   */
  helpText?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Whether to display the full width input
   * @default false
   */
  fullWidth?: boolean;

  /**
   * The size of the input
   * @default "md"
   */
  inputSize?: 'sm' | 'md' | 'lg';

  /**
   * Left icon
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon
   */
  rightIcon?: React.ReactNode;

  /**
   * Container class for the entire input group
   */
  containerClassName?: string;

  /**
   * Input wrapper class
   */
  wrapperClassName?: string;

  /**
   * Label class
   */
  labelClassName?: string;

  /**
   * Help text class
   */
  helpTextClassName?: string;

  /**
   * Error class
   */
  errorClassName?: string;
}

/**
 * Input component for collecting user data.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Input label="Email" type="email" placeholder="Enter your email" />
 * 
 * // With help text
 * <Input label="Username" helpText="Choose a unique username" />
 * 
 * // With error state
 * <Input label="Password" type="password" error="Password is required" />
 * 
 * // With icons
 * <Input leftIcon={<Icon />} rightIcon={<Icon />} />
 * 
 * // Different sizes
 * <Input inputSize="sm" />
 * <Input inputSize="lg" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helpText,
  error,
  fullWidth = false,
  inputSize = 'md',
  className,
  leftIcon,
  rightIcon,
  containerClassName,
  wrapperClassName,
  labelClassName,
  helpTextClassName,
  errorClassName,
  disabled,
  id,
  ...props
}, ref) => {
  // Generate an ID if one is not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  // Base classes for the input
  const inputClasses = cn(
    'w-full rounded-md border border-[var(--divider-color)] bg-white text-gray-900 placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]',
    'disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed',
    error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '',
    sizeClasses[inputSize],
    leftIcon ? 'pl-9' : '',
    rightIcon ? 'pr-9' : '',
    className
  );

  // Width classes
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${cn('flex flex-col space-y-1', widthClass, containerClassName)} font-work-sans`}>
      {label &&
      <label
        htmlFor={inputId}
        className={`${cn(
          'text-sm font-medium text-gray-700',
          disabled ? 'opacity-50' : '',
          labelClassName
        )} font-work-sans`}>

          {label}
        </label>
      }
      
      <div className={`${cn('relative', wrapperClassName)} font-work-sans`}>
        {leftIcon &&
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 font-work-sans">
            {leftIcon}
          </div>
        }
        
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={`${inputClasses} font-work-sans`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={helpText || error ? `${inputId}-description` : undefined}
          {...props} />

        
        {rightIcon &&
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 font-work-sans">
            {rightIcon}
          </div>
        }
      </div>
      
      {/* Help text or error message */}
      {(helpText || error) &&
      <div
        id={`${inputId}-description`}
        className={`${cn(
          'text-sm',
          error ? cn('text-red-500', errorClassName) : cn('text-gray-500', helpTextClassName)
        )} font-work-sans`}>

          {error || helpText}
        </div>
      }
    </div>);

});

Input.displayName = 'Input';

export default Input;