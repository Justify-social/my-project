'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface CalendarDayEvent {
  id: string | number;
  date: Date;
  title: string;
  type?: 'primary' | 'secondary' | 'accent' | 'default';
}

export interface CalendarProps {
  month?: number; // 0-11
  year?: number;
  events?: CalendarDayEvent[];
  onDateSelect?: (date: Date) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  className?: string;
  selectedDate?: Date;
}

const DAYS_OF_WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'
];

export function Calendar({
  month: propMonth,
  year: propYear,
  events = [],
  onDateSelect,
  onPrevMonth,
  onNextMonth,
  className,
  selectedDate,
}: CalendarProps) {
  const today = new Date();
  
  // Use props if provided, otherwise use current month and year
  const [month, setMonth] = useState(propMonth !== undefined ? propMonth : today.getMonth());
  const [year, setYear] = useState(propYear !== undefined ? propYear : today.getFullYear());

  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get the first day of the month (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  let firstDayOfMonth = new Date(year, month, 1).getDay();
  // Convert from Sunday-based (0-6) to Monday-based (0-6)
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setMonth(newMonth);
    setYear(newYear);
    
    if (onPrevMonth) {
      onPrevMonth();
    }
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setMonth(newMonth);
    setYear(newYear);
    
    if (onNextMonth) {
      onNextMonth();
    }
  };

  const renderDays = () => {
    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-9 flex items-center justify-center text-gray-400"></div>
      );
    }
    
    // Add calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if there are events on this day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && 
               eventDate.getMonth() === month && 
               eventDate.getDate() === day;
      });
      
      const isToday = today.getFullYear() === year && 
                       today.getMonth() === month && 
                       today.getDate() === day;
                       
      const isSelected = selectedDate?.getFullYear() === year && 
                         selectedDate?.getMonth() === month && 
                         selectedDate?.getDate() === day;
      
      days.push(
        <div 
          key={day} 
          onClick={() => onDateSelect && onDateSelect(date)}
          className={cn(
            "h-9 flex items-center justify-center text-center cursor-pointer relative",
            isSelected && !isToday && "bg-[#00BFFF] text-white rounded",
            isToday && !isSelected && "border border-[#00BFFF] rounded",
            isToday && isSelected && "bg-[#00BFFF] text-white rounded"
          )}
        >
          {day}
          {dayEvents.length > 0 && (
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[#3182CE]"></span>
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className={cn("bg-white overflow-hidden", className)}>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Previous month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Next month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="px-4 py-3">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="h-9 flex items-center justify-center font-medium text-sm text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {renderDays()}
        </div>
      </div>
    </div>
  );
}

export default Calendar; 