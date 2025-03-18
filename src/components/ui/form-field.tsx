'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Icon } from './icon';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The form field label text
   */
  label: string;
  
  /**
   * HTML id for the input (also used to associate label)
   */
  id: string;
  
  /**
   * Input element to render inside the form field
   */
  children: React.ReactNode;
  
  /**
   * Optional help text to display below the input
   */
  helperText?: string;
  
  /**
   * Error message to display (shows error state if provided)
   */
  error?: string;
  
  /**
   * Whether the field is required
   */
  required?: boolean;
  
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  
  /**
   * Optional icon to display before the input
   */
  startIcon?: React.ReactNode;
  
  /**
   * Optional icon to display after the input
   */
  endIcon?: React.ReactNode;
  
  /**
   * Form field layout direction
   */
  layout?: 'vertical' | 'horizontal';
  
  /**
   * Space to use between label and input when in horizontal layout
   */
  labelWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * FormField component provides a consistent wrapper for form inputs with label, 
 * optional help text, and validation messaging
 */
export function FormField({
  label,
  id,
  children,
  helperText,
  error,
  required = false,
  disabled = false,
  startIcon,
  endIcon,
  layout = 'vertical',
  labelWidth = 'md',
  className,
  ...props
}: FormFieldProps) {
  // Determine if the children is the Input component to apply special styling
  const isInputComponent = React.isValidElement(children) && 
    (children.type === Input || (children.type as any)?.displayName === 'Input');
  
  // Determine classes for horizontal layout label width
  const labelWidthClasses = {
    sm: 'sm:w-24',
    md: 'sm:w-32',
    lg: 'sm:w-40',
    xl: 'sm:w-48',
  };
  
  return (
    <div 
      className={cn(
        'mb-4',
        layout === 'horizontal' && 'sm:flex sm:items-start',
        className
      )}
      {...props}
    >
      <label 
        htmlFor={id}
        className={cn(
          'block text-sm font-medium mb-1',
          layout === 'horizontal' && `sm:mb-0 sm:pt-2 ${labelWidthClasses[labelWidth]}`,
          error ? 'text-red-700' : 'text-gray-900',
          disabled && 'opacity-60'
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className={cn(
        'relative',
        layout === 'horizontal' && 'flex-1'
      )}>
        {/* If we have a start icon and children is Input, we need to apply padding */}
        {startIcon && isInputComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {startIcon}
          </div>
        )}
        
        {/* Clone the child element with additional props if needed */}
        {isInputComponent 
          ? React.cloneElement(children as React.ReactElement, {
              id,
              'aria-invalid': !!error,
              'aria-describedby': helperText ? `${id}-description` : undefined,
              className: cn(
                (children as React.ReactElement).props.className,
                error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
                startIcon ? 'pl-10' : '',
                endIcon ? 'pr-10' : '',
              ),
            })
          : children
        }
        
        {/* If we have an end icon and children is Input, we need to apply padding */}
        {endIcon && isInputComponent && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {endIcon}
          </div>
        )}
        
        {/* Helper text */}
        {helperText && !error && (
          <p 
            id={`${id}-description`}
            className="mt-1 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
        
        {/* Error message */}
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Compound component example with FormField
 * 
 * Usage:
 * <FormField.Root>
 *   <FormField.Label>Name</FormField.Label>
 *   <FormField.Input />
 *   <FormField.HelperText>Enter your full name</FormField.HelperText>
 *   <FormField.ErrorMessage>This field is required</FormField.ErrorMessage>
 * </FormField.Root>
 */

interface FormFieldRootProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: 'vertical' | 'horizontal';
  disabled?: boolean;
  children: React.ReactNode;
}

function FormFieldRoot({
  layout = 'vertical',
  disabled = false,
  className,
  children,
  ...props
}: FormFieldRootProps) {
  return (
    <div 
      className={cn(
        'mb-4',
        layout === 'horizontal' && 'sm:flex sm:items-start',
        disabled && 'opacity-60',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface FormFieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  htmlFor: string;
  error?: boolean;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'vertical' | 'horizontal';
}

function FormFieldLabel({
  required = false,
  error = false,
  width = 'md',
  layout = 'vertical',
  className,
  children,
  ...props
}: FormFieldLabelProps) {
  // Determine classes for horizontal layout label width
  const labelWidthClasses = {
    sm: 'sm:w-24',
    md: 'sm:w-32',
    lg: 'sm:w-40',
    xl: 'sm:w-48',
  };
  
  return (
    <label 
      className={cn(
        'block text-sm font-medium mb-1',
        layout === 'horizontal' && `sm:mb-0 sm:pt-2 ${labelWidthClasses[width]}`,
        error ? 'text-red-700' : 'text-gray-900',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

interface FormFieldHelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string;
}

function FormFieldHelperText({
  className,
  children,
  ...props
}: FormFieldHelperTextProps) {
  return (
    <p 
      className={cn('mt-1 text-sm text-gray-500', className)}
      {...props}
    >
      {children}
    </p>
  );
}

interface FormFieldErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function FormFieldErrorMessage({
  className,
  children,
  ...props
}: FormFieldErrorMessageProps) {
  return children ? (
    <p 
      className={cn('mt-1 text-sm text-red-600', className)}
      {...props}
    >
      {children}
    </p>
  ) : null;
}

const FormFieldCompound = {
  Root: FormFieldRoot,
  Label: FormFieldLabel,
  HelperText: FormFieldHelperText,
  ErrorMessage: FormFieldErrorMessage,
};

// Export both the single component and compound components
FormField.Root = FormFieldCompound.Root;
FormField.Label = FormFieldCompound.Label;
FormField.HelperText = FormFieldCompound.HelperText;
FormField.ErrorMessage = FormFieldCompound.ErrorMessage; 