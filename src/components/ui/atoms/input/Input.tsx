'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { InputProps } from './types';
import { Icon } from '../icons/Icon';

/**
 * Input component
 * 
 * A flexible input component with support for validation, icons, and various states.
 * 
 * @example
 * ```tsx
 * // Basic input with label
 * <Input label="Email" type="email" placeholder="Enter your email" />
 * 
 * // Input with error state
 * <Input label="Username" error="Username is required" />
 * 
 * // Input with icons
 * <Input leftIcon={<Icon name="user" />} rightIcon={<Icon name="check" />} />
 * 
 * // Input with help text
 * <Input label="Password" type="password" helpText="Must be at least 8 characters" />
 * 
 * // Different sizes
 * <Input inputSize="sm" placeholder="Small input" />
 * <Input inputSize="lg" placeholder="Large input" />
 * 
 * // Full width
 * <Input fullWidth placeholder="Full width input" />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    type = 'text',
    label,
    helpText,
    error,
    fullWidth = false,
    inputSize = 'md',
    leftIcon,
    rightIcon,
    containerClassName,
    wrapperClassName,
    labelClassName,
    helpTextClassName,
    errorClassName,
    id,
    required,
    disabled,
    ...props 
  }, ref) => {
    // Generate unique ID for input if not provided
    const uniqueId = React.useId();
    const inputId = id || `input-${uniqueId}`;
    
    // Size classes
    const inputSizeClasses = {
      sm: 'h-8 px-2 py-1 text-xs',
      md: 'h-10 px-3 py-2 text-sm',
      lg: 'h-12 px-4 py-3 text-base'
    };
    
    // Icon sizes based on input size
    const iconSizes = {
      sm: 'xs',
      md: 'sm', 
      lg: 'md'
    };
    
    // Error state
    const hasError = !!error;
    
    // Common spacing for left/right icons
    const leftIconSpacing = leftIcon ? 'pl-9' : '';
    const rightIconSpacing = rightIcon ? 'pr-9' : '';
    
    return (
      <div className={cn(
        'flex flex-col space-y-1',
        fullWidth ? 'w-full' : '',
        containerClassName
      )}>
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium text-primary',
              {
                'text-xs': inputSize === 'sm',
                'text-sm': inputSize === 'md',
                'text-base': inputSize === 'lg',
              },
              labelClassName
            )}
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        
        <div className={cn(
          'relative flex items-center',
          fullWidth ? 'w-full' : '',
          wrapperClassName
        )}>
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none">
              {typeof leftIcon === 'string' ? (
                <Icon name={leftIcon} size={iconSizes[inputSize]} variant="light" className="text-secondary" />
              ) : (
                leftIcon
              )}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              // Base styles
              "flex w-full rounded-md border bg-background transition-colors",
              "placeholder:text-secondary/60 focus:outline-none",
              
              // State styles
              "focus:ring-2 focus:ring-offset-1 focus:ring-interactive/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
              
              // Conditional styles
              hasError 
                ? "border-destructive focus:ring-destructive/30" 
                : "border-divider hover:border-interactive/50",
                
              // Size and spacing
              inputSizeClasses[inputSize],
              leftIconSpacing,
              rightIconSpacing,
              
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={
              hasError 
                ? `${inputId}-error` 
                : helpText 
                  ? `${inputId}-help` 
                  : undefined
            }
            required={required}
            disabled={disabled}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none">
              {typeof rightIcon === 'string' ? (
                <Icon name={rightIcon} size={iconSizes[inputSize]} variant="light" className="text-secondary" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        
        {helpText && !error && (
          <p 
            id={`${inputId}-help`}
            className={cn(
              'text-secondary text-xs',
              helpTextClassName
            )}
          >
            {helpText}
          </p>
        )}
        
        {error && (
          <p 
            id={`${inputId}-error`}
            className={cn(
              'text-destructive text-xs',
              errorClassName
            )}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 
/**
 * Default export for Input
 */
export default Input;
