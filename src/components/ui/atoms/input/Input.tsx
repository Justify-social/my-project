"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { InputProps } from "./types"
import { IconAdapter } from "@/components/ui/atoms/icon/adapters"

// Basic input component without the enhanced features
const BaseInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
BaseInput.displayName = "BaseInput"

// Enhanced input component with all features from InputProps
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    type = "text",
    label,
    helpText,
    error,
    fullWidth = false,
    inputSize = "md",
    leftIcon,
    rightIcon,
    containerClassName,
    wrapperClassName,
    labelClassName,
    helpTextClassName,
    errorClassName,
    id,
    ...props 
  }, ref) => {
    // Always generate the ID, regardless of whether id prop is provided
    const generatedId = React.useId();
    // Use provided id or generated one
    const inputId = id || generatedId;
    
    // Generate help/error IDs for aria-describedby
    const helpTextId = helpText ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [helpTextId, errorId].filter(Boolean).join(" ") || undefined;
    
    // Determine size-based classes
    const sizeClasses = {
      sm: "h-7 px-2 text-xs",
      md: "h-9 px-3 text-sm",
      lg: "h-11 px-4 text-base",
    };
    
    // If this is just a basic input without enhancements, render the BaseInput
    if (!label && !helpText && !error && !leftIcon && !rightIcon) {
      return (
        <BaseInput
          id={inputId}
          type={type}
          className={cn(
            sizeClasses[inputSize],
            fullWidth ? "w-full" : "",
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }
    
    // Otherwise, render the enhanced version with all features
    return (
      <div className={cn("flex flex-col", fullWidth ? "w-full" : "", containerClassName)}>
        {label && (
          <label 
            htmlFor={inputId} 
            className={cn(
              "mb-1.5 text-sm font-medium text-foreground",
              labelClassName
            )}
          >
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        
        <div 
          className={cn(
            "relative flex items-center",
            wrapperClassName
          )}
        >
          {leftIcon && (
            <div className="absolute left-2.5 flex items-center justify-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <BaseInput
            id={inputId}
            type={type}
            className={cn(
              sizeClasses[inputSize],
              leftIcon ? "pl-8" : "",
              rightIcon ? "pr-8" : "",
              error ? "border-destructive" : "",
              fullWidth ? "w-full" : "",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-2.5 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(helpText || error) && (
          <div className="mt-1.5">
            {error ? (
              <p 
                id={errorId} 
                className={cn(
                  "text-xs text-destructive",
                  errorClassName
                )}
              >
                {error}
              </p>
            ) : helpText ? (
              <p 
                id={helpTextId} 
                className={cn(
                  "text-xs text-muted-foreground",
                  helpTextClassName
                )}
              >
                {helpText}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input }
