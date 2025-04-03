import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const headingVariants = cva("", {
  variants: {
    level: {
      1: "text-4xl font-bold tracking-tight lg:text-5xl",
      2: "text-3xl font-bold tracking-tight",
      3: "text-2xl font-bold tracking-tight",
      4: "text-xl font-semibold tracking-tight",
      5: "text-lg font-semibold tracking-tight",
      6: "text-base font-semibold tracking-tight",
    }
  },
  defaultVariants: {
    level: 2,
  }
});

export interface HeadingProps 
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading = ({ 
  className, 
  level = 2, 
  ...props 
}: HeadingProps) => {
  const Tag = `h${level}` as const;
  
  return React.createElement(
    Tag, 
    { 
      className: cn(headingVariants({ level }), className),
      ...props
    }
  );
};

Heading.displayName = 'Heading';

export default Heading; 