/**
 * DatePicker Component Types
 * 
 * This file contains all the type definitions for the DatePicker component.
 */

/**
 * Date format options for the DatePicker
 */
export type DateFormat = 'yyyy-MM-dd' | 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'MMMM d, yyyy' | string;

/**
 * Event object for dates with events
 */
export interface DatePickerEvent {
  /** Unique identifier for the event */
  id: string | number;
  /** Event date */
  date: Date;
  /** Event title/description */
  title: string;
  /** Optional color for the event indicator */
  color?: string;
}

/**
 * DatePicker component props
 * Omitting className and defaultValue from div element props to avoid conflicts
 */
export interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  /** The initially selected date (controlled) */
  value?: Date | null;
  /** Default value for uncontrolled component */
  defaultValue?: Date | null;
  /** Called when the date changes */
  onChange?: (date: Date | null) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Array of dates to disable */
  disabledDates?: Date[];
  /** Whether the input should be disabled */
  disabled?: boolean;
  /** Placeholder text for the input when no date is selected */
  placeholder?: string;
  /** Format to display the date in */
  format?: DateFormat;
  /** Whether to show a clear button */
  showClearButton?: boolean;
  /** Whether the picker should close on date selection */
  closeOnSelect?: boolean;
  /** Position of the calendar dropdown */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /** Optional events to display in the calendar */
  events?: DatePickerEvent[];
  /** Optional CSS class for the input */
  inputClassName?: string;
  /** Optional CSS class for the calendar popup */
  calendarClassName?: string;
  /** Optional label for the input */
  label?: string;
  /** Optional helper text */
  helperText?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Input name */
  name?: string;
  /** Input id */
  id?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
}

/**
 * Internal props for the Calendar component used within DatePicker
 */
export interface DatePickerCalendarProps {
  /** Selected date */
  selectedDate?: Date | null;
  /** Called when a date is selected */
  onSelect: (date: Date) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Array of dates to disable */
  disabledDates?: Date[];
  /** Optional events to display */
  events?: DatePickerEvent[];
  /** Month to display (0-11) */
  month: number;
  /** Year to display */
  year: number;
  /** Called when moving to previous month */
  onPrevMonth: () => void;
  /** Called when moving to next month */
  onNextMonth: () => void;
  /** Optional CSS class */
  className?: string;
} 