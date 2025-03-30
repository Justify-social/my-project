'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card component props
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant
   * @default "default"
   */
  variant?: 'default' | 'outline' | 'elevated' | 'flat';
  
  /**
   * Whether the card should take up the full width of its container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Whether the card should have hover effects
   * @default false
   */
  interactive?: boolean;
}

/**
 * Card component
 * 
 * A container that groups related content and actions.
 * 
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Content goes here
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', fullWidth = false, interactive = false, ...props }, ref) => {
    const variantClasses = {
      default: "border border-divider bg-background shadow-sm",
      outline: "border border-divider bg-background",
      elevated: "border-none bg-background shadow-md",
      flat: "bg-background border-none",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg",
          variantClasses[variant],
          fullWidth ? "w-full" : "",
          interactive ? "transition-shadow hover:shadow-md" : "",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

/**
 * CardHeader component props
 */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to center the content
   * @default false
   */
  centered?: boolean;
}

/**
 * Card header component
 * 
 * Container for card title and description.
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, centered = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        centered && "items-center text-center",
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

/**
 * CardTitle component props
 */
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * HTML heading level to use
   * @default 3
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Card title component
 * 
 * Title element for the card.
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Heading = 'h3', ...props }, ref) => (
    <Heading
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-primary",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

/**
 * Card description component
 * 
 * Secondary text for the card.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-secondary", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent component props
 */
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Remove padding from content
   * @default false
   */
  noPadding?: boolean;
}

/**
 * Card content component
 * 
 * Container for the main content of the card.
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, noPadding = false, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        noPadding ? "" : "p-6 pt-0",
        className
      )} 
      {...props} 
    />
  )
);
CardContent.displayName = "CardContent";

/**
 * CardFooter component props
 */
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Center the footer content
   * @default false
   */
  centered?: boolean;
  
  /**
   * Align footer content to the right
   * @default false
   */
  right?: boolean;
  
  /**
   * Add a divider line above the footer
   * @default false
   */
  divider?: boolean;
}

/**
 * Card footer component
 * 
 * Container for card actions and secondary content.
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, centered = false, right = false, divider = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "p-6 pt-0",
        {
          "flex items-center": true,
          "justify-center": centered,
          "justify-end": right && !centered,
          "justify-start": !right && !centered,
          "border-t border-divider mt-4 pt-4": divider
        },
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}; 
/**
 * Default export for Card
 */
export default Card;
