# Calendar Component

A client-side only calendar component for date selection with a clean, accessible interface.

## Overview

The Calendar component is an organism in our atomic design system that provides date display and selection functionality. It offers both a basic calendar view and an extended date picker with selection capabilities.

## Features

- Client-side only rendering to avoid SSR hydration issues
- Accessible keyboard navigation
- Custom styling with consistent design system tokens
- Support for single date selection
- Loading state during client-side mounting
- Compatible with Next.js server components architecture

## Usage

```tsx
import { Calendar, DatePickerCalendar } from '@/components/ui/organisms/Calendar';

// Basic calendar
<Calendar />

// Calendar with specific date selected
<Calendar selected={new Date()} />

// DatePickerCalendar with selection callback
<DatePickerCalendar 
  selected={new Date()}
  onSelect={(date) => console.log('Selected date:', date)}
/>
```

## Props

### Calendar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selected` | `Date` | `undefined` | Currently selected date |
| `onSelect` | `(date: Date \| undefined) => void` | `undefined` | Callback when a date is selected |
| `className` | `string` | `undefined` | Additional CSS class |
| `showOutsideDays` | `boolean` | `true` | Show dates from previous/next months |
| `mode` | `'single'` | `'single'` | Selection mode (only single supported) |

### DatePickerCalendar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selected` | `Date` | `undefined` | Initially selected date |
| `onSelect` | `(date: Date \| undefined) => void` | `undefined` | Callback when a date is selected |
| `className` | `string` | `undefined` | Additional CSS class |
| `showOutsideDays` | `boolean` | `true` | Show dates from previous/next months |

## Implementation Details

This component is implemented using:
- `react-day-picker` for the core calendar functionality
- `next/dynamic` for client-side only rendering
- `date-fns` for date formatting

### Client-Side Rendering

The Calendar component is specifically designed to render only on the client side to avoid SSR hydration mismatches. This is achieved through:

```tsx
// DayPicker is dynamically imported with { ssr: false }
const DayPicker = dynamic(
  () => import('react-day-picker').then((mod) => mod.DayPicker),
  { ssr: false }
);

// Component checks for client-side mounting
const [mounted, setMounted] = React.useState(false);
React.useEffect(() => {
  setMounted(true);
}, []);

// Displays a loading spinner until mounted
if (!mounted) {
  return <div className="loading-spinner">...</div>;
}
```

## Customization

The Calendar's appearance can be customized through:
- The `className` prop for container styling
- The `classNames` prop for detailed styling of internal elements

## Accessibility

The Calendar component supports:
- Keyboard navigation (arrow keys, Tab, Enter)
- ARIA attributes for screen readers
- Focus management for keyboard users

## Browser Support

- All modern browsers
- Internet Explorer is not supported 