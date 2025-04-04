"use client";

/**
 * Combobox implementation following shadcn patterns
 * 
 * A composable combobox component built with Radix UI Popover and Command primitives.
 * This implementation follows the same patterns as other shadcn UI components.
 */

import * as React from "react";
import { Button } from "@/components/ui/atoms/button/Button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/atoms/command/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/atoms/popover/Popover";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/atoms/icon";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps extends React.HTMLAttributes<HTMLDivElement> {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
  popoverAlign?: "start" | "center" | "end";
  searchPlaceholder?: string;
}

const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({ 
    className,
    options,
    value,
    onValueChange,
    placeholder = "Select an option...",
    emptyMessage = "No results found.",
    disabled = false,
    triggerClassName,
    contentClassName,
    popoverAlign = "start",
    searchPlaceholder = "Search...",
    ...props 
  }, ref) => {
    const [open, setOpen] = React.useState(false);
    
    const selectedOption = React.useMemo(() => 
      options.find(option => option.value === value), 
      [options, value]
    );

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between font-normal",
                !value && "text-muted-foreground",
                disabled && "opacity-50 cursor-not-allowed",
                triggerClassName
              )}
              onClick={() => setOpen(!open)}
            >
              {selectedOption ? selectedOption.label : placeholder}
              <Icon 
                iconId="faChevronDownLight"
                className={cn(
                  "ml-2 h-4 w-4 shrink-0 opacity-50",
                  open && "rotate-180 transform"
                )}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className={cn(
              "p-0 min-w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)]",
              contentClassName
            )}
            align={popoverAlign}
          >
            <Command>
              <CommandInput placeholder={searchPlaceholder} />
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={() => {
                      onValueChange?.(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex-1">{option.label}</div>
                    {value === option.value && (
                      <Icon 
                        iconId="faCheckLight"
                        className="h-4 w-4"
                      />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

Combobox.displayName = "Combobox";

export { Combobox };
