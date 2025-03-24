import React from 'react';
import { cn } from '@/lib/utils';

// Types
export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'current';
  label?: string;
  className?: string;
  showLabel?: boolean;
  labelPosition?: 'top' | 'right' | 'bottom' | 'left';
  type?: 'border' | 'svg';
}

// Size mapping for border spinner
const sizeMap = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
  xl: 'h-12 w-12 border-[3px]'
};

// Size mapping for SVG spinner
const svgSizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

// Color mapping
const colorMap = {
  default: 'border-gray-600 text-gray-600',
  primary: 'border-[var(--primary-color)] text-[var(--primary-color)]',
  secondary: 'border-[var(--secondary-color)] text-[var(--secondary-color)]',
  accent: 'border-[var(--accent-color)] text-[var(--accent-color)]',
  current: 'border-current text-current'
};

// Basic spinner implementation
export function Spinner({
  size = 'md',
  variant = 'default',
  label = 'Loading...',
  className = '',
  showLabel = false,
  labelPosition = 'bottom',
  type = 'border'
}: SpinnerProps) {
  const sizeClass = type === 'border' ? sizeMap[size] : svgSizeMap[size];
  const colorClass = colorMap[variant];

  const containerClasses = cn(
    'flex',
    {
      'flex-col items-center': labelPosition === 'bottom' || labelPosition === 'top',
      'flex-row items-center': labelPosition === 'right' || labelPosition === 'left',
      'flex-row-reverse': labelPosition === 'left',
      'flex-col-reverse': labelPosition === 'top'
    },
    className
  );

  const labelClasses = cn(
    'text-gray-600',
    {
      'mt-2': labelPosition === 'bottom',
      'mb-2': labelPosition === 'top',
      'ml-2': labelPosition === 'right',
      'mr-2': labelPosition === 'left'
    }
  );

  // SVG spinner
  if (type === 'svg') {
    return (
      <div className={`${containerClasses} font-work-sans`}>
        <svg
          className={cn(
            'animate-spin',
            sizeClass,
            variant === 'current' ? 'text-current' : `text-${variant}`
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          role="status"
          aria-label="Loading">

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
        </svg>
        {showLabel && <p className={`${labelClasses} font-work-sans`}>{label}</p>}
      </div>);

  }

  // Default border spinner
  return (
    <div className={`${containerClasses} font-work-sans`}>
      <div
        className={`${cn(
          'animate-spin rounded-full border-t-transparent',
          sizeClass,
          colorClass
        )} font-work-sans`}
        role="status"
        aria-label="Loading">

        <span className="sr-only font-work-sans">Loading...</span>
      </div>
      {showLabel && <p className={`${labelClasses} font-work-sans`}>{label}</p>}
    </div>);

}

// Authentication Spinner (special case for login page)
export function AuthSpinner({ label = 'Checking authentication...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center font-work-sans">
      <div className="text-center font-work-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)] mx-auto font-work-sans"></div>
        <p className="mt-4 text-gray-600 font-work-sans">{label}</p>
      </div>
    </div>);

}

// Button Spinner (for inline loading in buttons)
export function ButtonSpinner({ className }: {className?: string;}) {
  return (
    <div className={`${cn('animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2', className)} font-work-sans`} />);

}

// Fullscreen Spinner Overlay
export function FullscreenSpinner({ label = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50 font-work-sans">
      <div className="text-center font-work-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)] mx-auto font-work-sans"></div>
        <p className="mt-4 text-gray-600 font-work-sans">{label}</p>
      </div>
    </div>);

}

// Inline Text Spinner
export function InlineSpinner({ className }: {className?: string;}) {
  return (
    <span className={`${cn('inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent align-[-2px] mx-1', className)} font-work-sans`} />);

}

// Dots Loading Spinner (three dots animation)
export function DotsSpinner() {
  return (
    <div className="flex space-x-1 justify-center items-center font-work-sans">
      <span className="sr-only font-work-sans">Loading...</span>
      <div className="h-2 w-2 bg-gray-600 rounded-full animate-bounce font-work-sans" style={{ animationDelay: '0ms' }}></div>
      <div className="h-2 w-2 bg-gray-600 rounded-full animate-bounce font-work-sans" style={{ animationDelay: '150ms' }}></div>
      <div className="h-2 w-2 bg-gray-600 rounded-full animate-bounce font-work-sans" style={{ animationDelay: '300ms' }}></div>
    </div>);

}

// For backward compatibility
const LoadingSpinner: React.FC<{className?: string;label?: string;}> = ({
  className,
  label = 'Loading...'
}) =>
<div className={`${cn('flex flex-col items-center', className)} font-work-sans`}>
    <Spinner size="md" variant="primary" />
    <p className="mt-2 text-sm text-gray-600 font-work-sans">{label}</p>
  </div>;


export default LoadingSpinner;