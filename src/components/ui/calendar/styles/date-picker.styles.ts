/**
 * DatePicker Component Styles
 * 
 * This file contains the style utility functions for the DatePicker component.
 */

/**
 * Get the container classes for the DatePicker component
 */
export function getDatePickerContainerClasses(
  className?: string, 
  error?: boolean
): string {
  const baseClasses = 'relative font-work-sans';
  const errorClasses = error ? 'date-picker-error' : '';
  
  return `${baseClasses} ${errorClasses} ${className || ''}`.trim();
}

/**
 * Get the label classes for the DatePicker component
 */
export function getDatePickerLabelClasses(
  required?: boolean
): string {
  const baseClasses = 'block mb-1 text-sm font-medium text-gray-700 font-work-sans';
  const requiredClasses = required ? 'required' : '';
  
  return `${baseClasses} ${requiredClasses}`.trim();
}

/**
 * Get the input container classes for the DatePicker component
 */
export function getDatePickerInputContainerClasses(
  disabled?: boolean
): string {
  const baseClasses = 'relative date-input-container font-work-sans';
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : '';
  
  return `${baseClasses} ${disabledClasses}`.trim();
}

/**
 * Get the input classes for the DatePicker component
 */
export function getDatePickerInputClasses(
  inputClassName?: string,
  error?: boolean,
  disabled?: boolean
): string {
  const baseClasses = 'block w-full rounded-md shadow-sm py-2 pr-10 pl-3 font-work-sans';
  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900 placeholder-red-300'
    : 'border-gray-300 focus:border-[#00BFFF] focus:ring-[#00BFFF]';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  
  return `${baseClasses} ${stateClasses} ${disabledClasses} ${inputClassName || ''}`.trim();
}

/**
 * Get the icon container classes for the DatePicker component
 */
export function getDatePickerIconClasses(
  disabled?: boolean
): string {
  const baseClasses = 'absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none font-work-sans';
  const disabledClasses = disabled ? 'text-gray-400' : 'text-gray-500';
  
  return `${baseClasses} ${disabledClasses}`.trim();
}

/**
 * Get the calendar container classes for the DatePicker component
 */
export function getDatePickerCalendarContainerClasses(
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right',
  calendarClassName?: string
): string {
  const baseClasses = 'absolute z-10 mt-1 bg-white shadow-lg rounded-md border border-gray-200 font-work-sans';
  
  // Position classes
  let positionClasses = '';
  switch (position) {
    case 'bottom-left':
      positionClasses = 'left-0 top-full';
      break;
    case 'bottom-right':
      positionClasses = 'right-0 top-full';
      break;
    case 'top-left':
      positionClasses = 'left-0 bottom-full mb-1';
      break;
    case 'top-right':
      positionClasses = 'right-0 bottom-full mb-1';
      break;
    default:
      positionClasses = 'left-0 top-full';
  }
  
  return `${baseClasses} ${positionClasses} ${calendarClassName || ''}`.trim();
}

/**
 * Get the calendar header classes for the DatePicker component
 */
export function getCalendarHeaderClasses(): string {
  return 'flex items-center justify-between p-3 border-b border-gray-200 font-work-sans';
}

/**
 * Get the calendar navigation button classes for the DatePicker component
 */
export function getCalendarNavButtonClasses(): string {
  return 'p-1 rounded-full hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00BFFF] font-work-sans';
}

/**
 * Get the month/year text classes for the DatePicker component
 */
export function getCalendarMonthYearClasses(): string {
  return 'text-sm font-medium text-gray-900 font-sora';
}

/**
 * Get the weekday header classes for the DatePicker component
 */
export function getCalendarWeekdayClasses(): string {
  return 'h-8 flex items-center justify-center text-xs font-medium text-gray-500 font-work-sans';
}

/**
 * Get the day cell classes for the DatePicker component based on its state
 */
export function getCalendarDayCellClasses(
  isToday: boolean,
  isSelected: boolean,
  isDisabled: boolean,
  hasEvent: boolean
): string {
  const baseClasses = 'h-8 w-8 flex items-center justify-center text-sm rounded-full font-work-sans';
  
  // First handle disabled state
  if (isDisabled) {
    return `${baseClasses} text-gray-300 cursor-not-allowed font-work-sans`;
  }
  
  // Then handle selected state
  if (isSelected) {
    return `${baseClasses} bg-[#00BFFF] text-white font-medium hover:bg-[#00A6DF] cursor-pointer font-work-sans`;
  }
  
  // Then handle today
  if (isToday) {
    return `${baseClasses} border border-[#00BFFF] text-[#00BFFF] hover:bg-blue-50 cursor-pointer font-work-sans`;
  }
  
  // Events indicator gets a dot, but doesn't change the main cell style
  const baseStyle = `${baseClasses} text-gray-700 hover:bg-gray-100 cursor-pointer font-work-sans`;
  
  return baseStyle;
}

/**
 * Get the helper text classes for the DatePicker component
 */
export function getHelperTextClasses(error?: boolean): string {
  const baseClasses = 'mt-1 text-xs font-work-sans';
  const colorClasses = error ? 'text-red-500' : 'text-gray-500';
  
  return `${baseClasses} ${colorClasses}`.trim();
}

/**
 * Get the event indicator dot classes for the DatePicker component
 */
export function getEventIndicatorClasses(color?: string): string {
  return `absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${color || 'bg-[#3182CE]'} font-work-sans`;
} 