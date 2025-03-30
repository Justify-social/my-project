'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/atoms/icons'

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
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
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
    lg: 'h-12 text-base'
  };

  // Error styles
  const errorStyles = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-900 placeholder-red-300' 
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    
  return (
    <div className={`${cn('relative', fullWidth ? 'w-full' : '', containerClassName)} font-work-sans`}>
      <select 
        ref={ref} 
        className={`${cn(
          'block w-full appearance-none rounded-md border bg-white px-3 shadow-sm', 
          'focus:outline-none focus:ring-2 focus:ring-opacity-50', 
          sizeClasses[size], 
          errorStyles, 
          showChevron && 'pr-10', 
          className
        )} font-work-sans`} 
        aria-invalid={error} 
        {...props}
      >
        {placeholder && (
          <option value="" disabled={props.required}>
            {placeholder}
          </option>
        )}
        
        {options 
          ? options.map((option) => (
              <option 
                key={option.value} 
                value={option.value} 
                disabled={option.disabled}
              >
                {option.label}
              </option>
            )) 
          : children}
      </select>
      
      {showChevron && (
        <div 
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 font-work-sans" 
          style={{ margin: '1px' }}
        >
          <Icon 
            name="faChevronDown" 
            className={cn('h-5 w-5', error ? 'text-red-500' : 'text-gray-500')} 
            aria-hidden="true" 
            solid={false} 
          />
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Enhanced contextual select components
// These components provide a more customizable select experience

/**
 * ComposableSelect component - Container for custom select UI
 * To be used with SelectTrigger, SelectValue, SelectContent, and SelectItem
 */
export interface ComposableSelectProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The current value of the select
   */
  value?: string;
  
  /**
   * Default value if no value is provided
   */
  defaultValue?: string;
  
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string) => void;
}

export const ComposableSelect = forwardRef<HTMLDivElement, ComposableSelectProps>(
  ({ children, className, defaultValue, value, onValueChange, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');

    const handleValueChange = (newValue: string) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          
          return React.cloneElement(child, {
            value: selectedValue,
            onValueChange: handleValueChange,
          } as React.HTMLAttributes<HTMLElement>);
        })}
      </div>
    );
  }
);

ComposableSelect.displayName = 'ComposableSelect';

/**
 * SelectTrigger component - Button that opens the select dropdown
 */
export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button 
        ref={ref} 
        className={cn(
          'flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
          className
        )} 
        type="button"
        {...props}
      >
        {children}
        <Icon 
          name="faChevronDown" 
          className="ml-2 h-4 w-4 opacity-70" 
          aria-hidden="true" 
          solid={false} 
        />
      </button>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

/**
 * SelectValue component - Displays the selected value
 */
export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

export const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ children, placeholder, className, ...props }, ref) => {
    return (
      <span ref={ref} className={cn('block truncate', className)} {...props}>
        {children || placeholder || 'Select an option'}
      </span>
    );
  }
);

SelectValue.displayName = 'SelectValue';

/**
 * SelectContent component - Container for select options
 */
export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(
          'absolute z-50 mt-1 max-h-60 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md',
          className
        )} 
        {...props}
      >
        {children}
      </div>
    );
  }
);

SelectContent.displayName = 'SelectContent';

/**
 * SelectItem component - Individual select option
 */
export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onSelect?: (value: string) => void;
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, value, onSelect, onValueChange, ...props }, ref) => {
    const handleClick = () => {
      if (onSelect) onSelect(value);
      if (onValueChange) (onValueChange as any)(value);
    };

    return (
      <div 
        ref={ref} 
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100',
          className
        )} 
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SelectItem.displayName = 'SelectItem';

export default Select; 