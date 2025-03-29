import React from 'react';
import { cn } from '@/utils/string/utils';

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
  // Determine if the children is an Input component to apply special styling
  const isInputComponent = React.isValidElement(children) && 
    ((children.type as any)?.displayName === 'Input' || 
     children.type === 'input' || 
     children.type === 'select' || 
     children.type === 'textarea');

  // Determine classes for horizontal layout label width
  const labelWidthClasses = {
    sm: 'sm:w-24',
    md: 'sm:w-32',
    lg: 'sm:w-40',
    xl: 'sm:w-48'
  };

  return (
    <div
      className={`${cn(
        'mb-4',
        layout === 'horizontal' && 'sm:flex sm:items-start',
        className
      )} font-work-sans`}
      {...props}>

      <label
        htmlFor={id}
        className={`${cn(
          'block text-sm font-medium mb-1',
          layout === 'horizontal' && `sm:mb-0 sm:pt-2 ${labelWidthClasses[labelWidth]}`,
          error ? 'text-red-700' : 'text-gray-900',
          disabled && 'opacity-60'
        )} font-work-sans`}>

        {label}
        {required && <span className="text-red-500 ml-1 font-work-sans">*</span>}
      </label>
      
      <div className={`${cn(
        'relative',
        layout === 'horizontal' && 'flex-1'
      )} font-work-sans`}>
        {/* If we have a start icon and children is Input, we need to apply padding */}
        {startIcon && isInputComponent &&
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none form-icon-container font-work-sans">
            {startIcon}
          </div>
        }
        
        {React.cloneElement(children as React.ReactElement, {
          className: cn(
            (children as React.ReactElement).props.className || '',
            startIcon && isInputComponent && 'pl-10',
            endIcon && isInputComponent && 'pr-10'
          ),
          id,
          'aria-invalid': error ? 'true' : 'false',
          'aria-describedby': error || helperText ? `${id}-description` : undefined,
        })}
        
        {endIcon && isInputComponent &&
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none form-icon-container font-work-sans">
            {endIcon}
          </div>
        }
        
        {(helperText || error) && (
        <div
          id={`${id}-description`}
          className={`mt-1 text-sm ${
          error ? 'text-red-600' : 'text-gray-500'
          } font-work-sans`}>

          {error || helperText}
        </div>
        )}
      </div>
    </div>
  );
}

export default FormField; 