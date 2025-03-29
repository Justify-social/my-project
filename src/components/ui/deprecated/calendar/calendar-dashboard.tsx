'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, addMonths, subMonths } from 'date-fns';

export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end?: Date;
  platform?: string;
  budget?: number;
  kpi?: string;
  status?: string;
  color?: string;
}

export interface CalendarDashboardProps {
  month?: Date;
  events: CalendarEvent[];
  onEventClick?: (id: string | number) => void;
}

const CalendarDashboard: React.FC<CalendarDashboardProps> = ({
  month = new Date(),
  events = [],
  onEventClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(month.getFullYear(), month.getMonth(), 1));
  const [hoveredEvent, setHoveredEvent] = useState<string | number | null>(null);
  
  // Helper function for getting colors based on platform
  const getCampaignColor = (platform: string = 'other', status?: string): string => {
    // First check for status-based colors
    if (status) {
      const statusColors: Record<string, string> = {
        'draft': '#9CA3AF', 
        'in_review': '#F59E0B',
        'in-review': '#F59E0B',
        'inreview': '#F59E0B',
        'active': '#10B981',
        'approved': '#10B981',
        'submitted': '#10B981',
        'completed': '#3B82F6',
        'paused': '#F59E0B'
      };
      
      const normalizedStatus = status.toLowerCase();
      if (statusColors[normalizedStatus]) {
        return statusColors[normalizedStatus];
      }
    }
    
    // Fall back to platform-based colors
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
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Filter and validate events
  const validEvents = useMemo(() => {
    return events.filter(event => 
      event && 
      event.id && 
      event.title && 
      event.start instanceof Date && 
      !isNaN(event.start.getTime())
    );
  }, [events]);
  
  // Get the days in the current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  // Get the first day of the month (0-6, where 0 is Sunday)
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    return validEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };
  
  // Create days array for the calendar
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg"></div>
    );
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day);
    const isToday = new Date().getDate() === day && 
                   new Date().getMonth() === currentDate.getMonth() && 
                   new Date().getFullYear() === currentDate.getFullYear();
    
    calendarDays.push(
      <div 
        key={`day-${day}`} 
        className={`h-24 p-2 border relative ${
          isToday ? 'border-blue-400 bg-blue-50' : 
          dayEvents.length > 0 ? 'border-gray-200 bg-gray-50' : 
          'border-gray-100'
        } rounded-lg`}
      >
        <div className="flex justify-between items-start">
          <span className={`font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </span>
          {dayEvents.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {dayEvents.length}
            </span>
          )}
        </div>
        
        <div className="mt-1 space-y-1 overflow-hidden">
          {dayEvents.slice(0, 2).map(event => (
            <motion.div
              key={event.id}
              whileHover={{ scale: 1.02 }}
              className="text-xs truncate px-1.5 py-1 rounded cursor-pointer"
              style={{ 
                backgroundColor: `${getCampaignColor(event.platform, event.status)}20`,
                color: getCampaignColor(event.platform, event.status)
              }}
              onClick={() => onEventClick && onEventClick(event.id)}
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              {event.title}
            </motion.div>
          ))}
          
          {dayEvents.length > 2 && (
            <div className="text-xs text-gray-500 text-center">
              +{dayEvents.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Get the most recent and upcoming events for the timeline view
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return validEvents
      .filter(event => new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  }, [validEvents]);
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 font-sora">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrevMonth} 
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={handleNextMonth} 
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays}
      </div>
      
      {upcomingEvents.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-base font-medium text-gray-900 mb-3">Upcoming Events</h4>
          <div className="space-y-2">
            {upcomingEvents.map(event => (
              <motion.div
                key={event.id}
                whileHover={{ scale: 1.01 }}
                className="p-3 border border-gray-200 rounded-lg hover:shadow-sm cursor-pointer"
                onClick={() => onEventClick && onEventClick(event.id)}
                style={{
                  borderLeftColor: getCampaignColor(event.platform, event.status),
                  borderLeftWidth: '3px'
                }}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{event.title}</span>
                  {event.status && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${getCampaignColor('other', event.status)}20`,
                        color: getCampaignColor('other', event.status)
                      }}
                    >
                      {event.status}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {format(new Date(event.start), 'MMM d, yyyy')}
                  {event.platform && ` • ${event.platform}`}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {hoveredEvent && (
        <div className="fixed bg-white border border-gray-200 shadow-lg rounded-lg p-3 z-50">
          {validEvents.find(e => e.id === hoveredEvent)?.title}
        </div>
      )}
    </div>
  );
};

export default CalendarDashboard;