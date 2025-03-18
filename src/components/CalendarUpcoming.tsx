"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/icon';

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end?: Date;
  platform: string;
  budget: number;
  kpi: string;
}

interface CalendarUpcomingProps {
  events: CalendarEvent[];
}

const CalendarUpcoming: React.FC<CalendarUpcomingProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'timeline'>('calendar');

  // Calendar navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      days.push(
        <motion.div
          key={day}
          className={`h-24 p-2 border border-gray-100 rounded-lg ${
            dayEvents.length > 0 ? 'bg-blue-50' : 'bg-white'
          }`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex justify-between items-start">
            <span className="font-medium text-gray-900">{day}</span>
            {dayEvents.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {dayEvents.length}
              </span>
            )}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className="text-xs truncate text-gray-600 bg-white rounded px-1 py-0.5"
              >
                {event.title}
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 focus:outline-none transition-colors"
            >
              <Icon name="chevronLeft" className="w-5 h-5" />
            </button>
            <div className="text-xl font-semibold">
              {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
            </div>
            <button
              onClick={nextMonth}
              className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 focus:outline-none transition-colors"
            >
              <Icon name="chevronRight" className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const renderTimelineView = () => {
    // Group events by month
    const groupedEvents = events.reduce((acc, event) => {
      const monthYear = event.start.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setView('calendar')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Switch to Calendar
          </button>
        </div>
        {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
          <motion.div
            key={monthYear}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icon name="calendar" className="w-5 h-5 mr-2 text-blue-600" />
              {monthYear}
            </h3>
            <div className="space-y-3">
              {monthEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 border border-blue-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {event.start.toLocaleDateString()} - {event.end?.toLocaleDateString() || 'Ongoing'}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {event.platform}
                        </span>
                        <span className="flex items-center">
                          <Icon name="chatBubble" className="w-4 h-4 mr-1" />
                          {event.kpi}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col space-y-1">
                        <span className="flex items-center justify-end text-sm text-gray-600">
                          <Icon name="money" className="w-4 h-4 mr-1" />
                          ${event.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full"
      >
        {view === 'calendar' ? renderCalendarView() : renderTimelineView()}
      </motion.div>
    </AnimatePresence>
  );
};

export default CalendarUpcoming;
