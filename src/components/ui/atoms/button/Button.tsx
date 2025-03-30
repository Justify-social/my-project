'use client';

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Icon } from "../icons/Icon";

/**
 * Button component for actions in forms, dialogs, and more.
 * 
 * The Button component is a fundamental UI element for triggering actions.
 * It supports multiple variants, sizes, and states to address different use cases
 * and visual hierarchy requirements.
 * 
 * @example
 * ```tsx
 * // Primary button (default)
 * <Button>Primary Button</Button>
 * 
 * // Secondary button
 * <Button variant="secondary">Secondary Button</Button>
 * 
 * // With loading state
 * <Button loading>Loading...</Button>
 * 
 * // With icons
 * <Button leftIcon="plus">With Left Icon</Button>
 * <Button rightIcon="arrow-right">With Right Icon</Button>
 * 
 * // Different sizes
 * <Button size="sm">Small Button</Button>
 * <Button size="lg">Large Button</Button>
 * 
 * // Full width button
 * <Button fullWidth>Full Width Button</Button>
 * ```
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-interactive text-white hover:bg-interactive/90 focus-visible:ring-interactive/50",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/50",
        outline: "border border-divider bg-background hover:bg-accent/10 hover:text-accent focus-visible:ring-interactive/50",
        secondary: "bg-secondary text-white hover:bg-secondary/80 focus-visible:ring-secondary/50",
        ghost: "hover:bg-secondary/10 hover:text-secondary focus-visible:ring-secondary/50",
        link: "text-interactive underline-offset-4 hover:underline focus-visible:ring-interactive/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1 text-xs",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-10 w-10 p-2",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof buttonVariants> {
  /**
   * Change the component to the HTML tag or custom component of the only child
   */
  asChild?: boolean;
  
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean;
  
  /**
   * Icon to display on the left side of the button
   */
  leftIcon?: string;
  
  /**
   * Icon to display on the right side of the button
   */
  rightIcon?: string;
  
  /**
   * Children to render inside the button
   */
  children?: React.ReactNode;
}

/**
 * Button component for actions in forms, dialogs, and more.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Determine the icon size based on the button size
    const getIconSize = () => {
      switch (size) {
        case 'sm': return 'xs';
        case 'lg': return 'md';
        default: return 'sm';
      }
    };
    
    // When the button is loading, it should be disabled
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className="mr-2 inline-block animate-spin">
            <Icon 
              name="spinner" 
              variant="light"
              size={getIconSize()}
              aria-hidden="true"
            />
          </span>
        )}
        
        {!loading && leftIcon && (
          <span className="mr-2 inline-flex">
            <Icon 
              name={leftIcon} 
              variant="light"
              size={getIconSize()}
              aria-hidden="true"
            />
          </span>
        )}
        
        {children}
        
        {!loading && rightIcon && (
          <span className="ml-2 inline-flex">
            <Icon 
              name={rightIcon} 
              variant="light"
              size={getIconSize()}
              aria-hidden="true"
            />
          </span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button };
/**
 * Default export for Button
 */
export default Button;
