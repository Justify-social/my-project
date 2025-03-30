import { cn } from '@/utils/string/utils';

/**
 * Container class for the entire DatePicker component
 */
export function getDatePickerContainerClasses(className?: string) {
  return cn('relative w-full', className);
}

/**
 * Label class for the DatePicker
 */
export function getDatePickerLabelClasses(required?: boolean) {
  return cn(
    'block text-sm font-medium text-gray-700 mb-1',
    required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
  );
}

/**
 * Input container class for the DatePicker
 */
export function getDatePickerInputContainerClasses(error?: boolean) {
  return cn(
    'relative flex items-center w-full',
    error ? 'border-red-500 focus-within:border-red-500' : 'border-gray-300 focus-within:border-blue-500'
  );
}

/**
 * Input class for the DatePicker
 */
export function getDatePickerInputClasses(disabled?: boolean, error?: boolean, inputClassName?: string) {
  return cn(
    'block w-full rounded-md border py-2 pl-3 pr-10 text-sm outline-none transition-colors',
    disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    inputClassName
  );
}

/**
 * Icon class for the DatePicker
 */
export function getDatePickerIconClasses(disabled?: boolean) {
  return cn(
    'absolute right-3 pointer-events-none',
    disabled ? 'text-gray-400' : 'text-gray-500'
  );
}

/**
 * Calendar container class for the DatePicker dropdown
 */
export function getDatePickerCalendarContainerClasses(
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right',
  calendarClassName?: string
) {
  return cn(
    'absolute z-10 mt-1 rounded-md border border-gray-200 bg-white shadow-lg',
    {
      'top-full left-0': position === 'bottom-left',
      'top-full right-0': position === 'bottom-right',
      'bottom-full left-0': position === 'top-left',
      'bottom-full right-0': position === 'top-right',
    },
    calendarClassName
  );
}

/**
 * Calendar header class for the DatePicker
 */
export function getCalendarHeaderClasses() {
  return cn('flex items-center justify-between px-2 py-2 border-b border-gray-200');
}

/**
 * Calendar navigation button class
 */
export function getCalendarNavButtonClasses() {
  return cn(
    'p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
  );
}

/**
 * Calendar month/year heading class
 */
export function getCalendarMonthYearClasses() {
  return cn('text-sm font-semibold');
}

/**
 * Calendar weekday header class
 */
export function getCalendarWeekdayClasses() {
  return cn('h-8 flex items-center justify-center text-xs font-medium text-gray-500');
}

/**
 * Calendar day cell class
 */
export function getCalendarDayCellClasses(
  isToday: boolean,
  isSelected: boolean,
  disabled: boolean,
  hasEvents: boolean
) {
  return cn(
    'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
    {
      'bg-blue-100 text-blue-900': isToday && !isSelected,
      'bg-blue-500 text-white': isSelected,
      'hover:bg-gray-100': !isSelected && !disabled,
      'text-gray-400 cursor-not-allowed': disabled,
      'font-semibold': hasEvents && !disabled,
    }
  );
}

/**
 * Helper text class for the DatePicker
 */
export function getHelperTextClasses(error?: boolean) {
  return cn('mt-1 text-xs', error ? 'text-red-500' : 'text-gray-500');
}

/**
 * Event indicator class for the DatePicker calendar
 */
export function getEventIndicatorClasses(color?: string) {
  return cn(
    'absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 h-1 w-1 rounded-full',
    color || 'bg-blue-500'
  );
} 

// Default export added by auto-fix script
export default {};
