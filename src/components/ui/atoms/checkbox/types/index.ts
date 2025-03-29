import React from 'react';

/**
 * Checkbox component props
 */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /**
   * Label for the checkbox
   */
  label?: string;

  /**
   * Position of the label relative to the checkbox
   * @default 'right'
   */
  labelPosition?: 'left' | 'right';

  /**
   * Size of the checkbox
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the checkbox is in an indeterminate state
   * @default false
   */
  indeterminate?: boolean;

  /**
   * Additional className for the wrapper element
   */
  className?: string;

  /**
   * Additional className for the checkbox input
   */
  checkboxClassName?: string;

  /**
   * Additional className for the label
   */
  labelClassName?: string;
}

export default CheckboxProps; 