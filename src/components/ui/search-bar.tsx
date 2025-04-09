/**
 * @component SearchBar
 * @category atom
 * @subcategory search
 * @description A search input component using Shadcn Input internally, with icon, optional clear button, loading state, and debouncing.
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './icon/icon';
import { Input } from '@/components/ui/input'; // Import Shadcn Input

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value'> { // Omit value as well for controlled component pattern
  /** Current search value (controlled) */
  value: string; // Make value controlled
  /** Callback when search value changes */
  onChange: (value: string) => void; // Make onChange required for controlled component
  /** Callback when search is submitted (Enter or debounced) */
  onSearch?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show a clear button */
  showClear?: boolean;
  /** Whether to search automatically as user types */
  autoSearch?: boolean;
  /** Debounce time in ms for autoSearch */
  debounce?: number;
  /** Whether to focus the input on mount */
  autoFocus?: boolean;
  /** Size variant - affects padding and icon sizes */
  size?: 'sm' | 'md' | 'lg';
  /** Additional classes for the wrapper div */
  className?: string;
  /** Additional classes specifically for the Input component */
  inputClassName?: string;
  /** Whether the search is currently loading */
  isLoading?: boolean;
}

/**
 * Search bar component built upon Shadcn Input, with configurable behavior.
 * This is a controlled component: 'value' and 'onChange' props are required.
 */
export function SearchBar({
  value, // Controlled value from props
  onChange, // Controlled onChange from props
  onSearch,
  placeholder = 'Search...',
  showClear = true,
  autoSearch = false,
  debounce = 300,
  autoFocus = false,
  size = 'md',
  className,
  inputClassName, // New prop for input specific styling
  isLoading = false,
  ...props // Pass remaining InputHTMLAttributes to the Input component
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue); // Call prop onChange directly

    // Handle auto search with debounce
    if (autoSearch && onSearch) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounce);
    }
  };

  // Handle clear button click
  const handleClear = () => {
    onChange(''); // Call prop onChange directly
    if (autoSearch && onSearch) {
      // Clear any pending debounce and search immediately with empty string
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      onSearch('');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle key down (for Enter key)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      // Clear any pending debounce if user presses Enter
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      onSearch(value);
    }
  };

  // Calculate size-dependent padding classes for the Input component
  const getInputPaddingClasses = () => {
    switch (size) {
      case 'sm':
        return 'pl-8 pr-8'; // Padding for icons
      case 'lg':
        return 'pl-12 pr-12'; // Padding for icons
      default: // md
        return 'pl-10 pr-10'; // Padding for icons
    }
  };

  // Calculate icon sizes based on input size
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3.5 h-3.5';
      case 'lg':
        return 'w-5 h-5';
      default: // md
        return 'w-4 h-4';
    }
  };

  // Calculate icon position based on input size
  const getIconPosition = () => {
    switch (size) {
      case 'sm':
        return 'left-2.5';
      case 'lg':
        return 'left-4';
      default: // md
        return 'left-3';
    }
  };

  // Calculate clear button/spinner position based on input size
  const getClearPosition = () => {
    switch (size) {
      case 'sm':
        return 'right-2.5';
      case 'lg':
        return 'right-4';
      default: // md
        return 'right-3';
    }
  };

  // Map SearchBar size prop to Input size prop if needed, or use padding classes
  // Note: Shadcn Input doesn't have explicit sm/lg height variants by default,
  // height is controlled by h-* classes. We'll apply height classes if needed.
  const getInputHeightClass = () => {
    switch (size) {
      case 'sm': return 'h-8';
      case 'lg': return 'h-12';
      default: return 'h-10'; // Default Shadcn input height
    }
  }


  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Icon */}
      <div className={cn(
        'absolute top-1/2 -translate-y-1/2 pointer-events-none', // Added pointer-events-none
        getIconPosition()
      )}>
        <Icon
          iconId="faSearchLight" // Consider making icon prop configurable?
          className={cn('text-muted-foreground', getIconSize())} // Use muted-foreground
        />
      </div>

      {/* Search Input - Use Shadcn Input component */}
      <Input
        ref={inputRef}
        type="text" // Use text type, can be overridden via props if needed
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          getInputHeightClass(),
          getInputPaddingClasses(),
          // Remove custom styles now handled by Shadcn Input base styles:
          // 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700',
          // 'rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          inputClassName // Apply specific input classes passed via prop
        )}
        disabled={isLoading}
        {...props} // Spread remaining props (like name, id, aria-*, etc.)
      />

      {/* Loading Spinner or Clear Button */}
      {(isLoading || (showClear && value.length > 0)) && (
        <div className={cn(
          'absolute top-1/2 -translate-y-1/2',
          getClearPosition()
        )}>
          {isLoading ? (
            <div className={cn(
              'animate-spin rounded-full border-2 border-border border-t-primary', // Use theme colors
              getIconSize()
            )}
            />
          ) : (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "text-muted-foreground hover:text-foreground focus:outline-none rounded-full", // Use theme colors
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" // Add focus ring
              )}
              aria-label="Clear search"
            >
              <Icon iconId="faTimesLight" className={getIconSize()} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar; 