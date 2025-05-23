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
  isSameMonth,
  isSameYear,
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

// Adapted getStatusInfo function (from card-upcoming-campaign.tsx)
const getStatusInfo = (status: string | null | undefined) => {
  const normalizedStatus = (status || '').toLowerCase();
  // Note: These color classes might need to map to actual CSS if not using Tailwind utility classes directly
  // For now, using similar semantic naming to what's in card-upcoming-campaign
  switch (normalizedStatus) {
    case 'live': // from original calendar-upcoming
    case 'active': // from card-upcoming-campaign
    case 'approved': // from card-upcoming-campaign
      return {
        class: 'bg-green-500',
        text: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active',
      };
    case 'scheduled': // from original calendar-upcoming
    case 'planning': // from original calendar-upcoming
      return {
        class: 'bg-blue-500',
        text: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Scheduled',
      };
    case 'draft':
      return { class: 'bg-yellow-500', text: 'Draft' };
    case 'completed':
      return { class: 'bg-gray-400', text: 'Completed' };
    case 'paused':
      return { class: 'bg-red-500', text: 'Paused' };
    default:
      const defaultText = status
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : 'Unknown';
      return { class: 'bg-gray-500', text: defaultText };
  }
};

// Helper to format currency (from card-upcoming-campaign.tsx)
const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return '-';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD', // Assuming USD, make dynamic if needed
    minimumFractionDigits: 0,
  });
};

// Helper to format campaign duration (from card-upcoming-campaign.tsx)
const formatCampaignDuration = (startDate?: Date, endDate?: Date): string => {
  if (!startDate) return '-';
  try {
    const startFormatted = format(new Date(startDate), 'MMM d');
    const startYearFormatted = format(new Date(startDate), 'yyyy');
    const startFullFormatted = format(new Date(startDate), 'MMM d, yyyy');

    if (!endDate || isSameDay(new Date(startDate), new Date(endDate))) {
      return startFullFormatted;
    }

    const endFormatted = format(new Date(endDate), 'd');
    const endMonthFormatted = format(new Date(endDate), 'MMM d');
    const _endYearFormatted = format(new Date(endDate), 'yyyy');
    const endFullFormatted = format(new Date(endDate), 'MMM d, yyyy');

    if (isSameYear(new Date(startDate), new Date(endDate))) {
      if (isSameMonth(new Date(startDate), new Date(endDate))) {
        return `${startFormatted} - ${endFormatted}, ${startYearFormatted}`;
      } else {
        return `${startFormatted} - ${endMonthFormatted}, ${startYearFormatted}`;
      }
    } else {
      return `${startFullFormatted} - ${endFullFormatted}`;
    }
  } catch (e) {
    console.error('Error formatting campaign duration:', e);
    return 'Invalid date range';
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
                    className="w-64 p-3 text-sm bg-background text-foreground border shadow-md rounded-md" // Matched style from card-upcoming-campaign
                  >
                    <div className="space-y-1.5">
                      <p className="font-semibold text-base mb-1 text-primary">{event.title}</p>
                      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
                        <span className="font-medium text-muted-foreground">Platform:</span>
                        {event.platform && event.platform.trim() !== '' ? (
                          <div className="flex items-center space-x-1.5">
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
                                    style={{ width: 'auto', height: 'auto' }}
                                  />
                                ) : (
                                  <span
                                    key={platformName}
                                    className="text-muted-foreground text-xs"
                                  >
                                    {platformName} {/* Fallback to text if icon not found */}
                                  </span>
                                );
                              })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}

                        <span className="font-medium text-muted-foreground">Status:</span>
                        <span className="text-muted-foreground">
                          {getStatusInfo(event.status).text || 'N/A'}
                        </span>

                        <span className="font-medium text-muted-foreground">Duration:</span>
                        <span className="text-muted-foreground">
                          {formatCampaignDuration(event.start, event.end)}
                        </span>

                        <span className="font-medium text-muted-foreground">Budget:</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(event.budget)}
                        </span>

                        <span className="font-medium text-muted-foreground">Influencer:</span>
                        <span
                          className="text-muted-foreground truncate"
                          title={event.influencerHandles?.join(', ')}
                        >
                          {event.influencerHandles && event.influencerHandles.length > 0
                            ? event.influencerHandles[0] // Display first handle
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
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
