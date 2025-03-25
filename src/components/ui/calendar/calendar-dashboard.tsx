'use client';

import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Icon from "../icon";

// Interface for the calendar events
export interface CalendarDashboardProps {
  month: Date;
  events: Array<{
    id: string | number;
    title: string;
    start: Date;
    end?: Date;
    platform?: string;
    budget?: number;
    kpi?: string;
    status?: string;
    statusText?: string;
    statusClass?: string;
    color?: string;
  }>;
}

// Define the event type for internal use
type CalendarEvent = {
  id: string | number;
  title: string;
  start: Date;
  end?: Date;
  platform?: string;
  budget?: number;
  kpi?: string;
  status?: string;
  statusText?: string;
  statusClass?: string;
  color?: string;
};

// Calendar component with timeline view for dashboard
const CalendarDashboard: React.FC<CalendarDashboardProps> = ({
  month,
  events
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date(month.getFullYear(), month.getMonth(), 1));
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Also add validation for events to prevent errors
  const validEvents = useMemo(() => {
    return events.filter(event => 
      event && 
      event.id && 
      event.title && 
      event.start instanceof Date && 
      !isNaN(event.start.getTime())
    ) as CalendarEvent[];
  }, [events]);
  
  // Helper function for getting colors based on platform
  const getCampaignColor = (platform: string, status?: string): string => {
    // First check for status-based colors
    if (status) {
      const statusColors: Record<string, string> = {
        'draft': '#9CA3AF', // Grey for Draft
        'in_review': '#F59E0B', // Yellow for In Review
        'in-review': '#F59E0B',
        'inreview': '#F59E0B',
        'active': '#10B981', // Green for Active
        'approved': '#10B981',
        'submitted': '#10B981',
        'completed': '#3B82F6', // Blue for Completed
        'paused': '#F59E0B'
      };
      
      const normalizedStatus = status.toLowerCase();
      if (statusColors[normalizedStatus]) {
        return statusColors[normalizedStatus];
      }
    }
    
    // Fall back to platform-based colors if no status or unrecognized status
    const platformColors: Record<string, string> = {
      'instagram': '#E1306C',
      'facebook': '#3b5998',
      'twitter': '#1DA1F2',
      'tiktok': '#000000',
      'youtube': '#FF0000',
      'linkedin': '#0077B5',
      'other': '#00BFFF'
    };
    
    return platformColors[platform.toLowerCase()] || platformColors.other;
  };
  
  // Calculate campaign positions for timeline bars
  const calculateCampaignRows = (events: CalendarEvent[]) => {
    if (!events || events.length === 0) return { rows: [], eventPositions: {} };
    
    // Sort events by start date and duration
    const sortedEvents = [...events].sort((a, b) => {
      const aStart = new Date(a.start).getTime();
      const bStart = new Date(b.start).getTime();
      
      // First sort by start date
      if (aStart !== bStart) {
        return aStart - bStart;
      }
      
      // If start dates are the same, sort by duration (shorter first)
      const aEnd = a.end ? new Date(a.end).getTime() : aStart + 86400000;
      const bEnd = b.end ? new Date(b.end).getTime() : bStart + 86400000;
      return (aEnd - aStart) - (bEnd - bStart);
    });
    
    // Assign row positions (track occupied slots)
    const rows: Array<Array<CalendarEvent>> = [];
    const eventPositions: Record<string | number, number> = {};
    
    sortedEvents.forEach(event => {
      // Skip invalid events
      if (!event || !event.id) return;
      
      // Find the first available row
      let rowIndex = 0;
      let foundRow = false;
      
      while (!foundRow) {
        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }
        
        // Check if this row has space for the event
        const hasOverlap = rows[rowIndex].some(existingEvent => {
          const eventStart = new Date(event.start);
          const eventEnd = event.end ? new Date(event.end) : new Date(eventStart.getTime() + 86400000);
          const existingStart = new Date(existingEvent.start);
          const existingEnd = existingEvent.end ? new Date(existingEvent.end) : new Date(existingStart.getTime() + 86400000);
          
          return (eventStart < existingEnd && eventEnd > existingStart);
        });
        
        if (!hasOverlap) {
          rows[rowIndex].push(event);
          eventPositions[event.id] = rowIndex;
          foundRow = true;
        } else {
          rowIndex++;
        }
      }
    });
    
    return { rows, eventPositions };
  };
  
  // Calculate event positions
  const { rows, eventPositions } = useMemo(() => 
    calculateCampaignRows(validEvents), 
    [validEvents]
  );
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const monthName = monthStart.toLocaleString('default', {
    month: 'long'
  });
  const year = monthStart.getFullYear();

  // Generate calendar days
  const days = [];
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  
  // Get the first day of the month (0-6, where 0 is Sunday)
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  // Adjust to make Monday the first day (0-6, where 0 is Monday)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  // Create day objects
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    const isToday = new Date().toDateString() === currentDate.toDateString();
    
    days.push({
      day: i,
      isToday,
      date: currentDate
    });
  }
  
  // Helper function for positioning event bars
  const getEventBarStyle = (event: CalendarEvent, rowIndex: number) => {
    if (!calendarRef.current) return {};
    
    // Get event dates
    const eventStart = new Date(event.start);
    const eventEnd = event.end ? new Date(event.end) : new Date(eventStart.getTime() + 86400000);
    
    // Adjust dates to calendar view
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const displayStart = eventStart < monthStart ? monthStart : eventStart;
    const displayEnd = eventEnd > monthEnd ? monthEnd : eventEnd;
    
    // Get day cells for calculating positions later
    return {
      startDay: displayStart.getDate(),
      endDay: displayEnd.getDate(),
      rowIndex: rowIndex,
      color: event.color || getCampaignColor(event.platform || 'other', event.status)
    };
  };
  
  // First, add this new state for all bar positions outside any loops
  const [barPositions, setBarPositions] = useState<Record<string | number, { left: number, top: number, width: number }>>({});

  // Filter events for the current month only
  const currentMonthEvents = useMemo(() => {
    return validEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : new Date(eventStart.getTime() + 86400000);
      
      // Check if the event overlaps with the current month
      return (eventStart <= monthEnd && eventEnd >= monthStart);
    });
  }, [validEvents, currentMonth, monthStart, monthEnd]);

  // Then replace the useEffect with useLayoutEffect and add position comparison
  useLayoutEffect(() => {
    if (!calendarRef.current || currentMonthEvents.length === 0) return;
    
    const newPositions: Record<string | number, { left: number, top: number, width: number }> = {};
    let hasChanges = false;
    
    currentMonthEvents.forEach(event => {
      const barStyle = getEventBarStyle(event, eventPositions[event.id] || 0);
      if (!barStyle.startDay || !barStyle.endDay) return;
      
      const startCell = calendarRef.current?.querySelector(`[data-day="${barStyle.startDay}"]`);
      const endCell = calendarRef.current?.querySelector(`[data-day="${barStyle.endDay}"]`);
      
      if (!startCell || !endCell || !calendarRef.current) return;
      
      const calendarRect = calendarRef.current.getBoundingClientRect();
      const startRect = startCell.getBoundingClientRect();
      const endRect = endCell.getBoundingClientRect();
      
      const newPosition = {
        left: startRect.left - calendarRect.left + 2,
        top: startRect.top - calendarRect.top + 18 + (barStyle.rowIndex * 5),
        width: (endRect.right - startRect.left) - 4
      };
      
      newPositions[event.id] = newPosition;
      
      // Check if position actually changed
      const oldPosition = barPositions[event.id];
      if (!oldPosition || 
          oldPosition.left !== newPosition.left || 
          oldPosition.top !== newPosition.top || 
          oldPosition.width !== newPosition.width) {
        hasChanges = true;
      }
    });
    
    // Only update state if positions actually changed
    if (hasChanges) {
      setBarPositions(newPositions);
    }
  }, [currentMonthEvents, eventPositions, currentMonth]);
  
  // Normalize platform values to match file names
  const normalizePlatform = (platform: string): string => {
    const platformMap: Record<string, string> = {
      'twitter': 'x-twitter',
      'twitter x': 'x-twitter',
      'x': 'x-twitter'
    };
    
    return platformMap[platform.toLowerCase()] || platform.toLowerCase();
  };
  
  // Update month when prop changes
  useEffect(() => {
    const newMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    if (newMonth.getTime() !== currentMonth.getTime()) {
      setCurrentMonth(newMonth);
    }
  }, [month]);
  
  return (
    <div 
      className="bg-white rounded-lg border border-[var(--divider-color)] overflow-hidden h-full flex flex-col font-work-sans"
      ref={calendarRef}
    >
      <div className="p-4 flex items-center justify-between border-b border-[var(--divider-color)] font-work-sans">
        <h3 className="text-base font-semibold text-center font-sora">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex space-x-2 font-work-sans">
          <button onClick={prevMonth} className="group p-1 rounded-md hover:bg-[var(--background-color)] font-work-sans">
            <Icon name="faChevronLeft" className="w-5 h-5 text-[var(--secondary-color)] font-work-sans" iconType="button" />
          </button>
          <button onClick={nextMonth} className="group p-1 rounded-md hover:bg-[var(--background-color)] font-work-sans">
            <Icon name="faChevronRight" className="w-5 h-5 text-[var(--secondary-color)] font-work-sans" iconType="button" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-grow font-work-sans">
        {/* Day headers with consistent width */}
        <div className="grid grid-cols-7 text-center py-2 px-1 text-xs font-medium text-[var(--secondary-color)] font-work-sans">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
            <div key={day} className="flex justify-center items-center py-1 font-work-sans">{day}</div>
          ))}
        </div>
        
        {/* Calendar grid with fixed height */}
        <div 
          className="grid grid-cols-7 gap-1 px-1 pb-2 font-work-sans relative" 
          style={{ height: '420px' }} // Fixed height for 6 rows (the maximum possible)
        >
          {/* Empty cells for days not in this month at the beginning */}
          {Array.from({ length: adjustedFirstDay }).map((_, index) => (
            <div key={`empty-start-${index}`} className="calendar-cell h-[60px] bg-gray-50 rounded-md"></div>
          ))}
          
          {/* Actual days in the month */}
          {days.map((day, dayIndex) => (
            <div 
              key={`day-${day.day}`} 
              className={`calendar-cell h-[60px] p-1 rounded-md relative ${
                day.isToday ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-white hover:bg-gray-50'
              }`}
              data-day={day.day}
              data-date={day.date.toISOString()}
            >
              <div className="text-xs font-medium text-[var(--secondary-color)]">{day.day}</div>
            </div>
          ))}
          
          {/* Empty cells for days not in this month at the end */}
          {Array.from({ length: (7 - ((adjustedFirstDay + daysInMonth) % 7)) % 7 }).map((_, index) => (
            <div key={`empty-end-${index}`} className="calendar-cell h-[60px] bg-gray-50 rounded-md"></div>
          ))}
          
          {/* Event bars layer */}
          {currentMonthEvents.map((event) => {
            const barStyle = getEventBarStyle(event, eventPositions[event.id] || 0);
            
            // Skip if required data is missing
            if (!barStyle.startDay || !barStyle.endDay) return null;
            
            // Get position from the barPositions state
            const position = barPositions[event.id] || { left: 0, top: 0, width: 0 };
            
            return (
              <div
                key={`event-bar-${event.id}`}
                className="absolute pointer-events-auto rounded-md border px-1 text-xs truncate hover:shadow-md transition-shadow flex items-center"
                style={{
                  left: `${position.left}px`,
                  top: `${position.top}px`,
                  width: `${position.width}px`,
                  height: '18px',
                  backgroundColor: `${barStyle.color}20`, // 20% opacity
                  borderColor: barStyle.color,
                  zIndex: 10 + barStyle.rowIndex,
                  display: position.width > 0 ? 'block' : 'none'
                }}
                onMouseEnter={(e) => {
                  setHoveredEvent(String(event.id));
                  setTooltipPosition({
                    x: e.clientX,
                    y: e.clientY
                  });
                }}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                {event.platform && (
                  <span className="inline-flex items-center justify-center mr-1 w-3 h-3" style={{ marginTop: '1px' }}>
                    <img 
                      src={`/ui-icons/brands/${normalizePlatform(event.platform)}.svg`} 
                      alt=""
                      className="w-3 h-3"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </span>
                )}
                {event.title}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Tooltip for event details */}
      {hoveredEvent && (
        (() => {
          const event = currentMonthEvents.find(e => String(e.id) === hoveredEvent);
          if (!event) return null;
          
          return (
            <div 
              className="fixed z-50 bg-white rounded-md shadow-lg border border-[var(--divider-color)] p-3 max-w-xs"
              style={{
                left: `${tooltipPosition.x + 10}px`,
                top: `${tooltipPosition.y + 10}px`
              }}
            >
              <div className="text-left" style={{ border: 'none', outline: 'none' }}>
                <h4 className="font-semibold text-sm font-sora">{event.title}</h4>
                <div className="text-xs text-[var(--secondary-color)] mt-1 font-work-sans" style={{ border: 'none', outline: 'none' }}>
                  <div className="flex items-center font-work-sans" style={{ border: 'none', outline: 'none' }}>
                    <Icon name="faCalendar" className="w-3 h-3 mr-1 text-[var(--secondary-color)]" iconType="button" />
                    <span>
                      {format(new Date(event.start), 'MMM d, yyyy')} 
                      {event.end && ` - ${format(new Date(event.end), 'MMM d, yyyy')}`}
                    </span>
                  </div>
                  {event.platform && (
                    <div className="flex items-center mt-1 font-work-sans" style={{ border: 'none', outline: 'none' }}>
                      <span className="mr-1 w-4 h-4 flex items-center justify-center">
                        <img 
                          src={`/ui-icons/brands/${normalizePlatform(event.platform)}.svg`} 
                          alt={event.platform}
                          className="w-3.5 h-3.5 text-[var(--secondary-color)]"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.nextSibling as HTMLElement).style.display = 'block';
                          }}
                        />
                        <Icon 
                          name="faHashtag" 
                          className="w-3 h-3 text-[var(--secondary-color)] hidden" 
                          iconType="button" 
                        />
                      </span>
                      <span>{event.platform}</span>
                    </div>
                  )}
                  {event.budget && (
                    <div className="flex items-center mt-1 font-work-sans" style={{ border: 'none', outline: 'none' }}>
                      <Icon name="faDollarSign" className="w-3 h-3 mr-1 text-[var(--secondary-color)]" iconType="button" />
                      <span>${event.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {event.status && (
                    <div className="mt-2 font-work-sans" style={{ border: 'none', outline: 'none' }}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.status.toLowerCase() === 'draft' ? 'bg-gray-100 text-gray-800' :
                        event.status.toLowerCase() === 'completed' ? 'bg-blue-100 text-blue-800' :
                        event.status.toLowerCase() === 'active' || 
                        event.status.toLowerCase() === 'approved' || 
                        event.status.toLowerCase() === 'submitted' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.statusText || event.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      )}
      
      {/* Status legend */}
      <div className="p-2 flex flex-wrap gap-2 border-t border-[var(--divider-color)]">
        <div className="flex items-center text-xs text-[var(--secondary-color)]">
          <span className="w-3 h-3 inline-block mr-1 bg-gray-100 border border-gray-400 rounded-sm"></span>
          <span>Draft</span>
        </div>
        <div className="flex items-center text-xs text-[var(--secondary-color)]">
          <span className="w-3 h-3 inline-block mr-1 bg-yellow-100 border border-yellow-400 rounded-sm"></span>
          <span>In Review</span>
        </div>
        <div className="flex items-center text-xs text-[var(--secondary-color)]">
          <span className="w-3 h-3 inline-block mr-1 bg-green-100 border border-green-400 rounded-sm"></span>
          <span>Active</span>
        </div>
        <div className="flex items-center text-xs text-[var(--secondary-color)]">
          <span className="w-3 h-3 inline-block mr-1 bg-blue-100 border border-blue-400 rounded-sm"></span>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarDashboard; 