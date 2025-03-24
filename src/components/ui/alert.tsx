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
      icon:
      <div className="rounded-full bg-blue-500 p-1 flex-shrink-0 font-work-sans">
          <BsInfoCircleFill className="h-3 w-3 text-white font-work-sans" />
        </div>

    },
    success: {
      base: 'bg-white text-gray-800 border border-gray-200',
      icon:
      <div className="rounded-full bg-green-500 p-1 flex-shrink-0 font-work-sans">
          <BsCheckCircleFill className="h-3 w-3 text-white font-work-sans" />
        </div>

    },
    warning: {
      base: 'bg-white text-gray-800 border border-gray-200',
      icon:
      <div className="rounded-full bg-yellow-500 p-1 flex-shrink-0 font-work-sans">
          <BsExclamationTriangleFill className="h-3 w-3 text-white font-work-sans" />
        </div>

    },
    error: {
      base: 'bg-white text-gray-800 border border-gray-200',
      icon:
      <div className="rounded-full bg-red-500 p-1 flex-shrink-0 font-work-sans">
          <BsXCircleFill className="h-3 w-3 text-white font-work-sans" />
        </div>

    }
  };

  return (
    <div
      className={`${cn(
        'rounded-lg shadow-md',
        'flex items-center p-3 gap-2',
        variantStyles[variant].base,
        className
      )} font-work-sans`}
      role="alert"
      {...props}>

      <div className="flex-shrink-0 font-work-sans">
        {variantStyles[variant].icon}
      </div>
      
      <div className="flex-1 min-w-0 font-work-sans">
        {title && <div className="text-sm font-medium font-work-sans">{title}</div>}
        <div className={`${cn(
          'text-sm text-gray-800',
          !title && 'font-medium'
        )} font-work-sans`}>
          {children}
        </div>
      </div>
      
      {dismissible &&
      <button
        type="button"
        className="ml-auto text-gray-400 hover:text-gray-500 focus:outline-none font-work-sans"
        onClick={onDismiss}
        aria-label="Dismiss">

          <span className="sr-only font-work-sans">Dismiss</span>
          <BsX className="h-4 w-4" />
        </button>
      }
    </div>);

}

export default Alert;