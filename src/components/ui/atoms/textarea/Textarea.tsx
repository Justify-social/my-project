import React, { useRef, useEffect } from 'react';
import { cn } from '@/utils/string/utils';
import { TextareaProps, TextareaSize, TextareaVariant, TextareaStatus } from './types';

/**
 * Textarea component for multi-line text input with customizable styling.
 */
export function Textarea({
  id,
  className,
  size = 'md',
  variant = 'default',
  status = 'default',
  disabled = false,
  readOnly = false,
  label,
  showLabel = true,
  helperText,
  errorMessage,
  autoResize = false,
  maxHeight,
  minRows = 3,
  maxRows,
  onChange,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Size-based classes
  const sizeClasses: Record<TextareaSize, string> = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  // Variant classes
  const variantClasses: Record<TextareaVariant, string> = {
    default: 'border border-french-grey bg-white focus:border-accent focus:ring-1 focus:ring-accent',
    outline: 'border-2 border-french-grey bg-transparent focus:border-accent',
    ghost: 'border border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-1 focus:ring-accent',
    filled: 'border border-transparent bg-gray-100 focus:bg-white focus:ring-1 focus:ring-accent',
  };

  // Status classes
  const statusClasses: Record<TextareaStatus, string> = {
    default: '',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500',
  };

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        const newHeight = Math.min(
          Math.max(
            textarea.scrollHeight,
            minRows * parseInt(getComputedStyle(textarea).lineHeight)
          ),
          maxRows
            ? maxRows * parseInt(getComputedStyle(textarea).lineHeight)
            : maxHeight
            ? typeof maxHeight === 'number'
              ? maxHeight
              : parseInt(maxHeight)
            : Infinity
        );
        textarea.style.height = `${newHeight}px`;
      };
      
      // Set initial height
      adjustHeight();
      
      // Add event handlers for content changes
      const handleInput = () => adjustHeight();
      textarea.addEventListener('input', handleInput);
      
      return () => {
        textarea.removeEventListener('input', handleInput);
      };
    }
  }, [autoResize, maxHeight, minRows, maxRows]);

  // Combine all classes
  const textareaClasses = cn(
    'w-full rounded-md transition-colors duration-200 outline-none',
    'resize-vertical focus:outline-none',
    sizeClasses[size],
    variantClasses[variant],
    status !== 'default' && statusClasses[status],
    disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
    readOnly && 'cursor-default',
    className
  );

  return (
    <div className="flex flex-col gap-1">
      {label && showLabel && (
        <label 
          htmlFor={id}
          className={cn(
            "text-sm font-medium mb-1",
            disabled ? "text-gray-400" : "text-gray-700",
            status === 'error' && 'text-red-500'
          )}
        >
          {label}
        </label>
      )}
      
      <textarea
        id={id}
        ref={textareaRef}
        disabled={disabled}
        readOnly={readOnly}
        className={textareaClasses}
        rows={minRows}
        aria-invalid={status === 'error'}
        aria-describedby={
          helperText ? `${id}-helper` : 
          errorMessage && status === 'error' ? `${id}-error` : 
          undefined
        }
        onChange={onChange}
        {...props}
      />
      
      {/* Helper or error text */}
      {status === 'error' && errorMessage ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-500">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="mt-1 text-xs text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default Textarea; 