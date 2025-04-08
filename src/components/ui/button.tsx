/**
 * @component Button
 * @category atom
 * @renderType server
 * @description A reusable button component that supports different variants, sizes, and states.
 * @status stable
 * @author Frontend Team
 * @since 2023-04-06
 * 
 * @example
 * ```tsx
 * <Button>Default Button</Button>
 * ```
 * 
 * @example
 * ```tsx
 * <Button variant="outline" leftIcon="check">
 *   With Icon
 * </Button>
 * ```
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/components/ui/utils/theme-override";
import { getIconClasses } from "@/components/ui/utils/icon-integration";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  leftIcon?: string;
  rightIcon?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    leftIcon,
    rightIcon,
    isLoading,
    isDisabled,
    children, 
    ...props 
  }, ref) => {
    const disabled = isDisabled || isLoading || props.disabled;
    
    return (
      <button
        className={cn(buttonStyles({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {leftIcon && !isLoading && (
          <i className={`${getIconClasses(leftIcon)} mr-2`}></i>
        )}
        {isLoading && (
          <i className={`${getIconClasses('spinner')} animate-spin mr-2`}></i>
        )}
        
        {children}
        
        {rightIcon && !isLoading && (
          <i className={`${getIconClasses(rightIcon)} ml-2`}></i>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonStyles };
