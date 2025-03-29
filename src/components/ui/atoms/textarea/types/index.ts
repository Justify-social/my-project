import { TextareaHTMLAttributes } from 'react';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaVariant = 'default' | 'outline' | 'ghost' | 'filled';
export type TextareaStatus = 'default' | 'error' | 'success' | 'warning';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * The size of the textarea
   * @default 'md'
   */
  size?: TextareaSize;
  
  /**
   * The variant style of the textarea
   * @default 'default'
   */
  variant?: TextareaVariant;
  
  /**
   * The validation status of the textarea
   * @default 'default'
   */
  status?: TextareaStatus;
  
  /**
   * Whether the textarea is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the textarea is read-only
   * @default false
   */
  readOnly?: boolean;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Label for the textarea
   */
  label?: string;
  
  /**
   * Whether to show the label
   * @default true
   */
  showLabel?: boolean;
  
  /**
   * Helper text to display below the textarea
   */
  helperText?: string;
  
  /**
   * Error message to display when status is 'error'
   */
  errorMessage?: string;
  
  /**
   * Whether to auto-resize the textarea based on content
   * @default false
   */
  autoResize?: boolean;
  
  /**
   * Maximum height for auto-resizing
   */
  maxHeight?: number | string;
  
  /**
   * Minimum rows to display
   * @default 3
   */
  minRows?: number;
  
  /**
   * Maximum rows to display
   */
  maxRows?: number;
  
  /**
   * ID for the textarea (required for accessibility)
   */
  id: string;
} 