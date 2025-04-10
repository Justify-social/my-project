/**
 * @component CalendarUpcoming
 * @category organism
 * @subcategory calendar
 * @description Displays upcoming campaign events in a calendar grid.
 * @status 10th April - Rewritten for clarity
 */
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Keep Badge for potential future use
import {
    format,
    getDaysInMonth,
    getDay,
    startOfMonth,
    isSameDay,
    isBefore,
    isAfter,
    startOfDay,
    endOfDay,
    addMonths,
    subMonths
} from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Event data structure (matches preview page)
export interface CalendarEvent {
    id: number | string;
    title: string;
    start: Date;
    end?: Date;
    platform?: string;
    budget?: number;
    kpi?: string;
    status?: string;
    allDay?: boolean;
}

export interface CalendarUpcomingProps {
    events?: CalendarEvent[]; // Make events optional, default to empty array
    onEventClick?: (eventId: number | string, event: CalendarEvent) => void;
}

// Helper function to get status color (using ONLY Shadcn semantic colors)
const getStatusColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
        case 'live': return 'bg-success text-success-foreground'; // Use success theme color
        case 'scheduled': return 'bg-primary text-primary-foreground';
        case 'draft': return 'bg-warning text-warning-foreground'; // Use warning theme color
        case 'completed': return 'bg-muted text-muted-foreground';
        case 'planning': return 'bg-interactive text-interactive-foreground'; // Use interactive theme color
        default: return 'bg-secondary text-secondary-foreground'; // Default to secondary
    }
};

export function CalendarUpcoming({
    events = [], // Default to empty array
    onEventClick
}: CalendarUpcomingProps) {

    // Initialize date state
    const [currentMonthDate, setCurrentMonthDate] = useState(startOfMonth(new Date()));

    // Navigation handlers
    const nextMonth = () => setCurrentMonthDate(addMonths(currentMonthDate, 1));
    const prevMonth = () => setCurrentMonthDate(subMonths(currentMonthDate, 1));

    // Get events for a specific day
    const getEventsForDay = (day: number, monthContext: Date): CalendarEvent[] => {
        const targetDate = new Date(monthContext.getFullYear(), monthContext.getMonth(), day);
        const targetDayStart = startOfDay(targetDate);
        const targetDayEnd = endOfDay(targetDate);

        return events.filter((event) => {
            try {
                // Ensure dates are valid Date objects before processing
                const eventStart = startOfDay(new Date(event.start));
                const eventEnd = event.end ? endOfDay(new Date(event.end)) : endOfDay(new Date(event.start));

                // Basic check: event starts or ends on this day, or spans it
                // More robust check for multi-day spanning
                const startsOnDay = isSameDay(eventStart, targetDayStart);
                const endsOnDay = event.end ? isSameDay(endOfDay(new Date(event.end)), targetDayEnd) : startsOnDay;
                const spansDay = isBefore(eventStart, targetDayStart) && isAfter(eventEnd, targetDayEnd);

                return startsOnDay || endsOnDay || spansDay;

            } catch (e) {
                // Log error if date parsing fails for an event
                console.error(`Error processing event date for event ID ${event.id}:`, e);
                return false; // Exclude event if dates are invalid
            }
        });
    };

    // --- Render Logic ---
    const daysInMonth = getDaysInMonth(currentMonthDate);
    const firstDayOfMonthIndex = getDay(startOfMonth(currentMonthDate)); // 0=Sun, 1=Mon,...
    const today = startOfDay(new Date());

    // Create weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdayHeaders = weekdays.map(day => (
        <div key={day} className="text-center text-xs font-medium text-muted-foreground pb-1">
            {day}
        </div>
    ));

    // Create empty cells for days before the 1st of the month
    const emptyCells = Array.from({ length: firstDayOfMonthIndex }).map((_, i) => (
        <div key={`empty-${i}`} className="h-28 border border-border/30 bg-muted/20 rounded-sm"></div>
    ));

    // Create cells for each day of the month
    const dayCells = Array.from({ length: daysInMonth }).map((_, i) => {
        const dayNumber = i + 1;
        const currentDayDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), dayNumber);
        const isCurrentDayToday = isSameDay(currentDayDate, today);
        const dayEvents = getEventsForDay(dayNumber, currentMonthDate);

        return (
            <div
                key={dayNumber}
                className={cn(
                    "h-28 border border-border/30 rounded-sm p-1.5 flex flex-col overflow-hidden", // Base styles
                    // Use accent color for today highlighting
                    isCurrentDayToday ? "bg-accent/10 border-accent/50" : "bg-background"
                )}
            >
                {/* Day Number */}
                <span className={cn(
                    "text-xs font-medium",
                    // Use accent text color for today
                    isCurrentDayToday ? "text-accent-foreground font-semibold" : "text-muted-foreground"
                )}>
                    {dayNumber}
                </span>

                {/* Event List with Tooltips */}
                <div className="mt-1 space-y-0.5 overflow-y-auto flex-grow text-[11px]">
                    <TooltipProvider delayDuration={150}>
                        {dayEvents.slice(0, 4).map(event => { // Limit displayed events
                            const eventStart = new Date(event.start);
                            const eventEnd = event.end ? new Date(event.end) : eventStart;
                            // --- Determine continuity for styling --- 
                            const continuesBefore = isBefore(startOfDay(eventStart), startOfDay(currentDayDate));
                            const continuesAfter = isAfter(endOfDay(eventEnd), endOfDay(currentDayDate));
                            // ---------------------------------------

                            return (
                                <Tooltip key={event.id}>
                                    <TooltipTrigger asChild>
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80",
                                                getStatusColor(event.status),
                                                // Remove rounding if event continues
                                                continuesBefore && "rounded-l-none",
                                                continuesAfter && "rounded-r-none"
                                            )}
                                            onClick={() => onEventClick && onEventClick(event.id, event)}
                                        >
                                            {event.title}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="start" className="text-xs max-w-[250px] z-50 bg-background text-foreground border shadow-md rounded-md p-2">
                                        <p className="font-semibold mb-1 text-primary">{event.title}</p>
                                        {/* Format date range */}
                                        <p className="text-muted-foreground text-xs mb-1">
                                            {format(eventStart, event.allDay ? 'MMM d, yyyy' : 'MMM d, p')}
                                            {event.end && !isSameDay(eventStart, eventEnd) &&
                                                ` - ${format(eventEnd, event.allDay ? 'MMM d, yyyy' : 'MMM d, p')}`}
                                        </p>
                                        {/* Display platform */}
                                        {event.platform && <p className="text-muted-foreground text-xs mb-0.5">Platform: {event.platform}</p>}
                                        {/* Display budget */}
                                        {event.budget !== undefined && event.budget !== null && (
                                            <p className="text-muted-foreground text-xs">
                                                Budget: ${event.budget.toLocaleString()} {/* Basic currency formatting */}
                                            </p>
                                        )}
                                        {/* Add status back for context */}
                                        {event.status && <p className="text-muted-foreground text-xs mt-1">Status: {event.status}</p>}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                    {dayEvents.length > 4 && (
                        <div className="text-[10px] text-muted-foreground text-center pt-0.5">
                            + {dayEvents.length - 4} more
                        </div>
                    )}
                </div>
            </div>
        );
    });

    return (
        <div className="w-full flex flex-col h-full"> {/* Ensure component takes full height */}
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month" className="h-8 w-8">
                        <Icon iconId="faChevronLeftLight" className="h-4 w-4" />
                    </Button>
                    <h2 className="text-base font-semibold text-foreground text-center min-w-[150px]">
                        {format(currentMonthDate, 'MMMM yyyy')}
                    </h2>
                    <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month" className="h-8 w-8">
                        <Icon iconId="faChevronRightLight" className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 p-1 flex-grow"> {/* Use flex-grow for grid area */}
                {weekdayHeaders}
                {emptyCells}
                {dayCells}
            </div>
        </div>
    );
}

// Add default export
export default CalendarUpcoming;
