'use client';

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Label component variants for size, weight, and required state
 */
const labelVariants = cva(
  "leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold"
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-destructive"
      }
    },
    defaultVariants: {
      size: "md",
      weight: "medium",
      required: false
    }
  }
);

export interface LabelProps extends 
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
  VariantProps<typeof labelVariants> {
  /**
   * Indicator text to display beside the label (e.g., "Optional")
   */
  indicator?: string;
  
  /**
   * Indicator position
   * @default 'right'
   */
  indicatorPosition?: 'right' | 'bottom';
  
  /**
   * Custom classes for the indicator
   */
  indicatorClassName?: string;
}

/**
 * Label component
 * 
 * Accessible label element for form inputs with customizable styling options.
 * 
 * @example
 * ```tsx
 * // Basic label
 * <Label htmlFor="name">Name</Label>
 * 
 * // Required label (with asterisk)
 * <Label htmlFor="email" required>Email</Label>
 * 
 * // Label with indicator text
 * <Label htmlFor="bio" indicator="Optional">Bio</Label>
 * 
 * // Different sizes
 * <Label htmlFor="username" size="sm">Username</Label>
 * <Label htmlFor="phone" size="lg">Phone</Label>
 * 
 * // Different weights
 * <Label htmlFor="password" weight="semibold">Password</Label>
 * ```
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ 
  className, 
  size,
  weight,
  required,
  indicator,
  indicatorPosition = 'right',
  indicatorClassName,
  children,
  ...props 
}, ref) => (
  <div className={cn("flex", indicatorPosition === 'bottom' ? "flex-col space-y-1" : "items-center space-x-1")}>
    <LabelPrimitive.Root
      ref={ref}
      data-required={required}
      className={cn(
        labelVariants({ size, weight, required }),
        required && "text-primary",
        className
      )}
      {...props}
    >
      {children}
    </LabelPrimitive.Root>
    
    {indicator && (
      <span 
        className={cn(
          "text-secondary",
          {
            "text-xs": size === "sm",
            "text-sm": size === "md" || !size,
            "text-base": size === "lg"
          },
          indicatorClassName
        )}
        aria-hidden="true"
      >
        {indicator}
      </span>
    )}
  </div>
));

Label.displayName = "Label";

export { Label, labelVariants }; 
/**
 * Default export for Label
 */
export default Label;
