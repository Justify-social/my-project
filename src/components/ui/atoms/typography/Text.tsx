import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const textVariants = cva("", {
  variants: {
    size: {
      default: "text-base",
      xs: "text-xs",
      sm: "text-sm",
      lg: "text-lg",
      xl: "text-xl"
    },
    weight: {
      default: "font-normal",
      light: "font-light",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold"
    },
    variant: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
      destructive: "text-destructive"
    }
  },
  defaultVariants: {
    size: "default",
    weight: "default",
    variant: "default"
  }
});

export interface TextProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof textVariants> {}

export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ className, size, weight, variant, ...props }, ref) => {
    return (
      <span
        className={cn(textVariants({ size, weight, variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

export default Text; 