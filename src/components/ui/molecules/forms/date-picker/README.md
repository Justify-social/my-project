# DatePicker Component

A versatile and accessible date input control with a dropdown calendar interface for selecting dates in forms and applications.

## Features

- **Keyboard and Mouse Support**: Dates can be entered directly or selected from the calendar
- **Date Formatting**: Support for multiple date display formats
- **Event Indicators**: Show events on specific dates with color-coded indicators
- **Date Constraints**: Easily define min/max dates and disabled dates
- **Validation Integration**: Built-in error state and messaging
- **Form Integration**: Full support for standard form attributes, including required state
- **Accessibility**: ARIA attributes and keyboard navigation throughout
- **Customization**: Extensive styling options via className props

## Usage

```tsx
import { DatePicker } from '@/components/ui/molecules/forms/date-picker';
import { useState } from 'react';

// Basic usage
function BasicDatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  return (
    <DatePicker
      value={selectedDate}
      onChange={setSelectedDate}
      placeholder="Select a date"
    />
  );
}

// With validation constraints
function ValidatedDatePicker() {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);
  
  return (
    <DatePicker
      label="Appointment Date"
      required
      minDate={today}
      maxDate={nextMonth}
      error={false}
      errorMessage="Please select a valid date"
      helperText="Select a date between today and next month"
    />
  );
}

// With events
function EventDatePicker() {
  const events = [
    { id: 1, date: new Date(), title: 'Meeting', color: '#3182CE' },
    { id: 2, date: new Date(2023, 5, 15), title: 'Conference', color: '#E53E3E' },
    { id: 3, date: new Date(2023, 5, 22), title: 'Deadline', color: '#DD6B20' }
  ];
  
  return (
    <DatePicker
      label="Select Event Date"
      events={events}
      closeOnSelect={false}
    />
  );
}

// Custom formatting
function FormattedDatePicker() {
  return (
    <DatePicker
      label="Date of Birth"
      format="dd/MM/yyyy"
      placeholder="DD/MM/YYYY"
    />
  );
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | Date \| null | - | Selected date (controlled component) |
| defaultValue | Date \| null | - | Default selected date (uncontrolled) |
| onChange | (date: Date \| null) => void | - | Called when selected date changes |
| minDate | Date | - | Minimum selectable date |
| maxDate | Date | - | Maximum selectable date |
| disabledDates | Date[] | [] | Specific dates to disable |
| disabled | boolean | false | Whether the input is disabled |
| placeholder | string | 'Select a date' | Placeholder text when no date is selected |
| format | string | 'MM/dd/yyyy' | Format for displaying the date |
| showClearButton | boolean | true | Whether to show clear button |
| closeOnSelect | boolean | true | Whether to close dropdown on selection |
| position | 'bottom-left' \| 'bottom-right' \| 'top-left' \| 'top-right' | 'bottom-left' | Position of the calendar dropdown |
| events | DatePickerEvent[] | [] | Events to display on the calendar |
| className | string | - | Class for the container element |
| inputClassName | string | - | Class for the input element |
| calendarClassName | string | - | Class for the calendar dropdown |
| label | string | - | Label for the input |
| helperText | string | - | Helper text displayed below the input |
| required | boolean | false | Whether the input is required |
| name | string | - | Input name attribute |
| id | string | - | Input id attribute |
| error | boolean | false | Whether the input has an error |
| errorMessage | string | - | Error message to display |

Plus all standard HTML div attributes.

## DatePickerEvent Interface

```tsx
interface DatePickerEvent {
  id: string | number;     // Unique identifier
  date: Date;              // Date of the event
  title: string;           // Event title
  color?: string;          // Optional color for the indicator
}
```

## Date Formats

The following are some common date format patterns you can use:

- 'MM/dd/yyyy' (e.g., 12/31/2023)
- 'dd/MM/yyyy' (e.g., 31/12/2023)
- 'yyyy-MM-dd' (e.g., 2023-12-31)
- 'MMMM d, yyyy' (e.g., December 31, 2023)

For all available format options, refer to the [date-fns format documentation](https://date-fns.org/v2.29.3/docs/format).

## Accessibility

The DatePicker implements the following accessibility features:

- Proper labeling and ARIA attributes
- Keyboard navigation within the calendar
- Screen reader announcements for date selection
- Focus management between input and calendar
- Clear visual indicators for selected, today, and disabled dates

## Customization

The DatePicker uses utility functions for constructing class names, allowing for easy customization:

1. Use the `className`, `inputClassName`, and `calendarClassName` props to apply custom styles
2. The underlying components use Tailwind CSS classes that can be overridden
3. For more extensive customization, you can modify the style utilities in the styles directory 