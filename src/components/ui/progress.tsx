import React from 'react';
import { cn } from '@/lib/utils';

export type ProgressVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: React.ReactNode;
  showValue?: boolean;
  className?: string;
  barClassName?: string;
  valueFormat?: (value: number, max: number) => string;
  animated?: boolean;
}

const variantClasses: Record<ProgressVariant, string> = {
  default: 'bg-gray-200',
  primary: 'bg-[#333333]',
  secondary: 'bg-[#4A5568]',
  accent: 'bg-[#00BFFF]',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500'
};

const sizeClasses: Record<ProgressSize, string> = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

export function Progress({
  value,
  max = 100,
  variant = 'accent',
  size = 'md',
  label,
  showValue = false,
  className,
  barClassName,
  valueFormat,
  animated = false
}: ProgressProps) {
  // Make sure value is between 0 and max
  const normalizedValue = Math.max(0, Math.min(value, max));

  // Calculate the percentage
  const percentage = normalizedValue / max * 100;

  // Format the value display
  const formattedValue = valueFormat ?
  valueFormat(normalizedValue, max) :
  showValue ?
  `${Math.round(percentage)}%` :
  null;

  return (
    <div className={`${cn("w-full", className)} font-work-sans`}>
      {label &&
      <div className="flex justify-between items-center mb-1 font-work-sans">
          <span className="text-sm font-medium text-gray-700 font-work-sans">{label}</span>
          {formattedValue &&
        <span className="text-sm font-medium text-gray-500 font-work-sans">{formattedValue}</span>
        }
        </div>
      }
      
      <div className={`${cn("w-full bg-gray-100 rounded-full overflow-hidden", sizeClasses[size])} font-work-sans`}>
        <div
          className={`${cn(
            variantClasses[variant],
            animated && "animate-pulse",
            "rounded-full transition-all duration-300 ease-in-out",
            barClassName
          )} font-work-sans`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={normalizedValue}
          aria-valuemin={0}
          aria-valuemax={max} />

      </div>
      
      {!label && formattedValue &&
      <span className="mt-1 text-xs text-gray-500 block font-work-sans">{formattedValue}</span>
      }
    </div>);

}

// Circular progress variant
export interface CircularProgressProps extends Omit<ProgressProps, 'size'> {
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
}

export function CircularProgress({
  value,
  max = 100,
  variant = 'accent',
  size = 40,
  strokeWidth = 4,
  showPercentage = false,
  className,
  valueFormat
}: CircularProgressProps) {
  // Make sure value is between 0 and max
  const normalizedValue = Math.max(0, Math.min(value, max));

  // Calculate the percentage
  const percentage = normalizedValue / max * 100;

  // Calculate SVG parameters
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentage / 100 * circumference;

  // Format the value display
  const formattedValue = valueFormat ?
  valueFormat(normalizedValue, max) :
  `${Math.round(percentage)}%`;

  return (
    <div className={`${cn("relative inline-flex items-center justify-center", className)} font-work-sans`}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}>

        <circle
          className="text-gray-100 font-work-sans"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2} />

        <circle
          className={`${cn({
            'text-[#333333]': variant === 'primary',
            'text-[#4A5568]': variant === 'secondary',
            'text-[#00BFFF]': variant === 'accent',
            'text-green-500': variant === 'success',
            'text-yellow-500': variant === 'warning',
            'text-red-500': variant === 'danger',
            'text-gray-500': variant === 'default'
          })} font-work-sans`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round" />

      </svg>
      {showPercentage &&
      <span
        className="absolute text-xs font-medium font-work-sans"
        style={{
          fontSize: size > 50 ? '0.875rem' : '0.75rem'
        }}>

          {formattedValue}
        </span>
      }
    </div>);

}

export default Progress;