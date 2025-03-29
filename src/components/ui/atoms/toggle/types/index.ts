import { InputHTMLAttributes } from 'react';

export type ToggleSize = 'sm' | 'md' | 'lg';
export type ToggleColorScheme = 'primary' | 'accent' | 'success' | 'warning' | 'error';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * The size of the toggle
   * @default 'md'
   */
  size?: ToggleSize;
  
  /**
   * The color scheme of the toggle when active
   * @default 'accent'
   */
  colorScheme?: ToggleColorScheme;
  
  /**
   * Label for the toggle control
   */
  label?: string;
  
  /**
   * Whether to show the label
   * @default true
   */
  showLabel?: boolean;
  
  /**
   * Position of the label relative to the toggle
   * @default 'right'
   */
  labelPosition?: 'left' | 'right';
  
  /**
   * Whether the toggle is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the toggle is read-only
   * @default false
   */
  readOnly?: boolean;

  /**
   * Optional description text below the toggle
   */
  description?: string;
  
  /**
   * ID for the input element (required for accessibility)
   */
  id: string;
} 