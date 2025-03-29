import React from 'react';

/**
 * Input component props
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Label for the input
   */
  label?: string;

  /**
   * Help text to display below the input
   */
  helpText?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Whether to display the full width input
   * @default false
   */
  fullWidth?: boolean;

  /**
   * The size of the input
   * @default "md"
   */
  inputSize?: 'sm' | 'md' | 'lg';

  /**
   * Left icon
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon
   */
  rightIcon?: React.ReactNode;

  /**
   * Container class for the entire input group
   */
  containerClassName?: string;

  /**
   * Input wrapper class
   */
  wrapperClassName?: string;

  /**
   * Label class
   */
  labelClassName?: string;

  /**
   * Help text class
   */
  helpTextClassName?: string;

  /**
   * Error class
   */
  errorClassName?: string;
}

export default InputProps; 