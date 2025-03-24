import React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The size of the spinner
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * The color of the spinner
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'accent' | 'white' | 'current';

  /**
   * The type of spinner to render
   * @default "border"
   */
  type?: 'border' | 'svg';

  /**
   * Optional label text to show with the spinner
   */
  label?: string;

  /**
   * Whether to show the label
   * @default true
   */
  showLabel?: boolean;

  /**
   * Position of the label relative to the spinner
   * @default "bottom"
   */
  labelPosition?: 'top' | 'right' | 'bottom' | 'left';
}

interface SVGSpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'white' | 'current';
}

/**
 * Spinner component for loading states
 * 
 * @example
 * ```tsx
 * // Border spinner (default)
 * <Spinner />
 * 
 * // SVG spinner
 * <Spinner type="svg" />
 * 
 * // With custom size
 * <Spinner size="lg" />
 * 
 * // With custom color
 * <Spinner variant="accent" />
 * ```
 */
export function Spinner({
  size = 'md',
  variant = 'primary',
  type = 'border',
  className,
  label,
  showLabel = true,
  labelPosition = 'bottom',
  ...props
}: SpinnerProps) {
  // Size classes for border spinner
  const borderSizeClasses = {
    xs: 'h-3 w-3 border',
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4'
  };

  // Size classes for SVG spinner
  const svgSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  // Variant classes for border spinner
  const borderVariantClasses = {
    primary: 'border-primary border-t-transparent text-primary',
    secondary: 'border-secondary border-t-transparent text-secondary',
    accent: 'border-accent border-t-transparent text-accent',
    white: 'border-white border-t-transparent text-white',
    current: 'border-current border-t-transparent'
  };

  // If no label or showLabel is false, just render the spinner
  if (!label || !showLabel) {
    // If using SVG spinner
    if (type === 'svg') {
      return (
        <SVGSpinner
          size={size}
          variant={variant}
          className={className}
          aria-label="Loading" />);


    }

    // Default border spinner
    return (
      <div
        className={`${cn(
          'inline-block animate-spin rounded-full',
          borderSizeClasses[size],
          borderVariantClasses[variant],
          className
        )} font-work-sans`}
        role="status"
        aria-label="Loading"
        {...props}>

        <span className="sr-only font-work-sans">Loading...</span>
      </div>);

  }

  // Layout classes based on label position
  const layoutClasses = {
    top: 'flex flex-col-reverse items-center gap-2',
    right: 'flex flex-row items-center gap-2',
    bottom: 'flex flex-col items-center gap-2',
    left: 'flex flex-row-reverse items-center gap-2'
  };

  return (
    <div className={`${cn(layoutClasses[labelPosition], className)} font-work-sans`} {...props}>
      {type === 'svg' ?
      <SVGSpinner
        size={size}
        variant={variant}
        aria-label={label} /> :


      <div
        className={`${cn(
          'inline-block animate-spin rounded-full',
          borderSizeClasses[size],
          borderVariantClasses[variant]
        )} font-work-sans`}
        role="status"
        aria-label={label}>

          <span className="sr-only font-work-sans">{label}</span>
        </div>
      }
      <span className="text-sm text-gray-600 font-work-sans">{label}</span>
    </div>);

}

const SVGSpinner = ({
  size = 'md',
  variant = 'primary',
  className,
  ...props
}: SVGSpinnerProps) => {
  // Size classes for SVG spinner
  const svgSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <svg
      className={cn(
        'animate-spin',
        svgSizeClasses[size],
        variant === 'current' ? 'text-current' : `text-${variant}`,
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      {...props}>

      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4" />

      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />

      <span className="sr-only font-work-sans">Loading...</span>
    </svg>);

};

/**
 * Authentication spinner with centered layout and label
 */
export function AuthSpinner({
  label = "Authenticating...",
  size = "lg",
  className,
  ...props
}: SpinnerProps) {
  return (
    <div className={`${cn("min-h-[200px] flex items-center justify-center", className)} font-work-sans`} {...props}>
      <div className="text-center font-work-sans">
        <Spinner size={size} variant="primary" showLabel={false} />
        <p className="mt-4 text-gray-600 font-work-sans">{label}</p>
      </div>
    </div>);

}

/**
 * Button spinner for use within buttons
 */
export function ButtonSpinner({
  size = "sm",
  className,
  ...props
}: SpinnerProps) {
  return (
    <Spinner
      size={size}
      variant="current"
      className={cn("mr-2", className)}
      showLabel={false}
      {...props} />);


}

/**
 * Inline spinner for use within text
 */
export function InlineSpinner({
  size = "xs",
  variant = "current",
  className,
  ...props
}: SpinnerProps) {
  return (
    <Spinner
      size={size}
      variant={variant}
      className={cn("inline-block align-middle", className)}
      showLabel={false}
      {...props} />);


}

/**
 * Dots spinner for minimalist loading indicators
 */
export function DotsSpinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${cn("flex space-x-1", className)} font-work-sans`} role="status" aria-label="Loading" {...props}>
      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce font-work-sans" style={{ animationDelay: "0ms" }} />
      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce font-work-sans" style={{ animationDelay: "150ms" }} />
      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce font-work-sans" style={{ animationDelay: "300ms" }} />
      <span className="sr-only font-work-sans">Loading...</span>
    </div>);

}

/**
 * Fullscreen spinner with overlay
 */
export function FullscreenSpinner({
  label = "Loading...",
  size = "xl",
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      className={`${cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm",
        className
      )} font-work-sans`}
      {...props}>

      <div className="bg-white p-6 rounded-lg shadow-lg text-center font-work-sans">
        <Spinner size={size} showLabel={false} />
        <p className="mt-4 text-gray-600 font-work-sans">{label}</p>
      </div>
    </div>);

}

export default Spinner;