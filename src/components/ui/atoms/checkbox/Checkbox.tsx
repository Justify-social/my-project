'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { CheckboxProps } from './types';

/**
 * Checkbox component with consistent styling and accessibility
 * 
 * Checkboxes allow users to select one or more items from a set.
 * They can also be used to turn an option on or off.
 * 
 * @example
 * ```tsx
 * // Basic checkbox with label
 * <Checkbox label="Accept terms" />
 * 
 * // Checkbox with different sizes
 * <Checkbox label="Small option" size="sm" />
 * <Checkbox label="Large option" size="lg" />
 * 
 * // Checkbox with left-positioned label
 * <Checkbox label="Left label" labelPosition="left" />
 * 
 * // Disabled checkbox
 * <Checkbox label="Disabled option" disabled />
 * 
 * // Indeterminate state
 * <Checkbox label="Indeterminate" indeterminate />
 * 
 * // With custom colors
 * <Checkbox label="Accent color" color="accent" />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    label,
    labelPosition = 'right',
    size = 'md',
    color = 'interactive',
    className,
    checkboxClassName,
    labelClassName,
    indeterminate = false,
    disabled = false,
    required = false,
    id,
    ...props
  }, forwardedRef) => {
    // We need an internal ref to handle the indeterminate state
    const internalRef = useRef<HTMLInputElement | null>(null);
    const uniqueId = useRef<string>(id || `checkbox-${Math.random().toString(36).substring(2, 11)}`);

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
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };
    
    // Handle label size based on checkbox size
    const labelSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };
    
    // Color variants
    const colorClasses = {
      interactive: "text-interactive border-divider focus:ring-interactive/30",
      primary: "text-primary border-divider focus:ring-primary/30",
      accent: "text-accent border-divider focus:ring-accent/30",
      secondary: "text-secondary border-divider focus:ring-secondary/30",
      success: "text-success border-divider focus:ring-success/30",
      warning: "text-warning border-divider focus:ring-warning/30",
      destructive: "text-destructive border-divider focus:ring-destructive/30",
    };

    // Base checkbox input with consistent styling
    const checkbox = (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={uniqueId.current}
          ref={handleRef}
          disabled={disabled}
          aria-checked={indeterminate ? "mixed" : undefined}
          required={required}
          className={cn(
            "peer appearance-none rounded",
            "border focus:outline-none focus:ring-2 focus:ring-offset-2",
            "transition-colors",
            sizeClasses[size],
            colorClasses[color],
            disabled && "opacity-50 cursor-not-allowed",
            checkboxClassName
          )}
          {...props}
        />
        <svg
          className={cn(
            "absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity",
            sizeClasses[size]
          )}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
            className={disabled ? "stroke-gray-400" : `stroke-current`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {indeterminate && (
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform",
              "h-[2px] rounded-sm",
              disabled ? "bg-gray-400" : "bg-current",
              {
                "w-2": size === "sm",
                "w-2.5": size === "md",
                "w-3": size === "lg"
              }
            )}
          />
        )}
      </div>
    );

    // If no label, just return the checkbox
    if (!label) {
      return checkbox;
    }

    // With label, create a proper accessible label element
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {labelPosition === 'left' && (
          <label
            htmlFor={uniqueId.current}
            className={cn(
              labelSizeClasses[size],
              "font-medium text-primary select-none",
              disabled && "opacity-50 cursor-not-allowed",
              labelClassName
            )}
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        
        {checkbox}
        
        {labelPosition === 'right' && (
          <label
            htmlFor={uniqueId.current}
            className={cn(
              labelSizeClasses[size],
              "font-medium text-primary select-none",
              disabled && "opacity-50 cursor-not-allowed",
              labelClassName
            )}
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox; 