'use client';

import React, { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
import { format, isValid, parse, isDate, isAfter, isBefore, isSameDay } from 'date-fns';
import { Icon } from '@/components/ui/atoms/icons';
import { Calendar } from '@/components/ui/atoms/data-display/calendar';
import { DatePickerProps, DatePickerCalendarProps, DatePickerEvent, DateFormat } from './types';
import {
  getDatePickerContainerClasses,
  getDatePickerLabelClasses,
  getDatePickerInputContainerClasses,
  getDatePickerInputClasses,
  getDatePickerIconClasses,
  getDatePickerCalendarContainerClasses,
  getCalendarHeaderClasses,
  getCalendarNavButtonClasses,
  getCalendarMonthYearClasses,
  getCalendarWeekdayClasses,
  getCalendarDayCellClasses,
  getHelperTextClasses,
  getEventIndicatorClasses
} from './styles';

// Constants
const DAYS_OF_WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * CSS to hide native calendar controls in browsers
 */
const dateInputStyle = `
  /* Hide native calendar icon in Chrome, Edge, Safari */
  input[type="date"]::-webkit-calendar-picker-indicator {
    display: none !important;
    -webkit-appearance: none;
    opacity: 0;
  }
  
  /* Override browser styles for date inputs */
  input[type="date"] {
    position: relative;
    appearance: textfield; /* Firefox */
    -webkit-appearance: textfield; /* Chrome, Safari */
    -moz-appearance: textfield; /* Firefox */
  }
  
  /* Special handling for IE/Edge older versions */
  input[type="date"]::-ms-clear,
  input[type="date"]::-ms-reveal {
    display: none;
  }
  
  /* Make sure date input has proper padding for our custom icon */
  .date-input-container {
    position: relative;
  }
  
  .date-input-container input {
    padding-right: 30px; /* Make room for our custom icon */
  }
`;

/**
 * DatePickerCalendar Component
 * Internal component for the calendar popup
 */
const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
  selectedDate,
  onSelect,
  minDate,
  maxDate,
  disabledDates = [],
  events = [],
  month,
  year,
  onPrevMonth,
  onNextMonth,
  className
}) => {
  const today = new Date();
  
  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get the first day of the month (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  let firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust to make Monday first day (0-6, where 0 is Monday)
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  const isDateDisabled = (date: Date): boolean => {
    // Check if date is before minDate
    if (minDate && isBefore(date, minDate) && !isSameDay(date, minDate)) {
      return true;
    }
    
    // Check if date is after maxDate
    if (maxDate && isAfter(date, maxDate) && !isSameDay(date, maxDate)) {
      return true;
    }
    
    // Check if date is in disabledDates array
    return disabledDates.some(disabledDate => 
      isDate(disabledDate) && isSameDay(disabledDate, date)
    );
  };
  
  const getEventsForDay = (day: number): DatePickerEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day && 
        eventDate.getMonth() === month && 
        eventDate.getFullYear() === year
      );
    });
  };
  
  const renderDays = () => {
    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-8 w-8" aria-hidden="true"></div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = getEventsForDay(day);
      const hasEvents = dayEvents.length > 0;
      
      const isToday = (
        today.getDate() === day && 
        today.getMonth() === month && 
        today.getFullYear() === year
      );
      
      const isSelected = selectedDate ? (
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year
      ) : false;
      
      const disabled = isDateDisabled(date);
      
      days.push(
        <div
          key={`day-${day}`}
          className="relative"
          onClick={() => !disabled && onSelect(date)}
        >
          <div
            className={getCalendarDayCellClasses(isToday, isSelected, disabled, hasEvents)}
            aria-selected={isSelected}
            aria-disabled={disabled}
          >
            {day}
          </div>
          
          {/* Event indicator dot */}
          {hasEvents && !disabled && (
            <div className={getEventIndicatorClasses(dayEvents[0].color)}></div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className={`p-2 ${className || ''}`}>
      {/* Calendar Header */}
      <div className={getCalendarHeaderClasses()}>
        <button
          type="button"
          onClick={onPrevMonth}
          className={getCalendarNavButtonClasses()}
          aria-label="Previous month"
        >
          <Icon name="faChevronLeft" className="h-4 w-4" />
        </button>
        
        <div className={getCalendarMonthYearClasses()}>
          {MONTHS[month]} {year}
        </div>
        
        <button
          type="button"
          onClick={onNextMonth}
          className={getCalendarNavButtonClasses()}
          aria-label="Next month"
        >
          <Icon name="faChevronRight" className="h-4 w-4" />
        </button>
      </div>
      
      {/* Calendar Body */}
      <div className="mt-2">
        {/* Weekdays header */}
        <div className="grid grid-cols-7 gap-1" role="row">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className={getCalendarWeekdayClasses()} role="columnheader">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1 mt-1" role="grid">
          {renderDays()}
        </div>
      </div>
    </div>
  );
};

/**
 * DatePicker Component
 * 
 * A form component for selecting dates with a calendar interface.
 * 
 * @example
 * ```tsx
 * // Basic date picker
 * <DatePicker
 *   onChange={(date) => console.log(date)}
 *   placeholder="Select a date"
 * />
 * 
 * // With validation and formatting
 * <DatePicker
 *   label="Appointment Date"
 *   minDate={new Date()}
 *   format="MM/dd/yyyy"
 *   required
 *   helperText="Select a date in the future"
 * />
 * 
 * // With events
 * <DatePicker
 *   events={[
 *     { id: 1, date: new Date(), title: 'Meeting', color: '#ff0000' }
 *   ]}
 * />
 * ```
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(({
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  disabled = false,
  placeholder = 'Select a date',
  format = 'MM/dd/yyyy',
  showClearButton = true,
  closeOnSelect = true,
  position = 'bottom-left',
  events = [],
  className,
  inputClassName,
  calendarClassName,
  label,
  helperText,
  required,
  name,
  id,
  error,
  errorMessage,
  ...props
}, ref) => {
  // Generate a random ID if not provided
  const uniqueId = useRef(id || `datepicker-${Math.random().toString(36).substr(2, 9)}`);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || defaultValue || null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [month, setMonth] = useState<number>(
    selectedDate ? selectedDate.getMonth() : new Date().getMonth()
  );
  const [year, setYear] = useState<number>(
    selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()
  );
  
  // Update input value when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setInputValue(format ? format === 'ISO' ? selectedDate.toISOString() : format === 'UTC' ? selectedDate.toUTCString() : format(selectedDate, format) : selectedDate.toDateString());
    } else {
      setInputValue('');
    }
  }, [selectedDate, format]);
  
  // Update internal state when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedDate(value);
      
      if (value) {
        setMonth(value.getMonth());
        setYear(value.getFullYear());
      }
    }
  }, [value]);
  
  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle input change (manual date entry)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Try to parse the date from the input
    if (value) {
      try {
        // Use date-fns parse with the specified format
        const parsedDate = parse(value, format, new Date());
        
        if (isValid(parsedDate)) {
          // Check if date is within allowed range
          if (
            (!minDate || !isBefore(parsedDate, minDate) || isSameDay(parsedDate, minDate)) &&
            (!maxDate || !isAfter(parsedDate, maxDate) || isSameDay(parsedDate, maxDate)) &&
            !disabledDates.some(disabledDate => isSameDay(parsedDate, disabledDate))
          ) {
            setSelectedDate(parsedDate);
            setMonth(parsedDate.getMonth());
            setYear(parsedDate.getFullYear());
            
            if (onChange) {
              onChange(parsedDate);
            }
          }
        }
      } catch (error) {
        // Invalid date format, don't update the date
      }
    } else {
      // If input is cleared, reset the selected date
      setSelectedDate(null);
      if (onChange) {
        onChange(null);
      }
    }
  };
  
  // Handle input click to open the calendar
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };
  
  // Handle clear button click
  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    setInputValue('');
    if (onChange) {
      onChange(null);
    }
  };
  
  // Handle selecting a date from the calendar
  const handleSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    
    if (onChange) {
      onChange(date);
    }
    
    if (closeOnSelect) {
      setIsOpen(false);
      
      // Focus back on input after selection
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [onChange, closeOnSelect]);
  
  // Handle month navigation
  const handlePrevMonth = useCallback(() => {
    setMonth(prevMonth => {
      if (prevMonth === 0) {
        setYear(prevYear => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  }, []);
  
  const handleNextMonth = useCallback(() => {
    setMonth(prevMonth => {
      if (prevMonth === 11) {
        setYear(prevYear => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  }, []);
  
  return (
    <div
      ref={ref}
      className={getDatePickerContainerClasses(className)}
      {...props}
    >
      {/* Custom CSS to hide native calendar controls */}
      <style>{dateInputStyle}</style>
      
      {/* Label */}
      {label && (
        <label
          htmlFor={uniqueId.current}
          className={getDatePickerLabelClasses(required)}
        >
          {label}
        </label>
      )}
      
      {/* Input container */}
      <div
        ref={containerRef}
        className="relative"
      >
        <div className={getDatePickerInputContainerClasses(error)}>
          <input
            ref={inputRef}
            type="text"
            id={uniqueId.current}
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            onClick={handleInputClick}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={getDatePickerInputClasses(disabled, error, inputClassName)}
            autoComplete="off"
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required ? 'true' : 'false'}
          />
          
          {/* Calendar icon */}
          <div className={getDatePickerIconClasses(disabled)}>
            <Icon name="faCalendar" className="h-4 w-4" />
          </div>
          
          {/* Clear button */}
          {showClearButton && selectedDate && !disabled && (
            <button
              type="button"
              onClick={handleClearClick}
              className="absolute right-10 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Clear date"
            >
              <Icon name="faTimes" className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Calendar dropdown */}
        {isOpen && (
          <div
            className={getDatePickerCalendarContainerClasses(position, calendarClassName)}
            role="dialog"
            aria-label="Calendar"
          >
            <DatePickerCalendar
              selectedDate={selectedDate}
              onSelect={handleSelect}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              events={events}
              month={month}
              year={year}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          </div>
        )}
      </div>
      
      {/* Helper text or error message */}
      {(helperText || (error && errorMessage)) && (
        <p className={getHelperTextClasses(error)}>
          {error && errorMessage ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker; 