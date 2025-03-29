import React from 'react';
import { cn } from '@/utils/string/utils';
import { ToggleProps, ToggleSize, ToggleColorScheme } from './types';

/**
 * A toggle/switch component for boolean inputs with customizable styling.
 */
export function Toggle({
  id,
  size = 'md',
  colorScheme = 'accent',
  label,
  showLabel = true,
  labelPosition = 'right',
  disabled = false,
  readOnly = false,
  description,
  className,
  onChange,
  checked,
  ...props
}: ToggleProps) {
  // Size-based classes
  const sizeClasses: Record<ToggleSize, string> = {
    sm: 'h-4 w-7 after:h-3 after:w-3',
    md: 'h-5 w-9 after:h-4 after:w-4',
    lg: 'h-6 w-11 after:h-5 after:w-5',
  };

  // Color scheme classes
  const colorClasses: Record<ToggleColorScheme, string> = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    success: 'bg-green-500', 
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  // Handle readonly by preventing onChange
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!readOnly && onChange) {
      onChange(e);
    }
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className={cn(
        'flex items-center gap-2',
        labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row',
      )}>
        <label 
          htmlFor={id}
          className={cn(
            "relative inline-block cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            id={id}
            type="checkbox"
            className="sr-only"
            disabled={disabled}
            onChange={handleChange}
            checked={checked}
            readOnly={readOnly}
            {...props}
          />
          <div 
            className={cn(
              "rounded-full bg-french-grey transition-all duration-200",
              "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
              "after:rounded-full after:bg-white after:transition-all after:duration-200",
              checked ? `${colorClasses[colorScheme]} after:translate-x-full` : "",
              sizeClasses[size]
            )}
          />
        </label>
        {label && showLabel && (
          <span className={cn(
            "text-sm font-medium",
            disabled ? "text-gray-400" : "text-gray-700",
          )}>
            {label}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}

export default Toggle; 