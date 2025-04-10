/**
 * @component CalendarUpcoming
 * @category organism
 * @subcategory calendar
 * @description Displays upcoming campaign events in a calendar grid or timeline view.
 * @status 10th April
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
import { format, getDaysInMonth as dfnsGetDaysInMonth, getDay, startOfMonth, isSameDay, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns'; // Use date-fns for date logic
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip for event details

// Event data structure
export interface CalendarEvent {
    id: number | string;
    title: string;
    start: Date;
    end?: Date;       // End date is crucial for multi-day events
    platform?: string;
    budget?: number;
    kpi?: string;
    status?: string;
    allDay?: boolean;   // Indicates if the event is all-day
}

export interface CalendarUpcomingProps {
    events: CalendarEvent[];
    onEventClick?: (eventId: number | string) => void;
}

// Helper function to get status color (example)
const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
        case 'live': return 'bg-green-500';
        case 'scheduled': return 'bg-blue-500';
        case 'draft': return 'bg-yellow-500';
        case 'completed': return 'bg-gray-400';
        case 'planning': return 'bg-purple-500';
        default: return 'bg-gray-300';
    }
};

export function CalendarUpcoming({
    events = [],
    onEventClick
}: CalendarUpcomingProps) {
    // Initialize currentDate based on the first event, or fallback to current month
    const initialDate = events.length > 0 ? startOfMonth(new Date(events[0].start)) : startOfMonth(new Date());
    const [currentDate, setCurrentDate] = useState(initialDate);
    // Removed view state: const [view, setView] = useState<'calendar' | 'timeline'>('calendar');

    // Calendar navigation (keep as is)
    const nextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };
    const prevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    // Calendar helpers (keep as is)
    const getDaysInMonth = (date: Date): number => {
        return dfnsGetDaysInMonth(date);
    };
    const getFirstDayOfMonth = (date: Date): number => {
        return getDay(date);
    };

    // Get events relevant to a specific day (starts, ends, or spans)
    const getEventsForDay = (day: number, monthDate: Date): CalendarEvent[] => {
        const targetDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        const targetDayStart = startOfDay(targetDate);
        const targetDayEnd = endOfDay(targetDate);

        return events.filter((event) => {
            const eventStart = startOfDay(new Date(event.start)); // Compare start of day
            // Use end of day for event.end if it exists, otherwise use start for single-day events
            const eventEnd = event.end ? endOfDay(new Date(event.end)) : endOfDay(new Date(event.start));

            // Event starts on this day
            if (isSameDay(eventStart, targetDayStart)) {
                return true;
            }
            // Event ends on this day
            if (event.end && isSameDay(endOfDay(new Date(event.end)), targetDayEnd)) {
                return true;
            }
            // Event spans this day (started before, ends after)
            if (isBefore(eventStart, targetDayStart) && isAfter(eventEnd, targetDayEnd)) {
                return true;
            }
            // Event spans into this day (started before, ends on this day)
            if (isBefore(eventStart, targetDayStart) && isSameDay(eventEnd, targetDayEnd)) {
                return true;
            }
            // Event starts on this day and spans further
            if (isSameDay(eventStart, targetDayStart) && isAfter(eventEnd, targetDayEnd)) {
                return true;
            }

            return false;
        });
    };

    const renderCalendarView = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const daysArray = [];

        // Add empty cells
        for (let i = 0; i < firstDay; i++) {
            daysArray.push(<div key={`empty-${i}`} className="h-28 border border-border/50 bg-muted/30 rounded-md"></div>); // Adjusted style
        }

        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = getEventsForDay(day, currentDate);
            const isToday = isSameDay(new Date(), currentDayDate);

            daysArray.push(
                <motion.div
                    key={day}
                    className={cn(
                        "h-28 p-1.5 border rounded-md flex flex-col", // Adjusted padding, height, flex
                        isToday ? "bg-accent border-accent/50" : "border-border bg-background",
                    )}
                    whileHover={{ boxShadow: "0 0 0 1px hsl(var(--primary))", transition: { duration: 0.1 } }} // Use primary border on hover
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={cn("font-medium text-xs", isToday ? "text-accent-foreground" : "text-muted-foreground")}>{day}</span>
                        {/* Optional: Keep event count badge if desired */}
                        {/* {dayEvents.length > 0 &&
                            <Badge variant="secondary" className="px-1 py-0 text-[10px] leading-tight h-4">{dayEvents.length}</Badge>
                        } */}
                    </div>
                    {/* Event List - Scrollable */}
                    <div className="space-y-0.5 overflow-y-auto flex-grow pr-1" style={{ scrollbarWidth: 'thin' }}>
                        <TooltipProvider delayDuration={200}>
                            {dayEvents.slice(0, 4).map((event) => { // Show more events potentially
                                const eventStart = new Date(event.start);
                                const eventEnd = event.end ? new Date(event.end) : eventStart;
                                const isStartDay = isSameDay(eventStart, currentDayDate);
                                const isEndDay = isSameDay(eventEnd, currentDayDate);
                                const isMultiDay = !isSameDay(startOfDay(eventStart), startOfDay(eventEnd));
                                const continuesBefore = isBefore(startOfDay(eventStart), startOfDay(currentDayDate));
                                const continuesAfter = isAfter(startOfDay(eventEnd), startOfDay(currentDayDate));

                                return (
                                    <Tooltip key={event.id}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={cn(
                                                    "text-[11px] leading-tight rounded px-1 py-0.5 cursor-pointer hover:opacity-80 flex items-center gap-1 relative",
                                                    getStatusColor(event.status), // Use status color as background
                                                    "text-white", // White text on colored background
                                                    continuesBefore && "rounded-l-none", // Indicate continuation
                                                    continuesAfter && "rounded-r-none"   // Indicate continuation
                                                )}
                                                onClick={() => onEventClick && onEventClick(event.id)}
                                            >
                                                {/* Optional: Add tiny arrow if continues */}
                                                {/* {continuesBefore && <div className="absolute left-[-3px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-r-[3px] border-r-current"></div>} */}
                                                {/* {continuesAfter && <div className="absolute right-[-3px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[3px] border-l-current"></div>} */}

                                                {(isStartDay || !isMultiDay || getDay(currentDayDate) === 1 /* Monday */) && (
                                                    <span className="flex-grow truncate font-medium">{event.title}</span>
                                                )}
                                                {/* Maybe show time only on start day for non-all-day events? */}
                                                {/* {isStartDay && !event.allDay && <span className='text-[10px] opacity-80 ml-auto'>{format(eventStart, 'p')}</span>} */}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" align="start" className="text-xs max-w-[250px] z-10"> {/* Increased z-index */}
                                            <p className="font-semibold mb-0.5">{event.title}</p>
                                            <p className="text-muted-foreground">
                                                {format(eventStart, event.allDay ? 'MMM d' : 'MMM d, p')} -
                                                {' '}{format(eventEnd, event.allDay ? 'MMM d' : 'MMM d, p')}
                                            </p>
                                            {event.platform && <p className="text-muted-foreground">Platform: {event.platform}</p>}
                                            {event.status && <p className="text-muted-foreground">Status: {event.status}</p>}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </TooltipProvider>
                        {dayEvents.length > 4 && (
                            <div className="text-[10px] text-muted-foreground text-center pt-0.5">+ {dayEvents.length - 4} more</div>
                        )}
                    </div>
                </motion.div>
            );
        }

        return (
            <div className="space-y-3">
                {/* Header with Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prevMonth}
                            aria-label="Previous month"
                            className="h-8 w-8"
                        >
                            <Icon iconId="faChevronLeftLight" className="h-4 w-4" />
                        </Button>
                        <div className="text-base font-semibold text-foreground text-center min-w-[150px]">
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
                    {/* Removed View Switch Button */}
                </div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1.5"> {/* Adjusted gap */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) =>
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground pb-1">
                            {day}
                        </div>
                    )}
                    {daysArray}
                </div>
            </div>
        );
    };

    // Removed renderTimelineView function

    return (
        // Simplified - directly return calendar view
        <AnimatePresence mode="wait">
            <motion.div
                key="calendar-view" // Fixed key
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
            >
                {renderCalendarView()}
            </motion.div>
        </AnimatePresence>

    );
}

// Removed default export
