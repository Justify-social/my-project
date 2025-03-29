# Calendar Component

A clean, simple calendar component that displays a monthly view with optional event indicators. The Calendar component provides navigation controls and allows for date selection.

## Features

- **Monthly View**: Displays days organized in a 7-column grid
- **Navigation Controls**: Buttons to move to previous/next month
- **Date Selection**: Callback when a user selects a date
- **Current Date Indicator**: Highlights the current day
- **Event Indicators**: Shows dots for days with events
- **Customizable**: Accepts custom styling via className

## Usage

```tsx
import { Calendar } from '@/components/ui/atoms/data-display/calendar';

function BasicCalendar() {
  return <Calendar />;
}

function CalendarWithEvents() {
  const events = [
    { id: 1, date: new Date(), title: 'Meeting with client' },
    { id: 2, date: new Date(2023, 5, 15), title: 'Conference', type: 'primary' },
    { id: 3, date: new Date(2023, 5, 20), title: 'Vacation', type: 'secondary' }
  ];

  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
  };

  return (
    <Calendar 
      events={events}
      onDateSelect={handleDateSelect}
    />
  );
}

function CustomMonthCalendar() {
  return (
    <Calendar
      month={2}  // March (0-based index)
      year={2023}
      className="shadow-lg rounded-lg"
    />
  );
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| month | number | Current month | Month to display (0-11, where 0 is January) |
| year | number | Current year | Year to display |
| events | CalendarDayEvent[] | [] | Array of events to display |
| onDateSelect | (date: Date) => void | undefined | Callback when a date is selected |
| onPrevMonth | () => void | undefined | Callback when navigating to previous month |
| onNextMonth | () => void | undefined | Callback when navigating to next month |
| selectedDate | Date | undefined | Currently selected date (if any) |
| className | string | undefined | Additional CSS class to apply to the calendar |

Plus all standard HTML div attributes.

## CalendarDayEvent Interface

```tsx
interface CalendarDayEvent {
  id: string | number;  // Unique identifier
  date: Date;           // Date of the event
  title: string;        // Title/description of the event
  type?: 'primary' | 'secondary' | 'accent' | 'default';  // Visual type for styling
}
```

## Accessibility

The Calendar component implements the following accessibility features:

- Properly labeled navigation buttons with aria-label
- Proper semantic roles (grid, row, gridcell, columnheader)
- Selected date state indicated via aria-selected
- Hidden empty cells via aria-hidden

## Styling

The Calendar uses Tailwind CSS classes for styling. You can customize its appearance by:

1. Passing a className prop
2. Styling based on the component's HTML structure
3. Overriding specific styles with more specific selectors

## Limitations

- The Calendar currently only supports a monthly view
- Event indicators only show presence, not quantity or details
- For more advanced calendar functionality, consider using a specialized library 