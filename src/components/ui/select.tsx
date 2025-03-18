'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './icon';

export interface SelectOption {
  /**
   * The value of the option
   */
  value: string;
  
  /**
   * The label to display
   */
  label: string;
  
  /**
   * Whether the option is disabled
   */
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Options to display in the select
   * Can be provided as SelectOption[] or as children <option> elements
   */
  options?: SelectOption[];
  
  /**
   * Placeholder text for the select
   */
  placeholder?: string;
  
  /**
   * Whether to display a chevron icon
   */
  showChevron?: boolean;
  
  /**
   * Size of the select
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Full width of parent container
   */
  fullWidth?: boolean;
  
  /**
   * Whether the select has an error
   */
  error?: boolean;
  
  /**
   * The container's additional className
   */
  containerClassName?: string;
}

/**
 * Select component that extends the HTML select with consistent styling
 * and better accessibility
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    options,
    placeholder,
    showChevron = true,
    size = 'md',
    fullWidth = false,
    error = false,
    className,
    containerClassName,
    children,
    ...props
  }, ref) => {
    // Helper to determine the height based on size
    const sizeClasses = {
      sm: 'h-8 text-xs',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };
    
    // Error styles
    const errorStyles = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-900 placeholder-red-300'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    
    return (
      <div className={cn(
        'relative',
        fullWidth ? 'w-full' : '',
        containerClassName
      )}>
        <select
          ref={ref}
          className={cn(
            'block w-full appearance-none rounded-md border bg-white px-3 shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-opacity-50',
            sizeClasses[size],
            errorStyles,
            showChevron && 'pr-10',
            className
          )}
          aria-invalid={error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={props.required}>
              {placeholder}
            </option>
          )}
          
          {options ? (
            options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        
        {showChevron && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3" style={{ margin: '1px' }}>
            <Icon
              name="chevronDown"
              className={cn(
                'h-5 w-5',
                error ? 'text-red-500' : 'text-gray-500'
              )}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select'; 