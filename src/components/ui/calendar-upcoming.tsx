/**
 * @component CalendarUpcoming
 * @category organism
 * @subcategory calendar
 * @description Displays upcoming campaign events in a calendar grid.
 * @status 10th April
 */
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';
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
  subMonths,
} from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

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
  influencerHandles?: string[]; // Added from API
}

export interface CalendarUpcomingProps {
  events?: CalendarEvent[]; // Make events optional, default to empty array
  // onEventClick?: (eventId: string | number, event: CalendarEvent) => void; // Removed unused prop
}

// Re-add getStatusColor function needed for tooltip status dot
const getStatusColor = (status?: string): string => {
  // Using Shadcn semantic colors where possible
  switch (status?.toLowerCase()) {
    case 'live':
      return 'bg-success text-success-foreground';
    case 'scheduled':
      return 'bg-primary text-primary-foreground';
    case 'draft':
      return 'bg-warning text-warning-foreground';
    case 'completed':
      return 'bg-muted text-muted-foreground';
    case 'planning':
      return 'bg-interactive text-interactive-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

// Helper function to map platform names to icon registry IDs/paths
// (Based on public/static/brands-icon-registry.json)
const platformIconMap: Record<string, string> = {
  facebook: '/icons/brands/brandsFacebook.svg',
  github: '/icons/brands/brandsGithub.svg',
  instagram: '/icons/brands/brandsInstagram.svg',
  linkedin: '/icons/brands/brandsLinkedin.svg',
  tiktok: '/icons/brands/brandsTiktok.svg',
  x: '/icons/brands/brandsXTwitter.svg',
  twitter: '/icons/brands/brandsXTwitter.svg', // Alias
  youtube: '/icons/brands/brandsYoutube.svg',
  // Add other platforms if needed
};

const getPlatformIconPath = (platformName: string): string | undefined => {
  return platformIconMap[platformName?.toLowerCase()];
};

export function CalendarUpcoming({
  events = [], // Default to empty array
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

    return events.filter(event => {
      try {
        // Ensure dates are valid Date objects before processing
        const eventStart = startOfDay(new Date(event.start));
        const eventEnd = event.end
          ? endOfDay(new Date(event.end))
          : endOfDay(new Date(event.start));

        // Basic check: event starts or ends on this day, or spans it
        // More robust check for multi-day spanning
        const startsOnDay = isSameDay(eventStart, targetDayStart);
        const endsOnDay = event.end
          ? isSameDay(endOfDay(new Date(event.end)), targetDayEnd)
          : startsOnDay;
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
    const currentDayDate = new Date(
      currentMonthDate.getFullYear(),
      currentMonthDate.getMonth(),
      dayNumber
    );
    const isCurrentDayToday = isSameDay(currentDayDate, today);
    const dayEvents = getEventsForDay(dayNumber, currentMonthDate);

    return (
      <div
        key={dayNumber}
        className={cn(
          'h-28 border border-border/30 rounded-sm p-1.5 flex flex-col overflow-hidden', // Base styles
          // Use accent color for today highlighting
          isCurrentDayToday ? 'bg-accent/10 border-accent/50' : 'bg-background'
        )}
      >
        {/* Day Number */}
        <span
          className={cn(
            'text-xs font-medium',
            // Use accent text color for today
            isCurrentDayToday ? 'text-accent-foreground font-semibold' : 'text-muted-foreground'
          )}
        >
          {dayNumber}
        </span>

        {/* Event List with Tooltips */}
        <div className="mt-1 space-y-0.5 overflow-y-auto flex-grow text-[11px]">
          <TooltipProvider delayDuration={150}>
            {dayEvents.slice(0, 4).map(event => {
              // Limit displayed events
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
                        'px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80',
                        // --- Always use Accent color ---
                        'bg-accent text-accent-foreground',
                        // -------------------------------
                        // Remove rounding if event continues
                        continuesBefore && 'rounded-l-none',
                        continuesAfter && 'rounded-r-none'
                      )}
                    >
                      {event.title}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="start"
                    className="text-xs max-w-[300px] z-50 bg-background text-foreground border shadow-md rounded-md p-3"
                  >
                    <p className="font-semibold mb-1 text-primary">{event.title}</p>
                    {/* Format date range (Date only) */}
                    <p className="text-muted-foreground text-xs mb-2">
                      {format(eventStart, 'MMM d, yyyy')}
                      {event.end &&
                        !isSameDay(eventStart, eventEnd) &&
                        ` - ${format(eventEnd, 'MMM d, yyyy')}`}
                    </p>
                    {/* Grid Container for Details */}
                    <div className="grid grid-cols-[auto_1fr] gap-x-1.5 gap-y-1.5">
                      {' '}
                      {/* Grid definition */}
                      {/* Display Platform Icons */}
                      {event.platform && (
                        <>
                          {' '}
                          {/* Use Fragment to place multiple items in the second column */}
                          {/* Empty first column cell for alignment */}
                          <div></div>
                          {/* Platform icons in the second column */}
                          <div className="flex items-center space-x-1.5">
                            {' '}
                            {/* Keep inner flex for icons */}
                            {event.platform
                              .split(/[,\s]+/)
                              .map(p => p.trim())
                              .filter(Boolean)
                              .map(platformName => {
                                const iconPath = getPlatformIconPath(platformName);
                                return iconPath ? (
                                  <Image
                                    key={platformName}
                                    src={iconPath}
                                    alt={platformName}
                                    width={14}
                                    height={14}
                                    title={platformName}
                                    className="opacity-80"
                                  />
                                ) : null;
                              })}
                          </div>
                        </>
                      )}
                      {/* Display Influencers */}
                      {event.influencerHandles && event.influencerHandles.length > 0 && (
                        <>
                          {' '}
                          {/* Use Fragment to place icon and text in separate columns */}
                          <Icon
                            iconId="faUserGroupLight"
                            className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 self-center"
                          />{' '}
                          {/* Icon in Col 1, self-center for vertical align */}
                          <span
                            className="text-muted-foreground text-xs truncate"
                            title={event.influencerHandles.join(', ')}
                          >
                            {' '}
                            {/* Text in Col 2 */}
                            {event.influencerHandles.join(', ')}
                          </span>
                        </>
                      )}
                      {/* Display budget */}
                      {event.budget !== undefined && event.budget !== null && (
                        <>
                          {' '}
                          {/* Use Fragment */}
                          {/* Empty first column cell for alignment */}
                          <div></div>
                          <span className="text-muted-foreground text-xs">
                            {' '}
                            {/* Budget text in Col 2 */}${event.budget.toLocaleString()} Budget
                          </span>
                        </>
                      )}
                      {/* Display status */}
                      {event.status && (
                        <>
                          {' '}
                          {/* Use Fragment */}
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full self-center',
                              getStatusColor(event.status).split(' ')[0]
                            )}
                          ></span>{' '}
                          {/* Status dot in Col 1 */}
                          <span className="text-muted-foreground text-xs">
                            Status: {event.status}
                          </span>{' '}
                          {/* Status text in Col 2 */}
                        </>
                      )}
                    </div>{' '}
                    {/* End Grid Container */}
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
    <div className="w-full flex flex-col h-full">
      {' '}
      {/* Ensure component takes full height */}
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b">
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
          <h2 className="text-base font-semibold text-foreground text-center min-w-[150px]">
            {format(currentMonthDate, 'MMMM yyyy')}
          </h2>
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
      </div>
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 p-1 flex-grow">
        {' '}
        {/* Use flex-grow for grid area */}
        {weekdayHeaders}
        {emptyCells}
        {dayCells}
      </div>
    </div>
  );
}

// Add default export
export default CalendarUpcoming;
