'use client';

import React, { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
import { format, isValid, parse, isDate, isAfter, isBefore, isSameDay } from 'date-fns';
import { Icon } from '@/components/ui/icons';
import { DatePickerProps, DatePickerCalendarProps, DatePickerEvent } from './types';
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
} from './styles/date-picker.styles';

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
        <div key={`empty-${i}`} className="h-8 w-8 font-work-sans"></div>
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
          className="relative font-work-sans"
          onClick={() => !disabled && onSelect(date)}
        >
          <div
            className={getCalendarDayCellClasses(isToday, isSelected, disabled, hasEvents)}
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
    <div className={`p-2 font-work-sans ${className || ''}`}>
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
      <div className="mt-2 font-work-sans">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-1 font-work-sans">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className={getCalendarWeekdayClasses()}>
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 font-work-sans">
          {renderDays()}
        </div>
      </div>
    </div>
  );
};

/**
 * DatePicker Component
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({
    value,
    defaultValue,
    onChange,
    minDate,
    maxDate,
    disabledDates = [],
    disabled = false,
    placeholder = 'Select date',
    format: dateFormat = 'MM/dd/yyyy',
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
    // State for controlled/uncontrolled component
    const [date, setDate] = useState<Date | null>(value !== undefined ? value : defaultValue || null);
    const [inputValue, setInputValue] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState<number>(
      date ? date.getMonth() : new Date().getMonth()
    );
    const [calendarYear, setCalendarYear] = useState<number>(
      date ? date.getFullYear() : new Date().getFullYear()
    );
    
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Effects
    
    // Update date state when value prop changes
    useEffect(() => {
      if (value !== undefined) {
        setDate(value);
      }
    }, [value]);
    
    // Update input value when date changes
    useEffect(() => {
      if (date && isValid(date)) {
        try {
          setInputValue(format(date, dateFormat));
        } catch (error) {
          console.error('Invalid date format', error);
          setInputValue('');
        }
      } else {
        setInputValue('');
      }
    }, [date, dateFormat]);
    
    // Handle click outside
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
    
    // Handlers
    
    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      try {
        // Try to parse the date from the input value
        const parsedDate = parse(newValue, dateFormat, new Date());
        if (isValid(parsedDate)) {
          setDate(parsedDate);
          setCalendarMonth(parsedDate.getMonth());
          setCalendarYear(parsedDate.getFullYear());
          onChange?.(parsedDate);
        }
      } catch (error) {
        // If parsing fails, we don't update the date
        console.error('Failed to parse date', error);
      }
    };
    
    // Handle date selection from calendar
    const handleDateSelect = useCallback((selectedDate: Date) => {
      setDate(selectedDate);
      if (closeOnSelect) {
        setIsOpen(false);
      }
      
      // Update calendar month and year
      setCalendarMonth(selectedDate.getMonth());
      setCalendarYear(selectedDate.getFullYear());
      
      onChange?.(selectedDate);
      
      // Focus the input after selection
      inputRef.current?.focus();
    }, [closeOnSelect, onChange]);
    
    // Handle input click (open the calendar)
    const handleInputClick = () => {
      if (!disabled) {
        setIsOpen(true);
      }
    };
    
    // Handle clear button click
    const handleClearClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setDate(null);
      setInputValue('');
      onChange?.(null);
      inputRef.current?.focus();
    };
    
    // Handle calendar navigation
    const handlePrevMonth = useCallback(() => {
      setCalendarMonth(prevMonth => {
        let newMonth = prevMonth - 1;
        let newYear = calendarYear;
        
        if (newMonth < 0) {
          newMonth = 11;
          newYear--;
          setCalendarYear(newYear);
        }
        
        return newMonth;
      });
    }, [calendarYear]);
    
    const handleNextMonth = useCallback(() => {
      setCalendarMonth(prevMonth => {
        let newMonth = prevMonth + 1;
        let newYear = calendarYear;
        
        if (newMonth > 11) {
          newMonth = 0;
          newYear++;
          setCalendarYear(newYear);
        }
        
        return newMonth;
      });
    }, [calendarYear]);
    
    return (
      <div className={getDatePickerContainerClasses(className, error)} ref={containerRef}>
        {/* Hidden style to override browser defaults */}
        <style>{dateInputStyle}</style>
        
        {/* Label */}
        {label && (
          <label 
            htmlFor={id || name} 
            className={getDatePickerLabelClasses(required)}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        
        {/* Input with icon */}
        <div className={getDatePickerInputContainerClasses(disabled)} onClick={handleInputClick}>
          <input
            ref={inputRef}
            type="text"
            id={id}
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            placeholder={placeholder}
            className={getDatePickerInputClasses(inputClassName, error, disabled)}
            readOnly={false}
            {...props}
          />
          
          <div className={getDatePickerIconClasses(disabled)}>
            {showClearButton && inputValue && !disabled ? (
              <button
                type="button"
                onClick={handleClearClick}
                aria-label="Clear date"
                className="p-1 rounded-full hover:bg-gray-100 cursor-pointer mr-1 font-work-sans"
              >
                <Icon name="faTimes" className="h-3 w-3 text-gray-400" />
              </button>
            ) : null}
            <Icon name="faCalendar" className="h-4 w-4" solid={false} />
          </div>
        </div>
        
        {/* Error or helper text */}
        {(error && errorMessage) || helperText ? (
          <div className={getHelperTextClasses(error)}>
            {error ? errorMessage : helperText}
          </div>
        ) : null}
        
        {/* Calendar popup */}
        {isOpen && (
          <div className={getDatePickerCalendarContainerClasses(position, calendarClassName)}>
            <DatePickerCalendar
              selectedDate={date}
              onSelect={handleDateSelect}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              events={events}
              month={calendarMonth}
              year={calendarYear}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

/**
 * DatePicker Example Component
 * Shows how to use the DatePicker with state
 */
export const DatePickerExample: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Example events
  const events = [
    {
      id: 1,
      date: new Date(),
      title: 'Today',
      color: 'bg-green-500'
    },
    {
      id: 2,
      date: new Date(new Date().setDate(new Date().getDate() + 3)),
      title: 'Meeting',
      color: 'bg-blue-500'
    }
  ];
  
  return (
    <div className="p-4 max-w-md font-work-sans">
      <h2 className="text-lg font-medium mb-3 font-sora">DatePicker Example</h2>
      
      <DatePicker
        label="Select a date"
        value={selectedDate}
        onChange={setSelectedDate}
        events={events}
        helperText="Click to select a date"
      />
      
      {selectedDate && (
        <div className="mt-4 p-3 bg-gray-50 rounded font-work-sans">
          <p>Selected date: {format(selectedDate, 'MMMM d, yyyy')}</p>
        </div>
      )}
    </div>
  );
}; 