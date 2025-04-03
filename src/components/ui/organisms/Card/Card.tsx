"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Card Component System
 * 
 * A comprehensive set of card components following SSOT principles.
 * This is the canonical source for all base card components.
 */

// Card component props
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'raised' | 'interactive';
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable, ...props }, ref) => {
    const variantClasses = {
      default: "border bg-card text-card-foreground shadow",
      outline: "border bg-card text-card-foreground",
      raised: "border bg-card text-card-foreground shadow-lg",
      interactive: "border bg-card text-card-foreground shadow transition-all duration-200"
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl",
          variantClasses[variant],
          hoverable && "hover:shadow-md hover:scale-[1.01] cursor-pointer",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

// CardHeader props
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, icon, actions, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {icon && <div className="mb-2">{icon}</div>}
      <div className="flex justify-between items-center">
        <div className="flex-1">{props.children}</div>
        {actions && <div className="ml-4">{actions}</div>}
      </div>
    </div>
  )
)
CardHeader.displayName = "CardHeader"

// CardTitle props
export interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'default' | 'large';
}

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, size = 'default', ...props }, ref) => {
    const sizeClasses = {
      small: "text-sm font-medium",
      default: "text-lg font-semibold",
      large: "text-xl font-bold"
    };
    
    return (
      <div
        ref={ref}
        className={cn("leading-none tracking-tight", sizeClasses[size], className)}
        {...props}
      />
    )
  }
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

// CardFooter props
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between';
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, align = 'start', ...props }, ref) => {
    const alignClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between"
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center p-6 pt-0", 
          alignClasses[align],
          className
        )}
        {...props}
      />
    )
  }
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }

// No default export - follow SSOT principles 