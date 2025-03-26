"use client";

import React, { forwardRef } from 'react';
import Input from '@/components/ui/input';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  icon?: string;
  fullWidth?: boolean;
}

/**
 * InputField component for settings forms
 * This is a wrapper around the base Input component that adds consistent styling for settings
 */
const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  description,
  error,
  icon,
  className = '',
  fullWidth = true,
  ...props
}, ref) => {
  // Create left icon if provided
  const leftIcon = icon ? (
    <i className={`${icon} w-5 h-5`}></i>
  ) : null;

  return (
    <div className="mb-4">
      <Input
        ref={ref}
        label={label}
        helpText={description}
        error={error}
        leftIcon={leftIcon}
        fullWidth={fullWidth}
        className={className}
        containerClassName="w-full"
        inputSize="md"
        {...props}
      />
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField; 