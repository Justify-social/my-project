/**
 * @component SearchBar
 * @category input
 * @subcategory search
 * @description A search input component with icon and optional clear button
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './icon/icon';

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  /** Current search value */
  value?: string;
  /** Callback when search value changes */
  onChange?: (value: string) => void;
  /** Callback when search is submitted */
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
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional classes */
  className?: string;
  /** Whether the search is currently loading */
  isLoading?: boolean;
}

/**
 * Search bar component with configurable behavior
 */
export function SearchBar({
  value: propValue,
  onChange,
  onSearch,
  placeholder = 'Search...',
  showClear = true,
  autoSearch = false,
  debounce = 300,
  autoFocus = false,
  size = 'md',
  className,
  isLoading = false,
  ...props
}: SearchBarProps) {
  const [value, setValue] = useState(propValue || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with prop value
  useEffect(() => {
    if (propValue !== undefined && propValue !== value) {
      setValue(propValue);
    }
  }, [propValue]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);

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
    setValue('');
    onChange?.('');
    if (autoSearch && onSearch) {
      onSearch('');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle key down (for Enter key)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  // Calculate size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 text-sm pl-8 pr-8';
      case 'lg':
        return 'h-12 text-lg pl-12 pr-12';
      default:
        return 'h-10 text-base pl-10 pr-10';
    }
  };

  // Calculate icon sizes
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3.5 h-3.5';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  // Calculate icon position
  const getIconPosition = () => {
    switch (size) {
      case 'sm':
        return 'left-2.5';
      case 'lg':
        return 'left-4';
      default:
        return 'left-3';
    }
  };

  // Calculate clear button position
  const getClearPosition = () => {
    switch (size) {
      case 'sm':
        return 'right-2.5';
      case 'lg':
        return 'right-4';
      default:
        return 'right-3';
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Search Icon */}
      <div className={cn('absolute top-1/2 -translate-y-1/2', getIconPosition())}>
        <Icon 
          iconId="faSearchLight" 
          className={cn('text-gray-400', getIconSize())}
        />
      </div>

      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700',
          'rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          getSizeClasses()
        )}
        disabled={isLoading}
        {...props}
      />

      {/* Loading Spinner or Clear Button */}
      {(isLoading || (showClear && value.length > 0)) && (
        <div className={cn('absolute top-1/2 -translate-y-1/2', getClearPosition())}>
          {isLoading ? (
            <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', getIconSize())} />
          ) : (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
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