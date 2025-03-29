import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/string/utils';
import { MultiSelectProps, MultiSelectSize, MultiSelectVariant, MultiSelectStatus, MultiSelectOption } from './types';

/**
 * MultiSelect component for selecting multiple options from a list.
 */
export function MultiSelect({
  id,
  className,
  size = 'md',
  variant = 'default',
  status = 'default',
  disabled = false,
  label,
  showLabel = true,
  placeholder = 'Select options...',
  helperText,
  errorMessage,
  options = [],
  value = [],
  onChange,
  maxItems,
  minItems = 0,
  clearable = true,
  searchable = true,
  creatable = false,
  onCreateOption,
  showSelectedAsPills = true,
  groupOptions,
  loadingIndicator,
  isLoading = false,
  noOptionsMessage = 'No options available',
  closeMenuOnSelect = false,
  ...props
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Size-based classes
  const sizeClasses: Record<MultiSelectSize, string> = {
    sm: 'text-sm min-h-[32px] py-1 px-2',
    md: 'text-base min-h-[40px] py-2 px-3',
    lg: 'text-lg min-h-[48px] py-3 px-4',
  };
  
  // Input size classes
  const inputSizeClasses: Record<MultiSelectSize, string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  // Pill size classes
  const pillSizeClasses: Record<MultiSelectSize, string> = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-2.5',
  };

  // Variant classes
  const variantClasses: Record<MultiSelectVariant, string> = {
    default: 'border border-french-grey bg-white focus-within:border-accent focus-within:ring-1 focus-within:ring-accent',
    outline: 'border-2 border-french-grey bg-transparent focus-within:border-accent',
    filled: 'border border-transparent bg-gray-100 focus-within:bg-white focus-within:ring-1 focus-within:ring-accent',
  };

  // Status classes
  const statusClasses: Record<MultiSelectStatus, string> = {
    default: '',
    error: 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500',
    success: 'border-green-500 focus-within:border-green-500 focus-within:ring-green-500',
    warning: 'border-yellow-500 focus-within:border-yellow-500 focus-within:ring-yellow-500',
  };

  // Determine if options should be grouped
  const shouldGroupOptions = groupOptions ?? options.some(option => !!option.group);
  
  // Filter options based on search
  const filteredOptions = searchable && searchValue
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        option.value.toLowerCase().includes(searchValue.toLowerCase())
      )
    : options;
  
  // Group options if needed
  const groupedOptions = shouldGroupOptions
    ? filteredOptions.reduce((groups, option) => {
        const groupName = option.group || 'Ungrouped';
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(option);
        return groups;
      }, {} as Record<string, MultiSelectOption[]>)
    : { 'Options': filteredOptions };
  
  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  };
  
  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    if (disabled) return;
    
    let newValue: string[];
    
    if (value.includes(optionValue)) {
      // Remove option if already selected
      newValue = value.filter(val => val !== optionValue);
    } else {
      // Add option if not selected and not exceeding maxItems
      if (maxItems !== undefined && value.length >= maxItems) {
        return; // Don't add if max items reached
      }
      newValue = [...value, optionValue];
    }
    
    // Validate minItems
    if (newValue.length < minItems) {
      return; // Don't remove if it would go below minItems
    }
    
    onChange(newValue);
    
    if (closeMenuOnSelect) {
      setIsOpen(false);
    }
    
    // Clear search after selection
    if (searchable) {
      setSearchValue('');
    }
  };
  
  // Handle create option
  const handleCreateOption = () => {
    if (!creatable || !onCreateOption || !searchValue.trim()) return;
    
    const newOption = onCreateOption(searchValue);
    handleOptionSelect(newOption.value);
    setSearchValue('');
  };
  
  // Clear all selections
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || value.length === 0) return;
    
    // Validate minItems
    if (minItems > 0) {
      return; // Don't clear if it would go below minItems
    }
    
    onChange([]);
  };
  
  // Remove a specific selection
  const handleRemoveSelection = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    
    const newValue = value.filter(val => val !== optionValue);
    
    // Validate minItems
    if (newValue.length < minItems) {
      return; // Don't remove if it would go below minItems
    }
    
    onChange(newValue);
  };
  
  // Get option object by value
  const getOptionByValue = (optionValue: string) => {
    return options.find(option => option.value === optionValue);
  };
  
  // Render selected options as pills
  const renderSelectedOptions = () => {
    if (!showSelectedAsPills || value.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 py-1">
        {value.map(selectedValue => {
          const option = getOptionByValue(selectedValue);
          if (!option) return null;
          
          return (
            <div 
              key={option.value}
              className={cn(
                "rounded-full bg-gray-200 flex items-center gap-1",
                pillSizeClasses[size],
                disabled && "opacity-50"
              )}
            >
              {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
              <span className="max-w-[150px] truncate">{option.label}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveSelection(option.value, e)}
                className={cn(
                  "text-gray-500 hover:text-gray-700 rounded-full",
                  "focus:outline-none focus:ring-2 focus:ring-accent",
                  "ml-1 p-0.5",
                  disabled && "pointer-events-none"
                )}
                disabled={disabled}
                aria-label={`Remove ${option.label}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render no options message
  const renderNoOptionsMessage = () => {
    const message = typeof noOptionsMessage === 'function' 
      ? noOptionsMessage(searchValue) 
      : noOptionsMessage;
    
    return (
      <div className="py-2 px-3 text-gray-500 text-center">
        {message}
      </div>
    );
  };
  
  // Render option groups
  const renderOptionGroups = () => {
    return Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
      <div key={groupName} className="py-1">
        {shouldGroupOptions && groupName !== 'Options' && (
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {groupName}
          </div>
        )}
        {groupOptions.length > 0 ? (
          groupOptions.map(option => renderOption(option))
        ) : (
          groupName === 'Options' && renderNoOptionsMessage()
        )}
      </div>
    ));
  };
  
  // Render a single option
  const renderOption = (option: MultiSelectOption) => {
    const isSelected = value.includes(option.value);
    const isDisabled = option.disabled || disabled;
    
    return (
      <div
        key={option.value}
        className={cn(
          "px-3 py-2 cursor-pointer flex items-center gap-2",
          "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
          isSelected && "bg-gray-100",
          isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        )}
        onClick={() => !isDisabled && handleOptionSelect(option.value)}
        role="option"
        aria-selected={isSelected}
        tabIndex={isDisabled ? -1 : 0}
      >
        <div className={cn(
          "flex-shrink-0 h-4 w-4 border rounded",
          isSelected 
            ? "bg-accent border-accent flex items-center justify-center" 
            : "border-gray-300"
        )}>
          {isSelected && (
            <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <div className="flex-grow flex items-center gap-2">
          {option.icon && (
            <span className="flex-shrink-0">{option.icon}</span>
          )}
          <div className="flex flex-col">
            <span className="font-medium">{option.label}</span>
            {option.description && (
              <span className="text-xs text-gray-500">{option.description}</span>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Create option row
  const renderCreateOption = () => {
    if (!creatable || !searchValue.trim() || filteredOptions.some(o => o.label === searchValue)) {
      return null;
    }
    
    return (
      <div
        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-accent flex items-center gap-2"
        onClick={handleCreateOption}
        role="option"
        tabIndex={0}
      >
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        <span>Create "{searchValue}"</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1" {...props}>
      {/* Label */}
      {label && showLabel && (
        <label 
          htmlFor={id}
          className={cn(
            "text-sm font-medium mb-1",
            disabled ? "text-gray-400" : "text-gray-700",
            status === 'error' && 'text-red-500'
          )}
        >
          {label}
        </label>
      )}
      
      {/* Multi-select container */}
      <div
        ref={containerRef}
        className={cn(
          'relative w-full rounded-md transition-colors duration-200',
          sizeClasses[size],
          variantClasses[variant],
          status !== 'default' && statusClasses[status],
          disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
          'cursor-pointer',
          className
        )}
        onClick={toggleDropdown}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            {/* Selected items as pills or placeholder */}
            <div className="flex-grow flex flex-wrap gap-1 items-center">
              {showSelectedAsPills && value.length > 0 ? (
                renderSelectedOptions()
              ) : (
                <div className={cn(
                  "flex-grow",
                  value.length === 0 && "text-gray-400"
                )}>
                  {searchable && isOpen ? (
                    <input
                      ref={inputRef}
                      type="text"
                      className={cn(
                        "w-full bg-transparent border-none focus:outline-none focus:ring-0",
                        inputSizeClasses[size]
                      )}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={value.length === 0 ? placeholder : ''}
                      disabled={disabled}
                      aria-expanded={isOpen}
                      aria-controls={`${id}-options`}
                    />
                  ) : (
                    value.length === 0 ? placeholder : (
                      <span className="truncate">
                        {value.map(v => getOptionByValue(v)?.label).join(', ')}
                      </span>
                    )
                  )}
                </div>
              )}
              
              {/* Indicator buttons */}
              <div className="flex items-center gap-1 ml-1">
                {clearable && value.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className={cn(
                      "text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent rounded",
                      disabled && "pointer-events-none"
                    )}
                    disabled={disabled}
                    aria-label="Clear selections"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                <div className="flex-shrink-0 ml-1">
                  {isLoading ? (
                    loadingIndicator || (
                      <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )
                  ) : (
                    <svg 
                      className={cn(
                        "h-4 w-4 text-gray-500 transition-transform duration-200",
                        isOpen && 'transform rotate-180'
                      )}
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dropdown menu */}
        {isOpen && (
          <div 
            id={`${id}-options`}
            className={cn(
              "absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg",
              "max-h-60 overflow-auto py-1 ring-1 ring-black ring-opacity-5",
              "left-0 right-0"
            )}
            role="listbox"
            aria-multiselectable="true"
          >
            {isLoading ? (
              <div className="py-4 text-center text-gray-500">
                {loadingIndicator || (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading options...</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {renderOptionGroups()}
                {renderCreateOption()}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Helper text or error message */}
      {status === 'error' && errorMessage ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-500">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="mt-1 text-xs text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default MultiSelect; 