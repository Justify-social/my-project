import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-4xl font-bold tracking-tight lg:text-5xl",
      h2: "text-3xl font-bold tracking-tight",
      h3: "text-2xl font-bold tracking-tight",
      h4: "text-xl font-semibold tracking-tight",
      h5: "text-lg font-semibold tracking-tight",
      h6: "text-base font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      small: "text-sm font-medium leading-none",
      lead: "text-xl text-muted-foreground",
    }
  },
  defaultVariants: {
    variant: "p",
  }
});

export interface TypographyProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "p", ...props }, ref) => {
    const Comp = variant as keyof JSX.IntrinsicElements;
    return (
      <Comp
        className={cn(typographyVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Typography.displayName = 'Typography';

export default Typography; 