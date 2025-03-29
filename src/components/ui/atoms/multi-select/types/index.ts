import { HTMLAttributes } from 'react';

export type MultiSelectSize = 'sm' | 'md' | 'lg';
export type MultiSelectVariant = 'default' | 'outline' | 'filled';
export type MultiSelectStatus = 'default' | 'error' | 'success' | 'warning';

export interface MultiSelectOption {
  /**
   * Unique value for the option
   */
  value: string;
  
  /**
   * Display label for the option
   */
  label: string;
  
  /**
   * Optional group this option belongs to
   */
  group?: string;
  
  /**
   * Whether this option is disabled
   */
  disabled?: boolean;
  
  /**
   * Optional description for the option
   */
  description?: string;
  
  /**
   * Optional icon or image for the option
   */
  icon?: React.ReactNode;
}

export interface MultiSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Unique identifier for the component
   */
  id: string;
  
  /**
   * The size of the multi-select
   * @default 'md'
   */
  size?: MultiSelectSize;
  
  /**
   * The variant style of the multi-select
   * @default 'default'
   */
  variant?: MultiSelectVariant;
  
  /**
   * The validation status of the multi-select
   * @default 'default'
   */
  status?: MultiSelectStatus;
  
  /**
   * Whether the multi-select is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Label for the multi-select
   */
  label?: string;
  
  /**
   * Whether to show the label
   * @default true
   */
  showLabel?: boolean;
  
  /**
   * Placeholder text when no options are selected
   * @default 'Select options...'
   */
  placeholder?: string;
  
  /**
   * Helper text to display below the multi-select
   */
  helperText?: string;
  
  /**
   * Error message to display when status is 'error'
   */
  errorMessage?: string;
  
  /**
   * Array of available options
   */
  options: MultiSelectOption[];
  
  /**
   * Currently selected values
   */
  value: string[];
  
  /**
   * Callback fired when selection changes
   */
  onChange: (value: string[]) => void;
  
  /**
   * Maximum number of items that can be selected
   * @default undefined (no limit)
   */
  maxItems?: number;
  
  /**
   * Minimum number of items that must be selected
   * @default 0
   */
  minItems?: number;
  
  /**
   * Whether to show a clear button to remove all selections
   * @default true
   */
  clearable?: boolean;
  
  /**
   * Whether to enable search filtering of options
   * @default true
   */
  searchable?: boolean;
  
  /**
   * Whether to allow creating new options
   * @default false
   */
  creatable?: boolean;
  
  /**
   * Callback for creating a new option
   * Should return the new option object
   */
  onCreateOption?: (inputValue: string) => MultiSelectOption;
  
  /**
   * Whether to show selected items as removable pills
   * @default true
   */
  showSelectedAsPills?: boolean;
  
  /**
   * Whether to group options by the group property
   * @default true when options have group property
   */
  groupOptions?: boolean;
  
  /**
   * Custom loading indicator
   */
  loadingIndicator?: React.ReactNode;
  
  /**
   * Whether the options are currently loading
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Custom no options message
   */
  noOptionsMessage?: string | ((inputValue: string) => string);
  
  /**
   * Whether the dropdown menu should close after an option is selected
   * @default false (for multi-select)
   */
  closeMenuOnSelect?: boolean;
} 