import React from 'react';
import { cn } from '@/lib/utils';
import { BsCheckCircleFill, BsInfoCircleFill, BsExclamationTriangleFill, BsXCircleFill, BsX } from 'react-icons/bs';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Type of alert that determines styling
   * @default "info"
   */
  variant?: AlertVariant;
  
  /**
   * Title of the alert
   */
  title?: string;
  
  /**
   * Show a dismiss/close button
   * @default false
   */
  dismissible?: boolean;
  
  /**
   * Callback when dismiss button is clicked
   */
  onDismiss?: () => void;
  
  /**
   * Content of the alert
   */
  children: React.ReactNode;
}

/**
 * Alert component for feedback messages, warnings, and errors
 * 
 * @example
 * ```tsx
 * // Default (info) alert
 * <Alert>This is an information message</Alert>
 * 
 * // Success alert with title
 * <Alert variant="success" title="Operation Successful">
 *   Your changes have been saved.
 * </Alert>
 * 
 * // Warning alert
 * <Alert variant="warning">
 *   You are about to perform a destructive action.
 * </Alert>
 * 
 * // Error alert with dismiss button
 * <Alert variant="error" dismissible onDismiss={() => console.log('Alert dismissed')}>
 *   There was a problem with your submission.
 * </Alert>
 * ```
 */
export function Alert({
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className,
  children,
  ...props
}: AlertProps) {
  // Styling configuration for variants
  const variantStyles = {
    info: {
      base: 'bg-white text-gray-800 border border-gray-200',
      icon: (
        <div className="rounded-full bg-blue-500 p-1 flex-shrink-0">
          <BsInfoCircleFill className="h-3 w-3 text-white" />
        </div>
      )
    },
    success: {
      base: 'bg-white text-gray-800 border border-gray-200',
      icon: (
        <div className="rounded-full bg-green-500 p-1 flex-shrink-0">
          <BsCheckCircleFill className="h-3 w-3 text-white" />
        </div>
      )
    },
    warning: {
      base: 'bg-white text-gray-800 border border-gray-200',
      icon: (
        <div className="rounded-full bg-yellow-500 p-1 flex-shrink-0">
          <BsExclamationTriangleFill className="h-3 w-3 text-white" />
        </div>
      )
    },
    error: {
      base: 'bg-white text-gray-800 border border-gray-200',
      icon: (
        <div className="rounded-full bg-red-500 p-1 flex-shrink-0">
          <BsXCircleFill className="h-3 w-3 text-white" />
        </div>
      )
    }
  };
  
  return (
    <div
      className={cn(
        'rounded-lg shadow-md',
        'flex items-center p-3 gap-2',
        variantStyles[variant].base,
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex-shrink-0">
        {variantStyles[variant].icon}
      </div>
      
      <div className="flex-1 min-w-0">
        {title && <div className="text-sm font-medium">{title}</div>}
        <div className={cn(
          'text-sm text-gray-800',
          !title && 'font-medium'
        )}>
          {children}
        </div>
      </div>
      
      {dismissible && (
        <button
          type="button"
          className="ml-auto text-gray-400 hover:text-gray-500 focus:outline-none"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          <BsX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default Alert; 