"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Icon } from '@/components/ui/atoms/icon'
import { cn } from "@/lib/utils"
import { CheckboxProps } from "./types"

// Base Checkbox component that uses Radix UI Checkbox
const BaseCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Icon iconId="faCheckLight" className="h-4 w-4"/>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
BaseCheckbox.displayName = "BaseCheckbox"

// Utility hook to merge refs
function useMergeRefs<T = any>(
  ...refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | null | undefined>
): React.RefCallback<T> {
  return React.useCallback((value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }, [refs])
}

// Enhanced Checkbox that implements CheckboxProps interface
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className,
    checkboxClassName,
    labelClassName,
    label,
    labelPosition = 'right',
    size = 'md',
    color = 'interactive',
    indeterminate = false,
    id,
    ...props 
  }, forwardedRef) => {
    // Generate a unique ID if not provided
    const generatedId = React.useId()
    const checkboxId = id || `checkbox-${generatedId}`
    
    // Create our own internal ref
    const internalRef = React.useRef<HTMLInputElement>(null)
    
    // Merge the forwarded ref and our internal ref
    const ref = useMergeRefs(internalRef, forwardedRef)
    
    // Use effect to set indeterminate state
    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])
    
    // Size classes mapping
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    }
    
    // Label size classes
    const labelSizeClasses = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    }
    
    // Color classes mapping
    const colorClasses = {
      interactive: "data-[state=checked]:bg-interactive data-[state=checked]:border-interactive",
      primary: "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
      accent: "data-[state=checked]:bg-accent data-[state=checked]:border-accent",
      secondary: "data-[state=checked]:bg-secondary data-[state=checked]:border-secondary",
      success: "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600",
      warning: "data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500",
      destructive: "data-[state=checked]:bg-destructive data-[state=checked]:border-destructive",
    }
    
    // Spacing based on size
    const spacing = {
      sm: "gap-1 items-center",
      md: "gap-2 items-center",
      lg: "gap-3 items-center",
    }
    
    // If no label is provided, return just the checkbox
    if (!label) {
      return (
        <div className={className}>
          <input 
            type="checkbox"
            id={checkboxId}
            className="sr-only" 
            ref={ref}
            {...props}
          />
          <BaseCheckbox
            checked={props.checked}
            defaultChecked={props.defaultChecked}
            onCheckedChange={(checked) => {
              if (props.onChange) {
                // Create a synthetic event
                const event = {
                  target: {
                    checked: checked === true
                  }
                } as React.ChangeEvent<HTMLInputElement>
                props.onChange(event)
              }
            }}
            disabled={props.disabled}
            required={props.required}
            name={props.name}
            value={props.value as string}
            id={checkboxId}
            className={cn(
              sizeClasses[size],
              colorClasses[color],
              checkboxClassName
            )}
          />
        </div>
      )
    }
    
    // Otherwise, render checkbox with label
    return (
      <div 
        className={cn(
          "flex", 
          spacing[size],
          labelPosition === 'left' ? 'flex-row-reverse justify-end' : 'flex-row',
          className
        )}
      >
        <input 
          type="checkbox"
          id={checkboxId}
          className="sr-only" 
          ref={ref}
          {...props}
        />
        <BaseCheckbox
          checked={props.checked}
          defaultChecked={props.defaultChecked}
          onCheckedChange={(checked) => {
            if (props.onChange) {
              // Create a synthetic event
              const event = {
                target: {
                  checked: checked === true
                }
              } as React.ChangeEvent<HTMLInputElement>
              props.onChange(event)
            }
          }}
          disabled={props.disabled}
          required={props.required}
          name={props.name}
          value={props.value as string}
          id={checkboxId}
          className={cn(
            sizeClasses[size],
            colorClasses[color],
            checkboxClassName
          )}
        />
        <label 
          htmlFor={checkboxId} 
          className={cn(
            labelSizeClasses[size],
            "text-foreground cursor-pointer",
            props.disabled && "opacity-50 cursor-not-allowed",
            labelClassName
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
