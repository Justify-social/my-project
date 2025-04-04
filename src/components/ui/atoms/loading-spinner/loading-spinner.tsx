"use client"

import * as React from "react"
import { IconAdapter } from "@/components/ui/atoms/icon/adapters";
import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  color?: 'default' | 'primary' | 'secondary' | 'muted';
  withText?: boolean;
  textPosition?: 'left' | 'right' | 'top' | 'bottom';
  label?: string;
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
  full: 'h-full w-full',
}

const colorMap = {
  default: 'text-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary',
  muted: 'text-muted-foreground',
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    className, 
    size = 'md', 
    color = 'default',
    withText = false,
    textPosition = 'right',
    label = "Loading...",
    ...props 
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "flex items-center gap-2",
          textPosition === 'top' && "flex-col",
          textPosition === 'bottom' && "flex-col-reverse",
          textPosition === 'left' && "flex-row-reverse",
          className
        )}
        {...props}
      >
        <IconAdapter 
          iconId="faCircleNotchLight"
          className={cn(
            "animate-spin", 
            sizeMap[size], 
            colorMap[color]
          )}
        />
        {(withText || label) && (
          <span className={cn(
            "text-sm", 
            colorMap[color]
          )}>
            {label}
          </span>
        )}
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

// Export both as default and named export
export { LoadingSpinner }
export default LoadingSpinner 