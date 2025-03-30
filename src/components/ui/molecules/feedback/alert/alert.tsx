'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive" | "success" | "warning" | "info";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "bg-background text-foreground",
    destructive: "bg-destructive/15 text-destructive border-destructive/50",
    success: "bg-success/15 text-success border-success/50",
    warning: "bg-warning/15 text-warning border-warning/50",
    info: "bg-info/15 text-info border-info/50",
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-md border p-4",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

/**
 * alert - Combined component exporting all subcomponents
 * 
 * This component is the default export to ensure compatibility with dynamic imports.
 */
const alert = {
  Alert,
  AlertTitle,
  AlertDescription
};

export default alert;
