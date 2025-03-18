'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /**
   * Label for the checkbox
   */
  label?: string;

  /**
   * Position of the label relative to the checkbox
   */
  labelPosition?: 'left' | 'right';

  /**
   * Size of the checkbox
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the checkbox is in an indeterminate state
   */
  indeterminate?: boolean;

  /**
   * Additional className for the label
   */
  labelClassName?: string;
}

/**
 * Checkbox component with consistent styling and accessibility support
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    labelPosition = 'right', 
    size = 'md', 
    className,
    labelClassName,
    indeterminate = false,
    disabled = false,
    ...props 
  }, forwardedRef) => {
    // We need an internal ref to handle the indeterminate state
    const internalRef = useRef<HTMLInputElement | null>(null);
    
    // Merge refs
    const handleRef = (el: HTMLInputElement) => {
      internalRef.current = el;
      
      if (typeof forwardedRef === 'function') {
        forwardedRef(el);
      } else if (forwardedRef) {
        forwardedRef.current = el;
      }
    };
    
    // Update indeterminate state when it changes
    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);
    
    // Handle size variants
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };
    
    // If we have no label, render just the checkbox
    if (!label) {
      return (
        <input
          type="checkbox"
          ref={handleRef}
          className={cn(
            'rounded border-gray-300 text-blue-600 shadow-sm',
            'focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
            disabled && 'opacity-50 cursor-not-allowed',
            sizeClasses[size],
            className
          )}
          disabled={disabled}
          {...props}
        />
      );
    }
    
    return (
      <div className="flex items-center">
        {labelPosition === 'left' && (
          <label 
            htmlFor={props.id}
            className={cn(
              'mr-2 text-sm font-medium text-gray-700', 
              disabled && 'opacity-50 cursor-not-allowed',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        
        <input
          type="checkbox"
          ref={handleRef}
          className={cn(
            'rounded border-gray-300 text-blue-600 shadow-sm',
            'focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
            disabled && 'opacity-50 cursor-not-allowed',
            sizeClasses[size],
            className
          )}
          disabled={disabled}
          {...props}
        />
        
        {labelPosition === 'right' && (
          <label 
            htmlFor={props.id}
            className={cn(
              'ml-2 text-sm font-medium text-gray-700', 
              disabled && 'opacity-50 cursor-not-allowed',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox'; 