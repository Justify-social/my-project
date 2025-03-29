# ComponentNav

A horizontal navigation bar for browsing component documentation. This component is primarily used in documentation and demo pages.

## Features

- Responsive design with adaptive sizing
- Fixed positioning support
- Customizable links and styling
- Smooth hover effects

## Usage

```tsx
import { ComponentNav } from '@/components/ui/organisms/navigation/component-nav';

// Basic usage with default links
function BasicExample() {
  return <ComponentNav />;
}

// Custom links and position
function CustomExample() {
  return (
    <ComponentNav 
      links={[
        { id: 'buttons', label: 'Buttons' },
        { id: 'forms', label: 'Forms' },
        { id: 'tables', label: 'Tables' }
      ]}
      fixed={false}
    />
  );
}

// Custom positioning
function PositioningExample() {
  return (
    <ComponentNav 
      fixed={true}
      leftOffset="20rem"
    />
  );
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| links | ComponentLink[] | (predefined list) | Array of components to navigate to |
| className | string | undefined | Additional CSS classes |
| fixed | boolean | true | Whether the nav should be fixed at the top |
| leftOffset | string | '16rem' | Left offset when fixed (useful for sidebar layouts) |

## ComponentLink Interface

```tsx
interface ComponentLink {
  id: string;    // Used for the anchor link href
  label: string; // Display text for the component
}
``` 