'use client';

import React from 'react';
import { cn } from '@/utils/string/utils';
import { Input } from '@/components/ui/atoms/input';
import { Icon } from '@/components/ui/atoms/icons';
import { FormField, FormFieldProps } from '@/components/ui/molecules/form-field';

/**
 * FormStyleReset Component
 * 
 * This component provides global styling to reset browser-native form controls
 * like select dropdowns, date pickers, etc. to allow for consistent custom styling.
 * 
 * This should be included in the main layout to apply these styles globally.
 */
export const FormStyleReset: React.FC = () => {
  return (
    <style jsx global>{`
      /* Hide browser-native select dropdowns */
      select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-image: none !important;
      }
      
      /* Hide browser-native date picker controls */
      input[type="date"]::-webkit-calendar-picker-indicator,
      input[type="datetime-local"]::-webkit-calendar-picker-indicator,
      input[type="time"]::-webkit-calendar-picker-indicator,
      input[type="week"]::-webkit-calendar-picker-indicator,
      input[type="month"]::-webkit-calendar-picker-indicator {
        display: none !important;
        opacity: 0 !important;
      }
      
      /* Hide browser-native spinner controls for number inputs */
      input[type="date"]::-webkit-inner-spin-button,
      input[type="date"]::-webkit-outer-spin-button,
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none !important;
        margin: 0 !important;
      }
      
      /* Additional Firefox-specific fixes */
      @-moz-document url-prefix() {
        select {
          text-indent: 0.01px;
          text-overflow: '';
          padding-right: 1rem;
        }
        
        input[type="date"] {
          -moz-appearance: none;
        }
      }
      
      /* Ensure vertical alignment of icons and text in form controls */
      .form-input-with-icon {
        display: flex;
        align-items: center;
      }
      
      .form-input-with-icon input,
      .form-input-with-icon select,
      .form-input-with-icon textarea {
        height: 2.5rem;
        display: flex;
        align-items: center;
      }
      
      .form-icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
    `}</style>);
};

/**
 * @deprecated This component has been moved to src/components/ui/molecules/form-field/FormField.tsx
 * Please import from '@/components/ui/molecules/form-field' instead.
 */
export { FormField, type FormFieldProps };

/**
 * Form Field Subcomponents
 * 
 * These components are used to build custom form fields
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
      className={`${cn(
        'mb-4',
        layout === 'horizontal' && 'sm:flex sm:items-start',
        disabled && 'opacity-60',
        className
      )} font-work-sans`}
      {...props}>

      {children}
    </div>);

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
    xl: 'sm:w-48'
  };

  return (
    <label
      className={`${cn(
        'block text-sm font-medium mb-1',
        layout === 'horizontal' && `sm:mb-0 sm:pt-2 ${labelWidthClasses[width]}`,
        error ? 'text-red-700' : 'text-gray-900',
        className
      )} font-work-sans`}
      {...props}>

      {children}
      {required && <span className="text-red-500 ml-1 font-work-sans">*</span>}
    </label>);

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
      className={`${cn('mt-1 text-sm text-gray-500', className)} font-work-sans`}
      {...props}>

      {children}
    </p>);

}

interface FormFieldErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  _dummy?: never;
}

function FormFieldErrorMessage({
  className,
  children,
  ...props
}: FormFieldErrorMessageProps) {
  return children ?
  <p
    className={`${cn('mt-1 text-sm text-red-600', className)} font-work-sans`}
    {...props}>

      {children}
    </p> :
  null;
}

const FormFieldCompound = {
  Root: FormFieldRoot,
  Label: FormFieldLabel,
  HelperText: FormFieldHelperText,
  ErrorMessage: FormFieldErrorMessage
};

// Export both the single component and compound components
FormField.Root = FormFieldCompound.Root;
FormField.Label = FormFieldCompound.Label;
FormField.HelperText = FormFieldCompound.HelperText;
FormField.ErrorMessage = FormFieldCompound.ErrorMessage;

export default FormStyleReset;