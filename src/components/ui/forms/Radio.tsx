'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/utils/string/utils';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /**
   * Label for the radio button
   */
  label?: string;

  /**
   * Position of the label relative to the radio button
   */
  labelPosition?: 'left' | 'right';

  /**
   * Size of the radio button
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Additional className for the label
   */
  labelClassName?: string;
}

/**
 * Radio component with consistent styling and accessibility support
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({
    label,
    labelPosition = 'right',
    size = 'md',
    className,
    labelClassName,
    disabled = false,
    ...props
  }, ref) => {
    // Handle size variants
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    // If we have no label, render just the radio button
    if (!label) {
      return (
        <input
          type="radio"
          ref={ref}
          className={`${cn(
            'border-gray-300 text-blue-600 shadow-sm',
            'focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
            disabled && 'opacity-50 cursor-not-allowed',
            sizeClasses[size],
            className
          )} font-work-sans`}
          disabled={disabled}
          {...props} />);


    }

    return (
      <div className="flex items-center font-work-sans">
        {labelPosition === 'left' &&
        <label
          htmlFor={props.id}
          className={`${cn(
            'mr-2 text-sm font-medium text-gray-700',
            disabled && 'opacity-50 cursor-not-allowed',
            labelClassName
          )} font-work-sans`}>

            {label}
          </label>
        }
        
        <input
          type="radio"
          ref={ref}
          className={`${cn(
            'border-gray-300 text-blue-600 shadow-sm',
            'focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
            disabled && 'opacity-50 cursor-not-allowed',
            sizeClasses[size],
            className
          )} font-work-sans`}
          disabled={disabled}
          {...props} />

        
        {labelPosition === 'right' &&
        <label
          htmlFor={props.id}
          className={`${cn(
            'ml-2 text-sm font-medium text-gray-700',
            disabled && 'opacity-50 cursor-not-allowed',
            labelClassName
          )} font-work-sans`}>

            {label}
          </label>
        }
      </div>);

  }
);

Radio.displayName = 'Radio';

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Name attribute shared by all radio buttons in the group
   */
  name: string;

  /**
   * Currently selected value
   */
  value?: string;

  /**
   * Function called when selection changes
   */
  onChange?: (value: string) => void;

  /**
   * Radio options to display
   */
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;

  /**
   * Layout orientation of the radio group
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Size of the radio buttons
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the radio group is disabled
   */
  disabled?: boolean;
}

/**
 * RadioGroup component to manage a group of radio buttons
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({
    name,
    value,
    onChange,
    options,
    orientation = 'vertical',
    size = 'md',
    disabled = false,
    className,
    ...props
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div
        ref={ref}
        className={`${cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2',
          className
        )} font-work-sans`}
        role="radiogroup"
        {...props}>

        {options.map((option) =>
        <Radio
          key={option.value}
          id={`${name}-${option.value}`}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={handleChange}
          label={option.label}
          size={size}
          disabled={disabled || option.disabled} />

        )}
      </div>);

  }
);

RadioGroup.displayName = 'RadioGroup';