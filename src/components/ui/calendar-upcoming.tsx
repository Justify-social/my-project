/**
 * @component CalendarUpcoming
 * @category organism
 * @subcategory calendar
 * @description Displays upcoming campaign events in a calendar grid or timeline view.
 * @param {CalendarUpcomingProps} props - The props for the CalendarUpcoming component.
 * @param {CalendarEvent[]} [props.events=[]] - An array of event objects to display.
 * @param {(eventId: string | number) => void} [props.onEventClick] - Optional callback when an event is clicked.
 * @returns {React.ReactElement} The rendered calendar or timeline view.
 */
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button'; // Import Shadcn Button
import { Badge } from '@/components/ui/badge'; // Import Shadcn Badge
import { cn } from '@/lib/utils';
import { format, getDaysInMonth as dfnsGetDaysInMonth, getDay, startOfMonth } from 'date-fns'; // Use date-fns for date logic

// Event data structure (keep as is for now)
interface CalendarEvent {
    id: number | string;
    title: string;
    start: Date;
    end?: Date;
    platform?: string;
    budget?: number;
    kpi?: string;
    status?: string;
}

export interface CalendarUpcomingProps {
    events: CalendarEvent[];
    onEventClick?: (eventId: number | string) => void;
}

export function CalendarUpcoming({ // Changed to named export
    events = [],
    onEventClick
}: CalendarUpcomingProps) {
    const [currentDate, setCurrentDate] = useState(startOfMonth(new Date())); // Start at beginning of month
    const [view, setView] = useState<'calendar' | 'timeline'>('calendar');

    // Calendar navigation
    const nextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };
    const prevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    // Calendar helpers using date-fns
    const getDaysInMonth = (date: Date): number => {
        return dfnsGetDaysInMonth(date);
    };
    const getFirstDayOfMonth = (date: Date): number => {
        // date-fns getDay: 0 = Sunday, 6 = Saturday
        return getDay(date);
    };

    // Get events for a specific day
    const getEventsForDay = (day: number, monthDate: Date) => {
        return events.filter((event) => {
            const eventDate = new Date(event.start);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === monthDate.getMonth() &&
                eventDate.getFullYear() === monthDate.getFullYear();
        });
    };

    const renderCalendarView = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate); // 0=Sun, 1=Mon...
        const daysArray = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            daysArray.push(<div key={`empty-${i}`} className="h-24 bg-muted/50 rounded-lg"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDay(day, currentDate);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            daysArray.push(
                <motion.div
                    key={day}
                    className={cn(
                        "h-24 p-2 border rounded-lg",
                        isToday ? "bg-accent/10 border-accent/30" : "border-border",
                        dayEvents.length > 0 ? 'bg-primary/5' : 'bg-background',
                    )}
                    whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}
                >
                    <div className="flex justify-between items-start">
                        <span className={cn("font-medium text-xs", isToday ? "text-accent" : "text-foreground")}>{day}</span>
                        {dayEvents.length > 0 &&
                            <Badge variant="secondary" className="px-1.5 py-0 text-xs">{dayEvents.length}</Badge>
                        }
                    </div>
                    <div className="mt-1 space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event) => // Limit visible events
                            <div
                                key={event.id}
                                className="text-xs truncate bg-background rounded px-1 py-0.5 cursor-pointer hover:bg-muted"
                                onClick={() => onEventClick && onEventClick(event.id)}
                                title={event.title}
                            >
                                {event.title}
                            </div>
                        )}
                        {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">+ {dayEvents.length - 2} more</div>
                        )}
                    </div>
                </motion.div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Use Shadcn Buttons */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prevMonth}
                            aria-label="Previous month"
                            className="h-8 w-8"
                        >
                            <Icon iconId="faChevronLeftLight" className="h-4 w-4" />
                        </Button>
                        <div className="text-lg font-semibold text-foreground">
                            {format(currentDate, 'MMMM yyyy')}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextMonth}
                            aria-label="Next month"
                            className="h-8 w-8"
                        >
                            <Icon iconId="faChevronRightLight" className="h-4 w-4" />
                        </Button>
                    </div>
                    {/* Use Shadcn Button for view switch */}
                    <Button
                        variant="link"
                        onClick={() => setView('timeline')}
                        className="text-sm font-medium"
                    >
                        Switch to Timeline
                    </Button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {/* Use semantic text color */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) =>
                        <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                            {day}
                        </div>
                    )}
                    {daysArray}
                </div>
            </div>
        );
    };

    const renderTimelineView = () => {
        // Group events by month
        const groupedEvents = events.reduce((acc, event) => {
            const monthYear = format(event.start, 'MMMM yyyy');
            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(event);
            return acc;
        }, {} as Record<string, CalendarEvent[]>);

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-foreground">Timeline View</h3>
                    {/* Use Shadcn Button */}
                    <Button
                        variant="link"
                        onClick={() => setView('calendar')}
                        className="text-sm font-medium"
                    >
                        Switch to Calendar
                    </Button>
                </div>
                {Object.entries(groupedEvents).map(([monthYear, monthEvents]) =>
                    <motion.div
                        key={monthYear}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-lg p-4 border border-border"
                    >
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            {/* Use semantic colors */}
                            <Icon iconId="faCalendarLight" className="w-5 h-5 mr-2 text-primary" />
                            {monthYear}
                        </h3>
                        <div className="space-y-3">
                            {monthEvents.map((event) =>
                                <motion.div
                                    key={event.id}
                                    whileHover={{ scale: 1.01, transition: { duration: 0.1 } }}
                                    className="bg-background rounded-lg p-4 border border-border cursor-pointer hover:bg-muted/50"
                                    onClick={() => onEventClick && onEventClick(event.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            {/* Use semantic colors */}
                                            <h4 className="font-medium text-foreground">{event.title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {format(event.start, 'PP')} - {event.end ? format(event.end, 'PP') : 'Ongoing'}
                                            </p>
                                            <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                                                {event.platform && (
                                                    <Badge variant="secondary">{event.platform}</Badge>
                                                )}
                                                {event.kpi && (
                                                    <span className="flex items-center">
                                                        <Icon iconId="faChatBubbleLight" className="w-4 h-4 mr-1" />
                                                        {event.kpi}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {event.budget !== undefined && (
                                                <div className="flex flex-col space-y-1">
                                                    <span className="flex items-center justify-end text-sm text-muted-foreground">
                                                        <Icon iconId="faMoneyLight" className="w-4 h-4 mr-1" />
                                                        ${event.budget.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
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
                transition={{ duration: 0.2 }}
                className="w-full"
            >
                {view === 'calendar' ? renderCalendarView() : renderTimelineView()}
            </motion.div>
        </AnimatePresence>
    );
}

// Removed default export
// export default CalendarUpcoming;
