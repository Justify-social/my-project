/**
 * Calendar dashboard component for displaying a month view with events
 * This component provides a simple calendar grid with upcoming events list
 */

import React from 'react';

interface CalendarDashboardProps {
  month: Date;
  events: Array<{
    id: string | number;
    title: string;
    start: Date;
    end?: Date;
    [key: string]: any;
  }>;
}

/**
 * A dashboard component for displaying a calendar view
 * @param props The component props
 * @returns The rendered component
 */
const CalendarDashboard: React.FC<CalendarDashboardProps> = ({ month, events }) => {
  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 font-work-sans">
      <h2 className="text-xl font-semibold mb-4 font-work-sans">{formatMonth(month)}</h2>
      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2 font-work-sans">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-medium text-gray-500 font-work-sans">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 h-64 font-work-sans">
        {Array.from({ length: 35 }).map((_, index) => (
          <div key={index} className="border border-gray-100 p-1 h-12 font-work-sans">
            <div className="text-xs text-gray-500 font-work-sans">{(index % 31) + 1}</div>
          </div>
        ))}
      </div>
      {events.length === 0 ? (
        <div className="text-center text-gray-500 mt-4 font-work-sans">No events scheduled</div>
      ) : (
        <div className="mt-4 space-y-2 font-work-sans">
          <h3 className="font-medium text-gray-700 font-work-sans">Upcoming Events ({events.length})</h3>
          <ul className="space-y-1 font-work-sans">
            {events.slice(0, 3).map(event => (
              <li key={event.id} className="text-sm py-1 px-2 bg-blue-50 rounded font-work-sans">
                {event.title}
              </li>
            ))}
            {events.length > 3 && (
              <li className="text-xs text-blue-600 font-work-sans">+ {events.length - 3} more events</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export type { CalendarDashboardProps };
export { CalendarDashboard };
export default CalendarDashboard; 