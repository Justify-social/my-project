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

import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { buttonStyles } from "@/components/ui/utils/theme-override";
// import { getIconClasses } from "@/components/ui/utils/icon-integration"; // Removed import for deleted file
import { LightIcon } from '@/components/ui/icon';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonStyles> {
  leftIcon?: string;
  rightIcon?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  asChild?: boolean;
  iconLeft?: string;
  iconRight?: string;
  iconOnly?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, iconLeft, iconRight, iconOnly, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Determine CSS classes for icons (replace with actual Icon component later if needed)
    // const leftIconClass = iconLeft ? getIconClasses(iconLeft) : '';
    // const rightIconClass = iconRight ? getIconClasses(iconRight) : '';
    // const onlyIconClass = iconOnly ? getIconClasses(iconOnly) : '';

    return (
      <Comp
        className={cn(buttonStyles({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Render icons and children - Placeholder logic */}
        {iconLeft && <LightIcon iconId={iconLeft} className="mr-2" />}
        {iconOnly && <LightIcon iconId={iconOnly} />}
        {!iconOnly && children}
        {iconRight && <LightIcon iconId={iconRight} className="ml-2" />}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button };
