'use client';

import * as React from "react";
import { Icon } from '@/components/ui/atoms/icon';
import dynamic from 'next/dynamic';
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/atoms/button/Button'

// Import just the types from react-day-picker
import type { DayPickerSingleProps } from 'react-day-picker';

// Dynamically import DayPicker with no SSR to avoid hydration issues
const DayPicker = dynamic(
  () => import('react-day-picker').then((mod) => mod.DayPicker),
  { ssr: false }
);

// Use the proper type from react-day-picker
export type CalendarProps = Omit<DayPickerSingleProps, 'mode'> & {
  className?: string;
  mode?: 'single';
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = 'single',
  ...props
}: CalendarProps) {
  // Using a null check since DayPicker is dynamically loaded
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side
  if (!mounted) {
    return <div className={cn("p-3 h-[350px] flex items-center justify-center", className)}>
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-600"></div>
    </div>;
  }

  return (
    <DayPicker
      mode="single"
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <Icon iconId="faChevronLeftLight"  className="h-4 w-4" />,
        IconRight: ({ ...props }) => <Icon iconId="faChevronRightLight"  className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

// Define the props for DatePickerCalendar
type DatePickerCalendarProps = Omit<CalendarProps, 'selected' | 'onSelect'> & {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
};

// Extended Calendar with date selection functionality
export const DatePickerCalendar = dynamic(() => Promise.resolve((props: DatePickerCalendarProps) => {
  const { selected, onSelect, className, ...rest } = props;
  const [date, setDate] = React.useState<Date | undefined>(selected);
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleSelect = (date: Date | undefined) => {
    setDate(date);
    onSelect?.(date);
  };
  
  if (!mounted) {
    return <div className={cn("space-y-4 h-[400px] flex items-center justify-center", className)}>
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-600"></div>
    </div>;
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleSelect}
        {...rest}
      />
      {date && (
        <div className="text-sm text-center">
          Selected: {format(date, "PPP")}
        </div>
      )}
    </div>
  );
}), { ssr: false }); 
/**
 * Default export for Calendar
 */
export default Calendar;
