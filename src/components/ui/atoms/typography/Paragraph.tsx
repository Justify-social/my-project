import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const paragraphVariants = cva("leading-7 [&:not(:first-child)]:mt-6", {
  variants: {
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg"
    }
  },
  defaultVariants: {
    size: "default"
  }
});

export interface ParagraphProps 
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphVariants> {
  asChild?: boolean;
}

export const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <p
        className={cn(paragraphVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Paragraph.displayName = 'Paragraph';

export default Paragraph; 