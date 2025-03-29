/**
 * Button Component Types
 * 
 * This file contains type definitions used by button components.
 */

import React from 'react';

/**
 * Available button visual styles
 */
export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'danger';

/**
 * Available button sizes
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Common button props interface
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style of the button
   * @default "primary"
   */
  variant?: ButtonVariant;

  /**
   * The size of the button
   * @default "md"
   */
  size?: ButtonSize;

  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Icon to show before the button text
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to show after the button text
   */
  rightIcon?: React.ReactNode;

  /**
   * Full width button (100%)
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Props for the IconButton component
 */
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  /**
   * The icon to display
   */
  icon: React.ReactNode;
  
  /**
   * Accessible label for screen readers
   */
  'aria-label': string;
}

export default ButtonProps; 